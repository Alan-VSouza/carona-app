import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { logOut } from "../services/authService";
import { getMotoristaData, updateMotoristaData } from "../services/userService";

function MotoristaHome() {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const [motoristData, setMotoristaData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (currentUser) {
        const data = await getMotoristaData(currentUser.uid);
        setMotoristaData(data);
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUser]);

  const handleLogout = async () => {
    await logOut();
    navigate("/login");
  };

  if (loading) return <div className="container"><p>Carregando...</p></div>;

  return (
    <div className="container">
      <div style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ marginBottom: "0.5rem" }}>
          Bem-vindo, {userData?.nome?.split(' ')[0]}
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          {userData?.email}
        </p>
      </div>

      {motoristData?.carro ? (
        <div className="card" style={{
          marginBottom: "2.5rem",
          borderLeft: "3px solid var(--accent)"
        }}>
          <h2 style={{ marginBottom: "1.5rem", fontSize: "1.375rem" }}>Seu Veículo</h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "2rem"
          }}>
            <div>
              <p style={{ color: "var(--text-secondary)", marginBottom: "0.5rem", fontSize: "0.85rem", fontWeight: "500" }}>
                MODELO
              </p>
              <p style={{ fontSize: "1.125rem", fontWeight: "600" }}>
                {motoristData.carro.modelo}
              </p>
            </div>
            <div>
              <p style={{ color: "var(--text-secondary)", marginBottom: "0.5rem", fontSize: "0.85rem", fontWeight: "500" }}>
                PLACA
              </p>
              <p style={{ fontSize: "1.125rem", fontWeight: "600", fontFamily: "'Inconsolata', monospace" }}>
                {motoristData.carro.placa}
              </p>
            </div>
            <div>
              <p style={{ color: "var(--text-secondary)", marginBottom: "0.5rem", fontSize: "0.85rem", fontWeight: "500" }}>
                CONSUMO
              </p>
              <p style={{ fontSize: "1.125rem", fontWeight: "600" }}>
                {motoristData.carro.consumo_km_l} km/l
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{
          marginBottom: "2.5rem",
          borderLeft: "3px solid var(--warning)"
        }}>
          <h2 style={{ marginBottom: "1.5rem", fontSize: "1.375rem" }}>Adicionar Veículo</h2>
          <div style={{ display: "grid", gap: "1rem" }}>
            <div>
              <label>Modelo</label>
              <input type="text" id="modelo" placeholder="Ex: Honda Fit 2020" />
            </div>
            <div>
              <label>Placa</label>
              <input type="text" id="placa" placeholder="Ex: ABC-1234" />
            </div>
            <div>
              <label>Consumo (km/l)</label>
              <input type="number" id="consumo" placeholder="Ex: 15.5" step="0.1" />
            </div>
            <button onClick={async () => {
              const modelo = document.getElementById('modelo').value;
              const placa = document.getElementById('placa').value;
              const consumo = parseFloat(document.getElementById('consumo').value);
              if (modelo && placa && consumo) {
                await updateMotoristaData(currentUser.uid, { modelo, placa, consumo_km_l: consumo });
                window.location.reload();
              }
            }} style={{ marginTop: "0.5rem" }}>
              Salvar Veículo
            </button>
          </div>
        </div>
      )}

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "1rem",
        marginBottom: "2.5rem"
      }}>
        <button onClick={() => navigate("/motorista/oferecer")} style={{
          padding: "1.5rem 1.25rem",
          height: "auto",
          textAlign: "left",
          background: "var(--accent)"
        }}>
          <div style={{ fontWeight: "700", fontSize: "1rem", marginBottom: "0.5rem" }}>
            Oferecer Carona
          </div>
          <div style={{ fontSize: "0.85rem", opacity: 0.9 }}>
            Compartilhe sua jornada
          </div>
        </button>

        <button onClick={() => navigate("/motorista/minhas-caronas")} style={{
          padding: "1.5rem 1.25rem",
          height: "auto",
          textAlign: "left",
          background: "var(--success)"
        }}>
          <div style={{ fontWeight: "700", fontSize: "1rem", marginBottom: "0.5rem" }}>
            Minhas Caronas
          </div>
          <div style={{ fontSize: "0.85rem", opacity: 0.9 }}>
            Gerencie suas ofertas
          </div>
        </button>

        <button onClick={handleLogout} style={{
          padding: "1.5rem 1.25rem",
          height: "auto",
          textAlign: "left",
          background: "var(--error)"
        }}>
          <div style={{ fontWeight: "700", fontSize: "1rem", marginBottom: "0.5rem" }}>
            Sair
          </div>
          <div style={{ fontSize: "0.85rem", opacity: 0.9 }}>
            Desconecte-se
          </div>
        </button>
      </div>
    </div>
  );
}

export default MotoristaHome;
