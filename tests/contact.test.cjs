const assert=require('node:assert/strict');
const handler=require('../api/contact.js');
const vars=['RESEND_API_KEY','CONTACT_TO','CONTACT_FROM'];
const saved=Object.fromEntries(vars.map(key=>[key,process.env[key]]));
const originalFetch=global.fetch;
function invoke(method='GET',body={},extra={}){
 const req={method,body,headers:{host:'example.test',origin:'https://example.test','content-type':'application/json','x-forwarded-for':'192.0.2.1',...extra}};
 const res={headers:{},code:200,setHeader(k,v){this.headers[k]=v},status(n){this.code=n;return this},json(data){this.data=data;return this}};
 return handler(req,res).then(()=>res);
}
(async()=>{
 for(const key of vars)delete process.env[key];
 assert.equal((await invoke()).data.available,false);assert.equal((await invoke('POST')).code,503);
 process.env.RESEND_API_KEY='test-placeholder';process.env.CONTACT_TO='private-recipient@example.test';process.env.CONTACT_FROM='verified-sender@example.test';
 assert.equal((await invoke()).data.available,true);
 assert.equal((await invoke('DELETE')).code,405);
 assert.equal((await invoke('POST',{}, {origin:'https://evil.test'})).code,403);
 assert.equal((await invoke('POST',{}, {'content-type':'text/plain'})).code,415);
 assert.equal((await invoke('POST',{name:'A',email:'bad',message:'hello'})).code,400);
 let calls=0,payload;
 global.fetch=async(url,options)=>{calls++;assert.equal(url,'https://api.resend.com/emails');payload=JSON.parse(options.body);return{ok:true}};
 assert.equal((await invoke('POST',{website:'spam'})).data.ok,true);assert.equal(calls,0);
 const valid={name:'Visitor',email:'visitor@example.test',message:'Hello',to:'attacker@example.test'};
 assert.equal((await invoke('POST',valid)).data.ok,true);assert.equal(calls,1);assert.deepEqual(payload.to,['private-recipient@example.test']);assert.equal(payload.reply_to,'visitor@example.test');
 assert(!JSON.stringify((await invoke()).data).includes('private-recipient'));
 global.fetch=async()=>({ok:false});assert.equal((await invoke('POST',valid)).code,502);
 global.fetch=async()=>{throw new Error('mock network failure')};assert.equal((await invoke('POST',valid)).code,502);
 assert.equal((await invoke('POST',valid)).code,429);
 console.log('PASS contact endpoint: unavailable config, methods, origin/content validation, honeypot, server-only recipient, provider rejection, uncertain send, throttle. All provider requests mocked; no external email sent.');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>{global.fetch=originalFetch;for(const key of vars){if(saved[key]===undefined)delete process.env[key];else process.env[key]=saved[key]}});
