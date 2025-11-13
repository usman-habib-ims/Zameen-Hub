// Zameen.com Style Property Filters
// - Clean, minimal design with rounded inputs
// - Green focus states
// - Responsive grid layout
// - Subtle borders and shadows

'use client'

import { useState } from 'react'

interface Filters {
  propertyType: string
  city: string
  minPrice: string
  maxPrice: string
  bedrooms: string
  furnishing: string
  sortBy: string
}

interface PropertyFiltersProps {
  onFilterChange: (filters: Filters) => void
}

const cities = [
  'All Cities',
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Sialkot',
  'Gujranwala',
]

export default function PropertyFilters({ onFilterChange }: PropertyFiltersProps) {
  const [filters, setFilters] = useState<Filters>({
    propertyType: '',
    city: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    furnishing: '',
    sortBy: 'created_at',
  })

  const handleFilterChange = (key: keyof Filters, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const inputClassName = "w-full border border-[#c1bfbf] rounded px-3 py-2.5 text-sm text-[#444444] focus:outline-none focus:ring-2 focus:ring-[#33a137] focus:border-transparent transition-all"

  return (
    <div className="bg-white p-5 rounded-lg shadow-sm mb-6 border border-[#c1bfbf]/30">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[#444444]">Search Filters</h2>
        <button
          onClick={() => {
            const resetFilters = {
              propertyType: '',
              city: '',
              minPrice: '',
              maxPrice: '',
              bedrooms: '',
              furnishing: '',
              sortBy: 'created_at',
            }
            setFilters(resetFilters)
            onFilterChange(resetFilters)
          }}
          className="text-sm text-[#767676] hover:text-[#33a137] transition-colors duration-200"
        >
          Clear All
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#444444] mb-2">
            Property Type
          </label>
          <select
            className={inputClassName}
            value={filters.propertyType}
            onChange={(e) => handleFilterChange('propertyType', e.target.value)}
          >
            <option value="">All Types</option>
            <option value="house">House</option>
            <option value="apartment">Apartment</option>
            <option value="plot">Plot</option>
            <option value="commercial">Commercial</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#444444] mb-2">
            City
          </label>
          <select
            className={inputClassName}
            value={filters.city}
            onChange={(e) => handleFilterChange('city', e.target.value)}
          >
            {cities.map((city) => (
              <option key={city} value={city === 'All Cities' ? '' : city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#444444] mb-2">
            Bedrooms
          </label>
          <select
            className={inputClassName}
            value={filters.bedrooms}
            onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
          >
            <option value="">Any</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
            <option value="5">5+</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#444444] mb-2">
            Furnishing
          </label>
          <select
            className={inputClassName}
            value={filters.furnishing}
            onChange={(e) => handleFilterChange('furnishing', e.target.value)}
          >
            <option value="">Any</option>
            <option value="furnished">Furnished</option>
            <option value="semi-furnished">Semi-Furnished</option>
            <option value="unfurnished">Unfurnished</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#444444] mb-2">
            Min Price (PKR)
          </label>
          <input
            type="number"
            className={inputClassName}
            value={filters.minPrice}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            placeholder="Any"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#444444] mb-2">
            Max Price (PKR)
          </label>
          <input
            type="number"
            className={inputClassName}
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            placeholder="Any"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#444444] mb-2">
            Sort By
          </label>
          <select
            className={inputClassName}
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          >
            <option value="created_at">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>
    </div>
  )
}
