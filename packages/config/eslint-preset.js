/** @type {import('eslint').Linter.Config} */
const base = {
  extends: ["eslint:recommended"],
  env: {
    node: true,
    es2022: true,
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  ignorePatterns: [
    "node_modules/",
    "dist/",
    ".next/",
    "build/",
    ".turbo/",
    "*.config.js",
    "*.config.ts",
  ],
};

/** @type {import('eslint').Linter.Config} */
const typescript = {
  ...base,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  parserOptions: {
    ...base.parserOptions,
    ecmaFeatures: { jsx: true },
    project: false,
  },
  env: {
    ...base.env,
    browser: true,
  },
  rules: {
    // Keep initial rollout lenient — these should tighten over time, not block CI today.
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": "warn",
    "no-console": "off",
    "no-undef": "off",
  },
};

module.exports = { base, typescript };
