'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { TipoUsuario } from '@/lib/supabase/types';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const redirectTo = (formData.get('redirect') as string) || '';

  if (!email || !password) {
    return { error: 'E-mail e senha são obrigatórios.' };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: 'Credenciais inválidas: ' + error.message };
  }

  // Verifica o tipo de usuário no profile para redirecionar corretamente
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('tipo')
      .eq('id', user.id)
      .single();

    if (redirectTo && redirectTo.startsWith('/')) {
      redirect(redirectTo);
    }

    if (profile?.tipo === 'medico') {
      redirect('/medico');
    } else if (profile?.tipo === 'admin') {
      redirect('/admin');
    } else {
      redirect('/cliente');
    }
  }

  redirect('/cliente');
}

export async function registerAction(formData: FormData) {
  const nome = formData.get('nome') as string;
  const email = formData.get('email') as string;
  const telefone = formData.get('telefone') as string;
  const password = formData.get('password') as string;
  const tipo = (formData.get('tipo') as TipoUsuario) || 'cliente';

  if (!nome || !email || !telefone || !password) {
    return { error: 'Preencha todos os campos obrigatórios.' };
  }

  const supabase = await createClient();

  // 1. Cria usuário no auth.users
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    return { error: authError.message };
  }

  if (authData.user) {
    // 2. Cria registro correspondente em public.profiles
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      nome,
      telefone,
      email,
      tipo,
    });

    if (profileError) {
      return { error: 'Erro ao criar perfil: ' + profileError.message };
    }
  }

  redirect('/confirmar');
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
