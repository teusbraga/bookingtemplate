import { createClient } from '@/lib/supabase/server';
import { User, Phone, Mail, Calendar } from 'lucide-react';

export default async function PerfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('nome, telefone, email, tipo, created_at')
    .eq('id', user?.id || '')
    .single();

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Meu Perfil</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Dados da sua conta no Booking Template
        </p>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-2xl divide-y divide-gray-200">
        <div className="flex items-center gap-3 p-4">
          <div className="p-2 rounded-lg bg-blue-600/10 text-blue-600">
            <User className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Nome</span>
            <p className="text-sm font-semibold text-gray-900">{profile?.nome || '—'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4">
          <div className="p-2 rounded-lg bg-blue-600/10 text-blue-600">
            <Phone className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
              Telefone / WhatsApp
            </span>
            <p className="text-sm font-semibold text-gray-900 font-mono">
              {profile?.telefone || '—'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4">
          <div className="p-2 rounded-lg bg-blue-600/10 text-blue-600">
            <Mail className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
              E-mail
            </span>
            <p className="text-sm font-semibold text-gray-900">{profile?.email || '—'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4">
          <div className="p-2 rounded-lg bg-blue-600/10 text-blue-600">
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
              Membro desde
            </span>
            <p className="text-sm font-semibold text-gray-900">
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })
                : '—'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-600/5 border border-blue-600/20 rounded-xl p-4 text-xs text-blue-600">
        Edição de dados cadastrais disponível em breve. Para alterar o telefone, entre em contato
        com a clínica.
      </div>
    </div>
  );
}
