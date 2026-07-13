module.exports = [
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        window: "readonly",
        document: "readonly",
        localStorage: "readonly",
        navigator: "readonly",
        L: "readonly"
      }
    },
    rules: {
      // keep defaults from eslint:recommended via selective rules
      "no-unused-vars": "warn",
    },
  },
];
