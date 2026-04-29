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

  const menuItems = [
    {
      title: "Buscar Caronas",
      description: "Encontre caronas disponíveis para seu trajeto",
      action: () => navigate("/passageiro/caronas"),
    },
    {
      title: "Minhas Reservas",
      description: "Acompanhe suas reservas ativas e histórico",
      action: () => navigate("/passageiro/minhas-reservas"),
    },
    {
      title: "Locais Favoritos",
      description: "Acesso rápido aos seus locais salvos",
      action: () => navigate("/passageiro/favoritos"),
    }
  ];

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

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: "1.5rem",
        marginBottom: "3rem"
      }}>
        {menuItems.map((item, index) => (
          <div
            key={index}
            onClick={item.action}
            className="card"
            style={{
              cursor: "pointer",
              padding: "2rem 1.5rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: "160px"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
              e.currentTarget.style.boxShadow = "var(--shadow-lg)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.boxShadow = "var(--shadow-md)";
            }}
          >
            <div>
              <h3 style={{ marginBottom: "0.5rem", fontSize: "1.125rem" }}>
                {item.title}
              </h3>
              <p style={{ fontSize: "0.9rem" }}>
                {item.description}
              </p>
            </div>
            <div style={{
              marginTop: "1rem",
              fontSize: "1.25rem",
              color: "var(--accent)",
              fontWeight: "600"
            }}>
              →
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleLogout}
        style={{
          width: "100%",
          background: "var(--secondary-bg)",
          color: "var(--text-primary)",
          border: "1px solid var(--border)",
          boxShadow: "none"
        }}
      >
        Sair
      </button>
    </div>
  );
}

export default PassageiroHome;
