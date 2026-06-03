import React from 'react';

export const LoadingSpinner: React.FC<{ size?: number }> = ({ size = 40 }) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      width: '100%',
    }}>
      <div style={{
        width: `${size}px`,
        height: `${size}px`,
        border: '3px solid rgba(255, 255, 255, 0.05)',
        borderTop: '3px solid var(--primary)',
        borderRadius: '50%',
        animation: 'spin-slow 1s linear infinite',
      }} />
    </div>
  );
};
