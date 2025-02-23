import * as path from "node:path";

export const getPreloadDir = (...subDir: string[]): string => {
  return path.join(__dirname, ...subDir);
};
