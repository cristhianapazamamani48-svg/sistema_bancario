import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Landmark, Mail, Lock, LogIn, UserPlus, AlertCircle } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(false);
  const { login, register } = useAuth();

  const validateForm = () => {
    if (!email || !password) {
      setError('Por favor complete todos los campos');
      return false;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    if (!isLogin && password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validateForm()) return;

    setLocalLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error inesperado');
    } finally {
      setLocalLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.card} className="glass-panel">
        <div style={styles.header}>
          <div style={styles.logoContainer}>
            <Landmark size={36} style={styles.logo} />
          </div>
          <h1 style={styles.title}>AETHER <span className="text-gradient-primary">BANK</span></h1>
          <p style={styles.subtitle}>Core Transaccional Bancario de Alta Fiabilidad</p>
        </div>

        {/* Tab Selection */}
        <div style={styles.tabs}>
          <button
            onClick={() => { setIsLogin(true); setError(null); }}
            style={{
              ...styles.tab,
              ...(isLogin ? styles.activeTab : {}),
            }}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(null); }}
            style={{
              ...styles.tab,
              ...(!isLogin ? styles.activeTab : {}),
            }}
          >
            Registrarse
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {error && (
            <div style={styles.errorContainer} className="animate-slide-up">
              <AlertCircle size={18} style={styles.errorIcon} />
              <span>{error}</span>
            </div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Correo Electrónico</label>
            <div style={styles.inputWrapper}>
              <Mail size={18} style={styles.inputIcon} />
              <input
                type="email"
                placeholder="ejemplo@banco.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input"
                style={styles.input}
                disabled={localLoading}
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Contraseña</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} style={styles.inputIcon} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input"
                style={styles.input}
                disabled={localLoading}
              />
            </div>
          </div>

          {!isLogin && (
            <div style={styles.inputGroup} className="animate-slide-up">
              <label style={styles.label}>Confirmar Contraseña</label>
              <div style={styles.inputWrapper}>
                <Lock size={18} style={styles.inputIcon} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="glass-input"
                  style={styles.input}
                  disabled={localLoading}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            style={styles.submitBtn}
            disabled={localLoading}
          >
            {localLoading ? (
              <div style={styles.spinner} />
            ) : isLogin ? (
              <>
                <LogIn size={18} />
                <span>Ingresar al Sistema</span>
              </>
            ) : (
              <>
                <UserPlus size={18} />
                <span>Crear Cuenta</span>
              </>
            )}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            {isLogin ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
            <button onClick={toggleMode} style={styles.toggleBtn}>
              {isLogin ? 'Crear una ahora' : 'Inicia sesión'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '80vh',
    width: '100%',
    padding: '20px',
  },
  card: {
    width: '100%',
    maxWidth: '450px',
    padding: '40px 32px',
    borderRadius: 'var(--radius-xl)',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  logoContainer: {
    width: '72px',
    height: '72px',
    borderRadius: 'var(--radius-lg)',
    background: 'var(--primary-glow)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '0 auto 16px',
    border: '1px solid rgba(99, 102, 241, 0.2)',
  },
  logo: {
    color: 'var(--primary)',
    filter: 'drop-shadow(0 0 10px var(--primary))',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '2rem',
    fontWeight: 800,
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.4,
  },
  tabs: {
    display: 'flex',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: '4px',
    marginBottom: '24px',
  },
  tab: {
    flex: 1,
    padding: '10px',
    borderRadius: 'calc(var(--radius-md) - 2px)',
    fontWeight: 600,
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    transition: 'all var(--transition-fast)',
  },
  activeTab: {
    background: 'rgba(255, 255, 255, 0.08)',
    color: 'var(--text-primary)',
    boxShadow: 'var(--shadow-sm)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  errorContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    backgroundColor: 'var(--danger-glow)',
    border: '1px solid rgba(244, 63, 94, 0.2)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--danger)',
    fontSize: '0.85rem',
    fontWeight: 500,
  },
  errorIcon: {
    flexShrink: 0,
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
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
    pointerEvents: 'none',
  },
  input: {
    paddingLeft: '48px',
  },
  submitBtn: {
    marginTop: '10px',
    width: '100%',
    height: '46px',
  },
  footer: {
    marginTop: '24px',
    textAlign: 'center',
  },
  footerText: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--primary)',
    fontWeight: 600,
    marginLeft: '6px',
    textDecoration: 'underline',
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
