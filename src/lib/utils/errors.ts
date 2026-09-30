import { NextResponse } from 'next/server';

export interface ApiError {
  error: string;
  code?: string;
}

/** Resposta de erro 400 */
export function badRequest(message: string, code?: string): NextResponse {
  return NextResponse.json<ApiError>({ error: message, code }, { status: 400 });
}

/** Resposta de erro 401 */
export function unauthorized(message = 'Não autenticado'): NextResponse {
  return NextResponse.json<ApiError>({ error: message }, { status: 401 });
}

/** Resposta de erro 409 (conflito de agendamento) */
export function conflict(message: string): NextResponse {
  return NextResponse.json<ApiError>({ error: message, code: 'CONFLICT' }, { status: 409 });
}

/** Resposta de erro 500 */
export function serverError(err: unknown): NextResponse {
  const message = err instanceof Error ? err.message : 'Internal Server Error';
  return NextResponse.json<ApiError>({ error: message }, { status: 500 });
}
