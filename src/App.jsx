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
            path="/passageiro"
            element={
              <ProtectedRoute userType="passageiro">
                <PassageiroHome />
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
