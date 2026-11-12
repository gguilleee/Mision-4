// Fábrica de claves: todas las queries de expediciones cuelgan de ['expediciones'],
// así invalidar esa raíz refresca cualquier listado, filtrado o no.
export const clavesExpediciones = {
  todas: ['expediciones'],
  listas: () => [...clavesExpediciones.todas, 'lista'],
  lista: (filtros) => [...clavesExpediciones.listas(), filtros],
};

export const clavesPokeapi = {
  tipos: ['pokeapi', 'tipos'],
};
