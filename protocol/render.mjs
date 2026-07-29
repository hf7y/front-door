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
    `${p.limits.new_knocks_per_principal_per_hour} new knocks per principal per hour; ${p.limits.issue_replies_per_principal_per_hour} issue replies per principal per hour; payload ≤ ${p.limits.payload_max_bytes} bytes. Excess is \`${p.limits.excess}\`.`, '',
    `*${p.limits.rationale}*`, '');

  L.push('### Art. 7 — Reply path', '', p.reply_path.rule, '',
    '| Term | Value |', '|---|---|',
    `| default | \`${p.reply_path.default}\` |`,
    `| amendment also requires | \`${p.reply_path.amendment_also_requires}\` |`,
    `| \`repository_dispatch\` requires \`reply_to\` | \`${p.reply_path.repository_dispatch_requires_reply_to}\` |`,
    `| canonical target | \`${p.reply_path.canonical_target}\` |`,
    `| off-repo interfaces | \`${p.reply_path.off_repo_interfaces}\` |`,
    '', `Email may notify (\`${p.email_policy.may_notify}\`) but may never carry payload (\`${p.email_policy.may_carry_payload}\`) — ${p.email_policy.rationale} Enforced by ${p.reply_path.enforced_by}.`, '');

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
    `**Concession mode: ${open(p.debate_rule.concession_mode)}${p.debate_rule.concession_mode.decided ? ` — \`${p.debate_rule.concession_mode.decided}\`` : ''}.** ${p.debate_rule.concession_mode.rule ?? p.debate_rule.concession_mode.question}`, '');
  if (p.debate_rule.concession_mode.rationale) L.push(`*${p.debate_rule.concession_mode.rationale}*`, '');
  for (const [k, v] of Object.entries(p.debate_rule.concession_mode.options)) L.push(`- \`${k}\` — ${v}`);
  L.push('');

  L.push('## III. Why the prior exchange stalled', '',
    `Not ${p.prior_art.not_the_cause.join(', not ')}. Two structural failures:`, '');
  p.prior_art.why_it_stalled.forEach((w, i) => L.push(`${i + 1}. ${w}`));
  L.push('', `**Correction:** ${p.prior_art.correction}`, '');

  L.push('## IV. Milestones', '', `> ${p.milestone_definition}`, '',
    `Consensus is a milestone (\`${tick(p.consensus.is_a_milestone)}\`), scoped to ${p.consensus.scope}. Settled points become **${p.consensus.settled_points_become}**, whose purpose is structural: ${p.consensus.anchor_purpose}.`, '',
    `**Settle authority: ${open(p.consensus.settle_authority)}${p.consensus.settle_authority.decided ? ` — \`${p.consensus.settle_authority.decided}\`` : ''}.** ${p.consensus.settle_authority.rule ?? p.consensus.settle_authority.question}`, '');
  if (p.consensus.settle_authority.note) L.push('', `*${p.consensus.settle_authority.note}*`);
  L.push('');

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

const files = { 'CONTRACT.md': contract(), 'POSTAL.md': postal() };
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
