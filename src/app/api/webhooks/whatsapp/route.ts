import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// GET: Verificação de Webhook da Meta (WhatsApp Cloud API)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === 'subscribe' && token === verifyToken) {
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// POST: Recebimento de mensagens com Idempotência Estrita por message_id
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    const entry = payload?.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const message = value?.messages?.[0];

    // Se for apenas notificação de status de entrega/leitura, responde 200 rápido
    if (!message) {
      return NextResponse.json({ status: 'ignored_status_update' }, { status: 200 });
    }

    const messageId = message.id;
    const fromPhone = message.from;
    const messageType = message.type;
    const bodyText = message.text?.body || '';

    // Usa createAdminClient com service_role para gravar mensagens e conversas
    const supabase = createAdminClient();

    // 1. Grava no mensagens_log para garantir Idempotência
    const { error: logError } = await supabase.from('mensagens_log').insert({
      message_id: messageId,
      telefone: fromPhone,
      direcao: 'entrada',
      tipo: messageType,
      conteudo: bodyText,
      raw_payload: payload,
      status: 'recebido',
    });

    // Se violar a UNIQUE (message_id) significa que a Meta re-enviou a mesma mensagem -> ignora silenciosamente
    if (logError) {
      if (logError.code === '23505') {
        return NextResponse.json({ status: 'duplicate_ignored' }, { status: 200 });
      }
      console.error('Erro ao registrar log de mensagem:', logError);
    }

    // 2. Atualiza ou cria a conversa na máquina de estados
    await supabase
      .from('conversas')
      .upsert(
        {
          telefone: fromPhone,
          ultima_interacao: new Date().toISOString(),
        },
        { onConflict: 'telefone' }
      );

    // Resposta imediata HTTP 200 para a Meta
    return NextResponse.json({ status: 'received' }, { status: 200 });
  } catch (err: unknown) {
    console.error('Erro no webhook do WhatsApp:', err);
    // Para webhooks da Meta, retornar 200 evita desativação em erros pontuais
    return NextResponse.json({ status: 'error_logged' }, { status: 200 });
  }
}
