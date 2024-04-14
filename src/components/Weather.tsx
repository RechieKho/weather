import {
  Alert,
  Card,
  CardContent,
  Grid,
  Skeleton,
  Typography,
} from "@mui/material";
import useWeather from "../hooks/useWeather";
import { useMemo } from "react";
import {
  AcUnit,
  AccessTime,
  Air,
  Cloud,
  Compress,
  SvgIconComponent,
  Thermostat,
  Visibility,
  Water,
  WaterDrop,
} from "@mui/icons-material";
import moment from "moment";

export default function Weather({
  apiKey,
  longitude,
  latitude,
}: {
  apiKey: string;
  longitude: number;
  latitude: number;
}) {
  const weather = useWeather({ apiKey, longitude, latitude });
  const isLoading = weather === null;
  const isError = weather instanceof Error;
  const currentWeather = useMemo(() => {
    if (isLoading || isError) return null;
    if (weather.weather.length) return weather.weather[0];
    else return null;
  }, [weather]);

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

  const RainAspect = () => {
    if (isLoading || isError) return null;
    if (!weather.rain) return null;
    if (weather.rain["1h"])
      return (
        <Aspect
          icon={<WaterDrop />}
          text={`${weather.rain["1h"]} mm`}
          description="Raining volume for the last 1 hour"
        />
      );
    if (weather.rain["3h"])
      return (
        <Aspect
          icon={<WaterDrop />}
          text={`${weather.rain["3h"]} mm`}
          description="Raining volume or the last 3 hours"
        />
      );
    return null;
  };

  const SnowAspect = () => {
    if (isLoading || isError) return null;
    if (!weather.snow) return null;
    if (weather.snow["1h"])
      return (
        <Aspect
          icon={<AcUnit />}
          text={`${weather.snow["1h"]} mm`}
          description="Snowing volume for the last 1 hour"
        />
      );
    if (weather.snow["3h"])
      return (
        <Aspect
          icon={<AcUnit />}
          text={`${weather.snow["3h"]} mm`}
          description="Snowing volume for the last 3 hours"
        />
      );
    return null;
  };

  if (isLoading) return <Skeleton variant="rounded" />;
  else if (isError)
    return (
      <Alert severity="error">
        Error fetching weather data: {weather.message}
      </Alert>
    );
  else
    return (
      <Card variant="outlined">
        <CardContent>
          {currentWeather && (
            <Grid container sx={{ mb: 4 }} alignItems="center" spacing={1}>
              <Grid item xs={1}>
                <Cloud />
              </Grid>
              <Grid item>
                <Typography variant="h5">{currentWeather.main}</Typography>
                <Typography variant="body1" color="text.secondary">
                  {currentWeather.description}
                </Typography>
              </Grid>
            </Grid>
          )}

          <Grid container direction="row" spacing={2}>
            <Aspect
              icon={<Thermostat />}
              text={`${weather.main.temp}˚C`}
              description={`Feels like ${weather.main.feels_like}`}
            ></Aspect>
            <Aspect
              icon={<Water />}
              text={`${weather.main.humidity} %`}
              description="Humidity"
            ></Aspect>
            <Aspect
              icon={<Compress />}
              text={`${weather.main.pressure} hPa`}
              description="Pressure"
            ></Aspect>
            {weather.visibility < 10000 && (
              <Aspect
                icon={<Visibility />}
                text={`${weather.visibility} km`}
                description="Visibility"
              ></Aspect>
            )}
            <Aspect
              icon={<Air />}
              text={`${weather.wind.speed} km`}
              description={`Blow toward ${weather.wind.deg}˚`}
            ></Aspect>
            <RainAspect />
            <SnowAspect />
            <Aspect
              icon={<AccessTime />}
              text={moment
                .unix(weather.dt)
                .utc()
                .add(weather.timezone, "seconds")
                .format("DD-MM-YYYY HH:mm")}
              description="Time"
            ></Aspect>
          </Grid>
        </CardContent>
      </Card>
    );
}
