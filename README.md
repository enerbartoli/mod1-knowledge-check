# MOD 1 Knowledge Check — Forecast Enrichment UK Pilot

Self-hosted knowledge-check quiz for the Forecast Enrichment Programme MOD 1 training (Baseline & Workflow Foundations).

## Architecture

```
[Participant browser]
        │
        │  Static HTML + CSS + JS
        ▼
[GitHub Pages — index.html]
        │
        │  HTTPS POST (JSON — answers only, no key)
        ▼
[Google Apps Script Web App]
        │  ├─ Scores submission (answer key is server-side only)
        │  ├─ Appends row to Google Sheet
        │  └─ Sends emails via Gmail
        ▼
[Google Sheet — "MOD 1 Quiz Responses"]
        │
        └─ Participant email + internal notification
```

## Features

- **16 multiple-choice questions** across 9 sections of MOD 1.
- **80% pass threshold** (≥ 13/16 correct).
- **Server-side scoring** — the answer key never leaves the Apps Script; participants cannot cheat by inspecting the source.
- **Persistent state** — answers saved to localStorage; if a participant refreshes mid-quiz, they're offered to resume.
- **Mobile-responsive** — dark navy/teal palette matches the MOD 1 facilitator deck; large touch targets.
- **Automatic emails** — pass/fail template to participant, plus internal notification to the trainer.
- **Google Sheets storage** — one row per submission with per-question answer and correctness columns.
- **No login required** — public URL, accessible to anyone with the link.

## File Structure

```
mod1-knowledge-check/
├── index.html          — Single-page quiz UI (welcome → identity → 16 questions → confirm → results)
├── style.css           — Dark navy/teal/yellow theme, mobile-first
├── quiz.js             — State machine, question bank (no answer key), localStorage persistence, fetch
├── backend/
│   └── apps-script.gs  — Google Apps Script: doPost, scoring, Sheet write, email send
├── SETUP.md            — Step-by-step setup guide for non-technical users
└── README.md           — This file
```

## Quick Start

See **SETUP.md** for full step-by-step instructions.

1. Create a Google Sheet named "MOD 1 Quiz Responses".
2. Open Extensions → Apps Script, paste `backend/apps-script.gs`, update `RENE_EMAIL`.
3. Deploy as Web App (Execute as: Me, Who has access: Anyone). Copy the URL.
4. In `quiz.js`, replace `APPS_SCRIPT_URL` with your deployed URL.
5. Push files to a public GitHub repo and enable GitHub Pages.
6. Share the Pages URL with participants.

## Score Sheet Structure

| Column | Contents |
|--------|----------|
| A | Timestamp |
| B | Full Name |
| C | Email |
| D | Role |
| E | Role (Other detail) |
| F | Score (0–16) |
| G | Score % |
| H | Pass / Fail |
| I–AJ | Q1–Q16: Answer submitted + Correct? |
| AK | Failed question numbers |
| AL | Email Sent? |
| AM | User-Agent |

## Integrity guard (prevents question-bank drift)

Question content lives in hand-maintained JS files (`quiz.js` = mod1, `modN.js` = modN).
Two checks keep them honest and keep the docs matched to the repo. Both run in
**pre-commit** and in **CI**, and both **fail the build** (they never merely warn).

- **Bank guard** (`tools/verify_bank.js`) — compares every rendered page against the
  canonical bank `KC_Canonical_QuestionBank_v2_2026-08-07.json` by absolute comparison,
  so a **new module is validated on its first commit**, not just edits. Catches
  fingerprint drift, option reorder, a keyed option that is no longer correct, an
  `ANSWER_KEY` that disagrees with the bank, unregistered modules, and missing/extra
  questions.
- **Inventory guard** (`tools/verify_inventory.js`) — fails if `audit/APP_INVENTORY.md`
  is stale versus the repo (structural-hash mismatch). Regenerate with
  `node tools/generate_inventory.js` and commit.

Generated docs (never edit by hand — re-run the generator):

- `APP_MANIFEST.md` / `APP_MANIFEST.json` — `node tools/generate_manifest.js`
- `audit/APP_INVENTORY.md` — `node tools/generate_inventory.js` (full stems, options,
  correct letters, fingerprints, backend handlers, Sheet columns, `QUIZ_CLOSED`,
  and a live submissions-per-module snapshot)

Enable the pre-commit hook once per clone:

```sh
sh tools/install-hooks.sh   # sets core.hooksPath -> tools/git-hooks
```

See `tools/README.md` for detail and the authoritative-vs-harvested rule (mod1/mod4/mod5/mod7
are bank-authoritative; mod2 is harvested from the deployed page).

## Maintenance

- **Close the quiz:** Set `QUIZ_CLOSED = true` in `apps-script.gs` and redeploy.
- **Update a question:** Edit `quiz.js` (question text/options) and `apps-script.gs` (`QUESTION_TEXT`, `ANSWER_KEY`, `SLIDE_REFS`) together.
- **Change pass threshold:** Update `PASS_THRESHOLD` in both `quiz.js` and `apps-script.gs`.
- **Add a new deployment:** Always create a "New version" in Apps Script deployment manager — redeploying to the same version does not apply code changes.

## License

MIT — see `LICENSE`.
