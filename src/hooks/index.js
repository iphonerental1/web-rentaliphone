/**
 * CUSTOM HOOKS — utilitas React yang dipakai lintas halaman.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * useDebounce — menunda nilai agar pencarian tidak memicu request berlebihan.
 */
export const useDebounce = (value, delay = 400) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
};

/**
 * useAsync — membungkus pemanggilan async dengan state loading/error/data.
 * @param {Function} asyncFn
 * @param {Array} deps
 */
export const useAsync = (asyncFn, deps = [], options = {}) => {
  const { immediate = true, initialData = null } = options;
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const res = await asyncFn(...args);
      if (mountedRef.current) setData(res?.data ?? res);
      return res;
    } catch (err) {
      if (mountedRef.current) setError(err);
      throw err;
    } finally {
      if (mountedRef.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (immediate) {
      execute().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, execute, setData };
};

/**
 * useLocalStorage — state yang disinkronkan ke localStorage.
 */
export const useLocalStorage = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  }, [key, value]);

  return [value, setValue];
};

/**
 * useMediaQuery — deteksi breakpoint responsif.
 */
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
};

/**
 * usePagination — kelola state paginasi klien.
 */
export const usePagination = (items = [], pageSize = 10) => {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  return {
    page,
    setPage,
    totalPages,
    paginated,
    totalItems: items.length,
    pageSize,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};

/**
 * useCountdown — hitung mundur untuk grace period pembayaran.
 * @param {Date|string} deadline
 */
export const useCountdown = (deadline) => {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!deadline) return undefined;
    const target = new Date(deadline).getTime();

    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      setRemaining(diff);
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [deadline]);

  const hours = Math.floor(remaining / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  return {
    remaining,
    isExpired: remaining <= 0,
    label: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
    hours,
    minutes,
    seconds,
  };
};

/**
 * useDisclosure — state buka/tutup untuk modal, drawer, dropdown.
 */
export const useDisclosure = (initialOpen = false) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);
  return { isOpen, open, close, toggle };
};

/**
 * useDocumentTitle — set judul dokumen per halaman.
 */
export const useDocumentTitle = (title) => {
  useEffect(() => {
    const base = 'iRent — Sewa iPhone Profesional';
    document.title = title ? `${title} | iRent` : base;
    return () => {
      document.title = base;
    };
  }, [title]);
};