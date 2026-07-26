/**
 * Rough visitor location derived from platform geo headers or a short-lived IP lookup.
 * The IP is used only in memory for resolution and is never returned or persisted.
 */

export type ApproximateLocation = {
  /** Human-readable label, e.g. "Nairobi, Kenya". */
  label: string;
  city?: string;
  region?: string;
  country?: string;
  countryCode?: string;
};

type IpLookupResponse = {
  success?: boolean;
  city?: string;
  region?: string;
  country?: string;
  country_code?: string;
};

/**
 * Builds a comma-separated location label from available geo parts.
 */
function formatLocationLabel(parts: {
  city?: string;
  region?: string;
  country?: string;
  countryCode?: string;
}): string | undefined {
  const city = parts.city?.trim();
  const region = parts.region?.trim();
  const country = parts.country?.trim() || parts.countryCode?.trim();

  const segments = [city, region, country].filter(
    (segment, index, all): segment is string => Boolean(segment) && all.indexOf(segment) === index,
  );

  if (segments.length === 0) {
    return undefined;
  }

  return segments.join(", ");
}

/** Minimal headers shape (Next `ReadonlyHeaders` / Fetch `Headers`). */
type RequestHeadersLike = {
  get(name: string): string | null;
};

/**
 * Reads the client IP from common proxy headers for a one-shot geo lookup.
 * Never persist the return value.
 */
function readClientIp(headers: RequestHeadersLike): string | undefined {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  return (
    headers.get("cf-connecting-ip")?.trim() ||
    headers.get("x-real-ip")?.trim() ||
    headers.get("x-vercel-forwarded-for")?.trim() ||
    undefined
  );
}

/**
 * Resolves location from Vercel / Cloudflare request headers when present.
 * @see https://vercel.com/kb/guide/geo-ip-headers-geolocation-vercel-functions
 */
function locationFromPlatformHeaders(headers: RequestHeadersLike): ApproximateLocation | undefined {
  const city = headers.get("x-vercel-ip-city")?.trim() || undefined;
  const region = headers.get("x-vercel-ip-country-region")?.trim() || undefined;
  const countryCode =
    headers.get("x-vercel-ip-country")?.trim() || headers.get("cf-ipcountry")?.trim() || undefined;

  // Cloudflare may send "XX" / "T1" for unknown / Tor — treat as missing.
  const normalizedCountryCode =
    countryCode && !["XX", "T1", "XD"].includes(countryCode.toUpperCase())
      ? countryCode.toUpperCase()
      : undefined;

  const label = formatLocationLabel({
    city: city ? decodeURIComponent(city) : undefined,
    region,
    countryCode: normalizedCountryCode,
  });

  if (!label) {
    return undefined;
  }

  return {
    label,
    city: city ? decodeURIComponent(city) : undefined,
    region,
    countryCode: normalizedCountryCode,
  };
}

/**
 * Looks up a rough city/region/country for an IP via ipwho.is (HTTPS, no API key).
 * Only city-level fields are kept — no ISP, coordinates, or IP in the result.
 */
async function locationFromIpLookup(ip: string): Promise<ApproximateLocation | undefined> {
  try {
    const response = await fetch(
      `https://ipwho.is/${encodeURIComponent(ip)}?fields=success,city,region,country,country_code`,
      {
        signal: AbortSignal.timeout(2500),
        headers: { Accept: "application/json" },
      },
    );

    if (!response.ok) {
      return undefined;
    }

    const data = (await response.json()) as IpLookupResponse;
    if (!data.success) {
      return undefined;
    }

    const label = formatLocationLabel({
      city: data.city,
      region: data.region,
      country: data.country,
      countryCode: data.country_code,
    });

    if (!label) {
      return undefined;
    }

    return {
      label,
      city: data.city?.trim() || undefined,
      region: data.region?.trim() || undefined,
      country: data.country?.trim() || undefined,
      countryCode: data.country_code?.trim()?.toUpperCase() || undefined,
    };
  } catch {
    return undefined;
  }
}

/**
 * Resolves an approximate visitor location for contact/inbox metadata.
 * Prefers platform geo headers; falls back to a transient IP lookup that is discarded afterward.
 */
export async function resolveApproximateLocation(
  headers: RequestHeadersLike,
): Promise<ApproximateLocation | undefined> {
  const fromPlatform = locationFromPlatformHeaders(headers);
  if (fromPlatform) {
    return fromPlatform;
  }

  const ip = readClientIp(headers);
  if (!ip) {
    return undefined;
  }

  return locationFromIpLookup(ip);
}
