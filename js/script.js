(function () {
  'use strict';

  const dayOrder = [
    'lunes',
    'martes',
    'miercoles',
    'jueves',
    'viernes'
  ];

  const dayLabels = {
    lunes: 'LUN',
    martes: 'MAR',
    miercoles: 'MIÉ',
    jueves: 'JUE',
    viernes: 'VIE'
  };

  const dayFullNames = {
    lunes: 'lunes',
    martes: 'martes',
    miercoles: 'miércoles',
    jueves: 'jueves',
    viernes: 'viernes'
  };

  const monthNames = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre'
  ];

  let foodBank;
  let weeklyMenu;

  const jsDayToKey = {
    1: 'lunes',
    2: 'martes',
    3: 'miercoles',
    4: 'jueves',
    5: 'viernes'
  };

  function getTodayKey() {
    return jsDayToKey[new Date().getDay()] || 'lunes';
  }

  const todayKey = getTodayKey();
  let activeKey = todayKey;


  // =========================================================
  // FECHA ACTUAL
  // =========================================================

  function renderTodayDate() {
    const now = new Date();

    const weekend =
      now.getDay() === 0 ||
      now.getDay() === 6;

    const dayName = weekend
      ? 'fin de semana'
      : dayFullNames[todayKey];

    document.getElementById('todayDate').textContent =
      `Menú del día · ${dayName}${weekend ? '' : ' ' + now.getDate() + ' de ' + monthNames[now.getMonth()]}`;
  }


  // =========================================================
  // SELECTOR DE DÍAS
  // =========================================================

  const daySelectorEl =
    document.getElementById('daySelector');

  function renderDaySelector() {

    daySelectorEl.innerHTML = '';

    dayOrder.forEach(key => {

      const b = document.createElement('button');

      b.type = 'button';

      b.className = 'day-btn';

      b.dataset.day = key;

      b.textContent = dayLabels[key];

      b.setAttribute(
        'aria-pressed',
        key === activeKey ? 'true' : 'false'
      );

      if (key === todayKey) {
        b.classList.add('is-today');
      }

      if (key === activeKey) {
        b.classList.add('is-active');
      }

      b.addEventListener(
        'click',
        () => selectDay(key)
      );

      daySelectorEl.appendChild(b);

    });
  }


  // =========================================================
  // MENSAJE DEL DÍA
  // =========================================================

  const dayMessageEl =
    document.getElementById('dayMessage');

  let messageTimeout;

  function showDayMessage(key) {

    clearTimeout(messageTimeout);

    dayMessageEl.textContent =
      key === todayKey
        ? `Mostrando el menú de hoy, ${dayFullNames[key]}.`
        : `Mostrando el menú del ${dayFullNames[key]}.`;

    dayMessageEl.classList.add('is-visible');

    messageTimeout = setTimeout(() => {
      dayMessageEl.classList.remove('is-visible');
    }, 2600);
  }


  // =========================================================
  // TARJETAS DEL MENÚ
  // =========================================================

  const menuCardsEl =
    document.getElementById('menuCards');


  function renderMealCard(type, selection) {

    const breakfast = type === 'breakfast';

    /*
     * Iconos profesionales de Lucide
     *
     * Desayuno → coffee
     * Almuerzo → utensils
     * Bebida → cup-soda
     *
     * Si el admin subió una imagen para esta comida
     * (selection.imagen), se muestra esa foto en vez
     * del ícono genérico.
     */

    const icon = breakfast
      ? 'coffee'
      : 'utensils';

    const title = breakfast
      ? 'Desayuno'
      : 'Almuerzo';

    const tag = breakfast
      ? 'Bebida incluida'
      : 'Refresco incluido';

    const prefix = breakfast
      ? 'desayuno'
      : 'almuerzo';


    // =====================================================
    // DATOS
    // =====================================================

    const principal =
      joinOptionNames(
        foodBank,
        `${prefix}_principal`,
        selection.principal
      );

    const acompanamiento =
      joinOptionNames(
        foodBank,
        `${prefix}_acompanamiento`,
        selection.acompanamiento
      );


    const thirdCategory =
      breakfast
        ? 'extra'
        : 'ensalada';

    const thirdLabel =
      breakfast
        ? 'Extra'
        : 'Ensalada';

    const thirdValue =
      joinOptionNames(
        foodBank,
        `${prefix}_${thirdCategory}`,
        selection[thirdCategory]
      );


    const bebida =
      joinOptionNames(
        foodBank,
        `${prefix}_bebida`,
        selection.bebida
      );


    const hasChoice =
      (selection.principal || []).length > 1;


    // =====================================================
    // IMAGEN O ÍCONO
    // =====================================================

    const imageBlock =
      selection.imagen
        ? `
            <img
              src="${selection.imagen}"
              alt="Foto del ${title.toLowerCase()}"
              loading="lazy">
          `
        : `
            <i
              data-lucide="${icon}">
            </i>
          `;


    // =====================================================
    // TARJETA
    // =====================================================

    return `
      <article class="meal-card ${breakfast ? 'breakfast' : 'lunch'}">

        <!-- Foto o icono principal -->
        <div
          class="meal-photo"
          aria-hidden="true">

          ${imageBlock}

        </div>


        <div class="meal-body">


          <!-- TÍTULO -->

          <div class="meal-title-row">

            <h3 class="meal-title">

              <i
                data-lucide="${icon}"
                aria-hidden="true">
              </i>

              ${title}

            </h3>


            <span class="meal-tag">
              ${tag}
            </span>

          </div>


          <!-- CONTENIDO -->

          <div class="meal-items">


            <!-- PRINCIPAL -->

            <p class="meal-item">

              <span
                class="dot"
                aria-hidden="true">
              </span>

              <span class="label">
                ${hasChoice ? 'Opciones' : 'Principal'}
              </span>

              ${principal}

            </p>


            <!-- ACOMPAÑAMIENTO -->

            <p class="meal-item">

              <span
                class="dot"
                aria-hidden="true">
              </span>

              <span class="label">
                Acompaña.
              </span>

              ${acompanamiento}

            </p>


            <!-- ENSALADA / EXTRA -->

            <p class="meal-item">

              <span
                class="dot"
                aria-hidden="true">
              </span>

              <span class="label">
                ${thirdLabel}
              </span>

              ${thirdValue}

            </p>


          </div>


          <!-- DIVISOR -->

          <div class="ticket-divider"></div>


          <!-- BEBIDA -->

          <p class="meal-drink">

            <i
              data-lucide="cup-soda"
              aria-hidden="true">
            </i>

            Incluye ${String(bebida).toLowerCase()}

          </p>


        </div>

      </article>
    `;
  }


  // =========================================================
  // RENDERIZAR MENÚ
  // =========================================================

  function renderMenu(key) {

    const dayData = weeklyMenu[key];

    if (!dayData) {

      menuCardsEl.innerHTML =
        '<p class="menu-empty">Aún no se ha publicado el menú de este día.</p>';

      return;
    }


    menuCardsEl.innerHTML =
      renderMealCard(
        'breakfast',
        dayData.desayuno
      ) +

      renderMealCard(
        'lunch',
        dayData.almuerzo
      );


    /*
     * IMPORTANTE:
     * Las tarjetas se generan dinámicamente,
     * por eso debemos inicializar Lucide después
     * de insertarlas en el DOM.
     */

    if (window.lucide) {
      lucide.createIcons();
    }
  }


  // =========================================================
  // CAMBIAR DE DÍA
  // =========================================================

  function selectDay(key) {

    if (!weeklyMenu[key]) {
      return;
    }

    activeKey = key;

    renderDaySelector();

    renderMenu(key);

    showDayMessage(key);

    updateBackButton();
  }


  // =========================================================
  // BOTÓN VOLVER A HOY
  // =========================================================

  const backTodayBtn =
    document.getElementById('backTodayBtn');


  function updateBackButton() {

    backTodayBtn.disabled =
      activeKey === todayKey;
  }


  backTodayBtn.addEventListener(
    'click',
    () => selectDay(todayKey)
  );


  // =========================================================
  // INICIALIZACIÓN
  // =========================================================

  async function init() {

    try {

      [
        foodBank,
        weeklyMenu
      ] = await Promise.all([
        getFoodBank(),
        getWeeklyMenu()
      ]);


      renderTodayDate();

      renderDaySelector();

      renderMenu(activeKey);

      updateBackButton();


      /*
       * Inicializar iconos que ya existen
       * en el HTML.
       */

      if (window.lucide) {
        lucide.createIcons();
      }

    } catch (e) {

      console.error(e);

      menuCardsEl.innerHTML =
        '<p class="menu-empty">No se pudo cargar el menú. Verifica la configuración de Supabase.</p>';
    }
  }


  // =========================================================
  // INICIAR
  // =========================================================

  document.addEventListener(
    'DOMContentLoaded',
    init
  );

})();