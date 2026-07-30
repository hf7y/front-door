#!/usr/bin/env node
// Generates CONTRACT.md and POSTAL.md from protocol.json.
// Prose is a build artifact. Edit protocol.json, never the .md files.
//   node protocol/render.mjs         write
//   node protocol/render.mjs --check exit 1 if stale (CI)
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const p = JSON.parse(readFileSync(join(root, 'protocol/protocol.json'), 'utf8'));
const check = process.argv.includes('--check');

const BANNER = '<!-- GENERATED from protocol/protocol.json by protocol/render.mjs. Do not edit. -->';
const tick = (b) => (b ? 'yes' : 'no');
const open = (o) => (o.decided ? 'SETTLED' : 'UNDECIDED');

function contract() {
  const L = [BANNER, '', '# Doorkeeper\'s Contract', '',
    `Version ${p.version}, opened ${p.opened}. Machine source: [\`protocol/protocol.json\`](protocol/protocol.json).`,
    '', `**Vision:** ${p.vision} *${p.vision_note}*`, '',
    'Nothing binds until an amendment PR is approved by every principal.', '', '---', ''];

  L.push('### Art. 1 — Parties', '');
  for (const q of p.parties) L.push(`- **${q.name}** \`@${q.handle}\` — ${q.role}`);
  L.push('', `Agents inherit their principal's rights and may not exceed them (\`may_exceed_principal: ${p.agents.may_exceed_principal}\`). An agent may open an amendment PR (\`${p.agents.may_open_amendment_pr}\`); it may not approve one (\`${p.agents.may_approve_amendment_pr}\`).`, '');

  L.push('### Art. 2 — Channels', '', '| Channel | Address | For | Authenticity |', '|---|---|---|---|');
  for (const c of p.channels) L.push(`| \`${c.id}\` | \`${c.address}\` | ${c.for} | ${c.authenticity} |`);
  L.push('', `Anything else is **not a knock** and carries no obligation. Channel of record: ${p.channel_of_record}.`, '');

  L.push('### Art. 3 — Message shape', '', 'Every knock validates against [`.github/knock.schema.json`](.github/knock.schema.json), enforced by [`protocol/validate.mjs`](protocol/validate.mjs). An invalid knock is refused, not repaired — the doorkeeper does not guess intent.', '');

  L.push('### Art. 4 — Identity', '', 'The repo is public, so anyone can file. Authenticity comes from the channel, not the claim — see Art. 2. An agent asserting `agent-for-human` must name its principal in `on_behalf_of`; an unnamed principal means no authority.', '');

  L.push('### Art. 5 — Admissible intents', '',
    `Closed by default: \`intents_closed_by_default: ${p.intents_closed_by_default}\`. Nothing is admissible unless listed.`, '',
    '| Intent | Carries | Required payload |', '|---|---|---|');
  for (const [k, v] of Object.entries(p.intents)) L.push(`| \`${k}\` | ${v.carries} | ${v.required.map((r) => `\`${r}\``).join(', ')} |`);
  L.push('', `A \`respond\` that fails to address every received item is **defective** — enforced by ${p.intents.respond.enforced_by}.`, '');

  L.push('### Art. 6 — Rate and size', '',
    `${p.limits.knocks_per_principal_per_hour} knocks per principal per hour; payload ≤ ${p.limits.payload_max_bytes} bytes. Excess is refused, not queued.`, '');

  L.push('### Art. 7 — Reply path', '',
    `The channel of record is ${p.channel_of_record}. Email may notify (\`${p.email_policy.may_notify}\`) but may never carry payload (\`${p.email_policy.may_carry_payload}\`) — ${p.email_policy.rationale}`, '');

  L.push('### Art. 8 — Refusal and silence', '',
    `- **Refusal** — ${p.outcomes.refusal}`, `- **Silence** — ${p.outcomes.silence}`, '',
    ...p.outcomes.invariants.map((i) => `Invariant: ${i}.`), '');

  L.push('### Art. 9 — Amendment', '',
    `By ${p.amendment.mechanism}, approved by ${p.amendment.approvals_required.map((h) => `\`@${h}\``).join(' and ')}. The record is ${p.amendment.record}.`, '');

  L.push('### Art. 10 — Termination', '', p.termination, '');

  L.push('### Art. 11 — Deletion', '',
    `Default: **${p.deletion.default}**. Sole exception: ${p.deletion.sole_exception}. Not grounds for deletion: ${p.deletion.not_grounds.join(', ')}. ${p.deletion.rationale}`, '');

  const qs = openQuestions();
  if (qs.length) {
    L.push('---', '', '## Undecided — blocking', '');
    qs.forEach((q, i) => L.push(`${i + 1}. **${q.at}** — ${q.question}${q.options ? ` Options: ${Object.entries(q.options).map(([k, v]) => `\`${k}\` (${v})`).join('; ')}.` : ''}`));
    L.push('');
  }
  return L.join('\n');
}

function postal() {
  const L = [BANNER, '', '# The Postal Service', '',
    `Rules of the exchange. Machine source: [\`protocol/protocol.json\`](protocol/protocol.json).`, '',
    `The touchstone is ${p.prior_art.exchange} — including its failure, which is why this repo exists.`, '', '---', ''];

  L.push('## I. The cycle', '');
  for (const s of p.cycle) L.push(`${s.step}. **${s.name}** — ${s.what}`);
  L.push('', `Cadence: regular (\`${tick(p.cadence.regular)}\`), rate ${p.cadence.rate}. ${p.cadence.note}`, '');

  L.push('## II. The debate rule', '',
    `Address every point: \`${tick(p.debate_rule.must_address_every_point)}\`. An unaddressed point is defeated: \`${tick(p.debate_rule.unaddressed_point_is_defeated)}\`.`, '',
    `**Concession form:** ${p.debate_rule.concession_form}. This makes the diff itself the record of what is contested.`, '',
    `**Concession mode: ${open(p.debate_rule.concession_mode)}.** ${p.debate_rule.concession_mode.question}`, '');
  for (const [k, v] of Object.entries(p.debate_rule.concession_mode.options)) L.push(`- \`${k}\` — ${v}`);
  L.push('');

  L.push('## III. Why the prior exchange stalled', '',
    `Not ${p.prior_art.not_the_cause.join(', not ')}. Two structural failures:`, '');
  p.prior_art.why_it_stalled.forEach((w, i) => L.push(`${i + 1}. ${w}`));
  L.push('', `**Correction:** ${p.prior_art.correction}`, '');

  L.push('## IV. Milestones', '', `> ${p.milestone_definition}`, '',
    `Consensus is a milestone (\`${tick(p.consensus.is_a_milestone)}\`), scoped to ${p.consensus.scope}. Settled points become **${p.consensus.settled_points_become}**, whose purpose is structural: ${p.consensus.anchor_purpose}.`, '',
    `**Settle authority: ${open(p.consensus.settle_authority)}.** ${p.consensus.settle_authority.question}`, '');

  L.push('## V. Deletion', '',
    `${p.deletion.default}. Exception: ${p.deletion.sole_exception}. ${p.deletion.rationale}`, '');

  L.push('## VI. The vision', '', `**${p.vision}** ${p.vision_note}`, '');

  L.push('## VII. Open milestones', '');
  for (const m of p.milestones.filter((m) => m.status === 'open')) {
    L.push(`### ${m.id} — ${m.title}`, '', `**Due ${m.due}** (${m.due_label}). ${m.claim}`, '',
      `Failure is data: \`${tick(m.failure_is_data)}\`. ${m.failure_note}`, '',
      '| Variable | Value | Ratified |', '|---|---|---|');
    for (const [k, v] of Object.entries(m.variables)) L.push(`| \`${k}\` | ${v.value ?? '*unset*'} | ${tick(v.ratified)} |`);
    L.push('', '**Hypothesis**', '', ...m.hypothesis.map((h) => `- ${h}`), '',
      `**Integration:** ${m.integration ?? '*empty until the milestone lands or fails*'}`, '');
  }
  return L.join('\n');
}

export function openQuestions() {
  const out = [];
  if (!p.debate_rule.concession_mode.decided) out.push({ at: 'debate_rule.concession_mode', ...p.debate_rule.concession_mode });
  if (!p.consensus.settle_authority.decided) out.push({ at: 'consensus.settle_authority', ...p.consensus.settle_authority });
  for (const m of p.milestones) {
    for (const [k, v] of Object.entries(m.variables)) {
      if (!v.ratified) out.push({ at: `milestone[${m.id}].${k}`, question: `Ratify: ${v.value ?? 'unset'}` });
    }
  }
  return out;
}

function page() {
  const m = p.milestones.find((x) => x.status === 'open') ?? p.milestones[0];
  const unratified = Object.entries(m.variables).filter(([, v]) => !v.ratified).map(([k]) => k);
  const facts = {
    repo: 'hf7y/front-door',
    principals: p.parties.map((q) => ({ handle: q.handle, name: q.name })),
    required: p.amendment.approvals_required,
    milestone: {
      id: m.id, title: m.title, due: m.due, dueLabel: m.due_label,
      claim: m.claim, status: m.status, failureIsData: m.failure_is_data,
      unratified,
      agreed: m.variables.agreed?.value ?? '',
      superficial: m.variables.superficial?.value ?? '',
    },
    openQuestions: openQuestions().map((q) => ({ at: q.at, question: q.question })),
  };

  return `${BANNER}
<title>front-door — your move</title>
<style>
  :root{--bg:#f6f3ee;--ink:#1b1a18;--dim:#6f6a63;--line:#d8d2c8;--accent:#8a5a2b;--act:#b3441f;--ok:#3f6b45;--card:#fffdf9}
  @media (prefers-color-scheme:dark){:root{--bg:#141311;--ink:#ece7de;--dim:#928c83;--line:#2f2c28;--accent:#d09a5e;--act:#e0704a;--ok:#7fae86;--card:#1c1a17}}
  :root[data-theme=dark]{--bg:#141311;--ink:#ece7de;--dim:#928c83;--line:#2f2c28;--accent:#d09a5e;--act:#e0704a;--ok:#7fae86;--card:#1c1a17}
  :root[data-theme=light]{--bg:#f6f3ee;--ink:#1b1a18;--dim:#6f6a63;--line:#d8d2c8;--accent:#8a5a2b;--act:#b3441f;--ok:#3f6b45;--card:#fffdf9}
  *{box-sizing:border-box}
  body{margin:0;padding:4rem 1.25rem 6rem;background:var(--bg);color:var(--ink);
    font:17px/1.6 ui-serif,Georgia,serif;display:flex;justify-content:center}
  main{width:100%;max-width:40rem}
  .door{border:1px solid var(--line);border-bottom-width:0;height:5rem;border-radius:2.5rem 2.5rem 0 0;
    margin:0 auto 1.5rem;max-width:7rem;display:flex;align-items:flex-end;justify-content:center;padding-bottom:1rem}
  .door span{width:.35rem;height:.35rem;border-radius:50%;background:var(--accent)}
  h1{font-size:1.35rem;font-weight:500;margin:0 0 .2rem;text-align:center}
  .sub{color:var(--dim);font-size:.85rem;font-style:italic;margin:0 0 2.5rem;text-align:center}
  h2{font-size:.72rem;text-transform:uppercase;letter-spacing:.14em;color:var(--dim);
    font-weight:600;margin:2.5rem 0 .9rem}
  .card{background:var(--card);border:1px solid var(--line);border-left:3px solid var(--act);
    border-radius:3px;padding:1.1rem 1.25rem;margin-bottom:.9rem}
  .card.done{border-left-color:var(--ok)}
  .card.wait{border-left-color:var(--dim)}
  .card h3{margin:0 0 .4rem;font-size:1.02rem;font-weight:600}
  .card p{margin:0 0 .5rem}
  .card p:last-child{margin-bottom:0}
  .how{background:color-mix(in srgb,var(--ink) 5%,transparent);border-radius:3px;
    padding:.6rem .8rem;font-size:.92rem;margin-top:.6rem}
  .who{font-size:.75rem;text-transform:uppercase;letter-spacing:.1em;color:var(--dim);font-weight:600}
  a{color:var(--accent);text-underline-offset:2px}
  .btn{display:inline-block;margin-top:.5rem;padding:.45rem .9rem;border:1px solid var(--accent);
    border-radius:3px;text-decoration:none;font-size:.92rem}
  .clock{text-align:center;font-size:.9rem;color:var(--dim);margin-bottom:2rem}
  .clock b{color:var(--act);font-size:1.5rem;display:block;font-weight:600}
  code{font:.85em ui-monospace,Menlo,monospace;background:color-mix(in srgb,var(--ink) 8%,transparent);
    padding:.1em .35em;border-radius:3px}
  footer{margin-top:3rem;padding-top:1rem;border-top:1px solid var(--line);color:var(--dim);font-size:.78rem}
  .live{font-size:.72rem;color:var(--dim);text-align:center;margin-top:.5rem}
</style>

<main>
  <div class="door"><span></span></div>
  <h1>front-door</h1>
  <p class="sub">What needs doing, and who has to do it.</p>

  <div class="clock" id="clock"><b>—</b>until milestone ${m.id} is due (${m.due}, ${m.due_label ?? ''})</div>

  <h2>Your move</h2>
  <div id="todo"><div class="card wait"><p>Reading the door…</p></div></div>

  <h2>The milestone</h2>
  <div class="card wait">
    <h3>${m.id} — ${m.title}</h3>
    <p>${m.claim}</p>
    ${m.failure_is_data ? '<p class="how"><strong>A miss is data.</strong> If it does not happen, that outcome is still information — it is not a failure to be smoothed over.</p>' : ''}
  </div>

  <footer>
    <a href="https://github.com/${facts.repo}">repo</a> ·
    <a href="https://github.com/${facts.repo}/blob/main/CONTRACT.md">contract</a> ·
    <a href="https://github.com/${facts.repo}/blob/main/POSTAL.md">postal service</a>
    <div class="live" id="stamp">generated from protocol.json — live state loads on open</div>
  </footer>
</main>

<script>
const F = ${JSON.stringify(facts)};
const API = 'https://api.github.com/repos/' + F.repo;
const esc = s => String(s??'').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

// Mirrors protocol/ratify.mjs: terse line, token as a whole word, no negation,
// quoted email text ignored. Kept in sync deliberately — see ratify.test.mjs.
function saysApprove(body){
  const out=[];
  for(const raw of String(body||'').split(/\\r?\\n/)){
    const l=raw.trim();
    if(/^>/.test(l)||/^On .*wrote:$/i.test(l)||/^-{2,}\\s*$/.test(l)) break;
    if(/^(sent from|get outlook)/i.test(l)||/reply to this email directly/i.test(l)) break;
    if(l) out.push(l);
    if(out.length>=3) break;
  }
  return out.some(l => l.length<=80 && /\\bAPPROVE(D)?\\b/i.test(l) && !/\\b(not|don'?t|do not|no longer|un)\\s*approve/i.test(l));
}

function days(due){
  const d=Math.round((Date.parse(due+'T23:59:59Z')-Date.now())/86400000);
  return d;
}

function card(cls, who, title, body, link, linkText){
  return '<div class="card '+cls+'">'
    + '<div class="who">'+esc(who)+'</div>'
    + '<h3>'+esc(title)+'</h3>'
    + body
    + (link ? '<a class="btn" href="'+link+'">'+esc(linkText||'open')+'</a>' : '')
    + '</div>';
}

async function j(u){ const r=await fetch(u,{headers:{accept:'application/vnd.github+json'}}); if(!r.ok) throw new Error(r.status+' '+r.statusText); return r.json(); }

async function load(){
  const clock=document.getElementById('clock');
  const d=days(F.milestone.due);
  clock.innerHTML='<b>'+(d<0?Math.abs(d)+' days overdue':d===0?'due today':d+' days')+'</b>'
    +'until milestone '+esc(F.milestone.id)+' is due ('+esc(F.milestone.due)+', '+esc(F.milestone.dueLabel)+')';

  const todo=document.getElementById('todo');
  const items=[];

  try{
    const [prs, issues] = await Promise.all([ j(API+'/pulls?state=open'), j(API+'/issues?state=open') ]);

    // 1. The thing with a deadline: has a house modification been proposed?
    const proposals = issues.filter(i => !i.pull_request && /modification|propose|house/i.test(i.title||''));
    if(!proposals.length){
      items.push(card('', 'both principals', 'Propose a change to the house — nothing has been proposed yet',
        '<p>Milestone '+esc(F.milestone.id)+' needs <strong>agreement and execution</strong>, and agreement means: '
        + esc(F.milestone.agreed) + '</p>'
        + '<div class="how"><strong>What counts as superficial:</strong> '+esc(F.milestone.superficial)+'</div>',
        'https://github.com/'+F.repo+'/issues/new?title=' + encodeURIComponent('propose: house modification for milestone 001'),
        'Propose one'));
    }

    // 2. Amendment PRs awaiting ratification.
    for(const pr of prs){
      const [reviews, comments] = await Promise.all([
        j(API+'/pulls/'+pr.number+'/reviews'), j(API+'/issues/'+pr.number+'/comments')
      ]);
      const yes=new Set();
      reviews.forEach(r => { if(r.state==='APPROVED' && F.required.includes(r.user?.login)) yes.add(r.user.login); });
      comments.forEach(c => { if(F.required.includes(c.user?.login) && saysApprove(c.body)) yes.add(c.user.login); });
      const pending=F.required.filter(h => !yes.has(h));
      if(pending.length){
        items.push(card(yes.size?'':'', pending.join(' and ')+' — still needed',
          'Ratify PR #'+pr.number+' — '+pr.title,
          '<p>'+(yes.size? 'Ratified so far: <strong>'+esc([...yes].join(', '))+'</strong>. ' : 'No ratifications yet. ')
          + 'It merges only when <strong>both</strong> principals have said yes (Art. 9).</p>'
          + '<div class="how"><strong>How:</strong> reply <code>APPROVE</code> to a notification email <em>from this pull request</em>, '
          + 'or approve it in GitHub. A reply on any other thread does not count — it must be on the PR itself.</div>',
          pr.html_url, 'Open PR #'+pr.number));
      } else {
        items.push(card('done','nobody','PR #'+pr.number+' is fully ratified',
          '<p>Both principals ratified. It should merge automatically.</p>', pr.html_url, 'Open PR #'+pr.number));
      }
    }

    // 3. A principal's approval token sitting on the wrong thread.
    const stray=[];
    for(const iss of issues.filter(i => !i.pull_request)){
      const cs=await j(API+'/issues/'+iss.number+'/comments');
      cs.forEach(c => { if(F.required.includes(c.user?.login) && saysApprove(c.body)) stray.push({n:iss.number,who:c.user.login,url:c.html_url}); });
    }
    for(const s of stray){
      items.push(card('', s.who, 'An approval on issue #'+s.n+' was not counted',
        '<p>A comment from <strong>'+esc(s.who)+'</strong> on issue #'+s.n+' reads as approval, but ratification only counts '
        + 'on a pull request. Nothing was recorded.</p>'
        + '<div class="how">If it was meant to ratify an amendment, say it again on the PR itself.</div>',
        s.url, 'See the comment'));
    }

    // 4. Undecided protocol questions.
    if(F.openQuestions.length){
      items.push(card('wait','both principals', F.openQuestions.length+' protocol question(s) still undecided',
        '<ul>'+F.openQuestions.map(q => '<li><code>'+esc(q.at)+'</code> — '+esc(q.question)+'</li>').join('')+'</ul>',
        'https://github.com/'+F.repo+'/blob/main/CONTRACT.md','Read the contract'));
    }

    todo.innerHTML = items.length ? items.join('') :
      card('done','nobody','Nothing is waiting on you','<p>No unratified amendments, no undecided rules, and a modification has been proposed.</p>');
    document.getElementById('stamp').textContent='live state read from GitHub at '+new Date().toLocaleString();
  }catch(e){
    // Never imply calm when the door could not be read.
    todo.innerHTML = card('', 'this page', 'Could not read the door',
      '<p>GitHub would not answer: <code>'+esc(e.message)+'</code>. This is <strong>not</strong> "nothing to do" — '
      + 'the page could not check. Open the repo directly.</p>',
      'https://github.com/'+F.repo,'Open the repo');
    document.getElementById('stamp').textContent='live read FAILED — the list above is not authoritative';
  }
}
load();
</script>
`;
}

const files = { 'CONTRACT.md': contract(), 'POSTAL.md': postal(), 'docs/index.html': page() };
let stale = false;
for (const [name, body] of Object.entries(files)) {
  const path = join(root, name);
  let cur = null;
  try { cur = readFileSync(path, 'utf8'); } catch {}
  if (cur === body) continue;
  stale = true;
  if (check) console.error(`stale: ${name}`);
  else { writeFileSync(path, body); console.log(`wrote ${name}`); }
}
if (check && stale) { console.error('\nRun: node protocol/render.mjs'); process.exit(1); }
if (check) console.log('generated prose is in sync');
