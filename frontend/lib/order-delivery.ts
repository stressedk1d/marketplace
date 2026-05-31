export type OrderDeliveryInfo = {
  full_name?: string;
  phone?: string;
  city?: string;
  address?: string;
  pay_method?: string;
  user_comment?: string;
};

const PAY_LABELS: Record<string, string> = {
  card: "Банковская карта",
  sbp: "СБП",
  cod: "Наложенный платёж",
};

export function parseOrderDelivery(comment: string | null | undefined): OrderDeliveryInfo | null {
  if (!comment?.trim()) return null;
  try {
    const data = JSON.parse(comment) as OrderDeliveryInfo;
    if (typeof data !== "object" || data === null) return null;
    return data;
  } catch {
    return null;
  }
}

export function formatDeliveryLines(info: OrderDeliveryInfo): string[] {
  const lines: string[] = [];
  if (info.full_name) lines.push(info.full_name);
  if (info.phone) lines.push(`Тел.: ${info.phone}`);
  if (info.city || info.address) {
    lines.push([info.city, info.address].filter(Boolean).join(", "));
  }
  if (info.pay_method) {
    lines.push(`Оплата: ${PAY_LABELS[info.pay_method] ?? info.pay_method}`);
  }
  if (info.user_comment) lines.push(`Комментарий: ${info.user_comment}`);
  return lines;
}
