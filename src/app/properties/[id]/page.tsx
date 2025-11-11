'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'

type Property = Database['public']['Tables']['properties']['Row'] & {
  property_images: { image_url: string; display_order: number }[]
  profiles: { full_name: string | null; phone: string | null; agency_name: string | null; bio: string | null }
}

export default function PropertyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPhone, setShowPhone] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    fetchProperty()
    checkFavorite()
  }, [params.id])

  const fetchProperty = async () => {
    const propertyId = Array.isArray(params.id) ? params.id[0] : params.id
    if (!propertyId) return

    const supabase = createClient()
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        property_images(image_url, display_order),
        profiles(full_name, phone, agency_name, bio)
      `)
      .eq('id', propertyId)
      .single()

    if (!error && data) {
      setProperty(data as any)
    }
    setLoading(false)
  }

  const checkFavorite = async () => {
    const propertyId = Array.isArray(params.id) ? params.id[0] : params.id
    if (!propertyId) return

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('property_id', propertyId)
        .single()

      setIsFavorite(!!data)
    }
  }

  const handleContact = async () => {
    const propertyId = Array.isArray(params.id) ? params.id[0] : params.id
    if (!propertyId) return

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    // Record contact
    await supabase.from('contacts').insert({
      property_id: propertyId,
      user_id: user.id,
    })

    setShowPhone(true)
  }

  const toggleFavorite = async () => {
    const propertyId = Array.isArray(params.id) ? params.id[0] : params.id
    if (!propertyId) return

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
        .eq('property_id', propertyId)
      setIsFavorite(false)
    } else {
      await supabase.from('favorites').insert({
        user_id: user.id,
        property_id: propertyId,
      })
      setIsFavorite(true)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-center text-gray-600">Property not found</p>
      </div>
    )
  }

  const images = property.property_images.sort((a, b) => a.display_order - b.display_order)
  const mainImage = images[selectedImage]?.image_url || '/placeholder-property.svg'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-4">
        <Link href="/" className="text-blue-600 hover:text-blue-800">
          ← Back to properties
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative h-96 bg-gray-200">
              <img
                src={mainImage}
                alt={property.title}
                className="w-full h-full object-cover"
              />
              {property.featured && (
                <span className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-lg text-sm font-semibold">
                  Featured
                </span>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 p-4 overflow-x-auto">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden ${
                      selectedImage === idx ? 'ring-2 ring-blue-600' : ''
                    }`}
                  >
                    <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{property.title}</h1>
            <p className="text-3xl font-bold text-blue-600 mb-4">
              PKR {property.price?.toLocaleString()}
            </p>

            <div className="flex items-center gap-6 mb-6 text-gray-600">
              <span className="capitalize bg-gray-100 px-3 py-1 rounded">
                {property.property_type}
              </span>
              <span className="capitalize bg-gray-100 px-3 py-1 rounded">
                {property.status}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {property.bedrooms && (
                <div className="text-center p-3 bg-gray-50 rounded">
                  <p className="text-2xl font-bold text-gray-900">{property.bedrooms}</p>
                  <p className="text-sm text-gray-600">Bedrooms</p>
                </div>
              )}
              {property.bathrooms && (
                <div className="text-center p-3 bg-gray-50 rounded">
                  <p className="text-2xl font-bold text-gray-900">{property.bathrooms}</p>
                  <p className="text-sm text-gray-600">Bathrooms</p>
                </div>
              )}
              {property.furnishing && (
                <div className="text-center p-3 bg-gray-50 rounded">
                  <p className="text-sm font-bold text-gray-900 capitalize">
                    {property.furnishing.replace('-', ' ')}
                  </p>
                  <p className="text-sm text-gray-600">Furnishing</p>
                </div>
              )}
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Location</h2>
              <p className="text-gray-700">
                {property.address && `${property.address}, `}
                {property.area && `${property.area}, `}
                {property.city}
              </p>
            </div>

            {property.description && (
              <div>
                <h2 className="text-xl font-semibold mb-2">Description</h2>
                <p className="text-gray-700 whitespace-pre-line">{property.description}</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h3 className="text-xl font-semibold mb-4">Contact Dealer</h3>
            <div className="mb-4">
              <p className="font-semibold text-gray-900">
                {property.profiles?.agency_name || property.profiles?.full_name || 'Anonymous'}
              </p>
              {property.profiles?.bio && (
                <p className="text-sm text-gray-600 mt-2">{property.profiles.bio}</p>
              )}
            </div>

            {showPhone ? (
              <div className="mb-4 p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Phone Number:</p>
                <p className="text-xl font-bold text-green-700">
                  {property.profiles?.phone || 'Not available'}
                </p>
              </div>
            ) : (
              <button
                onClick={handleContact}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 mb-4"
              >
                Show Phone Number
              </button>
            )}

            <button
              onClick={toggleFavorite}
              className={`w-full py-3 px-4 rounded-lg font-semibold border-2 ${
                isFavorite
                  ? 'bg-red-50 border-red-600 text-red-600 hover:bg-red-100'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              {isFavorite ? '♥ Saved' : '♡ Save Property'}
            </button>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Posted on {new Date(property.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
