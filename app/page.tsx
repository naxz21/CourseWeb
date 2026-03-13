export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-4xl font-bold text-center">
        Plataforma de Cursos
      </h1>

      <p className="text-lg text-gray-600 text-center max-w-xl">
        Registrate o iniciá sesión para acceder a tu dashboard y ver los cursos disponibles.
      </p>

      <div className="flex gap-4">
        <a
          href="/register"
          className="px-6 py-3 rounded-lg bg-black text-white hover:bg-gray-800"
        >
          Registrarse
        </a>

        <a
          href="/login"
          className="px-6 py-3 rounded-lg border font-medium hover:bg-gray-100"
        >
          Iniciar sesión
        </a>
      </div>
    </main>
  )
}