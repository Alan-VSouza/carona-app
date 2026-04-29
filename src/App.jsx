import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import MotoristaHome from "./pages/MotoristaHome";
import PassageiroHome from "./pages/PassageiroHome";
import OfertarCarona from "./pages/OfertarCarona";
import MinhasCaronas from "./pages/MinhasCaronas";
import VisualizarCaronas from "./pages/VisualizarCaronas";
import PassageiroMinhasReservas from "./pages/PassageiroMinhasReservas";
import ReservaDetalhes from "./pages/ReservaDetalhes";
import ConfirmarPresenca from "./pages/ConfirmarPresenca";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/motorista"
            element={
              <ProtectedRoute userType="motorista">
                <MotoristaHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/motorista/oferecer"
            element={
              <ProtectedRoute userType="motorista">
                <OfertarCarona />
              </ProtectedRoute>
            }
          />
          <Route
            path="/motorista/minhas-caronas"
            element={
              <ProtectedRoute userType="motorista">
                <MinhasCaronas />
              </ProtectedRoute>
            }
          />
          <Route
            path="/passageiro"
            element={
              <ProtectedRoute userType="passageiro">
                <PassageiroHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/passageiro/caronas"
            element={
              <ProtectedRoute userType="passageiro">
                <VisualizarCaronas />
              </ProtectedRoute>
            }
          />
          <Route
            path="/passageiro/minhas-reservas"
            element={
              <ProtectedRoute userType="passageiro">
                <PassageiroMinhasReservas />
              </ProtectedRoute>
            }
          />
          <Route
            path="/passageiro/reserva/:rideId"
            element={
              <ProtectedRoute userType="passageiro">
                <ReservaDetalhes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/passageiro/confirmacao/:reservationId"
            element={
              <ProtectedRoute userType="passageiro">
                <ConfirmarPresenca />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
