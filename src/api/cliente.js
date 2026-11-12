// Única capa que llama a fetch. Comprueba response.ok y traduce los fallos a mensajes legibles.
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export class ErrorHttp extends Error {
  constructor(status) {
    super(
      status === 404
        ? 'Ese registro ya no existe en el servidor (404).'
        : `El servidor respondió con un error (HTTP ${status}).`,
    );
    this.name = 'ErrorHttp';
    this.status = status;
  }
}

export async function pedirJson(url, { method = 'GET', cuerpo, signal } = {}) {
  let respuesta;
  try {
    respuesta = await fetch(url, {
      method,
      signal,
      headers: cuerpo ? { 'Content-Type': 'application/json' } : undefined,
      body: cuerpo ? JSON.stringify(cuerpo) : undefined,
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error; // cancelada por TanStack Query: no es un fallo
    throw new Error('No se pudo conectar con el servidor. ¿Está arrancado (npm run dev)?');
  }

  if (!respuesta.ok) throw new ErrorHttp(respuesta.status);
  if (respuesta.status === 204) return null;

  try {
    return await respuesta.json();
  } catch {
    throw new Error('El servidor devolvió una respuesta que no es JSON válido.');
  }
}
