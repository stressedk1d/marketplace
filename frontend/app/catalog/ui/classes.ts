import { pageCtaPrimary, pageProductCard } from "@/lib/page-classes";
import { pageOutlineButton } from "@/lib/ui";
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
    backdrop: `absolute inset-0 bg-black/35 backdrop-blur-[2px] dark:bg-black/60`,
    loadingBlur: `pointer-events-none absolute inset-0 z-10 ${tokens.radius.xl} bg-white/45 backdrop-blur-[2px] dark:bg-black/50`,
  },
  layout: {
    stickyFooter: `sticky bottom-0 flex items-center gap-3 border-t ${tokens.color.borderDefault} bg-white/95 p-4 backdrop-blur dark:bg-[var(--surface)]/95`,
  },
  button: {
    primary: `${pageCtaPrimary} !min-h-[40px] !text-sm !py-2`,
    secondary: `${pageOutlineButton} !min-h-[40px] !text-sm !py-2`,
    ghost: `${tokens.radius.md} px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 ${tokens.transition.baseAll} ${tokens.color.hoverSubtle}`,
    fab: `fixed bottom-20 right-4 z-40 rounded-full bg-neutral-950 p-4 text-white ${tokens.shadow.md} ${tokens.transition.baseAll} hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 lg:bottom-5 lg:right-5 lg:hidden`,
  },
  card: {
    base: `${tokens.radius.xl} ${border} ${baseSurface}`,
    interactive: pageProductCard,
    section: `${tokens.radius.xl} border p-2 ${tokens.transition.baseAll} dark:border-white/15`,
    bottomSheet: `absolute bottom-0 left-0 right-0 flex max-h-[88vh] w-full flex-col rounded-t-2xl ${border} ${tokens.color.surfaceBase} ${tokens.shadow.md}`,
    modal: `absolute inset-x-0 bottom-0 max-h-[90vh] w-full overflow-y-auto rounded-t-2xl ${border} ${tokens.color.surfaceBase} p-6 ${tokens.shadow.md} ${tokens.transition.baseAll} sm:inset-x-auto sm:left-1/2 sm:top-1/2 sm:w-[92vw] sm:max-w-xl sm:max-h-none sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:p-6 dark:border-white/15`,
  },
  input: {
    base: `w-full rounded-xl ${border} px-4 py-2.5 text-sm text-neutral-900 outline-none dark:text-[var(--foreground)] ${tokens.transition.baseAll} focus:${tokens.color.borderHover} dark:bg-[var(--surface)]`,
  },
  chip: {
    base: `rounded-full ${border} ${tokens.color.surfaceSubtle} px-3 py-1 text-xs text-gray-700 dark:text-gray-300`,
    inverse: "rounded-full bg-neutral-950 px-3 py-1 text-xs font-medium text-white dark:bg-white dark:text-neutral-950",
    action: `rounded-full ${border} px-3 py-1 text-xs text-gray-700 dark:text-gray-300 ${tokens.transition.baseAll} ${tokens.color.hoverSubtle}`,
  },
  selectable: {
    base: `flex items-center justify-between rounded-xl border px-3 py-2 text-left text-sm ${tokens.transition.baseAll}`,
    active: "border-neutral-950 bg-neutral-950 text-white dark:border-white dark:bg-white dark:text-neutral-950",
    idle: `${tokens.color.borderDefault} text-gray-700 dark:text-gray-300 ${tokens.color.hoverSubtle}`,
  },
  pill: {
    page: `h-10 min-w-10 rounded-full px-3 text-sm ${tokens.transition.baseAll}`,
    pageActive: "bg-neutral-950 text-white shadow-sm dark:bg-white dark:text-neutral-950",
    pageIdle: `${border} ${tokens.color.surfaceBase} text-gray-700 dark:text-gray-300 ${tokens.color.hoverSubtle}`,
    counter: `rounded-full ${border} ${tokens.color.surfaceBase} px-3 py-1 text-sm text-gray-600 dark:text-gray-400`,
  },
  icon: {
    floating: `rounded-full ${tokens.color.surfaceBase} p-1.5 ${tokens.shadow.sm}`,
    spinnerDark: "h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black/70 dark:border-white/30 dark:border-t-white",
    spinnerLight: "h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white",
  },
  state: {
    alertError: `rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-center text-sm text-red-600 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300`,
  },
} as const;
