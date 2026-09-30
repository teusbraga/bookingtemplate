/** Tool: Cancela uma marcação via DELETE /api/marcacoes/[id] */
export async function cancelarMarcacao(marcacaoId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/marcacoes/${marcacaoId}`, { method: 'DELETE' });
    return res.ok;
  } catch {
    return false;
  }
}
