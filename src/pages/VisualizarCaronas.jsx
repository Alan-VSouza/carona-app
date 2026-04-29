import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getOpenRides } from "../services/rideService";
import CaronaCard from "../components/CaronaCard";

function VisualizarCaronas() {
  const navigate = useNavigate();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtros, setFiltros] = useState({
    origem: "",
    destino: "",
  });

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const allRides = await getOpenRides();
        setRides(allRides);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchRides();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
  };

  const filteredRides = rides.filter((ride) => {
    const origemMatch = ride.origem
      .toLowerCase()
      .includes(filtros.origem.toLowerCase());
    const destinoMatch = ride.destino
      .toLowerCase()
      .includes(filtros.destino.toLowerCase());
    return origemMatch && destinoMatch;
  });

  if (loading)
    return (
      <div className="container">
        <p>Carregando caronas...</p>
      </div>
    );
  if (error)
    return (
      <div className="container">
        <p>Erro: {error}</p>
      </div>
    );

  return (
    <div className="container">
      <h1>Caronas Disponíveis</h1>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          name="origem"
          placeholder="Filtrar por origem"
          value={filtros.origem}
          onChange={handleFilterChange}
        />
        <input
          type="text"
          name="destino"
          placeholder="Filtrar por destino"
          value={filtros.destino}
          onChange={handleFilterChange}
        />
      </div>

      {filteredRides.length === 0 ? (
        <p>Nenhuma carona disponível no momento</p>
      ) : (
        filteredRides.map((ride) => <CaronaCard key={ride.id} ride={ride} />)
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

export default VisualizarCaronas;