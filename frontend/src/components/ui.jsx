const iconPaths = {
  menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
  heart: <path d="m20.84 4.61-1.04-1.04a5.5 5.5 0 0 0-7.8 0L12 3.57l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 19.17l8.9-8.9a5.5 5.5 0 0 0-.06-5.66Z" />,
  heartFilled: <path fill="currentColor" stroke="currentColor" d="m20.84 4.61-1.04-1.04a5.5 5.5 0 0 0-7.8 0L12 3.57l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 19.17l8.9-8.9a5.5 5.5 0 0 0-.06-5.66Z" />,
  moon: <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3 6.6 6.6 0 0 0 21 12.8Z" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></>,
  home: <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z" />,
  user: <><circle cx="12" cy="7" r="4" /><path d="M5.5 21a6.5 6.5 0 0 1 13 0" /></>,
  login: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M21 19V5a2 2 0 0 0-2-2h-6" /></>,
  logout: <><path d="M14 8l4 4-4 4M18 12H3" /><path d="M21 19V5a2 2 0 0 0-2-2h-6" /></>,
  userPlus: <><circle cx="9" cy="7" r="4" /><path d="M2.5 21a6.5 6.5 0 0 1 13 0M19 8v6m-3-3h6" /></>,
  shield: <path d="M12 3 20 6v5c0 5-3.4 8.2-8 10-4.6-1.8-8-5-8-10V6Z" />,
  trash: <><path d="M4 7h16m-10 4v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  close: <><path d="m6 6 12 12M18 6 6 18" /></>,
  check: <path d="m5 12 4 4L19 6" />,
};

export function Icon({ name, size = 20, className = '' }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {iconPaths[name] || null}
    </svg>
  );
}

export function Spinner({ label = 'Loading', className = '' }) {
  return <span className={`inline-block h-5 w-5 animate-spin rounded-full border-2 border-current border-r-transparent ${className}`} role="status" aria-label={label} />;
}

export function Alert({ children, severity = 'info', className = '' }) {
  const colors = {
    info: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200',
    error: 'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200',
    warning: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200',
  };
  return <div role={severity === 'error' ? 'alert' : undefined} className={`rounded-xl border px-4 py-3 text-sm ${colors[severity]} ${className}`}>{children}</div>;
}

export function Button({ children, variant = 'primary', className = '', as: Component = 'button', ...props }) {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300 dark:bg-blue-500 dark:hover:bg-blue-400',
    secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
    outline: 'border border-slate-300 bg-transparent text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300',
    dangerOutline: 'border border-red-300 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/40',
    telegram: 'bg-sky-500 text-white hover:bg-sky-600 disabled:bg-sky-300 dark:bg-sky-500 dark:hover:bg-sky-400',
    ghost: 'text-slate-700 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800',
  };
  return <Component className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`} {...props}>{children}</Component>;
}

export function Field({ label, error, className = '', ...props }) {
  return (
    <label className={`block text-sm font-medium text-slate-700 dark:text-slate-200 ${className}`}>
      <span className="mb-1.5 block">{label}</span>
      <input className={`block w-full rounded-lg border bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-white ${error ? 'border-red-500' : 'border-slate-300'}`} {...props} />
      {error ? <span className="mt-1 block text-xs text-red-600 dark:text-red-400">{error}</span> : null}
    </label>
  );
}

export function Card({ children, className = '' }) {
  return <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 ${className}`}>{children}</div>;
}

export function Modal({ open, onClose, title, children, actions }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="modal-title" className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 id="modal-title" className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
          <button type="button" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={onClose} aria-label="Close dialog"><Icon name="close" /></button>
        </div>
        {children}
        {actions ? <div className="mt-6 flex justify-end gap-3">{actions}</div> : null}
      </section>
    </div>
  );
}
