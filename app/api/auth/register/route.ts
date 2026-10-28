import {z} from 'zod';
import {failure,json,AppError,sameOrigin,ensureSchema} from '@/lib/server';
import {createUser,createSession,normalizeEmail,validEmail,checkPassword,throttleCheck,throttleHit,clientIp,registrationOpen} from '@/lib/auth';
// Yeni hesap: ad, e-posta, şifre, sınıf. Başarılıysa oturum açılır.
export async function POST(req:Request){try{sameOrigin(req);await ensureSchema();if(!registrationOpen())throw new AppError('Yeni kayıtlar şu anda kapalı.',403);const ipKey='register:'+clientIp(req);await throttleCheck(ipKey,8);
 const p=z.object({name:z.string().trim().min(2).max(60),email:z.string().trim().max(200),password:z.string().max(200),grade:z.enum(['9','10','11','12','Mezun']).default('12'),accept:z.literal(true)}).safeParse(await json(req));
 if(!p.success)throw new AppError('Ad (en az 2 karakter), e-posta, şifre ve sınıf alanlarını kontrol et; kullanım koşullarını onaylaman gerekiyor.');
 const email=normalizeEmail(p.data.email);if(!validEmail(email))throw new AppError('Geçerli bir e-posta adresi yaz.');checkPassword(p.data.password);
 await throttleHit(ipKey,60);
 const u=await createUser({email,name:p.data.name,password:p.data.password,grade:p.data.grade});
 const cookie=await createSession(req,u.id);
 return Response.json({ok:true,claimed:u.first},{status:201,headers:{'Set-Cookie':cookie}})}catch(e){return failure(e)}}
