import { defineConfig } from 'vite'
import eslint from 'vite-plugin-eslint';
import react from '@vitejs/plugin-react-swc'
import { codecovVitePlugin } from "@codecov/vite-plugin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    eslint({
      include: ['src/**/*.js', 'src/**/*.jsx', 'src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['node_modules', 'dist'],
    }),
    
    codecovVitePlugin({
      enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
      bundleName: "<bundle project name>",
      uploadToken: process.env.CODECOV_TOKEN,
    }),
  ],
})
