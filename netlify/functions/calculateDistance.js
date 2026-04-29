// Netlify Function para calcular distância com OSRM (Open Source Routing Machine)
// Usa Nominatim para converter endereços em coordenadas

const cleanAddress = (address) => {
  // Remove "CEP:" e tudo depois dele se contiver número de CEP
  let cleaned = address
    .replace(/CEP:\s*,?\s*[-\d\s]*/gi, "")
    // Remove números de CEP tipo "13560-053" ou "13 - 565-820"
    .replace(/\d{5}-\d{3}/g, "")
    .replace(/\d{2}\s*-\s*\d{3}-\d{3}/g, "")
    // Remove números de rua
    .replace(/,\s*\d+\s*/g, ", ")
    // Remove hífen solto
    .replace(/,\s*-\s*/g, ", ")
    // Remove espaços múltiplos
    .replace(/\s+/g, " ")
    // Remove vírgula no final
    .replace(/,\s*$/, "")
    .trim();

  return cleaned;
};

const nominatimSearch = async (query) => {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=br`;
  const response = await fetch(url, {
    headers: { "User-Agent": "CaronaApp/1.0 (https://carona-app.netlify.app)" },
  });
  if (!response.ok) return [];
  const text = await response.text();
  return JSON.parse(text);
};

const extractCityFromAddress = (address) => {
  // Tenta extrair cidade de endereços como "... São Carlos - SP, 13560-053"
  const match = address.match(/([^,]+)\s*-\s*SP/i);
  return match ? match[1].trim() + ", SP, Brasil" : null;
};

const geocodeAddress = async (address) => {
  try {
    const cleanedAddress = cleanAddress(address);
    console.log("Trying to geocode:", cleanedAddress);

    // Tentativa 1: endereço limpo completo
    let data = await nominatimSearch(cleanedAddress);
    if (data.length > 0) {
      console.log("Found on attempt 1:", data[0].display_name);
      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    }

    // Tentativa 2: apenas nome da rua + cidade (sem bairro)
    const parts = cleanedAddress.split(",").filter(p => p.trim());
    if (parts.length >= 2) {
      const simplified = `${parts[0].trim()}, ${parts[parts.length - 1].trim()}`;
      console.log("Trying simplified:", simplified);
      data = await nominatimSearch(simplified);
      if (data.length > 0) {
        console.log("Found on attempt 2:", data[0].display_name);
        return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
      }
    }

    // Tentativa 3: apenas a cidade como fallback de último recurso
    const city = extractCityFromAddress(address);
    if (city) {
      console.log("Trying city fallback:", city);
      data = await nominatimSearch(city);
      if (data.length > 0) {
        console.log("Found on attempt 3 (city fallback):", data[0].display_name);
        return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
      }
    }

    console.warn("No results found for address:", address);
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
};

const calculateDistanceOSRM = async (originCoords, destinationCoords) => {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${originCoords.lon},${originCoords.lat};${destinationCoords.lon},${destinationCoords.lat}?overview=false`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.code === "Ok" && data.routes.length > 0) {
      const distanceInMeters = data.routes[0].distance;
      const distanceInKm = (distanceInMeters / 1000).toFixed(1);
      const durationInSeconds = data.routes[0].duration;
      const durationInMinutes = Math.round(durationInSeconds / 60);

      return {
        distance: parseFloat(distanceInKm),
        duration: durationInMinutes,
      };
    }
    return null;
  } catch (error) {
    console.error("OSRM error:", error);
    return null;
  }
};

export const handler = async (event) => {
  if (event.httpMethod !== "GET" && event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { origin, destination } = event.queryStringParameters || JSON.parse(event.body);

    if (!origin || !destination) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Origin and destination are required" }),
      };
    }

    // Geocodificar origem
    console.log("Starting geocoding for origin:", origin);
    const originCoords = await geocodeAddress(origin);
    console.log("Origin coords:", originCoords);

    if (!originCoords) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Could not find origin address" }),
      };
    }

    // Geocodificar destino
    console.log("Starting geocoding for destination:", destination);
    const destinationCoords = await geocodeAddress(destination);
    console.log("Destination coords:", destinationCoords);

    if (!destinationCoords) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Could not find destination address" }),
      };
    }

    // Calcular distância com OSRM
    const result = await calculateDistanceOSRM(originCoords, destinationCoords);
    if (!result) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No route found between addresses" }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        distance: result.distance,
        duration: result.duration,
      }),
    };
  } catch (error) {
    console.error("Error calculating distance:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error calculating distance" }),
    };
  }
};
