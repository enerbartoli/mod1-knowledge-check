# Drift-Prevention Proposal (Phase 3 — proposal only, nothing built)

## Root cause (what actually happened)

MOD 7 was built on 2026-08-06 from a spec and diverged from that spec **the same day, at build time** — not through slow accumulated edits. Two options (B and C) were replaced with shorter rewrites and C's meaning was inverted, leaving Q6 with no correct answer while the key still pointed at C. Phase 0 confirmed the damage was contained to that one question; mod1/mod4/mod5 and the rest of mod7 are byte-identical to canonical.

The structural weakness: question content lives in five hand-maintained JS files (`quiz.js`, `mod2.js`, `mod4.js`, `mod5.js`, `mod7.js`), each with its own `QUESTIONS` array, with **no link back to a spec and no check at the moment a module is authored**. The failure mode is therefore a *build-time* transcription error, so the guard rail has to fire when a module is created or edited — periodic monitoring alone would not have caught this before it went live.

## Option A — Single question bank rendered at runtime (biggest change)

Reduce the five pages to one shared shell (`quiz-shell.html` + `quiz-engine.js`) that reads `question-bank.json` at load, keyed by a `?module=mod7` (or path) parameter. Question text, options, section labels and slide refs come only from the JSON; each page becomes a thin wrapper.

- **Pro:** one source of truth; a fix is one JSON edit; impossible for pages to drift from each other; new modules are data, not code.
- **Con:** touches all four live quizzes at once — highest blast radius. The dashboard, resume/localStorage keys, module routing and the per-module pass copy all read from the current per-file structure and would need re-pointing.
- **Answer-key safety:** the bank shipped to the browser must carry **text + options only, never `correct`**. The engine still scores client-side for the instant results screen as today, but from a keyless bank; the authoritative score stays server-side in Apps Script (unchanged). The `correct` field lives only in the server copy of the bank / the existing `ANSWER_KEY_*` constants.

## Option B — Keep the files, add a build-time + CI fingerprint guard (recommended first step)

Leave the five pages as they are. Add a checked-in `KC_Canonical_QuestionBank_v*.json` (done in Phase 1) and a small script `tools/verify_bank.js` that:

1. Extracts each page's `QUESTIONS`/`ANSWER_KEY` (the exact Phase-0 extractor).
2. Computes the canonical fingerprint (`SHA-1₁₂` of `text|A:..|B:..|C:..|D:..`, whitespace-normalised).
3. Fails with a diff if any rendered question's fingerprint ≠ canonical, if a keyed letter's option text moved (reorder), or if a keyed option is absent — i.e. the exact mod7 Q6 condition.

Wire it two ways so it catches build-time drift, not just later:

- **Pre-commit hook** (`.git/hooks/pre-commit` or a `package.json` script the author runs) — fails the commit that introduces the drift, at authoring time.
- **CI on push/PR** (GitHub Actions) — backstop for anything that bypasses the hook.

For mod2 (options non-authoritative), the check runs in **harvest-assert** mode: it verifies the deployed options still match the harvested v2 fingerprints, so mod2 can't silently drift either, without pretending the JSON is its source.

- **Pro:** near-zero blast radius; no runtime change to the live quizzes; catches the precise failure that occurred; can ship this week.
- **Con:** the JSON and the pages are still two representations — the guard keeps them honest but a human still edits both. Mitigated by a `tools/sync_bank.js` that regenerates the `QUESTIONS` block from the JSON for authoritative modules.

## Option C — Author-from-spec generator

A `tools/build_module.js` that generates a new `modN.js` `QUESTIONS` array directly from the canonical JSON, so a new module is never hand-transcribed. Combined with Option B's verifier, authoring and checking share one source. This is what would have prevented the original MOD 7 defect outright.

## Keeping the key server-side while text is client-side

- Browser bank = `{id, text, options, section, slide_refs}` — **no `correct`**.
- Client scoring (instant results) runs against a keyless bank and is advisory only.
- Apps Script keeps `ANSWER_KEY_*` and does the authoritative scoring + email, exactly as now.
- The verifier checks option **text/position** against canonical; it never needs the key in the browser, and CI reads the key only from the server-side copy, which is not deployed to Pages.

## Effort and risk

| Item | Effort | Risk to the 4 live quizzes |
|---|---|---|
| Option B verifier + pre-commit + CI | ~0.5–1 day | **Very low** — read-only checks, no page changes |
| Option C generator | +0.5 day | Low — only affects new modules |
| Option A runtime shell | ~3–5 days | **High** — rewrites all four live pages, dashboard, resume, routing |

**Recommendation:** ship **Option B now** (it directly closes the hole that broke MOD 7 Q6 and runs at build time), add **Option C** when the next module is authored, and treat **Option A** as a larger refactor to schedule deliberately, not as an urgent fix. Build nothing until you approve which.
