'use strict';

const ACCENT = '#d51862';
const STAGE_MAP_V1 = [
  { key:'QLD 01', start:'DT INÍCIO QLD 01', end:'DT FIM QLD 01', person:'QUALIDADE 01', label:'Qualidade 01', area:'Conteúdo' },
  { key:'QLD 02', start:'DT INÍCIO QLD 02', end:'DT FIM QLD 02', person:'QUALIDADE 02', label:'Qualidade 02', area:'Conteúdo' },
  { key:'DI', start:'DT INÍCIO DI', end:'DT FIM DI', person:'DI', label:'DI', area:'Conteúdo' },
  { key:'TESTER', start:'DT INÍCIO TESTER', end:'DT FIM TESTER', person:'TESTER ÁREA', label:'Tester Área', area:'Conteúdo' },
  { key:'REV', start:'DT INÍCIO REV', end:'DT FIM REV', person:'REVISOR', label:'Revisão', area:'Conteúdo' },
  { key:'ROTEIRO', start:'DT INÍCIO ROTEIRO', end:'DT FIM ROTEIRO', person:'ROTEIRO REVISÃO', label:'Roteiro/Revisão', area:'Estúdio' },
  { key:'DG', start:'DT INÍCIO DG', end:'DT FIM DG', person:'DG', label:'Design Gráfico', area:'Estúdio' },
  { key:'LIBERAÇÃO', start:'DT INÍCIO LIBERAÇÃO', end:'DT FIM LIBERAÇÃO', person:'LIBERAÇÃO CONTEUDISTA', label:'Liberação Conteudista', area:'Estúdio' },
  { key:'LIBERADO', start:'DT INÍCIO LIBERADO', end:'DT FIM LIBERADO', person:'LIBERAÇÃO GRAVAÇÃO', label:'Liberação Gravação', area:'Estúdio' },
  { key:'GRAVAÇÃO', start:'DT INÍCIO GRAVAÇÃO', end:'DT FIM GRAVAÇÃO', person:'GRAVAÇÃO', label:'Gravação', area:'Estúdio' },
  { key:'EDIÇÃO', start:'DT INÍCIO EDIÇÃO', end:'DT FIM EDIÇÃO', person:'EDIÇÃO', label:'Edição', area:'Estúdio' },
  { key:'WEB', start:'DT INÍCIO WEB', end:'DT FIM WEB', person:'WEB', label:'Web', area:'Web' },
  { key:'TST CONTEÚDO', start:'DT INÍCIO TST CONTEÚDO', end:'DT FIM TST CONTEÚDO', person:'TESTER CONTEÚDO', label:'Tester Conteúdo', area:'Conteúdo' },
  { key:'EXT 01', start:'DT INÍCIO EXT 01', end:'DT FIM EXT O1', person:'EXTRA 01', label:'Extra 01', area:'Outros' }
];
// 2027/1: etapas numeradas dos quadros Conteúdo e Vídeo (colunas com espaços normalizados). Auditorias ficam de fora de propósito.
const mk=(key,label,area,start,end,person,wait)=>({key,label,area,start,end,person:person||'__sem_resp__',wait:!!wait});
const STAGE_MAP_V2 = [
  mk('QUAL1','Qualidade 1','Conteúdo','01 DT INÍC QUAL1','01 DT CONC QUAL1','01 RESP QUAL1'),
  mk('AGUARD CONT','Aguardando conteudista/curador','Conteúdo','01 DT INÍC AGUARDANDO CONT/CUR','01 DT CONC AGUARDANDO CONT/CUR','',true),
  mk('QUAL2','Qualidade 2','Conteúdo','02 DT INÍC QUAL2','02 DT CONC QUAL 2','02 RESP QUAL2'),
  mk('DI','DI','Conteúdo','03 DT INÍC DI','03 DT CONC DI','03 RESP DI'),
  mk('REV','Revisão','Conteúdo','04 DT INÍC REVISÃO','04 DT CONC REVISÃO','04 RESP REVISÃO'),
  mk('DG','Design Gráfico','Estúdio','05 DT INÍC DG','05 DT CONC DG','05 RESP DG'),
  mk('WEB','Web','Web','06 DT INÍC WEB','06 DT CONC WEB','06 RESP WEB'),
  mk('PENDÊNCIA','Pendência','Outros','DT INÍC PENDÊNCIA','DT CONC PENDÊNCIA','PENDÊNCIA'),
  mk('EXTRA 01','Extra 01','Outros','DT INÍC EXTRA 01','DT CONC EXTRA 01','RESP EXTRA 01'),
  mk('EXTRA 02','Extra 02','Outros','DT INÍC EXTRA 02','DT CONC EXTRA 02','RESP EXTRA 02'),
  mk('V ROTEIRO','Roteiro','Estúdio','01 DT INÍC ROTEIRO','01 DT CONC ROTEIRO','01 RESP ROTEIRO'),
  mk('V LIB VALID','Liberado p/ validação','Estúdio','02 DT INÍC LIB VALID','02 DT CONC LIB VALID','',true),
  mk('V AGUARD GRAV','Aguardando gravação','Estúdio','03.1 DT INÍC AGUAD GRAV','03.1 DT CONC AGUAD GRAV','',true),
  mk('V GRAVAÇÃO','Gravação','Estúdio','03.2 DT INÍC GRAVAÇÃO','03.2 DT CONC GRAVAÇÃO','03.2 RESP GRAVAÇÃO'),
  mk('V QUAL 1','Qualidade 1 (Vídeo)','Conteúdo','04.1 DT INÍC QUAL 1','04.1 DT CONC QUAL 1','04.1 RESP QUAL 1'),
  mk('V EDT','Edição','Estúdio','06.1 DT INÍC EDT','06.1 DT CONC EDT','06.1 RESP EDT'),
  mk('V EDT EXT','Edição externa','Estúdio','06.2 DT INÍC EDT EXT','06.2 DT CONC EDT EXT','06.2 RESP EDT EXT'),
  mk('V QUAL 2','Qualidade 2 (Vídeo)','Conteúdo','07 DT INÍC QUAL 2','07 DT CONC QUAL 2','07 RESP QUAL 2')
];
let STAGE_MAP = STAGE_MAP_V1;
// Semestres disponíveis. O PRIMEIRO é o mais recente e abre por padrão.
const SEMESTERS=[
  {id:'2027-1',label:'2027/1',profile:'v2',token:'27\\.1',sources:['dados_2027_1_conteudo.csv','dados_2027_1_video.csv']},
  {id:'2026-2',label:'2026/2',profile:'v1',token:'2026\\.2',sources:['dados.csv']}
];

const PRODUCTION_LABELS = { BDQ:'Banco de questões' };
const state = {
  raw:[], data:[], filtered:[], fileName:'', charts:{}, page:1, pageSize:25,
  queryApplied:false, sourceMode:'', peopleInitialized:false, profile:'v1', semester:'', ignored:{fora:0,arq:0}
};

const el = id => document.getElementById(id);
const clean = v => (v == null ? '' : String(v)).trim();
const truthy = v => ['true','1','sim','yes'].includes(clean(v).toLowerCase());
const norm = v => clean(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();
const unique = arr => [...new Set(arr.filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR',{numeric:true}));
const num = n => new Intl.NumberFormat('pt-BR').format(n || 0);
const fmtMin = m => !Number.isFinite(m) ? '0 min' : `${num(Math.round(m))} min`;
const fmtHours = h => fmtMin(h*60); // entrada em horas (interno), saída em minutos
const parseDate = v => { if(!v) return null; const d=new Date(v); return Number.isNaN(d.getTime())?null:d; };
const fmtDate = v => { const d=parseDate(v); return d?d.toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}):'—'; };
const fmtShortDate = d => d.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'});
const productionLabel = v => PRODUCTION_LABELS[norm(v)] || clean(v);
const escapeHtml = s => clean(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const dayKey = d => d ? `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` : '';
const daysBetween = (a,b) => Math.max(0, Math.floor((b-a)/86400000));

const nameLevel=n=>{const nu=norm(n);return /(^|[^A-Z0-9])POS(?=[A-Z]*\d|[^A-Z]|$)/.test(nu)?'Pós':/(^|[^A-Z0-9])GRD/.test(nu)?'Graduação':'Outros';};
function parseCardNameV2(name=''){
  const parts=clean(name).split('_').map(s=>s.trim()).filter(Boolean);
  const codeIdx=parts.findIndex(p=>/^(AFYA|POSAFYA)\d+/i.test(p));
  const kind=norm(parts[1]||''),u=parts[2]||'';
  const unit=/^(U|V)\d+$/i.test(u)?u.toUpperCase():(/^PE$/i.test(u)?'PE':'');
  const tags=(codeIdx>=0?parts.slice(codeIdx+1):[]).map(norm);
  let production='';
  if(kind==='BDQ') production='Banco de questões';
  else if(tags.includes('POD')) production='Podcast';
  else if(tags.includes('PEV')) production='Prática em evidência';
  else if(tags.includes('EDUV')) production='Dúvida';
  else if(unit==='PE') production='Plano de ensino';
  else if(unit.startsWith('V')){const t=tags.find(x=>/^T\d+$/.test(x));production=t?`Vídeo de tema (${t})`:'Vídeo';}
  else production='Conteúdo';
  return { product:parts[0]||'', unit, production, code:codeIdx>=0?parts[codeIdx]:'', level:nameLevel(name), themes:(tags.find(x=>/^T\d+$/.test(x))||'') };
}
function parseCardName(name='') {
  if(state.profile==='v2') return parseCardNameV2(name);
  const parts=clean(name).split('_').map(s=>s.trim()).filter(Boolean);
  const codeIdx=parts.findIndex(p=>/^(AFYA|POSAFYA)\d+/i.test(p));
  const unitIdx=parts.findIndex(p=>/^(U|V)\d+$/i.test(p));
  const product=parts[0]||'';
  const unit=unitIdx>=0?parts[unitIdx]:'';
  let production='';
  if(unitIdx>=0){
    const until=codeIdx>unitIdx?codeIdx:Math.min(unitIdx+2,parts.length);
    production=parts.slice(unitIdx+1,until).join('_');
  } else if(codeIdx>1) production=parts.slice(1,codeIdx).join('_');
  const code=codeIdx>=0?parts[codeIdx]:(name.match(/(?:AFYA|POSAFYA)\d+/i)?.[0]||'');
  production=productionLabel(production);
  if(/_BDQ_/i.test(clean(name))) production='Banco de questões';
  const nu=norm(name);
  const level=/(^|[^A-Z0-9])POS(?=[A-Z]*\d|[^A-Z]|$)/.test(nu)?'Pós':/(^|[^A-Z0-9])GRD/.test(nu)?'Graduação':'Outros';
  return { product, unit, production, code, level };
}

function getArea(stage='') {
  const s=norm(stage);
  if(/GRAVA|EDI|ROTEIRO|DG|DESIGN|ESTUDIO|LIBERA/.test(s)) return 'Estúdio';
  if(/QUAL|CONTEUD|CONTEUDISTA|DI|TESTER|REV|CURADOR|CAPACIT|ACIONADO/.test(s)) return 'Conteúdo';
  if(/WEB/.test(s)) return 'Web';
  return 'Outros';
}

function rawStatus(row){
  const list=norm(row['List Name']);
  if(state.profile==='v2'){
    if(/PUBLICADO|FINALIZ/.test(list)) return 'Finalizado';
    if(truthy(row.Archived)||/ARQUIV/.test(list)) return 'Arquivado';
    if(/^00 DEMANDA/.test(list)) return 'Backlog';
    return 'Em andamento';
  }
  // Regra de negócio: ao chegar em qualquer etapa de TESTER, a entrega já é considerada concluída.
  if(/FINALIZ|TESTER|TST\s*CONTEUDO/.test(list)) return 'Finalizado';
  if(truthy(row.Archived) || /ARQUIV/.test(list)) return 'Arquivado';
  return 'Em andamento';
}
function getStatus(row){ const s=rawStatus(row); return (s==='Em andamento'||s==='Backlog')?s:'Finalizado'; }
function isFinished(row){ return row.__status==='Finalizado'; }

function splitPeople(v=''){ return clean(v).split(/[,;|]/).map(x=>x.trim()).filter(Boolean); }
function splitLabels(v=''){ return clean(v).split(/,(?=\s*[^,]+(?:\(|$))/).map(x=>x.trim()).filter(Boolean); }

function stageEvents(row){
  return STAGE_MAP.map(s=>{
    const start=parseDate(row[s.start]);
    const end=parseDate(row[s.end]);
    const person=clean(row[s.person]);
    let hours=null;
    if(start&&end){ const diff=(end-start)/3600000; if(diff>=0&&diff<24*180) hours=diff; }
    return {...s,start,end,person,hours:s.wait?null:hours};
  }).filter(e=>e.start||e.end||e.person);
}

function stageDefV2(s,video){
  const f=k=>STAGE_MAP.find(x=>x.key===k);
  if(/PUBLICADO|FINALIZ|MODELOS|^00 DEMANDA/.test(s)) return null;
  if(/AGUARD\w* GRAV/.test(s)) return f('V AGUARD GRAV');
  if(/LIBERADO PARA VALID|LIB\w* VALID/.test(s)) return f('V LIB VALID');
  if(/GRAVACAO/.test(s)) return f('V GRAVAÇÃO');
  if(/EDICAO EXT|EDT EXT/.test(s)) return f('V EDT EXT');
  if(/EDICAO|\bEDT\b/.test(s)) return f('V EDT');
  if(/ROTEIRO/.test(s)) return f('V ROTEIRO');
  if(/\bDG\b/.test(s)) return f('DG');
  if(/\bWEB\b/.test(s)) return f('WEB');
  if(/PENDENCIA/.test(s)) return f('PENDÊNCIA');
  if(/REVISAO/.test(s)) return f('REV');
  if(/\bDI\b/.test(s)) return f('DI');
  if(/AGUARD\w* CONT/.test(s)) return f('AGUARD CONT');
  if(/EXTRA 02/.test(s)) return f('EXTRA 02');
  if(/EXTRA 01|EXTRA/.test(s)) return f('EXTRA 01');
  if(/QUALIDADE 2|QUAL 2|QUAL2/.test(s)) return f(video?'V QUAL 2':'QUAL2');
  if(/QUALIDADE 1|QUAL 1|QUAL1/.test(s)) return f(video?'V QUAL 1':'QUAL1');
  return null;
}
function stageDefForList(listName='',row=null){
  const s=norm(listName);
  if(state.profile==='v2') return stageDefV2(s,/VIDEO/.test(norm(row?.['Board Name'])));
  if(/TESTER CONTEUDO/.test(s)) return STAGE_MAP.find(x=>x.key==='TST CONTEÚDO');
  if(/\bWEB\b/.test(s)) return STAGE_MAP.find(x=>x.key==='WEB');
  if(/EDICAO/.test(s)) return STAGE_MAP.find(x=>x.key==='EDIÇÃO');
  if(/^DG\b/.test(s)) return STAGE_MAP.find(x=>x.key==='DG');
  if(/GRAVACAO/.test(s)) return STAGE_MAP.find(x=>x.key==='GRAVAÇÃO');
  if(/ROTEIRO/.test(s)) return STAGE_MAP.find(x=>x.key==='ROTEIRO');
  if(/LIBERACAO CONTEUDISTA/.test(s)) return STAGE_MAP.find(x=>x.key==='LIBERAÇÃO');
  if(/LIBERADO/.test(s)) return STAGE_MAP.find(x=>x.key==='LIBERADO');
  if(/REVISAO/.test(s)) return STAGE_MAP.find(x=>x.key==='REV');
  if(/^TESTER\b|TESTER DI/.test(s)) return STAGE_MAP.find(x=>x.key==='TESTER');
  if(/QLD 01|QUALIDADE 01/.test(s)) return STAGE_MAP.find(x=>x.key==='QLD 01');
  if(/QLD 02|QUALIDADE 02/.test(s)) return STAGE_MAP.find(x=>x.key==='QLD 02');
  if(/^DI\b/.test(s)) return STAGE_MAP.find(x=>x.key==='DI');
  return null;
}

function stageMode(listName=''){
  const s=norm(listName);
  if(/FINALIZ|ARQUIV|PUBLICADO/.test(s)) return 'Finalizado';
  if(state.profile==='v2'&&/LIBERADO PARA VALID|AGUARD/.test(s)) return 'Fila';
  if(/VALIDACAO|TESTER CONTEUDO/.test(s)) return 'Validação';
  if(/\|\s*PRODUCAO|\|\s*PROD\b/.test(s)) return 'Produção';
  return 'Fila';
}

function currentStageInfo(row){
  const list=clean(row['List Name'])||'Sem etapa';
  if(isFinished(row)) return { list:'Finalizados', mode:'Finalizado', start:null, end:null, person:'', def:null, movement:row.__activityDate, days:0, issues:[] };
  const def=stageDefForList(list,row);
  const start=def?parseDate(row[def.start]):null;
  const end=def?parseDate(row[def.end]):null;
  const person=def?clean(row[def.person]):'';
  const mode=stageMode(list);
  const movement=(mode==='Produção'||mode==='Validação') ? (row.__activityDate||start) : (row.__activityDate||start);
  const days=movement?daysBetween(movement,new Date()):null;
  const issues=[];
  if((mode==='Produção'||mode==='Validação') && !def) issues.push('Etapa atual sem mapeamento de data');
  if((mode==='Produção'||mode==='Validação') && def && !start) issues.push(`Sem ${def.start}`);
  if(def && start && end && end<start) issues.push('Data fim anterior à data início');
  if(mode==='Produção' && def && !person) issues.push(`Sem responsável em ${def.person}`);
  if(mode==='Produção' && def && end) issues.push('Etapa em produção com data fim preenchida');
  return { list, mode, start, end, person, def, movement, days, issues };
}

function enrich(row){
  const parsed=parseCardName(row['Card Name']);
  const events=stageEvents(row);
  const rolePeople=events.flatMap(e=>splitPeople(e.person));
  const members=splitPeople(row.Members);
  const people=unique([...rolePeople,...members]);
  const labels=splitLabels(row.Labels);
  const totalHours=events.reduce((s,e)=>s+(e.hours||0),0);
  const validDurations=events.filter(e=>Number.isFinite(e.hours));
  const dates=events.flatMap(e=>[e.start,e.end]).filter(Boolean);
  const lastActivity=parseDate(row['Last Activity Date']);
  const activityDate=lastActivity||(dates.length?new Date(Math.max(...dates.map(d=>d.getTime()))):null);
  const base={...row,__parsed:parsed,__events:events,__people:people,__labels:labels,__area:getArea(row['List Name']),__rawStatus:rawStatus(row),__status:getStatus(row),__hours:totalHours,__durationCount:validDurations.length,__activityDate:activityDate};
  base.__current=currentStageInfo(base);
  base.__board=state.profile==='v2'?(/VIDEO/.test(norm(row['Board Name']))?'Vídeo':'Conteúdo'):(clean(row['Board Name'])||'—');
  if(state.profile==='v2') base.__area=isFinished(base)?'Outros':(base.__current.def?.area||(base.__board==='Vídeo'?'Estúdio':'Conteúdo'));
  return base;
}

function formatUpdateDate(value){
  const d=value instanceof Date?value:new Date(value);
  if(Number.isNaN(d.getTime()))return '—';
  return new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short'}).format(d);
}
function setLastUpdate(value,sourceMode='server'){
  const node=el('lastUpdate'); if(!node)return;
  node.textContent=`Última atualização: ${formatUpdateDate(value)}`;
  node.title=sourceMode==='manual'?'Data de última modificação do CSV selecionado':'Data de última modificação do dados.csv no servidor';
}
function loadCSVFile(file){
  if(!file)return;
  showToast('Lendo CSV...');
  Papa.parse(file,{header:true,skipEmptyLines:'greedy',dynamicTyping:false,complete:r=>{setLastUpdate(file.lastModified?new Date(file.lastModified):new Date(),'manual');onParsed(r.data,file.name,'manual',state.profile)},error:e=>showToast(`Erro ao ler CSV: ${e.message}`)});
}

function prepareV2(rows){
  const tok=(SEMESTERS.find(s=>s.id===state.semester)||{}).token||'\\d{2}\\.\\d';
  const std=new RegExp(`^[A-Z]{3}${tok}_(CONTEUDO|VIDEO|ESTUDIO|BDQ)_(U\\d+|V\\d+|PE)_`);
  const hasProd=r=>STAGE_MAP.some(s=>clean(r[s.start])||clean(r[s.end]));
  let fora=0,arq=0;
  const out=rows.map(r=>Object.fromEntries(Object.entries(r).map(([k,v])=>[k.replace(/\s+/g,' ').trim(),v]))).filter(r=>{
    if(!clean(r['Card Name'])&&!clean(r['Card ID']))return false;
    if(/MODELOS/.test(norm(r['List Name']))||!std.test(norm(r['Card Name']))){fora++;return false;}
    if(truthy(r.Archived)&&!hasProd(r)){arq++;return false;}
    return true;
  });
  state.ignored={fora,arq};
  return out;
}
function onParsed(rows,fileName='base.csv',sourceMode='manual',profile){
  state.profile=profile||state.profile||'v1'; STAGE_MAP=state.profile==='v2'?STAGE_MAP_V2:STAGE_MAP_V1;
  if(state.profile==='v2') rows=prepareV2(rows); else state.ignored={fora:0,arq:0};
  el('personPeople').dataset.ready='';el('availStage').dataset.n='';
  if(state.loadedSem!==state.semester){state.loadedSem=state.semester;state.peopleInitialized=false;el('productivityPeople').innerHTML='';}
  state.raw=rows;
  state.data=rows.filter(r=>clean(r['Card Name'])||clean(r['Card ID'])).map(enrich);
  state.fileName=fileName; state.sourceMode=sourceMode;
  el('sidebarFileName').textContent=fileName;
  el('sidebarRowCount').textContent=`${num(state.data.length)} registros${sourceMode==='server'?' · automático':' · manual'}`;
  el('dropzone').classList.add('loaded');
  populateFilters();
  applyQueryFilters();
  initProductivityPeriod();
  applyFilters();
  const sem=SEMESTERS.find(s=>s.id===state.semester),ig=state.ignored;
  el('pageSubtitle').textContent=`${sem?sem.label+' · ':''}${num(state.data.length)} cards carregados${ig.fora||ig.arq?` · ignorados: ${num(ig.fora)} modelos/fora do padrão e ${num(ig.arq)} arquivados sem produção`:''}.`;
  showToast(`${num(state.data.length)} cards carregados`);
}

function setOptions(id,values,placeholder){
  const select=el(id); const current=select.value;
  select.innerHTML=`<option value="">${placeholder}</option>`+unique(values).map(v=>`<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`).join('');
  if([...select.options].some(o=>o.value===current)) select.value=current;
}

function populateFilters(){
  setOptions('filterStatus',state.profile==='v2'?['Backlog','Em andamento','Finalizado']:['Em andamento','Finalizado'],'Todos');
  setOptions('filterBoard',state.data.map(r=>r.__board),'Todos');
  setOptions('filterArea',state.data.map(r=>r.__area),'Todas');
  setOptions('filterStage',state.data.map(r=>clean(r['List Name'])),'Todas');
  setOptions('filterResponsible',state.data.flatMap(r=>r.__people),'Todos');
  setOptions('filterLabel',state.data.flatMap(r=>r.__labels),'Todas');
  setOptions('filterLevel',state.data.map(r=>r.__parsed.level),'Todos');
  setOptions('filterProduct',state.data.map(r=>r.__parsed.product),'Todos');
  setOptions('filterUnit',state.data.map(r=>r.__parsed.unit),'Todos');
  setOptions('filterProduction',state.data.map(r=>r.__parsed.production),'Todas');
  setOptions('filterCode',state.data.map(r=>r.__parsed.code),'Todos');
}

function applyQueryFilters(){
  if(state.queryApplied)return;
  const p=new URLSearchParams(location.search);
  const mappings={dtInicio:'filterStart',dtFim:'filterEnd',responsaveis:'filterResponsible',etapa:'filterStage',produto:'filterProduct',unidade:'filterUnit',producao:'filterProduction',codigo:'filterCode',status:'filterStatus'};
  Object.entries(mappings).forEach(([q,id])=>{const v=p.get(q);if(!v)return;if(el(id).tagName==='SELECT'){const m=[...el(id).options].find(o=>norm(o.value)===norm(v));if(m)el(id).value=m.value;}else el(id).value=v;});
  state.queryApplied=true;
}

function filters(){ return {search:norm(el('filterSearch').value),status:el('filterStatus').value,area:el('filterArea').value,stage:el('filterStage').value,responsible:el('filterResponsible').value,label:el('filterLabel').value,level:el('filterLevel').value,board:el('filterBoard').value,product:el('filterProduct').value,unit:el('filterUnit').value,production:el('filterProduction').value,code:el('filterCode').value,start:el('filterStart').value,end:el('filterEnd').value}; }

function eventMatchesContext(e,f){
  if(f.responsible && !splitPeople(e.person).some(p=>norm(p)===norm(f.responsible))) return false;
  if(f.area && e.area!==f.area) return false;
  return true;
}

function eventOverlapsRange(e,start,end){
  if(!e.start && !e.end) return false;
  const evStart=e.start||e.end;
  const evEnd=e.end||e.start||new Date();
  if(start && evEnd<start) return false;
  if(end && evStart>end) return false;
  return true;
}

function cardHasDateInRange(row,startStr,endStr,f){
  if(!startStr&&!endStr)return true;
  const start=startStr?new Date(`${startStr}T00:00:00`):null;
  const end=endStr?new Date(`${endStr}T23:59:59.999`):null;
  // O período sempre é avaliado pela atuação da área/pessoa correspondente.
  // Ex.: WEB => DT INÍCIO WEB / DT FIM WEB / responsável WEB.
  const contextual=row.__events.filter(e=>eventMatchesContext(e,f));
  if(contextual.length) return contextual.some(e=>eventOverlapsRange(e,start,end));
  // Sem pessoa/área selecionada, qualquer atuação registrada no card pode colocá-lo no recorte.
  if(!f.responsible&&!f.area) return row.__events.some(e=>eventOverlapsRange(e,start,end));
  return false;
}

function applyFilters(){
  const f=filters();
  state.filtered=state.data.filter(r=>{
    if(f.search){const hay=norm([r['Card Name'],r.__parsed.code,r['List Name'],r.Members,r.Labels,...r.__people].join(' '));if(!hay.includes(f.search))return false;}
    if(f.status&&r.__status!==f.status)return false;
    if(f.area&&!(f.start||f.end)&&r.__area!==f.area)return false;
    if(f.stage&&clean(r['List Name'])!==f.stage)return false;
    if(f.responsible&&!r.__people.some(p=>norm(p)===norm(f.responsible)))return false;
    if(f.label&&!r.__labels.includes(f.label))return false;
    if(f.level&&r.__parsed.level!==f.level)return false;
    if(f.board&&r.__board!==f.board)return false;
    if(f.product&&r.__parsed.product!==f.product)return false;
    if(f.unit&&r.__parsed.unit!==f.unit)return false;
    if(f.production&&r.__parsed.production!==f.production)return false;
    if(f.code&&r.__parsed.code!==f.code)return false;
    if(!cardHasDateInRange(r,f.start,f.end,f))return false;
    return true;
  });
  state.page=1;
  updateAll();
}

function updateAll(){ updateFilterSummary();updateKpis();updateCharts();renderTable();renderInsights();renderPipeline();renderProductivity();if(el('view-person').classList.contains('active'))renderPerson(); }
function updateFilterSummary(){const f=filters();const c=Object.values(f).filter(Boolean).length;el('filterSummary').textContent=c?`${c} filtro${c>1?'s':''} aplicado${c>1?'s':''} · ${num(state.filtered.length)} cards`:`${num(state.filtered.length)} cards · nenhum filtro aplicado`;}

function personEvents(rows=state.filtered){
  return rows.flatMap(r=>r.__events.flatMap(e=>{
    const people=splitPeople(e.person);
    return (people.length?people:['']).map(person=>({...e,person,row:r}));
  }));
}
function filteredEvents(){
  const f=filters(),target=norm(f.responsible);
  return personEvents().filter(e=>{
    if(target&&norm(e.person)!==target)return false;
    if(f.area&&e.area!==f.area)return false;
    if(f.start||f.end){
      const start=f.start?new Date(`${f.start}T00:00:00`):null;
      const end=f.end?new Date(`${f.end}T23:59:59.999`):null;
      if(!eventOverlapsRange(e,start,end))return false;
    }
    return true;
  });
}

function timelinePeriod(){
  const f=filters();
  let start=f.start?new Date(`${f.start}T00:00:00`):null;
  let end=f.end?new Date(`${f.end}T23:59:59.999`):null;
  if(!start&&!end){
    const now=new Date();
    start=new Date(now.getFullYear(),now.getMonth(),1,0,0,0,0);
    end=new Date(now.getFullYear(),now.getMonth()+1,0,23,59,59,999);
  }else if(start&&!end){
    end=new Date();
  }else if(!start&&end){
    start=new Date(end.getFullYear(),end.getMonth(),1,0,0,0,0);
  }
  return {start,end};
}

function dateKeysBetween(start,end){
  const out=[];
  if(!start||!end||start>end)return out;
  const d=new Date(start.getFullYear(),start.getMonth(),start.getDate());
  const stop=new Date(end.getFullYear(),end.getMonth(),end.getDate());
  while(d<=stop){out.push(dayKey(d));d.setDate(d.getDate()+1);}
  return out;
}

function updateKpis(){
  const total=state.filtered.length,base=state.data.length;
  const active=state.filtered.filter(r=>r.__status==='Em andamento').length,backlog=state.filtered.filter(r=>r.__status==='Backlog').length;
  const finished=state.filtered.filter(isFinished).length;
  const events=filteredEvents().filter(e=>Number.isFinite(e.hours));
  const hours=events.reduce((s,e)=>s+e.hours,0),avg=events.length?hours/events.length:0;
  el('kpiTotal').textContent=num(total);el('kpiTotalHint').textContent=base?`${Math.round(total/base*100)}% da base`:'0% da base';
  el('kpiActive').textContent=num(active);el('kpiActiveHint').textContent=`${num(finished)} concluídos${backlog?` · ${num(backlog)} em backlog`:''}`;
  el('kpiFinished').textContent=num(finished);el('kpiFinishedHint').textContent=total?`${Math.round(finished/total*100)}% do recorte`:'0% do recorte';
  el('kpiHours').textContent=fmtHours(hours);el('kpiHoursHint').textContent=`${num(events.length)} participações com duração válida`;
  el('kpiAvg').textContent=fmtHours(avg);el('kpiAvgHint').textContent='Média das etapas concluídas';
}

function countBy(arr,getter){const m=new Map();arr.forEach(x=>{const k=getter(x)||'Sem informação';m.set(k,(m.get(k)||0)+1)});return [...m.entries()].sort((a,b)=>b[1]-a[1]);}
function sumBy(arr,keyFn,valueFn){const m=new Map();arr.forEach(x=>{const k=keyFn(x)||'Sem informação';m.set(k,(m.get(k)||0)+(valueFn(x)||0))});return [...m.entries()].sort((a,b)=>b[1]-a[1]);}
function destroyChart(id){if(state.charts[id]){state.charts[id].destroy();delete state.charts[id];}}
function createChart(id,config){
  if(!el(id))return;
  destroyChart(id);
  const plugins=[...(config.plugins||[])];
  if(window.ChartDataLabels && ['bar','line'].includes(config.type)) plugins.push(ChartDataLabels);
  state.charts[id]=new Chart(el(id),{...config,plugins});
}
function palette(n){const c=['#d51862','#5c6bc0','#2f9e67','#e4a03a','#7b61a8','#25a6a6','#da6b4c','#607d8b','#a5616a','#8c8f98'];return Array.from({length:n},(_,i)=>c[i%c.length]);}
const chartDefaults={
  responsive:true,
  maintainAspectRatio:false,
  layout:{padding:{top:18,right:34}},
  plugins:{
    legend:{display:false},
    tooltip:{mode:'index',intersect:false},
    datalabels:{
      display:ctx=>{const v=Number(ctx.dataset.data[ctx.dataIndex]);return Number.isFinite(v)&&v!==0;},
      color:'#555b66',
      anchor:'end',
      align:ctx=>ctx.chart.config.type==='line'?'top':'end',
      offset:2,
      clamp:true,
      clip:false,
      font:{size:10,weight:'800'},
      formatter:v=>{const n=Number(v);if(!Number.isFinite(n))return '';return Number.isInteger(n)?num(n):n.toLocaleString('pt-BR',{minimumFractionDigits:0,maximumFractionDigits:1});}
    }
  },
  scales:{x:{grid:{display:false},ticks:{color:'#777b86',font:{size:10}}},y:{grid:{color:'#eeeeF1'},ticks:{color:'#777b86',font:{size:10}}}}
};

function mergedStageName(r){ return isFinished(r)?'Finalizados':(clean(r['List Name'])||'Sem etapa'); }

function updateCharts(){
  const stages=countBy(state.filtered,mergedStageName).slice(0,12);
  createChart('chartStages',{type:'bar',data:{labels:stages.map(x=>x[0]),datasets:[{data:stages.map(x=>x[1]),backgroundColor:ACCENT,borderRadius:5}]},options:{...chartDefaults,indexAxis:'y',scales:{x:{beginAtZero:true,grid:{color:'#eeeeF1'},ticks:{precision:0}},y:{grid:{display:false},ticks:{font:{size:9}}}}}});
  const areas=countBy(state.filtered,r=>r.__area);
  createChart('chartArea',{type:'doughnut',data:{labels:areas.map(x=>x[0]),datasets:[{data:areas.map(x=>x[1]),backgroundColor:palette(areas.length),borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,cutout:'68%',plugins:{legend:{display:true,position:'bottom',labels:{boxWidth:9,usePointStyle:true,font:{size:10}}}}}});
  const events=filteredEvents().filter(e=>Number.isFinite(e.hours)&&e.person);
  const hrs=sumBy(events,e=>e.person,e=>e.hours).slice(0,10);
  createChart('chartHours',{type:'bar',data:{labels:hrs.map(x=>x[0]),datasets:[{data:hrs.map(x=>Math.round(x[1]*60)),backgroundColor:'#5c6bc0',borderRadius:5}]},options:{...chartDefaults,indexAxis:'y',scales:{x:{beginAtZero:true,grid:{color:'#eeeeF1'},title:{display:true,text:'Horas'}},y:{grid:{display:false},ticks:{font:{size:9}}}}}});
  const {start:timelineStart,end:timelineEnd}=timelinePeriod();
  const timelineSubtitle=el('timelineSubtitle');
  if(timelineSubtitle){
    const f=filters();
    const rangeLabel=`${timelineStart.toLocaleDateString('pt-BR')} a ${timelineEnd.toLocaleDateString('pt-BR')}`;
    timelineSubtitle.textContent=(f.start||f.end)?`Etapas concluídas por dia · período filtrado: ${rangeLabel}`:`Etapas concluídas por dia · mês atual: ${rangeLabel}`;
  }
  const timelineKeys=dateKeysBetween(timelineStart,timelineEnd);
  const dayMap=new Map(timelineKeys.map(k=>[k,0]));
  filteredEvents().filter(e=>e.end&&e.end>=timelineStart&&e.end<=timelineEnd).forEach(e=>{const k=dayKey(e.end);dayMap.set(k,(dayMap.get(k)||0)+1)});
  const timeline=[...dayMap.entries()].sort((a,b)=>a[0].localeCompare(b[0]));
  createChart('chartTimeline',{type:'line',data:{labels:timeline.map(x=>fmtShortDate(new Date(x[0]+'T12:00:00'))),datasets:[{data:timeline.map(x=>x[1]),borderColor:ACCENT,backgroundColor:'rgba(213,24,98,.08)',fill:true,tension:.25,pointRadius:2}]},options:{...chartDefaults}});
}

function renderInsights(){
  const out=[],total=state.filtered.length;if(!total){el('quickInsights').innerHTML='<div class="empty">Nenhum card no recorte atual.</div>';return;}
  const top=countBy(state.filtered,mergedStageName)[0];if(top)out.push([`${top[0]} concentra mais cards`,`${num(top[1])} cards (${Math.round(top[1]/total*100)}% do recorte).`]);
  const ev=filteredEvents().filter(e=>Number.isFinite(e.hours)&&e.person),th=sumBy(ev,e=>e.person,e=>e.hours)[0];if(th)out.push([`${th[0]} soma mais minutos`,`${fmtHours(th[1])} registradas nas etapas filtradas.`]);
  const old=state.filtered.filter(r=>!isFinished(r)&&r.__activityDate).sort((a,b)=>a.__activityDate-b.__activityDate)[0];if(old)out.push(['Card ativo com atividade mais antiga',`${clean(old['Card Name']).slice(0,70)} · ${fmtDate(old.__activityDate)}.`]);
  el('quickInsights').innerHTML=out.map(([a,b])=>`<div class="insight"><i class="insight-dot"></i><div><b>${escapeHtml(a)}</b><span>${escapeHtml(b)}</span></div></div>`).join('');
}
function macroProductionGroup(r){
  const unit=clean(r.__parsed.unit),production=clean(r.__parsed.production),isBdq=production==='Banco de questões'||/_BDQ_/i.test(clean(r['Card Name']));
  if(isBdq&&/^U\d+/i.test(unit))return{type:'Banco de questões',item:unit.toUpperCase(),order:3};
  if(/^V\d+/i.test(unit))return{type:'Vídeo',item:unit.toUpperCase(),order:2};
  if(/^U\d+/i.test(unit))return{type:'Unidade',item:unit.toUpperCase(),order:1};
  return null;
}

function deliveryGroups(){
  const threshold=Math.max(1,+el('staleDays')?.value||3),groups=new Map();
  state.filtered.forEach(r=>{
    const macro=macroProductionGroup(r);if(!macro)return;
    const code=r.__parsed.code||'Sem código',key=`${macro.type}|||${macro.item}|||${code}`;
    if(!groups.has(key))groups.set(key,{...macro,code,cards:0,finished:0,pending:0,stalled:0,issues:0,maxDays:0,stages:new Map(),issueTexts:new Set()});
    const g=groups.get(key);g.cards++;
    const stage=mergedStageName(r);g.stages.set(stage,(g.stages.get(stage)||0)+1);
    if(isFinished(r)){g.finished++;return;}
    g.pending++;
    const cur=currentStageInfo(r);const stale=cur.days!=null&&cur.days>=threshold;
    if(stale)g.stalled++;
    if(cur.days!=null)g.maxDays=Math.max(g.maxDays,cur.days);
    if(cur.issues.length){g.issues++;cur.issues.forEach(x=>g.issueTexts.add(x));}
  });
  return [...groups.values()].map(g=>({...g,completion:g.cards?g.finished/g.cards*100:0,stageDetail:[...g.stages.entries()].sort((a,b)=>b[1]-a[1])})).sort((a,b)=>b.stalled-a.stalled||b.issues-a.issues||a.type.localeCompare(b.type,'pt-BR')||a.item.localeCompare(b.item,'pt-BR',{numeric:true})||a.code.localeCompare(b.code,'pt-BR'));
}

function unitSummaryRows(){
  const groups=new Map();
  state.filtered.forEach(r=>{
    const macro=macroProductionGroup(r);if(!macro)return;const key=`${macro.type}|||${macro.item}`;
    if(!groups.has(key))groups.set(key,{...macro,codes:new Set(),cards:0,active:0,finished:0,hours:0,stages:new Map()});
    const g=groups.get(key);g.cards++;g.hours+=r.__hours||0;if(r.__parsed.code)g.codes.add(r.__parsed.code);if(isFinished(r))g.finished++;else g.active++;
    const stage=mergedStageName(r);g.stages.set(stage,(g.stages.get(stage)||0)+1);
  });
  return [...groups.values()].map(g=>({...g,disciplines:g.codes.size,completion:g.cards?g.finished/g.cards*100:0,stageDetail:[...g.stages.entries()].sort((a,b)=>b[1]-a[1])})).sort((a,b)=>{const na=parseInt(a.item.match(/\d+/)?.[0]||999,10),nb=parseInt(b.item.match(/\d+/)?.[0]||999,10);return na-nb||a.order-b.order;});
}
function macroChartLabel(r){return r.type==='Banco de questões'?`BDQ ${r.item.replace(/^U/i,'')}`:r.item;}
function stageChips(entries){return entries.map(([name,count])=>`<span class="stage-chip ${name==='Finalizados'?'done':''}"><b>${escapeHtml(name)}</b> ${num(count)}</span>`).join('');}


function pipelineRows(){
  const groups=new Map();
  state.filtered.forEach(r=>{
    const macro=macroProductionGroup(r); if(!macro)return;
    const key=`${macro.type}|||${macro.item}`;
    if(!groups.has(key))groups.set(key,{...macro,total:0,finished:0,pending:0,production:0,stages:new Map()});
    const g=groups.get(key); g.total++;
    if(isFinished(r)){g.finished++;return;}
    g.pending++;
    const cur=currentStageInfo(r); if(cur.mode==='Produção')g.production++;
    const stage=clean(cur.list)||'Sem etapa'; g.stages.set(stage,(g.stages.get(stage)||0)+1);
  });
  return [...groups.values()].map(g=>({...g,pct:g.total?g.finished/g.total*100:0,stageDetail:[...g.stages.entries()].sort((a,b)=>b[1]-a[1])})).sort((a,b)=>a.order-b.order||parseInt(a.item.match(/\d+/)?.[0]||999)-parseInt(b.item.match(/\d+/)?.[0]||999));
}
function renderPipeline(){
  const rows=pipelineRows(),total=rows.reduce((s,r)=>s+r.total,0),finished=rows.reduce((s,r)=>s+r.finished,0),pending=rows.reduce((s,r)=>s+r.pending,0),production=rows.reduce((s,r)=>s+r.production,0),complete=rows.filter(r=>r.pending===0).length;
  el('pipeTotal').textContent=num(total);el('pipeFinished').textContent=num(finished);el('pipePending').textContent=num(pending);el('pipeProduction').textContent=num(production);el('pipeComplete').textContent=num(complete);
  el('pipeFinishedHint').textContent=total?`${Math.round(finished/total*100)}% concluído`:'0% concluído';el('pipeCompleteHint').textContent=`${num(complete)} de ${num(rows.length)} frentes`;
  const grid=el('pipelineGrid'); if(!grid)return;
  grid.innerHTML=rows.length?rows.map(r=>{
    const cls=r.type==='Banco de questões'?'bdq':r.type==='Vídeo'?'video':'unit';
    const label=r.type==='Banco de questões'?`BDQ ${r.item}`:r.item;
    const stages=r.stageDetail.length?r.stageDetail.map(([n,c])=>`<span class="pipe-stage"><b>${escapeHtml(n)}</b><em>${num(c)}</em></span>`).join(''):'<span class="pipe-all-done">✓ Todas as tarefas concluídas</span>';
    return `<article class="pipeline-card ${r.pending===0?'complete':''}"><div class="pipe-card-head"><div><span class="macro-type ${cls}">${escapeHtml(r.type)}</span><h3>${escapeHtml(label)}</h3></div><strong>${Math.round(r.pct)}%</strong></div><div class="pipe-progress"><i style="width:${Math.min(100,r.pct)}%"></i></div><div class="pipe-counts"><span><b>${num(r.finished)}</b> finalizadas</span><span><b>${num(r.pending)}</b> pendentes</span><span class="working"><b>${num(r.production)}</b> em produção</span></div><div class="pipe-stage-title">${r.pending?'Onde estão as pendências':'Situação'}</div><div class="pipe-stages">${stages}</div><button class="text-btn pipe-open" data-type="${escapeHtml(r.type)}" data-item="${escapeHtml(r.item)}">Ver cards</button></article>`;
  }).join(''):'<div class="empty">Nenhuma Unidade, Vídeo ou BDQ identificada no recorte atual.</div>';
  grid.querySelectorAll('.pipe-open').forEach(btn=>btn.addEventListener('click',()=>openMacroCards(btn.dataset.type,btn.dataset.item,'')));
}

function openMacroCards(type,item,code=''){
  el('filterCode').value=code&&[...el('filterCode').options].some(o=>o.value===code)?code:'';
  el('filterProduction').value='';
  const unitOpt=[...el('filterUnit').options].find(o=>o.value===item);if(unitOpt)el('filterUnit').value=item;
  if(type==='Banco de questões'){const p=[...el('filterProduction').options].find(o=>o.value==='Banco de questões');if(p)el('filterProduction').value='Banco de questões';}
  applyFilters();
  if(type==='Unidade'){state.filtered=state.filtered.filter(r=>macroProductionGroup(r)?.type==='Unidade');updateAll();}
  if(type==='Vídeo'){state.filtered=state.filtered.filter(r=>macroProductionGroup(r)?.type==='Vídeo');updateAll();}
  switchView('cards');
}

function initProductivityPeriod(){
  const dates=state.data.flatMap(r=>r.__events.flatMap(e=>[e.start,e.end]).filter(Boolean));if(!dates.length)return;
  const max=new Date(Math.max(...dates.map(d=>d.getTime()))),min=new Date(max);min.setDate(min.getDate()-13);
  if(!el('productivityStart').value)el('productivityStart').value=dayKey(min);
  if(!el('productivityEnd').value)el('productivityEnd').value=dayKey(max);
}

function populateProductivityPeople(){
  const container=el('productivityPeople');if(!container)return;
  const current=new Set([...container.querySelectorAll('input:checked')].map(x=>x.value));
  const events=personEvents(state.filtered).filter(e=>e.person),counts=countBy(events,e=>e.person),names=counts.map(x=>x[0]);
  if(!state.peopleInitialized){counts.slice(0,5).forEach(([n])=>current.add(n));state.peopleInitialized=true;}
  container.innerHTML=names.map(n=>`<label class="person-check"><input type="checkbox" value="${escapeHtml(n)}" ${current.has(n)?'checked':''}><span>${escapeHtml(n)}</span></label>`).join('')||'<span class="empty-mini">Sem responsáveis no recorte.</span>';
  container.querySelectorAll('input').forEach(i=>i.addEventListener('change',renderProductivity));
}

function productivityType(event){
  const macro=macroProductionGroup(event.row);
  if(macro) return macro.type;
  const prod=clean(event.row?.__parsed?.production);
  return prod || 'Outros';
}

function productivityDeliveryLabel(event){
  const macro=macroProductionGroup(event.row);
  if(macro){
    if(macro.type==='Banco de questões') return `BDQ ${macro.item}`;
    return macro.item;
  }
  const prod=clean(event.row?.__parsed?.production);
  return prod || 'Outros';
}

function renderProductivity(){
  populateProductivityPeople();
  setTimeout(()=>{if(!el('availPanel').hidden)renderAvail();},0);
  const selected=[...el('productivityPeople').querySelectorAll('input:checked')].map(x=>x.value);
  const start=el('productivityStart').value?new Date(el('productivityStart').value+'T00:00:00'):null;
  const end=el('productivityEnd').value?new Date(el('productivityEnd').value+'T23:59:59.999'):null;
  const events=personEvents(state.filtered).filter(e=>e.person&&(!selected.length||selected.includes(e.person)));
  const completed=events.filter(e=>e.end&&(!start||e.end>=start)&&(!end||e.end<=end));
  const active=events.filter(e=>e.start&&!e.end&&(!selected.length||selected.includes(e.person)));
  const days=unique(completed.map(e=>dayKey(e.end)));
  const hours=completed.filter(e=>Number.isFinite(e.hours)).reduce((sum,e)=>sum+e.hours,0);
  state.prodCompleted=completed;
  el('prodCompleted').textContent=num(completed.length);
  el('prodPerDay').textContent=days.length?(completed.length/days.length).toFixed(1).replace('.',','):'0';
  el('prodHours').textContent=fmtHours(hours);
  el('prodPeopleCount').textContent=num(selected.length||unique(events.map(e=>e.person)).length);

  const people=selected.length?selected:countBy(completed,e=>e.person).slice(0,5).map(x=>x[0]);
  const allDays=[];
  if(start&&end){
    for(let d=new Date(start);d<=end;d.setDate(d.getDate()+1)) allDays.push(dayKey(d));
  }else{
    allDays.push(...unique(completed.map(e=>dayKey(e.end))));
  }
  const colors=palette(people.length);
  createChart('chartProductivityDaily',{
    type:'line',
    data:{
      labels:allDays.map(k=>fmtShortDate(new Date(k+'T12:00:00'))),
      datasets:people.map((p,i)=>({
        label:p,
        data:allDays.map(k=>completed.filter(e=>e.person===p&&dayKey(e.end)===k).length),
        borderColor:colors[i],backgroundColor:colors[i],tension:.2,pointRadius:4,pointHoverRadius:5,borderWidth:3
      }))
    },
    options:{
      ...chartDefaults,
      layout:{padding:{top:34,right:38,bottom:4,left:4}},
      plugins:{
        legend:{display:true,position:'bottom',labels:{boxWidth:9,usePointStyle:true,font:{size:11,weight:'600'}}},
        tooltip:{mode:'index',intersect:false},
        datalabels:{
          display:ctx=>Number(ctx.dataset.data[ctx.dataIndex])>0,
          color:'#343842',backgroundColor:'rgba(255,255,255,.94)',borderColor:'#d9dbe1',borderWidth:1,borderRadius:5,
          anchor:'end',align:'top',offset:6,clamp:true,clip:false,padding:{top:3,bottom:3,left:5,right:5},
          font:{size:12,weight:'800'},
          formatter:v=>num(Number(v)||0)
        }
      },
      scales:{
        x:{grid:{display:false},ticks:{color:'#777b86',font:{size:11}}},
        y:{beginAtZero:true,grid:{color:'#eeeeF1'},ticks:{color:'#777b86',font:{size:11},precision:0}}
      }
    }
  });

  const deliveryCounts=countBy(completed,productivityDeliveryLabel);
  createChart('chartProductivityStages',{
    type:'bar',
    data:{labels:deliveryCounts.map(x=>x[0]),datasets:[{data:deliveryCounts.map(x=>x[1]),backgroundColor:ACCENT,borderRadius:5}]},
    options:{...chartDefaults,indexAxis:'y',layout:{padding:{top:12,right:54}},plugins:{...chartDefaults.plugins,datalabels:{...chartDefaults.plugins.datalabels,font:{size:12,weight:'800'},offset:5}},scales:{x:{beginAtZero:true,grid:{color:'#eeeeF1'},ticks:{precision:0,font:{size:10}}},y:{grid:{display:false},ticks:{font:{size:11,weight:'600'}}}}}
  });

  const typeCounts=countBy(completed,productivityType);
  createChart('chartProductivityTypes',{
    type:'bar',
    data:{labels:typeCounts.map(x=>x[0]),datasets:[{data:typeCounts.map(x=>x[1]),backgroundColor:'#5c6bc0',borderRadius:5}]},
    options:{...chartDefaults,indexAxis:'y',layout:{padding:{top:12,right:44}},scales:{x:{beginAtZero:true,grid:{color:'#eeeeF1'},ticks:{precision:0,font:{size:10}}},y:{grid:{display:false},ticks:{font:{size:10}}}}}
  });

  const rows=people.map(p=>{
    const pe=completed.filter(e=>e.person===p),d=new Set(pe.map(e=>dayKey(e.end))).size,h=pe.filter(e=>Number.isFinite(e.hours)).reduce((sum,e)=>sum+e.hours,0),now=active.filter(e=>e.person===p).length;
    return {p,count:pe.length,days:d,avg:d?pe.length/d:0,h,now};
  }).sort((a,b)=>b.count-a.count);
  el('productivityTableBody').innerHTML=rows.length?rows.map(r=>`<tr><td><strong>${escapeHtml(r.p)}</strong></td><td>${num(r.count)}</td><td>${num(r.days)}</td><td>${r.avg.toFixed(1).replace('.',',')}</td><td>${fmtHours(r.h)}</td><td>${num(r.now)}</td></tr>`).join(''):'<tr><td class="empty" colspan="6">Selecione pessoas ou um período com entregas.</td></tr>';

  const detail=[...completed].sort((a,b)=>(b.end?.getTime()||0)-(a.end?.getTime()||0));
  el('productivityDetailCount').textContent=`${num(detail.length)} conclusões no período`;
  el('productivityDetailBody').innerHTML=detail.length?detail.slice(0,500).map(e=>{
    const macro=macroProductionGroup(e.row);
    const item=macro?.item||clean(e.row?.__parsed?.unit)||'—';
    const card=clean(e.row?.['Card Name'])||'—';
    return `<tr><td>${fmtDate(e.end)}</td><td><strong>${escapeHtml(e.person)}</strong></td><td><span class="completion-stage">${escapeHtml(e.label)}</span></td><td>${escapeHtml(productivityType(e))}</td><td>${lvlBadge(e.row)}</td><td>${escapeHtml(item)}</td><td>${escapeHtml(e.row?.__parsed?.code||'—')}</td><td><span class="detail-card-name" title="${escapeHtml(card)}">${cardLink(e.row)}</span></td><td>${e.hours==null?'—':fmtHours(e.hours)}</td></tr>`;
  }).join(''):'<tr><td class="empty" colspan="9">Nenhuma conclusão encontrada no período selecionado.</td></tr>';
}

function statusClass(s){return s==='Finalizado'?'finished':s==='Arquivado'?'archived':'active';}
function renderTable(){
  const pageSize=+el('pageSize').value||25;state.pageSize=pageSize;const total=state.filtered.length,pages=Math.max(1,Math.ceil(total/pageSize));if(state.page>pages)state.page=pages;const start=(state.page-1)*pageSize,rows=state.filtered.slice(start,start+pageSize);el('tableCount').textContent=`${num(total)} registros encontrados`;
  el('cardsTableBody').innerHTML=rows.length?rows.map(r=>`<tr><td><span class="status-pill ${statusClass(r.__rawStatus)}">${escapeHtml(r.__rawStatus)}</span></td><td><div class="card-name" data-index="${state.data.indexOf(r)}">${escapeHtml(r['Card Name'])}</div></td><td>${escapeHtml(r.__parsed.code||'—')} ${lvlBadge(r)}</td><td>${escapeHtml(r['List Name']||'—')}</td><td><div class="tags">${r.__people.slice(0,3).map(p=>`<span class="tag">${escapeHtml(p)}</span>`).join('')}${r.__people.length>3?`<span class="tag">+${r.__people.length-3}</span>`:''}</div></td><td><div class="tags">${r.__labels.slice(0,2).map(t=>`<span class="tag">${escapeHtml(t.replace(/\s*\([^)]*\)\s*$/,''))}</span>`).join('')}</div></td><td>${fmtDate(r.__activityDate)}</td><td>${clean(r['Card URL'])?`<a class="trello-link" target="_blank" rel="noopener" href="${escapeHtml(r['Card URL'])}">Abrir ↗</a>`:'—'}</td></tr>`).join(''):'<tr><td class="empty" colspan="8">Nenhum card encontrado com esses filtros.</td></tr>';
  el('pageInfo').textContent=`Página ${state.page} de ${pages}`;el('prevPage').disabled=state.page<=1;el('nextPage').disabled=state.page>=pages;document.querySelectorAll('.card-name[data-index]').forEach(n=>n.addEventListener('click',()=>openCard(state.data[+n.dataset.index])));
}

function openCard(r){
  el('modalStatus').textContent=`${r.__rawStatus} · ${r['List Name']||'Sem etapa'}`;el('modalTitle').textContent=r['Card Name']||'Card';
  const c=currentStageInfo(r);const meta=[['Código',r.__parsed.code||'—'],['Produto',r.__parsed.product||'—'],['Unidade/Vídeo',r.__parsed.unit||'—'],['Produção',r.__parsed.production||'—'],['Área',r.__area],['Etapa operacional',`${c.list} · ${c.mode}`],['Última modificação',fmtDate(r.__activityDate)],['Minutos registrados',fmtHours(r.__hours)],['Responsáveis',r.__people.join(', ')||'—']];
  el('modalMeta').innerHTML=meta.map(([k,v])=>`<div class="meta-item"><span>${escapeHtml(k)}</span><strong>${escapeHtml(v)}</strong></div>`).join('');
  el('modalLabels').innerHTML=r.__labels.length?r.__labels.map(x=>`<span class="tag">${escapeHtml(x)}</span>`).join(''):'<span class="tag">Sem etiquetas</span>';
  el('modalTimeline').innerHTML=r.__events.length?r.__events.sort((a,b)=>(a.start?.getTime()||0)-(b.start?.getTime()||0)).map(e=>`<div class="timeline-step"><strong>${escapeHtml(e.label)}</strong><b>${e.hours==null?'—':fmtHours(e.hours)}</b><span>${e.start?fmtDate(e.start):'Sem início'} → ${e.end?fmtDate(e.end):'Em andamento'}</span><span>${escapeHtml(e.person||'Sem responsável')}</span></div>`).join(''):'<div class="empty">Sem histórico de etapas.</div>';
  el('modalDescription').textContent=clean(r['Card Description'])||'Sem descrição informada.';el('modalTrello').href=clean(r['Card URL'])||'#';el('modalTrello').style.display=clean(r['Card URL'])?'inline-flex':'none';el('cardModal').showModal();
}


function productivityExportSnapshot(){
  const selected=[...el('productivityPeople').querySelectorAll('input:checked')].map(x=>x.value);
  const start=el('productivityStart').value?new Date(el('productivityStart').value+'T00:00:00'):null;
  const end=el('productivityEnd').value?new Date(el('productivityEnd').value+'T23:59:59.999'):null;
  const events=personEvents(state.filtered).filter(e=>e.person&&(!selected.length||selected.includes(e.person)));
  const completed=events.filter(e=>e.end&&(!start||e.end>=start)&&(!end||e.end<=end));
  const active=events.filter(e=>e.start&&!e.end);
  const people=selected.length?selected:unique(completed.map(e=>e.person));
  const days=unique(completed.map(e=>dayKey(e.end)));
  const hours=completed.filter(e=>Number.isFinite(e.hours)).reduce((sum,e)=>sum+e.hours,0);
  const delivery=countBy(completed,productivityDeliveryLabel);
  const types=countBy(completed,productivityType);
  const daily=countBy(completed,e=>dayKey(e.end)).sort((a,b)=>a[0].localeCompare(b[0]));
  const peak=daily.reduce((best,x)=>!best||x[1]>best[1]?x:best,null);
  return {selected,people,start,end,completed,active,days,hours,delivery,types,daily,peak};
}
function exportProductivityData(){
  const x=productivityExportSnapshot();
  if(!x.completed.length)return showToast('Nenhuma conclusão no período para exportar');
  const rows=x.completed.sort((a,b)=>(a.end?.getTime()||0)-(b.end?.getTime()||0)).map(e=>{
    const macro=macroProductionGroup(e.row),item=macro?.item||clean(e.row?.__parsed?.unit)||'';
    return {'Data':fmtDate(e.end),'Pessoa':e.person,'Etapa concluída':e.label,'Tipo':productivityType(e),'Nível':e.row?.__parsed?.level||'','Unidade/Vídeo/BDQ':productivityDeliveryLabel(e),'Item':item,'Código':e.row?.__parsed?.code||'','Card':clean(e.row?.['Card Name']),'Minutos':e.hours==null?'':Math.round(e.hours*60)};
  });
  downloadCsv(rows,`produtividade_${(x.people.join('_')||'equipe').replace(/[^a-z0-9_-]+/gi,'_')}_${el('productivityStart').value||'inicio'}_${el('productivityEnd').value||'fim'}.csv`);
}
function rr(ctx,x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke()}}
function canvasText(ctx,text,x,y,size=24,weight='400',color='#17191f',align='left'){ctx.fillStyle=color;ctx.font=`${weight} ${size}px Inter, Arial, sans-serif`;ctx.textAlign=align;ctx.textBaseline='alphabetic';ctx.fillText(String(text),x,y)}
function drawWrapped(ctx,text,x,y,maxWidth,lineHeight,maxLines=2){const words=String(text).split(/\s+/);let line='',lines=[];for(const word of words){const test=line?line+' '+word:word;if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=word}else line=test}if(line)lines.push(line);lines=lines.slice(0,maxLines);lines.forEach((l,i)=>ctx.fillText(l,x,y+i*lineHeight));return lines.length;}
function exportProductivitySlide(){
  const x=productivityExportSnapshot();
  if(!x.completed.length)return showToast('Nenhuma conclusão no período para gerar o slide');
  const c=document.createElement('canvas');c.width=1920;c.height=1080;const ctx=c.getContext('2d');
  ctx.fillStyle='#f5f6f8';ctx.fillRect(0,0,c.width,c.height);
  ctx.fillStyle='#292a2f';ctx.fillRect(0,0,1920,132);ctx.fillStyle=ACCENT;ctx.fillRect(0,0,16,132);
  const who=x.people.length===1?x.people[0]:x.people.length<=3?x.people.join(' · '):`${x.people.length} pessoas selecionadas`;
  canvasText(ctx,'PRODUTIVIDADE',58,48,22,'800','#f0b1c9');canvasText(ctx,who,58,101,46,'800','#ffffff');
  const period=`${x.start?fmtDate(x.start):'Início'} a ${x.end?fmtDate(x.end):'Fim'}`;canvasText(ctx,period,1850,82,27,'800','#ffffff','right');
  const activeDays=x.days.length,avg=activeDays?x.completed.length/activeDays:0;
  const kpis=[['CONCLUSÕES',num(x.completed.length)],['MÉDIA / DIA',avg.toFixed(1).replace('.',',')],['DIAS ATIVOS',num(activeDays)],['MINUTOS',fmtHours(x.hours)],['EM PRODUÇÃO',num(x.active.length)]];
  const gap=20,kw=(1804-gap*4)/5;kpis.forEach((k,i)=>{const xx=58+i*(kw+gap);rr(ctx,xx,158,kw,132,18,'#ffffff','#d8dbe2');canvasText(ctx,k[0],xx+22,198,18,'800','#6d7280');canvasText(ctx,k[1],xx+22,258,43,'800','#17191f')});
  rr(ctx,58,314,1160,432,18,'#ffffff','#d8dbe2');canvasText(ctx,'Produção diária',88,360,30,'800');canvasText(ctx,'Conclusões no período selecionado',88,392,19,'600','#6d7280');
  const dailyCanvas=el('chartProductivityDaily');if(dailyCanvas)ctx.drawImage(dailyCanvas,84,410,1104,310);
  rr(ctx,1240,314,622,432,18,'#ffffff','#d8dbe2');canvasText(ctx,'Entregas concluídas',1272,360,30,'800');
  const top=x.delivery.slice(0,6),max=Math.max(1,...top.map(v=>v[1]));top.forEach(([name,val],i)=>{const yy=418+i*52;ctx.font='800 21px Inter, Arial, sans-serif';ctx.fillStyle='#30343d';let label=String(name);while(ctx.measureText(label).width>245&&label.length>5)label=label.slice(0,-1);if(label!==String(name))label=label.slice(0,-1)+'…';canvasText(ctx,label,1272,yy,21,'800','#30343d');ctx.fillStyle='#e8eaf0';ctx.fillRect(1535,yy-19,230,18);ctx.fillStyle=ACCENT;ctx.fillRect(1535,yy-19,230*(val/max),18);canvasText(ctx,num(val),1830,yy,23,'800','#17191f','right')});
  rr(ctx,58,770,1804,238,18,'#ffffff','#d8dbe2');canvasText(ctx,'Destaques do período',88,816,29,'800');
  const topType=x.types[0],topDelivery=x.delivery[0],peak=x.peak;
  const highlights=[
    `${num(x.completed.length)} conclusões em ${num(activeDays)} dia${activeDays===1?'':'s'} com entrega.`,
    topDelivery?`${topDelivery[0]}: ${num(topDelivery[1])} conclusões.`:'',
    topType?`${topType[0]}: ${num(topType[1])} conclusões no período.`:'',
    peak?`Pico em ${fmtShortDate(new Date(peak[0]+'T12:00:00'))}: ${num(peak[1])} conclusões.`:''
  ].filter(Boolean);
  highlights.forEach((t,i)=>{const col=i%2,row=Math.floor(i/2),xx=88+col*870,yy=866+row*66;ctx.fillStyle=ACCENT;ctx.beginPath();ctx.arc(xx,yy-8,7,0,Math.PI*2);ctx.fill();ctx.font='700 24px Inter, Arial, sans-serif';ctx.fillStyle='#30343d';drawWrapped(ctx,t,xx+24,yy,790,30,2)});
  canvasText(ctx,`Base: ${el('sidebarFileName').textContent||'dados.csv'} · ${el('lastUpdate').textContent||''}`,58,1052,16,'600','#6d7280');canvasText(ctx,'Ensino Digital · Painel de produção',1862,1052,16,'700','#6d7280','right');
  c.toBlob(blob=>{if(!blob)return showToast('Não foi possível gerar a imagem');const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`produtividade_${(who||'equipe').replace(/[^a-z0-9_-]+/gi,'_')}_${el('productivityStart').value||'inicio'}_${el('productivityEnd').value||'fim'}.png`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);showToast('Slide 16:9 exportado em PNG com leitura ampliada');},'image/png');
}
function resetFilters(){['filterSearch','filterStatus','filterArea','filterStage','filterResponsible','filterLabel','filterLevel','filterBoard','filterProduct','filterUnit','filterProduction','filterCode','filterStart','filterEnd'].forEach(id=>el(id).value='');applyFilters();}
function downloadCsv(rows,name){const csv=Papa.unparse(rows),blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();URL.revokeObjectURL(a.href);}
function exportFiltered(){if(!state.filtered.length)return showToast('Nenhum registro para exportar');const rows=state.filtered.map(r=>{const o={};Object.keys(state.raw[0]||{}).forEach(k=>o[k]=r[k]);return o;});downloadCsv(rows,'cards_filtrados.csv');}
function showToast(msg){const t=el('toast');t.textContent=msg;t.classList.add('show');clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>t.classList.remove('show'),2500);}


// ==============================
// OPERAÇÕES / MICROSOFT PLANNER
// ==============================
const OPS_TASK_URL='https://planner.cloud.microsoft/webui/plan/{plan}/view/board/task/{task}'; // ajuste aqui se o padrão de link do seu tenant for outro
const opsState={planId:'',data:[],filteredBase:[],fileName:'',exportDate:null,page:1,pageSize:25};
const opsClean=v=>(v==null?'':String(v)).trim();
const opsNorm=v=>opsClean(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();
const opsTruthy=v=>['true','1','sim','yes'].includes(opsClean(v).toLowerCase());
function opsParseDate(v){if(!v)return null;if(v instanceof Date&&!Number.isNaN(v.getTime()))return v;const x=String(v).trim();let m=x.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?/);if(m)return new Date(+m[1],+m[2]-1,+m[3],+(m[4]||12),+(m[5]||0),+(m[6]||0));const d=new Date(v);return Number.isNaN(d.getTime())?null:d;}
function opsDateInput(d){if(!d)return'';return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
function opsFmtDate(v){const d=opsParseDate(v);return d?d.toLocaleDateString('pt-BR'):'—';}
function opsPeople(v){return opsClean(v).split(';').map(x=>x.trim()).filter(Boolean);}
function opsExtractDemand(v){const x=opsClean(v);if(!x)return'Sem classificação';const i=x.indexOf('|');if(i<0)return'Sem classificação';const d=x.slice(i+1).trim();return d||'Sem classificação';}
function opsIsDone(r){return /CONCLUIDA|CONCLUIDO/.test(opsNorm(r.Status));}
function opsIsLate(r){return opsTruthy(r.Atrasados)&&!opsIsDone(r);}
function opsDoneDate(r){return opsParseDate(r['Concluído em']||r['Data de conclusão']);}
function opsCreatedDate(r){return opsParseDate(r['Criado em']);}
function opsTaskUrl(id){id=opsClean(id);return id&&opsState.planId?OPS_TASK_URL.replace('{plan}',encodeURIComponent(opsState.planId)).replace('{task}',encodeURIComponent(id)):'';}
function opsLink(r){return r.__url?`<a class="open-link" href="${escapeHtml(r.__url)}" target="_blank" rel="noopener">Abrir ↗</a>`:'—';}
function opsEnrich(r){return {...r,__url:opsTaskUrl(r['Identificação da tarefa']),__done:opsIsDone(r),__late:opsIsLate(r),__created:opsCreatedDate(r),__doneDate:opsDoneDate(r),__people:opsPeople(r['Atribuído a']),__completedBy:opsPeople(r['Concluída por']),__demand:opsExtractDemand(r['Nome da tarefa'])};}
function opsSetOptions(id,values,placeholder){const sel=el(id);if(!sel)return;const cur=sel.value;sel.innerHTML=`<option value="">${placeholder}</option>`+unique(values).map(v=>`<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`).join('');if([...sel.options].some(o=>o.value===cur))sel.value=cur;}
function opsPopulateFilters(){opsSetOptions('opsCategory',opsState.data.map(r=>r.Categoria),'Todas');opsSetOptions('opsDemand',opsState.data.map(r=>r.__demand),'Todas');opsSetOptions('opsStatus',opsState.data.map(r=>r.Status),'Todos');opsSetOptions('opsResponsible',opsState.data.flatMap(r=>[...r.__people,...r.__completedBy]),'Todos');opsSetOptions('opsPriority',opsState.data.map(r=>r.Prioridade),'Todas');}
function opsSetDefaultPeriod(){el('opsStart').value='';el('opsEnd').value='';}
function opsFilters(){return{search:opsNorm(el('opsSearch').value),category:el('opsCategory').value,demand:el('opsDemand').value,status:el('opsStatus').value,responsible:el('opsResponsible').value,priority:el('opsPriority').value,start:opsParseDate(el('opsStart').value),end:opsParseDate(el('opsEnd').value)};}
function opsMatchBase(r,f){if(f.search){const hay=opsNorm([r['Nome da tarefa'],r.Categoria,r['Atribuído a'],r.Notas,r.Rótulos].join(' '));if(!hay.includes(f.search))return false;}if(f.category&&r.Categoria!==f.category)return false;if(f.demand&&r.__demand!==f.demand)return false;if(f.status&&r.Status!==f.status)return false;if(f.priority&&r.Prioridade!==f.priority)return false;if(f.responsible&&![...r.__people,...r.__completedBy].some(p=>opsNorm(p)===opsNorm(f.responsible)))return false;return true;}
function opsInPeriod(d,f){if(!d)return false;const x=new Date(d.getFullYear(),d.getMonth(),d.getDate());if(f.start){const a=new Date(f.start.getFullYear(),f.start.getMonth(),f.start.getDate());if(x<a)return false;}if(f.end){const b=new Date(f.end.getFullYear(),f.end.getMonth(),f.end.getDate());if(x>b)return false;}return true;}
function opsRowInSelectedPeriod(r,f){if(!f.start&&!f.end)return true;return opsInPeriod(r.__created,f)||opsInPeriod(r.__doneDate,f);}
function opsPeriodLabel(f){if(!f.start&&!f.end)return'Todas as datas';if(f.start&&!f.end)return`Desde ${opsFmtDate(f.start)}`;if(!f.start&&f.end)return`Até ${opsFmtDate(f.end)}`;return`${opsFmtDate(f.start)} a ${opsFmtDate(f.end)}`;}
function opsApplyFilters(){if(!opsState.data.length)return;const f=opsFilters();opsState.filteredBase=opsState.data.filter(r=>opsMatchBase(r,f));opsState.page=1;opsRenderAll();}
function opsRenderAll(){opsRenderSummary();opsRenderOverviewCharts();opsRenderDemandAnalysis();opsRenderOpenTable();opsRenderProductivity();opsRenderProdExtra();opsRenderTasksTable();}
function opsCountBy(arr,getter){const m=new Map();arr.forEach(x=>{const k=getter(x)||'Sem informação';m.set(k,(m.get(k)||0)+1)});return [...m.entries()].sort((a,b)=>b[1]-a[1]);}
function opsRenderSummary(){const f=opsFilters(),base=opsState.filteredBase;const open=base.filter(r=>!r.__done),created=base.filter(r=>opsInPeriod(r.__created,f)),done=base.filter(r=>r.__done&&opsInPeriod(r.__doneDate,f));const unassigned=open.filter(r=>!r.__people.length),late=open.filter(r=>r.__late);el('opsKpiOpen').textContent=num(open.length);el('opsKpiUnassigned').textContent=num(unassigned.length);el('opsKpiLate').textContent=num(late.length);el('opsKpiCreated').textContent=num(created.length);el('opsKpiDone').textContent=num(done.length);const bal=created.length-done.length;el('opsKpiBalance').textContent=`${bal>0?'+':''}${num(bal)}`;el('opsKpiBalance').style.color=bal>0?'var(--danger)':bal<0?'var(--success)':'';el('opsKpiCreatedHint').textContent=opsPeriodLabel(f);el('opsKpiDoneHint').textContent=opsPeriodLabel(f);el('opsFilterSummary').textContent=`${num(base.length)} tarefas no recorte · ${opsPeriodLabel(f)}`;el('opsFlowSubtitle').textContent=`Movimentação diária · ${opsPeriodLabel(f)}`;}
function opsRenderOverviewCharts(){const f=opsFilters(),base=opsState.filteredBase,open=base.filter(r=>!r.__done);const buckets=opsCountBy(open,r=>r.Categoria);createChart('opsChartBuckets',{type:'bar',data:{labels:buckets.map(x=>x[0]),datasets:[{data:buckets.map(x=>x[1]),backgroundColor:ACCENT,borderRadius:5}]},options:{...chartDefaults,indexAxis:'y',scales:{x:{beginAtZero:true,grid:{color:'#eee'},ticks:{precision:0}},y:{grid:{display:false}}}}});const people=opsCountBy(open.flatMap(r=>r.__people.length?r.__people.map(p=>({p})):[]),x=>x.p);createChart('opsChartWorkload',{type:'bar',data:{labels:people.map(x=>x[0]),datasets:[{data:people.map(x=>x[1]),backgroundColor:'#5c6bc0',borderRadius:5}]},options:{...chartDefaults,indexAxis:'y',scales:{x:{beginAtZero:true},y:{grid:{display:false}}}}});let start=f.start,end=f.end;if(!start||!end){const allDates=base.flatMap(r=>[r.__created,r.__doneDate]).filter(Boolean).sort((a,b)=>a-b);if(!start)start=allDates[0]||opsState.exportDate||new Date();if(!end)end=allDates[allDates.length-1]||opsState.exportDate||new Date();}const days=[];for(let d=new Date(start.getFullYear(),start.getMonth(),start.getDate());d<=end;d.setDate(d.getDate()+1))days.push(dayKey(d));const createdMap=new Map(days.map(k=>[k,0])),doneMap=new Map(days.map(k=>[k,0]));base.forEach(r=>{if(r.__created&&opsInPeriod(r.__created,{start,end}))createdMap.set(dayKey(r.__created),(createdMap.get(dayKey(r.__created))||0)+1);if(r.__doneDate&&opsInPeriod(r.__doneDate,{start,end}))doneMap.set(dayKey(r.__doneDate),(doneMap.get(dayKey(r.__doneDate))||0)+1);});createChart('opsChartFlow',{type:'line',data:{labels:days.map(k=>fmtShortDate(new Date(k+'T12:00:00'))),datasets:[{label:'Entradas',data:days.map(k=>createdMap.get(k)||0),borderColor:ACCENT,backgroundColor:'rgba(213,24,98,.08)',tension:.25,pointRadius:2},{label:'Finalizadas',data:days.map(k=>doneMap.get(k)||0),borderColor:'#2f9e67',backgroundColor:'rgba(47,158,103,.08)',tension:.25,pointRadius:2}]},options:{...chartDefaults,plugins:{...chartDefaults.plugins,legend:{display:true,position:'bottom'}}}});}
function opsRenderDemandAnalysis(){
  const f=opsFilters(),base=opsState.filteredBase.filter(r=>opsRowInSelectedPeriod(r,f));
  const totals=opsCountBy(base,r=>r.__demand);
  const opens=opsCountBy(base.filter(r=>!r.__done),r=>r.__demand);
  const topTotals=totals.slice(0,20),topOpen=opens.slice(0,15);
  createChart('opsChartDemandTypes',{type:'bar',data:{labels:topTotals.map(x=>x[0]),datasets:[{data:topTotals.map(x=>x[1]),backgroundColor:ACCENT,borderRadius:5}]},options:{...chartDefaults,indexAxis:'y',scales:{x:{beginAtZero:true,ticks:{precision:0}},y:{grid:{display:false}}}}});
  createChart('opsChartDemandOpen',{type:'bar',data:{labels:topOpen.map(x=>x[0]),datasets:[{data:topOpen.map(x=>x[1]),backgroundColor:'#f59f45',borderRadius:5}]},options:{...chartDefaults,indexAxis:'y',scales:{x:{beginAtZero:true,ticks:{precision:0}},y:{grid:{display:false}}}}});
  const map=new Map();
  base.forEach(r=>{const k=r.__demand||'Sem classificação';if(!map.has(k))map.set(k,{name:k,total:0,open:0,done:0,people:new Map()});const z=map.get(k);z.total++;if(r.__done)z.done++;else z.open++;const ppl=r.__done?(opsPeople(r['Concluída por']).length?opsPeople(r['Concluída por']):r.__people):(r.__people.length?r.__people:['Sem responsável']);(ppl.length?ppl:['Sem responsável']).forEach(p=>z.people.set(p,(z.people.get(p)||0)+1));});
  const rows=[...map.values()].filter(r=>r.name!=='Sem classificação' && /[A-Za-zÀ-ÖØ-öø-ÿ]/.test(r.name)).sort((a,b)=>b.total-a.total);
  el('opsDemandPeopleBody').innerHTML=rows.length?rows.slice(0,100).map(r=>{const ppl=[...r.people.entries()].sort((a,b)=>b[1]-a[1]).slice(0,4).map(([p,n])=>`${escapeHtml(p)} <strong>${num(n)}</strong>`).join(' · ');return `<tr><td><strong>${escapeHtml(r.name)}</strong></td><td>${num(r.total)}</td><td>${num(r.open)}</td><td>${num(r.done)}</td><td>${ppl||'—'}</td></tr>`;}).join(''):'<tr><td colspan="5" class="empty">Nenhuma demanda com nome identificada neste recorte.</td></tr>';
}
function opsStatusBadge(r){if(r.__done)return'<span class="ops-badge done">Concluída</span>';if(r.__late)return'<span class="ops-badge late">Atrasada</span>';return'<span class="ops-badge open">Aberta</span>';}
function opsRenderOpenTable(){const rows=opsState.filteredBase.filter(r=>!r.__done).sort((a,b)=>(b.__late-a.__late)||((b.__created?.getTime()||0)-(a.__created?.getTime()||0)));el('opsOpenCount').textContent=`${num(rows.length)} demandas abertas`;el('opsOpenTableBody').innerHTML=rows.length?rows.slice(0,100).map(r=>`<tr><td>${opsStatusBadge(r)}</td><td><strong>${escapeHtml(r['Nome da tarefa'])}</strong></td><td><strong>${escapeHtml(r.__demand)}</strong></td><td>${escapeHtml(r.Categoria||'—')}</td><td>${escapeHtml(r['Atribuído a']||'Sem responsável')}</td><td>${escapeHtml(r.Prioridade||'—')}</td><td>${opsFmtDate(r.__created)}</td><td>${r.__late?'<span class="ops-badge late">Sim</span>':'<span class="ops-badge ok">Não</span>'}</td><td>${opsLink(r)}</td></tr>`).join(''):'<tr><td colspan="9" class="empty">Nenhuma demanda aberta neste recorte.</td></tr>';}
function opsRenderProductivity(){const f=opsFilters(),base=opsState.filteredBase,done=base.filter(r=>r.__done&&opsInPeriod(r.__doneDate,f));const personMap=new Map();done.forEach(r=>{const who=opsPeople(r['Concluída por']).length?opsPeople(r['Concluída por']):r.__people.length?r.__people:['Sem responsável'];who.forEach(p=>{if(!personMap.has(p))personMap.set(p,{name:p,done:0,days:new Set(),open:0,late:0});const z=personMap.get(p);z.done++;if(r.__doneDate)z.days.add(dayKey(r.__doneDate));});});const currentOpen=base.filter(r=>!r.__done);currentOpen.forEach(r=>(r.__people.length?r.__people:['Sem responsável']).forEach(p=>{if(!personMap.has(p))personMap.set(p,{name:p,done:0,days:new Set(),open:0,late:0});const z=personMap.get(p);z.open++;if(r.__late)z.late++;}));const rows=[...personMap.values()].sort((a,b)=>b.done-a.done);const activeDays=new Set(done.map(r=>dayKey(r.__doneDate)).filter(Boolean));el('opsProdDone').textContent=num(done.length);el('opsProdPeople').textContent=num(rows.filter(r=>r.done>0).length);el('opsProdAvg').textContent=(activeDays.size?done.length/activeDays.size:0).toFixed(1).replace('.',',');const top=rows[0];el('opsProdTop').textContent=top?.name||'—';el('opsProdTopHint').textContent=top?`${num(top.done)} conclusões`:'0 conclusões';createChart('opsChartPeopleDone',{type:'bar',data:{labels:rows.filter(r=>r.done>0).map(r=>r.name),datasets:[{data:rows.filter(r=>r.done>0).map(r=>r.done),backgroundColor:ACCENT,borderRadius:5}]},options:{...chartDefaults,indexAxis:'y',scales:{x:{beginAtZero:true},y:{grid:{display:false}}}}});const cats=opsCountBy(done,r=>r.Categoria);createChart('opsChartDoneCategory',{type:'bar',data:{labels:cats.map(x=>x[0]),datasets:[{data:cats.map(x=>x[1]),backgroundColor:'#5c6bc0',borderRadius:5}]},options:{...chartDefaults,indexAxis:'y'}});const daysMap=new Map();done.forEach(r=>{const k=dayKey(r.__doneDate);if(k)daysMap.set(k,(daysMap.get(k)||0)+1)});const daily=[...daysMap.entries()].sort((a,b)=>a[0].localeCompare(b[0]));createChart('opsChartDailyDone',{type:'line',data:{labels:daily.map(x=>fmtShortDate(new Date(x[0]+'T12:00:00'))),datasets:[{data:daily.map(x=>x[1]),borderColor:ACCENT,backgroundColor:'rgba(213,24,98,.08)',fill:true,tension:.25,pointRadius:3}]},options:{...chartDefaults}});el('opsPeopleTableBody').innerHTML=rows.length?rows.map(r=>`<tr><td class="ops-person">${escapeHtml(r.name)}</td><td>${num(r.done)}</td><td>${num(r.days.size)}</td><td>${(r.days.size?r.done/r.days.size:0).toFixed(1).replace('.',',')}</td><td>${num(r.open)}</td><td>${num(r.late)}</td></tr>`).join(''):'<tr><td colspan="6" class="empty">Sem dados no período.</td></tr>';}
function opsRenderProdExtra(){const f=opsFilters(),done=opsState.filteredBase.filter(r=>r.__done&&opsInPeriod(r.__doneDate,f)).sort((a,b)=>(b.__doneDate?.getTime()||0)-(a.__doneDate?.getTime()||0));const d=opsCountBy(done,r=>r.__demand).slice(0,15);createChart('opsChartDoneDemand',{type:'bar',data:{labels:d.map(x=>x[0]),datasets:[{data:d.map(x=>x[1]),backgroundColor:'#2f9e67',borderRadius:5}]},options:{...chartDefaults,indexAxis:'y'}});el('opsProdDetailCount').textContent=`${num(done.length)} conclusões · ${opsPeriodLabel(f)}`;el('opsProdDetailBody').innerHTML=done.length?done.slice(0,300).map(r=>`<tr><td>${opsFmtDate(r.__doneDate)}</td><td><strong>${escapeHtml(opsClean(r['Concluída por'])||r['Atribuído a']||'—')}</strong></td><td>${escapeHtml(r['Nome da tarefa'])}</td><td>${escapeHtml(r.__demand)}</td><td>${escapeHtml(r.Categoria||'—')}</td><td>${opsLink(r)}</td></tr>`).join(''):'<tr><td colspan="6" class="empty">Sem conclusões no período.</td></tr>';}
function opsRenderTasksTable(){const rows=opsState.filteredBase,ps=+(el('opsPageSize')?.value||25),pages=Math.max(1,Math.ceil(rows.length/ps));opsState.page=Math.min(Math.max(1,opsState.page),pages);const start=(opsState.page-1)*ps,part=rows.slice(start,start+ps);el('opsTasksCount').textContent=`${num(rows.length)} registros`;el('opsTasksTableBody').innerHTML=part.length?part.map(r=>`<tr><td>${opsStatusBadge(r)}</td><td><strong>${escapeHtml(r['Nome da tarefa'])}</strong></td><td><strong>${escapeHtml(r.__demand)}</strong></td><td>${escapeHtml(r.Categoria||'—')}</td><td>${escapeHtml(r['Atribuído a']||'Sem responsável')}</td><td>${escapeHtml(r.Prioridade||'—')}</td><td>${opsFmtDate(r.__created)}</td><td>${opsFmtDate(r.__doneDate)}</td><td>${r.__late?'Sim':'Não'}</td><td>${opsLink(r)}</td></tr>`).join(''):'<tr><td colspan="10" class="empty">Nenhum registro encontrado.</td></tr>';el('opsPageInfo').textContent=`Página ${opsState.page} de ${pages}`;el('opsPrevPage').disabled=opsState.page<=1;el('opsNextPage').disabled=opsState.page>=pages;}
function opsReset(){['opsSearch','opsCategory','opsDemand','opsStatus','opsResponsible','opsPriority','opsStart','opsEnd'].forEach(id=>{if(el(id))el(id).value='';});opsApplyFilters();}
function opsExportFiltered(){if(!opsState.filteredBase.length)return showToast('Nenhuma demanda para exportar');downloadCsv(opsState.filteredBase.map(r=>{const o={};Object.keys(r).filter(k=>!k.startsWith('__')).forEach(k=>o[k]=r[k]);return o;}),'operacoes_filtradas.csv');}
function opsParseWorkbook(buffer,label='operacoes.xlsx',modified=null){if(!window.XLSX)throw new Error('Biblioteca XLSX não carregada');const wb=XLSX.read(buffer,{type:'array'});const sheet=wb.Sheets['Dados Consolidados']||wb.Sheets['Tarefas']||wb.Sheets[wb.SheetNames[0]];const rows=XLSX.utils.sheet_to_json(sheet,{defval:''});const plan=wb.Sheets['Plano']?XLSX.utils.sheet_to_json(wb.Sheets['Plano'],{defval:''}):[];const exp=plan[0]?.['Data da exportação ']||plan[0]?.['Data da exportação']||null;opsState.planId=opsClean(plan[0]?.['ID do plano']);opsState.exportDate=opsParseDate(exp)||modified||new Date();opsState.data=rows.filter(r=>opsClean(r['Nome da tarefa'])||opsClean(r['Identificação da tarefa'])).map(opsEnrich);opsState.fileName=label;opsPopulateFilters();opsSetDefaultPeriod();el('opsSourceInfo').textContent=`${num(opsState.data.length)} tarefas carregadas de ${label}`;el('opsLastUpdate').textContent=`Planner: ${opsFmtDate(opsState.exportDate)}`;opsApplyFilters();showToast(`${num(opsState.data.length)} tarefas do Planner carregadas`);}
async function opsLoadFromUrl(){const src='operacoes.xlsx';try{const res=await fetch(`${src}?_=${Date.now()}`,{cache:'no-store'});if(!res.ok)throw new Error(`HTTP ${res.status}`);const buf=await res.arrayBuffer();const mod=res.headers.get('Last-Modified');opsParseWorkbook(buf,src,mod?new Date(mod):null);}catch(e){console.warn('Falha ao carregar Planner:',e);el('opsSourceInfo').textContent='operacoes.xlsx não encontrado. Coloque a exportação do Planner na mesma pasta ou carregue manualmente.';}}
function opsLoadFile(file){if(!file)return;const reader=new FileReader();reader.onload=()=>{try{opsParseWorkbook(reader.result,file.name,file.lastModified?new Date(file.lastModified):null);}catch(e){showToast(`Erro ao ler XLSX: ${e.message}`)}};reader.readAsArrayBuffer(file);}

function switchView(view){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  const target=el(`view-${view}`);if(target)target.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
  const titles={overview:['Visão geral','Indicadores operacionais e leitura rápida do fluxo.'],cards:['Consultar Cards','Consulta detalhada com filtros dinâmicos e histórico por card.'],productivity:['Produtividade','Métrica diária por pessoa, tipos de conclusão e detalhamento das entregas.'],pipeline:['Panorama da Esteira','Andamento de U1, U2, vídeos e BDQs: concluído, pendente e etapa atual.'],person:['Pessoa','Rastreio detalhado do que cada pessoa fez no período.'],operations:['Acompanhamento Operações','Panorama das demandas do Planner: fila atual, entradas, finalizações, atrasos e carga da equipe.'],operationsProductivity:['Produtividade Operações','Conclusões por colaborador, categoria e dia no período selecionado.'],operationsTasks:['Consultar demandas','Consulta detalhada da exportação do Microsoft Planner.']};
  const t=titles[view]||['Painel',''];el('pageTitle').textContent=t[0];el('pageSubtitle').textContent=t[1];
  const isOps=view.startsWith('operations');el('filterPanel').style.display=isOps?'none':'';el('opsShared').style.display=isOps?'':'none';document.querySelector('.topbar-actions').style.display=isOps?'none':'';
  if(el('dropzone'))el('dropzone').style.display=isOps?'none':(state.data.length?'none':'flex');
  if(isOps&&opsState.data.length)opsRenderAll();
  if(view==='person')renderPerson();
  setTimeout(()=>Object.values(state.charts).forEach(c=>c.resize()),50);
}
function debounce(fn,ms){let t;return(...args)=>{clearTimeout(t);t=setTimeout(()=>fn(...args),ms)}}

// ==============================
// NÍVEL, LINKS, PERÍODOS RÁPIDOS
// ==============================
const lvlBadge=r=>{const l=r?.__parsed?.level;return l&&l!=='Outros'?`<span class="lvl lvl-${l==='Pós'?'pos':'grd'}">${l}</span>`:'';};
const cardLink=r=>{const u=clean(r?.['Card URL']),n=escapeHtml(r?.['Card Name']||'—');return u?`<a class="card-link" href="${escapeHtml(u)}" target="_blank" rel="noopener">${n}</a>`:n;};
function quickRange(kind){const t=new Date(),d0=new Date(t.getFullYear(),t.getMonth(),t.getDate());let s=new Date(d0);if(kind==='week')s.setDate(s.getDate()-((d0.getDay()+6)%7));else if(kind==='7d')s.setDate(s.getDate()-6);else if(kind==='month')s=new Date(t.getFullYear(),t.getMonth(),1);return [dayKey(s),dayKey(d0)];}
function wireQuickRanges(){document.querySelectorAll('.quick-range').forEach(g=>g.addEventListener('click',ev=>{const b=ev.target.closest('button[data-r]');if(!b)return;const [s,e]=quickRange(b.dataset.r),si=el(g.dataset.start),ei=el(g.dataset.end);si.value=s;ei.value=e;g.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));si.dispatchEvent(new Event('change'));ei.dispatchEvent(new Event('change'));}));}

// ==============================
// PRODUTIVIDADE: DISPONÍVEL NA ETAPA
// ==============================
function renderAvail(){
  const lvl=el('availLevel').value;
  const cur=state.data.filter(r=>!isFinished(r)&&r.__current.def&&(!lvl||r.__parsed.level===lvl));
  const counts=countBy(cur,r=>r.__current.def.key);
  const sel=el('availStage'),prev=sel.value,done=state.prodCompleted||[];
  if(!sel.options.length||sel.dataset.n!==String(counts.length)){
    const best=countBy(done,e=>e.key)[0]?.[0];
    sel.innerHTML=STAGE_MAP.filter(s=>counts.some(c=>c[0]===s.key)||done.some(e=>e.key===s.key)).map(s=>`<option value="${escapeHtml(s.key)}">${escapeHtml(s.label)}</option>`).join('');
    sel.dataset.n=String(counts.length);
    sel.value=[...sel.options].some(o=>o.value===prev)?prev:(best&&[...sel.options].some(o=>o.value===best)?best:sel.options[0]?.value||'');
  }
  const key=sel.value;
  const rows=cur.filter(r=>r.__current.def.key===key).sort((a,b)=>(a.__current.mode==='Fila'?0:1)-(b.__current.mode==='Fila'?0:1)||(b.__current.days||0)-(a.__current.days||0));
  const queue=rows.filter(r=>r.__current.mode==='Fila').length;
  el('availDone').textContent=num(done.filter(e=>e.key===key&&(!lvl||e.row.__parsed.level===lvl)).length);
  el('availQueue').textContent=num(queue);el('availProd').textContent=num(rows.length-queue);el('availTotal').textContent=num(rows.length);
  el('availBody').innerHTML=rows.length?rows.slice(0,300).map(r=>{const c=r.__current;return `<tr><td><span class="status-pill ${c.mode==='Fila'?'active':'finished'}">${escapeHtml(c.mode)}</span></td><td><span class="detail-card-name">${cardLink(r)}</span></td><td>${escapeHtml(r.__parsed.code||'—')}</td><td>${lvlBadge(r)||'—'}</td><td>${escapeHtml(c.list)}</td><td>${escapeHtml(c.person||'—')}</td><td>${c.days==null?'—':num(c.days)}</td></tr>`;}).join(''):'<tr><td class="empty" colspan="7">Nenhum card nesta etapa.</td></tr>';
}

// ==============================
// TELA PESSOA
// ==============================
function populatePersonPeople(){
  const box=el('personPeople'),cur=new Set([...box.querySelectorAll('input:checked')].map(x=>x.value));
  if(box.dataset.ready&&box.dataset.rows===String(state.filtered.length))return;
  const names=countBy(personEvents(state.filtered).filter(e=>e.person),e=>e.person).map(x=>x[0]);
  box.innerHTML=names.map(n=>`<label class="person-check" data-n="${escapeHtml(norm(n))}"><input type="checkbox" value="${escapeHtml(n)}" ${cur.has(n)?'checked':''}><span>${escapeHtml(n)}</span></label>`).join('')||'<span class="empty-mini">Sem responsáveis.</span>';
  box.dataset.ready='1';box.dataset.rows=String(state.filtered.length);
  box.querySelectorAll('input').forEach(i=>i.addEventListener('change',renderPerson));
}
function renderPerson(){
  if(!state.data.length)return;
  populatePersonPeople();
  if(!el('personStart').value&&!el('personEnd').value){const [s,e]=quickRange('week');el('personStart').value=s;el('personEnd').value=e;}
  const sel=[...el('personPeople').querySelectorAll('input:checked')].map(x=>x.value);
  const s=el('personStart').value?new Date(el('personStart').value+'T00:00:00'):null,e=el('personEnd').value?new Date(el('personEnd').value+'T23:59:59.999'):null;
  const inR=d=>d&&(!s||d>=s)&&(!e||d<=e),out=el('personResults');
  const all=personEvents(state.filtered).filter(x=>sel.includes(x.person));
  const done=all.filter(x=>inR(x.end)),nowAct=all.filter(x=>x.start&&!x.end&&!isFinished(x.row));
  const mins=a=>a.filter(x=>Number.isFinite(x.hours)).reduce((t,x)=>t+x.hours*60,0);
  el('perDone').textContent=num(done.length);el('perMin').textContent=fmtMin(mins(done));
  el('perDays').textContent=num(new Set(done.map(x=>dayKey(x.end))).size);el('perNow').textContent=num(nowAct.length);
  const keys=[];if(s&&e)for(let d=new Date(s);d<=e&&keys.length<400;d.setDate(d.getDate()+1))keys.push(dayKey(d));else keys.push(...unique(done.map(x=>dayKey(x.end))));
  const colors=palette(sel.length);
  createChart('chartPersonDaily',{type:'bar',data:{labels:keys.map(k=>fmtShortDate(new Date(k+'T12:00:00'))),datasets:sel.map((p,i)=>({label:p,data:keys.map(k=>done.filter(x=>x.person===p&&dayKey(x.end)===k).length),backgroundColor:colors[i],borderRadius:4}))},options:{...chartDefaults,plugins:{...chartDefaults.plugins,legend:{display:true,position:'bottom'}},scales:{x:{grid:{display:false}},y:{beginAtZero:true,ticks:{precision:0}}}}});
  if(!sel.length){out.innerHTML='<div class="empty panel">Selecione uma ou mais pessoas para rastrear o período.</div>';return;}
  const chips=(arr,fn)=>countBy(arr,fn).map(([k,v])=>`<span class="stage-chip"><b>${escapeHtml(k)}</b> ${num(v)}</span>`).join('');
  out.innerHTML=sel.map(p=>{
    const mine=all.filter(x=>x.person===p),d=mine.filter(x=>inR(x.end)),act=nowAct.filter(x=>x.person===p);
    const items=[...d.map(x=>({t:x.end,k:'done',x})),...mine.filter(x=>inR(x.start)&&!inR(x.end)).map(x=>({t:x.start,k:'start',x}))].sort((a,b)=>b.t-a.t);
    const days=new Map();items.forEach(i=>{const k=dayKey(i.t);if(!days.has(k))days.set(k,[]);days.get(k).push(i);});
    const wd=k=>new Date(k+'T12:00:00').toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'2-digit'});
    const tl=items.length?[...days.entries()].map(([k,list])=>`<div class="tl-day"><h4>${wd(k)} <span>${num(list.filter(i=>i.k==='done').length)} concluída(s)</span></h4>${list.map(({t,k,x})=>`<div class="tl-row"><time>${t.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</time><span class="tl-kind ${k}">${k==='done'?'Concluiu':'Iniciou'}</span><b>${escapeHtml(x.label)}</b><span class="tl-card">${cardLink(x.row)}</span><span>${escapeHtml(productivityDeliveryLabel(x))} ${lvlBadge(x.row)}</span><em>${k==='done'&&x.hours!=null?fmtHours(x.hours):''}</em></div>`).join('')}</div>`).join(''):'<div class="empty">Nenhuma atividade no período.</div>';
    const actHtml=act.length?`<div class="tl-now"><strong>Em produção agora (${num(act.length)})</strong>${act.slice(0,15).map(x=>`<div class="tl-row"><time>${x.start?fmtShortDate(x.start):''}</time><span class="tl-kind start">Em curso</span><b>${escapeHtml(x.label)}</b><span class="tl-card">${cardLink(x.row)}</span><span>${lvlBadge(x.row)}</span></div>`).join('')}</div>`:'';
    return `<article class="panel person-card"><div class="panel-head"><div><h2>${escapeHtml(p)}</h2><p>${num(d.length)} concluídas · ${fmtMin(mins(d))} · ${num(new Set(d.map(x=>dayKey(x.end))).size)} dia(s) ativo(s)</p></div></div><div class="chips-row">${chips(d,x=>x.label)}</div><div class="chips-row">${chips(d,x=>x.row.__parsed.level)}${chips(d,productivityType)}</div>${actHtml}${tl}</article>`;
  }).join('');
}

function wireEvents(){
  el('csvFile').addEventListener('change',e=>loadCSVFile(e.target.files[0]));
  ['dragenter','dragover'].forEach(evt=>el('dropzone').addEventListener(evt,e=>{e.preventDefault();el('dropzone').classList.add('dragover')}));
  ['dragleave','drop'].forEach(evt=>el('dropzone').addEventListener(evt,e=>{e.preventDefault();el('dropzone').classList.remove('dragover')}));el('dropzone').addEventListener('drop',e=>loadCSVFile(e.dataTransfer.files[0]));
  document.querySelectorAll('.nav-item').forEach(b=>b.addEventListener('click',()=>switchView(b.dataset.view)));
  document.querySelectorAll('#filtersGrid input, #filtersGrid select').forEach(inp=>inp.addEventListener(inp.type==='search'?'input':'change',debounce(applyFilters,inp.type==='search'?180:0)));
  el('resetFilters').addEventListener('click',resetFilters);el('toggleFilters').addEventListener('click',()=>{const g=el('filtersGrid');g.classList.toggle('hidden');el('toggleFilters').textContent=g.classList.contains('hidden')?'Expandir':'Recolher'});
  el('toggleSidebar').addEventListener('click',()=>{if(innerWidth<900)el('sidebar').classList.toggle('mobile-open');else el('sidebar').classList.toggle('collapsed')});
  el('pageSize').addEventListener('change',()=>{state.page=1;renderTable()});el('prevPage').addEventListener('click',()=>{state.page--;renderTable()});el('nextPage').addEventListener('click',()=>{state.page++;renderTable()});
  el('exportFiltered').addEventListener('click',exportFiltered);el('closeModal').addEventListener('click',()=>el('cardModal').close());el('cardModal').addEventListener('click',e=>{if(e.target===el('cardModal'))el('cardModal').close()});
  el('productivityStart').addEventListener('change',renderProductivity);el('productivityEnd').addEventListener('change',renderProductivity);
  el('selectAllPeople').addEventListener('click',()=>{el('productivityPeople').querySelectorAll('input').forEach(i=>i.checked=true);renderProductivity();});
  el('clearPeople').addEventListener('click',()=>{el('productivityPeople').querySelectorAll('input').forEach(i=>i.checked=false);renderProductivity();});
  el('exportProductivityData').addEventListener('click',exportProductivityData);el('exportProductivitySlide').addEventListener('click',exportProductivitySlide);
  wireQuickRanges();
  el('semSwitch').addEventListener('click',ev=>{const b=ev.target.closest('button[data-sem]');if(!b||b.dataset.sem===state.semester)return;resetFilters();loadSemester(b.dataset.sem);});
  el('toggleAvail').addEventListener('click',()=>{const p=el('availPanel');p.hidden=!p.hidden;el('toggleAvail').textContent=p.hidden?'Ver disponíveis na etapa':'Ocultar disponíveis';if(!p.hidden){renderAvail();p.scrollIntoView({behavior:'smooth',block:'nearest'});}});
  ['availStage','availLevel'].forEach(id=>el(id).addEventListener('change',()=>{if(id==='availLevel')el('availStage').dataset.n='';renderAvail();}));
  ['personStart','personEnd'].forEach(id=>el(id).addEventListener('change',renderPerson));
  el('personClear').addEventListener('click',()=>{el('personPeople').querySelectorAll('input').forEach(i=>i.checked=false);renderPerson();});
  el('personSearch').addEventListener('input',e=>{const q=norm(e.target.value);el('personPeople').querySelectorAll('.person-check').forEach(l=>l.style.display=l.dataset.n.includes(q)?'':'none');});
  el('opsFile').addEventListener('change',e=>opsLoadFile(e.target.files[0]));
  ['opsSearch','opsCategory','opsDemand','opsStatus','opsResponsible','opsPriority','opsStart','opsEnd'].forEach(id=>el(id).addEventListener(el(id).type==='search'?'input':'change',debounce(opsApplyFilters,el(id).type==='search'?180:0)));
  el('opsResetFilters').addEventListener('click',opsReset);el('opsExport').addEventListener('click',opsExportFiltered);
  el('opsPageSize').addEventListener('change',()=>{opsState.page=1;opsRenderTasksTable()});el('opsPrevPage').addEventListener('click',()=>{opsState.page--;opsRenderTasksTable()});el('opsNextPage').addEventListener('click',()=>{opsState.page++;opsRenderTasksTable()});
}

async function loadCSVFromUrl(src,label='dados.csv',sourceMode='server'){
  const sep=src.includes('?')?'&':'?',url=`${src}${sep}_=${Date.now()}`;const res=await fetch(url,{cache:'no-store'});if(!res.ok)throw new Error(`HTTP ${res.status}`);const text=await res.text();const modified=res.headers.get('Last-Modified');setLastUpdate(modified?new Date(modified):new Date(),sourceMode);Papa.parse(text,{header:true,skipEmptyLines:'greedy',complete:r=>onParsed(r.data,label,sourceMode),error:e=>{throw e;}});
}
const fetchCsv=src=>new Promise(async(res,rej)=>{try{const sep=src.includes('?')?'&':'?',r=await fetch(`${src}${sep}_=${Date.now()}`,{cache:'no-store'});if(!r.ok)throw new Error(`${src}: HTTP ${r.status}`);const text=await r.text(),m=r.headers.get('Last-Modified');Papa.parse(text,{header:true,skipEmptyLines:'greedy',complete:x=>res({rows:x.data,modified:m?new Date(m):new Date()}),error:rej});}catch(e){rej(e)}});
function renderSemSwitch(){el('semSwitch').innerHTML=SEMESTERS.map(s=>`<button type="button" data-sem="${s.id}" class="${s.id===state.semester?'on':''}">${s.label}</button>`).join('');}
async function loadSemester(id){
  const sem=SEMESTERS.find(s=>s.id===id)||SEMESTERS[0];
  state.semester=sem.id;state.profile=sem.profile;STAGE_MAP=sem.profile==='v2'?STAGE_MAP_V2:STAGE_MAP_V1;renderSemSwitch();
  const res=await Promise.allSettled(sem.sources.map(fetchCsv)),ok=res.filter(r=>r.status==='fulfilled').map(r=>r.value);
  if(!ok.length){el('dropzone').classList.remove('loaded');el('dropzone').querySelector('strong').textContent=`Dados de ${sem.label} não encontrados`;el('dropzone').querySelector('span').textContent=`Coloque ${sem.sources.join(' e ')} na mesma pasta do index.html.`;return;}
  setLastUpdate(new Date(Math.max(...ok.map(x=>x.modified.getTime()))),'server');
  onParsed(ok.flatMap(x=>x.rows),sem.sources.join(' + '),'server',sem.profile);
  const bad=res.filter(r=>r.status==='rejected');if(bad.length)showToast(`Fonte indisponível: ${bad.map(b=>b.reason?.message||'erro').join('; ')}`);
}
async function autoLoadData(){
  const p=new URLSearchParams(location.search),q=p.get('csv');
  if(q){try{state.profile='v1';await loadCSVFromUrl(q,q.split('/').pop()?.split('?')[0]||'dados.csv','server');}catch(e){console.warn('Falha no carregamento do CSV:',e);}return;}
  await loadSemester(state.semester||p.get('sem')||SEMESTERS[0].id);
}

Chart.defaults.font.family='Inter, system-ui, sans-serif';Chart.defaults.color='#696d77';
wireEvents();autoLoadData();opsLoadFromUrl();
// Recarrega dados.csv e operacoes.xlsx a cada 10 min para quem deixa o painel aberto
setInterval(()=>{autoLoadData();opsLoadFromUrl();},10*60*1000);
