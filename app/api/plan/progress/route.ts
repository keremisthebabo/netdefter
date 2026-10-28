import {z} from 'zod';
import {owner,failure,json,AppError} from '@/lib/server';
import {today} from '@/lib/study';
import {readPlan,writePlan} from '@/lib/plan/store';
import {lessonAt,dateOf,flatLessons} from '@/lib/plan/scheduler';
// İlerleme: dersi tamamla/geri al, günü kaydır (domino)/geri al, haftayı sıfırla
const schema=z.discriminatedUnion('action',[
 z.object({action:z.literal('done'),lesson:z.number().int().min(0).max(1000)}),
 z.object({action:z.literal('undone'),lesson:z.number().int().min(0).max(1000)}),
 z.object({action:z.literal('shift'),slot:z.number().int().min(0).max(2000)}),
 z.object({action:z.literal('unshift'),slot:z.number().int().min(0).max(2000)}),
 z.object({action:z.literal('reset-week'),week:z.number().int().min(1).max(300)})
]);
export async function POST(req:Request){try{const user=await owner(req);const p=schema.safeParse(await json(req));if(!p.success)throw new AppError('Geçersiz program işlemi.');const a=p.data;const plan=await readPlan(user);if(!plan)throw new AppError('Önce ders çalışma programını oluştur.',404);
 const done={...plan.done},off={...plan.offDays};const total=flatLessons(plan.config.tempo).length;
 if(a.action==='done'){if(a.lesson>=total)throw new AppError('Ders bulunamadı.');done[String(a.lesson)]=today()}
 else if(a.action==='undone')delete done[String(a.lesson)];
 else if(a.action==='shift'){if(off[String(a.slot)])throw new AppError('Bu gün zaten kaydırılmış.');if(Object.keys(off).length>=60)throw new AppError('En fazla 60 gün kaydırılabilir.');const at=lessonAt(plan,a.slot);if(!at.lesson)throw new AppError('Bu günde kaydırılacak ders yok.');off[String(a.slot)]={date:dateOf(plan,a.slot),topic:`${at.lesson.subj}: ${at.lesson.topic}`}}
 else if(a.action==='unshift')delete off[String(a.slot)];
 else{const from=(a.week-1)*7,to=from+7;for(let s=from;s<to;s++){const at=lessonAt(plan,s);if(at.lesson)delete done[String(at.lesson.index)];delete off[String(s)]}}
 return Response.json({plan:await writePlan(user,{done,offDays:off})})}catch(e){return failure(e)}}
