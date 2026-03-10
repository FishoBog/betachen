export type PropertyType = 'sale' | 'long_rent' | 'short_rent';
export type PropertyStatus = 'draft' | 'published' | 'expired' | 'sold' | 'rented';
export type UserRole = 'buyer' | 'owner' | 'admin';
export type LocationPrivacy = 'exact' | 'approximate' | 'area_only';

export interface PropertyImage {
  id: string;
  property_id: string;
  image_url: string;
  is_main: boolean;
  sort_order: number;
}

export interface Profile {
  id: string;
  clerk_id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
}

export interface Property {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  type: PropertyType;
  status: PropertyStatus;
  price: number;
  currency: 'ETB' | 'USD';
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqm: number | null;
  floor: number | null;
  total_floors: number | null;
  year_built: number | null;
  location_name: string;
  subcity: string | null;
  woreda: string | null;
  latitude: number | null;
  longitude: number | null;
  location_privacy: LocationPrivacy;
  amenities: string[];
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  property_images?: PropertyImage[];
  profiles?: Profile;
  avg_rating?: number;
  review_count?: number;
}

export interface Chat {
  id: string;
  property_id: string;
  buyer_id: string;
  owner_id: string;
  created_at: string;
  properties?: Property;
  buyer?: Profile;
  owner?: Profile;
}

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export interface Review {
  id: string;
  property_id: string;
  reviewer_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles?: Profile;
}

export interface SavedSearch {
  id: string;
  user_id: string;
  name: string;
  filters: Record<string, any>;
  notify: boolean;
  created_at: string;
}

export const AMENITIES_KEYS = [
  'parking','wifi','generator','water_tank','security','cctv',
  'gym','pool','elevator','furnished','ac','solar',
] as const;
