# GHF Monthly Tarbiyati & Karkun Jaiza Portal

Full-stack assessment portal for **Guided Humanity Foundation (GHF)** built on free-tier infrastructure (**React + Vite + Tailwind CSS** on Netlify, **Node.js + Express** on Render, **MongoDB Atlas M0**, **Resend/SMTP**, and **Google Sheets API**).

---

## 1. Architecture & Folder Structure

```text
ghf-monthly-report/
├── client/                         # React + Vite frontend (Netlify)
│   ├── public/_redirects           # SPA fallback routing
│   ├── netlify.toml                # Netlify build & redirect config
│   └── src/
│       ├── components/             # Reusable form, layout, navigation & admin UI
│       ├── context/                # AdminAuthContext (session check via HTTP-only cookie)
│       ├── hooks/                  # useAutoSave, useSubmissionQueue
│       ├── pages/                  # Public pages + lazy-loaded admin pages
│       ├── schemas/                # formSchema.js ("1".."72") & answerMappings.js
│       ├── services/               # api.js, adminApi.js, localStorageService.js, submissionQueue.js, submissionService.js
│       └── utils/                  # formValidation.js
├── server/                         # Node.js + Express backend (Render)
│   ├── config/database.js          # Reusable Mongoose Atlas connection
│   ├── controllers/                # Public submission, admin auth, admin CRUD, health & export
│   ├── middleware/                 # authMiddleware, validationMiddleware, securityMiddleware, errorMiddleware
│   ├── models/                     # Submission, Admin, IntegrationOutbox, SyncJob
│   ├── routes/                     # healthRoutes, submissionRoutes, adminAuthRoutes, adminSubmissionRoutes, adminIntegrationRoutes
│   ├── scripts/                    # seedAdmin.js, backupDatabase.mjs, restoreDatabase.mjs
│   ├── services/                   # submissionService, adminSubmissionService, emailService, googleSheetsService, exportService, syncWorker
│   ├── utils/                      # answerMapper.js, emailTemplates.js, initAdmin.js, logger.js, queryUtils.js
│   └── server.js
└── docs/ADMIN_USER_GUIDE.md        # Step-by-step Administrator Guide
```

---

## 2. Local Development Setup

### Backend (`server/`)
```bash
cd server
npm install
cp .env.example .env
```
Configure `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/ghf_portal?retryWrites=true&w=majority
FRONTEND_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=60
JWT_SECRET=<random-32+-character-secret>
JWT_EXPIRES_IN=7d
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@ghf.org
ADMIN_PASSWORD=<strong-initial-password>
ADMIN_NAME=GHF Administrator
EMAIL_FROM=GHF Portal <noreply@yourdomain.com>
GHF_ADMIN_EMAIL=admin@yourdomain.com
GHF_CONTACT_INFO=Guided Humanity Foundation (help@ghf.org)
RESEND_API_KEY=
GOOGLE_SHEET_ID=
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Initialize the first administrator (password hashed via `bcryptjs` before saving):
```bash
npm run seed:admin
npm run dev
```

### Frontend (`client/`)
```bash
cd client
npm install
cp .env.example .env
# VITE_API_BASE_URL=http://localhost:5000
npm run dev
```

---

## 3. MongoDB Atlas Setup (M0 Free Tier)

1. Create a free **M0** cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a least-privilege database user (`readWrite` on `ghf_portal` database only — do not grant `atlasAdmin`).
3. Restrict Network Access to your development IP (and `0.0.0.0/0` only if deploying to Render Free Tier without static outbound IPs, paired with a strong database password).
4. Minimal indexes maintained automatically by Mongoose:
   - `Submission`: `{ sid: 1 }` (`unique`), `{ month: 1 }`, `{ createdAt: -1 }`
   - `IntegrationOutbox`: `{ sid: 1 }` (`unique`), `{ updatedAt: -1 }`
   - `SyncJob`: `{ eventKey: 1 }` (`unique`), `{ status: 1, nextAttemptAt: 1 }`, `{ sid: 1, type: 1 }`

---

## 4. Email & Google Sheets Setup (Free Tiers)

### Email (Resend)
- **Resend Free Tier**: 3,000 emails/month, 100 emails/day cap, 10 req/sec, supports `Idempotency-Key` deduplication. Verify your sending domain in Resend and set `RESEND_API_KEY`, `EMAIL_FROM`, `GHF_ADMIN_EMAIL`, and `GHF_CONTACT_INFO`.

### Google Sheets API (Service Account)
1. Enable **Google Sheets API** in Google Cloud Console (free tier: 300 read / 300 write req/min per project).
2. Create a Service Account and generate a JSON key.
3. Create a spreadsheet named **GHF Monthly Assessment Database** and share it as **Editor** with the Service Account email.
4. Set `GOOGLE_SHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, and `GOOGLE_PRIVATE_KEY`.
5. All 9 worksheet tabs (`All Submissions`, `Personal Information`, `Prayer & Worship`, `Quran & Study Progress`, `Meetings & Participation`, `Baitulmaal`, `Organizational Activities`, `Self Assessment`, `Responsible Review`) are created and maintained automatically by `Submission ID`.

---

## 5. Deployment (Render + Netlify + Custom Domain)

### Backend on Render (Free Tier)
- Root Directory: `server` | Build: `npm install` | Start: `npm start`
- Set all production env vars (`NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL`, `CORS_ORIGINS`, email & Google Sheets vars).
- Verify `GET /api/health` returns `{"success":true,"server":"online","database":"connected"}`.

### Frontend on Netlify (Free Tier)
- Base directory: `client` | Build: `npm run build` | Publish: `client/dist`
- Env var: `VITE_API_BASE_URL=https://<your-render-service>.onrender.com` (or `/api` proxy — see domain note below).

### Important Cookie & Custom Domain Guidance
- Admin auth uses `HttpOnly` cookies (`SameSite=None; Secure` in production). Because modern mobile browsers (especially iOS Safari) may restrict third-party cookies across unrelated domains (`*.netlify.app` vs `*.onrender.com`), the **recommended production setup** is either:
  1. **Custom Domain Subdomains**: `portal.yourdomain.org` (Netlify) + `api.yourdomain.org` (Render), OR
  2. **Netlify Reverse Proxy**: Proxy `/api/*` in `netlify.toml` to `https://<your-render-service>.onrender.com/api/:splat` (`status = 200`, `force = true`) and set `VITE_API_BASE_URL=` (empty / same-origin) so cookies are strictly first-party!

---

## 6. Database Backup & Recovery (Free Local Procedure)

> **Atlas M0 Limitation:** MongoDB Atlas M0 Free Tier does not include automated continuous cloud snapshots. Always run periodic manual backups locally or via `mongodump`.

### Create a Compressed Backup
```bash
cd server
npm run backup:db
# Writes timestamped gzip JSON snapshot to server/backups/ghf-backup-<timestamp>.json.gz
```
Store backups securely offline or in encrypted private storage (never commit `server/backups/` to GitHub). Recommended retention: weekly snapshots for 90 days + monthly snapshots for 1 year.

### Restore to a Separate Test Database (Safe Verification)
```bash
cd server
RESTORE_MONGODB_URI="mongodb+srv://.../ghf_portal_restore_test" npm run restore:db -- --file=backups/ghf-backup-....json.gz
```
`restoreDatabase.mjs` blocks restoring directly onto production `MONGODB_URI` unless `--allow-production-overwrite` is explicitly passed.

---

## 7. Known Free-Tier Limitations & Troubleshooting

- **Render Free Tier Cold Starts**: Spins down after ~15 minutes of inactivity (30–50s wake-up). The frontend uses a 45s timeout, warms up `/api/health`, and keeps unsubmitted payloads safely in `ghf_pending_submissions_v1` with automatic exponential-backoff retry.
- **Email Daily Quota**: Resend Free Tier enforces 100 emails/day; failed/throttled jobs remain in `SyncJob` (`status: 2`) and retry with backoff or manually via `/admin/integrations`.
- **Local Storage Scope**: Drafts (`ghf_assessment_draft_v1`) and pending queues (`ghf_pending_submissions_v1`) are stored per-browser only and do not sync across devices. On shared devices, clear drafts after completing or cancelling work.
- **401 on Admin Login in Production**: Confirm `CORS_ORIGINS` and `FRONTEND_URL` match the exact HTTPS frontend origin, `NODE_ENV=production` is set on Render, and use a same-site domain/proxy if testing on iOS Safari.
