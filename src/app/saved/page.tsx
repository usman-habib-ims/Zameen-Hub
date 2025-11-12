'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import PropertyCard from '@/components/PropertyCard'
import { Database } from '@/types/database.types'
import { getLocalFavorites } from '@/lib/favorites'

type Property = Database['public']['Tables']['properties']['Row'] & {
  property_images: { image_url: string }[]
  profiles: { full_name: string | null; phone: string | null; agency_name: string | null }
}

export default function SavedPropertiesPage() {
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const supabase = createClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()

    if (!currentUser) {
      // For anonymous users, show localStorage favorites
      setUser(null)
      fetchLocalFavorites()
      return
    }

    setUser(currentUser)
    fetchSavedProperties(currentUser.id)
  }

  const fetchLocalFavorites = async () => {
    setLoading(true)
    try {
      const localFavoriteIds = getLocalFavorites()

      if (localFavoriteIds.length === 0) {
        setProperties([])
        setLoading(false)
        return
      }

      const supabase = createClient()

      // Fetch properties from localStorage IDs
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_images(image_url),
          profiles!properties_user_id_fkey(full_name, phone, agency_name)
        `)
        .in('id', localFavoriteIds)
        .eq('approval_status', 'approved')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching properties:', error)
      } else if (data) {
        setProperties(data as any)
      }
    } catch (err) {
      console.error('Error in fetchLocalFavorites:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSavedProperties = async (userId: string) => {
    setLoading(true)
    try {
      const supabase = createClient()

      // First get all favorite property IDs for this user
      const { data: favorites, error: favoritesError } = await supabase
        .from('favorites')
        .select('property_id')
        .eq('user_id', userId)

      if (favoritesError) {
        console.error('Error fetching favorites:', favoritesError)
        setLoading(false)
        return
      }

      if (!favorites || favorites.length === 0) {
        setProperties([])
        setLoading(false)
        return
      }

      // Extract property IDs
      const propertyIds = favorites.map((f) => f.property_id)

      // Fetch properties with their images and profiles
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_images(image_url),
          profiles!properties_user_id_fkey(full_name, phone, agency_name)
        `)
        .in('id', propertyIds)
        .eq('approval_status', 'approved')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching properties:', error)
      } else if (data) {
        setProperties(data as any)
      }
    } catch (err) {
      console.error('Error in fetchSavedProperties:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFavorite = async (propertyId: string) => {
    if (user) {
      // Logged-in user: remove from database
      const supabase = createClient()
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('property_id', propertyId)

      if (!error) {
        // Remove from local state
        setProperties((prev) => prev.filter((p) => p.id !== propertyId))
      } else {
        console.error('Error removing favorite:', error)
        alert('Failed to remove property from saved list')
      }
    } else {
      // Anonymous user: remove from localStorage
      const { removeLocalFavorite } = require('@/lib/favorites')
      removeLocalFavorite(propertyId)
      setProperties((prev) => prev.filter((p) => p.id !== propertyId))
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">My Saved Properties</h1>
        <p className="text-gray-600">
          {properties.length === 0
            ? "You haven't saved any properties yet"
            : `You have ${properties.length} saved ${properties.length === 1 ? 'property' : 'properties'}`}
        </p>
        {!user && properties.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              <strong>Note:</strong> Your saved properties are stored locally.
              <Link href="/signup" className="underline ml-1 hover:text-blue-900">Sign up</Link> or
              <Link href="/login" className="underline ml-1 hover:text-blue-900">log in</Link> to sync them across devices.
            </p>
          </div>
        )}
      </div>

      {properties.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <svg
            className="mx-auto h-24 w-24 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Saved Properties</h3>
          <p className="text-gray-600 mb-6">
            Start exploring properties and save your favorites to view them here later.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Browse Properties
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div key={property.id} className="relative">
              <PropertyCard property={property} />
              <button
                onClick={() => handleRemoveFavorite(property.id)}
                className="absolute top-4 right-4 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all z-10 group"
                title="Remove from saved"
              >
                <svg
                  className="w-6 h-6 text-red-600 group-hover:scale-110 transition-transform"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

