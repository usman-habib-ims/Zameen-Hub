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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#444444]">My Properties</h1>
          <p className="text-[#767676] mt-1">Manage your property listings</p>
        </div>
        <Link
          href="/properties/new"
          className="bg-[#33a137] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#2a8a2e] transition-all duration-200 shadow-sm hover:shadow-md"
        >
          + Add New Property
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-[#c1bfbf]/30 p-12 text-center">
          <div className="text-6xl mb-4">🏘️</div>
          <p className="text-[#767676] mb-4">You haven't listed any properties yet</p>
          <Link
            href="/properties/new"
            className="inline-block bg-[#33a137] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#2a8a2e] transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Create Your First Listing
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-[#c1bfbf]/30 overflow-hidden">
          <table className="min-w-full divide-y divide-[#c1bfbf]/30">
            <thead className="bg-[#f5f5f5]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-[#444444] uppercase tracking-wider">
                  Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-[#444444] uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-[#444444] uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-[#444444] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-[#444444] uppercase tracking-wider">
                  Approval
                </th>
                <th className="px-6 py-3 text-right text-xs font-bold text-[#444444] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#c1bfbf]/30">
              {properties.map((property) => (
                <tr key={property.id} className="hover:bg-[#f5f5f5]/50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-16 w-16">
                        <img
                          className="h-16 w-16 rounded object-cover border border-[#c1bfbf]/30"
                          src={property.property_images[0]?.image_url || '/placeholder-property.svg'}
                          alt=""
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-[#444444]">{property.title}</div>
                        <div className="text-sm text-[#767676]">{property.city}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="capitalize text-sm text-[#444444]">{property.property_type}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#33a137]">
                    PKR {property.price?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                      property.status === 'available' ? 'bg-green-100 text-green-800' :
                      property.status === 'sold' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {property.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                      property.approval_status === 'approved' ? 'bg-green-100 text-green-800' :
                      property.approval_status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {property.approval_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/properties/${property.id}`}
                      className="text-[#33a137] hover:text-[#2a8a2e] font-semibold mr-4 transition-colors duration-150"
                    >
                      View
                    </Link>
                    <Link
                      href={`/properties/${property.id}/edit`}
                      className="text-[#33a137] hover:text-[#2a8a2e] font-semibold mr-4 transition-colors duration-150"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(property.id)}
                      className="text-[#d31a1a] hover:text-red-900 font-semibold transition-colors duration-150"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
