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
    borderDefault: "border-black/10",
    borderHover: "border-black/20",
    textMuted: "text-gray-500",
    surfaceBase: "bg-white",
    surfaceSubtle: "bg-gray-50",
    hoverSubtle: "hover:bg-gray-50",
  },
} as const;

