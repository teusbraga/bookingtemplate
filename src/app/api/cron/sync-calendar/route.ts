/**
 * /api/cron/sync-calendar
 * Sincronização assíncrona de marcações com o Google Calendar.
 * Chamado pelo Vercel Cron (vercel.json) — requer CRON_SECRET no header.
 * Implementação completa na Fase 4.
 */
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // TODO (Fase 4): buscar marcações sem google_event_id e sincronizar via sync-worker
  console.log('[cron/sync-calendar] invocado em', new Date().toISOString());

  return NextResponse.json({ status: 'ok', synced: 0 });
}
