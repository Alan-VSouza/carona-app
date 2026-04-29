import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getMotoristaRides } from '../services/rideService'

function MinhasCaronas() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [rides, setRides] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRides = async () => {
      if (currentUser) {
        const data = await getMotoristaRides(currentUser.uid)
        setRides(data)
        setLoading(false)
      }
    }
    fetchRides()
  }, [currentUser])

  if (loading) return <div className="container"><p>Carregando...</p></div>

  const getStatusBadge = (status) => {
    const badges = {
      'aberta': { className: 'badge badge-primary', label: 'Aberta' },
      'confirmada': { className: 'badge badge-success', label: 'Confirmada' },
      'cancelada': { className: 'badge badge-error', label: 'Cancelada' },
      'finalizada': { className: 'badge badge-success', label: 'Finalizada' }
    }
    return badges[status] || { className: 'badge badge-primary', label: status }
  }

  return (
    <div className="container">
      <div style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ marginBottom: "0.5rem" }}>Minhas Caronas</h1>
        <p style={{ color: "var(--text-secondary)" }}>Gerencie todas as suas ofertas</p>
      </div>

      {rides.length === 0 ? (
        <div className="card" style={{
          textAlign: "center",
          padding: "3rem 2rem",
          background: "var(--tertiary-bg)",
          border: "1px dashed var(--border)"
        }}>
          <h3 style={{ marginBottom: "0.75rem" }}>Nenhuma carona cadastrada</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
            Comece a oferecer caronas para ganhar
          </p>
          <button onClick={() => navigate("/motorista/oferecer")}>
            Oferecer Carona
          </button>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gap: "1rem"
        }}>
          {rides.map(ride => {
            const badge = getStatusBadge(ride.status)
            return (
              <div
                key={ride.id}
                className="card"
                style={{
                  marginBottom: 0,
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  alignItems: "start",
                  marginBottom: "1rem",
                  paddingBottom: "1rem",
                  borderBottom: "1px solid var(--border)"
                }}>
                  <div>
                    <h3 style={{ marginBottom: "0.25rem", fontSize: "1.125rem" }}>
                      {ride.origem?.split(',')[0]} → {ride.destino?.split(',')[0]}
                    </h3>
                    <p style={{ fontSize: "0.9rem" }}>
                      {new Date(ride.data_hora?.toDate?.()).toLocaleDateString('pt-BR')} às{' '}
                      {new Date(ride.data_hora?.toDate?.()).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className={badge.className}>
                    {badge.label}
                  </span>
                </div>

                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                  gap: "clamp(1rem, 3vw, 1.5rem)"
                }}>
                  <div>
                    <p style={{ color: "var(--text-secondary)", marginBottom: "0.5rem", fontSize: "0.85rem", fontWeight: "500" }}>
                      VALOR TOTAL
                    </p>
                    <p style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--success)" }}>
                      R$ {ride.valor_total?.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: "var(--text-secondary)", marginBottom: "0.5rem", fontSize: "0.85rem", fontWeight: "500" }}>
                      LUGARES
                    </p>
                    <p style={{ fontSize: "1.125rem", fontWeight: "600" }}>
                      {ride.lugares_disponiveis - ride.lugares_ocupados}/{ride.lugares_disponiveis}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: "var(--text-secondary)", marginBottom: "0.5rem", fontSize: "0.85rem", fontWeight: "500" }}>
                      DISTÂNCIA
                    </p>
                    <p style={{ fontSize: "1.125rem", fontWeight: "600" }}>
                      {ride.km_estimado} km
                    </p>
                  </div>
                </div>

                {ride.status === 'aberta' && (
                  <button
                    onClick={() => navigate(`/motorista/iniciar/${ride.id}`)}
                    style={{
                      width: '100%',
                      marginTop: '1rem',
                      background: 'var(--success)',
                      padding: '0.875rem'
                    }}
                  >
                    Iniciar Carona
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      <button
        onClick={() => navigate('/motorista')}
        style={{
          marginTop: "2.5rem",
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
  )
}

export default MinhasCaronas
