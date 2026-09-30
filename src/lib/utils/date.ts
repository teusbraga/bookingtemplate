/**
 * Utilitários de data em pt-BR com Timezone da clínica.
 * Timezone padrão: America/Sao_Paulo (BRT/BRST)
 */

export const CLINIC_TIMEZONE = 'America/Sao_Paulo';

/** Formata data e hora para exibição em pt-BR */
export function formatDateTime(isoString: string, timezone = CLINIC_TIMEZONE): string {
  return new Date(isoString).toLocaleString('pt-BR', {
    timeZone: timezone,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Formata apenas a hora */
export function formatTime(isoString: string, timezone = CLINIC_TIMEZONE): string {
  return new Date(isoString).toLocaleTimeString('pt-BR', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Formata apenas a data (ex: "quarta, 01/10/2026") */
export function formatDate(isoString: string, timezone = CLINIC_TIMEZONE): string {
  return new Date(isoString).toLocaleDateString('pt-BR', {
    timeZone: timezone,
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/** Retorna a data de hoje no timezone da clínica no formato YYYY-MM-DD */
export function todayInClinicTz(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: CLINIC_TIMEZONE });
}
