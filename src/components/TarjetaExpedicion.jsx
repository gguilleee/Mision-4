import { infoTipo } from '../data/tipos.js';

const formatearFecha = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });

export default function TarjetaExpedicion({ expedicion, borrando, onBorrar }) {
  const { nombre, alias, tipoDestino, fechaSalida, dias, experiencia, companero, notas } = expedicion;
  const { es, color, claro } = infoTipo(tipoDestino);

  return (
    <article className="expedicion" style={{ '--color-tipo': color }}>
      <header className="expedicion__cabecera">
        <h3 className="expedicion__nombre">{nombre}</h3>
        <span className={`insignia${claro ? ' insignia--clara' : ''}`} style={{ '--color-tipo': color }}>
          {es}
        </span>
      </header>
      <p className="expedicion__alias">
        @{alias} · {experiencia}
      </p>
      <p className="expedicion__datos">
        Sale el {formatearFecha(fechaSalida)} · {dias} {dias === 1 ? 'día' : 'días'}
        {companero && <> · con {companero}</>}
      </p>
      {notas && <p className="expedicion__notas">«{notas}»</p>}
      <button className="enlace" type="button" onClick={onBorrar} disabled={borrando}>
        {borrando ? 'Cancelando…' : 'Cancelar expedición'}
      </button>
    </article>
  );
}
