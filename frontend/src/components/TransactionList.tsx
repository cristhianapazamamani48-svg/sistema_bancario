import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, AlertTriangle, Printer, X, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

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
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatFullDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
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

  const handlePrint = () => {
    window.print();
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
    <>
      {/* Estilo CSS inyectado especial para Impresión */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden !important;
            }
            .print-receipt-modal, .print-receipt-modal * {
              visibility: visible !important;
            }
            .print-receipt-modal {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              background: white !important;
              color: black !important;
              box-shadow: none !important;
              border: none !important;
              padding: 40px !important;
            }
            .print-hide {
              display: none !important;
            }
            .print-receipt-title {
              color: black !important;
            }
          }
        `}
      </style>

      <div style={styles.container} className="glass-panel animate-fade-in">
        <h3 style={styles.title}>Historial de Movimientos</h3>
        <p style={styles.subtitle}>Haz clic en cualquier transacción para ver el comprobante imprimible</p>
        
        <div style={styles.list}>
          {transactions.map((tx) => {
            const details = getTransactionDetails(tx);
            const amountVal = parseFloat(tx.amount) || 0;
            const formattedAmount = new Intl.NumberFormat('es-ES', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(amountVal);

            return (
              <div 
                key={tx.id} 
                style={styles.item} 
                className="animate-slide-up"
                onClick={() => setSelectedTx(tx)}
              >
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

      {/* MODAL DE COMPROBANTE DE TRANSACCIÓN */}
      {selectedTx && (() => {
        const details = getTransactionDetails(selectedTx);
        const amountVal = parseFloat(selectedTx.amount) || 0;
        const formattedAmount = new Intl.NumberFormat('es-ES', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(amountVal);

        return (
          <div style={styles.modalOverlay} className="animate-fade-in print-hide">
            <div 
              style={styles.modalContent} 
              className="glass-panel print-receipt-modal animate-slide-up"
            >
              {/* Header Modal */}
              <div style={styles.modalHeader} className="print-hide">
                <span style={styles.modalHeaderTitle}>Comprobante Electrónico</span>
                <button onClick={() => setSelectedTx(null)} style={styles.closeBtn}>
                  <X size={20} />
                </button>
              </div>

              {/* Receipt Body */}
              <div style={styles.receiptBody}>
                <div style={styles.receiptBrand}>
                  <h2 style={styles.receiptBrandTitle} className="print-receipt-title">AETHER BANK</h2>
                  <span style={styles.receiptBrandSubtitle}>Simulación de Núcleo Bancario ACID</span>
                </div>

                <div style={styles.statusSection}>
                  {selectedTx.status === 'COMPLETED' && (
                    <CheckCircle2 size={48} style={{ color: 'var(--success)' }} />
                  )}
                  {selectedTx.status === 'FAILED' && (
                    <XCircle size={48} style={{ color: 'var(--danger)' }} />
                  )}
                  {selectedTx.status !== 'COMPLETED' && selectedTx.status !== 'FAILED' && (
                    <AlertCircle size={48} style={{ color: 'var(--warning)' }} />
                  )}
                  <h1 style={styles.receiptAmount} className="print-receipt-title">
                    {details.amountPrefix}${formattedAmount}
                  </h1>
                  <span style={{
                    ...styles.statusText,
                    color: selectedTx.status === 'COMPLETED' ? 'var(--success)' : 'var(--danger)'
                  }}>
                    Operación {selectedTx.status === 'COMPLETED' ? 'Exitosa' : 'Fallida'}
                  </span>
                </div>

                <div style={styles.divider} />

                {/* Details Table */}
                <div style={styles.detailsGrid}>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Tipo de Operación</span>
                    <span style={styles.detailValue}>{selectedTx.type}</span>
                  </div>

                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>ID Transacción</span>
                    <span style={{ ...styles.detailValue, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                      {selectedTx.id}
                    </span>
                  </div>

                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Fecha y Hora</span>
                    <span style={styles.detailValue}>{formatFullDate(selectedTx.created_at)}</span>
                  </div>

                  {selectedTx.from_account_id && (
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Cuenta Origen</span>
                      <span style={{ ...styles.detailValue, fontFamily: 'monospace' }}>
                        {selectedTx.from_account_id}
                      </span>
                    </div>
                  )}

                  {selectedTx.to_account_id && (
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Cuenta Destino</span>
                      <span style={{ ...styles.detailValue, fontFamily: 'monospace' }}>
                        {selectedTx.to_account_id}
                      </span>
                    </div>
                  )}

                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Estado en Ledger</span>
                    <span style={styles.detailValue}>{selectedTx.status}</span>
                  </div>
                </div>

                <div style={styles.divider} />
                
                <p style={styles.receiptFooter}>
                  Este documento es un comprobante electrónico oficial emitido por el simulador de transacciones ACID de Aether Bank.
                </p>
              </div>

              {/* Actions Footer */}
              <div style={styles.modalActions} className="print-hide">
                <button onClick={handlePrint} className="btn-primary" style={styles.actionBtn}>
                  <Printer size={16} />
                  <span>Imprimir Comprobante / PDF</span>
                </button>
                <button onClick={() => setSelectedTx(null)} className="btn-secondary" style={styles.actionBtn}>
                  <span>Cerrar</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </>
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
  },
  subtitle: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
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
    transition: 'all var(--transition-fast)',
    cursor: 'pointer',
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

  /* Modal Styles */
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modalContent: {
    width: '100%',
    maxWidth: '450px',
    padding: '0',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    borderBottom: '1px solid var(--border-color)',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  modalHeaderTitle: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    letterSpacing: '0.05em',
  },
  closeBtn: {
    color: 'var(--text-secondary)',
    transition: 'color var(--transition-fast)',
    display: 'flex',
    alignItems: 'center',
  },
  receiptBody: {
    padding: '30px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  receiptBrand: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  receiptBrandTitle: {
    fontSize: '1.4rem',
    fontWeight: 800,
    color: 'var(--text-primary)',
    letterSpacing: '0.08em',
  },
  receiptBrandSubtitle: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginTop: '4px',
    display: 'block',
  },
  statusSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '24px',
  },
  receiptAmount: {
    fontSize: '2.5rem',
    fontWeight: 800,
    fontFamily: 'var(--font-display)',
    letterSpacing: '-0.02em',
  },
  statusText: {
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  divider: {
    width: '100%',
    height: '1px',
    borderTop: '1px dashed var(--border-color)',
    margin: '12px 0',
  },
  detailsGrid: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    margin: '12px 0',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.85rem',
  },
  detailLabel: {
    color: 'var(--text-secondary)',
    fontWeight: 500,
  },
  detailValue: {
    color: 'var(--text-primary)',
    fontWeight: 600,
  },
  receiptFooter: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    textAlign: 'center',
    lineHeight: '1.4',
    marginTop: '16px',
  },
  modalActions: {
    padding: '20px 24px',
    borderTop: '1px solid var(--border-color)',
    background: 'rgba(255, 255, 255, 0.02)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  actionBtn: {
    width: '100%',
  },
};
