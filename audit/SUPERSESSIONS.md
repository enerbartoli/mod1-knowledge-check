# Question supersessions & rationale corrections

## 2026-08-07 — content corrected to current process (patch in place, no rescoring)

Decision (Rene Bartoli): **patch in place, do not rescore any prior submission.**
Two of these questions were **rewritten, not re-keyed** — nobody can be rescored against
an option set they never saw. The 21 MOD 2 and 24 MOD 4 submissions already recorded stay
valid, scored against the earlier versions of these questions. **No v2.0 of the knowledge
check was raised.**

### MOD 2 Q7 — SUPERSEDED
- Stem unchanged (kept the deployed "(ladder)" wording).
- All four options rewritten; **correct answer moved B → A** (Demand Phase Shift pair).
- Rationale replaced (ratified 16 July 2026; explicitly rules out SET and base trend for a timing move).
- Prior submissions kept valid against the earlier (B-keyed) version.
- Belief-holders to notify (passers who selected the previously-keyed B): carl.lewis@hasbro.co.uk, claire.fletcher@hasbro.co.uk, rose.cheung@hasbro.co.uk, siobhan.shea@hasbro.co.uk.

### MOD 4 Q4 — SUPERSEDED
- Stem, all four options, correct answer and rationale rewritten; **correct answer moved D → A**.
- The prior version taught the right landing spot for the wrong reason (treating it as a DI/FAN property rather than a per-market "not forecast statistically" rule).
- Prior submissions kept valid against the earlier (D-keyed) version.
- Belief-holders (passers who selected the previously-keyed D): 12 submissions / 11 unique people — rose.cheung, bucktoo@eu.hasbro.com, carl.lewis, daisy.abbott, claire.fletcher, tia.bailey, jamie.leacock, siobhan.shea, toni.richards, muratcan.seren, kyri.kyriacou (all @hasbro.co.uk unless shown).

### MOD 2 Q11 — RATIONALE CORRECTED ONLY
- **Key (D) and options unchanged.** The keyed option (negative Base Trend + positive SET) was correct all along; only the rationale contradicted it. Rationale replaced. No scoring impact. This resolves the item previously escalated in `DIVERGENCE_REPORT.md`.

### MOD 2 Q5 and Q8 — NO CHANGE
- Both confirmed correct against the current process. No flags for either existed in `audit/` (the only mod2 eyeball flag was Q11, now resolved), so nothing to clear.

### Canonical bank
- Applied to `KC_Canonical_QuestionBank_v3_2026-08-07.json` (v2 left in place). Recomputed fingerprints: mod2 Q7 `e9e7b593c6c1`, mod4 Q4 `3bec1d538b9e`; mod2 Q11 unchanged (`bb0ce7e89031`). The drift guard auto-selects the newest bank (now v3).

### Slide references — NOT verified
- The bank's `slide_refs` for MOD 2 Q7 / Q11 and MOD 4 Q4 date from May. The MOD 2 deck was corrected on 16 July 2026 (`DE_MOD2_FACILITATOR_DECK_v4_with-notes_2026-07-16`) and the MOD 4/5 deck may also have moved. These decks are not accessible from the build environment, so the slide numbers were **left unchanged and not verified** — do not treat them as confirmed. Verify against the current decks and update deliberately if needed.

### Scope
- Only MOD 2 Q7, MOD 2 Q11 (rationale), and MOD 4 Q4 changed. MOD 1, MOD 5, MOD 7 and all other MOD 2 / MOD 4 questions untouched.
