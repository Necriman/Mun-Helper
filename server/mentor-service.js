/**
 * AI Delegate Mentor — pure business logic, deliberately framework-agnostic
 * so it can be called from both:
 *   - api/mentor.js       (Vercel serverless function, production)
 *   - vite.config.js      (dev-only middleware, so `npm run dev` works too —
 *                          Vercel functions don't run under plain `vite dev`)
 *
 * GEMINI_API_KEY is read from process.env — NEVER pass it through a
 * VITE_-prefixed variable, that would inline it into the public JS bundle.
 */

const MODEL = 'gemini-2.5-flash';

const SYSTEM_PROMPT = `You are the Mun Helper AI Delegate Mentor — a personal Model UN
preparation coach for registered delegates in Uzbekistan. Help with position papers,
rules of procedure, public speaking, bloc strategy, and country research. Be concise,
practical, and encouraging. If asked about something outside MUN preparation, gently
redirect back to how it could relate to their delegate prep.`;

/**
 * @param {{role: 'user'|'model', content: string}[]} messages
 * @returns {Promise<string>} the mentor's reply text
 */
export async function askMentor(messages) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error('messages must be a non-empty array.');
  }

  const contents = messages.map((m) => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }],
  }));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
      }),
    },
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message ?? `Gemini API error (${response.status})`);
  }

  const reply = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ?? '';
  if (!reply) throw new Error('Gemini returned an empty response.');
  return reply;
}
