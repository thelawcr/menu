(function () {
    'use strict';

    // =========================================================
    // CONFIGURACIÓN DE HORARIOS
    // =========================================================

    const SCHEDULE = {
        desayuno: {
            inicio: 7 * 60,
            fin: 10 * 60
        },

        almuerzo: {
            inicio: 11 * 60,
            fin: 14 * 60
        }
    };


    // =========================================================
    // COSTO FIJO DEL DELIVERY
    // =========================================================

    const DELIVERY_FEE = 300;


    // =========================================================
    // ELEMENTOS
    // =========================================================

    const modal =
        document.getElementById('deliveryModal');

    const openBtn =
        document.getElementById('openDeliveryBtn');

    const closeBtn =
        document.getElementById('closeDeliveryBtn');

    const overlay =
        document.getElementById('deliveryOverlay');

    const form =
        document.getElementById('deliveryForm');

    const submitBtn =
        document.getElementById('submitDeliveryBtn');

    const errorEl =
        document.getElementById('deliveryError');

    const priceValueEl =
        document.getElementById('deliveryPriceValue');


    if (
        !modal ||
        !openBtn ||
        !closeBtn ||
        !overlay ||
        !form
    ) {
        console.error(
            'Delivery: faltan elementos HTML necesarios.'
        );

        return;
    }


    if (priceValueEl) {

        priceValueEl.textContent =
            `₡${DELIVERY_FEE}`;

    }


    // =========================================================
    // ESTADO
    // =========================================================

    let selectedMeal = null;

    let currentMenu = null;


    // =========================================================
    // HORA ACTUAL
    // =========================================================

    function getCurrentMinutes() {

        const now = new Date();

        return (
            now.getHours() * 60 +
            now.getMinutes()
        );

    }


    // =========================================================
    // DISPONIBILIDAD
    // =========================================================

    function isMealAvailable(meal) {

        const schedule =
            SCHEDULE[meal];

        if (!schedule) {
            return false;
        }

        const minutes =
            getCurrentMinutes();

        return (
            minutes >= schedule.inicio &&
            minutes < schedule.fin
        );

    }


    // =========================================================
    // FORMATO DE HORARIOS
    // =========================================================

    function formatTime(minutes) {

        let hours =
            Math.floor(minutes / 60);

        const mins =
            minutes % 60;

        const period =
            hours >= 12 ? 'p. m.' : 'a. m.';

        if (hours > 12) {
            hours -= 12;
        }

        if (hours === 0) {
            hours = 12;
        }

        return `${hours}:${String(mins).padStart(2, '0')} ${period}`;

    }


    // =========================================================
    // HORARIO COMO TEXTO
    // =========================================================

    function getScheduleText(meal) {

        const schedule =
            SCHEDULE[meal];

        return `${formatTime(schedule.inicio)} – ${formatTime(schedule.fin)}`;

    }


    // =========================================================
    // OBTENER MENÚ DE HOY
    // =========================================================

    function getTodayMenu() {

        if (
            typeof window.weeklyMenu === 'undefined' ||
            typeof window.todayKey === 'undefined'
        ) {
            return null;
        }

        return window.weeklyMenu[window.todayKey] || null;

    }


    // =========================================================
    // OBTENER NOMBRE DE ELEMENTO
    // =========================================================

    function getItemName(category, id) {

        if (
            typeof window.foodBank === 'undefined' ||
            !window.foodBank[category]
        ) {
            return null;
        }

        const item =
            window.foodBank[category].find(
                food => food.id === id
            );

        return item
            ? item.name
            : null;

    }


    // =========================================================
    // OBTENER OPCIONES
    // =========================================================

    function getOptions(category, ids) {

        if (!Array.isArray(ids)) {
            return [];
        }

        return ids
            .map(id =>
                getItemName(category, id)
            )
            .filter(Boolean);

    }


    // =========================================================
    // CREAR SELECT
    // =========================================================

    function createSelect(
        name,
        label,
        options,
        required = true
    ) {

        const wrapper =
            document.createElement('div');

        wrapper.className =
            'form-group delivery-menu-option';


        const labelElement =
            document.createElement('label');

        labelElement.htmlFor =
            `delivery-${name}`;

        labelElement.textContent =
            label;


        const select =
            document.createElement('select');

        select.id =
            `delivery-${name}`;

        select.name =
            name;

        select.required =
            required;


        options.forEach(option => {

            const element =
                document.createElement('option');

            element.value =
                option;

            element.textContent =
                option;

            select.appendChild(element);

        });


        wrapper.appendChild(
            labelElement
        );

        wrapper.appendChild(
            select
        );


        return wrapper;

    }


    // =========================================================
    // CREAR OPCIONES DEL MENÚ
    // =========================================================

    function renderMenuOptions(meal) {

        const oldOptions =
            document.getElementById(
                'deliveryMenuOptions'
            );

        if (oldOptions) {
            oldOptions.remove();
        }


        currentMenu =
            getTodayMenu();


        if (!currentMenu) {

            showError(
                'No hay información del menú disponible para hoy.'
            );

            return;

        }


        const mealData =
            currentMenu[meal];


        if (!mealData) {

            showError(
                'No hay información disponible para este servicio.'
            );

            return;

        }


        const prefix =
            meal === 'desayuno'
                ? 'desayuno'
                : 'almuerzo';


        const container =
            document.createElement('div');

        container.id =
            'deliveryMenuOptions';

        container.className =
            'delivery-menu-options';


        // =====================================================
        // PRINCIPAL
        // =====================================================

        const principal =
            getOptions(
                `${prefix}_principal`,
                mealData.principal
            );


        if (principal.length) {

            container.appendChild(
                createSelect(
                    'principal',
                    principal.length > 1
                        ? 'Elige tu plato principal'
                        : 'Plato principal',
                    principal
                )
            );

        }


        // =====================================================
        // ACOMPAÑAMIENTO
        // =====================================================

        const acompanamiento =
            getOptions(
                `${prefix}_acompanamiento`,
                mealData.acompanamiento
            );


        if (acompanamiento.length) {

            container.appendChild(
                createSelect(
                    'acompanamiento',
                    acompanamiento.length > 1
                        ? 'Elige tu acompañamiento'
                        : 'Acompañamiento',
                    acompanamiento
                )
            );

        }


        // =====================================================
        // EXTRA / ENSALADA
        // =====================================================

        const thirdCategory =
            meal === 'desayuno'
                ? 'extra'
                : 'ensalada';


        const thirdLabel =
            meal === 'desayuno'
                ? 'Extra'
                : 'Ensalada';


        const thirdOptions =
            getOptions(
                `${prefix}_${thirdCategory}`,
                mealData[thirdCategory]
            );


        if (thirdOptions.length) {

            container.appendChild(
                createSelect(
                    'extra_ensalada',
                    thirdOptions.length > 1
                        ? `Elige ${thirdLabel.toLowerCase()}`
                        : thirdLabel,
                    thirdOptions
                )
            );

        }


        // =====================================================
        // BEBIDA
        // =====================================================

        const bebidas =
            getOptions(
                `${prefix}_bebida`,
                mealData.bebida
            );


        if (bebidas.length) {

            container.appendChild(
                createSelect(
                    'bebida',
                    bebidas.length > 1
                        ? 'Elige tu bebida'
                        : 'Bebida',
                    bebidas
                )
            );

        }


        const formElement =
            document.getElementById(
                'deliveryForm'
            );


        const nameGroup =
            document
                .getElementById('deliveryName')
                ?.closest('.form-group');


        if (nameGroup) {

            formElement.insertBefore(
                container,
                nameGroup
            );

        } else {

            formElement.prepend(
                container
            );

        }


        if (window.lucide) {
            lucide.createIcons();
        }

    }


    // =========================================================
    // CREAR SELECTOR DE TIPO DE COMIDA
    // =========================================================

    function renderMealSelector() {

        const oldSelector =
            document.getElementById(
                'deliveryMealSelector'
            );

        if (oldSelector) {
            oldSelector.remove();
        }


        const container =
            document.createElement('div');

        container.id =
            'deliveryMealSelector';

        container.className =
            'delivery-meal-selector';


        const title =
            document.createElement('p');

        title.className =
            'delivery-section-label';

        title.textContent =
            '¿Qué deseas solicitar?';


        container.appendChild(title);


        // =====================================================
        // DESAYUNO
        // =====================================================

        const breakfastAvailable =
            isMealAvailable('desayuno');


        const breakfastButton =
            createMealButton(
                'desayuno',
                'coffee',
                'Desayuno',
                getScheduleText('desayuno'),
                breakfastAvailable
            );


        container.appendChild(
            breakfastButton
        );


        // =====================================================
        // ALMUERZO
        // =====================================================

        const lunchAvailable =
            isMealAvailable('almuerzo');


        const lunchButton =
            createMealButton(
                'almuerzo',
                'utensils',
                'Almuerzo',
                getScheduleText('almuerzo'),
                lunchAvailable
            );


        container.appendChild(
            lunchButton
        );


        const formElement =
            document.getElementById(
                'deliveryForm'
            );


        formElement.prepend(
            container
        );


        // Seleccionar automáticamente
        // si solo uno está disponible.

        if (
            breakfastAvailable &&
            !lunchAvailable
        ) {

            selectMeal(
                'desayuno'
            );

        } else if (
            lunchAvailable &&
            !breakfastAvailable
        ) {

            selectMeal(
                'almuerzo'
            );

        }

    }


    // =========================================================
    // BOTÓN DE TIPO DE COMIDA
    // =========================================================

    function createMealButton(
        meal,
        icon,
        title,
        schedule,
        available
    ) {

        const button =
            document.createElement('button');

        button.type =
            'button';

        button.className =
            'delivery-meal-btn';

        button.dataset.meal =
            meal;


        if (!available) {

            button.classList.add(
                'is-disabled'
            );

            button.disabled =
                true;

        }


        button.innerHTML = `

      <span class="delivery-meal-icon">

        <i data-lucide="${icon}"></i>

      </span>

      <span class="delivery-meal-content">

        <strong>
          ${title}
        </strong>

        <small>
          ${available
                ? 'Disponible ahora'
                : schedule}
        </small>

      </span>

      <span class="delivery-meal-status">

        ${available
                ? 'Disponible'
                : 'Cerrado'}

      </span>

    `;


        if (available) {

            button.addEventListener(
                'click',
                () => selectMeal(meal)
            );

        }


        return button;

    }


    // =========================================================
    // SELECCIONAR COMIDA
    // =========================================================

    function selectMeal(meal) {

        if (!isMealAvailable(meal)) {

            showError(
                `El servicio de ${meal} no está disponible en este momento.`
            );

            return;

        }


        selectedMeal =
            meal;


        document
            .querySelectorAll(
                '.delivery-meal-btn'
            )
            .forEach(button => {

                button.classList.toggle(
                    'is-selected',
                    button.dataset.meal === meal
                );

            });


        renderMenuOptions(
            meal
        );


        clearError();

    }


    // =========================================================
    // ABRIR MODAL
    // =========================================================

    function openModal() {

        clearError();

        selectedMeal = null;

        currentMenu = null;


        const formElement =
            document.getElementById(
                'deliveryForm'
            );


        // Limpiar opciones creadas anteriormente.

        const oldOptions =
            document.getElementById(
                'deliveryMenuOptions'
            );

        if (oldOptions) {
            oldOptions.remove();
        }


        const oldSelector =
            document.getElementById(
                'deliveryMealSelector'
            );

        if (oldSelector) {
            oldSelector.remove();
        }


        renderMealSelector();


        modal.classList.add(
            'is-open'
        );

        modal.setAttribute(
            'aria-hidden',
            'false'
        );

        document.body.style.overflow =
            'hidden';


        if (window.lucide) {
            lucide.createIcons();
        }

    }


    // =========================================================
    // CERRAR MODAL
    // =========================================================

    function closeModal() {

        modal.classList.remove(
            'is-open'
        );

        modal.setAttribute(
            'aria-hidden',
            'true'
        );

        document.body.style.overflow =
            '';

        clearError();

    }


    // =========================================================
    // ERROR
    // =========================================================

    function showError(message) {

        errorEl.textContent =
            message;

    }


    function clearError() {

        errorEl.textContent =
            '';

    }


    // =========================================================
    // EVENTOS
    // =========================================================

    openBtn.addEventListener(
        'click',
        openModal
    );


    closeBtn.addEventListener(
        'click',
        closeModal
    );


    overlay.addEventListener(
        'click',
        closeModal
    );


    document.addEventListener(
        'keydown',
        event => {

            if (
                event.key === 'Escape' &&
                modal.classList.contains('is-open')
            ) {

                closeModal();

            }

        }
    );


    // =========================================================
    // ENVIAR PEDIDO
    // =========================================================

    form.addEventListener(
        'submit',
        async event => {

            event.preventDefault();

            clearError();


            // -----------------------------------------------------
            // Comprobar servicio
            // -----------------------------------------------------

            if (!selectedMeal) {

                showError(
                    'Selecciona desayuno o almuerzo.'
                );

                return;

            }


            if (!isMealAvailable(selectedMeal)) {

                showError(
                    `El servicio de ${selectedMeal} ya no está disponible.`
                );

                renderMealSelector();

                return;

            }


            // -----------------------------------------------------
            // Datos personales
            // -----------------------------------------------------

            const nombre =
                document
                    .getElementById('deliveryName')
                    .value
                    .trim();


            const telefono =
                document
                    .getElementById('deliveryPhone')
                    .value
                    .trim();


            const ubicacion =
                document
                    .getElementById('deliveryLocation')
                    .value
                    .trim();


            const detalle =
                document
                    .getElementById('deliveryDetails')
                    .value
                    .trim();


            // -----------------------------------------------------
            // Opciones seleccionadas
            // -----------------------------------------------------

            const principal =
                document
                    .getElementById('delivery-principal')
                    ?.value || null;


            const acompanamiento =
                document
                    .getElementById('delivery-acompanamiento')
                    ?.value || null;


            const extraEns =
                document
                    .getElementById('delivery-extra_ensalada')
                    ?.value || null;


            const bebida =
                document
                    .getElementById('delivery-bebida')
                    ?.value || null;


            if (!nombre || !telefono || !ubicacion) {

                showError(
                    'Completa todos los campos obligatorios.'
                );

                return;

            }


            // -----------------------------------------------------
            // Desactivar botón
            // -----------------------------------------------------

            submitBtn.disabled =
                true;


            const submitText =
                submitBtn.querySelector(
                    'span'
                );


            if (submitText) {

                submitText.textContent =
                    'Enviando solicitud...';

            }


            // -----------------------------------------------------
            // Insertar en Supabase
            // -----------------------------------------------------

            try {

                const {
                    data,
                    error
                } = await supabaseClient
                    .from('delivery_orders')
                    .insert({

                        nombre,

                        telefono,

                        ubicacion,

                        detalle:
                            detalle || null,

                        tipo_comida:
                            selectedMeal,

                        principal,

                        acompanamiento,

                        extra_ensalada:
                            extraEns,

                        bebida,

                        precio_delivery:
                            DELIVERY_FEE,

                        estado:
                            'pendiente'

                    })
                    .select()
                    .single();


                if (error) {
                    throw error;
                }


                console.log(
                    'Pedido de delivery creado:',
                    data
                );


                // ---------------------------------------------------
                // Mostrar comprobante
                // ---------------------------------------------------

                form.reset();

                closeModal();

                showSuccessMessage(
                    data
                );


            } catch (error) {

                console.error(
                    'Error creando pedido de delivery:',
                    error
                );


                showError(
                    'No fue posible enviar la solicitud. Inténtalo nuevamente.'
                );

            } finally {

                submitBtn.disabled =
                    false;


                if (submitText) {

                    submitText.textContent =
                        'Solicitar almuerzo';

                }

            }

        }
    );


    // =========================================================
    // MENSAJE DE ÉXITO
    // =========================================================

    function showSuccessMessage(order) {

        const message =
            document.createElement('div');

        message.className =
            'delivery-success';


        const shortId =
            order.id
                ? order.id.substring(0, 8)
                : '--------';


        const precio =
            order.precio_delivery ?? DELIVERY_FEE;


        message.innerHTML = `

      <div class="delivery-success-icon">

        <i data-lucide="check"></i>

      </div>

      <strong>
        ¡Solicitud enviada!
      </strong>

      <p>
        Tu ${order.tipo_comida || 'pedido'}
        fue registrado correctamente.
      </p>

      <span>
        Pedido #${shortId} · Envío: ₡${precio}
      </span>

    `;


        document.body.appendChild(
            message
        );


        if (window.lucide) {
            lucide.createIcons();
        }


        setTimeout(() => {

            message.classList.add(
                'hide'
            );


            setTimeout(() => {

                message.remove();

            }, 250);

        }, 4500);

    }


})();
