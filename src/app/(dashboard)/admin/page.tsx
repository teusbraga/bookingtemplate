import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Users, Stethoscope, Calendar, Database, ShieldCheck, Zap, ArrowRight } from 'lucide-react';

export default async function AdminDashboardPage() {
 const supabase = await createClient();

 // Busca totais de pacientes, médicos e consultas
 const [
 { count: totalPerfis },
 { count: totalMedicos },
 { count: totalMarcacoes },
 { count: totalConfirmadas },
 ] = await Promise.all([
 supabase.from('profiles').select('*', { count: 'exact', head: true }),
 supabase.from('medicos').select('*', { count: 'exact', head: true }),
 supabase.from('marcacoes').select('*', { count: 'exact', head: true }),
 supabase.from('marcacoes').select('*', { count: 'exact', head: true }).eq('status', 'confirmado'),
 ]);

 const cards = [
 {
 title: 'Total de Usuários',
 value: totalPerfis || 0,
 desc: 'Pacientes, médicos e admins',
 icon: Users,
 color: 'text-blue-400',
 bg: 'bg-blue-500/10 border-blue-500/20',
 },
 {
 title: 'Corpo Clínico Ativo',
 value: totalMedicos || 0,
 desc: 'Profissionais cadastrados',
 icon: Stethoscope,
 color: 'text-blue-600',
 bg: 'bg-purple-500/10 border-purple-500/20',
 },
 {
 title: 'Consultas Registradas',
 value: totalMarcacoes || 0,
 desc: 'Histórico acumulado',
 icon: Calendar,
 color: 'text-blue-600',
 bg: 'bg-blue-600/10 border-blue-600/20',
 },
 {
 title: 'Consultas Ativas',
 value: totalConfirmadas || 0,
 desc: 'Status confirmado no banco',
 icon: ShieldCheck,
 color: 'text-amber-400',
 bg: 'bg-amber-500/10 border-amber-500/20',
 },
 ];

 return (
 <div className="space-y-8">
 {/* Top Banner */}
 <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <div className="flex items-center gap-2">
 <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30">
 Super Admin
 </span>
 </div>
 <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
 Visão Geral do Sistema
 </h1>
 <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
 Monitoramento de agendamentos, profissionais e integridade do banco Supabase
 </p>
 </div>

 <div className="flex items-center gap-2 text-xs font-mono text-blue-600 bg-blue-600/10 border border-blue-600/20 px-3 py-1.5 rounded-xl">
 <Zap className="h-4 w-4" />
 <span>btree_gist: 100% Ativo</span>
 </div>
 </div>

 {/* Grid de Métricas */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 {cards.map((card, i) => {
 const Icon = card.icon;
 return (
 <div
 key={i}
 className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-3 shadow-none"
 >
 <div className="flex items-center justify-between">
 <span className="text-xs font-medium text-gray-500">{card.title}</span>
 <div className={`p-2 rounded-xl border ${card.bg} ${card.color}`}>
 <Icon className="h-4 w-4" />
 </div>
 </div>
 <div>
 <div className="text-2xl font-bold text-gray-900 font-mono">{card.value}</div>
 <p className="text-[11px] text-gray-400 mt-0.5">{card.desc}</p>
 </div>
 </div>
 );
 })}
 </div>

 {/* Atalhos rápidos */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <Link
 href="/admin/medicos"
 className="bg-gray-50 border border-gray-200 hover:border-gray-300 p-6 rounded-2xl flex items-center justify-between group transition-colors shadow-none"
 >
 <div className="space-y-1">
 <h3 className="text-sm font-bold text-gray-900 group-hover:text-purple-300 transition-colors">
 Gerenciar Corpo Clínico &rarr;
 </h3>
 <p className="text-xs text-gray-500">
 Visualizar especialidades, CRM e duração de consultas dos profissionais
 </p>
 </div>
 <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
 </Link>

 <Link
 href="/admin/marcacoes"
 className="bg-gray-50 border border-gray-200 hover:border-gray-300 p-6 rounded-2xl flex items-center justify-between group transition-colors shadow-none"
 >
 <div className="space-y-1">
 <h3 className="text-sm font-bold text-gray-900 group-hover:text-emerald-300 transition-colors">
 Auditoria de Marcações &rarr;
 </h3>
 <p className="text-xs text-gray-500">
 Histórico unificado com origem da marcação (site, WhatsApp ou balcão)
 </p>
 </div>
 <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
 </Link>
 </div>
 </div>
 );
}
