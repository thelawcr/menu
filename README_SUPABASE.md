# Comedor UCR - versión Supabase

## 1. Crear el proyecto
1. Entra a Supabase y crea un proyecto nuevo.
2. Ve a **SQL Editor**.
3. Abre `supabase.sql` y ejecuta todo el archivo.

## 2. Crear el administrador
En Supabase ve a **Authentication > Users > Add user** y crea el correo y contraseña que usarás para administrar el menú.

Después copia el UUID del usuario y ejecuta en SQL Editor:

```sql
insert into public.admin_users(user_id)
values ('UUID_DEL_USUARIO');
```

Alternativamente:

```sql
insert into public.admin_users(user_id)
select id from auth.users where email = 'TU_CORREO_ADMIN';
```

No compartas la contraseña del administrador.

## 3. Configurar el frontend
Abre `js/config.js` y reemplaza:

```js
const SUPABASE_URL = 'https://TU-PROYECTO.supabase.co';
const SUPABASE_ANON_KEY = 'TU_ANON_KEY';
```

por los valores de:

**Supabase > Project Settings > API**.

Usa la clave pública/anon/publishable. **Nunca pongas una service_role/secret key en este proyecto.**

## 4. Probar localmente
No abras `index.html` directamente con `file://` si el navegador da problemas de módulos o CORS. Usa un servidor local, por ejemplo VS Code Live Server.

## 5. Publicar
Puedes subir la carpeta `menu` a cualquier hosting estático que sirva HTML/CSS/JS, por ejemplo GitHub Pages, Netlify, Vercel o Cloudflare Pages.

## 6. Flujo final
- `index.html`: menú público, lectura desde Supabase.
- `login.html`: login con Supabase Auth.
- `admin.html`: panel protegido.
- `js/data.js`: acceso a PostgreSQL mediante Supabase.
- `supabase.sql`: tablas, políticas RLS y datos iniciales.

## 7. Seguridad
Las tablas permiten lectura pública del menú. Las operaciones INSERT/UPDATE/DELETE requieren que el usuario autenticado exista en `admin_users`.

La clave pública de Supabase puede aparecer en el frontend cuando RLS está bien configurado. Nunca publiques la clave secreta/service_role.
