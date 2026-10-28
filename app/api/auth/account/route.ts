import {z} from 'zod';
import {db,bindings,activeSupabaseConfig,failure,json,AppError,requireUser} from '@/lib/server';
import {supabaseAuthDeleteUser,supabaseAuthSignIn} from '@/lib/supabase';
import {verifyPassword,clearSessionCookie} from '@/lib/auth';
// Hesabı, kişisel Tenant'ını ve tüm verileri kalıcı olarak siler (Supabase Auth + PostgreSQL + Storage).
export async function DELETE(req:Request){try{
 const u=await requireUser(req);
 const p=z.object({confirm:z.literal('SİL'),password:z.string().max(200).optional().default('')}).safeParse(await json(req));
 if(!p.success)throw new AppError('Onay için kutuya büyük harflerle SİL yaz.');
 const supa=activeSupabaseConfig();
 const row=await db().prepare('SELECT password_hash,password_salt FROM users WHERE id=?').bind(u.id).first();
 if(row?.password_hash){
  let ok=await verifyPassword(p.data.password,String(row.password_hash),String(row.password_salt));
  if(!ok&&supa){
   const sbCheck=await supabaseAuthSignIn(supa,{email:u.email,password:p.data.password});
   ok=!!sbCheck.user;
  }
  if(!ok)throw new AppError('Şifren hatalı; hesap silinmedi.',400);
 }
 const images=(await db().prepare('SELECT image_key FROM questions WHERE user_id=? AND image_key IS NOT NULL').bind(u.id).all()).results.map((r:any)=>String(r.image_key));
 for(let i=0;i<images.length;i+=500)await bindings().BUCKET.delete(images.slice(i,i+500));
 await db().batch(
  ['questions','reports','exams','video_cache','study_notes','profiles','study_plans','ai_usage','sessions']
   .map(t=>db().prepare(`DELETE FROM ${t} WHERE user_id=?`).bind(u.id))
   .concat([
    db().prepare('DELETE FROM tenant_members WHERE user_id=?').bind(u.id),
    db().prepare('DELETE FROM tenants WHERE owner_id=?').bind(u.id),
    db().prepare('DELETE FROM users WHERE id=?').bind(u.id)
   ])
 );
 if(supa)await supabaseAuthDeleteUser(supa,u.id);
 return Response.json({deleted:true},{headers:{'Set-Cookie':clearSessionCookie(req)}});
}catch(e){return failure(e)}}
