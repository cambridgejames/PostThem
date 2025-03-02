import * as path from "node:path";

const ELECTRON_ASAR_FILE_NAME: string = "app.asar";
const ELECTRON_RENDERER_DIR_NAME: string = "content";

/**
 * 获取preload脚本所在的目录
 *
 * @param {string} subDir 待拼接的子目录
 * @returns {string} 目录
 */
export const getPreloadDir = (...subDir: string[]): string => {
  return path.join(__dirname, ...subDir);
};

/**
 * 获取渲染进程静态资源对应的URL
 *
 * @param {string} subDir 静态资源所在子目录
 * @returns {string} 静态资源URL
 */
export const getPublicDir = (...subDir: string[]): string => {
  if (process.env["ELECTRON_RENDERER_URL"]) {
    return `/${subDir.join("/")}`;
  }
  if (__dirname.includes(ELECTRON_ASAR_FILE_NAME)) {
    return path.join(__dirname.substring(0, __dirname.indexOf(ELECTRON_ASAR_FILE_NAME)), ...subDir);
  }
  return path.join(__dirname, "..", ELECTRON_RENDERER_DIR_NAME, ...subDir);
};
