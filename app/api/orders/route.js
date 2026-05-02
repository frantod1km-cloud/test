import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    const { customer, shipping, payment, items, total } = body

    // Validaciones mínimas del lado servidor
    if (!customer?.email || !items?.length || !total) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('orders')
      .insert([{ customer, shipping, payment, items, total, status: 'pending_review' }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ orderId: data.id }, { status: 201 })
  } catch (err) {
    console.error('Order error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
