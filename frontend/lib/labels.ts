const PRODUCT_TYPE_LABELS: Record<string, string> = {
  clothing: "Одежда",
  shoes: "Обувь",
  accessories: "Аксессуары",
};

export function productTypeLabel(value: string): string {
  return PRODUCT_TYPE_LABELS[value] ?? value;
}

export function brandDisplayName(slug: string, name?: string | null): string {
  return name?.trim() || slug;
}
