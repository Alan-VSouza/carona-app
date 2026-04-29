const FUEL_PRICES = {
  gasolina: 6.0,
  alcool: 4.0,
  diesel: 5.5,
};

export const calculateTariff = (
  kmEstimado,
  kmL,
  fuelType,
  fuelPrice = null,
) => {
  const pricePerLiter = fuelPrice || FUEL_PRICES[fuelType];
  const pricePerKm = pricePerLiter / kmL;
  const totalValue = pricePerKm * kmEstimado;

  return {
    pricePerLiter,
    pricePerKm: parseFloat(pricePerKm.toFixed(2)),
    totalValue: parseFloat(totalValue.toFixed(2)),
    initialPayment: parseFloat((totalValue / 3).toFixed(2)),
    remainingPayment: parseFloat(((totalValue * 2) / 3).toFixed(2)),
  };
};

export const adjustFuelPrice = (fuelType, adjustment) => {
  const basePrice = FUEL_PRICES[fuelType];
  const minPrice = basePrice * 0.9;
  const maxPrice = basePrice * 1.1;
  const adjustedPrice = basePrice + adjustment;

  if (adjustedPrice < minPrice || adjustedPrice > maxPrice) {
    return basePrice;
  }

  return parseFloat(adjustedPrice.toFixed(2));
};

export const getDefaultFuelPrice = (fuelType) => {
  return FUEL_PRICES[fuelType];
};