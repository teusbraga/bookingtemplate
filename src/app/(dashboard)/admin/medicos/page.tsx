import { createClient } from '@/lib/supabase/server';
import { Stethoscope, CheckCircle2, XCircle } from 'lucide-react';

export default async function AdminMedicosPage() {
 const supabase = await createClient();

 const { data: medicos } = await supabase
 .from('medicos')
 .select(`
 id,
 crm,
 especialidade,
 duracao_padrao_minutos,
 ativo,
 created_at,
 profiles (
 id,
 nome,
 telefone,
 email
 )
 `)
 .order('especialidade', { ascending: true });

 return (
 <div className="space-y-6">
 <div>
 <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Corpo Clínico</h1>
 <p className="text-xs sm:text-sm text-gray-500 mt-1">
 Lista de profissionais cadastrados aptos a receber agendamentos de pacientes
 </p>
 </div>

 {(!medicos || medicos.length === 0) ? (
 <div className="bg-gray-50 border border-gray-200 rounded-2xl p-12 text-center text-gray-500 space-y-2">
 <Stethoscope className="h-10 w-10 mx-auto text-gray-400" />
 <p className="text-sm font-medium">Nenhum profissional cadastrado.</p>
 </div>
 ) : (
 <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden shadow-none">
 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs text-gray-600">
 <thead className="bg-white text-gray-500 uppercase text-[10px] font-semibold tracking-wider border-b border-gray-200">
 <tr>
 <th className="py-3 px-4">Nome</th>
 <th className="py-3 px-4">Especialidade</th>
 <th className="py-3 px-4">CRM</th>
 <th className="py-3 px-4">Contato</th>
 <th className="py-3 px-4">Duração Slot</th>
 <th className="py-3 px-4">Status</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-800/60">
 {medicos.map((m: any) => {
 const nome = m.profiles?.nome || 'Médico';
 const email = m.profiles?.email || '-';
 const telefone = m.profiles?.telefone || '-';

 return (
 <tr key={m.id} className="hover:bg-slate-850/50 transition-colors">
 <td className="py-3.5 px-4">
 <div className="font-semibold text-gray-900">{nome}</div>
 <div className="text-[11px] text-gray-400">{email}</div>
 </td>
 <td className="py-3.5 px-4">
 <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30 uppercase font-semibold">
 {m.especialidade}
 </span>
 </td>
 <td className="py-3.5 px-4 font-mono text-gray-600">{m.crm}</td>
 <td className="py-3.5 px-4 font-mono text-gray-500">{telefone}</td>
 <td className="py-3.5 px-4 font-mono text-gray-600">
 {m.duracao_padrao_minutos} min
 </td>
 <td className="py-3.5 px-4">
 {m.ativo ? (
 <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-600/10 text-blue-600 border border-blue-600/20">
 <CheckCircle2 className="h-3 w-3" />
 Ativo
 </span>
 ) : (
 <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
 <XCircle className="h-3 w-3" />
 Inativo
 </span>
 )}
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
