async function testUpload() {
  const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' }),
  });
  const { data: { token } } = await loginRes.json();

  const boundary = '----WebKitFormBoundary' + Math.random().toString(16);
  const fileContent = 'dummy image content for testing';
  const body = [
    '--' + boundary,
    'Content-Disposition: form-data; name="file"; filename="test_bukti_transfer.jpg"',
    'Content-Type: image/jpeg',
    '',
    fileContent,
    '--' + boundary + '--',
  ].join('\r\n');

  const uploadRes = await fetch('http://localhost:5000/api/v1/admin/upload?type=payments', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'multipart/form-data; boundary=' + boundary,
    },
    body: body,
  });
  const uploadJson = await uploadRes.json();
  console.log('Upload Test Result:', JSON.stringify(uploadJson, null, 2));

  // Verify file access
  if (uploadJson.success && uploadJson.data.path) {
    const fileRes = await fetch(`http://localhost:5000${uploadJson.data.path}`);
    console.log(`Verify uploaded static file access status: ${fileRes.status}`);
  }
}

testUpload();
