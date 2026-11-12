# Full Contact Forms · Registro de expediciones

> «Valida o muere.»

Misión 4 de **Web Development I, the Client** (U-tad, 2026–2027).

Aplicación en **React 19** con un formulario de alta y un listado sobre datos remotos. Sigue el
mundo de mis misiones anteriores (la Bitácora de tipos Pokémon): aquí te **apuntas a una
expedición** hacia un tipo y consultas quién más ha salido.

- **Formulario de alta** con React Hook Form + Zod: nombre, alias, correo, experiencia, tipo de
  destino (cargado de la PokeAPI), fecha de salida, días, Pokémon compañero, notas y aceptación de
  normas.
- **Registro** de expediciones con TanStack Query: listado, filtro por tipo de destino y botón para
  cancelar una expedición.
- **Backend local** con `json-server` (`db.json`): las altas y bajas se guardan de verdad y se ven
  al recargar.
- **Bonus:** la respuesta del servidor se valida con `safeParse`. `db.json` trae a propósito un
  registro corrupto, y la app lo descarta y explica por qué en lugar de romperse.

## Cómo probarlo

Requisitos: Node.js 20.19+ o 22.12+.

```bash
npm install
npm run dev              # arranca a la vez la API (http://localhost:3001) y la web (http://localhost:5173)
npm run build            # versión de producción en /dist
npm run reiniciar-datos  # devuelve db.json a los datos de ejemplo (incluido el registro corrupto)
```

Cosas que probar:

- Pulsar «Registrar expedición» con el formulario vacío: cada campo muestra su error y el foco va
  al primero.
- Elegir «Novato» con más de 7 días, o una fecha pasada: saltan los refinamientos.
- Usar el alias `lidia_rb`, que ya existe: el servidor lo rechaza y el error aparece en ese campo.
- Registrar una expedición válida: mensaje de éxito, formulario vacío y la lista se actualiza sola.
- Abrir el aviso amarillo «1 registro descartado por datos corruptos» para ver qué falló.
- Parar la API (o DevTools → Network → Offline) para ver el estado de error con «Reintentar».

## Estructura

```
├── db.json / db.semilla.json   # Datos de json-server y copia original para reiniciarlos
└── src/
    ├── main.jsx                # QueryClientProvider + opciones por defecto de las queries
    ├── App.jsx                 # Disposición: formulario y registro
    ├── schemas/
    │   ├── expedicion.js       # Esquema Zod: formulario, opciones de selects y respuesta del servidor
    │   └── pokeapi.js          # Esquema de la lista de tipos de la PokeAPI
    ├── api/
    │   ├── cliente.js          # Único sitio con fetch: response.ok, ErrorHttp, errores de red
    │   ├── expediciones.js     # Listar, crear (comprobando alias) y borrar
    │   └── pokeapi.js          # Tipos Pokémon para el select
    ├── queries/
    │   ├── claves.js           # Fábrica de query keys
    │   └── expediciones.js     # useExpediciones, useTiposPokemon, useCrearExpedicion, useBorrarExpedicion
    ├── components/
    │   ├── FormularioExpedicion.jsx
    │   ├── Campo.jsx           # Etiqueta + control + error accesible
    │   ├── ListaExpediciones.jsx, TarjetaExpedicion.jsx
    │   └── Estados.jsx         # Cargando, error, vacío y éxito
    └── data/tipos.js           # Nombre en español y color de cada tipo
```

## Cómo cumple cada criterio

### React Hook Form
- Formulario **no controlado**: los campos se conectan con `register` y se envían con
  `handleSubmit`. Solo se observan con `watch` dos valores: la experiencia (para cambiar la ayuda de
  «Días») y las notas (para el contador de caracteres).
- `mode: 'onTouched'`: un campo se valida al salir de él y, si ha fallado, se revalida mientras
  escribes.
- **Errores accesibles** (`Campo.jsx`): cada control lleva `aria-invalid` y `aria-describedby`
  apuntando a su ayuda y a su error, y el error tiene `role="alert"`. Al enviar con errores, el foco
  va al primer campo inválido.
- Mientras se envía, el botón muestra «Registrando…» y se desactiva. Al terminar bien, `reset()`
  vacía el formulario.
- Un error del servidor que pertenece a un campo (alias repetido) se coloca en ese campo con
  `setError` y se le da el foco.

### Validación con Zod
- `schemas/expedicion.js` es la única fuente de verdad: lo usa `zodResolver` en el formulario, de él
  salen las opciones del select de experiencia (`EXPERIENCIAS`) y con él se comprueba la respuesta
  del servidor.
- Mensajes propios en español en cada regla, transformaciones (`trim`, `toLowerCase` en el alias),
  `regex`, `z.email()`, `z.iso.date()`, `z.enum()` y `z.literal(true)` para las normas.
- **Refinamientos** con `superRefine`: la fecha de salida no puede ser pasada, y un novato no puede
  salir más de 7 días. El error se asigna al campo correcto con `path`.

### TanStack Query
- **Claves con jerarquía** (`queries/claves.js`): `['expediciones', 'lista', { tipo }]`. Cada filtro
  tiene su propia caché, y todas cuelgan de `['expediciones']`.
- `useMutation` para crear y borrar. Ambas **invalidan `['expediciones']`**, así se refrescan todos
  los listados, filtrados o no.
- La lista de tipos de la PokeAPI tiene `staleTime: Infinity` porque no cambia. El listado usa
  `placeholderData` para mantener la lista anterior mientras carga un filtro nuevo.
- `queryFn` recibe el `signal` de TanStack Query y se lo pasa a `fetch`, así una petición que ya no
  hace falta se cancela.

### Experiencia de usuario
- Estados diferenciados: cargando (`role="status"`), error con «Reintentar» (`role="alert"`), vacío
  con mensaje según el filtro, éxito con el nombre y el destino, y «Actualizando…» mientras se
  refresca en segundo plano.
- La expedición que se está cancelando muestra «Cancelando…» y su botón se desactiva.

### Bonus: validar la respuesta de la API
`listarExpediciones` pasa cada registro por `esquemaExpedicion.safeParse`. Los válidos se muestran y
los corruptos se apartan con el motivo exacto, sin tumbar la lista entera. `db.json` incluye el
registro `x000`, con días «muchos», un correo inválido y una experiencia que no existe, para
demostrarlo. La respuesta de la PokeAPI y la del `POST` también se validan.

## Uso de IA

Usé un asistente de IA. La IA generó el código de esta misión (esquemas, capa de API, queries,
componentes y estilos) y este README, reutilizando los datos de tipos y el estilo visual de mis
misiones anteriores.

Prompts relevantes:

- Le pasé una captura con el enunciado y la rúbrica de la Misión 4 y le pedí: *"créala, usa lo que
  necesites, y como la misión dos sigue esos pasos"*. Es decir, el mismo proceso que en la Misión 2:
  proyecto por fases, commits por fases, README con criterios, uso de IA y autopsia.

Cómo se verificó:

- `npm run build` compila sin errores.
- Se ejecutó una prueba automática en navegador (Playwright) contra `json-server` real, con la
  respuesta de la PokeAPI simulada: carga del listado y descarte del registro corrupto, errores con
  el formulario vacío y foco en el primero, los dos refinamientos, alias repetido marcado en su
  campo, alta correcta con mensaje de éxito, `reset` y lista actualizada por la invalidación,
  filtros por tipo, cancelación de una expedición y error legible con la API caída.

Mi trabajo: pasar el enunciado y la rúbrica, pedir que se siguiera el proceso por fases de la
Misión 2, dejar abierto mi navegador para que la IA creara el repositorio y subiera los archivos en
commits por fases, y revisar el código para poder defenderlo.

## Autopsia

1. **Backend local con `json-server` en lugar de una API pública de prueba.** APIs como
   JSONPlaceholder aceptan el `POST` pero no guardan nada, así que después de invalidar la query el
   listado volvería sin la expedición nueva y no se vería si la invalidación funciona. Con
   `json-server` los datos se guardan en `db.json`, y además puedo meter a propósito un registro
   corrupto para el bonus. El coste es tener que arrancar dos procesos, que resuelvo con
   `concurrently` en `npm run dev`.

2. **El alias repetido se comprueba al enviar, no dentro del esquema de Zod.** Zod permite
   refinamientos asíncronos, pero entonces el esquema haría una petición cada vez que se valida el
   campo, y el formulario (que valida al salir de cada campo) llenaría el servidor de consultas.
   Preferí que el esquema sea puro y síncrono, y que la comprobación vaya en el `mutationFn`. Si el
   alias existe, lanzo un `ErrorAliasOcupado` y el formulario lo coloca en el campo con `setError`.
   El coste es que el usuario solo se entera al pulsar «Registrar».

3. **Los registros corruptos se descartan uno a uno en vez de rechazar la respuesta entera.** Con
   un único `z.array(esquemaExpedicion).parse()` bastaría un registro malo para que no se viera
   ninguno. Con `safeParse` por registro se muestran los válidos y se avisa de cuántos se apartaron
   y por qué.

## Créditos

Tipos Pokémon de la [PokeAPI](https://pokeapi.co). Pokémon y sus nombres son marcas de Nintendo /
Game Freak / The Pokémon Company. Proyecto con fines exclusivamente educativos.
