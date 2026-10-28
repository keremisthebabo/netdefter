import {z} from 'zod';
import {db,failure,json,AppError,sameOrigin,ensureSchema} from '@/lib/server';
import {createSession,normalizeEmail,verifyPassword,throttleCheck,throttleHit,throttleClear,clientIp} from '@/lib/auth';
const wrong='E-posta ya da şifre hatalı.';
export async function POST(req:Request){try{sameOrigin(req);await ensureSchema();const p=z.object({email:z.string().trim().max(200),password:z.string().min(1).max(200)}).safeParse(await json(req));if(!p.success)throw new AppError('E-posta ve şifreni yaz.');
 const email=normalizeEmail(p.data.email);const key='login:'+email;const ipKey='login-ip:'+clientIp(req);await throttleCheck(key,8);await throttleCheck(ipKey,30);
 const row=await db().prepare('SELECT id,password_hash,password_salt,google_sub FROM users WHERE email=?').bind(email).first();
 if(row&&!row.password_hash&&row.google_sub)throw new AppError('Bu hesap Google ile açılmış. "Google ile devam et" düğmesini kullan.',400);
 const ok=!!row&&!!row.password_hash&&await verifyPassword(p.data.password,String(row.password_hash),String(row.password_salt));
 if(!ok){await throttleHit(key);await throttleHit(ipKey);throw new AppError(wrong,401)}
 await throttleClear(key);const cookie=await createSession(req,String(row!.id));
 return Response.json({ok:true},{headers:{'Set-Cookie':cookie}})}catch(e){return failure(e)}}
