// /api/submit-lead.js
//
// Serverless function (Vercel-compatible) that receives quote requests
// from the website form, stores them as "leads", and sends an email
// notification to the business owner.
//
// DEPLOYMENT NOTES:
// 1. Deploy this whole project to Vercel (free tier works).
// 2. Add a Vercel Postgres (or any Postgres) database from the Vercel
//    dashboard -> Storage tab. It will auto-set the POSTGRES_* env vars.
// 3. Add a Resend.com API key (free tier: 100 emails/day) as RESEND_API_KEY
//    in your Vercel project's Environment Variables, to enable email alerts.
// 4. Set OWNER_EMAIL and OWNER_PHONE_FOR_SMS (optional) env vars.
//
// This function will still work WITHOUT email/SMS configured -- it just
// won't send notifications, but leads will still be saved to the database
// and visible in /dashboard.

import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, phone, email, address, service, details, source, page } = req.body || {};

    // Basic validation
    if (!name || !phone || !email || !service) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Ensure table exists (safe to run every time, only creates once)
    await sql`
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT NOT NULL,
        address TEXT,
        service TEXT NOT NULL,
        details TEXT,
        source TEXT,
        page TEXT,
        status TEXT DEFAULT 'new',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // Insert the lead
    const result = await sql`
      INSERT INTO leads (name, phone, email, address, service, details, source, page)
      VALUES (${name}, ${phone}, ${email}, ${address || ''}, ${service}, ${details || ''}, ${source || ''}, ${page || ''})
      RETURNING id, created_at;
    `;

    const lead = result.rows[0];

    // Send email notification to the business owner (optional, non-blocking)
    if (process.env.RESEND_API_KEY && process.env.OWNER_EMAIL) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Lead Notifications <leads@yourdomain.com>',
            to: process.env.OWNER_EMAIL,
            subject: `New Quote Request: ${service} (${name})`,
            html: `
              <h2>New lead from the website</h2>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Phone:</strong> ${phone}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Address:</strong> ${address || 'Not provided'}</p>
              <p><strong>Service:</strong> ${service}</p>
              <p><strong>Details:</strong> ${details || 'None'}</p>
              <p><strong>Lead ID:</strong> #${lead.id}</p>
              <p><a href="https://yourdomain.com/dashboard">View in dashboard</a></p>
            `
          })
        });
      } catch (emailErr) {
        console.error('Email notification failed:', emailErr);
        // Don't fail the request just because email didn't send
      }
    }

    return res.status(200).json({ success: true, leadId: lead.id });
  } catch (err) {
    console.error('Error saving lead:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
