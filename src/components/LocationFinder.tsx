import { Autocomplete, TextField, Box, Grid, Typography } from "@mui/material";
import useGeocoding, { locationScheme } from "../hooks/useGeocoding";
import { useEffect, useState } from "react";
import { LocationOn } from "@mui/icons-material";
import { z } from "zod";

export default function LocationFinder({
  apiKey,
  defaultQuery,
  onSelect,
  limit = 3,
  deferredQueryDuration = 700,
}: {
  apiKey: string;
  defaultQuery?: string;
  onSelect?: (geocoding: z.infer<typeof locationScheme>) => void;
  limit?: number;
  deferredQueryDuration?: number;
}) {
  const [query, setQuery] = useState(defaultQuery);
  const [deferredQueryRequest, setDeferredQueryRequest] = useState<
    NodeJS.Timeout | number | null
  >(null);
  const geocoding = useGeocoding({ apiKey, limit, query });
  const isLoading = deferredQueryRequest !== null || geocoding === null;

  useEffect(() => {
    return () => {
      if (deferredQueryRequest !== null) {
        clearTimeout(deferredQueryRequest);
        setDeferredQueryRequest(null);
      }
    };
  }, []);

  return (
    <Autocomplete
      autoComplete
      noOptionsText="No locations"
      onAbort={(e) => console.log(e)}
      loading={isLoading}
      options={isLoading || geocoding instanceof Error ? [] : geocoding}
      getOptionLabel={(e) =>
        [e.name, e.state, e.country].filter((e) => e).join(", ")
      }
      onChange={(_, value) => {
        if (value === null) setQuery("");
        if (value && onSelect) onSelect(value);
      }}
      isOptionEqualToValue={(a, b) => a.lat === b.lat && a.lon === b.lon}
      renderInput={(params) => (
        <TextField
          {...params}
          onChange={(e) => {
            if (deferredQueryRequest !== null) {
              clearTimeout(deferredQueryRequest);
              setDeferredQueryRequest(null);
            }
            if (e.target.value)
              setDeferredQueryRequest(
                setTimeout(() => {
                  setQuery(e.target.value);
                  setDeferredQueryRequest(null);
                }, deferredQueryDuration)
              );
            else setQuery("");
          }}
          label="Location"
          fullWidth
        />
      )}
      renderOption={(props, option) => {
        return (
          <Box component="li" {...props}>
            <Grid container alignItems="center" spacing={1}>
              <Grid item>
                <LocationOn />
              </Grid>
              <Grid item>
                <Typography>{option.name}</Typography>
              </Grid>
              <Grid item>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {[option.state, option.country].filter((e) => e).join(", ")}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        );
      }}
    />
  );
}
