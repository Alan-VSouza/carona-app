import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { createRide } from "../services/rideService";
import { calculateTariff } from "../services/tariffService";
import { calculateDistance } from "../services/mapsService";
import { Header, HeaderDark } from "../components/Header";
import AddressAutocomplete from "../components/AddressAutocomplete";

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
  const [calculatingDistance, setCalculatingDistance] = useState(false);
  const [distanceSource, setDistanceSource] = useState(""); // "maps" ou "manual"

  // Calcular distância automaticamente quando origem/destino mudam
  useEffect(() => {
    const calculateDistanceAuto = async () => {
      if (formData.origem && formData.destino) {
        setCalculatingDistance(true);
        try {
          const distance = await calculateDistance(formData.origem, formData.destino);
          if (distance) {
            setFormData(prev => ({
              ...prev,
              km_estimado: distance
            }));
            setDistanceSource("maps");
          }
        } catch (err) {
          console.error("Erro ao calcular distância:", err);
        } finally {
          setCalculatingDistance(false);
        }
      }
    };

    // Debounce: calcular apenas 500ms após parar de digitar
    const timer = setTimeout(calculateDistanceAuto, 500);
    return () => clearTimeout(timer);
  }, [formData.origem, formData.destino]);

  // Atualizar tarifa quando km ou combustível mudam
  useEffect(() => {
    if (formData.km_estimado > 0 && userData?.carro) {
      const newTariff = calculateTariff(
        formData.km_estimado,
        userData.carro.consumo_km_l,
        formData.combustivel,
        formData.preco_combustivel,
      );
      setTariff(newTariff);
    }
  }, [formData.km_estimado, formData.combustivel, formData.preco_combustivel, userData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newValue = [
      "km_estimado",
      "lugares_disponiveis",
      "preco_combustivel",
    ].includes(name)
      ? parseFloat(value) || 0
      : value;

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Se usuário edita manualmente o km, marca como manual
    if (name === "km_estimado") {
      setDistanceSource("manual");
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
      if (!formData.data_hora) {
        throw new Error("Data e hora são obrigatórias");
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
      <>
        <Header title="Oferecer Carona" onBack={() => navigate("/motorista")} />
        <HeaderDark />
        <div className="container" style={{ paddingTop: "2rem" }}>
          <div className="error-message">
            Por favor, complete seus dados de motorista primeiro
          </div>
          <button
            onClick={() => navigate("/motorista")}
            style={{ marginTop: "1rem", width: "100%" }}
          >
            Voltar
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Oferecer Carona" onBack={() => navigate("/motorista")} />
      <HeaderDark />

      <div className="container" style={{ paddingTop: "2rem", maxWidth: "600px" }}>
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "0.75rem" }}>
          {/* Origem */}
          <div>
            <label>Origem</label>
            <AddressAutocomplete
              name="origem"
              value={formData.origem}
              onChange={handleInputChange}
              placeholder="Ex: IFSP São Carlos, Rua Episcopal..."
            />
          </div>

          {/* Destino */}
          <div>
            <label>Destino</label>
            <AddressAutocomplete
              name="destino"
              value={formData.destino}
              onChange={handleInputChange}
              placeholder="Ex: USP São Carlos, Av. São Carlos..."
            />
          </div>

          {/* Distância - com indicador de cálculo automático */}
          <div>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "0.5rem"
            }}>
              <label>Distância (km)</label>
              {calculatingDistance && (
                <span style={{
                  fontSize: "0.75rem",
                  color: "var(--accent)",
                  fontWeight: "600"
                }}>
                  Calculando...
                </span>
              )}
              {distanceSource === "maps" && !calculatingDistance && (
                <span style={{
                  fontSize: "0.75rem",
                  color: "var(--success)",
                  fontWeight: "600"
                }}>
                  ✓ Calculado automaticamente
                </span>
              )}
              {distanceSource === "manual" && (
                <span style={{
                  fontSize: "0.75rem",
                  color: "var(--warning)",
                  fontWeight: "600"
                }}>
                  Editado manualmente
                </span>
              )}
            </div>
            <input
              type="number"
              name="km_estimado"
              placeholder="KM estimado"
              value={formData.km_estimado || ""}
              onChange={handleInputChange}
              step="0.1"
              min="0"
              required
              disabled={calculatingDistance}
              style={{
                opacity: calculatingDistance ? 0.6 : 1
              }}
            />
          </div>

          {/* Data e Hora */}
          <div>
            <label>Data e Hora</label>
            <input
              type="datetime-local"
              name="data_hora"
              value={formData.data_hora}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Combustível */}
          <div>
            <label>Tipo de Combustível</label>
            <select
              name="combustivel"
              value={formData.combustivel}
              onChange={handleInputChange}
            >
              <option value="gasolina">Gasolina</option>
              <option value="alcool">Álcool</option>
              <option value="diesel">Diesel</option>
            </select>
          </div>

          {/* Preço do Combustível */}
          <div>
            <label>Preço do Combustível (R$/L)</label>
            <input
              type="number"
              name="preco_combustivel"
              placeholder="Preço do combustível"
              value={formData.preco_combustivel}
              onChange={handleInputChange}
              step="0.01"
              min="0"
            />
          </div>

          {/* Lugares Disponíveis */}
          <div>
            <label>Lugares Disponíveis</label>
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
          </div>

          {/* Tarifa Calculada */}
          {tariff && (
            <div className="card" style={{
              background: "var(--tertiary-bg)",
              borderLeft: "3px solid var(--success)"
            }}>
              <h3 style={{ marginBottom: "1rem", fontSize: "clamp(1rem, 3vw, 1.125rem)" }}>
                Tarifa Calculada
              </h3>
              <div style={{
                display: "grid",
                gap: "0.75rem",
                fontSize: "0.9rem"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Distância:</span>
                  <span style={{ fontWeight: "600" }}>{formData.km_estimado.toFixed(1)} km</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Valor por km:</span>
                  <span style={{ fontWeight: "600" }}>R$ {tariff.pricePerKm.toFixed(2)}</span>
                </div>
                <div style={{
                  borderTop: "1px solid var(--border)",
                  paddingTop: "0.75rem",
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "1rem",
                  fontWeight: "700"
                }}>
                  <span>Valor Total:</span>
                  <span style={{ color: "var(--success)" }}>R$ {tariff.totalValue.toFixed(2)}</span>
                </div>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.75rem",
                  marginTop: "0.75rem",
                  fontSize: "0.85rem"
                }}>
                  <div style={{
                    background: "var(--secondary-bg)",
                    padding: "0.75rem",
                    borderRadius: "0.625rem",
                    textAlign: "center"
                  }}>
                    <p style={{ margin: "0 0 0.25rem 0", color: "var(--text-secondary)" }}>Passageiro paga agora</p>
                    <p style={{ margin: 0, fontWeight: "600", color: "var(--success)" }}>
                      R$ {tariff.initialPayment.toFixed(2)}
                    </p>
                  </div>
                  <div style={{
                    background: "var(--secondary-bg)",
                    padding: "0.75rem",
                    borderRadius: "0.625rem",
                    textAlign: "center"
                  }}>
                    <p style={{ margin: "0 0 0.25rem 0", color: "var(--text-secondary)" }}>Passageiro paga depois</p>
                    <p style={{ margin: 0, fontWeight: "600", color: "var(--warning)" }}>
                      R$ {tariff.remainingPayment.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || calculatingDistance || formData.km_estimado <= 0}
            style={{ marginTop: "1rem" }}
          >
            {loading ? "Criando carona..." : "Criar Carona"}
          </button>
        </form>

        <button
          onClick={() => navigate("/motorista")}
          style={{
            marginTop: "1rem",
            width: "100%",
            background: "var(--secondary-bg)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
            padding: "1rem",
            boxShadow: "none"
          }}
        >
          Cancelar
        </button>
      </div>
    </>
  );
}

export default OfertarCarona;
