/* Nexo v14 Prototipo Completo — capa funcional sin persistencia */
(() => {
  const EXTRA_PERMS=['receivables','payables','transfers','documents','security'];
  EXTRA_PERMS.forEach(p=>{ if(!PERMISSIONS.includes(p)) PERMISSIONS.push(p); });

  // Extiende navegación sin duplicados.
  const hasRoute=r=>NAV.some(([,items])=>items.some(x=>x[0]===r));
  const op=NAV.find(x=>x[0]==='Operación')?.[1];
  const fin=NAV.find(x=>x[0]==='Finanzas')?.[1];
  const emp=NAV.find(x=>x[0]==='Empresa')?.[1];
  if(op&&!hasRoute('transfers')) op.push(['transfers','Transferencias','⇄']);
  if(fin&&!hasRoute('receivables')) fin.splice(1,0,['receivables','Cuentas por cobrar','↙'],['payables','Cuentas por pagar','↗']);
  if(emp&&!hasRoute('documents')) emp.unshift(['documents','Documentos','▱']);
  if(emp&&!hasRoute('security')) emp.push(['security','Seguridad','⬡']);

  const samplePwdHash='588c55f3ce2b8569b153c5abbf13f9f74308b88a20017cc699b835cc93195d16'; // clave de ejemplo temporal
  const dnow=()=>new Date().toISOString();
  const days=n=>new Date(Date.now()+n*86400000).toISOString();
  const safe=(x)=>esc(x??'');
  const roleName=(c,m)=>c.roles.find(r=>r.id===m?.roleId)?.name||'Sin rol';
  const branchName=(c,m)=>c.branches.find(b=>b.id===m?.branchId)?.name||'Todas';

  function enhanceCompany(c,db){
    c.security ||= {minPasswordLength:8,requireUpper:true,requireNumber:true,requireSpecial:false,maxAttempts:5,sessionHours:12,twoFactor:false,ownerProtection:true};
    c.modules ||= Object.fromEntries(PERMISSIONS.map(p=>[p,true]));
    c.data.transfers ||= [
      {id:'tr1',folio:'TR-00018',from:'Centro',to:'Valle Dorado',items:6,units:24,status:'in_transit',createdAt:days(-1),expected:days(0)},
      {id:'tr2',folio:'TR-00017',from:'Valle Dorado',to:'Centro',items:3,units:12,status:'received',createdAt:days(-5),expected:days(-4)}
    ];
    c.data.documents ||= [
      {id:'doc1',name:'Constancia de situación fiscal.pdf',category:'Fiscal',size:'246 KB',owner:'Mariana Torres',createdAt:days(-20)},
      {id:'doc2',name:'Lista de precios septiembre.xlsx',category:'Comercial',size:'84 KB',owner:'Laura Méndez',createdAt:days(-4)},
      {id:'doc3',name:'Política de crédito clientes.pdf',category:'Operación',size:'128 KB',owner:'Mariana Torres',createdAt:days(-30)}
    ];
    c.data.receivables ||= c.data.customers.filter(x=>+x.balance>0).map((x,i)=>({id:'ar'+i,customer:x.name,folio:`CXC-${String(i+31).padStart(5,'0')}`,amount:+x.balance,paid:0,due:days(i-1),status:i===0?'overdue':'open'}));
    c.data.payables ||= c.data.suppliers.filter(x=>+x.balance>0).map((x,i)=>({id:'ap'+i,supplier:x.name,folio:`CXP-${String(i+18).padStart(5,'0')}`,amount:+x.balance,paid:0,due:days(i+2),status:'open'}));
    c.data.passwordEvents ||= [];
    c.roles.forEach(r=>{
      if(r.name==='Propietario') EXTRA_PERMS.forEach(p=>{if(!r.permissions.includes(p))r.permissions.push(p)});
      if(r.name==='Administrador') EXTRA_PERMS.filter(p=>p!=='security').forEach(p=>{if(!r.permissions.includes(p))r.permissions.push(p)});
    });
    c.members.forEach((m,i)=>{m.status ||= 'active';m.branchId ??= c.branches[i%c.branches.length]?.id||null;m.createdAt ||= c.createdAt||dnow();});
    // Usuarios de ejemplo adicionales para que Equipo/Security se puedan mostrar en serio.
    if(c.id==='cmp_sample'){
      const sampleUsers=[
        ['usr_admin','Carlos Ruiz','carlos@nexo.local','r_admin','br1'],
        ['usr_sales','Laura Méndez','laura@nexo.local','r_sales','br1'],
        ['usr_inv','Diego Luna','diego@nexo.local','r_inv','br2']
      ];
      sampleUsers.forEach(([id,name,email,roleId,branchId],i)=>{
        let u=db.users.find(x=>x.id===id);
        if(!u){u={id,name,email,passwordHash:samplePwdHash,companyIds:[c.id],createdAt:days(-70+i*8),lastAccess:days(-i),lastPasswordChange:days(-35),failedAttempts:0,sessions:[{id:'ses_'+id,device:i===0?'Chrome · Windows':'Nexo móvil · Android',ip:'192.168.1.'+(20+i),lastSeen:days(-i),current:false}]};db.users.push(u)}
        if(!c.members.some(m=>m.userId===id)) c.members.push({userId:id,roleId,branchId,status:'active',createdAt:u.createdAt});
      });
      const owner=db.users.find(x=>x.id==='usr_sample'); if(owner){owner.lastAccess ||= dnow();owner.lastPasswordChange ||= days(-20);owner.sessions ||= [{id:'ses_owner',device:'Chrome · Windows',ip:'192.168.1.10',lastSeen:dnow(),current:true}]}
      const om=c.members.find(m=>m.userId==='usr_sample');if(om&&!om.branchId)om.branchId=c.branches[0]?.id;
    }
  }
  function enhanceAll(){const db=loadDB();db.companies.forEach(c=>enhanceCompany(c,db));saveDB(db)}
  enhanceAll();

  const oldEnterSample=enterSampleWorkspace;
  enterSampleWorkspace=async function(){await oldEnterSample();enhanceAll();renderApp()};

  // Login con cuenta desactivada/bloqueada y registro de último acceso.
  loginSubmit=async function(e){
    e.preventDefault();const f=new FormData(e.target),email=String(f.get('email')).trim().toLowerCase();
    if(email===SAMPLE_EMAIL)return enterSampleWorkspace();
    const ph=await hashPassword(f.get('password'));const db=loadDB(),u=db.users.find(x=>x.email===email);
    if(!u||u.passwordHash!==ph)return document.getElementById('authMsg').innerHTML='<div class="error">Correo o contraseña incorrectos.</div>';
    const companyId=u.companyIds?.[0],c=db.companies.find(x=>x.id===companyId),m=c?.members.find(x=>x.userId===u.id);
    if(!c||!m)return document.getElementById('authMsg').innerHTML='<div class="error">No tienes acceso a una empresa activa.</div>';
    if(m.status!=='active')return document.getElementById('authMsg').innerHTML='<div class="error">Esta cuenta está desactivada. Contacta a un administrador.</div>';
    u.lastAccess=dnow();u.sessions ||= [];u.sessions.unshift({id:uid('ses'),device:'Navegador web',ip:'Sesión local',lastSeen:dnow(),current:true});u.sessions=u.sessions.slice(0,5);saveDB(db);
    setSession({userId:u.id,companyId});location.hash='';render();
  };

  const oldRenderPage=renderPage;
  renderPage=function(){
    switch(ui.route){
      case'receivables':return receivablesPage();case'payables':return payablesPage();case'transfers':return transfersPage();case'documents':return documentsPage();case'security':return securityPage();
      default:return oldRenderPage();
    }
  };

  usersPage=function(){
    const db=loadDB(),c=currentCompany();
    return `${pageHead('Equipo','Administra cuentas, roles, sucursales y seguridad de acceso.',`<button class="btn secondary" onclick="exportCSV('audit')">Exportar actividad</button><button class="btn primary" onclick="openModal('user')">＋ Agregar usuario</button>`)}
    <div class="kpi-grid user-kpis">${kpi('Usuarios',c.members.length,'Cuentas registradas')}${kpi('Activos',c.members.filter(m=>m.status==='active').length,'Con acceso')}${kpi('Suspendidos',c.members.filter(m=>m.status!=='active').length,'Sin acceso')}${kpi('Roles',c.roles.length,'Perfiles configurados')}</div>
    <section class="card table-card"><div class="table-tools"><input placeholder="Buscar usuario…" oninput="filterTable(this.value,'usersTable')"><span class="badge info">Contraseñas nunca visibles</span></div><div class="table-wrap"><table id="usersTable"><thead><tr><th>Usuario</th><th>Rol</th><th>Sucursal</th><th>Último acceso</th><th>Estado</th><th></th></tr></thead><tbody>${c.members.map(m=>{const u=db.users.find(x=>x.id===m.userId);return `<tr><td><div class="user-cell"><span>${initials(u?.name)}</span><div><strong>${safe(u?.name||'Usuario')}</strong><small>${safe(u?.email||'—')}</small></div></div></td><td>${safe(roleName(c,m))}</td><td>${safe(branchName(c,m))}</td><td>${u?.lastAccess?fmtDate(u.lastAccess):'Nunca'}</td><td><span class="badge ${m.status==='active'?'success':'danger'}">${m.status==='active'?'Activo':'Desactivado'}</span></td><td><button class="tiny" onclick="showUser('${m.userId}')">Administrar →</button></td></tr>`}).join('')}</tbody></table></div></section>`;
  };

  window.showUser=id=>{ui.modal={type:'userView',id};renderApp()};

  function receivablesPage(){const d=data(),rows=d.receivables||[];const open=rows.reduce((s,x)=>s+(+x.amount-+x.paid),0);const overdue=rows.filter(x=>x.status==='overdue');return `${pageHead('Cuentas por cobrar','Cobranza, vencimientos y saldos de clientes.',`<button class="btn primary" onclick="openModal('receivable')">＋ Cuenta por cobrar</button>`)}<div class="kpi-grid">${kpi('Saldo pendiente',money(open),`${rows.length} documentos`)}${kpi('Vencido',money(overdue.reduce((s,x)=>s+(x.amount-x.paid),0)),`${overdue.length} vencidos`,'warn')}${kpi('Por vencer 7 días',money(rows.filter(x=>new Date(x.due)>new Date()).reduce((s,x)=>s+(x.amount-x.paid),0)),'Seguimiento')}${kpi('Cobranza','92.4%','Eficiencia','good')}</div>${ledgerTable(rows,'receivable')}`}
  function payablesPage(){const rows=data().payables||[];const open=rows.reduce((s,x)=>s+(+x.amount-+x.paid),0);return `${pageHead('Cuentas por pagar','Compromisos con proveedores y programación de pagos.',`<button class="btn primary" onclick="openModal('payable')">＋ Cuenta por pagar</button>`)}<div class="kpi-grid">${kpi('Saldo pendiente',money(open),`${rows.length} documentos`)}${kpi('Próximos 7 días',money(rows.reduce((s,x)=>s+(x.amount-x.paid),0)),'Programado')}${kpi('Vencido',money(rows.filter(x=>x.status==='overdue').reduce((s,x)=>s+x.amount-x.paid,0)),'Control')}${kpi('Proveedores',data().suppliers.length,'Activos')}</div>${ledgerTable(rows,'payable')}`}
  function ledgerTable(rows,type){return `<section class="card table-card"><div class="table-wrap"><table><thead><tr><th>Folio</th><th>${type==='receivable'?'Cliente':'Proveedor'}</th><th>Vencimiento</th><th>Total</th><th>Saldo</th><th>Estado</th><th></th></tr></thead><tbody>${rows.map(x=>`<tr><td><b>${x.folio}</b></td><td>${safe(type==='receivable'?x.customer:x.supplier)}</td><td>${fmtDate(x.due)}</td><td>${money(x.amount)}</td><td><b>${money(x.amount-x.paid)}</b></td><td><span class="badge ${x.status==='overdue'?'danger':'info'}">${x.status==='overdue'?'Vencida':'Abierta'}</span></td><td><button class="tiny" onclick="registerPayment('${type}','${x.id}')">Registrar pago</button></td></tr>`).join('')}</tbody></table></div></section>`}
  window.registerPayment=(type,id)=>{mutate(c=>{const arr=type==='receivable'?c.data.receivables:c.data.payables;const x=arr.find(v=>v.id===id);if(x){x.paid=x.amount;x.status='paid'}});audit('Pago registrado',`${type} ${id}`);toast('Pago aplicado');renderApp()};

  function transfersPage(){const rows=data().transfers||[];return `${pageHead('Transferencias','Movimiento de inventario entre sucursales y almacenes.',`<button class="btn primary" onclick="openModal('transfer')">＋ Nueva transferencia</button>`)}<div class="cards-grid">${rows.map(x=>`<article class="card transfer-card"><div class="entity-head"><span class="entity-avatar branch">⇄</span><div><h3>${x.folio}</h3><small>${safe(x.from)} → ${safe(x.to)}</small></div><span class="badge ${x.status==='received'?'success':'warning'}">${x.status==='received'?'Recibida':'En tránsito'}</span></div><div class="entity-metrics"><div><small>Productos</small><strong>${x.items}</strong></div><div><small>Unidades</small><strong>${x.units}</strong></div></div><div class="entity-foot"><span>${fmtDate(x.createdAt)} · entrega ${fmtDate(x.expected)}</span>${x.status!=='received'?`<button class="tiny" onclick="receiveTransfer('${x.id}')">Marcar recibida</button>`:'<b>Completada</b>'}</div></article>`).join('')}</div>`}
  window.receiveTransfer=id=>{mutate(c=>{const x=c.data.transfers.find(v=>v.id===id);if(x)x.status='received'});audit('Transferencia recibida',id);toast('Transferencia completada')};

  function documentsPage(){const docs=data().documents||[];return `${pageHead('Documentos','Archivos empresariales vinculados a la operación.',`<button class="btn primary" onclick="openModal('document')">＋ Agregar documento</button>`)}<div class="document-grid">${docs.map(x=>`<article class="card doc-card"><span class="doc-icon">▱</span><div><h3>${safe(x.name)}</h3><p>${safe(x.category)} · ${safe(x.size||'Archivo')}</p><small>${safe(x.owner)} · ${fmtDate(x.createdAt)}</small></div><button class="tiny" onclick="toast('Vista previa disponible en versión conectada')">Ver</button></article>`).join('')}</div>`}

  function securityPage(){const c=currentCompany(),db=loadDB(),u=currentUser(),sessions=(u.sessions||[]);return `${pageHead('Seguridad','Políticas, sesiones y protección de acceso.','')}<div class="security-grid"><form id="securityForm" class="card settings-card"><h3>Política de acceso</h3><label>Longitud mínima de contraseña<input name="minPasswordLength" type="number" min="6" max="32" value="${c.security.minPasswordLength}"></label><div class="setting-row"><div><strong>Mayúscula obligatoria</strong><small>Exigir al menos una letra mayúscula.</small></div><input type="checkbox" name="requireUpper" ${c.security.requireUpper?'checked':''}></div><div class="setting-row"><div><strong>Número obligatorio</strong><small>Exigir al menos un número.</small></div><input type="checkbox" name="requireNumber" ${c.security.requireNumber?'checked':''}></div><div class="setting-row"><div><strong>2FA</strong><small>Configuración visual del prototipo; no conecta a un proveedor 2FA.</small></div><input type="checkbox" name="twoFactor" ${c.security.twoFactor?'checked':''}></div><label>Duración de sesión (horas)<input name="sessionHours" type="number" min="1" max="168" value="${c.security.sessionHours}"></label><button class="btn primary">Guardar política</button></form><section class="card settings-card"><h3>Mis sesiones</h3>${sessions.length?sessions.map(s=>`<div class="session-row"><span>▣</span><div><strong>${safe(s.device)}</strong><small>${safe(s.ip)} · ${fmtDate(s.lastSeen)}</small></div><span class="badge ${s.current?'success':'info'}">${s.current?'Actual':'Activa'}</span></div>`).join(''):'<p>No hay sesiones registradas.</p>'}<button class="btn secondary" onclick="forceLogoutOthers('${u.id}')">Cerrar otras sesiones</button></section></div><section class="card security-note"><div><span>⬡</span><div><h3>Las contraseñas no se pueden consultar</h3><p>Nexo solo permite restablecerlas. En producción la autenticación debe vivir en un proveedor seguro y las contraseñas se almacenan como hash, nunca en texto visible.</p></div></div></section>`}

  const oldRenderModal=renderModal;
  renderModal=function(){
    const t=ui.modal.type,d=data(),c=currentCompany(),db=loadDB();
    if(t==='userView'){
      const u=db.users.find(x=>x.id===ui.modal.id),m=c.members.find(x=>x.userId===u?.id),r=c.roles.find(x=>x.id===m?.roleId);if(!u||!m)return '';
      const isOwner=r?.name==='Propietario',isSelf=u.id===currentUser().id;
      return `<div class="modal-back" onclick="if(event.target===this)closeModal()"><div class="modal detail-modal user-admin-modal"><header><div><span class="entity-avatar">${initials(u.name)}</span><div><h2>${safe(u.name)}</h2><p>${safe(u.email)}</p></div></div><button onclick="closeModal()">×</button></header><div class="detail-kpis">${kpi('Estado',m.status==='active'?'Activo':'Desactivado')}${kpi('Rol',safe(r?.name||'—'))}${kpi('Sucursal',safe(branchName(c,m)))}${kpi('Último acceso',u.lastAccess?fmtDate(u.lastAccess):'Nunca')}</div><div class="detail-body user-admin-body"><section><h3>Acceso y asignación</h3><form id="userEditForm"><input type="hidden" name="userId" value="${u.id}"><label>Nombre<input name="name" value="${safe(u.name)}"></label><label>Correo<input name="email" type="email" value="${safe(u.email)}"></label><div class="two"><label>Rol<select name="roleId">${c.roles.map(x=>`<option value="${x.id}" ${x.id===m.roleId?'selected':''}>${safe(x.name)}</option>`).join('')}</select></label><label>Sucursal<select name="branchId"><option value="">Todas</option>${c.branches.map(x=>`<option value="${x.id}" ${x.id===m.branchId?'selected':''}>${safe(x.name)}</option>`).join('')}</select></label></div><button class="btn primary">Guardar usuario</button></form></section><section><h3>Seguridad</h3><div class="security-actions"><button class="btn secondary" onclick="resetUserPassword('${u.id}')">Restablecer contraseña</button><button class="btn secondary" onclick="forceLogoutOthers('${u.id}')">Cerrar sesiones</button>${!isSelf&&!isOwner?`<button class="btn ${m.status==='active'?'warning-btn':'secondary'}" onclick="toggleUserStatus('${u.id}')">${m.status==='active'?'Desactivar cuenta':'Reactivar cuenta'}</button><button class="btn danger-btn" onclick="deleteUserAccount('${u.id}')">Eliminar cuenta</button>`:`<div class="owner-lock">⬡ ${isOwner?'El propietario principal está protegido.':'No puedes desactivar tu propia sesión.'}</div>`}</div><div class="password-explain"><strong>Contraseña</strong><p>No es visible para administradores. Solo puede generarse una nueva contraseña temporal.</p><small>Último cambio: ${u.lastPasswordChange?fmtDate(u.lastPasswordChange):'Sin registro'}</small></div></section></div></div></div>`;
    }
    if(t==='tempPassword')return `<div class="modal-back"><div class="modal"><header><h2>Nueva contraseña temporal</h2><button onclick="closeModal()">×</button></header><div class="temp-password"><p>Compártela de forma segura. Se muestra una sola vez durante esta sesión.</p><code>${safe(ui.modal.password)}</code><button class="btn primary" onclick="navigator.clipboard?.writeText('${safe(ui.modal.password)}');toast('Copiada')">Copiar contraseña</button></div></div></div>`;
    if(['receivable','payable','transfer','document'].includes(t)){
      const cfg={receivable:['Nueva cuenta por cobrar',formFields([['customer','Cliente'],['amount','Importe','number'],['due','Vencimiento','date']])],payable:['Nueva cuenta por pagar',formFields([['supplier','Proveedor'],['amount','Importe','number'],['due','Vencimiento','date']])],transfer:['Nueva transferencia',formFields([['from','Origen'],['to','Destino'],['items','Productos','number'],['units','Unidades','number']])],document:['Agregar documento',formFields([['name','Nombre del archivo'],['category','Categoría'],['size','Tamaño']])]}[t];
      return `<div class="modal-back" onclick="if(event.target===this)closeModal()"><div class="modal"><header><h2>${cfg[0]}</h2><button onclick="closeModal()">×</button></header><form id="modalForm" class="modal-form">${cfg[1]}<footer><button type="button" class="btn secondary" onclick="closeModal()">Cancelar</button><button class="btn primary">Guardar</button></footer></form></div></div>`;
    }
    return oldRenderModal();
  };

  const oldModalSubmit=modalSubmit;
  modalSubmit=async function(f){
    const t=ui.modal.type,o=Object.fromEntries(f);
    if(!['receivable','payable','transfer','document'].includes(t))return oldModalSubmit(f);
    mutate(c=>{const d=c.data;if(t==='receivable')d.receivables.unshift({id:uid('cxc'),folio:`CXC-${String(d.receivables.length+40).padStart(5,'0')}`,customer:o.customer,amount:+o.amount,paid:0,due:new Date(o.due).toISOString(),status:'open'});if(t==='payable')d.payables.unshift({id:uid('cxp'),folio:`CXP-${String(d.payables.length+25).padStart(5,'0')}`,supplier:o.supplier,amount:+o.amount,paid:0,due:new Date(o.due).toISOString(),status:'open'});if(t==='transfer')d.transfers.unshift({id:uid('tr'),folio:`TR-${String(d.transfers.length+19).padStart(5,'0')}`,from:o.from,to:o.to,items:+o.items,units:+o.units,status:'in_transit',createdAt:dnow(),expected:days(1)});if(t==='document')d.documents.unshift({id:uid('doc'),name:o.name,category:o.category,size:o.size||'Archivo',owner:currentUser().name,createdAt:dnow()})});audit('Registro creado',t);ui.modal=null;toast('Guardado correctamente')
  };

  window.toggleUserStatus=id=>{const db=loadDB(),c=db.companies.find(x=>x.id===getSession().companyId),m=c.members.find(x=>x.userId===id),r=c.roles.find(x=>x.id===m?.roleId);if(!m||r?.name==='Propietario'||id===currentUser().id)return toast('Esta cuenta está protegida');m.status=m.status==='active'?'disabled':'active';saveDB(db);audit(m.status==='active'?'Usuario reactivado':'Usuario desactivado',id);ui.modal=null;toast(m.status==='active'?'Usuario reactivado':'Usuario desactivado')};
  window.forceLogoutOthers=id=>{const db=loadDB(),u=db.users.find(x=>x.id===id);if(u){u.sessions=(u.sessions||[]).filter(s=>s.current&&id===currentUser().id);saveDB(db);audit('Sesiones cerradas',u.email)}toast('Sesiones cerradas')};
  window.resetUserPassword=async id=>{const chars='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#',bytes=new Uint32Array(12);crypto.getRandomValues(bytes);const pwd=[...bytes].map(x=>chars[x%chars.length]).join('');const db=loadDB(),u=db.users.find(x=>x.id===id);if(!u)return;u.passwordHash=await hashPassword(pwd);u.lastPasswordChange=dnow();u.sessions=[];saveDB(db);audit('Contraseña restablecida',u.email);ui.modal={type:'tempPassword',password:pwd};renderApp()};
  window.deleteUserAccount=id=>{const db=loadDB(),c=db.companies.find(x=>x.id===getSession().companyId),m=c.members.find(x=>x.userId===id),r=c.roles.find(x=>x.id===m?.roleId),u=db.users.find(x=>x.id===id);if(!m||r?.name==='Propietario'||id===currentUser().id)return toast('Esta cuenta no se puede eliminar');if(!confirm(`Eliminar el acceso de ${u?.name}? El historial de actividad se conservará.`))return;c.members=c.members.filter(x=>x.userId!==id);if(u){u.companyIds=(u.companyIds||[]).filter(x=>x!==c.id);if(!u.companyIds.length)db.users=db.users.filter(x=>x.id!==id)}saveDB(db);audit('Cuenta eliminada',u?.email||id);ui.modal=null;toast('Cuenta eliminada')};

  document.addEventListener('submit',async e=>{
    if(e.target.id==='userEditForm'){e.preventDefault();const f=Object.fromEntries(new FormData(e.target)),db=loadDB(),c=db.companies.find(x=>x.id===getSession().companyId),u=db.users.find(x=>x.id===f.userId),m=c.members.find(x=>x.userId===f.userId);if(u&&m){u.name=f.name.trim();u.email=f.email.trim().toLowerCase();m.roleId=f.roleId;m.branchId=f.branchId||null;saveDB(db);audit('Usuario actualizado',u.email);ui.modal=null;toast('Usuario actualizado')} }
    if(e.target.id==='securityForm'){e.preventDefault();const fd=new FormData(e.target);mutate(c=>{c.security.minPasswordLength=+fd.get('minPasswordLength')||8;c.security.sessionHours=+fd.get('sessionHours')||12;c.security.requireUpper=fd.has('requireUpper');c.security.requireNumber=fd.has('requireNumber');c.security.twoFactor=fd.has('twoFactor')});audit('Política de seguridad actualizada','Empresa');toast('Seguridad guardada')}
  });

  // Añade accesos rápidos a command palette.
  const oldCommandItems=commandItems;
  commandItems=function(items){const base=oldCommandItems(items);const extras=[['users','Administrar usuarios'],['security','Políticas de seguridad'],['receivables','Revisar cobranza'],['payables','Revisar pagos'],['transfers','Nueva transferencia']].filter(x=>can(x[0])).map(x=>`<button onclick="go('${x[0]}');ui.command=false"><i>⌘</i><div><strong>${x[1]}</strong><small>Acción rápida</small></div><span>↵</span></button>`).join('');return base+extras};

  // Sin service worker: el prototipo no conserva datos ni caché de aplicación intencionalmente.
  enhanceAll();
  if(currentUser()) renderApp();
})();
