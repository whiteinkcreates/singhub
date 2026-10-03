// Isolated CI-only database fixture. It never connects to production.
import {createServer} from 'node:http';
let profile=null;
createServer(async(request,response)=>{
 const url=new URL(request.url,'http://127.0.0.1:3101');
 response.setHeader('Content-Type','application/json');response.setHeader('Access-Control-Allow-Origin','http://localhost:3100');response.setHeader('Access-Control-Allow-Headers',request.headers['access-control-request-headers']||'content-type');response.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');
 if(request.method==='OPTIONS'){response.writeHead(204);response.end();return;}
 if(url.pathname==='/rest/v1/hotel_profiles'){
  if(request.method==='GET'){response.end(JSON.stringify(profile?[profile]:[]));return;}
  if(request.method==='POST'){let body='';for await(const chunk of request)body+=chunk;const data=JSON.parse(body);profile=Array.isArray(data)?data[0]:data;response.writeHead(201);response.end();return;}
 }
 response.writeHead(404);response.end(JSON.stringify({message:'Fixture has no data for this endpoint'}));
}).listen(3101,'127.0.0.1');
