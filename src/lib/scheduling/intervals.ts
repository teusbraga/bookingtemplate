/**
 * Utilitários de intervalos tstzrange [inicio, fim).
 * Espelha a semântica do PostgreSQL tstzrange com modo semi-aberto '[)'.
 * 14:00–14:30 e 14:30–15:00 NÃO se sobrepõem.
 */

export interface TimeRange {
  inicio: Date;
  fim: Date;
}

/** Converte strings ISO em TimeRange */
export function parseRange(inicio: string, fim: string): TimeRange {
  return { inicio: new Date(inicio), fim: new Date(fim) };
}

/**
 * Verifica sobreposição semi-aberta [a.inicio, a.fim) && [b.inicio, b.fim)
 * Equivalente à condição `&&` do tstzrange PostgreSQL.
 */
export function overlaps(a: TimeRange, b: TimeRange): boolean {
  return a.inicio < b.fim && b.inicio < a.fim;
}

/** Duração em minutos de um intervalo */
export function durationMinutes(range: TimeRange): number {
  return Math.round((range.fim.getTime() - range.inicio.getTime()) / 60000);
}

/** Formata um range como string legível em pt-BR */
export function formatRange(inicio: string, fim: string, locale = 'pt-BR'): string {
  const s = new Date(inicio).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  const e = new Date(fim).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  return `${s} – ${e}`;
}
