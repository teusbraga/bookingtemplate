import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: medicos, error } = await supabase
      .from('medicos')
      .select(`
        id,
        crm,
        especialidade,
        duracao_padrao_minutos,
        ativo,
        profiles (
          id,
          nome,
          telefone,
          email
        )
      `)
      .eq('ativo', true)
      .order('especialidade');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: medicos });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
