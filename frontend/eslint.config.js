import js from "@eslint/js";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import boundaries from "eslint-plugin-boundaries";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", ".output"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": "off",
      // Use appAlert / appConfirm from "@/lib/dialog", never the browser's popups.
      "no-alert": "error",
    },
  },
  {
    // Route files are shells that wire up features — logic and JSX belong in
    // src/features/**. shadcn vendor files under components/ui/** are exempt
    // (generated, not ours to trim).
    files: ["src/routes/**/*.{ts,tsx}"],
    ignores: ["src/components/ui/**"],
    rules: {
      "max-lines": [
        "error",
        { max: 300, skipBlankLines: false, skipComments: false },
      ],
    },
  },
  {
    // Import-direction boundaries: routes/ is a leaf (nothing may import a
    // route back), and lib/ stays pure — no reaching into features,
    // components, or routes. Test files are exempt — reaching into
    // features/constants for realistic fixtures is normal test scaffolding,
    // not a production import.
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/components/ui/**", "**/*.test.{ts,tsx}"],
    plugins: { boundaries },
    settings: {
      "import/resolver": {
        node: { extensions: [".js", ".jsx", ".ts", ".tsx"] },
      },
      "boundaries/elements": [
        { type: "routes", partialMatch: false, pattern: "src/routes/**" },
        { type: "features", partialMatch: false, pattern: "src/features/**" },
        { type: "lib", partialMatch: false, pattern: "src/lib/**" },
        { type: "hooks", partialMatch: false, pattern: "src/hooks/**" },
        {
          type: "components",
          partialMatch: false,
          pattern: "src/components/**",
        },
      ],
    },
    rules: {
      "boundaries/dependencies": [
        "error",
        {
          default: "allow",
          policies: [
            // Nothing may import from src/routes/ — routes are a leaf, not a shared module.
            { disallow: { to: { element: { type: "routes" } } } },
            // src/lib/** must stay pure — no importing features, components, or routes.
            {
              from: { element: { type: "lib" } },
              disallow: {
                to: {
                  element: {
                    types: { anyOf: ["features", "components", "routes"] },
                  },
                },
              },
            },
          ],
        },
      ],
    },
  },
  eslintPluginPrettier,
);
