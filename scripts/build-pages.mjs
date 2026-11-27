import path from 'node:path';
import {mkdir,cp,writeFile,readFile,copyFile} from 'node:fs/promises';
import {sample} from '../src/design.mjs';
import {calendarFile} from '../src/calendar.mjs';
import {render,publicPages} from '../src/pages.mjs';
import {siteMarkup,sitePath} from '../src/github-pages.mjs';
import {unpack} from './unpack.mjs';

const production=new URL(process.env.PAGES_URL||'https://muhammadzainrasheed.github.io/christmas-new-year-invitation-maker/');
const base=production.pathname.replace(/\/?$/,'/');
const absolute=production.origin+base.replace(/\/$/,'');
const output=path.resolve(process.env.PAGES_OUTPUT||'.');
await unpack();await mkdir(path.join(output,'assets'),{recursive:true});
await cp('public/assets',path.join(output,'assets'),{recursive:true});
for(const module of ['github-pages','time','calendar','pages','design','icons']){
 await copyFile('src/'+module+'.mjs',path.join(output,'assets',module+'.mjs'));
}
// CSS asset URLs resolve beside the stylesheet, including project-site subpaths.
const style=await readFile('public/assets/style.css','utf8');
await writeFile(path.join(output,'assets/style.css'),style.replaceAll('url(/assets/','url(./'));
for(const route of [...publicPages,'/invite','/share','/404']){
 const dir=path.join(output,route==='/'||route==='/404'?'':route.slice(1));
 await mkdir(dir,{recursive:true});
 let html=siteMarkup(render(route,absolute,null,true),base).replace('<html lang="en">','<html lang="en" data-pages-base="'+base+'">');
 if(!['/','/404'].includes(route))html=html.replaceAll(absolute+route+'"',absolute+route+'/"');
 await writeFile(path.join(dir,route==='/404'?'404.html':'index.html'),html);
}
await writeFile(path.join(output,'sample/calendar.ics'),await calendarFile(sample(),production.origin,'sample').text());
await writeFile(path.join(output,'.nojekyll'),'');
await writeFile(path.join(output,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+publicPages.map(p=>'<url><loc>'+production.origin+sitePath(p,base)+'</loc></url>').join('')+'</urlset>');
await writeFile(path.join(output,'robots.txt'),'User-agent: *\nAllow: /\nSitemap: '+absolute+'/sitemap.xml\n');
console.log('Built the standalone GitHub Pages site at '+output);
