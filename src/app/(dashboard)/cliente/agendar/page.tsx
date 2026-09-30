'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SlotPicker, TimeSlot } from '@/components/booking/SlotPicker';
import { Calendar, User, Clock, CheckCircle2, AlertCircle, ArrowLeft, Stethoscope } from 'lucide-react';
import Link from 'next/link';

interface Medico {
 id: string;
 crm: string;
 especialidade: string;
 duracao_padrao_minutos: number;
 profiles: {
 id: string;
 nome: string;
 telefone: string;
 };
}

export default function AgendarPage() {
 const router = useRouter();

 // Estados do formulário
 const [medicos, setMedicos] = useState<Medico[]>([]);
 const [selectedMedico, setSelectedMedico] = useState<Medico | null>(null);
 const [selectedData, setSelectedData] = useState<string>(
 new Date(Date.now() + 86400000).toISOString().split('T')[0] // Amanhã como default
 );
 const [slots, setSlots] = useState<TimeSlot[]>([]);
 const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
 const [observacoes, setObservacoes] = useState('');

 // Estados de feedback
 const [loadingMedicos, setLoadingMedicos] = useState(true);
 const [loadingSlots, setLoadingSlots] = useState(false);
 const [submitting, setSubmitting] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [success, setSuccess] = useState(false);

 // 1. Carrega lista de médicos
 useEffect(() => {
 async function fetchMedicos() {
 try {
 const res = await fetch('/api/medicos');
 const json = await res.json();
 if (json.data) {
 setMedicos(json.data);
 if (json.data.length > 0) {
 setSelectedMedico(json.data[0]);
 }
 }
 } catch (err) {
 setError('Erro ao carregar médicos');
 } finally {
 setLoadingMedicos(false);
 }
 }
 fetchMedicos();
 }, []);

 // 2. Carrega slots disponíveis quando médico ou data mudam
 useEffect(() => {
 if (!selectedMedico || !selectedData) return;

 async function fetchSlots() {
 setLoadingSlots(true);
 setSelectedSlot(null);
 setError(null);

 try {
 const res = await fetch(`/api/medicos/${selectedMedico?.id}/slots?data=${selectedData}`);
 const json = await res.json();
 if (json.slots) {
 setSlots(json.slots);
 } else if (json.error) {
 setError(json.error);
 }
 } catch {
 setError('Erro ao buscar horários disponíveis');
 } finally {
 setLoadingSlots(false);
 }
 }

 fetchSlots();
 }, [selectedMedico, selectedData]);

 // 3. Submete o agendamento
 async function handleConfirmBooking() {
 if (!selectedMedico || !selectedSlot) return;

 setSubmitting(true);
 setError(null);

 try {
 const res = await fetch('/api/marcacoes', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 medico_id: selectedMedico.id,
 inicio: selectedSlot.slot_inicio,
 fim: selectedSlot.slot_fim,
 origem: 'site',
 observacoes,
 }),
 });

 const json = await res.json();

 if (!res.ok) {
 // Trata conflito 409 (ACID Postgres exclusion constraint)
 setError(json.error || 'Erro ao realizar agendamento.');
 setSubmitting(false);
 return;
 }

 setSuccess(true);
 setTimeout(() => {
 router.push('/cliente');
 }, 2000);
 } catch {
 setError('Erro de conexão com o servidor.');
 setSubmitting(false);
 }
 }

 if (success) {
 return (
 <div className="max-w-xl mx-auto py-12 text-center space-y-4">
 <div className="h-16 w-16 rounded-full bg-blue-600/10 text-blue-600 mx-auto flex items-center justify-center border border-blue-600/20">
 <CheckCircle2 className="h-8 w-8" />
 </div>
 <h2 className="text-2xl font-bold text-gray-900">Consulta Confirmada!</h2>
 <p className="text-sm text-gray-500">
 Seu horário foi reservado com sucesso no sistema sem conflito de horários.
 </p>
 <p className="text-xs text-gray-400">Redirecionando para seu painel...</p>
 </div>
 );
 }

 return (
 <div className="max-w-3xl mx-auto space-y-6">
 {/* Top back button */}
 <Link
 href="/cliente"
 className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors"
 >
 <ArrowLeft className="h-3.5 w-3.5" />
 Voltar para o início
 </Link>

 <div>
 <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Novo Agendamento</h1>
 <p className="text-xs sm:text-sm text-gray-500 mt-1">
 Selecione o profissional, a data e o horário desejado
 </p>
 </div>

 {error && (
 <div className="flex items-start gap-2.5 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
 <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
 <span>{error}</span>
 </div>
 )}

 {/* Etapa 1: Selecionar Especialidade / Profissional */}
 <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-4">
 <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
 <Stethoscope className="h-4 w-4 text-blue-600" />
 1. Escolha o Profissional
 </h2>

 {loadingMedicos ? (
 <div className="h-20 bg-gray-100/40 rounded-xl animate-pulse" />
 ) : (
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 {medicos.map((m) => {
 const isSelected = selectedMedico?.id === m.id;
 return (
 <button
 key={m.id}
 type="button"
 onClick={() => setSelectedMedico(m)}
 className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
 isSelected
 ? 'bg-blue-600/15 border-blue-600 text-emerald-300 ring-2 ring-blue-600/20 shadow-none'
 : 'bg-white/60 border-gray-200 hover:border-gray-300 text-gray-800'
 }`}
 >
 <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
 {m.especialidade}
 </span>
 <div className="text-sm font-bold text-gray-900 mt-1.5">{m.profiles?.nome}</div>
 <div className="text-xs text-gray-500 font-mono mt-0.5">{m.crm}</div>
 </button>
 );
 })}
 </div>
 )}
 </div>

 {/* Etapa 2: Selecionar Data */}
 <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-4">
 <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
 <Calendar className="h-4 w-4 text-blue-600" />
 2. Escolha o Dia
 </h2>

 <div>
 <input
 type="date"
 min={new Date().toISOString().split('T')[0]}
 value={selectedData}
 onChange={(e) => setSelectedData(e.target.value)}
 className="w-full sm:w-auto bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-600 transition-colors"
 />
 </div>
 </div>

 {/* Etapa 3: Selecionar Horário Disponível */}
 <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-4">
 <div className="flex items-center justify-between">
 <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
 <Clock className="h-4 w-4 text-blue-600" />
 3. Horários Disponíveis
 </h2>
 {selectedSlot && (
 <span className="text-xs text-blue-600 font-mono font-bold">
 Selecionado:{' '}
 {new Date(selectedSlot.slot_inicio).toLocaleTimeString([], {
 hour: '2-digit',
 minute: '2-digit',
 })}
 </span>
 )}
 </div>

 <SlotPicker
 slots={slots}
 selectedSlot={selectedSlot}
 onSelectSlot={setSelectedSlot}
 loading={loadingSlots}
 />
 </div>

 {/* Etapa 4: Observações e Confirmação */}
 <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-4">
 <label className="text-xs font-medium text-gray-600">
 Observações / Motivo da Consulta (opcional)
 </label>
 <textarea
 rows={2}
 value={observacoes}
 onChange={(e) => setObservacoes(e.target.value)}
 placeholder="Ex: Primeira consulta, check-up de rotina, etc."
 className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm text-gray-900 placeholder-slate-500 focus:outline-none focus:border-blue-600 transition-colors"
 />

 <button
 type="button"
 disabled={!selectedSlot || submitting}
 onClick={handleConfirmBooking}
 className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-slate-950 font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-none cursor-pointer"
 >
 {submitting ? 'Confirmando no banco de dados...' : 'Confirmar Agendamento'}
 <CheckCircle2 className="h-4 w-4" />
 </button>
 </div>
 </div>
 );
}
