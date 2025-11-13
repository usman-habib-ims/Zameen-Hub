// RESPONSIVE FIXES: 2025-11-12
// - Hero title already responsive (text-5xl sm:text-6xl md:text-7xl)
// - Made stats numbers responsive (text-3xl sm:text-4xl)
// - Made icon containers responsive (w-12 h-12 sm:w-16 sm:h-16)
// - Made decorative blobs hidden on mobile (hidden md:block) or reduced size
// - Loading spinner kept at h-16 w-16 (acceptable on mobile)

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import PropertyCard from '@/components/PropertyCard'
import PropertyFilters from '@/components/PropertyFilters'
import { Database } from '@/types/database.types'

type Property = Database['public']['Tables']['properties']['Row'] & {
  property_images: { image_url: string }[]
  profiles: { full_name: string | null; phone: string | null; agency_name: string | null }
}

export default function HomePage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<any>({})
  const [heroSearch, setHeroSearch] = useState({ city: '', propertyType: '' })

  useEffect(() => {
    fetchProperties()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const fetchProperties = async () => {
    setLoading(true)
    try {
      const supabase = createClient()

      let query = supabase
        .from('properties')
        .select(`
          *,
          property_images(image_url),
          profiles!properties_user_id_fkey(full_name, phone, agency_name)
        `)
        .eq('approval_status', 'approved')

      // Apply filters
      if (filters.propertyType) {
        query = query.eq('property_type', filters.propertyType)
      }
      if (filters.city) {
        query = query.eq('city', filters.city)
      }
      if (filters.minPrice) {
        query = query.gte('price', Number(filters.minPrice))
      }
      if (filters.maxPrice) {
        query = query.lte('price', Number(filters.maxPrice))
      }
      if (filters.bedrooms) {
        query = query.gte('bedrooms', Number(filters.bedrooms))
      }
      if (filters.furnishing) {
        query = query.eq('furnishing', filters.furnishing)
      }

      // Apply sorting
      if (filters.sortBy === 'price_asc') {
        query = query.order('price', { ascending: true })
      } else if (filters.sortBy === 'price_desc') {
        query = query.order('price', { ascending: false })
      } else {
        query = query.order('created_at', { ascending: false })
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching properties:', error)
        console.error('Error details:', JSON.stringify(error, null, 2))
      } else if (data) {
        console.log('Fetched properties:', data.length)
        setProperties(data as any)
      }
    } catch (err) {
      console.error('Error in fetchProperties:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section - Zameen Style */}
      <section className="relative bg-white pt-8 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#444444] mb-4">
              Find Properties in Pakistan
            </h1>
            <p className="text-base sm:text-lg text-[#767676] max-w-2xl mx-auto">
              Explore thousands of verified properties from trusted dealers across Pakistan
            </p>
          </div>

          {/* Hero Search Bar */}
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg border border-[#c1bfbf]/30 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#444444] mb-2">City</label>
                <select
                  className="w-full border border-[#c1bfbf] rounded px-3 py-2.5 text-sm text-[#444444] focus:outline-none focus:ring-2 focus:ring-[#33a137]"
                  value={heroSearch.city}
                  onChange={(e) => setHeroSearch({ ...heroSearch, city: e.target.value })}
                >
                  <option value="">Select City</option>
                  <option value="Karachi">Karachi</option>
                  <option value="Lahore">Lahore</option>
                  <option value="Islamabad">Islamabad</option>
                  <option value="Rawalpindi">Rawalpindi</option>
                  <option value="Faisalabad">Faisalabad</option>
                  <option value="Multan">Multan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#444444] mb-2">Property Type</label>
                <select
                  className="w-full border border-[#c1bfbf] rounded px-3 py-2.5 text-sm text-[#444444] focus:outline-none focus:ring-2 focus:ring-[#33a137]"
                  value={heroSearch.propertyType}
                  onChange={(e) => setHeroSearch({ ...heroSearch, propertyType: e.target.value })}
                >
                  <option value="">All Types</option>
                  <option value="house">House</option>
                  <option value="apartment">Apartment</option>
                  <option value="plot">Plot</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilters({
                      ...filters,
                      city: heroSearch.city,
                      propertyType: heroSearch.propertyType
                    })
                    // Scroll to properties section
                    document.getElementById('properties')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="w-full bg-[#33a137] hover:bg-[#2a8a2e] text-white font-bold py-2.5 rounded transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Search Properties
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-[#33a137]">1000+</div>
              <div className="text-sm text-[#767676] mt-1">Properties</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-[#33a137]">500+</div>
              <div className="text-sm text-[#767676] mt-1">Dealers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-[#33a137]">50+</div>
              <div className="text-sm text-[#767676] mt-1">Cities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-[#33a137]">24/7</div>
              <div className="text-sm text-[#767676] mt-1">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Property Categories */}
      <section className="py-12 bg-[#f5f5f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#444444] mb-2">
              Browse by Property Type
            </h2>
            <p className="text-base text-[#767676]">
              Find the perfect property that matches your needs
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { type: 'house', icon: '🏡', name: 'Houses', count: '250+' },
              { type: 'apartment', icon: '🏢', name: 'Apartments', count: '180+' },
              { type: 'plot', icon: '📐', name: 'Plots', count: '320+' },
              { type: 'commercial', icon: '🏬', name: 'Commercial', count: '150+' }
            ].map((category) => (
              <button
                key={category.type}
                onClick={() => setFilters({ ...filters, propertyType: category.type })}
                className="group bg-white rounded-lg p-6 border border-[#c1bfbf]/30 hover:border-[#33a137] hover:shadow-lg transition-all duration-300"
              >
                <div className="text-4xl mb-3">
                  {category.icon}
                </div>
                <h3 className="text-lg font-bold text-[#444444] group-hover:text-[#33a137] transition-colors mb-1">
                  {category.name}
                </h3>
                <p className="text-sm text-[#767676]">{category.count} Listings</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#444444] mb-2">
              Why Choose ZameenHub?
            </h2>
            <p className="text-base text-[#767676]">
              Pakistan's most trusted real estate platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-lg border border-[#c1bfbf]/30 hover:border-[#33a137] hover:shadow-lg transition-all duration-300">
              <div className="w-14 h-14 bg-[#33a137] rounded-full flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#444444] mb-2">Verified Listings</h3>
              <p className="text-sm text-[#767676]">
                All properties are verified by our team to ensure authenticity and quality
              </p>
            </div>

            <div className="p-6 rounded-lg border border-[#c1bfbf]/30 hover:border-[#33a137] hover:shadow-lg transition-all duration-300">
              <div className="w-14 h-14 bg-[#33a137] rounded-full flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#444444] mb-2">Trusted Dealers</h3>
              <p className="text-sm text-[#767676]">
                Connect with certified and experienced real estate professionals
              </p>
            </div>

            <div className="p-6 rounded-lg border border-[#c1bfbf]/30 hover:border-[#33a137] hover:shadow-lg transition-all duration-300">
              <div className="w-14 h-14 bg-[#33a137] rounded-full flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#444444] mb-2">Quick & Easy</h3>
              <p className="text-sm text-[#767676]">
                Find your dream property in minutes with our advanced search filters
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Properties Listing Section */}
      <section id="properties" className="py-12 bg-[#f5f5f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#444444] mb-2">
              Featured Properties
            </h2>
            <p className="text-base text-[#767676]">
              Explore our handpicked selection of premium properties
            </p>
          </div>

          <PropertyFilters onFilterChange={setFilters} />

          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-[#33a137]"></div>
              <p className="mt-4 text-[#767676] text-base">Loading properties...</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg border border-[#c1bfbf]/30">
              <div className="text-5xl mb-4">🏘️</div>
              <p className="text-[#444444] text-lg font-medium mb-1">No properties found</p>
              <p className="text-[#767676] text-sm">Try adjusting your search filters</p>
            </div>
          ) : (
            <>
              <div className="mb-5">
                <p className="text-[#444444] font-medium text-sm">
                  Showing <span className="text-[#33a137] font-bold">{properties.length}</span> {properties.length === 1 ? 'property' : 'properties'}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#33a137] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Ready to Find Your Dream Property?
          </h2>
          <p className="text-base text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who found their perfect home through ZameenHub
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-block px-8 py-3 bg-white text-[#33a137] font-bold rounded hover:bg-gray-100 transition-all duration-200 shadow-md"
            >
              Get Started Now
            </Link>
            <Link
              href="/"
              className="inline-block px-8 py-3 bg-transparent border-2 border-white text-white font-bold rounded hover:bg-white hover:text-[#33a137] transition-all duration-200"
            >
              Browse All Properties
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
