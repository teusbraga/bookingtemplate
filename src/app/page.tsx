import Link from 'next/link';
import {
  Calendar,
  ShieldCheck,
  Zap,
  Users,
  Clock,
  ArrowRight,
  Database,
  CheckCircle2,
  Stethoscope,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

export default function HomePage() {
  const highlights = [
    {
      icon: ShieldCheck,
      title: 'Zero Race Conditions (ACID)',
      desc: 'Constraint PostgreSQL EXCLUDE USING gist (btree_gist + tstzrange). Conflitos bloqueados a nível de banco.',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      icon: Clock,
      title: 'Cálculo de Slots em Alto Desempenho',
      desc: 'Função SQL get_horarios_disponiveis gera horários livres respeitando pausas de almoço e consultas ativas.',
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10 border-cyan-500/20',
    },
    {
      icon: MessageSquare,
      title: 'WhatsApp Meta API Ready',
      desc: 'Webhook estruturado com idempotência estrita por message_id e máquina de estados para agentes LLM.',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      icon: Users,
      title: 'Multi-Role com RLS',
      desc: 'Portais completos e isolados para Pacientes (/cliente), Médicos (/medico) e Super Administradores (/admin).',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Header / Navbar */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-white text-base tracking-tight">Booking Template</span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                Next.js 15 + Supabase
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/login"
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-lg transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              Agendar Consulta
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative pt-16 pb-20 px-4 sm:px-6 overflow-hidden">
          <div className="max-w-5xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium">
              <Zap className="h-3.5 w-3.5" />
              <span>Garantia Matemática de Zero Overbooking</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
              O template definitivo para{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                agendamentos modernos
              </span>{' '}
              em saúde e serviços
            </h1>

            <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Estruturado com Next.js 15, Supabase (PostgreSQL 15+) e Vercel. Projetado para suportar marcações simultâneas via web app e bot de WhatsApp sem qualquer chance de conflito de agenda.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link
                href="/cadastro"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-6 py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/10 cursor-pointer"
              >
                Testar Agendamento de Paciente
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-850 text-white font-semibold px-6 py-3.5 rounded-xl text-sm border border-slate-800 transition-colors"
              >
                Acessar Portal Médico / Admin
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Arquitetura de Nível Empresarial
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Cada componente foi projetado seguindo as melhores práticas de banco de dados e SSR
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {highlights.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-3 hover:border-slate-700 transition-all shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border ${item.bg} ${item.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-bold text-white">{item.title}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed pl-12">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Quick Portal Access */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <h3 className="text-lg font-bold text-white">Módulos Prontos Inclusos no Template</h3>
                <p className="text-xs text-slate-400">
                  Pronto para customizar e conectar à sua infraestrutura
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-1 rounded bg-slate-950 border border-slate-800 text-emerald-400 font-semibold self-start sm:self-auto">
                100% TypeScript
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <Calendar className="h-4 w-4" />
                  Portal do Paciente
                </div>
                <p className="text-xs text-slate-400">
                  Seleção de médicos, escolha de data, visualização de horários com SlotPicker e histórico completo de atendimentos.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
                  <Stethoscope className="h-4 w-4" />
                  Portal do Médico
                </div>
                <p className="text-xs text-slate-400">
                  Painel de atendimentos do dia, visualização de contatos do paciente e configuração de regras de expediente semanal.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
                  <Database className="h-4 w-4" />
                  Painel Administrativo
                </div>
                <p className="text-xs text-slate-400">
                  Métricas em tempo real, auditoria completa de agendamentos por canal de origem e gestão do corpo clínico.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Database className="h-4 w-4 text-emerald-400" />
            <span className="font-medium text-slate-400">
              Booking Template · Licença MIT (Open-Source)
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="https://github.com/teusbraga/bookingtemplate"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white transition-colors"
            >
              GitHub Repository
            </Link>
            <span>·</span>
            <Link href="/login" className="text-slate-400 hover:text-white transition-colors">
              Login
            </Link>
            <span>·</span>
            <Link href="/cadastro" className="text-emerald-400 hover:underline">
              Criar Conta
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
