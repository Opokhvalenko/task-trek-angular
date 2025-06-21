import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import path from 'path';
import { fileURLToPath } from 'url';
import templateParserModule from '@angular-eslint/template-parser';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({ baseDirectory: __dirname });

const templateParser = templateParserModule.default || templateParserModule;

const tseslintParser = require('@typescript-eslint/parser');
const prettierPlugin = require('eslint-plugin-prettier');

export default [
  {
    ignores: [
      '**/node_modules/',
      '**/dist/',
      '**/*.d.ts',
      '**/test.ts',
      '**/polyfills.ts',
      '**/*.spec.ts',
      'src/main.ts',
      '**/.angular/',
      '**/*.json',
      '**/*.scss',
      '**/*.css',
      '**/*.jsonc',
      '**/*.json5',
      '**/*.lock',
      '**/*.md',
      '**/.vscode/**',
      '**/*.json',
      'angular.json',
      'package.json',
      'tsconfig*.json',
    ],
  },

  ...compat.config(js.configs.recommended),

  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslintParser,
      parserOptions: {
        project: [
          './tsconfig.app.json',
          './tsconfig.spec.json',
          './tsconfig.json',
        ],
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        performance: 'readonly',
        URL: 'readonly',
        AbortController: 'readonly',
        PerformanceObserver: 'readonly',
        Node: 'readonly',
        queueMicrotask: 'readonly',
        process: 'readonly',
        ngDevMode: 'readonly',
        ngI18nClosureMode: 'readonly',
        goog: 'readonly',
        $localize: 'readonly',
        Zone: 'readonly',
        AsyncIterator: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
      '@angular-eslint': require('@angular-eslint/eslint-plugin'),
    },
    rules: {
      'no-undef': 'error',
      'no-unreachable': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern:
            '^_|^(event)$|^(tNode|index|scopeInfo|e|trigger|using|provider|exactMatch)$',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/indent': 'off',
      'no-redeclare': 'error',
      'no-unsafe-finally': 'error',
      'no-prototype-builtins': 'off',
      'no-fallthrough': 'error',
      'no-sparse-arrays': 'error',
      'no-constant-condition': 'warn',
      'no-case-declarations': 'warn',
      'require-yield': 'warn',

      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'app', style: 'kebab-case' },
      ],
      '@angular-eslint/prefer-inject': 'error',
      '@angular-eslint/no-output-native': 'warn',
    },
  },

  {
    files: ['**/*.html'],
    languageOptions: {
      parser: templateParser,
    },
    plugins: {
      '@angular-eslint/template': require('@angular-eslint/eslint-plugin-template'),
    },
    rules: {
      '@angular-eslint/template/no-negated-async': 'warn',
      '@angular-eslint/template/elements-content': 'warn',
    },
  },

  {
    files: ['**/*.js', '**/*.json', '**/*.scss', '**/*.css'],
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'error',
    },
  },
];
