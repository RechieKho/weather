import { Container, Paper } from "@mui/material";
import LocationFinder from "./components/LocationFinder";

const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

export default function App() {
  return (
    <Container maxWidth="md">
      <Paper elevation={4} variant="elevation" sx={{ my: 2, p: 2 }}>
        <LocationFinder apiKey={WEATHER_API_KEY}></LocationFinder>
      </Paper>
    </Container>
  );
}
