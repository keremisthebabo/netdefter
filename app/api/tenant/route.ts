import {z} from 'zod';
import {db,requireUser,readCookie,sha256,SESSION_COOKIE,ensureSchema,failure,json,AppError,activeSupabaseConfig} from '@/lib/server';
import {listUserTenants,listTenantMembers,slugifyTenant} from '@/lib/supabase';
import {normalizeEmail,validEmail} from '@/lib/auth';
import {profileFor} from '@/lib/study';

// Kullanıcının aktif Tenant'ını, üye olduğu tüm çalışma alanlarını ve aktif çalışma alanının üyelerini döndürür.
export async function GET(req:Request){
 try{
  const me=await requireUser(req);
  await ensureSchema();
  const {active,tenants}=await listUserTenants(db(),me.id,me.tenantId);
  const members=await listTenantMembers(db(),active.id);
  const supa=activeSupabaseConfig();
  return Response.json({
   active,
   tenants,
   members,
   authProvider:supa?'supabase':'local'
  },{headers:{'Cache-Control':'private, no-store'}});
 }catch(e){return failure(e)}
}

// Tenant işlemleri:
// - action='create': Yeni çalışma alanı / kurum (Tenant) oluşturur ve aktif çalışma alanı yapar
// - action='switch': Kullanıcının üyesi olduğu başka bir çalışma alanına geçiş yapar
// - action='rename': Aktif çalışma alanının adını günceller (owner/admin yetkisi gerekir)
// - action='add_member': E-posta adresiyle kullanıcıyı aktif çalışma alanına ekler (owner/admin yetkisi gerekir)
// - action='remove_member': Üyeyi çalışma alanından çıkarır
export async function POST(req:Request){
 try{
  const me=await requireUser(req);
  await ensureSchema();
  const body=await json(req) as Record<string,unknown>;
  const action=String(body?.action||'');
  const token=readCookie(req,SESSION_COOKIE);
  const sid=token?await sha256(token):'';
  const now=new Date().toISOString();

  if(action==='create'){
   const p=z.object({name:z.string().trim().min(2).max(80)}).safeParse(body);
   if(!p.success)throw new AppError('Çalışma alanı / kurum adı en az 2 karakter olmalı.');
   const tenantId=crypto.randomUUID();
   const slug=`${slugifyTenant(p.data.name)}-${tenantId.slice(0,6).toLowerCase()}`;
   const pr=profileFor(p.data.name,'12');
   await db().batch([
    db().prepare('INSERT INTO tenants (id,name,slug,owner_id,plan,created_at) VALUES (?,?,?,?,?,?)').bind(tenantId,p.data.name,slug,me.id,'free',now),
    db().prepare('INSERT INTO tenant_members (tenant_id,user_id,role,created_at) VALUES (?,?,?,?)').bind(tenantId,me.id,'owner',now),
    db().prepare('INSERT INTO profiles (user_id,name,grade,target,exam_year,exam_date,motto,daily_goal,school,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?) ON CONFLICT(user_id) DO NOTHING').bind(tenantId,pr.name,pr.grade,pr.target,pr.examYear,pr.examDate,pr.motto,pr.dailyGoal,pr.school,now),
    db().prepare('UPDATE users SET tenant_id=? WHERE id=?').bind(tenantId,me.id),
    ...(sid?[db().prepare('UPDATE sessions SET tenant_id=? WHERE id=?').bind(tenantId,sid)]:[])
   ]);
   const {active,tenants}=await listUserTenants(db(),me.id,tenantId);
   const members=await listTenantMembers(db(),tenantId);
   return Response.json({active,tenants,members,message:`"${p.data.name}" çalışma alanı oluşturuldu ve aktif edildi.`},{status:201});
  }

  if(action==='switch'){
   const p=z.object({tenantId:z.string().trim().min(1).max(120)}).safeParse(body);
   if(!p.success)throw new AppError('Geçiş yapılacak çalışma alanı seçilmedi.');
   const mem=await db().prepare('SELECT role FROM tenant_members WHERE tenant_id=? AND user_id=?').bind(p.data.tenantId,me.id).first();
   if(!mem)throw new AppError('Bu çalışma alanına erişim yetkin yok.',403);
   await db().batch([
    db().prepare('UPDATE users SET tenant_id=? WHERE id=?').bind(p.data.tenantId,me.id),
    ...(sid?[db().prepare('UPDATE sessions SET tenant_id=? WHERE id=?').bind(p.data.tenantId,sid)]:[])
   ]);
   const {active,tenants}=await listUserTenants(db(),me.id,p.data.tenantId);
   const members=await listTenantMembers(db(),p.data.tenantId);
   return Response.json({active,tenants,members,message:`"${active.name}" çalışma alanına geçildi.`});
  }

  if(action==='rename'){
   const p=z.object({name:z.string().trim().min(2).max(80)}).safeParse(body);
   if(!p.success)throw new AppError('Yeni çalışma alanı adı en az 2 karakter olmalı.');
   if(me.tenantRole!=='owner'&&me.tenantRole!=='admin')throw new AppError('Çalışma alanı adını yalnızca yönetici veya sahip değiştirebilir.',403);
   await db().prepare('UPDATE tenants SET name=? WHERE id=?').bind(p.data.name,me.tenantId).run();
   const {active,tenants}=await listUserTenants(db(),me.id,me.tenantId);
   const members=await listTenantMembers(db(),me.tenantId);
   return Response.json({active,tenants,members,message:'Çalışma alanı adı güncellendi.'});
  }

  if(action==='add_member'){
   if(me.tenantRole!=='owner'&&me.tenantRole!=='admin')throw new AppError('Bu çalışma alanına yalnızca sahip veya yönetici üye ekleyebilir.',403);
   const p=z.object({email:z.string().trim().max(200),role:z.enum(['admin','member']).default('member')}).safeParse(body);
   if(!p.success)throw new AppError('Eklenecek üyenin e-posta adresini kontrol et.');
   const email=normalizeEmail(p.data.email);
   if(!validEmail(email))throw new AppError('Geçerli bir e-posta adresi gir.');
   const targetUser=await db().prepare('SELECT id,name,email FROM users WHERE email=?').bind(email).first();
   if(!targetUser)throw new AppError('Bu e-posta adresiyle kayıtlı bir kullanıcı bulunamadı. Önce kullanıcının kayıt olması gerekir.',404);
   const targetId=String(targetUser.id);
   await db().prepare('INSERT INTO tenant_members (tenant_id,user_id,role,created_at) VALUES (?,?,?,?) ON CONFLICT(tenant_id,user_id) DO UPDATE SET role=excluded.role')
    .bind(me.tenantId,targetId,p.data.role,now).run();
   const {active,tenants}=await listUserTenants(db(),me.id,me.tenantId);
   const members=await listTenantMembers(db(),me.tenantId);
   return Response.json({active,tenants,members,message:`${targetUser.name} (${targetUser.email}) çalışma alanına eklendi.`});
  }

  if(action==='remove_member'){
   if(me.tenantRole!=='owner'&&me.tenantRole!=='admin')throw new AppError('Üye çıkarma yetkin yok.',403);
   const p=z.object({userId:z.string().trim().min(1).max(120)}).safeParse(body);
   if(!p.success)throw new AppError('Çıkarılacak üye seçilmedi.');
   const tRow=await db().prepare('SELECT owner_id FROM tenants WHERE id=?').bind(me.tenantId).first();
   if(tRow&&String(tRow.owner_id)===p.data.userId)throw new AppError('Çalışma alanının sahibi çıkarılamaz.',400);
   await db().batch([
    db().prepare('DELETE FROM tenant_members WHERE tenant_id=? AND user_id=?').bind(me.tenantId,p.data.userId),
    db().prepare('UPDATE users SET tenant_id=id WHERE id=? AND tenant_id=?').bind(p.data.userId,me.tenantId)
   ]);
   const {active,tenants}=await listUserTenants(db(),me.id,me.tenantId);
   const members=await listTenantMembers(db(),me.tenantId);
   return Response.json({active,tenants,members,message:'Üye çalışma alanından çıkarıldı.'});
  }

  throw new AppError('Geçersiz tenant işlemi.',400);
 }catch(e){return failure(e)}
}

