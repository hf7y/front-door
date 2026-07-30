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
| `bin/watch --once` | one sweep for knocks, PRs, failed rituals, due milestones |
| `node protocol/ratify.mjs <pr>` | tally Art. 9 ratifications on a PR |
| `node protocol/ratify.test.mjs` | 22 cases on the email-reply parser |

No dependencies. Node only. `FRONT_DOOR_TODAY=YYYY-MM-DD` injects a date for testing.

## Agency

Commit, push, and open or comment on issues **without asking**. Maximum agency inside
this repo. Still confirm before: rewriting shared history, changing repo visibility or
collaborator access, or anything reaching outside the repo.

## NEVER write APPROVE

**An agent operating in this repo uses `@hf7y`'s credentials.** `protocol/ratify.mjs`
counts a comment saying `APPROVE` from a principal's login as that principal's Art. 9
ratification. It cannot tell Zach from an agent acting as Zach.

So: **never write the word APPROVE (or APPROVED) in a comment on a pull request in this
repo, in any context, including quoting someone else.** Doing so forges a principal's
consent and can merge an amendment neither human agreed to. Say "ratified", "accepted",
or "concede" when you mean it descriptively. If you must refer to the token, write it as
`A-P-P-R-O-V-E`.

This is a known weakness of the mechanism, not a feature. The proper fix is a separate
bot identity so the logins differ; until then this rule is the only thing standing
between an agent and forged ratification.

## Changing anything outside this repo

This machine runs an estate-management project, **senechal**, and the standing ecosystem
rule is: *the project that generates a piece of machine config owns it; senechal owns
knowing it exists.*

So if you add or change anything the machine as a whole sees — a systemd unit, a crontab
entry, something in `~/.local/bin`, a `~/.claude` hook, a marker file — then:

```
notify-senechal '<what changed, where, who owns it>'
```

Do it without being asked. Also record it in [`.scheduler/FOCUS.md`](.scheduler/FOCUS.md)
under the shared-host footprint, with **teardown steps**, and retire entries there when
you remove the thing rather than leaving them live.

Two hard-won details:

- **`notify-senechal` takes no flags.** Its argument is the note. Running it with
  `--help` files a backlog entry that literally says `--help` — this happened on
  2026-07-29 and had to be cleaned up.
- Before writing into another project's repo, run `check-project-busy <project>`, and use
  `focus-commit` rather than bare `git add`/`commit`/`push` for `FOCUS.md` — those files
  have multiple writers and the bare sequence has silently lost content before.

Prefer not to edit another project's config at all. front-door edited `~/.hermes/.env`
to fix a broken JID; senechal's own rules would have shipped that as a remedy script for
a human to run instead. If you must, back the file up and declare it.

## Invariants

- Intents are **closed by default**. An intent absent from `protocol.json` is refused.
- Text may not be deleted, except that a landed milestone retires what the world has
  settled or refuted. Not taste, not length, not second thoughts.
- An agent may open an amendment PR. It may **not** approve one.
- A missed deadline is **data**, not a failure to be smoothed over. Report it plainly.
- An undecided rule should *block a mechanism*, not sit in prose. See how
  `concession_mode` halts `validate.mjs`.
