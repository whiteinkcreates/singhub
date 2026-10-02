import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {test} from 'node:test';
import ts from 'typescript';

const source=readFileSync(new URL('../src/lib/v2/singerAccount.ts',import.meta.url),'utf8');
function service(user,error=null,sendError=null){
 const sent=[];
 const client={auth:{getUser:async()=>({data:{user},error}),signInWithOtp:async payload=>{sent.push(payload);return {error:sendError};}}};
 const exports={};
 const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(code,{exports,require:()=>({createClient:()=>client}),process:{env:{NEXT_PUBLIC_SUPABASE_URL:'https://example.supabase.co',NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'test'}},location:{origin:'https://singhub.app'},Error});
 return {send:(next='/hotel/pendry-san-diego?plan=happy-does&saveHotel=1')=>exports.sendAccountLink('guest@example.com',next),sent};
}
test('first-visit email carries the pending plan through the auth callback',async()=>{
 const {send,sent}=service({email:'guest@example.com'});
 await send();
 assert.equal(sent.length,1);
 assert.equal(sent[0].email,'guest@example.com');
 assert.equal(sent[0].options.emailRedirectTo,'https://singhub.app/auth/callback?next=%2Fhotel%2Fpendry-san-diego%3Fplan%3Dhappy-does%26saveHotel%3D1');
});
test('provider failures propagate so a saved plan does not claim email success',async()=>{
 const error=new Error('Email rate limit exceeded');
 const {send,sent}=service({email:'guest@example.com'},null,error);
 await assert.rejects(send(),/Email rate limit exceeded/);
 assert.equal(sent.length,1);
});

test('Concierge email returns to the branded experience with hotel-save opt-out intact',async()=>{
 const {send,sent}=service(null);
 const next='/hotelexperience/holidayinnexpresslamesa?plan=jts-tavern&saveHotel=0';
 await send(next);
 assert.equal(new URL(sent[0].options.emailRedirectTo).searchParams.get('next'),next);
});
function planService({user={id:'guest'},authError=null,planError=null,hotelError=null}={}){
 const writes=[];
 const client={auth:{getUser:async()=>({data:{user},error:authError})},from:table=>({upsert:async row=>{writes.push({table,row});return {error:table==='hotel_guest_plans'?planError:hotelError};}})};
 const exports={};
 vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:()=>({createClient:()=>client}),process:{env:{NEXT_PUBLIC_SUPABASE_URL:'https://example.supabase.co',NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'test'}},Error});
 return {save:(withHotel=true)=>exports.saveHotelPlan({slug:'holiday-inn-express-la-mesa',name:'Holiday Inn Express La Mesa'},{slug:'jts-tavern',name:'JT’s Tavern'},withHotel),writes};
}
test('first-time guests need sign-in and do not write a false saved plan',async()=>{
 const {save,writes}=planService({user:null,authError:{name:'AuthSessionMissingError'}});
 assert.equal(await save(),false);assert.equal(writes.length,0);
});
test('authenticated saves use the canonical hotel identity across both guide variants',async()=>{
 const {save,writes}=planService();assert.equal(await save(),true);
 assert.deepEqual(writes.map(w=>w.table),['hotel_guest_plans','singer_saved_hotels']);
 assert.ok(writes.every(w=>w.row.user_id==='guest'&&w.row.hotel_slug==='holiday-inn-express-la-mesa'));
 assert.equal(writes[0].row.venue_slug,'jts-tavern');
 const optedOut=planService();await optedOut.save(false);assert.deepEqual(optedOut.writes.map(w=>w.table),['hotel_guest_plans']);
});
test('failed plan and partial hotel saves expose the actual failure',async()=>{
 const failed=planService({planError:new Error('Plan denied')});await assert.rejects(failed.save(),/Plan denied/);assert.equal(failed.writes.length,1);
 const partial=planService({hotelError:new Error('Hotel denied')});await assert.rejects(partial.save(),/Your venue was saved, but the hotel could not be saved.*Hotel denied/);
 const expired=planService({authError:new Error('Session expired')});await assert.rejects(expired.save(),/Session expired/);assert.equal(expired.writes.length,0);
});

test('account summary counts every saved row shown in Saved Picks',()=>{
 const exports={};
 vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:()=>({}),process:{env:{}},Error});
 const account={venues:[{venue_slug:'710-beach-club'}],hotels:[{hotel_slug:'holiday-inn-express-la-mesa'}],plans:[{hotel_slug:'holiday-inn-express-la-mesa',venue_slug:'jts-tavern'}]};
 assert.equal(exports.countSavedPicks(account),3);
 assert.equal(exports.countSavedPicks({venues:[],hotels:[],plans:[]}),0);
 assert.equal(exports.countSavedPicks(null),0);
});
