import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { askMentor } from './server/mentor-service.js';

/**
 * Dev-only middleware standing in for the Vercel serverless function at
 * api/mentor.js — `vite dev` never runs /api routes, so without this the
 * AI Mentor chat would 404 locally and only work after deploying to Vercel.
 */
function mentorDevMiddleware(env) {
  return {
    name: 'mentor-dev-middleware',
    configureServer(server) {
      server.middlewares.use('/api/mentor', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }
        try {
          let body = '';
          for await (const chunk of req) body += chunk;
          const { messages } = JSON.parse(body || '{}');

          // loadEnv doesn't touch the real process.env, so set it just for
          // this call — mirrors how Vercel injects GEMINI_API_KEY at runtime.
          process.env.GEMINI_API_KEY ??= env.GEMINI_API_KEY;

          const reply = await askMentor(messages);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ reply }));
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), mentorDevMiddleware(env)],
  };
});
