import { DependencyList, useEffect, useState } from "react";
import { z } from "zod";

const weatherURL = "https://apiKey.openweathermap.org/data/2.5/weather";

const Weather = z.object({
  coord: z.object({
    lon: z.number().finite(),
    lat: z.number().finite(),
  }),
  weather: z.array(
    z.object({
      id: z.number().finite().int(),
      main: z.string(),
      description: z.string(),
      icon: z.string(),
    })
  ),
  base: z.string(),
  main: z.object({
    temp: z.number().finite(),
    feels_like: z.number().finite(),
    temp_min: z.number().finite(),
    temp_max: z.number().finite(),
    pressure: z.number().positive().finite(),
    humidity: z.number().min(0).max(100),
    sea_level: z.number().positive().finite(),
    grnd_level: z.number().positive().finite(),
  }),
  visibility: z.number().positive().max(10000),
  wind: z.object({
    speed: z.number().finite(),
    deg: z.number().finite(),
    gust: z.number().finite(),
  }),
  clouds: z.object({
    all: z.number().min(0).max(100),
  }),
  rain: z.object({
    "1h": z.number().positive().finite().optional(),
    "3h": z.number().positive().finite().optional(),
  }),
  snow: z.object({
    "1h": z.number().positive().finite().optional(),
    "3h": z.number().positive().finite().optional(),
  }),
  dt: z.number().positive().int(),
  sys: z.object({
    type: z.number(),
    id: z.number(),
    country: z.string(),
    sunrise: z.number().positive().int(),
    sunset: z.number().positive().int(),
  }),
  timezone: z.number().positive().int(),
  cod: z.number(),
});

export default function useWeather({
  apiKey,
  latitude,
  longitude,
  language = "EN",
  units = "metric",
  deps,
}: {
  apiKey: string;
  latitude: number;
  longitude: number;
  language: string;
  units: string;
  deps?: DependencyList;
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
        if (e.name === "AbortError") return; // Ignore aboort error.
        setWeather(e);
      }
    })();

    return () => controller.abort();
  }, deps);

  return weather;
}
