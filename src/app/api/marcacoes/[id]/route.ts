import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { StatusMarcacao } from '@/types/database';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { status, motivo_cancelamento, observacoes } = body;

    const supabase = await createClient();

    const updates: {
      status?: StatusMarcacao;
      motivo_cancelamento?: string;
      observacoes?: string;
    } = {};

    if (status) updates.status = status;
    if (motivo_cancelamento !== undefined) updates.motivo_cancelamento = motivo_cancelamento;
    if (observacoes !== undefined) updates.observacoes = observacoes;

    const { data, error } = await supabase
      .from('marcacoes')
      .update(updates)
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

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    // Cancelamento lógico: libera o slot imediatamente devido ao WHERE (status != 'cancelado')
    const { data, error } = await supabase
      .from('marcacoes')
      .update({
        status: 'cancelado',
        motivo_cancelamento: 'Cancelado pelo usuário via API',
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Marcação cancelada e horário liberado com sucesso.',
      data,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
