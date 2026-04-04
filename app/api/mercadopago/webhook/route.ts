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

    console.log('Payment data:', paymentData)

    const status = paymentData.status || 'pending'
    const payerEmail = paymentData.payer?.email || null
    const mpPaymentId = String(paymentData.id)
    const amount = Number(paymentData.transaction_amount || 0)
    const externalReference = paymentData.external_reference || null

    let userId: string | null = null
    let courseId: string | null = null

    if (externalReference) {
      try {
        const parsed = JSON.parse(externalReference)
        userId = parsed.userId || null
        courseId = parsed.courseId || null
      } catch (err) {
        console.error('external_reference inválido:', err)
      }
    }

    const paymentUpsert = await supabaseAdmin.from('payments').upsert(
      {
        mercadopago_payment_id: mpPaymentId,
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

    console.log('paymentUpsert:', paymentUpsert)

    if (status === 'approved' && userId && courseId) {
      const enrollmentUpsert = await supabaseAdmin.from('enrollments').upsert(
        {
          user_id: userId,
          course_id: courseId,
          status: 'active',
        },
        {
          onConflict: 'user_id,course_id',
        }
      )

      console.log('enrollmentUpsert:', enrollmentUpsert)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 })
  }
}