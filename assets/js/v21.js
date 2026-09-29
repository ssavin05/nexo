/* Nexo v21 — personalización automática completa, 100% en memoria */
(() => {
  const q=(s,r=document)=>r.querySelector(s), qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const yn=v=>String(v)==='yes'||String(v)==='true'||String(v)==='on';
  const vals=n=>qa(`[name="${n}"]:checked`).map(x=>x.value);
  const PALETTES={
    nexo:{name:'Nexo Azul',primary:'#2F6DF6',accent:'#0EA5A4',nav:'#0C1728',bg:'#F4F7FB'},
    oceano:{name:'Océano',primary:'#1261A0',accent:'#10B3A3',nav:'#08223B',bg:'#F3F8FC'},
    grafito:{name:'Grafito',primary:'#334155',accent:'#0EA5A4',nav:'#111827',bg:'#F6F7F9'},
    violeta:{name:'Violeta',primary:'#6D5CE7',accent:'#14B8A6',nav:'#17152B',bg:'#F7F6FC'},
    esmeralda:{name:'Esmeralda',primary:'#0F8A72',accent:'#2563EB',nav:'#0A2623',bg:'#F3F8F7'},
    vino:{name:'Vino',primary:'#9B3654',accent:'#C78B3B',nav:'#2B1420',bg:'#FAF6F7'},
    naranja:{name:'Energía',primary:'#EA6A2A',accent:'#2563EB',nav:'#24160F',bg:'#FBF7F4'},
    personalizado:{name:'Personalizado',primary:'#2F6DF6',accent:'#0EA5A4',nav:'#0C1728',bg:'#F4F7FB'}
  };
  const INDUSTRY_PRESETS={
    'Comercio':{offering:'products',inventory:'yes',purchasing:'yes',credit:'no',supplierCredit:'yes',sales:['pos'],priorities:['sales','inventory','finance']},
    'Distribución':{offering:'products',inventory:'yes',purchasing:'yes',credit:'yes',supplierCredit:'yes',sales:['quotes','online'],priorities:['sales','inventory','finance','reports']},
    'Servicios':{offering:'services',inventory:'no',purchasing:'no',credit:'yes',supplierCredit:'no',sales:['quotes','online'],priorities:['sales','finance','team']},
    'Profesional':{offering:'services',inventory:'no',purchasing:'no',credit:'yes',supplierCredit:'no',sales:['quotes'],priorities:['sales','finance','reports']},
    'Manufactura':{offering:'both',inventory:'yes',purchasing:'yes',credit:'yes',supplierCredit:'yes',sales:['quotes','online'],priorities:['inventory','finance','reports']},
    'Restaurante / alimentos':{offering:'products',inventory:'yes',purchasing:'yes',credit:'no',supplierCredit:'yes',sales:['pos'],priorities:['sales','inventory','finance']},
    'Salud / bienestar':{offering:'services',inventory:'no',purchasing:'yes',credit:'yes',supplierCredit:'no',sales:['quotes','pos'],priorities:['sales','finance','team']},
    'Construcción':{offering:'both',inventory:'yes',purchasing:'yes',credit:'yes',supplierCredit:'yes',sales:['quotes','online'],priorities:['finance','inventory','reports']},
    'Otro':{offering:'both',inventory:'yes',purchasing:'yes',credit:'yes',supplierCredit:'yes',sales:['pos','quotes'],priorities:['sales','finance','reports']}
  };

  const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
  function hexToRgb(hex){let h=String(hex||'').replace('#','');if(h.length===3)h=[...h].map(x=>x+x).join('');if(!/^[0-9a-f]{6}$/i.test(h))return null;return {r:parseInt(h.slice(0,2),16),g:parseInt(h.slice(2,4),16),b:parseInt(h.slice(4,6),16)}}
  function mix(hex,other='#ffffff',amt=.15){const a=hexToRgb(hex),b=hexToRgb(other);if(!a||!b)return hex;const v=k=>Math.round(a[k]+(b[k]-a[k])*clamp(amt,0,1)).toString(16).padStart(2,'0');return `#${v('r')}${v('g')}${v('b')}`}
  function contrastText(hex){const c=hexToRgb(hex);if(!c)return '#ffffff';const lum=(.299*c.r+.587*c.g+.114*c.b)/255;return lum>.62?'#0B1220':'#ffffff'}
  function selectedPalette(form){const key=form.elements.palette?.value||'nexo';const base={...(PALETTES[key]||PALETTES.nexo)};return {...base,key}}
  function applyBrand(brand){if(!brand)return;const root=document.documentElement;const primary=brand.primary||'#2F6DF6',accent=brand.accent||'#0EA5A4',nav=brand.nav||'#0C1728',bg=brand.bg||'#F4F7FB';root.style.setProperty('--blue',primary);root.style.setProperty('--blue2',mix(primary,'#000000',.14));root.style.setProperty('--teal',accent);root.style.setProperty('--nav',nav);root.style.setProperty('--nav2',mix(nav,'#ffffff',.08));root.style.setProperty('--bg',bg);root.style.setProperty('--brand-on-primary',contrastText(primary));root.dataset.visual=brand.style||'modern';document.body?.classList.toggle('premium-look',brand.style==='premium');document.body?.classList.toggle('minimal-look',brand.style==='minimal');document.body?.classList.toggle('tech-look',brand.style==='tech')}
  window.applyNexoBrand=applyBrand;

  function modulePlan(form){
    const f=new FormData(form), offering=f.get('offering')||'both', sales=vals('salesMode'), priorities=vals('priority');
    const mods=Object.fromEntries(PERMISSIONS.map(p=>[p,false]));
    const on=(...xs)=>xs.forEach(x=>mods[x]=true);
    on('dashboard','settings','modules','security','audit','users','roles','branches','tasks','documents','reports','customers');
    if(offering==='products'||offering==='both')on('products','inventory','warehouses','stockmoves','returns');
    if(offering==='services'||offering==='both')on('products','quotes','orders');
    if(sales.includes('pos'))on('sales','cashclose');
    if(sales.includes('quotes'))on('quotes','orders');
    if(sales.includes('online'))on('orders','sales');
    if(yn(f.get('inventoryControl')))on('inventory','warehouses','stockmoves','returns');
    if(yn(f.get('purchasing')))on('purchases','suppliers','payables');
    if(yn(f.get('creditSales')))on('receivables','finance');
    if(yn(f.get('supplierCredit')))on('payables','finance','purchases','suppliers');
    if(yn(f.get('expenses')))on('finance','cashclose');
    if(yn(f.get('multiBranch')))on('branches','warehouses','transfers');
    if(yn(f.get('teamManagement')))on('users','roles','tasks');
    if(yn(f.get('approvals')))on('approvals');
    priorities.forEach(x=>({sales:['sales','quotes','orders','customers'],inventory:['inventory','warehouses','stockmoves','purchases','suppliers'],finance:['finance','receivables','payables','cashclose'],team:['users','roles','tasks','approvals'],reports:['reports']}[x]||[]).forEach(m=>mods[m]=true));
    return mods;
  }
  function dashboardPreset(form){const f=new FormData(form),p=vals('priority');if(p[0]==='inventory')return 'operations';if(p[0]==='finance')return 'finance';if(p[0]==='team')return 'team';if(p[0]==='reports')return 'analytics';return 'commercial'}
  function suggestedPlan(form){const f=new FormData(form),team=f.get('teamSize'),multi=yn(f.get('multiBranch')),approvals=yn(f.get('approvals')),modules=Object.values(modulePlan(form)).filter(Boolean).length;if(team==='enterprise'||multi&&approvals)return 'Enterprise';if(team==='large'||multi||modules>18)return 'Pro';if(team==='medium'||modules>12)return 'Business';return 'Start'}
  function suggestedRoles(form){const f=new FormData(form),mods=modulePlan(form);const roles=[{name:'Propietario',permissions:[...PERMISSIONS],system:true},{name:'Administrador',permissions:[...PERMISSIONS].filter(x=>x!=='plans'),system:true}];if(mods.sales)roles.push({name:'Ventas',permissions:['dashboard','sales','quotes','orders','customers','tasks'].filter(x=>mods[x]),system:true});if(mods.inventory)roles.push({name:'Inventario',permissions:['dashboard','products','inventory','warehouses','stockmoves','purchases','suppliers','transfers','returns','tasks'].filter(x=>mods[x]),system:true});if(mods.finance)roles.push({name:'Finanzas',permissions:['dashboard','finance','receivables','payables','cashclose','reports','tasks'].filter(x=>mods[x]),system:true});return roles}
  function branchCount(form){const f=new FormData(form);if(!yn(f.get('multiBranch')))return 1;return Math.max(2,+f.get('branchCount')||2)}
  function warehouseCount(form){const f=new FormData(form);if(!yn(f.get('inventoryControl')))return 0;return Math.max(1,+f.get('warehouseCount')||1)}

  function applyIndustryPreset(form,industry){const p=INDUSTRY_PRESETS[industry]||INDUSTRY_PRESETS.Otro;const radio=form.querySelector(`[name="offering"][value="${p.offering}"]`);if(radio)radio.checked=true;['inventoryControl','purchasing','creditSales','supplierCredit'].forEach(k=>{if(form.elements[k])form.elements[k].value={inventoryControl:p.inventory,purchasing:p.purchasing,creditSales:p.credit,supplierCredit:p.supplierCredit}[k]});qa('[name="salesMode"]',form).forEach(x=>x.checked=p.sales.includes(x.value));qa('[name="priority"]',form).forEach(x=>x.checked=p.priorities.includes(x.value));refreshAuto()}

  function previewBrand(){const form=q('#registerForm');if(!form)return;const b=selectedPalette(form),preview=q('#brandPreview');if(preview){preview.style.setProperty('--preview-primary',b.primary);preview.style.setProperty('--preview-accent',b.accent);preview.style.setProperty('--preview-nav',b.nav);preview.style.setProperty('--preview-bg',b.bg);preview.dataset.style=form.elements.visualStyle?.value||'modern'}qa('.palette-card',form).forEach(x=>x.classList.toggle('active',x.dataset.palette===b.key))}
  function refreshAuto(){const form=q('#registerForm');if(!form)return;const mods=modulePlan(form),labels=Object.fromEntries(NAV.flatMap(x=>x[1]).map(x=>[x[0],x[1]])),active=Object.keys(mods).filter(k=>mods[k]&&labels[k]&&!['dashboard','settings'].includes(k)),plan=suggestedPlan(form),preset=dashboardPreset(form),branches=branchCount(form),warehouses=warehouseCount(form);const el=q('#autoModuleList');if(el)el.innerHTML=active.slice(0,14).map(k=>`<span>${labels[k]}</span>`).join('')+(active.length>14?`<span>+${active.length-14} más</span>`:'');const p=q('#autoPlan');if(p)p.textContent=plan;const d=q('#autoDashboard');if(d)d.textContent={commercial:'Comercial',operations:'Operaciones',finance:'Finanzas',team:'Equipo',analytics:'Analítico'}[preset];const br=q('#autoBranches');if(br)br.textContent=`${branches} ${branches===1?'sucursal':'sucursales'}`;const wh=q('#autoWarehouses');if(wh)wh.textContent=warehouses?`${warehouses} ${warehouses===1?'almacén':'almacenes'}`:'Sin almacén';previewBrand()}

  renderRegister=function(){
    authShell('Crear empresa','Responde unas preguntas y Nexo se configura automáticamente.',`
      <form id="registerForm" class="form onboarding-form personalized-onboarding">
        <div class="onboarding-progress onboarding-progress-6"><i class="active"></i><i></i><i></i><i></i><i></i><i></i></div>
        <section class="onboarding-step active" data-step="1">
          <span class="auto-badge">✦ CONFIGURACIÓN AUTOMÁTICA</span><span class="step-label">PASO 1 DE 6</span><h3>Propietario del espacio</h3><p class="step-copy">Será la cuenta con control total del negocio.</p>
          <label>Nombre completo<input name="name" required autocomplete="name" placeholder="Nombre y apellido"></label><label>Correo<input name="email" type="email" required autocomplete="email" placeholder="nombre@empresa.com"></label><div class="two"><label>Contraseña<input name="password" type="password" minlength="6" required></label><label>Confirmar<input name="confirm" type="password" minlength="6" required></label></div>
          <button type="button" class="btn primary" onclick="v21Step(2)">Continuar →</button>
        </section>
        <section class="onboarding-step" data-step="2">
          <span class="step-label">PASO 2 DE 6</span><h3>¿Qué tipo de empresa es?</h3><p class="step-copy">Al elegir el giro, Nexo propone una configuración inicial que puedes ajustar.</p>
          <label>Nombre comercial<input name="company" required placeholder="Ej. Distribuidora Horizonte"></label>
          <div class="two"><label>Giro<select name="industry" onchange="v21Industry(this.value)"><option>Comercio</option><option>Distribución</option><option>Servicios</option><option>Profesional</option><option>Manufactura</option><option>Restaurante / alimentos</option><option>Salud / bienestar</option><option>Construcción</option><option>Otro</option></select></label><label>Tamaño del equipo<select name="teamSize"><option value="small">1–5 personas</option><option value="medium">6–20 personas</option><option value="large">21–100 personas</option><option value="enterprise">100+ personas</option></select></label></div>
          <div class="question-card"><strong>¿Qué vende principalmente?</strong><div class="choice-grid three"><label><input type="radio" name="offering" value="products" checked><span><b>Productos</b><small>Stock, compras y proveedores</small></span></label><label><input type="radio" name="offering" value="services"><span><b>Servicios</b><small>Cotización, clientes y seguimiento</small></span></label><label><input type="radio" name="offering" value="both"><span><b>Ambos</b><small>Operación mixta</small></span></label></div></div>
          <div class="step-actions"><button type="button" class="btn secondary" onclick="v21Step(1)">← Atrás</button><button type="button" class="btn primary" onclick="v21Step(3)">Continuar →</button></div>
        </section>
        <section class="onboarding-step" data-step="3">
          <span class="step-label">PASO 3 DE 6</span><h3>Cómo trabaja la empresa</h3><p class="step-copy">Esto decide qué módulos se activan y qué aparece primero.</p>
          <div class="question-card"><strong>¿Cómo realizan ventas?</strong><div class="choice-grid"><label><input type="checkbox" name="salesMode" value="pos" checked><span><b>Venta directa</b><small>Caja o mostrador</small></span></label><label><input type="checkbox" name="salesMode" value="quotes"><span><b>Cotizaciones</b><small>Propuestas antes de vender</small></span></label><label><input type="checkbox" name="salesMode" value="online"><span><b>Pedidos</b><small>Orden antes del cobro</small></span></label></div></div>
          <div class="yesno-grid">${[['inventoryControl','¿Controlan inventario?','Existencias, kardex y almacenes'],['purchasing','¿Compran a proveedores?','Órdenes y recepción'],['creditSales','¿Venden a crédito?','Cuentas por cobrar'],['supplierCredit','¿Compran a crédito?','Cuentas por pagar'],['expenses','¿Usan caja, bancos y gastos?','Tesorería y movimientos'],['multiBranch','¿Tienen varias sucursales?','Operación por ubicación']].map(([n,t,s])=>`<label class="yesno"><div><strong>${t}</strong><small>${s}</small></div><select name="${n}"><option value="yes">Sí</option><option value="no">No</option></select></label>`).join('')}</div>
          <div class="two"><label>Número de sucursales<input name="branchCount" type="number" min="1" max="50" value="1"></label><label>Número de almacenes<input name="warehouseCount" type="number" min="0" max="50" value="1"></label></div>
          <div class="step-actions"><button type="button" class="btn secondary" onclick="v21Step(2)">← Atrás</button><button type="button" class="btn primary" onclick="v21Step(4)">Continuar →</button></div>
        </section>
        <section class="onboarding-step" data-step="4">
          <span class="step-label">PASO 4 DE 6</span><h3>Equipo y prioridades</h3><p class="step-copy">Nexo preparará permisos, dashboard y controles automáticamente.</p>
          <div class="yesno-grid"><label class="yesno"><div><strong>¿Necesitan permisos por usuario?</strong><small>Roles y accesos distintos</small></div><select name="teamManagement"><option value="yes">Sí</option><option value="no">No</option></select></label><label class="yesno"><div><strong>¿Requieren autorizaciones?</strong><small>Descuentos, compras o cancelaciones</small></div><select name="approvals"><option value="yes">Sí</option><option value="no">No</option></select></label></div>
          <div class="question-card"><strong>¿Qué debe destacar en Inicio?</strong><p>El primer seleccionado será la prioridad principal.</p><div class="priority-grid">${[['sales','Ventas'],['inventory','Inventario'],['finance','Finanzas'],['team','Equipo'],['reports','Reportes']].map(([v,l],i)=>`<label><input type="checkbox" name="priority" value="${v}" ${i<3?'checked':''}><span>${l}</span></label>`).join('')}</div></div>
          <div class="two"><label>Sucursal principal<input name="branch" value="Principal" required></label><label>Ciudad<input name="city" placeholder="Ej. Ensenada"></label></div>
          <div class="step-actions"><button type="button" class="btn secondary" onclick="v21Step(3)">← Atrás</button><button type="button" class="btn primary" onclick="v21Step(5)">Diseñar Nexo →</button></div>
        </section>
        <section class="onboarding-step" data-step="5">
          <span class="step-label">PASO 5 DE 6</span><h3>Hazlo de tu empresa</h3><p class="step-copy">Elige una paleta profesional y la personalidad visual de Nexo. Nosotros hacemos el resto automáticamente.</p>
          <div class="brand-builder"><div class="palette-presets">${Object.entries(PALETTES).filter(([k])=>k!=='personalizado').map(([k,p],i)=>`<button type="button" class="palette-card ${i===0?'active':''}" data-palette="${k}" onclick="v21Palette('${k}')"><span class="palette-dots"><i style="background:${p.primary}"></i><i style="background:${p.accent}"></i><i style="background:${p.nav}"></i></span><strong>${p.name}</strong><small>Aplicar paleta</small></button>`).join('')}</div><input type="hidden" name="palette" value="nexo">
          <div class="question-card"><strong>Estilo visual</strong><div class="visual-style-grid"><label><input type="radio" name="visualStyle" value="modern" checked><b>Moderno</b><small>Limpio, equilibrado y versátil</small></label><label><input type="radio" name="visualStyle" value="premium"><b>Premium</b><small>Elegante, refinado y con más profundidad</small></label><label><input type="radio" name="visualStyle" value="minimal"><b>Minimalista</b><small>Plano, compacto y sin distracciones</small></label><label><input type="radio" name="visualStyle" value="tech"><b>Tecnológico</b><small>Digital, luminoso y más futurista</small></label></div></div>
          <div id="brandPreview" class="brand-preview"><aside><div class="preview-logo">N</div><i class="active"></i><i></i><i></i><i></i></aside><main><div class="preview-top"><strong>Vista previa de Nexo</strong><span></span></div><div class="preview-kpis"><i></i><i></i><i></i></div><div class="preview-chart"><b style="height:42%"></b><b style="height:68%"></b><b style="height:54%"></b><b style="height:82%"></b><b style="height:70%"></b></div></main></div></div>
          <div class="step-actions"><button type="button" class="btn secondary" onclick="v21Step(4)">← Atrás</button><button type="button" class="btn primary" onclick="v21Step(6)">Ver configuración automática →</button></div>
        </section>
        <section class="onboarding-step" data-step="6">
          <span class="step-label">PASO 6 DE 6</span><h3>Nexo ya sabe cómo configurarse</h3><p class="step-copy">Todo esto se generará automáticamente y podrá cambiarse después.</p>
          <div class="auto-config-note"><span>✦</span><div><strong>No necesitas configurar módulo por módulo.</strong><p>Nexo usa tus respuestas para preparar navegación, roles, dashboard, sucursales, almacenes y módulos.</p></div></div>
          <div class="auto-summary-grid"><div class="auto-summary-card"><small>Plan sugerido</small><strong id="autoPlan">Business</strong></div><div class="auto-summary-card"><small>Dashboard inicial</small><strong id="autoDashboard">Comercial</strong></div><div class="auto-summary-card"><small>Estructura</small><strong id="autoBranches">1 sucursal</strong></div><div class="auto-summary-card"><small>Inventario</small><strong id="autoWarehouses">1 almacén</strong></div></div>
          <div class="recommended-box"><strong>Módulos que se activarán</strong><p>Según la operación que describiste.</p><div id="autoModuleList" class="auto-list"></div></div>
          <div class="two"><label>Moneda<select name="currency"><option value="MXN">MXN — Peso mexicano</option><option value="USD">USD — Dólar</option><option value="EUR">EUR — Euro</option></select></label><label>IVA / impuesto %<input name="tax" type="number" min="0" max="100" value="16"></label></div>
          <div class="step-actions"><button type="button" class="btn secondary" onclick="v21Step(5)">← Atrás</button><button class="btn primary">Crear Nexo automáticamente</button></div>
        </section><div id="authMsg"></div>
      </form><div class="auth-switch">¿Ya tienes cuenta? <button class="link" onclick="location.hash='#login'">Iniciar sesión</button></div>`);
    const form=q('#registerForm');form.onsubmit=v21Register;form.addEventListener('change',refreshAuto);form.addEventListener('input',refreshAuto);applyIndustryPreset(form,'Comercio');refreshAuto();previewBrand();
  };

  window.v21Industry=v=>{const f=q('#registerForm');if(f)applyIndustryPreset(f,v)};
  window.v21Palette=key=>{const f=q('#registerForm');if(!f)return;f.elements.palette.value=key;refreshAuto()};
  window.v21Step=n=>{const f=q('#registerForm');if(!f)return;const cur=q('.onboarding-step.active',f),current=+(cur?.dataset.step||1);if(n>current){const inv=qa('[required]',cur).find(x=>!String(x.value||'').trim());if(inv){inv.focus();return}if(current===1&&f.elements.password.value!==f.elements.confirm.value){q('#authMsg').innerHTML='<div class="error">Las contraseñas no coinciden.</div>';return}}q('#authMsg').innerHTML='';qa('.onboarding-step',f).forEach(s=>s.classList.toggle('active',+s.dataset.step===n));qa('.onboarding-progress i',f).forEach((x,i)=>x.classList.toggle('active',i<n));if(n===6)refreshAuto();window.scrollTo({top:0,behavior:'smooth'})};

  async function v21Register(e){
    e.preventDefault();const form=e.target,f=new FormData(form),name=String(f.get('name')).trim(),company=String(f.get('company')).trim(),email=String(f.get('email')).trim().toLowerCase(),pwd=String(f.get('password'));if(pwd!==f.get('confirm'))return q('#authMsg').innerHTML='<div class="error">Las contraseñas no coinciden.</div>';const db=loadDB();if(db.users.some(u=>u.email===email))return q('#authMsg').innerHTML='<div class="error">Ese correo ya está registrado durante esta sesión.</div>';
    const uidu=uid('usr'),cid=uid('cmp'),bid=uid('br'),mods=modulePlan(form),brand={...selectedPalette(form),style:f.get('visualStyle')||'modern'},profile={teamSize:f.get('teamSize'),offering:f.get('offering'),salesMode:vals('salesMode'),priorities:vals('priority'),inventoryControl:yn(f.get('inventoryControl')),purchasing:yn(f.get('purchasing')),creditSales:yn(f.get('creditSales')),supplierCredit:yn(f.get('supplierCredit')),expenses:yn(f.get('expenses')),multiBranch:yn(f.get('multiBranch')),teamManagement:yn(f.get('teamManagement')),approvals:yn(f.get('approvals'))};
    const branches=Array.from({length:branchCount(form)},(_,i)=>({id:i===0?bid:uid('br'),name:i===0?(f.get('branch')||'Principal'):`Sucursal ${i+1}`,city:f.get('city')||'',address:'',active:true}));const warehouses=Array.from({length:warehouseCount(form)},(_,i)=>({id:uid('wh'),name:i===0?'Almacén principal':`Almacén ${i+1}`,branch:branches[Math.min(i,branches.length-1)].name,type:'General',active:true,capacity:0,occupancy:0}));const roleTemplates=suggestedRoles(form).map((r,i)=>({id:uid('role'),...r}));const ownerRole=roleTemplates.find(r=>r.name==='Propietario');
    db.users.push({id:uidu,name,email,passwordHash:await hashPassword(pwd),companyIds:[cid],createdAt:nowISO(),lastAccess:nowISO(),sessions:[]});
    db.companies.push({id:cid,name:company,legalName:company,rfc:'',currency:f.get('currency')||'MXN',tax:+f.get('tax')||16,industry:f.get('industry')||'General',plan:suggestedPlan(form),theme:'light',brand,visualStyle:brand.style,dashboardPreset:dashboardPreset(form),onboardingComplete:true,businessProfile:profile,branches,roles:roleTemplates,members:[{userId:uidu,roleId:ownerRole.id,branchId:bid,status:'active'}],modules:mods,data:{products:[],customers:[],suppliers:[],sales:[],quotes:[],orders:[],purchases:[],accounts:[],transactions:[],tasks:[],approvals:[],audit:[{id:uid('aud'),at:nowISO(),user:name,action:'Nexo configurado automáticamente',detail:`${f.get('industry')} · ${suggestedPlan(form)}`}],notifications:[{id:uid('nt'),type:'success',title:'Tu Nexo está listo',text:'Configuramos módulos, roles, estructura y apariencia automáticamente.',read:false,at:nowISO(),action:'settings'}],transfers:[],documents:[],receivables:[],payables:[],warehouses,stockMoves:[],returns:[],cashClosings:[],metrics:{revenue:0,profit:0,expenses:0,receivable:0,payable:0,inventoryValue:0,margin:0,monthGrowth:0},trend:[0,0,0,0,0,0,0],branchSales:branches.map(b=>({name:b.name,value:0})),categorySales:[],onboarding:{company:true,branch:true,tax:true,modules:true,team:false,products:false,branding:true,automaticSetup:true}}});saveDB(db);setSession({userId:uidu,companyId:cid});if(typeof enhanceV19==='function')enhanceV19();applyBrand(brand);location.hash='';ui.route='dashboard';render();
  }

  const oldRenderApp=renderApp;renderApp=function(){const c=currentCompany();if(c?.brand)applyBrand(c.brand);oldRenderApp()};
  const oldSettings=settingsPage;settingsPage=function(){const base=oldSettings(),c=currentCompany();if(!c)return base;const b=c.brand||PALETTES.nexo;const block=`<section class="card settings-card brand-settings"><h3>Identidad automática</h3><p class="settings-intro">Nexo aplica estos colores a toda la interfaz de esta empresa.</p><div class="brand-colors-inline"><div class="brand-color-chip"><i style="background:${b.primary}"></i><div><small>Principal</small><strong>${b.primary}</strong></div></div><div class="brand-color-chip"><i style="background:${b.accent}"></i><div><small>Acento</small><strong>${b.accent}</strong></div></div><div class="brand-color-chip"><i style="background:${b.nav}"></i><div><small>Sidebar</small><strong>${b.nav}</strong></div></div></div><div class="setting-row"><div><strong>Configuración automática</strong><small>Módulos, roles, estructura y dashboard fueron definidos por el onboarding.</small></div><span class="badge success">Activa</span></div><div class="setting-row"><div><strong>Dashboard base</strong><small>Prioridad inicial detectada.</small></div><span class="badge info">${esc(c.dashboardPreset||'commercial')}</span></div><button class="btn secondary" onclick="location.hash='#register'">Volver a ver onboarding</button></section>`;return base.replace('</div>',`${block}</div>`)};

  // Aplicar branding al workspace de muestra también.
  const db=loadDB();db.companies.forEach(c=>{c.brand||={...PALETTES.nexo,key:'nexo',style:'modern'};c.dashboardPreset||='commercial'});saveDB(db);if(currentCompany()?.brand)applyBrand(currentCompany().brand);
})();
