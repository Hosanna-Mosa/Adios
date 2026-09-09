// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

// ---------------------------------------------------------------------------
// Component-architecture boundaries.
//
// Three layers, and imports only ever flow downward:
//
//   app/ (routes)  ->  features/<domain>/  ->  components/ui/ + constants/
//
// The import boundaries are enforced as errors: they have no violations, so
// anything that breaks them is new and should fail the build immediately.
//
// The measure that matters is the raw-tag rule below: a screen should read as
// composition, not markup. File length is deliberately NOT capped -- a screen
// can be any length as long as it is composing components rather than drawing
// them, and chasing a line count rewards moving markup into one big slab.
// ---------------------------------------------------------------------------

// Domain state. `contexts/themeStore` is deliberately absent: theme is
// presentation, so a primitive reading it is fine — knowing about a cart,
// an order or the signed-in user is not.
const domainStores = [
  "**/contexts/authStore",
  "**/contexts/cartStore",
  "**/contexts/deliveryStore",
  "**/contexts/homeStore",
];

const apiLayer = ["**/utils/api", "**/utils/api/**", "**/utils/socketService"];

const featureInternals = ["**/features/*/**"];


// ---------------------------------------------------------------------------
// Exactly four text sizes.
//
// Every fontSize/lineHeight in the app must come from constants/typography.ts
// (small | medium | large | extraLarge). Raw numbers and moderateScale() calls
// are rejected: they are what let ~45 different sizes accumulate, and they were
// only hidden at runtime by a patch in app/_layout.tsx that bucketed
// already-scaled values -- so the same declaration rendered differently
// depending on screen width. Hero/display text clamps to extraLarge; there is
// deliberately no fifth size.
// ---------------------------------------------------------------------------
const typographyTokens = {
  rules: {
    "typography-tokens": {
      meta: {
        type: "problem",
        schema: [],
        docs: { description: "fontSize/lineHeight must use the four typography tokens" },
      },
      create(context) {
        const tables = { fontSize: "sizes", lineHeight: "lineHeights" };
        const isToken = (n, table) =>
          n &&
          n.type === "MemberExpression" &&
          n.object &&
          n.object.type === "MemberExpression" &&
          n.object.object &&
          n.object.object.name === "typography" &&
          n.object.property &&
          n.object.property.name === table;
        // A ternary is fine as long as both branches are tokens (e.g. Button's sm/md).
        const ok = (n, table) =>
          n.type === "ConditionalExpression"
            ? isToken(n.consequent, table) && isToken(n.alternate, table)
            : isToken(n, table);
        return {
          "ObjectExpression > Property"(node) {
            const key = node.key && (node.key.name || node.key.value);
            const table = tables[key];
            if (!table || node.computed) return;
            if (!ok(node.value, table)) {
              context.report({
                node: node.value,
                message:
                  key +
                  " must be typography." +
                  table +
                  ".<small|medium|large|extraLarge> from @/constants/typography (no numbers, no moderateScale()).",
              });
            }
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


  // Screens compose, they do not draw. A raw React Native primitive in a screen
  // is markup that belongs in a feature component -- the whole point of the
  // refactor is that a developer changing the UI opens a named component, not a
  // wall of <View>/<Text>. Warning for now: the count is the remaining backlog,
  // and it flips to "error" once screens are essentially pure composition.
  {
    files: ["app/**/*.tsx"],
    ignores: ["app/**/_layout.tsx"],
    rules: {
      "no-restricted-syntax": ["warn", {
        selector: "JSXOpeningElement[name.name=/^(View|Text|TouchableOpacity|ScrollView|Image|TextInput|Modal|Pressable|FlatList|ActivityIndicator|KeyboardAvoidingView|Switch|SafeAreaView)$/]",
        message: "Screens compose components. Move this markup into a feature component.",
      }],
    },
  },

  // Primitives take props and emit events — nothing else. They must not know
  // about a domain, fetch anything, or navigate on their own behalf.
  {
    files: ["components/ui/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [
          {
            group: domainStores,
            message: "components/ui/ must stay pure. Take the value as a prop instead of reading a domain store.",
          },
          {
            group: apiLayer,
            message: "components/ui/ must not fetch. Take the data as a prop and let a feature hook load it.",
          },
          {
            group: featureInternals,
            message: "components/ui/ must not import from features/ — that inverts the layer order.",
          },
          {
            group: ["expo-router"],
            message: "components/ui/ must not navigate on its own. Take an onPress/onBack callback as a prop.",
          },
        ],
      }],
    },
  },

  // Shared components sit above ui/ and may hold cross-feature composition,
  // but still must not depend on any single feature.
  {
    files: ["components/shared/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [
          {
            group: featureInternals,
            message: "components/shared/ is used by many features, so it must not import from one of them.",
          },
        ],
      }],
    },
  },

  // A feature owns its domain and never reaches sideways into another one.
  // Anything two features genuinely need moves up to components/shared/.
  // Within a feature, import by relative path (./ or ../) — the alias form
  // "@/features/..." is what this rule looks for, so it stays reserved for
  // crossing a feature boundary, which is exactly what is not allowed.
  {
    files: ["features/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [
          {
            group: featureInternals,
            message: "Features must not import each other. Use a relative path within this feature, or move the shared piece up to components/shared/.",
          },
        ],
      }],
    },
  },
  // Exactly four text sizes -- see the comment on typographyTokens above.
  {
    files: ["**/*.{ts,tsx}"],
    ignores: ["constants/typography.ts", "dist/*"],
    plugins: { flavour: typographyTokens },
    rules: { "flavour/typography-tokens": "error" },
  },
]);
