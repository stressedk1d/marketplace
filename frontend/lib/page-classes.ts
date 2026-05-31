/** Общие классы внутренних страниц (каталог, бренды, PDP и т.д.). */

export {
  homeBrandCard as pageBrandCard,
  homeCollectionCard as pageCollectionCard,
  homeEmptyState as pageEmptyState,
  homeHeading as pageHeading,
  homeProductCard as pageProductCard,
  homeProductImage as pageProductImage,
  homeSectionLink as pageSectionLink,
  homeSubheading as pageSubheading,
} from "@/lib/home-classes";

export const pageShell =
  "min-h-screen pb-12 text-neutral-900 dark:text-[var(--foreground)]";

export const pageContent = "container-main space-y-8 sm:space-y-10";

export const pageGridBrands =
  "grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4 xl:grid-cols-5";

export const pageGridCards = "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3";

export const pageLogoBox =
  "relative mb-4 flex h-24 w-32 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-neutral-100 to-neutral-200 ring-1 ring-neutral-200/80 transition duration-300 group-hover:ring-neutral-300 dark:from-neutral-800 dark:to-neutral-700 dark:ring-neutral-600 dark:group-hover:ring-neutral-500";

export const pageCelebrityImage =
  "relative aspect-square w-full overflow-hidden rounded-2xl bg-neutral-200 ring-1 ring-neutral-200/90 transition duration-300 group-hover:ring-neutral-300 dark:bg-neutral-800 dark:ring-neutral-700";

export const pageBuyBox =
  "h-fit rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-lg ring-1 ring-black/[0.04] dark:border-neutral-700 dark:bg-[var(--surface)] dark:ring-white/[0.06] sm:p-6 lg:sticky lg:top-24 lg:self-start";

export const pageGalleryMain =
  "relative mb-3 h-[min(72vw,480px)] cursor-zoom-in overflow-hidden rounded-2xl bg-neutral-200 shadow-md ring-1 ring-black/[0.06] dark:bg-neutral-800 dark:ring-white/[0.08] sm:mb-4 sm:h-[480px]";

export const pageTabActive =
  "relative font-semibold text-neutral-900 after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-neutral-900 dark:text-neutral-50 dark:after:bg-white";

export const pageTabIdle =
  "relative text-neutral-500 transition hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200";

export const pageCtaPrimary =
  "inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-neutral-950 px-6 text-base font-semibold text-white shadow-md transition hover:bg-neutral-800 active:scale-[0.98] disabled:bg-neutral-400 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 dark:disabled:bg-neutral-600";

export const pageSummaryCard =
  "rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-lg ring-1 ring-black/[0.04] dark:border-neutral-700 dark:bg-[var(--surface)] dark:ring-white/[0.06] sm:p-6";

export const pageCartLineItem =
  "flex gap-4 rounded-xl border border-neutral-200/80 bg-neutral-50/50 p-4 transition hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900/40 dark:hover:border-neutral-600";

export const pageQtyButton =
  "flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 text-base transition hover:bg-neutral-100 dark:border-neutral-600 dark:hover:bg-neutral-800";

export const catalogStickyBar =
  "sticky top-[4.25rem] z-20 -mx-4 mb-6 flex flex-wrap items-center justify-between gap-3 border-y border-neutral-200/90 bg-background/85 px-4 py-3 backdrop-blur-md dark:border-neutral-700 dark:bg-[var(--background)]/90 sm:-mx-0 sm:rounded-xl sm:border sm:shadow-sm";
