import {db,failure,sameOrigin,readCookie,sha256,SESSION_COOKIE} from '@/lib/server';
import {clearSessionCookie} from '@/lib/auth';
export async function POST(req:Request){try{sameOrigin(req);const token=readCookie(req,SESSION_COOKIE);if(token)await db().prepare('DELETE FROM sessions WHERE id=?').bind(await sha256(token)).run();return Response.json({ok:true},{headers:{'Set-Cookie':clearSessionCookie(req)}})}catch(e){return failure(e)}}
