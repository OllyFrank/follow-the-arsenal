export interface GeocodeResult {
  label: string;
  latitude: number;
  longitude: number;
}

const UK_POSTCODE_RE = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;

function looksLikeUkPostcode(query: string): boolean {
  return UK_POSTCODE_RE.test(query.trim());
}

async function geocodeUkPostcode(postcode: string): Promise<GeocodeResult | null> {
  const cleaned = encodeURIComponent(postcode.trim());

  // Current postcode lookup.
  const res = await fetch(`https://api.postcodes.io/postcodes/${cleaned}`);
  if (res.ok) {
    const body = await res.json();
    const r = body.result;
    return { label: r.postcode, latitude: r.latitude, longitude: r.longitude };
  }

  // Fall back to the terminated-postcodes endpoint (postcodes.io handles
  // discontinued postcodes here, not on the main endpoint).
  const terminatedRes = await fetch(
    `https://api.postcodes.io/terminated_postcodes/${cleaned}`,
  );
  if (terminatedRes.ok) {
    const body = await terminatedRes.json();
    const r = body.result;
    if (r?.longitude != null && r?.latitude != null) {
      return { label: `${r.postcode} (discontinued)`, latitude: r.latitude, longitude: r.longitude };
    }
  }

  return null;
}

async function geocodeNominatim(query: string): Promise<GeocodeResult | null> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return null;
  const body = await res.json();
  if (!Array.isArray(body) || body.length === 0) return null;
  const first = body[0];
  return {
    label: first.display_name,
    latitude: Number(first.lat),
    longitude: Number(first.lon),
  };
}

/** UK postcodes go through postcodes.io; everything else through Nominatim. */
export async function geocode(query: string): Promise<GeocodeResult | null> {
  const trimmed = query.trim();
  if (trimmed.length === 0) return null;

  if (looksLikeUkPostcode(trimmed)) {
    const result = await geocodeUkPostcode(trimmed);
    if (result) return result;
  }

  return geocodeNominatim(trimmed);
}
