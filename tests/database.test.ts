import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { createServer, type Server } from 'node:http';
import { PGlite } from '@electric-sql/pglite';
import { initialConfig } from '../db/seed.ts';
import { createHandler } from '../server/http.ts';
import { hashPassword } from '../server/security.ts';
import { allQuestions, validateConfig, publicConfig, csvCell } from '../server/domain.ts';
import { startParticipant, saveAnswer, readParticipant, completeParticipant, updateConfig, exportCsv } from '../server/repository.ts';
import type { Database } from '../server/db.ts';
let engine:PGlite;let db:Database;let server:Server;let base:string;
before(async()=>{
  engine=new PGlite();
  await engine.exec(await readFile(new URL('../db/migrations/001_initial.sql',import.meta.url),'utf8'));
  db={query:async(sql,values)=>engine.query(sql,values),transaction:work=>engine.transaction(tx=>work({query:async(sql,values)=>tx.query(sql,values)}))};
  await db.query("INSERT INTO quiz_configs(slug,config) VALUES('pm',$1)",[JSON.stringify(initialConfig)]);
  await db.query('INSERT INTO admin_users(id,email,password_hash) VALUES($1,$2,$3)',[randomUUID(),'admin@example.test',hashPassword('test-password-1234')]);
  server=createServer(createHandler(()=>db));await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
  base='http://127.0.0.1:'+(server.address() as {port:number}).port;
});
after(async()=>{await new Promise<void>(resolve=>server.close(()=>resolve()));await engine.close();});
test('seed valid; public config strips answer keys and scoring rules',()=>{
  validateConfig(initialConfig);
  const text=JSON.stringify(publicConfig(initialConfig));
  assert(!text.includes('correctAnswer'));assert(!text.includes('countPoints'));assert(!text.includes('"points"'));
});
test('answer edits persist once; incomplete submit rejected; email and scores commit together',async()=>{
  const created=await startParticipant(db,'Peserta Test');
  assert.equal(created.participant.name,'Peserta Test');
  await saveAnswer(db,created.sessionToken,'feedback.clarity',4);
  await saveAnswer(db,created.sessionToken,'feedback.clarity',5);
  assert.equal((await readParticipant(db,created.sessionToken)).answers['feedback.clarity'],5);
  const count=(await db.query('SELECT count(*) FROM participant_answers WHERE session_id=$1 AND question_key=$2',[created.participant.id,'feedback.clarity'])).rows[0].count;
  assert.equal(Number(count),1);
  await assert.rejects(()=>readParticipant(db,'wrong-token'));
  await assert.rejects(()=>completeParticipant(db,created.sessionToken,'participant@example.test'),/Lengkapi/);
  for(const q of allQuestions(initialConfig)) {
    const answer=q.type==='rating'?4:q.type==='text'?'':q.type==='multi'?['Meta Ads']:q.correctAnswer || q.options[0];
    await saveAnswer(db,created.sessionToken,q.key,answer);
  }
  const completed=await completeParticipant(db,created.sessionToken,'Participant@Example.Test');
  assert.equal(completed.email,'participant@example.test');assert.equal(completed.status,'completed');assert.equal(completed.recapCorrect,20);
  assert.equal((await completeParticipant(db,created.sessionToken,'participant@example.test')).id,completed.id);
  await assert.rejects(()=>saveAnswer(db,created.sessionToken,'feedback.clarity',1),/sudah selesai/);
});
test('question edits preserve previous sessions; question additions work; stale writes rejected',async()=>{
  const created=await startParticipant(db,'Nama sebelum edit');
  const modified=structuredClone(initialConfig);modified.sections[0].questions[0].text='Teks pertanyaan baru';
  modified.sections[2].questions.push({key:'recap.new',text:'Soal tambahan',type:'single',options:['A','B'],required:true,correctAnswer:'B'});
  await updateConfig(db,modified,1);
  assert.equal((await readParticipant(db,created.sessionToken)).recapTotal,20);
  assert.equal((await startParticipant(db,'Nama setelah edit')).participant.recapTotal,21);
  await assert.rejects(()=>updateConfig(db,initialConfig,1),/admin lain/);
  await updateConfig(db,initialConfig,2);
});
test('CSV includes incomplete participants, email, question text, and escapes formulas',async()=>{
  const csv=await exportCsv(db,'');
  assert(csv.includes('Nama sertifikat'));assert(csv.includes('participant@example.test'));assert(csv.includes('Belum melengkapi email'));assert(csv.includes('feedback.clarity:'));
  assert(csvCell('=1+1').includes("'=1+1"));assert(csvCell('a"b').includes('a""b'));
});
test('server rejects invalid values, unknown questions, contradictory multi-select and unsafe links',async()=>{
  const created=await startParticipant(db,'Validation test');
  await assert.rejects(()=>saveAnswer(db,created.sessionToken,'feedback.clarity',6));
  await assert.rejects(()=>saveAnswer(db,created.sessionToken,'unknown','x'));
  await assert.rejects(()=>saveAnswer(db,created.sessionToken,'p2_tools',['Meta Ads','Belum pernah satupun']));
  const bad=structuredClone(initialConfig);bad.offer.ctaUrl='javascript:alert(1)';assert.throws(()=>validateConfig(bad));
});
test('HTTP auth, CSRF, resume and protected CSV export',async()=>{
  assert.equal((await fetch(base+'/api/admin/export')).status,401);
  assert.equal((await fetch(base+'/api/session',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://evil.test'},body:JSON.stringify({name:'Bad origin'})})).status,403);
  const start=await fetch(base+'/api/session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'API test',score:100})});
  assert.equal(start.status,201);const cookie=start.headers.get('set-cookie')!.split(';')[0];assert(start.headers.get('set-cookie')!.includes('HttpOnly'));
  const p=await start.json();assert.notEqual(p.score,100);
  const a=await fetch(base+'/api/answer',{method:'POST',headers:{'Content-Type':'application/json',Cookie:cookie},body:JSON.stringify({key:'feedback.clarity',answer:4})});assert.equal(a.status,200);
  const resumed=await (await fetch(base+'/api/session',{headers:{Cookie:cookie}})).json();assert.equal(resumed.answers['feedback.clarity'],4);
  const login=await fetch(base+'/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'admin@example.test',password:'test-password-1234'})});assert.equal(login.status,200);
  const adminCookie=login.headers.get('set-cookie')!.split(';')[0];
  const exported=await fetch(base+'/api/admin/export',{headers:{Cookie:adminCookie}});assert.equal(exported.status,200);assert(exported.headers.get('content-type')!.includes('text/csv'));
  const logout=await fetch(base+'/api/admin/logout',{method:'POST',headers:{'Content-Type':'application/json',Cookie:adminCookie},body:'{}'});assert.equal(logout.status,200);
  assert.equal((await fetch(base+'/api/admin/config',{headers:{Cookie:adminCookie}})).status,401);
});
