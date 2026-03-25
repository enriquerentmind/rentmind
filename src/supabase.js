import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uxjssgueddzinhvyoolg.supabase.co'
const supabaseKey = 'sb_publishable_iZvMgQjZ2hIHYmszCr-XXA_l9SIZStJ'

export const supabase = createClient(supabaseUrl, supabaseKey)