# CEA Exam Portal (MERN)

The deployable application is split into two independent projects:

- `frontend/` — React, TypeScript, and Vite. Deploy this folder to Vercel.
- `backend/` — Express, TypeScript, and MongoDB (Mongoose). Deploy this folder to Render.

The existing exam experience is retained, with username/email login, separate employee and admin login selection, employee registration, password visibility toggles, username recovery by email, password reset by email, role-protected admin question validation, and per-account test history.

## Run locally

Use two terminals from the repository root:

```bash
cd backend
npm install
Copy-Item .env.example .env
npm run dev
```

Set the values in `backend/.env` (see below), then in the second terminal:

```bash
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Open the Vite URL shown in the frontend terminal. Before the first run, seed the MongoDB question bank from `backend/` with `npm run seed`.

## Backend environment

Set these values in `backend/.env` locally and in Render's environment settings:

- `MONGODB_URI` — MongoDB Atlas connection string.
- `JWT_SECRET` and `JWT_REFRESH_SECRET` — two different, long random secrets.
- `ADMIN_SECRET_CODE` — a private value used when creating an admin account. Never put this value in the frontend environment.
- `CLIENT_URL` — comma-separated allowed frontend origins, such as `http://localhost:5173,https://your-app.vercel.app`.
- `FRONTEND_URL` — the frontend origin used to create password-reset links.
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, and optionally `EMAIL_FROM` — SMTP settings. These are required for username recovery and password reset email delivery.

## Deploy

### Render (backend)

Create a Web Service from this repository with root directory `backend`. Use build command `npm install && npm run build` and start command `npm start`. Add the backend environment values above, setting `CLIENT_URL` to your Vercel URL and `FRONTEND_URL` to that same URL. After deployment, seed questions once using Render's shell with `npm run seed` from the service root.

The backend exposes `GET /health` for a health check.

### Vercel (frontend)

Create a Vercel project from this repository and set root directory `frontend`. Vercel will use the included Vite configuration. Add `VITE_API_URL` with the full Render service URL, for example `https://your-service.onrender.com` (no trailing slash), then deploy.

Update Render's `CLIENT_URL` and `FRONTEND_URL` to the final Vercel domain. If using a Vercel preview domain, add it to `CLIENT_URL` as well when you need preview deployments to call the API.

## Question bank

The source JSON remains in `backend/data/` for seeding and in `frontend/src/data/` for the admin editor's local tooling. `backend/data/` is the seed source for separate Render deployment. Static source page and diagram images are copied into `frontend/public/pdf_pages/` so image references continue to work on Vercel.

The PDF extraction utilities and source PDFs remain in the repository for future question-bank updates.
