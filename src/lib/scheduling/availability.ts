/**
 * Módulo de scheduling — cálculo de slots e fusos locais.
 * A lógica principal está na stored procedure get_horarios_disponiveis() no PostgreSQL.
 * Este módulo oferece utilitários client-side para formatação e validação.
 */

export interface SlotInterval {
  inicio: string; // ISO 8601
  fim: string;    // ISO 8601
}

/** Gera URL para buscar slots de um médico em uma data */
export function buildSlotsUrl(medicoId: string, data: string): string {
  return `/api/medicos/${medicoId}/horarios-disponiveis?data=${data}`;
}

/** Verifica se um slot está no passado */
export function isSlotInPast(slotInicio: string): boolean {
  return new Date(slotInicio) < new Date();
}

/** Retorna o próximo dia útil (segunda-feira se for fim de semana) */
export function nextBusinessDay(from: Date = new Date()): string {
  const d = new Date(from);
  d.setDate(d.getDate() + 1);
  // Pula domingo (0) e sábado (6)
  while (d.getDay() === 0 || d.getDay() === 6) {
    d.setDate(d.getDate() + 1);
  }
  return d.toISOString().split('T')[0];
}
