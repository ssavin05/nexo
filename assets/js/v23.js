/* Nexo v23 — Crear empresa con configuración por niveles (Básica / Estándar / Máxima). El asistente SOLO se abre desde "Crear empresa". */
(()=>{
const PERSIST=true,KEY='nexo_v23';
const persist=()=>{if(PERSIST)try{localStorage.setItem(KEY,JSON.stringify({db:MEMORY_DB,session:MEMORY_SESSION}))}catch(e){}};
if(PERSIST){try{const s=JSON.parse(localStorage.getItem(KEY)||'null');if(s&&s.db){MEMORY_DB=s.db;MEMORY_SESSION=s.session}}catch(e){}
 const sd=saveDB,ss=setSession;saveDB=function(d){sd(d);persist()};setSession=function(s){ss(s);persist()}}
const LV={b:'Básica',s:'Estándar',m:'Personalización máxima'};
const TYPES=[['Tienda de abarrotes','retail','🛒'],['Tienda de ropa','cloth','👕'],['Productos de limpieza','retail','🧴'],['Restaurante','food','🍽️'],['Cafetería','food','☕'],['Taquería','food','🌮'],['Comida rápida','food','🍔'],['Panadería','food','🥖'],['Ferretería','hard','🔧'],['Refaccionaria','hard','⚙️'],['Papelería','retail','📎'],['Farmacia','retail','💊'],['Salón / barbería','serv','💈'],['Taller','serv','🛠️'],['Distribuidora','whole','🚚'],['Mayorista','whole','📦'],['Mayoreo y menudeo','whole','🏬'],['Servicios','serv','🧾'],['Negocio en línea','retail','🌐'],['Otro','other','✨']];
const guess=t=>/taquer|restaur|caf[eé]|pizz|comida|panad|fonda|helad/i.test(t)?'food':/ropa|boutique|zapat|calzado|moda/i.test(t)?'cloth':/ferret|refacc|autopart/i.test(t)?'hard':/mayor|distrib/i.test(t)?'whole':/salon|barber|taller|servic|consult|cl[ií]nica|spa|gym/i.test(t)?'serv':'other';
const T=a=>TYPES.find(t=>t[0]===a.type),G=a=>T(a)&&a.type!=='Otro'?T(a)[1]:guess(a.other||a.type||'');
const O=a=>G(a)==='serv'?'s':({Servicios:'s',Ambos:'b'}[a.offer]||'p');
const SPEC={food:['Mesas','Comandas','Cocina','Delivery','Ingredientes y recetas','Extras y modificadores','Propinas'],cloth:['Tallas','Colores','Marcas','Variantes','Cambios y devoluciones'],whole:['Precios de mayoreo y menudeo','Listas de precios','Crédito a clientes','Rutas de entrega','Vendedores y comisiones','Cajas / paquetes / piezas'],hard:['Código de barras','SKU','Marcas','Compatibilidades','Unidades de medida','Productos equivalentes'],serv:['Citas y agenda','Cotizaciones','Técnicos o empleados','Historial del cliente'],retail:['Código de barras','Marcas y categorías','Unidades de medida','Productos por caja o paquete'],other:['Categorías','Cotizaciones','Pedidos','Entregas']};
const yn=['Sí','No'],has=(a,k,x)=>(Array.isArray(a[k])?a[k]:[]).some(v=>v.includes(x));
const PF=['SKU','Código de barras','Categoría','Marca','Descripción','Imagen','Costo','Precio de mayoreo','Precio de menudeo','Existencia','Inventario mínimo','Unidad','Peso','Tamaño','Color','Talla','Variante','Proveedor','Ubicación'];
const CF=['Teléfono','Correo','Dirección','Ciudad','RFC','Crédito y límite','Saldo','Historial','Notas'];
const prod=a=>O(a)!=='s',isFood=a=>G(a)==='food';
const ST=[
{id:'acct',kind:'acct',lvl:'bsm',when:()=>!getSession(),q:()=>'Primero crea tu cuenta de propietario.'},
{id:'company',kind:'text',lvl:'bsm',q:()=>'¿Cómo se llama tu empresa?'},
{id:'type',kind:'type',lvl:'bsm',q:()=>'¿Qué tipo de negocio tienes?'},
{id:'other',kind:'text',lvl:'bsm',when:a=>a.type==='Otro',q:()=>'Cuéntame brevemente qué tipo de negocio es.'},
{id:'op',kind:'one',lvl:'sm',q:()=>'¿Cómo opera tu negocio?',opts:()=>['Un solo local','Varias sucursales','Solo en línea','Móvil / ambulante']},
{id:'mode',kind:'one',lvl:'sm',when:isFood,q:a=>`Perfecto. ${T(a)?T(a)[2]:'🍴'} ¿Trabajas principalmente con mesas, pedidos para llevar, entregas a domicilio o una combinación?`,opts:()=>['Mesas','Para llevar','A domicilio','Combinación']},
{id:'what',kind:'text',lvl:'bsm',q:()=>'¿Qué vendes o qué servicio ofreces? Escríbelo con tus palabras.'},
{id:'offer',kind:'one',lvl:'bsm',when:a=>G(a)==='other',q:()=>'¿Manejas productos, servicios o ambos?',opts:()=>['Productos','Servicios','Ambos']},
{id:'sell',kind:'multi',lvl:'bsm',q:()=>'¿Cómo realizas tus ventas?',opts:()=>['Venta en mostrador','Clientes frecuentes','A domicilio','Por teléfono','Por WhatsApp','Redes sociales','En línea','Por mayoreo','Por menudeo','A empresas','Con pedidos']},
{id:'prod',kind:'multi',lvl:'sm',when:prod,q:()=>'¿Qué información manejas de tus productos?',opts:()=>['Categorías','Marcas','Variantes','Tallas','Colores','Unidades de medida','Códigos y SKU','Código de barras']},
{id:'inv',kind:'one',lvl:'bsm',when:prod,q:()=>'¿Quieres llevar control de inventario?',opts:()=>['Sí','No','Solo de algunos productos']},
{id:'invn',kind:'multi',lvl:'sm',when:a=>prod(a)&&a.inv&&a.inv!=='No',q:()=>'¿Qué necesitas controlar del inventario?',opts:()=>['Entradas y salidas','Existencias','Inventario mínimo y alertas','Ajustes de inventario','Historial de movimientos','Costos y ganancias']},
{id:'spec',kind:'multi',lvl:'sm',q:a=>({food:'Para tu tipo de negocio, ¿qué de esto necesitas?',serv:'Para un negocio de servicios, ¿qué necesitas?'}[G(a)]||'¿Necesitas alguna de estas funciones?'),opts:a=>{let l=SPEC[G(a)]||SPEC.other;if(isFood(a)&&['Para llevar','A domicilio'].includes(a.mode))l=l.filter(x=>x!=='Mesas');if(a.mode==='Mesas')l=l.filter(x=>x!=='Delivery');return l}},
{id:'sales',kind:'multi',lvl:'sm',q:()=>'¿Qué quieres controlar de tus ventas?',opts:()=>['Tickets','Facturas','Ventas a crédito','Devoluciones','Descuentos y promociones','Cortes de caja','Ganancias']},
{id:'pay',kind:'multi',lvl:'bsm',q:()=>'¿Qué métodos de pago aceptas?',opts:()=>['Efectivo','Tarjeta','Transferencia','Mercado Pago','Otro']},
{id:'cust',kind:'one',lvl:'bsm',q:()=>'¿Quieres llevar un registro de tus clientes?',opts:()=>yn},
{id:'custn',kind:'multi',lvl:'sm',when:a=>a.cust==='Sí',q:()=>'¿Qué quieres guardar de tus clientes?',opts:()=>['Teléfono','Dirección','Historial de compras','Crédito y deudas','Historial de pagos','Notas']},
{id:'sup',kind:'one',lvl:'bsm',when:prod,q:()=>'¿Trabajas con proveedores?',opts:()=>yn},
{id:'supn',kind:'multi',lvl:'sm',when:a=>prod(a)&&a.sup==='Sí',q:()=>'¿Qué necesitas de tus proveedores?',opts:()=>['Compras','Costos','Pagos pendientes','Contactos']},
{id:'team',kind:'one',lvl:'sm',q:()=>'¿Tienes empleados o varias personas que utilizan el sistema?',opts:()=>yn},
{id:'teamn',kind:'multi',lvl:'sm',when:a=>a.team==='Sí',q:()=>'¿Qué necesitas para tu equipo?',opts:()=>['Roles y permisos','Ventas por empleado','Corte de caja por empleado','Comisiones','Registro de actividades']},
{id:'ord',kind:'multi',lvl:'sm',when:a=>bp(a).pedidos,q:()=>'Sobre tus pedidos, ¿qué necesitas?',opts:()=>['Estados de pedido','Entregas','Seguimiento']},
{id:'rep',kind:'multi',lvl:'sm',q:()=>'¿Qué reportes te interesan?',opts:()=>['Ventas','Ganancias','Inventario','Compras','Clientes','Productos']},
{id:'menu',kind:'menu',lvl:'m',q:()=>'¿Qué módulos quieres utilizar? Actívalos, desactívalos y arrástralos (o usa ↑↓) para ordenar tu menú.'},
{id:'wid',kind:'wid',lvl:'m',q:()=>'¿Qué quieres ver en tu pantalla principal? Elige y ordena las tarjetas.'},
{id:'pf',kind:'multi',lvl:'m',when:prod,def:()=>['SKU','Categoría','Costo','Existencia','Inventario mínimo'],q:()=>'¿Qué información tendrá cada producto?',opts:()=>PF},
{id:'cuf',kind:'multi',lvl:'m',when:a=>a.cust==='Sí',def:()=>['Teléfono','Dirección','Saldo','Notas'],q:()=>'¿Qué información guardarás de cada cliente?',opts:()=>CF},
{id:'cf',kind:'cf',lvl:'m',q:()=>'¿Necesitas campos personalizados? (ej. "Ruta de entrega" tipo Lista)'},
{id:'roles',kind:'multi',lvl:'m',when:a=>a.team==='Sí',q:()=>'¿Qué roles quieres crear?',opts:()=>['Gerente','Vendedor','Cajero','Almacenista']},
{id:'perm',kind:'multi',lvl:'m',when:a=>a.team==='Sí',q:()=>'¿Qué permisos extra deben tener?',opts:()=>['Descuentos','Inventario','Caja','Reportes','Comisiones']},
{id:'au',kind:'au',lvl:'m',q:()=>'¿Quieres automatizar algo? Activa las reglas que necesites.'}];
/* Perfil */
function build(a){const g=G(a),o=O(a),m=a.mode||'',sp=x=>has(a,'spec',x),sl=x=>has(a,'sales',x),sv=x=>has(a,'sell',x),iv=a.inv&&a.inv!=='No';
return{tipo_negocio:a.type==='Otro'?(a.other||'Otro'):(a.type||'Negocio'),grupo:g,nivel:a.lv,vende:a.what||'',vende_productos:o!=='s',vende_servicios:o!=='p',
mayoreo:g==='whole'||sv('mayoreo')||sp('mayoreo'),menudeo:g==='whole'||sv('menudeo')||sv('mostrador'),
inventario:o!=='s'&&!!iv,alertas_stock:has(a,'invn','mínimo'),historial_movimientos:has(a,'invn','Historial'),
clientes:a.cust==='Sí'||sl('crédito')||g==='serv'||g==='whole',proveedores:a.sup==='Sí',empleados:a.team==='Sí',roles:has(a,'teamn','Roles')||!!(a.roles||[]).length,
comisiones:has(a,'teamn','Comisiones')||sp('comisiones')||has(a,'perm','Comisiones'),actividad:has(a,'teamn','actividades'),
ventas_a_credito:sl('crédito')||sp('Crédito'),facturas:sl('Facturas'),cortes_caja:sl('Cortes')||sv('mostrador'),devoluciones:sl('devoluciones')||sp('devoluciones'),descuentos:sl('Descuentos'),promociones:sl('promociones'),ganancias:sl('Ganancias')||has(a,'invn','ganancias'),
pedidos:sv('pedidos')||sv('WhatsApp')||sv('teléfono')||sp('Pedidos')||g==='whole'||(g==='food'&&m!=='Mesas')||sp('Comandas')||a.op==='Solo en línea',
entregas:sv('domicilio')||sp('Delivery')||sp('Rutas')||sp('Entregas')||m==='A domicilio'||has(a,'ord','Entregas'),
mesas:g==='food'&&m!=='Para llevar'&&m!=='A domicilio'&&sp('Mesas'),comandas:sp('Comandas'),cocina:sp('Cocina'),citas:g==='serv'&&sp('Citas'),cotizaciones:sp('Cotizaciones')||g==='serv',
rutas:sp('Rutas'),recetas:sp('Ingredientes'),variantes:sp('Variantes')||has(a,'prod','Variantes')||sp('Tallas'),codigo_barras:sp('Código')||has(a,'prod','barras'),sucursales:a.op==='Varias sucursales',
metodos_pago:a.pay||['Efectivo'],canales_venta:a.sell||[]}}
const bp=a=>build(a);
/* Catálogo de módulos */
const ITEM=Object.fromEntries(NAV.flatMap(x=>x[1]).map(x=>[x[0],[...x]])),NAV0=JSON.parse(JSON.stringify(NAV));
const FIXED=['dashboard','settings','roles','modules','security','plans','bizconfig'];
const REAL=Object.keys(ITEM).filter(k=>!FIXED.includes(k));
const GEN=[['mesas','Mesas','▦',p=>p.mesas],['comandas','Comandas','▤',p=>p.comandas],['cocina','Cocina','♨',p=>p.cocina],['delivery','Delivery','➤',p=>p.grupo==='food'&&p.entregas],['rutas','Rutas','⌖',p=>p.rutas],['entregas','Entregas','➤',p=>p.entregas&&p.grupo!=='food'],['comisiones','Comisiones','%',p=>p.comisiones],['citas','Citas','◷',p=>p.citas],['recetas','Recetas e ingredientes','❖',p=>p.recetas],['produccion','Producción','⚒',()=>false],['promociones','Promociones','★',p=>p.promociones],['descuentos','Descuentos','％',p=>p.descuentos],['facturacion','Facturación','▧',p=>p.facturas],['cajas','Cajas','▣',p=>p.cortes_caja&&!ITEM.cashclose]];
const LBL={food:{products:'Menú',orders:'Pedidos'},serv:{tasks:'Agenda',products:'Servicios',sales:'Pagos'},whole:{orders:'Pedidos y entregas',receivables:'Crédito'},cloth:{products:'Productos y variantes'}};
const ORD={food:['sales','x_mesas','x_comandas','orders','x_cocina','products','x_recetas','inventory','customers','purchases','suppliers','reports'],whole:['sales','inventory','products','orders','customers','x_entregas','receivables','suppliers','purchases','reports'],serv:['tasks','customers','products','orders','sales','users','reports']},DEF=['sales','products','inventory','customers','suppliers','purchases','orders','quotes','reports'];
const genOf=id=>GEN.find(x=>'x_'+x[0]===id);
const lab=(id,g)=>{const x=genOf(id);if(x)return x[1];return(LBL[g]||{})[id]||ITEM[id]?.[1]||id};
function modsFrom(p){const m=Object.fromEntries(PERMISSIONS.map(k=>[k,false])),on=(...x)=>x.forEach(k=>m[k]=true);
on('dashboard','settings','modules','security','sales','reports','roles');if(p.vende_productos)on('products');
if(p.inventario)on('inventory','warehouses');if(p.historial_movimientos)on('stockmoves');
if(p.proveedores)on('suppliers','purchases','payables');if(p.clientes)on('customers');
if(p.ventas_a_credito)on('customers','receivables','finance');if(p.ganancias||p.cortes_caja)on('finance');if(p.cortes_caja)on('cashclose');
if(p.devoluciones)on('returns');if(p.pedidos||p.entregas||p.comandas||p.mesas||p.cocina||p.citas)on('orders');if(p.cotizaciones)on('quotes');
if(p.citas||p.grupo==='serv')on('tasks');if(p.empleados)on('users','tasks');if(p.actividad)on('audit');if(p.sucursales)on('branches','transfers');return m}
function recMenu(a){const p=build(a),m=modsFrom(p),g=p.grupo,ord=ORD[g]||DEF,all=[...REAL,...GEN.map(x=>'x_'+x[0])];
const ids=[...new Set([...ord,...all])].filter(i=>all.includes(i));
return ids.map(id=>({id,on:genOf(id)?!!genOf(id)[3](p):!!m[id]&&id!=='warehouses'}))}
const WD=[['vd','Ventas del día','k'],['vm','Ventas del mes','k'],['gan','Ganancias','k'],['pv','Productos vendidos','k'],['bajo','Productos con poco inventario','l'],['pp','Pedidos pendientes','k'],['cn','Clientes nuevos','k'],['cxc','Cuentas por cobrar','k'],['comp','Compras recientes','l'],['ent','Entregas pendientes','k'],['top','Productos más vendidos','l'],['emp','Empleados','k'],['com','Comisiones','k'],['graf','Gráficas','g']];
function recWid(a){const g=G(a),pick={food:['vd','vm','pp','ent','bajo','gan'],whole:['vd','vm','cxc','pp','ent','bajo','top','gan','graf'],serv:['vd','vm','cn','cxc','emp','gan'],cloth:['vd','vm','gan','bajo','top','graf']}[g]||['vd','vm','gan','bajo','cxc','graf'];
return[...pick,...WD.map(x=>x[0]).filter(x=>!pick.includes(x))].map(id=>({id,on:pick.includes(id)}))}
const defAu=()=>({stock:{on:false,x:5},sale:{on:false},debt:{on:false},order:{on:false}});
/* Aplicar a la empresa */
const modsOf=(menu,p)=>{const m=Object.fromEntries(PERMISSIONS.map(k=>[k,false]));['dashboard','settings','roles','modules','security','plans'].forEach(k=>{if(k in m)m[k]=true});menu.filter(i=>i.on&&!i.id.startsWith('x_')).forEach(i=>m[i.id]=true);
if(m.inventory){m.warehouses=true}return m};
function rolesFor(a,mods){const r=[{id:uid('role'),name:'Propietario',permissions:[...PERMISSIONS],system:true}],ok=x=>PERMISSIONS.includes(x)&&mods[x];
const base={Gerente:PERMISSIONS.filter(x=>!['roles'].includes(x)&&mods[x]),Vendedor:['dashboard','sales','quotes','orders','customers','products'],Cajero:['dashboard','sales','customers'],Almacenista:['dashboard','inventory','products','purchases','suppliers']};
(a.roles||[]).forEach(n=>{let p=(base[n]||[]).filter(ok);const f=x=>has(a,'perm',x);if(f('Reportes'))p.push('reports');if(f('Caja')&&n!=='Almacenista')p.push('finance','cashclose');if(f('Inventario')&&n!=='Almacenista')p.push('inventory');r.push({id:uid('role'),name:n,permissions:[...new Set(p.filter(ok))]})});return r}
function applySetup(c){const s=c.setup;c.modules=modsOf(s.menu);c.industry=s.profile.tipo_negocio;c.businessProfile=c.businessProfile||{}}
/* Navegación */
function buildNav(){const c=currentCompany(),s=c?.setup;NAV.splice(0,NAV.length,...NAV0.map(x=>[x[0],x[1].map(i=>[...i])]));
const emp=NAV.find(x=>x[0]==='Empresa');if(emp&&!emp[1].some(i=>i[0]==='bizconfig'))emp[1].push(['bizconfig','Personalización de empresa','✦']);
if(!s?.menu)return;const g=s.profile.grupo,items=s.menu.filter(i=>i.on).map(i=>{const x=genOf(i.id);return[i.id,lab(i.id,g),x?x[2]:(ITEM[i.id]||[])[2]||'•']});
const em=NAV.find(x=>x[0]==='Empresa');NAV.splice(0,NAV.length,['General',[ITEM.dashboard||['dashboard','Inicio','⌂']]],['Tu negocio',items],em)}
const _ra=renderApp;renderApp=function(){evalAutos();buildNav();_ra();coMenu()};
const _can=can;can=function(p){if(p==='bizconfig')return _can('settings');if(String(p).startsWith('x_'))return !!currentCompany()?.setup?.menu?.find(i=>i.id===p&&i.on);return _can(p)};
const _rp=renderPage;renderPage=function(){const r=ui.route;return r==='bizconfig'?cfgPage():String(r).startsWith('x_')?xPage(r):_rp()};
/* Dashboard por tarjetas */
const sum=r=>r.reduce((a,b)=>a+(+b.total||0),0),same=(d,f)=>new Date(d).toDateString()===new Date().toDateString(),mon=d=>{const x=new Date(d),n=new Date();return x.getMonth()===n.getMonth()&&x.getFullYear()===n.getFullYear()};
const _dash=dashboard;dashboard=function(){const c=currentCompany(),w=c?.setup?.wid;if(!w)return _dash();const d=data(),m=d.metrics||{},L=(t,rows)=>`<section class="card"><div class="card-head"><div><h3>${t}</h3></div></div>${rows.length?rows.join(''):'<p class="settings-intro">Sin datos todavía.</p>'}</section>`;
const F={vd:()=>['k',money(sum(d.sales.filter(s=>same(s.createdAt)))),'Hoy'],vm:()=>['k',money(sum(d.sales.filter(s=>mon(s.createdAt)))),'Este mes'],gan:()=>['k',money(m.profit),pct(m.margin)+' de margen'],pv:()=>['k',d.sales.length,'Ventas registradas'],pp:()=>['k',d.orders.filter(o=>!['delivered','done','completed'].includes(o.status)).length,'Por atender'],cn:()=>['k',d.customers.filter(x=>x.createdAt&&Date.now()-new Date(x.createdAt)<2592e6).length,'Últimos 30 días'],cxc:()=>['k',money(m.receivable),'Clientes'],ent:()=>['k',d.orders.filter(o=>['ready','preparing'].includes(o.status)).length,'Por entregar'],emp:()=>['k',c.members.length,'Usuarios'],com:()=>['k','$0','Por configurar'],
bajo:()=>['l',L('Poco inventario',d.products.filter(p=>p.type==='Producto'&&p.stock<=p.minStock).slice(0,4).map(p=>`<div class="mini-row"><div><strong>${esc(p.name)}</strong><small>Mínimo ${p.minStock}</small></div><b>${p.stock}</b></div>`))],comp:()=>['l',L('Compras recientes',d.purchases.slice(0,4).map(p=>`<div class="mini-row"><div><strong>${esc(p.supplier)}</strong><small>${p.folio}</small></div><b>${money(p.total)}</b></div>`))],top:()=>['l',L('Más vendidos',(d.categorySales||[]).slice(0,4).map(x=>`<div class="mini-row"><div><strong>${esc(x.name)}</strong></div><b>${x.value}%</b></div>`))],graf:()=>['g','<section class="card chart-card"><div class="card-head"><div><h3>Ingresos</h3></div></div><div class="line-chart" id="lineChart"></div></section>']};
const on=w.filter(i=>i.on&&F[i.id]).map(i=>({id:i.id,r:F[i.id](),l:WD.find(x=>x[0]===i.id)[1]})),ks=on.filter(x=>x.r[0]==='k'),rest=on.filter(x=>x.r[0]!=='k');
return pageHead(esc(c.name),'Tu resumen personalizado.')+(ks.length?`<div class="kpi-grid">${ks.map(x=>kpi(x.l,x.r[1],x.r[2])).join('')}</div>`:'')+(rest.length?`<div class="dashboard-grid thirds">${rest.map(x=>x.r[1]||x.r[1]).join('')}</div>`:'')||_dash()};
/* Automatizaciones */
function evalAutos(){const c=currentCompany(),au=c?.setup?.autos;if(!au)return;const f=c.setup.fired=c.setup.fired||{};const d=c.data;
if(au.stock?.on)d.products.filter(p=>p.type==='Producto'&&p.stock<(+au.stock.x||0)&&!f['s'+p.id]).forEach(p=>{f['s'+p.id]=1;notify('Inventario bajo',`${p.name}: ${p.stock} pzas.`,'danger','inventory')});
if(au.debt?.on)d.customers.filter(x=>x.balance>0&&!f['d'+x.id]).forEach(x=>{f['d'+x.id]=1;notify('Saldo pendiente',`${x.name} debe ${money(x.balance)}.`,'warning','customers')})}
/* Módulos genéricos */
const CT=['Texto','Número','Fecha','Lista','Sí/No','Moneda','Porcentaje','Imagen'],CE=['Productos','Clientes','Módulos nuevos'];
const inp=(f,id)=>f.t==='Lista'?`<select id="${id}">${(f.o||'').split(',').map(x=>`<option>${esc(x.trim())}</option>`).join('')}</select>`:f.t==='Sí/No'?`<select id="${id}"><option>Sí</option><option>No</option></select>`:`<input id="${id}" type="${{Número:'number',Moneda:'number',Porcentaje:'number',Fecha:'date'}[f.t]||'text'}" placeholder="${esc(f.n)}">`;
function xPage(id){const c=currentCompany(),g=c.setup.profile.grupo,rows=(c.data.extra||{})[id]||[],cf=(c.setup.custom||[]).filter(f=>f.e==='Módulos nuevos');
return pageHead(lab(id,g),'Registro simple de este módulo.','')+`<section class="card table-card"><div class="nx-in" style="padding:14px;flex-wrap:wrap"><input id="xn" placeholder="Nombre"><input id="xd" placeholder="Detalle">${cf.map((f,i)=>`<label class="nx-l">${esc(f.n)}${inp(f,'xf'+i)}</label>`).join('')}<button class="btn primary" onclick="NX.xadd('${id}')">＋ Agregar</button></div><div class="table-wrap"><table><thead><tr><th>Nombre</th><th>Detalle</th>${cf.map(f=>`<th>${esc(f.n)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr><td><strong>${esc(r.n)}</strong></td><td>${esc(r.d)}</td>${cf.map(f=>`<td>${esc((r.f||{})[f.n]??'')}</td>`).join('')}</tr>`).join('')}</tbody></table></div></section>`}
/* Estado del asistente */
let W=null;const NXE=s=>esc(s).replace(/\n/g,'<br>');
const act=()=>ST.filter(s=>(W.lv==='m'||s.lvl.includes(W.lv))&&(!s.when||s.when(W.a)));
const cur=()=>act().find(s=>!W.h.includes(s.id));
const show=(s,a)=>{if(s.kind==='type')return a.type==='Otro'&&a.other?a.other:a.type;if(s.kind==='acct')return a[s.id];if(['menu','wid','cf','au'].includes(s.kind))return'Listo ✓';const v=a[s.id];return Array.isArray(v)?(v.join(', ')||'Ninguna'):(v||'—')};
const R=(ns,k)=>ns==='w'?W.a:currentCompany().setup;const key=(ns,k)=>ns==='w'?k:({menu:'menu',wid:'wid'}[k]);
const LST=(ns,k)=>R(ns)[key(ns,k)];
function orderPanel(ns,k){const l=LST(ns,k),g=ns==='w'?G(W.a):currentCompany().setup.profile.grupo;
return `<div class="nx-list">${l.map((it,i)=>`<div class="nx-row" draggable="true" ondragstart="NX.ds('${ns}','${k}',${i})" ondragover="event.preventDefault()" ondrop="NX.dp('${ns}','${k}',${i})"><label><input type="checkbox" ${it.on?'checked':''} onchange="NX.tg('${ns}','${k}',${i})"> <span>⋮⋮</span> ${esc(k==='menu'?lab(it.id,g):WD.find(x=>x[0]===it.id)[1])}</label><span><button onclick="NX.mv('${ns}','${k}',${i},-1)">↑</button><button onclick="NX.mv('${ns}','${k}',${i},1)">↓</button></span></div>`).join('')}</div>`}
function cfPanel(){const l=W.a.cf||[];return `${l.map((f,i)=>`<div class="nx-b bot">${esc(f.n)} · ${f.t}${f.o?' ('+esc(f.o)+')':''} · ${f.e} <button class="link" onclick="NX.cfdel(${i})">✕</button></div>`).join('')}<div class="nx-in" style="flex-wrap:wrap"><input id="cfn" placeholder="Nombre del campo"><select id="cft">${CT.map(x=>`<option>${x}</option>`).join('')}</select><input id="cfo" placeholder="Opciones (si es Lista): Ruta 1, Ruta 2"><select id="cfe">${CE.map(x=>`<option>${x}</option>`).join('')}</select><button class="btn secondary" onclick="NX.cfadd()">+ Crear campo personalizado</button></div>`}
function auPanel(ns){const A=ns==='w'?(W.a.au=W.a.au||defAu()):currentCompany().setup.autos;const row=(k,pre,x,post)=>`<label class="nx-rule"><input type="checkbox" ${A[k].on?'checked':''} onchange="NX.au('${k}',this.checked)"> <span>${pre}${x?` <input type="number" min="0" value="${A.stock.x}" onchange="NX.aux(this.value)" onclick="event.stopPropagation()" style="width:70px">`:''} ${post}</span></label>`;
return `<div class="nx-list">${row('stock','Cuando el inventario sea menor a',1,'→ generar alerta')}${row('sale','Cuando se registre una venta','','→ actualizar inventario')}${row('debt','Cuando un cliente tenga saldo vencido','','→ mostrar alerta')}${row('order','Cuando llegue un pedido','','→ notificar')}</div>`}
function init(st){const a=W.a;if(st.kind==='menu'&&!a.menu)a.menu=recMenu(a);if(st.kind==='wid'&&!a.wid)a.wid=recWid(a);if(st.kind==='cf'&&!a.cf)a.cf=[];if(st.kind==='au'&&!a.au)a.au=defAu()}
/* Pantallas */
function levelScreen(){const c=[['b','🟢','BÁSICA','Quiero comenzar rápidamente','Configuraremos automáticamente las funciones más importantes según el tipo de negocio que tengas.',''],['s','🔵','ESTÁNDAR','Quiero configurar mi negocio','Configura las funciones principales de tu negocio, ventas, inventario, clientes, proveedores y otras herramientas.','Recomendada'],['m','🟣','PERSONALIZACIÓN MÁXIMA','Quiero configurar todo','Elige exactamente qué quieres utilizar, cómo quieres trabajar y qué debe aparecer en tu aplicación.','']];
app.innerHTML=`<div class="nx"><div class="nx-top"><span class="brandmark">N</span><div class="nx-bar"></div><button class="link" onclick="NX.cancel()">Cancelar</button></div><div class="nx-chat"><h2>Vamos a configurar tu nueva empresa</h2><p>¿Qué tan personalizada quieres tu experiencia?</p><div class="nx-levels">${c.map(x=>`<button class="nx-lv ${x[0]==='s'?'rec':''}" onclick="NX.lv('${x[0]}')">${x[5]?`<em>${x[5]}</em>`:''}<b>${x[1]} ${x[2]}</b><strong>${x[3]}</strong><small>${x[4]}</small></button>`).join('')}</div></div></div>`}
function wizRender(){if(!W.lv)return levelScreen();const st=cur(),tot=act().length,pc=Math.round(W.h.length/tot*100);
let body=W.h.map(id=>{const s=ST.find(x=>x.id===id);return `<div class="nx-b bot">${NXE(s.q(W.a))}</div><div class="nx-b me">${esc(show(s,W.a))}</div>`}).join('');
if(!W.h.length)body=`<div class="nx-b bot">¡Hola! 👋 Nivel elegido: <strong>${LV[W.lv]}</strong>. Te haré unas preguntas rápidas para configurar ${W.edit?'tu empresa':'tu nueva empresa'} de acuerdo con lo que realmente necesitas.</div>`+body;
if(st){init(st);if(W.sf!==st.id){W.sel=[...(Array.isArray(W.a[st.id])?W.a[st.id]:(st.def?st.def(W.a):[]))];W.sf=st.id}
body+=`<div class="nx-b bot">${NXE(st.q(W.a))}</div><div class="nx-ctl">`;const k=st.kind,nx='<button class="btn primary" onclick="NX.next()">Continuar →</button>';
if(k==='type')body+=`<div class="nx-chips">${TYPES.map((t,i)=>`<button onclick="NX.type(${i})">${t[2]} ${t[0]}</button>`).join('')}</div><div class="nx-in"><input id="nxIn" placeholder="O escribe tu tipo de negocio…" onkeydown="if(event.key==='Enter')NX.txt()"><button class="btn primary" onclick="NX.txt()">Enviar</button></div>`;
else if(k==='one')body+=`<div class="nx-chips">${st.opts(W.a).map((o,i)=>`<button onclick="NX.one(${i})">${esc(o)}</button>`).join('')}</div>`;
else if(k==='multi')body+=`<div class="nx-chips">${st.opts(W.a).map((o,i)=>`<button class="${W.sel.includes(o)?'on':''}" onclick="NX.tog(${i})">${W.sel.includes(o)?'✓ ':''}${esc(o)}</button>`).join('')}</div>${nx}`;
else if(k==='acct')body+=`<div class="nx-form"><input id="an" placeholder="Nombre completo"><input id="ae" type="email" placeholder="Correo"><input id="ap" type="password" placeholder="Contraseña (mín. 6)"><input id="ac" type="password" placeholder="Confirmar contraseña"><div id="aerr" class="error" style="display:none"></div><button class="btn primary" onclick="NX.acct()">Continuar →</button></div>`;
else if(k==='menu'||k==='wid')body+=orderPanel('w',k)+nx;else if(k==='cf')body+=cfPanel()+nx;else if(k==='au')body+=auPanel('w')+nx;
else body+=`<div class="nx-in"><input id="nxIn" value="${esc(W.a[st.id]||'')}" onkeydown="if(event.key==='Enter')NX.txt()"><button class="btn primary" onclick="NX.txt()">Enviar</button></div>`;
body+='</div>'}else body+=summary();
app.innerHTML=`<div class="nx"><div class="nx-top"><span class="brandmark">N</span><div class="nx-bar"><i style="width:${st?pc:100}%"></i></div><button class="link" onclick="NX.cancel()">Cancelar</button></div><div class="nx-chat">${body}</div></div>`;
const ch=app.querySelector('.nx-chat');ch.lastElementChild?.scrollIntoView({block:'end'});const i=app.querySelector('#nxIn,#an');i&&i.focus()}
function summary(){const a=W.a,p=build(a),Y=v=>v?'Sí':'No',menu=a.menu||recMenu(a),wid=a.wid||recWid(a),on=menu.filter(i=>i.on),ven=[p.mayoreo&&'Mayoreo',p.menudeo&&'Menudeo'].filter(Boolean).join(' y ')||(p.vende_servicios&&!p.vende_productos?'Servicios':'Venta directa');
const rows=[['Tipo de negocio',p.tipo_negocio],['Nivel de personalización',LV[W.lv]],['Módulos activos',on.length],['Dashboard',wid.filter(i=>i.on).length+' tarjetas'],['Menú',on.slice(0,5).map(i=>lab(i.id,p.grupo)).join(' · ')||'—'],['Ventas',ven],['Inventario',Y(p.inventario)],['Clientes',Y(p.clientes)],['Proveedores',Y(p.proveedores)],['Crédito',Y(p.ventas_a_credito)],['Entregas',Y(p.entregas)],['Empleados',Y(p.empleados)]];
return `<div class="nx-b bot"><strong>Así quedará configurada tu empresa</strong></div><div class="nx-sum">${rows.map(([k,v])=>`<div><small>${k}</small><strong>${esc(v)}</strong></div>`).join('')}</div><div id="aerr" class="error" style="display:none"></div><div class="nx-act"><button class="btn secondary" onclick="NX.edit()">Editar configuración</button><button class="btn primary" onclick="NX.finish()">${W.edit?'Guardar cambios':'Crear empresa'}</button></div>`}
const ans=v=>{const st=cur();if(!['menu','wid','cf','au'].includes(st.kind))W.a[st.id]=v;W.h.push(st.id);wizRender()};
const mv=(l,i,d)=>{const j=i+d;if(j<0||j>=l.length)return;[l[i],l[j]]=[l[j],l[i]]};
const after=ns=>{if(ns==='w')return wizRender();mutate(c=>applySetup(c));renderApp()};
async function fin(){const a=W.a;a.lv=W.lv;const p=build(a),menu=a.menu||recMenu(a),wid=a.wid||recWid(a),clean={...a};delete clean.menu;delete clean.wid;delete clean.cf;delete clean.au;
const setup={level:W.lv,profile:p,answers:clean,menu,wid,custom:a.cf||[],autos:a.au||defAu(),fired:{}};
if(W.edit){mutate(c=>{setup.fired=c.setup?.fired||{};c.setup=setup;c.name=a.company||c.name;applySetup(c);const mods=c.modules;if((a.roles||[]).length){rolesFor(a,mods).slice(1).forEach(r=>{if(!c.roles.some(x=>x.name===r.name))c.roles.push(r)})}});audit('Actualizó la personalización',LV[W.lv])}
else{const db=loadDB(),cid=uid('cmp'),bid=uid('br'),mods=modsOf(menu),roles=rolesFor(a,mods);let userId;
if(getSession()){userId=getSession().userId;const u=db.users.find(x=>x.id===userId);u.companyIds=[...(u.companyIds||[]),cid]}
else{const A=W.acct;userId=uid('usr');db.users.push({id:userId,name:A.name,email:A.email,passwordHash:await hashPassword(A.password),companyIds:[cid],createdAt:nowISO(),lastAccess:nowISO(),sessions:[]})}
const name=a.company||'Mi empresa';
db.companies.push({id:cid,name,legalName:name,rfc:'',currency:'MXN',tax:16,industry:p.tipo_negocio,plan:'Prototipo',theme:'light',onboardingComplete:true,setup,modules:mods,branches:[{id:bid,name:'Principal',city:'',address:'',active:true}],roles,members:[{userId,roleId:roles[0].id,branchId:bid,status:'active'}],
data:{products:[],customers:[],suppliers:[],sales:[],quotes:[],orders:[],purchases:[],accounts:[],transactions:[],tasks:[],approvals:[],audit:[],notifications:[{id:uid('nt'),type:'info',title:'Empresa lista',text:'Configuramos tu espacio según tus respuestas.',read:false,at:nowISO(),action:'bizconfig'}],transfers:[],documents:[],receivables:[],payables:[],warehouses:mods.warehouses?[{id:'wh_'+bid,name:'Almacén principal',branch:'Principal',type:'General',active:true,capacity:0,occupancy:0}]:[],stockMoves:[],returns:[],cashClosings:[],extra:{},metrics:{revenue:0,profit:0,expenses:0,receivable:0,payable:0,inventoryValue:0,margin:0,monthGrowth:0},trend:[0,0,0,0,0,0,0],branchSales:[],categorySales:[],onboarding:{company:true,branch:true,tax:true,modules:true,team:false,products:false}}});
saveDB(db);setSession({userId,companyId:cid})}
W=null;location.hash='';ui.route='dashboard';render()}
/* API pública del asistente */
const dragS={};
window.NX={
start:()=>{W={lv:null,a:{},h:[],sel:[],sf:null,pub:!getSession()};wizRender()},
lv:l=>{W.lv=l;W.a.lv=l;wizRender()},
cancel:()=>{const pub=!getSession();W=null;if(pub){location.hash='';}render()},
type:i=>{W.a.other=undefined;ans(TYPES[i][0])},one:i=>ans(cur().opts(W.a)[i]),
tog:i=>{const o=cur().opts(W.a)[i],k=W.sel.indexOf(o);k<0?W.sel.push(o):W.sel.splice(k,1);wizRender()},
next:()=>{const s=cur();ans(s.kind==='multi'?[...W.sel]:true)},
txt:()=>{const v=document.getElementById('nxIn').value.trim();if(!v)return;if(cur().kind==='type'){const m=TYPES.find(t=>t[0].toLowerCase()===v.toLowerCase());if(m&&m[0]!=='Otro')return ans(m[0]);W.a.type='Otro';W.a.other=v;W.h.push('type','other');return wizRender()}ans(v)},
acct:()=>{const g=i=>document.getElementById(i).value.trim(),e=(m)=>{const x=document.getElementById('aerr');x.textContent=m;x.style.display='block'},n=g('an'),em=g('ae').toLowerCase(),p=document.getElementById('ap').value;
if(!n||!em)return e('Completa nombre y correo.');if(p.length<6)return e('La contraseña debe tener al menos 6 caracteres.');if(p!==document.getElementById('ac').value)return e('Las contraseñas no coinciden.');if(loadDB().users.some(u=>u.email===em))return e('Ese correo ya está registrado.');W.acct={name:n,email:em,password:p};ans(n)},
edit:()=>{W.h=[];W.sf=null;wizRender()},
finish:()=>{fin().catch(e=>{const x=document.getElementById('aerr');if(x){x.textContent='No se pudo crear: '+e.message;x.style.display='block'}})},
tg:(ns,k,i)=>{LST(ns,k)[i].on=!LST(ns,k)[i].on;after(ns)},mv:(ns,k,i,d)=>{mv(LST(ns,k),i,d);after(ns)},
ds:(ns,k,i)=>{dragS.i=i},dp:(ns,k,i)=>{const l=LST(ns,k);if(dragS.i==null)return;const [x]=l.splice(dragS.i,1);l.splice(i,0,x);dragS.i=null;after(ns)},
cfadd:()=>{const n=document.getElementById('cfn').value.trim();if(!n)return;W.a.cf.push({n,t:document.getElementById('cft').value,o:document.getElementById('cfo').value.trim(),e:document.getElementById('cfe').value});wizRender()},
cfdel:i=>{W.a.cf.splice(i,1);wizRender()},
au:(k,v)=>{const A=W?W.a.au:currentCompany().setup.autos;A[k].on=v;if(!W){mutate(()=>{});}},aux:v=>{const A=W?W.a.au:currentCompany().setup.autos;A.stock.x=+v||0},
xadd:id=>{const n=document.getElementById('xn').value.trim();if(!n)return;const cf=(currentCompany().setup.custom||[]).filter(f=>f.e==='Módulos nuevos'),f={};cf.forEach((x,i)=>f[x.n]=document.getElementById('xf'+i).value);
mutate(c=>{c.data.extra=c.data.extra||{};(c.data.extra[id]=c.data.extra[id]||[]).unshift({n,d:document.getElementById('xd').value,f})});renderApp()},
relevel:l=>{const s=currentCompany().setup,a={...s.answers,lv:l,menu:l==='m'?s.menu:undefined,wid:l==='m'?s.wid:undefined,cf:s.custom,au:s.autos};W={lv:l,a,h:[],sel:[],sf:null,edit:true};wizRender()},
sw:id=>{setSession({...getSession(),companyId:id});ui.route='dashboard';ui.coMenu=false;renderApp()},
co:()=>{ui.coMenu=!ui.coMenu;renderApp()}};
/* Personalización posterior */
function cfgPage(){const c=currentCompany(),s=c.setup,btn=(l,t)=>`<button class="btn ${s&&s.level===l?'primary':'secondary'}" onclick="NX.relevel('${l}')">${t}</button>`;
if(!s)return pageHead('Personalización de empresa','Esta empresa se creó antes del asistente.','')+`<section class="card settings-card"><p class="settings-intro">Configúrala ahora eligiendo un nivel.</p>${['b','s','m'].map(l=>`<button class="btn secondary" onclick="NX.start2('${l}')">${LV[l]}</button>`).join(' ')}</section>`;
return pageHead('Personalización de empresa','Cambia de nivel o ajusta cualquier opción; el menú y el dashboard se actualizan al instante.','')+`<section class="card settings-card"><h3>${esc(s.profile.tipo_negocio)} · ${LV[s.level]}</h3><p class="settings-intro">Nivel de personalización (solo se abre el asistente al elegir uno):</p><div class="nx-act">${btn('b','🟢 Básica')}${btn('s','🔵 Estándar')}${btn('m','🟣 Personalización máxima')}</div></section><section class="card settings-card"><h3>Módulos y menú</h3><p class="settings-intro">Activa, desactiva y reordena.</p>${orderPanel('c','menu')}</section><section class="card settings-card"><h3>Pantalla principal</h3>${orderPanel('c','wid')}</section><section class="card settings-card"><h3>Automatizaciones</h3>${auPanel('c')}</section>`}
NX.start2=l=>{const c=currentCompany();W={lv:l,a:{company:c.name,lv:l},h:[],sel:[],sf:null,edit:true};wizRender()};
function coMenu(){const u=currentUser(),el=document.querySelector('.company-switch');if(!el||!u)return;el.style.cursor='pointer';el.onclick=NX.co;
if(ui.coMenu){const cs=loadDB().companies.filter(c=>(u.companyIds||[]).includes(c.id)||c.id===currentCompany()?.id);el.insertAdjacentHTML('afterend',`<div class="nx-co">${cs.map(c=>`<button onclick="NX.sw('${c.id}')">${esc(c.name)}</button>`).join('')}<button class="nx-new" onclick="ui.coMenu=false;NX.start()">＋ Crear empresa</button></div>`)}}
/* Flujo: el asistente solo aparece desde "Crear empresa" */
renderRegister=function(){NX.start()};
const _r=render;render=function(){if(W){if(W.pub&&location.hash!=='#register'&&!getSession()){W=null}else return wizRender()}_r()};
window.addEventListener('hashchange',()=>{if(W&&W.pub&&location.hash!=='#register')W=null;render()});
render();
})();
