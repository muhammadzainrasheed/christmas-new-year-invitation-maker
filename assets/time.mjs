// Resolve a local wall-clock time against a named IANA zone, including DST transitions.
export function wallInstant(date,time,zone){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^\d{2}:\d{2}$/.test(time)) return null;
  const wall=Date.parse(date+'T'+time+':00Z');
  if(!Number.isFinite(wall))return null;
  try{
    const f=new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
    const local=(ms)=>{const p=Object.fromEntries(f.formatToParts(ms).map(x=>[x.type,x.value]));return p.year+'-'+p.month+'-'+p.day+'T'+p.hour+':'+p.minute;};
    const candidates=[-86400000,0,86400000].map(delta=>{const t=wall+delta;return wall-(Date.parse(local(t)+':00Z')-t);});
    const matches=candidates.filter(t=>local(t)===date+'T'+time);
    return matches.length?new Date(Math.min(...matches)).toISOString():null;
  }catch{return null;}
}
