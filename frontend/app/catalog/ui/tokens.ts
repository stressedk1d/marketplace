export const tokens = {
  radius: {
    sm: "rounded-md",
    md: "rounded-lg",
    lg: "rounded-xl",
    xl: "rounded-2xl",
  },
  shadow: {
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
  },
  transition: {
    fast: "duration-150",
    base: "duration-200",
    easing: "ease-out",
    baseAll: "transition-all duration-200 ease-out",
  },
  color: {
    borderDefault: "border-black/10 dark:border-white/15",
    borderHover: "border-black/20 dark:border-white/25",
    textMuted: "text-gray-500 dark:text-gray-400",
    surfaceBase: "bg-white dark:bg-[var(--surface)]",
    surfaceSubtle: "bg-gray-50 dark:bg-neutral-800",
    hoverSubtle: "hover:bg-gray-50 dark:hover:bg-neutral-700",
  },
} as const;

