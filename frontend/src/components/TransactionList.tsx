import React from 'react';
import { ArrowUpRight, ArrowDownLeft, AlertTriangle } from 'lucide-react';

interface Transaction {
  id: string;
  from_account_id: string | null;
  to_account_id: string | null;
  amount: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED';
  created_at: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  currentAccountId: string;
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, currentAccountId }) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getTransactionDetails = (tx: Transaction) => {
    if (tx.type === 'DEPOSIT') {
      return {
        label: 'Depósito Realizado',
        isCredit: true,
        amountPrefix: '+',
        icon: <ArrowDownLeft size={18} style={{ color: 'var(--success)' }} />,
        iconBg: 'var(--success-glow)',
      };
    }

    if (tx.type === 'WITHDRAWAL') {
      return {
        label: 'Retiro en Efectivo',
        isCredit: false,
        amountPrefix: '-',
        icon: <ArrowUpRight size={18} style={{ color: 'var(--danger)' }} />,
        iconBg: 'var(--danger-glow)',
      };
    }

    // Transfer
    const isIncoming = tx.to_account_id === currentAccountId;
    return {
      label: isIncoming ? 'Transferencia Recibida' : 'Transferencia Enviada',
      isCredit: isIncoming,
      amountPrefix: isIncoming ? '+' : '-',
      icon: isIncoming ? (
        <ArrowDownLeft size={18} style={{ color: 'var(--success)' }} />
      ) : (
        <ArrowUpRight size={18} style={{ color: 'var(--primary)' }} />
      ),
      iconBg: isIncoming ? 'var(--success-glow)' : 'var(--primary-glow)',
    };
  };

  if (transactions.length === 0) {
    return (
      <div style={styles.emptyContainer} className="glass-panel animate-fade-in">
        <AlertTriangle size={24} style={styles.emptyIcon} />
        <span style={styles.emptyText}>No hay transacciones registradas todavía</span>
      </div>
    );
  }

  return (
    <div style={styles.container} className="glass-panel animate-fade-in">
      <h3 style={styles.title}>Historial de Movimientos</h3>
      
      <div style={styles.list}>
        {transactions.map((tx) => {
          const details = getTransactionDetails(tx);
          const amountVal = parseFloat(tx.amount) || 0;
          const formattedAmount = new Intl.NumberFormat('es-ES', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(amountVal);

          return (
            <div key={tx.id} style={styles.item} className="animate-slide-up">
              <div style={styles.leftRow}>
                <div style={{ ...styles.iconWrapper, backgroundColor: details.iconBg }}>
                  {details.icon}
                </div>
                <div style={styles.infoCol}>
                  <span style={styles.label}>{details.label}</span>
                  <span style={styles.date}>{formatDate(tx.created_at)}</span>
                </div>
              </div>

              <div style={styles.rightRow}>
                <span style={{
                  ...styles.amount,
                  color: details.isCredit ? 'var(--success)' : 'var(--text-primary)',
                }}>
                  {details.amountPrefix} ${formattedAmount}
                </span>
                
                <span style={{
                  ...styles.statusBadge,
                  backgroundColor: 
                    tx.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.05)' :
                    tx.status === 'FAILED' ? 'rgba(244, 63, 94, 0.05)' : 'rgba(255,255,255,0.02)',
                  color: 
                    tx.status === 'COMPLETED' ? 'var(--success)' :
                    tx.status === 'FAILED' ? 'var(--danger)' : 'var(--text-muted)',
                }}>
                  {tx.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '30px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '500px',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.2rem',
    fontWeight: 700,
    marginBottom: '20px',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    overflowY: 'auto',
    paddingRight: '6px',
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    transition: 'background-color var(--transition-fast)',
  },
  leftRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  iconWrapper: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCol: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  date: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginTop: '2px',
  },
  rightRow: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '4px',
  },
  amount: {
    fontSize: '0.95rem',
    fontWeight: 700,
    fontFamily: 'var(--font-display)',
  },
  statusBadge: {
    fontSize: '0.6rem',
    fontWeight: 700,
    padding: '1px 6px',
    borderRadius: '10px',
    textTransform: 'uppercase',
  },
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    textAlign: 'center',
    gap: '12px',
  },
  emptyIcon: {
    color: 'var(--text-muted)',
  },
  emptyText: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    fontWeight: 500,
  },
};
