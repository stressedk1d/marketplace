// Design system enforcement rules for catalog UI layer.
// Components in this area must compose only tokens/classes primitives.

export const designSystemRules = {
  forbiddenPatterns: [
    "Inline shadow-* utility classes in component markup (outside tokens.ts/classes.ts)",
    "Direct rounded-* utility usage in components (use tokens.radius or classes)",
    "One-off hover colors (e.g. custom hover:bg-* not represented in tokens/classes)",
    "Ad-hoc button styles that bypass ui.button variants",
    "Component-local style systems duplicating border/radius/shadow/transition primitives",
  ],
  allowedPatterns: [
    "Use tokens.ts as the single source of primitive design tokens",
    "Use classes.ts as the single source of composable UI classes",
    "Composition-only styling inside components",
    "No style decision logic in components; only variant/state wiring",
  ],
  architectureRule:
    "No styling decisions inside components - only composition of system primitives.",
} as const;

