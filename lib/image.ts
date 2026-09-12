// Fotoğrafı yüklemeden önce tarayıcıda küçültür: uzun kenar en fazla 1800 px, JPEG %85.
// Telefon fotoğrafları (4-8 MB) genellikle 300-600 KB'a iner; hem yükleme hem yapay zekâ maliyeti düşer.
// Küçük dosyalar ve zaten uygun boyuttakiler olduğu gibi bırakılır. Başarısız olursa orijinal dosya döner.
export const maxUploadBytes=8*1024*1024;
export const acceptedTypes=['image/jpeg','image/png','image/webp'];
export async function compressImage(file:File,maxSide=1800,quality=0.85):Promise<File>{
 if(!acceptedTypes.includes(file.type))return file;
 if(file.size<400*1024)return file;
 try{
  const bitmap=await createImageBitmap(file);
  const scale=Math.min(1,maxSide/Math.max(bitmap.width,bitmap.height));
  if(scale===1&&file.size<1.2*1024*1024){bitmap.close();return file}
  const canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);
  const ctx=canvas.getContext('2d');if(!ctx){bitmap.close();return file}
  ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
  const blob=await new Promise<Blob|null>(r=>canvas.toBlob(r,'image/jpeg',quality));
  if(!blob||blob.size>=file.size)return file;
  return new File([blob],file.name.replace(/\.[^.]+$/,'')+'.jpg',{type:'image/jpeg',lastModified:Date.now()});
 }catch{return file}
}
export function validImage(f:File){return acceptedTypes.includes(f.type)&&f.size<=maxUploadBytes*3}
