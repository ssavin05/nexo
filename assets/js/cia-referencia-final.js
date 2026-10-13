/* CIA · capa final de presentación del dashboard (referencia azul/dorado).
   Se ejecuta después de cada renderApp() y ajusta menú, barra superior,
   encabezado, tarjetas, gráfica y centro operativo sin tocar la lógica. */
(function () {
  'use strict';

  var I = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20h5v-6h4v6h5V9.5"/>',
    cart: '<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2.5 3.5h3l2.4 11.2h10.4l2-8H6.3"/>',
    box: '<path d="M12 2.8 20.5 7.4v9.2L12 21.2 3.5 16.6V7.4z"/><path d="M3.8 7.6 12 12l8.2-4.4M12 12v9"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4.5 20.5c.8-4 3.8-6 7.5-6s6.7 2 7.5 6"/>',
    coins: '<ellipse cx="9.5" cy="6" rx="6" ry="2.6"/><path d="M3.5 6v5c0 1.4 2.7 2.6 6 2.6s6-1.2 6-2.6V6"/><path d="M3.5 11v5c0 1.4 2.7 2.6 6 2.6 1 0 1.9-.1 2.8-.3"/><path d="M15.5 9.5c3 0 5.5 1 5.5 2.4v5c0 1.4-2.5 2.6-5.5 2.6s-5.5-1.200-5.5-2.600v-5c0-1.400 2.500-2.400 5.500-2.400z"/>',
    doc: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
    chart: '<path d="M3 3v18h18"/><path d="M7 16v-5M12 16V7M17 16v-8"/>',
    spark: '<path d="M12 3c.6 4.6 2.400 6.400 7 7-4.600.6-6.400 2.400-7 7-.6-4.600-2.400-6.400-7-7 4.600-.6 6.400-2.400 7-7z"/><path d="M19 15.500c.3 1.800 1 2.500 2.800 2.800-1.800.3-2.500 1-2.800 2.800-.3-1.800-1-2.500-2.800-2.800 1.800-.3 2.500-1 2.800-2.800z"/>',
    gear: '<circle cx="12" cy="12" r="3.200"/><path d="M19.400 13.500a1.600 1.600 0 0 0 .3 1.800l.1.1a2 2 0 1 1-2.800 2.800l-.1-.1a1.600 1.600 0 0 0-1.800-.3 1.600 1.600 0 0 0-1 1.500V19.500a2 2 0 1 1-4 0v-.1a1.600 1.600 0 0 0-1-1.500 1.600 1.600 0 0 0-1.800.3l-.1.100a2 2 0 1 1-2.800-2.800l.1-.1a1.600 1.600 0 0 0 .3-1.800 1.600 1.600 0 0 0-1.500-1H3.500a2 2 0 1 1 0-4h.1a1.600 1.600 0 0 0 1.500-1 1.600 1.600 0 0 0-.3-1.800l-.1-.1a2 2 0 1 1 2.800-2.800l.1.100a1.600 1.600 0 0 0 1.800.3h0a1.600 1.600 0 0 0 1-1.500V3.500a2 2 0 1 1 4 0v.1a1.600 1.600 0 0 0 1 1.500h0a1.600 1.600 0 0 0 1.800-.3l.1-.1a2 2 0 1 1 2.800 2.800l-.1.100a1.600 1.600 0 0 0-.3 1.800v0a1.600 1.600 0 0 0 1.500 1h.1a2 2 0 1 1 0 4h-.1a1.600 1.600 0 0 0-1.500 1z"/>',
    search: '<circle cx="11" cy="11" r="6.500"/><path d="m20 20-4.300-4.300"/>',
    moon: '<path d="M20 14.500A8.500 8.500 0 0 1 9.500 4 8.500 8.500 0 1 0 20 14.500z"/>',
    bell: '<path d="M6 17V11a6 6 0 1 1 12 0v6l1.500 2h-15z"/><path d="M10 21h4"/>',
    chev: '<path d="m6 9 6 6 6-6"/>',
    right: '<path d="m9 5 7 7-7 7"/>',
    logout: '<path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4"/><path d="M10 8l-4 4 4 4M6 12h10"/>',
    cal: '<rect x="3.500" y="5" width="17" height="15.500" rx="2.500"/><path d="M3.500 10h17M8 3v4M16 3v4"/>',
    trend: '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
    diamond: '<path d="M12 3l9 9-9 9-9-9z" fill="currentColor"/>',
    alert: '<circle cx="12" cy="12" r="9" fill="currentColor" stroke="none"/><path d="M12 7.500v5.500M12 16.300v.2" stroke="#fff" stroke-width="2.200"/>',
    card: '<rect x="3" y="5" width="18" height="14" rx="2.500"/><path d="M3 10h18M7 15h4"/>'
  };
  function svg(name, cls) {
    return '<svg class="ci ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + I[name] + '</svg>';
  }

  /* menú de la referencia: [ruta, etiqueta, icono] */
  var MENU = [
    ['dashboard', 'Inicio', 'home'], ['sales', 'Ventas', 'cart'], ['inventory', 'Inventario', 'box'],
    ['customers', 'Clientes', 'user'], ['finance', 'Finanzas', 'coins'], ['purchases', 'Compras', 'doc'],
    ['reports', 'Reportes', 'chart'], ['ai', 'IA de CIA', 'spark']
  ];
  var MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

  function q(s, r) { return (r || document).querySelector(s); }
  function qa(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function sidebar() {
    var sb = q('.shell .sidebar'); if (!sb) return;
    var nav = q('nav', sb); if (!nav || nav.dataset.ref === '1') return;
    var route = (typeof ui !== 'undefined' && ui.route) || 'dashboard';
    var html = MENU.map(function (m) {
      return '<button class="nav-item' + (route === m[0] ? ' active' : '') + '" onclick="go(\'' + m[0] + '\')" type="button">' + svg(m[2], 'nav-ic') + '<span>' + m[1] + '</span></button>';
    }).join('');
    html += '<div class="nav-sep"></div><button class="nav-item' + (route === 'settings' ? ' active' : '') + '" onclick="go(\'settings\')" type="button">' + svg('gear', 'nav-ic') + '<span>Configuración</span></button>';
    nav.innerHTML = html; nav.dataset.ref = '1';

    var bt = q('.side-brand .brandtext', sb);
    if (bt && !q('.brand-sub', sb)) {
      var wrap = document.createElement('span'); wrap.className = 'brand-words';
      bt.parentNode.insertBefore(wrap, bt); wrap.appendChild(bt);
      wrap.insertAdjacentHTML('beforeend', '<small class="brand-sub">Centro de Inteligencia Artificial</small>');
    }
    var cs = q('.company-switch small', sb); if (cs) cs.textContent = 'Plus';
    var csx = q('.company-switch > span', sb); if (csx) csx.innerHTML = svg('chev');
    var col = q('.collapse', sb); if (col) col.textContent = '‹';
    var lo = q('.side-user button', sb); if (lo) lo.innerHTML = svg('logout');
  }

  function topbar() {
    var bar = q('.shell .appbar'); if (!bar || bar.dataset.ref === '1') return;
    bar.dataset.ref = '1';
    var s = q('.search', bar);
    if (s) s.innerHTML = svg('search', 'se-ic') + '<span>Buscar en CIA...</span><kbd>Ctrl + K</kbd>';
    var th = q('.theme-header-btn', bar); if (th) th.innerHTML = svg('moon');
    var bell = q('.icon-btn.dot', bar); if (bell) bell.innerHTML = svg('bell');
    var acts = q('.app-actions', bar);
    var sel = q('select', bar);
    if (sel && !sel.parentNode.classList.contains('sel-wrap')) {
      var w = document.createElement('span'); w.className = 'sel-wrap';
      sel.parentNode.insertBefore(w, sel); w.appendChild(sel); w.insertAdjacentHTML('beforeend', svg('chev', 'sel-ic'));
    }
    if (acts && !q('.me-chip', acts)) {
      var name = (q('.side-user strong') || {}).textContent || 'MT';
      var ini = ((q('.side-user .avatar') || {}).textContent || name.split(' ').map(function (x) { return x[0]; }).join('').slice(0, 2)).trim();
      var b = document.createElement('button'); b.type = 'button'; b.className = 'me-chip'; b.title = name;
      b.innerHTML = '<span>' + esc(ini) + '</span>' + svg('chev', 'me-ic');
      b.onclick = function () { if (window.go) go('settings'); };
      acts.appendChild(b);
    }
  }

  function periodLabel(p) {
    var d = new Date(), t = d.getDate() + ' ' + MESES[d.getMonth()] + ' ' + d.getFullYear();
    if (p === 'Semana') { var a = new Date(d.getTime() - 6 * 864e5); return 'Semana · ' + a.getDate() + ' ' + MESES[a.getMonth()] + ' – ' + d.getDate() + ' ' + MESES[d.getMonth()]; }
    if (p === 'Mes') return 'Mes · ' + MESES[d.getMonth()] + ' ' + d.getFullYear();
    if (p === 'Año') return 'Año · ' + d.getFullYear();
    return 'Hoy · ' + t;
  }

  function header() {
    var head = q('.shell .page-head'); if (!head || head.dataset.ref === '1') return;
    head.dataset.ref = '1';
    var h1 = q('h1', head);
    if (h1 && h1.textContent.trim() === 'Resumen ejecutivo' && !q('.eyebrow', head)) {
      h1.insertAdjacentHTML('beforebegin', '<div class="eyebrow">Bienvenido de nuevo</div>');
    }
    var per = q('.periods', head);
    if (per) {
      var cur = (typeof ui !== 'undefined' && ui.period) || 'Hoy';
      var pill = document.createElement('label'); pill.className = 'date-pill';
      pill.innerHTML = svg('cal', 'dp-ic') + '<span>' + esc(periodLabel(cur)).replace('·', '<i>·</i>') + '</span>' + svg('chev', 'dp-ic2') +
        '<select aria-label="Periodo">' + ['Hoy', 'Semana', 'Mes', 'Año'].map(function (p) { return '<option' + (p === cur ? ' selected' : '') + '>' + p + '</option>'; }).join('') + '</select>';
      q('select', pill).onchange = function () { ui.period = this.value; renderApp(); };
      per.parentNode.replaceChild(pill, per);
    }
  }

  function kpis() {
    var icons = { 'Ingresos': 'trend', 'Utilidad': 'coins', 'Gastos': 'doc', 'Por cobrar': 'cart', 'Por pagar': 'card', 'Inventario': 'box' };
    qa('.shell .kpi-grid .kpi').forEach(function (k) {
      if (k.dataset.ref === '1') return;
      var lab = (q('small', k) || {}).textContent || '', val = (q('strong', k) || {}).textContent || '', cap = (q('span', k) || {}).textContent || '';
      var m = /^([^\d\s]*)\s*(.*)$/.exec(val.trim());
      var cur = m ? m[1] : '', num = m ? m[2] : val;
      var capHtml = esc(cap);
      var g = /^(↑\s*[\d.,]+%)(.*)$/.exec(cap);
      if (g) capHtml = '<b class="up">' + esc(g[1]) + '</b>' + esc(g[2]);
      k.dataset.ref = '1';
      k.innerHTML = '<div class="kpi-top"><span class="kpi-ic">' + svg(icons[lab.trim()] || 'doc') + '</span><small>' + esc(lab) + '</small></div>' +
        '<strong>' + (cur ? '<sup>' + esc(cur) + '</sup>' : '') + esc(num) + '</strong><span class="kpi-cap">' + capHtml + '</span>';
    });
  }

  function banner() {
    var b = q('.shell .ai-dashboard-card'); if (!b || b.dataset.ref === '1') return;
    b.dataset.ref = '1';
    var ic = q('.ai-dashboard-icon', b); if (ic) ic.innerHTML = svg('spark');
    var btn = q(':scope > button.btn', b) || q('button.btn.primary', b);
    if (btn) btn.innerHTML = svg('spark', 'bt-ic') + '<span>' + btn.textContent.trim() + '</span>' + svg('right', 'bt-ic2');
  }

  function niceStep(v) { var e = Math.pow(10, Math.floor(Math.log(v) / Math.LN10)), f = v / e; var m = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10; return m * e; }

  function drawChart() {
    var el = document.getElementById('lineChart'); if (!el || !window.data) return;
    var vals = (data().trend || []).slice(); if (!vals.length) return;
    var W = el.clientWidth || 800, H = el.clientHeight || 260;
    var L = 52, R = 14, T = 12, B = 26, pw = W - L - R, ph = H - T - B;
    var n = vals.length, step = niceStep(Math.max(Math.max.apply(null, vals), 1) / 5), max = step * 5, d = new Date();
    var X = function (i) { return L + (n === 1 ? pw / 2 : i / (n - 1) * pw); };
    var Y = function (v) { return T + ph - (v / max) * ph; };
    var grid = '', i;
    for (i = 0; i <= 5; i++) {
      var yy = Y(i * step), lbl = i === 0 ? '$0' : '$' + (Math.round(i * step * 10) / 10) + 'k';
      grid += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + yy + '" y2="' + yy + '" class="gl"/><text x="' + (L - 10) + '" y="' + (yy + 4) + '" text-anchor="end" class="yl">' + lbl + '</text>';
    }
    var pts = vals.map(function (v, k) { return [X(k), Y(v)]; });
    var path = pts.map(function (p, k) {
      if (!k) return 'M' + p[0] + ',' + p[1];
      var a = pts[k - 1], cx = (a[0] + p[0]) / 2;
      return 'C' + cx + ',' + a[1] + ' ' + cx + ',' + p[1] + ' ' + p[0] + ',' + p[1];
    }).join(' ');
    var area = path + ' L' + pts[n - 1][0] + ',' + Y(0) + ' L' + pts[0][0] + ',' + Y(0) + ' Z';
    var xl = '', dots = '';
    pts.forEach(function (p, k) {
      var day = new Date(d.getTime() - (n - 1 - k) * 864e5);
      xl += '<text x="' + p[0] + '" y="' + (H - 6) + '" text-anchor="middle" class="xl">' + day.getDate() + ' ' + MESES[day.getMonth()] + '</text>';
      dots += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="4.2" class="dt"><title>$' + vals[k] + 'k</title></circle>';
    });
    el.classList.add('ref-chart');
    el.innerHTML = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '"><defs><linearGradient id="refg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f7bff" stop-opacity=".28"/><stop offset="1" stop-color="#2f7bff" stop-opacity="0"/></linearGradient></defs>' +
      grid + '<path d="' + area + '" fill="url(#refg)"/><path d="' + path + '" class="ln" pathLength="1"/>' + dots + xl + '</svg>';
    el.dataset.w = W;
    var tip = document.createElement('div'); tip.className = 'ch-tip'; el.appendChild(tip);
    var guide = el.querySelector('svg').appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'line'));
    guide.setAttribute('class', 'ch-guide'); guide.setAttribute('y1', T); guide.setAttribute('y2', T + ph);
    var dts = el.querySelectorAll('.dt');
    el.onmousemove = function (e) {
      var r = el.getBoundingClientRect(), sc = r.width / W, x = (e.clientX - r.left) / sc, k = Math.max(0, Math.min(n - 1, Math.round((x - L) / (pw / (n - 1 || 1)))));
      var day = new Date(d.getTime() - (n - 1 - k) * 864e5);
      guide.setAttribute('x1', pts[k][0]); guide.setAttribute('x2', pts[k][0]); guide.style.opacity = 1;
      dts.forEach(function (c, j) { c.classList.toggle('on', j === k); });
      tip.innerHTML = '<span>' + day.getDate() + ' ' + MESES[day.getMonth()] + '</span><b>$' + Math.round(vals[k] * 1000).toLocaleString('en-US') + '</b>';
      tip.style.opacity = 1; tip.style.left = Math.min(Math.max(pts[k][0] * sc, 60), r.width - 60) + 'px'; tip.style.top = (pts[k][1] * sc - 14) + 'px';
    };
    el.onmouseleave = function () { tip.style.opacity = 0; guide.style.opacity = 0; dts.forEach(function (c) { c.classList.remove('on'); }); };
  }

  function operativo() {
    var card = q('.shell .attention'); if (!card || card.dataset.ref === '1') return;
    var btns = qa(':scope > button', card); if (btns.length < 4) return;
    card.dataset.ref = '1';
    var txt = function (b, s) { return (q(s, b) || {}).textContent || ''; };
    var aut = btns[0], inv = btns[1], cob = btns[3];
    var nCob = parseInt(txt(cob, 'strong'), 10) || 0;
    var row = function (route, cls, icon, title, sub) {
      return '<button onclick="go(\'' + route + '\')" type="button"><span class="attention-icon ' + cls + '">' + svg(icon) + '</span><div><strong>' + title + '</strong><small>' + sub + '</small></div>' + svg('right', 'row-ic') + '</button>';
    };
    var head = q('.card-head', card).outerHTML;
    var n1 = txt(aut, 'strong'), n2 = txt(inv, 'strong');
    card.innerHTML = head +
      row('approvals', 'warning', 'diamond', n1, 'Esperan una decisión') +
      row('inventory', 'info', 'alert', n2, 'Productos con stock bajo') +
      row('receivables', 'purple', 'card', nCob + (nCob === 1 ? ' factura pendiente' : ' facturas pendientes'), 'Por cobrar');
  }


  /* ---------- Escala automática: el diseño de referencia (1846px) se ajusta al ancho real ---------- */
  function fit() {
    var w = window.innerWidth, z = w >= 1000 ? Math.min(1, Math.max(.6, w / 1846)) : 1;
    document.documentElement.style.setProperty('--z', z.toFixed(3));
  }

  /* ---------- Fondo animado: ondas doradas que fluyen ---------- */
  function wavePath(tpl, vals) { return tpl.replace(/\{(\d+)\}/g, function (_, i) { return vals[+i]; }); }
  function waveSet(tpl, frames, dur, off) {
    var a = frames.concat([frames[0]]).map(function (f) { return wavePath(tpl, f); });
    return '<animate attributeName="d" dur="' + dur + 's" begin="-' + off + 's" repeatCount="indefinite" calcMode="spline" keySplines="' +
      a.slice(1).map(function () { return '.45 0 .55 1'; }).join(';') + '" keyTimes="' + a.map(function (_, i) { return (i / (a.length - 1)).toFixed(3); }).join(';') +
      '" values="' + a.join(';') + '"/>';
  }
  function mainWaves() {
    var T = 'M520,-20 C{0},{1} {2},{3} 1180,{4} S1420,{5} 1520,{6}';
    var F = [
      [760, 40, 900, 150, 120, 20, 40], [740, 90, 930, 80, 170, 80, 10], [780, 10, 880, 190, 90, 40, 70]
    ];
    var shift = function (d) { return F.map(function (f) { return f.map(function (v, i) { return i === 0 || i === 2 ? v + d * 6 : v + d; }); }); };
    var out = '';
    [[46, 'w', 0, 0], [22, 'w', 1.5, 3]].forEach(function (c, k) { out += '<path fill="none" stroke="url(#mw)" stroke-width="' + c[0] + '" d="' + wavePath(T, shift(c[2])[0]) + '">' + waveSet(T, shift(c[2]), 16, c[3]) + '</path>'; });
    [[2.4, 20, 1], [1.5, 28, 2], [1.1, 36, 3], [.9, 44, 4], [.8, 52, 5]].forEach(function (c, k) {
      out += '<path fill="none" stroke="url(#mg)" stroke-width="' + c[0] + '" d="' + wavePath(T, shift(c[1] / 4)[0]) + '">' + waveSet(T, shift(c[1] / 4), 14 + k * 1.5, k * 2.3) + '</path>';
    });
    return '<svg class="bgw-svg" viewBox="0 0 1500 520" preserveAspectRatio="xMaxYMin slice" aria-hidden="true"><defs>' +
      '<linearGradient id="mg" x1="0" x2="1"><stop offset="0" stop-color="#d9b45f" stop-opacity="0"/><stop offset=".45" stop-color="#e3c273" stop-opacity=".9"/><stop offset="1" stop-color="#c8a04a" stop-opacity=".25"/></linearGradient>' +
      '<linearGradient id="mw" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity=".2"/></linearGradient>' +
      '<radialGradient id="mb"><stop offset="0" stop-color="#8db6ff" stop-opacity=".45"/><stop offset="1" stop-color="#8db6ff" stop-opacity="0"/></radialGradient></defs>' +
      '<ellipse cx="1250" cy="200" rx="360" ry="150" fill="url(#mb)"><animate attributeName="cx" values="1250;1050;1250" dur="18s" repeatCount="indefinite"/><animate attributeName="cy" values="200;120;200" dur="18s" repeatCount="indefinite"/></ellipse>' +
      out + '</svg>';
  }
  function sideWaves() {
    var T = 'M-20,{0} C90,{1} 180,{2} 380,{3}';
    var base = [[640, 560, 470, 380], [600, 540, 500, 340], [680, 590, 440, 420]];
    var out = '';
    [[3, 0, 0], [1.6, 20, 2], [1.2, -40, 4], [1, 50, 6], [.8, -65, 8], [.8, 70, 10]].forEach(function (c, k) {
      var fr = base.map(function (b) { return b.map(function (v) { return v + c[1]; }); });
      out += '<path fill="none" stroke="url(#sg)" stroke-width="' + c[0] + '" d="' + wavePath(T, fr[0]) + '">' + waveSet(T, fr, 12 + k, c[2]) + '</path>';
    });
    return '<svg class="bgw-svg" viewBox="0 0 365 852" preserveAspectRatio="none" aria-hidden="true"><defs>' +
      '<linearGradient id="sg" x1="0" x2="1"><stop offset="0" stop-color="#f0c969" stop-opacity="0"/><stop offset=".5" stop-color="#f0c969" stop-opacity=".05"/><stop offset=".82" stop-color="#f3d27f" stop-opacity=".75"/><stop offset="1" stop-color="#c8a04a" stop-opacity=".12"/></linearGradient>' +
      '<radialGradient id="sb"><stop offset="0" stop-color="#f3d27f" stop-opacity=".28"/><stop offset="1" stop-color="#f3d27f" stop-opacity="0"/></radialGradient></defs>' +
      '<ellipse cx="290" cy="430" rx="190" ry="80" fill="url(#sb)"><animate attributeName="cx" values="290;230;290" dur="10s" repeatCount="indefinite"/><animate attributeName="cy" values="430;380;430" dur="10s" repeatCount="indefinite"/><animate attributeName="opacity" values=".5;1;.5" dur="7s" repeatCount="indefinite"/></ellipse>' +
      out + '</svg>';
  }
  function ambient() {
    var m = q('.shell .main'), sb = q('.shell .sidebar');
    if (m && !q('.bg-waves', m)) { var a = document.createElement('div'); a.className = 'bg-waves'; a.innerHTML = mainWaves(); m.insertBefore(a, m.firstChild); }
    if (sb && !q('.side-waves', sb)) { var b = document.createElement('div'); b.className = 'side-waves'; b.innerHTML = sideWaves(); sb.insertBefore(b, sb.firstChild); }
  }

  function refine() {
    try {
      var has = typeof ui !== 'undefined';
      if (has && !window.__ciaPeriodInit) { window.__ciaPeriodInit = 1; ui.period = 'Hoy'; }
      fit(); ambient(); sidebar(); topbar(); header();
      if (has && ui.route === 'dashboard') { kpis(); banner(); operativo(); drawChart(); }
    } catch (e) { if (window.console) console.warn('cia-referencia-final', e); }
  }

  var prev = window.renderApp;
  if (typeof prev === 'function') {
    window.renderApp = function () { var r = prev.apply(this, arguments); refine(); return r; };
    try { renderApp = window.renderApp; } catch (e) { /* ya asignado a window */ }
  }
  var rt; window.addEventListener('resize', function () { fit(); clearTimeout(rt); rt = setTimeout(function () { var el = document.getElementById('lineChart'); if (el && Math.abs((el.clientWidth || 0) - Number(el.dataset.w || 0)) > 4) drawChart(); }, 120); });
  window.CIAI = { svg: svg, I: I, MENU: MENU };
  refine();
})();
