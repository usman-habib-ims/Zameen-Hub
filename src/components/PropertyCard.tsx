'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'

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
      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('property_id', property.id)
        .limit(1) // Use limit(1) instead of single()

      setIsFavorite(!!data && data.length > 0) // Check if data exists
    }
    setIsChecking(false)
  }

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

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
  }

  return (
    <Link href={`/properties/${property.id}`} className="block group">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 border border-gray-100">
        <div className="relative h-56 bg-gray-200 overflow-hidden">
          <img
            src={mainImage}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
            {property.featured && (
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                Featured
              </span>
            )}
            {!isChecking && (
              <button
                onClick={handleToggleFavorite}
                className="bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all group/btn"
                title={isFavorite ? 'Remove from saved' : 'Save property'}
              >
                <svg
                  className={`w-5 h-5 transition-all ${
                    isFavorite
                      ? 'text-red-600 fill-current'
                      : 'text-gray-600 group-hover/btn:text-red-600'
                  }`}
                  fill={isFavorite ? 'currentColor' : 'none'}
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
              </button>
            )}
          </div>
          <span className="absolute top-3 left-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1.5 rounded-full text-xs font-bold capitalize shadow-lg">
            {property.property_type}
          </span>
        </div>
        <div className="p-5">
          <h3 className="text-xl font-bold text-gray-900 mb-2 truncate group-hover:text-blue-600 transition-colors duration-200">
            {property.title}
          </h3>
          <p className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            PKR {property.price?.toLocaleString()}
          </p>
          <div className="flex items-center text-sm text-gray-600 mb-4">
            <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            <span className="font-medium">
              {property.city}{property.area ? `, ${property.area}` : ''}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            {property.bedrooms && (
              <span className="flex items-center bg-blue-50 px-3 py-1.5 rounded-lg">
                <svg className="w-4 h-4 mr-1.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                </svg>
                <span className="font-semibold text-gray-700">{property.bedrooms}</span>
              </span>
            )}
            {property.bathrooms && (
              <span className="flex items-center bg-purple-50 px-3 py-1.5 rounded-lg">
                <svg className="w-4 h-4 mr-1.5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path>
                </svg>
                <span className="font-semibold text-gray-700">{property.bathrooms}</span>
              </span>
            )}
            {property.furnishing && (
              <span className="flex items-center bg-green-50 px-3 py-1.5 rounded-lg">
                <svg className="w-4 h-4 mr-1.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span className="font-semibold text-gray-700 capitalize text-xs">
                  {property.furnishing.replace('-', ' ')}
                </span>
              </span>
            )}
          </div>
          <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-2">
                <span className="text-white text-xs font-bold">
                  {(property.profiles?.agency_name || property.profiles?.full_name || 'A').charAt(0).toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-gray-700 font-medium truncate max-w-[150px]">
                {property.profiles?.agency_name || property.profiles?.full_name || 'Anonymous'}
              </p>
            </div>
            <span className="text-blue-600 text-sm font-semibold group-hover:translate-x-1 transition-transform duration-200 inline-flex items-center">
              View
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
