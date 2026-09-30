/** Tool: Consulta horários disponíveis via /api/medicos/[id]/horarios-disponiveis */
export async function consultarHorarios(medicoId: string, data: string): Promise<unknown[]> {
  try {
    const res = await fetch(`/api/medicos/${medicoId}/horarios-disponiveis?data=${data}`);
    const json = await res.json();
    return (json.slots || []).filter((s: any) => s.disponivel);
  } catch {
    return [];
  }
}
