import { Container, Paper, Typography, Box } from "@mui/material";
import LocationFinder from "./components/LocationFinder";
import { useEffect, useState } from "react";
import { locationScheme } from "./hooks/useGeocoding";
import Weather from "./components/Weather";
import { z } from "zod";
import Forcast from "./components/Forcast";

const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const STORAGE_LOCATION_KEY = "location";

const getSavedLocation = (): z.infer<typeof locationScheme> => {
  try {
    return locationScheme.parse(
      JSON.parse(localStorage.getItem(STORAGE_LOCATION_KEY) ?? "{}")
    );
  } catch (e) {
    return {
      name: "New York County",
      lat: 40.7128,
      lon: -74.006,
      state: "New York",
      country: "US",
    };
  }
};

export default function App() {
  const [location, setLocation] = useState<z.infer<typeof locationScheme>>(
    getSavedLocation()
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_LOCATION_KEY, JSON.stringify(location));
  }, [location]);

  return (
    <Container maxWidth="md">
      <Paper variant="outlined" sx={{ my: 2, p: 2 }}>
        <LocationFinder
          onSelect={setLocation}
          apiKey={WEATHER_API_KEY}
        ></LocationFinder>
      </Paper>
      <Box sx={{ my: 2 }}>
        <Typography variant="h4">Weather</Typography>
        <Typography variant="body1" color="text.secondary">
          {[location.name, location.state, location.country]
            .filter((e) => e)
            .join(", ")}
        </Typography>
        <Typography gutterBottom variant="body2" color="text.secondary">
          {location.lat.toFixed(4)}&deg;N, {location.lon.toFixed(4)}&deg;E
        </Typography>
        <Weather
          apiKey={WEATHER_API_KEY}
          longitude={location.lon}
          latitude={location.lat}
        ></Weather>
      </Box>
      <Box sx={{ my: 2 }}>
        <Typography gutterBottom variant="h5">
          Forcast
        </Typography>
        <Forcast
          apiKey={WEATHER_API_KEY}
          longitude={location.lon}
          latitude={location.lat}
        ></Forcast>
      </Box>
    </Container>
  );
}
