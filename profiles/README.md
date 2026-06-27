# Domain profiles

Run RoboCo as a **novel-writing** or **research-writing** company off the *same
unmodified code*. A profile is just data + config — it never edits the upstream
source, so `git pull` from upstream stays conflict-free.

## What a profile is

```
profiles/<domain>/
  .env.<domain>.example     # template (tracked) — copy to .env.<domain> (gitignored)
  prompts/                  # prompt OVERLAY — only the layers you reskin
    roles/developer.md      #   e.g. Writer / Author instead of Developer
    roles/qa.md             #   e.g. Editor / Peer Reviewer instead of QA
profiles/compose.profile.yml # shared overlay: domain DB + prompt-pack mount
```

The overlay is **per-file**: the prompt loader (`roboco/agents/factories/_base.py`)
checks `ROBOCO_PROMPTS_OVERLAY_DIR/<layer>` first and falls back to the in-tree
`agents/prompts/<layer>` for anything you didn't override. So you ship only the
diffs — base rules, lifecycle, teams, identities all inherit unchanged.

The lifecycle verbs do NOT change. `commit` / `open_pr` / `i_am_done` /
`pass_review` keep working — your overlay just reframes what they mean for prose
(commit = save a draft revision, open_pr = submit for editorial/peer review,
merge = accept/publish). Manuscripts live as Markdown in each agent's workspace
git clone, exactly like code does — that is why no engine change is needed.

## One-time setup

```bash
# 1) Externalised prompts patch is already in this branch (feature/domain-profiles).

# 2) Pick a profile and create its env file from the template:
cp profiles/novel/.env.novel.example       profiles/novel/.env.novel
cp profiles/research/.env.research.example  profiles/research/.env.research
#    edit ROBOCO_HOST_DATA_DIR to an ABSOLUTE host path in each.

# 3) Make sure repo-root .env has the shared secrets:
#    ROBOCO_ENCRYPTION_KEY, ROBOCO_AGENT_AUTH_SECRET (+ host auth dirs).
```

## Run (sequential — supported)

```bash
scripts/run-profile.sh novel          # bring the novel company up
scripts/run-profile.sh novel down     # stop it
scripts/run-profile.sh research up    # switch to the research company
scripts/run-profile.sh research logs
```

Each profile gets its **own database** (`roboco_novel` / `roboco_research`) and
its **own data root** (`./data-novel` / `./data-research` → isolated workspaces,
logs, manifests). Compose project name `roboco-<domain>` keeps the managed
volumes separate too.

> **Only one profile runs at a time.** The base `docker-compose.yaml` pins
> `container_name:` (roboco-postgres, roboco-orchestrator, …) and nginx binds
> host `:3000`. Switch with `down` then `up`.

## Running BOTH at once (not wired — known work)

Simultaneous stacks need, in `docker-compose.yaml`:
1. Drop the fixed `container_name:` lines (let `-p` prefix them).
2. Parameterize the nginx host port (`${PANEL_PORT:-3000}:80`) so novel=3000,
   research=3001.
3. Give the orchestrator-spawned **agent** containers a per-project name prefix
   (they are named `roboco-agent-*`; two orchestrators would collide).
Until then, run sequentially.

## Staying current with upstream

```bash
scripts/sync-upstream.sh      # FF master to upstream, rebase this branch on top
```

Because all domain content lives under `profiles/` (new files upstream never
touches) and the only in-tree change is the tiny overlay hook in `_base.py`,
rebases stay clean. Consider PR-ing the `ROBOCO_PROMPTS_OVERLAY_DIR` hook to
upstream — then even that delta disappears.
