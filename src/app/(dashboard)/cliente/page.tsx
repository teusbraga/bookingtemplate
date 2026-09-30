import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Calendar, Plus, Clock, User, AlertCircle, ArrowRight } from 'lucide-react';

export default async function ClienteDashboardPage() {
 const supabase = await createClient();
 const {
 data: { user },
 } = await supabase.auth.getUser();

 // Busca perfil do paciente
 const { data: profile } = await supabase
 .from('profiles')
 .select('nome, telefone, email')
 .eq('id', user?.id || '')
 .single();

 // Busca próximas consultas ativas
 const { data: proximasConsultas } = await supabase
 .from('marcacoes')
 .select(`
 id,
 inicio,
 fim,
 status,
 origem,
 observacoes,
 medicos (
 id,
 especialidade,
 profiles ( nome, telefone )
 )
 `)
 .eq('cliente_id', user?.id || '')
 .neq('status', 'cancelado')
 .gte('inicio', new Date().toISOString())
 .order('inicio', { ascending: true })
 .limit(5);

 function formatDateTime(isoString: string) {
 try {
 const d = new Date(isoString);
 return {
 data: d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }),
 hora: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
 };
 } catch {
 return { data: isoString, hora: '' };
 }
 }

 return (
 <div className="space-y-8">
 {/* Header com boas-vindas */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50 border border-gray-200 rounded-2xl p-6">
 <div>
 <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
 Olá, {profile?.nome || 'Paciente'} 👋
 </h1>
 <p className="text-xs sm:text-sm text-gray-500 mt-1">
 Gerencie suas consultas e agende novos atendimentos em poucos segundos
 </p>
 </div>

 <Link
 href="/cliente/agendar"
 className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-slate-950 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-none shrink-0"
 >
 <Plus className="h-4 w-4" />
 Agendar Consulta
 </Link>
 </div>

 {/* Próximas Consultas */}
 <div className="space-y-4">
 <div className="flex items-center justify-between">
 <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
 <Clock className="h-4 w-4 text-blue-600" />
 Próximos Agendamentos
 </h2>
 <Link href="/cliente/historico" className="text-xs text-blue-600 hover:underline">
 Ver todas as consultas &rarr;
 </Link>
 </div>

 {(!proximasConsultas || proximasConsultas.length === 0) ? (
 <div className="bg-gray-50/50 border border-dashed border-gray-200 rounded-2xl p-12 text-center space-y-4">
 <div className="h-12 w-12 rounded-full bg-gray-100 text-gray-500 mx-auto flex items-center justify-center">
 <Calendar className="h-6 w-6" />
 </div>
 <div>
 <p className="text-sm font-medium text-gray-800">Você não tem consultas agendadas</p>
 <p className="text-xs text-gray-400 mt-0.5">
 Escolha um profissional e reserve seu melhor horário agora
 </p>
 </div>
 <Link
 href="/cliente/agendar"
 className="inline-flex items-center gap-2 bg-gray-100 hover:bg-slate-700 text-gray-900 text-xs font-semibold px-4 py-2 rounded-xl border border-gray-300 transition-colors"
 >
 Escolher horário
 <ArrowRight className="h-3.5 w-3.5" />
 </Link>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {proximasConsultas.map((marcacao: any) => {
 const dt = formatDateTime(marcacao.inicio);
 const medicoNome = marcacao.medicos?.profiles?.nome || 'Profissional';
 const especialidade = marcacao.medicos?.especialidade || 'Clínica Geral';

 return (
 <div
 key={marcacao.id}
 className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-4 hover:border-gray-300 transition-colors shadow-none"
 >
 <div className="flex items-start justify-between">
 <div>
 <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded border border-blue-600/30 bg-blue-600/10 text-blue-600 font-semibold">
 {especialidade}
 </span>
 <h3 className="text-base font-bold text-gray-900 mt-1.5">{medicoNome}</h3>
 </div>

 <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 capitalize">
 {marcacao.status}
 </span>
 </div>

 <div className="flex items-center gap-4 text-xs text-gray-500 border-t border-gray-200/80 pt-3">
 <div className="flex items-center gap-1.5">
 <Calendar className="h-4 w-4 text-blue-600" />
 <span>{dt.data}</span>
 </div>
 <div className="flex items-center gap-1.5 font-mono">
 <Clock className="h-4 w-4 text-blue-600" />
 <span>{dt.hora}</span>
 </div>
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>
 </div>
 );
}
