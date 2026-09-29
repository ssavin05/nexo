/* Nexo v20 — onboarding personalizado por tipo de empresa. Todo sigue 100% en memoria. */
(() => {
  const q = (s,root=document)=>root.querySelector(s);
  const qa = (s,root=document)=>[...root.querySelectorAll(s)];
  const asBool=v=>String(v)==='yes'||String(v)==='true'||String(v)==='on';
  const checked=(name)=>qa(`[name="${name}"]:checked`).map(x=>x.value);

  function recommendedModules(form){
    const f=new FormData(form);
    const offering=f.get('offering')||'both';
    const salesMode=checked('salesMode');
    const priorities=checked('priority');
    const mods=Object.fromEntries(PERMISSIONS.map(p=>[p,false]));
    ['dashboard','settings','modules','security','audit','users','roles','branches'].forEach(x=>mods[x]=true);

    const enable=(...ids)=>ids.forEach(x=>mods[x]=true);
    enable('customers','sales','reports','tasks','documents');

    if(offering==='products'||offering==='both') enable('products','inventory','warehouses','stockmoves','purchases','suppliers','transfers','returns');
    if(offering==='services'||offering==='both') enable('products','quotes','orders','customers');
    if(salesMode.includes('quotes')) enable('quotes','orders');
    if(salesMode.includes('pos')) enable('sales','cashclose');
    if(salesMode.includes('online')) enable('sales','orders');
    if(asBool(f.get('creditSales'))) enable('receivables','finance');
    if(asBool(f.get('supplierCredit'))) enable('payables','finance','purchases','suppliers');
    if(asBool(f.get('expenses'))) enable('finance');
    if(asBool(f.get('approvals'))) enable('approvals');
    if(asBool(f.get('inventoryControl'))) enable('inventory','warehouses','stockmoves');
    if(asBool(f.get('multiBranch'))) enable('branches','transfers','warehouses');
    if(asBool(f.get('purchasing'))) enable('purchases','suppliers','payables');
    if(asBool(f.get('teamManagement'))) enable('users','roles','tasks');

    if(priorities.includes('finance')) enable('finance','receivables','payables','reports');
    if(priorities.includes('inventory')) enable('inventory','warehouses','stockmoves','purchases','suppliers');
    if(priorities.includes('sales')) enable('sales','quotes','orders','customers');
    if(priorities.includes('team')) enable('users','roles','tasks','approvals');
    if(priorities.includes('reports')) enable('reports');

    return mods;
  }

  function profileSummary(form){
    const f=new FormData(form);
    const chips=[];
    const labels={products:'Productos',services:'Servicios',both:'Productos + servicios',small:'1–5 personas',medium:'6–20 personas',large:'21–100 personas',enterprise:'100+ personas'};
    chips.push(labels[f.get('offering')]||'Operación general');
    chips.push(labels[f.get('teamSize')]||'Equipo por definir');
    if(asBool(f.get('multiBranch'))) chips.push('Varias sucursales');
    if(asBool(f.get('inventoryControl'))) chips.push('Control de inventario');
    if(asBool(f.get('creditSales'))) chips.push('Ventas a crédito');
    if(asBool(f.get('approvals'))) chips.push('Autorizaciones');
    return chips;
  }

  function refreshRecommendation(){
    const form=q('#registerForm'); if(!form) return;
    const box=q('#recommendedModules'); if(!box) return;
    const mods=recommendedModules(form);
    const labels=Object.fromEntries(NAV.flatMap(x=>x[1]).map(x=>[x[0],x[1]]));
    const active=Object.entries(mods).filter(([k,v])=>v&&labels[k]&&!['dashboard','settings'].includes(k));
    box.innerHTML=active.slice(0,12).map(([k])=>`<span>${labels[k]||k}</span>`).join('') + (active.length>12?`<span>+${active.length-12} más</span>`:'');
    const profile=q('#profileChips'); if(profile) profile.innerHTML=profileSummary(form).map(x=>`<span>${x}</span>`).join('');
  }

  renderRegister=function(){
    authShell('Crear empresa','Nexo se adapta a la forma en que opera tu negocio.',`
      <form id="registerForm" class="form onboarding-form personalized-onboarding">
        <div class="onboarding-progress onboarding-progress-5"><i class="active"></i><i></i><i></i><i></i><i></i></div>

        <section class="onboarding-step active" data-step="1">
          <span class="step-label">PASO 1 DE 5</span><h3>¿Quién administrará Nexo?</h3>
          <p class="step-copy">Esta persona quedará como propietario del espacio.</p>
          <label>Nombre completo<input name="name" required autocomplete="name" placeholder="Nombre y apellido"></label>
          <label>Correo<input name="email" type="email" required autocomplete="email" placeholder="nombre@empresa.com"></label>
          <div class="two"><label>Contraseña<input name="password" type="password" minlength="6" required></label><label>Confirmar<input name="confirm" type="password" minlength="6" required></label></div>
          <button type="button" class="btn primary" onclick="v20NextStep(2)">Continuar →</button>
        </section>

        <section class="onboarding-step" data-step="2">
          <span class="step-label">PASO 2 DE 5</span><h3>Cuéntanos sobre la empresa</h3>
          <p class="step-copy">Con esto ajustamos módulos, nombres y prioridades.</p>
          <label>Nombre comercial<input name="company" required placeholder="Ej. Distribuidora Horizonte"></label>
          <div class="two"><label>Giro<select name="industry"><option>Comercio</option><option>Distribución</option><option>Servicios</option><option>Profesional</option><option>Manufactura</option><option>Restaurante / alimentos</option><option>Salud / bienestar</option><option>Construcción</option><option>Otro</option></select></label><label>Tamaño del equipo<select name="teamSize"><option value="small">1–5 personas</option><option value="medium">6–20 personas</option><option value="large">21–100 personas</option><option value="enterprise">100+ personas</option></select></label></div>
          <div class="question-card"><strong>¿Qué vende principalmente?</strong><div class="choice-grid three"><label><input type="radio" name="offering" value="products" checked> <span><b>Productos</b><small>Inventario, compras y proveedores</small></span></label><label><input type="radio" name="offering" value="services"> <span><b>Servicios</b><small>Cotizaciones, pedidos y clientes</small></span></label><label><input type="radio" name="offering" value="both"> <span><b>Ambos</b><small>Productos y servicios</small></span></label></div></div>
          <div class="step-actions"><button type="button" class="btn secondary" onclick="v20NextStep(1)">← Atrás</button><button type="button" class="btn primary" onclick="v20NextStep(3)">Continuar →</button></div>
        </section>

        <section class="onboarding-step" data-step="3">
          <span class="step-label">PASO 3 DE 5</span><h3>¿Cómo opera el negocio?</h3>
          <p class="step-copy">Selecciona lo que realmente usan hoy.</p>
          <div class="question-card"><strong>¿Cómo realizan ventas?</strong><div class="choice-grid"><label><input type="checkbox" name="salesMode" value="pos" checked> <span><b>Venta directa / caja</b><small>Mostrador o punto de venta</small></span></label><label><input type="checkbox" name="salesMode" value="quotes"> <span><b>Cotizaciones</b><small>Primero cotizan y luego venden</small></span></label><label><input type="checkbox" name="salesMode" value="online"> <span><b>Pedidos</b><small>Reciben pedidos antes de cobrar</small></span></label></div></div>
          <div class="yesno-grid">
            ${[['inventoryControl','¿Controlan inventario?','Existencias, kardex y almacenes'],['purchasing','¿Compran a proveedores?','Órdenes y recepción'],['creditSales','¿Venden a crédito?','Cuentas por cobrar'],['supplierCredit','¿Compran a crédito?','Cuentas por pagar'],['expenses','¿Registran gastos y bancos?','Finanzas y movimientos'],['multiBranch','¿Tienen varias sucursales?','Sucursales y transferencias']].map(([n,t,s])=>`<label class="yesno"><div><strong>${t}</strong><small>${s}</small></div><select name="${n}"><option value="yes">Sí</option><option value="no">No</option></select></label>`).join('')}
          </div>
          <div class="step-actions"><button type="button" class="btn secondary" onclick="v20NextStep(2)">← Atrás</button><button type="button" class="btn primary" onclick="v20NextStep(4)">Continuar →</button></div>
        </section>

        <section class="onboarding-step" data-step="4">
          <span class="step-label">PASO 4 DE 5</span><h3>Equipo y prioridades</h3>
          <p class="step-copy">Nexo organizará el espacio para lo que más importa.</p>
          <div class="yesno-grid">
            <label class="yesno"><div><strong>¿Necesitan permisos por usuario?</strong><small>Roles y accesos diferentes</small></div><select name="teamManagement"><option value="yes">Sí</option><option value="no">No</option></select></label>
            <label class="yesno"><div><strong>¿Requieren autorizaciones?</strong><small>Compras, descuentos o cancelaciones</small></div><select name="approvals"><option value="yes">Sí</option><option value="no">No</option></select></label>
          </div>
          <div class="question-card"><strong>¿Qué quieren controlar mejor?</strong><p>Elige hasta donde aplique; puedes cambiarlo después.</p><div class="priority-grid">${[['sales','Ventas'],['inventory','Inventario'],['finance','Finanzas'],['team','Equipo'],['reports','Reportes']].map(([v,l],i)=>`<label><input type="checkbox" name="priority" value="${v}" ${i<3?'checked':''}> <span>${l}</span></label>`).join('')}</div></div>
          <div class="two"><label>Primera sucursal<input name="branch" value="Principal" required></label><label>Ciudad<input name="city" placeholder="Ej. Ensenada"></label></div>
          <div class="step-actions"><button type="button" class="btn secondary" onclick="v20NextStep(3)">← Atrás</button><button type="button" class="btn primary" onclick="v20NextStep(5)">Ver configuración →</button></div>
        </section>

        <section class="onboarding-step" data-step="5">
          <span class="step-label">PASO 5 DE 5</span><h3>Así quedará tu Nexo</h3>
          <p class="step-copy">Preparamos una configuración inicial según tus respuestas.</p>
          <div class="profile-summary"><strong>Perfil detectado</strong><div id="profileChips" class="profile-chips"></div></div>
          <div class="recommended-box"><div><strong>Módulos recomendados</strong><p>Puedes activarlos o desactivarlos después.</p></div><div id="recommendedModules" class="recommended-modules"></div></div>
          <div class="two"><label>Moneda<select name="currency"><option value="MXN">MXN — Peso mexicano</option><option value="USD">USD — Dólar</option></select></label><label>IVA %<input name="tax" type="number" min="0" max="100" value="16"></label></div>
          <div class="step-actions"><button type="button" class="btn secondary" onclick="v20NextStep(4)">← Atrás</button><button class="btn primary">Crear empresa personalizada</button></div>
        </section>
        <div id="authMsg"></div>
      </form><div class="auth-switch">¿Ya tienes cuenta? <button class="link" onclick="location.hash='#login'">Iniciar sesión</button></div>`);
    const form=q('#registerForm');
    form.onsubmit=registerSubmit;
    form.addEventListener('change',refreshRecommendation);
    form.addEventListener('input',e=>{ if(e.target.matches('input,select')) refreshRecommendation(); });
    refreshRecommendation();
  };

  window.v20NextStep=n=>{
    const form=q('#registerForm'); if(!form)return;
    const cur=q('.onboarding-step.active',form); const current=+(cur?.dataset.step||1);
    if(n>current){
      const required=qa('[required]',cur);
      const invalid=required.find(x=>!String(x.value||'').trim());
      if(invalid){invalid.focus(); return;}
      if(current===1){const p=form.elements.password.value,cf=form.elements.confirm.value;if(p!==cf){q('#authMsg').innerHTML='<div class="error">Las contraseñas no coinciden.</div>';return}}
    }
    q('#authMsg').innerHTML='';
    qa('.onboarding-step',form).forEach(s=>s.classList.toggle('active',+s.dataset.step===n));
    qa('.onboarding-progress i',form).forEach((x,i)=>x.classList.toggle('active',i<n));
    if(n===5) refreshRecommendation();
    window.scrollTo({top:0,behavior:'smooth'});
  };

  registerSubmit=async function(e){
    e.preventDefault();
    const form=e.target, f=new FormData(form),name=String(f.get('name')).trim(),company=String(f.get('company')).trim(),email=String(f.get('email')).trim().toLowerCase(),p=String(f.get('password'));
    if(p!==f.get('confirm'))return q('#authMsg').innerHTML='<div class="error">Las contraseñas no coinciden.</div>';
    const db=loadDB(); if(db.users.some(u=>u.email===email))return q('#authMsg').innerHTML='<div class="error">Ese correo ya está registrado durante esta sesión.</div>';
    const uidu=uid('usr'),cid=uid('cmp'),rid=uid('role'),bid=uid('br');
    const modules=recommendedModules(form);
    const settings={
      teamSize:f.get('teamSize')||'small',offering:f.get('offering')||'products',salesMode:checked('salesMode'),priorities:checked('priority'),
      inventoryControl:asBool(f.get('inventoryControl')),purchasing:asBool(f.get('purchasing')),creditSales:asBool(f.get('creditSales')),
      supplierCredit:asBool(f.get('supplierCredit')),expenses:asBool(f.get('expenses')),multiBranch:asBool(f.get('multiBranch')),
      teamManagement:asBool(f.get('teamManagement')),approvals:asBool(f.get('approvals'))
    };
    db.users.push({id:uidu,name,email,passwordHash:await hashPassword(p),companyIds:[cid],createdAt:nowISO(),lastAccess:nowISO(),sessions:[]});
    db.companies.push({id:cid,name:company,legalName:company,rfc:'',currency:f.get('currency')||'MXN',tax:+f.get('tax')||16,industry:f.get('industry')||'General',plan:'Prototipo',theme:'light',onboardingComplete:true,businessProfile:settings,branches:[{id:bid,name:f.get('branch')||'Principal',city:f.get('city')||'',address:'',active:true}],roles:[{id:rid,name:'Propietario',permissions:[...PERMISSIONS],system:true}],members:[{userId:uidu,roleId:rid,branchId:bid,status:'active'}],modules,data:{products:[],customers:[],suppliers:[],sales:[],quotes:[],orders:[],purchases:[],accounts:[],transactions:[],tasks:[],approvals:[],audit:[],notifications:[{id:uid('nt'),type:'info',title:'Nexo personalizado',text:'Configuramos tu espacio según las respuestas del alta.',read:false,at:nowISO(),action:'settings'}],transfers:[],documents:[],receivables:[],payables:[],warehouses:modules.warehouses?[{id:'wh_'+bid,name:'Almacén principal',branch:f.get('branch')||'Principal',type:'General',active:true,capacity:0,occupancy:0}]:[],stockMoves:[],returns:[],cashClosings:[],metrics:{revenue:0,profit:0,expenses:0,receivable:0,payable:0,inventoryValue:0,margin:0,monthGrowth:0},trend:[0,0,0,0,0,0,0],branchSales:[],categorySales:[],onboarding:{company:true,branch:true,tax:true,modules:true,team:false,products:false}}});
    saveDB(db); setSession({userId:uidu,companyId:cid}); enhanceV19(); location.hash=''; ui.route='dashboard'; render();
  };

  // Mostrar perfil capturado dentro de Configuración sin cambiar el resto de v19.
  const oldSettings=settingsPage;
  settingsPage=function(){
    const base=oldSettings(); const c=currentCompany(),p=c?.businessProfile; if(!p)return base;
    const offering={products:'Productos',services:'Servicios',both:'Productos + servicios'}[p.offering]||p.offering;
    const block=`<section class="card settings-card business-profile-card"><h3>Perfil operativo</h3><p class="settings-intro">Estas preferencias se definieron durante el alta de la empresa.</p><div class="profile-facts"><div><small>Oferta principal</small><strong>${safe(offering)}</strong></div><div><small>Tamaño del equipo</small><strong>${safe({small:'1–5',medium:'6–20',large:'21–100',enterprise:'100+'}[p.teamSize]||p.teamSize)}</strong></div><div><small>Inventario</small><strong>${p.inventoryControl?'Sí':'No'}</strong></div><div><small>Crédito a clientes</small><strong>${p.creditSales?'Sí':'No'}</strong></div><div><small>Varias sucursales</small><strong>${p.multiBranch?'Sí':'No'}</strong></div><div><small>Autorizaciones</small><strong>${p.approvals?'Sí':'No'}</strong></div></div><button class="btn secondary" onclick="go('modules')">Revisar módulos activos</button></section>`;
    return base.replace('</div>',`${block}</div>`);
  };
})();
