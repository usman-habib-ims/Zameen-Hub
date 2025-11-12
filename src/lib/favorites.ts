// Utility functions for managing favorites (both localStorage and database)

const FAVORITES_KEY = 'zameenhub_favorites';

// Get favorites from localStorage for anonymous users
export function getLocalFavorites(): string[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Add favorite to localStorage
export function addLocalFavorite(propertyId: string): void {
  if (typeof window === 'undefined') return;

  const favorites = getLocalFavorites();
  if (!favorites.includes(propertyId)) {
    favorites.push(propertyId);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }
}

// Remove favorite from localStorage
export function removeLocalFavorite(propertyId: string): void {
  if (typeof window === 'undefined') return;

  const favorites = getLocalFavorites();
  const filtered = favorites.filter(id => id !== propertyId);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
}

// Check if property is in local favorites
export function isLocalFavorite(propertyId: string): boolean {
  return getLocalFavorites().includes(propertyId);
}

// Clear local favorites (used after migration to database)
export function clearLocalFavorites(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(FAVORITES_KEY);
}

// Migrate localStorage favorites to database
export async function migrateLocalFavoritesToDatabase(
  supabase: any,
  userId: string
): Promise<void> {
  const localFavorites = getLocalFavorites();

  if (localFavorites.length === 0) return;

  try {
    // Get existing favorites from database
    const { data: existingFavorites } = await supabase
      .from('favorites')
      .select('property_id')
      .eq('user_id', userId);

    const existingIds = new Set(
      existingFavorites?.map((f: any) => f.property_id) || []
    );

    // Filter out favorites that already exist in database
    const newFavorites = localFavorites
      .filter(propertyId => !existingIds.has(propertyId))
      .map(propertyId => ({
        user_id: userId,
        property_id: propertyId,
      }));

    // Insert new favorites
    if (newFavorites.length > 0) {
      await supabase.from('favorites').insert(newFavorites);
    }

    // Clear localStorage after successful migration
    clearLocalFavorites();
  } catch (error) {
    console.error('Error migrating favorites:', error);
  }
}
