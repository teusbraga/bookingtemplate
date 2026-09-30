/**
 * /api/clientes
 * POST: Cadastro de paciente com sanitização de telefone E.164.
 * Chamado pelo bot WhatsApp quando um novo usuário inicia agendamento.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

function sanitizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  return '+' + digits;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, telefone, email } = body;

    if (!nome || !telefone) {
      return NextResponse.json({ error: 'nome e telefone são obrigatórios.' }, { status: 400 });
    }

    const telefoneSanitizado = sanitizePhone(telefone);

    if (!/^\+\d{10,15}$/.test(telefoneSanitizado)) {
      return NextResponse.json(
        { error: 'Telefone inválido. Use formato E.164 (+5511999998888).' },
        { status: 422 }
      );
    }

    const supabase = createAdminClient();

    // Verifica se telefone já existe
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('telefone', telefoneSanitizado)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ data: existing, message: 'already_exists' }, { status: 200 });
    }

    // Cria usuário anônimo no Supabase Auth (sem email/senha)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      phone: telefoneSanitizado,
      user_metadata: { nome },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        nome,
        telefone: telefoneSanitizado,
        email: email || null,
        tipo: 'cliente',
      })
      .select()
      .single();

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    return NextResponse.json({ data: profile }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
