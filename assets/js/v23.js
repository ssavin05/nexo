/* CIA v23 — Crear empresa: simple por defecto, potente bajo demanda. El asistente SOLO se abre desde "Crear empresa". */
(()=>{
const PERSIST=true,KEY='cia_v23';
const persist=()=>{if(PERSIST)try{localStorage.setItem(KEY,JSON.stringify({db:MEMORY_DB,session:MEMORY_SESSION}))}catch(e){}};
if(PERSIST){try{const s=JSON.parse(localStorage.getItem(KEY)||'null');if(s&&s.db){MEMORY_DB=s.db;MEMORY_SESSION=s.session}}catch(e){}
 const sd=saveDB,ss=setSession;saveDB=function(d){sd(d);persist()};setSession=function(s){ss(s);persist()}}
const LVN={q:'Rápida',r:'Recomendada',m:'A tu medida'},nl=l=>({b:'q',s:'r'}[l]||l||'r');
const CATS=[['Tienda','retail'],['Comida','food'],['Belleza y salud','beauty'],['Servicios','serv'],['Distribución','whole'],['Fabricación','manufact'],['Construcción','construction'],['Empresa grande','corp'],['Otro','other']];
const guess=t=>{
  t=String(t||'').toLowerCase();
  if(/empresa grande|corporativ|grupo empresarial|franquicia|cadena|holding/.test(t))return'corp';
  if(/distrib|mayor|repart|log[ií]stic|bodega|distribuidora/.test(t))return'whole';
  if(/taquer|restaur|caf[eé]|pizz|comida|panad|fonda|helad|antoj|reposter|pasteler|cocina/.test(t))return'food';
  if(/ropa|boutique|zapat|calzado|moda|tienda de ropa/.test(t))return'cloth';
  if(/ferret|refacc|autopart|llanta|refaccionaria|materiales/.test(t))return'hard';
  if(/barber|peluquer|sal[oó]n|est[eé]tica|spa|uñas|belleza/.test(t))return'beauty';
  if(/m[eé]dic|cl[ií]nica|dent|fisioter|psicolog|laboratorio|salud/.test(t))return'health';
  if(/taller|reparaci|mec[aá]nic|electric|plomer|mantenimiento|servic|consult|despacho/.test(t))return'serv';
  if(/f[aá]brica|manufact|producci|maquil|industrial/.test(t))return'manufact';
  if(/constru|obra|arquitect|ingenier/.test(t))return'construction';
  if(/tienda|abarrot|papeler|farmac|super|miscel|limpieza|l[ií]nea|minis[uú]per/.test(t))return'retail';
  return'other';
};
const G=a=>a.grp||guess((a.type==='Otro'&&a.other)?a.other:(a.type||''));
const O=a=>['serv','beauty','health','construction'].includes(G(a))?(a.alsoProducts==='Sí'?'b':'s'):G(a)==='corp'?'b':({Servicios:'s',Ambos:'b'}[a.offer]||'p'),prod=a=>O(a)!=='s',isFood=a=>G(a)==='food';
const yn=['Sí','No'],has=(a,k,x)=>(Array.isArray(a[k])?a[k]:[]).some(v=>v.includes(x));
const SELLQ={
  'Mostrador':['Venta en mostrador'],
  'Pedidos y WhatsApp':['Con pedidos','Por WhatsApp'],
  'A domicilio':['A domicilio'],
  'Mayoreo':['Por mayoreo'],
  'En línea':['En línea'],
  'Mixto':['Venta en mostrador','Con pedidos','En línea'],
  'Mesas':['Venta en mostrador','En mesa'],
  'Rutas / preventa':['Por mayoreo','Con pedidos','A domicilio'],
  'Cuentas corporativas':['Por mayoreo','Con pedidos'],
  'Mostrador / tiendas':['Venta en mostrador']
};
const SELLK={food_fast:['Mostrador','Mesas','A domicilio','Pedidos y WhatsApp','Mixto'],food_table:['Mesas','Mostrador','A domicilio','Mixto'],bakery:['Mostrador','Pedidos y WhatsApp','A domicilio','Mixto'],dist:['Pedidos y WhatsApp','Mayoreo','Mostrador','Rutas / preventa','Mixto'],corp:['Mayoreo','Cuentas corporativas','Mostrador / tiendas','En línea','Mixto']};
const SUBTYPES={
  retail:['Abarrotes / minisúper','Papelería','Farmacia','Tienda de limpieza','Tienda de ropa','Electrónica','Otro'],
  food:['Restaurante','Cafetería','Taquería / comida rápida','Panadería / pastelería','Comida para llevar','Otro'],
  whole:['Distribución de productos','Distribución de alimentos','Distribución de limpieza','Distribución de refacciones','Logística / reparto','Otro'],
  serv:['Barbería / peluquería','Estética / salón de belleza','Taller / reparación','Consultoría / despacho','Limpieza / mantenimiento','Servicios profesionales','Otro'],
  cloth:['Boutique / ropa','Calzado','Accesorios','Moda / mayoreo','Otro'],
  hard:['Ferretería','Refacciones / autopartes','Materiales','Herramientas','Otro'],
  beauty:['Barbería / peluquería','Estética / salón','Uñas / belleza','Spa','Clínica / consultorio','Dentista','Fisioterapia / bienestar','Otro'],
  health:['Clínica','Consultorio','Dentista','Fisioterapia','Bienestar','Otro'],
  construction:['Construcción','Instalaciones','Arquitectura / ingeniería','Materiales','Otro'],
  manufact:['Fabricación','Producción bajo pedido','Maquila','Taller industrial','Otro'],
  corp:['Corporativo con varias áreas','Cadena de sucursales','Grupo de empresas','Franquicia','Distribuidor nacional','Otro'],
  other:['Comercio','Servicios','Producción','Distribución','Mixto','Otro']
};
const subtypeOpts=a=>SUBTYPES[G(a)]||SUBTYPES.other;

/* ===== v25 — Cada negocio es distinto: tipo (kind), tamaño (tier) y perfil operativo ===== */
const KD={retail:'shop',cloth:'shop',hard:'shop',food:'food_table',whole:'dist',serv:'pro',beauty:'salon',health:'clinic',construction:'build',manufact:'maker',corp:'corp',other:'general'};
const kindOf=a=>{const g=G(a);if(g==='corp')return'corp';
 const subtype=String(a.subtype||'').toLowerCase();
 // La categoría elegida tiene prioridad: una distribuidora de limpieza/refacciones sigue siendo distribuidora,
 // no peluquería, tienda genérica ni taller mecánico.
 if(g==='whole')return'dist';
 if(g==='food'){
   if(/taquer|r[aá]pida|para llevar|antoj|fonda|hamburg|pizz|tacos|helad/.test(subtype))return'food_fast';
   if(/panad|pasteler|reposter/.test(subtype))return'bakery';
   return'food_table';
 }
 if(g==='beauty')return'salon';
 if(g==='health')return'clinic';
 if(g==='construction')return'build';
 if(g==='manufact')return'maker';
 if(g==='hard')return'shop';
 const t=String((a.subtype&&a.subtype!=='Otro'?a.subtype:'')+' '+(a.other||'')+' '+(a.free||'')).toLowerCase();
 if(/taquer|r[aá]pida|para llevar|antoj|fonda|hamburg|pizz|tacos|helad/.test(t))return'food_fast';
 if(/panad|pasteler|reposter/.test(t))return'bakery';
 if(/restaur|caf[eé]|\bbar\b/.test(t))return'food_table';
 if(/cl[ií]nica|consultorio|dent|fisio|psicolog|bienestar|laborator/.test(t))return'clinic';
 if(/barber|peluquer|est[eé]tica|sal[oó]n|u[ñn]as|\bspa\b|belleza/.test(t))return'salon';
 if(/constru|obra|arquitect|ingenier|instalac/.test(t))return'build';
 if(/taller|reparaci|mec[aá]nic|mantenimiento/.test(t))return'repair';
 return KD[g]||'general'};
const tierOf=a=>{const t=String(a.team||'').toLowerCase();if(!t||t==='solo yo'||t==='1 persona')return'solo';if(/11 a 20|21 a 50|51 a 100|más de 100|más de 500|101 a 500/.test(t))return /11 a 20/.test(t)?'mid':'large';if(/4 a 10|6 a 20/.test(t))return'mid';return'small'};
const isK=(...k)=>a=>k.includes(kindOf(a));
const TIERN={solo:'Una persona',small:'Equipo pequeño',mid:'Empresa mediana',large:'Empresa grande'};
const ALLR=['Gerente','Vendedor','Cajero','Almacenista','Contador','Supervisor'];
const PB={
general:{name:'Negocio',promise:['Ventas, clientes y reportes listos para usar','Módulos que activas cuando los necesites'],roles:['Gerente','Vendedor','Cajero'],rolesAll:ALLR,kpis:[['Ventas','$24,850','+12.8%'],['Clientes','148','+8.4%'],['Inventario','86%','Saludable']],act:['＋ Venta','＋ Cliente','＋ Producto'],log:['✓ Nueva venta registrada','● Cliente agregado'],voc:{}},
food_fast:{name:'Taquería / comida rápida',promise:['Caja rápida para horas pico','Comandas que llegan a cocina','Costo por platillo y control de mermas','Combos, extras y pedidos a domicilio'],roles:['Cajero','Mesero','Cocina'],rolesAll:['Gerente','Cajero','Mesero','Cocina','Repartidor','Almacenista'],kpis:[['Ventas hoy','$8,420','+12%'],['Comandas','37','4 en cocina'],['Ticket promedio','$114','+6%']],act:['＋ Venta rápida','＋ Comanda','＋ Platillo'],log:['✓ Comanda #37 lista','● Merma: 2 kg de tortilla'],voc:{products:'Menú',orders:'Pedidos',customers:'Clientes frecuentes',inventory:'Insumos',purchases:'Compras de insumos',sales:'Caja y ventas',x_recetas:'Recetas y costos'}},
food_table:{name:'Restaurante / cafetería',promise:['Mesas, cuentas y propinas','Comandas por estación y cocina','Reservaciones y control de insumos','Costo por platillo'],roles:['Mesero','Cajero','Cocina'],rolesAll:['Gerente','Mesero','Cajero','Cocina','Repartidor','Almacenista'],kpis:[['Ventas hoy','$18,960','+9%'],['Mesas ocupadas','11 / 16','69%'],['Ticket promedio','$286','+4%']],act:['＋ Abrir mesa','＋ Comanda','＋ Reservación'],log:['✓ Mesa 7 pagada','● Reservación 8:30 pm'],voc:{products:'Menú',orders:'Pedidos',customers:'Comensales',inventory:'Insumos y bebidas',purchases:'Compras de insumos',sales:'Cuentas y ventas',x_recetas:'Recetas y costos'}},
bakery:{name:'Panadería / pastelería',promise:['Producción diaria y recetas con costo','Pedidos por encargo con anticipo','Mermas y caducidad','Venta en mostrador'],roles:['Cajero','Producción'],rolesAll:['Gerente','Cajero','Producción','Repartidor','Almacenista'],kpis:[['Ventas hoy','$5,380','+7%'],['Pedidos por encargo','6','2 para mañana'],['Mermas del mes','3.2%','−0.4%']],act:['＋ Venta','＋ Pedido','＋ Producción'],log:['✓ Pastel entregado','● Lote de pan registrado'],voc:{orders:'Pedidos por encargo',inventory:'Ingredientes y producto',sales:'Mostrador y ventas',x_recetas:'Recetas y costos'}},
salon:{name:'Barbería / salón de belleza',promise:['Agenda por estilista','Comisiones por servicio','Ficha de cada cliente (fórmulas, preferencias)','Paquetes y venta de productos'],roles:['Recepción','Estilista'],rolesAll:['Gerente','Recepción','Estilista','Cajero'],kpis:[['Citas hoy','14','3 libres'],['Ventas hoy','$4,260','+15%'],['Comisiones del mes','$7,840','5 personas']],act:['＋ Cita','＋ Cobro','＋ Cliente'],log:['✓ Corte y barba cobrados','● Cita de las 4:00 pm confirmada'],voc:{products:'Servicios y productos',tasks:'Tareas del equipo',sales:'Cobros',x_citas:'Agenda de citas',x_profesionales:'Estilistas',x_fichas:'Fichas de clientes',x_paquetes:'Paquetes y membresías'}},
clinic:{name:'Clínica / consultorio',promise:['Agenda de citas por especialista','Expediente de cada paciente','Tratamientos y paquetes de sesiones','Recordatorios y cobros'],roles:['Recepción','Especialista'],rolesAll:['Gerente','Recepción','Especialista','Cajero','Almacenista'],kpis:[['Citas hoy','18','2 libres'],['Pacientes nuevos','9','Este mes'],['Por cobrar','$6,300','4 cuentas']],act:['＋ Cita','＋ Paciente','＋ Cobro'],log:['✓ Consulta finalizada','● Expediente actualizado'],voc:{products:'Servicios y tratamientos',customers:'Pacientes',tasks:'Tareas del equipo',sales:'Cobros',inventory:'Material e insumos',x_citas:'Agenda de citas',x_profesionales:'Especialistas',x_fichas:'Expedientes',x_paquetes:'Tratamientos y paquetes'}},
repair:{name:'Taller / reparación',promise:['Órdenes de trabajo con estado','Cotización, trabajo y cobro','Refacciones y materiales','Garantías por trabajo'],roles:['Técnico','Recepción'],rolesAll:['Gerente','Técnico','Recepción','Cajero','Almacenista'],kpis:[['Trabajos abiertos','12','3 por entregar'],['Ventas hoy','$6,900','+5%'],['Por cobrar','$14,200','5 cuentas']],act:['＋ Orden','＋ Cotización','＋ Cobro'],log:['✓ Orden #112 terminada','● Refacción solicitada'],voc:{products:'Servicios y refacciones',orders:'Trabajos',tasks:'Pendientes',inventory:'Refacciones',x_ordenes_trabajo:'Órdenes de trabajo'}},
pro:{name:'Servicios profesionales',promise:['Clientes, proyectos y entregables','Cotizaciones, contratos e igualas','Agenda y seguimiento','Cobranza por anticipos y parcialidades'],roles:['Gerente','Vendedor'],rolesAll:['Gerente','Vendedor','Contador','Supervisor'],kpis:[['Proyectos activos','7','2 por entregar'],['Facturado del mes','$68,400','+11%'],['Por cobrar','$22,500','3 clientes']],act:['＋ Proyecto','＋ Cotización','＋ Cliente'],log:['✓ Contrato firmado','● Anticipo recibido'],voc:{products:'Servicios',tasks:'Seguimiento',sales:'Cobros y facturas',x_citas:'Agenda'}},
build:{name:'Construcción / obra',promise:['Obras con etapas y responsables','Estimaciones, anticipos y contratos','Compras y materiales por obra','Subcontratistas y cobranza'],roles:['Supervisor','Contador'],rolesAll:['Gerente','Supervisor','Contador','Almacenista','Vendedor'],kpis:[['Obras activas','4','1 por cerrar'],['Por cobrar','$186,000','Estimaciones'],['Compras del mes','$92,400','−6%']],act:['＋ Obra','＋ Cotización','＋ Compra'],log:['✓ Estimación aprobada','● Material recibido'],voc:{products:'Servicios y materiales',tasks:'Avance de obra',sales:'Cobros y estimaciones',receivables:'Estimaciones por cobrar',x_proyectos:'Obras y proyectos'}},
dist:{name:'Distribuidora',promise:['Pedidos, rutas y entregas','Crédito con plazos y límite por cliente','Cobranza y cuentas por cobrar','Vendedores en ruta con comisión'],roles:['Vendedor','Almacenista','Repartidor'],rolesAll:['Gerente','Vendedor','Preventista','Almacenista','Repartidor','Contador','Supervisor'],kpis:[['Ventas hoy','$64,200','+9%'],['Entregas pendientes','23','5 rutas'],['Por cobrar','$212,800','12 vencidas']],act:['＋ Pedido','＋ Entrega','＋ Cobro'],log:['✓ Ruta 3 entregada','● Cliente superó su límite de crédito'],voc:{orders:'Pedidos',receivables:'Crédito y cobranza',customers:'Clientes y puntos de venta',x_rutas:'Rutas',x_zonas:'Zonas de venta',x_comisiones:'Comisiones de vendedores'}},
shop:{name:'Tienda',promise:['Venta rápida con código de barras','Inventario con alertas de mínimos','Clientes frecuentes y promociones','Compras a proveedores'],roles:['Cajero','Vendedor'],rolesAll:['Gerente','Cajero','Vendedor','Almacenista'],kpis:[['Ventas hoy','$9,740','+8%'],['Productos bajos','6','Por reponer'],['Ticket promedio','$168','+3%']],act:['＋ Venta','＋ Producto','＋ Compra'],log:['✓ Venta #204 cobrada','● Alerta: stock bajo'],voc:{sales:'Caja y ventas'}},
maker:{name:'Fabricación',promise:['Órdenes de producción','Lista de materiales con costo','Materia prima y producto terminado','Pedidos bajo demanda'],roles:['Producción','Almacenista'],rolesAll:['Gerente','Producción','Almacenista','Vendedor','Contador'],kpis:[['Órdenes en proceso','9','3 atrasadas'],['Materia prima baja','5','Por comprar'],['Ventas del mes','$142,000','+10%']],act:['＋ Orden de producción','＋ Pedido','＋ Compra'],log:['✓ Orden #58 terminada','● Material por agotarse'],voc:{orders:'Pedidos de clientes',inventory:'Materia prima y producto',x_produccion:'Órdenes de producción',x_recetas:'Lista de materiales'}},
corp:{name:'Empresa grande',promise:['Autorizaciones por monto y área','Roles y permisos por departamento','Bitácora y auditoría de cambios','Sucursales, bodegas y traspasos','Cuentas por cobrar y por pagar'],roles:['Gerente','Supervisor','Contador','Vendedor'],rolesAll:['Gerente','Supervisor','Contador','Vendedor','Almacenista','Cajero'],kpis:[['Ventas del mes','$2.4 M','+6.2%'],['Autorizaciones','14','Esperan decisión'],['Por cobrar','$680,000','31 cuentas']],act:['＋ Autorización','＋ Sucursal','＋ Usuario'],log:['✓ Compra autorizada por Dirección','● 3 cambios de permisos auditados'],voc:{users:'Equipo y áreas',branches:'Sucursales y plantas'}}
};
const SPK={
 food_fast:b=>['Comandas','Cocina','Ingredientes y recetas','Mermas',...(b.mode==='Mesas'||b.mode==='Combinación'?['Mesas']:[]),...(b.mode==='A domicilio'||b.mode==='Combinación'?['Delivery']:[])],
 food_table:b=>['Mesas','Comandas','Cocina','Ingredientes y recetas','Mermas',...(b.mode==='A domicilio'||b.mode==='Combinación'?['Delivery']:[])],
 bakery:b=>['Ingredientes y recetas','Órdenes de producción','Mermas','Pedidos'],
 salon:b=>['Citas y agenda','Profesionales','Fichas'],
 clinic:b=>['Citas y agenda','Profesionales','Fichas'],
 repair:b=>['Órdenes de trabajo','Cotizaciones','Garantías'],
 pro:b=>['Citas y agenda','Proyectos','Cotizaciones'],
 build:b=>['Proyectos','Cotizaciones','Contratos'],
 dist:b=>['Crédito a clientes','Entregas','Rutas','Zonas'],
 maker:b=>['Ingredientes y recetas','Órdenes de producción','Lotes'],
 corp:b=>['Departamentos','Contratos']
};
const ORDK={
 food_fast:['sales','x_comandas','orders','x_cocina','products','x_recetas','x_mermas','inventory','purchases','suppliers','customers','reports'],
 food_table:['x_mesas','x_reservaciones','x_comandas','x_cocina','sales','products','x_recetas','x_mermas','inventory','purchases','suppliers','customers','reports'],
 bakery:['sales','orders','products','x_produccion','x_recetas','inventory','x_mermas','x_lotes','purchases','suppliers','customers','reports'],
 salon:['x_citas','sales','customers','x_fichas','products','x_paquetes','x_profesionales','x_comisiones','inventory','tasks','users','reports'],
 clinic:['x_citas','customers','x_fichas','products','sales','x_paquetes','x_profesionales','inventory','tasks','users','reports'],
 repair:['x_ordenes_trabajo','quotes','sales','customers','inventory','purchases','suppliers','x_garantias','tasks','reports'],
 pro:['customers','x_proyectos','quotes','x_contratos','sales','tasks','x_citas','users','receivables','reports'],
 build:['x_proyectos','quotes','x_contratos','purchases','suppliers','inventory','receivables','payables','tasks','customers','reports'],
 dist:['sales','orders','x_rutas','x_zonas','x_entregas','customers','receivables','products','inventory','x_lotes','purchases','suppliers','x_comisiones','reports'],
 shop:['sales','products','inventory','x_lotes','customers','purchases','suppliers','x_promociones','reports'],
 maker:['orders','x_produccion','x_recetas','inventory','x_lotes','purchases','suppliers','products','sales','customers','reports'],
 corp:['sales','customers','orders','products','inventory','transfers','purchases','suppliers','x_departamentos','x_contratos','approvals','finance','receivables','payables','branches','users','audit','reports']
};
const QX={
 inv:{food_fast:'¿Quieres controlar tus insumos (carne, tortillas, verduras, refrescos…)?',food_table:'¿Quieres controlar tus insumos y bebidas?',bakery:'¿Quieres controlar harina, ingredientes y producto terminado?',dist:'¿Quieres controlar el inventario de tu bodega?',corp:'¿Controlas inventario en bodegas o sucursales?',maker:'¿Quieres controlar materia prima y producto terminado?',shop:'¿Quieres controlar el inventario de tu mercancía?',salon:'¿Quieres controlar tus insumos y productos de venta?',clinic:'¿Quieres controlar material e insumos?',repair:'¿Quieres controlar refacciones y materiales?',build:'¿Quieres controlar materiales y herramienta?'},
 cust:{food_fast:'¿Quieres registrar clientes frecuentes o pedidos recurrentes?',food_table:'¿Quieres registrar clientes frecuentes y reservaciones?',salon:'¿Quieres llevar el registro de tus clientes y su historial?',clinic:'¿Quieres llevar el registro de tus pacientes?',dist:'¿Quieres llevar el registro de tus clientes y puntos de venta?',corp:'¿Quieres llevar un registro de cuentas y clientes corporativos?',pro:'¿Quieres llevar el registro de tus clientes y proyectos?',repair:'¿Quieres llevar el registro de clientes y equipos atendidos?'},
 credit:{dist:'¿Das crédito a tus clientes? (plazos y límite por cliente)',corp:'¿Manejas crédito y cuentas por cobrar con clientes?',build:'¿Cobras con anticipos y estimaciones?',pro:'¿Cobras con anticipos o en parcialidades?',clinic:'¿Ofreces pagos en parcialidades o tratamientos a plazos?',salon:'¿Ofreces apartados, anticipos o pagos a plazos?'},
 team:{corp:'¿Cuántas personas trabajan en tu empresa?',dist:'¿Cuántas personas trabajan contigo (vendedores, almacén, reparto)?',food_fast:'¿Cuántas personas trabajan contigo (cocina, caja, reparto)?',food_table:'¿Cuántas personas trabajan contigo (meseros, cocina, caja)?',salon:'¿Cuántas personas trabajan contigo?'}
};
const qt=q=>typeof q.q==='function'?q.q(W.a):((QX[q.id]||{})[kindOf(W.a)]||q.q);
const Q=[
  {id:'offer',when:a=>G(a)==='other',q:'¿Tu negocio vende productos, servicios o ambos?',opts:['Productos','Servicios','Ambos']},
  {id:'subtype',q:'¿Qué describe mejor lo que haces?',opts:subtypeOpts},
  {id:'sellq',when:a=>!['salon','clinic','pro','build','repair'].includes(kindOf(a)),q:'¿Cuál es tu forma principal de vender?',opts:a=>SELLK[kindOf(a)]||['Mostrador','Pedidos y WhatsApp','A domicilio','Mayoreo','En línea','Mixto']},
  {id:'mode',lv:'r',when:a=>isFood(a)&&kindOf(a)!=='bakery',q:'¿Cómo atiendes principalmente a tus clientes?',opts:['Mesas','Para llevar','A domicilio','Combinación']},
  {id:'serviceMode',lv:'r',when:isK('salon','clinic','pro'),q:'¿Cómo prestas principalmente tus servicios?',opts:['Con cita','Sin cita','Ambos']},
  {id:'orderMode',lv:'r',when:a=>!['salon','clinic','pro','build','repair','corp'].includes(kindOf(a)),q:'¿Cómo recibes y administras tus pedidos?',opts:['Solo ventas directas','Pedidos por WhatsApp','Pedidos en mostrador','Pedidos en línea','Varias formas']},
  {id:'inv',q:'¿Quieres controlar inventario?',when:prod,opts:['Sí, todo','Solo algunos productos','No']},
  {id:'stockMode',lv:'r',when:a=>prod(a)&&a.inv!=='No',q:'¿Qué necesitas saber de tu inventario?',opts:['Existencias y alertas','Entradas y salidas','Costos y utilidad','Todo lo anterior']},
  {id:'units',lv:'r',when:a=>prod(a)&&a.inv!=='No',q:'¿Cómo manejas tus productos?',opts:['Por pieza','Por peso o volumen','Por cajas / paquetes','Varias unidades']},
  {id:'variants',lv:'r',when:a=>prod(a)&&['cloth','retail'].includes(G(a)),q:'¿Tus productos tienen variantes?',opts:['Tallas y colores','Presentaciones / tamaños','Ambas','No']},
  {id:'purchasing',lv:'r',when:prod,q:'¿Compras mercancía o insumos a proveedores?',opts:['Sí, regularmente','Sí, ocasionalmente','No']},
  {id:'supplierCredit',lv:'m',when:a=>a.purchasing&&a.purchasing!=='No',q:'¿Manejas crédito con proveedores?',opts:yn},
  {id:'cust',q:'¿Quieres llevar un registro de tus clientes?',opts:yn},
  {id:'customerInfo',lv:'r',when:a=>a.cust==='Sí',q:'¿Qué información quieres guardar de tus clientes?',opts:['Solo contacto','Contacto e historial','Contacto, historial y crédito','Todo']},
  {id:'credit',lv:'r',q:'¿Vendes a crédito?',opts:['Sí','No','Solo a clientes seleccionados']},
  {id:'payments',q:'¿Cómo cobras normalmente?',opts:['Efectivo','Tarjeta / transferencia','Efectivo y tarjeta','Varias formas']},
  {id:'cash',lv:'r',q:'¿Necesitas controlar cajas y cortes de turno?',opts:yn},
  {id:'invoice',lv:'r',q:'¿Necesitas facturación para tus ventas?',opts:['Sí','No','Solo cuando el cliente la solicite']},
  {id:'delivery',lv:'r',when:a=>G(a)==='whole'||G(a)==='food'||a.sellq==='A domicilio'||a.orderMode==='Pedidos por WhatsApp',q:'¿Realizas entregas?',opts:['Sí, con rutas','Sí, entregas simples','No']},
  {id:'appointments',lv:'r',when:isK('pro','repair'),q:'¿Necesitas agenda y citas?',opts:['Sí','No']},
  {id:'production',lv:'r',when:isK('bakery','maker'),q:'¿Preparas o fabricas productos?',opts:['Sí, bajo receta / insumos','Sí, por órdenes de producción','No']},
  {id:'returns',lv:'r',when:a=>prod(a)&&!['food_fast','food_table','bakery'].includes(kindOf(a)),q:'¿Manejas cambios, devoluciones o garantías?',opts:['Devoluciones','Cambios y devoluciones','Garantías','Todo','No']},
  {id:'team',when:a=>a.staffModel!=='Trabajo solo',q:a=>((QX.team||{})[kindOf(a)]||'¿Cuántas personas trabajan en tu negocio, incluyéndote si también trabajas en la operación?'),opts:['Solo yo','2 a 3 personas','4 a 10 personas','11 a 20 personas','21 a 50 personas','51 a 100 personas','Más de 100 personas']},
  {id:'commission',lv:'r',when:a=>a.team&&a.team!=='Solo yo'&&!a.staffModel&&!a.preventa,q:'¿Necesitas manejar comisiones para vendedores o colaboradores?',opts:yn},
  {id:'roles',lv:'r',when:a=>a.team&&a.team!=='Solo yo',q:'¿Quieres diferentes permisos para cada persona?',opts:yn},
  {id:'branches',q:'¿Tienes más de una sucursal, punto de venta o almacén?',opts:['No','Sí, sucursales','Sí, almacenes','Ambos']},
  {id:'reports',lv:'r',q:'¿Qué tan detallados quieres tus reportes?',opts:['Básicos','Ventas e inventario','Ventas, costos y ganancias','Todo, con análisis']},
  {id:'automation',lv:'m',q:'¿Quieres que CIA te avise automáticamente cuando ocurra algo importante?',opts:['Sí, alertas y recordatorios','Sí, alertas de inventario y cobranza','No']},

  {id:'businessStage',lv:'r',q:'¿En qué etapa está tu empresa?',hint:'Esto ayuda a que CIA priorice lo que realmente necesitas.',opts:['Estoy empezando','Ya vendo y estoy creciendo','Empresa estable','Quiero expandirme']},
  {id:'customerType',lv:'r',when:isK('dist','pro','maker','build','corp','repair','general'),q:'¿A qué tipos de clientes les vendes?',multi:true,opts:['Personas','Empresas','Distribuidores / mayoristas','Gobierno e instituciones','Otros negocios']},
  {id:'targetCustomer',lv:'r',q:'¿Qué es lo más importante para tus clientes?',opts:['Precio','Calidad','Rapidez','Atención personalizada','Variedad','Experiencia']},
  {id:'differentiator',lv:'r',q:'¿Qué hace diferente a tu empresa?',opts:['Precio competitivo','Calidad superior','Servicio rápido','Productos exclusivos','Atención cercana','Todavía lo estoy definiendo']},
  {id:'priceStyle',lv:'r',when:isK('dist','shop','maker','general'),q:'¿Cómo quieres manejar tus precios?',opts:['Precios fijos','Precios por cliente','Mayoreo y menudeo','Promociones frecuentes','Depende del producto']},
  {id:'brandTone',lv:'r',q:'¿Qué personalidad quieres para tu empresa?',opts:['Profesional','Moderna','Amigable','Premium','Dinámica','Seria y confiable']},
  {id:'brandColor',q:'¿Qué colores te gustaría combinar en tu espacio?',multi:true,opts:['Azul / profesional','Verde / natural','Rojo / energético','Morado / creativo','Negro / elegante','Blanco / limpio','Colores vivos','Quiero que CIA lo sugiera']},
  {id:'logo',lv:'r',when:a=>tierOf(a)!=='large',q:'¿Ya tienes logotipo?',opts:['Sí, ya tengo uno','Tengo uno pero quiero mejorarlo','Todavía no','Quiero definir el estilo']},
  {id:'communication',lv:'r',when:a=>tierOf(a)!=='large',q:'¿Por qué medios te comunicas con tus clientes? Puedes elegir varios.',multi:true,opts:['WhatsApp','Llamadas','Redes sociales','Correo','En persona','Portal o tienda en línea']},
  {id:'growthGoal',lv:'r',q:'¿Cuál es tu principal objetivo con la empresa?',opts:['Vender más','Conseguir más clientes','Controlar mejor el dinero','Ordenar el negocio','Abrir otra sucursal','Hacer crecer el equipo','Ahorrar tiempo']},
  {id:'priority',lv:'r',q:'¿Qué áreas quieres mejorar primero? Puedes elegir varias.',multi:true,opts:['Ventas','Inventario','Clientes','Finanzas','Personal','Pedidos y entregas','Compras y proveedores','Organización general']},
  {id:'seasonality',lv:'r',q:'¿Tus ventas cambian según la temporada?',opts:['Sí, mucho','Sí, un poco','No','No estoy seguro']},
  {id:'dashboardFocus',lv:'r',q:'¿Qué información quieres ver en tu pantalla principal? Puedes elegir varias.',multi:true,opts:['Ventas','Dinero y ganancias','Inventario','Pedidos','Clientes','Compras','Entregas','Un resumen de todo']},
  {id:'alertsPreference',lv:'r',q:'¿Qué tan activo quieres que sea CIA con sus avisos?',opts:['Solo cosas urgentes','Alertas importantes','Quiero que me avise de todo','Prefiero pocos avisos']},
  {id:'legalData',lv:'m',q:'¿Tu empresa trabaja con datos fiscales o facturación formal?',opts:['Sí, todo está formalizado','Estoy en proceso','Solo algunas ventas','Todavía no']},
  {id:'expansion',lv:'m',q:'¿Qué te gustaría poder hacer más adelante?',opts:['Más sucursales','Tienda en línea','Ventas por WhatsApp','Más empleados','Distribuir a otras ciudades','Automatizar procesos','Todavía no lo sé']},
  {id:'customNeed',lv:'m',q:'¿Necesitas información especial que CIA deba guardar?',opts:['Sí, quiero campos personalizados','No por ahora']}
];

const SQ=[
 {id:'alsoProducts',when:isK('salon','clinic','repair','build'),q:a=>({salon:'¿También vendes productos (shampoo, ceras, tintes) o usas insumos que quieras controlar?',clinic:'¿Vendes productos o usas material que quieras controlar (medicamento, insumos)?',repair:'¿Cobras refacciones o materiales además de la mano de obra?',build:'¿Compras y revendes materiales dentro de tus obras?'}[kindOf(a)]),opts:yn},
 {id:'staffModel',when:isK('salon'),q:'¿Cómo trabaja tu equipo?',opts:['Trabajo solo','Colaboradores que cobran comisión','Colaboradores con sueldo','Rentan silla o cabina']},
 {id:'preventa',when:isK('dist'),q:'¿Cómo toman los pedidos tus vendedores?',opts:['Mostrador o bodega','Preventa con vendedores en ruta','Autoventa en camión','WhatsApp y llamadas','Varias formas']},
 {id:'workorders',when:isK('repair'),q:'¿Cómo recibes los trabajos?',opts:['Se atienden y entregan el mismo día','Los dejan varios días (órdenes de trabajo)','Voy al domicilio del cliente']},
 {id:'projects',when:isK('pro'),q:'¿Cómo organizas tu trabajo?',opts:['Proyectos con etapas y entregables','Trabajos sueltos','Contratos recurrentes (iguala)']},
 {id:'sites',when:isK('build'),q:'¿Cuántas obras manejas al mismo tiempo?',opts:['Una a la vez','Varias obras','Varias obras con subcontratistas']},
 {id:'depts',when:isK('corp'),q:'¿Cómo está organizada tu empresa?',opts:['Por departamentos','Por sucursales o plantas','Por proyectos o cuentas','Mixta']},
 {id:'kitchen',lv:'r',when:isK('food_fast','food_table'),q:'¿Cómo sale lo que vendes de la cocina?',opts:['Lo prepara una sola persona','Varias estaciones (plancha, trompo, freidora)','Cocina aparte y meseros que llevan la comanda']},
 {id:'recipeCost',lv:'r',when:isK('food_fast','food_table','bakery'),q:'¿Quieres saber cuánto te cuesta cada platillo o producto?',opts:['Sí, con recetas e ingredientes','Solo un costo aproximado','No por ahora']},
 {id:'waste',lv:'r',when:isK('food_fast','food_table','bakery'),q:'¿Quieres registrar mermas (lo que se desperdicia o se echa a perder)?',opts:yn},
 {id:'extras',lv:'r',when:isK('food_fast','food_table'),q:'¿Vendes combos o platillos con extras opcionales?',opts:['Sí, muchos (combos, extras, salsas)','Algunos','No']},
 {id:'tips',lv:'r',when:isK('food_table'),q:'¿Manejas propinas o cuentas divididas?',opts:['Propinas','Cuentas divididas','Ambas','No']},
 {id:'reserve',lv:'r',when:isK('food_table'),q:'¿Aceptas reservaciones?',opts:yn},
 {id:'madeToOrder',lv:'r',when:isK('bakery'),q:'¿Haces pedidos especiales por encargo (pasteles, eventos)?',opts:['Sí, con anticipo','Sí, sin anticipo','No']},
 {id:'shelf',lv:'r',when:isK('bakery','maker'),q:'¿Necesitas controlar caducidad o lotes?',opts:yn},
 {id:'priceMode',lv:'r',when:isK('salon','clinic','repair','pro'),q:a=>({salon:'¿Cómo cobras tus servicios?',clinic:'¿Cómo cobras tus consultas y tratamientos?',repair:'¿Cómo cobras tus trabajos?',pro:'¿Cómo cobras tu trabajo?'}[kindOf(a)]),opts:a=>({salon:['Precio fijo por servicio','Precio según largo o tamaño','Por tiempo','Por paquete o membresía'],clinic:['Consulta con precio fijo','Por tratamiento o sesión','Paquetes de sesiones','Seguros o convenios'],repair:['Precio fijo por servicio','Cotización por trabajo','Mano de obra + refacciones','Por hora'],pro:['Por hora','Por proyecto','Iguala mensual','Mixto']}[kindOf(a)])},
 {id:'record',lv:'r',when:isK('salon','clinic'),q:a=>kindOf(a)==='clinic'?'¿Necesitas un expediente por paciente?':'¿Guardas fichas de clientes (fórmulas de color, preferencias)?',opts:a=>kindOf(a)==='clinic'?['Sí, historial y notas','Solo datos de contacto','No']:yn},
 {id:'reminders',lv:'r',when:isK('salon','clinic','pro'),q:'¿Quieres recordatorios para reducir citas canceladas?',opts:yn},
 {id:'warranty',lv:'r',when:isK('repair'),q:'¿Das garantía por tus trabajos?',opts:yn},
 {id:'routes',lv:'r',when:isK('dist'),q:'¿Cuántas rutas o zonas atiendes?',opts:['Una','2 a 5','Más de 5']},
 {id:'lots',lv:'r',when:isK('dist'),q:'¿Manejas productos con caducidad o lote?',opts:yn},
 {id:'collect',lv:'r',when:isK('dist'),q:'¿Cómo cobras lo que vendes a crédito?',opts:['El repartidor cobra en la entrega','Cobranza aparte','Transferencias','Una mezcla']},
 {id:'barcode',lv:'r',when:isK('shop'),q:'¿Usas lector de código de barras?',opts:yn},
 {id:'expiry',lv:'r',when:a=>kindOf(a)==='shop'&&/farmac|abarrot/i.test(a.subtype||''),q:'¿Controlas la caducidad de tus productos?',opts:yn},
 {id:'loyalty',lv:'r',when:isK('shop','salon','food_fast'),q:'¿Quieres puntos o promociones para clientes frecuentes?',opts:yn},
 {id:'bom',lv:'r',when:isK('maker'),q:'¿Quieres saber el costo de materiales de cada producto?',opts:['Sí, con lista de materiales','Solo un costo aproximado','No por ahora']}
];
const ENT=[
 {id:'approvalRules',when:a=>tierOf(a)==='large',q:'¿Qué compras o gastos deben pasar por autorización?',opts:['Todos','Solo montos altos','Descuentos y devoluciones','Ninguno por ahora']},
 {id:'controls',lv:'r',when:a=>tierOf(a)==='large',q:'¿Qué nivel de control y auditoría necesitas?',opts:['Básico','Bitácora de cambios','Bitácora y permisos por área','Auditoría completa']},
 {id:'finTeam',lv:'r',when:a=>tierOf(a)==='large',q:'¿Quién lleva la contabilidad y las finanzas?',opts:['Un área interna','Contador externo','Aún no está definido']},
 {id:'integrations',lv:'m',when:a=>tierOf(a)==='large',q:'¿Qué necesitas conectar con CIA?',opts:['Contabilidad','Facturación','Tienda en línea','Varios sistemas','Por ahora nada']}
];
Q.splice(Q.findIndex(q=>q.id==='sellq')+1,0,...SQ);
Q.splice(Q.findIndex(q=>q.id==='branches')+1,0,...ENT);
/* Valores predeterminados inteligentes según el giro */
function eff(a){
  const g=G(a),kd=kindOf(a),b={...a},p=prod(a),d=(k,v)=>{if(b[k]===undefined)b[k]=v};
  d('payments','Efectivo y tarjeta');d('inv',p?'Sí':'No');d('cust','Sí');
  d('purchasing',p&&g!=='serv'?'Sí, regularmente':'No');d('team','Solo yo');d('sell',[]);
  if(b.credit===undefined)b.credit=(kd==='dist'||kd==='corp')?'Sí':'No';
  if(b.cash===undefined)b.cash='No'; if(b.invoice===undefined)b.invoice='No';
  if(b.delivery===undefined)b.delivery=g==='whole'?'Sí, con rutas':'No';
  if(b.appointments===undefined)b.appointments=['salon','clinic','pro'].includes(kd)?'Sí':'No';
  if(b.branches===undefined)b.branches=kd==='corp'?'Sí, sucursales':(/sucursales/.test(b.depts||'')?'Sí, sucursales':'No'); if(b.roles===undefined)b.roles=['mid','large'].includes(tierOf(b))?'Sí':'No';
  if(b.commission===undefined)b.commission=(/comisi/.test(b.staffModel||'')||/Preventa|Autoventa/.test(b.preventa||''))?'Sí':'No'; if(b.returns===undefined)b.returns=(p&&!['food_fast','food_table','bakery'].includes(kd))?'Devoluciones':'No';
  let sp=b.spec;
  if(sp===undefined){
    const m=b.mode||'',s=b.serviceMode||'';
    sp=(SPK[kd]?SPK[kd](b):{
      food:['Comandas','Cocina','Ingredientes y recetas',...(m!=='Para llevar'&&m!=='A domicilio'?['Mesas']:[]),...(m==='A domicilio'||m==='Combinación'?['Delivery']:[])],
      whole:['Crédito a clientes','Entregas','Rutas'],
      serv:[...(s!=='Sin cita'?['Citas y agenda']:[]),'Cotizaciones'],
      beauty:[...(s!=='Sin cita'?['Citas y agenda']:[]),'Servicios'],
      health:[...(s!=='Sin cita'?['Citas y agenda']:[]),'Servicios'],
      cloth:['Tallas','Colores','Variantes','Cambios y devoluciones'],
      hard:['Código de barras','SKU','Unidades de medida'],
      retail:['Código de barras'],
      manufact:['Ingredientes y recetas','Órdenes de producción']
    }[g]||[]).slice();
  }
  if(String(b.delivery||'').startsWith('No'))sp=sp.filter(x=>!/Delivery|Rutas|Entregas/.test(x));
  if(String(b.delivery||'').startsWith('Sí')&&!sp.some(x=>/Delivery|Rutas|Entregas/.test(x)))sp.push(g==='food'?'Delivery':'Entregas');
  if(b.appointments==='No')sp=sp.filter(x=>!/Citas/.test(x));
  if(b.variants==='No')sp=sp.filter(x=>!/Tallas|Colores|Variantes/.test(x));

  {const hasS=x=>sp.some(v=>v.includes(x)),add=x=>{if(!hasS(x))sp.push(x)},del=x=>{sp=sp.filter(v=>!v.includes(x))},is=(k,...x)=>x.some(v=>String(b[k]||'').includes(v)),eq=(k,...x)=>x.includes(b[k]);
   if(is('kitchen','sola persona'))del('Cocina');
   if(is('recipeCost','No por ahora','aproximado')||is('bom','No por ahora'))del('Ingredientes');
   if(b.waste==='No')del('Mermas');
   if(kd==='food_table'&&(b.mode==='Para llevar'||b.mode==='A domicilio'))del('Mesas');
   if(b.reserve==='Sí')add('Reservaciones');
   if(/^Sí/.test(b.madeToOrder||''))add('Pedidos');
   if(b.shelf==='Sí'||b.expiry==='Sí'||b.lots==='Sí'||(kd==='shop'&&/Farmacia/.test(b.subtype||'')&&b.expiry!=='No'))add('Lotes');
   if(b.shelf==='No'||b.expiry==='No'||b.lots==='No')del('Lotes');
   if(b.barcode==='Sí')add('Código de barras'); if(b.barcode==='No')del('Código');
   if(is('staffModel','Trabajo solo')||(['salon','clinic'].includes(kd)&&b.team==='Solo yo'&&!b.staffModel))del('Profesionales');
   if(eq('record','No','Solo datos de contacto'))del('Fichas');
   if(is('priceMode','paquete','membres','sesiones','Iguala'))add('Paquetes');
   if(is('priceMode','Cotización','proyecto','Mano de obra'))add('Cotizaciones');
   if(is('workorders','órdenes de trabajo','domicilio'))add('Órdenes de trabajo');
   if(is('workorders','mismo día'))del('Órdenes de trabajo');
   if(is('workorders','domicilio')&&!(b.sell||[]).some(v=>v.includes('domicilio')))b.sell=[...(b.sell||[]),'A domicilio'];
   if(b.warranty==='Sí')add('Garantías'); if(b.warranty==='No')del('Garantías');
   if(is('projects','Trabajos sueltos'))del('Proyectos');
   if(is('projects','recurrentes'))add('Contratos');
   if(is('sites','subcontratistas'))add('Contratos');
   if(is('preventa','Preventa','Autoventa'))add('Zonas');
   if(b.routes==='Una')del('Zonas');
   if(is('depts','departamentos','Mixta'))add('Departamentos');
   if(is('depts','proyectos'))add('Proyectos');}
  b.spec=sp;
  d('sales',g==='whole'?['Ventas a crédito']:[]);
  if(b.credit&&b.credit!=='No'&&!b.sales.includes('Ventas a crédito'))b.sales=[...(b.sales||[]),'Ventas a crédito'];
  if(b.invoice&&b.invoice!=='No'&&!b.sales.includes('Facturas'))b.sales=[...(b.sales||[]),'Facturas'];
  if(b.cash==='Sí'&&!b.sales.includes('Cortes de caja'))b.sales=[...(b.sales||[]),'Cortes de caja'];
  if(b.returns&&b.returns!=='No'&&!b.sales.includes('Devoluciones'))b.sales=[...(b.sales||[]),'Devoluciones'];
  if(b.reports&&/costos|ganancias|Todo/i.test(b.reports)&&!b.sales.includes('Ganancias'))b.sales=[...(b.sales||[]),'Ganancias'];
  d('invn',['Existencias','Entradas y salidas','Inventario mínimo y alertas','Costos']);
  if(b.stockMode==='Entradas y salidas'||b.stockMode==='Todo lo anterior')b.invn.push('Historial de movimientos');
  d('custn',['Teléfono','Dirección','Historial de compras','Notas']);
  if(b.customerInfo==='Contacto, historial y crédito'||b.customerInfo==='Todo')b.custn.push('Crédito y deudas');
  d('prod',['Categorías']);
  if(b.variants&&b.variants!=='No')b.prod.push('Variantes');
  if(b.units&&b.units!=='Por pieza')b.prod.push('Unidades de medida');
  d('ord',['Estados de pedido']);
  {const is=(k,...x)=>x.some(v=>String(b[k]||'').includes(v));
   if(/^Sí/.test(b.madeToOrder||'')&&!b.sales.includes('Anticipos'))b.sales=[...b.sales,'Anticipos'];
   if(is('tips','Propinas','Ambas')&&!b.sales.includes('Propinas'))b.sales=[...b.sales,'Propinas'];
   if(is('tips','divididas','Ambas')&&!b.sales.includes('Cuentas divididas'))b.sales=[...b.sales,'Cuentas divididas'];
   if(b.loyalty==='Sí'&&!b.sales.includes('Descuentos y promociones'))b.sales=[...b.sales,'Descuentos y promociones'];
   if(is('extras','Sí','Algunos')&&!b.prod.includes('Combos y extras'))b.prod=[...b.prod,'Combos y extras'];}
  return b;
}
function build(a){
  const g=G(a),o=O(a),kd=kindOf(a),tr=tierOf(a),m=a.mode||'',sp=x=>has(a,'spec',x),sl=x=>has(a,'sales',x),sv=x=>has(a,'sell',x),iv=a.inv&&a.inv!=='No';
  const team=a.team&&a.team!=='Solo yo', hasCredit=a.credit&&a.credit!=='No';
  const hasDelivery=String(a.delivery||'').startsWith('Sí');
  const hasAppointments=a.appointments==='Sí'||a.serviceMode==='Con cita'||a.serviceMode==='Ambos';
  const wantsBranches=a.branches&&a.branches!=='No';
  const wantsRoles=a.roles==='Sí'||Array.isArray(a.roles)&&a.roles.length>0;
  const wantsCommission=a.commission==='Sí';
  const purchasing=a.purchasing&&a.purchasing!=='No';
  const returns=a.returns&&a.returns!=='No';
  const cash=a.cash==='Sí';
  const invoice=a.invoice&&a.invoice!=='No';
  const reports=a.reports&&a.reports!=='Básicos';
  const prodMode=a.production&&a.production!=='No';
  return{
    tipo_negocio:a.type==='Otro'?(String(a.other||a.subtype||'Otro').replace(/^\s*(tengo|soy|es|manejo)\s+(una?|un)?\s*/i,'').replace(/^./,c=>c.toUpperCase())):(a.subtype&&a.subtype!=='Otro'?a.subtype:(a.type||'Negocio')),
    grupo:g,kind:kd,tier:tr,vende:a.what||a.subtype||'',vende_productos:o!=='s',vende_servicios:o!=='p',
    mayoreo:g==='whole'||sv('mayoreo'),menudeo:g==='whole'||sv('mostrador'),
    inventario:o!=='s'&&!!iv,alertas_stock:has(a,'invn','mínimo'),historial_movimientos:has(a,'invn','Historial'),
    clientes:a.cust==='Sí'||hasCredit||g==='serv'||g==='whole',proveedores:!!purchasing,empleados:team,
    roles:wantsRoles,comisiones:wantsCommission||sp('comisiones')||has(a,'perm','Comisiones'),actividad:false,
    ventas_a_credito:hasCredit||sl('crédito')||sp('Crédito'),facturas:invoice||sl('Facturas'),
    cortes_caja:cash||sl('Cortes'),devoluciones:returns||sl('Devoluciones')||sl('evoluciones'),
    descuentos:sl('Descuentos'),promociones:sl('promociones'),
    ganancias:reports||sl('Ganancias')||has(a,'invn','ganancias'),
    pedidos:sv('pedidos')||sv('WhatsApp')||sp('Pedidos')||g==='whole'||(g==='food'&&m!=='Mesas')||sp('Comandas')||(!!a.orderMode&&a.orderMode!=='Solo ventas directas'),
    entregas:hasDelivery||sv('domicilio')||sp('Delivery')||sp('Rutas')||sp('Entregas')||m==='A domicilio'||has(a,'ord','Entregas'),
    mesas:g==='food'&&sp('Mesas'),comandas:sp('Comandas'),cocina:sp('Cocina'),
    citas:hasAppointments&&(g==='serv'||g==='beauty'||g==='health'),cotizaciones:sp('Cotizaciones')||g==='serv',
    rutas:sp('Rutas')||a.delivery==='Sí, con rutas',recetas:sp('Ingredientes')||prodMode,
    variantes:sp('Variantes')||has(a,'prod','Variantes')||sp('Tallas'),
    codigo_barras:sp('Código')||has(a,'prod','barras'),sucursales:wantsBranches,
    metodos_pago:a.pay||a.payments||['Efectivo'],canales_venta:a.sell||[],
    automatizaciones:(a.automation&&a.automation!=='No')||a.reminders==='Sí',devoluciones_garantias:returns,
    produccion:prodMode||sp('Órdenes de producción'),mermas:sp('Mermas'),reservaciones:sp('Reservaciones'),profesionales:sp('Profesionales'),paquetes:sp('Paquetes'),fichas:sp('Fichas'),ordenes_trabajo:sp('Órdenes de trabajo'),proyectos:sp('Proyectos'),zonas:sp('Zonas'),lotes:sp('Lotes'),departamentos:sp('Departamentos'),contratos:sp('Contratos'),garantias:sp('Garantías'),
    aprobaciones:!!a.approvalRules&&a.approvalRules!=='Ninguno por ahora'||(tr==='large'&&!a.approvalRules),auditoria:tr==='large'||/Bitácora|Auditor/.test(a.controls||''),documentos:tr==='large'||sp('Contratos'),traspasos:!!wantsBranches&&o!=='s'&&!!iv,
    personalizacion:{
      etapa:a.businessStage||'',cliente_principal:a.customerType||'',prioridad_cliente:a.targetCustomer||'',
      diferenciador:a.differentiator||'',estrategia_precios:a.priceStyle||'',personalidad_marca:a.brandTone||'',
      color_marca:a.brandColor||'',logotipo:a.logo||'',comunicacion:a.communication||'',objetivo:a.growthGoal||'',
      prioridad_negocio:a.priority||'',temporada:a.seasonality||'',inicio_dashboard:a.dashboardFocus||'',
      estructura:a.depts||'',reglas_autorizacion:a.approvalRules||'',nivel_control:a.controls||'',contabilidad:a.finTeam||'',integraciones:a.integrations||'',cobranza:a.collect||'',
      nivel_alertas:a.alertsPreference||'',datos_fiscales:a.legalData||'',expansion:a.expansion||''
    }
  }
}
const bp=a=>build(eff(a));
/* Catálogo de módulos */
const NAV0=JSON.parse(JSON.stringify(NAV)),ITEM=Object.fromEntries(NAV0.flatMap(x=>x[1]).map(x=>[x[0],[...x]]));
const FIXED=['dashboard','settings','roles','modules','security','plans','bizconfig'],REAL=Object.keys(ITEM).filter(k=>!FIXED.includes(k));
const GEN=[['mesas','Mesas','▦',p=>p.mesas],['comandas','Comandas','▤',p=>p.comandas],['cocina','Cocina','♨',p=>p.cocina],['delivery','Delivery','➤',p=>p.grupo==='food'&&p.entregas],['rutas','Rutas','⌖',p=>p.rutas],['entregas','Entregas','➤',p=>p.entregas&&p.grupo!=='food'],['comisiones','Comisiones','%',p=>p.comisiones],['citas','Citas','◷',p=>p.citas],['recetas','Recetas e ingredientes','❖',p=>p.recetas],['produccion','Producción','⚒',p=>p.produccion],['promociones','Promociones','★',p=>p.promociones],['descuentos','Descuentos','％',p=>p.descuentos],['mermas','Mermas','▽',p=>p.mermas],['reservaciones','Reservaciones','◷',p=>p.reservaciones],['profesionales','Profesionales','♟',p=>p.profesionales],['paquetes','Paquetes y membresías','❖',p=>p.paquetes],['fichas','Fichas de clientes','▤',p=>p.fichas],['ordenes_trabajo','Órdenes de trabajo','⚙',p=>p.ordenes_trabajo],['proyectos','Proyectos','▣',p=>p.proyectos],['zonas','Zonas de venta','⌖',p=>p.zonas],['lotes','Lotes y caducidad','◔',p=>p.lotes],['departamentos','Departamentos','▦',p=>p.departamentos],['contratos','Contratos','▧',p=>p.contratos],['garantias','Garantías','✓',p=>p.garantias],['facturacion','Facturación','▧',p=>p.facturas],['cajas','Cajas','▣',p=>p.cortes_caja&&!ITEM.cashclose]];
const LBL={food:{products:'Menú',orders:'Pedidos'},serv:{tasks:'Agenda',products:'Servicios',sales:'Pagos'},whole:{orders:'Pedidos y entregas',receivables:'Crédito'},cloth:{products:'Productos y variantes'}};
const ORD={food:['sales','x_mesas','x_comandas','orders','x_cocina','products','x_recetas','inventory','customers','purchases','suppliers','reports'],whole:['sales','products','inventory','customers','suppliers','purchases','orders','x_entregas','receivables','reports'],serv:['customers','products','tasks','x_citas','sales','users','reports']};
const genOf=id=>GEN.find(x=>'x_'+x[0]===id),curKind=()=>{const pr=W?W.d?.profile:currentCompany()?.setup?.profile;return pr?(pr.kind||KD[pr.grupo]||'general'):null},
lab=(id,g)=>{const k=curKind(),v=k&&(PB[k]?.voc||{})[id];if(v)return v;const x=genOf(id);return x?x[1]:(LBL[g]||{})[id]||ITEM[id]?.[1]||id};
function modsFrom(p){const m=Object.fromEntries(PERMISSIONS.map(k=>[k,false])),on=(...x)=>x.forEach(k=>m[k]=true);
on('dashboard','settings','modules','security','sales','reports','roles');if(p.vende_productos)on('products');if(p.inventario)on('inventory','warehouses');if(p.historial_movimientos)on('stockmoves');
if(p.proveedores)on('suppliers','purchases','payables');if(p.clientes)on('customers');if(p.ventas_a_credito)on('customers','receivables');if(p.ganancias||p.cortes_caja)on('finance');if(p.cortes_caja)on('cashclose');
if(p.devoluciones)on('returns');if(p.pedidos||p.entregas||p.comandas||p.mesas||p.cocina)on('orders');if(p.cotizaciones)on('quotes');if(p.citas||p.grupo==='serv')on('tasks');if(p.empleados)on('users','tasks');if(p.proyectos||p.ordenes_trabajo)on('tasks');if(p.aprobaciones)on('approvals');if(p.auditoria)on('audit');if(p.sucursales)on('branches');if(p.traspasos)on('transfers');if(p.documentos)on('documents');if(p.tier==='large')on('finance','payables','receivables','users','tasks','reports');return m}
function recMenu(a){const p=bp(a),m=modsFrom(p),ord=ORDK[p.kind]||ORD[p.grupo]||['sales','products','inventory','customers','suppliers','purchases','orders','quotes','reports'],all=[...REAL,...GEN.map(x=>'x_'+x[0])];
return[...new Set([...ord,...all])].filter(i=>all.includes(i)).map(id=>({id,on:genOf(id)?!!genOf(id)[3](p):!!m[id]&&id!=='warehouses'}))}
const WD=[['vd','Ventas del día','k'],['vm','Ventas del mes','k'],['gan','Ganancias','k'],['pv','Productos vendidos','k'],['bajo','Inventario bajo','l'],['pp','Pedidos pendientes','k'],['cn','Clientes nuevos','k'],['cxc','Cobranza','k'],['comp','Compras recientes','l'],['ent','Entregas pendientes','k'],['top','Más vendidos','l'],['emp','Empleados','k'],['com','Comisiones','k'],['ct','Citas / pendientes','k'],['aprob','Autorizaciones','k'],['tk','Ticket promedio','k'],['suc','Ventas por sucursal','l'],['graf','Gráfica de ingresos','g']];
function recWid(a){const g=G(a),kd=kindOf(a),pk={food_fast:['vd','pp','tk','bajo','vm','gan'],food_table:['vd','pp','tk','bajo','vm','gan'],bakery:['vd','pp','bajo','gan','vm'],salon:['vd','ct','cn','gan','vm','com'],clinic:['ct','cn','vd','cxc','vm'],repair:['pp','vd','cxc','bajo','gan'],pro:['vm','cxc','ct','cn','gan'],build:['cxc','comp','ct','gan','vm'],dist:['vd','pp','ent','cxc','bajo','top','graf'],shop:['vd','bajo','top','gan','vm','tk'],maker:['pp','bajo','vm','gan','comp'],corp:['vm','gan','aprob','suc','cxc','bajo','graf']}[kd]||{food:['vd','vm','pp','ent','bajo','gan'],whole:['vd','vm','cxc','pp','ent','bajo','gan','graf'],serv:['vd','vm','cn','cxc','gan'],cloth:['vd','vm','gan','bajo','graf']}[g]||['vd','vm','gan','bajo','cxc','graf'];
const fx={Ventas:'vd','Dinero y ganancias':'gan',Inventario:'bajo',Pedidos:'pp',Clientes:'cn'}[a.dashboardFocus],pick=fx?[fx,...pk.filter(x=>x!==fx)]:pk;return[...pick,...WD.map(x=>x[0]).filter(x=>!pick.includes(x))].map(id=>({id,on:pick.includes(id)}))}
const defAu=()=>({stock:{on:false,x:5},sale:{on:false},debt:{on:false},order:{on:false}});
const modsOf=menu=>{const m=Object.fromEntries(PERMISSIONS.map(k=>[k,false]));['dashboard','settings','roles','modules','security','plans'].forEach(k=>{if(k in m)m[k]=true});menu.filter(i=>i.on&&!i.id.startsWith('x_')).forEach(i=>m[i.id]=true);if(m.inventory)m.warehouses=true;return m};
function rolesFor(a0,mods){const a=eff(a0),pb=PB[kindOf(a)]||PB.general,r=[{id:uid('role'),name:'Propietario',permissions:[...PERMISSIONS],system:true}],ok=x=>PERMISSIONS.includes(x)&&mods[x];
const base={Gerente:PERMISSIONS.filter(x=>x!=='roles'&&mods[x]),Vendedor:['dashboard','sales','quotes','orders','customers','products'],Cajero:['dashboard','sales','customers'],Almacenista:['dashboard','inventory','products','purchases','suppliers'],Mesero:['dashboard','sales','orders','customers','products'],Cocina:['dashboard','orders','inventory'],Estilista:['dashboard','tasks','customers','sales'],'Recepción':['dashboard','tasks','customers','sales','orders'],Especialista:['dashboard','tasks','customers'],'Técnico':['dashboard','tasks','orders','inventory','customers'],Repartidor:['dashboard','orders'],Preventista:['dashboard','sales','orders','customers','products'],'Producción':['dashboard','inventory','orders','tasks'],Contador:['dashboard','finance','reports'],Supervisor:['dashboard','sales','orders','tasks','approvals','customers','reports']};
const selected=[...(Array.isArray(a.roles)?a.roles:(a.roles==='Sí'?pb.roles:[]))];
if(a.roles!=='No'&&/área|externo/.test(String(a.finTeam||''))&&!selected.includes('Contador'))selected.push('Contador');
selected.forEach(n=>{let p=(base[n]||['dashboard']).filter(ok);const f=x=>has(a,'perm',x);if(f('Reportes'))p.push('reports');if(f('Caja')&&n!=='Almacenista')p.push('finance','cashclose');if(f('Inventario')&&n!=='Almacenista')p.push('inventory');r.push({id:uid('role'),name:n,permissions:[...new Set(p.filter(ok))]})});return r}
const applySetup=c=>{const s=c.setup;c.modules=modsOf(s.menu);c.industry=s.profile.tipo_negocio};
const applyRoles=c=>{const a=eff(c.setup.answers);const hasRoles=Array.isArray(a.roles)?a.roles.length:a.roles==='Sí';if(hasRoles)rolesFor(c.setup.answers,c.modules).slice(1).forEach(r=>{if(!c.roles.some(x=>x.name===r.name))c.roles.push(r)})};
/* Navegación */
const SEC={sales:'Ventas',orders:'Ventas',quotes:'Ventas',returns:'Ventas',cashclose:'Ventas',x_mesas:'Ventas',x_comandas:'Ventas',x_cocina:'Ventas',x_delivery:'Ventas',x_citas:'Ventas',products:'Catálogo',inventory:'Catálogo',stockmoves:'Catálogo',transfers:'Catálogo',purchases:'Compras',suppliers:'Compras',payables:'Compras',customers:'Clientes',receivables:'Clientes',finance:'Finanzas',reports:'Finanzas',x_mermas:'Catálogo',x_lotes:'Catálogo',x_recetas:'Catálogo',x_reservaciones:'Ventas',x_paquetes:'Ventas',x_fichas:'Clientes',x_profesionales:'Equipo',x_comisiones:'Equipo',users:'Equipo',approvals:'Control',audit:'Control',branches:'Control'};
function buildNav(){const c=currentCompany(),s=c?.setup;NAV.splice(0,NAV.length,...NAV0.map(x=>[x[0],x[1].map(i=>[...i])]));
const emp=NAV.find(x=>x[0]==='Empresa');if(emp&&!emp[1].some(i=>i[0]==='bizconfig'))emp[1].push(['bizconfig','Personalizar empresa','✦']);
if(!s?.menu)return;const g=s.profile.grupo,items=s.menu.filter(i=>i.on).map(i=>{const x=genOf(i.id);return[i.id,lab(i.id,g),x?x[2]:(ITEM[i.id]||[])[2]||'•']}),em=NAV.find(x=>x[0]==='Empresa');
let mid=[['Tu negocio',items]];if(s.group){const o={};items.forEach(i=>(o[SEC[i[0]]||'Operación']=o[SEC[i[0]]||'Operación']||[]).push(i));mid=Object.entries(o)}
NAV.splice(0,NAV.length,['General',[ITEM.dashboard||['dashboard','Inicio','⌂']]],...mid,em)}
const _ra=renderApp;renderApp=function(){evalAutos();buildNav();_ra();coMenu()};
const _can=can;can=function(p){if(p==='bizconfig')return _can('settings');if(String(p).startsWith('x_'))return !!currentCompany()?.setup?.menu?.find(i=>i.id===p&&i.on);return _can(p)};
const _ph=pageHead;pageHead=function(t,sub,x){const c=currentCompany&&currentCompany(),r=ui&&ui.route;if(c?.setup?.profile&&ITEM[r]&&t===ITEM[r][1]){const nt=lab(r,c.setup.profile.grupo);if(nt&&nt!==r)t=nt}return _ph(t,sub,x)};
const _rp=renderPage;renderPage=function(){const r=ui.route;return r==='bizconfig'?cfgPage():String(r).startsWith('x_')?xPage(r):_rp()};
/* Dashboard personalizado */
const sum=r=>r.reduce((a,b)=>a+(+b.total||0),0),same=d=>new Date(d).toDateString()===new Date().toDateString(),mon=d=>{const x=new Date(d),n=new Date();return x.getMonth()===n.getMonth()&&x.getFullYear()===n.getFullYear()};
const _dash=dashboard;dashboard=function(){const c=currentCompany(),w=c?.setup?.wid;if(!w||!w.length)return _dash();const d=data(),m=d.metrics||{},L=(t,rows)=>`<section class="card"><div class="card-head"><div><h3>${t}</h3></div></div>${rows.length?rows.join(''):'<p class="settings-intro">Sin datos todavía.</p>'}</section>`;
const F={vd:()=>['k',money(sum(d.sales.filter(s=>same(s.createdAt)))),'Hoy'],vm:()=>['k',money(sum(d.sales.filter(s=>mon(s.createdAt)))),'Este mes'],gan:()=>['k',money(m.profit),pct(m.margin)+' de margen'],pv:()=>['k',d.sales.length,'Ventas registradas'],pp:()=>['k',d.orders.filter(o=>!['delivered','done','completed'].includes(o.status)).length,'Por atender'],cn:()=>['k',d.customers.filter(x=>x.createdAt&&Date.now()-new Date(x.createdAt)<2592e6).length,'Últimos 30 días'],cxc:()=>['k',money(m.receivable),'Por cobrar'],ent:()=>['k',d.orders.filter(o=>['ready','preparing'].includes(o.status)).length,'Por entregar'],emp:()=>['k',c.members.length,'Usuarios'],com:()=>['k','$0','Por configurar'],ct:()=>['k',d.tasks.filter(t=>t.status!=='done').length,'Por atender'],aprob:()=>['k',d.approvals.filter(x=>x.status==='pending').length,'Esperan decisión'],tk:()=>['k',money(d.sales.length?sum(d.sales)/d.sales.length:0),'Por venta'],suc:()=>['l',L('Ventas por sucursal',(d.branchSales||[]).slice(0,4).map(x=>`<div class="mini-row"><div><strong>${esc(x.name)}</strong></div><b>${money(x.value)}</b></div>`))],
bajo:()=>['l',L('Inventario bajo',d.products.filter(p=>p.type==='Producto'&&p.stock<=p.minStock).slice(0,4).map(p=>`<div class="mini-row"><div><strong>${esc(p.name)}</strong><small>Mínimo ${p.minStock}</small></div><b>${p.stock}</b></div>`))],comp:()=>['l',L('Compras recientes',d.purchases.slice(0,4).map(p=>`<div class="mini-row"><div><strong>${esc(p.supplier)}</strong><small>${p.folio}</small></div><b>${money(p.total)}</b></div>`))],top:()=>['l',L('Más vendidos',(d.categorySales||[]).slice(0,4).map(x=>`<div class="mini-row"><div><strong>${esc(x.name)}</strong></div><b>${x.value}%</b></div>`))],graf:()=>['g','<section class="card chart-card"><div class="card-head"><div><h3>Ingresos</h3></div></div><div class="line-chart" id="lineChart"></div></section>']};
const on=w.filter(i=>i.on&&F[i.id]).map(i=>({r:F[i.id](),l:WD.find(x=>x[0]===i.id)[1]})),ks=on.filter(x=>x.r[0]==='k'),rest=on.filter(x=>x.r[0]!=='k');
return pageHead(esc(c.name),'Tu resumen.')+(ks.length?`<div class="kpi-grid">${ks.map(x=>kpi(x.l,x.r[1],x.r[2])).join('')}</div>`:'')+(rest.length?`<div class="dashboard-grid thirds">${rest.map(x=>x.r[1]).join('')}</div>`:'')};
function evalAutos(){const c=currentCompany(),au=c?.setup?.autos;if(!au)return;const f=c.setup.fired=c.setup.fired||{},d=c.data;
if(au.stock?.on)d.products.filter(p=>p.type==='Producto'&&p.stock<(+au.stock.x||0)&&!f['s'+p.id]).forEach(p=>{f['s'+p.id]=1;notify('Inventario bajo',`${p.name}: ${p.stock} pzas.`,'danger','inventory')});
if(au.debt?.on)d.customers.filter(x=>x.balance>0&&!f['d'+x.id]).forEach(x=>{f['d'+x.id]=1;notify('Saldo pendiente',`${x.name} debe ${money(x.balance)}.`,'warning','customers')})}
/* Módulos nuevos (registro simple) */
const CT=['Texto','Número','Fecha','Lista','Sí/No','Moneda','Porcentaje'],CE=['Productos','Clientes','Proveedores','Ventas','Pedidos','Empleados','Módulos nuevos'];
const inp=(f,id)=>f.t==='Lista'?`<select id="${id}">${(f.o||'').split(',').map(x=>`<option>${esc(x.trim())}</option>`).join('')}</select>`:f.t==='Sí/No'?`<select id="${id}"><option>Sí</option><option>No</option></select>`:`<input id="${id}" type="${{Número:'number',Moneda:'number',Porcentaje:'number',Fecha:'date'}[f.t]||'text'}" placeholder="${esc(f.n)}">`;

const XM={x_mesas:['Mesa','Zona y capacidad','Mesas del salón y su estado.'],x_comandas:['Comanda o mesa','Platillos y notas','Pedidos que salen a cocina.'],x_cocina:['Orden','Estado y notas','Lo que está preparando la cocina.'],x_delivery:['Pedido','Dirección y repartidor','Entregas a domicilio.'],x_citas:['Cliente','Servicio, fecha y hora','Agenda de citas.'],x_mermas:['Producto','Cantidad y motivo','Lo que se desperdicia o se echa a perder.'],x_reservaciones:['Nombre','Fecha, hora y personas','Reservaciones del día.'],x_profesionales:['Nombre','Especialidad y % de comisión','Equipo que presta el servicio.'],x_paquetes:['Paquete o membresía','Sesiones, precio y vigencia','Paquetes que vendes a tus clientes.'],x_fichas:['Cliente o paciente','Notas, fórmula o historial','Información de cada cliente.'],x_ordenes_trabajo:['Orden o equipo','Falla y estado','Trabajos en proceso.'],x_proyectos:['Proyecto','Etapa, responsable y fecha','Proyectos y su avance.'],x_zonas:['Ruta o zona','Vendedor y día de visita','Zonas y rutas de venta.'],x_lotes:['Producto y lote','Caducidad y cantidad','Control de lotes y caducidad.'],x_departamentos:['Departamento','Responsable y presupuesto','Áreas de la empresa.'],x_contratos:['Contrato','Cliente, vigencia y monto','Contratos vigentes.'],x_garantias:['Trabajo','Vigencia y condiciones','Garantías otorgadas.'],x_comisiones:['Colaborador','Base y % de comisión','Comisiones por colaborador.'],x_recetas:['Platillo o producto','Ingredientes y costo','Recetas y costo por porción.'],x_rutas:['Ruta','Repartidor y paradas','Rutas de reparto.'],x_entregas:['Entrega','Cliente, dirección y estado','Entregas pendientes y realizadas.'],x_produccion:['Orden de producción','Producto y cantidad','Lo que se está produciendo.'],x_promociones:['Promoción','Condiciones y vigencia','Promociones activas.'],x_descuentos:['Descuento','Condiciones','Descuentos configurados.']};
function xPage(id){const c=currentCompany(),g=c.setup.profile.grupo,rows=(c.data.extra||{})[id]||[],cf=(c.setup.custom||[]).filter(f=>f.e==='Módulos nuevos'),m=XM[id]||['Nombre','Detalle','Registro simple de este módulo.'];
return pageHead(lab(id,g),m[2],'')+`<section class="card table-card"><div class="nx-in" style="padding:14px;flex-wrap:wrap"><input id="xn" placeholder="${esc(m[0])}"><input id="xd" placeholder="${esc(m[1])}">${cf.map((f,i)=>`<label class="nx-l">${esc(f.n)}${inp(f,'xf'+i)}</label>`).join('')}<button class="btn primary" onclick="NX.xadd('${id}')">Agregar</button></div><div class="table-wrap"><table><thead><tr><th>${esc(m[0])}</th><th>${esc(m[1])}</th>${cf.map(f=>`<th>${esc(f.n)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr><td><strong>${esc(r.n)}</strong></td><td>${esc(r.d)}</td>${cf.map(f=>`<td>${esc((r.f||{})[f.n]??'')}</td>`).join('')}</tr>`).join('')}</tbody></table></div></section>`}
/* ===== Estado ===== */
let W=null;const D=ns=>ns==='w'?W.d:currentCompany().setup,L=(ns,k)=>D(ns)[k],AN=ns=>D(ns).answers;
const MC={inventory:{k:'invn',t:'¿Qué quieres controlar?',main:['Existencias','Entradas y salidas','Inventario mínimo y alertas','Costos'],adv:['Ajustes de inventario','Historial de movimientos']},sales:{k:'sales',t:'¿Qué quieres controlar de tus ventas?',main:['Tickets','Descuentos y promociones','Devoluciones','Cortes de caja'],adv:['Facturas','Ventas a crédito','Ganancias','Propinas','Anticipos']},customers:{k:'custn',t:'¿Qué quieres guardar de tus clientes?',main:['Teléfono','Dirección','Historial de compras','Notas'],adv:['Crédito y deudas','Historial de pagos']},products:{k:'prod',t:'¿Qué información manejas de tus productos?',main:['Categorías','Marcas','Unidades de medida','Código de barras'],adv:['Variantes','Tallas','Colores','Códigos y SKU']},orders:{k:'ord',t:'¿Qué necesitas de tus pedidos?',main:['Estados de pedido','Entregas','Seguimiento'],adv:[]}};
const LISTS={roles:['Gerente','Vendedor','Cajero','Almacenista'],perm:['Descuentos','Inventario','Caja','Reportes','Comisiones']};
const LST=(k,ns)=>k==='roles'?(PB[kindOf(AN(ns))]||PB.general).rolesAll:LISTS[k],SEL=(a,k)=>Array.isArray(a[k])?a[k]:(k==='roles'&&a.roles==='Sí'?(PB[kindOf(a)]||PB.general).roles:[]);
const ui2=()=>ui.nx=ui.nx||{tab:'mods'};
const T=ns=>ns==='w'?W.tab:ui2().tab,setT=(ns,v)=>{ns==='w'?W.tab=v:ui2().tab=v};
const cls=on=>on?'on':'';
/* Sugerencias de CIA */
function sug(ns){const s=D(ns),g=G(s.answers),dis=s.dismiss||[];return recMenu(s.answers).filter(r=>r.on&&!s.menu.find(m=>m.id===r.id&&m.on)&&!dis.includes(r.id)).slice(0,2).map(r=>({id:r.id,t:`Para un negocio como el tuyo recomendamos activar ${lab(r.id,g)}.`}))}
const sugHtml=ns=>sug(ns).map(x=>`<div class="nx-sug"><span>${esc(x.t)}</span><span><button class="btn secondary" onclick="NX.sugA('${ns}','${x.id}',1)">Activar</button><button class="link" onclick="NX.sugA('${ns}','${x.id}',0)">Ahora no</button></span></div>`).join('');
/* Editor visual */
function editor(ns){const s=D(ns),t=T(ns),g=G(s.answers);
const tabs=[['mods','Módulos y menú'],['dash','Pantalla principal'],['adv','Avanzado']].map(([k,l])=>`<button class="${cls(t===k)}" onclick="NX.tab('${ns}','${k}')">${l}</button>`).join('');let b='';
if(t==='mods'){const on=s.menu.map((m,i)=>({m,i})).filter(x=>x.m.on),off=s.menu.filter(m=>!m.on);
b=sugHtml(ns)+`<div class="nx-list">${on.map(({m,i})=>{const mc=MC[m.id],open=ui2().mc===m.id&&mc;return `<div class="nx-row" draggable="true" ondragstart="NX.ds(${i})" ondragover="event.preventDefault()" ondrop="NX.dp('${ns}','menu',${i})"><span class="grip">⋮⋮</span><b>${esc(lab(m.id,g))}</b><span class="grow"></span>${mc?`<button class="link" onclick="NX.mcOpen('${ns}','${m.id}')">${open?'Cerrar':'Configurar'}</button>`:''}<button class="ar" aria-label="Subir" onclick="NX.mv('${ns}','menu',${i},-1)">↑</button><button class="ar" aria-label="Bajar" onclick="NX.mv('${ns}','menu',${i},1)">↓</button><label class="sw"><input type="checkbox" checked onchange="NX.tg('${ns}','menu',${i})"><i></i></label></div>${open?mcPanel(ns,m.id):''}`}).join('')}</div>
<div class="nx-add"><button class="btn secondary" onclick="NX.addOpen()">+ Agregar módulo</button>${ui2().add?`<div class="nx-chips">${s.menu.map((m,i)=>m.on?'':`<button onclick="NX.tg('${ns}','menu',${i})">${esc(lab(m.id,g))}</button>`).join('')||'<small>Ya están todos activos.</small>'}</div>`:''}</div>
<label class="nx-chk"><input type="checkbox" ${s.group?'checked':''} onchange="NX.grp('${ns}',this.checked)"> Agrupar el menú por secciones</label>`}
else if(t==='dash'){b=`<p class="nx-hint">Elige qué ver al abrir CIA y arrástralo para ordenar.</p><div class="nx-list">${s.wid.map((w,i)=>`<div class="nx-row" draggable="true" ondragstart="NX.ds(${i})" ondragover="event.preventDefault()" ondrop="NX.dp('${ns}','wid',${i})"><span class="grip">⋮⋮</span><b>${WD.find(x=>x[0]===w.id)[1]}</b><span class="grow"></span><button class="ar" onclick="NX.mv('${ns}','wid',${i},-1)">↑</button><button class="ar" onclick="NX.mv('${ns}','wid',${i},1)">↓</button><label class="sw"><input type="checkbox" ${w.on?'checked':''} onchange="NX.tg('${ns}','wid',${i})"><i></i></label></div>`).join('')}</div><button class="link" onclick="NX.reset('${ns}','wid')">Restaurar recomendado</button>`}
else b=advHtml(ns);
return `<div class="nx-tabs">${tabs}</div>${b}`}
function mcPanel(ns,id){const m=MC[id],a=eff(AN(ns)),cur=a[m.k]||[],ch=(o,j)=>`<button class="${cls(cur.includes(o))}" onclick="NX.mc('${ns}','${id}',${j})">${cur.includes(o)?'✓ ':''}${o}</button>`;
return `<div class="nx-cfg"><p>${m.t}</p><div class="nx-chips">${m.main.map((o,j)=>ch(o,j)).join('')}</div>${m.adv.length?`<button class="link" onclick="NX.mcAdv()">Configuración avanzada ${ui2().mcAdv?'▴':'▾'}</button>${ui2().mcAdv?`<div class="nx-chips">${m.adv.map((o,j)=>ch(o,m.main.length+j)).join('')}</div>`:''}`:''}</div>`}
function advHtml(ns){const s=D(ns),o=ui2().adv,a=eff(s.answers),sec=(k,t,c)=>`<div class="nx-acc"><button onclick="NX.adv('${k}')"><span>${t}</span><span>${o===k?'−':'+'}</span></button>${o===k?`<div class="nx-accb">${c}</div>`:''}</div>`;
const chips=k=>`<div class="nx-chips">${LST(k,ns).map((x,i)=>`<button class="${cls(SEL(a,k).includes(x))}" onclick="NX.ch('${ns}','${k}',${i})">${SEL(a,k).includes(x)?'✓ ':''}${x}</button>`).join('')}</div>`;
const cf=`${(s.custom||[]).map((f,i)=>`<div class="nx-line">${esc(f.n)} · ${f.e} · ${f.t}${f.o?' ('+esc(f.o)+')':''}<button class="link" onclick="NX.cfdel('${ns}',${i})">Quitar</button></div>`).join('')}<div class="nx-in" style="flex-wrap:wrap"><input id="cfn" placeholder="Nombre (ej. Ruta de entrega)"><select id="cfe">${CE.map(x=>`<option>${x}</option>`).join('')}</select><select id="cft">${CT.map(x=>`<option>${x}</option>`).join('')}</select><input id="cfo" placeholder="Opciones si es Lista: Ruta 1, Ruta 2"><button class="btn secondary" onclick="NX.cfadd('${ns}')">+ Crear campo personalizado</button></div><small>Los campos de Módulos nuevos ya se usan al registrar; en productos y clientes quedan guardados.</small>`;
const au=D(ns).autos,row=(k,pre,x,post)=>`<label class="nx-rule"><input type="checkbox" ${au[k].on?'checked':''} onchange="NX.au('${ns}','${k}',this.checked)"> <span>${pre}${x?` <input type="number" min="0" value="${au.stock.x}" onchange="NX.aux('${ns}',this.value)" style="width:64px">`:''} → ${post}</span></label>`;
const aut=row('stock','Cuando el inventario sea menor a',1,'mostrar alerta')+row('sale','Cuando se registre una venta','','actualizar inventario')+row('debt','Cuando exista saldo vencido','','mostrar alerta')+row('order','Cuando llegue un pedido','','notificar');
return sec('cf','Campos personalizados',cf)+sec('roles','Empleados y permisos',`<p class="nx-hint">Roles</p>${chips('roles')}<p class="nx-hint">Permisos adicionales</p>${chips('perm')}`)+sec('au','Automatizaciones',aut)}
/* ===== Pantallas ===== */
const shell=(inner,prog)=>`<div class="nx"><header class="nx-top"><span class="nx-logo">CIA</span><span class="nx-bar"><i style="width:${prog||0}%"></i></span><button type="button" class="link" onclick="NX.cancel()">Cancelar</button></header><main class="nx-main">${inner}</main></div>`;
function nxPreview(){
 const a=W?.a||{},hasT=!!(a.type||a.free),kd=hasT?kindOf(a):'general',pb=PB[kd]||PB.general,tr=tierOf(a),g=G(a);
 const name=esc(a.company||'Mi empresa'),type=esc(a.subtype&&a.subtype!=='Otro'?a.subtype:(a.free||(a.type==='Otro'?a.other:a.type)||'Empresa'));
 const tone=(a.brandTone||'Moderna').toLowerCase();
 const colors={profesional:['#2563eb','#dbeafe'],moderna:['#7c3aed','#ede9fe'],amigable:['#16a34a','#dcfce7'],premium:['#c2410c','#ffedd5'],dinámica:['#db2777','#fce7f3'],'seria y confiable':['#0f766e','#ccfbf1']};
 const c=colors[tone]||['#6366f1','#eef2ff'];
 const lb=id=>(pb.voc||{})[id]||lab(id,g);
 let items=[];try{items=(W.d?W.d.menu:recMenu(a)).filter(i=>i.on).slice(0,6)}catch(e){}
 const fb=['Ventas','Clientes','Productos','Inventario','Finanzas'].map(m=>['f',m,'•']);
 const mods=[['dashboard','Inicio','⌂'],...(hasT&&items.length?items.map(i=>{const x=genOf(i.id);return[i.id,lb(i.id),x?x[2]:(ITEM[i.id]||[])[2]||'•']}):fb)].slice(0,7);
 const specific = ({
   salon:`<div class="nx-industry-panel salon"><div class="nx-industry-title"><b>Agenda de hoy</b><span>Ver agenda →</span></div><div class="nx-schedule"><p><i>09:30</i><b>Corte y barba</b><em>Marco · Confirmada</em></p><p><i>10:15</i><b>Tinte y secado</b><em>Lucía · En servicio</em></p><p><i>11:00</i><b>Manicure</b><em>Andrea · Próxima</em></p></div></div>`,
   dist:`<div class="nx-industry-panel dist"><div class="nx-industry-title"><b>Operación de almacén</b><span>Ver inventario →</span></div><div class="nx-warehouse"><div><i>▦</i><b>1,284</b><small>Productos en stock</small></div><div><i>⇢</i><b>12</b><small>Pedidos por surtir</small></div><div><i>⌁</i><b>4</b><small>Rutas pendientes</small></div></div><div class="nx-stockline"><span>Existencias críticas</span><b>8 productos</b></div></div>`,
   food_table:`<div class="nx-industry-panel food"><div class="nx-industry-title"><b>Salón y comandas</b><span>Ver mesas →</span></div><div class="nx-tables">${['Mesa 01|Ocupada','Mesa 02|Libre','Mesa 03|Ocupada','Mesa 04|Por cobrar','Mesa 05|Libre','Mesa 06|Ocupada'].map((x,i)=>`<span class="${i===1||i===4?'free':i===3?'pay':''}"><b>${x.split('|')[0]}</b><small>${x.split('|')[1]}</small></span>`).join('')}</div></div>`,
   food_fast:`<div class="nx-industry-panel food"><div class="nx-industry-title"><b>Comandas en cocina</b><span>Ver pedidos →</span></div><div class="nx-orders"><p><b>#104 · Tacos de asada</b><em>Preparando · 8 min</em></p><p><b>#105 · Combo familiar</b><em>Nuevo pedido · 2 min</em></p><p><b>#106 · Para llevar</b><em>Listo para entregar</em></p></div></div>`,
   clinic:`<div class="nx-industry-panel clinic"><div class="nx-industry-title"><b>Agenda de consultas</b><span>Ver pacientes →</span></div><div class="nx-schedule"><p><i>09:00</i><b>Consulta general</b><em>Paciente A · Confirmada</em></p><p><i>10:00</i><b>Seguimiento</b><em>Paciente B · En sala</em></p><p><i>11:30</i><b>Primera consulta</b><em>Paciente C · Próxima</em></p></div></div>`,
   shop:`<div class="nx-industry-panel shop"><div class="nx-industry-title"><b>Productos más vendidos</b><span>Ver catálogo →</span></div><div class="nx-products"><p><i>01</i><b>Producto destacado</b><em>+18%</em></p><p><i>02</i><b>Producto popular</b><em>+12%</em></p><p><i>03</i><b>Novedades</b><em>+8%</em></p></div></div>`,
   maker:`<div class="nx-industry-panel maker"><div class="nx-industry-title"><b>Órdenes de producción</b><span>Ver producción →</span></div><div class="nx-stockline"><span>Orden #P-104</span><b>En proceso · 72%</b></div><div class="nx-progress"><i style="width:72%"></i></div><div class="nx-stockline"><span>Orden #P-105</span><b>Programada</b></div></div>`,
   build:`<div class="nx-industry-panel build"><div class="nx-industry-title"><b>Proyectos activos</b><span>Ver proyectos →</span></div><div class="nx-stockline"><span>Obra comercial</span><b>68% completada</b></div><div class="nx-progress"><i style="width:68%"></i></div><div class="nx-stockline"><span>Instalación norte</span><b>En curso</b></div></div>`,
   repair:`<div class="nx-industry-panel repair"><div class="nx-industry-title"><b>Órdenes de trabajo</b><span>Ver órdenes →</span></div><div class="nx-orders"><p><b>OT-021 · Diagnóstico</b><em>En revisión</em></p><p><b>OT-022 · Reparación</b><em>En proceso</em></p></div></div>`,
   general:`<div class="nx-industry-panel general"><div class="nx-industry-title"><b>Actividad del negocio</b><span>Ver reportes →</span></div><div class="nx-stockline"><span>Operación del día</span><b>Todo en orden</b></div></div>`
 })[kd] || `<div class="nx-industry-panel general"><div class="nx-industry-title"><b>Actividad del negocio</b><span>Ver reportes →</span></div><div class="nx-stockline"><span>Operación del día</span><b>Todo en orden</b></div></div>`;
 return `<aside class="nx-preview"><div class="nx-preview-head"><div><span class="nx-live">● VISTA PREVIA EN VIVO</span><h2>Así se verá tu CIA</h2><p>${hasT?`Se adapta a tu ${esc(pb.name.toLowerCase())} mientras respondes.`:'La configuración cambia mientras respondes.'}</p></div><span class="nx-phone-dot">●</span></div><div class="nx-appmock nx-kind-${kd}"><div class="nx-mock-side"><div class="nx-mock-brand" style="background:linear-gradient(135deg,${c[0]},#06b6d4)">${(a.company||'C').slice(0,1).toUpperCase()}</div><strong>${name}</strong><small>${type}</small>${mods.map((m,i)=>`<div class="nx-mock-nav ${i===0?'active':''}"><i>${m[2]}</i>${esc(m[1])}</div>`).join('')}</div><div class="nx-mock-main"><div class="nx-mock-top"><div><small>Buenos días</small><h3>${name}</h3></div><span class="nx-avatar">${(name.replace(/<[^>]+>/g,'')||'C').slice(0,1)}</span></div><div class="nx-mock-cards">${pb.kpis.map(k=>`<div><small>${esc(k[0])}</small><b>${esc(k[1])}</b><em>${esc(k[2])}</em></div>`).join('')}</div>${specific}<div class="nx-mock-bottom"><div><b>Acciones rápidas</b>${pb.act.map(x=>`<span>${esc(x)}</span>`).join('')}</div><div><b>Actividad reciente</b>${pb.log.map(x=>`<p>${esc(x)}</p>`).join('')}</div></div></div></div><div class="nx-preview-tags"><span style="background:${c[1]};color:${c[0]}">✦ ${esc(a.brandTone||'Estilo moderno')}</span><span>⚙ ${esc(pb.name)}</span><span>${tr==='large'?'◆ Empresa grande: autorizaciones y auditoría':'▦ Pantalla principal a tu medida'}</span></div></aside>`;
}
const draw=(h,p)=>{
 // Mantener posición y foco entre pasos: actualizar una respuesta no debe parecer una recarga.
 const scrollY=window.scrollY||window.pageYOffset||0;
 const active=document.activeElement;
 const activeId=active&&active.id?active.id:null;
 const activeName=active&&active.name?active.name:null;
 const start=active&&typeof active.selectionStart==='number'?active.selectionStart:null;
 const end=active&&typeof active.selectionEnd==='number'?active.selectionEnd:null;
 const mainBefore=app.querySelector('.nx-main'), mainScroll=mainBefore?mainBefore.scrollTop:0;
 const workBefore=app.querySelector('.nx-workspace'), workScroll=workBefore?workBefore.scrollTop:0;
 const split=!!W;
 app.innerHTML=split?`<div class="nx nx-split"><header class="nx-top"><span class="nx-logo">CIA</span><span class="nx-bar"><i style="width:${p||0}%"></i></span><button type="button" class="link" onclick="NX.cancel()">Cancelar</button></header><div class="nx-workspace"><main class="nx-main">${h}</main>${nxPreview()}</div></div>`:shell(h,p);
 const mainAfter=app.querySelector('.nx-main'); if(mainAfter)mainAfter.scrollTop=mainScroll;
 const workAfter=app.querySelector('.nx-workspace'); if(workAfter)workAfter.scrollTop=workScroll;
 let target=null;
 if(activeId){try{target=app.querySelector('#'+CSS.escape(activeId))}catch(_){}}
 if(!target&&activeName){try{target=app.querySelector('[name="'+CSS.escape(activeName)+'"]')}catch(_){}}
 if(!target)target=app.querySelector('[autofocus]');
 if(target&&target.focus){target.focus({preventScroll:true});if(start!==null&&typeof target.setSelectionRange==='function'){try{target.setSelectionRange(start,end)}catch(_){}}}
 requestAnimationFrame(()=>{window.scrollTo({top:scrollY,left:0,behavior:'instant'});if(mainAfter)mainAfter.scrollTop=mainScroll;if(workAfter)workAfter.scrollTop=workScroll;});
};
function wizRender(){const s=W.step,a=W.a;
if(s==='color'){const palettes=[['premium','Negro + dorado','Elegante y premium','#111318','#D6B76A'],['blue','Azul + dorado','Tecnológico y profesional','#3478f6','#c6a253'],['violet','Violeta + dorado','Creativo y enfocado en IA','#7955d9','#d6b76a'],['green','Verde + dorado','Fresco y natural','#16856b','#d6b76a'],['burgundy','Vino + dorado','Distintivo y sofisticado','#8f2445','#d6b76a']];return draw(`<section class="nx-palette-welcome"><span class="nx-welcome-badge">CIA · PERSONALIZA TU ESPACIO</span><h1>¿Qué color representará a tu empresa?</h1><p>Esta es la primera decisión. Al elegir una paleta, verás cómo cambia CIA al instante. Cada empresa puede tener su propio estilo y cambiarlo después.</p></section><div class="nx-palette-grid">${palettes.map(([id,name,desc,primary,gold])=>`<button class="nx-palette-card ${a.palette===id?'on':''}" onclick="NX.palette('${id}')"><span class="nx-palette-swatches"><i style="background:${primary}"></i><i style="background:${gold}"></i><i style="background:#f7f5f0"></i></span><b>${name}</b><small>${desc}</small><em>${a.palette===id?'✓ Seleccionada':'Elegir paleta'}</em></button>`).join('')}</div><div class="nx-act"><button class="btn primary" onclick="NX.paletteNext()">Continuar con estos colores →</button></div><p class="nx-privacy-note">La paleta se guardará en esta empresa; las demás empresas pueden usar colores diferentes.</p>`,5)}
if(s==='type'){const sel=a.type,icons={Tienda:'▣',Comida:'◒','Belleza y salud':'✂',Servicios:'✦',Distribución:'◈',Fabricación:'⚒',Construcción:'▦','Empresa grande':'◆',Otro:'+'};return draw(`<section class="nx-setup-hero"><div class="nx-setup-copy"><span class="nx-welcome-badge">CIA · TU ESPACIO, A TU MANERA</span><h1>Primero, cuéntame de tu negocio.</h1><p>Te haré unas preguntas breves y adaptaré CIA a tu forma de trabajar. Tú decides qué herramientas usar; podrás cambiarlo después.</p><div class="nx-setup-points"><span>✦ Preguntas según tu giro</span><span>✓ Funciones a tu medida</span><span>↻ Editable cuando quieras</span></div></div><div class="nx-setup-orbit" aria-hidden="true"><span>Ventas</span><span>Clientes</span><span>Operación</span><span class="nx-orbit-core">C</span></div></section><label class="nx-lab">1. ¿A qué se dedica tu empresa?</label><p class="nx-sub nx-personalize-note">Esto cambia las preguntas y las recomendaciones. Por ejemplo, una peluquería necesita agenda y comisiones; una distribuidora, almacén, pedidos y rutas.</p><div class="nx-business-grid">${CATS.map(c=>`<button class="${sel===c[0]&&!a.free?'on':''}" onclick="NX.cat('${c[0]}','${c[1]}')"><i>${icons[c[0]]}</i><span>${c[0]}</span></button>`).join('')}</div><label class="nx-lab">¿O prefieres describirlo con tus propias palabras?</label><input class="nx-text" id="nxFree" value="${esc(a.free||'')}" oninput="NX.f('free',this.value)" placeholder="Ej. Distribuyo productos de limpieza a tiendas y restaurantes"><label class="nx-lab">2. ¿Cómo se llama tu empresa?</label><input class="nx-text" id="nxCo" value="${esc(a.company||'')}" oninput="NX.f('company',this.value)" placeholder="Ej. Distribuidora Savin" autofocus><div id="aerr" class="error" style="display:none"></div><div class="nx-act"><button class="btn primary" onclick="NX.toLevel()">Conocer mi negocio y personalizar CIA →</button></div><p class="nx-privacy-note">No tienes que saber de sistemas. CIA te guía paso a paso y puedes omitir preguntas que aún no tengas claras.</p>`,15)}
if(s==='level'){const L=[['q','Rápida','Empieza sin complicaciones','CIA configurará automáticamente lo necesario para tu negocio.'],['r','Recomendada','Configuración inteligente','CIA configurará lo habitual para tu negocio y te preguntará solamente lo importante.'],['m','A tu medida','Tú decides','Controla módulos, menú, dashboard, información, permisos y más.']];
return draw(`<h1>¿Cómo quieres configurarlo?</h1><p class="nx-sub">Siempre podrás cambiarlo después.</p><div class="nx-opts">${L.map(l=>`<button class="nx-opt ${cls(W.lv===l[0])}" onclick="NX.lv('${l[0]}')"><span><b>${l[1]}</b>${l[0]==='r'?'<em>Recomendada</em>':''}<strong>${l[2]}</strong><small>${l[3]}</small></span><i></i></button>`).join('')}</div><div class="nx-act"><button class="btn secondary" onclick="NX.go('type')">Atrás</button><button class="btn primary" onclick="NX.afterLevel()">Continuar</button></div>`,40)}
if(s==='q'){const qs=qList(),q=qs[W.qi],opts=typeof q.opts==='function'?q.opts(W.a):q.opts,pc=Math.round(((W.qi+1)/qs.length)*100),palette=['violet','blue','cyan','green','orange','pink','indigo'],tone=palette[W.qi%palette.length],selected=Array.isArray(a[q.id])?a[q.id]:[];return draw(`<div class="nx-qhead ${tone}"><div class="nx-qicon">✦</div><div><p class="nx-step">CIA ESTÁ APRENDIENDO · Pregunta ${W.qi+1} de ${qs.length}${q.lv==='m'?' · Detalle opcional':''}</p><div class="nx-qprogress"><i style="width:${pc}%"></i></div></div></div><div class="nx-question-intro"><span>PARA PERSONALIZAR TU ESPACIO</span><h1>${qt(q)}</h1>${q.hint?`<p class="nx-sub">${q.hint}</p>`:''}${q.multi?'<p class="nx-sub">Selecciona todas las opciones que apliquen.</p>':''}</div><div class="nx-chips big nx-answer-grid ${tone}">${opts.map((o,i)=>{const on=q.multi?selected.includes(o):a[q.id]===o;return `<button class="${cls(on)}" onclick="${q.multi?`NX.toggleAns(${i})`:`NX.ans(${i})`}"><span>${on?'✓ ':''}${o}</span><b>${q.multi?(on?'✓':'＋'):'›'}</b></button>`}).join('')}</div><div class="nx-act"><button class="btn secondary" onclick="NX.back()">Atrás</button><button class="link" onclick="NX.ans(-1)">Omitir</button>${q.multi?'<button class="btn primary" onclick="NX.nextAns()">Continuar →</button>':''}</div>`,40+Math.round(W.qi/qs.length*50))}
if(s==='edit')return draw(`<h1>Personaliza tu empresa</h1><p class="nx-sub">Todo es opcional. Lo que no toques queda como CIA lo recomienda.</p>${editor('w')}<div class="nx-act"><button class="btn primary" onclick="NX.go('summary')">Listo</button></div>`,90);
if(s==='plan'){const plans=[['Free','Gratis','Para empezar a organizar tu negocio.','Funciones esenciales','Configuración sencilla'],['Plus','Plan Plus','Para negocios que quieren crecer.','Más herramientas de operación','Más control del negocio'],['Pro','Plan Pro','Para operaciones más completas.','Controles y análisis avanzados','Procesos más completos'],['Max','Plan Max','Para empresas con necesidades amplias.','Herramientas avanzadas disponibles','Configuración de mayor alcance']];return draw(`<div class="nx-final-plan"><span class="nx-step">ÚLTIMO PASO</span><h1>Elige el plan para tu CIA</h1><p class="nx-sub">Tu espacio ya está personalizado. Selecciona cómo quieres comenzar; podrás revisar el plan después.</p><div class="nx-plan-grid">${plans.map((p,i)=>`<button class="nx-plan-card ${a.plan===p[0]?'on':''} ${p[0]==='Max'?'nx-plan-max':''}" onclick="NX.choosePlan('${p[0]}')"><span class="nx-plan-tag">${i===1?'POPULAR':i===2?'MÁS FUNCIONES':i===3?'MÁXIMO NIVEL':'PARA COMENZAR'}</span><h2>${p[0]}</h2><strong class="nx-plan-price">${p[1]}</strong><p>${p[2]}</p><ul><li>${p[3]}</li><li>${p[4]}</li></ul><span class="nx-plan-select">${a.plan===p[0]?'✓ Seleccionado':'Elegir este plan'}</span></button>`).join('')}</div>${!getSession()?`<section class="nx-plan-account"><h3>Tu acceso a CIA</h3><p class="nx-sub">Crea el acceso del administrador para entrar a tu empresa.</p><div class="nx-form"><input id="an" placeholder="Nombre completo" value="${esc(a.ownerName||'')}" oninput="NX.f('ownerName',this.value)"><input id="ae" type="email" placeholder="Correo" value="${esc(a.ownerEmail||'')}" oninput="NX.f('ownerEmail',this.value)"><input id="ap" type="password" placeholder="Contraseña (mínimo 6 caracteres)"></div></section>`:''}<div id="aerr" class="error" style="display:none"></div><div class="nx-act"><button class="btn secondary" onclick="NX.go('summary')">Atrás</button><button class="btn primary" onclick="NX.createWithPlan()">Crear mi CIA →</button></div><p class="nx-privacy-note">La selección se guarda en el prototipo. La contratación y los cobros requieren conectar el sistema de pagos.</p></div>`,100)}
const d=W.d,g=d.profile?.grupo||G(a),on=d.menu.filter(i=>i.on),acct=!getSession();
draw(`<h1>Así quedará tu empresa</h1><p class="nx-sub">Esto es lo que preparamos para tu negocio.</p><dl class="nx-sum"><div><dt>Empresa</dt><dd>${esc(a.company||'Mi empresa')}</dd></div><div><dt>Negocio</dt><dd>${esc(build(eff(a)).tipo_negocio)}</dd></div><div><dt>Tamaño</dt><dd>${TIERN[d.profile.tier||'solo']}</dd></div><div><dt>Configuración</dt><dd>${LVN[W.lv]}</dd></div><div><dt>Pantalla principal</dt><dd>${d.wid.filter(w=>w.on).length} tarjetas</dd></div></dl>${promiseHtml(d)}<label class="nx-lab">Módulos activos</label><div class="nx-chips ro">${on.map(i=>`<span>${esc(lab(i.id,g))}</span>`).join('')}</div>${sugHtml('w')}${acct?`<p class="nx-privacy-note">En el siguiente paso crearás tu acceso de administrador.</p>`:''}<div id="aerr" class="error" style="display:none"></div><div class="nx-act"><button class="btn secondary" onclick="NX.go('edit')">Personalizar</button><button class="btn primary" onclick="${W.edit?'NX.finish()':'NX.toPlan()'}">${W.edit?'Guardar cambios':'Elegir plan'}</button></div>`,100)}
const promiseHtml=d=>{const k=d.profile.kind||'general',pb=PB[k]||PB.general,l=[...pb.promise];if(d.profile.tier==='large'&&k!=='corp')l.push('Autorizaciones, bitácora y roles por área');return `<label class="nx-lab">Hecho para tu ${esc(pb.name.toLowerCase())}</label><ul class="nx-promise">${l.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`};
Q.push(
  {id:'branchCount',when:a=>a.branches&&a.branches!=='No',q:'¿Cuántas sucursales, puntos de venta o almacenes tienes?',opts:['2','3 a 5','6 a 10','Más de 10','Todavía no lo sé']},
  {id:'branchControl',lv:'r',when:a=>a.branches&&a.branches!=='No',q:'¿Cómo quieres administrar tus sucursales o almacenes?',opts:['Cada sucursal por separado','Ver todas desde una sola cuenta','Control central y operación por sucursal']},
  {id:'salonAgenda',when:a=>kindOf(a)==='salon',q:'¿Cómo quieres organizar las citas de tu peluquería o salón?',opts:['Agenda por estilista','Agenda compartida para todo el equipo','Sin agenda, atender por llegada','Quiero ambas opciones']},
  {id:'salonCommissions',lv:'r',when:a=>kindOf(a)==='salon'&&a.team&&a.team!=='Solo yo',q:'¿Cómo manejas las comisiones del personal?',opts:['Por servicio realizado','Por porcentaje de venta','Cada colaborador tiene su propio acuerdo','No manejo comisiones']},
  {id:'distributionWarehouses',lv:'r',when:a=>G(a)==='whole',q:a=>/limpieza/i.test(a.subtype||'')?'¿Cómo almacenas y distribuyes tus productos de limpieza?':/refacciones/i.test(a.subtype||'')?'¿Cómo surt es y entregas las refacciones a tus clientes?'.replace('surt es','surtes'):'¿Cómo manejas tus almacenes y entregas?',opts:a=>/limpieza/i.test(a.subtype||'')?['Una bodega y entregas locales','Varias bodegas y rutas','Bodega central y puntos de distribución','Los clientes recogen en bodega','Envíos por paquetería']:/refacciones/i.test(a.subtype||'')?['Mostrador y entrega local','Surtido a talleres y mecánicos','Rutas de reparto a negocios','Envíos por paquetería','Varias formas']:['Un almacén y entregas locales','Varios almacenes y rutas','Bodega central y sucursales','Solo recibo pedidos, no reparto']},
  {id:'cleaningRange',lv:'r',multi:true,when:a=>G(a)==='whole'&&/limpieza/i.test(a.subtype||''),q:'¿Qué líneas de productos de limpieza distribuyes? Puedes elegir varias.',opts:['Químicos y desinfectantes','Jabones, detergentes y sanitizantes','Papel, bolsas y desechables','Equipo y utensilios de limpieza','Todas esas líneas','Otra combinación']},
  {id:'cleaningUnits',lv:'r',multi:true,when:a=>G(a)==='whole'&&/limpieza/i.test(a.subtype||''),q:'¿En qué presentaciones vendes los productos de limpieza? Puedes elegir varias.',opts:['Piezas y envases individuales','Litros y galones','Cubetas y bidones','Cajas y paquetes por mayoreo','Presentaciones variadas']},
  {id:'cleaningCustomers',lv:'r',multi:true,when:a=>G(a)==='whole'&&/limpieza/i.test(a.subtype||''),q:'¿A qué tipos de clientes surtes productos de limpieza? Puedes elegir varios.',opts:['Casas y consumidores','Oficinas y comercios','Restaurantes y hoteles','Escuelas, hospitales e instituciones','Empresas de limpieza','Varios tipos de clientes']},
  {id:'cleaningLots',lv:'m',when:a=>G(a)==='whole'&&/limpieza/i.test(a.subtype||''),q:'¿Necesitas identificar lotes, caducidad o fichas técnicas de los productos?',opts:['Lotes y caducidad','Fichas técnicas y hojas de seguridad','Ambos','Solo controlar existencias','No por ahora']},
  {id:'partsRange',lv:'r',multi:true,when:a=>G(a)==='whole'&&/refacciones/i.test(a.subtype||''),q:'¿Qué tipos de refacciones distribuyes? Puedes elegir varios.',opts:['Automotrices','Motocicletas','Maquinaria y equipo','Eléctricas e industriales','Varias categorías']},
  {id:'partsCatalog',lv:'r',multi:true,when:a=>G(a)==='whole'&&/refacciones/i.test(a.subtype||''),q:'¿Qué datos necesitas para encontrar la refacción correcta? Puedes elegir varios.',opts:['Código o número de parte','Marca, modelo y año del vehículo/equipo','Compatibilidades y equivalencias','Código, marca y compatibilidad','Solo nombre y descripción']},
  {id:'partsSupply',lv:'m',multi:true,when:a=>G(a)==='whole'&&/refacciones/i.test(a.subtype||''),q:'¿Cómo consigues las refacciones que no tienes en existencia? Puedes elegir varias.',opts:['Las pido al proveedor bajo pedido','Las transfiero desde otra sucursal','Ofrezco equivalentes compatibles','Todas esas opciones','No manejo pedidos especiales']},
  {id:'colorHex',lv:'m',when:a=>a.brandColor&&a.brandColor!=='Quiero que CIA lo sugiera',q:'¿Tienes un color exacto de marca?',hint:'Si conoces el código hexadecimal, puedes anotarlo en la siguiente pantalla de personalización.',opts:['Usar el estilo que elegí','Tengo colores de marca y los configuraré después','Quiero ver opciones antes de decidir']}
);
const qList=()=>Q.filter(q=>(!q.when||q.when(W.a))&&(W.lv==='m'||!q.lv||q.lv===W.lv));
function draftOf(a){const e=eff(a);return{answers:a,profile:build(e),menu:recMenu(a),wid:recWid(a),custom:[],autos:defAu(),group:false,dismiss:[]}}
const rebuild=ns=>{if(ns==='w')return wizRender();mutate(c=>{const s=c.setup;s.profile=build(eff(s.answers));applySetup(c);applyRoles(c)});renderApp()};
const after=ns=>{if(ns==='w'){W.d.profile=build(eff(W.a));wizRender()}else rebuild('c')};
const dragS={};
async function fin(){const a=W.a,d=W.d,E=m=>{const x=document.getElementById('aerr');if(x){x.textContent=m;x.style.display='block'}return false};
const setup={level:W.lv,profile:build(eff(a)),answers:{...a},palette:a.palette||'premium',menu:d.menu,wid:d.wid,custom:d.custom,autos:d.autos,group:d.group,dismiss:d.dismiss,fired:{}};
if(W.edit){mutate(c=>{setup.fired=c.setup?.fired||{};c.setup=setup;c.name=a.company||c.name;applySetup(c);applyRoles(c)});audit('Actualizó la personalización',LVN[W.lv])}
else{const db=loadDB(),cid=uid('cmp'),bid=uid('br'),mods=modsOf(d.menu),roles=rolesFor(a,mods),has_=!!getSession();let userId;
if(has_){userId=getSession().userId;const u=db.users.find(x=>x.id===userId);u.companyIds=[...(u.companyIds||[]),cid]}
else{const n=(document.getElementById('an')?.value||a.ownerName||'').trim(),em=(document.getElementById('ae')?.value||a.ownerEmail||'').trim().toLowerCase(),p=document.getElementById('ap')?.value||'';if(!n||!em)return E('Completa tu nombre y correo.');if(p.length<6)return E('La contraseña debe tener al menos 6 caracteres.');if(db.users.some(u=>u.email===em))return E('Ese correo ya está registrado.');
userId=uid('usr');db.users.push({id:userId,name:n,email:em,passwordHash:await hashPassword(p),companyIds:[cid],createdAt:nowISO(),lastAccess:nowISO(),sessions:[]})}
const name=a.company||'Mi empresa';
db.companies.push({id:cid,name,legalName:name,rfc:'',currency:'MXN',tax:16,industry:setup.profile.tipo_negocio,plan:a.plan||'Free',theme:'light',palette:a.palette||'premium',onboardingComplete:true,setup,modules:mods,branches:[{id:bid,name:'Principal',city:'',address:'',active:true}],roles,members:[{userId,roleId:roles[0].id,branchId:bid,status:'active'}],
data:{products:[],customers:[],suppliers:[],sales:[],quotes:[],orders:[],purchases:[],accounts:[],transactions:[],tasks:[],approvals:[],audit:[],notifications:[{id:uid('nt'),type:'info',title:'Empresa lista',text:'Preparamos tu espacio. Puedes cambiarlo en Personalizar empresa.',read:false,at:nowISO(),action:'bizconfig'}],transfers:[],documents:[],receivables:[],payables:[],warehouses:mods.warehouses?[{id:'wh_'+bid,name:'Almacén principal',branch:'Principal',type:'General',active:true,capacity:0,occupancy:0}]:[],stockMoves:[],returns:[],cashClosings:[],extra:{},metrics:{revenue:0,profit:0,expenses:0,receivable:0,payable:0,inventoryValue:0,margin:0,monthGrowth:0},trend:[0,0,0,0,0,0,0],branchSales:[],categorySales:[],onboarding:{company:true,branch:true,tax:true,modules:true,team:false,products:false}}});
saveDB(db);setSession({userId,companyId:cid})}
W=null;location.hash='';ui.route='dashboard';render()}
window.NX_T={W:()=>W,curQ:()=>qList()[W.qi],buildNav,cfgPage,xPage,promiseHtml,prev:(a,d)=>{const w=W;W={a,d};try{return nxPreview()}finally{W=w}},eff,build,recMenu,recWid,kindOf,tierOf,rolesFor,qList:(a,lv)=>{const w=W;W={a,lv};const r=Q.filter(q=>(!q.when||q.when(a))&&(!q.lv||q.lv===lv)).map(q=>qt(q));W=w;return r},PB,modsFrom,bp};
/* API */
window.NX={
start:()=>{W={step:'color',a:{palette:'premium'},lv:'r',qi:0,tab:'mods',pub:!getSession()};if(window.CIAPalette)CIAPalette.apply('premium');wizRender()},
palette:id=>{W.a.palette=id;if(window.CIAPalette)CIAPalette.apply(id);wizRender()},paletteNext:()=>{W.step='type';wizRender()},
cancel:()=>{const pub=!getSession();W=null;if(pub)location.hash='';render()},go:s=>{W.step=s;wizRender()},
f:(k,v)=>{W.a[k]=v},cat:(t,g)=>{W.a.type=t;W.a.grp=g;W.a.free='';if(t==='Otro'){W.a.grp=undefined}wizRender();},
toLevel:()=>{const a=W.a,E=m=>{const x=document.getElementById('aerr');x.textContent=m;x.style.display='block'};const fr=(a.free||'').trim();
if(fr){a.type='Otro';a.other=fr;a.grp=guess(fr);a.what=fr}else if(!a.type||(a.type==='Otro'))return E('Elige un tipo de negocio o descríbelo con tus palabras.');else a.other=undefined;
if(!(a.company||'').trim())return E('Escribe el nombre de tu empresa.');a.company=a.company.trim();W.step='q';W.qi=0;if(!qList().length)return NX.toDraft();wizRender()},
lv:l=>{W.lv=l;wizRender()},
afterLevel:()=>{W.qi=0;W.step='q';if(!qList().length)return NX.toDraft();wizRender()},
ans:i=>{const q=qList()[W.qi],opts=typeof q.opts==='function'?q.opts(W.a):q.opts;if(i>=0){W.a[q.id]=opts[i];if(q.id==='sellq')W.a.sell=SELLQ[opts[i]]||[];if(q.id==='subtype'&&opts[i]==='Otro')W.a.subtype='Otro';}W.qi++;if(W.qi>=qList().length)return NX.toDraft();wizRender()},
 toggleAns:i=>{const q=qList()[W.qi];if(!q||!q.multi)return;const opts=typeof q.opts==='function'?q.opts(W.a):q.opts,chosen=Array.isArray(W.a[q.id])?[...W.a[q.id]]:[],v=opts[i],idx=chosen.indexOf(v);if(idx>=0)chosen.splice(idx,1);else chosen.push(v);W.a[q.id]=chosen;wizRender()},
 nextAns:()=>{W.qi++;if(W.qi>=qList().length)return NX.toDraft();wizRender()},
back:()=>{if(W.qi>0){W.qi--;wizRender()}else NX.go('level')},
toDraft:()=>{W.d=draftOf(W.a);if(W.lv==='m'){W.step='edit'}else{W.step='summary'}wizRender()},
 toPlan:()=>{const n=document.getElementById('an'),e=document.getElementById('ae');if(n)W.a.ownerName=n.value.trim();if(e)W.a.ownerEmail=e.value.trim().toLowerCase();W.step='plan';wizRender()},choosePlan:p=>{W.a.plan=p;wizRender()},createWithPlan:()=>{if(!W.a.plan){const x=document.getElementById('aerr');if(x){x.textContent='Elige un plan para continuar.';x.style.display='block'}return}NX.finish()},
finish:()=>{fin().catch(e=>{const x=document.getElementById('aerr');if(x){x.textContent='No se pudo crear: '+e.message;x.style.display='block'}})},
tab:(ns,k)=>{setT(ns,k);ns==='w'?wizRender():renderApp()},
tg:(ns,k,i)=>{const l=L(ns,k);l[i].on=!l[i].on;after(ns)},
mv:(ns,k,i,d)=>{const l=L(ns,k);let j=i+d;if(k==='menu')while(l[j]&&!l[j].on)j+=d;if(!l[j])return;[l[i],l[j]]=[l[j],l[i]];after(ns)},
ds:i=>{dragS.i=i},dp:(ns,k,i)=>{const l=L(ns,k);if(dragS.i==null)return;const[x]=l.splice(dragS.i,1);l.splice(i,0,x);dragS.i=null;after(ns)},
grp:(ns,v)=>{D(ns).group=v;after(ns)},reset:(ns,k)=>{D(ns)[k]=recWid(AN(ns));after(ns)},
addOpen:()=>{ui2().add=!ui2().add;W?wizRender():renderApp()},
mcOpen:(ns,id)=>{ui2().mc=ui2().mc===id?null:id;ns==='w'?wizRender():renderApp()},mcAdv:()=>{ui2().mcAdv=!ui2().mcAdv;W?wizRender():renderApp()},
mc:(ns,id,j)=>{const m=MC[id],o=[...m.main,...m.adv][j],a=AN(ns);a[m.k]=[...(eff(a)[m.k]||[])];const k=a[m.k].indexOf(o);k<0?a[m.k].push(o):a[m.k].splice(k,1);after(ns)},
adv:k=>{const u=ui2();u.adv=u.adv===k?null:k;W?wizRender():renderApp()},
ch:(ns,k,i)=>{const a=AN(ns);a[k]=[...SEL(a,k)];const o=LST(k,ns)[i],j=a[k].indexOf(o);j<0?a[k].push(o):a[k].splice(j,1);after(ns)},
cfadd:ns=>{const n=document.getElementById('cfn').value.trim();if(!n)return;D(ns).custom=D(ns).custom||[];D(ns).custom.push({n,e:document.getElementById('cfe').value,t:document.getElementById('cft').value,o:document.getElementById('cfo').value.trim()});after(ns)},
cfdel:(ns,i)=>{D(ns).custom.splice(i,1);after(ns)},
au:(ns,k,v)=>{D(ns).autos[k].on=v;if(ns==='c')mutate(()=>{})},aux:(ns,v)=>{D(ns).autos.stock.x=+v||0;if(ns==='c')mutate(()=>{})},
sugA:(ns,id,y)=>{const s=D(ns);if(y){const m=s.menu.find(x=>x.id===id);m?m.on=true:s.menu.push({id,on:true})}else(s.dismiss=s.dismiss||[]).push(id);after(ns)},
xadd:id=>{const n=document.getElementById('xn').value.trim();if(!n)return;const cf=(currentCompany().setup.custom||[]).filter(f=>f.e==='Módulos nuevos'),f={};cf.forEach((x,i)=>f[x.n]=document.getElementById('xf'+i).value);
mutate(c=>{c.data.extra=c.data.extra||{};(c.data.extra[id]=c.data.extra[id]||[]).unshift({n,d:document.getElementById('xd').value,f})});renderApp()},
setLv:l=>{mutate(c=>{c.setup.level=l});ui2().open=false;renderApp()},openEd:()=>{ui2().open=true;renderApp()},
sw:id=>{setSession({...getSession(),companyId:id});ui.route='dashboard';ui.coMenu=false;renderApp()},co:()=>{ui.coMenu=!ui.coMenu;renderApp()},
fresh:l=>{const c=currentCompany();const a={company:c.name,type:c.industry||'Otro',other:c.industry||'',grp:guess(c.industry||'')};a.free='';W={step:'edit',a,lv:l,qi:0,tab:'mods',edit:true,d:null};W.d=draftOf(a);wizRender()}};
/* Configuración → Personalizar empresa */
function cfgPage(){const c=currentCompany(),s=c.setup;
if(!s)return pageHead('Personalizar empresa','Esta empresa se creó antes del asistente.','')+`<section class="card settings-card"><p class="settings-intro">CIA puede preparar una configuración recomendada para tu negocio.</p><button class="btn primary" onclick="NX.fresh('r')">Preparar configuración</button></section>`;
const lv=nl(s.level),open=lv==='m'||ui2().open,g=s.profile.grupo,on=s.menu.filter(i=>i.on);
return pageHead('Personalizar empresa','Cambia lo que quieras. Nada se pierde al cambiar de nivel.','')+`<div class="nx-cfgpage"><div class="nx-seg">${['q','r','m'].map(l=>`<button class="${cls(lv===l)}" onclick="NX.setLv('${l}')">${LVN[l]}</button>`).join('')}</div>${sugHtml('c')}<section class="card settings-card"><h3>${esc(s.profile.tipo_negocio)}</h3><div class="nx-chips ro">${on.map(i=>`<span>${esc(lab(i.id,g))}</span>`).join('')}</div>${open?'':'<div class="nx-act"><button class="btn secondary" onclick="NX.openEd()">Personalizar</button></div>'}</section>${open?`<section class="card settings-card">${editor('c')}</section>`:''}</div>`}
function coMenu(){const u=currentUser(),el=document.querySelector('.company-switch');if(!el||!u)return;el.style.cursor='pointer';el.onclick=NX.co;
if(ui.coMenu){const cs=loadDB().companies.filter(c=>(u.companyIds||[]).includes(c.id)||c.id===currentCompany()?.id);el.insertAdjacentHTML('afterend',`<div class="nx-co">${cs.map(c=>`<button onclick="NX.sw('${c.id}')">${esc(c.name)}</button>`).join('')}<button class="nx-new" onclick="ui.coMenu=false;NX.start()">+ Crear empresa</button></div>`)}}
/* El asistente solo se abre desde "Crear empresa" */
renderRegister=function(){NX.start()};
const _r=render;render=function(){if(W){if(W.pub&&location.hash!=='#register'&&!getSession()){W=null}else return wizRender()}_r()};
window.addEventListener('hashchange',()=>{if(W&&W.pub&&location.hash!=='#register')W=null;render()});

/* v24 — CIA AI visible y utilizable dentro de la aplicación. */
const AI_PLAN_ORDER={Free:0,Plus:1,Pro:2,Max:3,Business:1,Start:0,Enterprise:3};
const normalizePlan=p=>({Business:'Plus',Start:'Free',Enterprise:'Max'}[p]||p||'Free');
const aiLevel=()=>AI_PLAN_ORDER[normalizePlan(currentCompany()?.plan)]??0;
const aiPlanName=()=>normalizePlan(currentCompany()?.plan);

/* Migra nombres antiguos del prototipo para que los planes actuales sean Free / Plus / Pro / Max. */
try{
  const db=loadDB();
  let changed=false;
  (db.companies||[]).forEach(c=>{const n=normalizePlan(c.plan);if(c.plan!==n){c.plan=n;changed=true}});
  if(changed)saveDB(db);
}catch(e){}

/* CIA AI se muestra en la navegación para todos; Free puede entrar y ver el acceso bloqueado. */
if(!NAV.some(([g,items])=>items.some(x=>x[0]==='ai'))){
  const gi=NAV.findIndex(x=>x[0]==='General');
  if(gi>=0)NAV[gi][1].push(['ai','CIA AI','✦']);
}
const oldCanAI=can;
can=function(p){if(p==='ai')return !!currentCompany();return oldCanAI(p)};

function aiSuggestions(){return [
  ['Ventas','¿Cómo van mis ventas este mes?'],
  ['Inventario','¿Qué productos debo reponer?'],
  ['Cobranza','¿Quién me debe dinero?'],
  ['Negocio','¿Qué debería atender hoy?']
]}
function aiAnswer(q){
  const d=data(),m=d.metrics||{},products=d.products||[],customers=d.customers||[],low=products.filter(p=>p.type==='Producto'&&Number(p.stock||0)<=Number(p.minStock||0)),debtors=customers.filter(c=>Number(c.balance||0)>0).sort((a,b)=>(b.balance||0)-(a.balance||0));
  const x=String(q||'').toLowerCase();
  if(/venta|vendimos|ingreso|ingresos/.test(x)) return `Este periodo llevas ${money(m.revenue)} de ingresos y una utilidad de ${money(m.profit)}, con un margen de ${pct(m.margin)}. ${Number(m.monthGrowth||0)>0?`Vas ${pct(m.monthGrowth)} arriba frente al mes anterior.`:'Puedo comparar periodos si quieres.'}`;
  if(/reponer|agot|inventario|stock|producto/.test(x)) return low.length?`Detecté ${low.length} producto${low.length===1?'':'s'} con stock bajo: ${low.slice(0,4).map(p=>`${p.name} (${p.stock} disponibles)`).join(', ')}. Te recomiendo revisar primero ${low[0].name}.`:'No detecto productos por debajo del mínimo configurado.';
  if(/debe|deben|cobrar|cobranza|pendiente/.test(x)) return debtors.length?`Tienes ${debtors.length} cuenta${debtors.length===1?'':'s'} con saldo pendiente por ${money(m.receivable)}. La mayor es ${debtors[0].name} con ${money(debtors[0].balance)}.`:'No hay cuentas por cobrar pendientes en los datos actuales.';
  if(/ganancia|utilidad|margen|gasto|gastos/.test(x)) return `Tu utilidad actual es de ${money(m.profit)} con un margen de ${pct(m.margin)}. Los gastos del periodo son ${money(m.expenses)}.`;
  if(/hoy|atender|prioridad|pendiente|tarea/.test(x)) return `Hoy conviene revisar primero las alertas de inventario, las cuentas por cobrar y las tareas pendientes. Puedo ayudarte a entrar a cualquiera de esas áreas.`;
  if(/hola|buenas|hey/.test(x)) return `Hola, ${currentUser()?.name?.split(' ')[0]||'soy yo'} 👋. Soy CIA AI. Puedo analizar ventas, inventario, cobranza, utilidad y operación de tu empresa.`;
  return `Puedo ayudarte a analizar tu negocio. Prueba preguntarme cosas como “¿Cómo van mis ventas?”, “¿Qué productos debo reponer?” o “¿Quién me debe dinero?”.`;
}
function aiPage(){
  const c=currentCompany(),name=c?.name||'tu empresa',plan=aiPlanName(),level=aiLevel();
  if(level===0)return `${pageHead('CIA AI','Tu asistente inteligente para entender y operar tu negocio.','')}<section class="card ai-locked"><div class="ai-orb">✦</div><div><span class="ai-badge">CIA AI</span><h2>Disponible desde Plus</h2><p>Actualiza tu plan para preguntarle a CIA sobre ventas, inventario, clientes y rendimiento de <strong>${esc(name)}</strong>.</p><div class="ai-lock-features"><span>✓ Análisis de ventas</span><span>✓ Inventario</span><span>✓ Cobranza</span></div><button class="btn primary" onclick="go('plans')">Ver planes</button></div></section>`;
  const msgs=ui.aiMessages||[];
  return `${pageHead('CIA AI','Tu asistente inteligente para entender y operar tu negocio.',`<span class="badge info">Plan ${plan}</span>`)}<div class="ai-workspace"><section class="card ai-chat"><header class="ai-chat-head"><div class="ai-avatar">✦</div><div><h2>CIA AI</h2><p>Conoce los datos de ${esc(name)} y te ayuda a interpretarlos.</p></div><span class="ai-live">● Listo</span></header><div class="ai-messages" id="aiMessages">${msgs.length?msgs.map(m=>`<div class="ai-msg ${m.role==='user'?'user':'assistant'}"><div>${m.role==='assistant'?'✦':'Tú'}</div><p>${esc(m.text)}</p></div>`).join(''):`<div class="ai-welcome"><div class="ai-orb">✦</div><h3>Hola, ${esc((currentUser()?.name||'').split(' ')[0]||'qué gusto')} 👋</h3><p>Puedo ayudarte a entender qué está pasando en tu negocio y, según tu plan, después podremos hacer acciones por ti.</p></div>`}</div><div class="ai-composer"><input id="aiInput" placeholder="Pregúntale algo a CIA..." onkeydown="if(event.key==='Enter')NXAI.ask()"><button class="btn primary" onclick="NXAI.ask()">Preguntar</button></div><div class="ai-disclaimer">CIA AI usa la información disponible de esta empresa. Las acciones que cambien datos requerirán confirmación.</div></section><aside class="ai-side"><section class="card"><div class="card-head"><div><h3>Prueba con esto</h3><p>Preguntas rápidas sobre tu negocio</p></div></div>${aiSuggestions().map(x=>`<button class="ai-suggestion" onclick="NXAI.ask(${JSON.stringify(x[1]).replace(/"/g,'&quot;')})"><span>${x[0]}</span><b>${x[1]}</b><i>→</i></button>`).join('')}</section><section class="card ai-plan-mini"><span class="ai-badge">PLAN ${plan.toUpperCase()}</span><h3>${level>=2?'CIA AI avanzado':'CIA AI'}</h3><p>${level>=3?'Copiloto empresarial, análisis profundo y automatizaciones.':level>=2?'Análisis avanzado y acciones con autorización.':'Consultas inteligentes sobre el negocio.'}</p>${level<3?`<button class="link" onclick="go('plans')">Conocer niveles de IA →</button>`:''}</section></aside></div>`;
}
window.NXAI={
  ask:q=>{
    const input=document.getElementById('aiInput'),text=String(q??input?.value??'').trim();
    if(!text)return;
    ui.aiMessages=ui.aiMessages||[];ui.aiMessages.push({role:'user',text});ui.aiMessages.push({role:'assistant',text:aiAnswer(text)});if(ui.aiMessages.length>12)ui.aiMessages=ui.aiMessages.slice(-12);renderApp();setTimeout(()=>document.getElementById('aiInput')?.focus(),0);
  },
  clear:()=>{ui.aiMessages=[];renderApp()}
};

/* La página CIA AI se integra al router existente. */
const _renderPageAI=renderPage;
renderPage=function(){if(ui.route==='ai')return aiPage();return _renderPageAI()};

/* Inserta CIA AI en Inicio sin convertir el dashboard en un chat gigante. */
const _dashboardAI=dashboard;
dashboard=function(){
  const html=_dashboardAI();
  const c=currentCompany(),level=aiLevel();
  const card=level===0?`<section class="card ai-dashboard-card locked"><div class="ai-dashboard-icon">✦</div><div><span class="ai-badge">CIA AI</span><h3>Tu asistente inteligente</h3><p>Disponible desde Plus. Pregunta sobre ventas, inventario, clientes y rendimiento.</p></div><button class="btn secondary" onclick="go('plans')">Ver Plus</button></section>`:`<section class="card ai-dashboard-card"><div class="ai-dashboard-icon">✦</div><div class="ai-dashboard-main"><span class="ai-badge">CIA AI · ${aiPlanName().toUpperCase()}</span><h3>Pregúntale a CIA</h3><p>Obtén respuestas sobre tu negocio sin salir del resumen ejecutivo.</p><div class="ai-quick-row">${aiSuggestions().slice(0,3).map(x=>`<button onclick="NXAI.ask(${JSON.stringify(x[1]).replace(/"/g,'&quot;')});go('ai')">${x[1]}</button>`).join('')}</div></div><button class="btn primary" onclick="go('ai')">Abrir CIA AI</button></section>`;
  return html.replace('</div><div class="dashboard-grid">',`</div>${card}<div class="dashboard-grid">`);
};

render();
})();
