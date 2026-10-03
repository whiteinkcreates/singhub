// CI-only HTTP fixture. Never points at a real database or publishes test content.
// The layout test needs SingBOARD's empty state, including its expiry update call.
import {createServer} from 'node:http';
createServer(async(request,response)=>{
 const url=new URL(request.url,'http://127.0.0.1:3101');
 response.setHeader('Access-Control-Allow-Origin','http://localhost:3100');
 response.setHeader('Access-Control-Allow-Methods','GET,POST,PATCH,OPTIONS');
 response.setHeader('Access-Control-Allow-Headers',request.headers['access-control-request-headers']||'content-type');
 if(request.method==='OPTIONS'){response.writeHead(204);response.end();return;}
 if(url.pathname==='/rest/v1/singer_performances' && request.method==='POST'){
  let body='';for await(const chunk of request)body+=chunk;
  const song=JSON.parse(body).song_title;
  response.writeHead(song==='Rejected song'?400:201,{'Content-Type':'application/json'});
  response.end(song==='Rejected song'?JSON.stringify({message:'Performance could not be saved.'}):'');
 }else if(url.pathname==='/rest/v1/singboard_flyers' && ['GET','PATCH'].includes(request.method)){
  response.writeHead(200,{'Content-Type':'application/json'});
  response.end('[]');
 }else{
  response.writeHead(404,{'Content-Type':'application/json'});
  response.end(JSON.stringify({message:'No fixture for '+url.pathname}));
 }
}).listen(3101,'127.0.0.1',()=>console.log('Isolated SingBOARD layout fixture ready'));
