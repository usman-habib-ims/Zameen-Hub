'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { deleteUserAccount } from '@/app/actions/delete-account'

type Profile = Database['public']['Tables']['profiles']['Row']

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    agency_name: '',
    bio: '',
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) {
      setProfile(data)
      setFormData({
        full_name: data.full_name || '',
        phone: data.phone || '',
        agency_name: data.agency_name || '',
        bio: data.bio || '',
      })
    }
    setLoading(false)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.full_name || null,
        phone: formData.phone || null,
        agency_name: formData.agency_name || null,
        bio: formData.bio || null,
      })
      .eq('id', user.id)

    if (!error) {
      setEditing(false)
      fetchProfile()
    }
  }

  const handleDeleteAccount = async () => {
    const confirmation = prompt(
      'Are you sure you want to delete your account? This action cannot be undone.\n\n' +
      'All your data including properties, images, and personal information will be permanently deleted.\n\n' +
      'Type "DELETE" to confirm:'
    )

    if (confirmation !== 'DELETE') {
      if (confirmation !== null) {
        alert('Account deletion cancelled. You must type DELETE exactly to confirm.')
      }
      return
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    // Call server action to delete user from auth.users (cascade will delete profile, properties, images, etc.)
    const result = await deleteUserAccount(user.id)

    if (!result.success) {
      alert('Error deleting account: ' + (result.error || 'Unknown error'))
      return
    }

    // Sign out and redirect to home
    await supabase.auth.signOut()
    alert('Your account has been successfully deleted.')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Edit Profile
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleUpdate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            {profile?.role === 'dealer' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Agency Name
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.agency_name}
                    onChange={(e) => setFormData({ ...formData, agency_name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    rows={4}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell potential buyers about yourself and your agency"
                  />
                </div>
              </>
            )}

            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false)
                  setFormData({
                    full_name: profile?.full_name || '',
                    phone: profile?.phone || '',
                    agency_name: profile?.agency_name || '',
                    bio: profile?.bio || '',
                  })
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Full Name</label>
              <p className="text-lg text-gray-900">{profile?.full_name || 'Not set'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Email</label>
              <p className="text-lg text-gray-900">{profile?.id}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Phone Number</label>
              <p className="text-lg text-gray-900">{profile?.phone || 'Not set'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Account Type</label>
              <p className="text-lg text-gray-900 capitalize">{profile?.role}</p>
            </div>

            {profile?.role === 'dealer' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Agency Name</label>
                  <p className="text-lg text-gray-900">{profile?.agency_name || 'Not set'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">Bio</label>
                  <p className="text-lg text-gray-900">{profile?.bio || 'Not set'}</p>
                </div>
              </>
            )}

            <div className="pt-4 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-500">Member Since</label>
              <p className="text-lg text-gray-900">
                {new Date(profile?.created_at || '').toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-6 border-2 border-red-200">
        <h2 className="text-xl font-bold text-red-600 mb-2">Danger Zone</h2>
        <p className="text-sm text-gray-600 mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button
          onClick={handleDeleteAccount}
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-semibold"
        >
          Delete My Account
        </button>
      </div>
    </div>
  )
}
