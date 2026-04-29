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

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="container">
      <h1>Bem-vindo, Motorista!</h1>
      <p>Email: {userData?.email}</p>

      {motoristData?.carro ? (
        <div className="card">
          <h2>Seu Carro</h2>
          <p>Modelo: {motoristData.carro.modelo}</p>
          <p>Placa: {motoristData.carro.placa}</p>
          <p>Consumo: {motoristData.carro.consumo_km_l} km/l</p>
        </div>
      ) : (
        <div className="card" style={{ background: '#fff3cd' }}>
          <h2>Cadastrar Carro</h2>
          <input type="text" id="modelo" placeholder="Modelo (ex: Honda Fit)" />
          <input type="text" id="placa" placeholder="Placa (ex: ABC-1234)" />
          <input type="number" id="consumo" placeholder="Consumo (km/l)" step="0.1" />
          <button onClick={async () => {
            const modelo = document.getElementById('modelo').value;
            const placa = document.getElementById('placa').value;
            const consumo = parseFloat(document.getElementById('consumo').value);
            if (modelo && placa && consumo) {
              await updateMotoristaData(currentUser.uid, { modelo, placa, consumo_km_l: consumo });
              window.location.reload();
            }
          }}>
            Salvar Carro
          </button>
        </div>
      )}

      <button onClick={() => navigate("/motorista/oferecer")}>
        Oferecer Carona
      </button>

      <button onClick={() => navigate("/motorista/minhas-caronas")}>
        Minhas Caronas
      </button>

      <button onClick={handleLogout} style={{ background: "#dc3545" }}>
        Sair
      </button>
    </div>
  );
}

export default MotoristaHome;
