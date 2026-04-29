import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getRideById } from "../services/rideService";
import { createReservation, generatePIN } from "../services/reservationService";
import { calculateTariff } from "../services/tariffService";

function ReservaDetalhes() {
  const { rideId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [ride, setRide] = useState(null);
  const [tariff, setTariff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentStep, setPaymentStep] = useState(1);

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
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchRide();
  }, [rideId]);

  const handlePaymentStep1 = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const reservationId = await createReservation(
        currentUser.uid,
        rideId,
        tariff,
      );
      alert(
        `Reserva confirmada! ID: ${reservationId}. Valor pago: R$ ${tariff.initialPayment.toFixed(2)}`,
      );
      setPaymentStep(2);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handlePaymentStep2 = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const pin = generatePIN();
      alert(`Pagamento de R$ ${tariff.remainingPayment.toFixed(2)} confirmado!\n\nSeu PIN: ${pin}\n\nCompartilhe com o
   motorista.`);
      navigate("/passageiro");
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
  if (!ride)
    return (
      <div className="container">
        <p>Carona não encontrada</p>
      </div>
    );

  const dataHora = new Date(ride.data_hora.seconds * 1000).toLocaleString(
    "pt-BR",
  );

  return (
    <div className="container" style={{ maxWidth: "600px" }}>
      <h1>Detalhes da Reserva</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="card">
        <h2>
          {ride.origem} → {ride.destino}
        </h2>
        <p>
          <strong>Data/Hora:</strong> {dataHora}
        </p>
        <p>
          <strong>Carro:</strong> {ride.carro.modelo} ({ride.carro.placa})
        </p>
        <p>
          <strong>Distância:</strong> {ride.km_estimado} km
        </p>
        <p>
          <strong>Combustível:</strong>{" "}
          {ride.combustivel.charAt(0).toUpperCase() + ride.combustivel.slice(1)}
        </p>
      </div>

      <div className="card" style={{ background: "#f0f8ff" }}>
        <h3>Valores</h3>
        {tariff && (
          <>
            <p>
              <strong>Valor Total:</strong> R$ {tariff.totalValue.toFixed(2)}
            </p>
            <p>
              <strong>Você paga agora (1/3):</strong> R${" "}
              {tariff.initialPayment.toFixed(2)}
            </p>
            <p>
              <strong>Você paga depois (2/3):</strong> R${" "}
              {tariff.remainingPayment.toFixed(2)}
            </p>
          </>
        )}
      </div>

      {paymentStep === 1 && (
        <form onSubmit={handlePaymentStep1}>
          <button type="submit" disabled={loading}>
            {loading
              ? "Processando..."
              : `Pagar 1/3 - R$ ${tariff?.initialPayment.toFixed(2)}`}
          </button>
        </form>
      )}

      {paymentStep === 2 && (
        <div>
          <p style={{ color: "green", marginBottom: "20px" }}>
            ✓ Pagamento 1/3 confirmado!
          </p>
          <p style={{ marginBottom: "20px" }}>
            Você pagará R$ {tariff?.remainingPayment.toFixed(2)} no dia da
            carona após confirmar presença com o PIN.
          </p>
          <form onSubmit={handlePaymentStep2}>
            <button type="submit" disabled={loading}>
              {loading ? "Processando..." : "Continuar"}
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => navigate("/passageiro/caronas")}
        style={{ background: "#6c757d", marginTop: "10px" }}
      >
        Cancelar
      </button>
    </div>
  );
}

export default ReservaDetalhes;