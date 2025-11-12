'use client'

import { createClient as createBrowserClient } from './supabase/client'
import { Database } from '@/types/database.types'

export async function getUserClient() {
  const supabase = createBrowserClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getUserProfileClient() {
  const supabase = createBrowserClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*') // Simplified select statement
    .eq('id', user.id)
    .single()

  return profile
}

export async function isAdminClient(): Promise<boolean> {
  const profile = await getUserProfileClient();
  return profile?.role === 'admin';
}

export async function isDealerClient(): Promise<boolean> {
  const profile = await getUserProfileClient();
  return profile?.role === 'dealer';
}

export async function isApprovedDealerClient(): Promise<boolean> {
  const profile = await getUserProfileClient();
  return profile?.role === 'dealer' && profile?.is_approved === true;
}

export async function signOut() {
  const supabase = createBrowserClient()
  await supabase.auth.signOut()
}
