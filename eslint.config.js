import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

/**
 * Architecture boundaries are enforced here, not by convention.
 *
 * The dependency rule of hexagonal architecture only holds if something
 * mechanical checks it. These rules make an inward-pointing violation a
 * lint error instead of a code review argument.
 */
const FRAMEWORK_IMPORTS = [
  { group: ['react', 'react-dom', 'react/*', 'react-dom/*'], message: 'The domain and application layers must not know React exists.' },
  { group: ['three', 'three/*', '@react-three/*', 'postprocessing'], message: 'The domain and application layers must not know Three.js exists.' },
  { group: ['gsap', 'gsap/*'], message: 'Animation is a presentation concern. Keep it out of the core.' },
  { group: ['zustand', 'zustand/*'], message: 'UI state stores belong to the presentation layer.' },
]

export default tseslint.config(
  { ignores: ['dist', 'coverage', 'node_modules'] },

  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },

  // The core must not depend on any framework.
  {
    files: ['src/domain/**/*.ts', 'src/application/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', { patterns: FRAMEWORK_IMPORTS }],
    },
  },

  // The domain sits at the centre: it may not reach outward, not even to its
  // own adapters. Ports exist precisely so it never has to.
  {
    files: ['src/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          ...FRAMEWORK_IMPORTS,
          { group: ['@application/*', '@infrastructure/*', '@presentation/*'], message: 'Dependencies point inward. The domain depends on nothing.' },
        ],
      }],
    },
  },

  // Use cases orchestrate the domain through ports; they never touch adapters.
  {
    files: ['src/application/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          ...FRAMEWORK_IMPORTS,
          { group: ['@infrastructure/*', '@presentation/*'], message: 'Use cases depend on ports, never on concrete adapters.' },
        ],
      }],
    },
  },

  // Presentational components take props. Wiring belongs to containers.
  {
    files: ['src/presentation/components/**/*.tsx'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          { group: ['@infrastructure/*', '@presentation/state/*', '@application/*'], message: 'Presentational components receive data through props. Move the wiring into a container.' },
        ],
      }],
    },
  },

  {
    files: ['**/*.test.{ts,tsx}', 'tests/**/*.ts'],
    rules: {
      'no-restricted-imports': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },

  {
    files: ['**/*.js'],
    ...tseslint.configs.disableTypeChecked,
    languageOptions: { globals: globals.node },
  },

  {
    files: ['*.config.ts'],
    languageOptions: { globals: globals.node },
  },
)
