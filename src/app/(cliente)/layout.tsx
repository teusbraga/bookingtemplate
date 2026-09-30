import Link from 'next/link';
import { logoutAction } from '@/app/(auth)/actions';
import { Calendar, Plus, Clock, LogOut } from 'lucide-react';

export default function ClienteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans">
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link href="/cliente/consultas" className="flex items-center space-x-2.5">
              <div className="h-8 w-8 rounded-lg bg-blue-600/10 border border-blue-600/20 text-blue-600 flex items-center justify-center">
                <Calendar className="h-4 w-4" />
              </div>
              <span className="font-bold text-gray-900 text-sm sm:text-base">Portal do Paciente</span>
            </Link>

            <nav className="hidden sm:flex items-center space-x-1 text-xs font-medium">
              <Link
                href="/cliente/consultas"
                className="px-3 py-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              >
                Minhas Consultas
              </Link>
              <Link
                href="/cliente/agendar"
                className="px-3 py-1.5 rounded-lg text-blue-600 hover:bg-blue-600/10 transition-colors"
              >
                Novo Agendamento
              </Link>
              <Link
                href="/cliente/perfil"
                className="px-3 py-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              >
                Perfil
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/cliente/agendar"
              className="inline-flex sm:hidden items-center gap-1.5 bg-blue-600 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-semibold"
            >
              <Plus className="h-3.5 w-3.5" />
              Agendar
            </Link>

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
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  );
}
