# Hostinger Deployment Guide
## Free Quranic Learning Portal — Next.js 16 + MySQL

---

## Table of Contents

1. [Requirements](#1-requirements)
2. [Before You Upload Anything](#2-before-you-upload-anything)
3. [Hostinger — Database Setup](#3-hostinger--database-setup)
4. [Hostinger — Node.js App Setup](#4-hostinger--nodejs-app-setup)
5. [Upload the Project](#5-upload-the-project)
6. [Environment Variables](#6-environment-variables)
7. [Run Migrations & Seed the Admin](#7-run-migrations--seed-the-admin)
8. [Build & Start the App](#8-build--start-the-app)
9. [Cron Jobs](#9-cron-jobs)
10. [Domain & SSL](#10-domain--ssl)
11. [Uploads Folder Persistence](#11-uploads-folder-persistence)
12. [Smoke Test Checklist](#12-smoke-test-checklist)
13. [Troubleshooting](#13-troubleshooting)

---

## 1. Requirements

| Requirement | Minimum |
|---|---|
| **Hostinger plan** | Business Web Hosting or VPS (Node.js support required) |
| **Node.js version** | 20 LTS (Next.js 16 requires Node ≥ 18.18) |
| **MySQL version** | 8.0+ (MariaDB 10.6+ also works) |
| **RAM** | 512 MB minimum, 1 GB recommended |

> **Check your plan:** In hPanel go to **Websites → Manage → Node.js**. If that menu item does not exist, your plan does not support Node.js — you will need to upgrade.

---

## 2. Before You Upload Anything

Do all of these on your **local machine** before touching the server.

### 2a. Generate a production SESSION_SECRET

Open a terminal and run:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output — you will paste it into hPanel as `SESSION_SECRET`.

### 2b. Generate a CRON_SECRET

```bash
node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"
```

Copy the output — you will use it in both hPanel env vars and the cron job URL.

### 2c. Verify the local build passes

```bash
npm run build
```

The build must complete with **no errors** before you deploy. Fix any errors locally first.

### 2d. Decide on your SMTP provider

The app uses **Nodemailer** — it works with any standard SMTP server:

| Provider | Free tier | SMTP host |
|---|---|---|
| **Hostinger Email** | Free with hosting plan | `smtp.hostinger.com` |
| **Gmail** | 500/day (App Password required) | `smtp.gmail.com` |
| **Brevo (Sendinblue)** | 300/day | `smtp-relay.brevo.com` |
| **Mailgun** | 100/day | `smtp.mailgun.org` |

The simplest choice is **Hostinger's own email** — create a mailbox in hPanel under **Emails → Email Accounts**, then use those credentials.

---

## 3. Hostinger — Database Setup

### 3a. Create a MySQL database

1. In hPanel go to **Databases → MySQL Databases**
2. Click **Create a New MySQL Database**
3. Fill in:
   - **Database name:** `quran_learning` (or any name you choose)
   - **Username:** create a dedicated user
   - **Password:** use a strong password — save it somewhere safe
4. Click **Create**
5. Under **MySQL Databases**, click **phpMyAdmin** next to your new database — confirm it opens and is empty

### 3b. Note your connection details

You will need:

```
Host:     localhost   (or the remote host shown in hPanel — usually localhost)
Port:     3306
Database: u123456789_quran_learning   (hPanel prefixes with your account ID)
Username: u123456789_youruser
Password: (what you set above)
```

The full `DATABASE_URL` format for this app is:

```
mysql://USERNAME:PASSWORD@HOST:3306/DATABASE_NAME
```

Example:
```
mysql://u123456789_qluser:MyStr0ngP4ss@localhost:3306/u123456789_quran_learning
```

---

## 4. Hostinger — Node.js App Setup

1. In hPanel go to **Websites → Manage → Node.js**
2. Click **Create Application**
3. Set:
   - **Node.js version:** `20.x` (or the highest LTS available)
   - **Application mode:** `Production`
   - **Application root:** `/` (or the subfolder where you will upload the project)
   - **Application URL:** your domain (e.g. `yourdomain.com`)
   - **Application startup file:** `node_modules/.bin/next` (if prompted — see step 8)
4. Click **Create**

> Hostinger will show you the application path (e.g. `/home/u123456789/domains/yourdomain.com/public_html`). This is where you will upload your files.

---

## 5. Upload the Project

### Option A — Git (recommended)

If you have a private GitHub/GitLab repository:

1. In hPanel, open the **Terminal** (or connect via SSH: `ssh u123456789@yourdomain.com`)
2. Navigate to your application directory:
   ```bash
   cd ~/domains/yourdomain.com/public_html
   ```
3. Clone your repo:
   ```bash
   git clone https://github.com/youruser/quran-learning-app.git .
   ```
4. Install dependencies (production only — no devDependencies):
   ```bash
   npm install --omit=dev
   ```

### Option B — SFTP / File Manager

1. Open **hPanel → File Manager** (or use an SFTP client like FileZilla)
2. Navigate to your application root (e.g. `~/domains/yourdomain.com/public_html`)
3. Upload your **entire project folder** — including `prisma/`, `app/`, `lib/`, `components/`, `public/`, `package.json`, `package-lock.json`, and `next.config.ts`
4. **Do NOT upload** `node_modules/`, `.next/`, or `.env` — these are generated/secret
5. After upload, open the **Terminal** in hPanel and run:
   ```bash
   cd ~/domains/yourdomain.com/public_html
   npm install --omit=dev
   ```

---

## 6. Environment Variables

### 6a. Set them in hPanel

1. In hPanel go to **Websites → Manage → Node.js**
2. Click your application → **Environment Variables**
3. Add **each variable** from the table below one by one

| Variable | Value | Notes |
|---|---|---|
| `DATABASE_URL` | `mysql://user:pass@localhost:3306/dbname` | From step 3b |
| `SESSION_SECRET` | *(the base64 string from step 2a)* | Never share this |
| `NEXT_PUBLIC_BASE_URL` | `https://yourdomain.com` | No trailing slash |
| `ADMIN_EMAIL` | `admin@yourdomain.com` | Super admin login email |
| `ADMIN_PASSWORD` | *(strong password)* | Used once for seeding |
| `SMTP_HOST` | `smtp.hostinger.com` | Or your chosen provider |
| `SMTP_PORT` | `465` | |
| `SMTP_SECURE` | `true` | |
| `SMTP_USER` | `noreply@yourdomain.com` | The mailbox you created |
| `SMTP_PASS` | *(mailbox password)* | |
| `SMTP_FROM` | `Quran Learning <noreply@yourdomain.com>` | |
| `CRON_SECRET` | *(the hex string from step 2b)* | |
| `NODE_ENV` | `production` | |

### 6b. Create a .env file on the server (alternative)

If hPanel does not support setting env vars through the UI, create a `.env` file directly in your application root via the Terminal:

```bash
nano ~/domains/yourdomain.com/public_html/.env
```

Paste all variables in `KEY="value"` format, save, and exit (`Ctrl+X → Y → Enter`).

> **Security:** Make sure `.env` is not publicly accessible. Your app root should be above `public_html` or the web server should be configured to block `.env` files. Hostinger's Node.js setup handles this correctly by default.

---

## 7. Run Migrations & Seed the Admin

Open the hPanel Terminal and run these three commands **in order**:

```bash
cd ~/domains/yourdomain.com/public_html

# 1. Generate the Prisma client for production
npm run db:generate

# 2. Create all database tables
npm run db:migrate

# 3. Create the Super Admin account
npm run db:seed
```

**Expected output for step 2:**
```
Prisma Migrate: Applied X migration(s)
```

**Expected output for step 3:**
```
Super Admin ready: admin@yourdomain.com
```

> Run `npm run db:seed` only **once**. Running it again is safe (it uses `upsert`) but unnecessary.

---

## 8. Build & Start the App

### 8a. Build

Still in the Terminal:

```bash
cd ~/domains/yourdomain.com/public_html
npm run build
```

This takes 1–3 minutes. You will see a summary of pages and their sizes at the end. If the build fails, read the error — it is almost always a missing environment variable.

### 8b. Start via hPanel

1. In hPanel go to **Websites → Manage → Node.js**
2. Click **Restart** (or **Start** if the app is not running)
3. Set the **startup command** to:
   ```
   npm run start
   ```
   If hPanel asks for a startup **file** instead of a command, enter:
   ```
   node_modules/.bin/next
   ```
   With arguments: `start`

### 8c. Verify it is running

Open `https://yourdomain.com` in your browser. You should see the landing page. If you see a 502 error, check the application logs in hPanel (**Node.js → Logs**).

---

## 9. Cron Jobs

The app has two cron routes that must be called every 15 minutes.

### 9a. Set up in hPanel

1. In hPanel go to **Advanced → Cron Jobs**
2. Add the following two cron jobs, both with the schedule **Every 15 minutes** (`*/15 * * * *`):

**Cron job 1 — Class reminders:**
```bash
curl -s -H "Authorization: Bearer YOUR_CRON_SECRET" https://yourdomain.com/api/cron/class-reminders
```

**Cron job 2 — Auto-complete sessions:**
```bash
curl -s -H "Authorization: Bearer YOUR_CRON_SECRET" https://yourdomain.com/api/cron/complete-sessions
```

Replace `YOUR_CRON_SECRET` with the exact value you set for the `CRON_SECRET` environment variable.

### 9b. Test manually

Run these in the Terminal to confirm both routes respond correctly:

```bash
curl -s -H "Authorization: Bearer YOUR_CRON_SECRET" https://yourdomain.com/api/cron/complete-sessions
# Expected: {"completed":0}

curl -s -H "Authorization: Bearer YOUR_CRON_SECRET" https://yourdomain.com/api/cron/class-reminders
# Expected: {"sessionsProcessed":0,"notificationsCreated":0}
```

If you get `{"error":"Unauthorized"}`, the `CRON_SECRET` env var does not match — double-check both values.

---

## 10. Domain & SSL

### 10a. Point your domain

If your domain is registered with Hostinger, it is already pointed at your hosting. If it is registered elsewhere, update the nameservers at your registrar to Hostinger's:

```
ns1.dns-parking.com
ns2.dns-parking.com
```

DNS propagation takes up to 24 hours.

### 10b. Enable SSL (HTTPS)

1. In hPanel go to **Websites → Manage → SSL**
2. Click **Install** next to the **Lifetime Free SSL** option
3. Wait 5–10 minutes for the certificate to be issued
4. Confirm `https://yourdomain.com` loads with a padlock

> SSL must be active before real users log in — all session cookies are set with `secure: true` in production.

---

## 11. Uploads Folder Persistence

Teacher-uploaded files are stored in `public/uploads/` inside your application root. This folder **must not be deleted** when you redeploy.

### On every future deployment:

Before overwriting files with a new version, **back up the uploads folder**:

```bash
cp -r ~/domains/yourdomain.com/public_html/public/uploads ~/uploads_backup_$(date +%Y%m%d)
```

After deploying the new code, restore it:

```bash
cp -r ~/uploads_backup_YYYYMMDD/* ~/domains/yourdomain.com/public_html/public/uploads/
```

If using Git, add `public/uploads/` to `.gitignore` (it should already be there or add it now) so the folder is never overwritten by a `git pull`.

---

## 12. Smoke Test Checklist

Go through each item after deployment:

- [ ] Landing page loads at `https://yourdomain.com`
- [ ] `/courses` shows live courses from the database (not a hardcoded list)
- [ ] Registration creates an account and redirects to the correct dashboard
- [ ] Login works for Super Admin with the credentials from `ADMIN_EMAIL` / `ADMIN_PASSWORD`
- [ ] Admin dashboard shows user and enrollment counts
- [ ] Admin can create a course → it appears in `/courses`
- [ ] Admin can issue a certificate → student sees it and the PDF downloads correctly
- [ ] Teacher can upload a resource (file upload) → it appears in `/admin/resources`
- [ ] Admin can delete a resource from `/admin/resources`
- [ ] Teacher clicks "Go Live" → session status becomes LIVE, Jitsi room URL is generated
- [ ] Student sees "Join Class" button when session is LIVE
- [ ] Forgot Password sends an email (check spam if not received)
- [ ] Cron routes return `200 OK` with the `CRON_SECRET` header
- [ ] Language switcher (EN / UR / AR) changes the UI language

---

## 13. Troubleshooting

### App shows 502 Bad Gateway

The Node.js process crashed or did not start. Check:
```bash
# View logs in hPanel → Node.js → Logs
# Or in terminal:
cat ~/domains/yourdomain.com/logs/error.log
```
Most common cause: a missing environment variable. Verify all 13 vars from step 6 are set.

### Database connection refused

- Confirm `DATABASE_URL` is correct (host, port, username, password, database name)
- In Hostinger shared hosting, the host is always `localhost`
- Run `npm run db:generate` again after changing `DATABASE_URL`

### Build fails with "Cannot find module"

```bash
rm -rf node_modules .next
npm install
npm run build
```

### Prisma migration fails

Check that the database user has `CREATE`, `ALTER`, `DROP`, and `INSERT` permissions. In hPanel → Databases → MySQL Databases, edit the user's privileges and grant all permissions.

### File uploads return 413 (Request Entity Too Large)

Hostinger's default Nginx upload limit is 50 MB. If you need larger uploads, contact Hostinger support to raise the limit, or add an `.htaccess` rule:
```
php_value upload_max_filesize 100M
php_value post_max_size 100M
```
Note: For Node.js apps this is controlled at the Nginx proxy level — a support ticket is the most reliable fix.

### Emails not sending

1. Confirm SMTP credentials by testing in a tool like [smtp4dev](https://github.com/rnwood/smtp4dev) locally
2. In dev mode, emails are **not sent** — the reset link is printed to the console. On production, SMTP vars must be set
3. Check spam folder — add `noreply@yourdomain.com` to your SPF/DKIM records in hPanel → **Email → DNS Records**

### PDF certificate download fails

The `/api/certificate/[id]/pdf` route requires the user to be logged in. If the download fails, confirm the session cookie is present (the user is authenticated). If the route returns 500, check that `@react-pdf/renderer` is in `node_modules` on the server.

---

## Quick Reference — All Commands

```bash
# Install dependencies (production)
npm install --omit=dev

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed Super Admin (once only)
npm run db:seed

# Build the app
npm run build

# Start the app
npm run start
```

---

*Last updated: 2026-07-24*
