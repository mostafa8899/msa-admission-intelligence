import assert from 'node:assert/strict';
import fs from 'node:fs';
import {scenario,csv} from './dist/calculations.mjs';
const data=JSON.parse(fs.readFileSync('dist/data.json','utf8'));
assert.equal(Object.keys(data.views).length,20);
const full=data.views['broad:all'];
assert.equal(full.visits,12016);assert.equal(full.inbound_messages,41932);
assert.equal(full.review_exposure_visits,1989);assert.equal(full.fee_eligibility_union,8142);
assert.equal(full.response.mature,11959);assert.equal(full.response.timely,11646);
assert.equal(full.same_topic_return_inbound_messages,6244);
for(const cohort of ['broad','strong']){
 let total=0;
 for(let m=1;m<=9;m++){
  const v=data.views[`${cohort}:2026-${String(m).padStart(2,'0')}`];total+=v.visits;
  assert.equal(v.matched_change,null);
  assert.ok(v.fee_eligibility_union<=v.visits);
  assert.ok(v.review_exposure_visits<=v.response.mature);
  assert.equal(v.response.timely+v.response.gap,v.response.mature);
 }
 assert.equal(total,data.views[`${cohort}:all`].visits);
}
assert.equal(data.views['strong:all'].visits,6147);
assert.deepEqual(scenario(6244,25,0),{messages:1561,hours:null,reduction:25,handling:0});
assert.equal(scenario(6244,25,3).hours,78.05);
assert.equal(scenario(6244,999,-5).messages,3122);
assert.equal(scenario(0,25,3).hours,0);
assert.ok(csv([{topic:'=malicious()',visits:1}]).includes("'=malicious()"));
assert.ok(csv([{topic:'Fees, "quoted"'}]).includes('"Fees, ""quoted"""'));
const raw=fs.readFileSync('dist/data.json','utf8');
for(const field of ['participant','participant_name','thread','external_message_id','evidence','sender_id','text'])assert.ok(!new RegExp(`"${field}"\\s*:`).test(raw),`Private field ${field}`);
const html=fs.readFileSync('dist/index.html','utf8');
for(const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)){const file=match[1];if(!file.startsWith('http'))assert.ok(fs.existsSync(`dist/${file}`),`Missing ${file}`);}
assert.ok(html.includes('Not an official university website.'));
const ids=[...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size);
console.log('PASS: 20 aggregate views, cohort reconciliation, reply denominators, unique exposure bounds, scenarios, CSV escaping, private-field exclusion and local assets.');
