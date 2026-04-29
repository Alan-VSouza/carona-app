import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getRideById } from "../services/rideService";
import { createReservation } from "../services/reservationService";
import { calculateTariff } from "../services/tariffService";
import { Header, HeaderDark } from "../components/Header";

function ReservaDetalhes() {
  const { rideId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [ride, setRide] = useState(null);
  const [tariff, setTariff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmado, setConfirmado] = useState(false);

  useEffect(() => {
    const fetchRide = async () => {
      try {
        const rideData = await getRideById(rideId);
        setRide(rideData);
        const tariffData = calculateTariff(
          rideData.km_estimado,
          15,
          rideData.combustivel,
          rideData.preco_combustivel,
        );
        setTariff(tariffData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRide();
  }, [rideId]);

  const handleReservar = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await createReservation(currentUser.uid, rideId, tariff);
      setConfirmado(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="container"><p>Carregando...</p></div>;
  if (!ride) return <div className="container"><p>Carona não encontrada</p></div>;

  const dataHora = new Date(ride.data_hora.seconds * 1000);

  return (
    <>
      <Header title="Detalhes da Reserva" onBack={() => navigate("/passageiro/caronas")} />
      <HeaderDark />

      <div className="container" style={{ maxWidth: "520px", paddingTop: "2rem" }}>
        {error && <div className="error-message">{error}</div>}

        {/* Info da carona */}
        <div className="card" style={{ marginBottom: "1rem" }}>
          <p style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Trajeto
          </p>
          <p style={{ fontWeight: "600", fontSize: "1rem", marginBottom: "1rem" }}>
            {ride.origem?.split(",")[0]} → {ride.destino?.split(",")[0]}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", fontSize: "0.875rem" }}>
            <div>
              <p style={{ color: "var(--text-secondary)", marginBottom: "0.25rem" }}>Data/Hora</p>
              <p style={{ fontWeight: "500" }}>
                {dataHora.toLocaleDateString("pt-BR")} às {dataHora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            <div>
              <p style={{ color: "var(--text-secondary)", marginBottom: "0.25rem" }}>Carro</p>
              <p style={{ fontWeight: "500" }}>{ride.carro?.modelo}</p>
            </div>
            <div>
              <p style={{ color: "var(--text-secondary)", marginBottom: "0.25rem" }}>Distância</p>
              <p style={{ fontWeight: "500" }}>{ride.km_estimado} km</p>
            </div>
            <div>
              <p style={{ color: "var(--text-secondary)", marginBottom: "0.25rem" }}>Combustível</p>
              <p style={{ fontWeight: "500" }}>
                {ride.combustivel?.charAt(0).toUpperCase() + ride.combustivel?.slice(1)}
              </p>
            </div>
          </div>
        </div>

        {/* Valores */}
        <div className="card" style={{
          background: "var(--tertiary-bg)",
          borderLeft: "3px solid var(--accent)",
          marginBottom: "1.5rem"
        }}>
          <p style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Valores
          </p>
          {tariff && (
            <div style={{ display: "grid", gap: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                <span style={{ color: "var(--text-secondary)" }}>Valor Total</span>
                <span style={{ fontWeight: "700", color: "var(--text-primary)" }}>R$ {tariff.totalValue.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                <span style={{ color: "var(--text-secondary)" }}>Você paga agora (1/3)</span>
                <span style={{ fontWeight: "700", color: "var(--success)" }}>R$ {tariff.initialPayment.toFixed(2)}</span>
              </div>
              <div style={{
                display: "flex", justifyContent: "space-between", fontSize: "0.875rem",
                paddingTop: "0.75rem", borderTop: "1px solid var(--border)"
              }}>
                <span style={{ color: "var(--text-secondary)" }}>Você paga depois (2/3)</span>
                <span style={{ fontWeight: "700", color: "var(--warning)" }}>R$ {tariff.remainingPayment.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        {confirmado ? (
          <div className="card" style={{
            borderLeft: "3px solid var(--success)",
            background: "var(--tertiary-bg)",
            marginBottom: "1rem"
          }}>
            <p style={{ fontWeight: "600", color: "var(--success)", marginBottom: "0.5rem" }}>
              Reserva confirmada!
            </p>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
              Seu PIN será liberado quando o motorista iniciar a carona. Acompanhe em "Minhas Reservas".
            </p>
            <button onClick={() => navigate("/passageiro/minhas-reservas")} style={{ width: "100%" }}>
              Ver Minhas Reservas
            </button>
          </div>
        ) : (
          <form onSubmit={handleReservar}>
            <button type="submit" disabled={submitting} style={{ width: "100%", marginBottom: "0.75rem" }}>
              {submitting ? "Processando..." : `Pagar R$ ${tariff?.initialPayment.toFixed(2)} e Reservar`}
            </button>
          </form>
        )}

        {!confirmado && (
          <button
            onClick={() => navigate("/passageiro/caronas")}
            style={{
              width: "100%",
              background: "var(--secondary-bg)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
              boxShadow: "none"
            }}
          >
            Cancelar
          </button>
        )}
      </div>
    </>
  );
}

export default ReservaDetalhes;
