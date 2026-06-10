import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface Transaction {
  id: string;
  from_account_id: string | null;
  to_account_id: string | null;
  amount: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED';
  created_at: string;
}

interface BalanceChartProps {
  transactions: Transaction[];
  currentAccountId: string;
  currentBalance: string;
}

export const BalanceChart: React.FC<BalanceChartProps> = ({
  transactions,
  currentAccountId,
  currentBalance,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    balance: number;
    date: string;
    index: number;
  } | null>(null);

  // Compute balance history chronologically
  const chartData = useMemo(() => {
    // Only completed transactions count
    const completedTx = transactions
      .filter((tx) => tx.status === 'COMPLETED')
      // Sort oldest first
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    let runningBalance = 0;
    const history = [{ balance: 0, date: 'Creación de cuenta' }];

    completedTx.forEach((tx) => {
      const amountVal = parseFloat(tx.amount) || 0;
      const isDeposit = tx.type === 'DEPOSIT';
      const isTransferToMe = tx.type === 'TRANSFER' && tx.to_account_id === currentAccountId;

      if (isDeposit || isTransferToMe) {
        runningBalance += amountVal;
      } else {
        // WITHDRAWAL or TRANSFER from me
        runningBalance -= amountVal;
      }

      history.push({
        balance: runningBalance,
        date: new Intl.DateTimeFormat('es-ES', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }).format(new Date(tx.created_at)),
      });
    });

    // Adjust the last point to match the current balance, just in case there are float precision issues
    const actualCurrentBalance = parseFloat(currentBalance) || 0;
    if (history.length > 1 && Math.abs(history[history.length - 1].balance - actualCurrentBalance) > 0.01) {
      history[history.length - 1].balance = actualCurrentBalance;
    }

    return history;
  }, [transactions, currentAccountId, currentBalance]);

  // Chart layout config
  const width = 500;
  const height = 180;
  const padding = 25;

  const points = useMemo(() => {
    if (chartData.length === 0) return [];

    const balances = chartData.map((d) => d.balance);
    const minBalance = Math.min(...balances, 0); // Include 0 as baseline
    const maxBalance = Math.max(...balances, 100); // Baseline max of 100

    const rangeY = maxBalance - minBalance;
    const chartHeight = height - padding * 2;
    const chartWidth = width - padding * 2;

    return chartData.map((data, idx) => {
      // X coordinate spaced evenly
      const x = padding + (idx / (chartData.length - 1 || 1)) * chartWidth;
      // Y coordinate scaled to max/min balance
      const relativeVal = rangeY === 0 ? 0.5 : (data.balance - minBalance) / rangeY;
      const y = height - padding - relativeVal * chartHeight;

      return {
        x,
        y,
        balance: data.balance,
        date: data.date,
      };
    });
  }, [chartData]);

  // Generate SVG path string
  const pathData = useMemo(() => {
    if (points.length < 2) return '';
    
    // Draw straight line path (sleek polygonal look fits the cyberpunk glass design)
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i].x} ${points[i].y}`;
    }
    return d;
  }, [points]);

  // Generate SVG closed area path string for gradient fill
  const areaData = useMemo(() => {
    if (points.length < 2) return '';
    const first = points[0];
    const last = points[points.length - 1];
    
    return `${pathData} L ${last.x} ${height - padding} L ${first.x} ${height - padding} Z`;
  }, [points, pathData]);

  // Compute some simple insights (trend, max balance, min balance)
  const insights = useMemo(() => {
    if (chartData.length <= 1) return { trend: 'neutral', percent: 0, delta: 0 };
    const firstVal = chartData[0].balance;
    const lastVal = chartData[chartData.length - 1].balance;
    const delta = lastVal - firstVal;
    const percent = firstVal === 0 ? 100 : (delta / Math.abs(firstVal)) * 100;
    
    return {
      trend: delta > 0 ? 'up' : delta < 0 ? 'down' : 'neutral',
      percent: Math.min(Math.abs(percent), 9999),
      delta,
    };
  }, [chartData]);

  return (
    <div style={styles.container} className="glass-panel animate-fade-in">
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>Historial de Balance</h3>
          <p style={styles.subtitle}>Evolución de tus fondos en tiempo real</p>
        </div>
        
        {insights.trend !== 'neutral' && (
          <div style={{
            ...styles.trendBadge,
            backgroundColor: insights.trend === 'up' ? 'var(--success-glow)' : 'var(--danger-glow)',
            color: insights.trend === 'up' ? 'var(--success)' : 'var(--danger)',
            borderColor: insights.trend === 'up' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
          }}>
            {insights.trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>
              {insights.trend === 'up' ? '+' : '-'}${Math.abs(insights.delta).toFixed(2)} ({insights.percent.toFixed(0)}%)
            </span>
          </div>
        )}
      </div>

      <div style={styles.chartWrapper}>
        {points.length < 2 ? (
          <div style={styles.placeholder}>
            <DollarSign size={24} style={{ color: 'var(--text-muted)' }} />
            <span style={styles.placeholderText}>Realiza operaciones para ver tu gráfico de tendencia</span>
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${width} ${height}`}
            style={styles.svg}
            onMouseLeave={() => setHoveredPoint(null)}
          >
            <defs>
              {/* Stroke Gradient */}
              <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#0ea5e9" />
              </linearGradient>

              {/* Fill Area Gradient */}
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.00" />
              </linearGradient>
            </defs>

            {/* Grid Line Baselines */}
            <line
              x1={padding}
              y1={padding}
              x2={width - padding}
              y2={padding}
              stroke="var(--border-color)"
              strokeDasharray="4 4"
            />
            <line
              x1={padding}
              y1={height / 2}
              x2={width - padding}
              y2={height / 2}
              stroke="var(--border-color)"
              strokeDasharray="4 4"
            />
            <line
              x1={padding}
              y1={height - padding}
              x2={width - padding}
              y2={height - padding}
              stroke="var(--border-color)"
            />

            {/* Filled Area */}
            <path d={areaData} fill="url(#areaGrad)" />

            {/* Gradient Stroke Line */}
            <path
              d={pathData}
              fill="none"
              stroke="url(#lineGrad)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Interactive Circles & Hover Hotspots */}
            {points.map((pt, idx) => (
              <g key={idx}>
                {/* Active Circle on Hover */}
                {hoveredPoint?.index === idx && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="6"
                    fill="var(--bg-main)"
                    stroke="var(--primary)"
                    strokeWidth="3"
                  />
                )}

                {/* Micro-dot for points */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="3.5"
                  fill="var(--text-primary)"
                  style={{ opacity: 0.7 }}
                />

                {/* Transparent Interactive Overlay */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="15"
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => {
                    setHoveredPoint({
                      x: pt.x,
                      y: pt.y,
                      balance: pt.balance,
                      date: pt.date,
                      index: idx,
                    });
                  }}
                />
              </g>
            ))}
          </svg>
        )}

        {/* Hover Tooltip Portal/Inline */}
        {hoveredPoint && (
          <div
            style={{
              ...styles.tooltip,
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100 - 35}%`,
            }}
            className="animate-fade-in"
          >
            <span style={styles.tooltipDate}>{hoveredPoint.date}</span>
            <span style={styles.tooltipBalance}>
              ${hoveredPoint.balance.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    position: 'relative',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.05rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  subtitle: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    marginTop: '2px',
  },
  trendBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: 600,
    border: '1px solid transparent',
  },
  chartWrapper: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  svg: {
    width: '100%',
    height: 'auto',
    overflow: 'visible',
  },
  placeholder: {
    height: '130px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    border: '1px dashed var(--border-color)',
    borderRadius: 'var(--radius-md)',
    background: 'rgba(255, 255, 255, 0.01)',
  },
  placeholderText: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    maxWidth: '220px',
    textAlign: 'center',
    lineHeight: '1.4',
  },
  tooltip: {
    position: 'absolute',
    transform: 'translate(-50%, -100%)',
    background: 'rgba(11, 15, 25, 0.95)',
    border: '1px solid var(--primary)',
    borderRadius: '8px',
    padding: '8px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    pointerEvents: 'none',
    boxShadow: 'var(--shadow-md), 0 0 15px rgba(99, 102, 241, 0.2)',
    zIndex: 10,
    whiteSpace: 'nowrap',
  },
  tooltipDate: {
    fontSize: '0.65rem',
    color: 'var(--text-secondary)',
  },
  tooltipBalance: {
    fontSize: '0.85rem',
    fontWeight: 800,
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-display)',
  },
};
