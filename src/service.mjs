import {render,publicPages} from './pages.mjs';
import {design,sample,escapeHtml as e} from './design.mjs';
import {wallInstant} from './time.mjs';
const reply=(obj,status=200)=>new Response(JSON.stringify(obj),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
function page(html,status=200){return new Response(html,{status,headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store','referrer-policy':'no-referrer','x-content-type-options':'nosniff','permissions-policy':'camera=(), microphone=(), geolocation=()','content-security-policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:; frame-src https://www.google.com; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'self'"}});}
const txt=(v,max)=>typeof v==='string'&&v.trim().length>0&&v.trim().length<=max?v.trim():null;
const keyOK=k=>typeof k==='string'&&/^[0-9a-f]{64}$/.test(k);
const idOK=k=>typeof k==='string'&&/^[a-f0-9-]{36}$/.test(k);
const digest=async s=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))),v=>v.toString(16).padStart(2,'0')).join('');
const prefix=s=>s.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,35).replace(/-$/,'')||'holiday-gathering';
async function checkQuota(db,ip,group,limit){const period=Math.floor(Date.now()/3600000);const bucket=await digest(period+'|'+group+'|'+ip);
  await db.prepare('DELETE FROM quotas WHERE period < ?').bind(period-1).run();
  const n=await db.prepare('INSERT INTO quotas(bucket,period,hits) VALUES(?,?,1) ON CONFLICT(bucket,period) DO UPDATE SET hits=hits+1 RETURNING hits').bind(bucket,period).first();return n.hits<=limit;}
function validEvent(b){
  const fields={};const event={design:design.id};
  for(const [k,n] of Object.entries({host:80,title:80,venue:180,message:350})){event[k]=txt(b[k],n);if(!event[k])fields[k]='Enter '+({host:'the host name',title:'an event title',venue:'a venue and address',message:'a short invitation message'}[k])+' (up to '+n+' characters).';}
  event.date=txt(b.date,10);event.time=txt(b.time,5);event.zone=txt(b.zone,80);
  if(!event.date)fields.date='Choose an event date.';if(!event.time)fields.time='Choose a start time.';if(!event.zone)fields.zone='Choose the event time zone.';
  if(event.date&&event.time&&event.zone){event.instant=wallInstant(event.date,event.time,event.zone);if(!event.instant)fields.time='Choose a valid date and time in this time zone.';else if(Date.parse(event.instant)<=Date.now())fields.date='Choose a date and time in the future.';}
  return {event,fields};
}
const escCal=s=>String(s).replaceAll('\\','\\\\').replace(/\r\n|\r|\n/g,'\\n').replaceAll(',','\\,').replaceAll(';','\\;');
const stamp=t=>new Date(t).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
function fold(line){let out='',bytes=0;for(const c of line){const n=new TextEncoder().encode(c).length;if(bytes+n>75){out+='\r\n ';bytes=1;}out+=c;bytes+=n;}return out;}
function calendar(d,origin,slug){const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Everpost//Holiday Invitations//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH','BEGIN:VEVENT','UID:'+slug+'@'+new URL(origin).host,'DTSTAMP:'+stamp(Date.now()),'DTSTART:'+stamp(d.instant),'SUMMARY:'+escCal(d.title),'LOCATION:'+escCal(d.venue),'DESCRIPTION:'+escCal(d.message),'END:VEVENT','END:VCALENDAR'];
return new Response(lines.map(fold).join('\r\n')+'\r\n',{headers:{'content-type':'text/calendar; charset=utf-8','content-disposition':'attachment; filename="everpost-invitation.ics"','cache-control':'no-store'}});}
async function readJSON(req){if(!req.headers.get('content-type')?.startsWith('application/json'))return null;const reader=req.body?.getReader();if(!reader)return null;let size=0;const chunks=[];while(true){const r=await reader.read();if(r.done)break;size+=r.value.length;if(size>12000){await reader.cancel();return null;}chunks.push(r.value);}try{const b=JSON.parse(await new Blob(chunks).text());return b&&typeof b==='object'&&!Array.isArray(b)?b:null;}catch{return null;}}
export async function handle(request,db,assets,options={}){
 const url=new URL(request.url),origin=options.origin||url.origin,p=url.pathname.replace(/\/$/,'')||'/',method=request.method;
 if(method==='HEAD'){const get=await handle(new Request(request.url,{headers:request.headers}),db,assets,options);return new Response(null,{status:get.status,headers:get.headers});}
 if(p.startsWith('/assets/'))return assets(request);
 if(p==='/robots.txt')return new Response('User-agent: *\nDisallow: /host/\nDisallow: /api/\nSitemap: '+origin+'/sitemap.xml\n',{headers:{'content-type':'text/plain'}});
 if(p==='/sitemap.xml')return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+publicPages.map(s=>'<url><loc>'+e(origin+s)+'</loc></url>').join('')+'</urlset>',{headers:{'content-type':'application/xml'}});
 if(method==='GET'&&publicPages.includes(p))return page(render(p,origin));
 if(p==='/sample/calendar.ics'&&method==='GET')return calendar(sample(),origin,'sample');
 const route=p.match(/^\/(i|host|api\/host|api\/guest)\/([a-z0-9-]{1,72})(?:\/(calendar\.ics|rsvp|wish|phone))?$/);
 if(route){const [,type,slug,action]=route;
  if(type==='host'&&!action&&method==='GET')return page(render('/host/'+slug,origin));
  const row=await db.prepare('SELECT * FROM invitations WHERE slug=?').bind(slug).first();
  if(!row)return type.startsWith('api')?reply({error:'Invitation not found.'},404):page(render('/404',origin),404);
  const d={...JSON.parse(row.details),phone:row.phone,slug};
  if(type==='i'&&method==='GET'){if(action==='calendar.ics')return calendar(d,origin,slug);if(!action)return page(render(p,origin,d));}
  if(type==='api/host'){
    const key=(request.headers.get('Authorization')||'').replace(/^Bearer /,'');
    if(!keyOK(key)||await digest(key)!==row.host_key)return reply({error:'Open the full private host link to see replies.'},403);
    if(!action&&method==='GET'){const {results}=await db.prepare('SELECT kind,name,attending,guests,message,created_at FROM replies WHERE slug=? ORDER BY created_at DESC, rowid DESC').bind(slug).all();return reply({event:d,replies:results});}
    if(action==='phone'&&method==='POST'){const b=await readJSON(request);if(!b||typeof b.phone!=='string')return reply({error:'Enter a valid phone number.'},400);const phone=b.phone.replace(/[\s()-]/g,'');if(phone&&!/^\+[1-9]\d{6,14}$/.test(phone))return reply({error:'Start with + and the country code, followed by the phone number.'},400);await db.prepare('UPDATE invitations SET phone=? WHERE slug=?').bind(phone,slug).run();return reply({ok:true});}
  }
  if(type==='api/guest'&&method==='POST'&&['rsvp','wish'].includes(action)){
    const b=await readJSON(request);if(!b||!idOK(b.id)||!txt(b.name,80))return reply({error:'Enter your name (up to 80 characters).'},400);
    const isRsvp=action==='rsvp',yes=b.attending==='yes';if(isRsvp&&(!['yes','no'].includes(b.attending)||(yes&&(!Number.isInteger(b.guests)||b.guests<1||b.guests>99))))return reply({error:'Choose attendance and a guest count from 1 to 99.'},400);
    if(!isRsvp&&!txt(b.message,350))return reply({error:'Write a wish of up to 350 characters.'},400);
    if(!await checkQuota(db,options.ip||'local','guest',300))return reply({error:'Too many replies. Please try again later.'},429);
    await db.prepare('INSERT INTO replies(slug,kind,request_key,name,attending,guests,message) VALUES(?,?,?,?,?,?,?) ON CONFLICT(slug,kind,request_key) DO UPDATE SET name=excluded.name,attending=excluded.attending,guests=excluded.guests,message=excluded.message').bind(slug,action,b.id,b.name.trim(),isRsvp?Number(yes):null,isRsvp?(yes?b.guests:0):null,isRsvp?null:b.message.trim()).run();
    return reply({ok:true});
  }
 }
 if(p==='/api/invitations'&&method==='POST'){
   const b=await readJSON(request);if(!b||!idOK(b.id)||!keyOK(b.key))return reply({error:'Reload the editor and try again.'},400);
   const {event,fields}=validEvent(b);if(Object.keys(fields).length)return reply({error:'Check the highlighted fields.',fields},422);
   const secret=await digest(b.key),creation=await digest(b.id+'|'+b.key);const existing=await db.prepare('SELECT slug FROM invitations WHERE creation_key=?').bind(creation).first();if(existing)return reply(existing);
   if(!await checkQuota(db,options.ip||'local','create',40))return reply({error:'Too many invitations this hour. Please try again later.'},429);
   const slug=prefix(event.title)+'-'+crypto.randomUUID().replaceAll('-','').slice(0,20);
   await db.prepare('INSERT INTO invitations(slug,host_key,creation_key,details) VALUES(?,?,?,?) ON CONFLICT(creation_key) DO NOTHING').bind(slug,secret,creation,JSON.stringify(event)).run();
   return reply(await db.prepare('SELECT slug FROM invitations WHERE creation_key=?').bind(creation).first(),201);
 }
 if(p==='/api/contact'&&method==='POST'){const b=await readJSON(request);if(!b||!idOK(b.id)||!txt(b.email,254)||!/^\S+@\S+\.\S+$/.test(b.email)||!txt(b.message,2000))return reply({error:'Enter a valid email and a message of up to 2,000 characters.'},400);
   if(!await checkQuota(db,options.ip||'local','contact',12))return reply({error:'Too many messages this hour. Please try again later.'},429);
   await db.prepare('INSERT INTO support(ticket,email,message) VALUES(?,?,?) ON CONFLICT(ticket) DO NOTHING').bind(b.id,b.email.trim(),b.message.trim()).run();return reply({ticket:b.id.slice(0,8)},201);}
 return p.startsWith('/api/')?reply({error:'Request not found.'},404):page(render('/404',origin),404);
}
