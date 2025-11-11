-- ZameenHub Database Schema
-- Drop existing tables if any (CASCADE will drop dependent objects)
DROP TABLE IF EXISTS public.property_images CASCADE;
DROP TABLE IF EXISTS public.properties CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop existing types
DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.property_type CASCADE;
DROP TYPE IF EXISTS public.property_status CASCADE;
DROP TYPE IF EXISTS public.furnishing_status CASCADE;

-- Create custom types
CREATE TYPE public.user_role AS ENUM ('regular', 'dealer', 'admin');
CREATE TYPE public.property_type AS ENUM ('house', 'apartment', 'plot', 'commercial');
CREATE TYPE public.property_status AS ENUM ('available', 'sold', 'rented');
CREATE TYPE public.furnishing_status AS ENUM ('furnished', 'semi_furnished', 'unfurnished');

-- Profiles table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  phone_number TEXT,
  role public.user_role NOT NULL DEFAULT 'regular',
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Properties table
CREATE TABLE public.properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dealer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  property_type public.property_type NOT NULL,
  price DECIMAL(15, 2) NOT NULL,

  -- Location
  city TEXT NOT NULL,
  area TEXT NOT NULL,
  address TEXT,

  -- Property details
  bedrooms INTEGER,
  bathrooms INTEGER,
  furnishing_status public.furnishing_status,
  area_size DECIMAL(10, 2), -- in square feet or marla
  area_unit TEXT DEFAULT 'sqft',

  -- Status
  status public.property_status NOT NULL DEFAULT 'available',
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,

  -- Metadata
  views_count INTEGER DEFAULT 0,
  contact_clicks_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

  -- Constraints
  CONSTRAINT positive_price CHECK (price > 0),
  CONSTRAINT valid_bedrooms CHECK (bedrooms >= 0),
  CONSTRAINT valid_bathrooms CHECK (bathrooms >= 0),
  CONSTRAINT valid_area_size CHECK (area_size > 0)
);

-- Property images table
CREATE TABLE public.property_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Favorites table (for users to save/like properties)
CREATE TABLE public.favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, property_id)
);

-- Indexes for better query performance
CREATE INDEX idx_properties_dealer_id ON public.properties(dealer_id);
CREATE INDEX idx_properties_property_type ON public.properties(property_type);
CREATE INDEX idx_properties_status ON public.properties(status);
CREATE INDEX idx_properties_is_approved ON public.properties(is_approved);
CREATE INDEX idx_properties_city ON public.properties(city);
CREATE INDEX idx_properties_area ON public.properties(area);
CREATE INDEX idx_properties_price ON public.properties(price);
CREATE INDEX idx_properties_created_at ON public.properties(created_at DESC);
CREATE INDEX idx_property_images_property_id ON public.property_images(property_id);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_is_approved ON public.profiles(is_approved);
CREATE INDEX idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX idx_favorites_property_id ON public.favorites(property_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
-- Anyone can view approved dealer profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (is_approved = TRUE AND role = 'dealer');

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for properties
-- Anyone can view approved properties
CREATE POLICY "Approved properties are viewable by everyone"
  ON public.properties FOR SELECT
  USING (is_approved = TRUE);

-- Dealers can view their own properties
CREATE POLICY "Dealers can view own properties"
  ON public.properties FOR SELECT
  USING (auth.uid() = dealer_id);

-- Dealers can insert their own properties
CREATE POLICY "Dealers can insert own properties"
  ON public.properties FOR INSERT
  WITH CHECK (
    auth.uid() = dealer_id AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'dealer' AND is_approved = TRUE
    )
  );

-- Dealers can update their own properties
CREATE POLICY "Dealers can update own properties"
  ON public.properties FOR UPDATE
  USING (auth.uid() = dealer_id);

-- Dealers can delete their own properties
CREATE POLICY "Dealers can delete own properties"
  ON public.properties FOR DELETE
  USING (auth.uid() = dealer_id);

-- Admins can view all properties
CREATE POLICY "Admins can view all properties"
  ON public.properties FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update any property
CREATE POLICY "Admins can update any property"
  ON public.properties FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can delete any property
CREATE POLICY "Admins can delete any property"
  ON public.properties FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for property_images
-- Anyone can view images for approved properties
CREATE POLICY "Property images are viewable with property"
  ON public.property_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE id = property_id AND is_approved = TRUE
    )
  );

-- Dealers can view images for their own properties
CREATE POLICY "Dealers can view own property images"
  ON public.property_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE id = property_id AND dealer_id = auth.uid()
    )
  );

-- Dealers can insert images for their own properties
CREATE POLICY "Dealers can insert own property images"
  ON public.property_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE id = property_id AND dealer_id = auth.uid()
    )
  );

-- Dealers can delete images for their own properties
CREATE POLICY "Dealers can delete own property images"
  ON public.property_images FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE id = property_id AND dealer_id = auth.uid()
    )
  );

-- Admins can do anything with property images
CREATE POLICY "Admins can manage all property images"
  ON public.property_images FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for favorites
-- Users can view their own favorites
CREATE POLICY "Users can view own favorites"
  ON public.favorites FOR SELECT
  USING (auth.uid() = user_id);

-- Users can add favorites
CREATE POLICY "Users can add favorites"
  ON public.favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can remove own favorites
CREATE POLICY "Users can remove own favorites"
  ON public.favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Function to automatically create a profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'regular')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_properties
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create storage bucket for property images
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for property images bucket
CREATE POLICY "Property images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated dealers can upload property images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'property-images' AND
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'dealer' AND is_approved = TRUE
    )
  );

CREATE POLICY "Dealers can delete their own property images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'property-images' AND
    auth.uid() IN (
      SELECT dealer_id FROM public.properties p
      INNER JOIN public.property_images pi ON p.id = pi.property_id
      WHERE pi.image_url LIKE '%' || storage.objects.name || '%'
    )
  );

CREATE POLICY "Admins can delete any property image"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'property-images' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
