import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, LogOut, LayoutDashboard, Terminal, Landmark } from 'lucide-react';

interface NavbarProps {
  currentTab: 'dashboard' | 'audit';
  setTab: (tab: 'dashboard' | 'audit') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setTab }) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <nav style={styles.nav} className="glass-panel animate-fade-in">
      <div style={styles.brand}>
        <Landmark size={24} style={styles.brandIcon} />
        <span style={styles.brandName}>
          AETHER <span className="text-gradient-primary">BANK</span>
        </span>
      </div>

      <div style={styles.menu}>
        <button
          onClick={() => setTab('dashboard')}
          className="btn-secondary"
          style={{
            ...styles.menuItem,
            ...(currentTab === 'dashboard' ? styles.activeMenuItem : {}),
          }}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </button>

        {user.role === 'ADMIN' && (
          <button
            onClick={() => setTab('audit')}
            className="btn-secondary"
            style={{
              ...styles.menuItem,
              ...(currentTab === 'audit' ? styles.activeMenuItem : {}),
            }}
          >
            <Terminal size={18} />
            <span>Auditoría</span>
          </button>
        )}
      </div>

      <div style={styles.userProfile}>
        <div style={styles.userInfo}>
          <span style={styles.userEmail}>{user.email}</span>
          <span style={{
            ...styles.userRole,
            backgroundColor: user.role === 'ADMIN' ? 'var(--danger-glow)' : 'var(--primary-glow)',
            color: user.role === 'ADMIN' ? 'var(--danger)' : 'var(--primary)',
            border: `1px solid ${user.role === 'ADMIN' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(99, 102, 241, 0.2)'}`,
          }}>
            {user.role === 'ADMIN' ? <Shield size={10} style={{ marginRight: 4 }} /> : null}
            {user.role}
          </span>
        </div>

        <button onClick={logout} className="btn-secondary" style={styles.logoutBtn} title="Cerrar sesión">
          <LogOut size={18} />
        </button>
      </div>
    </nav>
  );
};

const styles: Record<string, React.CSSProperties> = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    margin: '20px auto',
    width: '100%',
    maxWidth: '1200px',
    borderRadius: 'var(--radius-lg)',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  brandIcon: {
    color: 'var(--primary)',
    filter: 'drop-shadow(0 0 8px var(--primary))',
  },
  brandName: {
    fontFamily: 'var(--font-display)',
    fontWeight: 800,
    fontSize: '1.25rem',
    letterSpacing: '0.05em',
  },
  menu: {
    display: 'flex',
    gap: '12px',
  },
  menuItem: {
    padding: '8px 16px',
    fontSize: '0.9rem',
    gap: '8px',
    border: '1px solid transparent',
  },
  activeMenuItem: {
    background: 'var(--primary-glow)',
    borderColor: 'rgba(99, 102, 241, 0.3)',
    color: 'var(--primary)',
  },
  userProfile: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  userEmail: {
    fontSize: '0.85rem',
    fontWeight: 500,
    color: 'var(--text-primary)',
  },
  userRole: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '0.7rem',
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: '20px',
    marginTop: '2px',
    textTransform: 'uppercase',
  },
  logoutBtn: {
    padding: '8px',
    borderRadius: 'var(--radius-md)',
  },
};
