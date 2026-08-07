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
  newest canonical bank (`KC_Canonical_QuestionBank_v*.json`, auto-selected; currently
  `v3_2026-08-07`) by absolute comparison,
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

**Backend is out of scope of the guard.** The Apps Script Web App is edited directly in the
Apps Script editor, outside git, so `backend/apps-script.gs` in the repo can fall behind what
is actually deployed. The fingerprint/inventory guard does **not** detect repo-versus-deployed
backend drift — an automated comparison is a separate piece of work, not yet built. Anyone
changing the backend should edit the repo copy (`backend/apps-script.gs`) and deploy from it,
so the two stay in sync.

## Single module registry (nav menu + dashboard filters)

The set of modules lives in **one place: the canonical bank**. Two generated files derive
from it, and every page reads them — so a module never has to be listed by hand in six
places again:

- **`modules.js`** — generated by `tools/generate_registry.js`. Holds `window.HERO_MODULES`
  (`id, num, label, url, total, pass`) and, at load, builds the nav `<select id="module-select">`
  and the dashboard filter host `<div id="dash-mod-filters">` on whatever page includes it.
  The visible label comes from each module's `nav_label` in the bank.
- **`dashboard-data.js`** — also generated from the bank; `DASH_MODULE_REGISTRY` powers the
  dashboard drill-down (its answer keys are checked against the bank, so they can't go stale).

Pages carry **no hardcoded module lists** — the `<select>` has only the placeholder option,
the filter host is empty, and `<body data-module="modN">` tells the registry which one is current.
The per-page JS derives its module arrays (`allMods`, `modLabels`, `pendingActiveModules`,
`modPassThreshold`) and its module routing from `window.HERO_MODULES` too.

**`tools/verify_registry.js`** fails the build (pre-commit + CI) if a bank module is missing
from `modules.js`, from the dashboard registry, or if any page reintroduces a hardcoded module
option/checkbox. Same fail-closed rule as the fingerprint guard.

### How to add a new module

1. Add the module to the canonical bank (`KC_Canonical_QuestionBank_v*.json`): `module_id`,
   `nav_label`, `quiz_url`, `total_questions`, `pass_threshold`, `options_authoritative`, and the
   questions (stem, four options, `correct`, `rationale`, `slide_refs`).
2. Build the page and quiz JS the usual way (clone the closest module; `<body data-module="modN">`,
   load `modules.js`, keep the `<select>`/filter host empty).
3. Add the backend handler + router line in `backend/apps-script.gs`.
4. Run the generators: `node tools/generate_registry.js` then `node tools/generate_manifest.js`
   and `node tools/generate_inventory.js`.
5. Commit. The pre-commit hook runs all guards; CI runs them again. Green means the module now
   appears in the menu and the dashboard filters everywhere, with no navigation code touched.

## Maintenance

- **Close the quiz:** Set `QUIZ_CLOSED = true` in `apps-script.gs` and redeploy.
- **Update a question:** Edit `quiz.js` (question text/options) and `apps-script.gs` (`QUESTION_TEXT`, `ANSWER_KEY`, `SLIDE_REFS`) together.
- **Change pass threshold:** Update `PASS_THRESHOLD` in both `quiz.js` and `apps-script.gs`.
- **Add a new deployment:** Always create a "New version" in Apps Script deployment manager — redeploying to the same version does not apply code changes.

## License

MIT — see `LICENSE`.
