import {mkdir,cp,rm,writeFile,readFile} from 'node:fs/promises';
import {unpack} from './unpack.mjs';
import {publicPages,render} from '../src/pages.mjs';
await unpack();await rm('dist',{recursive:true,force:true});await mkdir('dist/_worker.js',{recursive:true});
await cp('public/assets','dist/assets',{recursive:true});await cp('src','dist/_worker.js',{recursive:true});
await cp('src/worker.mjs','dist/_worker.js/index.js');
const origin=process.env.PUBLIC_ORIGIN||process.env.CF_PAGES_URL||'http://localhost:5173';
for(const route of [...publicPages,'/404']){const file=route==='/'?'dist/index.html':'dist'+route+'.html';await writeFile(file,render(route,origin));}
await writeFile('dist/_routes.json',JSON.stringify({version:1,include:['/*'],exclude:['/assets/*']}));
await writeFile('dist/_headers','/assets/*\n  Cache-Control: public, max-age=3600\n  X-Content-Type-Options: nosniff\n');
console.log('Built Everpost pages, assets and Cloudflare Pages worker.');
