import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const DEMO_EMAIL = 'demo@mesusmedia.com.br'
const DEMO_PASSWORD = 'Mesus@2026'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data, error } = await supabase.auth.admin.createUser({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    email_confirm: true,
  })

  if (error && error.message.includes('already exists')) {
    return NextResponse.json({ message: 'Demo user already exists', email: DEMO_EMAIL })
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Demo user created', email: data.user?.email })
}
