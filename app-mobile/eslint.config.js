// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
    rules: {
      // Warn on unused variables
      "@typescript-eslint/no-unused-vars": "warn",
      "no-unused-vars": "warn",
    }
  },
]);
