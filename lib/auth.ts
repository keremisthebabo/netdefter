// Hesap sistemi: e-posta + şifre ve Google ile giriş, oturum çerezi, deneme sınırı.
// Şifreler PBKDF2-SHA256 (100.000 tur, 16 bayt rastgele tuz) ile saklanır; oturum belirteci veritabanında yalnızca SHA-256 özeti olarak tutulur.
import {db,bindings,AppError,sha256,SESSION_COOKIE,SESSION_DAYS,ensureSchema} from './server';
import {profileFor,type Profile} from './study';

const ITERATIONS=100000;
const enc=new TextEncoder();
const b64url=(bytes:Uint8Array)=>btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const fromB64url=(s:string)=>Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')+'==='.slice((s.length+3)%4)),c=>c.charCodeAt(0));
export const randomToken=(bytes=32)=>b64url(crypto.getRandomValues(new Uint8Array(bytes)));

export async function hashPassword(password:string,salt=crypto.getRandomValues(new Uint8Array(16))){const key=await crypto.subtle.importKey('raw',enc.encode(password),'PBKDF2',false,['deriveBits']);const bits=await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt,iterations:ITERATIONS},key,256);return {hash:b64url(new Uint8Array(bits)),salt:b64url(salt)}}
export async function verifyPassword(password:string,hash:string,salt:string){const h=(await hashPassword(password,fromB64url(salt))).hash;if(h.length!==hash.length)return false;let diff=0;for(let i=0;i<h.length;i++)diff|=h.charCodeAt(i)^hash.charCodeAt(i);return diff===0}

export const normalizeEmail=(e:string)=>e.trim().toLowerCase();
export const validEmail=(e:string)=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)&&e.length<=200;
export function checkPassword(p:string){if(p.length<8)throw new AppError('Şifre en az 8 karakter olmalı.');if(p.length>200)throw new AppError('Şifre çok uzun.');if(!/[A-Za-zÇĞİÖŞÜçğıöşü]/.test(p)||!/\d/.test(p))throw new AppError('Şifrede en az bir harf ve bir rakam olmalı.')}

// Oturum: rastgele belirteç çerezde, özeti veritabanında. 30 gün geçerli.
export async function createSession(request:Request,userId:string){const token=randomToken();const now=new Date();const expires=new Date(now.getTime()+SESSION_DAYS*86400000);await db().batch([db().prepare('INSERT INTO sessions (id,user_id,created_at,expires_at,user_agent) VALUES (?,?,?,?,?)').bind(await sha256(token),userId,now.toISOString(),expires.toISOString(),(request.headers.get('user-agent')||'').slice(0,200)),db().prepare('UPDATE users SET last_login_at=? WHERE id=?').bind(now.toISOString(),userId),db().prepare('DELETE FROM sessions WHERE user_id=? AND expires_at<?').bind(userId,now.toISOString())]);return sessionCookie(request,token,SESSION_DAYS*86400)}
export function sessionCookie(request:Request,token:string,maxAge:number){const secure=new URL(request.url).protocol==='https:'?'; Secure':'';return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`}
export const clearSessionCookie=(request:Request)=>sessionCookie(request,'',0);

// Kaba kuvvet koruması: anahtar başına pencere içinde en fazla N deneme.
export async function throttleCheck(key:string,max:number){const row=await db().prepare('SELECT count,reset_at FROM auth_attempts WHERE key=?').bind(key).first();if(row&&String(row.reset_at)>new Date().toISOString()&&Number(row.count)>=max)throw new AppError('Çok fazla deneme yapıldı. 15 dakika sonra tekrar dene.',429)}
export async function throttleHit(key:string,minutes=15){const now=new Date();const reset=new Date(now.getTime()+minutes*60000).toISOString();await db().prepare('INSERT INTO auth_attempts (key,count,reset_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN auth_attempts.reset_at<? THEN 1 ELSE auth_attempts.count+1 END, reset_at=CASE WHEN auth_attempts.reset_at<? THEN excluded.reset_at ELSE auth_attempts.reset_at END').bind(key,reset,now.toISOString(),now.toISOString()).run()}
export const throttleClear=(key:string)=>db().prepare('DELETE FROM auth_attempts WHERE key=?').bind(key).run();
export const clientIp=(r:Request)=>r.headers.get('cf-connecting-ip')||r.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'local';

export const registrationOpen=()=>bindings().REGISTRATION_OPEN!=='false';
export const appOrigin=(req:Request)=>(bindings().APP_URL||new URL(req.url).origin).replace(/\/$/,'');
export const googleReady=()=>!!(bindings().GOOGLE_CLIENT_ID&&bindings().GOOGLE_CLIENT_SECRET);

const ownedTables=['questions','reports','exams','video_cache','study_notes','profiles','study_plans'];
// Yeni kullanıcı oluşturur ve profilini açar. Sistemdeki İLK hesap, hesap sisteminden önce kaydedilmiş
// (sahibi olmayan) verileri devralır; böylece mevcut defter kaybolmaz.
export async function createUser(input:{email:string;name:string;password?:string;googleSub?:string;grade?:Profile['grade']}){await ensureSchema();const id=crypto.randomUUID();const now=new Date().toISOString();let hash:string|null=null,salt:string|null=null;if(input.password){const h=await hashPassword(input.password);hash=h.hash;salt=h.salt}
 const first=Number((await db().prepare('SELECT COUNT(*) AS n FROM users').first())?.n||0)===0;
 try{await db().prepare('INSERT INTO users (id,email,name,password_hash,password_salt,google_sub,created_at) VALUES (?,?,?,?,?,?,?)').bind(id,input.email,input.name,hash,salt,input.googleSub||null,now).run()}catch(e){if(/UNIQUE/i.test(String((e as Error)?.message)))throw new AppError('Bu e-posta adresiyle zaten bir hesap var. Giriş yapmayı dene.',409);throw e}
 if(first)await db().batch(ownedTables.map(t=>db().prepare(`UPDATE OR IGNORE ${t} SET user_id=? WHERE user_id NOT IN (SELECT id FROM users)`).bind(id)));
 const p=profileFor(input.name,input.grade||'12');
 await db().prepare('INSERT INTO profiles (user_id,name,grade,target,exam_year,exam_date,motto,daily_goal,school,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?) ON CONFLICT(user_id) DO NOTHING').bind(id,p.name,p.grade,p.target,p.examYear,p.examDate,p.motto,p.dailyGoal,p.school,input.googleSub&&!input.grade?'':now).run();
 return {id,first}}

