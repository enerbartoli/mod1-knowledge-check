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

## 2026-08-18 — MOD 1 Q15 replaced (baseline-layering question, key unchanged)

Patch in place, no rescoring. MOD 1 Q15 was **replaced, not re-keyed** — the stem and all four
options are new, so nobody can be rescored against an option set they never saw. Existing MOD 1
results stay valid as recorded.

- **This supersedes the Q15 text set in the 2026-08-17 market-neutral commit** (earlier the same
  cycle). That version tested how the Level 2.5 view is pre-populated at cycle open; the item was
  judged too narrow and too easy to misread. The replacement tests the architectural point MOD 1
  is meant to land: HERO never overwrites the Daybreak statistical baseline, it layers a
  traceable adjustment on top of it.
- New stem: "You enter an adjustment in HERO. What happens to the Daybreak baseline underneath it?"
  Correct answer: D ("It stays untouched. Your adjustment sits on top of it as a separate,
  traceable layer.").
- **Key did not move.** ANSWER_KEY.Q15 is still 'D', byte-identical to before. MOD 1 remains 16
  questions; TOTAL_QUESTIONS (16) and PASS_THRESHOLD (13) unchanged. No new version of the check
  was raised.
- Applied to quiz.js (page), KC_Canonical_QuestionBank_v6_2026-08-17.json (fingerprint recomputed
  aca3448b9b8e -> 23479eba6c1a), dashboard-data.js (drill-down), and the backend fail-email
  QUESTION_TEXT (Q15 stem). Inventory and manifest regenerated; all three guards green.
- **slide_refs left at '33' and flagged for review.** Slide 33 taught the Level 2.5 cycle-start
  workflow that was removed, so the reference is probably now wrong. The MOD 1 facilitator deck is
  not in the repo, so the correct slide could not be located from here. Do not treat '33' as
  verified for this item; confirm against the deck and update if a better slide exists.

## 2026-08-29/30 — MOD 3 Q8 replaced; MOD 3 Q9, MOD 3 Q4 and MOD 7 Q6 made market-neutral (fan-out vs weekly export, no key changes)

Patch in place, no rescoring. Two processes were being conflated in the deployed content: the
fan-out (distributes a Level 2.5 change to Level 1 partner rows, on a schedule set per market,
Monday to Thursday, three times a day) and the weekly scheduled export to Logility (runs once a
week inside the export pipeline, on a different day per market). A Level 2.5 change is saved
immediately but does not fan out immediately; scheduled processing is the normal path for it, not
a fallback. Only two markets have a defined fan-out schedule; other markets, including Asia
Pacific and Latin America, do not.

### Harvest before patching
Ran `node tools/verify_bank.js` against the prior canonical bank
(`KC_Canonical_QuestionBank_v6_2026-08-17.json`) before making any change: 0 drift across all
six modules, so the deployed pages (quiz.js, mod2.js, mod3.js, mod4.js, mod5.js, mod7.js) match
v6 character-for-character on stems/options/keys. v6 already carried a full MOD 3 module (added
in v4, 2026-08-07, unchanged since — contrary to an initial assumption that MOD 3 had never been
harvested). v7 was built from v6 as this harvested baseline plus the changes below.

### MOD 3 Q8 — REPLACED (stem, all four options, rationale, reference)
- The old version rested on an immediate/UK-weekday fan-out model ("twenty minutes later ...",
  "the fan-out runs ... several times a day on UK weekdays"). Replaced in full: new stem asks what
  to do when partner rows still show no change; correct option now points to the next scheduled
  fan-out run for the reader's own market and the read-only Level 2.5 column in a fresh Level 1
  template, rather than the dashboard.
- **Key did not move.** ANSWER_KEY_MOD3.Q8 (page and backend) is still 'B'.
- Reference no longer cites Build Learnings KB section 13; now HERO Manual, "Timing & system
  sync" and "BU-SKU / Level 2.5 mode".

### MOD 3 Q9 — options B and C and rationale market-neutralised (stem, options A and D unchanged)
- Option C dropped "Friday" for "the weekly scheduled export for your market". Option B reworded
  so the distractor no longer leans on the old fan-out-publishes-to-Logility framing. Rationale
  rewritten to state the fan-out and the weekly export are two separate processes, day varies by
  market.
- **Key did not move.** ANSWER_KEY_MOD3.Q9 is still 'C'. The stem's "on a Tuesday" is scenario
  flavor text, not a schedule claim, and was left as instructed.

### Sweep (search terms in section 4 of the source instructions) across quiz.js, mod2.js, mod3.js,
mod4.js, mod5.js, mod7.js, backend/apps-script.gs
- `fan-out`/`post-processing` family: hits confined to MOD 3 Q8/Q9 (page + backend), all resolved
  by the replacements above.
- `Friday`/weekday: two further non-key hits found and fixed — **mod3 Q4 option B** ("...after the
  Friday export" -> "...after the weekly export") and **mod7 Q6 option D** ("next Friday export to
  Logility" -> "next weekly export to Logility"). Neither is the keyed option (mod3 Q4 key stays D,
  mod7 Q6 key stays C), so no key moved.
- `08:00`/clock times/timezones/`noon Eastern`: one hit, inside the old MOD 3 Q9 rationale,
  resolved by the Q9 rewrite above.
- `UK`/market names/blocs: one hit, inside the old MOD 3 Q8 rationale, resolved by the Q8
  replacement. A pre-existing "UK pilot" reference in MOD 5's pass-email copy (not a question
  field) was already flagged out of scope in the 2026-08-17 entry above and is left as-is.
- Four-vs-five UA1 enrichment-type list, `not visible`/`cannot see` visibility claims, and TMO
  framed as a timing exception: **0 qualifying hits** anywhere in the deployed content. Nothing to
  change; no fact invented.

### Canonical bank
Applied to `KC_Canonical_QuestionBank_v7_2026-08-29.json`, built from v6 (v1..v6 left in place).
Fingerprints recomputed for the four changed questions: mod3 Q4 `ee49f9d846af`, mod3 Q8
`af14b9a9ac85`, mod3 Q9 `6096a5c013ed`, mod7 Q6 `b460d56a2e84`; all 76 fingerprints in the bank
verified unique. `tools/generate_registry.js` and `tools/generate_inventory.js` re-run;
`verify_bank.js`, `verify_registry.js` and `verify_inventory.js` all green against v7.

**Filename note:** the instructions that requested this patch asked for the file to be named
`KC_Canonical_QuestionBank_v5_2026-08-29.json`. That name was not used: `tools/verify_bank.js`,
`generate_registry.js`, `verify_registry.js` and `inventory_lib.js` all pick the "newest" bank by
parsing the integer after `_v` in the filename, not by date, and a `v5` file would sort **behind**
the existing `v6_2026-08-17.json` — every guard and generator would keep silently treating v6 as
canonical, so this patch would never take effect and CI would fail on the very next unrelated
change to mod3.js/mod7.js. The file was named `v7` instead, which the existing tooling picks up
correctly with no other changes. Flagging this rather than either silently complying (which ships
a bank nothing reads) or silently renaming without a note.
