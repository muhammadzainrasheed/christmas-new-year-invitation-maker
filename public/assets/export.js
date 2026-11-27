// Canvas uses the same illustration, fonts, wording and palette as the HTML card.
export async function cardPNG(event,slug){
 await Promise.all([document.fonts.load('italic 80px "DM Serif Text"'),document.fonts.load('36px "DM Sans"')]);
 const image=new Image();image.src=new URL('./evergreen-wreath.webp',import.meta.url).href;await image.decode();
 const cv=document.createElement('canvas');cv.width=1500;cv.height=2100;const c=cv.getContext('2d');
 const groups=[
  ['YOU’RE INVITED TO',29,'DM Sans','#655748',false,35],
  [event.title,110,'DM Serif Text','#873c49',true,38],
  [new Intl.DateTimeFormat('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:event.zone}).format(new Date(event.instant)),49,'DM Sans','#243b31',false,8],
  [new Intl.DateTimeFormat('en-GB',{hour:'numeric',minute:'2-digit',hour12:true,timeZone:event.zone,timeZoneName:'short'}).format(new Date(event.instant)),43,'DM Sans','#243b31',false,33],
  [event.venue,43,'DM Sans','#243b31',false,30],
  ['With love, '+event.host,56,'DM Serif Text','#873c49',true,30],
  [event.message,39,'DM Sans','#48564a',false,0]
 ];
 function layout(s){const out=[];for(const [value,size,family,color,italic,gap] of groups){const font=(italic?'italic ':'')+(size*s)+'px "'+family+'"';c.font=font;const lines=[];
 for(const para of value.split(/\r?\n/)){let line='';for(const word of para.split(/\s+/)){const next=line?line+' '+word:word;if(line&&c.measureText(next).width>1150){lines.push(line);line='';}if(c.measureText(word).width>1150){for(const ch of word){if(c.measureText(line+ch).width>1150){lines.push(line);line='';}line+=ch;}}else{line+=(line?' ':'')+word;}}lines.push(line);}
 out.push({lines,font,color,lh:size*s*1.23,gap:gap*s});}return out;}
 let s=1,blocks=layout(s);const total=()=>blocks.reduce((n,b)=>n+b.lines.length*b.lh+b.gap,0);while(total()>1320&&s>.25){s-=.035;blocks=layout(s);}
 c.fillStyle='#fffaf0';c.fillRect(0,0,1500,2100);c.strokeStyle='#c7b999';c.lineWidth=3;c.strokeRect(38,38,1424,2024);c.lineWidth=1;c.strokeRect(48,48,1404,2004);
 const artW=455,artH=artW*image.height/image.width;const top=Math.max(78,(2100-artH-65-total())/2);c.drawImage(image,(1500-artW)/2,top,artW,artH);
 let y=top+artH+65;c.textAlign='center';c.textBaseline='top';for(const b of blocks){c.font=b.font;c.fillStyle=b.color;for(const line of b.lines){c.fillText(line,750,y);y+=b.lh;}y+=b.gap;}
 const blob=await new Promise(resolve=>cv.toBlob(resolve,'image/png'));if(!blob)throw Error('PNG unavailable');const url=URL.createObjectURL(blob);const a=document.createElement('a');a.download=slug+'.png';a.href=url;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
}
