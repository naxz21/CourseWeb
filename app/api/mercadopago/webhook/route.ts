import { NextResponse } from 'next/server'
import { Payment } from 'mercadopago'
import { mpClient } from '@/lib/mercadopago/client'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  try {
    const url = new URL(req.url)
    const topic = url.searchParams.get('topic') || url.searchParams.get('type')
    const paymentId =
      url.searchParams.get('id') || url.searchParams.get('data.id')

    console.log('Webhook recibido')
    console.log('topic:', topic)
    console.log('paymentId:', paymentId)

    if (topic !== 'payment' || !paymentId) {
      return NextResponse.json({ ok: true })
    }

    const paymentClient = new Payment(mpClient)
    const payment = await paymentClient.get({ id: paymentId })
    const paymentData: any = payment

    console.log('Pago consultado en Mercado Pago:', paymentData)

    const status = paymentData.status || 'pending'
    const payerEmail = paymentData.payer?.email || null
    const mpPaymentId = String(paymentData.id)
    const amount = Number(paymentData.transaction_amount || 0)
    const mpPreferenceId = paymentData.order?.id || null
    const externalReference = paymentData.external_reference || null

    let courseId: string | null = null
    let userId: string | null = null

    if (externalReference) {
      try {
        const parsed = JSON.parse(externalReference)
        courseId = parsed.courseId || null
        userId = parsed.userId || null
      } catch (e) {
        console.error('No se pudo parsear external_reference:', e)
      }
    }

    const paymentResult = await supabaseAdmin.from('payments').upsert(
      {
        mercadopago_payment_id: mpPaymentId,
        mercadopago_preference_id: mpPreferenceId,
        payer_email: payerEmail,
        user_id: userId,
        course_id: courseId,
        status,
        amount,
        raw_response: paymentData,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'mercadopago_payment_id',
      }
    )

    console.log('payments upsert:', paymentResult)

    if (status === 'approved' && userId && courseId) {
      const enrollmentResult = await supabaseAdmin.from('enrollments').upsert(
        {
          user_id: userId,
          course_id: courseId,
          status: 'active',
        },
        {
          onConflict: 'user_id,course_id',
        }
      )

      console.log('enrollment upsert:', enrollmentResult)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 })
  }
}