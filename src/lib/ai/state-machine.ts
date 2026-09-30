/**
 * Máquina de estados do Bot WhatsApp (Fase 3).
 * Etapas: inicio → escolher_medico → escolher_data → escolher_slot → confirmando → concluido
 */
import { sendWelcome, sendMedicosList, sendSlotsList, sendConfirmation } from '@/lib/whatsapp/senders';
import type { ParsedMessage } from '@/lib/whatsapp/parser';

export interface ConversaContext {
  medico_id?: string;
  medico_nome?: string;
  data_escolhida?: string;
  slot_inicio?: string;
  slot_fim?: string;
}

export function getInitialContext(): ConversaContext {
  return {};
}

export interface TransitionResult {
  nextEtapa: string;
  nextContexto: ConversaContext;
}

export async function transition(
  etapaAtual: string,
  contexto: ConversaContext,
  message: ParsedMessage
): Promise<TransitionResult> {
  switch (etapaAtual) {
    case 'inicio':
      await sendWelcome(message.from);
      // TODO (Fase 3): buscar médicos e exibir lista
      return { nextEtapa: 'escolher_medico', nextContexto: contexto };

    case 'escolher_medico':
      // TODO: interpretar escolha, salvar medico_id no contexto
      return { nextEtapa: 'escolher_data', nextContexto: contexto };

    case 'escolher_data':
      // TODO: interpretar data, salvar data_escolhida no contexto
      return { nextEtapa: 'escolher_slot', nextContexto: contexto };

    case 'escolher_slot':
      // TODO: interpretar slot, salvar slot_inicio/fim no contexto
      return { nextEtapa: 'confirmando', nextContexto: contexto };

    case 'confirmando':
      // TODO: criar marcação via /api/marcacoes e enviar confirmação
      if (contexto.medico_nome && contexto.slot_inicio) {
        await sendConfirmation(message.from, contexto.medico_nome, contexto.slot_inicio);
      }
      return { nextEtapa: 'concluido', nextContexto: contexto };

    default:
      await sendWelcome(message.from);
      return { nextEtapa: 'inicio', nextContexto: getInitialContext() };
  }
}
