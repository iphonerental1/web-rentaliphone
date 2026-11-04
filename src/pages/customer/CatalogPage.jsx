/**
 * CATALOG PAGE — grid produk dengan facet filter dinamis (PRD 10.2 #2).
 * Filter: pencarian, model, storage, warna, rentang harga, urutan.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, SearchX, ChevronLeft, ChevronRight, Pause, Play, Star } from 'lucide-react';
import { Button } from '../../components/common/Button';
import {
  Card,
  EmptyState,
  Pill,
  SearchInput,
  Select,
  SkeletonCard,
} from '../../components/ui';
import { catalogApi } from '../../api/catalogApi';
import { getAllModels, getColorOptions, getStorageOptions } from '../../data/catalog';
import { formatRupiah } from '../../utils/formatter';
import { onImageError, placeholderFor } from '../../utils/imageHelpers';
import { useDebounce, useDocumentTitle } from '../../hooks';
import { SORT_OPTIONS } from '../../constants';

export const CatalogPage = () => {
  useDocumentTitle('Katalog iPhone');
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [modelSlug, setModelSlug] = useState(searchParams.get('model') || '');
  const [storage, setStorage] = useState(searchParams.get('storage') || '');
  const [color, setColor] = useState(searchParams.get('color') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'popular');

  const debouncedSearch = useDebounce(search, 400);
  const models = getAllModels();
  const storageOptions = getStorageOptions();
  const colorOptions = getColorOptions();

  const activeFilterCount = [modelSlug, storage, color].filter(Boolean).length;

  // Slideshow foto iPhone di atas katalog — menggunakan foto produk asli dari katalog
  const [slideIndex, setSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Ambil 4 variant pertama untuk ditampilkan di slideshow
  const slides = useMemo(
    () =>
      variants.slice(0, 4).map((v) => ({
        image: v.primaryImage,
        title: v.modelName,
        subtitle: `${v.storageCapacity} · ${v.colorName} • Rp ${formatRupiah(v.dailyRate)}/hari`,
      })),
    [variants]
  );

  useEffect(() => {
    setLoading(true);
    catalogApi
      .list({ search: debouncedSearch, modelSlug, storage, color, sort, limit: 60 })
      .then((res) => setVariants(res.data))
      .catch(() => setVariants([]))
      .finally(() => setLoading(false));

    // Sinkronkan filter ke URL agar bisa di-share
    const params = {};
    if (debouncedSearch) params.q = debouncedSearch;
    if (modelSlug) params.model = modelSlug;
    if (storage) params.storage = storage;
    if (color) params.color = color;
    if (sort !== 'popular') params.sort = sort;
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, modelSlug, storage, color, sort]);

  // Auto-play slideshow — hanya jika ada slide
  useEffect(() => {
    if (!isPlaying || slides.length === 0) return;
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isPlaying, slides.length]);

  const resetFilters = () => {
    setSearch('');
    setModelSlug('');
    setStorage('');
    setColor('');
    setSort('popular');
  };

  const filterPanel = (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-bold text-[#1D1D1F] mb-2.5 uppercase tracking-wide">Model iPhone</p>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setModelSlug('')}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors ${
              !modelSlug ? 'bg-[#E8F2FD] text-[#0071E3] font-semibold' : 'text-gray-600 hover:bg-[#F5F5F7]'
            }`}
          >
            Semua Model
          </button>
          {models.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setModelSlug(m.slug)}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors ${
                modelSlug === m.slug
                  ? 'bg-[#E8F2FD] text-[#0071E3] font-semibold'
                  : 'text-gray-600 hover:bg-[#F5F5F7]'
              }`}
            >
              {m.modelName}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-bold text-[#1D1D1F] mb-2.5 uppercase tracking-wide">Kapasitas</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setStorage('')}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-colors ${
              !storage ? 'bg-[#0071E3] text-white' : 'bg-[#F5F5F7] text-gray-600 hover:bg-gray-200'
            }`}
          >
            Semua
          </button>
          {storageOptions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStorage(s)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-colors ${
                storage === s ? 'bg-[#0071E3] text-white' : 'bg-[#F5F5F7] text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-bold text-[#1D1D1F] mb-2.5 uppercase tracking-wide">Warna</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setColor('')}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-colors ${
              !color ? 'bg-[#0071E3] text-white' : 'bg-[#F5F5F7] text-gray-600 hover:bg-gray-200'
            }`}
          >
            Semua
          </button>
          {colorOptions.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-colors ${
                color === c ? 'bg-[#0071E3] text-white' : 'bg-[#F5F5F7] text-gray-600 hover:bg-gray-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <Button variant="secondary" className="w-full text-xs py-2.5" onClick={resetFilters}>
        Reset Semua Filter
      </Button>
    </div>
  );

  const cheapest = useMemo(
    () => (variants.length ? Math.min(...variants.map((v) => v.dailyRate)) : 0),
    [variants]
  );

  return (
    /* Menggunakan margin negatif yang optimal agar sangat rapat ke atas tetapi tetap aman */
    <div className="max-w-container mx-auto px-5 sm:px-6 -mt-20 sm:-mt-22 pb-8 sm:pb-12">
      {/* Header Halaman */}
      <div className="mb-3">
        <p className="text-[11px] text-gray-400 mb-0.5">Beranda / Katalog</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1D1D1F]">Katalog iPhone</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          {variants.length} varian tersedia{cheapest ? ` · mulai ${formatRupiah(cheapest)}/hari` : ''}
        </p>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-6">
        {/* Sidebar filter (desktop) */}
        <aside className="hidden lg:block">
          <Card className="sticky top-24">{filterPanel}</Card>
        </aside>

        <div>
          {/* Toolbar Search & Sort */}
          <Card className="mb-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <SearchInput
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari model, storage, atau warna..."
                className="flex-1"
              />
              <div className="flex gap-3">
                <Select value={sort} onChange={(e) => setSort(e.target.value)} className="w-full sm:w-48">
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
                <Button
                  variant="secondary"
                  className="lg:hidden text-xs px-4 flex items-center gap-2 shrink-0"
                  onClick={() => setShowFilters(true)}
                >
                  <SlidersHorizontal size={14} /> Filter
                  {activeFilterCount > 0 && <Pill tone="brand" size="xs">{activeFilterCount}</Pill>}
                </Button>
              </div>
            </div>

            {activeFilterCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                <span className="text-[11px] text-gray-400">Filter aktif:</span>
                {modelSlug && (
                  <button
                    type="button"
                    onClick={() => setModelSlug('')}
                    className="text-[11px] bg-[#E8F2FD] text-[#0071E3] px-2.5 py-1 rounded-full font-semibold flex items-center gap-1.5"
                  >
                    {models.find((m) => m.slug === modelSlug)?.modelName} <X size={11} />
                  </button>
                )}
                {storage && (
                  <button
                    type="button"
                    onClick={() => setStorage('')}
                    className="text-[11px] bg-[#E8F2FD] text-[#0071E3] px-2.5 py-1 rounded-full font-semibold flex items-center gap-1.5"
                  >
                    {storage} <X size={11} />
                  </button>
                )}
                {color && (
                  <button
                    type="button"
                    onClick={() => setColor('')}
                    className="text-[11px] bg-[#E8F2FD] text-[#0071E3] px-2.5 py-1 rounded-full font-semibold flex items-center gap-1.5"
                  >
                    {color} <X size={11} />
                  </button>
                )}
              </div>
            )}
          </Card>

          {/* Slideshow Foto iPhone — Menggunakan object-contain agar foto utuh tidak terpotong */}
          {slides.length > 0 && (
            <div className="mb-6 relative group">
              <div className="relative h-56 sm:h-64 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black shadow-lg">
                <img
                  src={slides[slideIndex].image}
                  alt={slides[slideIndex].title}
                  onError={(e) => {
                    e.currentTarget.src = placeholderFor(slides[slideIndex].title, 1200);
                  }}
                  className="absolute inset-0 w-full h-full object-contain p-4 transition-opacity duration-500 ease-in-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5 z-10 pointer-events-none">
                  <h2 className="text-xl sm:text-2xl font-bold text-white shadow-md">{slides[slideIndex].title}</h2>
                  <p className="text-xs sm:text-sm text-white/90 mt-0.5 shadow-sm">{slides[slideIndex].subtitle}</p>
                  <Button
                    variant="primary"
                    className="mt-3 text-xs px-4 py-2 self-start pointer-events-auto"
                    onClick={() => navigate(`/katalog?q=${slides[slideIndex].title.toLowerCase()}`)}
                  >
                    Lihat Unit
                  </Button>
                </div>
              </div>

              {/* Navigasi slideshow */}
              <div className="flex items-center justify-center gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setSlideIndex((prev) => (prev - 1 + slides.length) % slides.length)}
                  className="w-8 h-8 rounded-full bg-white text-[#1D1D1F] flex items-center justify-center shadow-sm hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="flex gap-1.5">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSlideIndex(i)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        i === slideIndex ? 'bg-[#0071E3]' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setSlideIndex((prev) => (prev + 1) % slides.length)}
                  className="w-8 h-8 rounded-full bg-white text-[#1D1D1F] flex items-center justify-center shadow-sm hover:bg-gray-100 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Toggle play/pause */}
              <button
                type="button"
                onClick={() => setIsPlaying((prev) => !prev)}
                className="text-xs text-gray-500 mt-2 hover:text-[#0071E3] flex items-center gap-1"
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                {isPlaying ? 'Auto-slide' : 'Hentikan'}
              </button>
            </div>
          )}

          {/* Grid produk */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : variants.length === 0 ? (
            <Card>
              <EmptyState
                icon={SearchX}
                title="Tidak ada unit yang cocok"
                description="Coba ubah kata kunci pencarian atau reset filter untuk melihat semua pilihan."
                action={
                  <Button variant="primary" className="text-xs" onClick={resetFilters}>
                    Reset Filter
                  </Button>
                }
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {variants.map((v) => (
                <Link key={v.id} to={`/iphone/${v.slug}?variant=${v.id}`}>
                  <Card hover className="h-full flex flex-col">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      {v.badge ? <Pill tone="brand" size="xs">{v.badge}</Pill> : <span />}
                      <Pill tone="success" size="xs">Tersedia</Pill>
                    </div>

                    <div className="bg-[#F5F5F7] rounded-xl h-44 flex items-center justify-center mb-4 overflow-hidden">
                      <img
                        src={v.primaryImage}
                        alt={v.modelName}
                        onError={(e) => onImageError(e, v.modelName)}
                        loading="lazy"
                        className="h-36 object-contain hover:scale-105 transition-transform"
                      />
                    </div>

                    <p className="text-sm font-semibold text-[#1D1D1F]">{v.modelName}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {v.storageCapacity} · {v.colorName}
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 mt-3">
                      <Pill tone="neutral" size="xs">{v.processor}</Pill>
                      <Pill tone="neutral" size="xs">{v.screenSize.split(' ')[0]}</Pill>
                      {/* Penarafan / Rating Produk */}
                      <div className="flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/60">
                        <Star size={11} className="fill-amber-400 text-amber-400" />
                        <span>4.8</span>
                      </div>
                    </div>

                    <div className="mt-auto pt-4 flex items-end justify-between border-t border-gray-50">
                      <div>
                        <p className="text-[10px] text-gray-400">Mulai dari</p>
                        <p className="text-base font-bold text-[#0071E3]">
                          {formatRupiah(v.dailyRate)}
                          <span className="text-[11px] font-normal text-gray-400">/hari</span>
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          Deposit {formatRupiah(v.securityDepositAmount)}
                        </p>
                      </div>
                      <Button variant="primary" className="text-xs px-4 py-2">
                        Sewa
                      </Button>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Drawer filter (mobile) */}
      {showFilters && (
        <div className="fixed inset-0 z-[95] lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
          <div className="absolute right-0 top-0 h-full w-[min(88vw,340px)] bg-white shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
              <p className="text-sm font-semibold text-[#1D1D1F]">Filter Katalog</p>
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                aria-label="Tutup filter"
                className="text-gray-400 hover:text-[#1D1D1F] p-1"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5">{filterPanel}</div>
            <div className="p-5 border-t border-gray-100 sticky bottom-0 bg-white">
              <Button variant="primary" className="w-full text-xs py-3" onClick={() => setShowFilters(false)}>
                Terapkan Filter ({variants.length} hasil)
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogPage;