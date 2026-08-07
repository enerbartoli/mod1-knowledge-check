# MOD Knowledge-Check — Divergence Report (Phase 0, read-only)

Generated 2026-08-07. Compares deployed quiz JS (`quiz.js`, `mod2.js`, `mod4.js`, `mod5.js`, `mod7.js`) against `KC_Canonical_QuestionBank_v1_2026-08-06.json`.
Fingerprint = SHA-1(first 12) of `text|A:optA|B:optB|C:optC|D:optD` (whitespace-normalised). Verified: reproduces all 50 canonical fingerprints with 0 mismatches.

## Headline

- **Exactly one** scoring-breaking divergence: **mod7 Q6** (already known). No correct option is rendered.
- **mod1, mod4, mod5: 100% MATCH** — every stem and option identical to canonical, character for character.
- **mod7: 9 of 10 MATCH**; only Q6 drifted.
- **mod2: HARVEST** — options are not authoritative in canonical (null); recorded from deployed for Phase 2. Deployed keys match canonical keys for all 15.
- **No OPTION_REORDER anywhere** (the dangerous quiet case) — checked explicitly.
- **No TEXT_DRIFT, no MISSING, no EXTRA.**
- **Real-submission impact: NONE.** The Sheet has 114 total submissions and **0 for mod7**, so nobody has been scored against the broken Q6.

## Full table

| Module | Q | Bucket | Scoring impact |
|---|---|---|---|
| mod1 | Q1 | MATCH | key A ok |
| mod1 | Q2 | MATCH | key B ok |
| mod1 | Q3 | MATCH | key C ok |
| mod1 | Q4 | MATCH | key A ok |
| mod1 | Q5 | MATCH | key C ok |
| mod1 | Q6 | MATCH | key A ok |
| mod1 | Q7 | MATCH | key D ok |
| mod1 | Q8 | MATCH | key C ok |
| mod1 | Q9 | MATCH | key D ok |
| mod1 | Q10 | MATCH | key B ok |
| mod1 | Q11 | MATCH | key B ok |
| mod1 | Q12 | MATCH | key C ok |
| mod1 | Q13 | MATCH | key D ok |
| mod1 | Q14 | MATCH | key B ok |
| mod1 | Q15 | MATCH | key D ok |
| mod1 | Q16 | MATCH | key A ok |
| mod2 | Q1 | HARVEST | mod2 options harvested from deployed; key=A deployed_key=A |
| mod2 | Q2 | HARVEST | mod2 options harvested from deployed; key=B deployed_key=B |
| mod2 | Q3 | HARVEST | mod2 options harvested from deployed; key=C deployed_key=C |
| mod2 | Q4 | HARVEST | mod2 options harvested from deployed; key=C deployed_key=C |
| mod2 | Q5 | HARVEST | mod2 options harvested from deployed; key=D deployed_key=D |
| mod2 | Q6 | HARVEST | mod2 options harvested from deployed; key=B deployed_key=B |
| mod2 | Q7 | HARVEST | mod2 options harvested from deployed; key=B deployed_key=B |
| mod2 | Q8 | HARVEST | mod2 options harvested from deployed; key=C deployed_key=C |
| mod2 | Q9 | HARVEST | mod2 options harvested from deployed; key=A deployed_key=A |
| mod2 | Q10 | HARVEST | mod2 options harvested from deployed; key=A deployed_key=A |
| mod2 | Q11 | HARVEST | mod2 options harvested from deployed; key=D deployed_key=D |
| mod2 | Q12 | HARVEST | mod2 options harvested from deployed; key=C deployed_key=C |
| mod2 | Q13 | HARVEST | mod2 options harvested from deployed; key=A deployed_key=A |
| mod2 | Q14 | HARVEST | mod2 options harvested from deployed; key=D deployed_key=D |
| mod2 | Q15 | HARVEST | mod2 options harvested from deployed; key=B deployed_key=B |
| mod4 | Q1 | MATCH | key B ok |
| mod4 | Q2 | MATCH | key C ok |
| mod4 | Q3 | MATCH | key A ok |
| mod4 | Q4 | MATCH | key D ok |
| mod4 | Q5 | MATCH | key A ok |
| mod4 | Q6 | MATCH | key B ok |
| mod4 | Q7 | MATCH | key A ok |
| mod4 | Q8 | MATCH | key C ok |
| mod4 | Q9 | MATCH | key B ok |
| mod4 | Q10 | MATCH | key D ok |
| mod5 | Q1 | MATCH | key A ok |
| mod5 | Q2 | MATCH | key B ok |
| mod5 | Q3 | MATCH | key C ok |
| mod5 | Q4 | MATCH | key D ok |
| mod5 | Q5 | MATCH | key A ok |
| mod5 | Q6 | MATCH | key B ok |
| mod5 | Q7 | MATCH | key C ok |
| mod5 | Q8 | MATCH | key D ok |
| mod5 | Q9 | MATCH | key A ok |
| mod5 | Q10 | MATCH | key B ok |
| mod5 | Q11 | MATCH | key C ok |
| mod5 | Q12 | MATCH | key D ok |
| mod5 | Q13 | MATCH | key A ok |
| mod5 | Q14 | MATCH | key B ok |
| mod5 | Q15 | MATCH | key C ok |
| mod7 | Q1 | MATCH | key C ok |
| mod7 | Q2 | MATCH | key B ok |
| mod7 | Q3 | MATCH | key D ok |
| mod7 | Q4 | MATCH | key A ok |
| mod7 | Q5 | MATCH | key B ok |
| mod7 | Q6 | OPTION_DRIFT | keyed letter C text changed AND canonical correct text ABSENT from deployed -> NO CORRECT ANSWER |
| mod7 | Q7 | MATCH | key D ok |
| mod7 | Q8 | MATCH | key B ok |
| mod7 | Q9 | MATCH | key C ok |
| mod7 | Q10 | MATCH | key A ok |

## Non-MATCH detail

### mod7 Q6 — OPTION_DRIFT — CRITICAL: no correct answer rendered

Deployed answer key: **C** · Canonical correct: **C**

| Opt | Deployed (live) | Canonical (should be) |
|---|---|---|
| A | It is already in HERO, because the frozen window keeps the two systems aligned. | It is already in HERO. The frozen window exists precisely to keep UA1 aligned across the two systems. |
| B | It reaches HERO at the next Friday export batch. | Nothing yet. It arrives the next time someone downloads a fresh template covering that scope. |
| C | Nothing, until someone downloads and uploads a template covering that scope. | Nothing, and no download or upload will bring it in. HERO does not read UA1 in any window. |
| D | Nothing, and the change will be overwritten by HERO on the next export. | Nothing yet. HERO will overwrite the change on the next Friday export to Logility. |

The keyed letter **C** is scored correct. Deployed C reads *"Nothing, until someone downloads and uploads a template covering that scope"* — the opposite of the intended answer. The canonical correct statement (*"Nothing, and no download or upload will bring it in. HERO does not read UA1 in any window"*) appears in **no** deployed option. All four options drifted (A/B/C/D all differ). Canonical carries a `change_note` for this correction.

## mod2 (HARVEST) — deployed key vs canonical key

| Q | canonical key | deployed key | match |
|---|---|---|---|
| Q1 | A | A | yes |
| Q2 | B | B | yes |
| Q3 | C | C | yes |
| Q4 | C | C | yes |
| Q5 | D | D | yes |
| Q6 | B | B | yes |
| Q7 | B | B | yes |
| Q8 | C | C | yes |
| Q9 | A | A | yes |
| Q10 | A | A | yes |
| Q11 | D | D | yes |
| Q12 | C | C | yes |
| Q13 | A | A | yes |
| Q14 | D | D | yes |
| Q15 | B | B | yes |
---

## Open items (escalated, no change made)

- **mod2 Q11 — keyed option contradicts its rationale.** Deployed keyed option (B... see bank) describes a *negative base trend enrichment + positive set*, while the canonical rationale describes *two offsetting sets*. The source does not resolve which mechanism is intended. **Escalated; left unchanged** in both the deployed page and the harvested v2 bank pending a content decision. The drift guard treats mod2 as harvested (asserts the deployed options have not changed since harvest), so this question is frozen as-is until resolved.
