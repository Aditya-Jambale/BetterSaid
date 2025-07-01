import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

console.log('Supabase configuration:');
console.log('URL:', supabaseUrl ? 'Present' : 'Missing');
console.log('Anon Key:', supabaseAnonKey ? 'Present' : 'Missing');

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type ChatHistory = {
  id: string
  user_id: string
  original_prompt: string
  enhanced_prompt: string
  improvements: string[]
  created_at: string
  updated_at: string
}
