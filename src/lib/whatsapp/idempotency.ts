import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Verifica idempotência estrita de mensagens via message_id UNIQUE.
 * Retorna true se a mensagem já foi processada (duplicata), false se for nova.
 */
export async function isMessageDuplicate(messageId: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('mensagens_log')
    .select('id')
    .eq('message_id', messageId)
    .maybeSingle();
  return data !== null;
}

/** Registra uma mensagem no log de idempotência */
export async function logMessage(params: {
  messageId: string;
  telefone: string;
  direcao: 'entrada' | 'saida';
  tipo: string;
  conteudo?: string;
  rawPayload?: unknown;
  status?: string;
}): Promise<void> {
  const supabase = createAdminClient();
  await supabase.from('mensagens_log').insert({
    message_id: params.messageId,
    telefone: params.telefone,
    direcao: params.direcao,
    tipo: params.tipo,
    conteudo: params.conteudo || null,
    raw_payload: params.rawPayload as any || null,
    status: params.status || 'processado',
  });
}
