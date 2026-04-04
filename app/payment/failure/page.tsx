export default function PaymentFailurePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl items-center justify-center p-6">
      <div className="w-full rounded-2xl border p-8 shadow-sm">
        <h1 className="text-3xl font-bold">No se pudo completar el pago</h1>
        <p className="mt-4 text-gray-600">
          El pago fue rechazado o se canceló antes de completarse. Podés volver a intentarlo.
        </p>

        <div className="mt-6 flex flex-wrap gap-4">
          <a
            href="/curso"
            className="rounded-lg bg-black px-4 py-2 text-white"
          >
            Volver a cursos
          </a>

          <a
            href="/dashboard"
            className="rounded-lg border px-4 py-2"
          >
            Ir al dashboard
          </a>
        </div>
      </div>
    </main>
  )
}