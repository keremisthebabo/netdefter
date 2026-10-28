import {bindings,activeSupabaseConfig} from '@/lib/server';
import {supabaseOAuthUrl} from '@/lib/supabase';
import {googleReady,randomToken,appOrigin} from '@/lib/auth';
// Google ile giriş: Doğrudan GOOGLE_CLIENT_ID tanımlıysa Google OAuth'a, aksi halde Supabase Auth Google OAuth'a yönlendirir.
export async function GET(req:Request){
 const origin=appOrigin(req);
 if(!googleReady())return Response.redirect(origin+'/?auth_error=google_off',302);
 const b=bindings();
 if(b.GOOGLE_CLIENT_ID&&b.GOOGLE_CLIENT_SECRET){
  const state=randomToken(24);
  const u=new URL('https://accounts.google.com/o/oauth2/v2/auth');
  u.search=new URLSearchParams({
   client_id:b.GOOGLE_CLIENT_ID,
   redirect_uri:origin+'/api/auth/google/callback',
   response_type:'code',
   scope:'openid email profile',
   state,
   prompt:'select_account'
  }).toString();
  const secure=origin.startsWith('https:')?'; Secure':'';
  return new Response(null,{status:302,headers:{Location:u.toString(),'Set-Cookie':`nd_oauth=${state}; Path=/api/auth/google; HttpOnly; SameSite=Lax; Max-Age=600${secure}`}});
 }
 const supa=activeSupabaseConfig();
 if(supa){
  return Response.redirect(supabaseOAuthUrl(supa,'google',origin+'/'),302);
 }
 return Response.redirect(origin+'/?auth_error=google_off',302);
}
