import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getReservationById, unblockPIN } from "../services/reservationService";
import { getRideById } from "../services/rideService";

function ConfirmarPresenca() {
  const { reservationId } = useParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(null);
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pinBlocked, setPinBlocked] = useState(true);
  const [pin, setPin] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resData = await getReservationById(reservationId);
        setReservation(resData);
        setPinBlocked(resData.pin_bloqueado);

        const rideData = await getRideById(resData.ride_id);
        setRide(rideData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchData();
  }, [reservationId]);

  const handlePaymentAndUnblock = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const newPin = Math.floor(1000 + Math.random() * 9000).toString();
      await unblockPIN(reservationId, newPin);
      setPin(newPin);
      setPinBlocked(false);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="container">
        <p>Carregando...</p>
      </div>
    );
  if (!reservation)
    return (
      <div className="container">
        <p>Reserva não encontrada</p>
      </div>
    );

  return (
    <div className="container" style={{ maxWidth: "600px" }}>
      <h1>Confirmar Presença</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="card">
        <h2>
          Carona: {ride?.origem} → {ride?.destino}
        </h2>
        <p>
          <strong>Status:</strong> {reservation.status}
        </p>
        <p>
          <strong>Você deve pagar (2/3 restante):</strong> R${" "}
          {reservation.valor_pendente.toFixed(2)}
        </p>
      </div>

      {pinBlocked ? (
        <form onSubmit={handlePaymentAndUnblock}>
          <div
            className="card"
            style={{ background: "#fff3cd", borderLeft: "4px solid #ff9800" }}
          >
            <p>🔒 PIN bloqueado - Você precisa pagar para desbloqueá-lo</p>
            <p>
              <strong>Valor a pagar:</strong> R${" "}
              {reservation.valor_pendente.toFixed(2)}
            </p>
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Processando..." : "Pagar e Desbloquear PIN"}
          </button>
        </form>
      ) : (
        <div
          className="card"
          style={{ background: "#d4edda", borderLeft: "4px solid #28a745" }}
        >
          <p>✓ PIN desbloqueado!</p>
          <h3
            style={{
              fontSize: "36px",
              textAlign: "center",
              color: "#28a745",
              marginTop: "20px",
            }}
          >
            {pin}
          </h3>
          <p style={{ textAlign: "center", marginTop: "10px" }}>
            Compartilhe este PIN com o motorista
          </p>
        </div>
      )}

      <button
        onClick={() => navigate("/passageiro")}
        style={{ background: "#6c757d", marginTop: "10px" }}
      >
        Voltar
      </button>
    </div>
  );
}

export default ConfirmarPresenca;