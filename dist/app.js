import {scenario, csv} from './calculations.mjs';
const $ = id => document.getElementById(id);
const nf = new Intl.NumberFormat('en-US');
const n = value => nf.format(Math.round(value ?? 0));
const pct = value => value == null ? 'Unavailable' : `${value.toFixed(1)}%`;
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let dataset, current, activeTopic, demandMode = 'volume';
const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep'];
const hypotheses = {
 'Eligibility & grades': ['Certificate-specific eligibility guidance','Audit whether the answer explains the relevant certificate route, score rules, required documents, and next step. Confirm official requirements before changing content.','Reviewed answer completeness and same-topic return rate'],
 'Fees & installments': ['A clearer fee breakdown','Test an approved answer that distinguishes tuition, additional fees, installment terms, and the next action. Check whether costs or payment conditions remain unclear.','Reviewed clarity and repeat fee inquiries'],
 'Application & dates': ['A concrete next-step checklist','Explain the relevant deadline, application route, required documents, and what the applicant should do next. Review questions that return after the initial answer.','Reviewed next-step clarity and repeat application inquiries'],
 'Application follow-up': ['A reliable status handoff','Review whether applicants receive an actionable status route, expected follow-up time, and a clear escalation path. Verify status in the admissions system.','Status resolution and repeat follow-up inquiries'],
 'Tests & interviews': ['One preparation guide','Clarify booking, timing, preparation, required materials, and how results are communicated. Confirm current rules with the admissions team.','Preparation clarity and repeat test inquiries'],
 'Scholarships': ['Transparent scholarship conditions','Review eligibility, required evidence, deadlines, and a clear application route. Validate all benefit claims before use.','Reviewed completeness and repeat scholarship inquiries'],
 'Transfer & equivalency': ['A transfer-specific checklist','Explain which documents and reviews are needed, who evaluates equivalency, and the next step. Avoid promising transfer acceptance from a chat signal.','Checklist completeness and repeat transfer inquiries'],
 'Documents': ['A document checklist by route','Review whether the required documents, format, submission channel, and missing-item process are clear.','Document clarity and repeat document inquiries'],
 'Campus & transport': ['A verified campus information guide','Audit location and transport answers and confirm current routes, service availability, and the right contact. This smaller topic has fewer observations.','Reviewed accuracy and reply-gap rate']
};

function renderBars(id, values, limit = 9) {
  const entries = Object.entries(values).sort((a,b) => b[1]-a[1]).slice(0,limit);
  const max = Math.max(1,...entries.map(r=>r[1]));
  $(id).classList.toggle('faculty', id === 'faculties');
  $(id).innerHTML = entries.length ? entries.map(([label,count]) => `<div><div class="bar-label"><span>${esc(label)}</span><b>${n(count)}</b></div><div class="bar-track" aria-hidden="true"><i style="width:${count/max*100}%"></i></div></div>`).join('') : '<p class="fine-print">No labels detected in this selection.</p>';
}

function renderDemand() {
  // Always retain full-period demand context for the chosen evidence cohort.
  const rows = dataset.views[`${$('cohort').value}:all`].monthly;
  const vals = rows.map(r => demandMode === 'volume' ? r.visits : r.visits_per_calendar_day);
  const max = Math.max(1,...vals) * 1.17;
  const W=760,H=235,left=42,right=14,top=18,bottom=35, cw=W-left-right,ch=H-top-bottom;
  let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="demandTitle demandDesc"><title id="demandTitle">Monthly candidate ${demandMode==='volume'?'visits':'visits per calendar day'}</title><desc id="demandDesc">Full-period context for the selected cohort. ${rows.map((r,i)=>`${months[i]}: ${demandMode==='volume'?n(vals[i]):vals[i].toFixed(1)}${r.partial?' (partial month)':''}`).join('; ')}.</desc>`;
  for(let t=0;t<=3;t++) {
    const y=top+ch-(ch*t/3), value=max*t/3;
    svg += `<line x1="${left}" x2="${W-right}" y1="${y}" y2="${y}" stroke="#e8eeeb"/><text x="${left-9}" y="${y+3}" text-anchor="end" font-size="8" fill="#82919a">${value>=1000?(value/1000).toFixed(1)+'k':Math.round(value)}</text>`;
  }
  const step=cw/9, bw=step*.46;
  rows.forEach((r,i) => {
    const x=left+step*(i+.5), height=ch*vals[i]/max,y=top+ch-height;
    const selected=$('period').value==='all'||$('period').value===r.month;
    svg += `<g opacity="${selected?1:.32}"><rect x="${x-bw/2}" y="${y}" width="${bw}" height="${Math.max(height,.8)}" rx="3" fill="${r.partial?'#d9b465':'#007f76'}"><title>${months[i]}: ${demandMode==='volume'?n(vals[i]):vals[i].toFixed(1)} ${demandMode==='volume'?'visits':'visits/day'}${r.partial?' · partial coverage':''}</title></rect><text x="${x}" y="${Math.max(11,y-9)}" text-anchor="middle" font-size="8" fill="#17354a">${demandMode==='volume'?n(vals[i]):vals[i].toFixed(1)}</text><text x="${x}" y="${H-12}" text-anchor="middle" font-size="9" fill="#647582">${months[i]}${r.partial?'*':''}</text></g>`;
  });
  $('demandChart').innerHTML=svg+'</svg>';
}

function renderPriority() {
  const rows=current.priorities;
  if(!rows.some(r=>r.topic===activeTopic)) activeTopic=rows[0]?.topic;
  $('priorityRows').innerHTML=rows.map((r,i)=>`<tr class="${r.topic===activeTopic?'selected':''}"><td><button class="topic-button" data-topic-index="${i}" aria-pressed="${r.topic===activeTopic}">${esc(r.topic)}</button></td><td>${n(r.visits)}</td><td>${n(r.review_exposure_visits)}</td><td>${pct(r.gap_rate_pct)}</td></tr>`).join('');
  $('priorityRows').querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>{activeTopic=rows[Number(btn.dataset.topicIndex)].topic;renderPriority();}));
  const r=rows.find(r=>r.topic===activeTopic);
  if(!r){$('priorityDetail').innerHTML='<p>No topic data in this selection.</p>';return;}
  const h=hypotheses[r.topic] || ['Review answer quality','Inspect a labeled sample before proposing changes.','Reviewed resolution'];
  $('priorityDetail').innerHTML=`<span class="eyebrow">REVIEW FOCUS</span><h3>${esc(r.topic)}</h3><div class="detail-number">${n(r.review_exposure_visits)}<span>mature visits with a review signal</span></div><h4>WHAT THE DATA SAYS</h4><p>${n(r.same_topic_return_visits)} repeated-topic visits, ${n(r.gap_visits)} reply gaps, and ${n(r.friction_flag_visits)} friction-flagged visits. These groups overlap.</p><div class="hypothesis"><span class="eyebrow">IMPROVEMENT HYPOTHESIS</span><h4>${esc(h[0])}</h4><p>${esc(h[1])}</p><h4>MEASURE</h4><p>${esc(h[2])}</p></div>`;
}

function renderScenario() {
  if(!current)return;
  const s=scenario(current.same_topic_return_inbound_messages,$('reduction').value,$('minutes').value);
  $('reductionLabel').textContent=`${s.reduction}%`;
  $('scenarioMessages').textContent=n(s.messages);
  $('scenarioHours').textContent=s.hours==null?'Not estimated':`${s.hours.toFixed(1)} hours`;
  $('formula').textContent=`${n(current.same_topic_return_inbound_messages)} observed inbound messages × ${s.reduction}% assumed reduction${s.hours==null?'':` × ${s.handling} assumed minutes ÷ 60`}. Scenarios are not forecasts or measured savings.`;
}

function render() {
  if(!dataset)return;
  const key=`${$('cohort').value}:${$('period').value}`;
  current=dataset.views[key];
  const strict=$('cohort').value==='strong', all=$('period').value==='all';
  const period=$('period').options[$('period').selectedIndex].text;
  $('scopeNote').textContent=`${strict?'Strong admission signals only':'Strong and possible admission signals'} · ${period}. Rule-based labels need human review. Hero and PDF use the full broad cohort; the demand chart retains full-period context for the selected cohort.`;
  $('visits').textContent=n(current.visits);
  $('visitSub').textContent=`${n(current.identifiers)} participant identifiers`;
  $('messages').textContent=n(current.inbound_messages);
  $('reach').textContent=pct(current.fee_eligibility_share_pct);
  $('reachSub').textContent=`${n(current.fee_eligibility_union)} distinct visits · topic union`;
  $('exposure').textContent=n(current.review_exposure_visits);
  const top=current.priorities[0];
  $('mainRead').textContent=top?`${top.topic}: start with answer quality.`:'Start with a verified sample.';
  $('mainReadBody').textContent=`Fees or eligibility appear in ${pct(current.fee_eligibility_share_pct)} of selected visits. ${n(current.same_topic_return_visits)} later visits repeat a topic, carrying ${n(current.same_topic_return_inbound_messages)} inbound messages. Prioritize the clarity and usefulness of answers, then test whether repetition falls. These signals do not establish the cause of a return visit.`;
  renderDemand();renderBars('topics',current.topics);renderBars('faculties',current.faculties,7);
  const c=current.matched_change;
  $('comparison').innerHTML=c&&c.change_pct!=null?`<strong>${c.change_pct>0?'+':''}${c.change_pct.toFixed(1)}%</strong><div><h3>September vs August · days 1–15</h3><p>${n(c.current_visits)} vs ${n(c.prior_visits)} candidate visits in matched windows. Descriptive change; the export cannot explain its cause.</p></div>`:'<strong class="muted">Matched-period comparison is available in the full-period view.</strong>';
  $('replyRate').textContent=pct(current.response.rate);
  $('replyDenominator').textContent=`${n(current.response.timely)} timely replies / ${n(current.response.mature)} mature query visits. ${n(current.response.recent)} recent query visits excluded.`;
  $('replyMedian').textContent=current.response.median==null?'Unavailable':`${Number(current.response.median.toFixed(1))}s`;
  $('replyGap').textContent=n(current.response.gap);
  $('repeatCount').textContent=n(current.same_topic_return_visits);
  $('repeatMessages').textContent=n(current.same_topic_return_inbound_messages);
  $('backgroundRead').textContent=`School-certificate background was not detected in ${pct(current.missing_background_pct)} of selected visits. Only ${n(current.background_claim_visits)} visits contained a background signal, and ${n(current.explicit_percentage_visits)} contained an explicit percentage. This describes chat visibility, not missing records in the admissions system.`;
  renderPriority();renderScenario();
  $('liveMetrics').textContent=`Updated ${period}, ${strict?'strong':'broad'} cohort: ${n(current.visits)} candidate visits and ${n(current.review_exposure_visits)} visits flagged for review.`;
}

function download(content,type,name) {
  const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=url;link.download=name;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
const exportName=ext=>`MSA_2026_${$('cohort').value}_${$('period').value}.${ext}`;
$('cohort').addEventListener('change',render);$('period').addEventListener('change',render);
$('reset').addEventListener('click',()=>{$('cohort').value='broad';$('period').value='all';render();});
document.querySelectorAll('[data-demand]').forEach(btn=>btn.addEventListener('click',()=>{demandMode=btn.dataset.demand;document.querySelectorAll('[data-demand]').forEach(b=>{b.classList.toggle('selected',b===btn);b.setAttribute('aria-pressed',String(b===btn));});if(dataset)renderDemand();}));
$('reduction').addEventListener('input',renderScenario);$('minutes').addEventListener('input',renderScenario);
$('exportCsv').addEventListener('click',()=>{if(current)download(csv(current.priorities),'text/csv;charset=utf-8',exportName('csv'));});
$('exportJson').addEventListener('click',()=>{if(current)download(JSON.stringify({coverage:dataset.coverage,cohort:$('cohort').value,period:$('period').value,classification:dataset.classification,metrics:current},null,2),'application/json',exportName('json'));});
const sections=document.querySelectorAll('main section[id]');
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting)document.querySelectorAll('.sidebar>a').forEach(a=>a.classList.toggle('active',a.getAttribute('href')===`#${e.target.id}`));},{rootMargin:'-10% 0px -65% 0px'});sections.forEach(s=>observer.observe(s));}
fetch('data.json').then(r=>{if(!r.ok)throw Error('Could not load data');return r.json();}).then(data=>{dataset=data;render();}).catch(()=>{$('loadError').hidden=false;$('scopeNote').textContent='Analysis data unavailable. See the local running instructions.';});
