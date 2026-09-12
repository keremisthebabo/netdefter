// Ders › konu listesi MEB Türkiye Yüzyılı Maarif Modeli öğretim programlarından gelir (lib/meb-topics.ts).
// Serbest metin girişleri en yakın konuya eşlenir; eşleşme yoksa olduğu gibi saklanır.
import {mebTopics,topicList,subjects as mebSubjects} from './meb-topics';
export {mebTopics,topicOptions,topicMeta,mebGrades} from './meb-topics';
// Ders › konu düz listesi (MEB içerik çerçevesinden türetilir); yapay zekâ sınıflaması ve eşleme bu listeyi kullanır.
export const topicTree:Record<string,string[]>=Object.fromEntries(mebSubjects.map(s=>[s,topicList(s)]));
export const subjects=mebSubjects;
export const mistakeTypes=['yanlış','boş','emin değildim'] as const;
export type MistakeType=typeof mistakeTypes[number];
const fold=(s:string)=>s.toLocaleLowerCase('tr').replace(/[^a-zçğıöşü0-9 ]/g,' ').replace(/\s+/g,' ').trim();
// Serbest metin konu adını ağaçtaki en yakın konuya eşler. Tam eşleşme > içerme > kelime kesişimi.
export function normalizeTopic(subject:string,raw:string):string{
 const list=topicTree[subject]||[];const t=fold(raw||'');if(!t)return 'Konu belirlenmedi';
 const exact=list.find(x=>fold(x)===t);if(exact)return exact;
 // Kelime kesişimi: ortak kelime sayısı + oran (uzun ve tam uyumlu adlar kısa genel adlara üstün gelir)
 const words=t.split(' ').filter(w=>w.length>2);let best='',score=0;
 for(const x of list){const xs=fold(x).split(' ').filter(w=>w.length>2);const hit=xs.filter(w=>words.some(q=>q.startsWith(w.slice(0,5))||w.startsWith(q.slice(0,5)))).length;if(!hit)continue;const ratio=hit/Math.max(xs.length,1);if(ratio<0.5&&hit<2)continue;const sc=hit+ratio;if(sc>score){score=sc;best=x}}
 if(best)return best;
 const contains=list.find(x=>fold(x).includes(t)||t.includes(fold(x)));if(contains)return contains;
 return raw.trim();
}
