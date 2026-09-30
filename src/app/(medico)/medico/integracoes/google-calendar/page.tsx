import Link from 'next/link';
import { Calendar, ExternalLink } from 'lucide-react';

/**
 * Integração Google Calendar — Médico
 * Permite ao médico conectar sua agenda Google para bloqueio reverso:
 * eventos do Google bloqueiam slots no Booking Template (Fase 4).
 */
export default function GoogleCalendarMedicoPage() {
  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Google Calendar — Médico</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Sincronização reversa: eventos do Google bloqueiam slots automaticamente
        </p>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Conectar agenda Google</h2>
            <p className="text-xs text-gray-500">Escopo: calendar.events (leitura + criação)</p>
          </div>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-600">
          Disponível na Fase 4 — sincronização bidirecional com Google Calendar API v3.
        </div>

        <button
          disabled
          className="w-full flex items-center justify-center gap-2 bg-blue-600 opacity-40 text-slate-950 font-semibold py-2.5 px-4 rounded-xl text-sm cursor-not-allowed"
        >
          <ExternalLink className="h-4 w-4" />
          Conectar com Google
        </button>
      </div>
    </div>
  );
}
