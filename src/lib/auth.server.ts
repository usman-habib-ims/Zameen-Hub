import { createClient as createServerClient } from './supabase/server'
import { Database } from '@/types/database.types'

export async function getUserServer() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getUserProfileServer() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, role, is_approved')
    .eq('id', user.id)
    .single()

  return profile
}

export async function isAdminServer(): Promise<boolean> {
  const profile = await getUserProfileServer();
  return profile?.role === 'admin';
}

export async function isDealerServer(): Promise<boolean> {
  const profile = await getUserProfileServer();
  return profile?.role === 'dealer';
}

export async function isApprovedDealerServer(): Promise<boolean> {
  const profile = await getUserProfileServer();
  return profile?.role === 'dealer' && profile?.is_approved === true;
}
