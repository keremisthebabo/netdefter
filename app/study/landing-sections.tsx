"use client";
import {useRef,useState,type KeyboardEvent} from 'react';
import {AlarmClock,ArrowRight,Bell,Camera,Check,Play,TriangleAlert} from 'lucide-react';

// Bu dosyadaki tüm örnek ekranlar ve sayılar gösterim amaçlıdır (gerçek kullanıcı verisi değil)
export const netSeries=[28,42,52,60,68,84,92,108];

export function NetChart(){
 const w=330,h=104,top=12,max=120,x=(i:number)=>12+i*((w-24)/(netSeries.length-1)),y=(v:number)=>top+h-(v/max)*h;
 const pts=netSeries.map((v,i)=>`${x(i).toFixed(1)},${y(v).toFixed(1)}`);
 return <svg viewBox={`0 0 ${w} ${top+h+22}`} role="img" aria-label="Son 8 haftada net gelişimi: 28 netten 108 nete yükseliyor" className="lp-chart">
  {netSeries.map((_,i)=><line key={i} x1={x(i)} x2={x(i)} y1={top} y2={top+h} className="lp-vgrid"/>)}
  {[0,40,80,120].map(g=><g key={g}><line x1="0" x2={w} y1={y(g)} y2={y(g)} className="lp-grid"/><text x="0" y={y(g)-3} className="lp-axis">{g}</text></g>)}
  <polygon points={`${x(0)},${top+h} ${pts.join(' ')} ${x(netSeries.length-1)},${top+h}`} className="lp-area"/>
  <polyline points={pts.join(' ')} fill="none" pathLength="1" className="lp-line"/>
  {netSeries.map((v,i)=><circle key={i} cx={x(i)} cy={y(v)} r="3" className="lp-dot"/>)}
  {netSeries.map((_,i)=><text key={i} x={x(i)} y={top+h+16} textAnchor="middle" className="lp-axis">{i+1}. hf</text>)}
 </svg>
}

/* ───────── 1) NETUDU'YU KEŞFET: sekmeli ürün turu ───────── */
const tourTabs=[
 {id:'bugun',label:'Bugün',promise:'Sabah gözünü açtığında ne çalışacağını bilirsin.',title:'Günün planı, saat saat'},
 {id:'defter',label:'Yanlış defteri',promise:'Yanlışını fotoğrafla; çözümü ve konusu hazır olsun.',title:'Bir fotoğraftan kalıcı bilgiye'},
 {id:'deneme',label:'Deneme takvimi',promise:'Denemelerini ve netlerini tek takvimde gör.',title:'Hedefe ne kadar yaklaştığın'},
];
function TourDay(){
 const rows=[{t:'08:00',n:'Okul',d:'16:00’ya kadar',k:'school'},{t:'17:00',n:'Matematik · Türev',d:'Konu tekrarı, 1 saat 20 dk',k:'study'},{t:'19:30',n:'Spor · İtiş günü',d:'Sabit saatin',k:'sport'},{t:'21:00',n:'Yanlış tekrarı',d:'Sırası gelen 4 soru',k:'review'}];
 return <div className="sx-day"><header><b>Bugünün akışı</b><span>Çakışma yok</span></header><ol>{rows.map(r=><li key={r.t} data-k={r.k}><time>{r.t}</time><i/><div><b>{r.n}</b><small>{r.d}</small></div></li>)}</ol></div>
}
function TourNote(){
 return <div className="sx-note">
  <div className="sx-photo" aria-hidden="true"><span style={{width:'86%'}}/><span style={{width:'62%'}}/><span style={{width:'74%'}}/><em>f(x) = x³ − 3x</em><span style={{width:'48%'}}/></div>
  <div className="sx-solve">
   <div className="sx-chips"><span className="sx-chip brand">Matematik · Türev</span><span className="sx-chip bad"><TriangleAlert size={12}/> İşaret hatası</span></div>
   <ol><li>Türevi al: f′(x) = 3x² − 3</li><li>Sıfıra eşitle: x = −1 ve x = 1</li><li>İşaret tablosundan yorumla</li></ol>
   <div className="sx-video"><span><Play size={13}/></span><div><b>Konu anlatımı</b><small>Türev: kritik noktalar</small></div></div>
   <div className="sx-next" aria-label="Aralıklı tekrar takvimi"><small>Sıradaki tekrar</small><ul>{[1,3,7,14,30,60].map(d=><li key={d} className={d===3?'on':''}>{d}</li>)}</ul></div>
  </div>
 </div>
}
function TourCalendar(){
 const days=Array.from({length:35},(_,i)=>i-2); // Ekim ayı Perşembe başlar (Pzt başlangıçlı hafta)
 const mark:Record<number,string>={13:'past',20:'past',27:'exam'};
 return <div className="sx-cal">
  <div className="sx-month"><b>Ekim</b><div className="sx-dow">{['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'].map(d=><i key={d}>{d}</i>)}</div>
   <div className="sx-grid">{days.map((d,i)=><span key={i} className={d<1||d>31?'off':mark[d]||''}>{d>=1&&d<=31?d:''}</span>)}</div></div>
  <div className="sx-exams"><b>Denemelerin</b><ul><li data-k="exam"><time>27 Ekim</time><span>TYT Genel Deneme</span></li><li><time>20 Ekim</time><span>Net 96</span></li><li><time>13 Ekim</time><span>Net 84</span></li></ul><small>Net değerleri örnektir</small></div>
 </div>
}
export function Tour(){
 const [i,setI]=useState(0);const refs=useRef<(HTMLButtonElement|null)[]>([]);
 const move=(n:number)=>{const k=(n+tourTabs.length)%tourTabs.length;setI(k);refs.current[k]?.focus()};
 const key=(e:KeyboardEvent)=>{if(e.key==='ArrowRight'||e.key==='ArrowDown'){e.preventDefault();move(i+1)}else if(e.key==='ArrowLeft'||e.key==='ArrowUp'){e.preventDefault();move(i-1)}};
 const cur=tourTabs[i];
 return <section id="kesfet" className="sx-tour" aria-labelledby="sx-tour-title"><div className="lp-wrap sx-tour-in">
  <div className="sx-tour-head" data-rv><h2 id="sx-tour-title">Üç ekran. Tek düzen.</h2><p>Programın, yanlış defterin ve deneme takvimin aynı hesapta. Sekmelere dokun, nasıl göründüklerine bak.</p></div>
  <div className="sx-tour-body" data-rv style={{'--d':'80ms'} as React.CSSProperties}>
   <div className="sx-tabs" role="tablist" aria-label="Ürün ekranları" onKeyDown={key}>{tourTabs.map((t,n)=><button key={t.id} ref={el=>{refs.current[n]=el}} type="button" role="tab" id={'sx-tab-'+t.id} aria-selected={i===n} aria-controls="sx-panel" tabIndex={i===n?0:-1} className={i===n?'on':''} onClick={()=>setI(n)}><b>{t.label}</b><span>{t.promise}</span></button>)}</div>
   <div className="sx-stage" role="tabpanel" id="sx-panel" aria-labelledby={'sx-tab-'+cur.id}>
    <p className="sx-stage-title">{cur.title}</p>
    <div className="sx-screen" key={i}>{i===0?<TourDay/>:i===1?<TourNote/>:<TourCalendar/>}</div>
    <p className="lp-sample">Örnek ekran; gösterilen veriler örnektir.</p>
   </div>
  </div>
 </div></section>
}

/* ───────── 2) ÖZELLİKLER: farklı boyutlu fayda panosu ───────── */
export function Features(){
 return <section id="ozellikler" className="lp-wrap sx-feat" aria-labelledby="sx-feat-title">
  <h2 id="sx-feat-title" data-rv>Sen çalışmaya odaklan. Düzeni netudu kursun.</h2>
  <div className="sx-bento">
   <article className="sx-tile sx-t-shift" data-rv><h3>Bir gün aksadı mı, program kendini toparlar.</h3><p>Çalışamadığın günün dersi sıradaki güne kayar; plan seni suçlamaz, yola devam eder.</p>
    <div className="sx-shift" aria-hidden="true"><div><small>Önce</small><span>Türev</span><span>Limit</span><span>İntegral</span></div><div><small>Sonra</small><span className="skip">Atlandı</span><span>Türev</span><span>Limit</span></div></div></article>
   <article className="sx-tile sx-t-camp" data-rv style={{'--d':'90ms'} as React.CSSProperties}><h3>Maarif TYT kampı, senin temponda.</h3><p>112 konu boş saatlerine çakışmasız yerleşir.</p>
    <div className="sx-tempo" aria-hidden="true"><span>Rahat<b>22 hafta</b></span><span className="on">Dengeli<b>16 hafta</b></span><span>Yoğun<b>12 hafta</b></span></div></article>
   <article className="sx-tile sx-t-photo" data-rv><h3>Fotoğrafını çek, çözümü al.</h3><p>Adım adım çözüm, MEB Maarif konusu ve konu videosu hazır gelir.</p>
    <div className="sx-mini-photo" aria-hidden="true"><span><Camera size={18}/></span><i/><span className="ok"><Check size={18}/></span></div></article>
   <article className="sx-tile sx-t-review" data-rv style={{'--d':'90ms'} as React.CSSProperties}><h3>Unutmadan önce yeniden karşına çıkar.</h3><p>Aralıklı tekrar takvimi yanlışlarını gün gün geri getirir.</p>
    <ul className="sx-spaced" aria-label="Tekrar aralıkları: 1, 3, 7, 14, 30, 60 gün">{[1,3,7,14,30,60].map(d=><li key={d}><i/><b>{d}</b><small>gün</small></li>)}</ul></article>
   <article className="sx-tile sx-t-alarm" data-rv style={{'--d':'180ms'} as React.CSSProperties}><h3>Ders saati gelince haber verir.</h3><p>Plan hep önünde durur, alarm ders saatinde çalar.</p>
    <div className="sx-alarm" aria-hidden="true"><span><AlarmClock size={18}/></span><div><b>14:00 · Fizik</b><small>Elektrik, başlıyor</small></div><Bell size={16}/></div></article>
   <article className="sx-tile sx-t-report" data-rv><h3>Ay sonunda neye çalışacağını bilirsin.</h3><p>En çok zorlandığın konular, hedeflerin ve net gelişimin tek raporda.</p>
    <ul className="sx-weak" aria-hidden="true">{[['Türev',86],['Paragraf',64],['Elektrik',41]].map(([n,v])=><li key={n as string}><span>{n}</span><i><b style={{width:`${v}%`}}/></i></li>)}</ul><small className="sx-sample-note">Örnek konular</small></article>
  </div>
 </section>
}

/* ───────── 3) NASIL ÇALIŞIR: dikey adım akışı ───────── */
const how=[
 {n:'1',title:'Düzenini anlat, programın kurulsun.',text:'Okul, dershane ve spor saatlerini gir; tempoyu seç. Kurulum dört adımda biter ve plan çakışmadan hazırlanır.',points:['Okul, dershane ve sabit saatler','Spor programı ve çalışma temposu']},
 {n:'2',title:'Yanlışını topla, çözümüyle sakla.',text:'Denemeden sonra yanlış soruları fotoğrafla yükle. Çözümü, konusu ve tekrar günleri netudu’da toplanır.',points:['Toplu fotoğraf yükleme','Konuya göre yanlış arşivi']},
 {n:'3',title:'Her gün planına bak, gelişimini izle.',text:'Bugünün işi ana ekranda; denemelerini girdikçe netlerin ve zorlandığın konular raporda görünür.',points:['Günlük akış ve alarm','Net takibi ve aylık rapor']},
];
function HowArt({n}:{n:string}){
 if(n==='1')return <div className="sx-art sx-art-1" aria-hidden="true"><span>Okul <b>08:00–16:00</b></span><span>Dershane <b>Per 18:00</b></span><span>Spor <b>Push / Pull</b></span><span className="on">Tempo <b>Dengeli</b></span></div>;
 if(n==='2')return <div className="sx-art sx-art-2" aria-hidden="true"><div className="sx-shot"><Camera size={22}/><small>Fotoğraf</small></div><ArrowRight size={18}/><div className="sx-result"><b>Çözüm hazır</b><small>Türev · 3 gün sonra tekrar</small></div></div>;
 return <div className="sx-art sx-art-3" aria-hidden="true"><NetChart/></div>;
}
export function How({onStart}:{onStart:()=>void}){
 return <section id="nasil" className="sx-how" aria-labelledby="sx-how-title"><div className="lp-wrap">
  <div className="sx-how-head" data-rv><h2 id="sx-how-title">Üç adımda yerine oturur.</h2><button type="button" className="lp-btn solid" onClick={onStart}>Hemen başla <ArrowRight size={16}/></button></div>
  <ol className="sx-steps">{how.map(s=><li key={s.n} data-rv><span className="sx-big" aria-hidden="true">{s.n}</span>
   <div className="sx-step-text"><h3>{s.title}</h3><p>{s.text}</p><ul>{s.points.map(p=><li key={p}><Check size={14}/>{p}</li>)}</ul></div><HowArt n={s.n}/></li>)}</ol>
 </div></section>
}
