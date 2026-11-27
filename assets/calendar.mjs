const escCal=s=>String(s).replaceAll('\\','\\\\').replace(/\r\n|\r|\n/g,'\\n').replaceAll(',','\\,').replaceAll(';','\\;');
const stamp=t=>new Date(t).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
function fold(line){let out='',bytes=0;for(const c of line){const n=new TextEncoder().encode(c).length;if(bytes+n>75){out+='\r\n ';bytes=1;}out+=c;bytes+=n;}return out;}
export function calendarFile(d,origin,slug){const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Everpost//Holiday Invitations//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH','BEGIN:VEVENT','UID:'+slug+'@'+new URL(origin).host,'DTSTAMP:'+stamp(Date.now()),'DTSTART:'+stamp(d.instant),'SUMMARY:'+escCal(d.title),'LOCATION:'+escCal(d.venue),'DESCRIPTION:'+escCal(d.message),'END:VEVENT','END:VCALENDAR'];
return new Response(lines.map(fold).join('\r\n')+'\r\n',{headers:{'content-type':'text/calendar; charset=utf-8','content-disposition':'attachment; filename="everpost-invitation.ics"','cache-control':'no-store'}});}
