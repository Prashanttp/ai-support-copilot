import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import handler from './api/analyze';

// Vite dev server middleware to simulate Vercel serverless function /api/analyze locally
function vercelApiDevPlugin(): Plugin {
  return {
    name: 'vercel-api-dev-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.startsWith('/api/analyze')) {
          // Collect request body
          const chunks: any[] = [];
          req.on('data', chunk => chunks.push(chunk));
          req.on('end', async () => {
            const bodyStr = Buffer.concat(chunks).toString('utf-8');
            let parsedBody = {};
            try {
              if (bodyStr) parsedBody = JSON.parse(bodyStr);
            } catch {
              parsedBody = {};
            }

            // Create response mock compatible with Vercel handler
            const mockRes = {
              statusCode: 200,
              headers: {} as Record<string, string>,
              setHeader(key: string, value: string) {
                this.headers[key] = value;
                res.setHeader(key, value);
              },
              status(code: number) {
                this.statusCode = code;
                res.statusCode = code;
                return this;
              },
              json(data: any) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
              },
              end(data?: any) {
                res.end(data);
              }
            };

            const mockReq = {
              method: req.method,
              body: parsedBody,
              query: {},
              headers: req.headers
            };

            try {
              await handler(mockReq, mockRes);
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
            }
          });
          return;
        }
        next();
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), vercelApiDevPlugin()],
  // @ts-expect-error vitest config
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  }
});
