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

  return (
    <div className="container">
      <h1>Minhas Caronas</h1>

      {rides.length === 0 ? (
        <p>Nenhuma carona cadastrada</p>
      ) : (
        rides.map(ride => (
          <div key={ride.id} className="card">
            <h3>{ride.origem} → {ride.destino}</h3>
            <p><strong>Status:</strong> {ride.status}</p>
            <p><strong>Valor:</strong> R$ {ride.valor_total.toFixed(2)}</p>
            <p><strong>Lugares:</strong> {ride.lugares_disponiveis - ride.lugares_ocupados} disponíveis</p>
          </div>
        ))
      )}

      <button onClick={() => navigate('/motorista')} style={{ background: '#6c757d', marginTop: '10px' }}>
        Voltar
      </button>
    </div>
  )
}

export default MinhasCaronas
