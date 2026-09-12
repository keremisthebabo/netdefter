import {sqliteTable,text,integer,real,index,uniqueIndex} from 'drizzle-orm/sqlite-core';
export const questions=sqliteTable('questions',{
 id:text('id').primaryKey(),userId:text('user_id').notNull(),exam:text('exam').notNull(),examType:text('exam_type').notNull(),date:text('date').notNull(),subject:text('subject').notNull(),topic:text('topic').notNull(),question:text('question').notNull(),myAnswer:text('my_answer').notNull().default(''),answerKey:text('answer_key').notNull().default(''),imageKey:text('image_key'),mime:text('mime'),analysis:text('analysis'),reviewed:integer('reviewed').notNull().default(0),createdAt:text('created_at').notNull(),analyzingAt:text('analyzing_at'),
 // Hata türü: yanlış | boş | emin değildim
 mistakeType:text('mistake_type').notNull().default('yanlış'),
 // Aralıklı tekrar: aşama (0-5), sıradaki tekrar tarihi ve tekrar geçmişi (JSON)
 reviewStage:integer('review_stage').notNull().default(0),nextReview:text('next_review'),reviewLog:text('review_log').notNull().default('[]')
},t=>[index('questions_user_date').on(t.userId,t.date),index('questions_user_next_review').on(t.userId,t.nextReview)]);
export const reports=sqliteTable('reports',{id:text('id').primaryKey(),userId:text('user_id').notNull(),month:text('month').notNull(),notes:text('notes').notNull(),updatedAt:text('updated_at').notNull(),
 // Gelecek ay hedefleri: JSON [{text,done}]
 goals:text('goals').notNull().default('[]')
},t=>[uniqueIndex('reports_user_month').on(t.userId,t.month)]);
// Deneme sonuçları (net takibi)
export const exams=sqliteTable('exams',{id:text('id').primaryKey(),userId:text('user_id').notNull(),name:text('name').notNull(),examType:text('exam_type').notNull(),date:text('date').notNull(),net:real('net').notNull(),correct:integer('correct'),wrong:integer('wrong'),blank:integer('blank'),notes:text('notes').notNull().default(''),createdAt:text('created_at').notNull()},t=>[index('exams_user_date').on(t.userId,t.date)]);
// Konu bazlı video önbelleği: aynı konu için tekrar arama yapılmaz, beğenilmeyenler hatırlanır
export const videoCache=sqliteTable('video_cache',{id:text('id').primaryKey(),userId:text('user_id').notNull(),subject:text('subject').notNull(),topic:text('topic').notNull(),videos:text('videos').notNull().default('[]'),rejected:text('rejected').notNull().default('[]'),updatedAt:text('updated_at').notNull()},t=>[uniqueIndex('video_cache_user_topic').on(t.userId,t.subject,t.topic)]);
// Konu bazlı yapay zekâ ders notları (Ders notları sayfası)
export const studyNotes=sqliteTable('study_notes',{id:text('id').primaryKey(),userId:text('user_id').notNull(),subject:text('subject').notNull(),topic:text('topic').notNull(),examType:text('exam_type').notNull().default(''),content:text('content').notNull(),prompt:text('prompt').notNull().default(''),updatedAt:text('updated_at').notNull()},t=>[uniqueIndex('study_notes_user_topic').on(t.userId,t.subject,t.topic)]);
// Kullanıcı profili (Ayarlar › Profil)
export const profiles=sqliteTable('profiles',{userId:text('user_id').primaryKey(),name:text('name').notNull(),grade:text('grade').notNull().default('10'),target:text('target').notNull().default(''),examYear:integer('exam_year').notNull().default(2028),examDate:text('exam_date').notNull().default('2028-06-17'),motto:text('motto').notNull().default(''),dailyGoal:integer('daily_goal').notNull().default(0),school:text('school').notNull().default(''),updatedAt:text('updated_at').notNull()});
