import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { logOut } from "../services/authService";

function PassageiroHome() {
  const { userData } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logOut();
    navigate("/login");
  };

  return (
    <div className="container">
      <h1>Bem-vindo, Passageiro!</h1>
      <p>Email: {userData?.email}</p>

      <button onClick={() => navigate("/passageiro/caronas")}>
        Buscar Caronas
      </button>

      <button onClick={() => navigate("/passageiro/minhas-reservas")}>
        Minhas Reservas
      </button>

      <button onClick={() => navigate("/passageiro/favoritos")}>
        Locais Favoritos
      </button>

      <button onClick={handleLogout} style={{ background: "#dc3545" }}>
        Sair
      </button>
    </div>
  );
}

export default PassageiroHome;