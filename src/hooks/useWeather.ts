import { useEffect, useState } from "react";
import { z } from "zod";

const weatherURL = "https://api.openweathermap.org/data/2.5/weather";

const Weather = z.object({
  base: z.string(),
  clouds: z.object({
    all: z.number().min(0).max(100),
  }),
  coord: z.object({
    lon: z.number().finite(),
    lat: z.number().finite(),
  }),
  dt: z.number().positive().int(),
  weather: z.array(
    z.object({
      id: z.number().finite().int(),
      main: z.string(),
      description: z.string(),
      icon: z.string(),
    })
  ),
  main: z.object({
    temp: z.number().finite(),
    feels_like: z.number().finite(),
    temp_min: z.number().finite(),
    temp_max: z.number().finite(),
    pressure: z.number().positive().finite(),
    humidity: z.number().min(0).max(100),
    sea_level: z.number().positive().finite().optional(),
    grnd_level: z.number().positive().finite().optional(),
  }),
  visibility: z.number().positive().max(10000),
  wind: z.object({
    speed: z.number().finite(),
    deg: z.number().finite(),
    gust: z.number().finite().optional(),
  }),
  rain: z
    .object({
      "1h": z.number().positive().finite().optional(),
      "3h": z.number().positive().finite().optional(),
    })
    .optional(),
  snow: z
    .object({
      "1h": z.number().positive().finite().optional(),
      "3h": z.number().positive().finite().optional(),
    })
    .optional(),
  sys: z.object({
    sunrise: z.number().positive().int(),
    sunset: z.number().positive().int(),
  }),
  timezone: z.number().int(),
  cod: z.number(),
});

export default function useWeather({
  apiKey,
  latitude,
  longitude,
  language = "EN",
  units = "metric",
}: {
  apiKey: string;
  latitude: number;
  longitude: number;
  language?: string;
  units?: string;
}) {
  const [weather, setWeather] = useState<
    z.infer<typeof Weather> | Error | null
  >(null);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const headers = new Headers();
        const searchParams = new URLSearchParams();
        searchParams.append("lat", latitude.toString());
        searchParams.append("lon", longitude.toString());

        searchParams.append("units", units.toLowerCase());
        searchParams.append("lang", language.toUpperCase());
        searchParams.append("mode", "json");
        searchParams.append("appid", apiKey);

        const request = new Request(
          `${weatherURL}?${searchParams.toString()}`,
          {
            method: "GET",
            headers,
            mode: "cors",
            cache: "default",
          }
        );

        const result = await fetch(request, { signal: controller.signal });
        setWeather(Weather.parse(await result.json()));
      } catch (e) {
        if (!(e instanceof Error)) return; // Ignore malformed throw.
        if (e.name === "AbortError") return; // Ignore abort error.
        setWeather(e);
      }
    })();

    return () => controller.abort();
  }, [apiKey, latitude, longitude, language, units]);

  return weather;
}
