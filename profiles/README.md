# Domain profiles

Run RoboCo as a **novel-writing** company off the *same unmodified code*. A
profile is just data + config — it never edits the upstream source, so the
prompt overlay stays conflict-free on `git pull`.

## What a profile is

```
profiles/novel/
  .env.novel.example        # template (tracked) — copy to .env.novel (gitignored)
  prompts/                  # prompt OVERLAY — only the layers you reskin
    base.md                 #   studio framing (copied from canonical, identity reskinned)
    roles/*.md              #   Writer / Editor / Continuity / Section + Managing Editor / …
    teams/*.md              #   Structure / Prose / Staging sections
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
#    edit ROBOCO_HOST_DATA_DIR to an ABSOLUTE host path.

# 3) Make sure repo-root .env has the shared secrets:
#    ROBOCO_ENCRYPTION_KEY, ROBOCO_AGENT_AUTH_SECRET (+ host auth dirs).
```

## Run (sequential — supported)

```bash
scripts/run-profile.sh novel          # bring the novel company up
scripts/run-profile.sh novel down     # stop it
scripts/run-profile.sh novel logs     # tail logs
```

The profile gets its **own database** (`roboco_novel`) and its **own data root**
(`./data-novel` → isolated workspaces, logs, manifests). Compose project name
`roboco-novel` keeps the managed volumes separate too.

> **One stack at a time.** The base `docker-compose.yaml` pins `container_name:`
> (roboco-postgres, roboco-orchestrator, …) and nginx binds host `:3000`. To
> run a second isolated stack alongside it you'd drop the fixed
> `container_name:` lines (let `-p` prefix them), parameterize the nginx host
> port (`${PANEL_PORT:-3000}:80`), and give the orchestrator-spawned
> `roboco-agent-*` containers a per-project prefix. Not wired — run one stack.

## Staying current with upstream

```bash
scripts/sync-upstream.sh      # FF master to upstream, rebase this branch on top
```

The profile mechanism stays conflict-free: domain content lives under
`profiles/` (new files upstream never touches) and the only in-tree hook is the
tiny overlay loader in `_base.py`. The Korean panel/seed reskin is a separate
fork-wide layer that *does* edit a handful of upstream-tracked display-label
sites (`panel/src/lib/labels.ts` + its consumers, `seeds/initial_data.py`) —
upstream rarely changes those, so `git merge upstream/master` stays clean in
practice. Consider PR-ing the `ROBOCO_PROMPTS_OVERLAY_DIR` hook upstream — then
the loader delta disappears too.
