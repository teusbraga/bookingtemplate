import Link from 'next/link';
import { logoutAction } from '@/app/(auth)/actions';
import { Shield, LogOut } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans">
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link href="/admin/dashboard" className="flex items-center space-x-2.5">
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                <Shield className="h-4 w-4" />
              </div>
              <span className="font-bold text-gray-900 text-sm sm:text-base">Painel Administrativo</span>
            </Link>

            <nav className="hidden sm:flex items-center space-x-1 text-xs font-medium">
              <Link href="/admin/dashboard" className="px-3 py-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                Dashboard
              </Link>
              <Link href="/admin/medicos" className="px-3 py-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                Médicos
              </Link>
              <Link href="/admin/pacientes" className="px-3 py-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                Pacientes
              </Link>
              <Link href="/admin/conversas" className="px-3 py-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                Bot WhatsApp
              </Link>
              <Link href="/admin/logs" className="px-3 py-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                Logs
              </Link>
            </nav>
          </div>

          <form action={logoutAction}>
            <button type="submit" title="Sair" className="p-2 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-gray-50 transition-colors cursor-pointer">
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  );
}
