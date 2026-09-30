/**
 * /api/cron/expire-conversas
 * Limpa estados de conversas WhatsApp inativas há mais de 24h.
 * Chamado pelo Vercel Cron — requer CRON_SECRET no header.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();

  const expiredAt = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('conversas')
    .update({ etapa_atual: 'inicio', contexto_json: {} })
    .lt('ultima_interacao', expiredAt)
    .select('id');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ status: 'ok', expired: data?.length ?? 0 });
}
