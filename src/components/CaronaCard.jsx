import { useNavigate } from "react-router-dom";

function CaronaCard({ ride }) {
  const navigate = useNavigate();
  const dataHora = new Date(ride.data_hora.seconds * 1000).toLocaleString(
    "pt-BR",
  );

  return (
    <div className="card">
      <h3>
        {ride.origem} → {ride.destino}
      </h3>
      <p>
        <strong>Motorista:</strong> {ride.motorista_id}
      </p>
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
        <strong>Valor:</strong> R$ {ride.valor_total.toFixed(2)}
      </p>
      <p>
        <strong>Lugares disponíveis:</strong>{" "}
        {ride.lugares_disponiveis - ride.lugares_ocupados}
      </p>

      <button onClick={() => navigate(`/passageiro/reserva/${ride.id}`)}>
        Reservar Carona
      </button>
    </div>
  );
}

export default CaronaCard;