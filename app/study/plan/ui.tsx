"use client";
import {Check,Undo2,Umbrella,Play,PlusCircle,NotebookPen,Send,AlertTriangle,Dumbbell,School,Pin,BookOpen,Coffee} from 'lucide-react';
import {buildDay,noteSubject,subjectIcon,dayShareText,telegramUrl,toMin,type DayPlan,type DayItem,type PlanState} from '@/lib/plan/scheduler';
import {useStudy} from '../shared';

export const longDate=(d:string)=>new Date(d+'T12:00:00').toLocaleDateString('tr-TR',{day:'numeric',month:'long',weekday:'long'});
export const shortDate=(d:string)=>new Date(d+'T12:00:00').toLocaleDateString('tr-TR',{day:'numeric',month:'short'});
export const nowMin=()=>{const n=new Date();return n.getHours()*60+n.getMinutes()};
export const localToday=()=>{const n=new Date();return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`};

const itemIcon:Record<DayItem['type'],typeof Check>={school:School,fixed:Pin,sport:Dumbbell,study:BookOpen,off:Coffee};
// Günün birleşik saat çizelgesi (okul, sabit bloklar, spor, çalışma blokları)
export function Timeline({day,live=false}:{day:DayPlan;live?:boolean}){const n=live?nowMin():-1;
 return <ol className="timeline">{day.items.map((it,i)=>{const Icon=itemIcon[it.type];const current=live&&it.type!=='off'&&n>=it.startMin&&n<it.endMin;const past=live&&it.type!=='off'&&n>=it.endMin;
  return <li key={i} className={`tl-item tl-${it.type}${current?' now':''}${past?' past':''}`}><span className="tl-time">{it.start}{it.end?<><br/><small>{it.end}</small></>:null}</span><span className="tl-dot"><Icon size={15}/></span><div className="tl-body"><strong>{it.title}</strong><small>{it.detail}{!it.fitted?' · kısaltıldı':''}</small>{current&&<span className="tl-now">Şu an</span>}</div></li>})}
  {!day.items.length&&<li className="tl-empty">Bu gün için planlanmış bir şey yok.</li>}</ol>}

export function Warnings({day}:{day:DayPlan}){if(!day.warnings.length)return null;return <div className="plan-warn"><AlertTriangle size={17}/><div>{day.warnings.map((w,i)=><p key={i}>{w}</p>)}</div></div>}

// Bir günün ders işlemleri: tamamla, dışarı çıktım (domino), video, soru ekle, ders notu, paylaş
export function LessonActions({day,compact=false}:{day:DayPlan;compact?:boolean}){const s=useStudy();const plan=s.plan!;const l=day.lesson;const isDone=!!(l&&plan.done[String(l.index)]);
 const ask=()=>{if(!l)return;s.openUpload([], {subject:noteSubject(l.subj),examType:'TYT',exam:`Program · ${l.weekNum}. hafta`,question:''})};
 return <div className={'lesson-actions'+(compact?' compact':'')}>
  {l&&<button className={isDone?'secondary':'primary'} onClick={()=>void s.planOp({action:isDone?'undone':'done',lesson:l.index},isDone?'Ders yeniden açıldı.':'Harika! Ders tamamlandı.')}>{isDone?<><Undo2 size={16}/> Geri al</>:<><Check size={16}/> Tamamladım</>}</button>}
  {day.isOff?<button className="secondary" onClick={()=>void s.planOp({action:'unshift',slot:day.slot},'Kaydırma geri alındı.')}><Undo2 size={16}/> Kaydırmayı geri al</button>:l&&!isDone&&<button className="secondary" onClick={()=>void s.planOp({action:'shift',slot:day.slot},'Bugünün dersi yarına kaydırıldı; program bir gün uzadı.')} title="Bugün çalışamayacaksan dersler zincirleme bir gün ileri kayar"><Umbrella size={16}/> Dışarı çıktım</button>}
  {l&&<a className="secondary" href={l.directUrl} target="_blank" rel="noreferrer"><Play size={16}/> {compact?'Video':`Konu videosu · ${l.teacher.split(/[&/]/)[0].trim()}`}</a>}
  {l&&!compact&&<button className="secondary" onClick={ask}><PlusCircle size={16}/> Yanlış ekle</button>}
  {l&&!compact&&<button className="secondary" onClick={()=>s.openNotes({subject:noteSubject(l.subj),topic:'',examType:'TYT'})}><NotebookPen size={16}/> Ders notu</button>}
  {!compact&&<a className="text-button" href={telegramUrl(dayShareText(day))} target="_blank" rel="noreferrer"><Send size={15}/> Telegram'da paylaş</a>}
 </div>}

export function LessonHead({day}:{day:DayPlan}){const l=day.lesson;if(day.isOff)return <div className="lesson-head off"><span className="lesson-emoji">🏖️</span><div><span className="eyebrow">KAYDIRILDI</span><h3>Dinlenme / sosyal gün</h3><p>Bu günün dersi bir sonraki güne aktarıldı; program bir gün uzadı.</p></div></div>;
 if(!l)return <div className="lesson-head"><span className="lesson-emoji">{day.finished?'🏁':'📝'}</span><div><span className="eyebrow">{day.finished?'PROGRAM TAMAMLANDI':'SERBEST GÜN'}</span><h3>{day.finished?'Tüm konular bitti — deneme ve eksik kapatma dönemi':'Serbest tekrar'}</h3><p>Tam bir TYT denemesi çöz, yanlışlarını deftere ekle.</p></div></div>;
 return <div className="lesson-head"><span className="lesson-emoji">{subjectIcon(l.subj)}</span><div><span className="eyebrow">{l.subj.toLocaleUpperCase('tr')} · {l.weekNum}. KAMP HAFTASI{day.shifted?' · KAYMIŞ':''}</span><h3>{l.topic}</h3><p>{l.note}</p><div className="lesson-meta"><span>🎯 {l.target}</span><span>👨‍🏫 {l.teacher}</span><span>{day.sport.badge}</span></div></div></div>}

export const dayFor=(plan:PlanState,date:string)=>buildDay(plan,date);
export function nextBlock(day:DayPlan){const n=nowMin();return day.items.find(i=>i.type!=='off'&&i.startMin>n)||null}
export function minutesUntil(t:string){return toMin(t)-nowMin()}
