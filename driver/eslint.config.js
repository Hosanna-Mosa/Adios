// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

// Architectural guardrails for the view-layer refactor.
//
// Everything here is a `warn` for now: the codebase does not satisfy these
// rules yet, and the refactor drives the violation count down file by file.
// Phase 4 flips them to `error` once the count reaches zero — see the plan.
// ---------------------------------------------------------------------
// The app has exactly four text sizes. This is a plugin rule rather than an
// entry in `no-restricted-syntax` because flat config replaces a rule's
// options per file, so adding to a shared rule would silently drop whichever
// block loses. Unlike the architectural rules below this one is an `error`
// from the start: the codemod drove its violation count to zero in one pass,
// so there is no backlog to work down.
// ---------------------------------------------------------------------
const typographyTokens = {
  rules: {
    "typography-tokens": {
      meta: { type: "problem", schema: [] },
      create(context) {
        const tables = { fontSize: "sizes", lineHeight: "lineHeights" };
        const isToken = (n, table) =>
          n && n.type === "MemberExpression" &&
          n.object?.type === "MemberExpression" &&
          n.object.object?.name === "typography" &&
          n.object.property?.name === table;
        // a ternary is fine as long as both branches are tokens
        const ok = (n, table) =>
          n.type === "ConditionalExpression"
            ? isToken(n.consequent, table) && isToken(n.alternate, table)
            : isToken(n, table);
        return {
          "ObjectExpression > Property"(node) {
            const key = node.key && (node.key.name || node.key.value);
            const table = tables[key];
            if (!table || node.computed) return;
            if (!ok(node.value, table))
              context.report({
                node: node.value,
                message: key + " must be typography." + table + ".<small|medium|large|extraLarge>",
              });
          },
        };
      },
    },
  },
};

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },

  // ---------------------------------------------------------------------
  // Screens under app/ are routes, not dumping grounds. Anything past 300
  // lines has presentation in it that belongs in a feature component.
  // ---------------------------------------------------------------------
  {
    files: ["app/**/*.tsx", "app/**/*.ts"],
    // A stylesheet is data, not screen logic — its length says nothing about
    // whether the screen is doing too much, so the cap does not apply to it.
    ignores: ["**/*.styles.ts"],
    rules: {
      "max-lines": ["warn", {
        max: 300,
        skipBlankLines: true,
        skipComments: true,
      }],
    },
  },

  // ---------------------------------------------------------------------
  // components/ui/* are dumb primitives. They render what they are given and
  // know nothing about this app's domain: no store, no router, no feature
  // code. Breaking this is what turned the last "shared" folder into a set of
  // single-use components.
  // ---------------------------------------------------------------------
  {
    files: ["components/ui/**/*.tsx", "components/ui/**/*.ts"],
    rules: {
      "no-restricted-imports": ["warn", {
        patterns: [
          {
            group: ["@/store", "@/store/*", "**/store/*"],
            message: "components/ui must not read state. Take the value as a prop instead.",
          },
          {
            group: ["@/features/*", "**/features/*"],
            message: "components/ui must not depend on a feature. Move this component into the feature instead.",
          },
          {
            group: ["expo-router"],
            message: "components/ui must not navigate. Take an onPress handler as a prop instead.",
          },
        ],
      }],
    },
  },

  // ---------------------------------------------------------------------
  // components/shared/* may know the app's shape (layout, safe area, headers)
  // but still must not reach into a specific feature.
  // ---------------------------------------------------------------------
  {
    files: ["components/shared/**/*.tsx", "components/shared/**/*.ts"],
    rules: {
      "no-restricted-imports": ["warn", {
        patterns: [
          {
            group: ["@/features/*", "**/features/*"],
            message: "components/shared is feature-agnostic. If this needs a feature, it belongs in that feature.",
          },
        ],
      }],
    },
  },

  // ---------------------------------------------------------------------
  // One feature must not import another feature's internals. Anything two
  // features both need is by definition shared — promote it to
  // components/shared or components/ui.
  // ---------------------------------------------------------------------
  {
    files: ["features/**/*.tsx", "features/**/*.ts"],
    rules: {
      "no-restricted-imports": ["warn", {
        patterns: [
          {
            group: ["@/features/*/components/*", "@/features/*/hooks/*"],
            message: "Do not reach into another feature. Promote the shared piece to components/shared or components/ui.",
          },
        ],
      }],
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    ignores: ["constants/typography.ts", "dist/*"],
    plugins: { flavour: typographyTokens },
    rules: { "flavour/typography-tokens": "error" },
  },
  // ---------------------------------------------------------------------
  // scripts/ is build tooling that runs in Node, not app code shipped to a
  // device, so it gets Node globals rather than the React Native environment.
  // ---------------------------------------------------------------------
  {
    files: ["scripts/**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        __dirname: "readonly",
        require: "readonly",
        module: "readonly",
        process: "readonly",
        console: "readonly",
      },
    },
  },
]);
