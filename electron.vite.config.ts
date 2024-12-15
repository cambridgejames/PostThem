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
    resolve: {
      alias: {
        "@preload": resolve(__dirname, "./src/preload"),
        "@interface": resolve(__dirname, "./src/interface"),
      },
    },
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
        "@content": resolve(__dirname, "./src/content"),
        "@interface": resolve(__dirname, "./src/interface"),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern",
          additionalData: "@use '@content/assets/mixin.scss';",
        },
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
