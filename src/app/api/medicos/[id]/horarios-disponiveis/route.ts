/**
 * Renomeia o endpoint de slots para a convenção da arquitetura:
 * /api/medicos/[id]/horarios-disponiveis
 *
 * Este arquivo é o ponto de entrada canônico. A lógica permanece
 * idêntica à implementação original (/api/medicos/[id]/slots).
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id: medicoId } = await context.params;
    const { searchParams } = new URL(request.url);
    const dataParam = searchParams.get('data');

    if (!dataParam) {
      return NextResponse.json(
        { error: 'Parâmetro ?data=YYYY-MM-DD é obrigatório' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Chama a stored procedure PostgreSQL: get_horarios_disponiveis(p_medico_id, p_data)
    const { data: slots, error } = await supabase.rpc('get_horarios_disponiveis', {
      p_medico_id: medicoId,
      p_data: dataParam,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      medico_id: medicoId,
      data: dataParam,
      slots: slots || [],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
