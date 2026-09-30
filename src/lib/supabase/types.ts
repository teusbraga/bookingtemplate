export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type TipoUsuario = 'cliente' | 'medico' | 'admin';
export type StatusMarcacao = 'pendente' | 'confirmado' | 'cancelado' | 'concluido';
export type OrigemMarcacao = 'site' | 'whatsapp' | 'admin';
export type DirecaoMensagem = 'entrada' | 'saida';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          nome: string;
          telefone: string;
          email: string | null;
          tipo: TipoUsuario;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          nome: string;
          telefone: string;
          email?: string | null;
          tipo?: TipoUsuario;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          telefone?: string;
          email?: string | null;
          tipo?: TipoUsuario;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      medicos: {
        Row: {
          id: string;
          profile_id: string;
          crm: string;
          especialidade: string;
          duracao_padrao_minutos: number;
          ativo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          crm: string;
          especialidade: string;
          duracao_padrao_minutos?: number;
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          crm?: string;
          especialidade?: string;
          duracao_padrao_minutos?: number;
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'medicos_profile_id_fkey';
            columns: ['profile_id'];
            isOneToOne: true;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      disponibilidades: {
        Row: {
          id: string;
          medico_id: string;
          dia_semana: number;
          hora_inicio: string;
          hora_fim: string;
          pausa_inicio: string | null;
          pausa_fim: string | null;
          ativo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          medico_id: string;
          dia_semana: number;
          hora_inicio: string;
          hora_fim: string;
          pausa_inicio?: string | null;
          pausa_fim?: string | null;
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          medico_id?: string;
          dia_semana?: number;
          hora_inicio?: string;
          hora_fim?: string;
          pausa_inicio?: string | null;
          pausa_fim?: string | null;
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'disponibilidades_medico_id_fkey';
            columns: ['medico_id'];
            isOneToOne: false;
            referencedRelation: 'medicos';
            referencedColumns: ['id'];
          }
        ];
      };
      marcacoes: {
        Row: {
          id: string;
          cliente_id: string;
          medico_id: string;
          inicio: string;
          fim: string;
          status: StatusMarcacao;
          origem: OrigemMarcacao;
          motivo_cancelamento: string | null;
          observacoes: string | null;
          google_event_id_medico: string | null;
          google_event_id_cliente: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          cliente_id: string;
          medico_id: string;
          inicio: string;
          fim: string;
          status?: StatusMarcacao;
          origem?: OrigemMarcacao;
          motivo_cancelamento?: string | null;
          observacoes?: string | null;
          google_event_id_medico?: string | null;
          google_event_id_cliente?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          cliente_id?: string;
          medico_id?: string;
          inicio?: string;
          fim?: string;
          status?: StatusMarcacao;
          origem?: OrigemMarcacao;
          motivo_cancelamento?: string | null;
          observacoes?: string | null;
          google_event_id_medico?: string | null;
          google_event_id_cliente?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'marcacoes_cliente_id_fkey';
            columns: ['cliente_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'marcacoes_medico_id_fkey';
            columns: ['medico_id'];
            isOneToOne: false;
            referencedRelation: 'medicos';
            referencedColumns: ['id'];
          }
        ];
      };
      conversas: {
        Row: {
          id: string;
          telefone: string;
          cliente_id: string | null;
          etapa_atual: string;
          contexto_json: Json;
          ultima_interacao: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          telefone: string;
          cliente_id?: string | null;
          etapa_atual?: string;
          contexto_json?: Json;
          ultima_interacao?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          telefone?: string;
          cliente_id?: string | null;
          etapa_atual?: string;
          contexto_json?: Json;
          ultima_interacao?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'conversas_cliente_id_fkey';
            columns: ['cliente_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      mensagens_log: {
        Row: {
          id: string;
          message_id: string;
          telefone: string;
          direcao: DirecaoMensagem;
          tipo: string;
          conteudo: string | null;
          raw_payload: Json | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          message_id: string;
          telefone: string;
          direcao: DirecaoMensagem;
          tipo?: string;
          conteudo?: string | null;
          raw_payload?: Json | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          message_id?: string;
          telefone?: string;
          direcao?: DirecaoMensagem;
          tipo?: string;
          conteudo?: string | null;
          raw_payload?: Json | null;
          status?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      integracoes_google_calendar: {
        Row: {
          id: string;
          user_id: string;
          calendar_id: string;
          access_token: string;
          refresh_token: string;
          expira_em: string;
          ativo: boolean;
          sincronizar_automaticamente: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          calendar_id?: string;
          access_token: string;
          refresh_token: string;
          expira_em: string;
          ativo?: boolean;
          sincronizar_automaticamente?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          calendar_id?: string;
          access_token?: string;
          refresh_token?: string;
          expira_em?: string;
          ativo?: boolean;
          sincronizar_automaticamente?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'integracoes_google_calendar_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_horarios_disponiveis: {
        Args: {
          p_medico_id: string;
          p_data: string;
        };
        Returns: {
          slot_inicio: string;
          slot_fim: string;
          disponivel: boolean;
        }[];
      };
    };
    Enums: {
      tipo_usuario: TipoUsuario;
      status_marcacao: StatusMarcacao;
      origem_marcacao: OrigemMarcacao;
      direcao_mensagem: DirecaoMensagem;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
