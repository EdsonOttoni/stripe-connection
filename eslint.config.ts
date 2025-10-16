import globals from "globals";
import tseslint from "typescript-eslint";
import json from "@eslint/json";
import prettier from "eslint-plugin-prettier";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: ["node_modules", "dist", "build"],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    languageOptions: {
      globals: globals.node,
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json",
        sourceType: "module",
        ecmaVersion: "latest",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      prettier,
    },
    rules: {
      // Prettier cuida da estilização (indentação, aspas, etc)
      "prettier/prettier": "warn",
      // Aviso para uso de `any`
      "@typescript-eslint/no-explicit-any": "warn",
      // Variáveis não usadas
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // Não forçar tipagem explícita em bordas de módulo/funções
      "@typescript-eslint/explicit-module-boundary-types": "off",
    },
  },
  // Config para JSON
  {
    files: ["**/*.json"],
    plugins: { json },
    language: "json/json",
  },
]);
