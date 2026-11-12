import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { esquemaFormulario, valoresIniciales, EXPERIENCIAS, DIAS_MAXIMOS_NOVATO } from '../schemas/expedicion.js';
import { useCrearExpedicion, useTiposPokemon } from '../queries/expediciones.js';
import { ErrorAliasOcupado } from '../api/expediciones.js';
import { infoTipo } from '../data/tipos.js';
import Campo, { propsCampo } from './Campo.jsx';
import { Exito, MensajeError } from './Estados.jsx';

const ETIQUETAS_EXPERIENCIA = { novato: 'Novato', veterano: 'Veterano', maestro: 'Maestro' };
const MAX_NOTAS = 200;

/**
 * Formulario NO controlado: React Hook Form guarda los valores en el DOM (register)
 * y solo re-renderiza cuando cambian los errores o los valores que observamos con watch.
 */
export default function FormularioExpedicion() {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(esquemaFormulario),
    defaultValues: valoresIniciales,
    mode: 'onTouched', // valida cada campo al salir de él, y en vivo una vez que ha fallado
  });

  const tipos = useTiposPokemon();
  const crear = useCrearExpedicion();

  const experiencia = watch('experiencia');
  const notas = watch('notas') ?? '';

  async function enviar(datos) {
    try {
      await crear.mutateAsync(datos);
      reset();
    } catch (error) {
      // El alias repetido es un error de un campo concreto: se muestra junto a ese campo.
      if (error instanceof ErrorAliasOcupado) {
        setError('alias', { type: 'servidor', message: error.message }, { shouldFocus: true });
      }
    }
  }

  const errorGeneral = crear.isError && !(crear.error instanceof ErrorAliasOcupado) ? crear.error : null;

  return (
    <form className="formulario" onSubmit={handleSubmit(enviar)} noValidate>
      {crear.isSuccess && (
        <Exito onCerrar={crear.reset}>
          Expedición de <strong>{crear.data.nombre}</strong> registrada con destino{' '}
          {infoTipo(crear.data.tipoDestino).es}.
        </Exito>
      )}
      {errorGeneral && <MensajeError mensaje={errorGeneral.message} />}

      <fieldset className="formulario__grupo">
        <legend>Explorador</legend>
        <Campo id="nombre" etiqueta="Nombre" error={errors.nombre} obligatorio>
          <input type="text" autoComplete="name" {...propsCampo('nombre', errors.nombre)} {...register('nombre')} />
        </Campo>
        <Campo
          id="alias"
          etiqueta="Alias de explorador"
          error={errors.alias}
          ayuda="Entre 3 y 16 caracteres: minúsculas, números y guion bajo."
          obligatorio
        >
          <input
            type="text"
            autoComplete="username"
            {...propsCampo('alias', errors.alias, true)}
            {...register('alias')}
          />
        </Campo>
        <Campo id="email" etiqueta="Correo" error={errors.email} obligatorio>
          <input type="email" autoComplete="email" {...propsCampo('email', errors.email)} {...register('email')} />
        </Campo>
        <Campo id="experiencia" etiqueta="Experiencia" error={errors.experiencia} obligatorio>
          <select {...propsCampo('experiencia', errors.experiencia)} {...register('experiencia')}>
            {EXPERIENCIAS.map((nivel) => (
              <option key={nivel} value={nivel}>
                {ETIQUETAS_EXPERIENCIA[nivel]}
              </option>
            ))}
          </select>
        </Campo>
      </fieldset>

      <fieldset className="formulario__grupo">
        <legend>Expedición</legend>
        <Campo id="tipoDestino" etiqueta="Tipo de destino" error={errors.tipoDestino} obligatorio>
          <select
            {...propsCampo('tipoDestino', errors.tipoDestino)}
            {...register('tipoDestino')}
            disabled={tipos.isPending || tipos.isError}
          >
            <option value="">{tipos.isPending ? 'Cargando tipos…' : 'Elige un tipo'}</option>
            {tipos.data?.map((tipo) => (
              <option key={tipo} value={tipo}>
                {infoTipo(tipo).es}
              </option>
            ))}
          </select>
        </Campo>
        {tipos.isError && <MensajeError mensaje={tipos.error.message} onReintentar={() => tipos.refetch()} />}

        <div className="formulario__fila">
          <Campo id="fechaSalida" etiqueta="Fecha de salida" error={errors.fechaSalida} obligatorio>
            <input type="date" {...propsCampo('fechaSalida', errors.fechaSalida)} {...register('fechaSalida')} />
          </Campo>
          <Campo
            id="dias"
            etiqueta="Días"
            error={errors.dias}
            ayuda={experiencia === 'novato' ? `Los novatos, máximo ${DIAS_MAXIMOS_NOVATO}.` : 'Entre 1 y 30.'}
            obligatorio
          >
            <input
              type="number"
              min="1"
              max="30"
              {...propsCampo('dias', errors.dias, true)}
              {...register('dias', { valueAsNumber: true })}
            />
          </Campo>
        </div>

        <Campo
          id="companero"
          etiqueta="Pokémon compañero (opcional)"
          error={errors.companero}
          ayuda="Su nombre en inglés, por ejemplo pikachu o mr-mime."
        >
          <input type="text" {...propsCampo('companero', errors.companero, true)} {...register('companero')} />
        </Campo>

        <Campo
          id="notas"
          etiqueta="Notas para el diario (opcional)"
          error={errors.notas}
          ayuda={`${notas.length}/${MAX_NOTAS} caracteres`}
        >
          <textarea rows="3" {...propsCampo('notas', errors.notas, true)} {...register('notas')} />
        </Campo>

        <div className={`casilla${errors.aceptaNormas ? ' casilla--error' : ''}`}>
          <input type="checkbox" {...propsCampo('aceptaNormas', errors.aceptaNormas)} {...register('aceptaNormas')} />
          <label htmlFor="aceptaNormas">
            Acepto las normas: no capturar en zonas protegidas y volver en la fecha indicada.
          </label>
          {errors.aceptaNormas && (
            <p id="aceptaNormas-error" className="campo-form__error" role="alert">
              {errors.aceptaNormas.message}
            </p>
          )}
        </div>
      </fieldset>

      <div className="formulario__acciones">
        <button className="boton" type="submit">
          {isSubmitting ? 'Registrando…' : 'Registrar expedición'}
        </button>
        <button className="boton boton--secundario" type="button" onClick={() => reset()}>
          Limpiar
        </button>
      </div>
    </form>
  );
}
