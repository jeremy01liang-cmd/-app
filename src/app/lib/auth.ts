export const UNIVERSAL_TEST_CODE = "999999";

export function normalizePhone(rawPhone: string) {
  return rawPhone.replace(/\D/g, "");
}

export function isValidPhone(phone: string) {
  return /^1\d{10}$/.test(phone);
}

export function maskPhone(phone: string) {
  if (phone.length !== 11) {
    return phone;
  }

  return `${phone.slice(0, 3)}****${phone.slice(-4)}`;
}

export function buildDefaultNickname(phone: string) {
  return `小朋友${phone.slice(-4)}`;
}
