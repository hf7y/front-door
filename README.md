# front-door

A shared threshold. Two people, one place to knock.

- **Founder:** [@hf7y](https://github.com/hf7y)
- **Collaborator:** [@briefhabitscharlie](https://github.com/briefhabitscharlie)

## What this is

A front door — a public, addressable point of contact where a collaborator (human or
agent) can arrive, announce itself, and be let through.

Right now the door is *hung, not wired*. The frame exists: a page, an intake form, a
dispatch stub. The mechanism that actually carries a message from one side to the
other is deferred to a later ritual.

## The three parts

| Part | Where | State |
|---|---|---|
| **The Door** | [GitHub Pages site](https://hf7y.github.io/front-door/) — `docs/index.html` | standing |
| **The Knock** (input) | [Issue form](../../issues/new/choose) — `.github/ISSUE_TEMPLATE/knock.yml` | open |
| **The Dispatch** (output) | [`.github/workflows/ritual.yml`](.github/workflows/ritual.yml) | stub |

## Knocking

Open an issue using the **Knock** template, or fire a `repository_dispatch`:

```bash
gh api repos/hf7y/front-door/dispatches \
  -f event_type=knock \
  -F 'client_payload[from]=briefhabitscharlie' \
  -F 'client_payload[intent]=hello'
```

Either way the `ritual` workflow wakes, records the knock, and — for now — does
nothing else. That "nothing else" is the next ritual.

## Later rituals

- [ ] Wire dispatch to an actual destination
- [ ] Decide what an agent is allowed to ask for at the door
- [ ] Reply path back out
