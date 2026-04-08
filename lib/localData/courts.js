import courtSeed from "@/data/courts.json";

const FALLBACK_OWNER_ID = "000000000000000000000001";

export function getFallbackCourts() {
  return courtSeed.map((court, index) => ({
    _id: String(court.$id || index + 1),
    owner: FALLBACK_OWNER_ID,
    name: court.name,
    description: court.description,
    address: court.address,
    amenities: court.amenities,
    availability: court.availability,
    price_per_hour: court.price_per_hour,
    image: court.image,
    sortOrder: index + 1,
    createdAt: null,
    updatedAt: null,
  }));
}
