/**
 * Automated End-to-End Test Suite for iPhone Rental Backend API
 * Uses native fetch in Node.js 18+
 */

const BASE_URL = 'http://localhost:5000/api/v1';

async function runTests() {
  console.log('🧪 Memulai Pengujian Otomatis REST API Backend iPhone Rental...');
  let token = '';
  let testModelId = '';
  let testUnitId = '';
  let testBookingId = '';

  const assert = (condition, testName, details = '') => {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
    } else {
      console.error(`  ❌ [FAIL] ${testName}: ${details}`);
      process.exit(1);
    }
  };

  // 1. Health Check
  console.log('\n--- 1. Testing Health Check ---');
  const resHealth = await fetch(`${BASE_URL}/health`);
  const healthJson = await resHealth.json();
  assert(resHealth.status === 200 && healthJson.status === 'healthy', 'GET /api/v1/health');

  // 2. Public Catalog List
  console.log('\n--- 2. Testing Public Catalog Endpoints ---');
  const resCatalog = await fetch(`${BASE_URL}/catalog`);
  const catalogJson = await resCatalog.json();
  assert(resCatalog.status === 200 && Array.isArray(catalogJson.data), 'GET /api/v1/catalog', JSON.stringify(catalogJson));
  assert(catalogJson.data.length > 0, 'Catalog data tidak kosong');

  const firstSlug = catalogJson.data[0].slug;
  console.log(`     Menguji detail slug: ${firstSlug}`);

  // 3. Public Catalog Detail
  const resDetail = await fetch(`${BASE_URL}/catalog/${firstSlug}`);
  const detailJson = await resDetail.json();
  assert(resDetail.status === 200 && detailJson.data.slug === firstSlug, `GET /api/v1/catalog/${firstSlug}`);

  // 4. Admin Auth Login
  console.log('\n--- 3. Testing Auth Endpoints ---');
  const resLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'admin',
      password: 'admin123',
    }),
  });
  const loginJson = await resLogin.json();
  assert(resLogin.status === 200 && loginJson.data.token, 'POST /api/v1/auth/login');
  token = loginJson.data.token;
  console.log('     JWT Token berhasil didapatkan.');

  // 5. Auth Me
  const resMe = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const meJson = await resMe.json();
  assert(resMe.status === 200 && meJson.data.admin.username === 'admin', 'GET /api/v1/auth/me');

  // 6. Admin Dashboard Stats
  console.log('\n--- 4. Testing Admin Dashboard Stats ---');
  const resStats = await fetch(`${BASE_URL}/admin/dashboard/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const statsJson = await resStats.json();
  assert(
    resStats.status === 200 && statsJson.data.revenue && statsJson.data.units,
    'GET /api/v1/admin/dashboard/stats'
  );
  console.log(`     Total Unit: ${statsJson.data.units.totalUnits}, Available: ${statsJson.data.units.availableUnits}, Rented: ${statsJson.data.units.rentedUnits}`);

  // 7. Admin Models CRUD
  console.log('\n--- 5. Testing Admin iPhone Models CRUD ---');
  const resModels = await fetch(`${BASE_URL}/admin/models`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const modelsJson = await resModels.json();
  assert(resModels.status === 200 && Array.isArray(modelsJson.data), 'GET /api/v1/admin/models');

  // Create new model
  const resCreateModel = await fetch(`${BASE_URL}/admin/models`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: 'iPhone 16 Pro Test',
      series: 'iPhone 16 Series',
      storage: '256GB',
      pricePerDay: 400000,
      description: 'Model tes untuk pengujian otomatis',
      slug: 'iphone-16-pro-test-' + Date.now(),
    }),
  });
  const createModelJson = await resCreateModel.json();
  assert(resCreateModel.status === 201 && createModelJson.data.id, 'POST /api/v1/admin/models');
  testModelId = createModelJson.data.id;
  console.log(`     Model baru dibuat dengan ID: ${testModelId}`);

  // 8. Admin Physical Units CRUD
  console.log('\n--- 6. Testing Admin Units CRUD ---');
  const testUnitCode = 'IP16P-TEST-' + Math.floor(Math.random() * 1000);
  const testImei = '35' + Date.now();
  const resCreateUnit = await fetch(`${BASE_URL}/admin/units`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      modelId: testModelId,
      unitCode: testUnitCode,
      imei: testImei,
      color: 'Desert Titanium',
      batteryHealth: 100,
      status: 'AVAILABLE',
    }),
  });
  const createUnitJson = await resCreateUnit.json();
  assert(resCreateUnit.status === 201 && createUnitJson.data.id, 'POST /api/v1/admin/units');
  testUnitId = createUnitJson.data.id;
  console.log(`     Unit baru dibuat: ${testUnitCode} (Status: AVAILABLE)`);

  // 9. Admin Booking Creation with Prisma Transaction
  console.log('\n--- 7. Testing Booking & Prisma Transaction Logic ---');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const threeDaysLater = new Date();
  threeDaysLater.setDate(threeDaysLater.getDate() + 4);

  const resBooking = await fetch(`${BASE_URL}/admin/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      unitId: testUnitId,
      customerName: 'Ahmad Penguji',
      customerPhone: '081299988877',
      customerIdentity: 'KTP - 3201019908770001',
      customerAddress: 'Jl. Uji Coba No. 1, Jakarta',
      startDate: tomorrow.toISOString(),
      endDate: threeDaysLater.toISOString(),
      totalDays: 3,
      bankName: 'BCA',
      notes: 'Booking otomatis dari tes',
    }),
  });
  const bookingJson = await resBooking.json();
  assert(resBooking.status === 201 && bookingJson.data.id, 'POST /api/v1/admin/bookings');
  testBookingId = bookingJson.data.id;
  console.log(`     Booking dibuat: ${bookingJson.data.bookingCode}`);
  assert(bookingJson.data.unit.status === 'RENTED', 'Status unit otomatis berubah menjadi RENTED');

  // 10. Test Double-booking prevention on same unit
  console.log('\n--- 8. Testing Double-Booking Prevention ---');
  const resDoubleBooking = await fetch(`${BASE_URL}/admin/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      unitId: testUnitId,
      customerName: 'Penabrak Booking',
      customerPhone: '081200000000',
      customerIdentity: 'SIM A - 123456789',
      startDate: tomorrow.toISOString(),
      endDate: threeDaysLater.toISOString(),
    }),
  });
  assert(
    resDoubleBooking.status === 409,
    'Double-booking berhasil dicegah (HTTP 409 Conflict saat unit berstatus RENTED)'
  );

  // 11. Complete Booking Return Flow with Transaction
  console.log('\n--- 9. Testing Return Flow (COMPLETED -> Unit reverts to AVAILABLE) ---');
  const resReturn = await fetch(`${BASE_URL}/admin/bookings/${testBookingId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      status: 'COMPLETED',
      fineAmount: 50000,
      notes: 'Pengembalian tepat waktu, denda pembersihan charger Rp 50.000.',
    }),
  });
  const returnJson = await resReturn.json();
  assert(resReturn.status === 200 && returnJson.data.status === 'COMPLETED', 'PATCH /api/v1/admin/bookings/:id/status (COMPLETED)');

  // Verify unit status is now AVAILABLE
  const resCheckUnit = await fetch(`${BASE_URL}/admin/units/${testUnitId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const checkUnitJson = await resCheckUnit.json();
  assert(checkUnitJson.data.status === 'AVAILABLE', 'Unit fisik otomatis kembali AVAILABLE setelah booking COMPLETED');

  // 12. Testing Reports & CSV Export
  console.log('\n--- 10. Testing Admin Reports ---');
  const resReport = await fetch(`${BASE_URL}/admin/reports`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const reportJson = await resReport.json();
  assert(resReport.status === 200 && reportJson.data.summary, 'GET /api/v1/admin/reports (JSON)');

  const resReportCsv = await fetch(`${BASE_URL}/admin/reports?format=csv`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const reportCsvText = await resReportCsv.text();
  assert(
    resReportCsv.status === 200 && reportCsvText.includes('Kode Booking'),
    'GET /api/v1/admin/reports?format=csv'
  );

  // 13. Cleanup test data
  console.log('\n--- 11. Membersihkan Data Uji Coba ---');
  await fetch(`${BASE_URL}/admin/units/${testUnitId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  // Delete test booking directly via prisma in cleanup if needed or keep completed for audit
  console.log('     Data uji selesai divalidasi.');

  console.log('\n🎉 SEMUA PENGUJIAN REST API BERHASIL DENGAN STATUS 100% PASS!');
}

runTests().catch((err) => {
  console.error('Pengujian gagal dengan error:', err);
  process.exit(1);
});
