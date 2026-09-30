/** Tool: Cria ou recupera perfil de cliente via /api/clientes (Phase 3) */
export async function cadastrarCliente(params: {
  nome: string;
  telefone: string;
  email?: string;
}): Promise<{ id: string; nome: string; telefone: string } | null> {
  try {
    const res = await fetch('/api/clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}
