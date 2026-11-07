const bcrypt = require('bcryptjs');
const prisma = require('../src/config/prisma');

async function main() {
  console.log('🌱 Memulai proses seeding query database...');

  // 1. Seed Akun Admin Default
  console.log('\n--- 1. Query Seeding Admin ---');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {
      password: hashedPassword,
      name: 'Administrator Rental iPhone',
      email: 'admin@rentaliphone.com',
    },
    create: {
      username: 'admin',
      email: 'admin@rentaliphone.com',
      password: hashedPassword,
      name: 'Administrator Rental iPhone',
    },
  });
  console.log(`✅ Admin terdaftar: ${admin.username} (${admin.email})`);

  // 2. Seed Katalog Model iPhone
  console.log('\n--- 2. Query Seeding Katalog Model iPhone ---');
  const modelsData = [
    {
      name: 'iPhone 13',
      slug: 'iphone-13-128gb',
      series: 'iPhone 13 Series',
      storage: '128GB',
      pricePerDay: 150000,
      description: 'Layar Super Retina XDR 6.1 inci, chip A15 Bionic, sistem kamera ganda 12MP.',
      imageUrl: 'http://localhost:5000/uploads/units/iphone-13.jpg',
    },
    {
      name: 'iPhone 13 Pro',
      slug: 'iphone-13-pro-128gb',
      series: 'iPhone 13 Series',
      storage: '128GB',
      pricePerDay: 200000,
      description: 'Layar ProMotion 120Hz 6.1 inci, bodi stainless steel, triple kamera telephoto.',
      imageUrl: 'http://localhost:5000/uploads/units/iphone-13-pro.jpg',
    },
    {
      name: 'iPhone 14',
      slug: 'iphone-14-128gb',
      series: 'iPhone 14 Series',
      storage: '128GB',
      pricePerDay: 200000,
      description: 'Fitur keselamatan Crash Detection, Photonic Engine, daya tahan baterai seharian.',
      imageUrl: 'http://localhost:5000/uploads/units/iphone-14.jpg',
    },
    {
      name: 'iPhone 14 Pro',
      slug: 'iphone-14-pro-128gb',
      series: 'iPhone 14 Series',
      storage: '128GB',
      pricePerDay: 280000,
      description: 'Dynamic Island inovatif, kamera utama 48MP, layar Always-On Display.',
      imageUrl: 'http://localhost:5000/uploads/units/iphone-14-pro.jpg',
    },
    {
      name: 'iPhone 14 Pro Max',
      slug: 'iphone-14-pro-max-256gb',
      series: 'iPhone 14 Series',
      storage: '256GB',
      pricePerDay: 320000,
      description: 'Layar lapang 6.7 inci Super Retina XDR dengan ProMotion dan Dynamic Island.',
      imageUrl: 'http://localhost:5000/uploads/units/iphone-14-pro-max.jpg',
    },
    {
      name: 'iPhone 15',
      slug: 'iphone-15-128gb',
      series: 'iPhone 15 Series',
      storage: '128GB',
      pricePerDay: 250000,
      description: 'Port USB-C universal, Dynamic Island, kaca belakang berwarna infused, kamera 48MP.',
      imageUrl: 'http://localhost:5000/uploads/units/iphone-15.jpg',
    },
    {
      name: 'iPhone 15 Pro',
      slug: 'iphone-15-pro-128gb',
      series: 'iPhone 15 Series',
      storage: '128GB',
      pricePerDay: 350000,
      description: 'Desain titanium ringan kelas kedirgantaraan, tombol Tindakan (Action Button), chip A17 Pro.',
      imageUrl: 'http://localhost:5000/uploads/units/iphone-15-pro.jpg',
    },
    {
      name: 'iPhone 15 Pro Max',
      slug: 'iphone-15-pro-max-256gb',
      series: 'iPhone 15 Series',
      storage: '256GB',
      pricePerDay: 380000,
      description: 'Zoom optik 5x telefoto terpanjang di iPhone, bodi titanium, layar 6.7 inci.',
      imageUrl: 'http://localhost:5000/uploads/units/iphone-15-pro-max.jpg',
    },
    {
      name: 'iPhone 16 Pro',
      slug: 'iphone-16-pro-256gb',
      series: 'iPhone 16 Series',
      storage: '256GB',
      pricePerDay: 420000,
      description: 'Apple Intelligence siap pakai, tombol Camera Control, chip bertenaga A18 Pro.',
      imageUrl: 'http://localhost:5000/uploads/units/iphone-16-pro.jpg',
    },
    {
      name: 'iPhone 16 Pro Max',
      slug: 'iphone-16-pro-max-256gb',
      series: 'iPhone 16 Series',
      storage: '256GB',
      pricePerDay: 480000,
      description: 'Layar terbesar 6.9 inci dengan bezel tertipis, baterai terawet sepanjang sejarah iPhone.',
      imageUrl: 'http://localhost:5000/uploads/units/iphone-16-pro-max.jpg',
    },
  ];

  const modelMap = {};
  for (const m of modelsData) {
    const model = await prisma.iphoneModel.upsert({
      where: { slug: m.slug },
      update: {
        name: m.name,
        series: m.series,
        storage: m.storage,
        pricePerDay: m.pricePerDay,
        description: m.description,
        imageUrl: m.imageUrl,
      },
      create: m,
    });
    modelMap[m.slug] = model.id;
    console.log(`  📱 Model: ${model.name} (${model.storage}) - Rp ${Number(model.pricePerDay).toLocaleString('id-ID')}/hari`);
  }

  // 3. Seed Inventaris Stok Fisik Unit iPhone
  console.log('\n--- 3. Query Seeding Unit Fisik Inventaris ---');
  const unitsData = [
    // iPhone 13
    {
      modelSlug: 'iphone-13-128gb',
      unitCode: 'IP13-001',
      imei: '359012345678901',
      color: 'Midnight',
      batteryHealth: 91,
      status: 'AVAILABLE',
    },
    {
      modelSlug: 'iphone-13-128gb',
      unitCode: 'IP13-002',
      imei: '359012345678902',
      color: 'Pink',
      batteryHealth: 89,
      status: 'AVAILABLE',
    },
    // iPhone 14 Pro
    {
      modelSlug: 'iphone-14-pro-128gb',
      unitCode: 'IP14P-001',
      imei: '359012345678903',
      color: 'Deep Purple',
      batteryHealth: 94,
      status: 'AVAILABLE',
    },
    {
      modelSlug: 'iphone-14-pro-128gb',
      unitCode: 'IP14P-002',
      imei: '359012345678904',
      color: 'Space Black',
      batteryHealth: 92,
      status: 'AVAILABLE',
    },
    // iPhone 14 Pro Max
    {
      modelSlug: 'iphone-14-pro-max-256gb',
      unitCode: 'IP14PM-001',
      imei: '359012345678905',
      color: 'Gold',
      batteryHealth: 95,
      status: 'AVAILABLE',
    },
    // iPhone 15
    {
      modelSlug: 'iphone-15-128gb',
      unitCode: 'IP15-001',
      imei: '359012345678906',
      color: 'Pink',
      batteryHealth: 98,
      status: 'AVAILABLE',
    },
    {
      modelSlug: 'iphone-15-128gb',
      unitCode: 'IP15-002',
      imei: '359012345678907',
      color: 'Black',
      batteryHealth: 97,
      status: 'AVAILABLE',
    },
    // iPhone 15 Pro
    {
      modelSlug: 'iphone-15-pro-128gb',
      unitCode: 'IP15P-001',
      imei: '359012345678908',
      color: 'Natural Titanium',
      batteryHealth: 96,
      status: 'AVAILABLE',
    },
    {
      modelSlug: 'iphone-15-pro-128gb',
      unitCode: 'IP15P-002',
      imei: '359012345678909',
      color: 'Blue Titanium',
      batteryHealth: 95,
      status: 'AVAILABLE',
    },
    // iPhone 15 Pro Max
    {
      modelSlug: 'iphone-15-pro-max-256gb',
      unitCode: 'IP15PM-001',
      imei: '359012345678910',
      color: 'Natural Titanium',
      batteryHealth: 99,
      status: 'AVAILABLE',
    },
    {
      modelSlug: 'iphone-15-pro-max-256gb',
      unitCode: 'IP15PM-002',
      imei: '359012345678911',
      color: 'White Titanium',
      batteryHealth: 98,
      status: 'AVAILABLE',
    },
    // iPhone 16 Pro
    {
      modelSlug: 'iphone-16-pro-256gb',
      unitCode: 'IP16P-001',
      imei: '359012345678912',
      color: 'Desert Titanium',
      batteryHealth: 100,
      status: 'AVAILABLE',
    },
    {
      modelSlug: 'iphone-16-pro-256gb',
      unitCode: 'IP16P-002',
      imei: '359012345678913',
      color: 'Black Titanium',
      batteryHealth: 100,
      status: 'AVAILABLE',
    },
    // iPhone 16 Pro Max
    {
      modelSlug: 'iphone-16-pro-max-256gb',
      unitCode: 'IP16PM-001',
      imei: '359012345678914',
      color: 'Desert Titanium',
      batteryHealth: 100,
      status: 'AVAILABLE',
    },
    {
      modelSlug: 'iphone-16-pro-max-256gb',
      unitCode: 'IP16PM-002',
      imei: '359012345678915',
      color: 'Natural Titanium',
      batteryHealth: 100,
      status: 'AVAILABLE',
    },
  ];

  const unitMap = {};
  for (const u of unitsData) {
    const modelId = modelMap[u.modelSlug];
    if (!modelId) continue;

    const unit = await prisma.iphoneUnit.upsert({
      where: { unitCode: u.unitCode },
      update: {
        color: u.color,
        batteryHealth: u.batteryHealth,
        status: u.status,
      },
      create: {
        modelId,
        unitCode: u.unitCode,
        imei: u.imei,
        color: u.color,
        batteryHealth: u.batteryHealth,
        status: u.status,
      },
    });
    unitMap[u.unitCode] = unit.id;
    console.log(`  📦 Unit: ${unit.unitCode} | ${u.color} | BH: ${unit.batteryHealth}% | Status: ${unit.status}`);
  }

  // 4. Seed Riwayat Transaksi Booking WhatsApp
  console.log('\n--- 4. Query Seeding Transaksi Booking & Sewa ---');
  const now = new Date();
  const past3Days = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const past1Day = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
  const next2Days = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

  // Booking 1: Selesai (COMPLETED)
  const unit1Id = unitMap['IP15PM-001'];
  if (unit1Id) {
    await prisma.booking.upsert({
      where: { bookingCode: 'INV-202610-001' },
      update: {},
      create: {
        bookingCode: 'INV-202610-001',
        unitId: unit1Id,
        customerName: 'Dian Permata',
        customerPhone: '081234567891',
        customerIdentity: 'KTP - 3171015502940002',
        customerAddress: 'Apartemen Sudirman Park Tower A, Jakarta Pusat',
        startDate: past3Days,
        endDate: past1Day,
        actualReturnDate: past1Day,
        totalDays: 2,
        totalPrice: 760000,
        fineAmount: 0,
        status: 'COMPLETED',
        bankName: 'BCA Transfer',
        paymentProofUrl: 'http://localhost:5000/uploads/payments/sample-proof-1.jpg',
        notes: 'Sewa untuk acara konser musik. Unit kembali dalam kondisi mulus.',
      },
    });
    console.log('  🧾 Booking INV-202610-001 (COMPLETED) - Pelanggan: Dian Permata');
  }

  // Booking 2: Sedang Berjalan (ONGOING) - Update unit menjadi RENTED
  const unit2Id = unitMap['IP16PM-001'];
  if (unit2Id) {
    await prisma.booking.upsert({
      where: { bookingCode: 'INV-202610-002' },
      update: {},
      create: {
        bookingCode: 'INV-202610-002',
        unitId: unit2Id,
        customerName: 'Reza Pratama',
        customerPhone: '081399887766',
        customerIdentity: 'SIM A - 987654321012',
        customerAddress: 'Jl. Senopati No. 88, Kebayoran Baru, Jakarta Selatan',
        startDate: past1Day,
        endDate: next2Days,
        totalDays: 3,
        totalPrice: 1440000,
        fineAmount: 0,
        status: 'ONGOING',
        bankName: 'Mandiri Virtual Account',
        paymentProofUrl: 'http://localhost:5000/uploads/payments/sample-proof-2.jpg',
        notes: 'Sewa untuk shooting dokumenter perjalanan ke Bali.',
      },
    });

    // Sinkronkan status unit fisik menjadi RENTED
    await prisma.iphoneUnit.update({
      where: { id: unit2Id },
      data: { status: 'RENTED' },
    });
    console.log('  🧾 Booking INV-202610-002 (ONGOING) - Unit IP16PM-001 diset menjadi RENTED');
  }

  // Booking 3: Pesanan Baru Terkonfirmasi (BOOKED)
  const unit3Id = unitMap['IP14P-001'];
  if (unit3Id) {
    await prisma.booking.upsert({
      where: { bookingCode: 'INV-202610-003' },
      update: {},
      create: {
        bookingCode: 'INV-202610-003',
        unitId: unit3Id,
        customerName: 'Siti Sarah',
        customerPhone: '085712345678',
        customerIdentity: 'KTP - 3275016503980005',
        customerAddress: 'Grand Galaxy City Blok EB No. 12, Bekasi',
        startDate: now,
        endDate: next2Days,
        totalDays: 2,
        totalPrice: 560000,
        fineAmount: 0,
        status: 'BOOKED',
        bankName: 'BRI Transfer',
        paymentProofUrl: 'http://localhost:5000/uploads/payments/sample-proof-3.jpg',
        notes: 'Sewa unit untuk wisuda universitas.',
      },
    });

    // Set unit menjadi RENTED
    await prisma.iphoneUnit.update({
      where: { id: unit3Id },
      data: { status: 'RENTED' },
    });
    console.log('  🧾 Booking INV-202610-003 (BOOKED) - Unit IP14P-001 diset menjadi RENTED');
  }

  console.log('\n🎉 Query seeding database berhasil dijalankan!');
}

main()
  .catch((e) => {
    console.error('❌ Terjadi kesalahan saat seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
