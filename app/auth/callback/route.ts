import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Check if business already exists for this user
      const { data: business } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', data.user.id)
        .single()

      if (!business) {
        // New user via Google — create business with their name or email prefix
        const displayName =
          data.user.user_metadata?.full_name ||
          data.user.user_metadata?.name ||
          data.user.email?.split('@')[0] ||
          'Mon Commerce'

        await supabase.from('businesses').insert({
          owner_id: data.user.id,
          name: displayName,
        })

        // Redirect to onboarding for new users
        return NextResponse.redirect(`${origin}/onboarding`)
      }

      // Existing user — redirect to next or dashboard
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Error — redirect to login
  return NextResponse.redirect(`${origin}/login?error=auth`)
}
