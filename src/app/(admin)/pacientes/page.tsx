import { createClient } from '@/lib/supabase/server';
import { Users } from 'lucide-react';

export default async function PacientesPage() {
  const supabase = await createClient();

  const { data: pacientes } = await supabase
    .from('profiles')
    .select('id, nome, telefone, email, created_at')
    .eq('tipo', 'cliente')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Diretório de Pacientes</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Todos os pacientes cadastrados no sistema
        </p>
      </div>

      {!pacientes || pacientes.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-12 text-center text-gray-500 space-y-2">
          <Users className="h-10 w-10 mx-auto text-gray-400" />
          <p className="text-sm font-medium">Nenhum paciente cadastrado ainda.</p>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-white text-gray-500 uppercase text-[10px] font-semibold tracking-wider border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Nome</th>
                  <th className="py-3 px-4">Telefone</th>
                  <th className="py-3 px-4">E-mail</th>
                  <th className="py-3 px-4">Cadastro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pacientes.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-100/50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-gray-900">{p.nome}</td>
                    <td className="py-3.5 px-4 font-mono text-gray-500">{p.telefone}</td>
                    <td className="py-3.5 px-4 text-gray-500">{p.email || '—'}</td>
                    <td className="py-3.5 px-4 font-mono text-gray-400">
                      {new Date(p.created_at).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
