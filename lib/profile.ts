import {defaultProfile,type Profile} from './study';
// D1 satırını Profile nesnesine çevirir; satır yoksa varsayılan profil (Yusuf Kaya · YKS 2028)
export const packProfile=(r:any):Profile=>({...defaultProfile,...(r?{name:String(r.name||defaultProfile.name),grade:(r.grade||defaultProfile.grade) as Profile['grade'],target:String(r.target||''),examYear:Number(r.exam_year||defaultProfile.examYear),examDate:String(r.exam_date||defaultProfile.examDate),motto:String(r.motto||''),dailyGoal:Number(r.daily_goal||0),school:String(r.school||'')}:{})});
