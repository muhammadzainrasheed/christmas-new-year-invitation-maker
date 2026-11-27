import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {normaliseInvitation,encodeInvitation,decodeInvitation,responseMessage,sitePath} from '../src/github-pages.mjs';
import {calendarFile} from '../src/calendar.mjs';
import {sample} from '../src/design.mjs';
const sampleEvent={...sample(),date:'2099-12-24',host:'Zain & زین',title:'Winter dinner 🎄',message:'Join us <at home>!\nBring a friend.',phone:'+92 300 1234567'};
test('the guest link carries the entire invitation between independent browsers',()=>{
 const packet=encodeInvitation(sampleEvent);const fresh=decodeInvitation('#card='+packet);
 assert.equal(fresh.host,sampleEvent.host);assert.equal(fresh.message,sampleEvent.message);assert.equal(fresh.phone,'+923001234567');assert.equal(fresh.instant,'2099-12-24T18:30:00.000Z');
 assert.throws(()=>decodeInvitation('#card=1.bad'));assert.throws(()=>normaliseInvitation({...fresh,date:'2000-01-01'},true));assert.throws(()=>normaliseInvitation({...fresh,phone:'unexpected'}));
});
test('RSVP, wish and calendar use the contents of the guest link',async()=>{
 const event=decodeInvitation('#card='+encodeInvitation(sampleEvent));
 assert.match(responseMessage(event,{attending:'yes',name:'Sara',guests:3}),/Sara is attending. Party size: 3/);
 assert.match(responseMessage(event,{attending:'no',name:'Sara'}),/cannot attend/);
 assert.match(responseMessage(event,{name:'Sara',message:'Happy holidays!'}),/Happy holidays!/);
 assert.match(await calendarFile(event,'https://example.org','demo').text(),/20991224T183000Z/);
});
test('every Pages route and asset is published under the repository path',()=>{
 const base='/christmas-new-year-invitation-maker/';
 for(const route of ['','create','sample','share','invite','privacy','terms','contact','christmas-invitations']){
  const html=readFileSync((route?route+'/':'')+'index.html','utf8');assert.ok(html.includes('data-pages-base="'+base+'"'));
  for(const m of html.matchAll(/(?:src|href)="(\/(?!\/)[^"]+)"/g)){
   assert.ok(m[1].startsWith(base),m[1]);const asset=m[1].slice(base.length).split(/[?#]/)[0];if(asset&&!asset.endsWith('/'))readFileSync(asset);
  }
 }
 assert.equal(sitePath('/#faq',base),base+'#faq');
 assert.ok(!readFileSync('index.html','utf8').includes('private host link'));
});
