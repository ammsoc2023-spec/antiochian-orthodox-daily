/* Antiochian Orthodox Daily 2026 – offline PWA. No tracking. Bible tabs load orthodoxbibleonline.com, st-takla.org in an iframe only when opened (needs internet; no Bible text is copied or cached). */
'use strict';
(function(){
const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
const LS={get(k,d){try{const v=localStorage.getItem('aod.'+k);return v===null?d:JSON.parse(v)}catch(e){return d}},
          set(k,v){try{localStorage.setItem('aod.'+k,JSON.stringify(v))}catch(e){}}};
const FIRST='2026-01-01', LAST='2026-12-31';
const MONTHS=[];for(let m=1;m<=12;m++)MONTHS.push('2026-'+String(m).padStart(2,'0'));
const MON_EN=['January','February','March','April','May','June','July','August','September','October','November','December'];
const MON_AR=['كانون الثاني','شباط','آذار','نيسان','أيّار','حزيران','تمّوز','آب','أيلول','تشرين الأوّل','تشرين الثاني','كانون الأوّل'];
const WD_EN=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], WD_AR=['إثنين','ثلاثاء','أربعاء','خميس','جمعة','سبت','أحد'];
const WDL_EN=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], WDL_AR=['الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت','الأحد'];
const T={
 en:{today:'Today',saints:'Saints and feasts',fasting:'Fasting',readings:'Readings',commentary:'Commentary',notes:'Notes',
     lives:'Saints of the Day — Lives and Lessons',noread:'No readings are given for this day.',search:'Search saints (English or Arabic)',
     close:'Close',goto:'Go to date',settings:'Settings',font:'Text size',theme:'Appearance',sections:'Sections',openall:'Open all',closeall:'Close all',
     results:n=>n+' day(s) found',nores:'No saints found.',type2:'Type at least 2 letters.',
     legend:'Red = Sunday or great feast · ★ = Pascha / Twelve Great Feasts · purple underline = fast day',
     outside:d=>'Today ('+d+') is outside 2026 – showing the nearest day in this calendar.',
     notyet:'This day has not been added to the calendar yet.',
     offline:'Offline ready: the whole calendar is stored on this device.',offlineNo:'Offline storage not available in this browser.',
     listen:'Read aloud',scopeAll:'Whole day',scopeSaints:'Saints only',scopeRead:'Readings only',scopeCom:'Commentary only',
     lEn:'English',lAr:'Arabic',lBoth:'English, then Arabic',reading:'Reading',paused:'Paused',done:'Finished',about:'About this calendar · حول هذا التقويم',
     prayers:'Prayers',back:'Calendar',tapday:'Tap a day to open it.',feasts:'Feasts and red-letter days this month',mlegend:'Red = Sunday or great feast · ★ = Pascha / Twelve Great Feasts · gold ring = today',pAll:'All prayers',pSec:{morning:'Morning prayers',addl:'Additional morning prayers',midday:'Midday prayers',evening:'Evening prayers'},noprayers:'Could not load the prayers.'},
 ar:{today:'اليوم',saints:'القدّيسون والأعياد',fasting:'الصوم',readings:'القراءات',commentary:'الشرح',notes:'حواشٍ',
     lives:'قدّيسو اليوم — سِيَرٌ وعِبَر',noread:'لا قراءات لهذا اليوم.',search:'ابحث عن القدّيسين (بالعربيّة أو الإنكليزيّة)',
     close:'إغلاق',goto:'انتقل إلى تاريخ',settings:'الإعدادات',font:'حجم الخطّ',theme:'المظهر',sections:'الأقسام',openall:'افتح الكلّ',closeall:'أغلق الكلّ',
     results:n=>'عدد الأيّام: '+n,nores:'لم يُعثر على قدّيسين.',type2:'اكتب حرفين على الأقلّ.',
     legend:'الأحمر = الأحد أو عيد كبير · ★ = الفصح والأعياد الاثنا عشر · خطّ بنفسجيّ = يوم صوم',
     outside:d=>'تاريخ اليوم ('+d+') خارج سنة 2026 – يُعرَض أقرب يوم في هذا التقويم.',
     notyet:'لم يُضَف هذا اليوم إلى التقويم بعد.',
     offline:'جاهز للعمل دون اتّصال: التقويم كلّه محفوظ على هذا الجهاز.',offlineNo:'الحفظ دون اتّصال غير متاح في هذا المتصفّح.',
     listen:'القراءة بصوت عالٍ',scopeAll:'اليوم كلّه',scopeSaints:'القدّيسون فقط',scopeRead:'القراءات فقط',scopeCom:'الشرح فقط',
     lEn:'الإنكليزيّة',lAr:'العربيّة',lBoth:'الإنكليزيّة ثمّ العربيّة',reading:'تجري القراءة',paused:'متوقّف مؤقّتًا',done:'انتهت القراءة',about:'حول هذا التقويم · About',
     prayers:'الصلوات',back:'التقويم',tapday:'اضغط على يوم لفتحه.',feasts:'الأعياد والأيّام الحمراء في هذا الشهر',mlegend:'الأحمر = الأحد أو عيد كبير · ★ = الفصح والأعياد الاثنا عشر · الإطار الذهبيّ = اليوم',pAll:'كلّ الصلوات',pSec:{morning:'صلوات الصباح',addl:'صلوات صباحيّة إضافيّة',midday:'صلوات الظهر',evening:'صلوات المساء'},noprayers:'تعذّر تحميل الصلوات.'}};
let lang=LS.get('lang','en'); if(!['en','ar','both'].includes(lang)) lang='en';
const ui=()=>T[lang==='ar'?'ar':'en'];
let cur=null, months={}, index=null, notice='', prayersOpen=false, pvPushed=false, prayersP=null, iconsP=null;
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Arabic words inside English text are isolated so the bidi algorithm keeps them readable
const ARSEG=/[\u0600-\u06FF][\u0600-\u06FF\s\d،:–\-]*[\u0600-\u06FF\d]|[\u0600-\u06FF]/g;
const mix=s=>esc(s).replace(ARSEG,m=>`<bdi dir="rtl" lang="ar">${m}</bdi>`);

/* ---------- dates ---------- */
function sydneyToday(){
  try{const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Australia/Sydney',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
      const g=t=>p.find(x=>x.type===t).value; return g('year')+'-'+g('month')+'-'+g('day');}
  catch(e){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
}
function clamp(d){return d<FIRST?FIRST:d>LAST?LAST:d}
function addDays(iso,n){const t=new Date(iso+'T00:00:00Z');t.setUTCDate(t.getUTCDate()+n);return t.toISOString().slice(0,10)}
function todayInRange(){const t=sydneyToday();notice=(t<FIRST||t>LAST)?ui().outside(t):'';return clamp(t)}
const valid=d=>/^2026-\d\d-\d\d$/.test(d)&&d>=FIRST&&d<=LAST&&!isNaN(new Date(d+'T00:00:00Z'));

/* ---------- data ---------- */
function loadMonth(m){
  if(!months[m]) months[m]=fetch('data/2026-'+String(m).padStart(2,'0')+'.json').then(r=>{if(!r.ok)throw new Error('HTTP '+r.status);return r.json()})
    .then(j=>{const map={};j.days.forEach(d=>map[d.date]=d);j.map=map;return j}).catch(e=>{delete months[m];throw e});
  return months[m];
}
function loadPrayers(){ if(!prayersP) prayersP=fetch('data/prayers.json').then(r=>{if(!r.ok)throw new Error('HTTP '+r.status);return r.json()}).catch(e=>{prayersP=null;throw e}); return prayersP }
function loadIcons(){ if(!iconsP) iconsP=fetch('data/icons.json').then(r=>{if(!r.ok)throw new Error('HTTP '+r.status);return r.json()}).catch(e=>{iconsP=null;throw e}); return iconsP }
function loadIndex(){ if(!index) index=fetch('data/index.json').then(r=>r.json()); return index }
async function getDay(iso){const j=await loadMonth(+iso.slice(5,7));return {day:j.map[iso],month:j}}

/* ---------- settings ---------- */
const FS=[14,15,16,17,18,19,20,22,24,26,28];
let fs=LS.get('fs',18), theme=LS.get('theme','auto');
const OPEN_DEF={readings:true,commentary:true,notes:false,lives:true};
let open=Object.assign({},OPEN_DEF,LS.get('open',{}));
function applySettings(){
  const R=document.documentElement;
  R.style.setProperty('--fs',fs+'px'); R.dataset.theme=theme;
  $$('#themeSeg button').forEach(b=>b.classList.toggle('on',b.dataset.theme===theme));
  $$('#langSeg button').forEach(b=>b.classList.toggle('on',b.dataset.lang===lang));
  R.lang=lang==='ar'?'ar':'en'; R.dir=lang==='ar'?'rtl':'ltr';
  const u=ui();
  $('#btnToday').textContent=u.today; $('#btnPrayers').textContent=u.prayers; $('#btnBack').textContent=(lang==='ar'?'› ':'‹ ')+u.back;
  $('#pvTitle').textContent=lang==='both'?'Prayers · الصلوات':u.prayers; $('#q').placeholder=u.search; 
  $$('[data-close]').forEach(b=>b.textContent=u.close);
  $('#mTitle').textContent=u.settings;$('#mFont').textContent=u.font;$('#mTheme').textContent=u.theme;$('#mExpand').textContent=u.sections;
  $('#openAll').textContent=u.openall;$('#closeAll').textContent=u.closeall;$('#mAbout').textContent=u.about;
  TTS.labels(); rtlArrows(); if(typeof bibleLabels==='function') bibleLabels();
}

/* ---------- render ---------- */
function det(sec,summary,body){return `<details data-sec="${sec}"${open[sec]?' open':''}><summary>${summary}</summary>${body}</details>`}
function colour(o){return o.red?'redb':o.blue?'blue':''}
function section(L,d){
  const u=T[L], E=L==='en', k=x=>` data-k="${L}:${x}"`, tx=E?mix:esc;
  let h='';
  const head=E?d.head_en:d.head_ar, other=E?d.head_ar:d.head_en;
  h+=`<div class="dayhead-row"><h1 class="dayhead${d.red?' red':''}"${k('hd')}>${esc(head)}</h1>${(lang!=='both'||E)&&TTS.ok?`<button type="button" class="speak" aria-label="${esc(u.listen)}" title="${esc(u.listen)}">🔊&#xFE0E;</button>`:''}</div>`;
  if(lang!=='both') h+=`<p class="oldstyle"${E?' dir="rtl" lang="ar"':' dir="ltr" lang="en"'}>${esc(other)}</p>`;
  else if(E) h+=`<p class="oldstyle" dir="rtl" lang="ar">${esc(d.head_ar)}</p>`;
  if(d.star) h+=`<p class="star"${k('star')}>${esc(E?d.star_en:d.star_ar)}</p>`;
  if(E?d.week_en:d.week_ar) h+=`<p class="week"${k('week')}>${tx(E?d.week_en:d.week_ar)}</p>`;
  h+=`<h2 class="sec">${u.saints}</h2><ul class="items">`;
  d.items.forEach((it,i)=>{h+=`<li class="${colour(it)}"${k('it'+i)}>${E?esc(it.en)+` — <bdi class="ar" dir="rtl" lang="ar">${esc(it.ar)}</bdi>`:esc(it.ar)}</li>`});
  h+='</ul>';
  let rb='';
  if(!d.readings.length) rb+=`<p class="note">${esc(u.noread)}</p>`;
  d.readings.forEach((r,i)=>{
    rb+=`<div class="reading"><h3${k('r'+i+'h')}>${tx(E?r.h_en:r.h_ar)}</h3>`;
    if(r.official){ rb+=`<p class="text"${k('r'+i+'t')}>${esc(E?r.en:r.ar)}</p><p class="src"${k('r'+i+'s')}>${tx(E?r.src_en:r.src_ar)}</p>` }
    else rb+=`<p class="note"${k('r'+i+'s')}>${esc(E?r.note_en:r.note_ar)}</p>`;
    rb+='</div>';
  });
  h+=det('readings',u.readings+(d.readings.length?` <span class="small">(${d.readings.length})</span>`:''),rb);
  h+=det('commentary',u.commentary,`<p class="text"${k('com')}>${tx(E?d.com_en:d.com_ar)}</p>`);
  if(d.notes.length) h+=det('notes',u.notes,`<ol class="notes">${d.notes.map((n,j)=>`<li${k('n'+j)}>${tx(E?n.en:n.ar)}</li>`).join('')}</ol>`);
  if(d.saints.length){
    let sb='';
    d.saints.forEach((s,i)=>{
      const nm=E?esc(s.name_en)+` — <bdi class="ar" dir="rtl" lang="ar">${esc(s.name_ar)}</bdi>`:esc(s.name_ar), c=colour(s);
      sb+=`<div class="saint"><div class="nm ${c}"${k('s'+i+'n')}>${nm}</div>`;
      s.parts.forEach((p,j)=>{const lab=E?p.lab_en:p.lab_ar; sb+=`<p class="text"${k('s'+i+'p'+j)}>${lab?`<span class="lab">${esc(lab)}${E?'. ':': '}</span>`:''}${tx(E?p.en:p.ar)}</p>`});
      sb+='</div>';
    });
    h+=det('lives',u.lives,sb);
  }
  h+=`<p class="typ"${k('src')}>${tx(E?d.src_en:d.src_ar)}</p>`;
  return E?h:`<div class="arsec" dir="rtl" lang="ar">${h}</div>`;
}
/* ---------- day icon (Wikimedia Commons, credited under the image) ---------- */
function iconBlock(ic,iso){
  const e=ic&&ic.days&&ic.days[iso], I=e&&ic.icons[e.i]; if(!I) return '';
  const gl=[]; if(e.g_en&&lang!=='ar') gl.push(['en','Gospel of the day: '+e.g_en]); if(e.g_ar&&lang!=='en') gl.push(['ar','إنجيل اليوم: '+e.g_ar]);
  const lic=I.licurl?`<a href="${esc(I.licurl)}" target="_blank" rel="noopener">${esc(I.lic)}</a>`:esc(I.lic);
  return `<figure class="dayicon"><img src="${esc(I.f)}" width="${I.w}" height="${I.h}" alt="${esc(lang==='ar'?I.ar:I.en)}" loading="lazy" decoding="async" onerror="this.parentNode.classList.add('noimg')">`+
    `<figcaption><span class="ic-en" lang="en" dir="ltr">${esc(I.en)}</span><span class="ic-ar" lang="ar" dir="rtl">${esc(I.ar)}</span>`+
    gl.map(([L,g])=>`<span class="ic-g" lang="${L}" dir="${L==='ar'?'rtl':'ltr'}">${esc(g)}</span>`).join('')+
    `<span class="ic-src" dir="ltr">Source / <bdi lang="ar" dir="rtl">المصدر</bdi>: <a href="${esc(I.src)}" target="_blank" rel="noopener">Wikimedia Commons</a> · ${esc(I.author)}${I.date?', '+esc(I.date):''} · ${lic}</span></figcaption></figure>`;
}
async function show(iso,opts){
  if(prayersOpen) closePrayers();
  if(bibleOpen) closeBible();
  if(view!=='day'){ view='day'; document.body.classList.remove('mv'); $('#month').hidden=true; $('#day').hidden=false; $('.mvnav').hidden=true; window.scrollTo(0,0) }
  iso=clamp(iso); cur=iso;
  if(location.hash!=='#'+iso) history.replaceState(null,'','#'+iso);
  updateNav();
  let r;
  let ic=null;
  try{[r,ic]=await Promise.all([getDay(iso),loadIcons().catch(()=>null)])}catch(e){r=null}
  if(cur!==iso) return;
  const m=$('#day');
  if(!r||!r.day){ m.innerHTML=`<p class="loading">${esc(ui().notyet)}</p>`; m.dataset.date=iso; return }
  const d=r.day, langs=lang==='both'?['en','ar']:[lang];
  let h=notice?`<p class="note">${esc(notice)}</p>`:'';
  langs.forEach((L,i)=>{ if(i) h+='<div class="lang-div ar" dir="rtl" lang="ar">الترجمة العربية</div>'; h+=section(L,d)});
  h+=iconBlock(ic,iso);
  m.innerHTML=h; m.dataset.date=iso;
  m.querySelectorAll('details').forEach(x=>x.addEventListener('toggle',()=>{ if(x.dataset.prog) return; open[x.dataset.sec]=x.open;LS.set('open',open)}));
  m.querySelectorAll('.speak').forEach(b=>b.addEventListener('click',()=>TTS.fromDay()));
  TTS.refreshDay();
  if(!opts||!opts.keepScroll) window.scrollTo(0,0);
  const mo=+iso.slice(5,7); [mo-1,mo+1].filter(x=>x>=1&&x<=12).forEach(x=>loadMonth(x).catch(()=>{}));
}
function navText(iso,L){const d=new Date(iso+'T00:00:00Z'),M=d.getUTCMonth(),D=d.getUTCDate(),wd=(d.getUTCDay()+6)%7;
  return L==='ar'?`${WDL_AR[wd]}، ${D} ${MON_AR[M]} 2026`:`${WD_EN[wd]}, ${D} ${MON_EN[M]} 2026`}
function updateNav(){
  const A=lang==='ar';
  $('#navDate').textContent=navText(cur,A?'ar':'en'); $('#navOld').textContent=navText(cur,A?'en':'ar');
  $('#navDate').lang=A?'ar':'en'; $('#navOld').lang=A?'en':'ar'; $('#navOld').dir=A?'ltr':'rtl';
  $('#btnPrev').disabled=cur<=FIRST; $('#btnNext').disabled=cur>=LAST;
  $('#btnMonthLbl').textContent=monthTitle(cur.slice(0,7),A); $('#btnMonthLbl').lang=A?'ar':'en';
  $('#btnToday').classList.toggle('on',cur===clamp(sydneyToday()));
}
const step=n=>{const t=addDays(cur,n); if(t>=FIRST&&t<=LAST) show(t)};

/* ---------- prayers (morning, midday, evening) ---------- */
function defaultPOpen(){
  let h=12; try{h=+new Intl.DateTimeFormat('en-AU',{timeZone:'Australia/Sydney',hour:'numeric',hourCycle:'h23'}).format(new Date())%24}catch(e){h=new Date().getHours()}
  return {morning:h>=3&&h<12, addl:false, midday:h>=12&&h<17, evening:h>=17||h<3};
}
let popen=Object.assign(defaultPOpen(),LS.get('popen',{}));
const ptext=t=>esc(t).replace(/\(([^)]+)\)/g,'<span class="rub">($1)</span>');
function prayerBlock(p,L,si,pi,noar){
  const g=f=>p[f+'_'+L]||'', k=x=>` data-k="${L}:p${si}.${pi}.${x}"`; let h='';
  if(g('title')) h+=`<h3 class="ptitle"${k('t')}>${esc(g('title'))}${g('sub')?`<span class="psub">${esc(g('sub'))}</span>`:''}</h3>`;
  if(L==='ar'&&!p.text_ar){
    h+=`<p class="rubric noar"${k('nr')}>${esc(noar)}</p>`;
    if(lang==='ar'){ // Arabic-only view: show the English text so the prayer is not missing
      let e=''; if(p.rubric_en) e+=`<p class="rubric">${esc(p.rubric_en)}</p>`;
      p.text_en.split('\n\n').filter(Boolean).forEach(t=>e+=`<p class="text ptext">${ptext(t)}</p>`);
      if(p.after_en) e+=`<p class="rubric">${esc(p.after_en)}</p>`;
      h+=`<div class="pen" dir="ltr" lang="en">${e}</div>`;
    }
    return h;
  }
  if(g('rubric')) h+=`<p class="rubric"${k('r')}>${esc(g('rubric'))}</p>`;
  g('text').split('\n\n').filter(Boolean).forEach((t,j)=>h+=`<p class="text ptext"${k('x'+j)}>${ptext(t)}</p>`);
  if(g('after')) h+=`<p class="rubric"${k('a')}>${esc(g('after'))}</p>`;
  return h;
}
async function renderPrayers(){
  const box=$('#prayers'); let d;
  try{d=await loadPrayers()}catch(e){ if(prayersOpen) box.innerHTML=`<p class="loading">${esc(ui().noprayers)} ${esc(e.message)}</p>`; return }
  if(!prayersOpen) return;
  const u=ui(), langs=lang==='both'?['en','ar']:[lang], L0=langs[0];
  const wrapAr=(L,x)=>L==='ar'?`<div class="arsec" dir="rtl" lang="ar">${x}</div>`:x;
  let h=`<div class="dayhead-row"><h1 class="dayhead">${esc(lang==='both'?'Prayers · الصلوات':u.prayers)}</h1>${TTS.ok?`<button type="button" class="speak" aria-label="${esc(u.listen)}" title="${esc(u.listen)}">🔊&#xFE0E;</button>`:''}</div>`;
  d.sections.forEach((s,si)=>{
    const title=langs.map(L=>L==='ar'?`<bdi dir="rtl" lang="ar">${esc(s.title_ar)}</bdi>`:esc(s.title_en)).join(' · ');
    let b='';
    s.prayers.forEach((p,pi)=>{ b+='<div class="prayer">'+langs.map((L,li)=>(li?'<div class="pmk">':'')+wrapAr(L,prayerBlock(p,L,si,pi,d.noar_note))+(li?'</div>':'')).join('')+'</div>' });
    h+=`<details class="psec" data-psec="${s.id}"${popen[s.id]?' open':''}><summary data-k="${L0}:s${si}">${title} <span class="small">(${s.prayers.length})</span></summary>${b}</details>`;
  });
  if(lang!=='ar') h+=`<p class="pcredit">${esc(d.credit_en)}</p>`; if(lang!=='en') h+=`<p class="pcredit" dir="rtl" lang="ar">${esc(d.credit_ar)}</p>`;
  box.innerHTML=h; box.dataset.date='prayers';
  box.querySelectorAll('details.psec').forEach(x=>x.addEventListener('toggle',()=>{ if(x.dataset.prog) return; popen[x.dataset.psec]=x.open; LS.set('popen',popen)}));
  box.querySelectorAll('.speak').forEach(b=>b.addEventListener('click',()=>TTS.fromDay()));
  TTS.refreshDay();
}
function openPrayers(push){
  closePanels();
  if(bibleOpen) closeBible();
  if(!prayersOpen){
    pvFrom=view; prayersOpen=true; document.body.classList.add('pv'); $('#day').hidden=true; $('#month').hidden=true; $('#prayers').hidden=false; $('.pvnav').hidden=false;
    $('#btnPrayers').classList.add('on'); $('#btnToday').classList.remove('on');
    if(push){ history.pushState(null,'','#prayers'); pvPushed=true } else if(location.hash!=='#prayers') history.replaceState(null,'','#prayers');
    window.scrollTo(0,0); TTS.labels();
  }
  return renderPrayers();
}
function closePrayers(){
  if(!prayersOpen) return; prayersOpen=false; pvPushed=false;
  document.body.classList.remove('pv'); $('#day').hidden=false; $('#prayers').hidden=true; $('#prayers').innerHTML=''; $('.pvnav').hidden=true;
  $('#btnPrayers').classList.remove('on'); TTS.labels();
}
function backToCalendar(){ if(pvPushed){ history.back(); return } if(pvFrom==='month') showMonth(mvYM); else show(cur) }

// month-view hooks (Antiochian): short main-saint name, sub-title in the other language, feast list from the index
const SN_STOP=/^(Saturday|Friday|Thursday|Wednesday|Tuesday|Monday|Sunday|Week|Spirit|Cross|Trinity|Innocents|Apostles|Fathers|Unmercenaries|Theophany|Pentecost|Theotokos)\b/i;
const SN_EN=/^(The|Holy|Saints?|Sts?\.?|Venerable|Righteous|Blessed|Glorious|All-?praised|Great|Great-?martyrs?|Hieromartyrs?|Virgin-?martyrs?|Holy-?martyrs?|Martyrs?|Confessors?|Apostles?|Prophet(ess)?s?|Equal-to-the-Apostles|Our|Father|fathers|Mother|among|the|saints|and)\s+/i;
const SN_AR=/^(القدّ?يس(ة|ان|ون|ين|تان)?|الشهداء|الشهيد(ة|ان|تان|ات)?|في الكهنة|في الشهيدات|في القدّ?يسين|البارّ?(ة|ان|ون)?|الرسول(ان)?|الرسل|النبيّ?(ة)?|المجيد(ة)?|العظيم(ة|ان)?|الجليل|أبينا|أبوينا|آبائنا|الصدّ?يق|البتول|الكلّيّ الوقار|الكلّي الوقار)\s+/;
const SN_TAIL=/\b(Prophet|holy|glorious|Renewal|Forerunner|Apostles?)$/i;
const shortName=(n,A)=>{let t;
  const s0=String(n||'').replace(/\s*\([^)]*\)/g,'');
  if(A) t=s0.replace(/\s*[–(\[:،؛].*$/,'').trim();
  else { const seg=s0.replace(/\s*[–(\[].*$/,'').split(/\s*[:;]\s*|,\s+/); t=seg[0]; for(let i=1;i<seg.length&&SN_TAIL.test(t);i++) t+=', '+seg[i] }
  const re=A?SN_AR:SN_EN;
  for(let i=0;i<8;i++){const u=t.replace(re,''); if(u===t||!u||(!A&&SN_STOP.test(u)))break; t=u}
  return A?t:t.charAt(0).toUpperCase()+t.slice(1)};
const MV_MONTH=()=>Promise.resolve(null);
const MV_SUB=(ym,mj,A)=>{const s=$('#mvSub'); s.textContent=monthTitle(ym,!A); s.lang=A?'en':'ar'; s.dir=A?'ltr':'rtl'};
const MV_CELL=()=>'';
const MV_FEAST=(iso,e,wd,main)=>main&&(e.g||(e.r&&wd!==6&&main[2]===1))?{en:main[0],ar:main[1]}:null;

/* ---------- Bible tabs (embed the sites in an iframe; no Bible text is copied or cached) ---------- */
const BIBLES={"bible": {"url": "https://www.orthodoxbibleonline.com/", "hash": "#bible", "label": {"en": "Bible", "ar": "Bible", "both": "Bible"}, "title": {"en": "Orthodox Bible (English)", "ar": "الكتاب المقدّس (بالإنكليزيّة)", "both": "Orthodox Bible (English) · الكتاب المقدّس (بالإنكليزيّة)"}, "frame": "Orthodox Bible Online", "btn": "btnBible"}, "arabic": {"url": "https://st-takla.org/Holy-Bible_.html", "hash": "#bible-ar", "label": {"en": "Arabic Bible", "ar": "الكتاب المقدّس", "both": "الكتاب المقدّس"}, "title": {"en": "Arabic Bible", "ar": "الكتاب المقدّس", "both": "Arabic Bible · الكتاب المقدّس"}, "frame": "Arabic Bible (Van Dyck) – St-Takla.org", "btn": "btnBibleAr"}};
const BIBLE_TXT={"en": {"bibleOpen": "Open in browser", "bibleOff": "The Bible needs an internet connection. You can still use the calendar and prayers offline.", "bibleFail": "This page could not be shown here. You can open it in your browser."}, "ar": {"bibleOpen": "افتح في المتصفّح", "bibleOff": "يحتاج الكتاب المقدّس إلى اتّصال بالإنترنت. يمكنك استخدام التقويم والصلوات دون اتّصال.", "bibleFail": "تعذّر عرض هذه الصفحة هنا. يمكنك فتحها في المتصفّح."}};
const BIBLE_HASH={}; Object.keys(BIBLES).forEach(k=>BIBLE_HASH[BIBLES[k].hash.slice(1)]=k);
let bibleOpen=false, bibleSrc='bible', bvPushed=false, bvFrom='day', bibleLoadGen=0;
const btx=()=>BIBLE_TXT[lang==='ar'?'ar':'en'];
function bibleSpec(src){ return BIBLES[BIBLES[src]?src:'bible'] }
function bibleLabels(){
  Object.keys(BIBLES).forEach(k=>{const b=BIBLES[k], el=$('#'+b.btn); if(!el) return; el.textContent=b.label[lang]||b.label.en;
    el.lang=/[\u0600-\u06FF]/.test(el.textContent)?'ar':'en'; el.setAttribute('aria-label',b.title[lang]||b.title.en)});
  $('#btnBibleBack').textContent=(lang==='ar'?'› ':'‹ ')+ui().back;
  $('#bibleExt').textContent=btx().bibleOpen;
  if(bibleOpen){ applyBibleChrome(); syncBibleOfflineMsg(); if(!$('#bibleFallback').hidden) showBibleFallback() }
}
function applyBibleChrome(){
  const b=bibleSpec(bibleSrc);
  $('#bvTitle').textContent=b.title[lang]||b.title.en;
  $('#bibleExt').setAttribute('href',b.url); $('#bibleExt').textContent=btx().bibleOpen;
  $('#bibleFrame').title=b.frame;
  Object.keys(BIBLES).forEach(k=>{const el=$('#'+BIBLES[k].btn); if(el) el.classList.toggle('on',!!(bibleOpen&&bibleSrc===k))});
}
const bibleMsg=key=>lang==='both'?`<p>${esc(BIBLE_TXT.en[key])}</p><p dir="rtl" lang="ar">${esc(BIBLE_TXT.ar[key])}</p>`:`<p>${esc(btx()[key])}</p>`;
function syncBibleOfflineMsg(){ $('#bibleOffline').innerHTML=bibleMsg('bibleOff') }
function showBibleFallback(){
  const b=bibleSpec(bibleSrc), box=$('#bibleFallback'), fr=$('#bibleFrame');
  box.innerHTML=bibleMsg('bibleFail')+`<p><a id="bibleFallbackOpen" href="${esc(b.url)}" target="_blank" rel="noopener noreferrer">${esc(btx().bibleOpen)}</a></p>`;
  box.hidden=false; if(fr) fr.hidden=true;
}
function resetBibleFrame(){
  const old=$('#bibleFrame'); if(!old) return null;
  const fr=old.cloneNode(false); fr.removeAttribute('src'); fr.hidden=old.hidden; old.replaceWith(fr); return fr;
}
function frameLooksBlank(fr){
  try{ const href=fr.contentWindow&&fr.contentWindow.location&&String(fr.contentWindow.location.href||'');
    return !href||href==='about:blank'||href.startsWith('chrome-error')||href.startsWith('chrome://');
  }catch(e){ return false } // SecurityError: a cross-origin page loaded
}
function syncBibleFrame(){
  const online=navigator.onLine!==false, off=$('#bibleOffline'), fall=$('#bibleFallback'), b=bibleSpec(bibleSrc);
  let fr=$('#bibleFrame');
  syncBibleOfflineMsg(); applyBibleChrome();
  if(!online){ off.hidden=false; fall.hidden=true; fr=resetBibleFrame()||fr; fr.hidden=true; return }
  off.hidden=true;
  if(fr.getAttribute('src')!==b.url){
    const gen=++bibleLoadGen; fall.hidden=true;
    fr=resetBibleFrame(); fr.hidden=false;
    fr.onload=()=>{ if(gen!==bibleLoadGen) return; if(frameLooksBlank(fr)) showBibleFallback() };
    fr.onerror=()=>{ if(gen!==bibleLoadGen) return; showBibleFallback() };
    fr.setAttribute('src',b.url);
    // a cross-origin error page cannot be told apart from a loaded page, so also check the site answers at all
    try{ fetch(b.url,{mode:'no-cors',cache:'no-store',credentials:'omit'}).catch(()=>{ if(gen===bibleLoadGen&&bibleOpen&&navigator.onLine!==false) showBibleFallback() }) }catch(e){}
    setTimeout(()=>{ if(gen!==bibleLoadGen||!bibleOpen||navigator.onLine===false||!fall.hidden) return;
      if(frameLooksBlank($('#bibleFrame'))) showBibleFallback() }, 8000);
  } else { fall.hidden=true; fr.hidden=false }
}
function openBible(src, push){
  src=BIBLES[src]?src:'bible';
  closePanels();
  if(prayersOpen) closePrayers();
  try{ TTS.stop() }catch(e){}
  const want=bibleSpec(src).hash, switching=bibleOpen&&bibleSrc!==src;
  if(!bibleOpen){
    bvFrom=view; bibleOpen=true; bibleSrc=src; document.body.classList.add('bv');
    $('#day').hidden=true; $('#month').hidden=true; $('#prayers').hidden=true; $('#bible').hidden=false; $('.bvnav').hidden=false;
    $('#btnToday').classList.remove('on'); $('#btnPrayers').classList.remove('on');
    if(push){ history.pushState(null,'',want); bvPushed=true } else if(location.hash!==want) history.replaceState(null,'',want);
    window.scrollTo(0,0);
  } else if(switching){
    bibleSrc=src; bibleLoadGen++; $('#bibleFrame').removeAttribute('src'); $('#bibleFallback').hidden=true;
    if(push){ history.pushState(null,'',want); bvPushed=true } else if(location.hash!==want) history.replaceState(null,'',want);
  }
  applyBibleChrome(); syncBibleFrame();
}
function closeBible(){
  if(!bibleOpen) return; bibleOpen=false; bvPushed=false; bibleLoadGen++;
  document.body.classList.remove('bv'); $('#bible').hidden=true; $('.bvnav').hidden=true;
  $$('.bpill').forEach(el=>el.classList.remove('on'));
  $('#bibleFallback').hidden=true;
  const fr=resetBibleFrame(); if(fr) fr.hidden=true;
}
function backFromBible(){ if(bvPushed){ history.back(); return } if(bvFrom==='month') showMonth(mvYM); else show(cur) }
/* ---------- month view (opens on launch) ---------- */
let view='day', mvYM=MONTHS[0], dayPushed=false, pvFrom='day';
const vmonth=h=>MONTHS.includes(h)?h:'';
const monthTitle=(ym,A)=>{const M=+ym.slice(5,7);return (A?MON_AR[M-1]:MON_EN[M-1])+' '+ym.slice(0,4)};
function showMonth(ym,opts){
  opts=opts||{}; if(!MONTHS.includes(ym)) ym=ym<MONTHS[0]?MONTHS[0]:MONTHS[MONTHS.length-1];
  if(prayersOpen) closePrayers();
  if(bibleOpen) closeBible();
  const was=view; view='month'; mvYM=ym; dayPushed=false;
  document.body.classList.add('mv'); $('#day').hidden=true; $('#month').hidden=false; $('.mvnav').hidden=false;
  if(!opts.noHash&&location.hash!=='#'+ym) history.replaceState(null,'','#'+ym);
  $('#btnToday').classList.remove('on');
  if(was!=='month'||!opts.keepScroll) window.scrollTo(0,0);
  return renderMonth();
}
async function renderMonth(){
  const ym=mvYM, A=lang==='ar', B=lang==='both', u=ui(), today=sydneyToday(), Y=+ym.slice(0,4), M=+ym.slice(5,7), mi=MONTHS.indexOf(ym);
  const t1=$('#mvTitle'); t1.textContent=monthTitle(ym,A); t1.lang=A?'ar':'en';
  $('#mvPrev').disabled=mi<=0; $('#mvNext').disabled=mi>=MONTHS.length-1;
  let idx, mj=null;
  try{[idx,mj]=await Promise.all([loadIndex(),MV_MONTH(ym).catch(()=>null)])}catch(e){$('#month').innerHTML='<p class="loading">'+esc(u.notyet)+' '+esc(e.message)+'</p>';return}
  if(view!=='month'||mvYM!==ym) return;
  MV_SUB(ym,mj,A,B,idx);
  const byD={}; idx.forEach(e=>byD[e.d]=e);
  const first=new Date(Date.UTC(Y,M-1,1)), lead=(first.getUTCDay()+6)%7, n=new Date(Date.UTC(Y,M,0)).getUTCDate(), WD=A?WD_AR:WD_EN, NL=A?'ar':'en';
  let g=WD.map((w,i)=>`<div class="wd${i===6?' sun':''}" lang="${NL}">${w}</div>`).join('');
  for(let i=0;i<lead;i++) g+='<div class="blank"></div>';
  const feasts=[];
  for(let dd=1;dd<=n;dd++){
    const iso=`${ym}-${String(dd).padStart(2,'0')}`, e=byD[iso], wd=(lead+dd-1)%7;
    if(!e){ g+=`<button type="button" class="day na" disabled aria-hidden="true"><span class="dn">${dd}</span></button>`; continue }  // outside the calendar's range
    const main=e.n.find(x=>x[2]===1)||e.n[0], nm=main?shortName(A?main[1]:main[0],A):'';
    const ft=MV_FEAST(iso,e,wd,main,mj); if(ft) feasts.push([iso,dd,e,wd,ft]);
    const cls=['day',e.r||wd===6?'r':'',e.g?'g':'',wd===6?'sun':'',iso===today?'t':'',iso===cur&&iso!==today?'sel':''].filter(Boolean).join(' ');
    const lab=`${dd} ${A?MON_AR[M-1]:MON_EN[M-1]} ${Y}${main?' – '+(A?main[1]:main[0]):''}`;
    g+=`<button type="button" class="${cls}" data-d="${iso}" aria-label="${esc(lab)}"${iso===today?' aria-current="date"':''}><span class="dn">${dd}</span>${MV_CELL(iso,e,A)}<span class="nm" lang="${NL}">${esc(nm)}</span></button>`;
  }
  let h=notice?`<p class="note">${esc(notice)}</p>`:'';
  h+=`<div class="mgrid" id="mvGrid" role="grid">${g}</div><p class="mhint">${esc(u.tapday)}</p>`;
  if(feasts.length){
    h+=`<h2 class="sec">${esc(u.feasts)}</h2><div class="mfeasts">`+feasts.map(([iso,dd,e,wd,ft])=>{
      const t=B?`${esc(ft.en)} <span class="small" lang="ar" dir="rtl">· ${esc(ft.ar)}</span>`:A?`<span lang="ar">${esc(ft.ar)}</span>`:esc(ft.en);
      return `<button type="button" class="mf${e.g?' g':''}" data-d="${iso}"><span class="mfd">${dd}<small lang="${NL}">${WD[wd]}</small></span><span class="mft">${e.g?'★ ':''}${t}</span></button>`}).join('')+'</div>';
  }
  h+=`<div class="mfoot"><label><span>${esc(u.goto)}</span> <input type="date" id="mvPick" min="${FIRST}" max="${LAST}" value="${cur||''}"></label></div>`;
  h+=`<p class="legend">${esc(u.mlegend)}</p>`;
  const box=$('#month'); box.innerHTML=h; box.dataset.month=ym;
  $('#mvPick').onchange=e=>{if(valid(e.target.value)) openDay(e.target.value)};
}
function openDay(iso){ iso=clamp(iso); if(view==='month'&&!prayersOpen){ history.pushState(null,'','#'+iso); dayPushed=true } show(iso) }
function stepMonth(n){ const i=MONTHS.indexOf(mvYM)+n; if(i>=0&&i<MONTHS.length) showMonth(MONTHS[i]) }
function backToMonth(){ if(dayPushed){ history.back(); return } showMonth(cur.slice(0,7)) }
function rtlArrows(){ const R=document.documentElement.dir==='rtl';
  $('#mvPrev').textContent=$('#btnPrev').textContent=R?'›':'‹'; $('#mvNext').textContent=$('#btnNext').textContent=R?'‹':'›'; $('#btnMonthArr').textContent=R?'›':'‹' }
function openPanel(id){$$('.panel').forEach(p=>p.hidden=true);$(id).hidden=false}
function closePanels(){$$('.panel').forEach(p=>p.hidden=true)}

/* ---------- search (English + Arabic, Arabic normalised: no diacritics, alef/yaa/taa-marbuta variants) ---------- */
const norm=s=>String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  .replace(/[\u064B-\u065F\u0670\u0640]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/ؤ/g,'و').replace(/ئ/g,'ي')
  .replace(/^ال|\sال/g,m=>m.replace('ال',''));
async function doSearch(){
  const q=norm($('#q').value.trim()), u=ui(), out=$('#results'), A=lang==='ar';
  if(q.replace(/\s/g,'').length<2){out.innerHTML=`<div class="cnt">${u.type2}</div>`;return}
  const idx=await loadIndex(), words=q.split(/\s+/).filter(Boolean); let res=[];
  for(const e of idx){
    const hits=e.n.filter(n=>{const s=norm(n[0]+' '+n[1]);return words.every(w=>s.includes(w))});
    if(hits.length) res.push([e,hits]);
  }
  if(!res.length){out.innerHTML=`<div class="cnt">${u.nores}</div>`;return}
  out.innerHTML=`<div class="cnt">${u.results(res.length)}</div>`+res.slice(0,300).map(([e,hits])=>{
    const d=new Date(e.d+'T00:00:00Z'), lab=A?`${d.getUTCDate()} ${MON_AR[d.getUTCMonth()]}`:`${d.getUTCDate()} ${MON_EN[d.getUTCMonth()]}`;
    return `<button type="button" class="res" data-d="${e.d}"><div class="d">${lab} 2026${e.g?' ★':''}</div>`+
      hits.map(n=>{const c=n[2]===1?'redb':n[2]===2?'blue':'';return A?`<div class="${c}" lang="ar">${esc(n[1])} <span class="small" dir="ltr">· ${esc(n[0])}</span></div>`
        :`<div class="${c}">${esc(n[0])} <span class="small" dir="rtl" lang="ar">· ${esc(n[1])}</span></div>`}).join('')+'</button>';
  }).join('');
}

/* ---------- read aloud (Web Speech API) ---------- */
const TTS=(function(){
  const S=window.speechSynthesis, ok=!!(S&&window.SpeechSynthesisUtterance);
  const st={q:[],i:0,playing:false,paused:false,date:null,key:'',token:0,hl:null};

  /* ---- keep the screen on while reading aloud.
     Screen Wake Lock API (Safari 16.4+, home-screen apps from iOS 18.4, Chrome/Android); on older iOS a tiny silent,
     muted, looping inline video (bundled below, 2 s, 16x16) is played instead, the NoSleep technique. Held only while
     speech is actually playing: released on finish, pause, stop, error-stop and when the app goes to the background;
     taken again when the app comes back while still reading. The phone's Auto-Lock setting is not changed. */
  const Awake=(function(){
    const ua=navigator.userAgent||'';
    const iosV=(()=>{let m=/(?:iPhone|iPad|iPod)[^)]*? OS (\d+)_(\d+)/.exec(ua); if(!m&&/Macintosh/.test(ua)&&navigator.maxTouchPoints>1) m=/Version\/(\d+)\.(\d+)/.exec(ua); return m?(+m[1])+(+m[2])/100:0})();
    const standalone=()=>!!(navigator.standalone||(window.matchMedia&&matchMedia('(display-mode: standalone)').matches));
    // Home-screen apps before iOS 18.4 expose navigator.wakeLock but it does not keep the screen on, so use the video there.
    const wlUsable=()=>!!(navigator.wakeLock&&navigator.wakeLock.request)&&!(iosV&&iosV<18.04&&standalone());
    const MP4='data:video/mp4;base64,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';
    let want=false, lock=null, pending=null, vid=null;
    function video(){
      if(!vid){ vid=document.createElement('video'); vid.muted=true; vid.defaultMuted=true; vid.loop=true; vid.playsInline=true;
        ['muted','playsinline','webkit-playsinline','loop'].forEach(a=>vid.setAttribute(a,'')); vid.setAttribute('aria-hidden','true'); vid.setAttribute('tabindex','-1'); vid.preload='auto';
        vid.style.cssText='position:fixed;left:0;bottom:0;width:1px;height:1px;opacity:0.01;pointer-events:none;z-index:-1';
        vid.src=MP4; document.body.appendChild(vid) }
      return vid;
    }
    function playVideo(){ try{ const v=video(); if(!v.paused) return; const p=v.play(); if(p&&p.catch) p.catch(()=>{}) }catch(e){} }
    function stopVideo(){ if(vid&&!vid.paused){ try{vid.pause()}catch(e){} } }
    function acquire(){
      if(!want||document.visibilityState==='hidden') return;
      if(!wlUsable()){ playVideo(); return }
      if(lock&&!lock.released) return; if(pending) return;
      try{
        pending=navigator.wakeLock.request('screen').then(l=>{ pending=null;
          if(!want||document.visibilityState==='hidden'){ try{l.release()}catch(e){} return }
          lock=l; stopVideo(); try{ l.addEventListener('release',()=>{ if(lock===l) lock=null }) }catch(e){}
        },()=>{ pending=null; if(want) playVideo() });
      }catch(e){ pending=null; playVideo() }
    }
    function drop(){ const l=lock; lock=null; if(l){ try{ const p=l.release(); if(p&&p.catch) p.catch(()=>{}) }catch(e){} } stopVideo() }
    function on(){ want=true; acquire() }
    function off(){ want=false; drop() }
    document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='hidden') drop(); else if(want) acquire() });
    window.addEventListener('pagehide',drop);
    window.addEventListener('pageshow',()=>{ if(want) acquire() });
    return {on,off,get held(){return !!((lock&&!lock.released)||(vid&&!vid.paused))},get wanted(){return want},get mode(){return wlUsable()?'wakelock':'video'}};
  })();
  let scope=LS.get('tts.scope','all'), pscope=LS.get('tts.pscope','all'), tlang=LS.get('tts.lang',null), rate=+LS.get('tts.rate',1);
  const ARPREF=['ar-lb','ar-sy','ar-jo'];
  const vl=v=>(v.lang||'').replace('_','-').toLowerCase();
  function voices(){try{return ok?S.getVoices()||[]:[]}catch(e){return []}}
  function listFor(L){
    const vs=voices();
    const pr=L==='en'?['en-au','en-gb','en-us']:ARPREF, base=L==='en'?'en':'ar';
    return vs.filter(v=>vl(v).split('-')[0]===base).sort((a,b)=>{const ia=pr.indexOf(vl(a)),ib=pr.indexOf(vl(b));return (ia<0?9:ia)-(ib<0?9:ib)});
  }
  function voiceFor(L){const l=listFor(L), saved=LS.get('tts.voice.'+L,null); return l.find(v=>v.voiceURI===saved)||l[0]||null}
  function effLang(){return tlang||(lang==='both'?'both':lang)}
  function note(){
    const L=effLang(); if(L==='en') return '';
    const v=voiceFor('ar'), A=lang==='ar';
    if(!v) return A?'لا يوجد صوت عربيّ على هذا الهاتف، لذلك لا يمكن قراءة النصّ العربيّ بصوت عالٍ. أضف صوتًا عربيًّا من إعدادات الهاتف (تسهيلات الاستخدام ← المحتوى المنطوق / تحويل النصّ إلى كلام).'
                   :'No Arabic voice on this phone, so the Arabic text cannot be read aloud. Add an Arabic voice in the phone settings (Accessibility → Spoken Content / Text-to-speech).';
    if(ARPREF.includes(vl(v))) return '';
    return A?`لا يوجد صوت لبنانيّ أو سوريّ أو أردنيّ على هذا الهاتف – يُستعمَل الصوت العربيّ ${v.name} (${v.lang}).`
            :`No Lebanese, Syrian or Jordanian Arabic voice on this phone – using ${v.name} (${v.lang}).`;
  }
  // ---- spoken text helpers
  const clean=t=>String(t||'').replace(/★/g,'').replace(/[\[\]“”„"«»()]/g,'').replace(/\s+[–—]\s+/g,'، ').replace(/\s*·\s*/g,'، ').replace(/\s+/g,' ').trim();
  const cleanE=t=>clean(t).replace(/،/g,',');
  const BK_EN={'Matt.':'Matthew','Mark':'Mark','Luke':'Luke','John':'John','Acts':'Acts','Rom.':'Romans','1 Cor.':'First Corinthians','2 Cor.':'Second Corinthians','Gal.':'Galatians','Eph.':'Ephesians','Phil.':'Philippians','Col.':'Colossians','1 Thess.':'First Thessalonians','2 Thess.':'Second Thessalonians','1 Tim.':'First Timothy','2 Tim.':'Second Timothy','Titus':'Titus','Philem.':'Philemon','Heb.':'Hebrews','James':'James','1 Pet.':'First Peter','2 Pet.':'Second Peter','1 John':'First John','2 John':'Second John','3 John':'Third John','Jude':'Jude','Gen.':'Genesis','Exod.':'Exodus','Prov.':'Proverbs','Isa.':'Isaiah','Joel':'Joel','Zech.':'Zechariah','Ezek.':'Ezekiel','Jer.':'Jeremiah','Job':'Job','Wis.':'Wisdom','Mic.':'Micah','Zeph.':'Zephaniah','Mal.':'Malachi','Bar.':'Baruch','Dan.':'Daniel','Deut.':'Deuteronomy','Num.':'Numbers','Lev.':'Leviticus','Josh.':'Joshua','Judg.':'Judges','1 Kgs.':'First Kings','2 Kgs.':'Second Kings','Jonah':'Jonah'};
  const BK_AR={'مت':'إنجيل متّى','مر':'إنجيل مرقس','لو':'إنجيل لوقا','يو':'إنجيل يوحنّا','أع':'أعمال الرسل','رو':'الرسالة إلى أهل رومية','1 كو':'الرسالة الأولى إلى أهل كورنثوس','2 كو':'الرسالة الثانية إلى أهل كورنثوس','غل':'الرسالة إلى أهل غلاطية','أف':'الرسالة إلى أهل أفسس','في':'الرسالة إلى أهل فيلبّي','كو':'الرسالة إلى أهل كولوسّي','1 تس':'الرسالة الأولى إلى أهل تسالونيكي','2 تس':'الرسالة الثانية إلى أهل تسالونيكي','1 تي':'الرسالة الأولى إلى تيموثاوس','2 تي':'الرسالة الثانية إلى تيموثاوس','تي':'الرسالة إلى تيطس','فل':'الرسالة إلى فيلمون','عب':'الرسالة إلى العبرانيّين','يع':'رسالة يعقوب','1 بط':'رسالة بطرس الأولى','2 بط':'رسالة بطرس الثانية','1 يو':'رسالة يوحنّا الأولى','2 يو':'رسالة يوحنّا الثانية','3 يو':'رسالة يوحنّا الثالثة','يه':'رسالة يهوذا','تك':'سفر التكوين','خر':'سفر الخروج','أم':'سفر الأمثال','إش':'نبوءة إشعياء','يوء':'نبوءة يوئيل','زك':'نبوءة زكريّا','حز':'نبوءة حزقيال','إر':'نبوءة إرميا','أي':'سفر أيّوب','حك':'سفر الحكمة','مي':'نبوءة ميخا','صف':'نبوءة صفنيا','ملا':'نبوءة ملاخي','با':'نبوءة باروخ','دا':'نبوءة دانيال','تث':'سفر تثنية الاشتراع','عد':'سفر العدد','لا':'سفر اللاويّين','يش':'سفر يشوع','قض':'سفر القضاة','1 مل':'سفر الملوك الأوّل','2 مل':'سفر الملوك الثاني','يون':'نبوءة يونان'};
  function vv(s,E){ // "20–21, 40–52" | "26–8:2" | "8"
    const W=E?{c:'chapter',v:'verse',vs:'verses',to:'to',and:'and'}:{c:'الإصحاح',v:'الآية',vs:'الآيات',to:'إلى',and:'و'};
    return s.split(/\s*[,،]\s*/).map((r,i)=>{const m=r.match(/^(\d+)\s*[-–]\s*(?:(\d+)\s*:\s*)?(\d+)$/);
      if(!m) return (i?'':W.v+' ')+r; if(m[2]) return `${W.vs} ${m[1]} ${W.to} ${W.c} ${m[2]} ${W.v} ${m[3]}`; return `${i?'':W.vs+' '}${m[1]} ${W.to} ${m[3]}`}).join(E?' and ':' و');
  }
  function ref(s,E){
    const BK=E?BK_EN:BK_AR, keys=Object.keys(BK).sort((a,b)=>b.length-a.length), W=E?'chapter':'الإصحاح'; let book=null;
    return s.split(/\s*[;؛]\s*/).map(seg=>{seg=seg.trim(); const kb=keys.find(k=>seg.startsWith(k+' ')||seg.startsWith(k)&&/^\d/.test(seg.slice(k.length)));
      let pre=''; if(kb){ if(kb!==book){book=kb;pre=(E?'from ':'من ')+BK[kb]+(E?', ':'، ')} seg=seg.slice(kb.length).trim() }
      const m=seg.match(/^(\d+)\s*:\s*(.+)$/); return pre+(m?`${W} ${m[1]}${E?', ':'، '}${vv(m[2],E)}`:seg)}).join(E?'; ':'؛ ');
  }
  function heading(h,E){
    if(E){const m=h.match(/^(.+?)(?: \((.+?)\))?: (.+)$/); if(!m) return cleanE(h); return `${m[1]}${m[2]?', '+m[2]:''}: ${ref(m[3],true)}.`}
    const m=h.match(/^(.*?)\s*\(([^()]+)\)\s*$/); if(!m) return clean(h); return `${m[1]}: ${ref(m[2],false)}.`;
  }
  const ABBR=/(?:^|\s)(St|Sts|Ss|Ven|Matt|Rom|Gal|Heb|Eph|Phil|Col|Gen|Isa|Prov|Zech|Cor|Thess|Tim|Pet|Mr|Mrs|Dr|cf|ch|vv?|p|[A-Z])\.$/;
  function chunks(t,E){
    t=E?cleanE(t):clean(t); if(!t) return [];
    let s=t.split(/(?<=[.!?…؟؛])\s+/), out=[];
    for(const p of s){ if(out.length&&ABBR.test(out[out.length-1])) out[out.length-1]+=' '+p; else out.push(p) }
    const fin=[];
    for(let p of out){
      while(p.length>220){
        let cut=-1; for(const re of [/[,;:،]\s/g,/\s/g]){re.lastIndex=0;let m;while((m=re.exec(p))&&m.index<200) cut=m.index+1; if(cut>60) break}
        if(cut<=0) cut=200; fin.push(p.slice(0,cut).trim()); p=p.slice(cut).trim();
      }
      if(p) fin.push(p);
    }
    return fin;
  }
  function build(d,sc,L){
    const q=[], E=L==='en', u=T[L], add=(k,t)=>chunks(t,E).forEach(c=>q.push({k:L+':'+k,t:c,L,d:d.date}));
    const saints=()=>{ add('it0',u.saints+'.'); d.items.forEach((it,i)=>add('it'+i,(E?it.en:it.ar)+'.')) };
    const lives=()=>{ if(!d.saints.length) return; add('s0n',u.lives+'.');
      d.saints.forEach((s,i)=>{ add('s'+i+'n',(E?s.name_en:s.name_ar)+'.');
        s.parts.forEach((p,j)=>add('s'+i+'p'+j,((E?p.lab_en:p.lab_ar)?(E?p.lab_en+'. ':p.lab_ar+': '):'')+(E?p.en:p.ar)))})};
    const head=()=>{ add('hd',(E?d.head_en:d.head_ar)+'.'); if(d.star) add('star',E?d.star_en:d.star_ar); if(E?d.week_en:d.week_ar) add('week',E?d.week_en:d.week_ar) };
    const rd=(withText)=>d.readings.forEach((r,i)=>{ add('r'+i+'h',heading(E?r.h_en:r.h_ar,E)); if(withText&&r.official) add('r'+i+'t',E?r.en:r.ar); else if(withText) add('r'+i+'s',E?r.note_en:r.note_ar) });
    const com=()=>add('com',u.commentary+(E?'. ':': ')+(E?d.com_en:d.com_ar));
    if(sc==='all'){
      head(); saints(); rd(true); com();
      if(d.notes.length){ add('n0',u.notes+'.'); d.notes.forEach((n,j)=>add('n'+j,E?n.en:n.ar)) }
      lives();
    } else if(sc==='saints'){ head(); saints(); lives() }
    else if(sc==='readings'){ head(); if(!d.readings.length) add('hd',u.noread); rd(true) }
    else if(sc==='commentary'){ head(); rd(false); com() }
    return q;
  }
  function buildPrayers(d,sc,L){
    const q=[], langs=L==='both'?['en','ar']:[L], add=(Lx,k,t)=>chunks(t,Lx==='en').forEach(c=>q.push({k:Lx+':'+k,t:c,L:Lx,d:'prayers'}));
    const dot=t=>/[.!?:…؟]$/.test(t)?t:t+'.';
    d.sections.forEach((s,si)=>{ if(sc!=='all'&&sc!==s.id) return;
      langs.forEach(Lx=>add(Lx,'s'+si,dot(s['title_'+Lx])));
      s.prayers.forEach((p,pi)=>langs.forEach(Lx=>{ const g=f=>p[f+'_'+Lx]||'', b='p'+si+'.'+pi+'.';
        if(Lx==='ar'&&!p.text_ar) return;   // no published Arabic text: nothing to read in Arabic
        if(g('title')) add(Lx,b+'t',dot(g('title'))+(g('sub')?' '+dot(g('sub')):''));
        if(g('rubric')) add(Lx,b+'r',g('rubric'));
        g('text').split('\n\n').filter(Boolean).forEach((t,j)=>add(Lx,b+'x'+j,t));
        if(g('after')) add(Lx,b+'a',g('after'));
      }));
    });
    return q;
  }
  const ctx=()=>prayersOpen?'prayers':cur;
  // ---- playback
  function clearHl(){ if(st.hl){st.hl.classList.remove('speaking');st.hl=null} }
  function highlight(it){
    clearHl(); if(!it) return; const m=it.d==='prayers'?$('#prayers'):$('#day'); if(m.hidden||m.dataset.date!==it.d) return;
    const el=m.querySelector(`[data-k="${it.k}"]`); if(!el) return;
    let p=el.parentElement; while(p&&p!==m){ if(p.tagName==='DETAILS'&&!p.open){p.dataset.prog='1';p.open=true;const pp=p;setTimeout(()=>delete pp.dataset.prog,0)} p=p.parentElement }
    el.classList.add('speaking'); st.hl=el;
    const r=el.getBoundingClientRect(), top=$('#top').offsetHeight, bot=window.innerHeight-$('#ttsBar').offsetHeight;
    if(r.top<top||r.top>bot-40) window.scrollTo({top:window.scrollY+r.top-top-20,behavior:'smooth'});
  }
  function speakNext(){
    const my=st.token;
    if(st.i>=st.q.length){ stop(true); return }
    const it=st.q[st.i], v=voiceFor(it.L);
    if(it.L==='ar'&&!v){ st.i++; return speakNext() }   // no Arabic voice: skip Arabic text (note is shown)
    const u=new SpeechSynthesisUtterance(it.t);
    if(v){u.voice=v;u.lang=v.lang} else u.lang=it.L==='en'?'en-AU':'ar-LB';
    u.rate=rate;
    u.onend=()=>{ if(my!==st.token) return; st.i++; speakNext() };
    u.onerror=e=>{ if(my!==st.token) return; if(e&&(e.error==='interrupted'||e.error==='canceled')) return; st.i++; speakNext() };
    highlight(it); status();
    try{ S.speak(u) }catch(e){ st.i++; setTimeout(speakNext,0) }
  }
  function status(){
    const u=ui(); $('#ttsPlay').textContent=st.playing&&!st.paused?'❚❚':'▶'; $('#ttsPlay').setAttribute('aria-label',st.playing&&!st.paused?'Pause':'Play');
    let s=''; if(st.playing){ let lab; if(st.date==='prayers') lab=u.prayers; else { const d=new Date(st.date+'T00:00:00Z'); lab=`${d.getUTCDate()} ${(lang==='ar'?MON_AR:MON_EN)[d.getUTCMonth()]}` } s=(st.paused?u.paused:u.reading)+` · ${lab} · ${Math.min(st.i+1,st.q.length)}/${st.q.length}` }
    $('#ttsNow').textContent=s; $$('.speak').forEach(b=>b.classList.toggle('on',st.playing&&st.date===ctx()));
    $('#ttsNote').textContent=note();
  }
  // Wake lock is asked for synchronously inside the tap, before any await (keeps the user gesture for the iOS video fallback).
  function start(){ Awake.on(); return start0().catch(e=>{ if(!st.playing||st.paused) Awake.off(); throw e }) }
  async function start0(){
    const c=ctx(), L=effLang();
    if(c==='prayers'){ const d=await loadPrayers(); st.q=buildPrayers(d,pscope,L); st.key=c+pscope+L }
    else { const r=await getDay(c); if(!r.day){ if(!st.playing) Awake.off(); return } st.q=(L==='both'?['en','ar']:[L]).flatMap(x=>build(r.day,scope,x)); st.key=c+scope+L }
    st.i=0; st.date=c;
    st.token++; try{S.cancel()}catch(e){}
    st.playing=true; st.paused=false; speakNext();
  }
  function pause(){ st.token++; st.paused=true; Awake.off(); try{S.cancel()}catch(e){} status() }
  function resume(){ st.paused=false; st.token++; Awake.on(); speakNext() }
  function stop(finished){ st.token++; Awake.off(); try{S.cancel()}catch(e){} st.playing=false; st.paused=false; st.i=0; clearHl(); status(); if(finished===true) $('#ttsNow').textContent=ui().done }
  function restartChunk(){ if(st.playing&&!st.paused){ st.token++; try{S.cancel()}catch(e){} speakNext() } }
  function fillVoices(){
    [['en','#ttsVoiceEn'],['ar','#ttsVoiceAr']].forEach(([L,id])=>{
      const l=listFor(L), sel=$(id), cv=voiceFor(L);
      sel.innerHTML=l.length?l.map(v=>`<option value="${esc(v.voiceURI)}"${cv&&v.voiceURI===cv.voiceURI?' selected':''}>${esc(v.name)} (${esc(v.lang)})</option>`).join('')
                            :`<option value="">${L==='en'?'—':(lang==='ar'?'لا يوجد صوت عربيّ':'no Arabic voice available')}</option>`;
    });
    const L=effLang(); $('#rowVEn').hidden=L==='ar'; $('#rowVAr').hidden=L==='en';
    status();
  }
  function labels(){
    if(!ok) return; const u=ui();
    const opts=prayersOpen?[['all',u.pAll],...['morning','addl','midday','evening'].map(x=>[x,u.pSec[x]])]:[['all',u.scopeAll],['saints',u.scopeSaints],['readings',u.scopeRead],['commentary',u.scopeCom]], cs=prayersOpen?pscope:scope;
    $('#ttsScope').innerHTML=opts.map(([v,t])=>`<option value="${v}"${v===cs?' selected':''}>${t}</option>`).join('');
    const L=effLang(); $('#ttsLang').innerHTML=[['en','EN – '+u.lEn],['ar','عربي – '+u.lAr],['both','EN+عربي – '+u.lBoth]].map(([v,t])=>`<option value="${v}"${v===L?' selected':''}>${t}</option>`).join('');
    $('#ttsRate').value=String(rate); fillVoices();
  }
  function init(){
    if(!ok) return;
    try{ S.addEventListener?S.addEventListener('voiceschanged',fillVoices):(S.onvoiceschanged=fillVoices) }catch(e){}
    $('#ttsPlay').onclick=()=>{ if(!st.playing) start(); else if(st.paused) resume(); else pause() };
    $('#ttsStop').onclick=()=>stop();
    $('#ttsClose').onclick=()=>{ stop(); $('#ttsBar').hidden=true; document.body.style.paddingBottom='' };
    $('#ttsScope').onchange=e=>{ if(prayersOpen){ pscope=e.target.value; LS.set('tts.pscope',pscope) } else { scope=e.target.value; LS.set('tts.scope',scope) } if(st.playing) start() };
    $('#ttsLang').onchange=e=>{ tlang=e.target.value; LS.set('tts.lang',tlang); fillVoices(); if(st.playing) start() };
    $('#ttsRate').onchange=e=>{ rate=+e.target.value; LS.set('tts.rate',rate); restartChunk() };
    $('#ttsVoiceEn').onchange=e=>{ LS.set('tts.voice.en',e.target.value); restartChunk() };
    $('#ttsVoiceAr').onchange=e=>{ LS.set('tts.voice.ar',e.target.value); status(); restartChunk() };
    labels();
  }
  function fromDay(){
    $('#ttsBar').hidden=false; document.body.style.paddingBottom=$('#ttsBar').offsetHeight+'px'; fillVoices();
    if(st.playing&&st.date===ctx()){ if(st.paused) resume(); return }
    start();
  }
  function refreshDay(){ if(st.playing&&!st.paused) highlight(st.q[st.i]); status() }
  return {ok,init,stop,labels,_awake:Awake,fromDay,refreshDay,_state:st,_build:build,_buildPrayers:buildPrayers,_heading:heading,_chunks:chunks,_note:note,_voiceFor:voiceFor};
})();
window.AOD_TTS=TTS;

/* ---------- wiring ---------- */
function init(){
  TTS.init(); applySettings();
  $('#btnPrev').onclick=()=>step(-1); $('#btnNext').onclick=()=>step(1);
  $('#btnToday').onclick=()=>openDay(todayInRange());
  $('#btnMonth').onclick=backToMonth;
  $('#mvPrev').onclick=()=>stepMonth(-1); $('#mvNext').onclick=()=>stepMonth(1);
  $('#month').addEventListener('click',e=>{const b=e.target.closest('button[data-d]'); if(b) openDay(b.dataset.d)});
  $('#btnPrayers').onclick=()=>prayersOpen?backToCalendar():openPrayers(true);
  $('#btnBack').onclick=backToCalendar;
  $$('.bpill').forEach(el=>el.onclick=()=>{const k=el.dataset.bible; if(bibleOpen&&bibleSrc===k) backFromBible(); else openBible(k,true)});
  $('#btnBibleBack').onclick=backFromBible;
  window.addEventListener('online',()=>{ if(bibleOpen) syncBibleFrame() }); window.addEventListener('offline',()=>{ if(bibleOpen) syncBibleFrame() });
  $$('#langSeg button').forEach(b=>b.onclick=()=>{lang=b.dataset.lang;LS.set('lang',lang);applySettings();updateNav();if(bibleOpen){}else if(prayersOpen)renderPrayers();else if(view==='month')renderMonth();else show(cur,{keepScroll:true})});
  $('#btnCal').onclick=backToMonth;
  $('#btnSearch').onclick=()=>{openPanel('#searchPanel');setTimeout(()=>$('#q').focus(),50);doSearch()};
  let qt; $('#q').oninput=()=>{clearTimeout(qt);qt=setTimeout(doSearch,150)};
  $('#results').onclick=e=>{const b=e.target.closest('[data-d]');if(b){closePanels();openDay(b.dataset.d)}};
  $('#btnMenu').onclick=()=>{openPanel('#menuPanel');loadAbout()};
  $$('[data-close]').forEach(b=>b.onclick=closePanels);
  $$('.panel').forEach(p=>p.addEventListener('click',e=>{if(e.target===p)closePanels()}));
  $('#fsDown').onclick=()=>{fs=FS[Math.max(0,FS.indexOf(fs)-1)]||18;LS.set('fs',fs);applySettings()};
  $('#fsUp').onclick=()=>{fs=FS[Math.min(FS.length-1,FS.indexOf(fs)+1)]||18;LS.set('fs',fs);applySettings()};
  $('#fsReset').onclick=()=>{fs=18;LS.set('fs',fs);applySettings()};
  $$('#themeSeg button').forEach(b=>b.onclick=()=>{theme=b.dataset.theme;LS.set('theme',theme);applySettings()});
  const setAll=v=>{Object.keys(open).forEach(k=>open[k]=v);LS.set('open',open);$$('#day details').forEach(d=>d.open=v);
    if(prayersOpen){Object.keys(popen).forEach(k=>popen[k]=v);LS.set('popen',popen);$$('#prayers details').forEach(d=>d.open=v)}};
  $('#openAll').onclick=()=>setAll(true); $('#closeAll').onclick=()=>setAll(false);
  document.addEventListener('keydown',e=>{ if(e.target.matches('input,select,textarea'))return;
    const rtl=document.documentElement.dir==='rtl';
    if(e.key==='Escape')closePanels(); else if(prayersOpen||bibleOpen) return; else if(view==='month'){ if(e.key==='ArrowLeft')stepMonth(rtl?1:-1); else if(e.key==='ArrowRight')stepMonth(rtl?-1:1) } else if(e.key==='ArrowLeft')step(rtl?1:-1); else if(e.key==='ArrowRight')step(rtl?-1:1) });
  // swipe: left = next day (both directions of text keep the same gesture as the Macedonian app)
  let sx=0,sy=0,st0=0,ok=false; const main=$('#day');
  main.addEventListener('touchstart',e=>{if(e.touches.length!==1){ok=false;return}sx=e.touches[0].clientX;sy=e.touches[0].clientY;st0=Date.now();ok=true},{passive:true});
  main.addEventListener('touchend',e=>{ if(!ok)return; ok=false; const t=e.changedTouches[0],dx=t.clientX-sx,dy=t.clientY-sy;
    if(Math.abs(dx)>60&&Math.abs(dx)>1.8*Math.abs(dy)&&Date.now()-st0<800&&!String(window.getSelection()||'')) step(dx<0?1:-1) },{passive:true});
  // swipe on the month view: left = next month (same gesture as the day view)
  const mv=$('#month'); let mx=0,my=0,mt=0,mok=false;
  mv.addEventListener('touchstart',e=>{if(e.touches.length!==1){mok=false;return}mx=e.touches[0].clientX;my=e.touches[0].clientY;mt=Date.now();mok=true},{passive:true});
  mv.addEventListener('touchend',e=>{ if(!mok)return; mok=false; const t=e.changedTouches[0],dx=t.clientX-mx,dy=t.clientY-my;
    if(Math.abs(dx)>60&&Math.abs(dx)>1.8*Math.abs(dy)&&Date.now()-mt<800) stepMonth(dx<0?1:-1) },{passive:true});
  window.addEventListener('hashchange',()=>{const h=location.hash.slice(1);
    if(BIBLE_HASH[h]){ if(prayersOpen) closePrayers(); openBible(BIBLE_HASH[h],false); return }
    if(h==='prayers'){ if(bibleOpen) closeBible(); if(!prayersOpen) openPrayers(false); return }
    const mm=vmonth(h);
    if(mm){ const t=view==='day'?cur.slice(0,7):mm; if(bibleOpen||prayersOpen||view!=='month'||mvYM!==t) showMonth(t,{noHash:t===mm}); return }
    if(valid(h)){ if(view!=='day'||prayersOpen||bibleOpen||h!==cur) show(h); return }
    if(!h) showMonth(cur.slice(0,7),{noHash:true}) });
  $('#foot').innerHTML='Sources: دليل الكرسي الأنطاكي 2026 (Antiochian Typikon 2026, Patriarchate of Antioch) · official Arabic service texts of the Antiochian Orthodox Christian Archdiocese of North America where published · prayers: antiochian.org (English) and the Antiochian Arabic prayer book texts (صلاة النهوض من النوم، صلاة النوم الصغرى) · day icons from Wikimedia Commons (public domain / free licences, credited under each icon). Works offline. No tracking.';
  $('#foot').innerHTML=mix($('#foot').textContent);
  // On launch the app opens on the current month; deep links (#YYYY-MM-DD, #YYYY-MM, #prayers, #bible, #bible-ar) still work.
  const h=location.hash.slice(1); cur=todayInRange(); updateNav();
  if(valid(h)) show(h); else { showMonth(vmonth(h)||cur.slice(0,7)); if(h==='prayers') openPrayers(false); else if(BIBLE_HASH[h]) openBible(BIBLE_HASH[h],false) }
  loadIndex().catch(()=>{});
  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('sw.js').then(()=>navigator.serviceWorker.ready).then(()=>{window.AOD_SW='ready';navigator.serviceWorker.ready.then(reg=>{if(reg.active)reg.active.postMessage('warm-icons')}).catch(()=>{});$('#swStatus').textContent=ui().offline})
      .catch(e=>{window.AOD_SW='error: '+e.message;$('#swStatus').textContent=ui().offlineNo});
  } else $('#swStatus').textContent=ui().offlineNo;
}
let aboutDone=false;
async function loadAbout(){
  if(aboutDone) return; aboutDone=true;
  try{const a=await (await fetch('data/about.json')).json();
    $('#aboutBody').innerHTML=a.cover.map(c=>`<p class="small">${mix(c).replace(/\n/g,'<br>')}</p>`).join('')+'<ul>'+a.howto_en.map(x=>`<li>${mix(x)}</li>`).join('')+'</ul>'
      +'<ul dir="rtl" lang="ar" class="arsec">'+a.howto_ar.map(x=>`<li>${esc(x)}</li>`).join('')+'</ul>';}catch(e){aboutDone=false}
}
window.AOD={openBible,closeBible:backFromBible,get bibleOpen(){return bibleOpen},get bibleSrc(){return bibleSrc},BIBLES,show,step,showMonth,openDay,backToMonth,stepMonth,get view(){return bibleOpen?'bible:'+bibleSrc:prayersOpen?'prayers':view},get month(){return mvYM},get cur(){return cur},loadMonth,sydneyToday,openPrayers,closePrayers:backToCalendar,get prayersOpen(){return prayersOpen}};
init();
})();
