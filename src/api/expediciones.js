// Endpoints del registro de expediciones (json-server en local).
import { API_URL, pedirJson } from './cliente.js';
import { validarListaExpediciones, esquemaExpedicion } from '../schemas/expedicion.js';

export class ErrorAliasOcupado extends Error {
  constructor(alias) {
    super(`El alias «${alias}» ya está registrado. Elige otro.`);
    this.name = 'ErrorAliasOcupado';
  }
}

/** Lista las expediciones (filtradas por tipo si se indica), validando cada una con Zod. */
export async function listarExpediciones({ tipo }, signal) {
  const parametros = new URLSearchParams({ _sort: '-creadaEn' });
  if (tipo) parametros.set('tipoDestino', tipo);
  const datos = await pedirJson(`${API_URL}/expediciones?${parametros}`, { signal });
  return validarListaExpediciones(datos);
}

/** Crea una expedición. Antes comprueba que el alias no esté ya usado. */
export async function crearExpedicion(datosFormulario) {
  const { aceptaNormas: _aceptaNormas, ...datos } = datosFormulario;

  const existentes = await pedirJson(`${API_URL}/expediciones?alias=${encodeURIComponent(datos.alias)}`);
  if (Array.isArray(existentes) && existentes.length > 0) throw new ErrorAliasOcupado(datos.alias);

  const creada = await pedirJson(`${API_URL}/expediciones`, {
    method: 'POST',
    cuerpo: { ...datos, creadaEn: new Date().toISOString() },
  });
  const resultado = esquemaExpedicion.safeParse(creada);
  if (!resultado.success) throw new Error('El servidor guardó la expedición pero devolvió datos inesperados.');
  return resultado.data;
}

export function borrarExpedicion(id) {
  return pedirJson(`${API_URL}/expediciones/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
