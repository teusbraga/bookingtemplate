/** Tool: Cria uma marcação via /api/marcacoes POST */
export async function criarMarcacao(params: {
  medico_id: string;
  inicio: string;
  fim: string;
  origem: 'whatsapp';
  observacoes?: string;
}): Promise<{ id: string } | null> {
  try {
    const res = await fetch('/api/marcacoes', {
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
