// vite.config.js
import { defineConfig } from "file:///C:/Users/retro/COMS%203/SDP/PrimeScore/frontend/node_modules/vite/dist/node/index.js";
import eslint from "file:///C:/Users/retro/COMS%203/SDP/PrimeScore/frontend/node_modules/vite-plugin-eslint/dist/index.mjs";
import react from "file:///C:/Users/retro/COMS%203/SDP/PrimeScore/frontend/node_modules/@vitejs/plugin-react-swc/index.js";
import { codecovVitePlugin } from "file:///C:/Users/retro/COMS%203/SDP/PrimeScore/frontend/node_modules/@codecov/vite-plugin/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    eslint({
      include: ["src/**/*.js", "src/**/*.jsx", "src/**/*.ts", "src/**/*.tsx"],
      exclude: ["node_modules", "dist"]
    }),
    codecovVitePlugin({
      enableBundleAnalysis: process.env.CODECOV_TOKEN !== void 0,
      bundleName: "<bundle project name>",
      uploadToken: process.env.CODECOV_TOKEN
    })
  ],
  build: {
    outDir: "dist"
  },
  server: {
    proxy: {
      "/api": "http://localhost:3000"
      // proxy backend during dev
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxyZXRyb1xcXFxDT01TIDNcXFxcU0RQXFxcXFByaW1lU2NvcmVcXFxcZnJvbnRlbmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXHJldHJvXFxcXENPTVMgM1xcXFxTRFBcXFxcUHJpbWVTY29yZVxcXFxmcm9udGVuZFxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvcmV0cm8vQ09NUyUyMDMvU0RQL1ByaW1lU2NvcmUvZnJvbnRlbmQvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xyXG5pbXBvcnQgZXNsaW50IGZyb20gJ3ZpdGUtcGx1Z2luLWVzbGludCdcclxuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0LXN3YydcclxuaW1wb3J0IHsgY29kZWNvdlZpdGVQbHVnaW4gfSBmcm9tIFwiQGNvZGVjb3Yvdml0ZS1wbHVnaW5cIjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgcGx1Z2luczogW1xyXG4gICAgcmVhY3QoKSxcclxuICAgIGVzbGludCh7XHJcbiAgICAgIGluY2x1ZGU6IFsnc3JjLyoqLyouanMnLCAnc3JjLyoqLyouanN4JywgJ3NyYy8qKi8qLnRzJywgJ3NyYy8qKi8qLnRzeCddLFxyXG4gICAgICBleGNsdWRlOiBbJ25vZGVfbW9kdWxlcycsICdkaXN0J10sXHJcbiAgICB9KSxcclxuICAgIFxyXG4gICAgY29kZWNvdlZpdGVQbHVnaW4oe1xyXG4gICAgICBlbmFibGVCdW5kbGVBbmFseXNpczogcHJvY2Vzcy5lbnYuQ09ERUNPVl9UT0tFTiAhPT0gdW5kZWZpbmVkLFxyXG4gICAgICBidW5kbGVOYW1lOiBcIjxidW5kbGUgcHJvamVjdCBuYW1lPlwiLFxyXG4gICAgICB1cGxvYWRUb2tlbjogcHJvY2Vzcy5lbnYuQ09ERUNPVl9UT0tFTixcclxuICAgIH0pLFxyXG4gIF0sXHJcbiAgYnVpbGQ6IHtcclxuICAgIG91dERpcjogJ2Rpc3QnLFxyXG4gIH0sXHJcbiAgc2VydmVyOiB7XHJcbiAgICBwcm94eToge1xyXG4gICAgICAnL2FwaSc6ICdodHRwOi8vbG9jYWxob3N0OjMwMDAnLCAvLyBwcm94eSBiYWNrZW5kIGR1cmluZyBkZXZcclxuICAgIH0sXHJcbiAgfSxcclxufSlcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF5VSxTQUFTLG9CQUFvQjtBQUN0VyxPQUFPLFlBQVk7QUFDbkIsT0FBTyxXQUFXO0FBQ2xCLFNBQVMseUJBQXlCO0FBRWxDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxNQUNMLFNBQVMsQ0FBQyxlQUFlLGdCQUFnQixlQUFlLGNBQWM7QUFBQSxNQUN0RSxTQUFTLENBQUMsZ0JBQWdCLE1BQU07QUFBQSxJQUNsQyxDQUFDO0FBQUEsSUFFRCxrQkFBa0I7QUFBQSxNQUNoQixzQkFBc0IsUUFBUSxJQUFJLGtCQUFrQjtBQUFBLE1BQ3BELFlBQVk7QUFBQSxNQUNaLGFBQWEsUUFBUSxJQUFJO0FBQUEsSUFDM0IsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxFQUNWO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixPQUFPO0FBQUEsTUFDTCxRQUFRO0FBQUE7QUFBQSxJQUNWO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
