import {wallInstant} from './time.mjs';

const fields = {title:80,host:80,date:10,time:5,zone:80,venue:180,message:350};
const utf8 = new TextEncoder();
export function normaliseInvitation(data, future = false) {
  const event = {};
  for (const [key,limit] of Object.entries(fields)) {
    if (typeof data[key] !== 'string' || !data[key].trim() || data[key].length > limit) throw new Error('The invitation link is incomplete. Ask your host to send the full link.');
    event[key] = data[key].trim();
  }
  const instant = wallInstant(event.date,event.time,event.zone);
  if (!instant || (future && Date.parse(instant) <= Date.now())) {
    const error = new Error('Choose a valid future date and time in the event time zone.');
    error.fields = {date:error.message}; throw error;
  }
  const phone = (data.phone || '').replace(/[\s()-]/g,'');
  if (phone && !/^\+[1-9]\d{6,14}$/.test(phone)) throw new Error('Enter the phone number with + and its country code.');
  return {...event,instant,phone,slug:'holiday-invitation'};
}
export function encodeInvitation(data) {
  const event = normaliseInvitation(data);
  const values = [...Object.keys(fields).map(key=>event[key]),event.phone];
  return '1.' + btoa(String.fromCharCode(...utf8.encode(JSON.stringify(values)))).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
}
export function decodeInvitation(hash) {
  const encoded = new URLSearchParams(hash.replace(/^#/, '')).get('card') || '';
  if (!/^1\.[\w-]{5,16000}$/.test(encoded)) throw new Error('This invitation needs its full guest link. Ask the host to send it again.');
  try {
    const bin = atob(encoded.slice(2).replaceAll('-','+').replaceAll('_','/'));
    const values = JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(bin,x=>x.charCodeAt(0))));
    const keys = [...Object.keys(fields),'phone'];
    if (!Array.isArray(values) || values.length !== keys.length || values.some(v=>typeof v!=='string')) throw new Error();
    return normaliseInvitation(Object.fromEntries(keys.map((key,i)=>[key,values[i]])));
  } catch {throw new Error('This invitation link is incomplete. Ask the host for the original link.');}
}
export function sitePath(path,base) {
  const [route,tail=''] = path.split(/(?=[?#])/s,2);
  return base+route.replace(/^\//,'')+(route!=='/'&&!route.endsWith('/')&&!route.split('/').pop().includes('.')?'/':'')+tail;
}
export function siteMarkup(html,base) {
  return html.replace(/\b(href|src)="(\/(?!\/)[^"]*)"/g,(_,attr,value)=>attr+'="'+sitePath(value,base)+'"')
    .replace(/srcset="([^"]+)"/g,(_,set)=>'srcset="'+set.replace(/(^|,\s*)\/assets\//g,(_,pre)=>pre+base+'assets/')+'"');
}
export function responseMessage(event,reply) {
  if(reply.message) return 'A wish for '+event.title+' from '+reply.name+':\n'+reply.message;
  return 'RSVP for '+event.title+'\n'+reply.name+(reply.attending==='yes'?' is attending. Party size: '+reply.guests+'.':' cannot attend.');
}
