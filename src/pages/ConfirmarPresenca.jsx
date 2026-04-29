import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getReservationById, confirmarPagamentoFinal } from "../services/reservationService";
import { getRideById } from "../services/rideService";
import { Header, HeaderDark } from "../components/Header";

function ConfirmarPresenca() {
  const { reservationId } = useParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(null);
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resData = await getReservationById(reservationId);
        setReservation(resData);
        const rideData = await getRideById(resData.ride_id);
        setRide(rideData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Polling a cada 10s para detectar quando motorista iniciar
    const interval = setInterval(async () => {
      try {
        const resData = await getReservationById(reservationId);
        setReservation(resData);
      } catch {}
    }, 10000);

    return () => clearInterval(interval);
  }, [reservationId]);

  const handlePagarEVerPin = async () => {
    setPaying(true);
    try {
      await confirmarPagamentoFinal(reservationId);
      setReservation(prev => ({ ...prev, pin_bloqueado: false }));
    } catch (err) {
      setError(err.message);
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <div className="container"><p>Carregando...</p></div>;
  if (!reservation) return <div className="container"><p>Reserva não encontrada</p></div>;

  const caronaIniciada = ride?.status === "em_progresso";
  const pinVisivel = !reservation.pin_bloqueado && reservation.pin;

  return (
    <>
      <Header title="Meu PIN" onBack={() => navigate("/passageiro/minhas-reservas")} />
      <HeaderDark />

      <div className="container" style={{ maxWidth: "520px", paddingTop: "2rem" }}>
        {error && <div className="error-message">{error}</div>}

        {/* Info da carona */}
        <div className="card" style={{ marginBottom: "1rem" }}>
          <p style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Carona
          </p>
          <p style={{ fontWeight: "600", fontSize: "1rem", marginBottom: "0.75rem" }}>
            {ride?.origem?.split(",")[0]} → {ride?.destino?.split(",")[0]}
          </p>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
            <span style={{ color: "var(--text-secondary)" }}>Pago (1/3)</span>
            <span style={{ fontWeight: "600", color: "var(--success)" }}>R$ {reservation.valor_pago_inicial?.toFixed(2)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", marginTop: "0.4rem" }}>
            <span style={{ color: "var(--text-secondary)" }}>Restante (2/3)</span>
            <span style={{ fontWeight: "600", color: "var(--warning)" }}>R$ {reservation.valor_pendente?.toFixed(2)}</span>
          </div>
        </div>

        {/* Estados */}
        {pinVisivel ? (
          <div className="card" style={{
            borderLeft: "3px solid var(--success)",
            background: "var(--tertiary-bg)",
            textAlign: "center"
          }}>
            <p style={{ fontWeight: "600", color: "var(--success)", marginBottom: "0.5rem" }}>
              PIN disponível
            </p>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              Mostre este código ao motorista para embarcar
            </p>
            <div style={{
              fontSize: "3rem",
              fontWeight: "800",
              letterSpacing: "0.5rem",
              color: "var(--text-primary)",
              background: "var(--secondary-bg)",
              border: "1px solid var(--border)",
              borderRadius: "0.75rem",
              padding: "1.5rem",
              fontFamily: "'Inconsolata', monospace"
            }}>
              {reservation.pin}
            </div>
          </div>

        ) : caronaIniciada ? (
          <div className="card" style={{
            borderLeft: "3px solid var(--warning)",
            background: "var(--tertiary-bg)"
          }}>
            <p style={{ fontWeight: "600", color: "var(--text-primary)", marginBottom: "0.5rem" }}>
              Carona iniciada!
            </p>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "1.25rem" }}>
              Pague o valor restante para desbloquear seu PIN e embarcar.
            </p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Valor a pagar</span>
              <span style={{ fontWeight: "700", fontSize: "1.25rem", color: "var(--warning)" }}>
                R$ {reservation.valor_pendente?.toFixed(2)}
              </span>
            </div>
            <button onClick={handlePagarEVerPin} disabled={paying} style={{ width: "100%" }}>
              {paying ? "Processando..." : `Pagar R$ ${reservation.valor_pendente?.toFixed(2)} e ver PIN`}
            </button>
          </div>

        ) : (
          <div className="card" style={{
            borderLeft: "3px solid var(--accent)",
            background: "var(--tertiary-bg)",
            textAlign: "center"
          }}>
            <p style={{ fontWeight: "600", color: "var(--text-primary)", marginBottom: "0.5rem" }}>
              Aguardando motorista
            </p>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
              Quando o motorista iniciar a carona, você poderá pagar e ver seu PIN aqui.
            </p>
          </div>
        )}

        <button
          onClick={() => navigate("/passageiro")}
          style={{
            marginTop: "1rem",
            width: "100%",
            background: "var(--secondary-bg)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
            boxShadow: "none"
          }}
        >
          Voltar
        </button>
      </div>
    </>
  );
}

export default ConfirmarPresenca;
