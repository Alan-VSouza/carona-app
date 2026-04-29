import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getPassageiroReservations } from '../services/reservationService'
import { getRideById } from '../services/rideService'
import { Header, HeaderDark } from '../components/Header'

function ReservationDetailsModal({ reservation, isOpen, onClose, onConfirm }) {
  if (!isOpen || !reservation) return null;

  const dataHora = new Date(reservation.ride?.data_hora?.toDate?.()).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const getStatusBadge = (status) => {
    const badges = {
      'confirmada': { className: 'badge badge-primary', label: 'Confirmada' },
      'pendente': { className: 'badge badge-warning', label: 'Pendente' },
      'finalizada': { className: 'badge badge-success', label: 'Finalizada' },
      'cancelada': { className: 'badge badge-error', label: 'Cancelada' }
    }
    return badges[status] || { className: 'badge badge-primary', label: status }
  };

  const badge = getStatusBadge(reservation.status);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)',
      WebkitBackdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.3s ease-out',
      padding: '1rem'
    }}>
      <div style={{
        background: 'var(--secondary-bg)',
        width: '100%',
        maxWidth: '500px',
        borderRadius: '1.25rem',
        padding: 'clamp(1.25rem, 5vw, 2rem)',
        maxHeight: '90vh',
        overflowY: 'auto',
        animation: 'slideUp 0.3s ease-out',
        boxShadow: 'var(--shadow-xl)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.375rem' }}>Detalhes da Reserva</h2>
          <button
            onClick={onClose}
            style={{
              background: 'var(--tertiary-bg)',
              border: 'none',
              width: '40px',
              height: '40px',
              borderRadius: '0.625rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--border)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--tertiary-bg)';
            }}
          >
            ✕
          </button>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ margin: 0, fontSize: '1.125rem' }}>
            {reservation.ride?.origem?.split(',')[0]} → {reservation.ride?.destino?.split(',')[0]}
          </h3>
          <span className={badge.className}>
            {badge.label}
          </span>
        </div>

        <div style={{
          background: 'var(--tertiary-bg)',
          padding: '1.25rem',
          borderRadius: '0.875rem',
          marginBottom: '1.5rem'
        }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.5rem', fontWeight: '500' }}>
            DATA E HORA
          </p>
          <p style={{ fontWeight: '600', fontSize: '0.95rem' }}>
            {dataHora}
          </p>
        </div>

        <div style={{
          background: 'var(--tertiary-bg)',
          padding: '1.5rem',
          borderRadius: '0.875rem',
          marginBottom: '1.5rem'
        }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '1rem', fontWeight: '500' }}>
            RESUMO DE PAGAMENTO
          </p>
          <div style={{
            display: 'grid',
            gap: '0.75rem'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ color: 'var(--text-secondary)' }}>Pago agora (1/3):</span>
              <span style={{ fontWeight: '600', color: 'var(--success)' }}>
                R$ {reservation.valor_pago_inicial?.toFixed(2)}
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ color: 'var(--text-secondary)' }}>A pagar na carona (2/3):</span>
              <span style={{ fontWeight: '600', color: 'var(--warning)' }}>
                R$ {reservation.valor_pendente?.toFixed(2)}
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '0.75rem',
              borderTop: '1px solid var(--border)'
            }}>
              <span style={{ fontWeight: '600' }}>Total:</span>
              <span style={{ fontWeight: '700', fontSize: '1.125rem' }}>
                R$ {reservation.valor_final?.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '0.5rem' }}>
          {reservation.status === 'confirmada' && (
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              style={{
                width: '100%',
                background: 'var(--success)',
                padding: '1rem',
                fontSize: '0.95rem'
              }}
            >
              Confirmar Presença
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              width: '100%',
              background: 'var(--secondary-bg)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              padding: '1rem',
              fontSize: '0.95rem',
              boxShadow: 'none'
            }}
          >
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
}

function PassageiroMinhasReservas() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedReservation, setSelectedReservation] = useState(null)

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

  if (loading)
    return (
      <>
        <Header title="Minhas Reservas" onBack={() => navigate("/passageiro")} />
        <HeaderDark />
        <div className="container" style={{ paddingTop: "2rem" }}>
          <p>Carregando...</p>
        </div>
      </>
    );

  const getStatusColor = (status) => {
    const colors = {
      'confirmada': 'var(--accent)',
      'pendente': 'var(--warning)',
      'finalizada': 'var(--success)',
      'cancelada': 'var(--error)'
    }
    return colors[status] || 'var(--accent)'
  }

  return (
    <>
      <Header title="Minhas Reservas" onBack={() => navigate("/passageiro")} />
      <HeaderDark />

      <div className="container" style={{ paddingTop: "2rem" }}>
        {reservations.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "3rem 2rem",
            background: "var(--tertiary-bg)",
            borderRadius: "0.875rem",
            border: "1px dashed var(--border)"
          }}>
            <h3 style={{ marginBottom: "0.5rem" }}>Nenhuma reserva feita</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              Comece a reservar caronas
            </p>
            <button onClick={() => navigate("/passageiro/caronas")}>
              Buscar Caronas
            </button>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gap: "0.75rem"
          }}>
            {reservations.map(reservation => {
              const dataHora = new Date(reservation.ride?.data_hora?.toDate?.());
              const hora = dataHora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
              const data = dataHora.toLocaleDateString('pt-BR', { month: 'short', day: '2-digit' });

              return (
                <div
                  key={reservation.id}
                  onClick={() => setSelectedReservation(reservation)}
                  style={{
                    background: "var(--secondary-bg)",
                    border: `2px solid ${getStatusColor(reservation.status)}`,
                    borderRadius: "0.875rem",
                    padding: "1.25rem",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    alignItems: "center",
                    gap: "1rem"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--tertiary-bg)";
                    e.currentTarget.style.boxShadow = "var(--shadow-md)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--secondary-bg)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div>
                    <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1rem" }}>
                      {reservation.ride?.origem?.split(',')[0]} → {reservation.ride?.destino?.split(',')[0]}
                    </h3>
                    <div style={{
                      display: "flex",
                      gap: "1.5rem",
                      fontSize: "0.9rem",
                      color: "var(--text-secondary)"
                    }}>
                      <span>{hora}</span>
                      <span>{data}</span>
                      <span style={{
                        color: getStatusColor(reservation.status),
                        fontWeight: '600'
                      }}>
                        {reservation.status}
                      </span>
                    </div>
                  </div>
                  <div style={{
                    textAlign: "right"
                  }}>
                    <p style={{ margin: "0 0 0.5rem 0", fontWeight: "700", fontSize: "1.125rem" }}>
                      R$ {reservation.valor_final?.toFixed(2)}
                    </p>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                      {reservation.valor_pago_inicial?.toFixed(2)} pago
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <button
          onClick={() => navigate('/passageiro')}
          style={{
            marginTop: "2rem",
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

      <ReservationDetailsModal
        reservation={selectedReservation}
        isOpen={!!selectedReservation}
        onClose={() => setSelectedReservation(null)}
        onConfirm={() => navigate(`/passageiro/confirmacao/${selectedReservation.id}`)}
      />
    </>
  )
}

export default PassageiroMinhasReservas
