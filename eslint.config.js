// Flat ESLint config for the Vite + TS game.
// Goals: catch the kinds of drift items 1, 2, 5 are about (dead exports,
// shadowed identifiers, untyped index access regressions, accidental
// `any`) without slowing the loop with a million stylistic complaints.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'dist-demo/**',
      'public/**',
      'node_modules/**',
      'scripts/lint-content-baseline.json',
      // Locale catalogs are mechanically generated translation lists;
      // linting them adds noise without value.
      'src/i18n/locales/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        // Type-aware rules require a project; we keep them off for now to
        // avoid a 30s lint pass — rely on `tsc --noEmit` for type checks.
        ecmaVersion: 2022,
        sourceType: 'module',
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        localStorage: 'readonly',
        getComputedStyle: 'readonly',
        HTMLElement: 'readonly',
        HTMLDivElement: 'readonly',
        KeyboardEvent: 'readonly',
        Storage: 'readonly',
      },
    },
    rules: {
      // Signal, not noise.
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'no-empty': ['error', { allowEmptyCatch: true }],
      'prefer-const': 'warn',
      // The codebase uses `let` exports for mutable singletons (i18n active
      // locale). That's intentional — leave it alone.
      'no-var': 'error',
    },
  },
  {
    // Scripts run under Node, not the browser.
    files: ['scripts/**/*.{js,mjs}', '*.config.{js,mjs,ts}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        URL: 'readonly',
      },
    },
  },
);
