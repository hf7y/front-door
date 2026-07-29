#!/usr/bin/env node
// Reads ratification signals on a PR and decides whether Art. 9 is satisfied.
//   node protocol/ratify.mjs <pr-number>
// Prints JSON: { ratified, pending, complete }
// Exit 0 always (the caller decides what to do); exit 2 on unusable input.
//
// A principal ratifies by EITHER:
//   - approving the PR through GitHub's review UI, or
//   - writing a comment whose first meaningful line says APPROVE
// The second exists so a principal can ratify by replying to a GitHub
// notification email from a phone, with no browser and no terminal.
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const P = JSON.parse(readFileSync(join(root, 'protocol/protocol.json'), 'utf8'));
const REQUIRED = P.amendment.approvals_required;

// RATIFY_LIB=1 imports the parsers without touching the network, for tests.
const LIB_ONLY = process.env.RATIFY_LIB === '1';

const pr = process.argv[2];
if (!LIB_ONLY && !/^\d+$/.test(pr ?? '')) { console.error('usage: ratify.mjs <pr-number>'); process.exit(2); }

const gh = (path) => JSON.parse(execFileSync('gh', ['api', path, '--paginate'], { encoding: 'utf8' }));

// An email reply carries the original message quoted beneath it. Keep only the
// text the human actually typed, so a quoted "APPROVE" can never ratify.
export function firstMeaningfulLines(body) {
  const out = [];
  for (const raw of (body ?? '').split(/\r?\n/)) {
    const line = raw.trim();
    if (/^>/.test(line)) break;                                  // quoted block
    if (/^On .*wrote:$/i.test(line)) break;                       // gmail attribution
    if (/^-{2,}\s*$/.test(line) || /^_{5,}/.test(line)) break;    // signature / divider
    if (/^(sent from|get outlook)/i.test(line)) break;            // mobile footers
    if (/reply to this email directly/i.test(line)) break;        // github footer
    if (line) out.push(line);
    if (out.length >= 3) break;
  }
  return out;
}

export function saysApprove(body) {
  const lines = firstMeaningfulLines(body);
  // Require APPROVE as a standalone word in the first meaningful lines, and
  // reject an explicit negation on the same line.
  return lines.some((l) => /\bAPPROVE(D)?\b/i.test(l) && !/\b(not|don'?t|do not|no longer|un)\s+approve/i.test(l));
}

const isPrincipal = (login) => REQUIRED.includes(login);
const ratified = new Map();

if (LIB_ONLY) { /* parsers exported above; no network, no output */ } else {

for (const r of gh(`repos/{owner}/{repo}/pulls/${pr}/reviews?per_page=100`)) {
  if (r.state === 'APPROVED' && isPrincipal(r.user?.login)) {
    ratified.set(r.user.login, { via: 'review', at: r.submitted_at, url: r.html_url });
  }
}
for (const c of gh(`repos/{owner}/{repo}/issues/${pr}/comments?per_page=100`)) {
  if (isPrincipal(c.user?.login) && saysApprove(c.body) && !ratified.has(c.user.login)) {
    ratified.set(c.user.login, { via: 'comment', at: c.created_at, url: c.html_url });
  }
}

const pending = REQUIRED.filter((h) => !ratified.has(h));
console.log(JSON.stringify({
  pr: Number(pr),
  required: REQUIRED,
  ratified: Object.fromEntries(ratified),
  pending,
  complete: pending.length === 0,
}, null, 2));
}
