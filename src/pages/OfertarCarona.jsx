import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { createRide } from "../services/rideService";
import { calculateTariff } from "../services/tariffService";

function OfertarCarona() {
  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();
  const [formData, setFormData] = useState({
    origem: "",
    destino: "",
    data_hora: "",
    combustivel: "gasolina",
    preco_combustivel: 6.0,
    km_estimado: 0,
    lugares_disponiveis: 1,
  });
  const [tariff, setTariff] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newValue = [
      "km_estimado",
      "lugares_disponiveis",
      "preco_combustivel",
    ].includes(name)
      ? parseFloat(value)
      : value;

    const updated = { ...formData, [name]: newValue };
    setFormData(updated);

    if (updated.km_estimado > 0 && userData?.carro) {
      const newTariff = calculateTariff(
        updated.km_estimado,
        userData.carro.consumo_km_l,
        updated.combustivel,
        updated.preco_combustivel,
      );
      setTariff(newTariff);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!formData.origem || !formData.destino) {
        throw new Error("Origem e destino são obrigatórios");
      }
      if (formData.km_estimado <= 0) {
        throw new Error("Km estimado deve ser maior que 0");
      }

      const rideData = {
        ...formData,
        carro: {
          modelo: userData.carro.modelo,
          placa: userData.carro.placa,
        },
        valor_total: tariff.totalValue,
        valor_por_km: tariff.pricePerKm,
        data_hora: new Date(formData.data_hora),
      };

      const rideId = await createRide(currentUser.uid, rideData);
      alert(`Carona criada com sucesso! ID: ${rideId}`);
      navigate("/motorista");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!userData?.carro) {
    return (
      <div className="container">
        <p>Por favor, complete seus dados de motorista primeiro</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: "600px" }}>
      <h1>Oferecer Carona</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="origem"
          placeholder="Origem (ex: Rua A, 123)"
          value={formData.origem}
          onChange={handleInputChange}
          required
        />

        <input
          type="text"
          name="destino"
          placeholder="Destino (ex: Rua B, 456)"
          value={formData.destino}
          onChange={handleInputChange}
          required
        />

        <input
          type="datetime-local"
          name="data_hora"
          value={formData.data_hora}
          onChange={handleInputChange}
          required
        />

        <input
          type="number"
          name="km_estimado"
          placeholder="KM estimado"
          value={formData.km_estimado}
          onChange={handleInputChange}
          step="0.1"
          min="0"
          required
        />

        <select
          name="combustivel"
          value={formData.combustivel}
          onChange={handleInputChange}
        >
          <option value="gasolina">Gasolina (R$6.00)</option>
          <option value="alcool">Álcool (R$4.00)</option>
          <option value="diesel">Diesel (R$5.50)</option>
        </select>

        <input
          type="number"
          name="preco_combustivel"
          placeholder="Preço do combustível (R$/L)"
          value={formData.preco_combustivel}
          onChange={handleInputChange}
          step="0.01"
          min="0"
        />

        <input
          type="number"
          name="lugares_disponiveis"
          placeholder="Lugares disponíveis"
          value={formData.lugares_disponiveis}
          onChange={handleInputChange}
          min="1"
          max="8"
          required
        />

        {tariff && (
          <div className="card" style={{ background: "#f0f8ff" }}>
            <h3>Tarifa Calculada</h3>
            <p>Valor por KM: R$ {tariff.pricePerKm.toFixed(2)}</p>
            <p>
              <strong>Valor Total: R$ {tariff.totalValue.toFixed(2)}</strong>
            </p>
            <p>Passageiro paga 1/3: R$ {tariff.initialPayment.toFixed(2)}</p>
            <p>Passageiro paga 2/3: R$ {tariff.remainingPayment.toFixed(2)}</p>
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Criando..." : "Criar Carona"}
        </button>
      </form>

      <button
        onClick={() => navigate("/motorista")}
        style={{ background: "#6c757d", marginTop: "10px" }}
      >
        Voltar
      </button>
    </div>
  );
}

export default OfertarCarona;