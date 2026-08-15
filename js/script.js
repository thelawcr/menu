(function () {
  'use strict';
  const dayOrder=['lunes','martes','miercoles','jueves','viernes'];
  const dayLabels={lunes:'LUN',martes:'MAR',miercoles:'MIÉ',jueves:'JUE',viernes:'VIE'};
  const dayFullNames={lunes:'lunes',martes:'martes',miercoles:'miércoles',jueves:'jueves',viernes:'viernes'};
  const monthNames=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  let foodBank, weeklyMenu;
  const jsDayToKey={1:'lunes',2:'martes',3:'miercoles',4:'jueves',5:'viernes'};
  function getTodayKey(){return jsDayToKey[new Date().getDay()]||'lunes';}
  const todayKey=getTodayKey(); let activeKey=todayKey;
  function renderTodayDate(){const now=new Date(),weekend=now.getDay()===0||now.getDay()===6,dayName=weekend?'fin de semana':dayFullNames[todayKey];document.getElementById('todayDate').textContent=`Menú del día · ${dayName}${weekend?'':' '+now.getDate()+' de '+monthNames[now.getMonth()]}`;}
  const daySelectorEl=document.getElementById('daySelector');
  function renderDaySelector(){daySelectorEl.innerHTML='';dayOrder.forEach(key=>{const b=document.createElement('button');b.type='button';b.className='day-btn';b.dataset.day=key;b.textContent=dayLabels[key];b.setAttribute('aria-pressed',key===activeKey?'true':'false');if(key===todayKey)b.classList.add('is-today');if(key===activeKey)b.classList.add('is-active');b.addEventListener('click',()=>selectDay(key));daySelectorEl.appendChild(b);});}
  const dayMessageEl=document.getElementById('dayMessage');let messageTimeout;
  function showDayMessage(key){clearTimeout(messageTimeout);dayMessageEl.textContent=key===todayKey?`Mostrando el menú de hoy, ${dayFullNames[key]}.`:`Mostrando el menú del ${dayFullNames[key]}.`;dayMessageEl.classList.add('is-visible');messageTimeout=setTimeout(()=>dayMessageEl.classList.remove('is-visible'),2600);}
  const menuCardsEl=document.getElementById('menuCards');
  function renderMealCard(type,selection){const breakfast=type==='breakfast',icon=breakfast?'☀️':'🍽️',title=breakfast?'Desayuno':'Almuerzo',tag=breakfast?'Bebida incluida':'Refresco incluido',prefix=breakfast?'desayuno':'almuerzo';const principal=joinOptionNames(foodBank,`${prefix}_principal`,selection.principal),acompanamiento=joinOptionNames(foodBank,`${prefix}_acompanamiento`,selection.acompanamiento),thirdCategory=breakfast?'extra':'ensalada',thirdLabel=breakfast?'Extra':'Ensalada',thirdValue=joinOptionNames(foodBank,`${prefix}_${thirdCategory}`,selection[thirdCategory]),bebida=joinOptionNames(foodBank,`${prefix}_bebida`,selection.bebida),hasChoice=(selection.principal||[]).length>1;return `<article class="meal-card ${breakfast?'breakfast':'lunch'}"><div class="meal-photo" aria-hidden="true">${icon}</div><div class="meal-body"><div class="meal-title-row"><h3 class="meal-title">${icon} ${title}</h3><span class="meal-tag">${tag}</span></div><div class="meal-items"><p class="meal-item"><span class="dot" aria-hidden="true"></span><span class="label">${hasChoice?'Opciones':'Principal'}</span> ${principal}</p><p class="meal-item"><span class="dot" aria-hidden="true"></span><span class="label">Acompaña.</span> ${acompanamiento}</p><p class="meal-item"><span class="dot" aria-hidden="true"></span><span class="label">${thirdLabel}</span> ${thirdValue}</p></div><div class="ticket-divider"></div><p class="meal-drink"><span aria-hidden="true">🥤</span> Incluye ${String(bebida).toLowerCase()}</p></div></article>`;}
  function renderMenu(key){const dayData=weeklyMenu[key];if(!dayData){menuCardsEl.innerHTML='<p class="menu-empty">Aún no se ha publicado el menú de este día.</p>';return;}menuCardsEl.innerHTML=renderMealCard('breakfast',dayData.desayuno)+renderMealCard('lunch',dayData.almuerzo);}
  function selectDay(key){if(!weeklyMenu[key])return;activeKey=key;renderDaySelector();renderMenu(key);showDayMessage(key);updateBackButton();}
  const backTodayBtn=document.getElementById('backTodayBtn');function updateBackButton(){backTodayBtn.disabled=activeKey===todayKey;}backTodayBtn.addEventListener('click',()=>selectDay(todayKey));
  async function init(){try{[foodBank,weeklyMenu]=await Promise.all([getFoodBank(),getWeeklyMenu()]);renderTodayDate();renderDaySelector();renderMenu(activeKey);updateBackButton();}catch(e){console.error(e);menuCardsEl.innerHTML='<p class="menu-empty">No se pudo cargar el menú. Verifica la configuración de Supabase.</p>';}}
  document.addEventListener('DOMContentLoaded',init);
})();
