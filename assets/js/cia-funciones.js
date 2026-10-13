/* CIA · funciones extra (capa final).
   Buscador de comandos, atajos, menú de usuario, menú colapsable con "Más módulos",
   tarjetas interactivas, acciones rápidas, dona por categoría, exportar, animaciones. */
(function () {
  'use strict';
  var C = window.CIAI; if (!C) return;
  var svg = C.svg, I = C.I;
  I.sun = '<circle cx="12" cy="12" r="4"/><path d="M12 2.500v2.500M12 19v2.500M2.500 12H5M19 12h2.500M5.200 5.200l1.800 1.800M17 17l1.800 1.800M18.800 5.200 17 7M7 17l-1.800 1.800"/>';
  I.plus = '<path d="M12 5v14M5 12h14"/>';
  I.download = '<path d="M12 4v11M7.500 10.500 12 15l4.500-4.500M5 19.500h14"/>';
  I.keyboard = '<rect x="2.500" y="6" width="19" height="12" rx="2.500"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>';
  I.send = '<path d="M21 3 10 14M21 3l-7 18-4-7-7-4z"/>';
  I.user2 = '<circle cx="12" cy="8" r="4"/><path d="M4.500 20.500c.8-4 3.800-6 7.500-6s6.700 2 7.500 6"/>';
  I.dot = '<circle cx="12" cy="12" r="2.500" fill="currentColor"/>';
  I.cmd = '<path d="M9 6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3z"/>';

  function q(s, r) { return (r || document).querySelector(s); }
  function qa(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function norm(s) { return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function route() { return (typeof ui !== 'undefined' && ui.route) || 'dashboard'; }
  function allowed(r) { try { return typeof can === 'function' ? can(r) : true; } catch (e) { return true; } }

  /* ---------- grupos del menú ---------- */
  var GROUP = {
    dashboard: ['dashboard', 'approvals', 'tasks', 'audit'], sales: ['sales', 'quotes', 'orders', 'products'],
    inventory: ['inventory', 'warehouses', 'transfers', 'stockmoves', 'returns'], customers: ['customers'],
    finance: ['finance', 'cashclose', 'receivables', 'payables'], purchases: ['purchases', 'suppliers'],
    reports: ['reports'], ai: ['ai'], settings: ['settings', 'users', 'roles', 'branches', 'modules', 'documents', 'security', 'plans', 'bizconfig']
  };
  function activeKey() { var r = route(); for (var k in GROUP) if (GROUP[k].indexOf(r) > -1) return k; return r; }
  var moreOpen = store('cia.more') === '1';

  function navItems() { try { return (window.NAV || NAV).reduce(function (a, g) { return a.concat(g[1]); }, []).filter(function (x) { return allowed(x[0]); }); } catch (e) { return []; } }

  /* ---------- menú lateral ---------- */
  function sidebar() {
    var nav = q('.shell .sidebar nav'); if (!nav || nav.dataset.ref2 === '1') return;
    nav.dataset.ref2 = '1';
    var act = activeKey(), main = {};
    C.MENU.forEach(function (m) { main[m[0]] = 1; }); main.settings = 1;
    var low = 0; try { low = data().products.filter(function (p) { return p.type === 'Producto' && p.stock <= p.minStock; }).length; } catch (e) { }
    var html = C.MENU.map(function (m) {
      var badge = m[0] === 'inventory' && low ? '<b class="nbadge">' + low + '</b>' : '';
      return '<button class="nav-item' + (act === m[0] ? ' active' : '') + '" onclick="go(\'' + m[0] + '\')" type="button" title="' + m[1] + '">' + svg(m[2], 'nav-ic') + '<span>' + m[1] + '</span>' + badge + '</button>';
    }).join('');
    var others = navItems().filter(function (x) { return !main[x[0]]; });
    var inMore = others.some(function (x) { return x[0] === route(); });
    var open = moreOpen || inMore;
    html += '<div class="nav-sep"></div>';
    html += '<button class="nav-item' + (act === 'settings' ? ' active' : '') + '" onclick="go(\'settings\')" type="button" title="Configuración">' + svg('gear', 'nav-ic') + '<span>Configuración</span></button>';
    if (others.length) {
      html += '<button class="nav-item more-toggle' + (open ? ' open' : '') + '" type="button" title="Más módulos">' + svg('cmd', 'nav-ic') + '<span>Más módulos</span>' + svg('chev', 'more-ch') + '</button>';
      html += '<div class="more-list' + (open ? ' open' : '') + '">' + others.map(function (x) {
        return '<button class="more-item' + (route() === x[0] ? ' active' : '') + '" onclick="go(\'' + x[0] + '\')" type="button">' + svg('dot', 'md') + '<span>' + esc(x[1]) + '</span></button>';
      }).join('') + '</div>';
    }
    nav.innerHTML = html;
    var mt = q('.more-toggle', nav);
    if (mt) mt.onclick = function () { moreOpen = !q('.more-list', nav).classList.contains('open'); q('.more-list', nav).classList.toggle('open', moreOpen); mt.classList.toggle('open', moreOpen); store('cia.more', moreOpen ? '1' : '0'); };
    // colapsar
    var sh = q('.shell'), col = q('.shell .collapse');
    if (sh && store('cia.collapsed') === '1') sh.classList.add('collapsed');
    if (col) col.onclick = function (e) { e.preventDefault(); var c = sh.classList.toggle('collapsed'); store('cia.collapsed', c ? '1' : '0'); setTimeout(function () { window.dispatchEvent(new Event('resize')); }, 260); };
  }

  /* ---------- barra superior ---------- */
  function topbar() {
    var bar = q('.shell .appbar'); if (!bar || bar.dataset.ref2 === '1') return; bar.dataset.ref2 = '1';
    var th = q('.theme-header-btn', bar);
    if (th) { th.innerHTML = svg(ui.theme === 'dark' ? 'sun' : 'moon'); th.title = ui.theme === 'dark' ? 'Tema claro' : 'Tema oscuro'; }
    var bell = q('.icon-btn.dot', bar), n = 0;
    try { n = (data().notifications || []).filter(function (x) { return !x.read; }).length; } catch (e) { }
    if (bell) { bell.classList.remove('dot'); bell.classList.add('bell'); if (n) bell.insertAdjacentHTML('beforeend', '<b class="bell-n">' + n + '</b>'); }
    var chip = q('.me-chip', bar);
    if (chip) chip.onclick = function (e) { e.stopPropagation(); toggleUserMenu(chip); };
  }

  function toggleUserMenu(chip) {
    var ex = q('.user-menu'); if (ex) { ex.remove(); return; }
    var name = (q('.side-user strong') || {}).textContent || 'Usuario', role = (q('.side-user small') || {}).textContent || '';
    var ini = (q('.me-chip > span') || {}).textContent || 'MT';
    var item = function (ic, label, act, kbd) { return '<button type="button" data-act="' + act + '">' + svg(ic) + '<span>' + label + '</span>' + (kbd ? '<kbd>' + kbd + '</kbd>' : '') + '</button>'; };
    var m = document.createElement('div'); m.className = 'user-menu';
    m.innerHTML = '<div class="um-head"><span class="um-av">' + esc(ini) + '</span><div><strong>' + esc(name) + '</strong><small>' + esc(role) + '</small></div></div>' +
      item('user2', 'Mi cuenta y configuración', 'settings') +
      '<div class="um-sep"></div><div class="um-title">Crear nuevo</div>' +
      item('plus', 'Venta', 'new:sale', 'N') + item('plus', 'Cliente', 'new:customer') + item('plus', 'Producto', 'new:product') + item('plus', 'Tarea', 'new:task') +
      '<div class="um-sep"></div>' +
      item(ui.theme === 'dark' ? 'sun' : 'moon', ui.theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro', 'theme', 'T') +
      item('keyboard', 'Atajos de teclado', 'keys', '?') +
      item('download', 'Exportar resumen (CSV)', 'export') +
      '<div class="um-sep"></div>' + item('logout', 'Cerrar sesión', 'logout');
    chip.parentNode.appendChild(m);
    m.onclick = function (e) { var b = e.target.closest('button'); if (!b) return; var a = b.dataset.act; m.remove(); doAction(a); };
    setTimeout(function () { document.addEventListener('click', function off(ev) { if (!ev.target.closest('.user-menu')) { var x = q('.user-menu'); if (x) x.remove(); } document.removeEventListener('click', off); }); }, 0);
  }

  function toggleTheme() { if (typeof setTheme === 'function') setTheme(ui.theme === 'dark' ? 'light' : 'dark'); }
  function doAction(a) {
    if (!a) return;
    if (a.indexOf('new:') === 0) { ui.command = false; openModal(a.slice(4)); return; }
    if (a.indexOf('go:') === 0) { ui.command = false; go(a.slice(3)); return; }
    if (a.indexOf('ask:') === 0) { ui.command = false; if (window.NXAI) NXAI.ask(a.slice(4)); go('ai'); return; }
    if (a === 'settings') go('settings');
    else if (a === 'theme') { ui.command = false; toggleTheme(); }
    else if (a === 'keys') showKeys();
    else if (a === 'export') exportCSV();
    else if (a === 'logout') logout();
  }

  /* ---------- exportar ---------- */
  function exportCSV() {
    try {
      var d = data(), m = d.metrics || {}, rows = [['Métrica', 'Valor'], ['Ingresos', m.revenue], ['Utilidad', m.profit], ['Gastos', m.expenses], ['Por cobrar', m.receivable], ['Por pagar', m.payable], ['Valor de inventario', m.inventoryValue], ['Margen %', m.margin], ['Crecimiento mensual %', m.monthGrowth], [], ['Día', 'Ingresos (miles)']];
      var n = (d.trend || []).length, now = new Date();
      (d.trend || []).forEach(function (v, i) { var x = new Date(now.getTime() - (n - 1 - i) * 864e5); rows.push([x.toISOString().slice(0, 10), v]); });
      rows.push([]); rows.push(['Sucursal', 'Ventas']); (d.branchSales || []).forEach(function (b) { rows.push([b.name, b.value]); });
      var csv = '﻿' + rows.map(function (r) { return r.map(function (c) { c = c == null ? '' : String(c); return /[",\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c; }).join(','); }).join('\n');
      var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
      a.download = 'cia-resumen-' + now.toISOString().slice(0, 10) + '.csv'; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
      if (typeof toast === 'function') toast('Resumen exportado');
    } catch (e) { if (typeof toast === 'function') toast('No se pudo exportar'); }
  }

  /* ---------- atajos ---------- */
  function showKeys() {
    if (q('.keys-back')) return;
    var rows = [['Ctrl + K', 'Abrir buscador de comandos'], ['/', 'Buscar'], ['N', 'Nueva venta / registro'], ['T', 'Cambiar tema claro/oscuro'], ['?', 'Ver atajos'], ['G luego D', 'Ir a Inicio'], ['G luego V', 'Ir a Ventas'], ['G luego I', 'Ir a Inventario'], ['G luego C', 'Ir a Clientes'], ['G luego F', 'Ir a Finanzas'], ['G luego R', 'Ir a Reportes'], ['G luego A', 'Ir a IA de CIA'], ['Esc', 'Cerrar paneles']];
    var el = document.createElement('div'); el.className = 'keys-back';
    el.innerHTML = '<div class="keys"><div class="keys-h"><h3>Atajos de teclado</h3><button type="button" aria-label="Cerrar">×</button></div>' + rows.map(function (r) { return '<div class="kr"><span>' + r[1] + '</span><kbd>' + r[0] + '</kbd></div>'; }).join('') + '</div>';
    el.onclick = function (e) { if (e.target === el || e.target.tagName === 'BUTTON') el.remove(); };
    document.body.appendChild(el);
  }
  var gPending = 0;
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { var k = q('.keys-back'); if (k) k.remove(); var u = q('.user-menu'); if (u) u.remove(); }
    if (!q('.shell') || e.ctrlKey || e.metaKey || e.altKey) return;
    var t = e.target, tag = t && t.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (t && t.isContentEditable)) return;
    if (ui.modal) return;
    var key = e.key;
    if (gPending) {
      gPending = 0; var map = { d: 'dashboard', v: 'sales', i: 'inventory', c: 'customers', f: 'finance', r: 'reports', a: 'ai', s: 'settings', p: 'purchases' };
      var r = map[key.toLowerCase()]; if (r && allowed(r)) { e.preventDefault(); go(r); } return;
    }
    if (key === '/') { e.preventDefault(); ui.command = true; renderApp(); }
    else if (key === '?') { e.preventDefault(); showKeys(); }
    else if (key.toLowerCase() === 'n') { e.preventDefault(); if (typeof quickCreate === 'function') quickCreate(); }
    else if (key.toLowerCase() === 't') { e.preventDefault(); toggleTheme(); }
    else if (key.toLowerCase() === 'g') { gPending = 1; setTimeout(function () { gPending = 0; }, 1200); }
  });

  /* ---------- buscador de comandos ---------- */
  var pal = { q: '', sel: 0, items: [] };
  var CREATE = [['sale', 'Nueva venta'], ['quote', 'Nueva cotización'], ['order', 'Nuevo pedido'], ['customer', 'Nuevo cliente'], ['product', 'Nuevo producto o servicio'], ['purchase', 'Nueva compra'], ['supplier', 'Nuevo proveedor'], ['transaction', 'Nuevo movimiento de caja'], ['task', 'Nueva tarea']];
  function palItems(query) {
    var n = norm(query.trim()), out = [];
    var add = function (g, ic, label, act, hint) { if (!n || norm(label + ' ' + (hint || '')).indexOf(n) > -1) out.push({ g: g, ic: ic, label: label, act: act, hint: hint }); };
    if (n.length > 2) out.push({ g: 'Pregúntale a CIA', ic: 'spark', label: 'Preguntar: “' + query.trim() + '”', act: 'ask:' + query.trim() });
    navItems().forEach(function (x) { add('Ir a', 'right', x[1], 'go:' + x[0]); });
    CREATE.forEach(function (c) { add('Crear', 'plus', c[1], 'new:' + c[0]); });
    add('Acciones', ui.theme === 'dark' ? 'sun' : 'moon', ui.theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro', 'theme', 'tema oscuro claro');
    add('Acciones', 'download', 'Exportar resumen ejecutivo (CSV)', 'export', 'descargar excel');
    add('Acciones', 'keyboard', 'Ver atajos de teclado', 'keys');
    add('Acciones', 'logout', 'Cerrar sesión', 'logout', 'salir');
    return out;
  }
  function palHTML() {
    var g = '', h = '';
    pal.items.forEach(function (it, i) {
      if (it.g !== g) { g = it.g; h += '<div class="pal-g">' + g + '</div>'; }
      h += '<button type="button" class="pal-i' + (i === pal.sel ? ' sel' : '') + '" data-i="' + i + '">' + svg(it.ic) + '<span>' + esc(it.label) + '</span><em>↵</em></button>';
    });
    return h || '<div class="pal-empty">Sin resultados para “' + esc(pal.q) + '”</div>';
  }
  function palRefresh() {
    pal.items = palItems(pal.q); if (pal.sel >= pal.items.length) pal.sel = 0;
    var box = q('#palList'); if (box) { box.innerHTML = palHTML(); var s = q('.pal-i.sel', box); if (s && s.scrollIntoView) s.scrollIntoView({ block: 'nearest' }); }
  }
  function palRun(i) { var it = pal.items[i]; if (!it) return; ui.command = false; if (it.act.indexOf('go:') === 0 || it.act.indexOf('new:') === 0 || it.act.indexOf('ask:') === 0) doAction(it.act); else { renderApp(); doAction(it.act); } }
  window.renderCommand = function () {
    pal.q = ''; pal.sel = 0; pal.items = palItems('');
    return '<div class="command-back pal-back" id="palBack"><div class="pal"><div class="pal-in">' + svg('search') + '<input id="palInput" autocomplete="off" spellcheck="false" placeholder="Busca módulos, crea registros o pregúntale a CIA…"><kbd>Esc</kbd></div><div id="palList" class="pal-list">' + palHTML() + '</div><div class="pal-foot"><span><kbd>↑</kbd><kbd>↓</kbd> navegar</span><span><kbd>↵</kbd> abrir</span><span><kbd>Esc</kbd> cerrar</span></div></div></div>';
  };
  function bindPalette() {
    var inp = q('#palInput'); if (!inp || inp.dataset.b) return; inp.dataset.b = 1; inp.focus();
    inp.oninput = function () { pal.q = inp.value; pal.sel = 0; palRefresh(); };
    inp.onkeydown = function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); pal.sel = (pal.sel + 1) % Math.max(1, pal.items.length); palRefresh(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); pal.sel = (pal.sel - 1 + pal.items.length) % Math.max(1, pal.items.length); palRefresh(); }
      else if (e.key === 'Enter') { e.preventDefault(); palRun(pal.sel); }
    };
    var list = q('#palList');
    list.onclick = function (e) { var b = e.target.closest('.pal-i'); if (b) palRun(+b.dataset.i); };
    list.onmousemove = function (e) { var b = e.target.closest('.pal-i'); if (b && +b.dataset.i !== pal.sel) { pal.sel = +b.dataset.i; qa('.pal-i', list).forEach(function (x) { x.classList.toggle('sel', +x.dataset.i === pal.sel); }); } };
  }

  /* ---------- dashboard ---------- */
  function countUp(el) {
    var txt = el.lastChild && el.lastChild.nodeType === 3 ? el.lastChild : null; if (!txt) return;
    var final = txt.nodeValue, num = parseFloat(final.replace(/[^\d.]/g, '')); if (!isFinite(num)) return;
    var t0 = performance.now(), dur = 900;
    (function step(t) { var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3); txt.nodeValue = Math.round(num * e).toLocaleString('en-US'); if (p < 1) requestAnimationFrame(step); else txt.nodeValue = final; })(t0);
  }
  var lastRoute = null;
  function spark(vals, color) {
    var W = 64, H = 26, max = Math.max.apply(null, vals), min = Math.min.apply(null, vals), r = max - min || 1;
    var pts = vals.map(function (v, i) { return [i / (vals.length - 1) * W, H - 3 - (v - min) / r * (H - 8)]; });
    var d = pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' ');
    return '<svg class="spark" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '"><defs><linearGradient id="sp' + color.slice(1) + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + color + '" stop-opacity=".25"/><stop offset="1" stop-color="' + color + '" stop-opacity="0"/></linearGradient></defs><path d="' + d + ' L' + W + ',' + H + ' L0,' + H + ' Z" fill="url(#sp' + color.slice(1) + ')"/><path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }
  var KPI_ROUTE = { 'Ingresos': 'sales', 'Utilidad': 'reports', 'Gastos': 'finance', 'Por cobrar': 'receivables', 'Por pagar': 'payables', 'Inventario': 'inventory' };
  function dashboardExtras(enter) {
    var d, m; try { d = data(); m = d.metrics || {}; } catch (e) { return; }
    var trend = (d.trend || []).slice();
    qa('.shell .kpi-grid .kpi').forEach(function (k) {
      if (k.dataset.f === '1') return; k.dataset.f = '1';
      var lab = ((q('.kpi-top small', k) || {}).textContent || '').trim(), r = KPI_ROUTE[lab];
      if (r && allowed(r)) { k.classList.add('clickable'); k.setAttribute('role', 'link'); k.tabIndex = 0; k.onclick = function () { go(r); }; k.onkeydown = function (e) { if (e.key === 'Enter') go(r); }; }
      if (trend.length > 2 && m.revenue) {
        var ratio = { 'Ingresos': 1, 'Utilidad': (m.profit || 0) / m.revenue, 'Gastos': (m.expenses || 0) / m.revenue }[lab];
        if (ratio) k.insertAdjacentHTML('beforeend', spark(trend.map(function (v) { return v * ratio; }), lab === 'Gastos' ? '#c8a04a' : '#1f6bff'));
      }
      if (enter) { var s = q('strong', k); if (s) countUp(s); }
    });
    // caja de pregunta a CIA
    var main = q('.shell .ai-dashboard-main');
    if (main && !q('.ai-ask', main)) {
      var f = document.createElement('form'); f.className = 'ai-ask';
      f.innerHTML = svg('spark', 'aa-ic') + '<input type="text" placeholder="Escribe tu pregunta… por ejemplo: ¿qué clientes me deben más?" aria-label="Pregunta para CIA"><button type="submit" aria-label="Preguntar">' + svg('send') + '</button>';
      f.onsubmit = function (e) { e.preventDefault(); var v = q('input', f).value.trim(); if (!v) { q('input', f).focus(); return; } if (window.NXAI) NXAI.ask(v); go('ai'); };
      var row = q('.ai-quick-row', main); main.insertBefore(f, row);
    }
    // exportar
    var head = q('.shell .head-actions');
    if (head && !q('.btn-export', head)) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'btn-export'; b.innerHTML = svg('download') + '<span>Exportar</span>'; b.onclick = exportCSV; head.insertBefore(b, head.firstChild);
    }
    // acciones rápidas + dona
    var th = q('.shell .dashboard-grid.thirds');
    if (th && !q('.extra-grid')) {
      var cats = (d.categorySales || []).filter(function (c) { return c.value > 0; }), tot = cats.reduce(function (a, c) { return a + c.value; }, 0) || 1;
      var cols = ['#1f6bff', '#c8a04a', '#6aa5ff', '#9fb4d6', '#7a4fe0'], R = 52, CI = 2 * Math.PI * R, off = 0, segs = '';
      cats.forEach(function (c, i) { var len = c.value / tot * CI; segs += '<circle class="cd-seg" cx="70" cy="70" r="' + R + '" fill="none" stroke="' + cols[i % cols.length] + '" stroke-width="18" stroke-dasharray="' + Math.max(0, len - 2).toFixed(2) + ' ' + (CI - Math.max(0, len - 2)).toFixed(2) + '" stroke-dashoffset="' + (-off).toFixed(2) + '" transform="rotate(-90 70 70)"><title>' + esc(c.name) + ' ' + c.value + '%</title></circle>'; off += len; });
      var top = cats.slice().sort(function (a, b) { return b.value - a.value; })[0];
      var donut = '<section class="card cd-card"><div class="card-head"><div><h3>Ventas por categoría</h3><p>Participación del periodo</p></div></div><div class="cd-body"><svg viewBox="0 0 140 140" class="cd-svg"><circle cx="70" cy="70" r="' + R + '" fill="none" stroke="var(--donut-track,#edf2fb)" stroke-width="18"/>' + segs + '<text x="70" y="66" text-anchor="middle" class="cd-v">' + (top ? Math.round(top.value / tot * 100) + '%' : '—') + '</text><text x="70" y="84" text-anchor="middle" class="cd-l">' + (top ? esc(top.name) : 'Sin datos') + '</text></svg><ul class="cd-legend">' +
        cats.map(function (c, i) { return '<li><i style="background:' + cols[i % cols.length] + '"></i><span>' + esc(c.name) + '</span><b>' + Math.round(c.value / tot * 100) + '%</b></li>'; }).join('') + '</ul></div></section>';
      var qa2 = [['sale', 'Nueva venta', 'cart'], ['customer', 'Nuevo cliente', 'user'], ['product', 'Nuevo producto', 'box'], ['purchase', 'Nueva compra', 'doc'], ['quote', 'Cotización', 'chart'], ['task', 'Nueva tarea', 'plus']];
      var quick = '<section class="card quick-card"><div class="card-head"><div><h3>Acciones rápidas</h3><p>Crea en un clic · atajo <kbd>N</kbd></p></div></div><div class="quick-grid">' + qa2.map(function (x) { return '<button type="button" data-new="' + x[0] + '"><span>' + svg(x[2]) + '</span>' + x[1] + '</button>'; }).join('') + '</div></section>';
      var g = document.createElement('div'); g.className = 'dashboard-grid extra-grid'; g.innerHTML = donut + quick;
      th.parentNode.insertBefore(g, th.nextSibling);
      g.onclick = function (e) { var b = e.target.closest('[data-new]'); if (b) openModal(b.dataset.new); };
    }
  }

  function refine() {
    try {
      var r = route(), enter = lastRoute !== r; lastRoute = r;
      sidebar(); topbar();
      var pg = q('.shell .page'); if (pg && enter) pg.classList.add('ent');
      if (r === 'dashboard') dashboardExtras(enter);
      if (typeof ui !== 'undefined' && ui.command) bindPalette();
    } catch (e) { if (window.console) console.warn('cia-funciones', e); }
  }
  /* Datos que otros módulos esperan y que no existían en la empresa de demostración
     (evita que Inventario, Finanzas, Reportes o Seguridad se rompan). */
  var KEYS = ['expenses', 'kardex', 'cashMoves', 'warehouses', 'budgets', 'journal', 'employees', 'projects', 'invoices', 'history', 'automationRules', 'assets', 'aiLog', 'taxDocs', 'posTickets', 'payroll', 'integrations', 'crmLeads', 'crm', 'calendar', 'returns', 'bankMovements', 'backups', 'apiKeys', 'productionOrders', 'imports', 'exports', 'purchaseReceipts', 'salesPayments', 'receivables', 'payables', 'documents', 'transfers'];
  function ensureData() {
    try {
      var c = typeof currentCompany === 'function' ? currentCompany() : null; if (!c || !c.data) return;
      var d = c.data, missing = KEYS.filter(function (k) { return !Array.isArray(d[k]); });
      if (missing.length || !d.cashSession) {
        var fix = function (cc) { missing.forEach(function (k) { if (!Array.isArray(cc.data[k])) cc.data[k] = []; }); if (!cc.data.cashSession) cc.data.cashSession = { open: false, opening: 0, openedAt: null }; };
        if (typeof mutate === 'function') mutate(fix); else fix(c);
        if (typeof window.__nxEnsure === 'function') window.__nxEnsure();
      }
      c = currentCompany(); d = c && c.data;
      if (d && !Object.prototype.hasOwnProperty.call(d, 'roles')) Object.defineProperty(d, 'roles', { get: function () { return (currentCompany() || {}).roles || []; }, enumerable: false, configurable: true });
    } catch (e) { if (window.console) console.warn('cia-funciones ensureData', e); }
  }
  var prev = window.renderApp;
  window.renderApp = function () { ensureData(); var x = prev.apply(this, arguments); refine(); return x; };
  try { renderApp = window.renderApp; } catch (e) { }
  refine();
})();
