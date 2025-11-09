Project: ini-sempro

Quickstart (Local)

- Requirements: PHP 8.0.2+, Composer, Node 16+, SQLite or MySQL
- Install deps:
  - `composer install`
  - `npm install`
- Env:
  - Copy `.env.example` to `.env` if missing
  - For easiest setup, use SQLite:
    - In `.env`: `DB_CONNECTION=sqlite`
    - Set `DB_DATABASE` to an absolute path pointing to `database/database.sqlite`
    - Create the file if it does not exist
  - Generate app key: `php artisan key:generate`
- DB:
  - `php artisan migrate --seed`
  - Admin login: `admin@example.com` / `password`
- Run:
  - `php artisan serve`
  - `npm run dev`

Key URLs

- Homepage (Dashboard): `/`
- Login: `/login`
- Dashboard alias: `/dashboard` (redirects to `/`)
- Admin Dashboard: `/admin/dashboard` (requires admin)
- Sempro Create Form: `/sempro/create` (requires login)

Notes

- A simple Sempro submission form page lives at `resources/js/Pages/Sempro/Create.jsx` and is wired to `/sempro/create`.
- Submissions POST to `/sempro` and show a flash message on success.
- Admin area includes Iuran management under `/admin/iurans`.
- Frontend stack: Inertia React + Tailwind + DaisyUI; Ziggy provides route() helper.
