import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

const rawBase = process.env.VITE_BASE_PATH || '/';
const basePath = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;

function adminRouteRewrite() {
  const rewrite = (req, _res, next) => {
    const adminPath = `${basePath}admin`;
    if (req.url === adminPath || req.url === `${adminPath}/`) {
      req.url = `${basePath}admin.html`;
    }
    next();
  };

  return {
    name: 'admin-route-rewrite',
    configureServer(server) {
      server.middlewares.use(rewrite);
    },
    configurePreviewServer(server) {
      server.middlewares.use(rewrite);
    },
  };
}

export default defineConfig({
  base: basePath,
  plugins: [tailwindcss(), adminRouteRewrite()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin.html'),
      },
    },
  },
});
