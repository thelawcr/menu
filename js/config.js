const SUPABASE_URL = 'https://wqpypmsjkqdlfxkwypvn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_3WBae2vZGfMLVsX414FYLg_Lo5cNDVv';

if (!window.supabase) {
  console.error('No se cargó Supabase JS. Revisa el script CDN en las páginas HTML.');
}

const supabaseClient = window.supabase?.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
