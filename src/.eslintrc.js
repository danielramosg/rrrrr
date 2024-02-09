module.exports = {
  overrides: [
    {
      files: ['**/*.ts'],

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
