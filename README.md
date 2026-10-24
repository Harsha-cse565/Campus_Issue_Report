# KARE Facilities & Campus Operations Portal

## Requirements
- Node.js 20.19+ (Node 22 LTS recommended; Vite 8 requires a recent Node release)
- npm
- MySQL 8 / MariaDB only if you want to import the supplied schema

## Run in VS Code (Windows)
1. Extract this ZIP to a normal folder (avoid running it from inside the ZIP).
2. Open that folder in VS Code.
3. Open **Terminal → New Terminal**.
4. Run `npm install`.
5. Optional: copy `.env.example` to `.env` and add a valid `GEMINI_API_KEY` to enable AI triage. The app runs without it.
6. Run `npm run dev`.
7. Open `http://localhost:3000`. API health: `http://localhost:3000/api/health`.

## Production build
Run `npm run build`, then `npm start`. The server serves the built `dist` frontend and the API.

## Database status — important
The ZIP contains `database/kare_facilities_mysql.sql` (full MySQL schema and seed data). The current Express API still uses an **in-memory demo store**, and the browser also keeps issue changes in `localStorage`. It does **not** connect to MySQL or persist API changes into MySQL yet. The health endpoint now reports this honestly instead of claiming MySQL is connected. Importing the SQL file creates the database/tables, but alone does not connect the application.

To import the schema using MySQL Workbench, open `database/kare_facilities_mysql.sql` and execute it. Alternatively, in a MySQL terminal run `mysql -u root -p < database/kare_facilities_mysql.sql`. **Warning:** this script drops/recreates its tables and inserts demo data, so back up an existing database before running it.

## Troubleshooting
- If port 3000 is occupied, use `PORT=3001` in `.env` (or stop the process already using 3000).
- If `npm install` fails, use Node 22 LTS and rerun it.
- AI triage returns an error unless a valid Gemini API key is configured.
