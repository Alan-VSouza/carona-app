import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getRideById, updateRideStatus } from '../services/rideService'
import { getRideReservations, confirmPresenca } from '../services/reservationService'
import { Header, HeaderDark } from '../components/Header'

function IniciarCarona() {
  const navigate = useNavigate()
  const { rideId } = useParams()
  const [ride, setRide] = useState(null)
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [caronaIniciada, setCaronaIniciada] = useState(false)
  const [pinInput, setPinInput] = useState('')
  const [confirmados, setConfirmados] = useState(new Set())
  const [mensagem, setMensagem] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rideData = await getRideById(rideId)
        setRide(rideData)

        const reservationsData = await getRideReservations(rideId)
        // Apenas passageiros que já pagaram
        const comPagamento = reservationsData.filter(r => r.data_pagamento_inicial)
        setReservations(comPagamento)

        setLoading(false)
      } catch (error) {
        console.error('Erro ao buscar dados:', error)
        setLoading(false)
      }
    }

    fetchData()
  }, [rideId])

  // Gerar PIN para cada reserva (4 dígitos)
  const gerarPin = (reservaId) => {
    return Math.floor(1000 + Math.random() * 9000).toString()
  }

  const handleIniciarCarona = async () => {
    try {
      // Atualizar status da carona para "em_progresso"
      await updateRideStatus(rideId, 'em_progresso')

      // Gerar PINs para cada passageiro
      const reservasComPin = reservations.map(r => ({
        ...r,
        pin_gerado: gerarPin(r.id)
      }))

      setReservations(reservasComPin)
      setCaronaIniciada(true)
      setMensagem('Carona iniciada! Passageiros receberão seus códigos.')

      // Limpar mensagem após 3 segundos
      setTimeout(() => setMensagem(''), 3000)
    } catch (error) {
      console.error('Erro ao iniciar carona:', error)
      setMensagem('Erro ao iniciar carona')
    }
  }

  const handleConfirmarPresenca = async () => {
    if (!pinInput.trim()) {
      setMensagem('Digite um código')
      return
    }

    // Encontrar passageiro com esse PIN
    const reserva = reservations.find(r => r.pin_gerado === pinInput)

    if (!reserva) {
      setMensagem('Código inválido!')
      setTimeout(() => setMensagem(''), 2000)
      return
    }

    if (confirmados.has(reserva.id)) {
      setMensagem('Passageiro já confirmado')
      setTimeout(() => setMensagem(''), 2000)
      return
    }

    try {
      // Confirmar presença
      await confirmPresenca(reserva.id, pinInput)

      setConfirmados(new Set([...confirmados, reserva.id]))
      setMensagem('Passageiro confirmado! ✓')
      setPinInput('')

      setTimeout(() => setMensagem(''), 2000)
    } catch (error) {
      console.error('Erro ao confirmar presença:', error)
      setMensagem('Erro ao confirmar')
      setTimeout(() => setMensagem(''), 2000)
    }
  }

  const handleSeleccionarPassageiro = async (reserva) => {
    if (confirmados.has(reserva.id)) {
      setMensagem('Passageiro já confirmado')
      setTimeout(() => setMensagem(''), 2000)
      return
    }

    try {
      await confirmPresenca(reserva.id, reserva.pin_gerado)
      setConfirmados(new Set([...confirmados, reserva.id]))
      setMensagem('Passageiro confirmado! ✓')

      setTimeout(() => setMensagem(''), 2000)
    } catch (error) {
      console.error('Erro ao confirmar presença:', error)
      setMensagem('Erro ao confirmar')
      setTimeout(() => setMensagem(''), 2000)
    }
  }

  if (loading) {
    return (
      <>
        <Header title="Iniciar Carona" onBack={() => navigate("/motorista/minhas-caronas")} />
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
        <Header title="Iniciar Carona" onBack={() => navigate("/motorista/minhas-caronas")} />
        <HeaderDark />
        <div className="container" style={{ paddingTop: "2rem" }}>
          <p style={{ color: 'var(--error)' }}>Carona não encontrada</p>
        </div>
      </>
    )
  }

  const dataHora = new Date(ride.data_hora?.toDate?.())

  if (!caronaIniciada) {
    // Tela inicial - botão para iniciar
    return (
      <>
        <Header title="Iniciar Carona" onBack={() => navigate("/motorista/minhas-caronas")} />
        <HeaderDark />

        <div className="container" style={{ paddingTop: "2rem" }}>
          {/* Resumo da Carona */}
          <div className="card" style={{ borderLeft: '3px solid var(--accent)', marginBottom: '2rem' }}>
            <h2 style={{ marginBottom: '1rem' }}>
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
                <p style={{ fontWeight: '600', fontSize: '0.95rem' }}>
                  {dataHora.toLocaleDateString('pt-BR')} {dataHora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.5rem', fontWeight: '500' }}>
                  DISTÂNCIA
                </p>
                <p style={{ fontWeight: '600', fontSize: '0.95rem' }}>
                  {ride.km_estimado} km
                </p>
              </div>
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.5rem', fontWeight: '500' }}>
                  PASSAGEIROS
                </p>
                <p style={{ fontWeight: '600', fontSize: '0.95rem' }}>
                  {reservations.length}
                </p>
              </div>
            </div>
          </div>

          {/* Informações */}
          <div className="card" style={{
            background: 'var(--tertiary-bg)',
            borderLeft: '3px solid var(--warning)',
            marginBottom: '2rem'
          }}>
            <h3 style={{ marginBottom: '1rem', fontSize: 'clamp(1rem, 3vw, 1.125rem)' }}>
              Pronto para iniciar?
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Ao iniciar a carona, códigos serão gerados para cada passageiro que já pagou. Você precisará confirmar a presença de cada um digitando seu código.
            </p>
            <ul style={{
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              marginLeft: '1.5rem',
              marginBottom: '1rem'
            }}>
              <li>Cada passageiro receberá seu código</li>
              <li>Você confirma digitando o código ou selecionando o passageiro</li>
              <li>Após confirmação, o pagamento final é liberado</li>
            </ul>
          </div>

          <button
            onClick={handleIniciarCarona}
            style={{
              width: '100%',
              background: 'var(--success)',
              padding: '1.25rem',
              marginBottom: '1rem',
              fontSize: '1rem'
            }}
          >
            Iniciar Carona Agora
          </button>

          <button
            onClick={() => navigate('/motorista/minhas-caronas')}
            style={{
              width: '100%',
              background: 'var(--secondary-bg)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              padding: '1rem',
              boxShadow: 'none'
            }}
          >
            Cancelar
          </button>
        </div>
      </>
    )
  }

  // Tela de confirmação de presença
  return (
    <>
      <Header title="Confirmar Presença" onBack={() => navigate("/motorista/minhas-caronas")} />
      <HeaderDark />

      <div className="container" style={{ paddingTop: "2rem" }}>
        {/* Mensagens */}
        {mensagem && (
          <div style={{
            padding: '1rem',
            background: mensagem.includes('✓') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${mensagem.includes('✓') ? 'var(--success)' : 'var(--error)'}`,
            color: mensagem.includes('✓') ? 'var(--success)' : 'var(--error)',
            borderRadius: '0.875rem',
            marginBottom: '1.5rem',
            textAlign: 'center',
            fontSize: '0.95rem',
            fontWeight: '500',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            {mensagem}
          </div>
        )}

        {/* Input de Código */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Digite o código do passageiro:</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: '0.75rem'
          }}>
            <input
              type="text"
              placeholder="Ex: 5847"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
              maxLength={4}
              style={{
                margin: 0,
                fontSize: 'clamp(1rem, 3vw, 1.25rem)',
                textAlign: 'center',
                letterSpacing: '4px',
                fontFamily: "'Inconsolata', monospace",
                fontWeight: '600'
              }}
            />
            <button
              onClick={handleConfirmarPresenca}
              style={{
                background: 'var(--accent)',
                padding: '0.875rem 1.5rem',
                width: 'auto'
              }}
            >
              Confirmar
            </button>
          </div>
        </div>

        {/* Lista de Passageiros */}
        <div>
          <h3 style={{ marginBottom: '1rem' }}>Passageiros: {confirmados.size}/{reservations.length}</h3>

          <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '2rem' }}>
            {reservations.map(reserva => (
              <div
                key={reserva.id}
                onClick={() => !confirmados.has(reserva.id) && handleSeleccionarPassageiro(reserva)}
                style={{
                  background: 'var(--secondary-bg)',
                  border: confirmados.has(reserva.id) ? '2px solid var(--success)' : '1px solid var(--border)',
                  borderRadius: '0.875rem',
                  padding: 'clamp(1rem, 3vw, 1.25rem)',
                  cursor: confirmados.has(reserva.id) ? 'default' : 'pointer',
                  transition: 'all 0.3s ease',
                  opacity: confirmados.has(reserva.id) ? 0.7 : 1
                }}
                onMouseEnter={(e) => {
                  if (!confirmados.has(reserva.id)) {
                    e.currentTarget.style.background = 'var(--tertiary-bg)'
                    e.currentTarget.style.borderColor = 'var(--accent)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!confirmados.has(reserva.id)) {
                    e.currentTarget.style.background = 'var(--secondary-bg)'
                    e.currentTarget.style.borderColor = 'var(--border)'
                  }
                }}
              >
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto auto',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: 'clamp(0.95rem, 2vw, 1.0625rem)' }}>
                      Passageiro
                    </h4>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      R$ {reserva.valor_final?.toFixed(2)}
                    </p>
                  </div>
                  <div style={{
                    background: 'var(--tertiary-bg)',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.625rem',
                    textAlign: 'center'
                  }}>
                    <p style={{
                      margin: 0,
                      fontSize: '1.5rem',
                      fontWeight: '700',
                      color: 'var(--accent)',
                      fontFamily: "'Inconsolata', monospace",
                      letterSpacing: '2px'
                    }}>
                      {reserva.pin_gerado}
                    </p>
                  </div>
                  <div style={{
                    fontSize: confirmados.has(reserva.id) ? '1.5rem' : '1.25rem',
                    color: confirmados.has(reserva.id) ? 'var(--success)' : 'var(--text-secondary)'
                  }}>
                    {confirmados.has(reserva.id) ? '✓' : '→'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {confirmados.size === reservations.length && (
          <div className="card" style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid var(--success)',
            textAlign: 'center'
          }}>
            <h3 style={{ color: 'var(--success)', marginBottom: '0.5rem' }}>
              Todos confirmados!
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              A carona foi concluída com sucesso.
            </p>
          </div>
        )}

        <button
          onClick={() => navigate('/motorista/minhas-caronas')}
          style={{
            marginTop: '2rem',
            width: '100%',
            background: 'var(--secondary-bg)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
            padding: '1rem',
            boxShadow: 'none'
          }}
        >
          Voltar
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </>
  )
}

export default IniciarCarona
