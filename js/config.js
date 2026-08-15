const SUPABASE_URL = 'https://wqpypmsjkqdlfxkwypvn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxcHlwbXNqa3FkbGZ4a3d5cHZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3NjU1NDYsImV4cCI6MjEwMjM0MTU0Nn0.SI72uBl3FoJp9vIZVU_YvM2ppUN6BihHAhU3_ES2woY';

if (!window.supabase) {
  console.error('No se cargó Supabase JS. Revisa el script CDN en las páginas HTML.');
}

const supabaseClient = window.supabase?.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
