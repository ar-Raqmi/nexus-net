import { inferCategory, LUMA_KL_PLACE_API_ID } from "@/lib/events";
import type { LumaEvent } from "@/lib/types";

// Proxy for the public Luma Kuala Lumpur discovery feed. Luma's API has no
// CORS/auth issues server-side, and proxying keeps the client simple and lets
// us normalise the payload into a small, stable shape.

const LUMA_ENDPOINT = "https://api.lu.ma/discover/get-paginated-events";
const FETCH_TIMEOUT_MS = 10_000;

interface LumaTicketInfo {
  is_free?: boolean;
  price?: { cents?: number; currency?: string } | null;
  max_price?: { cents?: number; currency?: string } | null;
  is_sold_out?: boolean;
  spots_remaining?: number | null;
  is_near_capacity?: boolean;
}

interface LumaEntry {
  event?: {
    api_id?: string;
    name?: string;
    url?: string;
    start_at?: string;
    end_at?: string | null;
    timezone?: string;
    cover_url?: string | null;
    location_type?: string;
    geo_address_info?: {
      city?: string | null;
      short_address?: string | null;
      full_address?: string | null;
    } | null;
  };
  hosts?: { name?: string }[];
  guest_count?: number;
  ticket_info?: LumaTicketInfo | null;
  registration_availability?: string;
}

interface LumaResponse {
  entries?: LumaEntry[];
}

function formatPrice(info: LumaTicketInfo | null | undefined): {
  isFree: boolean;
  priceLabel: string | null;
} {
  if (!info) return { isFree: true, priceLabel: null };
  if (info.is_free) return { isFree: true, priceLabel: null };
  const cents = info.price?.cents;
  if (typeof cents !== "number") return { isFree: false, priceLabel: null };
  const currency = (info.price?.currency ?? "myr").toUpperCase();
  const amount = cents / 100;
  const label = `${currency} ${amount % 1 === 0 ? amount : amount.toFixed(2)}`;
  return { isFree: false, priceLabel: label };
}

function normalise(entry: LumaEntry): LumaEvent | null {
  const event = entry.event;
  if (!event?.api_id || !event.name || !event.start_at) return null;

  const hosts = (entry.hosts ?? [])
    .map((h) => h.name)
    .filter((n): n is string => Boolean(n));

  const address =
    event.geo_address_info?.short_address ??
    event.geo_address_info?.full_address ??
    null;

  const { isFree, priceLabel } = formatPrice(entry.ticket_info);

  return {
    id: event.api_id,
    name: event.name,
    url: event.url ? `https://lu.ma/${event.url}` : "https://lu.ma/kuala-lumpur",
    startAt: event.start_at,
    endAt: event.end_at ?? null,
    timezone: event.timezone ?? "Asia/Kuala_Lumpur",
    coverUrl: event.cover_url ?? null,
    hosts,
    city: event.geo_address_info?.city ?? null,
    address,
    locationType: event.location_type ?? "offline",
    registration: entry.registration_availability ?? "open",
    isFree,
    priceLabel,
    guestCount: entry.guest_count ?? 0,
    category: inferCategory(event.name, hosts.join(" "), event.geo_address_info?.city),
    relevance: 0,
    reasons: [],
  };
}

export async function GET(): Promise<Response> {
  const params = new URLSearchParams({
    discover_place_api_id: LUMA_KL_PLACE_API_ID,
    pagination_limit: "50",
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(`${LUMA_ENDPOINT}?${params.toString()}`, {
      signal: controller.signal,
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Origin: "https://lu.ma",
        Referer: "https://lu.ma/kuala-lumpur",
        "User-Agent": "Mozilla/5.0 (Nexus Net event calendar)",
      },
    });

    if (!res.ok) {
      return Response.json(
        { error: `Luma responded with ${res.status}.` },
        { status: 502 },
      );
    }

    const data = (await res.json()) as LumaResponse;
    const events = (data.entries ?? [])
      .map(normalise)
      .filter((e): e is LumaEvent => e !== null)
      .sort((a, b) => a.startAt.localeCompare(b.startAt));

    return Response.json({ events, source: "luma", place: "Kuala Lumpur" });
  } catch (err) {
    const message =
      err instanceof Error && err.name === "AbortError"
        ? "Luma took too long to respond."
        : "Could not reach the Luma events feed.";
    return Response.json({ error: message }, { status: 502 });
  } finally {
    clearTimeout(timer);
  }
}