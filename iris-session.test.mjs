import assert from "node:assert/strict";
import {test} from "node:test";
import {makeIrisSession} from "./iris-session.mjs";
const testSession = (overrides={}) => {
 let tracksStopped = 0, sessionsEnded = 0, starts = 0, params, snapshots=[];
 const controller = makeIrisSession({agentId:"TEST_ONLY",update:s=>snapshots.push(s),
  getAudio: async () => ({getTracks:()=>[{stop:()=>++tracksStopped}]}),
  getSdk:async()=>({Conversation:{startSession:async p=>{
   ++starts; params=p; return {endSession:async()=>++sessionsEnded};
  }}}), ...overrides});
 return {controller,snapshots,get props(){return {tracksStopped,sessionsEnded,starts,params}}};
};
test("nothing starts until explicit consent; end releases session",async()=>{
 const x=testSession(); assert.equal(x.props.starts,0);
 await x.controller.start(); assert.equal(x.snapshots.at(-1).state,"live");
 assert.equal(x.props.tracksStopped,1); assert.equal(x.props.starts,1);
 await x.controller.start(); assert.equal(x.props.starts,1);
 await x.controller.stop(); assert.equal(x.props.sessionsEnded,1); assert.equal(x.snapshots.at(-1).state,"idle");
});
test("permission denial permits retry and never contacts ElevenLabs",async()=>{
 const x=testSession({getAudio:async()=>{throw new DOMException("Denied","NotAllowedError")}});
 await x.controller.start(); assert.match(x.snapshots.at(-1).error,/microphone/); assert.equal(x.props.starts,0);
});
test("SDK connection failure displays a retryable error",async()=>{
 const x=testSession({getSdk:async()=>{throw new Error("Failed to load")}});
 await x.controller.start(); assert.match(x.snapshots.at(-1).error,/connect/); assert.equal(x.snapshots.at(-1).state,"idle");
});
test("missing Iris ID does not even request the microphone", async()=>{
 let asked=false; const x=testSession({agentId:null,getAudio:async()=>{asked=true}});
 await x.controller.start(); assert.equal(asked,false); assert.match(x.snapshots.at(-1).error,/not connected/);
});
test("cancelling permission immediately releases a late track",async()=>{
 let resolve; const pending=new Promise(r=>{resolve=r});
 const x=testSession({getAudio:()=>pending}); const start=x.controller.start();
 await x.controller.stop(); let stopped=0;
 resolve({getTracks:()=>[{stop:()=>++stopped}]});
 await start; assert.equal(stopped,1); assert.equal(x.props.starts,0);
});
test("disconnect clears mic state",async()=>{
 const x=testSession(); await x.controller.start(); x.props.params.onDisconnect();
 assert.equal(x.snapshots.at(-1).state,"idle");
});
