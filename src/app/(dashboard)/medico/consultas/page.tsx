import { createClient } from '@/lib/supabase/server';
import { Calendar, Clock, Phone, AlertCircle } from 'lucide-react';

export default async function TodasConsultasMedicoPage() {
 const supabase = await createClient();
 const {
 data: { user },
 } = await supabase.auth.getUser();

 const { data: medico } = await supabase
 .from('medicos')
 .select('id')
 .eq('profile_id', user?.id || '')
 .single();

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
 profiles (
 id,
 nome,
 telefone,
 email
 )
 `)
 .eq('medico_id', medico?.id || '')
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

 return (
 <div className="space-y-6">
 <div>
 <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Todas as Consultas</h1>
 <p className="text-xs sm:text-sm text-gray-500 mt-1">
 Registro completo de todos os agendamentos registrados no sistema
 </p>
 </div>

 {(!marcacoes || marcacoes.length === 0) ? (
 <div className="bg-gray-50 border border-gray-200 rounded-2xl p-12 text-center text-gray-500 space-y-2">
 <Calendar className="h-10 w-10 mx-auto text-gray-400" />
 <p className="text-sm font-medium">Nenhum registro encontrado.</p>
 </div>
 ) : (
 <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden shadow-none">
 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs text-gray-600">
 <thead className="bg-white text-gray-500 uppercase text-[10px] font-semibold tracking-wider border-b border-gray-200">
 <tr>
 <th className="py-3 px-4">Paciente</th>
 <th className="py-3 px-4">Contato</th>
 <th className="py-3 px-4">Data</th>
 <th className="py-3 px-4">Horário</th>
 <th className="py-3 px-4">Status</th>
 <th className="py-3 px-4">Origem</th>
 <th className="py-3 px-4">Notas</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-800/60">
 {marcacoes.map((m: any) => {
 const dt = formatDateTime(m.inicio);
 const pacienteNome = m.profiles?.nome || 'Paciente';
 const pacienteTelefone = m.profiles?.telefone || '-';

 return (
 <tr key={m.id} className="hover:bg-slate-850/50 transition-colors">
 <td className="py-3.5 px-4 font-semibold text-gray-900">{pacienteNome}</td>
 <td className="py-3.5 px-4 font-mono text-gray-500">{pacienteTelefone}</td>
 <td className="py-3.5 px-4 font-mono">{dt.data}</td>
 <td className="py-3.5 px-4 font-mono text-purple-300">{dt.hora}</td>
 <td className="py-3.5 px-4">
 <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">
 {m.status}
 </span>
 </td>
 <td className="py-3.5 px-4">
 <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-gray-500 uppercase">
 {m.origem}
 </span>
 </td>
 <td className="py-3.5 px-4 text-gray-500 max-w-xs truncate">
 {m.observacoes || '-'}
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
