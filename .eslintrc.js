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
  ],
  rules: {
    "@typescript-eslint/ban-types": "off",
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-inferrable-types": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-var-requires": 0,
    "node/no-callback-literal": 0,
    "comma-dangle": ["error", {
      arrays: "always-multiline",
      objects: "always-multiline",
      imports: "always-multiline",
      exports: "always-multiline",
      functions: "never",
    }],
    "no-console": process.env.NODE_ENV === "development" ? "off" : "warn",
    "no-debugger": process.env.NODE_ENV === "development" ? "off" : "warn",
    "no-empty": "error",
    "no-unused-vars": "off",
    "object-curly-spacing": ["error", "always", {
      arraysInObjects: false,
      objectsInObjects: false,
    }],
    "operator-linebreak": ["error", "before"],
    "quote-props": ["error", "as-needed"],
    "space-before-function-paren": 0,
    "vue/html-closing-bracket-newline": ["error", {
      singleline: "never",
      multiline: "never",
      selfClosingTag: {
        singleline: "never",
        multiline: "never",
      },
    }],
    "vue/singleline-html-element-content-newline": ["off"],
    "vue/first-attribute-linebreak": ["error", {
      singleline: "beside",
      multiline: "beside",
    }],
    "vue/max-attributes-per-line": "off",
    indent: ["error", 2],
    quotes: ["error", "double"],
    semi: ["error", "always"],
  },
};
