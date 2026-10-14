import React, { useEffect, useState } from 'react';
import type { QuizConfig, Question } from '../../shared/model.ts';
import { request, ApiError } from '../utils/api.ts';

const inputClass='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white';
const buttonClass='rounded-lg bg-[#BD214C] text-white px-4 py-2 text-sm disabled:opacity-40';
type Row={ id:string;name:string;email:string|null;status:string;step:number;batch:string;created_at:string;recap_correct:number;recap_total:number;match_score:number };
type QuizRow={slug:string;title:string;batch:string;active:boolean;revision:number};
export function Admin() {
  const [quizzes,setQuizzes]=useState<QuizRow[]>([]);
  const [selected,setSelected]=useState('pm');
  const [duplicate,setDuplicate]=useState(false);
  const [newTitle,setNewTitle]=useState('');const [newBatch,setNewBatch]=useState('');const [newSlug,setNewSlug]=useState('');
  const scoped=<T,>(path:string,method='GET',body?:unknown)=>request<T>(path+(path.includes('?')?'&':'?')+'quiz='+encodeURIComponent(selected),method,body);
  const loadQuizzes=async()=>setQuizzes(await request<QuizRow[]>('admin/quizzes'));
  const [config,setConfig]=useState<QuizConfig|null>(null);
  const [revision,setRevision]=useState(0);
  const [login,setLogin]=useState(false);
  const [email,setEmail]=useState(''); const [password,setPassword]=useState('');
  const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');
  const [tab,setTab]=useState('participants');const [rows,setRows]=useState<Row[]>([]);
  const [page,setPage]=useState(1);const [status,setStatus]=useState('');const [search,setSearch]=useState('');
  const [rules,setRules]=useState('[]');const [advanced,setAdvanced]=useState('');
  const [dirty,setDirty]=useState(false);
  const loadConfig=async()=>{
    const data=await scoped<{config:QuizConfig;revision:number}>('admin/config');
    setConfig(data.config);setRevision(data.revision);setRules(JSON.stringify(data.config.offer.rules,null,2));setAdvanced(JSON.stringify(data.config,null,2));setLogin(true);setDirty(false);
  };
  const run=async(work:()=>Promise<void>)=>{if(busy)return;setBusy(true);setMessage('');try{await work();}catch(e){setMessage((e as Error).message);if(e instanceof ApiError&&e.status===401)setLogin(false);}finally{setBusy(false);}};
  useEffect(()=>{setConfig(null);setRows([]);void loadConfig().then(loadQuizzes).catch(e=>{if(!(e instanceof ApiError&&e.status===401))setMessage(e.message);});},[selected]);
  useEffect(()=>{
    let current=true;
    if(login)void scoped<Row[]>('admin/participants?page='+page+'&status='+encodeURIComponent(status)+'&search='+encodeURIComponent(search)).then(data=>{if(current)setRows(data);}).catch(e=>{if(current)setMessage(e.message);});
    return()=>{current=false;};
  },[login,page,status,search,selected]);
  const edit=(next:QuizConfig)=>{setConfig(next);setDirty(true);};
  const updateQuestion=(sectionIndex:number,index:number,patch:Partial<Question>)=>{
    if(!config)return;edit({...config,sections:config.sections.map((s,i)=>i===sectionIndex?{...s,questions:s.questions.map((q,j)=>j===index?{...q,...patch}:q)}:s)});
  };
  const textField=(label:string,value:string,onChange:(value:string)=>void,multiline=false)=><label className="block text-sm"><span className="block font-semibold mb-1">{label}</span>{multiline?<textarea rows={3} className={inputClass} value={value} onChange={e=>onChange(e.target.value)}/>:<input className={inputClass} value={value} onChange={e=>onChange(e.target.value)}/>}</label>;
  const save=()=>run(async()=>{
    if(!config)return;
    const payload=tab==='advanced'?JSON.parse(advanced):{...config,offer:{...config.offer,rules:JSON.parse(rules)}};
    const result=await scoped<{revision:number}>('admin/config','PUT',{config:payload,revision});
    setRevision(result.revision);await loadConfig();await loadQuizzes();setMessage('Konfigurasi tersimpan. Konten berlaku untuk sesi baru. Perubahan aktif/nonaktif berlaku langsung.');
  });
  const download=()=>run(async()=>{
    const response=await fetch('/api?route=admin%2Fexport&quiz='+encodeURIComponent(selected)+'&status='+encodeURIComponent(status),{credentials:'same-origin',cache:'no-store'});
    if(!response.ok){const data=await response.json();throw new Error(data.error);}
    const blob=await response.blob();const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`peserta-post-test-${selected}.csv`;a.click();URL.revokeObjectURL(url);
  });
  if(!login)return <main className="max-w-sm mx-auto p-6 mt-12"><h1 className="font-heading text-xl font-bold mb-4">Admin Post Test</h1><form className="space-y-4" onSubmit={e=>{e.preventDefault();void run(async()=>{await request('admin/login','POST',{email,password});setPassword('');await loadConfig();await loadQuizzes();});}}>
    <label className="block text-sm">Email<input type="email" required autoComplete="username" className={inputClass} value={email} onChange={e=>setEmail(e.target.value)}/></label>
    <label className="block text-sm">Password<input type="password" required autoComplete="current-password" className={inputClass} value={password} onChange={e=>setPassword(e.target.value)}/></label>
    <button disabled={busy} className={buttonClass}>Login</button>{message&&<p role="alert" className="text-sm text-rose-700">{message}</p>}
  </form></main>;
  if(!config)return null;
  return <main className="max-w-5xl mx-auto p-4 sm:p-8 space-y-6">
    <header className="flex flex-wrap justify-between items-center gap-3"><h1 className="font-heading text-xl font-bold">Admin Post Test</h1><button className="text-sm underline" onClick={()=>void run(async()=>{await request('admin/logout','POST',{});setLogin(false);setConfig(null);})}>Logout</button></header>
    <section className="border rounded-2xl p-4 space-y-3">
      <h2 className="font-bold">Kelola link post test</h2>
      <div className="flex flex-wrap gap-3 items-center"><label className="text-sm">Post test <select disabled={busy} className="border rounded-lg p-2" value={selected} onChange={e=>{if(dirty&&!confirm('Ada perubahan belum disimpan. Pindah post test?'))return;setSelected(e.target.value);setPage(1);setSearch('');setStatus('');setDuplicate(false);}}>{quizzes.map(q=><option key={q.slug} value={q.slug}>{q.batch} — {q.title} ({q.active?'Aktif':'Nonaktif'})</option>)}</select></label>
      <button disabled={busy} className={buttonClass} onClick={()=>void run(async()=>{await navigator.clipboard.writeText(`${location.origin}/test/${selected}`);setMessage('Link post test disalin.');})}>Salin link</button>
      <button disabled={busy||dirty} className={buttonClass} onClick={()=>void run(async()=>{await scoped('admin/active','PUT',{active:!config.active,revision});await loadConfig();await loadQuizzes();setMessage(config.active?'Link dinonaktifkan. Pengisian dihentikan; data tetap tersimpan.':'Link diaktifkan.');})}>{config.active?'Nonaktifkan':'Aktifkan'}</button>
      <button disabled={busy||dirty} className="border rounded-lg px-4 py-2 text-sm" onClick={()=>{setDuplicate(!duplicate);setNewTitle(config.title);setNewBatch(config.batch+' (salinan)');setNewSlug('');}}>Duplikasi</button></div>
      <p className="text-xs break-all">Link: {location.origin}/test/{selected}</p>
      <p className="text-xs text-gray-500">Nonaktif menghentikan pengisian, termasuk sesi yang masih berjalan. Peserta yang sudah selesai tetap dapat melihat hasil. Tidak ada jadwal otomatis.</p>
      {duplicate&&<form className="space-y-3 border-t pt-3" onSubmit={e=>{e.preventDefault();void run(async()=>{const created=await scoped<{slug:string}>('admin/duplicate','POST',{slug:newSlug,title:newTitle,batch:newBatch});await loadQuizzes();setSelected(created.slug);setDuplicate(false);setMessage('Duplikat dibuat nonaktif. Edit kontennya, lalu aktifkan saat siap.');});}}>
        {textField('Judul salinan',newTitle,setNewTitle)}{textField('Nama batch baru',newBatch,setNewBatch)}
        <label className="block text-sm">Nama link baru<input required pattern="[a-z0-9][a-z0-9-]{0,63}" maxLength={64} placeholder="contoh: pm-batch-7" className={inputClass} value={newSlug} onChange={e=>setNewSlug(e.target.value)}/></label>
        <button disabled={busy} className={buttonClass}>Buat duplikat</button>
      </form>}
    </section>
    <nav className="flex flex-wrap gap-2">{[['participants','Data peserta'],['content','Konten'],['questions','Pertanyaan'],['offer','Penawaran'],['advanced','Pengaturan lanjutan']].map(([key,label])=><button key={key} className={tab===key?buttonClass:'px-4 py-2 border rounded-lg text-sm'} onClick={()=>{if(tab==='advanced'&&dirty&&!confirm('Teks pengaturan lanjutan belum disimpan. Pindah tab?'))return;setTab(key);if(key==='advanced')setAdvanced(JSON.stringify({...config,offer:{...config.offer,rules:JSON.parse(rules)}},null,2));}}>{label}</button>)}</nav>
    {message&&<p role="status" className="text-sm rounded-lg bg-[#F9EDDE]/50 p-3">{message}</p>}
    {tab==='participants'?<section className="space-y-4">
      <div className="flex flex-wrap gap-3"><select className="border rounded-lg px-3 py-2 text-sm" value={status} onChange={e=>{setStatus(e.target.value);setPage(1);}}><option value="">Semua peserta</option><option value="completed">Email tersimpan</option><option value="in_progress">Belum melengkapi email</option></select><input className="border rounded-lg px-3 py-2 text-sm" placeholder="Cari nama/email" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}/><button disabled={busy} className={buttonClass} onClick={()=>void download()}>Export CSV</button></div>
      <p className="text-xs text-gray-500">Data dan export hanya untuk post test yang dipilih. Export mengikuti filter status, maksimal 10.000 sesi terbaru. Pencarian nama/email hanya memfilter tabel di layar. Kehadiran day 1–3 diperiksa manual oleh tim.</p>
      <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left">{['Nama sertifikat','Email','Batch','Status','Recap','Asesmen','Mulai'].map(t=><th key={t} className="p-2">{t}</th>)}</tr></thead><tbody>{rows.map(row=><tr key={row.id} className="border-b"><td className="p-2">{row.name}</td><td className="p-2">{row.email||'—'}</td><td className="p-2">{row.batch}</td><td className="p-2">{row.status==='completed'?'Email tersimpan':'Belum melengkapi email'}</td><td className="p-2">{row.status==='completed'?row.recap_correct+'/'+row.recap_total:'—'}</td><td className="p-2">{row.status==='completed'?row.match_score:'—'}</td><td className="p-2">{new Date(row.created_at).toLocaleString('id-ID')}</td></tr>)}</tbody></table></div>
      {!rows.length&&<p className="text-sm">Belum ada data sesuai filter.</p>}
      <div className="flex gap-3"><button disabled={page===1} onClick={()=>setPage(page-1)} className="underline disabled:opacity-40">Sebelumnya</button><span>Halaman {page}</span><button disabled={rows.length<50} onClick={()=>setPage(page+1)} className="underline disabled:opacity-40">Berikutnya</button></div>
    </section>:<>
      <fieldset disabled={busy} className="space-y-5">
        {tab==='content'&&<>
          {textField('Judul post test',config.title,v=>edit({...config,title:v}))}
          {textField('Nama batch',config.batch,v=>edit({...config,batch:v}))}
          {textField('Deskripsi pembuka',config.welcomeDescription,v=>edit({...config,welcomeDescription:v}),true)}
          {textField('Poin halaman awal (satu per baris)',config.welcomePoints.join('\n'),v=>edit({...config,welcomePoints:v.split('\n')}),true)}
          {textField('Informasi pengiriman sertifikat',config.certificateNotice,v=>edit({...config,certificateNotice:v}),true)}
          {textField('Syarat kehadiran sertifikat',config.certificateEligibility,v=>edit({...config,certificateEligibility:v}),true)}
          <label className="flex gap-2 text-sm"><input type="checkbox" checked={config.active} onChange={e=>edit({...config,active:e.target.checked})}/>Terima peserta baru</label>
        </>}
        {tab==='questions'&&config.sections.map((section,si)=><section key={section.key} className="border rounded-2xl p-4 space-y-4">
          <div className="flex gap-3 items-center"><input aria-label="Judul section" className={inputClass} value={section.title} onChange={e=>edit({...config,sections:config.sections.map((s,i)=>i===si?{...s,title:e.target.value}:s)})}/><select aria-label="Pertanyaan per layar" className="border rounded-lg p-2 text-sm" value={section.perPage} onChange={e=>edit({...config,sections:config.sections.map((s,i)=>i===si?{...s,perPage:Number(e.target.value)}:s)})}><option value={1}>1 per layar</option><option value={2}>2 per layar</option></select></div>
          {section.questions.map((q,qi)=><div key={q.key} className="bg-gray-50 rounded-xl p-3 space-y-3">
            <p className="text-xs text-gray-500">{qi+1}. ID: {q.key}</p>
            {textField('Pertanyaan',q.text,v=>updateQuestion(si,qi,{text:v}),true)}
            <div className="flex flex-wrap gap-4"><label className="text-sm">Tipe <select className="border rounded p-1" value={q.type} onChange={e=>updateQuestion(si,qi,{type:e.target.value as Question['type']})}><option value="single">Pilihan tunggal</option><option value="multi">Pilihan ganda lebih dari satu</option><option value="rating">Rating 1–5</option><option value="text">Paragraf</option></select></label><label className="text-sm flex gap-2 items-center"><input type="checkbox" checked={q.required} onChange={e=>updateQuestion(si,qi,{required:e.target.checked})}/>Wajib</label>{q.type==='single'&&<label className="text-sm flex gap-2 items-center"><input type="checkbox" checked={!!q.allowOther} onChange={e=>updateQuestion(si,qi,{allowOther:e.target.checked})}/>Jawaban lainnya</label>}</div>
            {['single','multi'].includes(q.type)&&textField('Opsi (satu per baris)',q.options.join('\n'),v=>updateQuestion(si,qi,{options:v.split('\n')}),true)}
            {section.kind==='recap'&&<label className="block text-sm">Kunci jawaban<select className={inputClass} value={q.correctAnswer||''} onChange={e=>updateQuestion(si,qi,{correctAnswer:e.target.value})}><option value="">Pilih kunci</option>{q.options.map((o,i)=><option key={i} value={o}>{o}</option>)}</select></label>}
            <div className="flex gap-4 text-xs"><button type="button" disabled={qi===0} className="underline disabled:opacity-40" onClick={()=>{const qs=[...section.questions];[qs[qi-1],qs[qi]]=[qs[qi],qs[qi-1]];edit({...config,sections:config.sections.map((s,i)=>i===si?{...s,questions:qs}:s)});}}>Naik</button><button type="button" disabled={qi===section.questions.length-1} className="underline disabled:opacity-40" onClick={()=>{const qs=[...section.questions];[qs[qi],qs[qi+1]]=[qs[qi+1],qs[qi]];edit({...config,sections:config.sections.map((s,i)=>i===si?{...s,questions:qs}:s)});}}>Turun</button><button type="button" className="text-rose-700 underline" onClick={()=>{if(confirm('Hapus pertanyaan ini dari konfigurasi untuk peserta baru?'))edit({...config,sections:config.sections.map((s,i)=>i===si?{...s,questions:s.questions.filter((_,j)=>j!==qi)}:s)});}}>Hapus</button></div>
          </div>)}
          <button type="button" className="underline text-sm" onClick={()=>edit({...config,sections:config.sections.map((s,i)=>i===si?{...s,questions:[...s.questions,{key:s.key+'.q'+Date.now(),text:'Pertanyaan baru',type:'single',options:['Opsi A','Opsi B'],required:true,...(s.kind==='recap'?{correctAnswer:'Opsi A'}:{})}]}:s)})}>Tambah pertanyaan</button>
        </section>)}
        {tab==='offer'&&<>
          {textField('Judul bootcamp',config.offer.title,v=>edit({...config,offer:{...config.offer,title:v}}))}
          {textField('URL gambar voucher (HTTPS atau /images/...)',config.offer.image,v=>edit({...config,offer:{...config.offer,image:v}}))}
          <img src={config.offer.image} alt="Preview voucher" className="max-w-md rounded-xl"/>
          {textField('Deskripsi gambar',config.offer.imageAlt,v=>edit({...config,offer:{...config.offer,imageAlt:v}}))}
          {textField('Label tombol',config.offer.ctaText,v=>edit({...config,offer:{...config.offer,ctaText:v}}))}
          {textField('URL bootcamp',config.offer.ctaUrl,v=>edit({...config,offer:{...config.offer,ctaUrl:v}}))}
          {textField('Benefit umum (satu per baris, maksimal 4 ditampilkan)',config.offer.benefits.join('\n'),v=>edit({...config,offer:{...config.offer,benefits:v.split('\n')}}),true)}
          <label className="block text-sm"><span className="block font-semibold mb-1">Aturan benefit personalisasi (JSON)</span><p className="text-xs text-gray-500 mb-2">Format: {'[{"key":"p3_cara_belajar","values":["Rekaman fleksibel"],"text":"Akses rekaman kapan saja."}]'}. Urutan aturan menentukan prioritas.</p><textarea rows={8} className={inputClass+' font-mono'} value={rules} onChange={e=>{setRules(e.target.value);setDirty(true);}}/></label>
        </>}
        {tab==='advanced'&&<><p className="text-sm">Konfigurasi lengkap, termasuk poin asesmen, narasi hasil, dan aturan skip. Jangan mengubah ID pertanyaan yang sudah dipakai untuk ringkasan hasil.</p><textarea rows={24} className={inputClass+' font-mono'} value={advanced} onChange={e=>{setAdvanced(e.target.value);setDirty(true);}}/></>}
      </fieldset>
      <div className="sticky bottom-0 bg-white border-t py-3 flex gap-3 items-center"><button disabled={busy||!dirty} className={buttonClass} onClick={()=>void save()}>{busy?'Menyimpan…':'Simpan perubahan'}</button><span className="text-xs text-gray-500">{dirty?'Ada perubahan belum disimpan':'Tersimpan'}</span></div>
    </>}
  </main>;
}
