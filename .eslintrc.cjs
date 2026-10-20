module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['airbnb', 'airbnb-typescript', 'airbnb/hooks', 'plugin:prettier/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.eslint.json',
    tsconfigRootDir: __dirname,
  },
  plugins: ['react-refresh'],
  settings: {
    'import/resolver': {
      typescript: {
        project: './tsconfig.eslint.json',
      },
    },
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unsafe-argument': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-unsafe-call': 'error',
    '@typescript-eslint/no-unsafe-member-access': 'error',
    '@typescript-eslint/no-unsafe-return': 'error',
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    'react/react-in-jsx-scope': 'off',
    'react/require-default-props': 'off',
    'import/prefer-default-export': 'off',
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
  },
  ignorePatterns: ['dist', 'node_modules', 'coverage', 'storybook-static'],
  overrides: [
    {
      files: ['**/*.{test,spec}.{ts,tsx}', 'src/test/**/*.{ts,tsx}'],
      rules: {
        'import/no-extraneous-dependencies': [
          'error',
          {
            devDependencies: [
              '**/*.{test,spec}.{ts,tsx}',
              'src/test/**/*.{ts,tsx}',
              'vitest.config.ts',
            ],
          },
        ],
      },
    },
    {
      files: ['vite.config.ts', 'vite.config.bare.ts', 'vitest.config.ts'],
      rules: {
        '@typescript-eslint/naming-convention': 'off',
        'import/no-extraneous-dependencies': [
          'error',
          { devDependencies: ['vite.config.ts', 'vite.config.bare.ts', 'vitest.config.ts'] },
        ],
      },
    },
    {
      files: ['src/components/ui/**/*.{ts,tsx}'],
      rules: {
        'react/jsx-props-no-spreading': 'off',
        'react/button-has-type': 'off',
      },
    },
    {
      files: ['src/components/dev/QueryDevtoolsPanel.tsx'],
      rules: {
        'import/no-extraneous-dependencies': [
          'error',
          { devDependencies: ['src/components/dev/QueryDevtoolsPanel.tsx'] },
        ],
      },
    },
  ],
};
