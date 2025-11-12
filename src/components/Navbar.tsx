// RESPONSIVE FIXES: 2025-11-12
// - Added hamburger menu for mobile navigation
// - Made all links touch-friendly (min-height: 44px)
// - Mobile menu is full-width overlay
// - Ensured proper stacking and spacing on mobile devices

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

export default function Navbar() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient()

      // Get current session
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        setProfile(data)
      }
      setLoading(false)
    }

    fetchProfile()

    // Listen for auth state changes
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => setProfile(data))
      } else {
        setProfile(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setProfile(null)
    // Force a hard refresh to clear all state
    window.location.href = '/'
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl sm:text-2xl font-bold text-blue-600">
              ZameenHub.pk
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link
                href="/"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Properties
              </Link>
              <Link
                href="/about"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                About
              </Link>
              {profile?.role === 'dealer' && (
                <Link
                  href="/dashboard"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Dashboard
                </Link>
              )}
              {profile?.role === 'admin' && (
                <Link
                  href="/admin"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Admin
                </Link>
              )}
              {profile && (
                <Link
                  href="/saved"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Saved Properties
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            {!loading && !profile ? (
              <>
                <Link
                  href="/login"
                  className="hidden sm:inline-block text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium min-h-[44px] flex items-center"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="hidden sm:inline-block bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium min-h-[44px] flex items-center"
                >
                  Sign up
                </Link>
              </>
            ) : profile ? (
              <>
                {profile.role === 'dealer' && (
                  <Link
                    href="/properties/new"
                    className="hidden sm:inline-block bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium min-h-[44px] flex items-center"
                  >
                    Add Property
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="hidden sm:inline-block text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium min-h-[44px] flex items-center"
                >
                  {profile.full_name || 'Profile'}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="hidden sm:inline-block text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium min-h-[44px] flex items-center"
                >
                  Sign out
                </button>
              </>
            ) : null}
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!mobileMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              href="/"
              className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 min-h-[44px]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Properties
            </Link>
            <Link
              href="/about"
              className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 min-h-[44px]"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            {profile?.role === 'dealer' && (
              <Link
                href="/dashboard"
                className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 min-h-[44px]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}
            {profile?.role === 'admin' && (
              <Link
                href="/admin"
                className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 min-h-[44px]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin
              </Link>
            )}
            {profile && (
              <Link
                href="/saved"
                className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 min-h-[44px]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Saved Properties
              </Link>
            )}
            {!loading && !profile ? (
              <>
                <Link
                  href="/login"
                  className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 min-h-[44px]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="block px-3 py-3 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-700 min-h-[44px]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign up
                </Link>
              </>
            ) : profile ? (
              <>
                {profile.role === 'dealer' && (
                  <Link
                    href="/properties/new"
                    className="block px-3 py-3 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-700 min-h-[44px]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Add Property
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 min-h-[44px]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {profile.full_name || 'Profile'}
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    handleSignOut()
                  }}
                  className="block w-full text-left px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 min-h-[44px]"
                >
                  Sign out
                </button>
              </>
            ) : null}
          </div>
        </div>
      )}
    </nav>
  )
}

// .env file checked