export const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function gradientCSS(a,b,angle){
  if(!/^#[\da-f]{6}$/i.test(a)||!/^#[\da-f]{6}$/i.test(b)||!Number.isFinite(angle)||angle<0||angle>360)throw new Error('Choose two valid colors and an angle between 0 and 360.');
  return `linear-gradient(${Math.round(angle)}deg, ${a.toLowerCase()}, ${b.toLowerCase()})`;
}
export function taskSummary(tasks){const complete=tasks.filter(t=>t.done).length;return {total:tasks.length,complete,remaining:tasks.length-complete,percent:tasks.length?Math.round(complete/tasks.length*100):0};}
export function validateTasks(value){return Array.isArray(value)&&value.length<=300&&value.every(t=>t&&typeof t.id==='string'&&typeof t.text==='string'&&t.text.length<=160&&typeof t.done==='boolean');}
export function markdown(text){
  const inline=s=>escapeHTML(s).replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');
  let inList=false;const out=[];
  for(const line of text.split('\n')){
    if(/^[-*] /.test(line)){if(!inList){out.push('<ul>');inList=true;}out.push(`<li>${inline(line.slice(2))}</li>`);continue;}
    if(inList){out.push('</ul>');inList=false;}
    const h=line.match(/^(#{1,3})\s+(.+)$/);
    if(h){out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`);}else if(line.trim()){out.push(`<p>${inline(line)}</p>`);}
  }
  if(inList)out.push('</ul>');return out.join('')||'<p>Your ideas will appear here.</p>';
}
export const sampleTasks=[{id:'sample-1',text:'Turn an idea into a first draft',done:true},{id:'sample-2',text:'Make the little details count',done:false},{id:'sample-3',text:'Make time for something creative',done:false}];
export const sampleNote='# A little room for possibility\n\nGood ideas don’t always arrive fully formed. Sometimes, they start with a simple **what if?**\n\n## Things to explore\n\n- Build something that solves a small problem\n- Try a color I would not normally choose\n- Keep the details simple and thoughtful\n\nWrite your next idea here. Use # for headings, - for lists, and **bold** for emphasis.\n\n`Stay curious. Keep making.`';
