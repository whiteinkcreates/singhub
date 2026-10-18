// Isolated local Supabase substitute. Never uses production credentials or data.
import {createServer} from 'node:http';
const user={id:'isolated-singer',email:'qa@example.invalid',email_confirmed_at:'2026-01-01',app_metadata:{},user_metadata:{}};
let songs=[];
const visits=[1,2].map(n=>({id:'visit-'+n,user_id:user.id,venue_id:'venue-'+n,venue_slug:n===1?'the-lamplighter':'deanos-pub',venue_name:n===1?'The Lamplighter':"Deano’s Pub",nightlife_date:'2026-10-17',created_at:'2026-10-18T06:00:00Z',method:'self_reported',status:'confirmed'}));
createServer(async(req,res)=>{
 res.setHeader('Access-Control-Allow-Origin','http://localhost:3100');res.setHeader('Access-Control-Allow-Headers','authorization, apikey, content-type, x-client-info, prefer, range, range-unit');res.setHeader('Access-Control-Allow-Methods','GET, POST, PATCH, HEAD, DELETE, OPTIONS');res.setHeader('Access-Control-Expose-Headers','Content-Range');res.setHeader('Content-Type','application/json');
 if(req.method==='OPTIONS'){res.writeHead(204);res.end();return;}
 const url=new URL(req.url,'http://127.0.0.1:3101');
 if(url.pathname==='/reset'){songs=[];res.end('{}');return;}
 if(url.pathname.startsWith('/auth/v1/')){
  if(url.pathname.endsWith('/logout')){res.writeHead(204);res.end();return;}
  if(url.pathname.endsWith('/otp')){res.end('{}');return;}
  if(req.headers.authorization!=='Bearer test-token'){res.writeHead(401);res.end('{"message":"Invalid token"}');return;}
  res.end(JSON.stringify(user));return;
 }
 const table=url.pathname.split('/').at(-1);
 if(table==='singer_performances'&&req.method==='POST'){
  let body='';for await(const part of req)body+=part;
  const song=JSON.parse(body);
  if(song.song_title==='Rejected song'){res.writeHead(400);res.end('{"message":"Performance could not be saved."}');return;}
  songs.push({...song,id:'song-'+songs.length,created_at:new Date().toISOString()});res.writeHead(201);res.end('');return;
 }
 let rows=table==='singer_performances'?songs:table==='singer_venue_visits'?visits:table==='singer_profiles'?[{karaoke_alias:'Fixture Singer'}]:table==='singer_achievements'?[{id:'award-first',badge_key:'first_gig',badge_name:'First Gig',awarded_at:'2026-10-17',award_note:null}]:[];
 const owner=url.searchParams.get('user_id');if(owner&&owner!=='eq.'+user.id)rows=[];
 res.setHeader('Content-Range','0-'+Math.max(0,rows.length-1)+'/'+rows.length);
 if(req.method==='HEAD'){res.end();return;}
 if(url.searchParams.has('offset')){const offset=Number(url.searchParams.get('offset'));rows=rows.slice(offset,offset+Number(url.searchParams.get('limit')||1000));}
 res.end(JSON.stringify(req.headers.accept?.includes('application/vnd.pgrst.object+json')?(rows[0]||null):rows));
}).listen(3101,'127.0.0.1',()=>console.log('Isolated My SingHUB fixture on 3101'));
