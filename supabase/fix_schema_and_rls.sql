-- SQL Script to Synchronize Supabase Database Schema and Reapply RLS Policies

-- IMPORTANT: Run this script using the Supabase SQL Editor or `supabase psql` after ensuring Supabase CLI is installed.
-- This script attempts to be idempotent, but review carefully before running on a production database.

-- 1. Ensure 'is_approved' column exists in 'public.profiles' table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'is_approved') THEN
        ALTER TABLE public.profiles ADD COLUMN is_approved BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Column "is_approved" added to "public.profiles".';
    ELSE
        RAISE NOTICE 'Column "is_approved" already exists in "public.profiles".';
    END IF;
END
$$;

-- 2. Ensure 'dealer_id' column in 'public.properties' is correctly set up
--    (Assuming 'dealer_id' is used for ownership tracking, referencing 'public.profiles(id)')
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'properties' AND column_name = 'dealer_id') THEN
        ALTER TABLE public.properties ADD COLUMN dealer_id UUID;
        RAISE NOTICE 'Column "dealer_id" added to "public.properties".';
    ELSE
        RAISE NOTICE 'Column "dealer_id" already exists in "public.properties".';
    END IF;

    -- Add foreign key constraint if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'properties_dealer_id_fkey' AND conrelid = 'public.properties'::regclass) THEN
        ALTER TABLE public.properties ADD CONSTRAINT properties_dealer_id_fkey FOREIGN KEY (dealer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
        RAISE NOTICE 'Foreign key "properties_dealer_id_fkey" added to "public.properties".';
    ELSE
        RAISE NOTICE 'Foreign key "properties_dealer_id_fkey" already exists in "public.properties".';
    END IF;
END
$$;

-- 3. Ensure 'user_id' and 'property_id' columns in 'public.favorites' are correctly set up
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'favorites' AND column_name = 'user_id') THEN
        ALTER TABLE public.favorites ADD COLUMN user_id UUID;
        RAISE NOTICE 'Column "user_id" added to "public.favorites".';
    ELSE
        RAISE NOTICE 'Column "user_id" already exists in "public.favorites".';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'favorites' AND column_name = 'property_id') THEN
        ALTER TABLE public.favorites ADD COLUMN property_id UUID;
        RAISE NOTICE 'Column "property_id" added to "public.favorites".';
    ELSE
        RAISE NOTICE 'Column "property_id" already exists in "public.favorites".';
    END IF;

    -- Add foreign key constraint for user_id if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'favorites_user_id_fkey' AND conrelid = 'public.favorites'::regclass) THEN
        ALTER TABLE public.favorites ADD CONSTRAINT favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Foreign key "favorites_user_id_fkey" added to "public.favorites".';
    ELSE
        RAISE NOTICE 'Foreign key "favorites_user_id_fkey" already exists in "public.favorites".';
    END IF;

    -- Add foreign key constraint for property_id if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'favorites_property_id_fkey' AND conrelid = 'public.favorites'::regclass) THEN
        ALTER TABLE public.favorites ADD CONSTRAINT favorites_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;
        RAISE NOTICE 'Foreign key "favorites_property_id_fkey" added to "public.favorites".';
    ELSE
        RAISE NOTICE 'Foreign key "favorites_property_id_fkey" already exists in "public.favorites".';
    END IF;

    -- Add unique constraint for (user_id, property_id) if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'favorites_user_id_property_id_key' AND conrelid = 'public.favorites'::regclass) THEN
        ALTER TABLE public.favorites ADD CONSTRAINT favorites_user_id_property_id_key UNIQUE (user_id, property_id);
        RAISE NOTICE 'Unique constraint "favorites_user_id_property_id_key" added to "public.favorites".';
    ELSE
        RAISE NOTICE 'Unique constraint "favorites_user_id_property_id_key" already exists in "public.favorites".';
    END IF;
END
$$;

-- 4. Reapply RLS Policies
-- Drop existing RLS policies to ensure a clean slate
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete any profile" ON public.profiles;

DROP POLICY IF EXISTS "Public can view approved properties" ON public.properties;
DROP POLICY IF EXISTS "Authenticated users can view all properties" ON public.properties;
DROP POLICY IF EXISTS "Approved dealers can insert their own properties" ON public.properties;
DROP POLICY IF EXISTS "Owners can update their own properties" ON public.properties;
DROP POLICY IF EXISTS "Admins can update any property" ON public.properties;
DROP POLICY IF EXISTS "Owners can delete their own properties" ON public.properties;
DROP POLICY IF EXISTS "Admins can delete any property" ON public.properties;

DROP POLICY IF EXISTS "Public can view images for approved properties" ON public.property_images;
DROP POLICY IF EXISTS "Authenticated users can view images for all properties" ON public.property_images;
DROP POLICY IF EXISTS "Approved dealers can insert images for their own properties" ON public.property_images;
DROP POLICY IF EXISTS "Owners can update their own property images" ON public.property_images;
DROP POLICY IF EXISTS "Admins can update any property image" ON public.property_images;
DROP POLICY IF EXISTS "Owners can delete their own property images" ON public.property_images;
DROP POLICY IF EXISTS "Admins can delete any property image" ON public.property_images;

DROP POLICY IF EXISTS "Users can view own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can add favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can remove own favorites" ON public.favorites;

-- RLS Policies for public.profiles
-- Users can view their own profile (all columns)
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Admins can view all profiles (all columns)
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Admins can delete any profile
CREATE POLICY "Admins can delete any profile"
  ON public.profiles FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- RLS Policies for public.properties
-- Public can view approved properties
CREATE POLICY "Public can view approved properties"
  ON public.properties FOR SELECT
  USING (is_approved = TRUE);

-- Authenticated users can view all properties (approved or not)
CREATE POLICY "Authenticated users can view all properties"
  ON public.properties FOR SELECT
  TO authenticated
  USING (true);

-- Approved dealers can insert their own properties
CREATE POLICY "Approved dealers can insert their own properties"
  ON public.properties FOR INSERT
  WITH CHECK (
    auth.uid() = dealer_id AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'dealer' AND is_approved = TRUE)
  );

-- Owners can update their own properties
CREATE POLICY "Owners can update their own properties"
  ON public.properties FOR UPDATE
  USING (auth.uid() = dealer_id);

-- Admins can update any property
CREATE POLICY "Admins can update any property"
  ON public.properties FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Owners can delete their own properties
CREATE POLICY "Owners can delete their own properties"
  ON public.properties FOR DELETE
  USING (auth.uid() = dealer_id);

-- Admins can delete any property
CREATE POLICY "Admins can delete any property"
  ON public.properties FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- RLS Policies for public.property_images
-- Public can view images for approved properties
CREATE POLICY "Public can view images for approved properties"
  ON public.property_images FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.properties WHERE id = property_id AND is_approved = TRUE));

-- Authenticated users can view images for all properties
CREATE POLICY "Authenticated users can view images for all properties"
  ON public.property_images FOR SELECT
  TO authenticated
  USING (true);

-- Approved dealers can insert images for their own properties
CREATE POLICY "Approved dealers can insert images for their own properties"
  ON public.property_images FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.properties WHERE id = property_id AND dealer_id = auth.uid()) AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'dealer' AND is_approved = TRUE)
  );

-- Owners can update their own property images
CREATE POLICY "Owners can update their own property images"
  ON public.property_images FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.properties WHERE id = property_id AND dealer_id = auth.uid()));

-- Admins can update any property image
CREATE POLICY "Admins can update any property image"
  ON public.property_images FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Owners can delete their own property images
CREATE POLICY "Owners can delete their own property images"
  ON public.property_images FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.properties WHERE id = property_id AND dealer_id = auth.uid()));

-- Admins can delete any property image
CREATE POLICY "Admins can delete any property image"
  ON public.property_images FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- RLS Policies for public.favorites
-- Users can view own favorites
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
