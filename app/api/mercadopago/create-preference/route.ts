import { NextResponse } from 'next/server'
import { Preference } from 'mercadopago'
import { mpClient } from '@/lib/mercadopago/client'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { title, price, courseId, userEmail, userId } = body

    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'Falta MERCADOPAGO_ACCESS_TOKEN en .env.local' },
        { status: 500 }
      )
    }

    const preference = new Preference(mpClient)

    const result = await preference.create({
      body: {
        items: [
          {
            id: String(courseId),
            title: String(title),
            quantity: 1,
            unit_price: Number(price),
            currency_id: 'ARS',
          },
        ],
        payer: userEmail
          ? {
              email: String(userEmail),
            }
          : undefined,
        external_reference: JSON.stringify({
          courseId,
          userId,
        }),
        back_urls: {
          success: 'http://localhost:3000/payment/success',
          failure: 'http://localhost:3000/payment/failure',
          pending: 'http://localhost:3000/payment/pending',
        },
      },
    })

    const initPoint =
      (result as any)?.init_point ||
      (result as any)?.sandbox_init_point ||
      (result as any)?.body?.init_point ||
      (result as any)?.body?.sandbox_init_point

    if (!initPoint) {
      console.log('MP result completo:', result)
      return NextResponse.json(
        { error: 'Mercado Pago no devolvió init_point', result },
        { status: 500 }
      )
    }

    return NextResponse.json({ init_point: initPoint })
  } catch (error: any) {
    console.error('Error creating preference:', error)
    return NextResponse.json(
      {
        error: 'No se pudo crear la preferencia',
        details: error?.message || 'Error desconocido',
      },
      { status: 500 }
    )
  }
}