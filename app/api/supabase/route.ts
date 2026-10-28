import {z} from 'zod';
import {requireUser,rawBindings,bindings,localDb,ensureSchema,setRuntimeAiConfig,getRuntimeAiConfig,aiReady,youtubeReady,failure,json,AppError} from '@/lib/server';
import {getSupabaseConfig,setRuntimeSupabaseConfig,testSupabaseConnection,syncLocalToSupabase,detectSupabaseKeyType,maskSecretKey,normalizeSupabaseUrl} from '@/lib/supabase';

function aiStatusPayload(){
 const b=bindings();
 const rt=getRuntimeAiConfig();
 const raw=rawBindings();
 const key=b.OPENAI_API_KEY||'';
 const ytKey=b.YOUTUBE_API_KEY||'';
 return {
  connected:aiReady(),
  source:rt.openaiKey?'runtime':raw.OPENAI_API_KEY?'env':'none',
  model:b.OPENAI_MODEL||'gpt-4o-mini',
  maskedKey:maskSecretKey(key),
  youtubeConnected:youtubeReady(),
  youtubeMaskedKey:maskSecretKey(ytKey)
 };
}

export async function GET(req:Request){
 try{
  const me=await requireUser(req);
  if(!me.developer){
   throw new AppError('API bağlantı bilgilerine yalnızca geliştirici hesabı (netududev@gmail.com) erişebilir.',403);
  }
  await ensureSchema();
  const cfg=getSupabaseConfig(rawBindings() as unknown as Record<string,unknown>);
  const ai=aiStatusPayload();
  if(!cfg){
   return Response.json({
    connected:false,
    url:'',
    maskedKey:'',
    keyType:'Yok',
    source:'none',
    tablesReady:false,
    authReady:false,
    tenantReady:false,
    message:'Supabase henüz bağlanmadı; kimlik doğrulama, tenant ve veriler yerel D1 (SQLite) veritabanında tutuluyor.',
    ai
   });
  }
  const status=await testSupabaseConnection(cfg.url,cfg.key);
  return Response.json({
   connected:status.ok,
   url:status.url||cfg.url,
   maskedKey:status.maskedKey||maskSecretKey(cfg.key),
   keyType:status.keyType||detectSupabaseKeyType(cfg.key),
   source:cfg.source,
   tablesReady:status.tablesReady,
   authReady:status.authReady,
   tenantReady:status.tenantReady,
   message:status.message,
   ai
  });
 }catch(e){return failure(e)}
}

export async function POST(req:Request){
 try{
  const me=await requireUser(req);
  // YALNIZCA geliştirici hesabı (netududev@gmail.com) API ve Supabase bağlantılarını yönetebilir
  if(!me.developer){
   throw new AppError('OpenAI ve Supabase API bağlantılarını yalnızca geliştirici hesabı (netududev@gmail.com) yapabilir.',403);
  }
  await ensureSchema();
  const body=await json(req) as Record<string,unknown>;
  const d=localDb();

  // 1. OpenAI (+ isteğe bağlı YouTube) API Bağlantısı
  if(body?.action==='save_openai'){
   const p=z.object({
    openaiKey:z.string().trim().min(8).max(500),
    openaiModel:z.string().trim().min(2).max(100).optional().default('gpt-4o-mini'),
    youtubeKey:z.string().trim().max(300).optional().default('')
   }).safeParse(body);
   if(!p.success)throw new AppError('Geçerli bir OpenAI API anahtarı (sk-...) girin.');
   const cleanKey=p.data.openaiKey.trim().replace(/^['"]+|['"]+$/g,'').trim();
   const cleanModel=p.data.openaiModel.trim()||'gpt-4o-mini';
   const cleanYt=p.data.youtubeKey.trim().replace(/^['"]+|['"]+$/g,'').trim();

   // OpenAI anahtarını doğrula
   try{
    const testRes=await fetch('https://api.openai.com/v1/models',{
     headers:{Authorization:`Bearer ${cleanKey}`},
     signal:AbortSignal.timeout(12000)
    });
    if(testRes.status===401||testRes.status===403){
     throw new AppError('OpenAI API anahtarı geçersiz veya yetkisiz (HTTP 401). Lütfen sk-... anahtarını kontrol edin.',400);
    }
   }catch(e){
    if(e instanceof AppError)throw e;
   }

   if(d){
    const stmts=[
     d.prepare("INSERT INTO sys_config (key,value) VALUES ('openai_api_key',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(cleanKey),
     d.prepare("INSERT INTO sys_config (key,value) VALUES ('openai_model',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(cleanModel)
    ];
    if(cleanYt){
     stmts.push(d.prepare("INSERT INTO sys_config (key,value) VALUES ('youtube_api_key',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(cleanYt));
    }
    await d.batch(stmts);
   }
   const prev=getRuntimeAiConfig();
   setRuntimeAiConfig({
    openaiKey:cleanKey,
    openaiModel:cleanModel,
    youtubeKey:cleanYt||prev.youtubeKey
   });
   const ai=aiStatusPayload();
   return Response.json({
    ok:true,
    ai,
    message:`OpenAI API (${cleanModel} · ${ai.maskedKey}) başarıyla bağlandı ve tüm yapay zekâ özellikleri aktif edildi!`
   });
  }

  if(body?.action==='disconnect_openai'){
   if(d){
    await d.prepare("DELETE FROM sys_config WHERE key IN ('openai_api_key','openai_model','youtube_api_key')").run();
   }
   setRuntimeAiConfig(null);
   return Response.json({
    ok:true,
    ai:aiStatusPayload(),
    message:'OpenAI API bağlantısı kaldırıldı.'
   });
  }

  // 2. Supabase Veri Senkronizasyonu
  if(body?.action==='sync'){
   const cfg=getSupabaseConfig(rawBindings() as unknown as Record<string,unknown>);
   if(!cfg)throw new AppError('Önce Supabase bağlantısını kurun.',400);
   if(!d)throw new AppError('Yerel veritabanı bulunamadı.',500);
   const res=await syncLocalToSupabase(d,cfg);
   return Response.json({ok:true,synced:res.synced,tables:res.tables,message:`${res.synced} kayıt (kullanıcılar, tenant'lar ve çalışma verileri) Supabase PostgreSQL veritabanına senkronize edildi.`});
  }

  // 3. Supabase Bağlantısı Kurma / Güncelleme
  const p=z.object({url:z.string().trim().min(4).max(400),key:z.string().trim().min(10).max(2000)}).safeParse(body);
  if(!p.success)throw new AppError('Supabase Project URL (örn. https://xxxx.supabase.co) ve API anahtarını (service_role, anon, sb_secret_... veya sb_publishable_...) girin.');
  const cleanUrl=normalizeSupabaseUrl(p.data.url);
  const cleanKey=p.data.key.trim().replace(/^['"]+|['"]+$/g,'').trim();
  const status=await testSupabaseConnection(cleanUrl,cleanKey);
  if(!status.ok)throw new AppError(status.message,400);
  if(d){
   await d.batch([
    d.prepare("INSERT INTO sys_config (key,value) VALUES ('supabase_url',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(cleanUrl),
    d.prepare("INSERT INTO sys_config (key,value) VALUES ('supabase_key',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(cleanKey)
   ]);
  }
  setRuntimeSupabaseConfig({url:cleanUrl,key:cleanKey});
  let synced=0;
  if(status.tablesReady&&d){
   const s=await syncLocalToSupabase(d,{url:cleanUrl,key:cleanKey,source:'runtime'});
   synced=s.synced;
  }
  return Response.json({
   connected:true,
   url:cleanUrl,
   maskedKey:status.maskedKey,
   keyType:status.keyType,
   source:'runtime',
   tablesReady:status.tablesReady,
   authReady:status.authReady,
   tenantReady:status.tenantReady,
   synced,
   ai:aiStatusPayload(),
   message:status.tablesReady?`${status.message}${synced?` (${synced} yerel kayıt aktarıldı.)`:''}`:status.message
  });
 }catch(e){return failure(e)}
}

export async function DELETE(req:Request){
 try{
  const me=await requireUser(req);
  if(!me.developer)throw new AppError('Yalnızca geliştirici hesabı (netududev@gmail.com) bağlantıyı kaldırabilir.',403);
  await ensureSchema();
  const d=localDb();
  if(d){
   await d.prepare("DELETE FROM sys_config WHERE key IN ('supabase_url','supabase_key')").run();
  }
  setRuntimeSupabaseConfig(null);
  return Response.json({connected:false,url:'',maskedKey:'',keyType:'Yok',source:'none',tablesReady:false,authReady:false,tenantReady:false,ai:aiStatusPayload(),message:'Supabase bağlantısı kaldırıldı; yerel D1 veritabanına dönüldü.'});
 }catch(e){return failure(e)}
}
