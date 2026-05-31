const priceFormatter = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 0,
});

/** «6 490 ₽» */
export function formatPrice(value: number): string {
  return `${priceFormatter.format(Math.round(value))} ₽`;
}
