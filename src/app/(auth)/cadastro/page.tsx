'use client';

import { useState } from 'react';
import Link from 'next/link';
import { registerAction } from '../actions';
import { Calendar, Lock, Mail, User, Phone, Stethoscope, AlertCircle, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
 const [error, setError] = useState<string | null>(null);
 const [loading, setLoading] = useState(false);
 const [tipo, setTipo] = useState<'cliente' | 'medico'>('cliente');

 async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
 e.preventDefault();
 setError(null);
 setLoading(true);

 const formData = new FormData(e.currentTarget);
 formData.set('tipo', tipo);

 try {
 const result = await registerAction(formData);
 if (result?.error) {
 setError(result.error);
 setLoading(false);
 }
 } catch (err) {
 // Next.js redirect
 }
 }

 return (
 <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center p-4">
 <div className="w-full max-w-md space-y-6">
 {/* Brand */}
 <div className="text-center space-y-2">
 <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-600 border border-blue-600/20 mb-2">
 <Calendar className="h-6 w-6" />
 </div>
 <h1 className="text-2xl font-bold tracking-tight text-gray-900">Criar Nova Conta</h1>
 <p className="text-sm text-gray-500">
 Cadastre-se para agendar consultas ou disponibilizar sua agenda
 </p>
 </div>

 {/* Card */}
 <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-none space-y-5">
 {/* Tipo de Perfil */}
 <div className="grid grid-cols-2 gap-2 p-1 bg-white rounded-xl border border-gray-200">
 <button
 type="button"
 onClick={() => setTipo('cliente')}
 className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
 tipo === 'cliente'
 ? 'bg-gray-100 text-blue-600 shadow-none'
 : 'text-gray-500 hover:text-gray-900'
 }`}
 >
 <User className="h-4 w-4" />
 Sou Paciente
 </button>
 <button
 type="button"
 onClick={() => setTipo('medico')}
 className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
 tipo === 'medico'
 ? 'bg-gray-100 text-blue-600 shadow-none'
 : 'text-gray-500 hover:text-gray-900'
 }`}
 >
 <Stethoscope className="h-4 w-4" />
 Sou Profissional
 </button>
 </div>

 {error && (
 <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
 <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
 <span>{error}</span>
 </div>
 )}

 <form onSubmit={handleSubmit} className="space-y-3.5">
 <div className="space-y-1.5">
 <label className="text-xs font-medium text-gray-600">Nome Completo</label>
 <div className="relative">
 <User className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
 <input
 name="nome"
 type="text"
 required
 placeholder={tipo === 'medico' ? 'Dr. Nome Sobrenome' : 'Seu nome completo'}
 className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-sm text-gray-900 placeholder-slate-500 focus:outline-none focus:border-blue-600 transition-colors"
 />
 </div>
 </div>

 <div className="space-y-1.5">
 <label className="text-xs font-medium text-gray-600">Telefone / WhatsApp</label>
 <div className="relative">
 <Phone className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
 <input
 name="telefone"
 type="tel"
 required
 placeholder="+5511999998888"
 className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-sm text-gray-900 placeholder-slate-500 focus:outline-none focus:border-blue-600 transition-colors"
 />
 </div>
 </div>

 <div className="space-y-1.5">
 <label className="text-xs font-medium text-gray-600">E-mail</label>
 <div className="relative">
 <Mail className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
 <input
 name="email"
 type="email"
 required
 placeholder="seu@email.com"
 className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-sm text-gray-900 placeholder-slate-500 focus:outline-none focus:border-blue-600 transition-colors"
 />
 </div>
 </div>

 <div className="space-y-1.5">
 <label className="text-xs font-medium text-gray-600">Senha</label>
 <div className="relative">
 <Lock className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
 <input
 name="password"
 type="password"
 required
 placeholder="•••••••• (mínimo 6 caracteres)"
 className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-sm text-gray-900 placeholder-slate-500 focus:outline-none focus:border-blue-600 transition-colors"
 />
 </div>
 </div>

 <button
 type="submit"
 disabled={loading}
 className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-slate-950 font-semibold py-2.5 px-4 rounded-xl text-sm transition-all shadow-none cursor-pointer mt-2"
 >
 {loading ? 'Cadastrando...' : 'Finalizar Cadastro'}
 <ArrowRight className="h-4 w-4" />
 </button>
 </form>

 <div className="text-center pt-2 border-t border-gray-200/80">
 <p className="text-xs text-gray-500">
 Já tem uma conta?{' '}
 <Link href="/login" className="text-blue-600 hover:text-emerald-300 font-medium">
 Faça login
 </Link>
 </p>
 </div>
 </div>
 </div>
 </div>
 );
}
