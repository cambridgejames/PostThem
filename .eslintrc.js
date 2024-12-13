/* eslint-env node */
require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:vue/vue3-essential",
    "plugin:vue/vue3-recommended",
    "@electron-toolkit",
    "@electron-toolkit/eslint-config-ts/eslint-recommended",
    "@vue/eslint-config-typescript/recommended",
    "@vue/typescript/recommended",
  ],
  rules: {
    "@typescript-eslint/no-inferrable-types": "off",
    "@typescript-eslint/ban-types": "off",
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    "node/no-callback-literal": 0,
    indent: ["error", 2],
    "space-before-function-paren": 0,
    quotes: ["error", "double"],
    "quote-props": ["error", "as-needed"],
    semi: ["error", "always"],
    "no-empty": "error",
    "no-unused-vars": "off",
    "operator-linebreak": ["error", "before"],
    "@typescript-eslint/no-var-requires": 0,
  },
};
