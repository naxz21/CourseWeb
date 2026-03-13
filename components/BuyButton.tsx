'use client'

type BuyButtonProps = {
  courseId: string
  title: string
  price: number
  userEmail: string
  userId: string
}

export default function BuyButton({
  courseId,
  title,
  price,
  userEmail,
  userId,
}: BuyButtonProps) {
  const handleBuy = async () => {
    try {
      const res = await fetch('/api/mercadopago/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          title,
          price,
          userEmail,
          userId,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(`${data.error || 'Error'}\n${data.details || ''}`)
        return
      }

      if (!data.init_point) {
        alert('No vino init_point desde el backend')
        return
      }

      window.location.href = data.init_point
    } catch (error) {
      console.error(error)
      alert('Error al conectar con el backend')
    }
  }

  return (
    <button
      onClick={handleBuy}
      className="rounded-lg bg-black px-4 py-2 text-white"
    >
      Comprar curso
    </button>
  )
}