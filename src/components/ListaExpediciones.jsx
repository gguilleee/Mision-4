import { useState } from 'react';
import { useBorrarExpedicion, useExpediciones, useTiposPokemon } from '../queries/expediciones.js';
import { infoTipo } from '../data/tipos.js';
import TarjetaExpedicion from './TarjetaExpedicion.jsx';
import { Cargando, MensajeError, Vacio } from './Estados.jsx';

export default function ListaExpediciones() {
  const [tipo, setTipo] = useState('');
  const expediciones = useExpediciones({ tipo });
  const tipos = useTiposPokemon();
  const borrar = useBorrarExpedicion();

  let contenido;
  if (expediciones.isPending) {
    contenido = <Cargando mensaje="Cargando el registro de expediciones…" />;
  } else if (expediciones.isError) {
    contenido = <MensajeError mensaje={expediciones.error.message} onReintentar={() => expediciones.refetch()} />;
  } else if (expediciones.data.expediciones.length === 0) {
    contenido = (
      <Vacio
        mensaje={
          tipo
            ? `Nadie ha salido todavía hacia el tipo ${infoTipo(tipo).es}.`
            : 'Aún no hay expediciones. Registra la primera con el formulario.'
        }
      />
    );
  } else {
    contenido = (
      <div className="lista-expediciones">
        {expediciones.data.expediciones.map((expedicion) => (
          <TarjetaExpedicion
            key={expedicion.id}
            expedicion={expedicion}
            borrando={borrar.isPending && borrar.variables === expedicion.id}
            onBorrar={() => borrar.mutate(expedicion.id)}
          />
        ))}
      </div>
    );
  }

  const corruptas = expediciones.data?.corruptas ?? [];

  return (
    <div className="registro">
      <div className="registro__barra">
        <label className="campo">
          Filtrar por destino
          <select id="filtro-tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="">Todos los tipos</option>
            {tipos.data?.map((t) => (
              <option key={t} value={t}>
                {infoTipo(t).es}
              </option>
            ))}
          </select>
        </label>
        <p className="barra-estado" aria-live="polite">
          {expediciones.isFetching && !expediciones.isPending
            ? 'Actualizando…'
            : expediciones.data && `${expediciones.data.expediciones.length} expediciones`}
        </p>
      </div>

      {borrar.isError && <MensajeError mensaje={`No se pudo cancelar: ${borrar.error.message}`} />}

      {corruptas.length > 0 && (
        <details className="aviso-corruptas">
          <summary>
            ⚠ {corruptas.length} {corruptas.length === 1 ? 'registro descartado' : 'registros descartados'} por datos
            corruptos
          </summary>
          <ul>
            {corruptas.map(({ id, motivo }) => (
              <li key={id}>
                <code>{String(id)}</code>: {motivo}
              </li>
            ))}
          </ul>
        </details>
      )}

      {contenido}
    </div>
  );
}
