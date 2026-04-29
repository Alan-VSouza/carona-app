import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getRideById } from '../services/rideService'
import { getRideReservations, updateReservationCode } from '../services/reservationService'
import { Header, HeaderDark } from '../components/Header'

const generateRandomCode = () => Math.floor(1000 + Math.random() * 9000).toString()

function DetalhesCaronaMotorista() {
  const navigate = useNavigate()
  const { rideId } = useParams()
  const [ride, setRide] = useState(null)
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedReservation, setExpandedReservation] = useState(null)
  const [generatedCode, setGeneratedCode] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rideData = await getRideById(rideId)
        setRide(rideData)

        const reservationsData = await getRideReservations(rideId)
        setReservations(reservationsData)

        setLoading(false)
      } catch (error) {
        console.error('Erro ao buscar dados:', error)
        setLoading(false)
      }
    }

    fetchData()
  }, [rideId])

  const generateCode = () => {
    const newCode = Math.floor(1000 + Math.random() * 9000).toString()
    setGeneratedCode(newCode)
  }

  const handleAssignCode = async (reservationId) => {
    if (!generatedCode) {
      alert('Gere um código primeiro')
      return
    }

    try {
      await updateReservationCode(reservationId, generatedCode)
      alert('Código atribuído ao passageiro!')
      setGeneratedCode(null)
      // Recarregar as reservas
      const reservationsData = await getRideReservations(rideId)
      setReservations(reservationsData)
    } catch (error) {
      console.error('Erro ao atribuir código:', error)
      alert('Erro ao atribuir código')
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert('Código copiado para a área de transferência!')
  }

  if (loading) {
    return (
      <>
        <Header title="Detalhes da Carona" onBack={() => navigate("/motorista/minhas-caronas")} />
        <HeaderDark />
        <div className="container" style={{ paddingTop: "2rem" }}>
          <p>Carregando...</p>
        </div>
      </>
    )
  }

  if (!ride) {
    return (
      <>
        <Header title="Detalhes da Carona" onBack={() => navigate("/motorista/minhas-caronas")} />
        <HeaderDark />
        <div className="container" style={{ paddingTop: "2rem" }}>
          <p style={{ color: 'var(--error)' }}>Carona não encontrada</p>
        </div>
      </>
    )
  }

  const dataHora = new Date(ride.data_hora?.toDate?.())
  const totalPassageiros = reservations.length
  const totalPago = reservations.filter(r => r.data_pagamento_inicial).length
  const pendentes = totalPassageiros - totalPago

  return (
    <>
      <Header title="Detalhes da Carona" onBack={() => navigate("/motorista/minhas-caronas")} />
      <HeaderDark />

      <div className="container" style={{ paddingTop: "2rem" }}>
        {/* Resumo da Carona */}
        <div className="card" style={{ borderLeft: '3px solid var(--accent)', marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem', fontSize: 'clamp(1.125rem, 4vw, 1.375rem)' }}>
            {ride.origem?.split(',')[0]} → {ride.destino?.split(',')[0]}
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 'clamp(1rem, 3vw, 1.5rem)',
            marginBottom: '1.5rem'
          }}>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.5rem', fontWeight: '500' }}>
                DATA E HORA
              </p>
              <p style={{ fontWeight: '600' }}>
                {dataHora.toLocaleDateString('pt-BR')}
              </p>
              <p style={{ fontWeight: '600' }}>
                {dataHora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.5rem', fontWeight: '500' }}>
                DISTÂNCIA
              </p>
              <p style={{ fontWeight: '600' }}>
                {ride.km_estimado} km
              </p>
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.5rem', fontWeight: '500' }}>
                PREÇO
              </p>
              <p style={{ fontWeight: '700', color: 'var(--success)' }}>
                R$ {ride.valor_total?.toFixed(2)}
              </p>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            background: 'var(--tertiary-bg)',
            padding: '1rem',
            borderRadius: '0.75rem',
            textAlign: 'center'
          }}>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.5rem', fontWeight: '500' }}>
                PASSAGEIROS
              </p>
              <p style={{ fontWeight: '700', fontSize: '1.25rem' }}>
                {totalPassageiros}
              </p>
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.5rem', fontWeight: '500' }}>
                PAGOS
              </p>
              <p style={{ fontWeight: '700', fontSize: '1.25rem', color: 'var(--success)' }}>
                {totalPago}
              </p>
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.5rem', fontWeight: '500' }}>
                PENDENTES
              </p>
              <p style={{ fontWeight: '700', fontSize: '1.25rem', color: 'var(--warning)' }}>
                {pendentes}
              </p>
            </div>
          </div>
        </div>

        {/* Gerador de Código */}
        <div className="card" style={{
          background: 'var(--tertiary-bg)',
          borderLeft: '3px solid var(--success)',
          marginBottom: '2rem'
        }}>
          <h3 style={{ marginBottom: '1rem', fontSize: 'clamp(1rem, 3vw, 1.125rem)' }}>
            Código de Confirmação de Presença
          </h3>

          {generatedCode ? (
            <div>
              <div style={{
                background: 'var(--secondary-bg)',
                padding: '1.5rem',
                borderRadius: '0.875rem',
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '500' }}>
                  CÓDIGO GERADO
                </p>
                <p style={{
                  fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
                  fontWeight: '700',
                  color: 'var(--accent)',
                  fontFamily: "'Inconsolata', monospace",
                  margin: '0.5rem 0',
                  letterSpacing: '2px'
                }}>
                  {generatedCode}
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                  Compartilhe este código com seus passageiros
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <button
                  onClick={() => copyToClipboard(generatedCode)}
                  style={{
                    background: 'var(--accent)',
                    padding: '0.875rem',
                    fontSize: '0.9rem'
                  }}
                >
                  Copiar Código
                </button>
                <button
                  onClick={generateCode}
                  style={{
                    background: 'var(--secondary-bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                    padding: '0.875rem',
                    fontSize: '0.9rem',
                    boxShadow: 'none'
                  }}
                >
                  Gerar Novo
                </button>
              </div>

              <p style={{
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                textAlign: 'center',
                marginBottom: '1rem'
              }}>
                Selecione um passageiro abaixo e clique "Atribuir Código" para vincular
              </p>
            </div>
          ) : (
            <button
              onClick={generateCode}
              style={{
                width: '100%',
                background: 'var(--success)',
                padding: '1rem'
              }}
            >
              Gerar Código
            </button>
          )}
        </div>

        {/* Lista de Passageiros */}
        <div>
          <h3 style={{ marginBottom: '1rem', fontSize: 'clamp(1rem, 3vw, 1.125rem)' }}>
            Passageiros Reservados
          </h3>

          {reservations.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              background: 'var(--tertiary-bg)',
              borderRadius: '0.875rem',
              border: '1px dashed var(--border)'
            }}>
              <p style={{ color: 'var(--text-secondary)' }}>Nenhum passageiro reservou ainda</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {reservations.map(reservation => (
                <div
                  key={reservation.id}
                  style={{
                    background: 'var(--secondary-bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '0.875rem',
                    overflow: 'hidden'
                  }}
                >
                  {/* Card Principal */}
                  <div
                    onClick={() => setExpandedReservation(expandedReservation === reservation.id ? null : reservation.id)}
                    style={{
                      padding: 'clamp(1rem, 3vw, 1.25rem)',
                      cursor: 'pointer',
                      display: 'grid',
                      gridTemplateColumns: '1fr auto',
                      alignItems: 'center',
                      gap: '1rem',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--tertiary-bg)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <div>
                      <h4 style={{ margin: '0 0 0.5rem 0', fontSize: 'clamp(0.95rem, 2vw, 1.0625rem)' }}>
                        Passageiro
                      </h4>
                      <div style={{
                        display: 'flex',
                        gap: 'clamp(0.75rem, 2vw, 1.5rem)',
                        fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)',
                        color: 'var(--text-secondary)'
                      }}>
                        <span className={`badge ${reservation.data_pagamento_inicial ? 'badge-success' : 'badge-warning'}`}>
                          {reservation.data_pagamento_inicial ? 'Pago' : 'Pendente'}
                        </span>
                        <span>R$ {reservation.valor_final?.toFixed(2)}</span>
                      </div>
                    </div>
                    <div style={{
                      fontSize: '1.5rem',
                      color: 'var(--accent)',
                      transition: 'transform 0.3s ease',
                      transform: expandedReservation === reservation.id ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}>
                      ∨
                    </div>
                  </div>

                  {/* Detalhe Expandido */}
                  {expandedReservation === reservation.id && (
                    <div style={{
                      padding: 'clamp(1rem, 3vw, 1.5rem)',
                      borderTop: '1px solid var(--border)',
                      background: 'var(--tertiary-bg)',
                      animation: 'slideDown 0.3s ease-out'
                    }}>
                      <div style={{ marginBottom: '1.5rem' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.5rem', fontWeight: '500' }}>
                          RESUMO DE PAGAMENTO
                        </p>
                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '0.9rem'
                          }}>
                            <span>Pago agora (1/3):</span>
                            <span style={{ fontWeight: '600', color: 'var(--success)' }}>
                              R$ {reservation.valor_pago_inicial?.toFixed(2)}
                            </span>
                          </div>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '0.9rem'
                          }}>
                            <span>A pagar (2/3):</span>
                            <span style={{ fontWeight: '600', color: 'var(--warning)' }}>
                              R$ {reservation.valor_pendente?.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.75rem', fontWeight: '500' }}>
                          CÓDIGO DE CONFIRMAÇÃO
                        </p>

                        {reservation.codigo ? (
                          <div style={{
                            background: 'var(--secondary-bg)',
                            padding: '1rem',
                            borderRadius: '0.75rem',
                            marginBottom: '1rem',
                            textAlign: 'center'
                          }}>
                            <p style={{
                              fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
                              fontWeight: '700',
                              color: 'var(--success)',
                              fontFamily: "'Inconsolata', monospace",
                              margin: '0',
                              letterSpacing: '1px'
                            }}>
                              {reservation.codigo}
                            </p>
                            <p style={{
                              fontSize: '0.75rem',
                              color: 'var(--text-secondary)',
                              marginTop: '0.5rem'
                            }}>
                              Compartilhe com o passageiro
                            </p>
                          </div>
                        ) : generatedCode ? (
                          <button
                            onClick={() => handleAssignCode(reservation.id)}
                            style={{
                              width: '100%',
                              background: 'var(--accent)',
                              padding: '0.875rem',
                              fontSize: '0.9rem',
                              marginBottom: '1rem'
                            }}
                          >
                            Atribuir Código {generatedCode}
                          </button>
                        ) : (
                          <div style={{
                            background: 'var(--secondary-bg)',
                            padding: '1rem',
                            borderRadius: '0.75rem',
                            textAlign: 'center',
                            color: 'var(--text-secondary)',
                            fontSize: '0.85rem'
                          }}>
                            Gere um código acima para atribuir
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => navigate('/motorista/minhas-caronas')}
          style={{
            marginTop: '2rem',
            width: '100%',
            background: 'var(--secondary-bg)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            boxShadow: 'none'
          }}
        >
          Voltar
        </button>
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  )
}

export default DetalhesCaronaMotorista
