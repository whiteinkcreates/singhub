import assert from 'node:assert/strict';
import {createServer} from 'node:http';
process.env.NODE_ENV='production';
process.env.SINGHUB_ADMIN_PASSWORD='local-host-media-review';
const next=(await import('next')).default;
const app=next({dev:false,hostname:'127.0.0.1',port:3115});await app.prepare();
const server=createServer(app.getRequestHandler());await new Promise(resolve=>server.listen(3115,'127.0.0.1',resolve));
const base='http://127.0.0.1:3115';const auth='Basic '+Buffer.from('admin:local-host-media-review').toString('base64');
try{
 assert.equal((await fetch(base+'/admin/hosts')).status,401);
 assert.equal((await fetch(base+'/api/admin/host-profiles?slug=singhub-hosts-directory')).status,401);
 const put=async(body,origin=undefined)=>fetch(base+'/api/admin/host-profiles',{method:'PUT',headers:{authorization:auth,'content-type':'application/json',...(origin?{origin}:{})},body:JSON.stringify(body)});
 assert.equal((await put({slug:'singhub-hosts-directory',profile:{}},'https://example.net')).status,403);
 assert.equal((await put({slug:'singhub-hosts-directory',profile:{portraitUrl:'javascript:alert(1)'}})).status,400);
 assert.equal((await put({slug:'singhub-hosts-directory',profile:{heroUrl:'https://example.com/hero.jpg'}})).status,400);
 assert.equal((await put({slug:'singhub-hosts-directory',profile:{heroPosition:'banana'}})).status,400);
 const form=new FormData();form.set('slug','singhub-hosts-directory');form.set('file',new File(['text'],'bad.txt',{type:'text/plain'}));
 assert.equal((await fetch(base+'/api/admin/host-media',{method:'POST',headers:{authorization:auth},body:form})).status,400);
 if(!process.env.SUPABASE_SERVICE_ROLE_KEY){assert.equal((await fetch(base+'/api/admin/host-profiles?slug=singhub-hosts-directory',{headers:{authorization:auth}})).status,503);}
 const html=await fetch(base+'/admin/hosts',{headers:{authorization:auth}});assert.equal(html.status,200);const content=await html.text();assert.ok(content.includes('Host media'));assert.ok(content.includes('Shared Hosts directory hero'));
 console.log('Host media authentication, same-origin writes, image validation, honest persistence failure, and admin page passed.');
}finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));await app.close();}
