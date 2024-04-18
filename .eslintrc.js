/* eslint-env node */
module.exports = {
  root: true,
  overrides: [
    {
      files: ['src/ts/**/*.ts', 'tools/**/*.ts', 'src/**/*.vue'],
      env: {
        es6: true,
      },
      parser: 'vue-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {},
        project: 'tsconfig.json',
      },
      extends: [
        'plugin:vue/vue3-essential',
        'eslint:recommended',
        'airbnb-base',
        'airbnb-typescript/base',
        'plugin:compat/recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        '@vue/eslint-config-typescript',
        '@vue/eslint-config-prettier/skip-formatting',
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
