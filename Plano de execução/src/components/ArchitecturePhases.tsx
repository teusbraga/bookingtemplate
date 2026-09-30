import React, { useState } from 'react';
import { Database, Server, Monitor, Bot, Calendar, ArrowRight, ShieldCheck, CheckCircle2, ChevronRight } from 'lucide-react';

export const ArchitecturePhases: React.FC = () => {
  const [activePhase, setActivePhase] = useState<number>(0);

  const phases = [
    {
      number: 'Fase 0',
      title: 'Modelagem de Dados & Constraints (Supabase/Postgres)',
      tag: 'ENTREGUE HOJE',
      tagColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      icon: Database,
      summary: 'Schema robusto com 7 tabelas e constraint nativa de exclusão btree_gist para garantia de zero sobreposição no banco.',
      details: [
        'Habilitação das extensões "uuid-ossp" e "btree_gist".',
        'Criação das 7 tabelas: profiles, medicos, disponibilidades, marcacoes, conversas, mensagens_log e integracoes_google_calendar.',
        'Constraint de Exclusão marcacoes_sem_sobreposicao_medico utilizando tstzrange(inicio, fim, \'[)\') WITH && WHERE (status != \'cancelado\').',
        'Intervalo semi-aberto [) permitindo consultas adjacentes contíguas (ex: 14:00-14:30 e 14:30-15:00).',
        'Índice parcial no status que libera o horário imediatamente ao cancelar a consulta.',
        'Stored procedure get_horarios_disponiveis para cálculo em alto desempenho no banco.'
      ],
      diagram: `[ auth.users ] ──> [ profiles ] ──> [ medicos ]
                         │               │
                         │               ▼
                         │       [ disponibilidades ]
                         │               │
                         ▼               ▼
                 [ marcacoes (EXCLUDE tstzrange &&) ]`
    },
    {
      number: 'Fase 1',
      title: 'Backend / API Própria (Vercel Node/TypeScript)',
      tag: 'FONTE ÚNICA DA VERDADE',
      tagColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      icon: Server,
      summary: 'Camada de API isolada: nem o site nem o bot de WhatsApp gravam direto no Supabase.',
      details: [
        'POST /api/clientes — Cadastro seguro com validação de telefone E.164.',
        'POST /api/auth/otp e /api/auth/verify — Autenticação sem depender do Google.',
        'GET /api/medicos/:id/horarios-disponiveis — Executa a função SQL get_horarios_disponiveis.',
        'POST /api/marcacoes — Realiza agendamento. Se colidir, o Postgres retorna erro 23P01 e a API responde HTTP 409 Conflict.',
        'PATCH /api/marcacoes/:id e DELETE /api/marcacoes/:id — Remarcação e cancelamento seguro.',
        'POST /api/webhooks/whatsapp — Recebe eventos de mensagens da Meta.',
        'GET /api/auth/google/callback — Callback do OAuth2 para o Google Calendar.'
      ],
      diagram: `[ Frontend Web ]   ──┐
                      ├──> [ API Vercel (/api/*) ] ──> [ Supabase (Postgres) ]
[ WhatsApp Bot ]   ──┘`
    },
    {
      number: 'Fase 2',
      title: 'Frontend Web (Área do Cliente & Médico)',
      tag: 'INTERFACE USUÁRIO',
      tagColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      icon: Monitor,
      summary: 'Aplicações web para agendamento manual por pacientes e gestão de agenda por médicos.',
      details: [
        'Cadastro e Login por email + senha ou magic link / OTP por telefone.',
        'Área do Cliente: catálogo de especialidades, seleção de horário em tempo real e histórico de consultas.',
        'Área do Médico: visão semanal e diária da agenda, configuração de expediente e aprovação/cancelamento.',
        'Botão "Conectar Google Calendar" dedicado em ambas as áreas (desacoplado do fluxo de login principal).'
      ],
      diagram: `[ Cliente Portal ] ──( Reserva Consulta )──> [ API ]
[ Médico Portal ]  ──( Ajusta Horários ) ──> [ API ]`
    },
    {
      number: 'Fase 3',
      title: 'Agente de IA + WhatsApp (Meta Cloud API)',
      tag: 'AUTOMAÇÃO CONVERSACIONAL',
      tagColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      icon: Bot,
      summary: 'Bot inteligente com orquestração desacoplada, idempotência por message_id e function calling.',
      details: [
        'Idempotência Estrita: O webhook recebe a mensagem da Meta e grava imediatamente em public.mensagens_log com chave UNIQUE(message_id). Se a Meta reenviar, o banco descarta sem duplicar processamento.',
        'Resposta 200 Imediata: O webhook responde HTTP 200 em <100ms e despacha o evento para uma fila assíncrona (ex: QStash, BullMQ ou Vercel Ingest).',
        'Máquina de Estados em public.conversas: O contexto (médico selecionado, especialidade, dia) reside no banco de dados, nunca na memória RAM efêmera do servidor.',
        'Function Calling: O LLM invoca exatamente as mesmas funções que o frontend usa (consultar_horarios, criar_marcacao).'
      ],
      diagram: `[ Meta Webhook ] ──( HTTP 200 imediato )──> [ Grava mensagens_log ]
         │
         ▼
[ Fila Assíncrona ] ──> [ Agente LLM ] ──( Function Calling )──> [ API /api/marcacoes ]`
    },
    {
      number: 'Fase 4',
      title: 'Sincronização com Google Calendar (Cliente e Médico)',
      tag: 'SINCRONIZAÇÃO ASSÍNCRONA',
      tagColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      icon: Calendar,
      summary: 'Integração 100% gratuita via Google Calendar API com renovação automática de tokens.',
      details: [
        'Autorização Independente: Usuários podem ter cadastro por email comum e ainda assim autorizar a escrita no Google Calendar (escopo calendar.events).',
        'Armazenamento Seguro: O refresh_token é armazenado de forma criptografada em public.integracoes_google_calendar.',
        'Disparo Assíncrono: Ao comitar uma nova linha em public.marcacoes, um background job chama a Google Calendar API.',
        'Criação de Eventos: Cria o evento na agenda do médico e, se o cliente tiver conectado, também na agenda do paciente.',
        'Renovação Silenciosa: Quando o access_token expira, a API usa o refresh_token para renovar automaticamente sem deslogar o usuário.'
      ],
      diagram: `[ INSERT marcacoes ] ──> [ Fila Worker ] ──> [ Google Calendar API ]
                                                       ├──> Evento Médico
                                                       └──> Evento Paciente`
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-purple-500/30 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold">
            <Server className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Roadmap Arquitetural de Implementação (Fase 0 a Fase 4)
            </h2>
            <p className="text-xs text-slate-300">
              Como o schema SQL fornecido se conecta com a API Vercel, o Bot de WhatsApp e o Google Calendar
            </p>
          </div>
        </div>
      </div>

      {/* Phase Navigation Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
        {phases.map((p, idx) => {
          const Icon = p.icon;
          const isActive = activePhase === idx;

          return (
            <button
              key={idx}
              onClick={() => setActivePhase(idx)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-800 border-purple-500/60 shadow-md'
                  : 'bg-slate-900/60 border-slate-800 hover:bg-slate-850'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span className={isActive ? 'text-purple-300 font-bold' : 'text-slate-400'}>{p.number}</span>
                <Icon className={`h-4 w-4 ${isActive ? 'text-purple-400' : 'text-slate-500'}`} />
              </div>
              <div className="text-xs font-bold text-white mt-1 line-clamp-1">{p.title.split('(')[0]}</div>
              <span className={`text-[9px] px-1.5 py-0.2 rounded border font-sans font-medium mt-1 inline-block ${p.tagColor}`}>
                {p.tag}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Phase Details */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-purple-400 font-bold uppercase">{phases[activePhase].number}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${phases[activePhase].tagColor}`}>
                {phases[activePhase].tag}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mt-0.5">{phases[activePhase].title}</h3>
            <p className="text-xs text-slate-300 mt-1">{phases[activePhase].summary}</p>
          </div>
        </div>

        {/* Breakdown of features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Itens Técnicos Essenciais:
            </h4>
            <div className="space-y-2.5">
              {phases[activePhase].details.map((item, i) => (
                <div key={i} className="flex items-start space-x-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Fluxo de Dados & Isolamento:
            </h4>
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-purple-300 overflow-x-auto leading-relaxed">
              {phases[activePhase].diagram}
            </pre>

            <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400">
              <strong className="text-slate-200">Por que esta ordem de fases?</strong> A modelagem da Fase 0 é a base de aço.
              Com as constraints ACID no banco, nenhum bug nas Fases 1, 2 ou 3 conseguirá corromper o calendário ou causar overbooking.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
