# Question-bank drift guard

Keeps the rendered quiz pages (`quiz.js` = mod1, `modN.js` = modN) in lockstep with
the canonical question bank (`KC_Canonical_QuestionBank_v2_2026-08-07.json`).

## Why it exists

MOD 7 shipped on 2026-08-06 with Q6 broken: options were rewritten at build time,
option C's meaning was inverted, and the question ended up with no correct answer while
the key still pointed at C. The defect entered in the module's **initial** commit, so a
check that only diffs against the previous state would never have seen it.

This guard compares every rendered page against the **absolute** canonical bank, so:

- a **new module** is validated on its first commit (fail-closed if it has no bank entry);
- an **edited module** is validated on every change;
- **reorders**, **truncations**, a **keyed option that is no longer correct**, and a
  client `ANSWER_KEY` that disagrees with the canonical letter all fail the check.

It **fails** the commit / build — it never merely warns.

## Run it manually

```sh
node tools/verify_bank.js
# or against a specific bank:
node tools/verify_bank.js KC_Canonical_QuestionBank_v2_2026-08-07.json
```

Exit code 0 = all rendered modules match; 1 = drift (details printed).

## Enable the pre-commit hook (once per clone)

```sh
sh tools/install-hooks.sh
```

This sets `core.hooksPath` to `tools/git-hooks`, so `tools/git-hooks/pre-commit` runs
before every commit and blocks it on drift. If `node` is unavailable locally the hook
skips (CI still enforces).

## CI

`.github/workflows/verify-bank.yml` runs the same check on every push and pull request
that touches a quiz page, the bank, or the guard itself, and fails the build on drift.

## Authoritative vs harvested modules

- **mod1, mod4, mod5, mod7** — the bank is the source of truth; pages must match it
  character for character (whitespace-normalised).
- **mod2** — harvested from the deployed page (text and options). The guard freezes it
  as-harvested: any change to the rendered mod2 content fails until the bank is
  re-harvested deliberately. (mod2 Q11 has an unresolved option/rationale contradiction,
  escalated and left unchanged — see `audit/DIVERGENCE_REPORT.md`.)

## Fingerprint

`SHA-1( normalise( text | A:optA | B:optB | C:optC | D:optD ) )`, first 12 hex chars,
where `normalise` collapses runs of whitespace and trims. Stored per question in the bank.
