export interface Listing {
  id: string | null;
  source: string | null;
  address: string | null;
  city: string | null;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  latitude: number;
  longitude: number;
  listedDate: string | null;
  status: string | null;
  description: string | null;
}

export interface ScoredListing {
  listing: Listing;
  score: number;
}

export interface PagedListings {
  page: number;
  pageSize: number;
  total: number;
  items: ScoredListing[] | null;
}

export interface SearchFilters {
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  city?: string;
  keyword?: string;
  targetBudget?: number;
}
