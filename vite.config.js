import { defineConfig } from 'vite';

export default defineConfig({
  base: '/Bone_Cycle/',
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
});
