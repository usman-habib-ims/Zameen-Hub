"use client";

import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#33a137] to-[#2a8a2e] text-white overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
              About ZameenHub.pk
              <span className="block text-white/90 mt-2">
                Your Trusted Real Estate Partner
              </span>
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-xl sm:text-2xl text-white/90">
              Connecting property seekers with verified dealers across Pakistan
              since day one
            </p>
          </div>
        </div>

        {/* Wave Separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            className="w-full h-auto"
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="#f5f5f5"
            />
          </svg>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-[#f5f5f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#444444] mb-6">
                Our Story
              </h2>
              <p className="text-lg text-[#767676] mb-4">
                ZameenHub.pk was founded with a simple yet powerful vision: to
                revolutionize the real estate market in Pakistan by creating a
                transparent, efficient, and trustworthy platform that connects
                property seekers with verified dealers.
              </p>
              <p className="text-lg text-[#767676] mb-4">
                We understand that buying, selling, or renting property is one
                of the most significant decisions in a person's life. That's why
                we've built a platform that prioritizes trust, transparency, and
                user experience above all else.
              </p>
              <p className="text-lg text-[#767676]">
                Today, we're proud to serve thousands of customers across
                Pakistan, helping them find their dream properties while
                empowering dealers to grow their businesses.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-video bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-lg flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="text-7xl mb-4">🏢</div>
                  <p className="text-2xl font-bold text-[#444444]">
                    Building Dreams
                  </p>
                  <p className="text-[#767676] mt-2">One Property at a Time</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Mission */}
            <div className="bg-white border border-[#c1bfbf]/30 rounded-lg p-8 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-[#33a137] rounded-lg flex items-center justify-center mb-6">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[#444444] mb-4">
                Our Mission
              </h3>
              <p className="text-[#767676] leading-relaxed">
                To provide a seamless, transparent, and efficient real estate
                platform that empowers property seekers to find their perfect
                match while enabling dealers to reach a wider audience and grow
                their business.
              </p>
            </div>

            {/* Vision */}
            <div className="bg-white border border-[#c1bfbf]/30 rounded-lg p-8 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-[#33a137] rounded-lg flex items-center justify-center mb-6">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  ></path>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[#444444] mb-4">
                Our Vision
              </h3>
              <p className="text-[#767676] leading-relaxed">
                To become Pakistan's most trusted and innovative real estate
                platform, setting new standards for transparency, reliability,
                and customer satisfaction in the property market.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-20 bg-[#f5f5f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#444444] mb-4">
              Our Core Values
            </h2>
            <p className="text-lg text-[#767676] max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: (
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    ></path>
                  </svg>
                ),
                title: "Trust",
                description:
                  "We verify every property and dealer to ensure authenticity and build lasting trust with our users.",
                color: "#33a137",
              },
              {
                icon: (
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    ></path>
                  </svg>
                ),
                title: "Transparency",
                description:
                  "Clear pricing, honest listings, and open communication are at the heart of our platform.",
                color: "#33a137",
              },
              {
                icon: (
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    ></path>
                  </svg>
                ),
                title: "Innovation",
                description:
                  "We continuously improve our platform with cutting-edge technology and user feedback.",
                color: "#33a137",
              },
              {
                icon: (
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    ></path>
                  </svg>
                ),
                title: "Customer Focus",
                description:
                  "Your satisfaction and success are our top priorities in every interaction.",
                color: "#33a137",
              },
            ].map((value, index) => (
              <div
                key={index}
                className="text-center group hover:transform hover:-translate-y-2 transition-all duration-300"
              >
                <div
                  style={{ backgroundColor: value.color }}
                  className="w-20 h-20 rounded-lg flex items-center justify-center mx-auto mb-6 text-white group-hover:shadow-lg transition-shadow duration-300"
                >
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-[#444444] mb-3">
                  {value.title}
                </h3>
                <p className="text-[#767676]">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-[#33a137] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Our Impact in Numbers
            </h2>
            <p className="text-xl text-white/90">
              Making a difference in Pakistan's real estate market
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "1000+", label: "Properties Listed", icon: "🏘️" },
              { number: "500+", label: "Verified Dealers", icon: "👥" },
              { number: "50+", label: "Cities Covered", icon: "📍" },
              { number: "5000+", label: "Happy Customers", icon: "😊" },
            ].map((stat, index) => (
              <div
                key={index}
                className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-all duration-300 hover:scale-105"
              >
                <div className="text-5xl mb-3">{stat.icon}</div>
                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-white/90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#444444] mb-4">
              Meet Our Team
            </h2>
            <p className="text-lg text-[#767676] max-w-2xl mx-auto">
              Passionate professionals dedicated to transforming real estate in
              Pakistan
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                name: "Ahmed Khan",
                role: "CEO & Founder",
                initial: "AK",
                color: "from-[#33a137] to-[#2a8a2e]",
              },
              {
                name: "Sara Ali",
                role: "Head of Operations",
                initial: "SA",
                color: "from-[#33a137] to-[#2a8a2e]",
              },
              {
                name: "Hassan Malik",
                role: "Tech Lead",
                initial: "HM",
                color: "from-[#33a137] to-[#2a8a2e]",
              },
              {
                name: "Ayesha Raza",
                role: "Customer Success",
                initial: "AR",
                color: "from-[#33a137] to-[#2a8a2e]",
              },
            ].map((member, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-6 inline-block">
                  <div
                    className={`w-32 h-32 bg-gradient-to-br ${member.color} rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-xl group-hover:shadow-2xl transition-shadow duration-300 group-hover:scale-105 transform transition-transform`}
                  >
                    {member.initial}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-[#33a137] to-[#2a8a2e] rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                </div>
                <h3 className="text-xl font-bold text-[#444444] mb-2">
                  {member.name}
                </h3>
                <p className="text-[#767676]">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-[#f5f5f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#444444] mb-4">
              Why Choose ZameenHub?
            </h2>
            <p className="text-lg text-[#767676] max-w-2xl mx-auto">
              We go above and beyond to ensure your real estate journey is
              smooth and successful
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Verified Properties",
                description:
                  "Every property listing is thoroughly verified by our team to ensure authenticity and prevent fraud.",
                icon: (
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                ),
                gradient: "from-[#33a137] to-[#2a8a2e]",
              },
              {
                title: "Expert Support",
                description:
                  "Our dedicated support team is available 24/7 to assist you with any questions or concerns.",
                icon: (
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                    ></path>
                  </svg>
                ),
                gradient: "from-[#33a137] to-[#2a8a2e]",
              },
              {
                title: "Advanced Search",
                description:
                  "Find your perfect property quickly with our powerful search filters and smart recommendations.",
                icon: (
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    ></path>
                  </svg>
                ),
                gradient: "from-[#33a137] to-[#2a8a2e]",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-[#444444] mb-3">
                  {feature.title}
                </h3>
                <p className="text-[#767676]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#33a137] to-[#2a8a2e] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Start Your Property Journey?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Join thousands of satisfied customers who found their dream
            properties with ZameenHub
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-4 bg-white text-[#33a137] font-bold rounded-xl hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-xl"
            >
              Get Started Now
            </Link>
            <Link
              href="/"
              className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-[#33a137] transform hover:scale-105 transition-all duration-200"
            >
              Browse Properties
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// web working fine
