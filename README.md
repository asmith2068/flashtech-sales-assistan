# FlashTech Sales Assistant

Sales call tracker for Flash-Tech Mfg, Inc.  
Built for the sales team to log calls, manage tasks, track expenses, and report to management.

---

## QUICK DEPLOY (30 minutes)

### What You Need First
- A computer with **Node.js 18+** installed → [nodejs.org](https://nodejs.org)
- **Git** installed → [git-scm.com](https://git-scm.com)
- A free **GitHub** account → [github.com](https://github.com)

---

### STEP 1: Set Up the Database (Supabase — FREE)

1. Go to [supabase.com](https://supabase.com) and sign up with GitHub
2. Click **New Project** → name it `flashtech-sales`
3. Pick a strong database password (save it!)
4. Select the **West US** region and click **Create**
5. Wait ~2 minutes for it to spin up
6. Go to **SQL Editor** in the left sidebar
7. Click **New Query**
8. Open the file `database-setup.sql` from this folder, copy ALL the contents, paste it in
9. Click **Run** — you should see ✅ Success
10. Go to **Settings → API** in the sidebar
11. Copy your **Project URL** (starts with `https://`)
12. Copy your **anon public key** (starts with `eyJ`)
13. Save both — you'll need them in Step 2

---

### STEP 2: Set Up the Project

1. Unzip this folder onto your Desktop
2. Open **Terminal** (Mac) or **Command Prompt** (Windows)
3. Navigate to the folder:
   ```
   cd Desktop/flashtech-sales-assistant
   ```
4. Install dependencies:
   ```
   npm install
   ```
5. Create your environment file:
   - Copy `.env.example` to a new file called `.env.local`
   - Replace the placeholder values with your Supabase URL and key:
   ```
   VITE_SUPABASE_URL=https://abcdefg.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
   ```
6. Test it locally:
   ```
   npm run dev
   ```
7. Open http://localhost:5173 in your browser — you should see the login screen!

---

### STEP 3: Deploy to the Web (Vercel — FREE)

1. Push your code to GitHub:
   ```
   git init
   git add .
   git commit -m "FlashTech Sales Assistant"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/flashtech-sales-assistant.git
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) and sign up with GitHub
3. Click **Add New Project**
4. Import your `flashtech-sales-assistant` repo
5. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key
6. Click **Deploy**
7. In ~60 seconds you'll get a live URL like: `flashtech-sales-assistant.vercel.app`

**That URL is your app!** Share it with your team.

---

### STEP 4: Install on Devices

**iPhone/iPad:** Open Safari → tap Share → "Add to Home Screen"  
**Android:** Open Chrome → tap ⋮ menu → "Add to Home screen"  
**Windows/Mac:** Open Chrome → click install icon in address bar  

---

## Login Credentials

| Username | Password | Role |
|----------|----------|------|
| admin    | admin    | Manager |
| jake     | 1234     | Sales Rep |
| sarah    | 1234     | Sales Rep |
| mike     | 1234     | Sales Rep |

⚠️ **Change these passwords before going live!**

---

## Features

- **Contacts** — Customer database with company, contact, phone, address, notes
- **Sales Calls** — Log who, what, where, when, products discussed, outcome, follow-up
- **Tasks** — Quote orders, send samples, schedule meetings, follow-up calls
- **Calendar** — Monthly view of events, meetings, site visits, trade shows
- **Vehicle & Gas** — Fuel log with price/gal, gallons, total, mileage + maintenance
- **Expenses** — Who, what, where, when, category, receipt tracking
- **Reports** — Print daily, weekly, monthly, or yearly reports for any tab
- **Manager View** — See all reps' data, overdue task alerts, team overview
- **Notifications** — Bell icon alerts for overdue tasks

---

## Support

Questions? Paste any error messages to Claude and describe where you got stuck.

Flash-Tech Mfg, Inc.  
215 Denny Way Suite D, El Cajon, CA 92020  
(619) 334-9491 | sales@flash-techinc.com
