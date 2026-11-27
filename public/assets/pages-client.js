import {decodeInvitation,encodeInvitation,normaliseInvitation,responseMessage,siteMarkup} from './github-pages.mjs';
import {calendarFile} from './calendar.mjs';

export function linkFor(base,route,event) {
  const url=new URL(base+route+'/',location.origin);
  url.hash='card='+encodeInvitation(event);
  return url.href;
}
export function createLink(base,details) {return linkFor(base,'share',normaliseInvitation(details,true));}

export async function setupPages(base,copy) {
  const $=id=>document.getElementById(id);
  const status=$('pages-status');
  const route=location.pathname.slice(base.length).replace(/\/$/,'');
  if(!['share','invite'].includes(route)) return;
  try {
    let event=decodeInvitation(location.hash);
    if(route==='invite'){
      const {guest}=await import('./pages.mjs');
      $('main').innerHTML=siteMarkup(guest(event,false,true),base);
      document.querySelector('header')?.remove();
      document.querySelector('footer')?.remove();
      document.body.classList.add('guest-body');
      document.title=event.title+' – Invitation from '+event.host+' | Everpost';
      // Keep invitation details in the fragment while moving between sections.
      $('main').addEventListener('click',ev=>{
        const a=ev.target.closest('a[href^="#"]');
        const to=a&&document.getElementById(a.getAttribute('href').slice(1));
        if(to){ev.preventDefault();to.scrollIntoView();}
      });
      return;
    }
    const update=()=>{
      const guest=linkFor(base,'invite',event);
      $('guest-link').value=guest;
      $('open-guest').href=guest;
      $('whatsapp').href='https://wa.me/?text='+encodeURIComponent('You’re invited to '+event.title+'! '+guest);
      $('share-caption').textContent=event.title+' · Hosted by '+event.host;
      $('phone').value=event.phone;
    };
    update();$('pages-share').hidden=false;
    $('copy-guest').onclick=async()=>{status.textContent=await copy($('guest-link').value,$('guest-link'));};
    $('pages-phone-form').onsubmit=ev=>{ev.preventDefault();try{
      event=normaliseInvitation({...event,phone:$('phone').value});
      history.replaceState(null,'',linkFor(base,'share',event));
      update();status.textContent='Guest link updated. Share this version with your guests.';
    }catch(ex){status.textContent=ex.message;}};
    $('download').onclick=async()=>{const button=$('download');button.disabled=true;try{
      const {cardPNG}=await import('./export.js');await cardPNG(event,'everpost-invitation');
      status.textContent='Your invitation image is ready.';
    }catch{status.textContent='The invitation image could not be downloaded. Please try again.';}finally{button.disabled=false;}};
  } catch(ex){if(status)status.textContent=ex.message;}
}

export async function enableCalendar(event) {
  const id=event.demo?'everpost-sample':encodeInvitation(event).slice(-40);
  const ics=document.getElementById('ics');
  const blob=await calendarFile(event,location.origin,id).blob();
  const url=URL.createObjectURL(blob);ics.href=url;ics.download='everpost-invitation.ics';
  addEventListener('pagehide',ev=>{if(!ev.persisted)URL.revokeObjectURL(url);},{once:true});
}
export function prepareReply(form,event,reply,copy) {
  const message=responseMessage(event,reply);
  const status=form.querySelector('.status');status.textContent='';
  const text=document.createElement('textarea');text.readOnly=true;text.rows=3;text.value=message;text.setAttribute('aria-label','Your prepared reply');
  const note=document.createElement('p');
  note.textContent=event.phone?'Send this message to your host on WhatsApp, or copy it.':'Select your host in WhatsApp, or copy this reply to the invitation conversation.';
  const actions=document.createElement('div');actions.className='actions';
  const whatsapp=document.createElement('a');whatsapp.className='btn primary';whatsapp.target='_blank';whatsapp.rel='noopener';whatsapp.textContent='Open WhatsApp';
  whatsapp.href='https://wa.me/'+event.phone.slice(1)+'?text='+encodeURIComponent(message);
  const btn=document.createElement('button');btn.type='button';btn.className='btn outline';btn.textContent='Copy reply';
  const feedback=document.createElement('span');btn.onclick=async()=>{const msg=await copy(message,text);feedback.textContent=msg==='Link copied.'?'Reply copied. Paste it in a message to your host.':'Select the reply above and copy it.';};
  actions.append(whatsapp,btn);status.append(note,text,actions,feedback);
}
