<!-- GENERATED from protocol/protocol.json by protocol/render.mjs. Do not edit. -->

# Doorkeeper's Contract

Version 2, opened 2026-07-29. Machine source: [`protocol/protocol.json`](protocol/protocol.json).

**Vision:** Install something in a gallery. *Stated clearly at the outset, then revised by each milestone. That revision IS the integration step.*

Nothing binds until an amendment PR is approved by every principal.

---

### Art. 1 — Parties

- **Zach** `@hf7y` — principal
- **Chris** `@briefhabitscharlie` — principal

Agents inherit their principal's rights and may not exceed them (`may_exceed_principal: false`). An agent may open an amendment PR (`true`); it may not approve one (`false`).

### Art. 2 — Channels

| Channel | Address | For | Authenticity |
|---|---|---|---|
| `issue` | `.github/ISSUE_TEMPLATE/knock.yml` | humans, and agents wanting a paper trail | actor must be a principal or accepted collaborator |
| `repository_dispatch` | `event_type: knock` | agents | write-scoped token IS the identity |

Anything else is **not a knock** and carries no obligation. Channel of record: this repository.

### Art. 3 — Message shape

Every knock validates against [`.github/knock.schema.json`](.github/knock.schema.json), enforced by [`protocol/validate.mjs`](protocol/validate.mjs). An invalid knock is refused, not repaired — the doorkeeper does not guess intent.

### Art. 4 — Identity

The repo is public, so anyone can file. Authenticity comes from the channel, not the claim — see Art. 2. An agent asserting `agent-for-human` must name its principal in `on_behalf_of`; an unnamed principal means no authority.

### Art. 5 — Admissible intents

Closed by default: `intents_closed_by_default: true`. Nothing is admissible unless listed.

| Intent | Carries | Required payload |
|---|---|---|
| `dispatch` | a new assimilated document | `document` |
| `respond` | item-by-item verdicts with elaboration | `addresses` |
| `concede` | an overt concession | `point` |
| `milestone` | a claim that a change in the world occurred | `change`, `evidence` |
| `propose` | an amendment to the protocol | `path`, `text` |

A `respond` that fails to address every received item is **defective** — enforced by protocol/validate.mjs — debate rule.

### Art. 6 — Rate and size

10 knocks per principal per hour; payload ≤ 65536 bytes. Excess is refused, not queued.

### Art. 7 — Reply path

The channel of record is this repository. Email may notify (`true`) but may never carry payload (`false`) — Email obliges a human to read their own inbox, reintroducing the bottleneck the door removes.

### Art. 8 — Refusal and silence

- **Refusal** — understood and declined — stated, with a reason
- **Silence** — failed authentication — nothing said, so a stranger learns nothing about what the door responds to

Invariant: silence is never consent.
Invariant: a refused knock may not be retried unchanged.

### Art. 9 — Amendment

By pull request, approved by `@hf7y` and `@briefhabitscharlie`. The record is the commit that lands the amendment.

### Art. 10 — Termination

Either principal may close the door by merging a PR that empties the intent set. No notice, no explanation owed. The repo stays public as a record.

### Art. 11 — Deletion

Default: **forbidden — text accumulates**. Sole exception: a landed milestone retires whatever the world has settled or refuted. Not grounds for deletion: taste, length, second thoughts. Contact with reality is the only authority that may remove text.

---

## Undecided — blocking

1. **debate_rule.concession_mode** — Loose or strict? Determines whether a respond missing an item is defective or merely quiet. Options: `loose` (silence drops the point, and dropping concedes it); `strict` (a point may be dropped, but the concession must be overt).
2. **consensus.settle_authority** — Who declares a point settled, and thereby an anchor? Options: `either` (either party unilaterally); `both` (both parties required).
3. **milestone[001].superficial** — Ratify: reversible; nothing structural or permanent; trivial cost
4. **milestone[001].agreed** — Ratify: both principals explicit, in writing, in this repo
5. **milestone[001].who_executes** — Ratify: humans — agents cannot modify a house
6. **milestone[001].evidence** — Ratify: a photograph, committed to this repo
7. **milestone[001].retires** — Ratify: unset
