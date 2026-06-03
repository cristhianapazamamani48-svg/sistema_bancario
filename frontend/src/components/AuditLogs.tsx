import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import { RefreshCw, Search, ShieldAlert, Eye, Terminal } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  ip_address: string | null;
  details: any;
  created_at: string;
  user?: {
    email: string;
    role: string;
  } | null;
}

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      const data = await ApiService.audit.getLogs();
      setLogs(data);
    } catch (err: any) {
      setError(err.message || 'Error al obtener los logs de auditoría');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  const filteredLogs = logs.filter((log) => {
    const searchLower = searchTerm.toLowerCase();
    const actionMatch = log.action.toLowerCase().includes(searchLower);
    const emailMatch = log.user?.email.toLowerCase().includes(searchLower) || false;
    const ipMatch = log.ip_address?.toLowerCase().includes(searchLower) || false;
    return actionMatch || emailMatch || ipMatch;
  });

  return (
    <div style={styles.container} className="glass-panel animate-fade-in">
      <div style={styles.header}>
        <div style={styles.titleGroup}>
          <Terminal size={22} style={{ color: 'var(--danger)' }} />
          <h2 style={styles.title}>Consola de Auditoría de Mutaciones</h2>
        </div>

        <div style={styles.actionGroup}>
          <div style={styles.searchWrapper}>
            <Search size={16} style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar por acción, correo o IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glass-input"
              style={styles.searchInput}
            />
          </div>

          <button
            onClick={() => fetchLogs(true)}
            className="btn-secondary"
            style={styles.refreshBtn}
            disabled={refreshing}
          >
            <RefreshCw size={16} style={{
              animation: refreshing ? 'spin-slow 1s linear infinite' : 'none'
            }} />
          </button>
        </div>
      </div>

      {error && (
        <div style={styles.errorContainer} className="animate-slide-up">
          <ShieldAlert size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : filteredLogs.length === 0 ? (
        <div style={styles.emptyContainer}>
          <span>No se encontraron registros de auditoría</span>
        </div>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.theadRow}>
                <th style={styles.th}>Fecha y Hora</th>
                <th style={styles.th}>Usuario</th>
                <th style={styles.th}>Acción Mutada</th>
                <th style={styles.th}>IP Origen</th>
                <th style={styles.th}>Detalles</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} style={styles.tbodyRow} className="animate-slide-up">
                  <td style={styles.td}>{formatDate(log.created_at)}</td>
                  <td style={styles.td}>
                    {log.user ? (
                      <div style={styles.userBadge}>
                        <span style={styles.userEmail}>{log.user.email}</span>
                        <span style={styles.userRoleBadge}>{log.user.role}</span>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Anónimo</span>
                    )}
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.actionBadge,
                      backgroundColor: log.action.startsWith('POST') ? 'rgba(99, 102, 241, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: log.action.startsWith('POST') ? 'var(--primary)' : 'var(--warning)',
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={styles.td}>{log.ip_address || 'unknown'}</td>
                  <td style={styles.td}>
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="btn-secondary"
                      style={styles.viewBtn}
                    >
                      <Eye size={14} />
                      <span>Ver Payload</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Details Modal */}
      {selectedLog && (
        <div style={styles.modalOverlay} onClick={() => setSelectedLog(null)} className="animate-fade-in">
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()} className="glass-panel animate-slide-up">
            <h3 style={styles.modalTitle}>Payload de la Transacción</h3>
            <p style={styles.modalSubtitle}>ID del Registro: {selectedLog.id}</p>
            
            <div style={styles.jsonWrapper}>
              <pre style={styles.json}>
                {JSON.stringify(selectedLog.details, null, 2)}
              </pre>
            </div>

            <button
              onClick={() => setSelectedLog(null)}
              className="btn-primary"
              style={styles.closeBtn}
            >
              Cerrar Detalles
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '30px',
    width: '100%',
    maxWidth: '1200px',
    margin: '20px auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.25rem',
    fontWeight: 700,
  },
  actionGroup: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  searchWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    color: 'var(--text-muted)',
  },
  searchInput: {
    paddingLeft: '38px',
    width: '260px',
    fontSize: '0.85rem',
    height: '38px',
  },
  refreshBtn: {
    padding: '10px',
    height: '38px',
    width: '38px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    background: 'var(--danger-glow)',
    color: 'var(--danger)',
    border: '1px solid rgba(244, 63, 94, 0.15)',
    borderRadius: 'var(--radius-md)',
    marginBottom: '20px',
    fontSize: '0.85rem',
  },
  emptyContainer: {
    textAlign: 'center',
    padding: '40px',
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
    fontWeight: 500,
  },
  tableWrapper: {
    overflowX: 'auto',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '0.85rem',
  },
  theadRow: {
    background: 'rgba(255, 255, 255, 0.02)',
    borderBottom: '1px solid var(--border-color)',
  },
  th: {
    padding: '12px 16px',
    fontWeight: 600,
    color: 'var(--text-secondary)',
  },
  tbodyRow: {
    borderBottom: '1px solid var(--border-color)',
    transition: 'background-color var(--transition-fast)',
    backgroundColor: 'rgba(255, 255, 255, 0.005)',
  },
  td: {
    padding: '14px 16px',
    verticalAlign: 'middle',
  },
  userBadge: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  userEmail: {
    fontWeight: 500,
    color: 'var(--text-primary)',
  },
  userRoleBadge: {
    fontSize: '0.65rem',
    fontWeight: 700,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
  },
  actionBadge: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '4px',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  viewBtn: {
    padding: '6px 12px',
    fontSize: '0.75rem',
    gap: '6px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modalContent: {
    width: '100%',
    maxWidth: '600px',
    padding: '30px',
    background: 'rgba(17, 25, 40, 0.95)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
  },
  modalTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.25rem',
    fontWeight: 700,
    marginBottom: '4px',
  },
  modalSubtitle: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginBottom: '20px',
  },
  jsonWrapper: {
    background: 'rgba(0, 0, 0, 0.4)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: '16px',
    maxHeight: '300px',
    overflowY: 'auto',
    marginBottom: '20px',
  },
  json: {
    fontFamily: 'Courier, monospace',
    fontSize: '0.8rem',
    color: '#34d399',
    whiteSpace: 'pre-wrap',
  },
  closeBtn: {
    width: '100%',
    height: '42px',
  },
};
