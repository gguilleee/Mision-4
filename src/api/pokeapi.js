import { pedirJson } from './cliente.js';
import { validarListaTipos } from '../schemas/pokeapi.js';

export async function obtenerTipos(signal) {
  const json = await pedirJson('https://pokeapi.co/api/v2/type?limit=50', { signal });
  return validarListaTipos(json);
}
