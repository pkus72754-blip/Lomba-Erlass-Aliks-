import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

function sb3ProxyPlugin(): Plugin {
  return {
    name: 'sb3-proxy-plugin',
    configureServer(server) {
      server.middlewares.use('/api/sb3-proxy', async (req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', '*');

        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          res.end();
          return;
        }

        try {
          const urlObj = new URL(req.url!, 'http://localhost:3000');
          let fileId = urlObj.searchParams.get('id');
          const queryUrl = urlObj.searchParams.get('url');

          if (!fileId && queryUrl) {
            const match = queryUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || queryUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
            if (match) fileId = match[1];
          }

          if (!fileId) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Missing id parameter' }));
            return;
          }

          const targetUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
          const gResponse = await fetch(targetUrl, { redirect: 'follow' });
          if (!gResponse.ok) {
            res.statusCode = gResponse.status;
            res.end(JSON.stringify({ error: 'Failed to fetch from Google Drive' }));
            return;
          }

          const buffer = await gResponse.arrayBuffer();
          res.setHeader('Content-Type', 'application/x.scratch.sb3');
          res.setHeader('Content-Disposition', `attachment; filename="project_${fileId}.sb3"`);
          res.statusCode = 200;
          res.end(Buffer.from(buffer));
        } catch (err: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err?.message || 'Proxy error' }));
        }
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), sb3ProxyPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname ?? '.', '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
