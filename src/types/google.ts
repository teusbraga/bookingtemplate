/** Credenciais OAuth2 do Google Calendar (armazenadas criptografadas no banco) */
export interface GoogleCalendarCredentials {
  access_token: string;
  refresh_token: string;
  expira_em: string;
  calendar_id: string;
}

/** Evento do Google Calendar API v3 */
export interface GoogleCalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  attendees?: { email: string; displayName?: string }[];
  status?: 'confirmed' | 'tentative' | 'cancelled';
}
