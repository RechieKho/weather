import { useEffect, useState } from "react";
import { z } from "zod";

const reverseGeocodingURL = "https://api.openweathermap.org/geo/1.0/reverse";

const ReverseGeocoding = z.array(
  z.object({
    name: z.string(),
    lat: z.number().finite(),
    lon: z.number().finite(),
    country: z.string(),
    state: z.string().optional(),
  })
);

export default function useReverseGeocoding({
  apiKey,
  latitude,
  longitude,
  limit = 5,
}: {
  apiKey: string;
  latitude: number;
  longitude: number;
  limit?: number;
}) {
  const [reverseGeocoding, setReverseGeocoding] = useState<
    z.infer<typeof ReverseGeocoding> | Error | null
  >(null);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const headers = new Headers();
        const searchParams = new URLSearchParams();
        searchParams.append("lat", latitude.toString());
        searchParams.append("lon", longitude.toString());
        searchParams.append("appid", apiKey);
        searchParams.append("limit", limit.toString());

        const request = new Request(
          `${reverseGeocodingURL}?${searchParams.toString()}`,
          {
            method: "GET",
            headers,
            mode: "cors",
            cache: "default",
          }
        );

        const result = await fetch(request, { signal: controller.signal });
        setReverseGeocoding(ReverseGeocoding.parse(await result.json()));
      } catch (e) {
        if (!(e instanceof Error)) return; // Ignore malformed throw.
        if (e.name === "AbortError") return; // Ignore abort error.
        setReverseGeocoding(e);
      }
    })();

    return () => controller.abort();
  });

  return reverseGeocoding;
}
