/**
 * Parser do erro PostgreSQL 23P01 (exclusion_violation).
 * Quando a constraint EXCLUDE USING gist é violada, o banco retorna este código.
 * Este módulo traduz o erro técnico em mensagens amigáveis para o usuário.
 */

export interface ConflictError {
  code: 'EXCLUSION_VIOLATION' | 'CHECK_VIOLATION' | 'UNKNOWN';
  userMessage: string;
  sqlState: string;
}

/** Interpreta um erro do Supabase e retorna o ConflictError correspondente */
export function parseSchedulingError(error: { code?: string; message?: string }): ConflictError | null {
  if (!error.code) return null;

  switch (error.code) {
    case '23P01':
      return {
        code: 'EXCLUSION_VIOLATION',
        sqlState: '23P01',
        userMessage:
          'Conflito de horário: este profissional ou paciente já possui consulta agendada neste intervalo.',
      };
    case '23514':
      return {
        code: 'CHECK_VIOLATION',
        sqlState: '23514',
        userMessage: 'Horário inválido: o início deve ser anterior ao término.',
      };
    default:
      return {
        code: 'UNKNOWN',
        sqlState: error.code,
        userMessage: error.message || 'Erro inesperado ao criar agendamento.',
      };
  }
}

/** Retorna true se o código HTTP indica conflito de agendamento */
export function isConflictResponse(status: number): boolean {
  return status === 409;
}
