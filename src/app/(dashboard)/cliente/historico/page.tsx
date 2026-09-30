import { createClient } from '@/lib/supabase/server';
import { Calendar, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default async function HistoricoPage() {
 const supabase = await createClient();
 const {
 data: { user },
 } = await supabase.auth.getUser();

 const { data: marcacoes } = await supabase
 .from('marcacoes')
 .select(`
 id,
 inicio,
 fim,
 status,
 origem,
 motivo_cancelamento,
 observacoes,
 created_at,
 medicos (
 id,
 especialidade,
 profiles ( nome, telefone )
 )
 `)
 .eq('cliente_id', user?.id || '')
 .order('inicio', { ascending: false });

 function formatDateTime(isoString: string) {
 try {
 const d = new Date(isoString);
 return {
 data: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
 hora: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
 };
 } catch {
 return { data: isoString, hora: '' };
 }
 }

 function getStatusBadge(status: string) {
 switch (status) {
 case 'confirmado':
 return (
 <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-600/10 text-blue-600 border border-blue-600/20">
 <CheckCircle className="h-3 w-3" />
 Confirmado
 </span>
 );
 case 'cancelado':
 return (
 <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
 <XCircle className="h-3 w-3" />
 Cancelado
 </span>
 );
 case 'concluido':
 return (
 <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
 Concluído
 </span>
 );
 default:
 return (
 <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
 {status}
 </span>
 );
 }
 }

 return (
 <div className="space-y-6">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Histórico de Consultas</h1>
 <p className="text-xs sm:text-sm text-gray-500 mt-1">
 Registro de todas as suas consultas passadas, ativas e canceladas
 </p>
 </div>

 <Link
 href="/cliente/agendar"
 className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-slate-950 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-none shrink-0"
 >
 Novo Agendamento
 </Link>
 </div>

 {(!marcacoes || marcacoes.length === 0) ? (
 <div className="bg-gray-50 border border-gray-200 rounded-2xl p-12 text-center text-gray-500 space-y-2">
 <Calendar className="h-10 w-10 mx-auto text-gray-400" />
 <p className="text-sm font-medium">Nenhum histórico encontrado.</p>
 <p className="text-xs text-gray-400">
 Quando você realizar agendamentos, eles aparecerão aqui.
 </p>
 </div>
 ) : (
 <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden shadow-none">
 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs text-gray-600">
 <thead className="bg-white text-gray-500 uppercase text-[10px] font-semibold tracking-wider border-b border-gray-200">
 <tr>
 <th className="py-3 px-4">Profissional</th>
 <th className="py-3 px-4">Especialidade</th>
 <th className="py-3 px-4">Data</th>
 <th className="py-3 px-4">Horário</th>
 <th className="py-3 px-4">Status</th>
 <th className="py-3 px-4">Origem</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-800/60">
 {marcacoes.map((m: any) => {
 const dt = formatDateTime(m.inicio);
 const medicoNome = m.medicos?.profiles?.nome || 'Profissional';
 const especialidade = m.medicos?.especialidade || 'Geral';

 return (
 <tr key={m.id} className="hover:bg-slate-850/50 transition-colors">
 <td className="py-3.5 px-4 font-semibold text-gray-900">{medicoNome}</td>
 <td className="py-3.5 px-4 text-gray-500">{especialidade}</td>
 <td className="py-3.5 px-4 font-mono">{dt.data}</td>
 <td className="py-3.5 px-4 font-mono">{dt.hora}</td>
 <td className="py-3.5 px-4">{getStatusBadge(m.status)}</td>
 <td className="py-3.5 px-4">
 <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-100 text-gray-500 uppercase">
 {m.origem}
 </span>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </div>
 )}
 </div>
 );
}
