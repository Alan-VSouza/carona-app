// Serviço para calcular distância usando OSRM (Open Source Routing Machine)
// Usa Nominatim para geocodificação e OSRM para roteamento

export const calculateDistance = async (origin, destination) => {
  if (!origin || !destination) {
    return null
  }

  try {
    const response = await fetch(
      `/.netlify/functions/calculateDistance?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`
    )

    if (!response.ok) {
      console.warn('Erro ao calcular distância:', response.status)
      return null
    }

    const data = await response.json()

    if (data.error) {
      console.warn('Erro ao calcular distância:', data.error)
      return null
    }

    return data.distance
  } catch (error) {
    console.error('Erro ao calcular distância:', error)
    return null
  }
}

export const formatAddress = (address) => {
  // Remove números de complemento para melhor matching
  return address.trim()
}
