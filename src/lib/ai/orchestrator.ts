/**
 * Orquestrador do fluxo conversacional WhatsApp + IA (Fase 3).
 * Gerencia a sessão da conversa no banco e coordena a máquina de estados.
 */
import { createAdminClient } from '@/lib/supabase/admin';
import { transition, getInitialContext, type ConversaContext } from './state-machine';
import { parseMessage } from '@/lib/whatsapp/parser';
import type { WhatsAppMessage } from '@/types/whatsapp';

export async function handleIncomingMessage(message: WhatsAppMessage): Promise<void> {
  const supabase = createAdminClient();
  const parsed = parseMessage(message);

  // Busca ou cria conversa
  const { data: existingConversa } = await supabase
    .from('conversas')
    .select('*')
    .eq('telefone', parsed.from)
    .maybeSingle();

  const conversa = existingConversa || {
    telefone: parsed.from,
    etapa_atual: 'inicio',
    contexto_json: getInitialContext(),
    ultima_interacao: new Date().toISOString(),
  };

  // Avança a máquina de estados
  const { nextEtapa, nextContexto } = await transition(
    conversa.etapa_atual,
    conversa.contexto_json as ConversaContext,
    parsed
  );

  // Persiste o estado atualizado
  await supabase
    .from('conversas')
    .upsert({
      telefone: parsed.from,
      etapa_atual: nextEtapa,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      contexto_json: nextContexto as any,
      ultima_interacao: new Date().toISOString(),
    }, { onConflict: 'telefone' });
}
