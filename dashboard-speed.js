'use strict';
/*
 * dashboard-speed.js — shared across all module pages.
 *
 * Two things live here:
 *
 *   1. window.HERO_TRACK — splits a set of submission rows by TRACK. The split is
 *      driven by the `track` field on window.HERO_MODULES (generated into modules.js
 *      from the canonical bank), never by a name prefix or a string match on "speed",
 *      so adding a third track later needs no change here.
 *
 *   2. window.HERO_SPEED_DASH.render(rows) — renders the Speed Training section of
 *      the dashboard into <div id="dash-speed">.
 *
 * The two tracks are kept strictly apart. Every pre-existing dashboard panel is fed
 * HERO_TRACK.main(...) so a programme figure can never quietly absorb a Speed
 * submission, and everything below reads HERO_TRACK.speed(...) so the Speed roll-up
 * can never absorb a main-module one.
 *
 * Reads the same globals as dashboard-export.js: the row set passed in by the page's
 * renderDash(), plus DASH_MODULE_REGISTRY (dashboard-data.js) for question text and
 * window.HERO_MODULES (modules.js) for labels, totals and pass thresholds.
 *
 * Programme rule: this file never renders an individual participant's score, name or
 * email. Everything here is a count, a rate or an average over a group.
 */
(function () {

  // ── Track helpers ──────────────────────────────────────────────────────────
  function modulesOfTrack(track) {
    return (window.HERO_MODULES || []).filter(function (m) { return (m.track || 'main') === track; });
  }
  function trackOf(moduleId) {
    var hit = (window.HERO_MODULES || []).filter(function (m) { return m.id === moduleId; })[0];
    return hit ? (hit.track || 'main') : 'main';
  }
  // Rows carry no module value for the oldest MOD 1 submissions; the dashboard has
  // always read those as mod1, so keep that reading here too.
  function rowTrack(r) { return trackOf((r && r.module) || 'mod1'); }
  function ofTrack(rows, track) {
    return (rows || []).filter(function (r) { return rowTrack(r) === track; });
  }

  window.HERO_TRACK = {
    of: trackOf,
    main:  function (rows) { return ofTrack(rows, 'main'); },
    speed: function (rows) { return ofTrack(rows, 'speed'); },
    mainModules:  function () { return modulesOfTrack('main'); },
    speedModules: function () { return modulesOfTrack('speed'); }
  };

  // ── Small helpers ──────────────────────────────────────────────────────────
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  // Every rate in this file goes through here, so an empty session can never produce
  // NaN, Infinity or a misleading 0%. `null` means "nothing to divide" and is rendered
  // as an em dash rather than a zero.
  function rate(numerator, denominator) {
    return denominator > 0 ? numerator / denominator : null;
  }
  function pct(r) { return r === null ? '—' : Math.round(r * 100) + '%'; }
  function rateColor(r) {
    if (r === null) return 'var(--gray-muted)';
    if (r >= 0.7) return 'var(--teal)';
    if (r >= 0.4) return 'var(--yellow)';
    return 'var(--coral)';
  }
  // Rows are timestamped; a revision date is a plain YYYY-MM-DD. Compare from the start of
  // that day in UTC. An attempt sat on the revision day itself, before the new text went
  // live, would land on the "after" side — the only ambiguity this scheme has, and it is
  // bounded to a single day.
  function onOrAfter(timestamp, isoDate) {
    var t = new Date(timestamp).getTime();
    var c = new Date(isoDate + 'T00:00:00Z').getTime();
    return isFinite(t) && isFinite(c) && t >= c;
  }
  function failedNums(r, totalQ) {
    return String((r && r.failed) || '').split(',').map(function (s) {
      return parseInt(String(s).trim(), 10);
    }).filter(function (n) { return n >= 1 && n <= totalQ; });
  }

  // ── Per-session statistics ─────────────────────────────────────────────────
  // One object per Speed session, whether or not it has any submissions yet.
  function sessionStats(rows) {
    return window.HERO_TRACK.speedModules().map(function (m) {
      var reg     = (typeof DASH_MODULE_REGISTRY !== 'undefined' && DASH_MODULE_REGISTRY[m.id]) || null;
      var totalQ  = m.total || (reg && reg.totalQ) || 0;
      var mine    = (rows || []).filter(function (r) { return (r.module || 'mod1') === m.id; });
      var passes  = mine.filter(function (r) { return (r.score || 0) >= m.pass; });
      var people  = {};
      var passers = {};
      mine.forEach(function (r) {
        var em = String(r.email || '').toLowerCase().trim();
        if (!em) return;
        people[em] = true;
        if ((r.score || 0) >= m.pass) passers[em] = true;
      });

      // Correct rate per question, from the failed-question numbers the backend wrote.
      //
      // A stored row records only which question NUMBERS were failed — no fingerprint and
      // no bank version — so a question whose text has since been rewritten would silently
      // average two different questions together under the same number. Where the bank says
      // a question was revised on a date, its figures are therefore computed from attempts
      // recorded on or after that date only. Questions that were not revised keep their full
      // history, because they are still the same question.
      var perQuestion = [];
      for (var q = 1; q <= totalQ; q++) perQuestion.push({ q: q, wrong: 0 });
      var qMeta = {};
      if (reg && reg.questions) reg.questions.forEach(function (x) { qMeta[x.id] = x; });

      perQuestion.forEach(function (p) {
        var meta = qMeta[p.q] || {};
        p.text = meta.text || '';
        p.revisedOn = meta.revisedOn || null;
        // Rows this question's figures may be computed from.
        var pool = p.revisedOn
          ? mine.filter(function (r) { return onOrAfter(r.timestamp, p.revisedOn); })
          : mine;
        p.excluded = mine.length - pool.length;
        p.wrong = 0;
        pool.forEach(function (r) {
          if (failedNums(r, totalQ).indexOf(p.q) !== -1) p.wrong++;
        });
        p.attempts    = pool.length;
        p.correct     = pool.length - p.wrong;
        p.correctRate = rate(p.correct, pool.length);
        p.wrongRate   = rate(p.wrong, pool.length);
      });

      return {
        id: m.id,
        label: m.label,
        short: m.short,
        url: m.url,
        totalQ: totalQ,
        pass: m.pass,
        attempts: mine.length,
        participants: Object.keys(people).length,
        passed: passes.length,
        passedPeople: Object.keys(passers).length,
        passRate: rate(passes.length, mine.length),
        avgScore: mine.length
          ? Math.round((mine.reduce(function (s, r) { return s + (r.score || 0); }, 0) / mine.length) * 10) / 10
          : null,
        perQuestion: perQuestion,
        // The three questions the room gets wrong most often. Ties break on the lower
        // question number so the order is stable between renders.
        // Ranked on each question's own eligible pool, so a rewritten question is judged on
        // the attempts that actually saw its current text.
        worst: perQuestion.slice()
          .filter(function (p) { return p.wrong > 0; })
          .sort(function (a, b) { return (b.wrong - a.wrong) || (a.q - b.q); })
          .slice(0, 3)
      };
    });
  }

  // ── Fragments ──────────────────────────────────────────────────────────────
  function sectionHeading(text, note) {
    return '<div style="display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin:22px 0 10px;">' +
      '<span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--teal);">' + esc(text) + '</span>' +
      (note ? '<span class="muted" style="font-size:11px;">' + esc(note) + '</span>' : '') +
      '</div>';
  }

  function kpi(value, label, color) {
    return '<div class="kpi-card" style="padding:14px 8px;">' +
      '<div class="kpi-val" style="color:' + color + ';font-size:26px;">' + esc(value) + '</div>' +
      '<div class="kpi-label">' + esc(label) + '</div>' +
      '</div>';
  }

  function rollUp(stats, speedRows) {
    var attempts = stats.reduce(function (s, x) { return s + x.attempts; }, 0);
    var passed   = stats.reduce(function (s, x) { return s + x.passed; }, 0);
    var overall  = rate(passed, attempts);

    // Distinct people across the whole track — someone who sat three sessions counts
    // once here, unlike the per-session participant counts further down.
    var people = {};
    speedRows.forEach(function (r) {
      var em = String(r.email || '').toLowerCase().trim();
      if (em) people[em] = true;
    });

    // Weakest = lowest pass rate among sessions that actually have attempts.
    // Nothing to compare while the track is empty, so it stays an em dash.
    var ranked = stats.filter(function (x) { return x.attempts > 0; })
      .sort(function (a, b) { return (a.passRate - b.passRate) || (a.avgScore - b.avgScore); });
    var weakest = ranked.length ? ranked[0] : null;

    return '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;">' +
      kpi(attempts, 'Attempts', 'var(--white)') +
      kpi(Object.keys(people).length, 'Participants', 'var(--gray-light)') +
      kpi(pct(overall), 'Pass rate', rateColor(overall)) +
      kpi(weakest ? weakest.short : '—', 'Weakest session', weakest ? 'var(--yellow)' : 'var(--gray-muted)') +
      '</div>' +
      (weakest
        ? '<p class="muted" style="font-size:12px;margin-top:10px;">Weakest by pass rate: <strong style="color:var(--yellow);">' +
            esc(weakest.label) + '</strong> — ' + pct(weakest.passRate) + ' of ' + weakest.attempts +
            ' attempt(s) at or above ' + weakest.pass + '/' + weakest.totalQ + '.</p>'
        : '');
  }

  function sessionCard(s) {
    var head =
      '<div style="display:flex;align-items:baseline;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:10px;">' +
        '<span style="font-size:14px;font-weight:700;color:var(--white);">' + esc(s.label) + '</span>' +
        '<span class="muted" style="font-size:11px;">Pass mark ' + s.pass + ' / ' + s.totalQ + '</span>' +
      '</div>';

    if (!s.attempts) {
      return '<div style="border:1px solid var(--navy-light);border-radius:10px;padding:16px;background:var(--navy-mid);margin-bottom:12px;">' +
        head +
        '<p class="muted" style="font-size:13px;margin:0;">No submissions yet.</p>' +
        '</div>';
    }

    var figures =
      '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px;">' +
        kpi(s.attempts, 'Attempts', 'var(--white)') +
        kpi(s.participants, 'Participants', 'var(--gray-light)') +
        kpi(pct(s.passRate), 'Pass rate', rateColor(s.passRate)) +
        kpi(s.avgScore === null ? '—' : s.avgScore + ' / ' + s.totalQ, 'Avg score', 'var(--yellow)') +
      '</div>';

    // Correct rate per question — higher and greener is better, which is the opposite
    // reading from the main-track heatmap (that one shows failure rate). Labelled so
    // the two are not confused.
    var perQ = s.perQuestion.map(function (p) {
      var c = rateColor(p.correctRate);
      var w = p.correctRate === null ? 0 : Math.round(p.correctRate * 100);
      var tip = 'Q' + p.q + ' — ' + pct(p.correctRate) + ' correct of ' + p.attempts + ' attempt(s)'
        + (p.revisedOn ? '; rewritten ' + p.revisedOn + ', ' + p.excluded + ' earlier attempt(s) excluded' : '');
      return '<div class="heatmap-row" title="' + esc(tip) + '">' +
        '<span class="heatmap-label">Q' + p.q +
          (p.revisedOn ? '<span style="color:var(--yellow);" title="rewritten">*</span>' : '') + '</span>' +
        '<div class="heatmap-bar-track"><div class="heatmap-bar-fill" style="width:' + w + '%;background:' + c + ';"></div></div>' +
        '<span class="heatmap-pct" style="color:' + c + ';">' + pct(p.correctRate) + '</span>' +
        '</div>';
    }).join('');

    // Say plainly that two clusters are being kept apart, rather than letting a reader
    // assume every bar covers the same set of attempts.
    var revised = s.perQuestion.filter(function (p) { return p.revisedOn && p.excluded > 0; });
    if (revised.length) {
      perQ += '<p class="muted" style="font-size:11px;margin:10px 0 0;line-height:1.5;">' +
        '<span style="color:var(--yellow);">*</span> rewritten on ' + esc(revised[0].revisedOn) + '. ' +
        'These ' + revised.length + ' question(s) are scored on the ' +
        revised[0].attempts + ' attempt(s) since that date; ' + revised[0].excluded +
        ' earlier attempt(s) answered different text and are left out of these bars. ' +
        'Attempts, pass rate and average score above cover every attempt — the answer key did not change.' +
        '</p>';
    }

    var worst = s.worst.length
      ? s.worst.map(function (p, i) {
          return '<div style="display:flex;gap:10px;padding:9px 0;' + (i ? 'border-top:1px solid var(--navy-light);' : '') + '">' +
            '<span style="flex:0 0 auto;font-size:11px;font-weight:700;color:var(--coral);background:rgba(248,113,113,0.12);border-radius:4px;padding:2px 7px;height:fit-content;">Q' + p.q + '</span>' +
            '<div style="min-width:0;">' +
              '<div style="font-size:13px;color:var(--gray-light);line-height:1.45;">' + esc(p.text || '(question text unavailable)') + '</div>' +
              '<div style="font-size:11px;color:var(--coral);margin-top:3px;">' + pct(p.wrongRate) + ' answered wrong · ' + p.wrong + ' of ' + p.attempts + ' attempt(s)</div>' +
            '</div>' +
          '</div>';
        }).join('')
      : '<p class="muted" style="font-size:13px;margin:0;">Every question was answered correctly in every attempt so far.</p>';

    return '<div style="border:1px solid var(--navy-light);border-radius:10px;padding:16px;background:var(--navy-mid);margin-bottom:12px;">' +
      head + figures +
      sectionHeading('Correct rate per question') + perQ +
      sectionHeading('Most often answered wrong') + worst +
      '</div>';
  }

  // Aggregation by role — the sheet carries role, not team, so role is the grouping
  // the data actually supports. Counts and rates only; no participant is named.
  function byRole(rows) {
    var map = {};
    rows.forEach(function (r) {
      var role = r.role || 'Unknown';
      var em   = String(r.email || '').toLowerCase().trim();
      if (!map[role]) map[role] = { people: {}, attempts: 0, passes: 0 };
      map[role].attempts++;
      if (em) map[role].people[em] = true;
      var mod = (window.HERO_MODULES || []).filter(function (m) { return m.id === (r.module || 'mod1'); })[0];
      if (mod && (r.score || 0) >= mod.pass) map[role].passes++;
    });

    var entries = Object.keys(map).map(function (role) {
      var d = map[role];
      return { role: role, people: Object.keys(d.people).length, attempts: d.attempts, passes: d.passes, rate: rate(d.passes, d.attempts) };
    }).sort(function (a, b) { return (b.rate === null ? -1 : b.rate) - (a.rate === null ? -1 : a.rate); });

    if (!entries.length) return '<p class="muted" style="font-size:13px;margin:0;">No submissions yet.</p>';

    return entries.map(function (e) {
      var c = rateColor(e.rate);
      var w = e.rate === null ? 0 : Math.round(e.rate * 100);
      return '<div class="role-bar-row">' +
        '<span class="role-bar-label">' + esc(e.role) + '</span>' +
        '<div class="role-bar-track"><div class="role-bar-fill" style="width:' + w + '%;background:' + c + ';"></div></div>' +
        '<span class="role-bar-val" style="color:' + c + ';">' + pct(e.rate) + ' (' + e.passes + ' / ' + e.attempts + ')</span>' +
        '</div>';
    }).join('');
  }

  // ── Entry point ────────────────────────────────────────────────────────────
  // `rows` is the dashboard's currently filtered set, both tracks; the Speed subset is
  // taken here so no caller has to remember to do it.
  function render(rows) {
    var host = document.getElementById('dash-speed');
    if (!host) return;

    var sessions = window.HERO_TRACK.speedModules();
    if (!sessions.length) { host.innerHTML = ''; return; }

    var speedRows = window.HERO_TRACK.speed(rows);
    var stats     = sessionStats(speedRows);

    // Whole-track empty state. Shown until the first Speed submission lands, which is
    // the state this ships in — so it names the sessions rather than drawing four
    // empty panels.
    if (!speedRows.length) {
      host.innerHTML =
        '<p class="muted" style="font-size:13px;margin:0 0 12px;">No Speed Training submissions yet. ' +
        'These four sessions will populate as participants complete them.</p>' +
        '<div style="display:flex;flex-direction:column;gap:6px;">' +
        stats.map(function (s) {
          return '<div style="display:flex;justify-content:space-between;gap:10px;font-size:13px;color:var(--gray-muted);' +
            'border:1px solid var(--navy-light);border-radius:8px;padding:9px 12px;background:var(--navy-mid);">' +
            '<span>' + esc(s.label) + '</span>' +
            '<span style="white-space:nowrap;">Awaiting submissions · pass mark ' + s.pass + ' / ' + s.totalQ + '</span>' +
            '</div>';
        }).join('') +
        '</div>';
      return;
    }

    host.innerHTML =
      rollUp(stats, speedRows) +
      sectionHeading('By session') +
      stats.map(sessionCard).join('') +
      sectionHeading('Pass rate by role', 'Speed Training attempts only') +
      byRole(speedRows);
  }

  window.HERO_SPEED_DASH = { render: render, sessionStats: sessionStats };
})();
