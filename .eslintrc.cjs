/** Root ESLint config shared by every workspace (apps/*, packages/*). */
module.exports = {
  root: true,
  env: { es2022: true, node: true, browser: true },
  parser: "@typescript-eslint/parser",
  parserOptions: { ecmaVersion: "latest", sourceType: "module", ecmaFeatures: { jsx: true } },
  plugins: ["@typescript-eslint", "react", "react-hooks"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:astro/recommended",
  ],
  settings: { react: { version: "detect" } },
  ignorePatterns: [
    "dist/",
    ".astro/",
    ".wrangler/",
    "node_modules/",
    "**/migrations/**",
    "coverage/",
  ],
  rules: {
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/no-explicit-any": "warn",
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
  },
  overrides: [
    {
      files: ["*.astro"],
      parser: "astro-eslint-parser",
      parserOptions: { parser: "@typescript-eslint/parser", extraFileExtensions: [".astro"] },
      rules: {
        // Astro templates use HTML attributes (class, is:inline, ...), not React JSX.
        "react/no-unknown-property": "off",
      },
    },
  ],
};
