'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/client'

export async function deleteUserAccount(userId: string) {
  try {
    // Create admin client with service role
    const adminClient = createAdminClient()

    // Delete user from auth.users (this will cascade to profiles due to FK constraints)
    const { error } = await adminClient.auth.admin.deleteUser(userId)

    if (error) {
      console.error('Error deleting user:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error deleting user:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
