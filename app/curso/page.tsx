export default function CursosPage() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">Elegí un curso</h1>
      <p className="mt-2 text-gray-600">
        Seleccioná el curso que querés ver o comprar.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">Curso de Alimentación</h2>
          <p className="mt-2 text-gray-600">
            Curso completo de nutrición y alimentación saludable.
          </p>
          <p className="mt-4 text-lg font-bold"></p>

          <a
            href="/curso/curso-alimentacion"
            className="mt-6 inline-block rounded-lg bg-black px-4 py-2 text-white hover:bg-gray-800"
          >
            Ver curso
          </a>
        </div>

        <div className="rounded-2xl border p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">Próximamente</h2>
          <p className="mt-2 text-gray-600">
            Acá vas a poder agregar más cursos en el futuro.
          </p>

          <button
            disabled
            className="mt-6 inline-block rounded-lg bg-gray-300 px-4 py-2 text-gray-600 cursor-not-allowed"
          >
            Próximamente
          </button>
        </div>
      </div>
    </main>
  )
}