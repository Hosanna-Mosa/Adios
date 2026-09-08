// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

// Architectural guardrails for the view-layer refactor.
//
// Everything here is a `warn` for now: the codebase does not satisfy these
// rules yet, and the refactor drives the violation count down file by file.
// Phase 4 flips them to `error` once the count reaches zero — see the plan.
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
]);
