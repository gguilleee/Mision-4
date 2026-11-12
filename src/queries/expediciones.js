import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listarExpediciones, crearExpedicion, borrarExpedicion } from '../api/expediciones.js';
import { obtenerTipos } from '../api/pokeapi.js';
import { clavesExpediciones, clavesPokeapi } from './claves.js';

export function useExpediciones(filtros) {
  return useQuery({
    queryKey: clavesExpediciones.lista(filtros),
    queryFn: ({ signal }) => listarExpediciones(filtros, signal),
    placeholderData: (anterior) => anterior, // al cambiar el filtro se mantiene la lista anterior mientras carga
  });
}

export function useTiposPokemon() {
  return useQuery({
    queryKey: clavesPokeapi.tipos,
    queryFn: ({ signal }) => obtenerTipos(signal),
    staleTime: Infinity, // los tipos Pokémon no cambian: se piden una vez por sesión
  });
}

export function useCrearExpedicion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: crearExpedicion,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: clavesExpediciones.todas }),
  });
}

export function useBorrarExpedicion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: borrarExpedicion,
    onSettled: () => queryClient.invalidateQueries({ queryKey: clavesExpediciones.todas }),
  });
}
