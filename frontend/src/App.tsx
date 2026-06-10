import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AuthScreen } from './components/AuthScreen';
import { AccountCard } from './components/AccountCard';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { AuditLogs } from './components/AuditLogs';
import { LoadingSpinner } from './components/LoadingSpinner';
import { BalanceChart } from './components/BalanceChart';
import { ApiService } from './services/api';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<'dashboard' | 'audit'>('dashboard');
  const [account, setAccount] = useState<any | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingAccount, setLoadingAccount] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadAccountData = async (silent = false) => {
    if (!user) return;
    if (!silent) setLoadingAccount(true);
    else setRefreshing(true);

    try {
      const accounts = await ApiService.accounts.getMyAccounts();
      if (accounts && accounts.length > 0) {
        const activeAccount = accounts[0]; // Take the first account
        setAccount(activeAccount);
        
        // Fetch history
        const history = await ApiService.transactions.getHistory(activeAccount.id);
        setTransactions(history);
      } else {
        setAccount(null);
        setTransactions([]);
      }
    } catch (error) {
      console.error('Failed to load account data:', error);
    } finally {
      setLoadingAccount(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadAccountData();
    } else {
      setAccount(null);
      setTransactions([]);
    }
  }, [user]);

  if (loading) {
    return (
      <div style={styles.centerPage}>
        <LoadingSpinner size={50} />
        <span style={styles.loadingText}>Conectando con Aether Core...</span>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div style={styles.appContainer}>
      <Navbar currentTab={tab} setTab={setTab} />

      <main style={styles.mainContent}>
        {tab === 'dashboard' ? (
          loadingAccount ? (
            <LoadingSpinner />
          ) : (
            <div style={styles.dashboardGrid}>
              <div style={styles.leftColumn}>
                <AccountCard
                  account={account}
                  onAccountCreated={() => loadAccountData()}
                  onRefresh={() => loadAccountData(true)}
                  refreshing={refreshing}
                />
                
                {account && (
                  <div style={styles.formContainer} className="animate-slide-up">
                    <TransactionForm
                      account={account}
                      onTransactionSuccess={() => loadAccountData(true)}
                    />
                  </div>
                )}
              </div>
              
              {account && (
                <div style={styles.rightColumn}>
                  <BalanceChart
                    transactions={transactions}
                    currentAccountId={account.id}
                    currentBalance={account.balance}
                  />
                  <div style={{ height: '30px' }} />
                  <TransactionList
                    transactions={transactions}
                    currentAccountId={account.id}
                  />
                </div>
              )}
            </div>
          )
        ) : (
          <AuditLogs />
        )}
      </main>

      <footer style={styles.footer}>
        <p>© 2026 Aether Bank. Sistema simulado de alto rendimiento con aislamiento ACID.</p>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles: Record<string, React.CSSProperties> = {
  centerPage: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    width: '100%',
    gap: '16px',
  },
  loadingText: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    fontWeight: 500,
    letterSpacing: '0.05em',
  },
  appContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    padding: '0 20px',
    maxWidth: '1240px',
    margin: '0 auto',
    width: '100%',
  },
  mainContent: {
    flex: 1,
    padding: '10px 0 40px',
  },
  dashboardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '30px',
    alignItems: 'start',
    width: '100%',
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
  },
  formContainer: {
    width: '100%',
  },
  footer: {
    padding: '30px 0',
    textAlign: 'center',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    borderTop: '1px solid var(--border-color)',
    marginTop: 'auto',
  },
};
