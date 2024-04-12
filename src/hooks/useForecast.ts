import { useEffect, useState } from "react";
import { z } from "zod";

const forcastURL = "https://api.openweathermap.org/data/2.5/forecast";

const Forcast = z.object({
  cod: z.string().transform((e, _) => parseInt(e)),
  message: z.number(),
  cnt: z.number().positive().int().finite(),
  list: z.array(
    z.object({
      dt: z.number().positive().int().finite(),
      main: z.object({
        temp: z.number().finite(),
        feels_like: z.number().finite(),
        temp_min: z.number().finite(),
        temp_max: z.number().finite(),
        pressure: z.number().positive().finite(),
        humidity: z.number().min(0).max(100),
        sea_level: z.number().positive().finite(),
        grnd_level: z.number().positive().finite(),
        temp_kf: z.number(),
      }),
      weather: z.array(
        z.object({
          id: z.number(),
          main: z.string(),
          description: z.string(),
          icon: z.string(),
        })
      ),
      city: z
        .object({
          coord: z.object({
            lat: z.number().finite(),
            lon: z.number().finite(),
          }),
          population: z.number().positive().finite(),
          timezone: z.number().positive().int(),
          sunrise: z.number().positive().int(),
          sunset: z.number().positive().int(),
        })
        .optional(),
    })
  ),
});

export default function useForcast({
  apiKey,
  latitude,
  longitude,
  units = "metric",
  language = "EN",
  count = 3,
}: {
  apiKey: string;
  latitude: number;
  longitude: number;
  units?: string;
  language?: string;
  count?: number;
}) {
  const [forcast, setForcast] = useState<
    z.infer<typeof Forcast> | Error | null
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
        searchParams.append("units", units);
        searchParams.append("mode", "json");
        searchParams.append("cnt", count.toString());
        searchParams.append("lang", language);

        const request = new Request(
          `${forcastURL}?${searchParams.toString()}`,
          {
            method: "GET",
            headers,
            mode: "cors",
            cache: "default",
          }
        );

        const result = await fetch(request, { signal: controller.signal });
        setForcast(Forcast.parse(await result.json()));
      } catch (e) {
        if (!(e instanceof Error)) return; // Ignore malformed throw.
        if (e.name === "AbortError") return; // Ignore abort error.
        setForcast(e);
      }
    })();

    return () => controller.abort();
  }, [apiKey, latitude, longitude, units, language, count]);

  return forcast;
}
