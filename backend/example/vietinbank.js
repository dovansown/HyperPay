const axios = require('axios');
const qs = require('qs');
const crypto = require('crypto');

// Public key trích từ main.js (module HnrW)
const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDLenQHmHpaqYX4IrRVM8H1uB21
xWuY+clsvn79pMUYR2KwIEfeHcnZFFshjDs3D2ae4KprjkOFZPYzEWzakg2nOIUV
WO+Q6RlAU1+1fxgTvEXi4z7yi+n0Zs0puOycrm8i67jsQfHi+HgdMxCaKzHvbECr
+JWnLxnEl6615hEeMQIDAQAB
-----END PUBLIC KEY-----`;

const BASE_URL = 'https://api-ipay.vietinbank.vn';

function genRequestId() {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let prefix = '';
  for (let i = 0; i < 12; i++) {
    prefix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `${prefix}|${Date.now()}`;
}

function alphabeticalSort(a, b) {
  return a.localeCompare(b);
}

function uuidV4() {
  // Tạo UUID v4 giống thư viện uuid (random-based)
  const rnds = crypto.randomBytes(16);
  rnds[6] = (rnds[6] & 0x0f) | 0x40; // version 4
  rnds[8] = (rnds[8] & 0x3f) | 0x80; // variant 10
  const hex = rnds.toString('hex');
  return (
    hex.slice(0, 8) + '-' +
    hex.slice(8, 12) + '-' +
    hex.slice(12, 16) + '-' +
    hex.slice(16, 20) + '-' +
    hex.slice(20)
  );
}

function signPayload(payload) {
  const normalized = qs.stringify(payload, {
    arrayFormat: 'repeat',
    sort: alphabeticalSort,
  });
  return crypto.createHash('md5').update(normalized).digest('hex');
}

function encryptPayload(payload) {
  // NodeRSA mặc định dùng PKCS1_OAEP với hash SHA1.
  // Key 1024-bit => block 128 bytes, OAEP overhead 2*20 + 2 = 42, dữ liệu tối đa 86 bytes mỗi block.
  const buffer = Buffer.from(JSON.stringify(payload));
  const key = {
    key: PUBLIC_KEY,
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    oaepHash: 'sha1',
  };
  const chunkSize = 86;
  const chunks = [];
  for (let offset = 0; offset < buffer.length; offset += chunkSize) {
    const slice = buffer.slice(offset, offset + chunkSize);
    const enc = crypto.publicEncrypt(key, slice);
    chunks.push(enc);
  }
  return Buffer.concat(chunks).toString('base64');
}

async function login(payloadInput) {
  const {
    lang = 'vi',
    clientInfo,
    browserInfo,
    sessionId,
    requestId,
    ...rest
  } = payloadInput;

  const payload = {
    ...rest,
    lang,
    requestId: requestId || genRequestId(),
    clientInfo: clientInfo || `127.0.0.1;Windows-10`,
    browserInfo: browserInfo || `Chrome-${process.versions.node}`,
  };

  if (sessionId) {
    payload.sessionId = sessionId;
  }

  payload.signature = signPayload(payload);

  console.log(payload)

  const encrypted = encryptPayload(payload);

  const raw = "EQH6UaOxQNCPVuWahDHD1BBZ4EtVHCBLLDy/BvDM2fke3XrGzM3jZobk0zJm7Rnvs3zFi43JkCzvaxqsGpVri+CCRyDS93WrISriexMfPZz1qBjdkoI1h3P34GnQqeGPl+24uPfpTUkmYhVjIIHd73+6Lk3ykOBuTD+yyFrWdDhbfFmslZjLa8CZzGrwc9l7gg+qzs54kB7DrINy19eB9j5QVUkQbx4gbrF/6J2ycoAIFFZ0+Bw1MItGUHj9aTAE+nP+RuvtkKjEZsjPEIQZWnGw7HntcNeADzOdOhzD/GQsOvD5w7HHToHNN9+uFJLwtv/+t7xMkRB5iRfA+GMsOy6YyT1Cwr91ILXZeJzTX5AfEZSNK+UEbUZ+MeYwkCUSsLBZhqcdRlRsJO93adInqmpR7i7l9mZrZPsXKBpE5tbT43XLplcJKybakbyqmKKIlM4cI7NbJKcnXOCjFjOaA64BIrnNJEnRjK6uRwXi6x+Yr9aqlkzpgn9cknO1iEHXPSK6UXmclv3mPkGpWGEgyJG6FmR+mSPUy6TIBI6vj70UbsPOQaMne1A/vmVVu6idsWMC4YfyUgdqOKnebQwGnHwILQ3KtIQOacyNz8/dEXSmKjX2bdiS6hZk1YqAxN2jAsDcaUSs8UeCxQEDNdzgCwP6XjaB0upIc1xwVUEkDaCbMXgE3KrdRrB9HgpXU4l6jfYHYOBFLucFcmFbUxXl5nb79iX58MH0ecTZ/md5ZPRBm08hOdadd+G504TfbezYarDiQi4unvkcO/v9w4DeID0ZW7j9ABdUviFw2KvOC5VVv05eBWn5EzmKx+cwo9Z48+eUJShKFbG92Xspi92OPQ=="

  console.log(encrypted);

  const res = await axios.post(
    `${BASE_URL}/ipay/wa/signIn`,
    { encrypted: encrypted },
    {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        lang: lang,
        Referer: 'https://ipay.vietinbank.vn/',
      },
    },
  );

  return res.data;
}

function randomString(len = 9, noLower, noUpper, noDigit) {
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digit = '0123456789';
  const chars = `${noLower ? '' : lower}${noUpper ? '' : upper}${noDigit ? '' : digit}`;
  let out = '';
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

async function fetchCaptcha(captchaId) {
  const url = `${BASE_URL}/api/get-captcha/${captchaId}`;
  const svg = await axios.get(url, { responseType: 'text' }).then(r => r.data);
  const fs = require('fs');
  const outPath = `captcha-${captchaId}.svg`;
  fs.writeFileSync(outPath, svg, 'utf8');
  console.log(`Đã tải captchaId=${captchaId} và lưu: ${outPath}`);
  console.log(`Mở file hoặc URL sau để xem mã: ${url}`);
  return { svg, outPath, url };
}

async function promptInput(question) {
  const readline = require('readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, answer => {
    rl.close();
    resolve(answer.trim());
  }));
}

// Luồng chạy thử: tự lấy captcha, bạn nhập mã, rồi gọi login.
(async () => {
  try {
    const captchaIdInput = await promptInput('Nhập captchaId (để trống để auto): ');
    const captchaId = captchaIdInput || randomString(9);
    await fetchCaptcha(captchaId);
    const captchaCode = await promptInput('Nhập captcha vừa nhìn thấy: ');

    const result = await login({
      userName: '098831918'.trim(),
      accessCode: '111111'.trim(),
      captchaCode,
      captchaId,
      deviceIdentity: uuidV4(),
      screenResolution: '1358x919',
      clientInfo: '42.117.235.196;Windows-10',
      browserInfo: 'Chrome-143',
      // sessionId: 'nếu có',
      // thêm field khác nếu backend yêu cầu
    });

    console.log(result);
  } catch (err) {
    if (err.response) {
      console.error('API error', err.response.status, err.response.data);
    } else {
      console.error(err);
    }
  }
})();

