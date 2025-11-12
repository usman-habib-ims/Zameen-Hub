-- Migration: 20231112_update_rls_policies.sql

-- Drop existing RLS policies to ensure a clean slate
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

DROP POLICY IF EXISTS "Approved properties are viewable by everyone" ON public.properties;
DROP POLICY IF EXISTS "Dealers can view own properties" ON public.properties;
DROP POLICY IF EXISTS "Dealers can insert own properties" ON public.properties;
DROP POLICY IF EXISTS "Dealers can update own properties" ON public.properties;
DROP POLICY IF EXISTS "Dealers can delete own properties" ON public.properties;
DROP POLICY IF EXISTS "Admins can view all properties" ON public.properties;
DROP POLICY IF EXISTS "Admins can update any property" ON public.properties;
DROP POLICY IF EXISTS "Admins can delete any property" ON public.properties;

DROP POLICY IF EXISTS "Property images are viewable with property" ON public.property_images;
DROP POLICY IF EXISTS "Dealers can view own property images" ON public.property_images;
DROP POLICY IF EXISTS "Dealers can insert own property images" ON public.property_images;
DROP POLICY IF EXISTS "Dealers can delete own property images" ON public.property_images;
DROP POLICY IF EXISTS "Admins can manage all property images" ON public.property_images;

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

-- No changes needed for handle_new_user function as `is_approved` defaults to FALSE for new profiles,
-- which is the desired behavior for pending dealers.
