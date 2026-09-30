/**
 * Cliente HTTP para a Meta Graph Cloud API (WhatsApp).
 * Centraliza todas as chamadas de saída para a API do WhatsApp.
 */

const BASE_URL = 'https://graph.facebook.com/v19.0';

function getPhoneNumberId(): string {
  const id = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!id) throw new Error('WHATSAPP_PHONE_NUMBER_ID não configurado');
  return id;
}

function getAccessToken(): string {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!token) throw new Error('WHATSAPP_ACCESS_TOKEN não configurado');
  return token;
}

/** Envia uma mensagem de texto simples */
export async function sendText(to: string, body: string): Promise<void> {
  await fetch(`${BASE_URL}/${getPhoneNumberId()}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body },
    }),
  });
}

/** Marca uma mensagem como lida */
export async function markAsRead(messageId: string): Promise<void> {
  await fetch(`${BASE_URL}/${getPhoneNumberId()}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId,
    }),
  });
}
