/**
 * /api/marcacoes/[id]/status
 * PATCH: Atualiza o status de uma marcação (confirmado → concluído, etc.)
 * para uso pelo painel administrativo ou cron jobs.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { StatusMarcacao } from '@/types/database';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { status } = body as { status: StatusMarcacao };

    if (!status) {
      return NextResponse.json({ error: 'Campo status é obrigatório.' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('marcacoes')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
