import { defineConfig } from 'vite';

export default defineConfig({
  base: './',            // build chạy được cả khi đặt trong thư mục con
  server: { port: 5173, open: true },
  build: { outDir: 'dist', sourcemap: false },
});
