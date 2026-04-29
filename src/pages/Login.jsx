import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signUp, signIn } from "../services/authService";
import { useAuth } from "../hooks/useAuth";

function Login() {
  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("passageiro");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser && userData) {
      navigate(userData.tipo === "motorista" ? "/motorista" : "/passageiro");
    }
  }, [currentUser, userData, navigate]);

  const getFirebaseError = (err) => {
    const code = err.code || "";
    const messages = {
      "auth/invalid-login-credentials": "E-mail ou senha incorretos.",
      "auth/user-not-found":            "Nenhuma conta encontrada com este e-mail.",
      "auth/wrong-password":            "Senha incorreta.",
      "auth/email-already-in-use":      "Este e-mail já está cadastrado.",
      "auth/invalid-email":             "E-mail inválido.",
      "auth/weak-password":             "A senha deve ter pelo menos 6 caracteres.",
      "auth/too-many-requests":         "Muitas tentativas. Tente novamente em alguns minutos.",
      "auth/network-request-failed":    "Sem conexão. Verifique sua internet.",
      "auth/user-disabled":             "Esta conta foi desativada.",
    };
    return messages[code] || "Ocorreu um erro. Tente novamente.";
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signUp(email, password, nome, tipo);
      navigate(tipo === "motorista" ? "/motorista" : "/passageiro");
    } catch (err) {
      setError(getFirebaseError(err));
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
      setError(getFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem",
      background: "var(--bg)"
    }}>
      <div style={{
        background: "var(--secondary-bg)",
        padding: "clamp(1.5rem, 5vw, 3rem) clamp(1rem, 4vw, 2rem)",
        borderRadius: "0.875rem",
        border: "1px solid var(--border)",
        maxWidth: "420px",
        width: "100%",
        animation: "fadeInUp 0.5s ease-out"
      }}>
        <div style={{ marginBottom: "2.5rem", textAlign: "center" }}>
          <h1 style={{
            fontSize: "1.75rem",
            marginBottom: "0.5rem"
          }}>
            {isSignUp ? "Criar Conta" : "Acessar"}
          </h1>
          <p style={{
            color: "var(--text-secondary)",
            fontSize: "0.95rem"
          }}>
            {isSignUp ? "Comece a compartilhar caronas" : "Bem-vindo de volta"}
          </p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={isSignUp ? handleSignUp : handleSignIn}>
          {isSignUp && (
            <>
              <label>Nome completo</label>
              <input
                type="text"
                placeholder="Seu nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </>
          )}

          <label>Email</label>
          <input
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Senha</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {isSignUp && (
            <>
              <label>Tipo de Conta</label>
              <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
                <option value="passageiro">Passageiro</option>
                <option value="motorista">Motorista</option>
              </select>
            </>
          )}

          <button type="submit" disabled={loading} style={{ marginTop: "1.5rem", width: "100%" }}>
            {loading ? "Processando..." : isSignUp ? "Criar Conta" : "Acessar"}
          </button>
        </form>

        <div style={{
          marginTop: "2rem",
          textAlign: "center",
          borderTop: "1px solid var(--border)",
          paddingTop: "2rem"
        }}>
          <p style={{
            color: "var(--text-secondary)",
            marginBottom: "1rem",
            fontSize: "0.95rem"
          }}>
            {isSignUp ? "Já tem conta?" : "Não tem conta?"}
          </p>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
            }}
            style={{
              width: "100%",
              background: "var(--secondary-bg)",
              color: "var(--accent)",
              border: "1px solid var(--accent)",
              boxShadow: "none"
            }}
          >
            {isSignUp ? "Acessar conta existente" : "Criar nova conta"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
