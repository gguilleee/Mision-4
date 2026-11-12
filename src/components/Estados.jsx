export function Cargando({ mensaje }) {
  return (
    <p className="estado estado--cargando" role="status">
      {mensaje}
    </p>
  );
}

export function MensajeError({ mensaje, onReintentar }) {
  return (
    <div className="estado estado--error" role="alert">
      <p>⚠ {mensaje}</p>
      {onReintentar && (
        <button className="boton" type="button" onClick={onReintentar}>
          Reintentar
        </button>
      )}
    </div>
  );
}

export function Vacio({ mensaje }) {
  return <p className="estado estado--vacio">{mensaje}</p>;
}

export function Exito({ children, onCerrar }) {
  return (
    <div className="estado estado--exito" role="status">
      <p>✓ {children}</p>
      {onCerrar && (
        <button className="enlace enlace--exito" type="button" onClick={onCerrar}>
          Cerrar
        </button>
      )}
    </div>
  );
}
