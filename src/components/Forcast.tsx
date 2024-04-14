import { Alert, Grid, Paper, Skeleton, Typography } from "@mui/material";
import useForcast from "../hooks/useForecast";
import {
  AccessTime,
  Cloud,
  SvgIconComponent,
  Thermostat,
} from "@mui/icons-material";
import moment from "moment";

export default function Forcast({
  apiKey,
  longitude,
  latitude,
}: {
  apiKey: string;
  longitude: number;
  latitude: number;
}) {
  const forcast = useForcast({ apiKey, latitude, longitude });
  const isLoading = forcast === null;
  const isError = forcast instanceof Error;

  const Aspect = ({
    icon,
    text,
    description,
  }: {
    icon: ReturnType<SvgIconComponent>;
    text: string;
    description: string;
  }) => {
    return (
      <Grid item container alignItems="center" spacing={1}>
        <Grid item>{icon}</Grid>
        <Grid item>
          <Typography variant="body1">{text}</Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Grid>
      </Grid>
    );
  };

  const Panel = ({
    main,
    description,
    temp,
    feels_like,
    dt,
    timezone,
  }: {
    main?: string;
    description?: string;
    temp: number;
    feels_like: number;
    dt: number;
    timezone: number;
  }) => {
    return (
      <Paper sx={{ p: 2 }} variant="outlined">
        {main && description && (
          <Grid container sx={{ mb: 4 }} alignItems="center" spacing={1}>
            <Grid item>
              <Cloud sx={{ mr: 1 }} />
            </Grid>
            <Grid item>
              <Typography variant="h5">{main}</Typography>
              <Typography variant="body1" color="text.secondary">
                {description}
              </Typography>
            </Grid>
          </Grid>
        )}
        <Grid container spacing={2}>
          <Aspect
            icon={<Thermostat />}
            text={`${temp}˚C`}
            description={`Feels like ${feels_like}`}
          ></Aspect>
          <Aspect
            icon={<AccessTime />}
            text={moment
              .unix(dt)
              .add(timezone, "seconds")
              .format("DD-MM-YYYY HH:mm")}
            description="Time"
          ></Aspect>
        </Grid>
      </Paper>
    );
  };

  if (isLoading) return <Skeleton variant="rounded" />;
  else if (isError)
    return (
      <Alert severity="error">
        Error fetching weather data: {forcast.message}
      </Alert>
    );
  else
    return (
      <Grid container spacing={2} direction="column">
        {forcast.list.map((e) => {
          return (
            <Grid item key={e.dt}>
              <Panel
                main={e.weather[0]?.main}
                description={e.weather[0]?.description}
                temp={e.main.temp}
                feels_like={e.main.feels_like}
                dt={e.dt}
                timezone={forcast.city.timezone}
              ></Panel>
            </Grid>
          );
        })}
      </Grid>
    );
}
