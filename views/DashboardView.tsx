import React, { useState, useEffect } from 'react';
import { fetchDashboard } from '../services/authApi';

export function DashboardView() {
  const [token, setToken] = useState(localStorage.getItem('auth_token') || '');
  const [phone, setPhone] = useState(localStorage.getItem('auth_phone') || '');
  const [apiKey, setApiKey] = useState('');
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      loadDashboard();
    }
  }, [token]);

  async function loadDashboard() {
    try {
      setLoading(true);
      const data = await fetchDashboard(token);
      if (data.error) {
        setError(data.error);
        setToken('');
        return;
      }
      setDashboard(data);
    } catch (err) {
      setError('Erro ao carregar dashboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_phone');
    setToken('');
    setDashboard(null);
  }

  if (!token) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2>Login — Painel de Administrador</h2>
          {error && <div style={styles.error}>{error}</div>}
          <div style={styles.form}>
            <input
              type="text"
              placeholder="Telefone (ex: 11999999999)"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              style={styles.input}
            />
            <input
              type="password"
              placeholder="API Key (recebida no cadastro)"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              style={styles.input}
            />
            <button
              onClick={async () => {
                const { login } = await import('../services/authApi');
                const res = await login(phone, apiKey);
                if (res.error) {
                  setError(res.error);
                } else {
                  localStorage.setItem('auth_token', res.token);
                  localStorage.setItem('auth_phone', phone);
                  setToken(res.token);
                  setError('');
                }
              }}
              style={styles.button}
            >
              Entrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>📊 Painel de Administrador</h1>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Sair
        </button>
      </div>

      {loading && <p>Carregando...</p>}
      {error && <div style={styles.error}>{error}</div>}

      {dashboard && (
        <div style={styles.content}>
          {/* Card de Estatísticas (se disponível) */}
          {dashboard.stats && (
            <div style={styles.card}>
              <h2>📊 Estatísticas de Uso</h2>
              <div style={styles.statsGrid}>
                {/* Status do Plano */}
                <div style={{
                  ...styles.statCard,
                  borderLeft: `4px solid ${
                    dashboard.stats.status === 'active' ? '#28a745' :
                    dashboard.stats.status === 'warning' ? '#ffc107' : '#dc3545'
                  }`
                }}>
                  <div style={styles.statLabel}>Status</div>
                  <div style={styles.statValue}>
                    {dashboard.stats.status === 'active' && '✅ Ativo'}
                    {dashboard.stats.status === 'warning' && '⚠️ Atenção'}
                    {dashboard.stats.status === 'blocked' && '🚫 Bloqueado'}
                  </div>
                </div>

                {/* Mensagens */}
                <div style={styles.statCard}>
                  <div style={styles.statLabel}>Mensagens</div>
                  <div style={styles.statValue}>
                    {dashboard.stats.messages.used} / {dashboard.stats.messages.limit}
                  </div>
                  <div style={styles.statProgress}>
                    <div style={{
                      ...styles.progressFill,
                      width: `${dashboard.stats.messages.percentage}%`,
                      background: dashboard.stats.messages.percentage >= 90 ? '#dc3545' :
                                 dashboard.stats.messages.percentage >= 75 ? '#ffc107' : '#28a745'
                    }} />
                  </div>
                  <div style={styles.statSubtext}>
                    {dashboard.stats.messages.remaining} restantes ({dashboard.stats.messages.percentage.toFixed(1)}%)
                  </div>
                </div>

                {/* Agendamentos */}
                <div style={styles.statCard}>
                  <div style={styles.statLabel}>Agendamentos</div>
                  <div style={styles.statValue}>{dashboard.stats.appointments.total}</div>
                  <div style={styles.statSubtext}>
                    {dashboard.stats.appointments.pending} pendentes · {dashboard.stats.appointments.completed} completos
                  </div>
                </div>

                {/* Plano */}
                <div style={styles.statCard}>
                  <div style={styles.statLabel}>Plano Atual</div>
                  <div style={styles.statValue}>{dashboard.stats.plan.name}</div>
                  <div style={styles.statSubtext}>R$ {dashboard.stats.plan.price}/mês</div>
                </div>
              </div>
            </div>
          )}

          <div style={styles.card}>
            <h2>Informações da Conta</h2>
            <div style={styles.info}>
              <p>
                <strong>Salão:</strong> {dashboard.salon.name}
              </p>
              <p>
                <strong>Plano:</strong> {dashboard.salon.plan.toUpperCase()}
              </p>
              <p>
                <strong>Telefone:</strong> {dashboard.salon.phone}
              </p>
            </div>
          </div>

          <div style={styles.card}>
            <h2>Uso de Mensagens</h2>
            <div style={styles.info}>
              <p>
                <strong>Mensagens Usadas:</strong> {dashboard.usage.messagesUsed}
              </p>
              <p>
                <strong>Limite do Plano:</strong>{' '}
                {dashboard.usage.messagesLimit === Infinity
                  ? 'Ilimitado'
                  : dashboard.usage.messagesLimit}
              </p>
              {dashboard.usage.messagesLimit !== Infinity && (
                <div style={styles.progressBar}>
                  <div
                    style={{
                      ...styles.progressFill,
                      width: `${(dashboard.usage.messagesUsed / dashboard.usage.messagesLimit) * 100}%`,
                      background: (dashboard.usage.messagesUsed / dashboard.usage.messagesLimit) >= 0.9 ? '#dc3545' :
                                 (dashboard.usage.messagesUsed / dashboard.usage.messagesLimit) >= 0.75 ? '#ffc107' : '#28a745'
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div style={styles.card}>
            <h2>Detalhes do Plano</h2>
            <div style={styles.info}>
              <p>
                <strong>Preço Mensal:</strong> R$ {dashboard.planDetails.price}
              </p>
              <p>
                <strong>Limite de Mensagens:</strong>{' '}
                {dashboard.planDetails.messageLimit || 'Ilimitado'}
              </p>
              <p>
                <strong>Descrição:</strong> {dashboard.planDetails.description}
              </p>
            </div>
          </div>

          {dashboard.subscription && (
            <div style={styles.card}>
              <h2>Assinatura Stripe</h2>
              <div style={styles.info}>
                <p>
                  <strong>Status:</strong> {dashboard.subscription.status}
                </p>
                <p>
                  <strong>ID:</strong> {dashboard.subscription.id}
                </p>
                {dashboard.subscription.next_billing_date && (
                  <p>
                    <strong>Próximo Faturamento:</strong>{' '}
                    {new Date(dashboard.subscription.next_billing_date * 1000).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: '#f5f5f5',
    padding: '20px',
    fontFamily: 'system-ui, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  card: {
    background: 'white',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  input: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
  },
  button: {
    padding: '10px',
    background: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  logoutBtn: {
    padding: '8px 16px',
    background: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  error: {
    background: '#f8d7da',
    color: '#721c24',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '20px',
  },
  info: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  content: {
    maxWidth: '800px',
  },
  progressBar: {
    height: '20px',
    background: '#e9ecef',
    borderRadius: '4px',
    overflow: 'hidden',
    marginTop: '10px',
  },
  progressFill: {
    height: '100%',
    background: '#28a745',
    transition: 'width 0.3s',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginTop: '16px',
  },
  statCard: {
    padding: '16px',
    background: '#f8f9fa',
    borderRadius: '8px',
    borderLeft: '4px solid #007bff',
  },
  statLabel: {
    fontSize: '12px',
    color: '#6c757d',
    textTransform: 'uppercase',
    marginBottom: '8px',
    fontWeight: 600,
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: '4px',
  },
  statSubtext: {
    fontSize: '12px',
    color: '#6c757d',
    marginTop: '4px',
  },
  statProgress: {
    height: '8px',
    background: '#e9ecef',
    borderRadius: '4px',
    overflow: 'hidden',
    marginTop: '8px',
  },
};
