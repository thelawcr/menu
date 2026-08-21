(function () {
  'use strict';

  const dayOrder = DAY_ORDER;

  const dayLabels = {
    lunes: 'Lunes',
    martes: 'Martes',
    miercoles: 'Miércoles',
    jueves: 'Jueves',
    viernes: 'Viernes',
    sabado: 'Sábado'
  };

  let foodBank = {};
  let weeklyMenu = {};
  let activeDay = 'lunes';

  /*
   * Archivos seleccionados temporalmente.
   *
   * No se suben hasta pulsar "Guardar menú del día".
   */
  let selectedImages = {
    desayuno: null,
    almuerzo: null
  };


  // =========================================================
  // TOAST
  // =========================================================

  const saveToast =
    document.getElementById('saveToast');

  let toastTimeout;

  function showToast(message, type = 'success') {

    clearTimeout(toastTimeout);

    saveToast.textContent =
      `${type === 'error' ? '⚠' : '✓'} ${message}`;

    saveToast.classList.remove(
      'toast-success',
      'toast-error'
    );

    saveToast.classList.add(
      type === 'error'
        ? 'toast-error'
        : 'toast-success',
      'is-visible'
    );

    toastTimeout = setTimeout(() => {

      saveToast.classList.remove(
        'is-visible'
      );

    }, 2800);
  }


  // =========================================================
  // NAVEGACIÓN
  // =========================================================

  const navLinks =
    document.querySelectorAll('.nav-link');

  const panels =
    document.querySelectorAll('.admin-panel');


  navLinks.forEach(link => {

    link.addEventListener('click', () => {

      panels.forEach(panel => {

        panel.hidden =
          panel.dataset.panel !==
          link.dataset.panel;

      });


      navLinks.forEach(x => {

        const active = x === link;

        x.classList.toggle(
          'is-active',
          active
        );

        x.setAttribute(
          'aria-selected',
          active ? 'true' : 'false'
        );

      });

    });

  });


  // =========================================================
  // TABS DE DÍAS
  // =========================================================

  const dayTabsEl =
    document.getElementById('dayTabs');


  function renderDayTabs() {

    dayTabsEl.innerHTML = '';

    dayOrder.forEach(key => {

      const btn =
        document.createElement('button');

      btn.type = 'button';

      btn.className =
        'tab-btn' +
        (key === activeDay
          ? ' is-active'
          : '');

      btn.textContent =
        dayLabels[key];

      btn.setAttribute(
        'role',
        'tab'
      );

      btn.setAttribute(
        'aria-selected',
        key === activeDay
          ? 'true'
          : 'false'
      );


      btn.addEventListener(
        'click',
        async () => {

          activeDay = key;

          selectedImages = {
            desayuno: null,
            almuerzo: null
          };

          renderDayTabs();

          await renderDayEditor();

        }
      );


      dayTabsEl.appendChild(btn);

    });
  }


  // =========================================================
  // OBTENER IMÁGENES DEL DÍA
  // =========================================================

  async function getMealImages(day) {

    const {
      data,
      error
    } = await supabaseClient
      .from('weekly_menu')
      .select(
        'meal, imagen_desayuno, imagen_almuerzo'
      )
      .eq('day', day);


    if (error) {
      throw error;
    }


    let images = {
      desayuno: null,
      almuerzo: null
    };


    data.forEach(row => {

      if (
        row.meal === 'desayuno' &&
        row.imagen_desayuno
      ) {
        images.desayuno =
          row.imagen_desayuno;
      }


      if (
        row.meal === 'almuerzo' &&
        row.imagen_almuerzo
      ) {
        images.almuerzo =
          row.imagen_almuerzo;
      }

    });


    return images;
  }


  // =========================================================
  // EDITOR DE COMIDA
  // =========================================================

  const dayEditorEl =
    document.getElementById('dayEditor');


  async function renderMealEditorBlock(mealType) {

    const breakfast =
      mealType === 'desayuno';


    const categories =
      breakfast
        ? [
          ['principal', 'Plato principal'],
          ['acompanamiento', 'Acompañamiento'],
          ['extra', 'Extra'],
          ['bebida', 'Bebida']
        ]
        : [
          ['principal', 'Plato principal'],
          ['acompanamiento', 'Acompañamiento'],
          ['ensalada', 'Ensalada'],
          ['bebida', 'Bebida']
        ];


    const dayData =
      weeklyMenu[activeDay][mealType];


    const groups =
      categories.map(([cat, label]) => {

        const bankKey =
          `${mealType}_${cat}`;

        const items =
          foodBank[bankKey] || [];

        const activeIds =
          dayData[cat] || [];


        const chips =
          items.length

            ? items.map(item => {

              const id =
                `chip-${mealType}-${cat}-${item.id}`;

              return `
                  <div class="option-chip" data-name="${escapeHtml(item.name.toLowerCase())}">

                    <input
                      type="checkbox"
                      id="${id}"
                      data-meal="${mealType}"
                      data-cat="${cat}"
                      data-id="${item.id}"
                      ${activeIds.includes(item.id)
                  ? 'checked'
                  : ''}>

                    <label for="${id}">
                      ${escapeHtml(item.name)}
                    </label>

                  </div>
                `;

            }).join('')

            : `
                <p class="category-empty">
                  No hay opciones en el banco todavía.
                  Agrega una abajo.
                </p>
              `;


        return `
          <div class="category-group">

            <span class="category-group-label">
              ${label}
            </span>

            <div class="option-chips">
              ${chips}
            </div>

          </div>
        `;

      }).join('');


    /*
     * Obtener imagen actual
     */

    const currentImages =
      await getMealImages(activeDay);

    const currentImage =
      currentImages[mealType];


    return `
      <div class="meal-editor-block">

        <h3>

          <i
            data-lucide="${breakfast
        ? 'coffee'
        : 'utensils'}"
            aria-hidden="true">
          </i>

          ${breakfast
        ? 'Desayuno'
        : 'Almuerzo'}

        </h3>


        <!-- IMAGEN -->

        <div class="meal-image-editor">

          <div class="meal-image-preview"
               id="preview-${mealType}">

            ${currentImage

        ? `
                  <img
                    src="${escapeHtml(currentImage)}"
                    alt="Imagen actual del ${breakfast
          ? 'desayuno'
          : 'almuerzo'
        }">
                `

        : `
                  <div class="image-placeholder">

                    <i
                      data-lucide="image"
                      aria-hidden="true">
                    </i>

                    <span>
                      No hay imagen seleccionada
                    </span>

                  </div>
                `
      }

          </div>


          <div class="meal-image-controls">

            <label
              class="image-upload-btn"
              for="image-${mealType}">

              <i
                data-lucide="image-plus"
                aria-hidden="true">
              </i>

              ${currentImage
        ? 'Cambiar imagen'
        : 'Seleccionar imagen'
      }

            </label>


            <input
              type="file"
              id="image-${mealType}"
              class="meal-image-input"
              data-meal="${mealType}"
              accept="image/jpeg,image/png,image/webp">


            <p class="image-help">
              JPG, PNG o WebP · Máximo recomendado: 2 MB
            </p>

          </div>

        </div>


        <!-- BÚSQUEDA -->

        <div class="search-bar search-bar-compact">

          <i
            data-lucide="search"
            class="search-bar-icon"
            aria-hidden="true">
          </i>

          <input
            type="text"
            class="search-bar-input meal-search-input"
            data-meal="${mealType}"
            placeholder="Buscar opción…"
            autocomplete="off">

        </div>


        <!-- CATEGORÍAS -->

        ${groups}

      </div>
    `;
  }


  // =========================================================
  // RENDER EDITOR COMPLETO
  // =========================================================

  async function renderDayEditor() {

    dayEditorEl.innerHTML =
      '<p class="category-empty">Cargando menú...</p>';


    try {

      const breakfast =
        await renderMealEditorBlock(
          'desayuno'
        );

      const lunch =
        await renderMealEditorBlock(
          'almuerzo'
        );


      dayEditorEl.innerHTML =
        breakfast + lunch;


      /*
       * Inicializar iconos
       */

      if (window.lucide) {
        lucide.createIcons();
      }


      /*
       * Checkboxes
       */

      dayEditorEl
        .querySelectorAll(
          'input[type="checkbox"]'
        )
        .forEach(input => {

          input.addEventListener(
            'change',
            e => {

              const {
                meal,
                cat,
                id
              } = e.target.dataset;


              const list =
                weeklyMenu[
                activeDay
                ][meal][cat] || [];


              if (
                e.target.checked &&
                !list.includes(id)
              ) {

                list.push(id);

              }


              if (!e.target.checked) {

                const i =
                  list.indexOf(id);

                if (i >= 0) {
                  list.splice(i, 1);
                }

              }


              weeklyMenu[
                activeDay
              ][meal][cat] = list;

            }
          );

        });


      /*
       * Inputs de imágenes
       */

      dayEditorEl
        .querySelectorAll(
          '.meal-image-input'
        )
        .forEach(input => {

          input.addEventListener(
            'change',
            handleImageSelection
          );

        });


      /*
       * Búsqueda dentro de cada bloque de comida
       */

      dayEditorEl
        .querySelectorAll(
          '.meal-search-input'
        )
        .forEach(input => {

          input.addEventListener(
            'input',
            () => {

              const query =
                input.value
                  .trim()
                  .toLowerCase();

              const block =
                input.closest(
                  '.meal-editor-block'
                );

              block
                .querySelectorAll(
                  '.option-chip'
                )
                .forEach(chip => {

                  const match =
                    !query ||
                    chip.dataset.name.includes(
                      query
                    );

                  chip.classList.toggle(
                    'is-hidden',
                    !match
                  );

                });

            }
          );

        });

    } catch (error) {

      console.error(
        'Error cargando editor:',
        error
      );

      dayEditorEl.innerHTML = `
        <p class="category-empty">
          No se pudo cargar la información
          de las imágenes.
        </p>
      `;
    }
  }


  // =========================================================
  // SELECCIONAR IMAGEN
  // =========================================================

  function handleImageSelection(event) {

    const input =
      event.target;

    const meal =
      input.dataset.meal;

    const file =
      input.files[0];


    if (!file) {
      return;
    }


    /*
     * Validar tipo
     */

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp'
    ];


    if (!allowedTypes.includes(file.type)) {

      showToast(
        'Solo puedes seleccionar imágenes JPG, PNG o WebP.',
        'error'
      );

      input.value = '';

      return;
    }


    /*
     * Validar tamaño
     */

    if (file.size > 5 * 1024 * 1024) {

      showToast(
        'La imagen no puede superar los 5 MB.',
        'error'
      );

      input.value = '';

      return;
    }


    /*
     * Guardar temporalmente
     */

    selectedImages[meal] =
      file;


    /*
     * Vista previa
     */

    const preview =
      document.getElementById(
        `preview-${meal}`
      );


    const imageUrl =
      URL.createObjectURL(file);


    preview.innerHTML = `
      <img
        src="${imageUrl}"
        alt="Vista previa del ${meal === 'desayuno'
        ? 'desayuno'
        : 'almuerzo'
      }">
    `;


    if (window.lucide) {
      lucide.createIcons();
    }
  }


  // =========================================================
  // SUBIR IMAGEN A SUPABASE STORAGE
  // =========================================================

  async function uploadMealImage(
    day,
    meal,
    file
  ) {

    if (!file) {
      return null;
    }


    /*
     * Extensión
     */

    const extension =
      file.name
        .split('.')
        .pop()
        .toLowerCase();


    /*
     * Nombre único
     */

    const fileName =
      `${meal}-${Date.now()}.${extension}`;


    const filePath =
      `${day}/${fileName}`;


    /*
     * Subir a Storage
     */

    const {
      error: uploadError
    } = await supabaseClient
      .storage
      .from('menu-images')
      .upload(
        filePath,
        file,
        {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type
        }
      );


    if (uploadError) {
      throw uploadError;
    }


    /*
     * Obtener URL pública
     */

    const {
      data
    } = supabaseClient
      .storage
      .from('menu-images')
      .getPublicUrl(filePath);


    return data.publicUrl;
  }


  // =========================================================
  // GUARDAR URL DE IMAGEN
  // =========================================================

  async function saveMealImageUrl(
    day,
    meal,
    imageUrl
  ) {

    if (!imageUrl) {
      return;
    }


    const column =
      meal === 'desayuno'
        ? 'imagen_desayuno'
        : 'imagen_almuerzo';


    const {
      error
    } = await supabaseClient
      .from('weekly_menu')
      .update({
        [column]: imageUrl
      })
      .eq('day', day)
      .eq('meal', meal);


    if (error) {
      throw error;
    }
  }


  // =========================================================
  // GUARDAR MENÚ
  // =========================================================

  const saveMenuBtn =
    document.getElementById(
      'saveMenuBtn'
    );


  saveMenuBtn.addEventListener(
    'click',
    async () => {

      saveMenuBtn.disabled = true;

      saveMenuBtn.innerHTML = `
        <i data-lucide="loader-circle"></i>
        Guardando…
      `;


      if (window.lucide) {
        lucide.createIcons();
      }


      try {

        /*
         * 1. Guardar platillos
         */

        await saveWeeklyMenu(
          weeklyMenu,
          activeDay
        );


        /*
         * 2. Subir desayuno
         */

        if (
          selectedImages.desayuno
        ) {

          const breakfastUrl =
            await uploadMealImage(
              activeDay,
              'desayuno',
              selectedImages.desayuno
            );


          await saveMealImageUrl(
            activeDay,
            'desayuno',
            breakfastUrl
          );

        }


        /*
         * 3. Subir almuerzo
         */

        if (
          selectedImages.almuerzo
        ) {

          const lunchUrl =
            await uploadMealImage(
              activeDay,
              'almuerzo',
              selectedImages.almuerzo
            );


          await saveMealImageUrl(
            activeDay,
            'almuerzo',
            lunchUrl
          );

        }


        /*
         * Limpiar selección
         */

        selectedImages = {
          desayuno: null,
          almuerzo: null
        };


        /*
         * Recargar datos
         */

        weeklyMenu =
          await getWeeklyMenu();


        await renderDayEditor();


        showToast(
          'Menú e imágenes guardados correctamente en Supabase.'
        );


        saveMenuBtn.innerHTML = `
          <i data-lucide="check"></i>
          Guardado
        `;


        if (window.lucide) {
          lucide.createIcons();
        }

      } catch (e) {

        console.error(e);


        showToast(
          'No se pudo guardar el menú o las imágenes. Revisa Storage y RLS.',
          'error'
        );


        saveMenuBtn.textContent =
          'Error al guardar';

      }


      setTimeout(() => {

        saveMenuBtn.disabled = false;

        saveMenuBtn.innerHTML =
          'Guardar menú del día';

      }, 1800);

    }
  );


  // =========================================================
  // BANCO DE PLATILLOS
  // =========================================================

  const foodBankGridEl =
    document.getElementById(
      'foodBankGrid'
    );


  // =========================================================
  // BÚSQUEDA EN BANCO DE PLATILLOS
  // =========================================================

  function filterFoodBank(query) {

    const q =
      query.trim().toLowerCase();


    foodBankGridEl
      .querySelectorAll(
        '.bank-category'
      )
      .forEach(catEl => {

        let anyVisible = false;

        catEl
          .querySelectorAll(
            '.bank-item'
          )
          .forEach(itemEl => {

            const match =
              !q ||
              itemEl.dataset.name.includes(
                q
              );

            itemEl.classList.toggle(
              'is-hidden',
              !match
            );

            if (match) {
              anyVisible = true;
            }

          });

        catEl.classList.toggle(
          'is-hidden',
          q.length > 0 && !anyVisible
        );

      });
  }


  const bankSearchInput =
    document.getElementById(
      'bankSearchInput'
    );


  if (bankSearchInput) {

    bankSearchInput.addEventListener(
      'input',
      () => {

        filterFoodBank(
          bankSearchInput.value
        );

      }
    );

  }


  function renderFoodBank() {

    foodBankGridEl.innerHTML =
      Object.keys(CATEGORY_LABELS)
        .map(cat => {

          const items =
            foodBank[cat] || [];


          return `
            <div class="bank-category">

              <h4>
                ${CATEGORY_LABELS[cat]}
              </h4>

              <div class="bank-item-list">

                ${items.length

              ? items.map(i => `
                        <div class="bank-item" data-name="${escapeHtml(i.name.toLowerCase())}">

                          <span>
                            ${escapeHtml(i.name)}
                          </span>

                          <button
                            type="button"
                            class="bank-item-remove"
                            data-id="${i.id}">

                            Quitar

                          </button>

                        </div>
                      `).join('')

              : `
                      <p class="category-empty">
                        Sin opciones todavía.
                      </p>
                    `
            }

              </div>


              <div class="bank-add-row">

                <input
                  type="text"
                  placeholder="Nueva opción…"
                  data-cat="${cat}"
                  class="bank-add-input">


                <button
                  type="button"
                  class="bank-add-btn"
                  data-cat="${cat}">

                  Agregar

                </button>

              </div>

            </div>
          `;

        })
        .join('');


    /*
     * Eliminar
     */

    foodBankGridEl
      .querySelectorAll(
        '.bank-item-remove'
      )
      .forEach(btn => {

        btn.addEventListener(
          'click',
          async () => {

            if (
              !confirm(
                '¿Eliminar esta opción? También dejará de aparecer en los menús donde esté seleccionada.'
              )
            ) {
              return;
            }


            try {

              await removeFoodItem(
                btn.dataset.id
              );


              foodBank =
                await getFoodBank();


              weeklyMenu =
                await getWeeklyMenu();


              renderFoodBank();

              await renderDayEditor();


              showToast(
                'Opción eliminada.'
              );

            } catch (e) {

              console.error(e);

              showToast(
                'No se pudo eliminar la opción.',
                'error'
              );

            }

          }
        );

      });


    /*
     * Agregar
     */

    foodBankGridEl
      .querySelectorAll(
        '.bank-add-btn'
      )
      .forEach(btn => {

        btn.addEventListener(
          'click',
          () => addFood(
            btn.dataset.cat
          )
        );

      });


    foodBankGridEl
      .querySelectorAll(
        '.bank-add-input'
      )
      .forEach(input => {

        input.addEventListener(
          'keydown',
          e => {

            if (e.key === 'Enter') {

              e.preventDefault();

              addFood(
                input.dataset.cat
              );

            }

          }
        );

      });


    /*
     * Reaplicar filtro de búsqueda activo
     * (por si el usuario agregó/quitó un platillo
     * mientras estaba filtrando)
     */

    if (bankSearchInput && bankSearchInput.value) {

      filterFoodBank(
        bankSearchInput.value
      );

    }

  }


  // =========================================================
  // AGREGAR PLATILLO
  // =========================================================

  async function addFood(category) {

    const input =
      foodBankGridEl.querySelector(
        `.bank-add-input[data-cat="${category}"]`
      );


    const name =
      input.value.trim();


    if (!name) {
      return;
    }


    try {

      await addFoodItem(
        category,
        name
      );


      foodBank =
        await getFoodBank();


      renderFoodBank();

      await renderDayEditor();


      input.value = '';


      showToast(
        `"${name}" agregado al banco de platillos.`
      );

    } catch (e) {

      console.error(e);

      showToast(
        'No se pudo agregar la opción.',
        'error'
      );

    }

  }


  // =========================================================
  // RESTABLECER
  // =========================================================

  document
    .getElementById('resetBtn')
    .addEventListener(
      'click',
      async () => {

        if (
          !confirm(
            '¿Seguro que deseas borrar todos los cambios y volver a los valores originales?'
          )
        ) {
          return;
        }


        try {

          await resetToDefaults();


          foodBank =
            await getFoodBank();


          weeklyMenu =
            await getWeeklyMenu();


          activeDay = 'lunes';


          selectedImages = {
            desayuno: null,
            almuerzo: null
          };


          renderDayTabs();

          await renderDayEditor();

          renderFoodBank();


          showToast(
            'Datos restablecidos a los valores originales.'
          );

        } catch (e) {

          console.error(e);

          showToast(
            'No se pudo restablecer la información.',
            'error'
          );

        }

      }
    );


  // =========================================================
  // CERRAR SESIÓN
  // =========================================================

  document
    .getElementById('logoutBtn')
    .addEventListener(
      'click',
      async () => {

        await supabaseClient
          .auth
          .signOut();

        location.replace(
          'login.html'
        );

      }
    );


  // =========================================================
  // ESCAPAR HTML
  // =========================================================

  function escapeHtml(value) {

    return String(value)
      .replace(
        /[&<>'"]/g,
        c => ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          "'": '&#39;',
          '"': '&quot;'
        }[c])
      );

  }


  // =========================================================
  // INICIALIZACIÓN
  // =========================================================

  async function init() {

    /*
     * Verificar sesión
     */

    const {
      data: {
        session
      }
    } =
      await supabaseClient
        .auth
        .getSession();


    if (!session) {

      location.replace(
        'login.html'
      );

      return;
    }


    try {

      foodBank =
        await getFoodBank();


      weeklyMenu =
        await getWeeklyMenu();


      renderDayTabs();

      await renderDayEditor();

      renderFoodBank();


      /*
       * Iconos iniciales
       */

      if (window.lucide) {
        lucide.createIcons();
      }

    } catch (e) {

      console.error(e);

      showToast(
        'No se pudieron cargar los datos de Supabase.',
        'error'
      );

    }

  }


  init();

})();