import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { OrigemMarcacao } from '@/types/database';

interface CreateMarcacaoBody {
  cliente_id?: string;
  medico_id: string;
  inicio: string; // ISO string (ex: 2026-10-01T14:00:00Z)
  fim: string;    // ISO string
  origem?: OrigemMarcacao;
  observacoes?: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body: CreateMarcacaoBody = await request.json();

    const { medico_id, inicio, fim, origem = 'site', observacoes } = body;

    if (!medico_id || !inicio || !fim) {
      return NextResponse.json(
        { error: 'medico_id, inicio e fim são obrigatórios' },
        { status: 400 }
      );
    }

    // Identifica usuário logado se cliente_id não foi passado explicitamente
    let cliente_id = body.cliente_id;
    if (!cliente_id) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.json(
          { error: 'Não autenticado. Forneça credenciais ou cliente_id.' },
          { status: 401 }
        );
      }
      cliente_id = user.id;
    }

    const { data: marcacao, error } = await supabase
      .from('marcacoes')
      .insert({
        cliente_id,
        medico_id,
        inicio,
        fim,
        status: 'confirmado',
        origem,
        observacoes: observacoes || null,
      })
      .select()
      .single();

    if (error) {
      // 23P01 = exclusion_violation (PostgreSQL EXCLUDE USING gist btree_gist)
      if (error.code === '23P01') {
        return NextResponse.json(
          {
            error: 'Conflito de horário: este profissional ou paciente já possui consulta agendada neste intervalo.',
            code: 'EXCLUSION_VIOLATION',
            sqlState: error.code,
          },
          { status: 409 }
        );
      }

      // 23514 = check_violation (ex: chk_marcacao_inicio_antes_fim)
      if (error.code === '23514') {
        return NextResponse.json(
          {
            error: 'Horário inválido: o início deve ser anterior ao término.',
            code: 'CHECK_VIOLATION',
          },
          { status: 400 }
        );
      }

      return NextResponse.json({ error: error.message, code: error.code }, { status: 500 });
    }

    return NextResponse.json({ data: marcacao }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const dataInicio = searchParams.get('inicio');

    let query = supabase
      .from('marcacoes')
      .select(`
        id,
        inicio,
        fim,
        status,
        origem,
        observacoes,
        created_at,
        medicos (
          id,
          especialidade,
          profiles ( nome, telefone )
        ),
        profiles (
          id,
          nome,
          telefone
        )
      `)
      .order('inicio', { ascending: true });

    if (status) {
      query = query.eq('status', status as any);
    }
    if (dataInicio) {
      query = query.gte('inicio', dataInicio);
    }

    const { data: marcacoes, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: marcacoes });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
