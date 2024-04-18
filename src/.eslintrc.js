module.exports = {
  overrides: [
    {
      files: ['**/*.ts', '**/*.vue'],

      env: {
        browser: true,
        es6: true,
      },
      parserOptions: {
        tsconfigRootDir: __dirname,
      },
    },
  ],
};
