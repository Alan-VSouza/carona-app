import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getPassageiroReservations } from '../services/reservationService'
import { getRideById } from '../services/rideService'

function PassageiroMinhasReservas() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReservations = async () => {
      if (currentUser) {
        const data = await getPassageiroReservations(currentUser.uid)

        const reservationsComDetalhes = await Promise.all(
          data.map(async (reservation) => {
            const ride = await getRideById(reservation.ride_id)
            return { ...reservation, ride }
          })
        )

        setReservations(reservationsComDetalhes)
        setLoading(false)
      }
    }
    fetchReservations()
  }, [currentUser])

  if (loading) return <div className="container"><p>Carregando...</p></div>

  return (
    <div className="container">
      <h1>Minhas Reservas</h1>

      {reservations.length === 0 ? (
        <p>Nenhuma reserva feita</p>
      ) : (
        reservations.map(reservation => (
          <div key={reservation.id} className="card">
            <h3>{reservation.ride?.origem} → {reservation.ride?.destino}</h3>
            <p><strong>Status:</strong> {reservation.status}</p>
            <p><strong>Valor Total:</strong> R$ {reservation.valor_final?.toFixed(2)}</p>
            <p><strong>Pago Inicial (1/3):</strong> R$ {reservation.valor_pago_inicial?.toFixed(2)}</p>
            <p><strong>Pendente (2/3):</strong> R$ {reservation.valor_pendente?.toFixed(2)}</p>

            {reservation.status === 'confirmada' && (
              <button onClick={() => navigate(`/passageiro/confirmacao/${reservation.id}`)}>
                Confirmar Presença
              </button>
            )}
          </div>
        ))
      )}

      <button onClick={() => navigate('/passageiro')} style={{ background: '#6c757d', marginTop: '10px' }}>
        Voltar
      </button>
    </div>
  )
}

export default PassageiroMinhasReservas
