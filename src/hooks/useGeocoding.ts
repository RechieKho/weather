import { useEffect, useState } from "react";
import { z } from "zod";

const geocodingURL = "https://api.openweathermap.org/geo/1.0/direct";

const Geocoding = z.array(
  z.object({
    name: z.string(),
    lat: z.number().finite(),
    lon: z.number().finite(),
    country: z.string(),
    state: z.string().optional(),
  })
);

export type GeocodingResult = z.infer<typeof Geocoding>;

export default function useGeocoding({
  apiKey,
  query,
  limit = 5,
}: {
  apiKey: string;
  query?: string;
  limit?: number;
}) {
  const [geocoding, setGeocoding] = useState<GeocodingResult | Error | null>(
    []
  );

  useEffect(() => {
    const controller = new AbortController();

    setGeocoding(null);
    if (query)
      (async () => {
        try {
          const headers = new Headers();
          const searchParams = new URLSearchParams();
          searchParams.append("q", query);
          searchParams.append("appid", apiKey);
          searchParams.append("limit", limit.toString());

          const request = new Request(
            `${geocodingURL}?${searchParams.toString()}`,
            {
              method: "GET",
              headers,
              mode: "cors",
              cache: "default",
            }
          );

          const result = await fetch(request, { signal: controller.signal });
          setGeocoding(Geocoding.parse(await result.json()));
        } catch (e) {
          if (!(e instanceof Error)) return; // Ignore malformed throw.
          if (e.name === "AbortError") return; // Ignore abort error.
          setGeocoding(e);
        }
      })();
    else setGeocoding([]);

    return () => controller.abort();
  }, [apiKey, query, limit]);

  return geocoding;
}
