import { defineConfig } from 'vite'
import eslint from 'vite-plugin-eslint'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [
    react(),
    eslint({
      include: ['src/**/*.js', 'src/**/*.jsx', 'src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['node_modules', 'dist'],
    }),
  ],
  build: {
    outDir: 'dist',
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000', // proxy backend during dev
    },
  },
})
