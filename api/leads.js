// /api/leads.js
//
// Returns all leads as JSON, for the dashboard to display.
// Protected by a simple shared-secret token (DASHBOARD_TOKEN env var)
// passed as a query param: /api/leads?token=YOUR_TOKEN
//
// Also supports updating a lead's status:
// POST /api/leads with { id, status, token }

import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  const token = req.method === 'GET' ? req.query.token : req.body?.token;

  if (!process.env.DASHBOARD_TOKEN) {
    return res.status(500).json({ error: 'DASHBOARD_TOKEN not configured on server' });
  }

  if (token !== process.env.DASHBOARD_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const result = await sql`
        SELECT id, name, phone, email, address, service, details, status, source, created_at
        FROM leads
        ORDER BY created_at DESC;
      `;
      return res.status(200).json({ leads: result.rows });
    } catch (err) {
      console.error('Error fetching leads:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { id, status } = req.body;
      if (!id || !status) {
        return res.status(400).json({ error: 'Missing id or status' });
      }
      await sql`UPDATE leads SET status = ${status} WHERE id = ${id};`;
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('Error updating lead:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: 'Method not allowed' });
}
