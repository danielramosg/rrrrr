module.exports = {
  overrides: [
    {
      files: ['**/*.ts'],

      env: {
        node: true,
        es6: true,
      },
      parserOptions: {
        tsconfigRootDir: __dirname,
      },
    },
  ],
};
