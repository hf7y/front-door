# front-door — focus & backlog

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
