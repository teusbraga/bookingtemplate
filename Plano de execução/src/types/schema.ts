export type UserRole = 'cliente' | 'medico' | 'admin';
export type BookingStatus = 'pendente' | 'confirmado' | 'cancelado' | 'concluido';
export type BookingOrigin = 'site' | 'whatsapp' | 'admin';
export type MessageDirection = 'entrada' | 'saida';

export interface TableColumn {
  name: string;
  type: string;
  isPrimary?: boolean;
  isForeign?: boolean;
  foreignTable?: string;
  isUnique?: boolean;
  isNullable?: boolean;
  defaultValue?: string;
  description: string;
}

export interface TableConstraint {
  name: string;
  type: 'CHECK' | 'EXCLUSION' | 'FOREIGN KEY' | 'UNIQUE';
  definition: string;
  purpose: string;
}

export interface TableDefinition {
  name: string;
  tag: string;
  description: string;
  columns: TableColumn[];
  constraints: TableConstraint[];
  indexes: string[];
  rlsPolicies: string[];
}

export interface MockProfile {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  tipo: UserRole;
}

export interface MockMedico {
  id: string;
  profile_id: string;
  nome: string;
  crm: string;
  especialidade: string;
  duracao_padrao_minutos: number;
  ativo: boolean;
}

export interface MockDisponibilidade {
  id: string;
  medico_id: string;
  dia_semana: number; // 0=Dom, 1=Seg, ... 6=Sab
  hora_inicio: string; // "08:00"
  hora_fim: string; // "18:00"
  pausa_inicio?: string; // "12:00"
  pausa_fim?: string; // "13:00"
}

export interface MockMarcacao {
  id: string;
  cliente_id: string;
  cliente_nome: string;
  medico_id: string;
  medico_nome: string;
  inicio: string; // ISO string
  fim: string; // ISO string
  status: BookingStatus;
  origem: BookingOrigin;
  observacoes?: string;
  created_at: string;
}
