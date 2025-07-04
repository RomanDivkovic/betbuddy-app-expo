// src/services/mmaApiService.ts

export const fetchMmaEvents = async (date: string) => {
  const url = `https://v1.mma.api-sports.io/fights?date=${date}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "x-apisports-key": "70657fde93dac699f8ab6e4a8cea01d9", // TODO: Use env var in production
      "x-rapidapi-host": "v1.mma.api-sports.io",
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch MMA events");
  }
  return response.json();
};
