#!/usr/bin/env node
// Validates a knock against protocol.json. Dependency-free.
//   node protocol/validate.mjs knock.json
//   echo '{...}' | node protocol/validate.mjs
// Exit 0 admissible, 1 defective/refused, 2 unusable input.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const P = JSON.parse(readFileSync(join(root, 'protocol/protocol.json'), 'utf8'));
const KINDS = ['human', 'agent', 'agent-for-human'];

function read() {
  const f = process.argv[2];
  const raw = f ? readFileSync(f, 'utf8') : readFileSync(0, 'utf8');
  try { return JSON.parse(raw); } catch (e) { console.error(`unusable: not JSON — ${e.message}`); process.exit(2); }
}

export function validate(k) {
  const errs = [];
  const principals = P.parties.map((p) => p.handle);

  for (const f of ['from', 'kind', 'intent']) if (!k?.[f]) errs.push(`missing required field: ${f}`);
  if (k?.kind && !KINDS.includes(k.kind)) errs.push(`kind must be one of ${KINDS.join(', ')}`);
  if (k?.kind === 'agent-for-human' && !k.on_behalf_of) errs.push('kind agent-for-human requires on_behalf_of — an unnamed principal means no authority (Art. 4)');
  if (k?.on_behalf_of && !principals.includes(k.on_behalf_of)) errs.push(`on_behalf_of "${k.on_behalf_of}" is not a principal (${principals.join(', ')})`);

  // Art. 5 — closed by default.
  const spec = P.intents[k?.intent];
  if (k?.intent && !spec) {
    errs.push(`intent "${k.intent}" is not admissible. Admissible: ${Object.keys(P.intents).join(', ')} (closed by default, Art. 5)`);
  } else if (spec) {
    for (const r of spec.required) {
      if (k.payload?.[r] === undefined) errs.push(`intent "${k.intent}" requires payload.${r} — ${spec.min_payload}`);
    }
  }

  // Art. 7 — reply path. A repository_dispatch knock must name its canonical issue.
  if (P.reply_path?.repository_dispatch_requires_reply_to && k?.channel === 'repository_dispatch' && !k.reply_to) {
    errs.push(`channel repository_dispatch requires reply_to naming the canonical ${P.reply_path.canonical_target} (Art. 7)`);
  }
  if (k?.intent === 'propose' && P.reply_path?.amendment_also_requires === 'pull_request' && !k.payload?.pull_request) {
    errs.push('intent propose requires payload.pull_request — an amendment must reference a PR containing the exact change (Art. 7)');
  }

  // Art. 6 — size.
  const bytes = Buffer.byteLength(JSON.stringify(k?.payload ?? null), 'utf8');
  if (bytes > P.limits.payload_max_bytes) errs.push(`payload ${bytes} bytes exceeds ${P.limits.payload_max_bytes} (Art. 6)`);

  // POSTAL §II — the debate rule. The mechanism that made this repo necessary.
  if (k?.intent === 'respond' && Array.isArray(k.payload?.addresses)) {
    const items = k.payload.addresses;
    const received = k.payload.received_items;
    for (const [i, a] of items.entries()) {
      if (!a?.item) errs.push(`addresses[${i}]: missing "item" — which received point does this address?`);
      if (!a?.verdict) errs.push(`addresses[${i}]: missing "verdict" — yay or nay (§I.2)`);
      else if (!['yay', 'nay', 'concede'].includes(a.verdict)) errs.push(`addresses[${i}]: verdict must be yay, nay, or concede`);
    }
    if (typeof received === 'number' && items.length < received) {
      const missing = received - items.length;
      const mode = P.debate_rule.concession_mode;
      const msg = `${missing} of ${received} received item(s) unaddressed`;
      if (!mode.decided) errs.push(`${msg} — and concession_mode is UNDECIDED, so whether this is defective or a silent concession cannot be determined. Settle ${mode.question}`);
      else if (mode.decided === 'strict') errs.push(`${msg} — strict mode requires an overt concede (§II)`);
      else console.warn(`warn: ${msg} — loose mode: those points are dropped and thereby conceded (§II)`);
    }
  }
  return errs;
}

const k = read();
const errs = validate(k);
if (errs.length) {
  console.error(`REFUSED — ${errs.length} problem(s):\n` + errs.map((e) => `  - ${e}`).join('\n'));
  process.exit(1);
}
console.log(`admissible: ${k.intent} from ${k.from}${k.on_behalf_of ? ` on behalf of ${k.on_behalf_of}` : ''}`);
