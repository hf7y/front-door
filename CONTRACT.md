# Doorkeeper's Contract — draft 1

Terms governing what may pass through the front door. Opened by [@hf7y](https://github.com/hf7y);
awaiting counter-signature from [@briefhabitscharlie](https://github.com/briefhabitscharlie)
and any agent acting on their behalf.

Each article is marked:

- **SETTLED** — proposed and expected to be uncontroversial; object if not.
- **PROPOSED** — a real position, open to counter.
- **OPEN** — deliberately unfilled. The counterparty is asked to propose.

Nothing binds until both parties approve an amendment PR (Art. 9).

---

### Art. 1 — Parties · SETTLED

Two principals: `hf7y` and `briefhabitscharlie`. Either may act through an agent.
An agent inherits its principal's rights and **never exceeds them**. There is no
third party; a knock from any other account is out of scope (Art. 5).

### Art. 2 — Channels · SETTLED

A knock arrives by exactly one of:

| Channel | Address | For |
|---|---|---|
| Issue form | `ISSUE_TEMPLATE/knock.yml` | humans, and agents that prefer a paper trail |
| `repository_dispatch` | `event_type: knock` | agents |

Anything else — email, DM, commit message, PR comment — **is not a knock** and
carries no obligation. One door, on purpose.

### Art. 3 — Message shape · PROPOSED

Every knock validates against [`.github/knock.schema.json`](.github/knock.schema.json).
An invalid knock is refused, not repaired — the doorkeeper does not guess intent.
Required: `from`, `kind`, `intent`. Optional: `payload`, `reply_to`, `nonce`.

### Art. 4 — Identity and authority · PROPOSED

The repo is public, so *anyone* can open an issue. Authenticity therefore comes
from the channel, not the claim:

- `repository_dispatch` requires a token with write access — the token **is** the identity.
- An issue is authentic only if `github.actor` is a principal or an accepted collaborator.
- An agent asserting `kind: agent-for-human` must name its principal in `on_behalf_of`.
  An unnamed principal means no authority.

A knock that fails all three is logged and dropped in silence (Art. 8).

### Art. 5 — Admissible intents · PROPOSED

Still closed by default — nothing is admissible unless listed. But the list is no
longer empty: the spoken account of 2026-07-29 (`POSTAL.md`) supplies it. The door
exists to carry the postal service, so the intents are its cycle.

| Intent | Carries | Minimum payload |
|---|---|---|
| `dispatch` | a new assimilated document (`POSTAL.md` §I.5) | the document |
| `respond` | item-by-item verdicts + elaboration (§I.2–3) | one entry per received item |
| `concede` | an overt concession (§II) | the point conceded; unchanged text suffices |
| `milestone` | a claim that a change in the world occurred | the change, and evidence of it |
| `propose` | an amendment to this contract | article number and proposed text |

A `respond` that fails to address every received item is **defective**, not merely
incomplete — see Art. 8. Whether the omission concedes the point silently or requires
an overt `concede` is the open question at `POSTAL.md` §II.

`correspond` — proposed by Knock 001 in the spirit of removing the boundary — is
subsumed by `dispatch` and `respond`. Argue if that is wrong.

### Art. 6 — Rate and size · PROPOSED

10 knocks per principal per hour; `payload` ≤ 64 KiB. Excess is refused, not
queued. Raise by amendment once real traffic shows the number is wrong.

### Art. 7 — Reply path · PROPOSED

**This repo is the dispatch service.** A reply lands as an issue or a commit here.
Politeness governs until the service sets its own rules (`POSTAL.md` §VII).

Email is raised and unresolved: the Gmail tied to `briefhabitscharlie`, which Chris's
agent reads in full. Zach's objection stands — email obliges a human to read their own
inbox, which reintroduces exactly the bottleneck the door removes. Proposed resolution:
**the repo is the channel of record; email may notify but never carries the payload.**

`reply_to` remains collected so past knocks stay addressable if that changes.

### Art. 8 — Refusal and silence · PROPOSED

Two distinct outcomes, never conflated:

- **Refusal** — the knock was understood and declined. Stated, with a reason.
- **Silence** — the knock failed Art. 4. Nothing is said, to avoid confirming
  to a stranger what the door responds to.

Neither party may read silence as consent, and neither may retry a refused
knock unchanged.

### Art. 9 — Amendment · SETTLED

This file changes only by pull request approved by both principals. An agent may
open such a PR; it may not approve one. The commit that lands an amendment is the
record of when the terms changed.

### Art. 10 — Termination · PROPOSED

Either principal may close the door by merging a PR that empties Art. 5. No
notice period, no explanation owed. The repo stays public as a record.

---

### Art. 11 — Deletion · PROPOSED

Text accumulates and may not be deleted, with one exception: **a landed milestone
licenses the deletion of whatever the world has settled or refuted** (`POSTAL.md` §V).
No party may delete on grounds of taste, length, or second thoughts. Contact with
reality is the only authority that retires text.

---

## Standing questions for the counterparty

1. `POSTAL.md` §II — loose or strict concession? Does silence concede, or must a
   dropped point be conceded overtly?
2. `POSTAL.md` §IV — who declares a point settled and thereby an anchor: either party
   unilaterally, or both?
3. `MILESTONE-001.md` — the variables table is unratified. Which house, what bounds
   "superficial", and what counts as agreement?
4. Art. 7 — is the repo-as-channel-of-record acceptable, with email as notification only?
5. Art. 4 — is naming `on_behalf_of` sufficient, or does your agent need to sign?
6. Art. 6 — is 10 knocks/hour anywhere near the real cadence of the postal service?
