// Zameen.com Style Property Card
// - Clean card design with subtle shadows
// - Green accent colors
// - Rounded corners (0.8rem)
// - Smooth hover transitions
// - Mobile-responsive layout

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { isLocalFavorite, addLocalFavorite, removeLocalFavorite } from '@/lib/favorites'

type Property = Database['public']['Tables']['properties']['Row'] & {
  property_images: { image_url: string }[]
  profiles: { full_name: string | null; phone: string | null; agency_name: string | null }
}

export default function PropertyCard({ property }: { property: Property }) {
  const router = useRouter()
  const [isFavorite, setIsFavorite] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const mainImage = property.property_images[0]?.image_url || '/placeholder-property.svg'

  useEffect(() => {
    checkFavorite()
  }, [property.id])

  const checkFavorite = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // Check database for logged-in users
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('property_id', property.id)
        .limit(1)

      // Only set favorite if query was successful and data exists
      if (!error && data && data.length > 0) {
        setIsFavorite(true)
      } else {
        setIsFavorite(false)
      }
    } else {
      // Check localStorage for anonymous users
      setIsFavorite(isLocalFavorite(property.id))
    }
    setIsChecking(false)
  }

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // Logged-in users: save to database
      if (isFavorite) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('property_id', property.id)
        setIsFavorite(false)
      } else {
        await supabase.from('favorites').insert({
          user_id: user.id,
          property_id: property.id,
        })
        setIsFavorite(true)
      }
    } else {
      // Anonymous users: save to localStorage
      if (isFavorite) {
        removeLocalFavorite(property.id)
        setIsFavorite(false)
      } else {
        addLocalFavorite(property.id)
        setIsFavorite(true)
      }
    }
  }

  return (
    <Link href={`/properties/${property.id}`} className="block group">
      <div className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 border border-[#c1bfbf]/30 zameen-hover-lift">
        <div className="relative h-48 bg-gray-200 overflow-hidden">
          <img
            src={mainImage}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
          />

          <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
            {property.featured && (
              <span className="bg-[#ffa500] text-white px-2.5 py-1 rounded text-xs font-bold shadow-md">
                Featured
              </span>
            )}
            {!isChecking && (
              <button
                onClick={handleToggleFavorite}
                className="bg-white/95 hover:bg-white rounded p-1.5 shadow-md transition-all"
                title={isFavorite ? 'Remove from saved' : 'Save property'}
              >
                <svg
                  className={`w-4 h-4 transition-all ${
                    isFavorite
                      ? 'text-red-600 fill-current'
                      : 'text-[#767676] hover:text-red-600'
                  }`}
                  fill={isFavorite ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>
            )}
          </div>
          <span className="absolute top-2 left-2 bg-[#33a137] text-white px-2.5 py-1 rounded text-xs font-bold capitalize shadow-md">
            {property.property_type}
          </span>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-bold text-[#444444] mb-1.5 line-clamp-1 group-hover:text-[#33a137] transition-colors duration-200">
            {property.title}
          </h3>
          <p className="text-2xl font-bold text-[#33a137] mb-2.5">
            PKR {property.price?.toLocaleString()}
          </p>
          <div className="flex items-center text-sm text-[#767676] mb-3">
            <svg className="w-4 h-4 mr-1 text-[#767676]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            <span className="font-normal">
              {property.city}{property.area ? `, ${property.area}` : ''}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm text-[#444444] pb-3 border-b border-gray-200">
            {property.bedrooms && (
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1 text-[#767676]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                </svg>
                <span className="font-medium">{property.bedrooms}</span>
              </span>
            )}
            {property.bathrooms && (
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1 text-[#767676]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M5 14h14M7 18h10"></path>
                </svg>
                <span className="font-medium">{property.bathrooms}</span>
              </span>
            )}
            {property.furnishing && (
              <span className="text-xs font-medium capitalize text-[#767676]">
                {property.furnishing.replace('-', ' ')}
              </span>
            )}
          </div>
          <div className="pt-3 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-7 h-7 bg-[#33a137] rounded-full flex items-center justify-center mr-2">
                <span className="text-white text-xs font-bold">
                  {(property.profiles?.agency_name || property.profiles?.full_name || 'A').charAt(0).toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-[#767676] font-normal truncate max-w-[120px]">
                {property.profiles?.agency_name || property.profiles?.full_name || 'Anonymous'}
              </p>
            </div>
            <span className="text-[#33a137] text-sm font-bold group-hover:translate-x-1 transition-transform duration-200 inline-flex items-center">
              View
              <svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"></path>
              </svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
