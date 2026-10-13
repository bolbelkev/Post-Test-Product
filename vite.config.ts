import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, type ViteDevServer} from 'vite';
import { config as loadEnvironment } from 'dotenv';
import { createHandler } from './server/http.ts';

loadEnvironment({ path: '.env.local', quiet: true });

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), {
      name: 'local-database-api',
      configureServer(server: ViteDevServer) {
        const handler = createHandler();
        server.middlewares.use((req: import('node:http').IncomingMessage, res: import('node:http').ServerResponse, next: () => void) => {
          if (req.url?.startsWith('/api/')) void handler(req, res);
          else next();
        });
      },
    }],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
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
