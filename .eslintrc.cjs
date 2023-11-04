/* eslint-env node */
module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:mocha/recommended",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "eslint-plugin-mocha"],
  root: true,
  ignorePatterns: ["dist/**.js"],
  rules: {
    "no-warning-comments": ["error", { terms: ["xxx"], location: "anywhere" }],
    "@typescript-eslint/no-unused-vars": [
      "error",
      { ignoreRestSiblings: true },
    ],
  },
};
