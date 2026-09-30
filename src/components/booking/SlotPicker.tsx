'use client';

import React from 'react';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';

export interface TimeSlot {
 slot_inicio: string; // ISO
 slot_fim: string; // ISO
 disponivel: boolean;
}

interface SlotPickerProps {
 slots: TimeSlot[];
 selectedSlot: TimeSlot | null;
 onSelectSlot: (slot: TimeSlot) => void;
 loading?: boolean;
}

export function SlotPicker({
 slots,
 selectedSlot,
 onSelectSlot,
 loading = false,
}: SlotPickerProps) {
 function formatTime(isoString: string) {
 try {
 const date = new Date(isoString);
 return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
 } catch {
 return isoString;
 }
 }

 if (loading) {
 return (
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 animate-pulse py-2">
 {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
 <div key={i} className="h-14 rounded-xl bg-gray-100/60 border border-gray-300/50" />
 ))}
 </div>
 );
 }

 if (slots.length === 0) {
 return (
 <div className="text-center py-8 px-4 rounded-2xl bg-gray-50/60 border border-gray-200 text-gray-500 space-y-2">
 <Clock className="h-8 w-8 mx-auto text-gray-400" />
 <p className="text-sm font-medium">Nenhum horário disponível para esta data.</p>
 <p className="text-xs text-gray-400">
 O médico pode não atender neste dia da semana ou a agenda já pode estar cheia.
 </p>
 </div>
 );
 }

 return (
 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
 {slots.map((slot, index) => {
 const isSelected = selectedSlot?.slot_inicio === slot.slot_inicio;
 const isAvailable = slot.disponivel;

 return (
 <button
 key={index}
 type="button"
 disabled={!isAvailable}
 onClick={() => onSelectSlot(slot)}
 className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
 isSelected
 ? 'bg-blue-600/20 border-blue-600 text-emerald-300 ring-2 ring-blue-600/30 shadow-none'
 : isAvailable
 ? 'bg-gray-50/80 border-gray-200 hover:border-gray-300 hover:bg-slate-850 text-gray-800'
 : 'bg-white/40 border-gray-200 text-slate-600 cursor-not-allowed opacity-50'
 }`}
 >
 <div className="flex items-center justify-between">
 <span className="font-mono text-sm font-bold">
 {formatTime(slot.slot_inicio)}
 </span>
 {isAvailable ? (
 isSelected ? (
 <CheckCircle2 className="h-4 w-4 text-blue-600" />
 ) : (
 <span className="h-2 w-2 rounded-full bg-blue-600/80" />
 )
 ) : (
 <XCircle className="h-3.5 w-3.5 text-rose-500/60" />
 )}
 </div>
 <span className="text-[11px] font-sans mt-1 text-gray-500">
 até {formatTime(slot.slot_fim)}
 </span>
 </button>
 );
 })}
 </div>
 );
}
