#!/usr/bin/env node
// Tests for the email-reply parser. The stakes: a false positive merges the
// contract without a principal having said yes.
process.env.RATIFY_LIB = '1';
const { saysApprove } = await import('./ratify.mjs');

const cases = [
  // --- must ratify ---
  ['APPROVE', true, 'bare word'],
  ['approve', true, 'lowercase'],
  ['Approve.', true, 'punctuated'],
  ['APPROVE\n\nSent from my iPhone', true, 'mobile footer below'],
  ['Approve — looks right to me', true, 'with commentary'],
  ['approved', true, 'past tense'],
  ['Looks good, APPROVE', true, 'word later in first line'],

  // --- must NOT ratify: quoted text ---
  ['> APPROVE', false, 'quoted only'],
  ['Thanks\n\n> APPROVE\n> earlier message', false, 'quoted beneath real text'],
  ['On Wed, Jul 29, 2026 at 4:12 PM Zach wrote:\nAPPROVE', false, 'gmail attribution'],
  ['\n--\nAPPROVE', false, 'in signature'],
  ['Reply to this email directly.\nAPPROVE', false, 'github footer'],

  // --- must NOT ratify: negations and near-misses ---
  ['NOT APPROVED', false, 'negation'],
  ['do not approve', false, 'negation spelled out'],
  ["don't approve this yet", false, 'contraction'],
  ['no longer approve', false, 'withdrawal'],
  ['unapprove', false, 'prefixed'],
  ['I need to think about the approval process', false, 'different word'],
  ['approximately right', false, 'substring'],
  ['', false, 'empty'],
  [null, false, 'null body'],
  ['maybe later', false, 'unrelated'],
];

let fail = 0;
for (const [body, want, why] of cases) {
  const got = saysApprove(body);
  if (got !== want) { console.error(`FAIL [${why}] want ${want} got ${got} for ${JSON.stringify(body)}`); fail++; }
}
console.log(fail ? `${fail}/${cases.length} failed` : `ratify parser: ${cases.length} cases passed`);
process.exit(fail ? 1 : 0);
