import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import electron from "vite-plugin-electron"
import { builtinModules } from "module" // <--- Import strictly here

export default defineConfig({
  plugins: [
    react(),
    electron({
      entry: ['electron/main.js', 'electron/preload.js'],
      onstart(options) {
        options.startup()
      },
      vite: {
        build: {
          outDir: 'dist-electron',
          rollupOptions: {
            // <--- Use the imported variable instead of require()
            external: ['electron', ...builtinModules], 
          },
        },
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})