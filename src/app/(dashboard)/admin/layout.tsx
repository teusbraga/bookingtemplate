import Link from 'next/link';
import { logoutAction } from '@/app/(auth)/actions';
import { Shield, Users, Stethoscope, Calendar, Database, LogOut } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link href="/admin" className="flex items-center space-x-2.5">
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                <Shield className="h-4 w-4" />
              </div>
              <span className="font-bold text-white text-sm sm:text-base">Painel Administrativo</span>
            </Link>

            <nav className="hidden sm:flex items-center space-x-1 text-xs font-medium">
              <Link
                href="/admin"
                className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
              >
                Visão Geral
              </Link>
              <Link
                href="/admin/medicos"
                className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
              >
                Corpo Clínico
              </Link>
              <Link
                href="/admin/marcacoes"
                className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
              >
                Todas Marcações
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-3">
            <form action={logoutAction}>
              <button
                type="submit"
                title="Sair da conta"
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
}
