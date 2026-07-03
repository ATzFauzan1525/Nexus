import { useState, useEffect, useRef } from 'react';

export function StatusBadge({ status }) {
  const classes = {
    Diterima: 'badge-diterima',
    Didisposisi: 'badge-didisposisi',
    Diproses: 'badge-diproses',
    Selesai: 'badge-selesai',
  };
  return <span className={classes[status] || 'badge-diterima'}>{status}</span>;
}

export function LoadingSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-4 bg-neutral-200 rounded animate-pulse flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="text-center py-12">
      {icon && <div className="text-neutral-400 mb-4 flex justify-center">{icon}</div>}
      <h3 className="text-ds-h3 mb-1">{title}</h3>
      <p className="text-ds-body" style={{ color: '#94A3B8' }}>{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Toast({ message, type = 'success', onClose }) {
  const colors = {
    success: 'toast-success',
    error: 'toast-error',
    info: 'bg-blue-50 border-l-4 border-info text-blue-800',
  };
  return (
    <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded shadow-lg ${colors[type]}`} style={{ animation: 'highlight-fade 3s ease-out forwards' }}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{message}</span>
        <button onClick={onClose} className="ml-4 text-current opacity-70 hover:opacity-100 text-lg leading-none">×</button>
      </div>
    </div>
  );
}

export function Modal({ isOpen, onClose, title, children, footer }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={onClose} />
      <div className="relative bg-white w-full mx-4 max-h-[90vh] overflow-y-auto" style={{ borderRadius: '10px', padding: '24px', maxWidth: '560px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
        <div className="flex items-center justify-between mb-5 pb-4" style={{ borderBottom: '1px solid #E2E8F0' }}>
          <h2 className="text-ds-h4">{title}</h2>
          <button onClick={onClose} className="hover:opacity-70 transition-opacity" style={{ color: '#475569', fontSize: '20px', lineHeight: 1 }}>×</button>
        </div>
        <div>{children}</div>
        {footer && (
          <div className="mt-5 pt-4 flex justify-end gap-3" style={{ borderTop: '1px solid #E2E8F0' }}>{footer}</div>
        )}
      </div>
    </div>
  );
}

export function RealtimeHighlight({ active, children }) {
  const [highlight, setHighlight] = useState(false);
  const prevActive = useRef(active);
  useEffect(() => {
    if (active && !prevActive.current) {
      setHighlight(true);
      const timer = setTimeout(() => setHighlight(false), 2000);
      prevActive.current = active;
      return () => clearTimeout(timer);
    }
    prevActive.current = active;
  }, [active]);
  return <div className={highlight ? 'row-highlight' : ''}>{children}</div>;
}
