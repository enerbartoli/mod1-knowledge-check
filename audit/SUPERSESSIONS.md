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
- Belief-holders to notify (passers who selected the previously-keyed B): **4** (identities in the Sheet — not duplicated here).

### MOD 4 Q4 — SUPERSEDED
- Stem, all four options, correct answer and rationale rewritten; **correct answer moved D → A**.
- The prior version taught the right landing spot for the wrong reason (treating it as a DI/FAN property rather than a per-market "not forecast statistically" rule).
- Prior submissions kept valid against the earlier (D-keyed) version.
- Belief-holders (passers who selected the previously-keyed D): **12 submissions / 11 unique people** (identities in the Sheet — not duplicated here).

### MOD 2 Q11 — RATIONALE CORRECTED ONLY
- **Key (D) and options unchanged.** The keyed option (negative Base Trend + positive SET) was correct all along; only the rationale contradicted it. Rationale replaced. No scoring impact. This resolves the item previously escalated in `DIVERGENCE_REPORT.md`.

### MOD 2 Q5 and Q8 — NO CHANGE
- Both confirmed correct against the current process. No flags for either existed in `audit/` (the only mod2 eyeball flag was Q11, now resolved), so nothing to clear.

### Canonical bank
- Applied to `KC_Canonical_QuestionBank_v3_2026-08-07.json` (v2 left in place). Recomputed fingerprints: mod2 Q7 `e9e7b593c6c1`, mod4 Q4 `3bec1d538b9e`; mod2 Q11 unchanged (`bb0ce7e89031`). The drift guard auto-selects the newest bank (now v3).

### Slide references — VERIFIED 2026-08-07
- Verified against the current decks: `DE_MOD2_FACILITATOR_DECK_v4_with-notes_2026-07-16.pptx` (57 slides) and `H.E.R.O Enrichment Training Mod 4 & 5_v5.1_2026-05-31.pptx` (74 slides).
- Updated (bank v3, backend `SLIDE_REFS_MOD2`, and the pages): **mod2 Q7 32 → 35**, **mod2 Q11 31 → 34**.
- **mod4 Q4 `6, 7` verified correct — unchanged.**

### Scope
- Only MOD 2 Q7, MOD 2 Q11 (rationale), and MOD 4 Q4 changed. MOD 1, MOD 5, MOD 7 and all other MOD 2 / MOD 4 questions untouched.

## 2026-08-07 (later) — MOD 4 Q5 & Q9 generalised (channel → segment scope)

Patch in place, no rescoring. **Keys unchanged** (Q5 = A, Q9 = B), so scores are
unaffected — this was wording, not re-keying. Prior MOD 4 submissions (24 at the
supersession date) stay valid.

### MOD 4 Q5 — SUPERSEDED (stem + options + rationale)
- Reframed from "the Evergreen exception for DI" to "the Evergreen designation": Evergreen
  is the route by which an item outside the statistical model joins it, not a DI-channel
  quirk (UK excludes DI; NA forecasts DI statistically). Correct answer stays A.

### MOD 4 Q9 — SUPERSEDED (stem + options; rationale unchanged)
- Reframed from a "DI account" to "a segment the market has agreed not to forecast
  statistically", and the previously-correct option B no longer describes an undefined
  KAM→Sales-Ops nomination circuit — it now states only what is decided: Sales Operations
  owns the designation, and until then the item stays bottom-up. Correct answer stays B.
  The rationale was already correctly scoped and was left unchanged.

### Slide references — NOT verified
- Q5 and Q9 both carry slide_refs "6". The MOD 4/5 deck
  (H.E.R.O Enrichment Training Mod 4 & 5_v5.1_2026-05-31.pptx) is not reachable from the
  build environment, so these were left unchanged and not verified. Confirm against the deck.

## 2026-08-17 — Market-neutral rewrite (22 questions, no key changes)

Twenty-two questions were made market-neutral: every reference to the United Kingdom, to
the pilot, and to the Brand Captain role was removed so each question reads the same way in
any market. Scope: mod1 x5 (Q7, Q13, Q14, Q15, Q16), mod2 x1 (Q4), mod4 x7 (Q1, Q2, Q4, Q5,
Q7, Q8, Q9), mod5 x8 (Q2, Q3, Q4, Q5, Q11, Q12, Q13, Q14), mod7 x1 (Q3). MOD 3 unchanged.

- **No answer key moved.** All six ANSWER_KEY objects are byte-identical to before. Prior
  submissions stay valid and comparable; nothing was rescored, and no new version of the
  check was raised.
- **Ownership at Level 2.5 is never named by role.** Questions name the level or the session,
  not the actor, because ownership at 2.5 varies by market.
- **ROLES arrays deliberately left unchanged** ("Brand Captain" in every module, "Change
  Agent / Pilot POC" in mod3). Relabelling them would split the dashboard's pass-rate-by-role
  history across two label sets. This is intentional.
- Applied to the pages (quiz.js, mod2.js, mod4.js, mod5.js, mod7.js) and to the backend
  fail-email data (QUESTION_TEXT and RATIONALES for the changed stems/rationales). Canonical
  bank KC_Canonical_QuestionBank_v6_2026-08-17.json produced from v5 with fingerprints
  recomputed for the 20 questions whose text or options changed; v1..v5 left in place. Guard
  auto-selects the newest bank (v6).
- Length signal (informational): 9 questions have the correct option longest by >30 chars, all
  pre-existing (the correct option was not rewritten in those). None of the six full rewrites
  is affected.
- Backend note: market-specific wording remains in questions NOT listed above and in non-question
  email copy (e.g., pass-email "what's next" text). Out of scope for this patch.
