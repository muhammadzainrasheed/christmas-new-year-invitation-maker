import {handle} from './service.mjs';
export default {async fetch(request,env) {
  try {return await handle(request,env.DB,req=>env.ASSETS.fetch(req),{origin:env.PUBLIC_ORIGIN||new URL(request.url).origin,ip:request.headers.get('CF-Connecting-IP')||'edge'});}
  catch (err){console.error('Everpost request failed:',err.name);return new Response('Everpost is temporarily unavailable. Please try again shortly.',{status:503,headers:{'cache-control':'no-store'}});}
}};
