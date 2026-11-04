/**
 * UI KIT — komponen dasar reusable (PRD Section 10.1 Design System).
 * Semua styling mengikuti design token: brand #0071E3, dark #1D1D1F, neutral #F5F5F7.
 */

import React from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, Inbox, Loader2, Search } from 'lucide-react';

// ─────────────────────────────────────────────────────
// TONE MAP
// ─────────────────────────────────────────────────────
export const TONE_CLASSES = {
  neutral: 'bg-[#F5F5F7] text-[#1D1D1F] border-gray-200 dark:bg-[#3a3a3c] dark:text-[#f5f5f7] dark:border-[#48484a]',
  info: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
  warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
  danger: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30',
  brand: 'bg-[#E8F2FD] text-[#0071E3] border-blue-200 dark:bg-[#0071E3]/20 dark:text-[#5ac8fa] dark:border-[#0071E3]/40',
};

export const toneClass = (tone) => TONE_CLASSES[tone] || TONE_CLASSES.neutral;

// ─────────────────────────────────────────────────────
// PAGE HEADER
// ─────────────────────────────────────────────────────
export const PageHeader = ({ title, subtitle, actions, breadcrumb }) => (
  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
    <div>
      {breadcrumb && <p className="text-xs text-gray-500 mb-1">{breadcrumb}</p>}
      <h1 className="text-2xl sm:text-3xl font-semibold text-[#1D1D1F] dark:text-[#f5f5f7] tracking-tight">{title}</h1>
      {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
  </div>
);

export const SectionTitle = ({ children, subtitle, actions }) => (
  <div className="flex items-end justify-between gap-3 mb-4">
    <div>
      <h2 className="text-lg font-semibold text-[#1D1D1F] dark:text-[#f5f5f7]">{children}</h2>
      {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
    {actions}
  </div>
);

// ─────────────────────────────────────────────────────
// CARD
// ─────────────────────────────────────────────────────
export const Card = ({ children, className = '', padded = true, hover = false }) => (
  <div
    className={`bg-white dark:bg-[#1d1d1f] rounded-2xl border border-gray-100 dark:border-[#3a3a3c] ${
      padded ? 'p-5' : ''
    } ${hover ? 'hover:shadow-md transition-shadow' : 'shadow-sm'} ${className}`}
  >
    {children}
  </div>
);

export const StatCard = ({ label, value, hint, icon: Icon, tone = 'brand', trend }) => (
  <Card className="flex items-start justify-between gap-3">
    <div className="min-w-0">
      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</p>
      <p className="text-xl sm:text-2xl font-bold text-[#1D1D1F] dark:text-[#f5f5f7] mt-1 truncate">{value}</p>
      {hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
      {trend && (
        <p className={`text-[11px] font-semibold mt-1 ${trend.positive ? 'text-emerald-600' : 'text-rose-600'}`}>
          {trend.positive ? '▲' : '▼'} {trend.label}
        </p>
      )}
    </div>
    {Icon && (
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${toneClass(tone)}`}>
        <Icon size={18} />
      </div>
    )}
  </Card>
);

export const InfoRow = ({ label, value, strong = false, valueClass = '' }) => (
  <div className="flex items-start justify-between gap-4 py-2">
    <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">{label}</span>
    <span
      className={`text-xs text-right text-[#1D1D1F] dark:text-[#f5f5f7] ${strong ? 'font-semibold' : ''} ${valueClass}`}
    >
      {value ?? '-'}
    </span>
  </div>
);

// ─────────────────────────────────────────────────────
// BADGE
// ─────────────────────────────────────────────────────
export const Pill = ({ children, tone = 'neutral', className = '', size = 'sm' }) => (
  <span
    className={`inline-flex items-center rounded-full border font-semibold whitespace-nowrap ${toneClass(tone)} ${
      size === 'xs' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]'
    } ${className}`}
  >
    {children}
  </span>
);

// ─────────────────────────────────────────────────────
// BUTTONS (tambahan untuk variant kecil/link)
// ─────────────────────────────────────────────────────
export const IconButton = ({ children, label, className = '', ...props }) => (
  <button
    type="button"
    aria-label={label}
    className={`w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-[#F5F5F7] dark:hover:bg-[#3a3a3c] hover:text-[#1D1D1F] dark:hover:text-white transition-colors ${className}`}
    {...props}
  >
    {children}
  </button>
);

// ─────────────────────────────────────────────────────
// INPUTS
// ─────────────────────────────────────────────────────
const fieldBase =
  'w-full rounded-xl border border-gray-200 dark:border-[#48484a] dark:bg-[#2d2d2f] bg-white px-4 py-2 text-sm text-[#1D1D1F] dark:text-[#f5f5f7] placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/15 transition disabled:bg-[#F5F5F7] dark:disabled:bg-[#242426] disabled:text-gray-400';

export const Field = ({ label, error, hint, required, children, className = '' }) => (
  <div className={className}>
    {label && (
      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
    )}
    {children}
    {error && <p className="text-[11px] text-rose-600 mt-1">{error}</p>}
    {!error && hint && <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">{hint}</p>}
  </div>
);

export const Input = React.forwardRef(({ error, className = '', ...props }, ref) => (
  <input
    ref={ref}
    className={`${fieldBase} ${error ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : ''} ${className}`}
    {...props}
  />
));
Input.displayName = 'Input';

export const TextArea = React.forwardRef(({ error, rows = 3, className = '', ...props }, ref) => (
  <textarea
    ref={ref}
    rows={rows}
    className={`${fieldBase} resize-none ${error ? 'border-rose-300' : ''} ${className}`}
    {...props}
  />
));
TextArea.displayName = 'TextArea';

export const Select = React.forwardRef(({ error, children, className = '', ...props }, ref) => (
  <select
    ref={ref}
    className={`${fieldBase} cursor-pointer appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 stroke=%22%239ca3af%22 stroke-width=%222%22 viewBox=%220 0 24 24%22><path d=%22M6 9l6 6 6-6%22/></svg>')] bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-10 ${
      error ? 'border-rose-300' : ''
    } ${className}`}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = 'Select';

export const Checkbox = ({ label, description, className = '', ...props }) => (
  <label className={`flex items-start gap-3 cursor-pointer select-none ${className}`}>
    <input
      type="checkbox"
      className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#0071E3] focus:ring-[#0071E3] cursor-pointer"
      {...props}
    />
    <span className="text-xs text-[#1D1D1F] dark:text-[#f5f5f7] leading-snug">
      {label}
      {description && <span className="block text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{description}</span>}
    </span>
  </label>
);

export const SearchInput = ({ value, onChange, placeholder = 'Cari...', className = '' }) => (
  <div className={`relative ${className}`}>
    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`${fieldBase} pl-10`}
    />
  </div>
);

// ─────────────────────────────────────────────────────
// FEEDBACK STATES
// ─────────────────────────────────────────────────────
export const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-100 dark:bg-[#3a3a3c] rounded-xl ${className}`} />
);

export const SkeletonCard = () => (
  <Card className="space-y-3">
    <Skeleton className="h-40 w-full" />
    <Skeleton className="h-4 w-2/3" />
    <Skeleton className="h-3 w-1/3" />
  </Card>
);

export const SkeletonTable = ({ rows = 5, cols = 4 }) => (
  <div className="space-y-2">
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
        {Array.from({ length: cols }).map((__, c) => (
          <Skeleton key={c} className="h-9" />
        ))}
      </div>
    ))}
  </div>
);

export const Spinner = ({ size = 18, className = '' }) => (
  <Loader2 size={size} className={`animate-spin ${className}`} />
);

export const LoadingBlock = ({ label = 'Memuat data...' }) => (
  <div className="flex flex-col items-center justify-center py-14 gap-3">
    <Spinner size={26} className="text-[#0071E3]" />
    <p className="text-xs text-gray-500">{label}</p>
  </div>
);

export const EmptyState = ({ title = 'Belum ada data', description, icon: Icon = Inbox, action }) => (
  <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
    <div className="w-14 h-14 rounded-2xl bg-[#F5F5F7] dark:bg-[#3a3a3c] flex items-center justify-center mb-4">
      <Icon size={24} className="text-gray-400" />
    </div>
    <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-[#f5f5f7]">{title}</h3>
    {description && <p className="text-xs text-gray-500 mt-1 max-w-sm">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export const ErrorState = ({ message = 'Terjadi kesalahan', onRetry }) => (
  <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
    <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center mb-4">
      <X size={24} className="text-rose-500" />
    </div>
    <h3 className="text-sm font-semibold text-[#1D1D1F]">Gagal memuat</h3>
    <p className="text-xs text-gray-500 mt-1 max-w-sm">{message}</p>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 text-xs font-semibold text-[#0071E3] hover:underline"
      >
        Coba lagi
      </button>
    )}
  </div>
);

export const Alert = ({ tone = 'info', title, children, className = '' }) => (
  <div className={`rounded-2xl border p-4 ${toneClass(tone)} ${className}`}>
    {title && <p className="text-xs font-bold mb-1">{title}</p>}
    <div className="text-xs leading-relaxed">{children}</div>
  </div>
);

// ─────────────────────────────────────────────────────
// PROGRESS
// ─────────────────────────────────────────────────────
export const ProgressBar = ({ value = 0, tone = 'brand', showLabel = false }) => {
  const percent = Math.max(0, Math.min(100, value));
  const colors = {
    brand: 'bg-[#0071E3]',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
  };
  return (
    <div>
      <div className="h-2 w-full bg-[#F5F5F7] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${colors[tone] || colors.brand}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      {showLabel && <p className="text-[11px] text-gray-500 mt-1">{percent.toFixed(0)}%</p>}
    </div>
  );
};

// ─────────────────────────────────────────────────────
// MODAL (Modern Apple Dialog: Always Visible, Pinned Header, Internal Scroll, Full Backdrop Blur Portal)
// ─────────────────────────────────────────────────────
export const Modal = ({ isOpen, onClose, title, subtitle, children, footer, size = 'md' }) => {
  // Lock body scroll saat modal aktif agar background tidak bergerak
  React.useEffect(() => {
    if (!isOpen || typeof document === 'undefined') return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  // Tutup dengan tombol Escape
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Ukuran modal yang proporsional dan tidak memakan seluruh layar
  const sizes = {
    sm: 'max-w-sm sm:max-w-md',
    md: 'max-w-md sm:max-w-lg',
    lg: 'max-w-lg sm:max-w-xl',
    xl: 'max-w-xl sm:max-w-2xl',
  };

  const modalNode = (
    <div
      className="fixed inset-0 z-[9999] flex items-start sm:items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-md overflow-y-auto animate-[fadeIn_0.15s_ease-out]"
      onClick={onClose}
      aria-hidden="true"
    >
      {/* Dialog card: Selalu terpusat, tidak pernah meluap di atas layar (my-auto), tinggi dibatasi */}
      <div
        className={`relative my-auto bg-white dark:bg-[#1d1d1f] rounded-2xl sm:rounded-3xl w-full ${sizes[size] || sizes.md} flex flex-col shadow-2xl border border-gray-100 dark:border-[#3a3a3c] animate-[popIn_0.18s_ease-out] z-10 overflow-hidden`}
        style={{ maxHeight: 'min(86vh, 740px)' }}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Tetap (Sticky Top) - Tombol Silang selalu terlihat dan kontras */}
        {(title || onClose) && (
          <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-gray-100 dark:border-[#3a3a3c] shrink-0 bg-white dark:bg-[#1d1d1f] sticky top-0 z-20">
            <div className="min-w-0 pr-2">
              {title && (
                <h3 className="text-base font-bold text-[#1D1D1F] dark:text-[#f5f5f7] tracking-tight truncate">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                  {subtitle}
                </p>
              )}
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                title="Tutup (Esc)"
                aria-label="Tutup modal"
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-[#1D1D1F] bg-gray-100 hover:bg-gray-200 dark:bg-[#2d2d2f] dark:hover:bg-[#3a3a3c] dark:text-gray-300 dark:hover:text-white transition shrink-0 cursor-pointer shadow-sm active:scale-95"
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}

        {/* Isi Modal Scrollable (Internal Scroll) */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 min-h-0 text-[#1D1D1F] dark:text-[#f5f5f7] overscroll-contain">
          {children}
        </div>

        {/* Footer Tetap (Sticky Bottom) */}
        {footer && (
          <div className="px-5 py-3 border-t border-gray-100 dark:border-[#3a3a3c] flex flex-wrap items-center justify-end gap-2 shrink-0 bg-[#FBFBFD] dark:bg-[#19191a] sticky bottom-0 z-20">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : modalNode;
};

// ─────────────────────────────────────────────────────
// TABS
// ─────────────────────────────────────────────────────
export const Tabs = ({ tabs = [], active, onChange, className = '' }) => (
  <div className={`flex gap-1.5 overflow-x-auto pb-1 ${className}`}>
    {tabs.map((tab) => {
      const isActive = active === tab.value;
      return (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            isActive
              ? 'bg-[#0071E3] text-white'
              : 'bg-[#F5F5F7] text-gray-600 hover:bg-gray-200 dark:bg-[#2d2d2f] dark:text-gray-300 dark:hover:bg-[#3a3a3c]'
          }`}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={`ml-1.5 ${isActive ? 'text-white/80' : 'text-gray-400'}`}>({tab.count})</span>
          )}
        </button>
      );
    })}
  </div>
);

// ─────────────────────────────────────────────────────
// TABLE
// ─────────────────────────────────────────────────────
export const Table = ({ columns = [], children, className = '' }) => (
  <div className={`overflow-x-auto ${className}`}>
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-gray-100 dark:border-[#3a3a3c]">
          {columns.map((col) => (
            <th
              key={col.key}
              className={`py-3 px-3 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap ${
                col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''
              }`}
            >
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50 dark:divide-[#3a3a3c]">{children}</tbody>
    </table>
  </div>
);

export const Td = ({ children, className = '', align = 'left' }) => (
  <td
    className={`py-3 px-3 text-xs text-[#1D1D1F] dark:text-[#f5f5f7] ${
      align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : ''
    } ${className}`}
  >
    {children}
  </td>
);

export const Tr = ({ children, className = '', onClick }) => (
  <tr
    onClick={onClick}
    className={`${onClick ? 'cursor-pointer hover:bg-[#F9F9FB]' : ''} transition-colors ${className}`}
  >
    {children}
  </tr>
);

// ─────────────────────────────────────────────────────
// PAGINATION
// ─────────────────────────────────────────────────────
export const Pagination = ({ page, totalPages, onChange, totalItems, pageSize }) => {
  if (totalPages <= 1) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-100 mt-4">
      <p className="text-[11px] text-gray-500">
        Menampilkan {from}–{to} dari {totalItems} data
      </p>
      <div className="flex items-center gap-2">
        <IconButton label="Halaman sebelumnya" onClick={() => onChange(Math.max(1, page - 1))} disabled={page === 1}>
          <ChevronLeft size={16} />
        </IconButton>
        <span className="text-xs font-semibold text-[#1D1D1F] dark:text-[#f5f5f7] px-2">
          {page} / {totalPages}
        </span>
        <IconButton
          label="Halaman berikutnya"
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
        >
          <ChevronRight size={16} />
        </IconButton>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────
// MISC
// ─────────────────────────────────────────────────────
export const Avatar = ({ name = '?', size = 36, className = '' }) => {
  const initials = name
    .trim()
    .split(' ')
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('');
  return (
    <div
      className={`rounded-full bg-[#E8F2FD] text-[#0071E3] font-bold flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials || '?'}
    </div>
  );
};

export const Divider = ({ label, className = '' }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <div className="h-px bg-gray-100 flex-1" />
    {label && <span className="text-[11px] text-gray-400 font-medium">{label}</span>}
    <div className="h-px bg-gray-100 flex-1" />
  </div>
);

export const CopyableText = ({ value, className = '' }) => {
  const [copied, setCopied] = React.useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(String(value));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      type="button"
      onClick={copy}
      title="Klik untuk menyalin"
      className={`font-mono text-xs hover:text-[#0071E3] transition-colors ${className}`}
    >
      {value} {copied && <span className="text-emerald-600">✓</span>}
    </button>
  );
};
