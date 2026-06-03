import React, { useState } from 'react';
import { Copy, Check, Plus, Landmark, TrendingUp, RefreshCw } from 'lucide-react';
import { ApiService } from '../services/api';

interface Account {
  id: string;
  account_number: string;
  balance: string;
  currency: string;
  status: 'ACTIVE' | 'FROZEN' | 'CLOSED';
}

interface AccountCardProps {
  account: Account | null;
  onAccountCreated: () => void;
  onRefresh: () => void;
  refreshing: boolean;
}

export const AccountCard: React.FC<AccountCardProps> = ({
  account,
  onAccountCreated,
  onRefresh,
  refreshing,
}) => {
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const copyToClipboard = () => {
    if (!account) return;
    navigator.clipboard.writeText(account.account_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateAccount = async () => {
    setCreating(true);
    setError(null);

    // Auto-generate a random 10-digit account number (starting with 1)
    const randomAccNumber = '1' + Math.floor(100000000 + Math.random() * 900000000).toString();

    try {
      await ApiService.accounts.createAccount(randomAccNumber);
      onAccountCreated();
    } catch (err: any) {
      setError(err.message || 'Error al crear la cuenta bancaria');
    } finally {
      setCreating(false);
    }
  };

  if (!account) {
    return (
      <div style={styles.cardEmpty} className="glass-panel animate-fade-in">
        <div style={styles.emptyIconContainer}>
          <Landmark size={36} style={styles.emptyIcon} />
        </div>
        <h3 style={styles.emptyTitle}>No tienes ninguna cuenta activa</h3>
        <p style={styles.emptySubtitle}>
          Crea una cuenta bancaria simulada en segundos para comenzar a operar, realizar depósitos y transferencias.
        </p>

        {error && <span style={styles.errorText}>{error}</span>}

        <button
          onClick={handleCreateAccount}
          className="btn-primary"
          style={styles.createBtn}
          disabled={creating}
        >
          {creating ? (
            <div style={styles.spinner} />
          ) : (
            <>
              <Plus size={18} />
              <span>Crear Cuenta Bancaria</span>
            </>
          )}
        </button>
      </div>
    );
  }

  // Parse balance to handle decimal numbers nicely
  const balanceVal = parseFloat(account.balance) || 0;
  const formattedBalance = new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(balanceVal);

  return (
    <div style={styles.cardActive} className="glass-panel animate-fade-in">
      <div style={styles.cardHeader}>
        <div style={styles.brandGroup}>
          <Landmark size={20} style={styles.cardBrandIcon} />
          <span style={styles.cardBrandText}>Aether Card</span>
        </div>
        <div style={styles.statusGroup}>
          <span style={{
            ...styles.statusBadge,
            backgroundColor: account.status === 'ACTIVE' ? 'var(--success-glow)' : 'rgba(255,255,255,0.05)',
            color: account.status === 'ACTIVE' ? 'var(--success)' : 'var(--text-muted)',
            borderColor: account.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.2)' : 'var(--border-color)',
          }}>
            {account.status}
          </span>
          <button
            onClick={onRefresh}
            style={styles.refreshBtn}
            disabled={refreshing}
            title="Actualizar saldo"
          >
            <RefreshCw size={14} style={{
              animation: refreshing ? 'spin-slow 1s linear infinite' : 'none'
            }} />
          </button>
        </div>
      </div>

      <div style={styles.balanceSection}>
        <span style={styles.balanceLabel}>Balance Disponible</span>
        <h2 style={styles.balanceValue}>
          <span style={styles.currency}>{account.currency}</span> {formattedBalance}
        </h2>
      </div>

      <div style={styles.cardFooter}>
        <div style={styles.accNumberGroup}>
          <span style={styles.accNumberLabel}>Número de Cuenta</span>
          <div style={styles.numberRow}>
            <span style={styles.accNumberValue}>{account.account_number}</span>
            <button onClick={copyToClipboard} style={styles.copyBtn} title="Copiar cuenta">
              {copied ? <Check size={14} style={{ color: 'var(--success)' }} /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        <div style={styles.cardTrend}>
          <TrendingUp size={16} style={styles.trendIcon} />
          <span style={styles.trendText}>Sistema Activo (100% ACID)</span>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  cardEmpty: {
    padding: '40px 30px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '280px',
    maxWidth: '500px',
    width: '100%',
    margin: '0 auto',
  },
  emptyIconContainer: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.03)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '16px',
    border: '1px solid var(--border-color)',
  },
  emptyIcon: {
    color: 'var(--text-secondary)',
  },
  emptyTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.25rem',
    fontWeight: 700,
    marginBottom: '8px',
  },
  emptySubtitle: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.5,
    marginBottom: '20px',
  },
  createBtn: {
    padding: '10px 20px',
    fontSize: '0.9rem',
  },
  errorText: {
    color: 'var(--danger)',
    fontSize: '0.8rem',
    marginBottom: '10px',
    fontWeight: 500,
  },
  cardActive: {
    padding: '30px',
    height: '240px',
    maxWidth: '500px',
    width: '100%',
    margin: '0 auto',
    background: 'linear-gradient(135deg, rgba(17, 25, 40, 0.75) 0%, rgba(20, 20, 35, 0.9) 100%)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxShadow: 'var(--shadow-md), 0 0 30px rgba(99, 102, 241, 0.05)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  cardBrandIcon: {
    color: 'var(--primary)',
  },
  cardBrandText: {
    fontSize: '0.85rem',
    fontFamily: 'var(--font-display)',
    fontWeight: 600,
    letterSpacing: '0.05em',
    color: 'var(--text-secondary)',
  },
  statusGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  statusBadge: {
    fontSize: '0.65rem',
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: '12px',
    border: '1px solid transparent',
  },
  refreshBtn: {
    padding: '4px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    color: 'var(--text-secondary)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceSection: {
    marginTop: '12px',
  },
  balanceLabel: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    fontWeight: 500,
  },
  balanceValue: {
    fontSize: '2.25rem',
    fontFamily: 'var(--font-display)',
    fontWeight: 800,
    marginTop: '4px',
    letterSpacing: '-0.02em',
  },
  currency: {
    fontSize: '1.25rem',
    fontWeight: 500,
    color: 'var(--primary)',
    marginRight: '4px',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '16px',
  },
  accNumberGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  accNumberLabel: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  numberRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '4px',
  },
  accNumberValue: {
    fontSize: '1rem',
    fontFamily: 'var(--font-display)',
    fontWeight: 600,
    letterSpacing: '0.1em',
    color: 'var(--text-primary)',
  },
  copyBtn: {
    padding: '2px',
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color var(--transition-fast)',
  },
  cardTrend: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: 'var(--success)',
    background: 'var(--success-glow)',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '0.7rem',
    fontWeight: 600,
  },
  trendIcon: {
    flexShrink: 0,
  },
  trendText: {
    whiteSpace: 'nowrap',
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin-slow 1s linear infinite',
  },
};
