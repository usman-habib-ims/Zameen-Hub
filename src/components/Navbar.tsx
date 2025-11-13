// Zameen.com Style Redesign
// - Clean green and white theme with sticky navigation
// - Modern Lato typography
// - Subtle shadow and hover effects
// - Mobile-responsive hamburger menu

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/types/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export default function Navbar() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();

      // Get current session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        setProfile(data);
      }
      setLoading(false);
    };

    fetchProfile();

    // Listen for auth state changes
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()
          .then(({ data }) => setProfile(data));
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setProfile(null);
    // Force a hard refresh to clear all state
    window.location.href = "/";
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-[4.8rem]">
          <div className="flex items-center">
            <Link href="/" className="flex items-center group">
              <Image
                src="/z-logo-1.jpg"
                alt="ZameenHub Logo"
                width={120}
                height={48}
                className="h-16 w-auto"
                priority
              />
            </Link>
            <div className="hidden md:ml-10 md:flex md:space-x-1">
              <Link
                href="/"
                className="text-[#444444] hover:text-[#33a137] inline-flex items-center px-3 py-2 text-sm font-medium transition-colors duration-200"
              >
                Properties
              </Link>
              <Link
                href="/about"
                className="text-[#444444] hover:text-[#33a137] inline-flex items-center px-3 py-2 text-sm font-medium transition-colors duration-200"
              >
                About
              </Link>
              {profile?.role === "dealer" && (
                <Link
                  href="/dashboard"
                  className="text-[#444444] hover:text-[#33a137] inline-flex items-center px-3 py-2 text-sm font-medium transition-colors duration-200"
                >
                  Dashboard
                </Link>
              )}
              {profile?.role === "admin" && (
                <Link
                  href="/admin"
                  className="text-[#444444] hover:text-[#33a137] inline-flex items-center px-3 py-2 text-sm font-medium transition-colors duration-200"
                >
                  Admin
                </Link>
              )}
              {profile && (
                <Link
                  href="/saved"
                  className="text-[#444444] hover:text-[#33a137] inline-flex items-center px-3 py-2 text-sm font-medium transition-colors duration-200"
                >
                  Saved
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {!loading && !profile ? (
              <>
                <Link
                  href="/login"
                  className="hidden sm:inline-flex text-[#767676] hover:text-[#33a137] px-4 py-2 text-sm font-medium transition-colors duration-200"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="hidden sm:inline-flex bg-[#33a137] text-white hover:bg-[#2a8a2e] px-5 py-2.5 rounded text-sm font-bold transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Sign up
                </Link>
              </>
            ) : profile ? (
              <>
                {profile.role === "dealer" && (
                  <Link
                    href="/properties/new"
                    className="hidden sm:inline-flex bg-[#33a137] text-white hover:bg-[#2a8a2e] px-5 py-2.5 rounded text-sm font-bold transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    + Add Property
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="hidden sm:inline-flex text-[#767676] hover:text-[#33a137] px-4 py-2 text-sm font-medium transition-colors duration-200"
                >
                  {profile.full_name || "Profile"}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="hidden sm:inline-flex text-[#767676] hover:text-[#d31a1a] px-4 py-2 text-sm font-medium transition-colors duration-200"
                >
                  Sign out
                </button>
              </>
            ) : null}
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-[#444444] hover:text-[#33a137] hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#33a137] transition-colors duration-200"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!mobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 pt-2 pb-3 space-y-1">
            <Link
              href="/"
              className="block px-3 py-3 rounded text-base font-medium text-[#444444] hover:text-[#33a137] hover:bg-gray-50 min-h-[44px] transition-colors duration-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              Properties
            </Link>
            <Link
              href="/about"
              className="block px-3 py-3 rounded text-base font-medium text-[#444444] hover:text-[#33a137] hover:bg-gray-50 min-h-[44px] transition-colors duration-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            {profile?.role === "dealer" && (
              <Link
                href="/dashboard"
                className="block px-3 py-3 rounded text-base font-medium text-[#444444] hover:text-[#33a137] hover:bg-gray-50 min-h-[44px] transition-colors duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}
            {profile?.role === "admin" && (
              <Link
                href="/admin"
                className="block px-3 py-3 rounded text-base font-medium text-[#444444] hover:text-[#33a137] hover:bg-gray-50 min-h-[44px] transition-colors duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin
              </Link>
            )}
            {profile && (
              <Link
                href="/saved"
                className="block px-3 py-3 rounded text-base font-medium text-[#444444] hover:text-[#33a137] hover:bg-gray-50 min-h-[44px] transition-colors duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Saved Properties
              </Link>
            )}
            {!loading && !profile ? (
              <>
                <Link
                  href="/login"
                  className="block px-3 py-3 rounded text-base font-medium text-[#444444] hover:text-[#33a137] hover:bg-gray-50 min-h-[44px] transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="block px-3 py-3 rounded text-base font-bold bg-[#33a137] text-white hover:bg-[#2a8a2e] min-h-[44px] transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign up
                </Link>
              </>
            ) : profile ? (
              <>
                {profile.role === "dealer" && (
                  <Link
                    href="/properties/new"
                    className="block px-3 py-3 rounded text-base font-bold bg-[#33a137] text-white hover:bg-[#2a8a2e] min-h-[44px] transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    + Add Property
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="block px-3 py-3 rounded text-base font-medium text-[#444444] hover:text-[#33a137] hover:bg-gray-50 min-h-[44px] transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {profile.full_name || "Profile"}
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="block w-full text-left px-3 py-3 rounded text-base font-medium text-[#767676] hover:text-[#d31a1a] hover:bg-gray-50 min-h-[44px] transition-colors duration-200"
                >
                  Sign out
                </button>
              </>
            ) : null}
          </div>
        </div>
      )}
    </nav>
  );
}
