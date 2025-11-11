"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/types/database.types";

type Property = Database["public"]["Tables"]["properties"]["Row"] & {
  property_images: { image_url: string; display_order: number }[];
  profiles: {
    full_name: string | null;
    phone: string | null;
    agency_name: string | null;
    bio: string | null;
  };
};

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPhone, setShowPhone] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchProperty = async () => {
    const propertyId = Array.isArray(params.id) ? params.id[0] : params.id;
    if (!propertyId) return;

    const supabase = createClient();
    const { data, error } = await supabase
      .from("properties")
      .select(
        `
        *,
        property_images(image_url, display_order),
        profiles(full_name, phone, agency_name, bio)
      `
      )
      .eq("id", propertyId)
      .single();

    if (!error && data) {
      setProperty(data as unknown as Property);
      // Determine edit permission based on ownership
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user && (data as unknown as Property).user_id === user.id) {
        setCanEdit(true);
      } else {
        setCanEdit(false);
      }
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!property || deleting) return;
    const confirmText = window.prompt(
      "Type DELETE to confirm you want to permanently remove this listing."
    );
    if (confirmText !== "DELETE") {
      if (confirmText !== null) {
        alert("Deletion cancelled. You must type DELETE exactly to confirm.");
      }
      return;
    }

    setDeleting(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/login";
        return;
      }
      // RLS should ensure only owner/admin can delete
      const { error } = await supabase
        .from("properties")
        .delete()
        .eq("id", property.id);
      if (error) {
        alert("Failed to delete property: " + error.message);
        setDeleting(false);
        return;
      }
      alert("Property deleted successfully.");
      router.push("/dashboard");
    } catch {
      alert("Unexpected error deleting property.");
      setDeleting(false);
    }
  };

  const checkFavorite = async () => {
    const propertyId = Array.isArray(params.id) ? params.id[0] : params.id;
    if (!propertyId) return;

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("property_id", propertyId)
        .single();

      setIsFavorite(!!data);
    }
  };

  useEffect(() => {
    fetchProperty();
    checkFavorite();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const handleContact = async () => {
    const propertyId = Array.isArray(params.id) ? params.id[0] : params.id;
    if (!propertyId) return;

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    // Record contact
    await supabase.from("contacts").insert({
      property_id: propertyId,
      user_id: user.id,
    });

    setShowPhone(true);
  };

  const toggleFavorite = async () => {
    const propertyId = Array.isArray(params.id) ? params.id[0] : params.id;
    if (!propertyId) return;

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    if (isFavorite) {
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("property_id", propertyId);
      setIsFavorite(false);
    } else {
      await supabase.from("favorites").insert({
        user_id: user.id,
        property_id: propertyId,
      });
      setIsFavorite(true);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-center text-gray-600">Property not found</p>
      </div>
    );
  }

  const images = property.property_images.sort(
    (a, b) => a.display_order - b.display_order
  );
  const mainImage =
    images[selectedImage]?.image_url || "/placeholder-property.svg";

  // Check if WhatsApp button should be shown (apartments or Karachi houses)
  const showWhatsApp =
    property.property_type === "apartment" ||
    (property.property_type === "house" &&
      property.city.toLowerCase() === "karachi");

  // WhatsApp number: +92 333 4344159
  const whatsappNumber = "923334344159"; // Remove + and spaces for URL
  const whatsappMessage = encodeURIComponent(
    `Hi, I'm interested in this property: ${property.title}`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-4">
        <Link href="/" className="text-blue-600 hover:text-blue-800">
          ← Back to properties
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative h-96 bg-gray-200">
              <img
                src={mainImage}
                alt={property.title}
                className="w-full h-full object-cover"
              />
              {property.featured && (
                <span className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-lg text-sm font-semibold">
                  Featured
                </span>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 p-4 overflow-x-auto">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    aria-label={`Select image ${idx + 1}`}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden ${
                      selectedImage === idx ? "ring-2 ring-blue-600" : ""
                    }`}
                  >
                    <img
                      src={img.image_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {property.title}
            </h1>
            {canEdit && (
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <Link
                  href={`/properties/${property.id}/edit`}
                  className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11 5h2m-7 7h2m2 0h6m-8 4h8M7 9h8m4-5H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z"
                    />
                  </svg>
                  Edit Listing
                </Link>
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold border-2 border-red-600 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60"
                  disabled={deleting}
                  title="Delete this listing"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2M4 7h16"
                    />
                  </svg>
                  {deleting ? "Deleting…" : "Delete Listing"}
                </button>
              </div>
            )}
            <p className="text-3xl font-bold text-blue-600 mb-4">
              PKR {property.price?.toLocaleString()}
            </p>

            <div className="flex items-center gap-6 mb-6 text-gray-600">
              <span className="capitalize bg-gray-100 px-3 py-1 rounded">
                {property.property_type}
              </span>
              <span className="capitalize bg-gray-100 px-3 py-1 rounded">
                {property.status}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {property.bedrooms && (
                <div className="text-center p-3 bg-gray-50 rounded">
                  <p className="text-2xl font-bold text-gray-900">
                    {property.bedrooms}
                  </p>
                  <p className="text-sm text-gray-600">Bedrooms</p>
                </div>
              )}
              {property.bathrooms && (
                <div className="text-center p-3 bg-gray-50 rounded">
                  <p className="text-2xl font-bold text-gray-900">
                    {property.bathrooms}
                  </p>
                  <p className="text-sm text-gray-600">Bathrooms</p>
                </div>
              )}
              {property.furnishing && (
                <div className="text-center p-3 bg-gray-50 rounded">
                  <p className="text-sm font-bold text-gray-900 capitalize">
                    {property.furnishing.replace("-", " ")}
                  </p>
                  <p className="text-sm text-gray-600">Furnishing</p>
                </div>
              )}
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Location</h2>
              <p className="text-gray-700">
                {property.address && `${property.address}, `}
                {property.area && `${property.area}, `}
                {property.city}
              </p>
            </div>

            {property.description && (
              <div>
                <h2 className="text-xl font-semibold mb-2">Description</h2>
                <p className="text-gray-700 whitespace-pre-line">
                  {property.description}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h3 className="text-xl font-semibold mb-4">Contact Dealer</h3>
            <div className="mb-4">
              <p className="font-semibold text-gray-900">
                {property.profiles?.agency_name ||
                  property.profiles?.full_name ||
                  "Anonymous"}
              </p>
              {property.profiles?.bio && (
                <p className="text-sm text-gray-600 mt-2">
                  {property.profiles.bio}
                </p>
              )}
            </div>

            {showPhone ? (
              <div className="mb-4 p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Phone Number:</p>
                <p className="text-xl font-bold text-green-700">
                  {property.profiles?.phone || "Not available"}
                </p>
              </div>
            ) : (
              <button
                onClick={handleContact}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 mb-4"
              >
                Show Phone Number
              </button>
            )}

            {showWhatsApp && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-green-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-600 mb-4 flex items-center justify-center gap-2 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                Contact on WhatsApp
              </a>
            )}

            <button
              onClick={toggleFavorite}
              className={`w-full py-3 px-4 rounded-lg font-semibold border-2 ${
                isFavorite
                  ? "bg-red-50 border-red-600 text-red-600 hover:bg-red-100"
                  : "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
              }`}
            >
              {isFavorite ? "♥ Saved" : "♡ Save Property"}
            </button>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Posted on {new Date(property.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
