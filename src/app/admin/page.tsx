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

type Profile = Database['public']['Tables']['profiles']['Row'] & {
  is_approved: boolean; // Add is_approved to Profile type
}

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
  }, [])

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
      .eq('is_approved', false) // Use is_approved

    const { count: approvedProperties } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('is_approved', true) // Use is_approved

    const { count: totalDealers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'dealer')

    const { count: pendingDealers } = await supabase // Fetch pending dealers
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'dealer')
      .eq('is_approved', false)

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
      query = query.eq('is_approved', false)
    } else if (propertyFilter === 'approved') {
      query = query.eq('is_approved', true)
    } else if (propertyFilter === 'rejected') {
      // Assuming 'rejected' properties are those that were once pending and then explicitly rejected.
      // This might require an additional column or a more complex query if 'is_approved' is the only status.
      // For now, we'll treat 'rejected' as not approved.
      query = query.eq('is_approved', false)
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
      .eq('is_approved', false)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching pending dealers:', error)
    } else if (data) {
      setPendingDealers(data as Profile[])
    }
  }

  const updateApprovalStatus = async (propertyId: string, status: boolean) => { // Changed status to boolean
    const supabase = createClient()
    const { error } = await supabase
      .from('properties')
      .update({ is_approved: status }) // Use is_approved
      .eq('id', propertyId)

    if (error) {
      console.error('Error updating approval status:', error)
      alert('Error updating property status: ' + error.message)
    } else {
      alert(`Property ${status ? 'approved' : 'rejected'} successfully!`)
      fetchProperties()
      fetchStats()
    }
  }

  const updateDealerApprovalStatus = async (dealerId: string, status: boolean) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({ is_approved: status })
      .eq('id', dealerId)

    if (error) {
      console.error('Error updating dealer approval status:', error)
      alert('Error updating dealer status: ' + error.message)
    } else {
      alert(`Dealer ${status ? 'approved' : 'rejected'} successfully!`)
      fetchPendingDealers()
      fetchStats()
    }
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
        <p className="text-gray-600">Manage your ZameenHub platform</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'dashboard'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('properties')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'properties'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Property Approvals
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            User Management
          </button>
          <button
            onClick={() => setActiveTab('dealer_approvals')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'dealer_approvals'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Total Properties</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalProperties}</p>
                </div>
                <div className="bg-blue-100 rounded-full p-3">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Pending Property Approvals</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pendingProperties}</p>
                </div>
                <div className="bg-yellow-100 rounded-full p-3">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Approved Properties</p>
                  <p className="text-3xl font-bold text-green-600">{stats.approvedProperties}</p>
                </div>
                <div className="bg-green-100 rounded-full p-3">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Pending Dealer Approvals</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.pendingDealers}</p>
                </div>
                <div className="bg-orange-100 rounded-full p-3">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setActiveTab('properties')}
                className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 text-left hover:bg-yellow-100 transition-colors"
              >
                <h3 className="font-semibold text-gray-900">Review Pending Properties</h3>
                <p className="text-sm text-gray-600 mt-1">{stats.pendingProperties} properties awaiting approval</p>
              </button>
              <button
                onClick={() => setActiveTab('dealer_approvals')}
                className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 text-left hover:bg-orange-100 transition-colors"
              >
                <h3 className="font-semibold text-gray-900">Review Pending Dealers</h3>
                <p className="text-sm text-gray-600 mt-1">{stats.pendingDealers} dealers awaiting approval</p>
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-left hover:bg-blue-100 transition-colors"
              >
                <h3 className="font-semibold text-gray-900">Manage Users</h3>
                <p className="text-sm text-gray-600 mt-1">{stats.totalUsers} registered users</p>
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>

          {fetchingProperties ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Loading {propertyFilter} properties...</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-600 text-lg mb-2">No {propertyFilter === 'all' ? '' : propertyFilter} properties found</p>
              <p className="text-gray-500 text-sm">Try clicking the Refresh button or check a different filter</p>
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
                  <div className="flex gap-6">
                    <div className="flex-shrink-0">
                      <img
                        src={property.property_images[0]?.image_url || '/placeholder-property.svg'}
                        alt={property.title}
                        className="w-48 h-32 object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
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
                        <div className="flex flex-col gap-2">
                          {property.approval_status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateApprovalStatus(property.id, 'approved')}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => updateApprovalStatus(property.id, 'rejected')}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <Link
                            href={`/properties/${property.id}`}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-center text-sm"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => deleteProperty(property.id)}
                            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm"
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
                        {dealer.phone_number || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(dealer.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => updateDealerApprovalStatus(dealer.id, true)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm mr-2"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateDealerApprovalStatus(dealer.id, false)}
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
          )}
        </div>
      )}

      {/* User Management Tab */}
      {activeTab === 'users' && (
        <div>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
                          user.is_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.is_approved ? 'Approved' : 'Pending'}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.phone_number || '-'}
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
      )}
    </div>
  )
}
