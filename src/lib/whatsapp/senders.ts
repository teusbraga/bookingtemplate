import { sendText } from './client';

/** Envia mensagem de boas-vindas e menu inicial */
export async function sendWelcome(to: string): Promise<void> {
  await sendText(
    to,
    '👋 Olá! Sou a assistente virtual da clínica.\n\nDigite *agendar* para marcar uma consulta ou *cancelar* para cancelar uma marcação existente.'
  );
}

/** Envia lista de médicos disponíveis */
export async function sendMedicosList(to: string, medicos: { nome: string; especialidade: string }[]): Promise<void> {
  const lista = medicos
    .map((m, i) => `${i + 1}. ${m.nome} — ${m.especialidade}`)
    .join('\n');
  await sendText(to, `📋 *Médicos disponíveis:*\n\n${lista}\n\nResponda com o número do profissional desejado.`);
}

/** Envia lista de slots disponíveis */
export async function sendSlotsList(to: string, slots: { slot_inicio: string; slot_fim: string }[]): Promise<void> {
  const lista = slots
    .slice(0, 10)
    .map((s, i) => {
      const h = new Date(s.slot_inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      return `${i + 1}. ${h}`;
    })
    .join('\n');
  await sendText(to, `🕐 *Horários disponíveis:*\n\n${lista}\n\nResponda com o número do horário desejado.`);
}

/** Envia confirmação de agendamento */
export async function sendConfirmation(to: string, medicoNome: string, inicio: string): Promise<void> {
  const dt = new Date(inicio).toLocaleString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit',
  });
  await sendText(to, `✅ *Consulta confirmada!*\n\nProfissional: ${medicoNome}\nData/hora: ${dt}\n\nAté logo! 🩺`);
}
