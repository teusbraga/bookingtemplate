import type { WhatsAppMessage } from '@/types/whatsapp';

export interface ParsedMessage {
  messageId: string;
  from: string;
  type: string;
  text: string;
  interactiveId?: string;
  interactiveTitle?: string;
}

/** Normaliza uma WhatsAppMessage num objeto flat para a máquina de estados */
export function parseMessage(message: WhatsAppMessage): ParsedMessage {
  let text = '';
  let interactiveId: string | undefined;
  let interactiveTitle: string | undefined;

  if (message.type === 'text') {
    text = message.text?.body || '';
  } else if (message.type === 'interactive') {
    const ir = message.interactive?.button_reply || message.interactive?.list_reply;
    interactiveId = ir?.id;
    interactiveTitle = ir?.title;
    text = ir?.title || '';
  }

  return {
    messageId: message.id,
    from: message.from,
    type: message.type,
    text,
    interactiveId,
    interactiveTitle,
  };
}
