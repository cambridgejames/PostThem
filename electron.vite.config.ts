import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin(),
    ],
  },
  preload: {
    plugins: [
      externalizeDepsPlugin(),
    ],
  },
  renderer: {
    root: resolve(__dirname, "./src/content"),
    build: {
      rollupOptions: {
        input: resolve(__dirname, "./src/content/index.html"),
      },
      outDir: resolve(__dirname, "./out/content"),
    },
    resolve: {
      alias: {
        "@content": resolve(__dirname, ".src/content"),
      },
    },
    plugins: [
      vue({
        template: {
          compilerOptions: {
            isCustomElement: tag => ["webview"].includes(tag),
          },
        },
      }),
    ],
  },
});
