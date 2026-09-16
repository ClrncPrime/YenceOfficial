import {escapeHTML,gradientCSS,taskSummary,validateTasks,markdown,sampleTasks,sampleNote} from './logic.js';

const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const reduceQuery=matchMedia('(prefers-reduced-motion: reduce)');
const coarse=matchMedia('(pointer: coarse)').matches;
const storage={
  read(key,fallback,validate){try{const item=localStorage.getItem(`jcl.portfolio.${key}`);if(item===null)return fallback;const v=JSON.parse(item);return !validate||validate(v)?v:fallback;}catch{return fallback;}},
  write(key,value){try{localStorage.setItem(`jcl.portfolio.${key}`,JSON.stringify(value));return true;}catch{return false;}}
};
let motion=storage.read('motion',!reduceQuery.matches,v=>typeof v==='boolean');
if(reduceQuery.matches)motion=false;
let toastTimeout;
function toast(message){const box=$('#toast');box.textContent=message;box.classList.add('visible');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>box.classList.remove('visible'),3200);}
function setMotion(next,persist=true){motion=Boolean(next);document.documentElement.classList.toggle('motion-off',!motion);$('#motion-toggle').setAttribute('aria-pressed',String(motion));$('#motion-toggle').setAttribute('aria-label',`Turn animations ${motion?'off':'on'}`);$('.motion-label').textContent=`Motion ${motion?'on':'off'}`;if(persist)storage.write('motion',motion);drawStill();}
$('#motion-toggle').addEventListener('click',()=>setMotion(!motion));
reduceQuery.addEventListener('change',event=>{if(event.matches)setMotion(false,false);});
$('#year').textContent=String(new Date().getFullYear());

if('IntersectionObserver' in window){
  document.documentElement.classList.add('js');
  const reveals=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');reveals.unobserve(entry.target);}}),{threshold:.08,rootMargin:'0px 0px -25px 0px'});
  $$('.reveal').forEach(el=>reveals.observe(el));
}

let scrollQueued=false;
function onScroll(){if(scrollQueued)return;scrollQueued=true;requestAnimationFrame(()=>{const max=document.documentElement.scrollHeight-innerHeight;$('.page-progress').style.transform=`scaleX(${max>0?scrollY/max:0})`;scrollQueued=false;});}
addEventListener('scroll',onScroll,{passive:true});onScroll();
if(!coarse){
  let glowPending=false;let px=0,py=0;
  document.addEventListener('pointermove',event=>{px=event.clientX;py=event.clientY;if(glowPending||!motion)return;glowPending=true;requestAnimationFrame(()=>{$('.pointer-glow').style.setProperty('--px',`${px}px`);$('.pointer-glow').style.setProperty('--py',`${py}px`);glowPending=false;});},{passive:true});
  $$('[data-tilt]').forEach(el=>{let raf;
    el.addEventListener('pointermove',event=>{if(!motion)return;cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{const r=el.getBoundingClientRect();const x=(event.clientX-r.left)/r.width-.5;const y=(event.clientY-r.top)/r.height-.5;el.style.setProperty('--ry',`${x*7}deg`);el.style.setProperty('--rx',`${-y*5}deg`);});},{passive:true});
    el.addEventListener('pointerleave',()=>{cancelAnimationFrame(raf);el.style.setProperty('--ry','0deg');el.style.setProperty('--rx','0deg');});
  });
}

// The projects are real, local-first tools. No account or remote service needed.
const dialog=$('#project-dialog');
let activeProject=null,opener=null,cleanupDemo=()=>{};
function closeProject(){dialog.close();}
$('#close-dialog').addEventListener('click',closeProject);
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeProject();}});
dialog.addEventListener('close',()=>{cleanupDemo();cleanupDemo=()=>{};activeProject=null;document.body.classList.remove('dialog-open');if(opener?.isConnected)opener.focus({preventScroll:true});});
function openProject(project){
  if(!['orbit','prism','notes'].includes(project))throw new Error('Unknown project. Choose orbit, prism, or notes.');
  cleanupDemo();cleanupDemo=()=>{};if(!dialog.open)opener=document.activeElement;activeProject=project;
  $('#demo-title').textContent={orbit:'Orbit',prism:'Prism',notes:'Field Notes'}[project];
  ({orbit:renderOrbit,prism:renderPrism,notes:renderNotes}[project])();
  if(!dialog.open)dialog.showModal();
  document.body.classList.add('dialog-open');dialog.scrollTop=0;$('#close-dialog').focus({preventScroll:true});
}
$$('[data-project]').forEach(button=>button.addEventListener('click',()=>openProject(button.dataset.project)));

let tasks=storage.read('orbit.tasks',structuredClone(sampleTasks),validateTasks);
let filter='all';
function renderOrbit(){
  filter='all';
  $('#demo-content').innerHTML=`<div class="demo-body"><p class="demo-description">A calmer place to plan your day. Add a task, check it off, and enjoy a little progress.</p><div class="demo-stats" id="task-stats"></div><form class="task-add" id="task-form"><label class="sr-only" for="task-input">New task</label><input id="task-input" placeholder="What would you like to get done?" autocomplete="off" maxlength="160" required><button type="submit">Add task +</button></form><div class="task-tabs" role="group" aria-label="Filter tasks"><button data-filter="all" class="active" aria-pressed="true">All</button><button data-filter="active" aria-pressed="false">To do</button><button data-filter="done" aria-pressed="false">Completed</button></div><ul class="task-list" id="task-list"></ul><div class="progress-track" role="progressbar" aria-label="Task completion" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span></span></div><p class="demo-note" id="task-save-note">Your tasks stay in this browser, on this device.</p></div>`;
  $('#task-form').addEventListener('submit',event=>{event.preventDefault();const field=$('#task-input');const text=field.value.trim();if(!text){field.focus();return;}if(tasks.length>=300){toast('This demo supports up to 300 tasks.');return;}tasks.push({id:crypto.randomUUID(),text,done:false});field.value='';filter='all';saveTasks();updateTasks();field.focus();});
  $$('.task-tabs button').forEach(button=>button.addEventListener('click',()=>{filter=button.dataset.filter;updateTasks();}));
  $('#task-list').addEventListener('click',event=>{const button=event.target.closest('button');if(!button)return;const li=button.closest('li');const task=tasks.find(t=>t.id===li.dataset.id);if(!task)return;const toggled=button.classList.contains('task-check');if(toggled)task.done=!task.done;else if(button.classList.contains('task-delete'))tasks=tasks.filter(t=>t.id!==task.id);saveTasks();updateTasks();const row=[...$('#task-list').children].find(el=>el.dataset.id===task.id);const focusTarget=toggled&&row?row.querySelector('.task-check'):$('#task-input');focusTarget?.focus({preventScroll:true});});
  updateTasks();
}
function saveTasks(){const success=storage.write('orbit.tasks',tasks);const note=$('#task-save-note');if(note)note.textContent=success?'Saved in this browser, on this device.':'Browser storage is unavailable. Changes last for this visit only.';}
function updateTasks(){
  const s=taskSummary(tasks);$('#task-stats').innerHTML=`<div class="stat"><strong>${s.total}</strong><span>Total tasks</span></div><div class="stat"><strong>${s.complete}</strong><span>Completed</span></div><div class="stat"><strong>${s.percent}%</strong><span>Progress</span></div>`;
  $$('.task-tabs button').forEach(button=>{const selected=button.dataset.filter===filter;button.classList.toggle('active',selected);button.setAttribute('aria-pressed',String(selected));});
  const visible=tasks.filter(task=>filter==='all'||(filter==='done'?task.done:!task.done));
  $('#task-list').innerHTML=visible.length?visible.map(task=>`<li data-id="${escapeHTML(task.id)}" class="${task.done?'task-done':''}"><button class="task-check" aria-pressed="${task.done}" aria-label="${task.done?'Mark incomplete':'Complete'}: ${escapeHTML(task.text)}">${task.done?'✓':''}</button><span class="task-title">${escapeHTML(task.text)}</span><button class="task-delete" aria-label="Delete task: ${escapeHTML(task.text)}">×</button></li>`).join(''):`<li class="empty-state">${filter==='done'?'Your completed tasks will appear here.':filter==='active'?'All clear. A little room to breathe.':'A fresh start. Add your first task above.'}</li>`;
  $('.progress-track').setAttribute('aria-valuenow',String(s.percent));$('.progress-track>span').style.width=`${s.percent}%`;
}

const palettes=[['#f9c6a8','#6650cb'],['#d4ff79','#23675c'],['#fac0df','#5066c9'],['#f9cb67','#b75849'],['#94d8ef','#293b8f']];
let colors={a:palettes[0][0],b:palettes[0][1],angle:135};
function renderPrism(){
  $('#demo-content').innerHTML=`<div class="demo-body"><p class="demo-description">Find your next color story. Pick two colors, change the angle, and take the CSS with you.</p><div class="prism-workspace"><div class="gradient-stage" id="gradient-preview"><span>A little<br>color magic.</span></div><div><div class="color-fields"><label class="color-control">First color<input type="color" id="color-a" value="${colors.a}"><code id="hex-a">${colors.a}</code></label><label class="color-control">Second color<input type="color" id="color-b" value="${colors.b}"><code id="hex-b">${colors.b}</code></label></div><label class="angle-label" for="gradient-angle">Gradient angle <span id="angle-value">${colors.angle}°</span></label><input type="range" id="gradient-angle" min="0" max="360" value="${colors.angle}"><div class="preset-row" aria-label="Gradient presets">${palettes.map((p,i)=>`<button type="button" data-preset="${i}" style="background:${gradientCSS(...p,135)}" aria-label="Use gradient preset ${i+1}"></button>`).join('')}</div><code class="css-output" id="gradient-css"></code><div class="gradient-actions"><button class="small-button primary" id="copy-css">Copy CSS</button><button class="small-button" id="save-css">Download CSS ↓</button><button class="small-button" id="surprise-color">Surprise me ↻</button></div></div></div></div>`;
  ['#color-a','#color-b','#gradient-angle'].forEach(selector=>$(selector).addEventListener('input',()=>{colors={a:$('#color-a').value,b:$('#color-b').value,angle:Number($('#gradient-angle').value)};updateGradient();}));
  $$('[data-preset]').forEach(button=>button.addEventListener('click',()=>{const p=palettes[Number(button.dataset.preset)];colors={a:p[0],b:p[1],angle:135};updateGradient(true);}));
  $('#surprise-color').addEventListener('click',()=>{const p=palettes[Math.floor(Math.random()*palettes.length)];colors={a:p[0],b:p[1],angle:Math.floor(Math.random()*361)};updateGradient(true);});
  $('#copy-css').addEventListener('click',()=>copyText(`background: ${gradientCSS(colors.a,colors.b,colors.angle)};`));
  $('#save-css').addEventListener('click',()=>download('prism-gradient.css',`.prism-gradient {\n  background: ${gradientCSS(colors.a,colors.b,colors.angle)};\n}\n`,'text/css'));
  updateGradient();
}
function updateGradient(sync=false){const value=gradientCSS(colors.a,colors.b,colors.angle);$('#gradient-preview').style.background=value;$('#gradient-css').textContent=`background: ${value};`;$('#hex-a').textContent=colors.a.toUpperCase();$('#hex-b').textContent=colors.b.toUpperCase();$('#angle-value').textContent=`${colors.angle}°`;if(sync){$('#color-a').value=colors.a;$('#color-b').value=colors.b;$('#gradient-angle').value=colors.angle;}}
async function copyText(text){try{if(!navigator.clipboard?.writeText)throw new Error('clipboard');await navigator.clipboard.writeText(text);toast('CSS copied. Go make something good.');}catch{const selection=getSelection();const range=document.createRange();range.selectNodeContents($('#gradient-css'));selection.removeAllRanges();selection.addRange(range);toast('Select and copy the highlighted CSS, or download it.');}}
function download(name,text,type){const url=URL.createObjectURL(new Blob([text],{type:`${type};charset=utf-8`}));const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Your file is ready.');}

let note=storage.read('notes.text',sampleNote,v=>typeof v==='string'&&v.length<=100000);
function renderNotes(){
  $('#demo-content').innerHTML=`<div class="demo-body"><p class="demo-description">A quiet space for your next idea. Write a note, see it take shape, and keep a copy.</p><div class="notes-toolbar"><span id="note-status" role="status">Stored in this browser only</span><button class="small-button primary" id="download-note">Download .md ↓</button></div><div class="notes-workspace"><div class="editor-panel"><label class="panel-label" for="notes-input">WRITE / MARKDOWN</label><textarea id="notes-input" maxlength="100000" spellcheck="true" aria-label="Write your note in Markdown"></textarea></div><div class="preview-panel"><span class="panel-label" id="preview-label">LIVE PREVIEW</span><div id="notes-preview" aria-labelledby="preview-label"></div></div></div><div class="notes-count"><span id="word-count"></span><span># Heading · **bold** · - list</span></div><p class="demo-note">Notes are saved on this device. Download a copy to keep or move your writing.</p></div>`;
  $('#notes-input').value=note;
  $('#notes-input').addEventListener('input',()=>{note=$('#notes-input').value;const saved=storage.write('notes.text',note);$('#note-status').textContent=saved?'Saved on this device':'Storage unavailable — download a copy';updateNote();});
  $('#download-note').addEventListener('click',()=>{const title=(note.match(/^#\s+(.+)/m)?.[1]||'field-notes').replace(/[^a-z0-9 -]/gi,'').trim().replace(/\s+/g,'-').slice(0,60)||'field-notes';download(`${title}.md`,note,'text/markdown');});
  updateNote();
}
function updateNote(){$('#notes-preview').innerHTML=markdown(note);const words=note.trim()?note.trim().split(/\s+/).length:0;$('#word-count').textContent=`${words} ${words===1?'word':'words'} · ${note.length} characters`;}

// Layered, resolution-aware particles. Geometry stays sharp on high-density screens.
const heroCanvas=$('#hero-canvas'),playCanvas=$('#play-canvas');
const hc=heroCanvas.getContext('2d'),pc=playCanvas.getContext('2d');
const particleCount=coarse?270:430;
const seeds=Array.from({length:particleCount},(_,i)=>({u:(i+.5)/particleCount,v:i*2.3999632297,phase:i*.71}));
let playSize={w:0,h:0},heroSize={w:0,h:0},pointer={x:0,y:0},smoothPointer={x:0,y:0};
let shape='orb',energy=.5,paletteIndex=0,phase=0,lastFrame=0,playVisible=true,heroVisible=true;
const particleColors=[[212,255,121],[206,166,255],[116,219,244],[255,188,124]];
const particles=seeds.map(()=>({x:0,y:0,z:0,init:false}));
function sizeCanvas(canvas){const r=canvas.getBoundingClientRect();const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(r.width*dpr);canvas.height=Math.round(r.height*dpr);const ctx=canvas.getContext('2d');ctx?.setTransform(dpr,0,0,dpr,0,0);return {w:r.width,h:r.height};}
function resizeCanvases(){heroSize=sizeCanvas(heroCanvas);playSize=sizeCanvas(playCanvas);drawStill();}
if('ResizeObserver' in window){new ResizeObserver(resizeCanvases).observe($('.play-stage'));new ResizeObserver(resizeCanvases).observe($('.hero'));}else addEventListener('resize',resizeCanvases,{passive:true});
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.target===playCanvas)playVisible=e.isIntersecting;else heroVisible=e.isIntersecting;}));observer.observe(playCanvas);observer.observe(heroCanvas);}
playCanvas.addEventListener('pointermove',event=>{const r=playCanvas.getBoundingClientRect();pointer={x:((event.clientX-r.left)/r.width-.5)*2,y:((event.clientY-r.top)/r.height-.5)*2};if(!motion)drawStill();},{passive:true});
playCanvas.addEventListener('pointerleave',()=>{pointer={x:0,y:0};if(!motion)drawStill();});
function configurePlayground(next){
  if(next.shape!==undefined&&!['orb','wave','helix'].includes(next.shape))throw new Error('Choose orb, wave, or helix.');
  if(next.energy!==undefined&&(!Number.isFinite(next.energy)||next.energy<0||next.energy>100))throw new Error('Energy must be between 0 and 100.');
  if(next.shape!==undefined)shape=next.shape;
  if(next.energy!==undefined)energy=next.energy/100;
  $$('[data-shape]').forEach(button=>{const selected=button.dataset.shape===shape;button.classList.toggle('active',selected);button.setAttribute('aria-pressed',String(selected));});
  $('#pattern-name').textContent={orb:'ORBITAL FORM',wave:'WAVE FIELD',helix:'DOUBLE HELIX'}[shape];$('#energy').value=energy*100;$('#energy-value').textContent=`${Math.round(energy*100)}%`;drawStill();
  return {shape,energy:Math.round(energy*100)};
}
$$('[data-shape]').forEach(button=>button.addEventListener('click',()=>configurePlayground({shape:button.dataset.shape})));
$('#energy').addEventListener('input',event=>configurePlayground({energy:Number(event.target.value)}));
$('#remix-button').addEventListener('click',()=>{paletteIndex=(paletteIndex+1)%particleColors.length;drawStill();});

function renderHero(){if(!hc)return;const {w,h}=heroSize;hc.clearRect(0,0,w,h);if(!w||!h)return;for(let i=0;i<38;i++){const x=((Math.sin(i*127.1)*43758.5453)%1+1)%1*w;const baseY=((Math.cos(i*53.7)*18374.742)%1+1)%1*h;const y=(baseY-phase*(i%3+1)*9+h*20)%h;hc.fillStyle=`rgba(212,255,121,${.08+(i%4)*.05})`;hc.beginPath();hc.arc(x,y,i%5===0?1.8:1,0,Math.PI*2);hc.fill();}}
function renderPlay(snap=false){
  if(!pc)return;const {w,h}=playSize;pc.clearRect(0,0,w,h);if(!w||!h)return;
  smoothPointer.x+=(pointer.x-smoothPointer.x)*.045;smoothPointer.y+=(pointer.y-smoothPointer.y)*.045;
  const size=Math.min(w,h)*.31;const yaw=phase*.2+smoothPointer.x*.5,pitch=.18+smoothPointer.y*.32;
  const cy=Math.cos(yaw),sy=Math.sin(yaw),cx=Math.cos(pitch),sx=Math.sin(pitch);const points=[];
  for(let i=0;i<seeds.length;i++){
    const seed=seeds[i];let x,y,z;
    if(shape==='orb'){const yy=1-2*seed.u;const r=Math.sqrt(1-yy*yy);const breath=1+Math.sin(seed.v*3+phase*2)*.06*energy;x=Math.cos(seed.v)*r*size*breath;y=yy*size*breath;z=Math.sin(seed.v)*r*size*breath;}
    else if(shape==='wave'){const cols=coarse?18:22;const row=Math.floor(i/cols),col=i%cols;const rows=Math.ceil(seeds.length/cols);x=(col/(cols-1)-.5)*size*2.5;z=(row/(rows-1)-.5)*size*1.7;y=Math.sin(col*.45+phase*2)*Math.cos(row*.4+phase)*size*(.16+energy*.3);}
    else{const turns=seed.u*Math.PI*7+phase*.7;const strand=i%2===0?0:Math.PI;x=Math.cos(turns+strand)*size*.6;y=(seed.u-.5)*size*2.25;z=Math.sin(turns+strand)*size*.6;}
    const p=particles[i];const ease=snap||!p.init?1:.075;p.x+=(x-p.x)*ease;p.y+=(y-p.y)*ease;p.z+=(z-p.z)*ease;p.init=true;
    const xx=p.x*cy-p.z*sy,zz=p.x*sy+p.z*cy;const yy=p.y*cx-zz*sx,zr=p.y*sx+zz*cx;const perspective=650/(650+zr);points.push({x:w/2+xx*perspective,y:h/2+yy*perspective,z:zr,r:(1.1+(zr+size)/(size*2)*.9)*perspective});
  }
  const rgb=particleColors[paletteIndex];
  for(let i=0;i<points.length;i++){const p=points[i],q=points[(i+17)%points.length],distance=Math.hypot(p.x-q.x,p.y-q.y);if(distance<size*.35){pc.strokeStyle=`rgba(${rgb.join(',')},${.10*(1-distance/(size*.35))})`;pc.lineWidth=.7;pc.beginPath();pc.moveTo(p.x,p.y);pc.lineTo(q.x,q.y);pc.stroke();}}
  points.sort((a,b)=>b.z-a.z);
  for(const p of points){const alpha=.3+.65*(1-(p.z+size)/(size*2.4));pc.fillStyle=`rgba(${rgb.join(',')},${Math.max(.2,Math.min(1,alpha))})`;pc.beginPath();pc.arc(p.x,p.y,p.r,0,Math.PI*2);pc.fill();}
  const glow=pc.createRadialGradient(w*.5,h*.5,0,w*.5,h*.5,size*1.5);glow.addColorStop(0,`rgba(${rgb.join(',')},.035)`);glow.addColorStop(1,`rgba(${rgb.join(',')},0)`);pc.fillStyle=glow;pc.fillRect(0,0,w,h);
}
function drawStill(){if(typeof heroSize==='undefined')return;renderHero();renderPlay(!motion);}
function frame(time){requestAnimationFrame(frame);if(!motion||document.hidden)return;const elapsed=time-lastFrame;if(elapsed<1000/(coarse?30:45))return;lastFrame=time;phase+=Math.min(elapsed,50)/1000*(.35+energy*1.4);if(heroVisible)renderHero();if(playVisible)renderPlay();}
resizeCanvases();setMotion(motion,false);requestAnimationFrame(frame);

// Optional page-scoped agent access uses the same validated visible UI actions.
if(document.modelContext?.registerTool){
  const lifecycle=new AbortController();
  const registrations=[
    {name:'open_portfolio_project',title:'Open project demo',description:'Open one of John Clarence Layog’s three working personal project demos. This opens the interface without changing saved data.',inputSchema:{type:'object',properties:{project:{type:'string',enum:['orbit','prism','notes']}},required:['project'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){if(!input||typeof input!=='object')throw new Error('A project is required.');openProject(input.project);return {opened:activeProject};}},
    {name:'configure_particle_playground',title:'Configure particle playground',description:'Change the visible particle sculpture’s shape and energy. No data is sent or stored.',inputSchema:{type:'object',properties:{shape:{type:'string',enum:['orb','wave','helix']},energy:{type:'number',minimum:0,maximum:100}},additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){if(!input||typeof input!=='object')throw new Error('Provide shape or energy.');const result=configurePlayground(input);$('#play').scrollIntoView({behavior:motion?'smooth':'instant'});return result;}}
  ];
  registrations.forEach(tool=>{try{Promise.resolve(document.modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}});
  addEventListener('pagehide',event=>{if(!event.persisted)lifecycle.abort();},{once:true});
}
