import { resolve } from "path";
import { bytecodePlugin, defineConfig, externalizeDepsPlugin } from "electron-vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin(),
    ],
    resolve: {
      alias: {
        "@main": resolve(__dirname, "./src/main"),
        "@common": resolve(__dirname, "./src/common"),
        "@interface": resolve(__dirname, "./src/interface"),
        "@sdk": resolve(__dirname, "./resources/sdk"),
      },
    },
  },
  preload: {
    plugins: [
      externalizeDepsPlugin(),
      bytecodePlugin(),
    ],
    build: {
      rollupOptions: {
        input: {
          mainWindow: resolve(__dirname, "./src/preload/mainWindow"),
          pluginWindow: resolve(__dirname, "./src/preload/pluginProcess"),
        },
      },
    },
    resolve: {
      alias: {
        "@preload": resolve(__dirname, "./src/preload"),
        "@common": resolve(__dirname, "./src/common"),
        "@interface": resolve(__dirname, "./src/interface"),
        "@sdk": resolve(__dirname, "./resources/sdk"),
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
