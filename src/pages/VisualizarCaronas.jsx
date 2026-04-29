import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getOpenRides } from "../services/rideService";
import { Header, HeaderDark } from "../components/Header";
import { RideDetailsModal } from "../components/RideDetailsModal";

function VisualizarCaronas() {
  const navigate = useNavigate();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtros, setFiltros] = useState({
    origem: "",
    destino: "",
  });
  const [selectedRide, setSelectedRide] = useState(null);

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
      <>
        <Header title="Buscar Caronas" onBack={() => navigate("/passageiro")} />
        <HeaderDark />
        <div className="container" style={{ paddingTop: "2rem" }}>
          <p>Carregando caronas...</p>
        </div>
      </>
    );

  if (error)
    return (
      <>
        <Header title="Buscar Caronas" onBack={() => navigate("/passageiro")} />
        <HeaderDark />
        <div className="container" style={{ paddingTop: "2rem" }}>
          <div className="error-message">Erro: {error}</div>
        </div>
      </>
    );

  return (
    <>
      <Header title="Buscar Caronas" onBack={() => navigate("/passageiro")} />
      <HeaderDark />

      <div className="container" style={{ paddingTop: "2rem" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "0.75rem",
          marginBottom: "1.5rem"
        }}>
          <input
            type="text"
            name="origem"
            placeholder="De onde?"
            value={filtros.origem}
            onChange={handleFilterChange}
          />
          <input
            type="text"
            name="destino"
            placeholder="Para onde?"
            value={filtros.destino}
            onChange={handleFilterChange}
          />
        </div>

        {filteredRides.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "3rem 2rem",
            background: "var(--tertiary-bg)",
            borderRadius: "0.875rem",
            border: "1px dashed var(--border)"
          }}>
            <h3 style={{ marginBottom: "0.5rem" }}>Nenhuma carona disponível</h3>
            <p style={{ color: "var(--text-secondary)" }}>
              Tente alterar seus filtros
            </p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gap: "0.75rem"
          }}>
            {filteredRides.map((ride) => {
              const dataHora = new Date(ride.data_hora?.toDate?.());
              const hora = dataHora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
              const data = dataHora.toLocaleDateString('pt-BR', { month: 'short', day: '2-digit' });

              return (
                <div
                  key={ride.id}
                  onClick={() => setSelectedRide(ride)}
                  style={{
                    background: "var(--secondary-bg)",
                    border: "1px solid var(--border)",
                    borderRadius: "0.875rem",
                    padding: "1.25rem",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    alignItems: "center",
                    gap: "1rem"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--tertiary-bg)";
                    e.currentTarget.style.borderColor = "var(--accent)";
                    e.currentTarget.style.boxShadow = "var(--shadow-md)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--secondary-bg)";
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div>
                    <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1rem" }}>
                      {ride.origem?.split(',')[0]} → {ride.destino?.split(',')[0]}
                    </h3>
                    <div style={{
                      display: "flex",
                      gap: "1.5rem",
                      fontSize: "0.9rem",
                      color: "var(--text-secondary)"
                    }}>
                      <span>{hora}</span>
                      <span>{data}</span>
                      <span>{ride.km_estimado} km</span>
                    </div>
                  </div>
                  <div style={{
                    textAlign: "right"
                  }}>
                    <p style={{ margin: "0 0 0.5rem 0", fontWeight: "700", fontSize: "1.125rem", color: "var(--success)" }}>
                      R$ {ride.valor_total?.toFixed(2)}
                    </p>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                      {ride.lugares_disponiveis - ride.lugares_ocupados} lugares
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <button
          onClick={() => navigate("/passageiro")}
          style={{
            marginTop: "2rem",
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

      <RideDetailsModal
        ride={selectedRide}
        isOpen={!!selectedRide}
        onClose={() => setSelectedRide(null)}
      />
    </>
  );
}

export default VisualizarCaronas;
