// eslint.config.mjs
import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';
import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default defineConfig([
  globalIgnores(['**/node_modules', '**/dist']),
  {
    name: 'eslint-js-recommended-rules',
    plugins: { js },
    extends: ['js/recommended'],
  },
  ...tseslint.configs.recommended.map((conf) => ({
    ...conf,
    files: ['**/*.ts', '**/*.tsx'],
  })),
  eslintPluginPrettierRecommended,
  {
    name: 'react',
    ...react.configs.flat.recommended,
  },
  reactHooks.configs['recommended-latest'],
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslintPlugin,
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
]);
