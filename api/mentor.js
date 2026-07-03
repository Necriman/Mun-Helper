// Vercel serverless function — POST /api/mentor
// Vite's dev server doesn't run this; see vite.config.js for the local
// equivalent middleware so `npm run dev` also works without a Vercel deploy.
import { askMentor } from '../server/mentor-service.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const reply = await askMentor(req.body?.messages);
    res.status(200).json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
