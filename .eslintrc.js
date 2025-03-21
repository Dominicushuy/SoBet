module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'next/core-web-vitals',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier', // Đặt prettier ở cuối để tránh xung đột
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2021,
    sourceType: 'module',
    project: './tsconfig.json', // Thêm dòng này để TypeScript ESLint có thể hiểu được project
  },
  plugins: ['react', 'react-hooks', '@typescript-eslint', 'jsx-a11y', 'import', 'prettier'],
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json', // Đảm bảo resolver có thể tìm thấy tsconfig
      },
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
    // Thêm cấu hình cho Next.js
    next: {
      rootDir: ['./'],
    },
  },
  rules: {
    // React
    'react/react-in-jsx-scope': 'off', // Không cần import React với Next.js
    'react/prop-types': 'off', // Sử dụng TypeScript cho type checking
    'react/jsx-filename-extension': [1, { extensions: ['.tsx', '.jsx'] }],
    'react/jsx-props-no-spreading': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // TypeScript
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',

    // Import
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
    'import/no-unresolved': 'error',
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

    // Next.js specific rules
    '@next/next/no-html-link-for-pages': ['error', 'app/'],

    // Prettier
    'prettier/prettier': ['error', {}, { usePrettierrc: true }],

    // Các rule khác
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'jsx-a11y/anchor-is-valid': [
      'error',
      {
        components: ['Link'],
        specialLink: ['hrefLeft', 'hrefRight'],
        aspects: ['invalidHref', 'preferButton'],
      },
    ],
  },
  // Các overrides cho file cụ thể
  overrides: [
    {
      files: ['**/*.tsx'],
      rules: {
        'react/require-default-props': 'off',
      },
    },
    {
      files: ['app/**/*.tsx', 'app/**/*.ts'],
      rules: {
        'import/no-default-export': 'off',
      },
    },
    // Nới lỏng quy tắc cho các file cấu hình
    {
      files: [
        '*.config.js',
        '*.config.ts',
        'next.config.mjs',
        'postcss.config.js',
        'tailwind.config.js',
      ],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        'import/no-default-export': 'off',
      },
    },
  ],
  // Cấu hình cho môi trường phát triển
  ignorePatterns: [
    '.next/',
    'node_modules/',
    '.eslintrc.js',
    'next.config.mjs',
    'postcss.config.js',
    'tailwind.config.js',
    'public/',
    '.vercel/',
    '.git/',
  ],
};
