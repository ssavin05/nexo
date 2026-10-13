/* CIA V33 — flujo exacto de creación: bienvenida, nivel, preguntas y plan. */
(function(){
  const originalStart=window.NX && window.NX.start;
  if(!originalStart) return;
  let chosenLevel='r', timerIds=[];
  const clearTimers=()=>{timerIds.forEach(clearTimeout);timerIds=[];};
  const later=(fn,ms)=>timerIds.push(setTimeout(fn,ms));
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function showSplash(){
    clearTimers();
    const old=document.getElementById('nx-v33-flow'); if(old)old.remove();
    const overlay=document.createElement('div');overlay.id='nx-v33-flow';overlay.className='nx-v33-overlay';
    overlay.innerHTML='<div class="nx-v33-splash"><div class="nx-v33-mark" aria-label="Logo CIA">CIA</div><div class="nx-v33-kicker">TU NEGOCIO, A TU MANERA</div><h1 id="nx-v33-title">Bienvenido a CIA</h1><p id="nx-v33-sub">Preparando tu espacio de gestión…</p><div class="nx-v33-loader"><i></i></div></div>';
    document.body.appendChild(overlay);
    later(()=>{const title=document.getElementById('nx-v33-title'),sub=document.getElementById('nx-v33-sub');if(title)title.textContent='Donde creamos tu mejor espacio de gestión de negocios';if(sub)sub.textContent='Tu espacio de gestión, diseñado para tu negocio.';overlay.classList.add('message');},1600);
    later(()=>{renderLevels(overlay);},3400);
  }
  function renderLevels(overlay){
    overlay.classList.remove('message');overlay.classList.add('nx-v33-choose');
    overlay.innerHTML=`<div class="nx-v33-choice-wrap">
      <div class="nx-v33-brand"><span class="nx-v33-mark small" aria-label="Logo CIA">CIA</span><span>CIA</span></div>
      <span class="nx-v33-kicker">VAMOS A DISEÑAR TU ESPACIO</span>
      <h1>¿Qué nivel de personalización necesitas?</h1>
      <p class="nx-v33-lead">Primero elegimos cuánto quieres configurar. Después te haremos preguntas sobre tu negocio, sucursales, operación y estilo visual.</p>
      <div class="nx-v33-levels">
        <button class="nx-v33-level" onclick="NXV33.pick('q')"><span class="nx-v33-level-icon">✦</span><span class="nx-v33-level-title">Básica</span><span class="nx-v33-level-desc">Lo esencial para empezar rápido, con una configuración sencilla.</span><span class="nx-v33-level-meta">Configuración rápida</span><b>Elegir básica →</b></button>
        <button class="nx-v33-level featured" onclick="NXV33.pick('r')"><span class="nx-v33-recommended">RECOMENDADA</span><span class="nx-v33-level-icon">◈</span><span class="nx-v33-level-title">Estándar</span><span class="nx-v33-level-desc">Preguntas adaptadas a tu giro, equipo, sucursales y procesos.</span><span class="nx-v33-level-meta">Equilibrio entre facilidad y control</span><b>Elegir estándar →</b></button>
        <button class="nx-v33-level nx-v33-ai-level" onclick="NXV33.startAI()"><span class="nx-v33-level-icon">✧</span><span class="nx-v33-level-title">Personalización con IA</span><span class="nx-v33-level-desc">CIA te hará preguntas sencillas y preparará una configuración según tu negocio y tu forma de trabajar.</span><span class="nx-v33-level-meta">Adaptada a ti y a tu pantalla</span><b>Configurar con IA →</b></button>
      </div><button class="nx-v33-cancel" onclick="NXV33.cancel()">Cancelar</button>
    </div>`;
  }
  const aiQuestions=[
    {key:'business',title:'¿Cómo se llama tu empresa y a qué se dedica?',hint:'Ejemplo: Brillo Norte, distribuidora de productos de limpieza.',type:'textarea',placeholder:'Nombre y giro de tu negocio'},
    {key:'work',title:'¿Qué es lo que más necesitas organizar?',hint:'Puedes marcar varias opciones.',type:'multi',options:['Ventas y clientes','Productos e inventario','Pedidos y entregas','Citas y servicios','Dinero, gastos y ganancias','Personal y permisos','Producción o fabricación','Sucursales']},
    {key:'team',title:'¿Cuántas personas usarán CIA?',hint:'Puedes cambiarlo después.',type:'single',options:['Solo yo','2 a 5 personas','6 a 10 personas','11 a 21 personas','Más de 21 personas']},
    {key:'device',title:'¿Desde qué dispositivo usarás más CIA?',hint:'Ajustaremos la distribución para esa pantalla.',type:'single',options:['Computadora o laptop','Tablet','Celular','En varios dispositivos']},
    {key:'style',title:'¿Qué estilo visual prefieres?',hint:'Podrás elegir los colores en el siguiente paso.',type:'single',options:['Claro y limpio','Oscuro y elegante','Moderno con colores vivos','Sobrio y profesional']},
    {key:'priority',title:'¿Qué te gustaría resolver primero con CIA?',hint:'Esto ayudará a priorizar tu pantalla principal.',type:'textarea',placeholder:'Ejemplo: saber qué productos se venden más y qué debo comprar'}
  ];
  let aiIndex=0,aiAnswers={};
  function renderAI(){
    const overlay=document.getElementById('nx-v33-flow');if(!overlay)return;
    const q=aiQuestions[aiIndex],progress=Math.round(aiIndex/aiQuestions.length*100);let control='';
    if(q.type==='textarea')control=`<textarea id="nx-ai-answer" class="nx-ai-textarea" placeholder="${esc(q.placeholder||'Escribe tu respuesta…')}">${esc(aiAnswers[q.key]||'')}</textarea>`;
    else control=`<div class="nx-ai-options">${q.options.map(opt=>{const val=aiAnswers[q.key]||[],on=q.type==='multi'?val.includes(opt):val===opt;return `<button type="button" class="nx-ai-option ${on?'selected':''}" onclick="NXV33.aiChoose('${esc(opt)}','${q.type}')">${esc(opt)}${on?' ✓':''}</button>`}).join('')}</div>`;
    overlay.innerHTML=`<div class="nx-v33-choice-wrap nx-ai-wrap"><div class="nx-v33-brand"><span class="nx-v33-mark small" aria-label="Logo CIA">CIA</span><span>CIA · Configuración con IA</span><button type="button" class="nx-v33-cancel" onclick="NXV33.cancel()">Cancelar</button></div><div class="nx-ai-progress"><span style="width:${progress}%"></span></div><div class="nx-ai-count">PREGUNTA ${aiIndex+1} DE ${aiQuestions.length}</div><h1>${esc(q.title)}</h1><p class="nx-v33-lead">${esc(q.hint)}</p>${control}<div class="nx-ai-actions"><button type="button" class="nx-ai-back" onclick="NXV33.aiBack()" ${aiIndex===0?'disabled':''}>← Atrás</button><button type="button" class="nx-ai-next" onclick="NXV33.aiNext()">${aiIndex===aiQuestions.length-1?'Preparar mi espacio':'Continuar →'}</button></div><p class="nx-ai-footnote">Tus respuestas orientan la configuración inicial. Podrás ajustar tus preferencias después.</p></div>`;
  }
  window.NXV33={
    startAI(){aiIndex=0;aiAnswers={};renderAI();},
    aiChoose(opt,type){const q=aiQuestions[aiIndex];if(type==='multi'){let a=aiAnswers[q.key]||[];aiAnswers[q.key]=a.includes(opt)?a.filter(x=>x!==opt):[...a,opt];}else aiAnswers[q.key]=opt;renderAI();},
    aiBack(){if(aiIndex>0){const q=aiQuestions[aiIndex];if(q.type==='textarea'){const el=document.getElementById('nx-ai-answer');if(el)aiAnswers[q.key]=el.value;}aiIndex--;renderAI();}},
    aiNext(){const q=aiQuestions[aiIndex];if(q.type==='textarea'){const el=document.getElementById('nx-ai-answer');aiAnswers[q.key]=el?el.value.trim():'';}if(aiIndex<aiQuestions.length-1){aiIndex++;renderAI();return;}const overlay=document.getElementById('nx-v33-flow');if(overlay)overlay.remove();clearTimers();originalStart();const w=window.NX_T&&window.NX_T.W();if(w){w.lv='r';w.step='type';w.qi=0;w.aiPersonalization=JSON.parse(JSON.stringify(aiAnswers));}window.NX.go('type');},
    pick(level){
      chosenLevel=level;
      const overlay=document.getElementById('nx-v33-flow');if(overlay)overlay.remove();
      clearTimers();
      originalStart();
      const w=window.NX_T && window.NX_T.W();
      if(w){w.lv=chosenLevel;w.step='type';w.qi=0;}
      window.NX.go('type');
    },
    cancel(){clearTimers();const o=document.getElementById('nx-v33-flow');if(o)o.remove();},
  };
  window.NX.start=function(){showSplash();};
  // The wizard should be a single focused screen, not a two-column page with nested scrollbars.
  window.addEventListener('load',()=>{window.scrollTo(0,0);});
})();
