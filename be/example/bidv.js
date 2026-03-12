/**
 * Script test đăng nhập BIDV - Thông tin thực tế
 * Cài đặt: npm install node-forge
 * Chạy: node test-login.js
 * 
 * Thông tin thực tế:
 * - Base URL: https://smartbanking.bidv.com.vn
 * - Login: /w2/auth
 * - Captcha: /w2/captcha/{guid}
 * - Headers: x-request-id, authorization, content-type
 * - Request format: {"d": "encrypted_data", "k": "encrypted_key"} (RSA + AES)
 */

// Set biến môi trường để tránh lỗi SSL legacy renegotiation
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
// Thử enable legacy provider nếu có
if (process.versions.node && parseInt(process.versions.node.split('.')[0]) >= 17) {
  try {
    process.env.NODE_OPTIONS = (process.env.NODE_OPTIONS || '') + ' --openssl-legacy-provider';
  } catch (e) {
    // Bỏ qua nếu không thể set
  }
}

const readline = require('readline');
const https = require('https');
const http = require('http');
const tls = require('tls');
const forge = require('node-forge');
const fs = require('fs');
const path = require('path');
const constants = require('constants');
const axios = require('axios');
const crypto = require('crypto');

// Tạo custom HTTPS agent để bypass SSL legacy renegotiation
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
  secureProtocol: 'TLSv1_2_method',
  keepAlive: true,
  keepAliveMsecs: 1000,
  secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
});

// Cấu hình BIDV - Dựa trên phân tích main.js
let CONFIG;
try {
  CONFIG = require('./test-login-config.js');
} catch (e) {
  // Default config - Thông tin thực tế
  CONFIG = {
    baseUrl: 'https://smartbanking.bidv.com.vn',
    apiPaths: {
      captcha: '/w2/captcha', // Sẽ thêm GUID sau
      login: '/w2/auth'
    },
    timeout: 30000,
    // ⚠️ Cần extract từ main.js (tìm base64 string dài)
    serverPublicKey: ''
    // BIDV KHÔNG CẦN CRC Key (khác VCB)
  };
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

/**
 * CRC16 implementation - BIDV KHÔNG dùng CRC16 trong X-Request-ID
 * Chỉ giữ lại để tương thích nếu cần dùng sau
 * X-Request-ID của BIDV chỉ là: timestamp + random (không có CRC)
 */
function crc16(data) {
  let crc = 0xFFFF;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
  }
  return crc & 0xFFFF;
}

/**
 * CryptoService - Dựa trên cơ chế encrypt/decrypt trong main.js
 * Cần phân tích main.js để xác định chính xác thuật toán
 */
class CryptoService {
  constructor(serverPublicKeyBase64) {
    this.serverPublicKeyBase64 = serverPublicKeyBase64;
    this.keys = null;
    this.clientPublicKey = null;
    this.clientPrivateKey = null;
    this.isActive = false;
  }

  /**
   * Tạo RSA key pair
   * ⚠️ Cần kiểm tra main.js xem BIDV dùng key size bao nhiêu
   */
  genKeys() {
    if (!this.keys) {
      console.log('🔑 Đang tạo RSA key pair...');
      const startTime = Date.now();
      
      // Thử 1024-bit trước (phổ biến), có thể cần điều chỉnh
      this.keys = forge.pki.rsa.generateKeyPair({
        bits: 1024,
        workers: 1
      });
      
      this.clientPublicKey = forge.pki.publicKeyToPem(this.keys.publicKey)
        .replace(/(-|(BEGIN|END) PUBLIC KEY|\r|\n)/gi, '');
      this.clientPrivateKey = forge.pki.privateKeyToPem(this.keys.privateKey);
      this.isActive = true;
      
      console.log(`✅ Đã tạo RSA key pair (${Date.now() - startTime}ms)`);
      console.log(`📝 Client Public Key (đã rút gọn): ${this.clientPublicKey.substring(0, 50)}...`);
      
      // Lưu private key
      const keyFile = path.join(__dirname, 'client-private-key.pem');
      fs.writeFileSync(keyFile, this.clientPrivateKey);
      console.log(`💾 CLIENT PRIVATE KEY đã được lưu vào: client-private-key.pem`);
    }
  }

  /**
   * Mã hóa request
   * ⚠️ Cần phân tích main.js để xác định chính xác cơ chế mã hóa của BIDV
   * Có thể khác VCB (RSA+AES, hoặc chỉ RSA, hoặc cơ chế khác)
   */
  encryptRequest(body) {
    if (this.serverPublicKeyBase64 === 'SKIP_ENCRYPTION') {
      console.log('⚠️  Bỏ qua mã hóa (chế độ test)');
      return body;
    }

    if (!this.serverPublicKeyBase64) {
      console.log('⚠️  Không có server public key, gửi plaintext');
      return body;
    }

    try {
      // Thử cơ chế RSA + AES (giống VCB) trước
      // Nếu không đúng, cần phân tích main.js để tìm cơ chế thực tế
      
      // 1. Tạo AES key và IV
      const aesKey = forge.random.getBytesSync(32);
      const iv = forge.random.getBytesSync(16);

      // 2. Thêm clientPubKey vào body
      const requestBody = {
        clientPubKey: this.clientPublicKey,
        ...body
      };

      // 3. Mã hóa bằng AES-CTR
      const cipher = forge.cipher.createCipher('AES-CTR', aesKey);
      cipher.start({ iv: iv });
      cipher.update(forge.util.createBuffer(forge.util.encodeUtf8(JSON.stringify(requestBody))));
      cipher.finish();

      // 4. Kết hợp IV + encrypted data
      const encryptedData = Buffer.concat([
        Buffer.from(iv, 'binary'),
        Buffer.from(cipher.output.data, 'binary')
      ]);

      // 5. Mã hóa AES key bằng RSA public key của server
      let serverPublicKeyPem;
      try {
        serverPublicKeyPem = forge.util.decode64(this.serverPublicKeyBase64);
      } catch (e) {
        serverPublicKeyPem = this.serverPublicKeyBase64;
      }
      
      if (serverPublicKeyPem.search(/BEGIN PUBLIC KEY/gi) < 0) {
        serverPublicKeyPem = `-----BEGIN PUBLIC KEY-----\n${serverPublicKeyPem}\n-----END PUBLIC KEY-----`;
      }
      
      const serverPublicKey = forge.pki.publicKeyFromPem(serverPublicKeyPem);
      const encryptedAesKey = serverPublicKey.encrypt(forge.util.encode64(aesKey));

      // 6. Trả về kết quả
      // ⚠️ Format có thể khác, cần kiểm tra main.js
      return {
        d: encryptedData.toString('base64'),
        k: forge.util.encode64(encryptedAesKey)
      };
    } catch (error) {
      console.error('❌ Lỗi mã hóa:', error.message);
      console.error('   Stack:', error.stack);
      return { d: '', k: '' };
    }
  }

  /**
   * SHA256 hash
   */
  sha256(data) {
    const md = forge.md.sha256.create();
    md.update(data);
    return md.digest().toHex();
  }

  /**
   * Giải mã response
   * ⚠️ Cần phân tích main.js để xác định chính xác
   */
  decryptResponse(responseData) {
    try {
      const { k: encryptedAesKeyBase64, d: encryptedDataBase64 } = responseData;
      
      // 1. Giải mã AES key bằng client private key
      const clientPrivateKey = forge.pki.privateKeyFromPem(this.clientPrivateKey);
      const encryptedAesKey = forge.util.decode64(encryptedAesKeyBase64);
      const aesKeyBase64 = forge.util.decodeUtf8(clientPrivateKey.decrypt(encryptedAesKey));
      
      // 2. Decode encrypted data từ base64
      const dataBuffer = Buffer.from(encryptedDataBase64, 'base64');
      
      // 3. Tách IV (16 bytes đầu) và encrypted data
      const iv = dataBuffer.slice(0, 16);
      const encrypted = dataBuffer.slice(16);
      
      // 4. Giải mã bằng AES-CTR
      const aesKeyBinary = Buffer.from(aesKeyBase64, 'base64').toString('binary');
      const decipher = forge.cipher.createDecipher('AES-CTR', aesKeyBinary);
      decipher.start({ iv: iv.toString('binary') });
      decipher.update(forge.util.createBuffer(encrypted));
      decipher.finish();
      
      // 5. Trả về plaintext
      return forge.util.decodeUtf8(decipher.output.data);
    } catch (error) {
      console.error('❌ Lỗi giải mã response:', error.message);
      console.error('   Stack:', error.stack);
      throw error;
    }
  }
}

/**
 * Gửi HTTP request
 * 
 * Sử dụng axios với custom HTTPS agent để xử lý SSL
 */
async function sendRequest(url, method = 'GET', data = null, headers = {}) {
  try {
    // Xác định responseType
    const contentType = headers['Accept'] || headers['accept'] || '';
    const isImage = contentType.includes('image/') || url.includes('/captcha/');
    
    const config = {
      method: method.toLowerCase(),
      url: url,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        ...headers
      },
      timeout: CONFIG.timeout,
      httpsAgent: httpsAgent, // Dùng custom agent đã tạo
      validateStatus: () => true, // Không throw error cho mọi status code
      maxRedirects: 5
    };
    
    // Set responseType cho image
    if (isImage) {
      config.responseType = 'arraybuffer';
    }
    
    // Thêm data nếu có
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    
    // Xử lý response
    let responseData = response.data;
    
    // Nếu là buffer (image), trả về buffer
    if (Buffer.isBuffer(responseData) || responseData instanceof ArrayBuffer) {
      const buffer = Buffer.isBuffer(responseData) ? responseData : Buffer.from(responseData);
      return {
        status: response.status,
        data: buffer,
        headers: response.headers,
        raw: buffer
      };
    }
    
    // Nếu là text/JSON
    const responseString = typeof responseData === 'string' ? responseData : JSON.stringify(responseData);
    let jsonData = null;
    
    try {
      jsonData = typeof responseData === 'object' && responseData !== null ? responseData : JSON.parse(responseString);
    } catch (e) {
      jsonData = responseString;
    }
    
    return {
      status: response.status,
      data: jsonData !== null ? jsonData : (responseString || {}),
      headers: response.headers,
      raw: responseString
    };
  } catch (error) {
    // Nếu axios fail, throw error với thông tin chi tiết
    if (error.response) {
      // Có response nhưng status code lỗi
      return {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
        raw: typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data)
      };
    }
    throw error;
  }
}

/**
 * Tạo GUID (UUID v4) - Dùng cho captcha URL
 */
function generateGuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Lưu cookie từ response để dùng cho request tiếp theo
let savedCookies = '';

/**
 * Lấy captcha từ server
 * Format: https://smartbanking.bidv.com.vn/w2/captcha/{guid}
 */
async function getCaptcha(baseUrl) {
  try {
    console.log('\n📸 Đang lấy captcha từ server...');
    
    // Tạo GUID cho captcha (UUID v4 format)
    const guid = generateGuid();
    const captchaPath = `${CONFIG.apiPaths?.captcha || '/w2/captcha'}/${guid}`;
    const url = `${baseUrl}${captchaPath}`;
    
    console.log(`🌐 Captcha URL: ${url}`);
    
    const response = await sendRequest(url, 'GET', null, {
      'Accept': 'image/jpeg,image/*,*/*',
      'Referer': baseUrl
    });
    
    // Lưu cookie từ response để dùng cho login
    if (response.headers && response.headers['set-cookie']) {
      savedCookies = Array.isArray(response.headers['set-cookie']) 
        ? response.headers['set-cookie'].join('; ') 
        : response.headers['set-cookie'];
      console.log(`🍪 Đã lưu cookies từ captcha response`);
    } else if (response.headers && response.headers['cookie']) {
      savedCookies = response.headers['cookie'];
      console.log(`🍪 Đã lưu cookies từ captcha response (cookie header)`);
    }
    
    if (response.status === 200) {
      const imageBuffer = Buffer.isBuffer(response.raw) ? response.raw : 
                         Buffer.isBuffer(response.data) ? response.data : null;
      
      if (imageBuffer && imageBuffer.length > 0) {
        console.log('✅ Đã lấy captcha thành công');
        console.log(`📦 Image size: ${imageBuffer.length} bytes`);
        
        const imagePath = path.join(__dirname, 'captcha.jpg');
        fs.writeFileSync(imagePath, imageBuffer);
        console.log(`🖼️  Đã lưu captcha image: ${imagePath}`);
        
        return {
          token: guid, // GUID được dùng làm captchaToken
          imageUrl: url,
          imagePath: imagePath,
          cookies: savedCookies
        };
      } else {
        throw new Error(`Lỗi lấy captcha: Response không phải là image (status: ${response.status})`);
      }
    } else {
      throw new Error(`Lỗi lấy captcha: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Lỗi lấy captcha:', error.message);
    throw error;
  }
}

/**
 * Đăng nhập
 * Format thực tế:
 * - URL: https://smartbanking.bidv.com.vn/w2/auth
 * - Headers: x-request-id, authorization, content-type
 * - Body: {"d": "encrypted_data", "k": "encrypted_key"}
 */
async function login(baseUrl, cryptoService, loginData) {
  try {
    console.log('\n🔐 Đang mã hóa và gửi request đăng nhập...');
    
    const fullLoginData = {
      ...loginData
    };
    
    console.log('\n📤 PAYLOAD TRƯỚC KHI MÃ HÓA:');
    console.log(JSON.stringify(fullLoginData, null, 2));
    
    // Validate các field bắt buộc (theo login() frontend BIDV)
    if (!fullLoginData.user || !fullLoginData.pin) {
      throw new Error('user và pin là bắt buộc');
    }
    if (!fullLoginData.captchaToken || !fullLoginData.captchaValue) {
      throw new Error('captchaToken và captchaValue là bắt buộc');
    }
    
    // Cho phép dùng payload thô (d,k) copy từ network thật để đối chiếu
    const usingRawPayload = CONFIG.rawPayload && CONFIG.rawPayload.d && CONFIG.rawPayload.k;
    let encryptedData;
    if (false) {
      console.log('⚠️  Đang dùng rawPayload từ config (bỏ qua bước mã hóa)');
      encryptedData = {
        d: CONFIG.rawPayload.d,
        k: CONFIG.rawPayload.k
      };
    } else {
      // Mã hóa request body
      encryptedData = cryptoService.encryptRequest(fullLoginData);
    }
    
    if (!encryptedData || !encryptedData.d || !encryptedData.k) {
      throw new Error('Mã hóa thất bại - không có d hoặc k');
    }
    
    console.log('\n✅ Đã mã hóa request body');
    console.log(`📦 Encrypted data length: d=${encryptedData.d?.length || 0}, k=${encryptedData.k?.length || 0}`);
    console.log(`📦 Encrypted d (first 50 chars): ${encryptedData.d.substring(0, 50)}...`);
    console.log(`📦 Encrypted k (first 50 chars): ${encryptedData.k.substring(0, 50)}...`);

    // X-Request-ID format: timestamp + random (ví dụ: 130425930740462)
    // Từ network request thực tế: 130425930740462
    // Có vẻ là: timestamp (13 chữ số) + random (3-4 chữ số)
    // KHÔNG có CRC16 như VCB, chỉ đơn giản là timestamp + random
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000); // 4 chữ số
    const requestId = String(timestamp) + String(random).padStart(4, '0');

    const loginPath = CONFIG.apiPaths?.login || '/w2/auth';
    const url = `${baseUrl}${loginPath}`;
    console.log(`\n🌐 Login URL: ${url}`);
    
    // Headers thực tế từ network request
    // ⚠️ Có thể cần cookie từ lần request trước (captcha)
    const headers = {
      'accept': 'application/json',
      'accept-language': 'vi',
      'authorization': '', // Có thể để trống hoặc cần token
      'content-type': 'application/json',
      'x-request-id': requestId,
      'Referer': `${baseUrl}/dang-nhap`,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    };

    // Cho phép override headers từ config (ví dụ copy nguyên từ network thật)
    if (CONFIG.overrideHeaders && typeof CONFIG.overrideHeaders === 'object') {
      Object.assign(headers, CONFIG.overrideHeaders);
    }
    
    // Thêm cookie nếu có (từ captcha response hoặc config)
    if (savedCookies) {
      headers['Cookie'] = savedCookies;
      console.log(`🍪 Đã thêm cookies vào request: ${savedCookies.substring(0, 50)}...`);
    } else if (CONFIG.cookie) {
      headers['Cookie'] = CONFIG.cookie;
      console.log(`🍪 Đã thêm cookies từ config`);
    }
    
    console.log('\n📤 REQUEST HEADERS:');
    console.log(JSON.stringify(headers, null, 2));
    
    // Log request body sẽ gửi
    console.log('\n📤 REQUEST BODY (sẽ gửi):');
    console.log(JSON.stringify(encryptedData, null, 2));
    
    const response = await sendRequest(url, 'POST', encryptedData, headers);

    console.log(`\n📥 Response status: ${response.status}`);
    console.log('\n📥 RESPONSE HEADERS:');
    console.log(JSON.stringify(response.headers, null, 2));
    
    if (response.raw) {
      console.log('\n📥 RAW RESPONSE STRING:');
      console.log(response.raw.substring(0, 1000) + (response.raw.length > 1000 ? '... (truncated)' : ''));
    }
    
    console.log('\n📥 RESPONSE BODY (parsed):');
    if (response.data) {
      if (typeof response.data === 'object' && Object.keys(response.data).length > 0) {
        console.log(JSON.stringify(response.data, null, 2));
      } else if (typeof response.data === 'string') {
        console.log('Response data (string):', response.data);
        // Thử parse JSON nếu là string
        try {
          const parsed = JSON.parse(response.data);
          console.log('Parsed JSON:', JSON.stringify(parsed, null, 2));
        } catch (e) {
          // Không phải JSON
        }
      } else {
        console.log('Response data:', response.data);
      }
    } else {
      console.log('(empty or null)');
    }
    
    // Nếu status 400, log chi tiết hơn
    if (response.status === 400) {
      console.log('\n⚠️  Status 400 - Bad Request');
      console.log('   Có thể do:');
      console.log('   - Request body format không đúng');
      console.log('   - Thiếu field bắt buộc trong request body');
      console.log('   - Headers không đúng (thiếu cookie, authorization, etc.)');
      console.log('   - Mã hóa không đúng format');
      console.log('   - BrowserId format không đúng');
      console.log('\n💡 Gợi ý:');
      console.log('   - Kiểm tra network request thực tế trong browser để so sánh');
      console.log('   - Xem có cần cookie không');
      console.log('   - Xem có cần field nào khác không (device info, etc.)');
    }
    
    // Kiểm tra xem response có được mã hóa không
    let decryptedData = response.data;
    if (response.data && 
        typeof response.data === 'object' && 
        Object.prototype.hasOwnProperty.call(response.data, 'd') && 
        Object.prototype.hasOwnProperty.call(response.data, 'k')) {
      console.log('\n🔓 Response được mã hóa, đang giải mã...');
      if (usingRawPayload) {
        console.log('⚠️  Đang ở chế độ rawPayload (d,k lấy từ browser thật) nên KHÔNG thể giải mã bằng client private key hiện tại.');
        console.log('    Đây là response được mã hóa bằng clientPubKey của phiên browser, khác với keypair do script tạo.');
      } else {
        try {
          const decryptedString = cryptoService.decryptResponse(response.data);
          decryptedData = JSON.parse(decryptedString);
          console.log('\n📥 RESPONSE BODY (đã giải mã):');
          console.log(JSON.stringify(decryptedData, null, 2));
        } catch (error) {
          console.error('❌ Lỗi giải mã response:', error.message);
        }
      }
    }
    
    if (response.status === 200) {
      console.log('\n✅ Đăng nhập thành công!');
      return decryptedData;
    } else {
      throw new Error(`Đăng nhập thất bại: ${response.status} - ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.error('❌ Lỗi đăng nhập:', error.message);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('='.repeat(70));
  console.log('🚀 TEST ĐĂNG NHẬP BIDV - THÔNG TIN THỰC TẾ');
  console.log('='.repeat(70));
  console.log('\n📝 Thông tin:');
  console.log('   - Base URL: https://smartbanking.bidv.com.vn');
  console.log('   - Login: /w2/auth');
  console.log('   - Captcha: /w2/captcha/{guid}');
  console.log('   - Headers: x-request-id, authorization, content-type');
  console.log('   - Encryption: RSA + AES (giống VCB)');
  console.log('\n⚠️  LƯU Ý VỀ LỖI SSL:');
  console.log('   Nếu gặp lỗi "unsafe legacy renegotiation disabled",');
  console.log('   chạy với biến môi trường:');
  console.log('   Windows CMD: set NODE_OPTIONS=--openssl-legacy-provider && node test-login.js');
  console.log('   Windows PowerShell: $env:NODE_OPTIONS="--openssl-legacy-provider"; node test-login.js');
  console.log('   Linux/Mac: NODE_OPTIONS=--openssl-legacy-provider node test-login.js');

  try {
    // 1. Nhập thông tin server
    console.log('\n📋 Bước 1: Cấu hình Server');
    const defaultBaseUrl = CONFIG.baseUrl || 'https://smartbanking.bidv.com.vn';
    const baseUrlInput = await question(`Nhập URL server (Enter để dùng ${defaultBaseUrl}): `);
    const baseUrl = baseUrlInput || defaultBaseUrl;
    console.log(`✅ Sử dụng URL: ${baseUrl}`);

    // 2. Nhập server public key
    console.log('\n🔑 Bước 2: Server Public Key');
    console.log('💡 Lấy từ environment config của BIDV (base64 encoded PEM)');
    let serverPublicKeyBase64 = CONFIG.serverPublicKey || CONFIG.serverPublicKeyBase64;
    
    if (serverPublicKeyBase64) {
      console.log('✅ Đã có server public key từ config');
      console.log(`   Public Key (base64, ${serverPublicKeyBase64.length} ký tự): ${serverPublicKeyBase64.substring(0, 50)}...`);
    } else {
      serverPublicKeyBase64 = await question('Nhập server public key (PEM hoặc base64, Enter để bỏ qua mã hóa): ');
      
      if (!serverPublicKeyBase64) {
        console.log('⚠️  Không có public key - sẽ gửi plaintext (chỉ để test)');
        serverPublicKeyBase64 = 'SKIP_ENCRYPTION';
      }
    }

    // 3. CRC Key - BIDV KHÔNG CẦN (khác VCB)
    // X-Request-ID của BIDV chỉ là timestamp + random, không có CRC16
    // Bỏ qua bước này

    // 4. Khởi tạo CryptoService
    console.log('\n🔧 Bước 3: Khởi tạo CryptoService');
    const cryptoService = new CryptoService(serverPublicKeyBase64);
    cryptoService.genKeys();

    // 5. Nhập thông tin đăng nhập
    console.log('\n👤 Bước 4: Thông tin đăng nhập');
    const username = await question('Nhập username: ');
    const password = await question('Nhập password: ');

    if (!username || !password) {
      console.log('❌ Username và password không được để trống!');
      rl.close();
      return;
    }

    // 6. Lấy captcha (nếu cần)
    console.log('\n📸 Bước 5: Lấy Captcha');
    let captchaData = null;
    try {
      captchaData = await getCaptcha(baseUrl);
      if (captchaData && captchaData.imagePath) {
        console.log(`🖼️  Captcha đã được lưu tại: ${captchaData.imagePath}`);
        console.log('👉 Mở file này để xem captcha và nhập giá trị');
      }
    } catch (error) {
      console.log('⚠️  Không thể lấy captcha tự động, bạn sẽ nhập thủ công');
    }

    // 7. Nhập captcha
    console.log('\n🔢 Bước 6: Nhập Captcha');
    const captchaToken = captchaData?.token || await question('Nhập captcha token (nếu có): ');
    const captchaValue = await question('Nhập giá trị captcha (từ hình ảnh): ');
    
    // 8. Tạo login data theo đúng BIDV (login() ở frontend)
    // Payload thực tế (t) lấy từ encrypt(t) trên browser:
    // {
    //   clientPubKey, lang, user, pin, captchaToken, captchaValue,
    //   mid, DT, PM, OV, appVersion, E, clientId
    // }
    const loginData = {
      user: username,
      pin: password,
      captchaToken: captchaToken || '',
      captchaValue: captchaValue || '',
      lang: CONFIG.lang || 'vi',
      mid: CONFIG.mid ?? 1,
      DT: CONFIG.DT || 'WINDOWS',
      PM: CONFIG.PM || 'Chrome',
      OV: CONFIG.OV || '143.0.0.0',
      appVersion: CONFIG.appVersion || '3.5.0.51',
      E: CONFIG.E ?? '',
      clientId: CONFIG.clientId ?? ''
    };
    
    console.log('\n📦 Dữ liệu đăng nhập (trước mã hóa):');
    console.log(JSON.stringify({ 
      ...loginData, 
      pin: '***'
    }, null, 2));

    // 10. Đăng nhập
    console.log('\n🚀 Bước 7: Đăng nhập');
    const result = await login(baseUrl, cryptoService, loginData);

    console.log('\n' + '='.repeat(70));
    console.log('✅ ĐĂNG NHẬP THÀNH CÔNG!');
    console.log('='.repeat(70));
    console.log('\n📊 Kết quả:');
    if (result) {
      console.log(JSON.stringify(result, null, 2));
    }

  } catch (error) {
    console.error('\n' + '='.repeat(70));
    console.error('❌ LỖI:', error.message);
    console.error('='.repeat(70));
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
  } finally {
    rl.close();
  }
}

// Kiểm tra thư viện
try {
  require('node-forge');
} catch (e) {
  console.error('❌ Chưa cài đặt thư viện node-forge!');
  console.error('👉 Chạy lệnh: npm install node-forge');
  process.exit(1);
}

// Chạy script
main().catch(console.error);
