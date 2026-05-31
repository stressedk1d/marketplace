import { isValidRuPhone } from "@/lib/phone";

export type CheckoutField = "fullName" | "phone" | "city" | "address";

export type CheckoutFieldErrors = Partial<Record<CheckoutField, string>>;

export function validateCheckoutForm(
  fullName: string,
  phone: string,
  city: string,
  address: string
): CheckoutFieldErrors {
  const errors: CheckoutFieldErrors = {};
  const name = fullName.trim();
  const cityVal = city.trim();
  const addressVal = address.trim();

  if (name.length < 2) {
    errors.fullName = "Укажите ФИО (минимум 2 символа)";
  }
  if (!isValidRuPhone(phone)) {
    errors.phone = "Введите телефон в формате +7 (999) 123-45-67";
  }
  if (cityVal.length < 2) {
    errors.city = "Укажите город";
  }
  if (addressVal.length < 5) {
    errors.address = "Укажите полный адрес доставки";
  }

  return errors;
}
