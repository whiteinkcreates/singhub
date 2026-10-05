import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createServer} from 'node:http';
import {join} from 'node:path';
const require=createRequire(import.meta.url);
const deps=process.env.MERCH_QA_DEPS||'/tmp/singhub-merch-qa/node_modules';
const {Liquid}=require(join(deps,'liquidjs'));
const source=join(process.cwd(),'integrations/shopify/singhub-merch');
const out='.merch-qa';await mkdir(out,{recursive:true});
const raw=process.env.MERCH_QA_CATALOG?JSON.parse(await readFile(process.env.MERCH_QA_CATALOG,'utf8')):(await (await fetch('https://whiteinkcreates.com/products.json?limit=250')).json()).products.filter(p=>/singhub/i.test(JSON.stringify(p)));
assert.ok(raw.length,'WhiteInk SingHUB catalog snapshot is required');
const products=raw.map(p=>{
 const variants=p.variants.map(v=>({...v,price:Math.round(Number(v.price)*100),compare_at_price:Math.round(Number(v.compare_at_price)*100),featured_image:v.featured_image}));
 return {...p,variants,featured_image:p.images[0],description:p.body_html,type:p.product_type,options:p.options.map(o=>o.name),has_only_default_variant:variants.length===1,selected_or_first_available_variant:variants.find(v=>v.available)||variants[0],available:variants.some(v=>v.available)};
});
const escape=s=>String(s??'').replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const engine=new Liquid();
engine.registerFilter('asset_url',name=>'/assets/'+name);
engine.registerFilter('stylesheet_tag',src=>'<link rel="stylesheet" href="'+escape(src)+'">');
engine.registerFilter('money_with_currency',value=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(value||0)/100)+' USD');
engine.registerFilter('image_url',image=>image?.src||image?.url||image||'');
engine.registerFilter('image_tag',src=>'<img class="sh-product-photo" src="'+escape(src)+'" alt="Catalog product" loading="lazy">');
let section=await readFile(join(source,'sections/singhub-merch-table.liquid'),'utf8');
const schema=JSON.parse(section.match(/{% schema %}([\s\S]*?){% endschema %}/)[1]);
assert.equal(schema.name,'SingHUB Merch Table');
const template=JSON.parse(await readFile(join(source,'templates/page.singhub-merch.json'),'utf8'));
assert.equal(template.layout,'singhub');
section=section.replace(/{% schema %}[\s\S]*?{% endschema %}/,'').replace(/{% paginate [\s\S]*?%}/,'').replace('{% endpaginate %}','').replace(/{% form [\s\S]*?%}/g,'<form class="sh-product-form" method="post" action="/cart/add">').replaceAll('{% endform %}','</form>');
const context={section:{id:'qa',settings:{...Object.fromEntries(schema.settings.filter(s=>'default' in s).map(s=>[s.id,s.default])),...template.sections.main.settings,hero_image:{...products[0].featured_image,width:1000,height:1000},collection:{products,products_count:products.length}}},collections:{},cart:{item_count:0,total_price:0,currency:{iso_code:'USD'}},shop:{name:'WhiteInk Creates',currency:'USD'},routes:{root_url:'/',cart_url:'/cart'},request:{locale:{iso_code:'en'}},page_title:'SingHUB Merch Table',page_description:'SingHUB merchandise',canonical_url:'https://whiteinkcreates.com/pages/singhub-merch',paginate:{pages:1}};
const rendered=await engine.parseAndRender(section,context);
const layout=await readFile(join(source,'layout/singhub.liquid'),'utf8');
const html=await engine.parseAndRender(layout,{...context,content_for_header:'',content_for_layout:'<div style="padding:8px;text-align:center;background:#123b61;font:12px Arial">INTERNAL REVIEW · Actual WhiteInk catalog snapshot · Isolated test cart</div>'+rendered});
const soldOutProducts=products.map(p=>({...p,available:false,variants:p.variants.map(v=>({...v,available:false}))}));
const soldOutSection=await engine.parseAndRender(section,{...context,section:{...context.section,settings:{...context.section.settings,collection:{products:soldOutProducts,products_count:products.length}}}});
const soldOutHtml=await engine.parseAndRender(layout,{...context,content_for_header:'',content_for_layout:soldOutSection});
await writeFile(out+'/review.html',html);await writeFile(out+'/catalog-sources.json',JSON.stringify({retrievedAt:new Date().toISOString(),source:'https://whiteinkcreates.com/products.json?limit=250',products:raw.map(p=>({title:p.title,url:'https://whiteinkcreates.com/products/'+p.handle}))},null,2));
if(process.argv.includes('--render-only')){console.log('Shopify Liquid source rendered with '+products.length+' real catalog products.');process.exit(0);}
const {chromium}=require(join(deps,'playwright'));
let cartItems=[];
const state=()=>({currency:'USD',item_count:cartItems.reduce((n,x)=>n+x.quantity,0),total_price:cartItems.reduce((n,x)=>n+x.final_line_price,0),items:cartItems});
const server=createServer(async(req,res)=>{
 const url=new URL(req.url,'http://localhost');const json=(body,status=200)=>{res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify(body));};
 if(url.pathname.startsWith('/assets/')){const name=url.pathname.slice(8);if(!['singhub-merch.css','singhub-merch.js','singhub-wordmark.png'].includes(name)){res.writeHead(404);return res.end();}res.setHeader('Content-Type',name.endsWith('.png')?'image/png':name.endsWith('.css')?'text/css':'application/javascript');return res.end(await readFile(join(source,'assets',name)));}
 if(url.pathname==='/cart.js')return json(state());
 if(req.method==='POST'&&['/cart/add.js','/cart/change.js'].includes(url.pathname)){
  let body='';for await(const chunk of req)body+=chunk;const data=JSON.parse(body);
  if(url.pathname==='/cart/add.js'){
   const v=products.flatMap(p=>p.variants).find(v=>String(v.id)===String(data.items[0].id));const p=products.find(p=>p.variants.includes(v));if(!v?.available)return json({description:'This option is sold out.'},422);
   let item=cartItems.find(i=>i.id===v.id);if(item){item.quantity++;item.final_line_price=item.quantity*v.price;}else{item={id:v.id,key:String(v.id)+':qa',quantity:1,product_title:p.title,variant_title:v.title,image:p.featured_image?.src,final_line_price:v.price,price:v.price};cartItems.push(item);}return json({items:[item]});
  }
  const item=cartItems.find(i=>i.key===data.id);if(data.quantity>2)return json({description:'Only two are available in this test cart.'},422);if(!data.quantity)cartItems=cartItems.filter(i=>i!==item);else{item.quantity=data.quantity;item.final_line_price=item.price*item.quantity;}return json(state());
 }
 if(url.pathname==='/'||url.pathname==='/soldout'){res.setHeader('Content-Type','text/html');return res.end(url.pathname==='/soldout'?soldOutHtml:html);}res.writeHead(404);res.end();
});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({args:['--no-sandbox']});
try{for(const width of [390,1440]){
 cartItems=[];const ctx=await browser.newContext({viewport:{width,height:1000}});const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/?entry=hosts',{waitUntil:'networkidle'});assert.equal(await page.locator('[data-entry-return]').getAttribute('href'),'https://singhub.app/hosts');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 assert.equal(await page.locator('.sh-hero-media img').count(),1);
 assert.equal(await page.locator('.sh-hero').evaluate(el=>getComputedStyle(el).position),'sticky');
 assert.equal(await page.locator('.sh-hero-media img').evaluate(el=>getComputedStyle(el).objectFit),'cover');
 await page.evaluate(()=>window.scrollTo({behavior:'instant',top:150}));
 const heroTop=await page.locator('.sh-hero').evaluate(el=>el.getBoundingClientRect().top);
 const sheetTop=await page.locator('.sh-merch-content').evaluate(el=>el.getBoundingClientRect().top);
 await page.evaluate(()=>window.scrollTo({behavior:'instant',top:500}));
 assert.equal(await page.locator('.sh-hero').evaluate(el=>el.getBoundingClientRect().top),heroTop);
 assert.ok(await page.locator('.sh-merch-content').evaluate(el=>el.getBoundingClientRect().top)<sheetTop);
 await page.evaluate(()=>window.scrollTo({behavior:'instant',top:0}));
 await page.screenshot({path:out+'/merch-table-'+width+'.png',fullPage:true});
 const card=page.locator('[data-product]').first();const variant=products[0].variants.filter(v=>v.available)[1]||products[0].selected_or_first_available_variant;
 await card.locator('[data-variant]').selectOption(String(variant.id));await card.getByRole('button',{name:'Add to bag'}).click();await page.locator('[data-open-bag]').getByText('1',{exact:true}).waitFor();await page.getByRole('dialog').waitFor();
 assert.ok(cartItems[0].id===variant.id);assert.equal(await page.locator('[data-checkout]').getAttribute('name'),'checkout');assert.equal(await page.locator('[data-checkout]').getAttribute('value'),'Checkout');assert.equal(await page.locator('.sh-checkout-form').getAttribute('action'),'/cart');
 await page.screenshot({path:out+'/bag-'+width+'.png'});const name=products[0].title;
 await page.getByRole('button',{name:'Increase quantity of '+name,exact:true}).click();await page.locator('[data-open-bag]').getByText('2',{exact:true}).waitFor();
 await page.getByRole('button',{name:'Increase quantity of '+name,exact:true}).click();await page.getByText('Only two are available in this test cart.',{exact:true}).waitFor();assert.equal(cartItems[0].quantity,2);
 await page.getByRole('button',{name:'Remove '+name,exact:true}).click();await page.getByText('Your bag is waiting for its first encore.',{exact:true}).waitFor();assert.equal(await page.locator('[data-checkout]').isDisabled(),true);
 await page.keyboard.press('Escape');assert.equal(await page.getByRole('dialog').count(),0);await page.getByRole('button',{name:/^Bag /}).click();await page.getByRole('button',{name:'Close bag',exact:true}).click();
 assert.deepEqual(errors,[]);await ctx.close();console.log('Merch portal passed at '+width+'px: actual catalog, variants, cart, stock limit, removal and keyboard closing.');
}
 // A pre-existing WhiteInk item stays in the shared cart when SingHUB items are added/removed.
 cartItems=[{id:1,key:'existing:qa',quantity:1,product_title:'QA pre-existing WhiteInk item',price:1000,final_line_price:1000,image:null}];
 const page=await browser.newPage();await page.goto(base+'/?entry=https://evil.example',{waitUntil:'networkidle'});assert.equal(await page.locator('[data-entry-return]').getAttribute('href'),'https://singhub.app/account#merch');await page.locator('[data-product]').first().getByRole('button',{name:'Add to bag'}).click();await page.getByRole('heading',{name:'QA pre-existing WhiteInk item',exact:true}).waitFor();assert.equal(cartItems.length,2);assert.equal(await page.locator('img[src$="undefined"]').count(),0);await page.close();
 const unavailable=await browser.newPage();await unavailable.goto(base+'/soldout',{waitUntil:'networkidle'});assert.equal(await unavailable.locator('.sh-add:enabled').count(),0);assert.equal(await unavailable.locator('[data-variant] option:not([disabled])').count(),0);await unavailable.close();
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
