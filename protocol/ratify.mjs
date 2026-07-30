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

// The gh CLI is absent in some environments (notably the cloud doorkeeper, which
// reported `spawnSync gh ENOENT` on 2026-07-30). Fall back to the REST API over
// fetch, and if neither route is available FAIL LOUD — a tally that silently
// returns "nobody ratified" is indistinguishable from a real zero.
function repoSlug() {
  if (process.env.GITHUB_REPOSITORY) return process.env.GITHUB_REPOSITORY;
  try {
    const url = execFileSync('git', ['remote', 'get-url', 'origin'], { encoding: 'utf8' }).trim();
    const m = url.match(/[:/]([^/:]+\/[^/]+?)(?:\.git)?$/);
    if (m) return m[1];
  } catch {}
  throw new Error('cannot determine owner/repo: set GITHUB_REPOSITORY or add an origin remote');
}

let ghBroken = null;
async function api(path) {
  if (ghBroken === null) {
    try { execFileSync('gh', ['--version'], { stdio: 'ignore' }); ghBroken = false; }
    catch { ghBroken = true; }
  }
  if (!ghBroken) {
    return JSON.parse(execFileSync('gh', ['api', path, '--paginate'], { encoding: 'utf8' }));
  }
  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('gh CLI unavailable and no GH_TOKEN/GITHUB_TOKEN set — cannot read ratifications. Refusing to report a tally that would look like zero.');
  }
  const url = 'https://api.github.com/' + path.replace('{owner}/{repo}', repoSlug());
  const r = await fetch(url, {
    headers: { authorization: `Bearer ${token}`, accept: 'application/vnd.github+json', 'user-agent': 'front-door-ratify' },
  });
  if (!r.ok) throw new Error(`GitHub API ${r.status} ${r.statusText} for ${url}`);
  return r.json();
}

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

// A ratification is a SHORT deliberate line — "APPROVE", "Approve, looks right".
// It is not a word buried in an essay: Chris's negotiating comment opens with
// "...reviewed or approved these terms", which a mere substring test read as a
// ratification on 2026-07-30. So cap the line length. An email reply that means
// yes is terse; prose that merely discusses approval is not.
const MAX_RATIFY_LINE = 80;

export function saysApprove(body) {
  const lines = firstMeaningfulLines(body);
  return lines.some((l) =>
    l.length <= MAX_RATIFY_LINE &&
    /\bAPPROVE(D)?\b/i.test(l) &&
    !/\b(not|don'?t|do not|no longer|un)\s*approve/i.test(l));
}

const isPrincipal = (login) => REQUIRED.includes(login);
const ratified = new Map();

if (LIB_ONLY) { /* parsers exported above; no network, no output */ } else {

for (const r of await api(`repos/{owner}/{repo}/pulls/${pr}/reviews?per_page=100`)) {
  if (r.state === 'APPROVED' && isPrincipal(r.user?.login)) {
    ratified.set(r.user.login, { via: 'review', at: r.submitted_at, url: r.html_url });
  }
}
for (const c of await api(`repos/{owner}/{repo}/issues/${pr}/comments?per_page=100`)) {
  if (isPrincipal(c.user?.login) && saysApprove(c.body) && !ratified.has(c.user.login)) {
    ratified.set(c.user.login, { via: 'comment', at: c.created_at, url: c.html_url });
  }
}

// A principal's approval token on a NON-PR thread is a signal, not noise: it
// happened for real on 2026-07-30 (a reply-by-email landed on issue #2 instead
// of PR #3 and sat unrecorded). Surface it; never count it.
const misrouted = [];
for (const c of await api(`repos/{owner}/{repo}/issues/comments?per_page=100`)) {
  const onThisPr = String(c.issue_url ?? '').endsWith(`/${pr}`);
  if (!onThisPr && isPrincipal(c.user?.login) && saysApprove(c.body)) {
    misrouted.push({
      who: c.user.login,
      thread: String(c.issue_url ?? '').split('/').pop(),
      at: c.created_at,
      url: c.html_url,
    });
  }
}

const pending = REQUIRED.filter((h) => !ratified.has(h));
console.log(JSON.stringify({
  pr: Number(pr),
  required: REQUIRED,
  ratified: Object.fromEntries(ratified),
  pending,
  complete: pending.length === 0,
  misrouted_approvals: misrouted,
}, null, 2));
if (misrouted.length) {
  console.error(`\nNOTE: ${misrouted.length} approval token(s) from a principal on a thread other than PR ${pr}:`);
  for (const m of misrouted) console.error(`  - ${m.who} on issue #${m.thread} (${m.at}) ${m.url}`);
  console.error('These do NOT count toward Art. 9 and were not counted. If ratification was intended, it must be given on the PR itself.');
}
}
