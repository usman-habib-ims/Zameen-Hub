'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'

type Property = Database['public']['Tables']['properties']['Row'] & {
  property_images: { image_url: string }[]
}

export default function DashboardPage() {
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileData?.role !== 'dealer' && profileData?.role !== 'admin') {
      router.push('/')
      return
    }

    setProfile(profileData)
    fetchProperties(user.id)
  }

  const fetchProperties = async (userId: string) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('properties')
      .select(`
        *,
        property_images(image_url)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (data) {
      setProperties(data as any)
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return

    const supabase = createClient()
    const { error } = await supabase.from('properties').delete().eq('id', id)

    if (!error) {
      setProperties(properties.filter((p) => p.id !== id))
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#33a137]"></div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Header Section - Responsive */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#444444]">My Properties</h1>
            <p className="text-sm sm:text-base text-[#767676] mt-1">Manage your property listings</p>
          </div>
          <Link
            href="/properties/new"
            className="w-full sm:w-auto text-center bg-[#33a137] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-bold hover:bg-[#2a8a2e] transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap"
          >
            + Add New Property
          </Link>
        </div>

        {/* Empty State */}
        {properties.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-[#c1bfbf]/30 p-8 sm:p-12 text-center">
            <div className="text-5xl sm:text-6xl mb-4">🏘️</div>
            <p className="text-[#767676] mb-4 text-sm sm:text-base">You haven't listed any properties yet</p>
            <Link
              href="/properties/new"
              className="inline-block bg-[#33a137] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#2a8a2e] transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Create Your First Listing
            </Link>
          </div>
        ) : (
          <>
            {/* Scroll Hint for Mobile */}
            <div className="mb-3 sm:mb-4 lg:hidden">
              <div className="bg-[#33a137]/10 border border-[#33a137]/30 rounded-lg px-4 py-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#33a137] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
                <span className="text-xs sm:text-sm text-[#33a137] font-medium">
                  Swipe left/right to see all columns
                </span>
              </div>
            </div>

            {/* Horizontally Scrollable Table Container */}
            <div className="bg-white rounded-lg shadow-sm border border-[#c1bfbf]/30 overflow-hidden">
              {/* Scroll Container with Shadow Indicators */}
              <div className="relative">
                {/* Left Shadow Gradient */}
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white/90 to-transparent pointer-events-none z-10 lg:hidden"></div>

                {/* Right Shadow Gradient */}
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white/90 to-transparent pointer-events-none z-10 lg:hidden"></div>

                {/* Scrollable Table */}
                <div className="overflow-x-auto table-scroll">
                  <table className="w-full min-w-[900px] divide-y divide-[#c1bfbf]/30">
                    <thead className="bg-[#f5f5f5] sticky top-0 z-10">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-[#444444] uppercase tracking-wider whitespace-nowrap min-w-[280px]">
                          Property
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-[#444444] uppercase tracking-wider whitespace-nowrap min-w-[120px]">
                          Type
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-[#444444] uppercase tracking-wider whitespace-nowrap min-w-[150px]">
                          Price
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-[#444444] uppercase tracking-wider whitespace-nowrap min-w-[120px]">
                          Status
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-[#444444] uppercase tracking-wider whitespace-nowrap min-w-[120px]">
                          Approval
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-right text-xs font-bold text-[#444444] uppercase tracking-wider whitespace-nowrap sticky right-0 bg-[#f5f5f5] shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.1)] min-w-[180px]">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-[#c1bfbf]/30">
                      {properties.map((property) => (
                        <tr key={property.id} className="hover:bg-[#f5f5f5]/50 transition-colors duration-150">
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap min-w-[280px]">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-12 w-12 sm:h-16 sm:w-16">
                                <img
                                  className="h-12 w-12 sm:h-16 sm:w-16 rounded object-cover border border-[#c1bfbf]/30"
                                  src={property.property_images[0]?.image_url || '/placeholder-property.svg'}
                                  alt={property.title}
                                />
                              </div>
                              <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                                <div className="text-sm font-medium text-[#444444] truncate">
                                  {property.title}
                                </div>
                                <div className="text-sm text-[#767676] truncate">{property.city}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap min-w-[120px]">
                            <span className="capitalize text-sm text-[#444444]">{property.property_type}</span>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-bold text-[#33a137] min-w-[150px]">
                            PKR {property.price?.toLocaleString()}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap min-w-[120px]">
                            <span className={`px-2 sm:px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                              property.status === 'available' ? 'bg-green-100 text-green-800' :
                              property.status === 'sold' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {property.status}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap min-w-[120px]">
                            <span className={`px-2 sm:px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                              property.approval_status === 'approved' ? 'bg-green-100 text-green-800' :
                              property.approval_status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {property.approval_status}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium sticky right-0 bg-white shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.05)] min-w-[180px]">
                            <div className="flex flex-row justify-end gap-0">
                              <Link
                                href={`/properties/${property.id}`}
                                className="text-[#33a137] hover:text-[#2a8a2e] font-semibold mr-3 transition-colors duration-150"
                              >
                                View
                              </Link>
                              <Link
                                href={`/properties/${property.id}/edit`}
                                className="text-[#33a137] hover:text-[#2a8a2e] font-semibold mr-3 transition-colors duration-150"
                              >
                                Edit
                              </Link>
                              <button
                                onClick={() => handleDelete(property.id)}
                                className="text-[#d31a1a] hover:text-red-900 font-semibold transition-colors duration-150"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Mobile Helper Text */}
            <div className="mt-4 lg:hidden">
              <p className="text-xs text-center text-[#767676]">
                💡 Tip: Use two fingers to scroll the table horizontally on touch devices
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
