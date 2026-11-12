/** Etiqueta + control + mensaje de error accesible. El control recibe sus props aria desde propsCampo. */
export function propsCampo(id, error, ayuda) {
  const descripciones = [ayuda && `${id}-ayuda`, error && `${id}-error`].filter(Boolean).join(' ');
  return {
    id,
    'aria-invalid': error ? 'true' : 'false',
    'aria-describedby': descripciones || undefined,
  };
}

export default function Campo({ id, etiqueta, error, ayuda, obligatorio = false, children }) {
  return (
    <div className={`campo-form${error ? ' campo-form--error' : ''}`}>
      <label htmlFor={id} className="campo-form__etiqueta">
        {etiqueta}
        {obligatorio && <span aria-hidden="true"> *</span>}
      </label>
      {children}
      {ayuda && (
        <p id={`${id}-ayuda`} className="campo-form__ayuda">
          {ayuda}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="campo-form__error" role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
}
