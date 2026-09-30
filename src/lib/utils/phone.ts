/**
 * Utilitários de telefone — validação e máscara E.164.
 * Formato padrão: +55XXXXXXXXXXX (Brasil)
 */

/** Remove tudo que não seja dígito e prefixa com + */
export function toE164(raw: string, defaultCountryCode = '55'): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith(defaultCountryCode)) {
    return '+' + digits;
  }
  return '+' + defaultCountryCode + digits;
}

/** Verifica se um número está no formato E.164 */
export function isValidE164(phone: string): boolean {
  return /^\+\d{10,15}$/.test(phone);
}

/** Formata para exibição: +55 (11) 99999-8888 */
export function formatPhoneDisplay(e164: string): string {
  const digits = e164.replace(/\D/g, '');
  if (digits.length === 13) {
    // +55 11 9XXXX-XXXX
    return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`;
  }
  return e164;
}
