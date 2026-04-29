import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signUp, signIn } from "../services/authService";
import { useAuth } from "../hooks/useAuth";

function Login() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("passageiro");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (currentUser) {
    navigate(tipo === "motorista" ? "/motorista" : "/passageiro");
  }

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signUp(email, password, nome, tipo);
      navigate(tipo === "motorista" ? "/motorista" : "/passageiro");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
      navigate(tipo === "motorista" ? "/motorista" : "/passageiro");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: "400px", marginTop: "50px" }}>
      <h1>{isSignUp ? "Cadastro" : "Login"}</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={isSignUp ? handleSignUp : handleSignIn}>
        {isSignUp && (
          <input
            type="text"
            placeholder="Nome completo"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {isSignUp && (
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="passageiro">Passageiro</option>
            <option value="motorista">Motorista</option>
          </select>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Processando..." : isSignUp ? "Cadastrar" : "Entrar"}
        </button>
      </form>

      <p style={{ marginTop: "20px", textAlign: "center" }}>
        {isSignUp ? "Já tem conta?" : "Não tem conta?"}
        <button
          type="button"
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError("");
          }}
          style={{
            background: "none",
            color: "#007bff",
            cursor: "pointer",
            padding: 0,
          }}
        >
          {isSignUp ? " Entrar" : " Cadastrar"}
        </button>
      </p>
    </div>
  );
}

export default Login;