import { tokens } from "@/app/catalog/ui/tokens";

const border = `border ${tokens.color.borderDefault}`;
const baseSurface = `${tokens.color.surfaceBase} ${tokens.shadow.sm}`;

export const ui = {
  text: {
    muted: tokens.color.textMuted,
  },
  transition: {
    base: tokens.transition.baseAll,
  },
  overlay: {
    backdrop: `absolute inset-0 bg-black/35 backdrop-blur-[2px]`,
    loadingBlur: `pointer-events-none absolute inset-0 z-10 ${tokens.radius.lg} bg-white/45 backdrop-blur-[2px]`,
  },
  layout: {
    stickyFooter: `sticky bottom-0 flex items-center gap-3 border-t ${tokens.color.borderDefault} bg-white/95 p-4 backdrop-blur`,
  },
  button: {
    primary: `${tokens.radius.md} bg-black px-4 py-2 text14 font-medium text-white ${tokens.transition.baseAll} hover:bg-black/90`,
    secondary: `${tokens.radius.md} ${border} px-4 py-2 text14 text-gray-700 ${tokens.transition.baseAll} ${tokens.color.hoverSubtle}`,
    ghost: `${tokens.radius.md} px-3 py-1.5 text14 text-gray-700 ${tokens.transition.baseAll} ${tokens.color.hoverSubtle}`,
    fab: `fixed bottom-5 right-5 z-40 rounded-full bg-black p-4 text-white ${tokens.shadow.md} ${tokens.transition.baseAll} hover:bg-black/90 lg:hidden`,
  },
  card: {
    base: `${tokens.radius.lg} ${border} ${baseSurface}`,
    interactive: `${tokens.radius.lg} ${border} ${baseSurface} ${tokens.transition.baseAll} hover:${tokens.shadow.md}`,
    section: `${tokens.radius.lg} border p-2 ${tokens.transition.baseAll}`,
    bottomSheet: `absolute bottom-0 left-0 right-0 flex max-h-[88vh] w-full flex-col rounded-t-xl ${border} ${tokens.color.surfaceBase} ${tokens.shadow.md}`,
    modal: `absolute inset-x-0 bottom-0 max-h-[90vh] w-full overflow-y-auto rounded-t-xl ${border} ${tokens.color.surfaceBase} p-6 ${tokens.shadow.md} ${tokens.transition.baseAll} sm:inset-x-auto sm:left-1/2 sm:top-1/2 sm:w-[92vw] sm:max-w-xl sm:max-h-none sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl sm:p-6`,
  },
  input: {
    base: `w-full ${tokens.radius.md} ${border} px-3 py-2 text14 outline-none ${tokens.transition.baseAll} focus:${tokens.color.borderHover}`,
  },
  chip: {
    base: `rounded-full ${border} ${tokens.color.surfaceSubtle} px-3 py-1 text12 text-gray-700`,
    inverse: "rounded-full bg-black px-3 py-1 text13 font-medium text-white",
    action: `rounded-full ${border} px-3 py-1 text13 text-gray-700 ${tokens.transition.baseAll} ${tokens.color.hoverSubtle}`,
  },
  selectable: {
    base: `flex items-center justify-between ${tokens.radius.md} border px-3 py-2 text-left text14 ${tokens.transition.baseAll}`,
    active: "border-black bg-black text-white",
    idle: `${tokens.color.borderDefault} text-gray-700 ${tokens.color.hoverSubtle}`,
  },
  pill: {
    page: `h-10 min-w-10 ${tokens.radius.md} px-3 text15 ${tokens.transition.baseAll}`,
    pageActive: "bg-black text-white shadow-sm",
    pageIdle: `${border} ${tokens.color.surfaceBase} text-gray-700 ${tokens.color.hoverSubtle}`,
    counter: `rounded-full ${border} ${tokens.color.surfaceBase} px-3 py-1 text14 text-gray-600`,
  },
  icon: {
    floating: `rounded-full ${tokens.color.surfaceBase} p-1 ${tokens.shadow.sm}`,
    spinnerDark: "h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black/70",
    spinnerLight: "h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white",
  },
  state: {
    alertError: `${tokens.radius.md} border border-red-200 bg-red-50 px-3 py-2 text-center text14 text-red-600`,
  },
} as const;

