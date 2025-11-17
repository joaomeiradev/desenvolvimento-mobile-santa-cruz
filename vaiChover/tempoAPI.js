const API_KEY = "e05498ac4b87323ad1a5ed2dc50db537";

// Nova função unificada para buscar o clima e a previsão de 5 dias por coordenadas
export async function getWeatherAndForecastByCoords(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=pt_br&appid=${API_KEY}`;
  const response = await fetch(url);
  return response.json();
}

// Nova função unificada para buscar o clima e a previsão de 5 dias por cidade
export async function getWeatherAndForecastByCity(city) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&lang=pt_br&appid=${API_KEY}`;
  const response = await fetch(url);
  return response.json();
}