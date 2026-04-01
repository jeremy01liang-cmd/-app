import React, { useEffect, useState } from "react";
import { Header } from "../components/Header";
import { TreeArea } from "../components/TreeArea";
import { ChickenArea } from "../components/ChickenArea";
import { CrawlingBugs } from "../components/CrawlingBugs";
import { DEFAULT_WEATHER_LOCATION, fetchTodayWeather, type TodayWeather, type WeatherLocation } from "../lib/weather";

type WeatherState =
  | { status: "loading" }
  | { status: "ready"; data: TodayWeather; fallbackNote: string | null }
  | { status: "error" };

type WeatherScene = "sunny" | "cloudy" | "rainy" | "snowy" | "stormy" | "foggy";

const rainDrops = [
  { left: 6, delay: 0, duration: 1.1, opacity: 0.4 },
  { left: 12, delay: 0.35, duration: 1.35, opacity: 0.55 },
  { left: 19, delay: 0.2, duration: 1.05, opacity: 0.45 },
  { left: 27, delay: 0.75, duration: 1.25, opacity: 0.5 },
  { left: 34, delay: 0.15, duration: 1.2, opacity: 0.45 },
  { left: 42, delay: 0.5, duration: 1.05, opacity: 0.5 },
  { left: 49, delay: 0.9, duration: 1.3, opacity: 0.4 },
  { left: 57, delay: 0.4, duration: 1.1, opacity: 0.55 },
  { left: 63, delay: 0.1, duration: 1.2, opacity: 0.45 },
  { left: 71, delay: 0.65, duration: 1.15, opacity: 0.55 },
  { left: 78, delay: 0.25, duration: 1.3, opacity: 0.4 },
  { left: 86, delay: 0.8, duration: 1.05, opacity: 0.5 },
  { left: 93, delay: 0.55, duration: 1.2, opacity: 0.45 },
];

const snowflakes = [
  { left: 7, size: 18, delay: 0.1, duration: 7.5 },
  { left: 15, size: 12, delay: 1.3, duration: 6.2 },
  { left: 24, size: 16, delay: 0.6, duration: 8.2 },
  { left: 31, size: 14, delay: 2.2, duration: 6.8 },
  { left: 39, size: 20, delay: 0.2, duration: 8.8 },
  { left: 47, size: 13, delay: 1.1, duration: 6.4 },
  { left: 56, size: 17, delay: 1.8, duration: 7.9 },
  { left: 64, size: 12, delay: 0.9, duration: 6.1 },
  { left: 73, size: 18, delay: 2.5, duration: 8.4 },
  { left: 81, size: 15, delay: 1.5, duration: 7.1 },
  { left: 90, size: 19, delay: 0.4, duration: 8.6 },
];

function getCurrentPosition(): Promise<WeatherLocation> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("当前浏览器不支持定位"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          label: "当前位置",
        });
      },
      (error) => reject(error),
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 1000 * 60 * 10,
      },
    );
  });
}

function getWeatherScene(weatherCode: number): WeatherScene {
  if ([95, 96, 99].includes(weatherCode)) return "stormy";
  if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) return "snowy";
  if ([45, 48].includes(weatherCode)) return "foggy";
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)) return "rainy";
  if ([1, 2, 3].includes(weatherCode)) return "cloudy";
  return "sunny";
}

function getWeatherLabel(weatherCode: number, isDay: boolean) {
  if (weatherCode === 0) return isDay ? "晴朗" : "晴夜";
  if ([1, 2].includes(weatherCode)) return "多云";
  if (weatherCode === 3) return "阴天";
  if ([45, 48].includes(weatherCode)) return "有雾";
  if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) return "下雪";
  if ([95, 96, 99].includes(weatherCode)) return "雷雨";
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)) return "下雨";
  return "天气变化中";
}

function getSceneBackground(scene: WeatherScene) {
  switch (scene) {
    case "stormy":
      return "from-slate-400 via-slate-200 to-green-100";
    case "rainy":
      return "from-sky-300 via-slate-100 to-green-100";
    case "snowy":
      return "from-cyan-100 via-slate-50 to-emerald-50";
    case "foggy":
      return "from-slate-200 via-slate-100 to-green-100";
    case "cloudy":
      return "from-sky-200 via-slate-50 to-green-100";
    default:
      return "from-sky-200 via-sky-100 to-green-100";
  }
}

export const Home: React.FC = () => {
  const [weatherState, setWeatherState] = useState<WeatherState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    const loadWeather = async () => {
      try {
        const location = await getCurrentPosition();
        const data = await fetchTodayWeather(location);

        if (!cancelled) {
          setWeatherState({ status: "ready", data, fallbackNote: null });
        }
      } catch {
        try {
          const fallbackData = await fetchTodayWeather(DEFAULT_WEATHER_LOCATION);

          if (!cancelled) {
            setWeatherState({
              status: "ready",
              data: fallbackData,
              fallbackNote: `未获取到定位，展示${DEFAULT_WEATHER_LOCATION.label}天气`,
            });
          }
        } catch {
          if (!cancelled) {
            setWeatherState({ status: "error" });
          }
        }
      }
    };

    loadWeather();

    return () => {
      cancelled = true;
    };
  }, []);

  const weatherData = weatherState.status === "ready" ? weatherState.data : null;
  const weatherScene = weatherData ? getWeatherScene(weatherData.weatherCode) : "sunny";
  const weatherLabel = weatherData ? getWeatherLabel(weatherData.weatherCode, weatherData.isDay) : "天气加载中";
  const weatherEmoji =
    weatherScene === "stormy"
      ? "⛈️"
      : weatherScene === "rainy"
        ? "🌧️"
        : weatherScene === "snowy"
          ? "❄️"
          : weatherScene === "foggy"
            ? "🌫️"
            : weatherScene === "cloudy"
              ? "⛅"
              : weatherData?.isDay === false
                ? "🌙"
                : "☀️";

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-sky-100 p-4 md:p-5">
      {/* 装饰性背景 */}
      <div
        className={`absolute top-0 left-0 h-full w-full pointer-events-none opacity-25 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] ${
          weatherScene === "stormy"
            ? "from-slate-500 via-slate-200 to-sky-100"
            : weatherScene === "rainy"
              ? "from-sky-300 via-sky-100 to-sky-200"
              : weatherScene === "snowy"
                ? "from-cyan-100 via-white to-sky-100"
                : "from-yellow-300 via-sky-100 to-sky-200"
        }`}
      />

      {/* 头部组件 */}
      <Header />

      {/* 中部核心区域 (左右布局 - 统一大背景) */}
      <main
        className={`relative z-10 mb-4 grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_minmax(280px,340px)] overflow-hidden rounded-[40px] border-4 border-green-300/50 bg-gradient-to-b shadow-inner max-[900px]:grid-cols-1 ${getSceneBackground(weatherScene)}`}
      >
        <div
          className={`pointer-events-none absolute inset-0 ${
            weatherScene === "stormy"
              ? "bg-[linear-gradient(180deg,rgba(51,65,85,0.22)_0%,rgba(148,163,184,0.08)_45%,rgba(255,255,255,0)_100%)]"
              : weatherScene === "rainy"
                ? "bg-[linear-gradient(180deg,rgba(125,211,252,0.18)_0%,rgba(255,255,255,0)_100%)]"
                : weatherScene === "snowy"
                  ? "bg-[linear-gradient(180deg,rgba(255,255,255,0.35)_0%,rgba(255,255,255,0)_60%)]"
                  : weatherScene === "foggy"
                    ? "bg-[linear-gradient(180deg,rgba(226,232,240,0.35)_0%,rgba(255,255,255,0)_70%)]"
                    : ""
          }`}
        />

        {/* 自然风景装饰背景 - 远景丘陵 */}
        <div className="absolute bottom-[30%] left-[-10%] right-[40%] h-[40%] bg-gradient-to-b from-green-300/60 to-green-400/40 pointer-events-none rounded-[100%]" style={{ transform: "rotate(-5deg)" }}></div>
        <div className="absolute bottom-[25%] left-[30%] right-[-10%] h-[45%] bg-gradient-to-b from-green-300/80 to-green-400/50 pointer-events-none rounded-[100%]" style={{ transform: "rotate(3deg)" }}></div>
        
        {/* 自然风景装饰背景 - 近景草地 */}
        <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-green-500 via-green-400 to-green-300 pointer-events-none shadow-[0_-10px_20px_rgba(0,0,0,0.05)]" style={{ borderRadius: "100% 100% 0 0 / 15% 15% 0 0" }}></div>

        {/* 天气信息，绝对定位，不占布局 */}
        <div className="absolute right-5 top-5 z-20 max-w-[220px] rounded-full border-2 border-white/70 bg-white/60 px-4 py-2 text-right shadow-md backdrop-blur-md">
          <div className="flex items-center justify-end gap-2 text-lg font-black text-sky-700">
            <span>{weatherEmoji}</span>
            <span>{weatherData ? `${Math.round(weatherData.currentTemperature)}°` : "--°"}</span>
          </div>
          <div className="text-xs font-bold text-gray-600">
            {weatherData ? `${weatherData.locationLabel} · ${weatherLabel}` : "正在获取真实天气"}
          </div>
          {weatherState.status === "ready" && weatherState.fallbackNote ? (
            <div className="text-[10px] text-gray-400">{weatherState.fallbackNote}</div>
          ) : null}
        </div>

        {/* 天气特效 */}
        {(weatherScene === "rainy" || weatherScene === "stormy") && (
          <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
            {rainDrops.map((drop, index) => (
              <span
                key={index}
                className="weather-rain-drop absolute top-[-12%] h-18 w-[2px] rounded-full bg-gradient-to-b from-white/10 via-sky-100/80 to-sky-400/80"
                style={{
                  left: `${drop.left}%`,
                  opacity: drop.opacity,
                  animationDelay: `${drop.delay}s`,
                  animationDuration: `${drop.duration}s`,
                }}
              />
            ))}
          </div>
        )}

        {weatherScene === "snowy" && (
          <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
            {snowflakes.map((flake, index) => (
              <span
                key={index}
                className="weather-snowflake absolute top-[-10%] text-white/90 drop-shadow-[0_2px_6px_rgba(255,255,255,0.4)]"
                style={{
                  left: `${flake.left}%`,
                  fontSize: `${flake.size}px`,
                  animationDelay: `${flake.delay}s`,
                  animationDuration: `${flake.duration}s`,
                }}
              >
                ❄
              </span>
            ))}
          </div>
        )}

        {weatherScene === "foggy" && (
          <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
            <div className="weather-mist absolute left-[-6%] right-[45%] top-[16%] h-16 rounded-full bg-white/45 blur-xl" />
            <div className="weather-mist absolute left-[20%] right-[12%] top-[24%] h-20 rounded-full bg-slate-100/55 blur-xl" style={{ animationDelay: "1.2s" }} />
            <div className="weather-mist absolute left-[8%] right-[35%] top-[36%] h-14 rounded-full bg-white/35 blur-xl" style={{ animationDelay: "2.4s" }} />
          </div>
        )}

        {weatherScene === "stormy" && <div className="weather-flash pointer-events-none absolute inset-0 z-[2] bg-white/70 opacity-0" />}
        
        {/* 天空装饰 */}
        <div className="weather-cloud absolute left-12 top-8 pointer-events-none text-6xl opacity-70">☁️</div>
        <div className="weather-cloud absolute right-40 top-16 pointer-events-none text-5xl opacity-60" style={{ animationDelay: "1.6s" }}>☁️</div>
        {(weatherScene === "sunny" || weatherScene === "cloudy" || weatherScene === "snowy" || weatherScene === "foggy") && (
          <div
            className={`absolute left-1/2 top-6 pointer-events-none text-7xl drop-shadow-[0_0_20px_rgba(255,215,0,0.8)] ${
              weatherScene === "cloudy"
                ? "opacity-25"
                : weatherScene === "snowy" || weatherScene === "foggy"
                  ? "opacity-20"
                  : "opacity-40"
            }`}
          >
            {weatherData?.isDay === false ? "🌙" : "☀️"}
          </div>
        )}
        {(weatherScene === "rainy" || weatherScene === "stormy") && (
          <>
            <div className="weather-cloud absolute left-[12%] top-8 pointer-events-none text-7xl opacity-80">☁️</div>
            <div className="weather-cloud absolute left-[42%] top-5 pointer-events-none text-8xl opacity-75" style={{ animationDelay: "0.8s" }}>☁️</div>
            <div className="weather-cloud absolute right-[14%] top-12 pointer-events-none text-6xl opacity-70" style={{ animationDelay: "2.2s" }}>☁️</div>
          </>
        )}
        
        {/* 草地装饰 */}
        <div className="absolute bottom-6 left-[15%] text-3xl opacity-90 pointer-events-none">🌻</div>
        <div className="absolute bottom-12 right-[18%] text-3xl opacity-90 pointer-events-none">🍄</div>
        <div className="absolute bottom-4 left-[45%] text-2xl opacity-80 pointer-events-none">🌱</div>
        <div className="absolute bottom-16 left-[25%] text-xl opacity-60 pointer-events-none">🌿</div>
        <div className="absolute bottom-10 right-[35%] text-2xl opacity-70 pointer-events-none">🌼</div>
        {(weatherScene === "rainy" || weatherScene === "stormy") && (
          <>
            <div className="absolute bottom-22 left-[38%] text-2xl opacity-70 pointer-events-none">💧</div>
            <div className="absolute bottom-18 right-[26%] text-2xl opacity-65 pointer-events-none">💦</div>
          </>
        )}
        {weatherScene === "snowy" && (
          <>
            <div className="absolute bottom-16 left-[18%] text-xl opacity-70 pointer-events-none">☃️</div>
            <div className="absolute bottom-20 right-[30%] text-xl opacity-70 pointer-events-none">❄️</div>
          </>
        )}
        
        {/* 满地爬的虫子 */}
        <CrawlingBugs />
        
        {/* 左侧成长树区域 */}
        <div className="z-10 min-h-0 py-5 pl-5 pr-3 md:pl-7">
          <TreeArea />
        </div>
        
        {/* 右侧宠物区域 */}
        <div className="z-10 min-h-0 py-5 pl-3 pr-5 md:pr-7">
          <ChickenArea />
        </div>
      </main>
    </div>
  );
};
