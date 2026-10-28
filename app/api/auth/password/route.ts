import {z} from 'zod';
import {db,failure,json,AppError,requireUser,readCookie,sha256,SESSION_COOKIE} from '@/lib/server';
import {hashPassword,verifyPassword,checkPassword,throttleCheck,throttleHit} from '@/lib/auth';
// Şifre değiştir (veya Google hesabına şifre ekle). Diğer cihazlardaki oturumlar kapatılır.
export async function POST(req:Request){try{const u=await requireUser(req);const p=z.object({current:z.string().max(200).optional().default(''),next:z.string().max(200)}).safeParse(await json(req));if(!p.success)throw new AppError('Şifre alanlarını kontrol et.');
 const row=await db().prepare('SELECT password_hash,password_salt FROM users WHERE id=?').bind(u.id).first();
 if(row?.password_hash){const key='pw:'+u.id;await throttleCheck(key,6);if(!await verifyPassword(p.data.current,String(row.password_hash),String(row.password_salt))){await throttleHit(key);throw new AppError('Mevcut şifren hatalı.',400)}}
 checkPassword(p.data.next);const h=await hashPassword(p.data.next);const keep=await sha256(readCookie(req,SESSION_COOKIE));
 await db().batch([db().prepare('UPDATE users SET password_hash=?,password_salt=? WHERE id=?').bind(h.hash,h.salt,u.id),db().prepare('DELETE FROM sessions WHERE user_id=? AND id<>?').bind(u.id,keep)]);
 return Response.json({ok:true})}catch(e){return failure(e)}}
