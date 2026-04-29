import { useNavigate } from 'react-router-dom';

export function RideDetailsModal({ ride, isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen || !ride) return null;

  const dataHora = new Date(ride.data_hora?.toDate?.()).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const handleReserve = () => {
    navigate(`/passageiro/reserva/${ride.id}`);
  };

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
        padding: '2rem',
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
          <h2 style={{ margin: 0, fontSize: '1.375rem' }}>Detalhes da Carona</h2>
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
          background: 'var(--tertiary-bg)',
          padding: '1.5rem',
          borderRadius: '0.875rem',
          marginBottom: '1.5rem'
        }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '500' }}>
            TRAJETO
          </p>
          <h3 style={{ fontSize: '1.25rem', margin: '0.5rem 0', lineHeight: '1.4' }}>
            {ride.origem?.split(',')[0]} → {ride.destino?.split(',')[0]}
          </h3>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            background: 'var(--tertiary-bg)',
            padding: '1.25rem',
            borderRadius: '0.875rem'
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
            padding: '1.25rem',
            borderRadius: '0.875rem'
          }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.5rem', fontWeight: '500' }}>
              DISTÂNCIA
            </p>
            <p style={{ fontWeight: '600', fontSize: '0.95rem' }}>
              {ride.km_estimado} km
            </p>
          </div>
        </div>

        <div style={{
          background: 'var(--tertiary-bg)',
          padding: '1.5rem',
          borderRadius: '0.875rem',
          marginBottom: '1.5rem'
        }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.75rem', fontWeight: '500' }}>
            VEÍCULO
          </p>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            <p style={{ margin: 0, fontWeight: '600' }}>
              {ride.carro?.modelo}
            </p>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', fontFamily: "'Inconsolata', monospace" }}>
              {ride.carro?.placa}
            </p>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: 'var(--tertiary-bg)',
            padding: '1.25rem',
            borderRadius: '0.875rem'
          }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.5rem', fontWeight: '500' }}>
              PREÇO
            </p>
            <p style={{ fontWeight: '700', fontSize: '1.125rem', color: 'var(--success)' }}>
              R$ {ride.valor_total?.toFixed(2)}
            </p>
          </div>
          <div style={{
            background: 'var(--tertiary-bg)',
            padding: '1.25rem',
            borderRadius: '0.875rem'
          }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.5rem', fontWeight: '500' }}>
              LUGARES
            </p>
            <p style={{ fontWeight: '700', fontSize: '1.125rem' }}>
              {ride.lugares_disponiveis - ride.lugares_ocupados}/{ride.lugares_disponiveis}
            </p>
          </div>
        </div>

        <button
          onClick={handleReserve}
          style={{
            width: '100%',
            background: 'var(--accent)',
            padding: '1rem',
            marginBottom: '0.5rem',
            fontSize: '0.95rem'
          }}
        >
          Reservar Carona
        </button>
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
  );
}
