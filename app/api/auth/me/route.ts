import {failure,sessionUser} from '@/lib/server';
import {googleReady,registrationOpen} from '@/lib/auth';
// Oturum durumu: giriş ekranının hangi seçenekleri göstereceğini de söyler.
export async function GET(req:Request){try{const user=await sessionUser(req);return Response.json({user,googleReady:googleReady(),registrationOpen:registrationOpen()},{headers:{'Cache-Control':'private, no-store'}})}catch(e){return failure(e)}}
