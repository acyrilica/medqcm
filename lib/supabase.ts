import { createBrowserClient, createServerClient as createSSRServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!

// Use this in components and Platform.tsx (browser)
export function createClient() {
  return createBrowserClient(URL, KEY)
}

// Use this in API routes (server)
export async function createServerClient() {
  const cookieStore = await cookies()
  return createSSRServerClient(URL, KEY, {
    cookies: {
      getAll() { return cookieStore.getAll() },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        )
      },
    },
  })
}