// Única fuente de verdad de la validación: el formulario, las opciones de los
// selects y la comprobación de lo que devuelve el servidor salen de aquí.
import { z } from 'zod';

export const EXPERIENCIAS = ['novato', 'veterano', 'maestro'];
export const DIAS_MAXIMOS_NOVATO = 7;

const hoyISO = () => new Date().toLocaleDateString('sv-SE'); // "AAAA-MM-DD" en hora local

/** Campos que guarda el servidor (comunes al formulario y a la respuesta). */
const camposExpedicion = {
  nombre: z
    .string()
    .trim()
    .min(2, { error: 'El nombre necesita al menos 2 letras.' })
    .max(40, { error: 'Máximo 40 caracteres.' })
    .regex(/^[\p{L} '-]+$/u, { error: 'Solo letras, espacios, guiones y apóstrofos.' }),
  alias: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, { error: 'El alias necesita entre 3 y 16 caracteres.' })
    .max(16, { error: 'El alias necesita entre 3 y 16 caracteres.' })
    .regex(/^[a-z0-9_]+$/, { error: 'Solo minúsculas, números y guion bajo (sin espacios).' }),
  email: z.email({ error: 'Escribe un correo válido, por ejemplo ash@pueblopaleta.com.' }),
  tipoDestino: z
    .string({ error: 'Elige el tipo al que vas de expedición.' })
    .min(1, { error: 'Elige el tipo al que vas de expedición.' }),
  fechaSalida: z.iso.date({ error: 'Elige una fecha de salida.' }),
  dias: z
    .number({ error: 'Indica cuántos días dura la expedición.' })
    .int({ error: 'Los días tienen que ser un número entero.' })
    .min(1, { error: 'Como mínimo 1 día.' })
    .max(30, { error: 'Como máximo 30 días.' }),
  experiencia: z.enum(EXPERIENCIAS, { error: 'Elige tu nivel de experiencia.' }),
  companero: z
    .string()
    .trim()
    .toLowerCase()
    .max(20, { error: 'Máximo 20 caracteres.' })
    .regex(/^[a-z-]*$/, { error: 'Escribe el nombre en inglés, sin espacios (p. ej. pikachu, mr-mime).' }),
  notas: z.string().trim().max(200, { error: 'Máximo 200 caracteres.' }),
};

/** Lo que valida el formulario antes de enviar nada. */
export const esquemaFormulario = z
  .object({
    ...camposExpedicion,
    aceptaNormas: z.literal(true, { error: 'Tienes que aceptar las normas de la expedición.' }),
  })
  // Refinamientos que relacionan varios campos o dependen de la fecha actual.
  .superRefine((datos, ctx) => {
    if (datos.fechaSalida < hoyISO()) {
      ctx.addIssue({ code: 'custom', path: ['fechaSalida'], message: 'La salida no puede ser en el pasado.' });
    }
    if (datos.experiencia === 'novato' && datos.dias > DIAS_MAXIMOS_NOVATO) {
      ctx.addIssue({
        code: 'custom',
        path: ['dias'],
        message: `Un explorador novato no puede salir más de ${DIAS_MAXIMOS_NOVATO} días.`,
      });
    }
  });

/** Lo que esperamos que devuelva el servidor por cada expedición (BONUS: se comprueba con safeParse). */
export const esquemaExpedicion = z.object({
  id: z.union([z.string(), z.number()]),
  ...camposExpedicion,
  creadaEn: z.iso.datetime({ error: 'Fecha de creación inválida.' }),
});

export const valoresIniciales = {
  nombre: '',
  alias: '',
  email: '',
  tipoDestino: '',
  fechaSalida: '',
  dias: 3,
  experiencia: 'novato',
  companero: '',
  notas: '',
  aceptaNormas: false,
};

/** Separa las expediciones válidas de las corruptas sin tumbar la lista entera. */
export function validarListaExpediciones(datos) {
  if (!Array.isArray(datos)) {
    throw new Error('El servidor devolvió algo que no es una lista de expediciones.');
  }
  const resultados = datos.map((item) => ({ item, resultado: esquemaExpedicion.safeParse(item) }));
  return {
    expediciones: resultados.filter(({ resultado }) => resultado.success).map(({ resultado }) => resultado.data),
    corruptas: resultados
      .filter(({ resultado }) => !resultado.success)
      .map(({ item, resultado }) => ({
        id: item?.id ?? '¿sin id?',
        motivo: resultado.error.issues.map((i) => `${i.path.join('.') || 'registro'}: ${i.message}`).join(' · '),
      })),
  };
}
