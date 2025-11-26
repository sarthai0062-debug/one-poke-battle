;(function initSupabaseClient() {
  if (!window.supabase) {
    console.warn('Supabase library not found on window.')
    return
  }

  const SUPABASE_URL = 'https://soqzchswjemewyskkdmk.supabase.co'
  const SUPABASE_ANON_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvcXpjaHN3amVtZXd5c2trZG1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNTEyMjgsImV4cCI6MjA3ODYyNzIyOH0.HxBPw542edfp6UkH5Rl8gp32n1RaOxuhJxPekvlAe_c'

  window.supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  )
})()

