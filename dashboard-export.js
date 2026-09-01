'use strict';
/*
 * dashboard-export.js — shared across all module pages.
 * Builds a styled, multi-sheet .xlsx from the dashboard's current filtered view
 * (dashFiltered: date range + module + role filters already applied, then narrowed to
 * the main-programme track) and triggers
 * a download. Depends on vendor/xlsx-js-style.bundle.js (global XLSX) and on the
 * dashboard globals defined by the per-page module script: dashFiltered, dashRows,
 * and DASH_MODULE_REGISTRY (from dashboard-data.js). All output text is English.
 */
(function () {
  // ---- palette (matches the dashboard) ----
  var NAVY = '0F2A43', HEAD = '1F3B57', GREY = 'F1F5F9';
  var PASS_BG = 'D1FAE5', PASS_FG = '047857';
  var FAIL_BG = 'FEE2E2', FAIL_FG = 'B91C1C';
  var AMBER_BG = 'FEF3C7', AMBER_FG = '92400E';
  var BORDER_RGB = 'D0D7DE';

  function border() {
    var s = { style: 'thin', color: { rgb: BORDER_RGB } };
    return { top: s, bottom: s, left: s, right: s };
  }
  function font(o) { o = o || {}; o.name = 'Arial'; return o; }
  function fill(rgb) { return { patternType: 'solid', fgColor: { rgb: rgb } }; }
  var CEN = { horizontal: 'center', vertical: 'center', wrapText: true };
  var LEFT = { horizontal: 'left', vertical: 'center', wrapText: true };

  function cell(v, style, opts) {
    opts = opts || {};
    var t = opts.t || (typeof v === 'number' ? 'n' : 's');
    var c = { v: (v == null ? '' : v), t: t };
    if (style) c.s = style;
    if (opts.z) c.z = opts.z;
    return c;
  }
  var headStyle = { font: font({ bold: true, sz: 11, color: { rgb: 'FFFFFF' } }), fill: fill(HEAD), alignment: CEN, border: border() };
  var titleStyle = { font: font({ bold: true, sz: 16, color: { rgb: NAVY } }) };
  var subStyle = { font: font({ sz: 10, color: { rgb: '475569' } }) };
  var bodyC = { font: font({ sz: 10 }), alignment: CEN, border: border() };
  var bodyL = { font: font({ sz: 10 }), alignment: LEFT, border: border() };

  function headerRow(labels) { return labels.map(function (l) { return cell(l, headStyle); }); }

  function buildSheet(matrix) {
    var ws = {}, maxC = 0;
    for (var r = 0; r < matrix.length; r++) {
      var row = matrix[r] || [];
      if (row.length > maxC) maxC = row.length;
      for (var c = 0; c < row.length; c++) {
        if (row[c] == null) continue;
        ws[XLSX.utils.encode_cell({ r: r, c: c })] = row[c];
      }
    }
    ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: Math.max(0, matrix.length - 1), c: Math.max(0, maxC - 1) } });
    return ws;
  }
  function cols(widths) { return widths.map(function (w) { return { wch: w }; }); }

  // ---- helpers ----
  function two(n) { return (n < 10 ? '0' : '') + n; }
  function dateUTC(ts) { var d = new Date(ts); return isNaN(d) ? '' : d.getUTCFullYear() + '-' + two(d.getUTCMonth() + 1) + '-' + two(d.getUTCDate()); }
  function timeUTC(ts) { var d = new Date(ts); return isNaN(d) ? '' : two(d.getUTCHours()) + ':' + two(d.getUTCMinutes()); }
  // DASH_MODULE_REGISTRY is a top-level `const` in dashboard-data.js (a lexical global,
  // not a window property), so resolve it by bare identifier via the scope chain.
  function REG() {
    try { if (typeof DASH_MODULE_REGISTRY !== 'undefined') return DASH_MODULE_REGISTRY; } catch (e) {}
    return (window.DASH_MODULE_REGISTRY || {});
  }
  function modTotalQ(mod) { var m = REG()[mod]; return m ? m.totalQ : 16; }
  function modTitle(mod) { var m = REG()[mod]; return m ? m.label : mod; }
  function pct(n) { return Math.round((n || 0)); }

  function currentFilterDesc(rows) {
    var g = function (id) { var el = document.getElementById(id); return el ? el.value : ''; };
    var from = g('dash-date-from'), to = g('dash-date-to'), role = g('dash-role-filter');
    var mods = [].slice.call(document.querySelectorAll('.mod-filter-check:checked')).map(function (c) { return c.value; });
    var allMods = [].slice.call(document.querySelectorAll('.mod-filter-check')).map(function (c) { return c.value; });
    var modTxt = (mods.length === allMods.length || mods.length === 0) ? 'All modules' : mods.join(', ');
    // span actually present in the data being exported
    var dates = rows.map(function (r) { return dateUTC(r.timestamp); }).filter(Boolean).sort();
    var span = dates.length ? (dates[0] === dates[dates.length - 1] ? dates[0] : dates[0] + ' to ' + dates[dates.length - 1]) : 'n/a';
    return {
      from: from, to: to, role: role || 'All roles', mods: modTxt, span: span,
      line: 'Filters applied: ' + (from || to ? ('Dates ' + (from || 'start') + ' to ' + (to || 'end')) : 'All dates') +
            '  |  Modules: ' + modTxt + '  |  Role: ' + (role || 'All roles')
    };
  }

  function nowStamp() {
    var d = new Date();
    return d.getUTCFullYear() + '-' + two(d.getUTCMonth() + 1) + '-' + two(d.getUTCDate()) + ' ' + two(d.getUTCHours()) + ':' + two(d.getUTCMinutes()) + ' UTC';
  }

  // ================= sheet builders =================
  function sheetSummary(rows, fd) {
    var total = rows.length;
    var passes = rows.filter(function (r) { return r.status === 'Pass'; }).length;
    var fails = total - passes;
    var avg = total ? Math.round(rows.reduce(function (s, r) { return s + (r.percent || 0); }, 0) / total) : 0;
    var prate = total ? passes / total : 0;

    var m = [];
    m.push([cell('HERO Knowledge Check - Results Report', titleStyle)]);
    m.push([cell(fd.line, subStyle)]);
    m.push([cell('Generated: ' + nowStamp() + '  |  Source: dashboard live data (getData, read-only)  |  ' + total + ' submissions', subStyle)]);
    m.push([]);
    m.push([cell('Global indicators', { font: font({ bold: true, sz: 12, color: { rgb: NAVY } }) })]);
    var kpiLabels = ['Submissions', 'Passed', 'Need retry', 'Avg score', 'Pass rate'];
    m.push(kpiLabels.map(function (l) { return cell(l, { font: font({ bold: true, sz: 9, color: { rgb: 'FFFFFF' } }), fill: fill(NAVY), alignment: CEN, border: border() }); }));
    var kpiVals = [
      cell(total, { font: font({ bold: true, sz: 16, color: { rgb: NAVY } }), fill: fill(GREY), alignment: CEN, border: border() }),
      cell(passes, { font: font({ bold: true, sz: 16, color: { rgb: PASS_FG } }), fill: fill(GREY), alignment: CEN, border: border() }),
      cell(fails, { font: font({ bold: true, sz: 16, color: { rgb: FAIL_FG } }), fill: fill(GREY), alignment: CEN, border: border() }),
      cell(avg, { font: font({ bold: true, sz: 16, color: { rgb: '92400E' } }), fill: fill(GREY), alignment: CEN, border: border() }, { z: '0"%"' }),
      cell(prate, { font: font({ bold: true, sz: 16, color: { rgb: NAVY } }), fill: fill(GREY), alignment: CEN, border: border() }, { z: '0%' })
    ];
    m.push(kpiVals);
    m.push([]);

    // by module
    m.push([cell('By module', { font: font({ bold: true, sz: 12, color: { rgb: NAVY } }) })]);
    m.push(headerRow(['Module', 'Title', 'Submissions', 'Passed', 'Failed', 'Pass rate', 'Avg score']));
    var byMod = {};
    rows.forEach(function (r) { var k = r.module || 'mod1'; (byMod[k] = byMod[k] || []).push(r); });
    Object.keys(byMod).sort().forEach(function (mod) {
      var mr = byMod[mod], n = mr.length, p = mr.filter(function (r) { return r.status === 'Pass'; }).length;
      var a = n ? Math.round(mr.reduce(function (s, r) { return s + (r.percent || 0); }, 0) / n) : 0;
      m.push([
        cell(mod, bodyC), cell(modTitle(mod), bodyL), cell(n, bodyC), cell(p, bodyC), cell(n - p, bodyC),
        cell(n ? p / n : 0, bodyC, { z: '0%' }), cell(a, bodyC, { z: '0"%"' })
      ]);
    });
    m.push([]);

    // by role
    m.push([cell('By role', { font: font({ bold: true, sz: 12, color: { rgb: NAVY } }) })]);
    m.push(headerRow(['Role', 'Submissions', 'Passed', 'Failed', 'Pass rate', 'Avg score']));
    var byRole = {};
    rows.forEach(function (r) { var k = r.role || 'Unknown'; (byRole[k] = byRole[k] || []).push(r); });
    Object.keys(byRole).map(function (role) {
      var rr = byRole[role], n = rr.length, p = rr.filter(function (r) { return r.status === 'Pass'; }).length;
      var a = n ? Math.round(rr.reduce(function (s, r) { return s + (r.percent || 0); }, 0) / n) : 0;
      return { role: role, n: n, p: p, a: a, rate: n ? p / n : 0 };
    }).sort(function (x, y) { return y.rate - x.rate; }).forEach(function (e) {
      m.push([cell(e.role, bodyL), cell(e.n, bodyC), cell(e.p, bodyC), cell(e.n - e.p, bodyC), cell(e.rate, bodyC, { z: '0%' }), cell(e.a, bodyC, { z: '0"%"' })]);
    });

    var ws = buildSheet(m);
    ws['!cols'] = cols([46, 34, 13, 12, 11, 12, 12]);
    return ws;
  }

  function sheetResults(rows) {
    var m = [headerRow(['Date', 'Time (UTC)', 'Name', 'Email', 'Role', 'Module', 'Score', 'Total', '%', 'Attempt', 'Status', 'Failed questions'])];
    rows.forEach(function (r) {
      var mod = r.module || 'mod1';
      var st = r.status || '';
      var stStyle = st === 'Pass'
        ? { font: font({ sz: 10, bold: true, color: { rgb: PASS_FG } }), fill: fill(PASS_BG), alignment: CEN, border: border() }
        : { font: font({ sz: 10, bold: true, color: { rgb: FAIL_FG } }), fill: fill(FAIL_BG), alignment: CEN, border: border() };
      m.push([
        cell(dateUTC(r.timestamp), bodyC), cell(timeUTC(r.timestamp), bodyC),
        cell(r.name || '', bodyL), cell(r.email || '', bodyL), cell(r.role || '', bodyL),
        cell(mod, bodyC), cell(r.score || 0, bodyC), cell(modTotalQ(mod), bodyC),
        cell(pct(r.percent), bodyC, { z: '0"%"' }), cell(r.attempt || 1, bodyC),
        cell(st, stStyle), cell(String(r.failed || ''), bodyL)
      ]);
    });
    var ws = buildSheet(m);
    ws['!cols'] = cols([12, 10, 22, 30, 26, 9, 7, 7, 7, 8, 9, 30]);
    if (rows.length) ws['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rows.length, c: 11 } }) };
    return ws;
  }

  function roleAny(rows) {
    var rm = {};
    rows.forEach(function (r) {
      var role = r.role || 'Unknown';
      rm[role] = rm[role] || { u: {}, p: {} };
      rm[role].u[r.email] = 1;
      if (r.status === 'Pass') rm[role].p[r.email] = 1;
    });
    var out = Object.keys(rm).map(function (role) {
      var n = Object.keys(rm[role].u).length, p = Object.keys(rm[role].p).length;
      return { role: role, p: p, n: n, rate: n ? p / n : 0 };
    }).sort(function (a, b) { return b.rate - a.rate; });
    var au = {}, ap = {};
    rows.forEach(function (r) { au[r.email] = 1; if (r.status === 'Pass') ap[r.email] = 1; });
    var an = Object.keys(au).length, apn = Object.keys(ap).length;
    return [{ role: 'TOTAL', p: apn, n: an, rate: an ? apn / an : 0, total: true }].concat(out);
  }
  function roleFirst(rows) {
    var first = {};
    rows.forEach(function (r) {
      var e = r.email;
      if (!first[e] || String(r.timestamp) < String(first[e].timestamp)) first[e] = r;
    });
    var fa = Object.keys(first).map(function (k) { return first[k]; });
    var rm = {};
    fa.forEach(function (r) { var role = r.role || 'Unknown'; rm[role] = rm[role] || { n: 0, p: 0 }; rm[role].n++; if (r.status === 'Pass') rm[role].p++; });
    var out = Object.keys(rm).map(function (role) { return { role: role, p: rm[role].p, n: rm[role].n, rate: rm[role].n ? rm[role].p / rm[role].n : 0 }; })
      .sort(function (a, b) { return b.rate - a.rate; });
    var tp = fa.filter(function (r) { return r.status === 'Pass'; }).length;
    return [{ role: 'TOTAL', p: tp, n: fa.length, rate: fa.length ? tp / fa.length : 0, total: true }].concat(out);
  }
  function sheetRoles(rows) {
    var m = [];
    m.push([cell('Pass rate by role', { font: font({ bold: true, sz: 14, color: { rgb: NAVY } }) })]);
    m.push([cell('Any attempt = per unique person (email), passes if they have at least one Pass. First attempt = each person\'s earliest submission in range.', subStyle)]);
    m.push([]);
    function tbl(title, data) {
      m.push([cell(title, { font: font({ bold: true, sz: 12, color: { rgb: NAVY } }) })]);
      m.push(headerRow(['Role', 'Passed', 'Total', 'Pass rate']));
      data.forEach(function (e) {
        var b = e.total ? { font: font({ sz: 10, bold: true }), fill: fill(GREY), border: border(), alignment: CEN } : bodyC;
        var bl = e.total ? { font: font({ sz: 10, bold: true }), fill: fill(GREY), border: border(), alignment: LEFT } : bodyL;
        m.push([cell(e.role, bl), cell(e.p, b), cell(e.n, b), cell(e.rate, b, { z: '0%' })]);
      });
      m.push([]);
    }
    tbl('Any attempt (per unique person)', roleAny(rows));
    tbl('First attempt only', roleFirst(rows));
    var ws = buildSheet(m);
    ws['!cols'] = cols([34, 12, 12, 12]);
    return ws;
  }

  function sheetAttempts(rows) {
    var byEmail = {};
    rows.forEach(function (r) { (byEmail[r.email] = byEmail[r.email] || []).push(r); });
    var passers = [], notYet = 0;
    Object.keys(byEmail).forEach(function (e) {
      var atts = byEmail[e].slice().sort(function (a, b) { return String(a.timestamp) < String(b.timestamp) ? -1 : 1; });
      var idx = -1;
      for (var i = 0; i < atts.length; i++) { if (atts[i].status === 'Pass') { idx = i; break; } }
      if (idx === -1) notYet++; else passers.push(idx + 1);
    });
    var tp = passers.length || 1;
    var buckets = [['1 attempt', function (n) { return n === 1; }], ['2 attempts', function (n) { return n === 2; }],
      ['3 attempts', function (n) { return n === 3; }], ['4+ attempts', function (n) { return n >= 4; }]];
    var m = [];
    m.push([cell('Attempts required to pass', { font: font({ bold: true, sz: 14, color: { rgb: NAVY } }) })]);
    m.push([cell('Per person (email), submissions ordered by date; which attempt reached the first Pass. Computed over the filtered submissions.', subStyle)]);
    m.push([]);
    m.push(headerRow(['Attempts', 'People', '% of those who passed']));
    buckets.forEach(function (b) {
      var cnt = passers.filter(b[1]).length;
      m.push([cell(b[0], bodyL), cell(cnt, bodyC), cell(cnt / tp, bodyC, { z: '0%' })]);
    });
    m.push([]);
    m.push([cell('People who attempted without passing yet: ' + notYet, { font: font({ bold: true, sz: 10, color: { rgb: FAIL_FG } }) })]);
    m.push([cell('Unique people who passed: ' + passers.length, { font: font({ sz: 10, color: { rgb: PASS_FG } }) })]);
    var ws = buildSheet(m);
    ws['!cols'] = cols([16, 12, 24]);
    return ws;
  }

  function sheetDifficulty(rows) {
    var reg = REG();
    var m = [];
    m.push([cell('Question difficulty (% who failed it)', { font: font({ bold: true, sz: 14, color: { rgb: NAVY } }) })]);
    m.push([cell('Mirrors the dashboard heatmap: % of the module\'s submissions that flagged each question as failed. Red >=50%, amber 25-49%, green <25%.', subStyle)]);
    m.push([]);
    m.push(headerRow(['Module', 'Question', 'Correct', 'Text', 'Fails', 'Module submissions', '% failed']));
    var mods = {};
    rows.forEach(function (r) { var k = r.module || 'mod1'; (mods[k] = mods[k] || []).push(r); });
    Object.keys(mods).sort().forEach(function (mod) {
      var minfo = reg[mod]; if (!minfo) return;
      var mr = mods[mod], tot = mr.length || 1;
      var failC = {};
      mr.forEach(function (r) {
        String(r.failed || '').split(',').forEach(function (s) { var n = parseInt(s, 10); if (n >= 1 && n <= minfo.totalQ) failC[n] = (failC[n] || 0) + 1; });
      });
      for (var qn = 1; qn <= minfo.totalQ; qn++) {
        var q = (minfo.questions || []).filter(function (x) { return x.id === qn; })[0] || {};
        var cnt = failC[qn] || 0, p = cnt / tot;
        var pStyle = p >= 0.5 ? { font: font({ sz: 10, bold: true, color: { rgb: FAIL_FG } }), fill: fill(FAIL_BG), alignment: CEN, border: border() }
          : p >= 0.25 ? { font: font({ sz: 10, bold: true, color: { rgb: AMBER_FG } }), fill: fill(AMBER_BG), alignment: CEN, border: border() }
          : { font: font({ sz: 10, bold: true, color: { rgb: PASS_FG } }), fill: fill(PASS_BG), alignment: CEN, border: border() };
        m.push([cell(mod, bodyC), cell('Q' + qn, bodyC), cell((minfo.answerKey || {})['Q' + qn] || '', bodyC),
          cell(q.text || '', bodyL), cell(cnt, bodyC), cell(mr.length, bodyC), cell(p, pStyle, { z: '0%' })]);
      }
    });
    var ws = buildSheet(m);
    ws['!cols'] = cols([9, 10, 9, 90, 8, 18, 9]);
    return ws;
  }

  function sheetDistractors(rows) {
    var reg = REG();
    var m = [];
    m.push([cell('Distractor analysis (option chosen per question)', { font: font({ bold: true, sz: 14, color: { rgb: NAVY } }) })]);
    m.push([cell('Distribution of the answer chosen for each question, among submissions that recorded an answer. The correct option is shaded green; the most chosen wrong option is shaded red.', subStyle)]);
    m.push([]);
    m.push(headerRow(['Module', 'Question', 'Correct', 'Answered', 'A', 'B', 'C', 'D', 'Top wrong pick', 'Text']));
    var mods = {};
    rows.forEach(function (r) { var k = r.module || 'mod1'; (mods[k] = mods[k] || []).push(r); });
    var LETTERS = ['A', 'B', 'C', 'D'];
    Object.keys(mods).sort().forEach(function (mod) {
      var minfo = reg[mod]; if (!minfo) return;
      var mr = mods[mod];
      for (var qn = 1; qn <= minfo.totalQ; qn++) {
        var correct = (minfo.answerKey || {})['Q' + qn] || '';
        var picks = { A: 0, B: 0, C: 0, D: 0 }, answered = 0;
        mr.forEach(function (r) {
          if (!r.answers) return;
          var g = (r.answers['Q' + qn] || '').toUpperCase();
          if (picks.hasOwnProperty(g)) { picks[g]++; answered++; }
        });
        var q = (minfo.questions || []).filter(function (x) { return x.id === qn; })[0] || {};
        // top wrong
        var topWrong = '', topWrongN = -1;
        LETTERS.forEach(function (L) { if (L !== correct && picks[L] > topWrongN) { topWrongN = picks[L]; topWrong = L; } });
        var rowCells = [cell(mod, bodyC), cell('Q' + qn, bodyC), cell(correct, bodyC), cell(answered, bodyC)];
        LETTERS.forEach(function (L) {
          var frac = answered ? picks[L] / answered : 0;
          var st;
          if (L === correct) st = { font: font({ sz: 10, bold: true, color: { rgb: PASS_FG } }), fill: fill(PASS_BG), alignment: CEN, border: border() };
          else if (L === topWrong && topWrongN > 0) st = { font: font({ sz: 10, bold: true, color: { rgb: FAIL_FG } }), fill: fill(FAIL_BG), alignment: CEN, border: border() };
          else st = bodyC;
          rowCells.push(cell(frac, st, { z: '0%' }));
        });
        rowCells.push(cell(answered ? topWrong : '', bodyC));
        rowCells.push(cell(q.text || '', bodyL));
        m.push(rowCells);
      }
    });
    var ws = buildSheet(m);
    ws['!cols'] = cols([9, 10, 9, 10, 7, 7, 7, 7, 12, 80]);
    return ws;
  }

  // ================= entry point =================
  function exportDashboardToExcel() {
    if (typeof XLSX === 'undefined') { alert('Excel library not loaded.'); return; }
    var rows = (typeof dashFiltered !== 'undefined' && dashFiltered && dashFiltered.length) ? dashFiltered
             : (typeof dashRows !== 'undefined' && dashRows) ? dashRows : [];
    // Main programme only, matching the on-screen panels. Speed Training is reported
    // as aggregates in its own dashboard section and is deliberately not exported per
    // participant, so this workbook keeps the same meaning it had before that track
    // existed.
    if (window.HERO_TRACK) rows = HERO_TRACK.main(rows);
    if (!rows.length) { alert('No submissions in the current view. Load the dashboard and adjust the filters first.'); return; }
    var fd = currentFilterDesc(rows);

    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheetSummary(rows, fd), 'Summary');
    XLSX.utils.book_append_sheet(wb, sheetResults(rows), 'Results');
    XLSX.utils.book_append_sheet(wb, sheetRoles(rows), 'Pass rate by role');
    XLSX.utils.book_append_sheet(wb, sheetAttempts(rows), 'Attempts to pass');
    XLSX.utils.book_append_sheet(wb, sheetDifficulty(rows), 'Question difficulty');
    XLSX.utils.book_append_sheet(wb, sheetDistractors(rows), 'Distractor analysis');

    // filename from filters
    var g = function (id) { var el = document.getElementById(id); return el ? el.value : ''; };
    var from = g('dash-date-from'), to = g('dash-date-to'), role = g('dash-role-filter');
    var parts = ['HERO_KC_Results'];
    if (from || to) parts.push((from || 'start') + '_to_' + (to || 'end'));
    else parts.push(fd.span.replace(/ to /g, '_to_').replace(/[^0-9A-Za-z_-]/g, ''));
    var mods = [].slice.call(document.querySelectorAll('.mod-filter-check:checked')).map(function (c) { return c.value; });
    var allMods = [].slice.call(document.querySelectorAll('.mod-filter-check')).map(function (c) { return c.value; });
    if (mods.length && mods.length !== allMods.length) parts.push(mods.join('-'));
    if (role) parts.push(role.replace(/[^0-9A-Za-z]+/g, ''));
    var fname = parts.join('_').replace(/_+/g, '_') + '.xlsx';

    var btn = document.getElementById('btn-dash-export');
    var prev = btn ? btn.textContent : '';
    if (btn) { btn.textContent = 'Building...'; btn.disabled = true; }
    try {
      XLSX.writeFile(wb, fname);
    } finally {
      if (btn) { setTimeout(function () { btn.textContent = prev || '↓ Export to Excel'; btn.disabled = false; }, 600); }
    }
  }

  window.exportDashboardToExcel = exportDashboardToExcel;
  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('btn-dash-export');
    if (btn) btn.addEventListener('click', exportDashboardToExcel);
  });
})();
