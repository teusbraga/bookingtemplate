export type { Database, TipoUsuario, StatusMarcacao, OrigemMarcacao, DirecaoMensagem, Json } from './database';

export interface Slot {
  slot_inicio: string;
  slot_fim: string;
  disponivel: boolean;
}

export interface BookingRequest {
  medico_id: string;
  inicio: string;
  fim: string;
  origem?: 'site' | 'whatsapp' | 'admin';
  observacoes?: string;
}

export type BookingStatus = 'pendente' | 'confirmado' | 'cancelado' | 'concluido';
