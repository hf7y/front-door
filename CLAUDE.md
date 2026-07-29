<!-- Standing rules for agents in this repo. Machine source: protocol/protocol.json -> agent_rules[] -->

# Agent rules — front-door

Read `protocol/protocol.json` first. It is the single source of truth for the contract,
the postal service, and the milestones.

## The prose rule

**In the absence of other instructions, retire prose into self-documenting mechanisms.**

`CONTRACT.md` and `POSTAL.md` are **generated**. Never edit them. Edit
`protocol/protocol.json`, then:

```
node protocol/render.mjs          # regenerate prose
node protocol/render.mjs --check  # CI: fail on drift
```

When you are about to write explanatory prose, ask whether it can instead be a schema,
a validator, an exit code, or a generated document. If it can, make it that.

## Mechanisms

| Command | Does |
|---|---|
| `node protocol/render.mjs` | protocol.json → CONTRACT.md, POSTAL.md |
| `node protocol/validate.mjs <f>` | validate a knock; exit 1 refuses, with reasons |
| `node protocol/clock.mjs --ping` | read milestone deadlines; ping if due |
| `bin/ping "msg"` | reach Zach off-repo (hermes → notify-send) |

No dependencies. Node only. `FRONT_DOOR_TODAY=YYYY-MM-DD` injects a date for testing.

## Agency

Commit, push, and open or comment on issues **without asking**. Maximum agency inside
this repo. Still confirm before: rewriting shared history, changing repo visibility or
collaborator access, or anything reaching outside the repo.

## Invariants

- Intents are **closed by default**. An intent absent from `protocol.json` is refused.
- Text may not be deleted, except that a landed milestone retires what the world has
  settled or refuted. Not taste, not length, not second thoughts.
- An agent may open an amendment PR. It may **not** approve one.
- A missed deadline is **data**, not a failure to be smoothed over. Report it plainly.
- An undecided rule should *block a mechanism*, not sit in prose. See how
  `concession_mode` halts `validate.mjs`.
