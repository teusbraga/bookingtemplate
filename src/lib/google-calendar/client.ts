/**
 * Google Calendar API v3 client (Fase 4).
 * Cria e deleta eventos no calendário do usuário.
 */
import type { GoogleCalendarEvent } from '@/types/google';

// TODO (Fase 4): implementar com googleapis
export async function createEvent(
  _accessToken: string,
  _calendarId: string,
  _event: GoogleCalendarEvent
): Promise<string | null> {
  return null;
}

export async function deleteEvent(
  _accessToken: string,
  _calendarId: string,
  _eventId: string
): Promise<boolean> {
  return false;
}
