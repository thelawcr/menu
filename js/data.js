/* Capa de datos Supabase para el menú público y el panel administrativo. */

const DAY_ORDER = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];

const CATEGORY_LABELS = {
  desayuno_principal: 'Desayuno · Plato principal',
  desayuno_acompanamiento: 'Desayuno · Acompañamiento',
  desayuno_extra: 'Desayuno · Extra',
  desayuno_bebida: 'Desayuno · Bebida',
  almuerzo_principal: 'Almuerzo · Plato principal',
  almuerzo_acompanamiento: 'Almuerzo · Acompañamiento',
  almuerzo_ensalada: 'Almuerzo · Ensalada',
  almuerzo_bebida: 'Almuerzo · Bebida'
};

const FOOD_BANK_DEFAULT = {
  desayuno_principal: [
    { id: 'd-p1', name: 'Gallo pinto' }, { id: 'd-p2', name: 'Huevos revueltos' },
    { id: 'd-p3', name: 'Pan con pollo' }, { id: 'd-p4', name: 'Sándwich de queso' }
  ],
  desayuno_acompanamiento: [
    { id: 'd-a1', name: 'Huevo frito' }, { id: 'd-a2', name: 'Natilla' },
    { id: 'd-a3', name: 'Tortilla y queso' }, { id: 'd-a4', name: 'Fruta picada' }
  ],
  desayuno_extra: [
    { id: 'd-e1', name: 'Pan casero' }, { id: 'd-e2', name: 'Plátano maduro' },
    { id: 'd-e3', name: 'Avena' }, { id: 'd-e4', name: 'Fruta de temporada' }
  ],
  desayuno_bebida: [
    { id: 'd-b1', name: 'Café' }, { id: 'd-b2', name: 'Té' }, { id: 'd-b3', name: 'Refresco natural' }
  ],
  almuerzo_principal: [
    { id: 'a-p1', name: 'Pollo en salsa' }, { id: 'a-p2', name: 'Carne en salsa' },
    { id: 'a-p3', name: 'Filete de pescado' }, { id: 'a-p4', name: 'Arroz con pollo' },
    { id: 'a-p5', name: 'Spaghetti a la boloñesa' }, { id: 'a-p6', name: 'Picadillo de papa' }
  ],
  almuerzo_acompanamiento: [
    { id: 'a-a1', name: 'Arroz blanco' }, { id: 'a-a2', name: 'Frijoles molidos' },
    { id: 'a-a3', name: 'Puré de papa' }, { id: 'a-a4', name: 'Pan de ajo' }
  ],
  almuerzo_ensalada: [
    { id: 'a-e1', name: 'Ensalada fresca' }, { id: 'a-e2', name: 'Repollo y tomate' },
    { id: 'a-e3', name: 'Ensalada mixta' }, { id: 'a-e4', name: 'Ensalada César' }
  ],
  almuerzo_bebida: [
    { id: 'a-b1', name: 'Refresco natural' }, { id: 'a-b2', name: 'Fresco de cas' },
    { id: 'a-b3', name: 'Fresco de sandía' }, { id: 'a-b4', name: 'Fresco de tamarindo' }
  ]
};

const WEEKLY_MENU_DEFAULT = {
  lunes: { desayuno: { principal:['d-p1'], acompanamiento:['d-a2'], extra:['d-e1'], bebida:['d-b1','d-b2','d-b3'] }, almuerzo:{ principal:['a-p4'], acompanamiento:['a-a2'], ensalada:['a-e1'], bebida:['a-b1'] } },
  martes: { desayuno: { principal:['d-p2'], acompanamiento:['d-a3'], extra:['d-e4'], bebida:['d-b1','d-b2','d-b3'] }, almuerzo:{ principal:['a-p1','a-p2'], acompanamiento:['a-a1','a-a2'], ensalada:['a-e2'], bebida:['a-b2'] } },
  miercoles: { desayuno: { principal:['d-p3'], acompanamiento:['d-a2'], extra:['d-e4'], bebida:['d-b1','d-b2','d-b3'] }, almuerzo:{ principal:['a-p3'], acompanamiento:['a-a3'], ensalada:['a-e3'], bebida:['a-b3'] } },
  jueves: { desayuno: { principal:['d-p1'], acompanamiento:['d-a1'], extra:['d-e2'], bebida:['d-b1','d-b2','d-b3'] }, almuerzo:{ principal:['a-p1','a-p2'], acompanamiento:['a-a1','a-a2'], ensalada:['a-e1'], bebida:['a-b1'] } },
  viernes: { desayuno: { principal:['d-p4'], acompanamiento:['d-a4'], extra:['d-e3'], bebida:['d-b1','d-b2','d-b3'] }, almuerzo:{ principal:['a-p5'], acompanamiento:['a-a4'], ensalada:['a-e4'], bebida:['a-b4'] } }
};

function clone(obj) { return JSON.parse(JSON.stringify(obj)); }

async function getFoodBank() {
  const { data, error } = await supabaseClient.from('food_items').select('id, legacy_id, category, name').order('name');
  if (error) throw error;
  const bank = {};
  Object.keys(CATEGORY_LABELS).forEach(c => bank[c] = []);
  (data || []).forEach(item => {
    if (!bank[item.category]) bank[item.category] = [];
    bank[item.category].push({ id: item.id, legacyId: item.legacy_id, name: item.name });
  });
  return bank;
}

async function getWeeklyMenu() {
  const { data, error } = await supabaseClient.from('weekly_menu').select('day, meal, category, item_id');
  if (error) throw error;
  const menu = {};
  DAY_ORDER.forEach(day => menu[day] = { desayuno:{principal:[],acompanamiento:[],extra:[],bebida:[]}, almuerzo:{principal:[],acompanamiento:[],ensalada:[],bebida:[]} });
  (data || []).forEach(row => {
    if (menu[row.day]?.[row.meal]?.[row.category]) menu[row.day][row.meal][row.category].push(row.item_id);
  });
  return menu;
}

async function saveWeeklyMenu(weeklyMenu, day) {
  const { error: delError } = await supabaseClient.from('weekly_menu').delete().eq('day', day);
  if (delError) throw delError;
  const rows = [];
  for (const meal of ['desayuno','almuerzo']) {
    for (const category of Object.keys(weeklyMenu[day][meal])) {
      for (const itemId of weeklyMenu[day][meal][category]) {
        rows.push({ day, meal, category, item_id: itemId });
      }
    }
  }
  if (rows.length) {
    const { error } = await supabaseClient.from('weekly_menu').insert(rows);
    if (error) throw error;
  }
}

async function addFoodItem(category, name) {
  const { data, error } = await supabaseClient.from('food_items').insert({ category, name }).select('id, legacy_id, category, name').single();
  if (error) throw error;
  return { id:data.id, legacyId:data.legacy_id, name:data.name };
}

async function removeFoodItem(id) {
  const { error } = await supabaseClient.from('food_items').delete().eq('id', id);
  if (error) throw error;
}

async function resetToDefaults() {
  const { error: menuError } = await supabaseClient.from('weekly_menu').delete().not('id', 'is', null);
  if (menuError) throw menuError;
  const { error: foodError } = await supabaseClient.from('food_items').delete().not('id', 'is', null);
  if (foodError) throw foodError;
  const rows = [];
  Object.entries(FOOD_BANK_DEFAULT).forEach(([category, items]) => items.forEach(item => rows.push({ category, legacy_id:item.id, name:item.name })));
  const { data, error } = await supabaseClient.from('food_items').insert(rows).select('id, legacy_id, category, name');
  if (error) throw error;
  const map = Object.fromEntries((data || []).map(x => [x.legacy_id, x.id]));
  const menuRows = [];
  Object.entries(WEEKLY_MENU_DEFAULT).forEach(([day, meals]) => Object.entries(meals).forEach(([meal, cats]) => Object.entries(cats).forEach(([category, ids]) => ids.forEach(legacyId => menuRows.push({ day, meal, category, item_id:map[legacyId] })) )));
  const { error: insertMenuError } = await supabaseClient.from('weekly_menu').insert(menuRows);
  if (insertMenuError) throw insertMenuError;
}

function findItemName(bank, category, id) {
  const item = (bank[category] || []).find(i => i.id === id);
  return item ? item.name : null;
}

function joinOptionNames(bank, category, ids) {
  const names = (ids || []).map(id => findItemName(bank, category, id)).filter(Boolean);
  if (!names.length) return '—';
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} o ${names[1]}`;
  return `${names.slice(0,-1).join(', ')} o ${names[names.length-1]}`;
}
