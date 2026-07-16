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
    "b