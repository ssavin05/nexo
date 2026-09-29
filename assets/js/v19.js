/* Nexo v19 — cierre funcional del prototipo, 100% en memoria */
(() => {
  const V19_PERMS=['warehouses','stockmoves','returns','cashclose','modules','plans'];
  V19_PERMS.forEach(p=>{ if(!PERMISSIONS.includes(p)) PERMISSIONS.push(p); });

  const hasRoute=r=>NAV.some(([,items])=>items.some(x=>x[0]===r));
  const op=NAV.find(x=>x[0]==='Operación')?.[1];
  const fin=NAV.find(x=>x[0]==='Finanzas')?.[1];
  const emp=NAV.find(x=>x[0]==='Empresa')?.[1];
  if(op&&!hasRoute('warehouses')) op.splice(1,0,['warehouses','Almacenes','▦']);
  if(op&&!hasRoute('stockmoves')) op.push(['stockmoves','Kardex y movimientos','↕']);
  if(op&&!hasRoute('returns')) op.push(['returns','Devoluciones','↶']);
  if(fin&&!hasRoute('cashclose')) fin.splice(1,0,['cashclose','Cierres de caja','▣']);
  if(emp&&!hasRoute('modules')) emp.unshift(['modules','Módulos','⊞']);
  if(emp&&!hasRoute('plans')) emp.push(['plans','Planes','★']);

  ui.theme ||= 'light';
  ui.onboardingStep ||= 1;

  const isoDays=n=>new Date(Date.now()+n*86400000).toISOString();
  const safe=x=>esc(x??'');
  const statusBadge=s=>{
    const map={open:['info','Abierta'],pending:['warning','Pendiente'],approved:['success','Aprobada'],received:['success','Recibida'],completed:['success','Completado'],draft:['muted','Borrador'],cancelled:['danger','Cancelada'],refunded:['success','Reembolsada']};
    const [cl,tx]=map[s]||['muted',String(s||'—')];return `<span class="badge ${cl}">${tx}</span>`;
  };

  function enhanceV19(){
    const db=loadDB();
    db.companies.forEach(c=>{
      c.industry ||= c.id==='cmp_sample'?'Distribución y comercio':'General';
      c.phone ||= c.id==='cmp_sample'?'646 100 2400':'';
      c.email ||= c.id==='cmp_sample'?'administracion@horizonte.mx':'';
      c.address ||= c.id==='cmp_sample'?'Ensenada, Baja California':'';
      c.logoText ||= (c.name||'N').slice(0,1).toUpperCase();
      c.theme ||= 'light';
      c.onboardingComplete ??= true;
      c.modules ||= Object.fromEntries(PERMISSIONS.map(p=>[p,true]));
      V19_PERMS.forEach(p=>{if(c.modules[p]===undefined)c.modules[p]=true});
      c.roles.forEach(r=>{ if(r.name==='Propietario') V19_PERMS.forEach(p=>{if(!r.permissions.includes(p))r.permissions.push(p)}); if(r.name==='Administrador') V19_PERMS.filter(p=>!['plans'].includes(p)).forEach(p=>{if(!r.permissions.includes(p))r.permissions.push(p)}) });
      const d=c.data;
      d.warehouses ||= c.branches.map((b,i)=>({id:`wh_${b.id}`,name:i===0?'Almacén principal':`Almacén ${b.name}`,branch:b.name,type:'General',active:true,capacity:i===0?850:420,occupancy:i===0?62:44}));
      d.stockMoves ||= c.id==='cmp_sample'?[
        {id:'sm1',at:isoDays(-1),product:'Detergente Ultra 20 L',sku:'DET-20L',warehouse:'Almacén principal',kind:'Salida venta',qty:-4,reference:'VT-00192',user:'Laura Méndez',balance:38},
        {id:'sm2',at:isoDays(-2),product:'Desengrasante Pro 5 L',sku:'DES-5L',warehouse:'Almacén principal',kind:'Ajuste',qty:-1,reference:'AJ-00014',user:'Carlos Ruiz',balance:9},
        {id:'sm3',at:isoDays(-4),product:'Papel Higiénico Institucional',sku:'PHI-12',warehouse:'Almacén principal',kind:'Entrada compra',qty:36,reference:'OC-00076',user:'Carlos Ruiz',balance:84},
        {id:'sm4',at:isoDays(-5),product:'Cera líquida Auto Shine',sku:'CER-1L',warehouse:'Almacén Valle Dorado',kind:'Transferencia',qty:12,reference:'TR-00017',user:'Diego Luna',balance:22}
      ]:[];
      d.returns ||= c.id==='cmp_sample'?[
        {id:'ret1',folio:'DEV-00009',type:'customer',party:'Autolavado Pacífico',reference:'VT-00190',amount:530,status:'completed',reason:'Producto con empaque dañado',createdAt:isoDays(-3)},
        {id:'ret2',folio:'DEV-00008',type:'supplier',party:'Químicos del Pacífico',reference:'OC-00076',amount:920,status:'pending',reason:'Diferencia de especificación',createdAt:isoDays(-2)}
      ]:[];
      d.cashClosings ||= c.id==='cmp_sample'?[
        {id:'cc1',folio:'COR-00031',branch:'Centro',user:'Laura Méndez',openedAt:isoDays(-1),closedAt:isoDays(-1),opening:3000,sales:28640,expenses:1240,expected:30400,counted:30320,difference:-80,status:'completed'},
        {id:'cc2',folio:'COR-00030',branch:'Valle Dorado',user:'Diego Luna',openedAt:isoDays(-2),closedAt:isoDays(-2),opening:2500,sales:12480,expenses:0,expected:14980,counted:14980,difference:0,status:'completed'}
      ]:[];
      d.onboarding ||= {company:true,branch:true,tax:true,modules:true,team:c.members.length>1,products:d.products.length>0};
      d.companyDocs ||= [];
    });
    saveDB(db);
  }
  enhanceV19();

  // Onboarding visual de alta — sigue sin persistencia.
  renderRegister=function(){
    authShell('Crear empresa','Configura la base de tu espacio de trabajo.',`
      <form id="registerForm" class="form onboarding-form">
        <div class="onboarding-progress"><i class="active"></i><i></i><i></i></div>
        <section class="onboarding-step active" data-step="1">
          <span class="step-label">PASO 1 DE 3</span><h3>Propietario</h3>
          <label>Nombre completo<input name="name" required autocomplete="name"></label>
          <label>Correo<input name="email" type="email" required autocomplete="email"></label>
          <div class="two"><label>Contraseña<input name="password" type="password" minlength="6" required></label><label>Confirmar<input name="confirm" type="password" minlength="6" required></label></div>
          <button type="button" class="btn primary" onclick="v19NextStep(2)">Continuar →</button>
        </section>
        <section class="onboarding-step" data-step="2">
          <span class="step-label">PASO 2 DE 3</span><h3>Tu empresa</h3>
          <label>Nombre comercial<input name="company" required></label>
          <label>Giro<select name="industry"><option>Comercio</option><option>Distribución</option><option>Servicios</option><option>Profesional</option><option>Manufactura</option><option>Otro</option></select></label>
          <div class="two"><label>Primera sucursal<input name="branch" value="Principal" required></label><label>Ciudad<input name="city" placeholder="Ej. Ensenada"></label></div>
          <div class="step-actions"><button type="button" class="btn secondary" onclick="v19NextStep(1)">← Atrás</button><button type="button" class="btn primary" onclick="v19NextStep(3)">Continuar →</button></div>
        </section>
        <section class="onboarding-step" data-step="3">
          <span class="step-label">PASO 3 DE 3</span><h3>Operación</h3>
          <div class="two"><label>Moneda<select name="currency"><option value="MXN">MXN — Peso mexicano</option><option value="USD">USD — Dólar</option></select></label><label>IVA %<input name="tax" type="number" min="0" max="100" value="16"></label></div>
          <div class="setup-modules"><strong>Módulos iniciales</strong><p>Después puedes cambiarlos desde Configuración.</p>${['Ventas','Inventario','Compras','Finanzas','Equipo','Reportes'].map(x=>`<label><input type="checkbox" checked disabled> ${x}</label>`).join('')}</div>
          <div class="step-actions"><button type="button" class="btn secondary" onclick="v19NextStep(2)">← Atrás</button><button class="btn primary">Crear cuenta y empresa</button></div>
        </section>
        <div id="authMsg"></div>
      </form><div class="auth-switch">¿Ya tienes cuenta? <button class="link" onclick="location.hash='#login'">Iniciar sesión</button></div>`);
    document.getElementById('registerForm').onsubmit=registerSubmit;
  };
  window.v19NextStep=n=>{
    const form=document.getElementById('registerForm');if(!form)return;
    const cur=form.querySelector('.onboarding-step.active');
    if(n>+(cur?.dataset.step||1)){
      const required=[...cur.querySelectorAll('[required]')];
      if(required.some(x=>!x.value.trim())){required.find(x=>!x.value.trim())?.focus();return}
      if(cur.dataset.step==='1'){const p=form.elements.password.value,cf=form.elements.confirm.value;if(p!==cf){document.getElementById('authMsg').innerHTML='<div class="error">Las contraseñas no coinciden.</div>';return}}
    }
    document.getElementById('authMsg').innerHTML='';
    form.querySelectorAll('.onboarding-step').forEach(s=>s.classList.toggle('active',+s.dataset.step===n));
    form.querySelectorAll('.onboarding-progress i').forEach((x,i)=>x.classList.toggle('active',i<n));
  };
  registerSubmit=async function(e){
    e.preventDefault();const f=new FormData(e.target),name=String(f.get('name')).trim(),company=String(f.get('company')).trim(),email=String(f.get('email')).trim().toLowerCase(),p=String(f.get('password'));
    if(p!==f.get('confirm'))return document.getElementById('authMsg').innerHTML='<div class="error">Las contraseñas no coinciden.</div>';
    const db=loadDB();if(db.users.some(u=>u.email===email))return document.getElementById('authMsg').innerHTML='<div class="error">Ese correo ya está registrado durante esta sesión.</div>';
    const uidu=uid('usr'),cid=uid('cmp'),rid=uid('role'),bid=uid('br');
    db.users.push({id:uidu,name,email,passwordHash:await hashPassword(p),companyIds:[cid],createdAt:nowISO(),lastAccess:nowISO(),sessions:[]});
    db.companies.push({id:cid,name:company,legalName:company,rfc:'',currency:f.get('currency')||'MXN',tax:+f.get('tax')||16,industry:f.get('industry')||'General',plan:'Prototipo',theme:'light',onboardingComplete:true,branches:[{id:bid,name:f.get('branch')||'Principal',city:f.get('city')||'',address:'',active:true}],roles:[{id:rid,name:'Propietario',permissions:[...PERMISSIONS],system:true}],members:[{userId:uidu,roleId:rid,branchId:bid,status:'active'}],modules:Object.fromEntries(PERMISSIONS.map(p=>[p,true])),data:{products:[],customers:[],suppliers:[],sales:[],quotes:[],orders:[],purchases:[],accounts:[],transactions:[],tasks:[],approvals:[],audit:[],notifications:[],transfers:[],documents:[],receivables:[],payables:[],warehouses:[{id:'wh_'+bid,name:'Almacén principal',branch:f.get('branch')||'Principal',type:'General',active:true,capacity:0,occupancy:0}],stockMoves:[],returns:[],cashClosings:[],metrics:{revenue:0,profit:0,expenses:0,receivable:0,payable:0,inventoryValue:0,margin:0,monthGrowth:0},trend:[0,0,0,0,0,0,0],branchSales:[],categorySales:[],onboarding:{company:true,branch:true,tax:true,modules:true,team:false,products:false}}});
    saveDB(db);setSession({userId:uidu,companyId:cid});enhanceV19();location.hash='';ui.route='dashboard';render();
  };

  const oldCan=can;
  can=function(p){const c=currentCompany();if(c?.modules && c.modules[p]===false && !['settings','modules','dashboard'].includes(p))return false;return oldCan(p)};

  const oldRenderPageV19=renderPage;
  renderPage=function(){
    switch(ui.route){
      case'warehouses':return warehousesPage();case'stockmoves':return stockMovesPage();case'returns':return returnsPage();case'cashclose':return cashClosePage();case'modules':return modulesPage();case'plans':return plansPage();
      default:return oldRenderPageV19();
    }
  };

  function warehousesPage(){const rows=data().warehouses||[];return `${pageHead('Almacenes','Existencias organizadas por ubicación física.',`<button class="btn primary" onclick="openModal('warehouse')">＋ Nuevo almacén</button>`)}<div class="summary-strip"><div><small>Almacenes activos</small><strong>${rows.filter(x=>x.active).length}</strong></div><div><small>Capacidad registrada</small><strong>${rows.reduce((s,x)=>s+(+x.capacity||0),0)}</strong></div><div><small>Ocupación promedio</small><strong>${rows.length?Math.round(rows.reduce((s,x)=>s+(+x.occupancy||0),0)/rows.length):0}%</strong></div></div><div class="cards-grid">${rows.map(x=>`<article class="card warehouse-card"><div class="entity-head"><span class="entity-avatar branch">▦</span><div><h3>${safe(x.name)}</h3><small>${safe(x.branch)} · ${safe(x.type)}</small></div>${x.active?'<span class="badge success">Activo</span>':'<span class="badge muted">Inactivo</span>'}</div><div class="warehouse-meter"><div><span>Ocupación</span><b>${x.occupancy||0}%</b></div><div class="progress"><i style="width:${Math.min(100,+x.occupancy||0)}%"></i></div></div><div class="entity-foot"><span>Capacidad ${x.capacity||'—'} unidades</span><button class="tiny" onclick="go('stockmoves')">Ver movimientos →</button></div></article>`).join('')}</div>`}

  function stockMovesPage(){const rows=data().stockMoves||[];return `${pageHead('Kardex y movimientos','Trazabilidad de entradas, salidas, ajustes y transferencias.',`<button class="btn secondary" onclick="exportCSV('stockMoves')">Exportar</button><button class="btn primary" onclick="openModal('stockmove')">＋ Ajuste</button>`)}<section class="card table-card"><div class="table-tools"><input placeholder="Buscar producto, referencia o almacén…" oninput="filterTable(this,'stockmoves')"><select><option>Todos los movimientos</option><option>Entradas</option><option>Salidas</option><option>Ajustes</option></select></div><div class="table-wrap"><table id="tbl_stockmoves"><thead><tr><th>Fecha</th><th>Producto</th><th>Almacén</th><th>Movimiento</th><th>Cantidad</th><th>Saldo</th><th>Referencia</th><th>Usuario</th></tr></thead><tbody>${rows.map(x=>`<tr><td>${fmtDate(x.at)}</td><td><strong>${safe(x.product)}</strong><small>${safe(x.sku)}</small></td><td>${safe(x.warehouse)}</td><td>${safe(x.kind)}</td><td><b class="${x.qty<0?'neg':'pos'}">${x.qty>0?'+':''}${x.qty}</b></td><td>${x.balance??'—'}</td><td>${safe(x.reference)}</td><td>${safe(x.user)}</td></tr>`).join('')}</tbody></table></div></section>`}

  function returnsPage(){const rows=data().returns||[];return `${pageHead('Devoluciones','Clientes y proveedores, con motivo y seguimiento.',`<button class="btn primary" onclick="openModal('return')">＋ Nueva devolución</button>`)}<div class="kpi-grid">${kpi('Devoluciones',rows.length,'Registradas')}${kpi('Monto',money(rows.reduce((s,x)=>s+x.amount,0)),'Valor afectado')}${kpi('Pendientes',rows.filter(x=>x.status==='pending').length,'Por resolver','warn')}${kpi('Completadas',rows.filter(x=>x.status==='completed').length,'Cerradas','good')}</div><section class="card table-card"><div class="table-wrap"><table><thead><tr><th>Folio</th><th>Tipo</th><th>Cliente / proveedor</th><th>Referencia</th><th>Motivo</th><th>Monto</th><th>Estado</th></tr></thead><tbody>${rows.map(x=>`<tr><td><b>${x.folio}</b></td><td>${x.type==='customer'?'Cliente':'Proveedor'}</td><td>${safe(x.party)}</td><td>${safe(x.reference)}</td><td>${safe(x.reason)}</td><td>${money(x.amount)}</td><td>${statusBadge(x.status)}</td></tr>`).join('')}</tbody></table></div></section>`}

  function cashClosePage(){const rows=data().cashClosings||[];const diff=rows.reduce((s,x)=>s+(+x.difference||0),0);return `${pageHead('Cierres de caja','Aperturas, ventas, efectivo esperado y diferencias.',`<button class="btn primary" onclick="openModal('cashclose')">＋ Registrar cierre</button>`)}<div class="kpi-grid">${kpi('Cierres',rows.length,'Historial')}${kpi('Ventas registradas',money(rows.reduce((s,x)=>s+x.sales,0)),'En cierres')}${kpi('Diferencia acumulada',money(diff),diff===0?'Sin diferencias':'Revisar','warn')}${kpi('Último cierre',rows[0]?fmtShort(rows[0].closedAt):'—','Fecha')}</div><section class="card table-card"><div class="table-wrap"><table><thead><tr><th>Folio</th><th>Sucursal</th><th>Responsable</th><th>Apertura</th><th>Ventas</th><th>Esperado</th><th>Contado</th><th>Diferencia</th></tr></thead><tbody>${rows.map(x=>`<tr><td><b>${x.folio}</b></td><td>${safe(x.branch)}</td><td>${safe(x.user)}</td><td>${money(x.opening)}</td><td>${money(x.sales)}</td><td>${money(x.expected)}</td><td>${money(x.counted)}</td><td><b class="${x.difference===0?'pos':'neg'}">${money(x.difference)}</b></td></tr>`).join('')}</tbody></table></div></section>`}

  function modulesPage(){const c=currentCompany();const groups=[['Comercial',['sales','quotes','orders','customers','products']],['Operación',['inventory','warehouses','stockmoves','purchases','suppliers','transfers','returns']],['Finanzas',['finance','cashclose','receivables','payables','reports']],['Gestión',['tasks','approvals','users','branches','audit']],['Empresa',['documents','security']]];const labels=Object.fromEntries(NAV.flatMap(x=>x[1]).map(x=>[x[0],x[1]]));return `${pageHead('Módulos','Activa solo las áreas que necesita cada empresa.','')}<section class="card modules-card"><div class="modules-note"><span>⊞</span><div><strong>Nexo es modular</strong><p>Desactivar un módulo lo oculta de la navegación durante esta sesión. Inicio, Configuración y Módulos permanecen disponibles.</p></div></div>${groups.map(([g,mods])=>`<div class="module-group"><h3>${g}</h3>${mods.filter(x=>c.modules[x]!==undefined).map(x=>`<label class="module-toggle"><div><strong>${labels[x]||x}</strong><small>${x}</small></div><input type="checkbox" ${c.modules[x]!==false?'checked':''} onchange="toggleModule('${x}',this.checked)"></label>`).join('')}</div>`).join('')}</section>`}
  window.toggleModule=(id,on)=>{mutate(c=>c.modules[id]=on);toast(on?'Módulo activado':'Módulo desactivado');if(!on&&ui.route===id)go('dashboard')};

  function plansPage(){return `${pageHead('Planes','Estructura comercial propuesta para Nexo.','')}<div class="plan-grid">${[
    ['Start','$499','Para operar una sucursal.',['Ventas y clientes','Productos y caja','1 sucursal','3 usuarios']],
    ['Business','$999','Para equipos en crecimiento.',['Inventario y compras','Finanzas y cobranza','5 sucursales','15 usuarios']],
    ['Pro','$1,799','Control avanzado y multi-sucursal.',['Permisos y autorizaciones','Kardex y almacenes','Sucursales ilimitadas','Reportes avanzados']],
    ['Enterprise','A medida','Para operación corporativa.',['Integraciones','SLA y soporte','Implementación','Configuración personalizada']]
  ].map((x,i)=>`<article class="card plan-card ${i===2?'featured':''}">${i===2?'<span class="plan-popular">RECOMENDADO</span>':''}<h3>${x[0]}</h3><strong>${x[1]}</strong><p>${x[2]}</p><ul>${x[3].map(y=>`<li>✓ ${y}</li>`).join('')}</ul><button class="btn ${i===2?'primary':'secondary'}" onclick="toast('Plan seleccionado para presentación')">Seleccionar</button></article>`).join('')}</div><div class="prototype-plan-note">Los precios y límites son de presentación y pueden ajustarse antes de comercializar Nexo.</div>`}

  // Configuración final: perfil, apariencia, datos y checklist.
  settingsPage=function(){const c=currentCompany(),d=data();const checks=d.onboarding||{};const done=Object.values(checks).filter(Boolean).length,total=Object.keys(checks).length||1;return `${pageHead('Configuración','Empresa, operación, apariencia y preparación del espacio.','')}<div class="settings-grid"><form id="settingsForm" class="card settings-card"><h3>Perfil de empresa</h3><div class="company-logo-edit"><span>${safe(c.logoText||'N')}</span><div><strong>${safe(c.name)}</strong><small>Identidad visual del prototipo</small></div></div><label>Nombre comercial<input name="name" value="${safe(c.name)}"></label><label>Razón social<input name="legalName" value="${safe(c.legalName||'')}"></label><div class="two"><label>RFC<input name="rfc" value="${safe(c.rfc||'')}"></label><label>Giro<input name="industry" value="${safe(c.industry||'')}"></label></div><div class="two"><label>Correo empresarial<input name="email" type="email" value="${safe(c.email||'')}"></label><label>Teléfono<input name="phone" value="${safe(c.phone||'')}"></label></div><label>Dirección<input name="address" value="${safe(c.address||'')}"></label><div class="two"><label>Moneda<select name="currency"><option value="MXN" ${c.currency==='MXN'?'selected':''}>MXN</option><option value="USD" ${c.currency==='USD'?'selected':''}>USD</option></select></label><label>IVA %<input name="tax" type="number" value="${c.tax||16}"></label></div><button class="btn primary">Guardar cambios</button></form><section class="card settings-card"><h3>Apariencia y experiencia</h3><div class="setting-row"><div><strong>Tema</strong><small>Claro u oscuro durante esta sesión.</small></div><div class="theme-switch"><button class="${ui.theme==='light'?'active':''}" onclick="setTheme('light')">☀ Claro</button><button class="${ui.theme==='dark'?'active':''}" onclick="setTheme('dark')">☾ Oscuro</button></div></div><div class="setting-row"><div><strong>Módulos</strong><small>Activa y oculta áreas según la empresa.</small></div><button class="tiny" onclick="go('modules')">Configurar</button></div><div class="setting-row"><div><strong>Exportación</strong><small>Descarga una copia JSON de esta sesión.</small></div><button class="tiny" onclick="downloadSnapshot()">Descargar</button></div><div class="setting-row"><div><strong>Impresión / PDF</strong><small>Usa la impresión del navegador para generar PDF.</small></div><button class="tiny" onclick="window.print()">Imprimir</button></div></section><section class="card settings-card setup-checklist"><div class="card-head"><div><h3>Preparación del espacio</h3><p>${done} de ${total} pasos completos</p></div><b>${Math.round(done/total*100)}%</b></div><div class="progress"><i style="width:${Math.round(done/total*100)}%"></i></div>${[['company','Información de empresa'],['branch','Sucursal principal'],['tax','Impuestos y moneda'],['modules','Módulos'],['team','Equipo'],['products','Catálogo inicial']].map(([k,l])=>`<div class="check-row"><span class="${checks[k]?'done':''}">${checks[k]?'✓':'○'}</span><strong>${l}</strong>${!checks[k]?`<button class="tiny" onclick="${k==='team'?"go('users')":k==='products'?"go('products')":"go('settings')"}">Completar</button>`:'<small>Listo</small>'}</div>`).join('')}</section><section class="card settings-card"><h3>Estado del prototipo</h3><div class="setting-row"><div><strong>Persistencia</strong><small>Ningún dato se conserva al recargar.</small></div><span class="badge info">Memoria</span></div><div class="setting-row"><div><strong>Backend</strong><small>No existe conexión a Supabase ni APIs.</small></div><span class="badge muted">Desconectado</span></div><div class="setting-row"><div><strong>Objetivo actual</strong><small>Validación visual, funcional y comercial.</small></div><span class="badge success">Listo</span></div></section></div>`};

  window.setTheme=t=>{ui.theme=t;mutate(c=>c.theme=t);document.documentElement.dataset.theme=t;renderApp()};

  // Modal extendido.
  const oldRenderModalV19=renderModal;
  renderModal=function(){const t=ui.modal.type;if(['warehouse','stockmove','return','cashclose'].includes(t)){
    const cfg={
      warehouse:['Nuevo almacén',`<label>Nombre<input name="name" required></label><label>Sucursal<select name="branch">${currentCompany().branches.map(b=>`<option>${safe(b.name)}</option>`).join('')}</select></label><div class="two"><label>Tipo<input name="type" value="General"></label><label>Capacidad<input name="capacity" type="number" min="0"></label></div>`],
      stockmove:['Ajuste de inventario',`<label>Producto<select name="productId">${data().products.filter(x=>x.type==='Producto').map(p=>`<option value="${p.id}">${safe(p.name)}</option>`).join('')}</select></label><label>Almacén<select name="warehouse">${(data().warehouses||[]).map(w=>`<option>${safe(w.name)}</option>`).join('')}</select></label><div class="two"><label>Tipo<select name="kind"><option>Entrada ajuste</option><option>Salida ajuste</option><option>Merma</option><option>Conteo físico</option></select></label><label>Cantidad<input name="qty" type="number" min="1" required></label></div><label>Referencia / nota<input name="reference" placeholder="AJ-00001"></label>`],
      return:['Nueva devolución',`<div class="two"><label>Tipo<select name="returnType"><option value="customer">Cliente</option><option value="supplier">Proveedor</option></select></label><label>Monto<input name="amount" type="number" min="0" required></label></div><label>Cliente / proveedor<input name="party" required></label><label>Referencia<input name="reference" placeholder="VT- / OC-"></label><label>Motivo<input name="reason" required></label>`],
      cashclose:['Registrar cierre',`<div class="two"><label>Sucursal<select name="branch">${currentCompany().branches.map(b=>`<option>${safe(b.name)}</option>`).join('')}</select></label><label>Responsable<input name="user" value="${safe(currentUser().name)}"></label></div><div class="two"><label>Fondo de apertura<input name="opening" type="number" min="0" value="0"></label><label>Ventas del turno<input name="sales" type="number" min="0" value="0"></label></div><div class="two"><label>Gastos / retiros<input name="expenses" type="number" min="0" value="0"></label><label>Efectivo contado<input name="counted" type="number" min="0" value="0"></label></div>`]
    }[t];return `<div class="modal-back" onclick="if(event.target===this)closeModal()"><div class="modal"><header><h2>${cfg[0]}</h2><button onclick="closeModal()">×</button></header><form id="modalForm" class="modal-form">${cfg[1]}<footer><button type="button" class="btn secondary" onclick="closeModal()">Cancelar</button><button class="btn primary">Guardar</button></footer></form></div></div>`}
    return oldRenderModalV19();
  };
  const oldModalSubmitV19=modalSubmit;
  modalSubmit=async function(f){const t=ui.modal.type,o=Object.fromEntries(f);if(!['warehouse','stockmove','return','cashclose'].includes(t))return oldModalSubmitV19(f);
    mutate(c=>{const d=c.data;
      if(t==='warehouse')d.warehouses.unshift({id:uid('wh'),name:o.name,branch:o.branch,type:o.type||'General',capacity:+o.capacity||0,occupancy:0,active:true});
      if(t==='stockmove'){const p=d.products.find(x=>x.id===o.productId),qty=+o.qty||0,isOut=/Salida|Merma/.test(o.kind),signed=isOut?-qty:qty;if(p)p.stock=Math.max(0,(+p.stock||0)+signed);d.stockMoves.unshift({id:uid('sm'),at:nowISO(),product:p?.name||'Producto',sku:p?.sku||'',warehouse:o.warehouse,kind:o.kind,qty:signed,reference:o.reference||'Ajuste manual',user:currentUser().name,balance:p?.stock??0});d.onboarding.products=d.products.length>0}
      if(t==='return')d.returns.unshift({id:uid('ret'),folio:`DEV-${String(d.returns.length+10).padStart(5,'0')}`,type:o.returnType,party:o.party,reference:o.reference,amount:+o.amount||0,status:'pending',reason:o.reason,createdAt:nowISO()});
      if(t==='cashclose'){const opening=+o.opening||0,sales=+o.sales||0,expenses=+o.expenses||0,counted=+o.counted||0,expected=opening+sales-expenses;d.cashClosings.unshift({id:uid('cc'),folio:`COR-${String(d.cashClosings.length+32).padStart(5,'0')}`,branch:o.branch,user:o.user,openedAt:nowISO(),closedAt:nowISO(),opening,sales,expenses,expected,counted,difference:counted-expected,status:'completed'})}
    });audit('Registro creado',t);ui.modal=null;toast('Guardado correctamente');
  };

  // Refleja progreso de onboarding al crear equipo/productos.
  const oldModalSubmitProgress=modalSubmit;
  modalSubmit=async function(f){const t=ui.modal.type;await oldModalSubmitProgress(f);if(['user','product'].includes(t)){mutate(c=>{c.data.onboarding ||= {};if(t==='user')c.data.onboarding.team=c.members.length>1;if(t==='product')c.data.onboarding.products=c.data.products.length>0})}};

  // Tema y acciones en header sin rehacer toda la app.
  const oldRenderAppV19=renderApp;
  renderApp=function(){
    const c=currentCompany();if(c?.theme)ui.theme=c.theme;document.documentElement.dataset.theme=ui.theme;
    oldRenderAppV19();
    const actions=document.querySelector('.app-actions');
    if(actions&&!actions.querySelector('.theme-header-btn')){const b=document.createElement('button');b.className='icon-btn theme-header-btn';b.title='Cambiar tema';b.textContent=ui.theme==='dark'?'☀':'☾';b.onclick=()=>setTheme(ui.theme==='dark'?'light':'dark');actions.insertBefore(b,actions.firstChild)}
  };

  // Búsqueda rápida con nuevas áreas.
  const oldCommandItemsV19=commandItems;
  commandItems=function(items){return oldCommandItemsV19(items)+[['warehouses','Abrir almacenes'],['stockmoves','Ver kardex'],['returns','Gestionar devoluciones'],['cashclose','Revisar cierres de caja'],['modules','Configurar módulos']].filter(x=>can(x[0])).map(x=>`<button onclick="go('${x[0]}');ui.command=false"><i>⌘</i><div><strong>${x[1]}</strong><small>Acción rápida</small></div><span>↵</span></button>`).join('')};

  // Ajuste de guardado de configuración ampliada.
  document.addEventListener('submit',e=>{if(e.target.id==='settingsForm'){setTimeout(()=>{const f=new FormData(e.target);mutate(c=>{['industry','email','phone','address','currency'].forEach(k=>c[k]=f.get(k)||'');c.logoText=(c.name||'N').slice(0,1).toUpperCase();c.data.onboarding.company=true;c.data.onboarding.tax=true});},0)}},true);

  enhanceV19();
  if(currentUser()) renderApp(); else render();
})();
