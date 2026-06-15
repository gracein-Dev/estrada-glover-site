# Estrada-Glover Gutters — Website + Lead System

This project includes:

- `/public/index.html` — the marketing website (homepage)
- `/dashboard/index.html` — password-protected lead dashboard
- `/api/submit-lead.js` — receives quote form submissions, saves to database, emails owner
- `/api/leads.js` — feeds the dashboard, lets you update lead status

## What you need to fill in before going live

Search the HTML files for these placeholders and replace with real info:

- Phone number: `(604) 555-0199` / `+16045550199`
- Email: `info@estradaglovergroup.example`
- Service area, address, business name details if different

## Deploying (free tier, ~15 minutes)

1. **Create a free Vercel account** at vercel.com (sign in with GitHub).
2. **Push this project to a GitHub repo**, then import it in Vercel
   ("Add New Project" → select the repo). Vercel auto-detects the
   serverless functions in `/api`.
3. **Add a database**: In your Vercel project, go to the *Storage* tab →
   *Create Database* → choose Postgres. This automatically sets the
   `POSTGRES_*` environment variables the API code needs — no extra
   config required.
4. **Set environment variables** (Project Settings → Environment Variables):
   - `DASHBOARD_TOKEN` — make up a password, e.g. `eg-gutters-2026` —
     this protects your dashboard at `/dashboard?token=YOUR_TOKEN`
   - `OWNER_EMAIL` — the email that should get notified of new leads
   - `RESEND_API_KEY` — *(optional)* sign up free at resend.com (100
     emails/day free) to enable instant email notifications on new leads.
     Without this, leads still save to the dashboard, just no email alert.
5. **Redeploy** after adding env vars (Vercel does this automatically on
   save, or trigger a redeploy from the dashboard).
6. **Connect your domain**: in Project Settings → Domains, add
   `estradaglovergroup.com` and follow the DNS instructions (point your
   domain's DNS to Vercel — they walk you through it).

## Using the dashboard

Visit `https://yourdomain.com/dashboard?token=YOUR_DASHBOARD_TOKEN`
(use the value you set for `DASHBOARD_TOKEN`). You'll see:

- All leads, newest first
- Click-to-call and click-to-email on every lead
- A status dropdown (New / Contacted / Booked / Closed) to track your pipeline
- An "Export CSV" button to download all leads for spreadsheets or a CRM
- Auto-refreshes every 60 seconds

## How the quote form works

When a visitor submits the form:

1. It's saved to your Postgres database immediately (so it's never lost)
2. If `RESEND_API_KEY` + `OWNER_EMAIL` are set, you get an email instantly
3. The visitor sees a confirmation message on the page
4. If the server is unreachable for any reason, the form falls back to
   opening a pre-filled email so the lead still reaches you

## Call buttons

All "Call" buttons and the sticky mobile bar use `tel:` links — on phones
these open the dialer immediately with the number pre-filled. No setup
needed.

## Next steps / upgrades you might want later

- Add real photos to the gallery section (currently placeholders)
- SMS notifications on new leads (Twilio — a few cents per text)
- Connect the dashboard's "Booked" status to a calendar/scheduling tool
- Add Google Analytics or a simple visit counter to track traffic
