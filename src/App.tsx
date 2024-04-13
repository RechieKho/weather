import { Container, Paper, Typography } from "@mui/material";
import LocationFinder from "./components/LocationFinder";
import { useState } from "react";
import { ValuesType } from "utility-types";
import { GeocodingResult } from "./hooks/useGeocoding";
import Weather from "./components/Weather";

const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

export default function App() {
  const [location, setLocation] = useState<ValuesType<GeocodingResult> | null>(
    null
  );

  return (
    <Container maxWidth="md">
      <Paper variant="outlined" sx={{ my: 2, p: 2 }}>
        <LocationFinder
          onSelect={setLocation}
          apiKey={WEATHER_API_KEY}
        ></LocationFinder>
      </Paper>
      {location ? (
        <Weather
          apiKey={WEATHER_API_KEY}
          longitude={location.lon}
          latitude={location.lat}
        ></Weather>
      ) : (
        <Typography color="text.secondary">
          Please select a location.
        </Typography>
      )}
    </Container>
  );
}
