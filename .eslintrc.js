module.exports = {
  root: true,
  overrides: [
    {
      files: ['src/ts/**/*.ts', 'tools/**/*.ts'],

      env: {
        es6: true,
      },
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        ecmaFeatures: {},
        project: 'tsconfig.json',
      },
      plugins: ['@typescript-eslint/eslint-plugin'],
      extends: [
        'eslint:recommended',
        'airbnb-base',
        'airbnb-typescript/base',
        'plugin:compat/recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'prettier',
      ],
      rules: {
        'no-underscore-dangle': [
          'error',
          {
            allowAfterThis: true,
          },
        ],
        'no-unused-vars': 'off',
        'no-void': ['error', { allowAsStatement: true }],
        '@typescript-eslint/no-floating-promises': [
          'error',
          { ignoreVoid: true },
        ],
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            argsIgnorePattern: '^_',
          },
        ],
        'import/prefer-default-export': 'off',
      },
    },
    {
      files: ['tools/**/*.ts'],
      rules: {
        'import/no-extraneous-dependencies': [
          'error',
          {
            devDependencies: true,
          },
        ],
      },
    },
  ],
};
