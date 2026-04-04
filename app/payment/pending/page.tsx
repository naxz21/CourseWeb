export default function PaymentPendingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl items-center justify-center p-6">
      <div className="w-full rounded-2xl border p-8 shadow-sm">
        <h1 className="text-3xl font-bold">Pago pendiente</h1>
        <p className="mt-4 text-gray-600">
          Tu pago todavía está pendiente de confirmación. Cuando se apruebe,
          el acceso al curso se habilitará automáticamente.
        </p>

        <div className="mt-6 flex flex-wrap gap-4">
          <a
            href="/dashboard"
            className="rounded-lg bg-black px-4 py-2 text-white"
          >
            Ir al dashboard
          </a>

          <a
            href="/curso"
            className="rounded-lg border px-4 py-2"
          >
            Volver a cursos
          </a>
        </div>
      </div>
    </main>
  )
}