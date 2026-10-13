/* CIA V37 — interacción sin falsos recargados, guardado y recuperación del asistente. */
(function(){
  'use strict';
  const KEY='cia_onboarding_draft_v37';
  const getW=()=>window.NX_T&&window.NX_T.W?window.NX_T.W():null;
  const save=()=>{try{const w=getW();if(w&&!w.edit)localStorage.setItem(KEY,JSON.stringify({version:37,step:w.step,a:w.a||{},lv:w.lv||'r',qi:w.qi||0,tab:w.tab||'mods',pub:!!w.pub,d:w.d||null,at:Date.now()}));}catch(e){}};
  const clear=()=>{try{localStorage.removeItem(KEY)}catch(e){}};
  const read=()=>{try{const s=JSON.parse(localStorage.getItem(KEY)||'null');return s&&s.version===37&&s.a?s:null}catch(e){return null}};
  const wrap=(obj,name,after)=>{if(!obj||typeof obj[name]!=='function')return;const old=obj[name];obj[name]=function(...args){const result=old.apply(this,args);try{after?after(result,args):save()}catch(e){}return result;}};

  // Las tarjetas de respuesta múltiple se actualizan en el lugar, sin reemplazar toda la pantalla.
  if(window.NX){window.NX.toggleAns=function(i){
    const w=getW();if(!w||w.step!=='q')return;const q=window.NX_T.curQ();if(!q||!q.multi)return;
    const opts=typeof q.opts==='function'?q.opts(w.a):q.opts,chosen=Array.isArray(w.a[q.id])?[...w.a[q.id]]:[],v=opts[i];
    if(v===undefined)return;
    const exclusives=['Todas esas líneas','Varios tipos de clientes','Varias categorías','Varias presentaciones','Todas esas opciones','No por ahora','No manejo pedidos especiales','No','Ninguna'];
    const exclusive=exclusives.includes(v);
    if(chosen.includes(v)){w.a[q.id]=chosen.filter(x=>x!==v)}
    else if(exclusive){w.a[q.id]=[v]}
    else{w.a[q.id]=chosen.filter(x=>!exclusives.includes(x)).concat(v)}
    const selected=w.a[q.id],grid=document.querySelector('.nx-answer-grid');
    if(grid)[...grid.querySelectorAll('button')].forEach((btn,j)=>{const val=opts[j],on=selected.includes(val);btn.classList.toggle('on',on);btn.setAttribute('aria-pressed',String(on));const span=btn.querySelector('span'),b=btn.querySelector('b');if(span)span.textContent=(on?'✓ ':'')+val;if(b)b.textContent=on?'✓':'＋';});
    save();
  };}

  // Al elegir un giro, solo cambia el estado visual de las tarjetas. No se reconstruye todo el DOM.
  if(window.NX){window.NX.cat=function(type,grp){const w=getW();if(!w)return;w.a.type=type;w.a.grp=grp;w.a.free='';if(type==='Otro')w.a.grp=undefined;
    document.querySelectorAll('.nx-business-grid button').forEach(btn=>{const label=btn.querySelector('span')?.textContent||'';const active=label===type;btn.classList.toggle('on',active);btn.setAttribute('aria-pressed',String(active));});
    const free=document.getElementById('nxFree');if(free)free.value='';save();
  };}

  // Guardar respuestas incluso si el usuario escribe, cambia nivel o retrocede.
  ['f','lv','go','ans','nextAns','back','afterLevel','toLevel','toDraft','toPlan','choosePlan','nextAns','tab','tg','mv','grp','ch','mc','adv','reset'].forEach(n=>wrap(window.NX,n));
  // El flujo de bienvenida original inicia el asistente; aquí ofrecemos recuperar el borrador guardado.
  if(window.NXV33&&typeof window.NXV33.pick==='function'){
    const oldPick=window.NXV33.pick;
    window.NXV33.pick=function(level){
      const saved=read();
      if(saved&&confirm('Encontré una configuración de empresa sin terminar. ¿Quieres continuar donde te quedaste?')){
        oldPick.call(this,level);
        const w=getW();
        if(w){Object.assign(w,{step:saved.step||'type',a:saved.a||{},lv:saved.lv||level,qi:saved.qi||0,tab:saved.tab||'mods',pub:!!saved.pub,d:saved.d||null});if((w.step==='summary'||w.step==='edit')&&!w.d){w.d=window.NX_T.draftOf?window.NX_T.draftOf(w.a):null;}window.NX.go(w.step);save();}
        return;
      }
      if(saved)clear();
      oldPick.call(this,level);
      const w=getW();if(w){w.lv=level;w.step='type';w.qi=0;save();}
    };
  }
  if(window.NXV33&&typeof window.NXV33.cancel==='function'){
    const oldCancel=window.NXV33.cancel;window.NXV33.cancel=function(){clear();return oldCancel.apply(this,arguments)};
  }
  // Si la empresa se creó con éxito, se elimina el borrador. Si falla, se conserva.
  wrap(window.NX,'finish',()=>{setTimeout(()=>{if(!getW())clear();else save()},1200)});

  // Prevenir envíos accidentales de formularios en botones de acción; botones sin acción siguen siendo submit.
  const fixButtons=root=>{(root||document).querySelectorAll('button[onclick]:not([type])').forEach(b=>b.setAttribute('type','button'))};
  fixButtons();
  const app=document.getElementById('app');if(app&&window.MutationObserver)new MutationObserver(()=>fixButtons(app)).observe(app,{childList:true,subtree:true});

  // Transición breve entre preguntas: indica avance sin hacer que parezca una recarga.
  document.addEventListener('click',e=>{const b=e.target.closest('.nx-answer-grid button');if(!b)return;const w=getW();if(!w||w.step!=='q')return;const q=window.NX_T.curQ();if(q&&q.multi)return;const main=document.querySelector('.nx-main');if(main)main.classList.add('nx-question-leaving');setTimeout(()=>document.querySelector('.nx-main')?.classList.remove('nx-question-leaving'),220);},true);

  // Guardar texto aunque el usuario cierre la pestaña en mitad de una pregunta.
  document.addEventListener('input',e=>{const w=getW();if(!w||w.edit)return;const el=e.target;if(el.id==='nxFree')w.a.free=el.value;else if(el.id==='nxCo')w.a.company=el.value;else if(el.name&&el.value!==undefined)w.a[el.name]=el.value;save()},true);
  window.addEventListener('beforeunload',save);
  window.addEventListener('pagehide',save);
})();

  // V39 — evita recargas nativas al cambiar de pantalla o enviar formularios de la SPA.
  // preventDefault no cancela los listeners de negocio; solo evita que el navegador
  // navegue/reinicie el documento después del manejo JavaScript.
  document.addEventListener('submit',function(e){
    if(e.target instanceof HTMLFormElement) e.preventDefault();
  },true);

  // Los botones de acción dentro de formularios no deben enviar el formulario por defecto.
  document.addEventListener('click',function(e){
    const b=e.target.closest('button');
    if(!b)return;
    if(!b.hasAttribute('type') && b.closest('form') && (b.hasAttribute('onclick') || b.classList.contains('btn') || b.classList.contains('link'))){
      b.setAttribute('type','button');
    }
  },true);
