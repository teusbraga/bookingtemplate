'use client';

import React from 'react';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';

export interface TimeSlot {
  slot_inicio: string; // ISO
  slot_fim: string;    // ISO
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
          <div key={i} className="h-14 rounded-xl bg-slate-800/60 border border-slate-700/50" />
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="text-center py-8 px-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-400 space-y-2">
        <Clock className="h-8 w-8 mx-auto text-slate-500" />
        <p className="text-sm font-medium">Nenhum horário disponível para esta data.</p>
        <p className="text-xs text-slate-500">
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
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30 shadow-md'
                : isAvailable
                ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850 text-slate-200'
                : 'bg-slate-950/40 border-slate-900 text-slate-600 cursor-not-allowed opacity-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-bold">
                {formatTime(slot.slot_inicio)}
              </span>
              {isAvailable ? (
                isSelected ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-emerald-500/80" />
                )
              ) : (
                <XCircle className="h-3.5 w-3.5 text-rose-500/60" />
              )}
            </div>
            <span className="text-[11px] font-sans mt-1 text-slate-400">
              até {formatTime(slot.slot_fim)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
