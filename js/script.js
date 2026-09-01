(function () {
  'use strict';

  const dayOrder = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

  const dayLabels = {
    lunes: 'LUN',
    martes: 'MAR',
    miercoles: 'MIÉ',
    jueves: 'JUE',
    viernes: 'VIE',
    sabado: 'SÁB'
  };

  const dayFullNames = {
    lunes: 'lunes',
    martes: 'martes',
    miercoles: 'miércoles',
    jueves: 'jueves',
    viernes: 'viernes',
    sabado: 'sábado'
  };

  const monthNames = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];

  const jsDayToKey = {
    1: 'lunes',
    2: 'martes',
    3: 'miercoles',
    4: 'jueves',
    5: 'viernes',
    6: 'sabado'
  };

  let foodBank = {};
  let weeklyMenu = {};
  let todayKey = null;
  let activeKey = null;

  const daySelectorEl = document.getElementById('daySelector');
  const dayMessageEl = document.getElementById('dayMessage');
  const menuCardsEl = document.getElementById('menuCards');
  const backTodayBtn = document.getElementById('backTodayBtn');
  const todayDateEl = document.getElementById('todayDate');

  let messageTimeout;

  function getTodayKey() {
    const day = new Date().getDay();
    return jsDayToKey[day] || null;
  }

  function getAllowedDays() {
    const now = new Date();
    const jsDay = now.getDay();
    const hour = now.getHours();

    if (jsDay === 0) {
      return ['lunes'];
    }

    const currentIndex = dayOrder.indexOf(todayKey);

    if (currentIndex === -1) {
      return [];
    }

    if (hour < 18) {
      return [todayKey];
    }

    const tomorrowIndex = currentIndex + 1;

    if (tomorrowIndex >= dayOrder.length) {
      return [todayKey];
    }

    return [todayKey, dayOrder[tomorrowIndex]];
  }

  function renderTodayDate() {
    const now = new Date();
    const jsDay = now.getDay();

    if (jsDay === 0) {
      todayDateEl.textContent = 'Menú del día · fin de semana';
      return;
    }

    const dayName = dayFullNames[todayKey];
    todayDateEl.textContent = `Menú del día · ${dayName} ${now.getDate()} de ${monthNames[now.getMonth()]}`;
  }

  function renderDaySelector() {
    daySelectorEl.innerHTML = '';

    const allowedDays = getAllowedDays();

    dayOrder.forEach(key => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'day-btn';
      button.dataset.day = key;
      button.textContent = dayLabels[key];

      const isToday = key === todayKey;
      const isAllowed = allowedDays.includes(key);
      const isActive = key === activeKey;

      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');

      if (isToday) {
        button.classList.add('is-today');
      }

      if (isActive) {
        button.classList.add('is-active');
      }

      if (!isAllowed) {
        button.disabled = true;
        button.setAttribute('aria-disabled', 'true');
        button.title = 'Este día todavía no está disponible';
        button.classList.add('is-locked');
      } else {
        button.disabled = false;
        button.addEventListener('click', function () {
          selectDay(key);
        });
      }

      daySelectorEl.appendChild(button);
    });
  }

  function showDayMessage(key) {
    clearTimeout(messageTimeout);

    const allowedDays = getAllowedDays();

    if (!allowedDays.includes(key)) {
      return;
    }

    if (key === todayKey) {
      dayMessageEl.textContent = `Mostrando el menú de hoy, ${dayFullNames[key]}.`;
    } else {
      dayMessageEl.textContent = `Menú disponible con anticipación: ${dayFullNames[key]}.`;
    }

    dayMessageEl.classList.add('is-visible');

    messageTimeout = setTimeout(function () {
      dayMessageEl.classList.remove('is-visible');
    }, 2600);
  }

  function renderMealCard(type, selection) {
    const breakfast = type === 'breakfast';
    const icon = breakfast ? 'coffee' : 'utensils';
    const title = breakfast ? 'Desayuno' : 'Almuerzo';
    const tag = breakfast ? 'Bebida incluida' : 'Refresco incluido';
    const prefix = breakfast ? 'desayuno' : 'almuerzo';

    const principal = joinOptionNames(foodBank, `${prefix}_principal`, selection.principal);
    const acompanamiento = joinOptionNames(foodBank, `${prefix}_acompanamiento`, selection.acompanamiento);

    const thirdCategory = breakfast ? 'extra' : 'ensalada';
    const thirdLabel = breakfast ? 'Extra' : 'Ensalada';
    const thirdValue = joinOptionNames(foodBank, `${prefix}_${thirdCategory}`, selection[thirdCategory]);

    const bebida = joinOptionNames(foodBank, `${prefix}_bebida`, selection.bebida);

    const hasChoice = Array.isArray(selection.principal) && selection.principal.length > 1;

    const imageBlock = selection.imagen
      ? `<img src="${selection.imagen}" alt="Foto del ${title.toLowerCase()}" loading="lazy">`
      : `<i data-lucide="${icon}"></i>`;

    return `
      <article class="meal-card ${breakfast ? 'breakfast' : 'lunch'}">
        <div class="meal-photo" aria-hidden="true">
          ${imageBlock}
        </div>
        <div class="meal-body">
          <div class="meal-title-row">
            <h3 class="meal-title">
              <i data-lucide="${icon}" aria-hidden="true"></i>
              ${title}
            </h3>
            <span class="meal-tag">${tag}</span>
          </div>
          <div class="meal-items">
            <p class="meal-item">
              <span class="dot" aria-hidden="true"></span>
              <span class="label">${hasChoice ? 'Opciones' : 'Principal'}</span>
              ${principal}
            </p>
            <p class="meal-item">
              <span class="dot" aria-hidden="true"></span>
              <span class="label">Acompaña.</span>
              ${acompanamiento}
            </p>
            <p class="meal-item">
              <span class="dot" aria-hidden="true"></span>
              <span class="label">${thirdLabel}</span>
              ${thirdValue}
            </p>
          </div>
          <div class="ticket-divider"></div>
          <p class="meal-drink">
            <i data-lucide="cup-soda" aria-hidden="true"></i>
            Incluye ${String(bebida).toLowerCase()}
          </p>
        </div>
      </article>
    `;
  }

  function renderMenu(key) {
    const allowedDays = getAllowedDays();

    if (!allowedDays.includes(key)) {
      menuCardsEl.innerHTML = `<p class="menu-empty">Este menú todavía no está disponible.</p>`;
      return;
    }

    const dayData = weeklyMenu[key];

    if (!dayData) {
      menuCardsEl.innerHTML = `<p class="menu-empty">Aún no se ha publicado el menú de este día.</p>`;
      return;
    }

    menuCardsEl.innerHTML =
      renderMealCard('breakfast', dayData.desayuno) +
      renderMealCard('lunch', dayData.almuerzo);

    if (window.lucide) {
      lucide.createIcons();
    }
  }

  function selectDay(key) {
    const allowedDays = getAllowedDays();

    if (!allowedDays.includes(key)) {
      console.warn(`El día ${key} está bloqueado.`);
      return;
    }

    if (!weeklyMenu[key]) {
      console.warn(`No existe información para ${key}.`);
      return;
    }

    activeKey = key;

    renderDaySelector();
    renderMenu(key);
    showDayMessage(key);
    updateBackButton();
  }

  function updateBackButton() {
    if (!backTodayBtn) {
      return;
    }

    backTodayBtn.disabled = activeKey === todayKey;
  }

  if (backTodayBtn) {
    backTodayBtn.addEventListener('click', function () {
      if (todayKey) {
        selectDay(todayKey);
      }
    });
  }

  async function init() {
    try {
      console.log('Iniciando menú...');

      todayKey = getTodayKey();
      activeKey = todayKey || 'lunes';

      renderTodayDate();
      renderDaySelector();

      console.log('Días permitidos:', getAllowedDays());
      console.log('Cargando datos desde Supabase...');

      const result = await Promise.all([getFoodBank(), getWeeklyMenu()]);

      foodBank = result[0] || {};
      weeklyMenu = result[1] || {};

      console.log('Food bank:', foodBank);
      console.log('Weekly menu:', weeklyMenu);

      const allowedDays = getAllowedDays();

      if (!allowedDays.includes(activeKey)) {
        activeKey = allowedDays[0] || 'lunes';
      }

      renderDaySelector();
      renderMenu(activeKey);
      updateBackButton();

      if (window.lucide) {
        lucide.createIcons();
      }

      console.log('Menú cargado correctamente.');

    } catch (error) {
      console.error('ERROR CARGANDO EL MENÚ:', error);

      menuCardsEl.innerHTML = `
        <p class="menu-empty">
          No se pudo cargar el menú.
          Verifica la conexión con Supabase.
        </p>
      `;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();