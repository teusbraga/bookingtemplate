import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

/**
 * Supabase Auth callback — chamado após magic-link, OAuth, or OTP confirm.
 * O middleware já renova a sessão via cookie; aqui apenas redirecionamos
 * para o portal correto com base no perfil.
 */
export default async function CallbackPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('tipo')
    .eq('id', user.id)
    .single();

  if (profile?.tipo === 'medico') redirect('/medico/agenda');
  if (profile?.tipo === 'admin') redirect('/admin/dashboard');
  redirect('/cliente/consultas');
}
