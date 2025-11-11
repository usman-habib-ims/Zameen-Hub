# ZameenHub.pk - Real Estate Platform

A comprehensive real estate platform connecting property dealers with potential buyers and renters across Pakistan.

## Features

### Authentication System
- **User Registration/Login**: Secure email and password-based authentication
- **User Types**:
  - **Regular Users**: Browse listings, save favorites, and contact dealers
  - **Dealer Users**: Full listing management capabilities (upload/delete properties)
  - **Admin Users**: Approve/reject listings and manage platform

### Property Listing Features
- **Property Types**: House, Apartment, Plot, Commercial
- **Property Details**: Bedrooms, bathrooms, furnishing status, price, location
- **Image Gallery**: Multiple photo uploads per property listing
- **Status Tracking**: Available/Sold/Rented status

### Search & Discovery
- **Advanced Filtering**:
  - Property type (house, apartment, plot, commercial)
  - City and area
  - Price range
  - Number of bedrooms
  - Furnishing status
- **Sorting Options**: Price (low to high, high to low), date posted
- **Mobile-Responsive Design**: Optimized for all devices

### Communication Tools
- **Contact Button**: Reveals dealer phone numbers to interested users
- **User Profiles**: Professional dealer profile pages with bio and agency information
- **Favorites**: Save properties for later viewing

### Administrative Features
- **Listing Approval**: Admin review and approval system for new listings
- **Content Management**: Edit/delete functionality for dealers and admins

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (for property images)

## Getting Started

### Prerequisites
- Node.js 18+ installed
- Supabase account configured

### Installation

1. Clone the repository and navigate to the project:
```bash
cd zameenhub
```

2. Install dependencies:
```bash
npm install
```

3. Environment variables are already configured in `.env.local`

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
zameenhub/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Home page with property listings
│   │   ├── login/                   # Login page
│   │   ├── signup/                  # Signup page
│   │   ├── properties/
│   │   │   ├── [id]/               # Property detail page
│   │   │   └── new/                # Add new property form
│   │   ├── dashboard/              # Dealer dashboard
│   │   ├── admin/                  # Admin panel
│   │   └── profile/                # User profile page
│   ├── components/
│   │   ├── Navbar.tsx              # Navigation bar
│   │   ├── PropertyCard.tsx        # Property listing card
│   │   └── PropertyFilters.tsx     # Search and filter component
│   ├── lib/
│   │   ├── supabase/               # Supabase client configuration
│   │   └── auth.ts                 # Authentication utilities
│   └── types/
│       └── database.types.ts       # TypeScript types for database
```

## User Roles

### Regular User
- Browse all approved properties
- Save properties to favorites
- Contact dealers (reveals phone number)
- View dealer profiles

### Dealer
- All Regular User features
- Add new property listings
- Manage own properties (edit/delete)
- View property status and approval status
- Update profile with agency information

### Admin
- All Dealer features
- Approve or reject property listings
- View all properties (pending, approved, rejected)
- Delete any property

## Build & Deploy

### Build for production:
```bash
npm run build
npm start
```

### Deploy to Vercel:
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## Database Schema

### Tables
- **profiles**: User profile information (extends auth.users)
- **properties**: Property listings with all details
- **property_images**: Multiple images per property
- **contacts**: Tracks when users contact dealers
- **favorites**: User saved properties

### Security
- Row Level Security (RLS) enabled on all tables
- Secure storage policies for image uploads
- Role-based access control (user, dealer, admin)

## License

Developed by TheCloudShadow.com for ZameenHub.pk

## Support

For support, email contact@thecloudshadow.com
