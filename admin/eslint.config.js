import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

// Feature folders introduced by the admin component refactor (see the
// refactor plan, "03 - Target structure"). Each feature's components/hooks
// should stay self-contained — cross-feature imports belong in shared/ or a
// page, not feature-to-feature.
const featureNames = ["drivers", "zones", "vendors", "catalog", "orders", "users", "support", "dashboard"];
const crossFeatureOverrides = featureNames.map((name) => ({
  files: [`src/features/${name}/**/*.{ts,tsx}`],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: featureNames
          .filter((other) => other !== name)
          .map((other) => ({
            group: [`@/features/${other}/*`, `@/features/${other}/**`],
            message: `features/${name} must not reach into features/${other} — share code via components/shared or hooks/ instead.`,
          })),
      },
    ],
  },
}));

export default tseslint.config(
  { ignores: ["dist"] },
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
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
      // Use appAlert / appConfirm from "@/lib/dialog", never the browser's popups.
      "no-alert": "error",
    },
  },
  // --- Refactor scaffolding added in Phase 1, locked to error in Phase 4
  // ("Lock it") now that the work queue (section 04, items 1-18) is done.
  // components/ui/** is generated shadcn — excluded from the page line-count
  // rule below and forbidden from reaching into app-specific code.
  {
    files: ["src/pages/**/*.{ts,tsx}"],
    rules: {
      "max-lines": ["error", { max: 300, skipBlankLines: false, skipComments: false }],
      // Phase 4: pages must not call useQuery/useMutation directly — that
      // logic belongs in a feature hook (features/<feature>/hooks/*).
      "no-restricted-imports": [
        "error",
        {
          paths: [
            { name: "@tanstack/react-query", message: "pages/ must not call useQuery/useMutation directly — wrap the query in a features/<feature>/hooks/* hook instead." },
          ],
        },
      ],
    },
  },
  {
    files: ["src/components/ui/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            { name: "react-router-dom", message: "components/ui is generated shadcn primitives — it must not import the router." },
            { name: "@/lib/api-client", message: "components/ui must not import the API client." },
            { name: "@/lib/socketService", message: "components/ui must not import the socket service." },
          ],
          patterns: [
            { group: ["@/features/*", "@/features/**"], message: "components/ui must not import feature code." },
            { group: ["@/pages/*", "@/pages/**"], message: "components/ui must not import pages." },
          ],
        },
      ],
    },
  },
  {
    files: ["src/components/shared/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            { name: "@/lib/api-client", message: "components/shared is generic — accept data via props instead of calling the API client directly." },
          ],
          patterns: [
            { group: ["@/features/*", "@/features/**"], message: "components/shared must stay feature-agnostic; feature-specific composition belongs in features/<feature>/components." },
          ],
        },
      ],
    },
  },
  ...crossFeatureOverrides,
);
