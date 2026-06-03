import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, Download, Upload, AlertCircle, CheckCircle, Search } from 'lucide-react';
import { ApiService } from '../services/api';

interface Account {
  id: string;
  account_number: string;
  balance: string;
  currency: string;
  status: 'ACTIVE' | 'FROZEN' | 'CLOSED';
}

interface TransactionFormProps {
  account: Account;
  onTransactionSuccess: () => void;
}

type TabMode = 'deposit' | 'withdraw' | 'transfer';

export const TransactionForm: React.FC<TransactionFormProps> = ({ account, onTransactionSuccess }) => {
  const [activeTab, setActiveTab] = useState<TabMode>('deposit');
  const [amount, setAmount] = useState('');
  
  // Transfer state
  const [toAccNumber, setToAccNumber] = useState('');
  const [recipientAccount, setRecipientAccount] = useState<any | null>(null);
  const [searchingRecipient, setSearchingRecipient] = useState(false);
  const [recipientError, setRecipientError] = useState<string | null>(null);

  // General state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Clean form state on tab change
  useEffect(() => {
    setAmount('');
    setToAccNumber('');
    setRecipientAccount(null);
    setRecipientError(null);
    setError(null);
    setSuccessMsg(null);
  }, [activeTab]);

  // Debounced search for recipient account number
  useEffect(() => {
    if (activeTab !== 'transfer' || toAccNumber.length < 5) {
      setRecipientAccount(null);
      setRecipientError(null);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setSearchingRecipient(true);
      setRecipientError(null);
      setRecipientAccount(null);

      try {
        const response = await ApiService.accounts.searchAccount(toAccNumber);
        if (response.id === account.id) {
          setRecipientError('No puedes transferir a tu propia cuenta');
        } else {
          setRecipientAccount(response);
        }
      } catch (err: any) {
        setRecipientError('Cuenta de destino no encontrada');
      } finally {
        setSearchingRecipient(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [toAccNumber, activeTab, account.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // Validations
    const amountVal = parseFloat(amount);
    if (isNaN(amountVal) || amountVal <= 0) {
      setError('El monto debe ser un número mayor a cero');
      return;
    }

    if (activeTab === 'withdraw' && amountVal > parseFloat(account.balance)) {
      setError('Saldo insuficiente para realizar el retiro');
      return;
    }

    if (activeTab === 'transfer') {
      if (!toAccNumber) {
        setError('Por favor ingrese el número de cuenta de destino');
        return;
      }
      if (!recipientAccount) {
        setError('Debe seleccionar un destinatario válido');
        return;
      }
      if (amountVal > parseFloat(account.balance)) {
        setError('Saldo insuficiente para realizar la transferencia');
        return;
      }
    }

    setLoading(true);

    try {
      if (activeTab === 'deposit') {
        await ApiService.transactions.deposit(account.id, amount);
        setSuccessMsg(`Depósito de ${account.currency} ${amount} realizado con éxito`);
      } else if (activeTab === 'withdraw') {
        await ApiService.transactions.withdraw(account.id, amount);
        setSuccessMsg(`Retiro de ${account.currency} ${amount} realizado con éxito`);
      } else if (activeTab === 'transfer') {
        await ApiService.transactions.transfer(account.id, recipientAccount.id, amount);
        setSuccessMsg(`Transferencia de ${account.currency} ${amount} a ${recipientAccount.user.email} realizada con éxito`);
      }
      setAmount('');
      setToAccNumber('');
      setRecipientAccount(null);
      onTransactionSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al ejecutar la operación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container} className="glass-panel animate-fade-in">
      <div style={styles.tabsHeader}>
        <button
          onClick={() => setActiveTab('deposit')}
          style={{
            ...styles.tabButton,
            ...(activeTab === 'deposit' ? styles.activeTabButton : {}),
          }}
        >
          <Upload size={16} />
          <span>Depósito</span>
        </button>

        <button
          onClick={() => setActiveTab('withdraw')}
          style={{
            ...styles.tabButton,
            ...(activeTab === 'withdraw' ? styles.activeTabButton : {}),
          }}
        >
          <Download size={16} />
          <span>Retiro</span>
        </button>

        <button
          onClick={() => setActiveTab('transfer')}
          style={{
            ...styles.tabButton,
            ...(activeTab === 'transfer' ? styles.activeTabButton : {}),
          }}
        >
          <ArrowRightLeft size={16} />
          <span>Transferencia</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        <h3 style={styles.formTitle}>
          {activeTab === 'deposit' && 'Depositar Fondos'}
          {activeTab === 'withdraw' && 'Retirar Fondos'}
          {activeTab === 'transfer' && 'Realizar Transferencia'}
        </h3>

        {error && (
          <div style={styles.alertError} className="animate-slide-up">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div style={styles.alertSuccess} className="animate-slide-up">
            <CheckCircle size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {activeTab === 'transfer' && (
          <div style={styles.inputGroup}>
            <label style={styles.label}>Número de Cuenta Destino</label>
            <div style={styles.inputWrapper}>
              <Search size={18} style={styles.inputIcon} />
              <input
                type="text"
                placeholder="Ej: 1000000002"
                value={toAccNumber}
                onChange={(e) => setToAccNumber(e.target.value.replace(/\D/g, ''))}
                className="glass-input"
                style={styles.input}
                disabled={loading}
              />
            </div>
            
            {/* Search states */}
            {searchingRecipient && (
              <span style={styles.searchingText}>Buscando destinatario...</span>
            )}
            
            {recipientError && (
              <span style={styles.recipientErrorText}>{recipientError}</span>
            )}
            
            {recipientAccount && (
              <div style={styles.recipientFound} className="animate-slide-up">
                <CheckCircle size={14} style={{ color: 'var(--success)' }} />
                <span>Destinatario: <strong>{recipientAccount.user.email}</strong></span>
              </div>
            )}
          </div>
        )}

        <div style={styles.inputGroup}>
          <label style={styles.label}>Monto ({account.currency})</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="glass-input"
            disabled={loading}
            required
          />
        </div>

        <button
          type="submit"
          className="btn-primary"
          style={styles.submitBtn}
          disabled={loading || (activeTab === 'transfer' && !recipientAccount)}
        >
          {loading ? (
            <div style={styles.spinner} />
          ) : (
            <>
              {activeTab === 'deposit' && <Upload size={18} />}
              {activeTab === 'withdraw' && <Download size={18} />}
              {activeTab === 'transfer' && <ArrowRightLeft size={18} />}
              <span>Confirmar Operación</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '0',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '500px',
    width: '100%',
    margin: '0 auto',
  },
  tabsHeader: {
    display: 'flex',
    borderBottom: '1px solid var(--border-color)',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  tabButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '16px',
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    transition: 'all var(--transition-fast)',
    borderBottom: '2px solid transparent',
  },
  activeTabButton: {
    color: 'var(--primary)',
    borderBottom: '2px solid var(--primary)',
    background: 'rgba(99, 102, 241, 0.04)',
  },
  form: {
    padding: '30px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.2rem',
    fontWeight: 700,
    marginBottom: '4px',
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    marginBottom: '8px',
    display: 'block',
  },
  inputGroup: {
    width: '100%',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '16px',
    color: 'var(--text-muted)',
  },
  input: {
    paddingLeft: '48px',
  },
  searchingText: {
    display: 'block',
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    marginTop: '6px',
  },
  recipientErrorText: {
    display: 'block',
    fontSize: '0.8rem',
    color: 'var(--danger)',
    marginTop: '6px',
    fontWeight: 500,
  },
  recipientFound: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.8rem',
    color: 'var(--success)',
    marginTop: '6px',
    fontWeight: 500,
    padding: '6px 12px',
    background: 'var(--success-glow)',
    border: '1px solid rgba(16, 185, 129, 0.1)',
    borderRadius: '6px',
  },
  submitBtn: {
    height: '46px',
    width: '100%',
    marginTop: '10px',
  },
  alertError: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    background: 'var(--danger-glow)',
    color: 'var(--danger)',
    border: '1px solid rgba(244, 63, 94, 0.15)',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.85rem',
    fontWeight: 500,
  },
  alertSuccess: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    background: 'var(--success-glow)',
    color: 'var(--success)',
    border: '1px solid rgba(16, 185, 129, 0.15)',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.85rem',
    fontWeight: 500,
  },
  spinner: {
    width: '20px',
    height: '20px',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin-slow 1s linear infinite',
  },
};
