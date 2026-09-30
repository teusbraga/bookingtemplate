import Link from 'next/link';
import { logoutAction } from '@/app/(auth)/actions';
import { Stethoscope, Calendar, Clock, LogOut } from 'lucide-react';

export default function MedicoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans">
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link href="/medico/agenda" className="flex items-center space-x-2.5">
              <div className="h-8 w-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-blue-600 flex items-center justify-center">
                <Stethoscope className="h-4 w-4" />
              </div>
              <span className="font-bold text-gray-900 text-sm sm:text-base">Portal do Profissional</span>
            </Link>

            <nav className="hidden sm:flex items-center space-x-1 text-xs font-medium">
              <Link
                href="/medico/agenda"
                className="px-3 py-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              >
                Agenda de Hoje
              </Link>
              <Link
                href="/medico/agenda/historico"
                className="px-3 py-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              >
                Histórico
              </Link>
              <Link
                href="/medico/disponibilidade"
                className="px-3 py-1.5 rounded-lg text-blue-600 hover:bg-purple-500/10 transition-colors"
              >
                Expediente
              </Link>
            </nav>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              title="Sair da conta"
              className="p-2 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  );
}
