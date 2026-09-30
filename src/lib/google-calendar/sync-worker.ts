/**
 * Sync worker — sincroniza marcações confirmadas com o Google Calendar (Fase 4).
 * Chamado pelo cron /api/cron/sync-calendar.
 */

export interface SyncResult {
  synced: number;
  errors: string[];
}

// TODO (Fase 4): implementar lógica de sync bidirecional
export async function syncPendingEvents(): Promise<SyncResult> {
  return { synced: 0, errors: [] };
}
