// La respuesta de la PokeAPI también se valida antes de usarla.
import { z } from 'zod';

const TIPOS_SIN_POKEMON = new Set(['unknown', 'shadow', 'stellar']);

export const esquemaListaTipos = z.object({
  results: z.array(z.object({ name: z.string().min(1) })).min(1),
});

/** Devuelve los nombres de tipo jugables o lanza un error legible si la respuesta no encaja. */
export function validarListaTipos(json) {
  const resultado = esquemaListaTipos.safeParse(json);
  if (!resultado.success) throw new Error('La PokeAPI devolvió una lista de tipos con un formato inesperado.');
  return resultado.data.results.map((t) => t.name).filter((nombre) => !TIPOS_SIN_POKEMON.has(nombre));
}
