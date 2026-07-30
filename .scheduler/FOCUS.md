# front-door — focus & backlog

## 2026-07-29 — session record (project stood up end to end)

Repo created, contract negotiated with the collaborator's agent, prose retired into
mechanisms, and an off-repo notification path built. Shas on `main`:

| sha | what |
|---|---|
| `a24117b` | hang the front door — page, knock form, dispatch stub |
| `72a0923` | draft the doorkeeper's contract |
| `b80a58a` | transcribe the postal service; open milestone 001 |
| `dfa5a4e` | **retire prose into mechanisms** — `protocol.json` is the source, prose generated |
| `2cdba1e` | **fix: knock validation was always admitted** (`validate \| tee` masked the exit status) |
| `cb83086` | `bin/watch` — the door watches itself |
| `bf730b2` | ratify by email reply — Art. 9 with no browser or terminal |
| `e436c6d` | ping via KDE Connect |
| `e6da16c` | ping: prefer hermes (WhatsApp) over KDE Connect |
| `dfd93be` | ping: discover freshly paired platforms |
| `b6f9940` | ping: suppress duplicate alerts |
| `61adad3` | relay GitHub events to WhatsApp |
| `23c9e98` | declare shared-host footprint; carry the senechal protocol |

Open on a branch, not merged: `e6740dd` on `amendment/draft-2-ratification` → **PR #3**,
agent-negotiated and pending ratification by both principals under Art. 9.

**Philosophy delta (ecosystem): none.** No doctrine file was edited — `UNIVERSE.md`,
`BUILD-DISCIPLINE.md`, `PRECIPITATION.md`, `STABILITY-MILESTONES.md`, `PLAYBOOK.md`,
`FOCUS-FORMAT.md` all untouched. This project did adopt a *project-level* rule from Zach
— *"in the absence of other instructions, retire prose into self-documenting mechanisms"*
— recorded in `CLAUDE.md` and `protocol.json#/agent_rules`, not in ecosystem doctrine.

**Cross-project writes:** senechal `2afb82f` (accidental — a `notify-senechal --help`
probe filed a backlog entry reading literally `--help`; the tool takes no flags) and
senechal `829be49` (the real footprint filing, which also removed that junk line).
Both via `notify-senechal`/`focus-commit`, path-scoped to `.scheduler/FOCUS.md`.

**Not written, deliberately:** realisateur's `.scheduler/FOCUS.md`. `closeout-lint` check
B wants a dated session record with a sha there, but that file's bootstrap stamp and its
Law 3 say the opposite — *"the next agent to append session residue here has broken it."*
The file's own doctrine wins over a generic lint. Contradiction filed for Zach in
scheduler's `BLOCKERS.md` under `## realisateur` rather than resolved unilaterally.

## Shared-host footprint (declared per realisateur build discipline)

Everything this project installs outside its own repo. Filed with senechal
2026-07-29 (`notify-senechal`, senechal commit `829be49`). **front-door owns these;
senechal owns knowing they exist.**

### On `mandark`

| What | Where | State |
|---|---|---|
| `front-door-watch.service` | `~/.config/systemd/user/` + `default.target.wants` symlink | enabled, active |

Source of truth is [`etc/front-door-watch.service`](../etc/front-door-watch.service) in
this repo; the installed copy is a deployment of it. Runs `bin/watch --notify -i 120`,
`Restart=always`. Polls `hf7y/front-door` and relays knocks, amendment PRs, failed CI,
and milestone deadlines to WhatsApp via `bin/ping`.

It exists because **GitHub Actions cannot reach the WhatsApp bridge** — the bridge binds
`127.0.0.1` only — so mandark has to be the bridge.

Teardown:

```
systemctl --user disable --now front-door-watch.service
rm ~/.config/systemd/user/front-door-watch.service
```

*Verified 2026-07-29 via `systemctl --user is-active/is-enabled`, `ss -ltn` (bridge on
127.0.0.1:3000), and an end-to-end relay test where a real GitHub PR event produced a
WhatsApp message.*

### Not front-door's domain — flagged for hermes' owner

Changes made to **hermes** to get the transport working. Listed here for honesty, not
claimed as owned:

- Started + enabled the pre-existing-but-stopped `hermes-gateway.service`, then restarted it.
- **Edited `~/.hermes/.env`** — `WHATSAPP_HOME_CHANNEL` held the display name
  `Hermes Baudin` where a JID belongs, so the Baileys bridge threw
  `Cannot destructure property 'user' of 'jidDecode(...)'` on every send. Set to the
  account's own JID. Backup: `~/.hermes/.env.bak.frontdoor`.
- `npm install` (145 packages) into `~/.hermes/hermes-agent/scripts/whatsapp-bridge/node_modules`
  — the bundled bridge shipped without them and pairing could not work until it ran.

The `.env` edit is the item most in need of a second opinion: a config change in another
project's domain, which senechal's own rules would have handled as a remedy script rather
than a live edit.

### Deliberately not touched

No crontab entries. Nothing in `~/.local/bin`. No `~/.claude` hooks. No system-wide
(non-`--user`) units.

## Backlog

- [ ] **Separate bot identity.** Agents act as `@hf7y`, so `protocol/ratify.mjs` cannot
      distinguish a principal from an agent using that principal's credentials. Only a
      prose rule in `CLAUDE.md` prevents forged ratification. A GitHub App or machine
      user would make it mechanical.
- [ ] **Rate limits are declared, not metered.** Art. 6 states 10 new knocks and 60 issue
      replies per principal per hour; nothing counts.
- [ ] **`payload.pull_request` is referenced, not verified.** The dependency-free
      validator cannot confirm the PR exists or contains the claimed change.
- [ ] **Every local transport dies with the machine.** WhatsApp, KDE Connect, and desktop
      notification all need mandark awake. Only GitHub Actions survives a sleeping
      laptop, and it can only comment on the repo.
- [ ] **Milestone 001 is due 2026-08-02** and no modification to the house has been
      proposed by either principal. PR #3 has zero ratifications.

## Cloud doorkeeper (2026-07-29)

`trig_01Jqm3wbMwfw2maKKo93U688` — "front-door doorkeeper", claude-sonnet-5, cron
`0 1,14 * * *` (9am + 8pm America/Chicago), env `env_011bc4BhKriaHMdkzCbf5usR`.
Manage at https://claude.ai/code/routines/trig_01Jqm3wbMwfw2maKKo93U688 — routines
cannot be deleted via API; disable with an `update` setting `enabled: false`.

Created after `/web-setup` connected the GitHub account (the earlier attempt failed
HTTP 401 for exactly that reason). **This is the only thing that can answer a knock
unattended** — front-door is not in the scheduler registry, has no cron, and no
agent-running unit, so before this nothing would ever compose a reply. That mattered
because ratified concession mode is `strict`: an unaddressed point is defective and
silence never concedes, so an unanswered dispatch accrues an obligation instead of
lapsing.

**Authority it holds, and the fence around it:** it may open an amendment PR and may
never approve one (Art. 9). Its prompt carries the never-write-the-ratification-token
rule as its stated most important constraint, because it acts with `@hf7y`'s
credentials and `protocol/ratify.mjs` cannot distinguish it from Zach. That guard is
prose, not mechanism — the separate bot identity in the backlog is what would make it
real. Turning this on traded "nothing can answer a knock" for "an unattended agent
holds credentials that could forge a ratification if it ignored a written rule."
