# Emma & José — Aplicación web de boda

Invitación digital + historia de los novios + fotografías + pasaje bíblico +
información del evento + Google Maps + códigos únicos de invitación +
validación de invitados + control de acompañantes + registro de asistencia +
panel administrativo.

## Estructura

```text
wedding-app/
├── frontend/   React + TypeScript + Vite + Tailwind CSS
├── backend/    Node.js + Express + TypeScript + Prisma + PostgreSQL
└── README.md
```

## Requisitos

- Node.js 18+
- PostgreSQL 14+ (local o en la nube, p. ej. Supabase / Railway / Neon)

## 1. Backend

```bash
cd backend
cp .env.example .env
# Edita .env con tu cadena de conexión de PostgreSQL, un JWT_SECRET propio,
# y las credenciales del administrador inicial (SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD).

npm install
npx prisma migrate dev --name init   # crea las tablas en la base de datos
npm run seed                          # crea el administrador y una invitación de ejemplo
npm run dev                           # http://localhost:4000
```

El administrador inicial se crea con el correo y contraseña definidos en `.env`
(`admin@boda.com` / `nuestraunion26`). **Cámbialos antes de desplegar a
producción.**

## 2. Frontend

```bash
cd frontend
cp .env.example .env   # apunta VITE_API_URL al backend (http://localhost:4000/api)
npm install
npm run dev             # http://localhost:5173
```

## 3. Personalizar la boda

Casi todo el contenido editable vive en un solo archivo:

```text
frontend/src/utils/weddingConfig.ts
```

Ahí puedes cambiar:

- Nombres y frase del hero.
- Fecha y hora de la boda (usada por la cuenta regresiva).
- El pasaje bíblico y su referencia.
- Nombre, dirección y coordenadas del lugar del evento.
- Los textos de "Nuestra historia".
- Las fotografías (foto principal y galería) — reemplaza las URLs de ejemplo
  por tus fotografías reales.

No es necesario tocar ningún otro archivo para actualizar estos datos.

## 4. Flujo de invitados

1. El invitado abre la página principal y navega por la historia, el pasaje
   bíblico, la información del evento y la galería.
2. En "Verifica tu invitación" ingresa su código único (ej. `BODA-EMMA-001`).
3. Si el código existe, ve su nombre, sus acompañantes y el total de personas
   invitadas. Si no existe, ve un mensaje de error sin revelar información
   sensible.

## 5. Flujo del administrador

1. Inicia sesión en `/admin/login` con las credenciales del `.env`.
2. **Resumen**: estadísticas generales (invitaciones, invitados, confirmados,
   presentes, pendientes).
3. **Invitados**: busca, filtra, crea invitaciones (con código automático o
   personalizado), agrega/elimina acompañantes, elimina invitaciones.
4. **Registro de asistencia**: pantalla optimizada para el día del evento —
   ingresa el código, verifica la identidad, marca individualmente o con
   "Marcar como presentes" a todo el grupo, y continúa con el siguiente
   invitado. Se guarda quién y cuándo registró cada asistencia.

## 6. Seguridad implementada

- Contraseñas de administradores con `bcrypt`.
- Autenticación de rutas administrativas con JWT.
- Validación de entradas con `zod` en el backend.
- Rate limiting en el login y en la consulta pública de códigos.
- CORS restringido al origen del frontend.
- Los endpoints públicos nunca devuelven información administrativa
  (contraseñas, IDs internos sensibles, etc.).

## 7. Modelo de datos (Prisma)

Ver `backend/prisma/schema.prisma`. Tablas: `administrators`, `invitations`,
`guests`, `attendance_records`. El código de invitación (`codigo`) es único a
nivel de base de datos.

## 8. Despliegue

- **Backend**: cualquier proveedor Node (Render, Railway, Fly.io) + una base
  de datos PostgreSQL administrada. Recuerda configurar `DATABASE_URL`,
  `JWT_SECRET` y `CORS_ORIGIN` en producción.
- **Frontend**: Vercel, Netlify o similar. Configura `VITE_API_URL` apuntando
  a la URL pública del backend.

## 9. Próximos pasos sugeridos

- Mover los textos de `weddingConfig.ts` a la base de datos para poder
  editarlos desde el panel administrativo sin tocar código.
- Agregar confirmación de asistencia (RSVP) con opciones "Asistiré / No podré
  asistir" antes del día del evento.
- Exportar el listado de invitados y el historial de asistencia a Excel/PDF.
