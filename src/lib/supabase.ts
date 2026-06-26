import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://xhaifmseyhgzrxkwpbcm.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoYWlmbXNleWhnenJ4a3dwYmNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4ODY1OTksImV4cCI6MjA5NzQ2MjU5OX0.5ux0JFDClqNNYYf3MtAVRoBP4xjjCf5rfa9usg7Z9xk'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
  })
  if (error) throw error
  return data
}

export async function getOAuthUrl(): Promise<string> {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
  })
  if (error) throw error
  return data.url
}

export async function signOut() {
  await supabase.auth.signOut()
}

export async function getSession() {
  return supabase.auth.getSession()
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  return data
}
