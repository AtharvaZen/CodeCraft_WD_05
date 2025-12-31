"use client";

import React, { useEffect, useState } from "react";
import localFont from "next/font/local";

const osake = localFont({
  src: "../public/fonts/Osake.otf",
  variable: "--font-osake",
});

export default function Home() {
  const [city, setCity] = useState("");
  const [query, setQuery] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        fetchWeatherByCoords(latitude, longitude);
      });
    }
  }, []);

  const fetchWeatherByCoords = async (lat, lon) => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      const data = await res.json();
      setWeather(data);
      setCity(data.name);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching weather:", err);
      setLoading(false);
    }
  };

  const fetchWeatherByCity = async (cityName) => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`
      );
      const data = await res.json();
      setWeather(data);
      setCity(data.name);
      setLoading(false);
    } catch (err) {
      console.error("City not found");
      setLoading(false);
    }
  };

  const fetchCitySuggestions = async (input) => {
    if (input.length < 2) return setSuggestions([]);
    try {
      const res = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${input}&limit=5&appid=${API_KEY}`
      );
      const data = await res.json();
      setSuggestions(data);
    } catch (err) {
      console.error("Error fetching suggestions", err);
    }
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    fetchCitySuggestions(e.target.value);
  };

  const handleSuggestionClick = (suggestion) => {
    const cityName = `${suggestion.name},${suggestion.country}`;
    setQuery(cityName);
    setSuggestions([]);
    fetchWeatherByCity(cityName);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      fetchWeatherByCity(query);
      setSuggestions([]);
    }
  };

  return (
    <main
      className={`${osake.variable} flex flex-col items-center justify-center min-h-screen p-6 bg-cover bg-center`}
      style={{
        fontFamily: "var(--font-osake)",
        backgroundImage:
          "url('/images/sakura-bg.jpg')",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-pink-200 p-8">
        <h1 className="text-5xl text-center text-pink-700 mb-8 tracking-widest">
          天気アプリ (Weather App)
        </h1>

        <div className="relative mb-8">
          <input
            type="text"
            placeholder="都市を検索 / Search city"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="w-full p-3 pr-28 rounded-lg border border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400 text-gray-800 bg-white/90"
          />
          <button
            onClick={() => {
              fetchWeatherByCity(query);
              setSuggestions([]);
            }}
            className="absolute top-1 right-1 bottom-1 px-4 bg-pink-600 text-white font-medium rounded-md hover:bg-pink-700 transition"
          >
            検索
          </button>

          {suggestions.length > 0 && (
            <ul className="absolute z-10 mt-2 w-full bg-white border border-pink-200 rounded-md shadow-md overflow-hidden">
              {suggestions.map((sug, index) => (
                <li
                  key={index}
                  onClick={() => handleSuggestionClick(sug)}
                  className="px-4 py-2 text-gray-700 hover:bg-pink-100 cursor-pointer"
                >
                  {sug.name}, {sug.state ? `${sug.state}, ` : ""}
                  {sug.country}
                </li>
              ))}
            </ul>
          )}
        </div>

        {loading ? (
          <p className="text-center text-pink-700 font-medium animate-pulse">
            読み込み中... / Loading...
          </p>
        ) : weather && weather.main ? (
          <div className="bg-gradient-to-br from-pink-50/90 to-white/80 rounded-2xl shadow-lg p-6 text-center space-y-2 border border-pink-100">
            <h2 className="text-3xl text-pink-700">{city}</h2>
            <p className="text-lg text-gray-700">
              🌡 Temp: {weather.main.temp}°C
            </p>
            <p className="text-lg text-gray-700">
              ☁️ Condition: {weather.weather[0].main}
            </p>
            <p className="text-lg text-gray-700">
              💧 Humidity: {weather.main.humidity}%
            </p>
            <p className="text-lg text-gray-700">
              🌬 Wind: {weather.wind.speed} m/s
            </p>
          </div>
        ) : (
          <p className="text-center text-pink-700 italic">
            都市を検索してください 🌸 / Please search a city 🌸
          </p>
        )}
      </div>

     
    </main>
  );
}
