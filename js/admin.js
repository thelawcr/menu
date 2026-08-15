(function () {
  'use strict';
  const dayOrder = DAY_ORDER;
  const dayLabels = { lunes:'Lunes', martes:'Martes', miercoles:'Miércoles', jueves:'Jueves', viernes:'Viernes' };
  let foodBank = {};
  let weeklyMenu = {};
  let activeDay = 'lunes';

  const saveToast = document.getElementById('saveToast');
  let toastTimeout;
  function showToast(message, type='success') {
    clearTimeout(toastTimeout);
    saveToast.textContent = `${type === 'error' ? '⚠️' : '✓'} ${message}`;
    saveToast.classList.remove('toast-success','toast-error');
    saveToast.classList.add(type === 'error' ? 'toast-error' : 'toast-success','is-visible');
    toastTimeout = setTimeout(() => saveToast.classList.remove('is-visible'), 2800);
  }

  const navLinks = document.querySelectorAll('.nav-link');
  const panels = document.querySelectorAll('.admin-panel');
  navLinks.forEach(link => link.addEventListener('click', () => {
    panels.forEach(panel => panel.hidden = panel.dataset.panel !== link.dataset.panel);
    navLinks.forEach(x => { const active=x===link; x.classList.toggle('is-active',active); x.setAttribute('aria-selected',active?'true':'false'); });
  }));

  const dayTabsEl = document.getElementById('dayTabs');
  function renderDayTabs() {
    dayTabsEl.innerHTML='';
    dayOrder.forEach(key => {
      const btn=document.createElement('button'); btn.type='button'; btn.className='tab-btn'+(key===activeDay?' is-active':''); btn.textContent=dayLabels[key]; btn.setAttribute('role','tab'); btn.setAttribute('aria-selected',key===activeDay?'true':'false');
      btn.addEventListener('click',()=>{activeDay=key;renderDayTabs();renderDayEditor();}); dayTabsEl.appendChild(btn);
    });
  }

  const dayEditorEl=document.getElementById('dayEditor');
  function renderMealEditorBlock(mealType) {
    const breakfast=mealType==='desayuno';
    const categories=breakfast ? [['principal','Plato principal'],['acompanamiento','Acompañamiento'],['extra','Extra'],['bebida','Bebida']] : [['principal','Plato principal'],['acompanamiento','Acompañamiento'],['ensalada','Ensalada'],['bebida','Bebida']];
    const dayData=weeklyMenu[activeDay][mealType];
    const groups=categories.map(([cat,label])=>{
      const bankKey=`${mealType}_${cat}`, items=foodBank[bankKey]||[], activeIds=dayData[cat]||[];
      const chips=items.length ? items.map(item=>{
        const id=`chip-${mealType}-${cat}-${item.id}`;
        return `<div class="option-chip"><input type="checkbox" id="${id}" data-meal="${mealType}" data-cat="${cat}" data-id="${item.id}" ${activeIds.includes(item.id)?'checked':''}><label for="${id}">${escapeHtml(item.name)}</label></div>`;
      }).join('') : '<p class="category-empty">No hay opciones en el banco todavía. Agrega una abajo.</p>';
      return `<div class="category-group"><span class="category-group-label">${label}</span><div class="option-chips">${chips}</div></div>`;
    }).join('');
    return `<div class="meal-editor-block"><h3>${breakfast?'☀️ Desayuno':'🍽️ Almuerzo'}</h3>${groups}</div>`;
  }
  function renderDayEditor(){
    dayEditorEl.innerHTML=renderMealEditorBlock('desayuno')+renderMealEditorBlock('almuerzo');
    dayEditorEl.querySelectorAll('input[type="checkbox"]').forEach(input=>input.addEventListener('change',e=>{
      const {meal,cat,id}=e.target.dataset; const list=weeklyMenu[activeDay][meal][cat]||[];
      if(e.target.checked&&!list.includes(id)) list.push(id); if(!e.target.checked){const i=list.indexOf(id);if(i>=0)list.splice(i,1);} weeklyMenu[activeDay][meal][cat]=list;
    }));
  }

  const saveMenuBtn=document.getElementById('saveMenuBtn');
  saveMenuBtn.addEventListener('click',async()=>{
    saveMenuBtn.disabled=true; saveMenuBtn.textContent='Guardando…';
    try { await saveWeeklyMenu(weeklyMenu,activeDay); showToast('Menú guardado en Supabase. Ya está disponible en el sitio público.'); saveMenuBtn.textContent='✓ Guardado'; }
    catch(e){console.error(e);showToast('No se pudo guardar el menú. Revisa RLS y la conexión.','error');saveMenuBtn.textContent='Error al guardar';}
    setTimeout(()=>{saveMenuBtn.disabled=false;saveMenuBtn.textContent='Guardar menú del día';},1800);
  });

  const foodBankGridEl=document.getElementById('foodBankGrid');
  function renderFoodBank(){
    foodBankGridEl.innerHTML=Object.keys(CATEGORY_LABELS).map(cat=>{
      const items=foodBank[cat]||[];
      return `<div class="bank-category"><h4>${CATEGORY_LABELS[cat]}</h4><div class="bank-item-list">${items.length?items.map(i=>`<div class="bank-item"><span>${escapeHtml(i.name)}</span><button type="button" class="bank-item-remove" data-id="${i.id}">Quitar</button></div>`).join(''):'<p class="category-empty">Sin opciones todavía.</p>'}</div><div class="bank-add-row"><input type="text" placeholder="Nueva opción…" data-cat="${cat}" class="bank-add-input"><button type="button" class="bank-add-btn" data-cat="${cat}">Agregar</button></div></div>`;
    }).join('');
    foodBankGridEl.querySelectorAll('.bank-item-remove').forEach(btn=>btn.addEventListener('click',async()=>{
      if(!confirm('¿Eliminar esta opción? También dejará de aparecer en los menús donde esté seleccionada.')) return;
      try { await removeFoodItem(btn.dataset.id); foodBank=await getFoodBank(); weeklyMenu=await getWeeklyMenu(); renderFoodBank();renderDayEditor();showToast('Opción eliminada.'); } catch(e){console.error(e);showToast('No se pudo eliminar la opción.','error');}
    }));
    foodBankGridEl.querySelectorAll('.bank-add-btn').forEach(btn=>btn.addEventListener('click',()=>addFood(btn.dataset.cat)));
    foodBankGridEl.querySelectorAll('.bank-add-input').forEach(input=>input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();addFood(input.dataset.cat);}}));
  }
  async function addFood(category){
    const input=foodBankGridEl.querySelector(`.bank-add-input[data-cat="${category}"]`), name=input.value.trim(); if(!name)return;
    try { await addFoodItem(category,name); foodBank=await getFoodBank();renderFoodBank();renderDayEditor();input.value='';showToast(`"${name}" agregado al banco de platillos.`); } catch(e){console.error(e);showToast('No se pudo agregar la opción.','error');}
  }

  document.getElementById('resetBtn').addEventListener('click',async()=>{
    if(!confirm('¿Seguro que deseas borrar todos los cambios y volver a los valores originales?'))return;
    try { await resetToDefaults();foodBank=await getFoodBank();weeklyMenu=await getWeeklyMenu();activeDay='lunes';renderDayTabs();renderDayEditor();renderFoodBank();showToast('Datos restablecidos a los valores originales.'); }
    catch(e){console.error(e);showToast('No se pudo restablecer la información.','error');}
  });

  document.getElementById('logoutBtn').addEventListener('click',async()=>{await supabaseClient.auth.signOut();location.replace('login.html');});

  function escapeHtml(value){return String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}

  async function init(){
    const {data:{session}}=await supabaseClient.auth.getSession();
    if(!session){location.replace('login.html');return;}
    try { foodBank=await getFoodBank();weeklyMenu=await getWeeklyMenu();renderDayTabs();renderDayEditor();renderFoodBank(); }
    catch(e){console.error(e);showToast('No se pudieron cargar los datos de Supabase.','error');}
  }
  init();
})();
