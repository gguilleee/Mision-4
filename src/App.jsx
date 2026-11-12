import FormularioExpedicion from './components/FormularioExpedicion.jsx';
import ListaExpediciones from './components/ListaExpediciones.jsx';

export default function App() {
  return (
    <>
      <header className="cabecera">
        <p className="cabecera__antetitulo">Full Contact Forms · Misión 4</p>
        <h1 className="cabecera__titulo">Registro de expediciones</h1>
        <p className="cabecera__lema">
          «Valida o muere.» Apúntate a una expedición por los tipos Pokémon y consulta quién más ha salido.
        </p>
      </header>

      <main className="contenido disposicion">
        <section aria-labelledby="titulo-alta">
          <h2 id="titulo-alta" className="seccion__titulo">1 · Alta de expedición</h2>
          <FormularioExpedicion />
        </section>
        <section aria-labelledby="titulo-registro">
          <h2 id="titulo-registro" className="seccion__titulo">2 · Registro</h2>
          <ListaExpediciones />
        </section>
      </main>

      <footer className="pie">
        Tipos de la{' '}
        <a href="https://pokeapi.co" target="_blank" rel="noopener noreferrer">
          PokeAPI
        </a>
        . Proyecto académico · U-tad · Web Development I.
      </footer>
    </>
  );
}
