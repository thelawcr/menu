(function () {
  'use strict';

  const dayOrder = [
    'lunes',
    'martes',
    'miercoles',
    'jueves',
    'viernes',
    'sabado'
  ];

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


  // =========================================================
  // DÍA ACTUAL
  // =========================================================

  function getTodayKey() {

    const day = new Date().getDay();

    return jsDayToKey[day] || null;
  }


  // =========================================================
  // OBTENER DÍAS PERMITIDOS
  // =========================================================

  function getAllowedDays() {

    const now = new Date();
    const jsDay = now.getDay();
    const hour = now.getHours();

    /*
     * DOMINGO
     *
     * No existe menú de domingo.
     * Mostramos el lunes como próximo día.
     */

    if (jsDay === 0) {
      return ['lunes'];
    }


    const currentIndex =
      dayOrder.indexOf(todayKey);

    if (currentIndex === -1) {
      return [];
    }


    /*
     * Antes de las 6:00 p.m.
     *
     * Solo se puede ver el menú actual.
     */

    if (hour < 18) {
      return [todayKey];
    }


    /*
     * Desde las 6:00 p.m.
     *
     * Se permite hoy + mañana.
     */

    const tomorrowIndex =
      currentIndex + 1;

    if (tomorrowIndex >= dayOrder.length) {
      return [todayKey];
    }

    return [
      todayKey,
      dayOrder[tomorrowIndex]
    ];
  }


  // =========================================================
  // FECHA ACTUAL
  // =========================================================

  function renderTodayDate() {

    const now = new Date();
    const jsDay = now.getDay();

    if (jsDay === 0) {

      todayDateEl.textContent =
        'Menú del día · fin de semana';

      return;
    }


    const dayName =
      dayFullNames[todayKey];

    todayDateEl.textContent =
      `Menú del día · ${dayName} ${now.getDate()} de ${monthNames[now.getMonth()]}`;
  }


  // =========================================================
  // SELECTOR DE DÍAS
  // =========================================================

  function renderDaySelector() {

    daySelectorEl.innerHTML = '';

    const allowedDays =
      getAllowedDays();


    dayOrder.forEach(key => {

      const button =
        document.createElement('button');

      button.type = 'button';

      button.className = 'day-btn';

      button.dataset.day = key;

      button.textContent =
        dayLabels[key];


      const isToday =
        key === todayKey;

      const isAllowed =
        allowedDays.includes(key);

      const isActive =
        key === activeKey;


      button.setAttribute(
        'aria-pressed',
        isActive ? 'true' : 'false'
      );


      if (isToday) {
        button.classList.add('is-today');
      }


      if (isActive) {
        button.classList.add('is-active');
      }


      /*
       * DÍA BLOQUEADO
       */

      if (!isAllowed) {

        button.disabled = true;

        button.setAttribute(
          'aria-disabled',
          'true'
        );

        button.title =
          'Este día todavía no está disponible';

        button.classList.add('is-locked');

      } else {

        button.disabled = false;

        button.addEventListener(
          'click',
          function () {
            selectDay(key);
          }
        );
      }


      daySelectorEl.appendChild(button);

    });
  }


  // =========================================================
  // MENSAJE DEL DÍA
  // =========================================================

  function showDayMessage(key) {

    clearTimeout(messageTimeout);


    const allowedDays =
      getAllowedDays();


    if (!allowedDays.includes(key)) {
      return;
    }


    if (key === todayKey) {

      dayMessageEl.textContent =
        `Mostrando el menú de hoy, ${dayFullNames[key]}.`;

    } else {

      dayMessageEl.textContent =
        `Menú disponible con anticipación: ${dayFullNames[key]}.`;
    }


    dayMessageEl.classList.add('is-visible');


    messageTimeout =
      setTimeout(function () {

        dayMessageEl.classList.remove(
          'is-visible'
        );

      }, 2600);
  }


  // =========================================================
  // TARJETA DE COMIDA
  // =========================================================

  function renderMealCard(type, selection) {

    const breakfast =
      type === 'breakfast';


    const icon =
      breakfast
        ? 'coffee'
        : 'utensils';


    const title =
      breakfast
        ? 'Desayuno'
        : 'Almuerzo';


    const tag =
      breakfast
        ? 'Bebida incluida'
        : 'Refresco incluido';


    const prefix =
      breakfast
        ? 'desayuno'
        : 'almuerzo';


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
      Array.isArray(selection.principal) &&
      selection.principal.length > 1;


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


    return `
      <article class="meal-card ${breakfast ? 'breakfast' : 'lunch'}">

        <div
          class="meal-photo"
          aria-hidden="true">

          ${imageBlock}

        </div>


        <div class="meal-body">


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


          <div class="meal-items">


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


          <div class="ticket-divider"></div>


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

    const allowedDays =
      getAllowedDays();


    /*
     * Seguridad:
     * aunque alguien intente cambiar el día
     * manualmente desde la consola, no podrá
     * visualizar un día bloqueado.
     */

    if (!allowedDays.includes(key)) {

      menuCardsEl.innerHTML = `
        <p class="menu-empty">
          Este menú todavía no está disponible.
        </p>
      `;

      return;
    }


    const dayData =
      weeklyMenu[key];


    if (!dayData) {

      menuCardsEl.innerHTML = `
        <p class="menu-empty">
          Aún no se ha publicado el menú de este día.
        </p>
      `;

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


    if (window.lucide) {
      lucide.createIcons();
    }
  }


  // =========================================================
  // CAMBIAR DE DÍA
  // =========================================================

  function selectDay(key) {

    const allowedDays =
      getAllowedDays();


    if (!allowedDays.includes(key)) {

      console.warn(
        `El día ${key} está bloqueado.`
      );

      return;
    }


    if (!weeklyMenu[key]) {

      console.warn(
        `No existe información para ${key}.`
      );

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

  function updateBackButton() {

    if (!backTodayBtn) {
      return;
    }


    backTodayBtn.disabled =
      activeKey === todayKey;
  }


  if (backTodayBtn) {

    backTodayBtn.addEventListener(
      'click',
      function () {

        if (todayKey) {
          selectDay(todayKey);
        }

      }
    );
  }


  // =========================================================
  // INICIALIZACIÓN
  // =========================================================

  async function init() {

    try {

      console.log(
        'Iniciando menú...'
      );


      /*
       * Primero determinamos el día.
       */

      todayKey =
        getTodayKey();


      /*
       * Si es domingo, se utiliza lunes
       * como próximo día.
       */

      if (!todayKey) {

        activeKey =
          'lunes';

      } else {

        activeKey =
          todayKey;
      }


      renderTodayDate();


      /*
       * Mostramos los botones inmediatamente.
       * Esto evita que la página parezca congelada.
       */

      renderDaySelector();


      console.log(
        'Días permitidos:',
        getAllowedDays()
      );


      /*
       * Cargamos Supabase.
       */

      console.log(
        'Cargando datos desde Supabase...'
      );


      const result =
        await Promise.all([
          getFoodBank(),
          getWeeklyMenu()
        ]);


      foodBank =
        result[0] || {};

      weeklyMenu =
        result[1] || {};


      console.log(
        'Food bank:',
        foodBank
      );


      console.log(
        'Weekly menu:',
        weeklyMenu
      );


      /*
       * Renderizar el día permitido.
       */

      const allowedDays =
        getAllowedDays();


      /*
       * Si hoy es domingo, mostramos lunes.
       * De lo contrario mostramos hoy.
       */

      if (
        !allowedDays.includes(activeKey)
      ) {

        activeKey =
          allowedDays[0] || 'lunes';
      }


      renderDaySelector();

      renderMenu(activeKey);

      updateBackButton();


      if (window.lucide) {
        lucide.createIcons();
      }


      console.log(
        'Menú cargado correctamente.'
      );


    } catch (error) {

      console.error(
        'ERROR CARGANDO EL MENÚ:',
        error
      );


      menuCardsEl.innerHTML = `
        <p class="menu-empty">
          No se pudo cargar el menú.
          Verifica la conexión con Supabase.
        </p>
      `;
    }
  }


  // =========================================================
  // INICIAR
  // =========================================================

  if (
    document.readyState === 'loading'
  ) {

    document.addEventListener(
      'DOMContentLoaded',
      init
    );

  } else {

    init();

  }

})();
