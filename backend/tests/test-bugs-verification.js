const BASE_URL = 'http://localhost:5000/api/v1';

async function testBugs() {
  console.log('🧪 Menguji 5 Bug yang telah diperbaiki sesuai Bug Report.pdf...\n');

  // 1. Login Admin
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' }),
  });
  const { data: { token } } = await loginRes.json();
  const authHeader = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // Dapatkan atau buat model iPhone untuk pengujian
  const modelsRes = await fetch(`${BASE_URL}/admin/models`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const modelsJson = await modelsRes.json();
  const modelId = modelsJson.data[0].id;

  // Siapkan data unit referensi
  const baseUnitCode = `IP-BUGTEST-${Date.now().toString().slice(-4)}`;
  const baseImei = `3589${Date.now().toString().slice(-11)}`;

  const createBaseRes = await fetch(`${BASE_URL}/admin/units`, {
    method: 'POST',
    headers: authHeader,
    body: JSON.stringify({
      modelId,
      unitCode: baseUnitCode,
      imei: baseImei,
      color: 'Titanium Black',
      batteryHealth: 100,
      status: 'AVAILABLE',
    }),
  });
  const createBaseJson = await createBaseRes.json();
  console.log(`Setup Unit Referensi: ${baseUnitCode} (IMEI: ${baseImei}) -> HTTP ${createBaseRes.status}`);

  // ==========================================
  // BUG-001: TS-004-06 (Create unit IMEI duplikat)
  // ==========================================
  const resBug001 = await fetch(`${BASE_URL}/admin/units`, {
    method: 'POST',
    headers: authHeader,
    body: JSON.stringify({
      modelId,
      unitCode: `DIFF-${Date.now().toString().slice(-4)}`,
      imei: baseImei, // Duplikat IMEI!
      color: 'MERAH MERONA',
      batteryHealth: 100,
      status: 'AVAILABLE',
    }),
  });
  const jsonBug001 = await resBug001.json();
  console.log('\n[BUG-001 / TS-004-06] Duplikat IMEI:');
  console.log(`Status HTTP: ${resBug001.status} (Expected: 409)`);
  console.log(`Response Message: "${jsonBug001.message}"`);
  if (resBug001.status === 409 && jsonBug001.message.includes('sudah digunakan oleh unit lain')) {
    console.log('✅ PASS: BUG-001 teratasi!');
  } else {
    console.error('❌ FAIL: BUG-001 belum teratasi!');
    process.exit(1);
  }

  // ==========================================
  // BUG-002: TS-004-07 (Create unit unitCode duplikat)
  // ==========================================
  const resBug002 = await fetch(`${BASE_URL}/admin/units`, {
    method: 'POST',
    headers: authHeader,
    body: JSON.stringify({
      modelId,
      unitCode: baseUnitCode, // Duplikat unitCode!
      imei: `3599${Date.now().toString().slice(-11)}`,
      color: 'Desert Blue',
      batteryHealth: 96,
      status: 'AVAILABLE',
    }),
  });
  const jsonBug002 = await resBug002.json();
  console.log('\n[BUG-002 / TS-004-07] Duplikat Unit Code:');
  console.log(`Status HTTP: ${resBug002.status} (Expected: 409)`);
  console.log(`Response Message: "${jsonBug002.message}"`);
  if (resBug002.status === 409 && jsonBug002.message.includes('sudah digunakan')) {
    console.log('✅ PASS: BUG-002 teratasi!');
  } else {
    console.error('❌ FAIL: BUG-002 belum teratasi!');
    process.exit(1);
  }

  // ==========================================
  // BUG-003: TS-004-09 (Create unit batteryHealth > 100)
  // ==========================================
  const resBug003 = await fetch(`${BASE_URL}/admin/units`, {
    method: 'POST',
    headers: authHeader,
    body: JSON.stringify({
      modelId,
      unitCode: `IP-BH-${Date.now().toString().slice(-4)}`,
      imei: `3577${Date.now().toString().slice(-11)}`,
      color: 'Desert Titanium',
      batteryHealth: 150, // Invalid battery health (> 100)
      status: 'AVAILABLE',
    }),
  });
  const jsonBug003 = await resBug003.json();
  console.log('\n[BUG-003 / TS-004-09] Battery Health > 100:');
  console.log(`Status HTTP: ${resBug003.status} (Expected: 400)`);
  console.log(`Response Message: "${jsonBug003.message}"`);
  if (resBug003.status === 400 && jsonBug003.message === 'Battery health harus angka 1 - 100.') {
    console.log('✅ PASS: BUG-003 teratasi!');
  } else {
    console.error('❌ FAIL: BUG-003 belum teratasi!');
    process.exit(1);
  }

  // ==========================================
  // BUG-004: TS-007-02 (Upload file non-image DOCX / PDF)
  // ==========================================
  const boundary = '----WebKitFormBoundaryBugTest' + Math.random().toString(16);
  const docxBody = [
    '--' + boundary,
    'Content-Disposition: form-data; name="file"; filename="makalah.docx"',
    'Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '',
    'fake docx content',
    '--' + boundary + '--',
  ].join('\r\n');

  const resBug004 = await fetch(`${BASE_URL}/admin/upload?type=payments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
    },
    body: docxBody,
  });
  const jsonBug004 = await resBug004.json();
  console.log('\n[BUG-004 / TS-007-02] Upload File Non-Image (DOCX):');
  console.log(`Status HTTP: ${resBug004.status} (Expected: 400)`);
  console.log(`Response Message: "${jsonBug004.message}"`);
  if (resBug004.status === 400 && jsonBug004.message.includes('Format file tidak didukung')) {
    console.log('✅ PASS: BUG-004 teratasi!');
  } else {
    console.error('❌ FAIL: BUG-004 belum teratasi!');
    process.exit(1);
  }

  // ==========================================
  // BUG-005: TS-007-04 (Upload tanpa file)
  // ==========================================
  const emptyBody = [
    '--' + boundary,
    'Content-Disposition: form-data; name="file"; filename=""',
    'Content-Type: application/octet-stream',
    '',
    '',
    '--' + boundary + '--',
  ].join('\r\n');

  const resBug005 = await fetch(`${BASE_URL}/admin/upload?type=units`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
    },
    body: emptyBody,
  });
  const jsonBug005 = await resBug005.json();
  console.log('\n[BUG-005 / TS-007-04] Upload Tanpa File (Multipart kosong / no file):');
  console.log(`Status HTTP: ${resBug005.status} (Expected: 400)`);
  console.log(`Response Message: "${jsonBug005.message}"`);
  if (resBug005.status === 400 && jsonBug005.message === 'Tidak ada file gambar yang diunggah.') {
    console.log('✅ PASS: BUG-005 teratasi!');
  } else {
    console.error('❌ FAIL: BUG-005 belum teratasi!');
    process.exit(1);
  }

  // Clean up created unit test
  if (createBaseJson && createBaseJson.data && createBaseJson.data.id) {
    await fetch(`${BASE_URL}/admin/units/${createBaseJson.data.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  console.log('\n===========================================');
  console.log('🎉 SEMUA 5 BUG (BUG-001 s/d BUG-005) 100% PASS!');
  console.log('===========================================');
}

testBugs().catch(err => {
  console.error('Error running bug tests:', err);
  process.exit(1);
});

