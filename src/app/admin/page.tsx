// RESPONSIVE FIXES: 2025-11-12
// - Made tab navigation scrollable on mobile with overflow-x-auto
// - Added responsive padding and whitespace-nowrap to all tab buttons
// - Made header text responsive (text-2xl sm:text-3xl)
// - Made stat numbers responsive (text-2xl sm:text-3xl)
// - Made property images responsive (w-full sm:w-48 h-48 sm:h-32)
// - Changed property card flex layout for mobile (flex-col sm:flex-row)
// - Made action buttons full-width on mobile (w-full sm:w-auto)
// - Wrapped tables in scrollable containers for mobile viewing

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { isAdminClient } from '@/lib/auth.client' // Import isAdminClient from the new client-side file

type Property = Database['public']['Tables']['properties']['Row'] & {
  property_images: { image_url: string }[]
  profiles: { full_name: string | null; agency_name: string | null }
}

type Profile = Database['public']['Tables']['profiles']['Row']

type Stats = {
  totalProperties: number
  pendingProperties: number
  approvedProperties: number
  totalDealers: number
  pendingDealers: number // Add pendingDealers to stats
  totalUsers: number
}

export default function AdminPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'dashboard' | 'properties' | 'users' | 'dealer_approvals'>('dashboard')
  const [properties, setProperties] = useState<Property[]>([])
  const [users, setUsers] = useState<Profile[]>([])
  const [pendingDealers, setPendingDealers] = useState<Profile[]>([]) // State for pending dealers
  const [stats, setStats] = useState<Stats>({
    totalProperties: 0,
    pendingProperties: 0,
    approvedProperties: 0,
    totalDealers: 0,
    pendingDealers: 0,
    totalUsers: 0,
  })
  const [loading, setLoading] = useState(true)
  const [propertyFilter, setPropertyFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending')
  const [fetchingProperties, setFetchingProperties] = useState(false)

  useEffect(() => {
    checkAuth()

    const supabase = createClient()
    const channel = supabase
      .channel('dealer_approvals_channel')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: 'role=eq.dealer',
        },
        (payload) => {
          const updatedProfile = payload.new as Profile;
          // Only update if the approval_status has changed from 'pending'
          if (updatedProfile.approval_status !== 'pending') {
            setPendingDealers((prevDealers) =>
              prevDealers.filter((dealer) => dealer.id !== updatedProfile.id)
            );
            setStats((prevStats) => ({
              ...prevStats,
              pendingDealers: prevStats.pendingDealers > 0 ? prevStats.pendingDealers - 1 : 0,
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchData()
    }
  }, [activeTab, propertyFilter, loading])

  const checkAuth = async () => {
    const userIsAdmin = await isAdminClient() // Use the client-side helper function

    if (!userIsAdmin) {
      router.push('/')
      return
    }

    setLoading(false)
  }

  const fetchData = async () => {
    if (activeTab === 'dashboard') {
      await fetchStats()
    } else if (activeTab === 'properties') {
      await fetchProperties()
    } else if (activeTab === 'users') {
      await fetchUsers()
    } else if (activeTab === 'dealer_approvals') { // New tab for dealer approvals
      await fetchPendingDealers()
    }
  }

  const fetchStats = async () => {
    const supabase = createClient()

    const { count: totalProperties } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })

    const { count: pendingProperties } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('approval_status', 'pending')

    const { count: approvedProperties } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('approval_status', 'approved')

    const { count: totalDealers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'dealer')

    const { count: pendingDealers } = await supabase // Fetch pending dealers
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'dealer')
      .eq('approval_status', 'pending')

    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    setStats({
      totalProperties: totalProperties || 0,
      pendingProperties: pendingProperties || 0,
      approvedProperties: approvedProperties || 0,
      totalDealers: totalDealers || 0,
      pendingDealers: pendingDealers || 0, // Set pendingDealers stat
      totalUsers: totalUsers || 0,
    })
  }

  const fetchProperties = async () => {
    setFetchingProperties(true)
    const supabase = createClient()

    let query = supabase
      .from('properties')
      .select(`
        *,
        property_images(image_url),
        profiles!properties_dealer_id_fkey(full_name, agency_name)
      `)
      .order('created_at', { ascending: false })

    if (propertyFilter === 'pending') {
      query = query.eq('approval_status', 'pending')
    } else if (propertyFilter === 'approved') {
      query = query.eq('approval_status', 'approved')
    } else if (propertyFilter === 'rejected') {
      query = query.eq('approval_status', 'rejected')
    }

    console.log('Fetching properties with filter:', propertyFilter)
    const { data, error } = await query

    if (error) {
      console.error('Error fetching properties:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      alert('Error loading properties: ' + error.message)
    } else if (data) {
      console.log(`✓ Successfully fetched ${data.length} ${propertyFilter} properties`)
      console.log('Properties:', data)
      setProperties(data as any)
    }
    setFetchingProperties(false)
  }

  const fetchUsers = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) {
      setUsers(data as Profile[])
    }
  }

  const fetchPendingDealers = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'dealer')
      .eq('approval_status', 'pending')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching pending dealers:', error)
    } else if (data) {
      setPendingDealers(data as Profile[])
    }
  }

  const updateApprovalStatus = async (propertyId: string, status: 'approved' | 'rejected') => {
    const supabase = createClient()
    const { error } = await supabase
      .from('properties')
      .update({ approval_status: status })
      .eq('id', propertyId)

    if (error) {
      console.error('Error updating approval status:', error)
      alert('Error updating property status: ' + error.message)
    } else {
      alert(`Property ${status} successfully!`)
      fetchProperties()
      fetchStats()
    }
  }

  const updateDealerApprovalStatus = async (dealerId: string, status: 'approved' | 'rejected') => {
    const supabase = createClient()

    if (status === 'rejected') {
      // For rejected dealers, delete their profile (which will also prevent login)
      // We mark as rejected instead of deleting so there's a record
      const { error } = await supabase
        .from('profiles')
        .update({ approval_status: 'rejected' })
        .eq('id', dealerId)

      if (error) {
        console.error('Error rejecting dealer:', error)
        alert('Error rejecting dealer: ' + error.message)
        return
      }

      alert('Dealer rejected successfully! They will not be able to sign in.')
    } else {
      // For approved dealers, update their status
      const { error } = await supabase
        .from('profiles')
        .update({ approval_status: status })
        .eq('id', dealerId)

      if (error) {
        console.error('Error updating dealer approval status:', error)
        alert('Error updating dealer status: ' + error.message)
        return
      }

      alert(`Dealer approved successfully! They can now sign in and create listings.`)
    }

    fetchPendingDealers()
    fetchStats()
  }

  const updateUserRole = async (userId: string, newRole: 'user' | 'dealer' | 'admin') => {
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)

    if (!error) {
      fetchUsers()
      fetchStats()
    }
  }

  const deleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This will also delete all their properties and data.`)) return

    const supabase = createClient()

    // Delete user profile (cascade will delete their properties)
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (!error) {
      alert('User deleted successfully')
      fetchUsers()
      fetchStats()
    } else {
      alert('Error deleting user: ' + error.message)
    }
  }

  const deleteProperty = async (propertyId: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return

    const supabase = createClient()
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId)

    if (!error) {
      fetchProperties()
      fetchStats()
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
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#444444] mb-2">Admin Panel</h1>
        <p className="text-sm sm:text-base text-[#767676]">Manage your ZameenHub platform</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 sm:mb-8 border-b border-[#c1bfbf]/30 overflow-x-auto">
        <nav className="-mb-px flex space-x-4 sm:space-x-8 min-w-max sm:min-w-0">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`pb-3 sm:pb-4 px-2 sm:px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-150 ${
              activeTab === 'dashboard'
                ? 'border-[#33a137] text-[#33a137]'
                : 'border-transparent text-[#767676] hover:text-[#444444] hover:border-[#c1bfbf]'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('properties')}
            className={`pb-3 sm:pb-4 px-2 sm:px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-150 ${
              activeTab === 'properties'
                ? 'border-[#33a137] text-[#33a137]'
                : 'border-transparent text-[#767676] hover:text-[#444444] hover:border-[#c1bfbf]'
            }`}
          >
            Property Approvals
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 sm:pb-4 px-2 sm:px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-150 ${
              activeTab === 'users'
                ? 'border-[#33a137] text-[#33a137]'
                : 'border-transparent text-[#767676] hover:text-[#444444] hover:border-[#c1bfbf]'
            }`}
          >
            User Management
          </button>
          <button
            onClick={() => setActiveTab('dealer_approvals')}
            className={`pb-3 sm:pb-4 px-2 sm:px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-150 ${
              activeTab === 'dealer_approvals'
                ? 'border-[#33a137] text-[#33a137]'
                : 'border-transparent text-[#767676] hover:text-[#444444] hover:border-[#c1bfbf]'
            }`}
          >
            Dealer Approvals
          </button>
        </nav>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-[#c1bfbf]/30 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#767676]">Total Properties</p>
                  <p className="text-2xl sm:text-3xl font-bold text-[#444444]">{stats.totalProperties}</p>
                </div>
                <div className="bg-[#33a137]/10 rounded-full p-3">
                  <svg className="w-8 h-8 text-[#33a137]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-[#c1bfbf]/30 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#767676]">Pending Property Approvals</p>
                  <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{stats.pendingProperties}</p>
                </div>
                <div className="bg-yellow-100 rounded-full p-3">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-[#c1bfbf]/30 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#767676]">Approved Properties</p>
                  <p className="text-2xl sm:text-3xl font-bold text-[#33a137]">{stats.approvedProperties}</p>
                </div>
                <div className="bg-[#33a137]/10 rounded-full p-3">
                  <svg className="w-8 h-8 text-[#33a137]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-[#c1bfbf]/30 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#767676]">Pending Dealer Approvals</p>
                  <p className="text-2xl sm:text-3xl font-bold text-orange-600">{stats.pendingDealers}</p>
                </div>
                <div className="bg-orange-100 rounded-full p-3">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-[#c1bfbf]/30 p-6">
            <h2 className="text-xl font-semibold text-[#444444] mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setActiveTab('properties')}
                className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 text-left hover:bg-yellow-100 transition-colors"
              >
                <h3 className="font-semibold text-[#444444]">Review Pending Properties</h3>
                <p className="text-sm text-[#767676] mt-1">{stats.pendingProperties} properties awaiting approval</p>
              </button>
              <button
                onClick={() => setActiveTab('dealer_approvals')}
                className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 text-left hover:bg-orange-100 transition-colors"
              >
                <h3 className="font-semibold text-[#444444]">Review Pending Dealers</h3>
                <p className="text-sm text-[#767676] mt-1">{stats.pendingDealers} dealers awaiting approval</p>
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className="bg-[#33a137]/10 border-2 border-[#33a137]/30 rounded-lg p-4 text-left hover:bg-[#33a137]/20 transition-colors"
              >
                <h3 className="font-semibold text-[#444444]">Manage Users</h3>
                <p className="text-sm text-[#767676] mt-1">{stats.totalUsers} registered users</p>
              </button>
            </div> {/* Closing div for grid */}
          </div>
        </div>
      )}

      {/* Property Approvals Tab */}
      {activeTab === 'properties' && (
        <div>
          <div className="mb-6 flex justify-between items-center">
            <div className="flex space-x-4">
              <button
                onClick={() => setPropertyFilter('pending')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  propertyFilter === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setPropertyFilter('approved')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  propertyFilter === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Approved
              </button>
              <button
                onClick={() => setPropertyFilter('rejected')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  propertyFilter === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Rejected
              </button>
              <button
                onClick={() => setPropertyFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  propertyFilter === 'all'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
            </div>
            <button
              onClick={() => {
                fetchProperties()
                fetchStats()
              }}
              className="px-4 py-2 bg-[#33a137] text-white rounded-lg font-bold hover:bg-[#2a8a2e] transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>

          {fetchingProperties ? (
            <div className="bg-white rounded-lg shadow-sm border border-[#c1bfbf]/30 p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-[#33a137] mb-4"></div>
              <p className="text-[#767676]">Loading {propertyFilter} properties...</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-[#c1bfbf]/30 p-12 text-center">
              <p className="text-[#444444] text-lg font-medium mb-2">No {propertyFilter === 'all' ? '' : propertyFilter} properties found</p>
              <p className="text-[#767676] text-sm">Try clicking the Refresh button or check a different filter</p>
            </div>
          ) : (
            <>
              <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 font-semibold">
                  Found {properties.length} {propertyFilter === 'all' ? '' : propertyFilter} {properties.length === 1 ? 'property' : 'properties'}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-6">
                {properties.map((property) => (
                <div key={property.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                    <div className="flex-shrink-0">
                      <img
                        src={property.property_images[0]?.image_url || '/placeholder-property.svg'}
                        alt={property.title}
                        className="w-full sm:w-48 h-48 sm:h-32 object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {property.title}
                          </h3>
                          <p className="text-lg font-bold text-blue-600 mb-2">
                            PKR {property.price?.toLocaleString()}
                          </p>
                          <p className="text-gray-600 mb-2">
                            {property.city}{property.area ? `, ${property.area}` : ''}
                          </p>
                          <p className="text-sm text-gray-500">
                            Listed by: {property.profiles?.agency_name || property.profiles?.full_name || 'Anonymous'}
                          </p>
                          <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                            property.approval_status === 'approved' ? 'bg-green-100 text-green-800' :
                            property.approval_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {property.approval_status}
                          </span>
                        </div>
                        <div className="flex flex-col gap-2 w-full sm:w-auto">
                          {property.approval_status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateApprovalStatus(property.id, 'approved')}
                                className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => updateApprovalStatus(property.id, 'rejected')}
                                className="w-full sm:w-auto bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <Link
                            href={`/properties/${property.id}`}
                            className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-center text-sm"
                          >
                            View
                          </Link>
                          <Link
                            href={`/properties/${property.id}/edit`}
                            className="w-full sm:w-auto bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 text-center text-sm"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => deleteProperty(property.id)}
                            className="w-full sm:w-auto bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      {property.description && (
                        <p className="mt-3 text-gray-700 line-clamp-2">{property.description}</p>
                      )}
                      <div className="mt-3 flex gap-4 text-sm text-gray-500">
                        {property.bedrooms && <span>{property.bedrooms} Beds</span>}
                        {property.bathrooms && <span>{property.bathrooms} Baths</span>}
                        {property.furnishing && <span className="capitalize">{property.furnishing.replace('-', ' ')}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Dealer Approvals Tab */}
      {activeTab === 'dealer_approvals' && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Pending Dealer Applications</h2>
          {pendingDealers.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-600 text-lg mb-2">No pending dealer applications</p>
              <p className="text-gray-500 text-sm">All dealers are currently approved or none have applied.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <div className="min-w-[640px]">
                  <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dealer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied On
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingDealers.map((dealer) => (
                    <tr key={dealer.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{dealer.full_name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{dealer.id.slice(0, 8)}...</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {dealer.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {dealer.phone || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(dealer.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => updateDealerApprovalStatus(dealer.id, 'approved')}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm mr-2"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateDealerApprovalStatus(dealer.id, 'rejected')}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* User Management Tab */}
      {activeTab === 'users' && (
        <div>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[640px]">
                <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Change Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.full_name || 'No name'}</div>
                      <div className="text-sm text-gray-500">{user.id.slice(0, 8)}...</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'dealer' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.role === 'dealer' ? (
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.approval_status === 'approved' ? 'bg-green-100 text-green-800' :
                          user.approval_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {user.approval_status.charAt(0).toUpperCase() + user.approval_status.slice(1)}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.phone || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <select
                        value={user.role}
                        onChange={(e) => updateUserRole(user.id, e.target.value as any)}
                        className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                      >
                        <option value="regular">Regular</option>
                        <option value="dealer">Dealer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => deleteUser(user.id, user.full_name || 'Unknown')}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
