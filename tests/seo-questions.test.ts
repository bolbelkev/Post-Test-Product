import {test} from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {DatabaseQuestions} from '../src/components/DatabaseQuestions.tsx';
import {withoutSeoCertificate} from '../db/seo-flow.ts';
import {initialConfig} from '../db/seed.ts';

test('job details appear for each option and Next stays disabled until real text is filled',()=>{
  const q=withoutSeoCertificate(initialConfig).sections.find(s=>s.kind==='profile')!.questions.find(q=>q.key==='p1_pekerjaan')!;
  const render=(answers:Record<string,string>)=>renderToStaticMarkup(React.createElement(DatabaseQuestions,{questions:[q],answers,onAnswer:()=>{},onNext:()=>{},disabled:false,grouped:false}));
  assert(!render({}).includes('job-detail'));
  for(const option of q.options){
    const empty=render({[q.key]:option});
    assert(empty.includes(q.detailOptions![option].label));
    assert.equal((empty.match(/<button/g)||[]).length,5);
    assert(/<button[^>]*disabled=""[^>]*>Lanjut<\/button>/.test(empty));
    const whitespace=render({[q.key]:option,[q.key+'.detail']:'  '});assert(/<button[^>]*disabled=""[^>]*>Lanjut<\/button>/.test(whitespace));
    const filled=render({[q.key]:option,[q.key+'.detail']:'Detail peserta'});assert(!/<button[^>]*disabled=""[^>]*>Lanjut<\/button>/.test(filled));
  }
});
