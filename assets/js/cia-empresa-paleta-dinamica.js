/* CIA: selecciona y aplica una identidad visual independiente por empresa. */
(()=>{
 const valid=new Set(['premium','blue','violet','green','burgundy']);
 const apply=id=>{const key=valid.has(id)?id:'premium';document.documentElement.setAttribute('data-cia-palette',key);return key};
 window.CIAPalette={apply,valid:[...valid]};
 // Al volver a la aplicación o cambiar de empresa, restaura la paleta guardada de esa empresa.
 if(typeof window.renderApp==='function'){
  const old=window.renderApp;
  window.renderApp=function(){try{const c=typeof currentCompany==='function'?currentCompany():null;apply(c?.palette||c?.setup?.palette||'premium')}catch(e){apply('premium')}return old.apply(this,arguments)};
 }
 // El prototipo puede abrirse con una empresa ya activa; restaura su paleta inicial.
 try{const c=typeof currentCompany==='function'?currentCompany():null;if(c)apply(c.palette||c.setup?.palette||'premium')}catch(e){}
})();
