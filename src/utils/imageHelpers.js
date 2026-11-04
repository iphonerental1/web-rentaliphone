/**
 * IMAGE HELPERS — penanganan gambar produk (offline-proof).
 * Fallback memakai SVG inline (data URI) agar tidak bergantung ke
 * placehold.co / jaringan luar — foto tidak akan "hilang" lagi walau
 * CDN Apple / internet lambat. Dibuat ala-Apple: tidak terlihat AI.
 */

/** Bangun placeholder SVG lokal sebagai data URI (branded, bukan abu-abu polos). */
export const IMG_WIDTHS = {
  hero: 720,
  card: 400,
  detail: 800,
  floating: 300,
  thumb: 200,
};

export const appleImageUrl = (url, width) => {
  if (!url) return '';
  try {
    const u = new URL(url);
    u.searchParams.set('wid', String(width));
    u.searchParams.set('hei', String(Math.round(width * 1.18)));
    u.searchParams.set('fmt', 'png-alpha');
    return u.toString();
  } catch {
    return url;
  }
};

export const placeholderFor = (label = 'iPhone', size = 400) => {
  const short = String(label || 'iPhone').slice(0, 22);
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'>` +
    `<defs>` +
    `<linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>` +
    `<stop offset='0' stop-color='#F7FAFF'/><stop offset='1' stop-color='#E8F2FD'/>` +
    `</linearGradient>` +
    `<linearGradient id='a' x1='0' y1='0' x2='1' y2='1'>` +
    `<stop offset='0' stop-color='#5AC8FA'/><stop offset='1' stop-color='#0071E3'/>` +
    `</linearGradient>` +
    `</defs>` +
    `<rect width='100%' height='100%' fill='url(#g)'/>` +
    `<circle cx='${size * 0.5}' cy='${size * 0.4}' r='${size * 0.3}' fill='#0071E3' opacity='0.06'/>` +
    `<circle cx='${size * 0.5}' cy='${size * 0.4}' r='${size * 0.22}' fill='#5AC8FA' opacity='0.09'/>` +
    `<rect x='${size * 0.37}' y='${size * 0.16}' width='${size * 0.26}' height='${size * 0.52}' rx='${size * 0.055}' fill='#FFFFFF' stroke='url(#a)' stroke-width='${Math.max(3, size / 130)}'/>` +
    `<rect x='${size * 0.395}' y='${size * 0.185}' width='${size * 0.065}' height='${size * 0.065}' rx='${size * 0.018}' fill='#0071E3' opacity='0.15'/>` +
    `<circle cx='${size * 0.414}' cy='${size * 0.207}' r='${size * 0.011}' fill='#0071E3' opacity='0.5'/>` +
    `<circle cx='${size * 0.441}' cy='${size * 0.207}' r='${size * 0.011}' fill='#0071E3' opacity='0.32'/>` +
    `<rect x='${size * 0.455}' y='${size * 0.185}' width='${size * 0.09}' height='${size * 0.022}' rx='${size * 0.011}' fill='#0071E3' opacity='0.35'/>` +
    `<line x1='${size * 0.44}' y1='${size * 0.34}' x2='${size * 0.56}' y2='${size * 0.34}' stroke='#0071E3' stroke-width='${Math.max(2, size / 200)}' opacity='0.35'/>` +
    `<line x1='${size * 0.46}' y1='${size * 0.38}' x2='${size * 0.54}' y2='${size * 0.38}' stroke='#0071E3' stroke-width='${Math.max(2, size / 200)}' opacity='0.22'/>` +
    `<rect x='${size * 0.455}' y='${size * 0.63}' width='${size * 0.09}' height='${Math.max(3, size / 120)}' rx='${size / 240}' fill='#0071E3' opacity='0.45'/>` +
    `<text x='50%' y='${size * 0.78}' text-anchor='middle' font-family='Inter,-apple-system,Segoe UI,Roboto,sans-serif' font-size='${Math.max(12, size / 30)}' font-weight='700' fill='#0071E3'>iRent</text>` +
    `<text x='50%' y='${size * 0.88}' text-anchor='middle' font-family='Inter,-apple-system,Segoe UI,Roboto,sans-serif' font-size='${Math.max(18, size / 22)}' font-weight='600' fill='#1D1D1F'>${short.replace(/[<>&'"]/g, '')}</text>` +
    `</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

/**
 * Baca file gambar → data URL (base64) yang aman disimpan di localStorage.
 * Gambar dikompres & diperkecil dulu supaya localStorage tidak cepat penuh
 * (batas ~5 MB) dan halaman tetap ringan.
 *
 * @param {File} file
 * @param {object} [opts]
 * @param {number} [opts.maxWidth=1280]  lebar maksimum hasil resize
 * @param {number} [opts.quality=0.82]   kualitas JPEG 0..1
 * @returns {Promise<string>} data URL (data:image/jpeg;base64,...)
 */
export const fileToDataUrl = (file, { maxWidth = 1280, quality = 0.82 } = {}) =>
  new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('File gambar tidak ditemukan'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar'));
    reader.onload = () => {
      const src = String(reader.result || '');
      if (!src.startsWith('data:image/')) {
        reject(new Error('File bukan gambar yang valid'));
        return;
      }
      // SVG tidak bisa di-raster tanpa distortion → dipakai apa adanya
      if (file.type === 'image/svg+xml') {
        resolve(src);
        return;
      }
      const img = new Image();
      img.onerror = () => resolve(src); // fallback ke data URL mentah
      img.onload = () => {
        const scale = Math.min(1, maxWidth / (img.width || maxWidth));
        const w = Math.max(1, Math.round((img.width || maxWidth) * scale));
        const h = Math.max(1, Math.round((img.height || maxWidth) * scale));
        try {
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } catch {
          resolve(src);
        }
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });

/**
 * Handler onError untuk <img>.
 * - Cegah loop (sekali saja via dataset)
 * - Abaikan src kosong / data URI yang gagal
 * - Fallback selalu lokal (offline-proof)
 */
export const onImageError = (event, label = 'iPhone', fallbackUrl) => {
  const el = event?.currentTarget;
  if (!el || el.dataset.fallback === '1') return;
  el.dataset.fallback = '1';
  el.referrerPolicy = 'no-referrer';
  el.src = fallbackUrl || placeholderFor(label, IMG_WIDTHS.card);
};

export const imgAttrs = (width, height, priority = false) => ({
  width,
  height,
  loading: priority ? 'eager' : 'lazy',
  decoding: 'async',
  referrerPolicy: 'no-referrer',
  fetchPriority: priority ? 'high' : 'low',
});

/** Ambil foto utama dari daftar gambar varian. */
export const getPrimaryImage = (images = [], fallbackLabel = 'iPhone') =>
  images.find((i) => i.isPrimary)?.imageUrl || images[0]?.imageUrl || placeholderFor(fallbackLabel, IMG_WIDTHS.card);
