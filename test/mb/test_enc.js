const {
  downloadWasm, wasmEncrypt, buildLoginRequestData,
  generateDeviceId, getTimeNow, getCaptcha, doLogin,
} = require('./mb_encrypt');
const path = require('path');
const fs = require('fs');

async function testFullLogin() {
  const WASM_PATH = path.join(__dirname, 'main.wasm');

  // ===== CẤU HÌNH =====
  const USERNAME = process.argv[2] || 'YOUR_USERNAME';
  const PASSWORD = process.argv[3] || 'YOUR_PASSWORD';
  // =====================

  // 1. Load WASM
  const wasmBytes = await downloadWasm(WASM_PATH);
  console.log('WASM loaded:', wasmBytes.length, 'bytes');

  const deviceId = generateDeviceId();
  console.log('DeviceId:', deviceId);

  // 2. Test encryption
  console.log('\n========== TEST ENCRYPTION ==========');
  const testData = buildLoginRequestData({
    username: USERNAME,
    password: PASSWORD,
    captcha: 'TEST01',
    deviceId,
  });
  console.log('Plaintext body:');
  console.log(JSON.stringify(testData, null, 2));

  const dataEnc = await wasmEncrypt(wasmBytes, testData, '0');
  console.log('\ndataEnc (first 100 chars):', dataEnc.substring(0, 100));
  console.log('dataEnc length:', dataEnc.length);

  // 3. Get Captcha
  console.log('\n========== GET CAPTCHA ==========');
  const captchaRes = await getCaptcha({ deviceId });
  if (captchaRes && captchaRes.imageString) {
    const captchaPath = path.join(__dirname, 'captcha.png');
    fs.writeFileSync(captchaPath, Buffer.from(captchaRes.imageString, 'base64'));
    console.log('Captcha saved to:', captchaPath);
    console.log('=> Mở file captcha.png để xem mã captcha');
  } else {
    console.log('Captcha response:', JSON.stringify(captchaRes, null, 2));
    console.log('(Captcha API có thể cần cookie hoặc IP Việt Nam)');
  }

  // 4. Prompt captcha
  if (USERNAME === 'YOUR_USERNAME') {
    console.log('\n========== SKIP LOGIN (chưa cấu hình username/password) ==========');
    console.log('Chạy: node test_enc.js <username> <password>');
    console.log('Hoặc sửa trực tiếp file test_enc.js');
    return;
  }

  const readline = require('readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const captchaText = await new Promise(resolve => {
    rl.question('\nNhập mã captcha (6 ký tự): ', answer => {
      rl.close();
      resolve(answer.trim());
    });
  });

  // 5. Login
  console.log('\n========== DO LOGIN ==========');
  const result = await doLogin({
    wasmBytes,
    username: USERNAME,
    password: PASSWORD,
    captcha: captchaText,
    deviceId,
  });

  if (result.sessionId) {
    console.log('\n=== ĐĂNG NHẬP THÀNH CÔNG ===');
    console.log('SessionId:', result.sessionId);
  } else {
    console.log('\n=== ĐĂNG NHẬP THẤT BẠI ===');
    console.log('Response:', JSON.stringify(result.response, null, 2));
  }
}

testFullLogin().catch(console.error);
