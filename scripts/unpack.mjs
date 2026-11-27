import {readdir,readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const media=new URL('../media/',import.meta.url), output=new URL('../public/assets/',import.meta.url);
export async function unpack(){await mkdir(output,{recursive:true});for(const filename of await readdir(media)){
 if(!filename.endsWith('.b64'))continue;const target=new URL(filename.slice(0,-4),output);
 const bytes=Buffer.from(await readFile(new URL(filename,media),'utf8'),'base64');await writeFile(fileURLToPath(target),bytes);
}}
