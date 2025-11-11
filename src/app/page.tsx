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
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-8 animate-fade-in-up">
              Find Your Dream Property
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-200 mt-3">
                in Pakistan
              </span>
            </h1>
            <p className="mt-8 max-w-3xl mx-auto text-xl sm:text-2xl text-blue-100 animate-fade-in-up animation-delay-200 leading-relaxed">
              Discover thousands of verified properties from trusted dealers across the country
            </p>

            {/* Call to Action Buttons */}
            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-400">
              <Link
                href="/signup"
                className="px-10 py-5 bg-white text-blue-600 font-bold text-lg rounded-xl hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-2xl"
              >
                Get Started
              </Link>
              <Link
                href="#properties"
                className="px-10 py-5 bg-transparent border-2 border-white text-white font-bold text-lg rounded-xl hover:bg-white hover:text-blue-600 transform hover:scale-105 transition-all duration-200"
              >
                Browse Properties
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center animate-fade-in-up animation-delay-600">
                <div className="text-4xl font-bold text-blue-100">1000+</div>
                <div className="text-blue-200 mt-2">Properties</div>
              </div>
              <div className="text-center animate-fade-in-up animation-delay-700">
                <div className="text-4xl font-bold text-blue-100">500+</div>
                <div className="text-blue-200 mt-2">Dealers</div>
              </div>
              <div className="text-center animate-fade-in-up animation-delay-800">
                <div className="text-4xl font-bold text-blue-100">50+</div>
                <div className="text-blue-200 mt-2">Cities</div>
              </div>
              <div className="text-center animate-fade-in-up animation-delay-900">
                <div className="text-4xl font-bold text-blue-100">24/7</div>
                <div className="text-blue-200 mt-2">Support</div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-auto" viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgb(249, 250, 251)"/>
          </svg>
        </div>
      </section>

      {/* Property Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Browse by Property Type
            </h2>
            <p className="text-lg text-gray-600">
              Find the perfect property that matches your needs
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { type: 'house', icon: '🏡', name: 'Houses', count: '250+' },
              { type: 'apartment', icon: '🏢', name: 'Apartments', count: '180+' },
              { type: 'plot', icon: '📐', name: 'Plots', count: '320+' },
              { type: 'commercial', icon: '🏬', name: 'Commercial', count: '150+' }
            ].map((category, index) => (
              <button
                key={category.type}
                onClick={() => setFilters({ ...filters, propertyType: category.type })}
                className="group bg-white rounded-2xl p-8 shadow-md hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border-2 border-transparent hover:border-blue-500"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{category.name}</h3>
                <p className="text-blue-600 font-semibold">{category.count} Listings</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose ZameenHub?
            </h2>
            <p className="text-lg text-gray-600">
              Pakistan's most trusted real estate platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Verified Listings</h3>
              <p className="text-gray-600">
                All properties are verified by our team to ensure authenticity and quality
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Trusted Dealers</h3>
              <p className="text-gray-600">
                Connect with certified and experienced real estate professionals
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Quick & Easy</h3>
              <p className="text-gray-600">
                Find your dream property in minutes with our advanced search filters
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Properties Listing Section */}
      <section id="properties" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Featured Properties
              </h2>
              <p className="text-gray-600">
                Explore our handpicked selection of premium properties
              </p>
            </div>
          </div>

          <PropertyFilters onFilterChange={setFilters} />

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
              <p className="mt-6 text-gray-600 text-lg">Loading amazing properties...</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
              <div className="text-6xl mb-6">🏘️</div>
              <p className="text-gray-600 text-xl font-medium mb-2">No properties found</p>
              <p className="text-gray-500">Try adjusting your search filters</p>
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between">
                <p className="text-gray-700 font-medium">
                  Showing <span className="text-blue-600 font-bold">{properties.length}</span> {properties.length === 1 ? 'property' : 'properties'}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {properties.map((property, index) => (
                  <div
                    key={property.id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <PropertyCard property={property} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Find Your Dream Property?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join thousands of satisfied customers who found their perfect home through ZameenHub
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-xl"
            >
              Get Started Now
            </Link>
            <Link
              href="/properties"
              className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-blue-600 transform hover:scale-105 transition-all duration-200"
            >
              Browse All Properties
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
