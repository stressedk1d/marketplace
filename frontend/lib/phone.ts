/** Маска ввода: +7 (999) 123-45-67 */
export function formatPhoneInput(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("8")) digits = `7${digits.slice(1)}`;
  if (digits.length > 0 && !digits.startsWith("7")) digits = `7${digits}`;
  digits = digits.slice(0, 11);

  if (digits.length === 0) return "";
  if (digits.length <= 1) return "+7";
  if (digits.length <= 4) return `+7 (${digits.slice(1)}`;
  if (digits.length <= 7) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4)}`;
  if (digits.length <= 9) {
    return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
}

export function phoneDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function isValidRuPhone(phone: string): boolean {
  const digits = phoneDigits(phone);
  return digits.length === 11 && digits.startsWith("7");
}
