#!/usr/bin/env node
// Milestone clock. Deadlines are instruments, so they get read by a machine.
//   node protocol/clock.mjs            report
//   node protocol/clock.mjs --ping     report, and ping off-repo if due/overdue
//   node protocol/clock.mjs --strict   exit 1 if any open milestone is overdue
// Today is injected via FRONT_DOOR_TODAY or taken from the system clock.
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { openQuestions } from './render.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const P = JSON.parse(readFileSync(join(root, 'protocol/protocol.json'), 'utf8'));
const today = process.env.FRONT_DOOR_TODAY || new Date().toISOString().slice(0, 10);
const days = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000);

const lines = [];
let overdue = false, due = false;

for (const m of P.milestones.filter((m) => m.status === 'open')) {
  const left = days(today, m.due);
  const state = left < 0 ? `OVERDUE by ${-left}d` : left === 0 ? 'DUE TODAY' : `${left}d left`;
  if (left < 0) overdue = true;
  if (left <= 1) due = true;
  const unratified = Object.entries(m.variables).filter(([, v]) => !v.ratified).map(([k]) => k);
  lines.push(`milestone ${m.id} — ${m.title}`, `  due ${m.due} (${m.due_label}) — ${state}`, `  ${m.claim}`);
  if (unratified.length) lines.push(`  unratified variables: ${unratified.join(', ')}`);
  if (m.failure_is_data) lines.push(`  failure is data — a miss still produces information`);
}

const qs = openQuestions();
if (qs.length) {
  lines.push('', `${qs.length} undecided item(s) blocking:`);
  for (const q of qs) lines.push(`  - ${q.at}: ${q.question}`);
}

const report = lines.join('\n');
console.log(report || 'no open milestones');

if (process.argv.includes('--ping') && (due || overdue)) {
  try {
    execFileSync(join(root, 'bin/ping'), ['-s', `front-door: milestone ${overdue ? 'OVERDUE' : 'due'}`], { input: report, stdio: ['pipe', 'inherit', 'inherit'] });
  } catch { console.error('clock: ping failed — see bin/ping output above'); }
}
if (process.argv.includes('--strict') && overdue) process.exit(1);
