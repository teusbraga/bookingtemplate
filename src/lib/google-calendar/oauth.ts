/**
 * Google OAuth2 helpers (Fase 4).
 * Gera a URL de consentimento e troca o authorization code por tokens.
 * Requer: googleapis npm package (instalado na Fase 4)
 */

export function buildAuthUrl(userId: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`;
  const scopes = encodeURIComponent('https://www.googleapis.com/auth/calendar.events');
  const state = Buffer.from(JSON.stringify({ userId })).toString('base64url');
  return (
    `https://accounts.google.com/o/oauth2/v2/auth` +
    `?client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=${scopes}` +
    `&access_type=offline` +
    `&prompt=consent` +
    `&state=${state}`
  );
}

/**
 * TODO (Fase 4): Troca authorization code por access_token + refresh_token
 * usando googleapis OAuth2Client.getToken()
 */
export async function exchangeCode(
  _code: string
): Promise<{ access_token: string; refresh_token: string; expiry_date: number } | null> {
  // TODO: instalar googleapis e implementar
  return null;
}
