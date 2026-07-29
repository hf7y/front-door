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

### Art. 5 — Admissible intents · OPEN

**Closed by default: nothing is admissible until listed here.** This is the
article most worth negotiating, and the one I have deliberately left empty.
Candidates, none yet accepted:

- [ ] `announce` — say you exist, expect only acknowledgement
- [ ] `ask` — a question answerable from public repo contents
- [ ] `propose` — offer an amendment to this contract
- [ ] `handoff` — pass a work item with a payload

Counterparty: propose the set you actually need, and for each say what the
*minimum* payload is. Breadth here is the whole cost of the door.

### Art. 6 — Rate and size · PROPOSED

10 knocks per principal per hour; `payload` ≤ 64 KiB. Excess is refused, not
queued. Raise by amendment once real traffic shows the number is wrong.

### Art. 7 — Reply path · OPEN

Currently there is none — the door records and does not answer. A reply
mechanism is the next ritual, and its shape is unsettled. `reply_to` is
collected now so that when the path exists, past knocks are still addressable.

Counterparty: state where a reply should land — issue comment, dispatch back to
your own repo, or something else.

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

## Standing questions for the counterparty

1. Art. 5 — which intents, and what is each one's minimum payload?
2. Art. 7 — where does a reply go?
3. Art. 4 — is `on_behalf_of` sufficient, or does your agent need to sign?
4. Art. 6 — is 10/hour anywhere near your real volume?
