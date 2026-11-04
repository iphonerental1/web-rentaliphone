import React, { useEffect, useState } from "react";
import { useDocumentTitle } from "../../hooks";
import { rentalApi } from "../../api/rentalApi";

export const CustomerDashboardPage = () => {
  useDocumentTitle("Dashboard Saya");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    rentalApi
      .myOrders("guest")
      .then((res) => setOrders(res.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-6 py-12">
      <h1 className="text-2xl font-semibold text-[#1D1D1F] mb-6">
        Dashboard Saya
      </h1>
      {loading ? (
        <p className="text-sm text-gray-500">Memuat...</p>
      ) : (
        <p className="text-sm text-gray-600">
          Pesanan Anda akan ditampilkan di sini.
        </p>
      )}
    </div>
  );
};

export const RentalHistoryPage = () => (
  <div className="max-w-4xl mx-auto px-5 sm:px-6 py-12">
    <h1 className="text-2xl font-semibold text-[#1D1D1F] mb-6">Riwayat Sewa</h1>
    <p className="text-sm text-gray-600">
      Halaman riwayat sewa akan segera tersedia.
    </p>
  </div>
);

export const OrderDetailPage = () => (
  <div className="max-w-4xl mx-auto px-5 sm:px-6 py-12">
    <h1 className="text-2xl font-semibold text-[#1D1D1F] mb-6">
      Detail Pesanan
    </h1>
    <p className="text-sm text-gray-600">
      Halaman detail pesanan akan segera tersedia.
    </p>
  </div>
);

export const CustomerProfilePage = () => (
  <div className="max-w-4xl mx-auto px-5 sm:px-6 py-12">
    <h1 className="text-2xl font-semibold text-[#1D1D1F] mb-6">Profil Saya</h1>
    <p className="text-sm text-gray-600">
      Halaman profil akan segera tersedia.
    </p>
  </div>
);

export const HowToRentPage = () => (
  <div className="max-w-4xl mx-auto px-5 sm:px-6 py-12">
    <h1 className="text-2xl font-semibold text-[#1D1D1F] mb-4">Cara Sewa</h1>
    <p className="text-sm text-gray-600 mb-8">
      Ikuti langkah-langkah mudah berikut untuk menyewa iPhone pilihan Anda di{" "}
      <a
        href="/"
        className="text-blue-600 hover:underline"
      >
        iRent
      </a>
      :
    </p>

    <div className="space-y-4">
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-sm font-semibold text-[#1D1D1F] mb-1.5">
          1. Pilih Unit & Tentukan Tanggal
        </h2>
        <p className="text-sm text-gray-600">
          Buka menu{" "}
          <a
            href="/katalog"
            className="text-blue-600 hover:underline"
          >
            Katalog iPhone
          </a>
          , pilih tipe unit yang diinginkan, lalu tentukan tanggal mulai dan
          selesai durasi sewa.
        </p>
      </div>

      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-sm font-semibold text-[#1D1D1F] mb-1.5">
          2. Verifikasi Identitas (KYC)
        </h2>
        <p className="text-sm text-gray-600">
          Lakukan verifikasi data diri dengan melampirkan foto kartu identitas
          (KTP atau Kartu Mahasiswa) serta foto selfie untuk keamanan transaksi.
        </p>
      </div>

      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-sm font-semibold text-[#1D1D1F] mb-1.5">
          3. Pembayaran & Konfirmasi
        </h2>
        <p className="text-sm text-gray-600">
          Lakukan pembayaran DP minimal 30% dalam waktu 1 x 24 jam agar pesanan
          tidak hangus. Kirimkan bukti transfer melalui WhatsApp admin.
        </p>
      </div>

      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-sm font-semibold text-[#1D1D1F] mb-1.5">
          4. Pengambilan atau Pengiriman Unit
        </h2>
        <p className="text-sm text-gray-600">
          Setelah konfirmasi berhasil, ambil unit di basecamp kami di{" "}
          <a
            href="https://www.google.com/maps/place/BASECAMP+GO-GRAB/@-7.4591057,110.2222813,21z"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            BASECAMP GO-GRAB, Magelang
          </a>{" "}
          atau gunakan layanan kurir.
        </p>
      </div>
    </div>
  </div>
);

export const FaqPage = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "Apa saja syarat wajib untuk menyewa iPhone di iRent?",
      answer:
        "Penyewa wajib melampirkan foto identitas asli (KTP atau Kartu Mahasiswa yang masih aktif) serta melewati proses verifikasi data diri (KYC) demi keamanan transaksi bersama.",
    },
    {
      question: "Bagaimana cara melakukan pemesanan unit?",
      answer:
        "Anda dapat memilih tipe unit dan tanggal sewa melalui halaman katalog website kami, kemudian melanjutkan proses pemesanan sesuai instruksi sistem.",
    },
    {
      question: "Berapa batas waktu pembayaran DP (Uang Muka)?",
      answer:
        "Pembayaran DP minimal 30% harus diselesaikan dalam kurun waktu 1 x 24 jam setelah pesanan dibuat. Jika melebihi batas tersebut, pesanan akan otomatis dibatalkan/hangus.",
    },
    {
      question: "Di mana lokasi pengambilan perangkat sewa?",
      answer:
        "Unit dapat diambil secara langsung di basecamp resmi kami yaitu di BASECAMP GO-GRAB, Magelang.",
    },
    {
      question: "Apakah unit iPhone bisa dikirim langsung ke alamat saya?",
      answer:
        "Bisa, pengiriman menggunakan layanan kurir lokal dapat dikoordinasikan terlebih dahulu dengan admin WhatsApp dengan ketentuan biaya kirim ditanggung oleh penyewa.",
    },
    {
      question: "Apa saja kelengkapan yang didapatkan dalam paket sewa?",
      answer:
        "Setiap penyewaan sudah mencakup unit iPhone, kabel data/charger original atau setara, serta softcase pelindung perangkat.",
    },
    {
      question: "Bagaimana jika saya ingin memperpanjang masa sewa?",
      answer:
        "Perpanjangan masa sewa dapat dikonfirmasikan kepada admin selambat-lambatnya H-1 sebelum masa sewa berakhir, selama unit tersebut belum dibooking oleh penyewa lain.",
    },
    {
      question: "Apa ketentuan jika terjadi keterlambatan pengembalian?",
      answer:
        "Keterlambatan pengembalian unit tanpa konfirmasi sebelumnya akan dikenakan sanksi denda harian sesuai tarif sewa normal atau kebijakan denda keterlambatan.",
    },
    {
      question: "Bagaimana jika unit mengalami kerusakan atau kendala teknis?",
      answer:
        "Penyewa bertanggung jawab penuh atas kondisi fisik perangkat selama masa sewa. Jika terjadi kendala atau kerusakan, segera laporkan kepada admin dan dilarang membongkar perangkat sendiri.",
    },
    {
      question: "Metode pembayaran apa saja yang diterima oleh iRent?",
      answer:
        "Pembayaran dapat dilakukan melalui transfer rekening bank resmi atau metode pembayaran digital/QRIS yang diinformasikan oleh admin saat konfirmasi pesanan.",
    },
  ];

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-6 py-12">
      <h1 className="text-2xl font-semibold text-[#1D1D1F] mb-2">FAQ</h1>
      <p className="text-sm text-gray-500 mb-8">
        Klik pada salah satu pertanyaan di bawah untuk melihat jawaban
        lengkapnya.
      </p>

      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm transition-all"
          >
            <button
              onClick={() => toggleFaq(index)}
              className="w-full px-5 py-4 text-left flex justify-between items-center focus:outline-none hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-medium text-[#1D1D1F] pr-4">
                {faq.question}
              </span>
              <span
                className={`transform transition-transform duration-200 text-gray-400 text-xs shrink-0 ${openIndex === index ? "rotate-180" : ""}`}
              >
                ▼
              </span>
            </button>
            {openIndex === index && (
              <div className="px-5 pb-4 pt-1 text-sm text-gray-600 border-t border-gray-100 bg-gray-50/50">
                <p className="pt-2 leading-relaxed">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
