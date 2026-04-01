const OPEN_METEO_BASE_URL = "https://api.open-meteo.com/v1/forecast";

export type WeatherLocation = {
  latitude: number;
  longitude: number;
  label: string;
};

export type TodayWeather = {
  locationLabel: string;
  currentTemperature: number;
  apparentTemperature: number;
  weatherCode: number;
  isDay: boolean;
  windSpeed: number;
  humidity: number;
  maxTemperature: number;
  minTemperature: number;
  precipitationProbability: number;
  sunrise: string;
  sunset: string;
  updatedAt: string;
};

export const DEFAULT_WEATHER_LOCATION: WeatherLocation = {
  latitude: 31.2304,
  longitude: 121.4737,
  label: "上海",
};

type OpenMeteoResponse = {
  current?: {
    time?: string;
    temperature_2m?: number;
    apparent_temperature?: number;
    weather_code?: number;
    is_day?: number;
    wind_speed_10m?: number;
    relative_humidity_2m?: number;
  };
  daily?: {
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    precipitation_probability_max?: number[];
    sunrise?: string[];
    sunset?: string[];
  };
};

export async function fetchTodayWeather(location: WeatherLocation): Promise<TodayWeather> {
  const url = new URL(OPEN_METEO_BASE_URL);

  url.searchParams.set("latitude", String(location.latitude));
  url.searchParams.set("longitude", String(location.longitude));
  url.searchParams.set(
    "current",
    [
      "temperature_2m",
      "apparent_temperature",
      "weather_code",
      "is_day",
      "wind_speed_10m",
      "relative_humidity_2m",
    ].join(","),
  );
  url.searchParams.set(
    "daily",
    [
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_probability_max",
      "sunrise",
      "sunset",
    ].join(","),
  );
  url.searchParams.set("forecast_days", "1");
  url.searchParams.set("timezone", "auto");

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`天气接口请求失败: ${response.status}`);
  }

  const data = (await response.json()) as OpenMeteoResponse;
  const current = data.current;
  const daily = data.daily;

  if (
    current?.temperature_2m == null ||
    current.apparent_temperature == null ||
    current.weather_code == null ||
    current.is_day == null ||
    current.wind_speed_10m == null ||
    current.relative_humidity_2m == null ||
    !daily?.temperature_2m_max?.length ||
    !daily.temperature_2m_min?.length ||
    !daily.precipitation_probability_max?.length ||
    !daily.sunrise?.length ||
    !daily.sunset?.length ||
    !current.time
  ) {
    throw new Error("天气接口返回的数据不完整");
  }

  return {
    locationLabel: location.label,
    currentTemperature: current.temperature_2m,
    apparentTemperature: current.apparent_temperature,
    weatherCode: current.weather_code,
    isDay: current.is_day === 1,
    windSpeed: current.wind_speed_10m,
    humidity: current.relative_humidity_2m,
    maxTemperature: daily.temperature_2m_max[0],
    minTemperature: daily.temperature_2m_min[0],
    precipitationProbability: daily.precipitation_probability_max[0],
    sunrise: daily.sunrise[0],
    sunset: daily.sunset[0],
    updatedAt: current.time,
  };
}
