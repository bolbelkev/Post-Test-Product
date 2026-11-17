import json
from pathlib import Path
import openpyxl

path=Path('C:/Users/LENOVO/Downloads/Silabus Mini Class SEO 2026.xlsx')
s=openpyxl.load_workbook(path,data_only=True)['Soal Quiz Batch 4']
questions=[]
for nc,qc,lc,oc in [(2,3,4,5),(7,8,9,10)]:
    for row in range(3,s.max_row+1):
        if not isinstance(s.cell(row,nc).value,(int,float)): continue
        options=[]
        for r in range(row,row+4):
            cell=s.cell(r,oc); label=s.cell(r,lc)
            yellow=any(c.fill.fgColor.type=='rgb' and c.fill.fgColor.rgb[-6:]=='FFFF00' for c in [cell,label])
            options.append({'text':str(cell.value).strip(),'yellow':yellow,'cell':cell.coordinate})
        assert len(options)==4 and sum(o['yellow'] for o in options)==1
        questions.append({'number':int(s.cell(row,nc).value),'question':s.cell(row,qc).value.strip(),'options':options})
questions.sort(key=lambda q:q['number'])
assert [q['number'] for q in questions]==list(range(1,21))
out={'source':path.name,'sheet':s.title,'questions':questions}
Path('docs/quiz-archive/seo-source.json').write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf-8')
print('20 soal SEO diekstrak; 20 kunci kuning terverifikasi.')
