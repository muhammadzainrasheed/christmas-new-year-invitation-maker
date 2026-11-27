const $=id=>document.getElementById(id);
function store(key,fallback=null){try{return sessionStorage.getItem(key)??fallback;}catch{return fallback;}}
function keep(k,v){try{sessionStorage.setItem(k,v);}catch{}}
const rid=()=>crypto.randomUUID();
function stableId(k){let id=store(k);if(!id){id=rid();keep(k,id);}return id;}
async function api(url,data=null,key=null){const headers={};if(data)headers['Content-Type']='application/json';if(key)headers.Authorization='Bearer '+key;
 let r;try{r=await fetch(url,{method:data?'POST':'GET',headers,body:data?JSON.stringify(data):undefined,cache:'no-store'});}catch{throw Error('Connection lost. Check your internet and try again.');}
 let b;try{b=await r.json();}catch{throw Error('The service is temporarily unavailable. Try again in a moment.');}if(!r.ok){const ex=Error(b.error||'Please try again.');ex.fields=b.fields;throw ex;}return b;}
async function copy(value,input){try{await navigator.clipboard.writeText(value);return 'Link copied.';}catch{input.focus();input.select();try{if(document.execCommand('copy'))return 'Link copied.';}catch{}return 'Link selected. Choose Copy from your device menu.';}}
const pagesBase=document.documentElement.dataset.pagesBase;
const pages=pagesBase?await import('./pages-client.js'):null;
if(pages)await pages.setupPages(pagesBase,copy);
if($('menu-toggle')){const button=$('menu-toggle'),menu=$('mobile-menu');function close(){menu.hidden=true;button.setAttribute('aria-expanded','false');button.setAttribute('aria-label','Open menu');}
 button.onclick=()=>{const open=menu.hidden;menu.hidden=!open;button.setAttribute('aria-expanded',String(open));button.setAttribute('aria-label',open?'Close menu':'Open menu');};menu.addEventListener('click',close);addEventListener('keydown',ev=>{if(ev.key==='Escape'&&!menu.hidden){close();button.focus();}});matchMedia('(min-width:761px)').addEventListener('change',close);}
const dateLabel=date=>{if(!date)return '';const t=new Date(date+'T12:00:00Z');return Number.isFinite(+t)?t.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}):'';};
function clock(time){if(!time)return '';const [h,m]=time.split(':').map(Number);return (h%12||12)+':'+String(m).padStart(2,'0')+' '+(h<12?'am':'pm');}
if($('create-form')){
 const form=$('create-form'),zone=$('zone');const mine=Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC';const zones=new Set([mine,'UTC',...(Intl.supportedValuesOf?.('timeZone')||['America/New_York','Asia/Karachi','Australia/Sydney','Europe/London'])]);
 for(const z of [...zones].sort()){const opt=new Option(z.replaceAll('_',' '),z);opt.selected=z===mine;zone.add(opt);}
 const fields=['host','title','date','time','venue','message','zone'];let draft={};try{draft=JSON.parse(store('everpost-draft','{}'));}catch{}for(const f of fields){if(draft[f]&&$(f))$(f).value=draft[f];}
 const preview=[...document.querySelectorAll('[data-preview]')];for(const item of preview)item.dataset.sample=item.textContent;
 function current(){return Object.fromEntries(fields.map(k=>[k,$(k).value.trim()]));}
 function update(){const d=current();keep('everpost-draft',JSON.stringify(d));for(const el of preview){const k=el.dataset.preview;const v=k==='date'?dateLabel(d.date):k==='time'?clock(d.time):d[k];el.textContent=v||el.dataset.sample;}const ymd=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:zone.value||mine,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).map(x=>[x.type,x.value]));$('date').min=ymd.year+'-'+ymd.month+'-'+ymd.day;}
 function errors(obj={}){for(const f of fields){const el=$(f),msg=obj[f]||'';$(f+'-error').textContent=msg;el.setAttribute('aria-invalid',String(!!msg));el.setAttribute('aria-describedby',f+'-error');}}
 form.addEventListener('input',ev=>{if(fields.includes(ev.target.id)){ev.target.setAttribute('aria-invalid','false');$(ev.target.id+'-error').textContent='';}update();});update();
 form.onsubmit=async ev=>{ev.preventDefault();const d=current(),bad={};for(const k of fields){if(!d[k])bad[k]=({host:'Enter the host name.',title:'Enter an event title.',date:'Choose an event date.',time:'Choose a start time.',venue:'Enter your venue and address.',message:'Write a short invitation message.',zone:'Choose a time zone.'})[k];}
 if(d.date&&d.date<$('date').min)bad.date='Choose a date in the future.';errors(bad);if(Object.keys(bad).length){$(Object.keys(bad)[0]).focus();$('create-status').textContent='Check the highlighted fields.';return;}
 const btn=form.querySelector('button[type=submit]');btn.disabled=true;$('create-status').textContent='Creating your invitation…';
 try{if(pages){
 const share=pages.createLink(pagesBase,d);keep('everpost-draft','{}');location.assign(share);return;
 }let attempt;try{attempt=JSON.parse(store('everpost-create','null'));}catch{}const fingerprint=JSON.stringify(d);if(!attempt||attempt.fingerprint!==fingerprint){attempt={id:rid(),key:[...crypto.getRandomValues(new Uint8Array(32))].map(x=>x.toString(16).padStart(2,'0')).join(''),fingerprint};keep('everpost-create',JSON.stringify(attempt));}
 const {slug}=await api('/api/invitations',{...d,id:attempt.id,key:attempt.key});keep('everpost-draft','{}');keep('everpost-create','null');location.assign('/host/'+slug+'#key='+attempt.key);
 }catch(ex){errors(ex.fields);if(ex.fields)$(Object.keys(ex.fields)[0])?.focus();$('create-status').textContent=ex.message;btn.disabled=false;}};
}
function asTextNode(el,text){const li=document.createElement('li');li.textContent=text;el.append(li);}
if($('host-panel')){
 const slug=location.pathname.split('/').filter(Boolean).pop(),key=new URLSearchParams(location.hash.slice(1)).get('key');const url='/api/host/'+slug;
 const feedback=s=>{$('host-feedback').textContent=s;};let event;
 async function load(){if(!key)throw Error('Open the full private host link saved when you created this invitation.');const d=await api(url,null,key);event=d.event;
 $('host-panel').hidden=false;$('host-status').textContent=event.title+' · Hosted by '+event.host;
 const guest=location.origin+'/i/'+slug;$('guest-link').value=guest;$('host-link').value=location.href;$('open-guest').href=guest;$('whatsapp').href='https://wa.me/?text='+encodeURIComponent('You’re invited to '+event.title+'! '+guest);$('phone').value=event.phone||'';
 const rs=d.replies.filter(x=>x.kind==='rsvp'),ws=d.replies.filter(x=>x.kind==='wish');$('rsvp-list').replaceChildren();$('wish-list').replaceChildren();for(const r of rs)asTextNode($('rsvp-list'),r.name+' — '+(r.attending?'attending, '+r.guests+' '+(r.guests===1?'person':'people'):'unable to attend'));for(const w of ws)asTextNode($('wish-list'),w.name+' — '+w.message);
 if(!rs.length)asTextNode($('rsvp-list'),'No RSVPs yet.');if(!ws.length)asTextNode($('wish-list'),'No wishes yet.');
 $('reply-total').textContent=rs.reduce((n,r)=>n+(r.guests||0),0)+' attending · '+rs.length+' RSVP'+(rs.length===1?'':'s')+' · '+ws.length+' '+(ws.length===1?'wish':'wishes');}
 load().catch(ex=>{$('host-status').textContent=ex.message;});
 $('copy-guest').onclick=async()=>feedback(await copy($('guest-link').value,$('guest-link')));$('copy-host').onclick=async()=>feedback(await copy(location.href,$('host-link')));
 $('refresh').onclick=async()=>{try{await load();feedback('Guest replies refreshed.');}catch(ex){feedback(ex.message);}};
 $('phone-form').onsubmit=async ev=>{ev.preventDefault();try{await api(url+'/phone',{phone:$('phone').value},key);feedback('Host contact saved.');}catch(ex){feedback(ex.message);}};
 $('download').onclick=async()=>{const b=$('download');b.disabled=true;try{const {cardPNG}=await import('/assets/export.js');await cardPNG(event,slug);feedback('Your invitation image is ready.');}catch{feedback('The image could not be downloaded. Please try again.');}finally{b.disabled=false;}};
}
if($('event-data')){
 const d=JSON.parse($('event-data').textContent),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(pages)await pages.enableCalendar(d);
 const stamp=t=>new Date(t).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
 $('google-cal').href='https://calendar.google.com/calendar/render?'+new URLSearchParams({action:'TEMPLATE',text:d.title,dates:stamp(d.instant)+'/'+stamp(d.instant),ctz:d.zone,location:d.venue,details:d.message});
 function tick(){const n=Math.max(0,Math.floor((Date.parse(d.instant)-Date.now())/1000));[Math.floor(n/86400),Math.floor(n/3600)%24,Math.floor(n/60)%60,n%60].forEach((x,k)=>{$('count-'+k).textContent=String(x).padStart(2,'0');});if(!n)$('count-note').textContent='The celebration has begun.';}
 $('open-letter').onclick=async()=>{const btn=$('open-letter');btn.disabled=true;$('cover').classList.add('unseal');if(!reduced)await new Promise(r=>setTimeout(r,780));$('cover').hidden=true;$('letter').hidden=false;const start=$('invitation');start.tabIndex=-1;start.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});tick();const timer=setInterval(tick,1000);addEventListener('pagehide',()=>clearInterval(timer),{once:true});if(!reduced&&'IntersectionObserver'in window){$('letter').classList.add('has-reveal');const ob=new IntersectionObserver(en=>{for(const x of en)if(x.isIntersecting){x.target.classList.add('visible');ob.unobserve(x.target);}},{threshold:.07});document.querySelectorAll('.reveal').forEach(el=>ob.observe(el));}};
 $('map-load').onclick=()=>{const f=document.createElement('iframe');f.className='map-frame';f.title='Map of '+d.venue;f.referrerPolicy='no-referrer-when-downgrade';f.src='https://www.google.com/maps?q='+encodeURIComponent(d.venue)+'&output=embed';$('map-slot').replaceChildren(f);$('map-load').hidden=true;};
 let music=null,timer=null,cursor=0;const musicButton=$('music');
 function stop(){clearInterval(timer);if(music)music.close().catch(()=>{});music=null;musicButton.setAttribute('aria-pressed','false');musicButton.querySelector('span').textContent='Music off';}
 musicButton.onclick=async()=>{if(music){stop();return;}try{const C=window.AudioContext||window.webkitAudioContext;music=new C();await music.resume();const notes=[392,493.88,587.33,493.88,440,523.25,659.26,523.25,349.23,440,523.25,440];const play=()=>{if(!music)return;const osc=music.createOscillator(),gain=music.createGain(),t=music.currentTime;osc.type='sine';osc.frequency.value=notes[cursor++%notes.length];gain.gain.setValueAtTime(0.0001,t);gain.gain.exponentialRampToValueAtTime(.075,t+.035);gain.gain.exponentialRampToValueAtTime(.0001,t+1.25);osc.connect(gain).connect(music.destination);osc.start(t);osc.stop(t+1.3);};play();timer=setInterval(play,600);musicButton.setAttribute('aria-pressed','true');musicButton.querySelector('span').textContent='Music on';}catch{stop();musicButton.querySelector('span').textContent='Music unavailable';}};
 addEventListener('pagehide',stop);document.addEventListener('visibilitychange',()=>{if(document.hidden&&music)stop();});
 const rsvp=$('rsvp-form');rsvp.addEventListener('change',()=>{const no=rsvp.elements.attending.value==='no';$('guests').disabled=no;$('guests').closest('.field').hidden=no;});
 for(const [id,kind] of [['rsvp-form','rsvp'],['wish-form','wish']]){const form=$(id);form.onsubmit=async ev=>{ev.preventDefault();const btn=form.querySelector('button'),status=form.querySelector('.status');btn.disabled=true;const body=kind==='rsvp'?{name:$('guest-name').value.trim(),attending:form.elements.attending.value,guests:Number($('guests').value)}:{name:$('wish-name').value.trim(),message:$('wish').value.trim()};
 try{if(!body.name||kind==='wish'&&!body.message)throw Error('Enter your name and fill in the required fields.');if(pages&&!d.demo){pages.prepareReply(form,d,body,copy);if(kind==='rsvp'&&!$('wish-name').value)$('wish-name').value=body.name;return;}if(!d.demo)await api('/api/guest/'+d.slug+'/'+kind,{...body,id:stableId('everpost-'+d.slug+'-'+kind)});
 status.textContent=d.demo?'Sample '+(kind==='rsvp'?'RSVP':'wish')+' received in this tab.':kind==='rsvp'?'Thank you. Your host can now see your RSVP.':'Your wish has been sent to the host.';if(kind==='rsvp'&&!$('wish-name').value)$('wish-name').value=body.name;}catch(ex){status.textContent=ex.message;}finally{btn.disabled=false;}};}
}
if($('contact-form')){const form=$('contact-form');let id=rid();form.onsubmit=async ev=>{ev.preventDefault();const b=form.querySelector('button'),status=form.querySelector('.status');b.disabled=true;try{const r=await api('/api/contact',{id,email:$('email').value,message:$('support-message').value});status.textContent='Message received. Your reference is '+r.ticket+'.';form.reset();id=rid();}catch(ex){status.textContent=ex.message;}finally{b.disabled=false;}};}
