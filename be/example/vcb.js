/**
 * Script test đăng nhập đơn giản hơn - Sử dụng thư viện forge (giống common.js)
 * Cài đặt: npm install node-forge
 * Chạy: node test-login-simple.js
 */

const readline = require('readline');
const https = require('https');
const http = require('http');
const forge = require('node-forge');
const fs = require('fs');
const path = require('path');

// Cấu hình - Có thể load từ file config
let CONFIG;
try {
  CONFIG = require('./test-login-config.js');
} catch (e) {
  // Nếu không có config file, dùng default
  CONFIG = {
    baseUrl: 'https://digiapp.vietcombank.com.vn',
    apiPaths: {
      captcha: '/utility-service/v2/captcha/MASS', // Sẽ thêm GUID sau
      login: '/authen-service/v1/login' // ✅ Endpoint đăng nhập thực tế
    },
    timeout: 30000,
    // ✅ KEY ĐÃ TÌM THẤY TỪ ENVIRONMENT CONFIG
    serverPublicKey: 'LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUlJQklqQU5CZ2txaGtpRzl3MEJBUUVGQUFPQ0FROEFNSUlCQ2dLQ0FRRUFpa3FRckl6WkprVXZIaXNqZnU1WkNOK1RMeS8vNDNDSWM1aEpFNzA5VElLM0hiY0M5dnVjMitQUEV0STZwZVNVR3FPbkZvWU93bDNpOHJSZFNhSzE3RzJSWk4wMU1JcVJJSi82YWM5SDRMMTFkdGZRdFI3S0hxRjdLRDBmajZ2VTRrYjUrMGN3UjNSdW1CdkRlTWxCT2FZRXBLd3VFWTlFR3F5OWJjYjVFaE5HYnh4TmZiVWFvZ3V0VndHNUMxZUtZSXR6YVlkNnRhbzNncTdzd05IN3A2VWRsdHJDcHhTd0ZFdmM3ZG91RTJzS3JQRHA4MDdaRzJkRnNsS3h4bVI0V0hESFdmSDBPcHpyQjVLS1dRTnl6WHhUQlhlbHFyV1pFQ0xSeXBOcTdQKzFDeWZnVFNkUTM1ZmRPN00xTW5pU0JUMVYzM0xkaFhvNzMvOXFENWU1VlFJREFRQUIKLS0tLS1FTkQgUFVCTElDIEtFWS0tLS0t',
    crcKey: '6q93-@u9'
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
 * CRC16 implementation - giống trong common.js
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
 * CryptoService - Mô phỏng chính xác từ common.js
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
   * Tạo RSA key pair - giống genKeys() trong common.js
   */
  genKeys() {
    if (!this.keys) {
      console.log('🔑 Đang tạo RSA key pair (1024-bit)...');
      const startTime = Date.now();
      
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
      
      // Tự động lưu private key vào file để dùng sau
      const fs = require('fs');
      const path = require('path');
      const keyFile = path.join(__dirname, 'client-private-key.pem');
      fs.writeFileSync(keyFile, this.clientPrivateKey);
      
      console.log(`\n💾 CLIENT PRIVATE KEY đã được lưu vào: client-private-key.pem`);
      console.log(`⚠️  Lưu ý: Private key này cần để giải mã response từ server!`);
      console.log(`   Mỗi lần request sẽ tạo key pair mới, key cũ sẽ bị ghi đè.`);
    }
  }

  /**
   * Mã hóa request - giống encryptRequest() trong common.js
   */
  encryptRequest(body) {
    // Nếu bỏ qua mã hóa (để test)
    if (this.serverPublicKeyBase64 === 'SKIP_ENCRYPTION') {
      console.log('⚠️  Bỏ qua mã hóa (chế độ test)');
      return body; // Trả về plaintext
    }

    try {
      // 1. Tạo AES key (32 bytes) và IV (16 bytes)
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
      // Giống common.js: l.Buffer.concat([l.Buffer.from(S, "binary"), l.Buffer.from(E.output.data, "binary")])
      // cipher.output.data là string binary trong forge
      const encryptedData = Buffer.concat([
        Buffer.from(iv, 'binary'),
        Buffer.from(cipher.output.data, 'binary') // cipher.output.data là string binary
      ]);

      // 5. Mã hóa AES key bằng RSA public key của server
      // Trong common.js: u.pki.publicKeyFromPem(u.util.decode64(this.defaultPublicKey))
      // Server public key được lưu dưới dạng base64 trong environment
      // ✅ Public key từ ENVIRONMENT config đã là base64 encoded PEM
      let serverPublicKeyPem;
      try {
        // Decode base64 để lấy PEM format (như trong common.js)
        serverPublicKeyPem = forge.util.decode64(this.serverPublicKeyBase64);
      } catch (e) {
        // Nếu không phải base64, dùng trực tiếp (đã là PEM format)
        serverPublicKeyPem = this.serverPublicKeyBase64;
      }
      
      // Đảm bảo có BEGIN/END markers (nếu chưa có)
      if (serverPublicKeyPem.search(/BEGIN PUBLIC KEY/gi) < 0) {
        serverPublicKeyPem = `-----BEGIN PUBLIC KEY-----\n${serverPublicKeyPem}\n-----END PUBLIC KEY-----`;
      }
      
      const serverPublicKey = forge.pki.publicKeyFromPem(serverPublicKeyPem);
      const encryptedAesKey = serverPublicKey.encrypt(forge.util.encode64(aesKey));

      // 6. Trả về kết quả
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
   * Giải mã response - giống decryptResponse() trong common.js dòng 1241-1255
   */
  decryptResponse(responseData) {
    try {
      const { k: encryptedAesKeyBase64, d: encryptedDataBase64 } = responseData;
      
      // 1. Giải mã AES key bằng client private key
      // Giống: E = u.pki.privateKeyFromPem(this.clientPrivateKey)
      //        i = u.util.decodeUtf8(E.decrypt(u.util.decode64(C)))
      const clientPrivateKey = forge.pki.privateKeyFromPem(this.clientPrivateKey);
      const encryptedAesKey = forge.util.decode64(encryptedAesKeyBase64);
      const aesKeyBase64 = forge.util.decodeUtf8(clientPrivateKey.decrypt(encryptedAesKey));
      
      // 2. Decode encrypted data từ base64
      // Giống: p = l.Buffer.from(S, "base64")
      const dataBuffer = Buffer.from(encryptedDataBase64, 'base64');
      
      // 3. Tách IV (16 bytes đầu) và encrypted data
      // Giống: d = p.slice(0, 16), v = p.slice(16)
      const iv = dataBuffer.slice(0, 16);
      const encrypted = dataBuffer.slice(16);
      
      // 4. Giải mã bằng AES-CTR
      // Giống: b = u.cipher.createDecipher("AES-CTR", l.Buffer.from(i, "base64").toString("binary"))
      const aesKeyBinary = Buffer.from(aesKeyBase64, 'base64').toString('binary');
      const decipher = forge.cipher.createDecipher('AES-CTR', aesKeyBinary);
      decipher.start({ iv: iv.toString('binary') });
      decipher.update(forge.util.createBuffer(encrypted));
      decipher.finish();
      
      // 5. Trả về plaintext
      // Giống: u.util.decodeUtf8(b.output.data)
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
 */
function sendRequest(url, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'application/json',
        ...headers
      },
      timeout: CONFIG.timeout,
      rejectUnauthorized: false // Tắt SSL verification cho test (không dùng trong production)
    };

    const req = client.request(options, (res) => {
      const chunks = [];

      res.on('data', (chunk) => {
        chunks.push(chunk);
      });

      res.on('end', () => {
        const responseData = Buffer.concat(chunks);
        
        // Kiểm tra content-type để xử lý đúng
        const contentType = res.headers['content-type'] || '';
        
        // Nếu là image hoặc binary, trả về Buffer
        if (contentType.includes('image/') || contentType.includes('application/octet-stream')) {
          resolve({
            status: res.statusCode,
            data: responseData, // Trả về Buffer cho image
            headers: res.headers,
            raw: responseData // Buffer cho binary data
          });
          return;
        }
        
        // Nếu là text/JSON, convert sang string
        const responseString = responseData.toString('utf8');
        
        // Log raw response để debug (chỉ cho text)
        if (responseString && responseString.length < 1000) {
          console.log('\n📥 RAW RESPONSE STRING:', responseString.substring(0, 500));
        }
        
        // Kiểm tra xem có phải là JSON không
        let jsonData = null;
        if (contentType.includes('application/json')) {
          try {
            if (responseString && responseString.trim()) {
              jsonData = JSON.parse(responseString);
            }
          } catch (e) {
            console.log('⚠️  Response không phải JSON hợp lệ:', e.message);
            jsonData = responseString; // Fallback về string
          }
        } else if (responseString && responseString.trim()) {
          // Thử parse JSON dù không có content-type
          try {
            jsonData = JSON.parse(responseString);
          } catch (e) {
            // Không phải JSON, giữ nguyên string
            jsonData = responseString;
          }
        }
        
        resolve({ 
          status: res.statusCode, 
          data: jsonData !== null ? jsonData : (responseString || {}), 
          headers: res.headers,
          raw: responseString
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

/**
 * Lấy captcha từ server
 * URL format: https://digiapp.vietcombank.com.vn/utility-service/v2/captcha/MASS/{guid}
 */
async function getCaptcha(baseUrl) {
  try {
    console.log('\n📸 Đang lấy captcha từ server...');
    
    // Tạo GUID cho captcha (UUID v4 format)
    const guid = generateGuid();
    const captchaPath = `/utility-service/v2/captcha/MASS/${guid}`;
    const url = `${baseUrl}${captchaPath}`;
    
    console.log(`🌐 Captcha URL: ${url}`);
    
    // Captcha trả về là hình ảnh JPEG, không phải JSON
    const response = await sendRequest(url, 'GET', null, {
      'Accept': 'image/jpeg,image/*,*/*',
      'Referer': baseUrl
    });
    
    if (response.status === 200) {
      // Kiểm tra xem response có phải là Buffer (image) không
      const imageBuffer = Buffer.isBuffer(response.raw) ? response.raw : 
                         Buffer.isBuffer(response.data) ? response.data : null;
      
      if (imageBuffer && imageBuffer.length > 0) {
        console.log('✅ Đã lấy captcha thành công');
        console.log(`📦 Image size: ${imageBuffer.length} bytes`);
        
        // Lưu captcha image để user xem
        const imagePath = path.join(__dirname, 'captcha.jpg');
        fs.writeFileSync(imagePath, imageBuffer);
        console.log(`🖼️  Đã lưu captcha image: ${imagePath}`);
        console.log('👉 Mở file này để xem captcha và nhập giá trị');
        
        return {
          token: guid, // GUID được dùng làm captchaToken
          imageUrl: url,
          imagePath: imagePath
        };
      } else {
        // Response không phải là image
        console.log('⚠️  Response không phải là image binary');
        console.log('   Response data type:', typeof response.data);
        console.log('   Response raw type:', typeof response.raw);
        if (response.data) {
          console.log('   Response data (first 200 chars):', String(response.data).substring(0, 200));
        }
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
 * Tạo GUID (UUID v4) - giống format trong URL
 */
function generateGuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Lấy device info - giống common.js (DT, PM, OV, appVersion)
 */
function getDeviceInfo() {
  const deviceInfo = {
    DT: '',
    PM: '',
    OV: '',
    appVersion: ''
  };
  
  try {
    // Mô phỏng UAParser (trong Node.js không có window)
    // Có thể dùng thư viện ua-parser-js nếu cần chính xác hơn
    const os = require('os');
    const platform = os.platform();
    const release = os.release();
    
    // Mô phỏng device detection
    deviceInfo.DT = platform === 'win32' ? 'WINDOWS' : platform.toUpperCase();
    deviceInfo.PM = `Node.js ${process.version}`;
    deviceInfo.OV = release;
    deviceInfo.appVersion = '';
  } catch (e) {
    console.log('Warning: Could not get device info:', e.message);
  }
  
  return deviceInfo;
}

/**
 * Đăng nhập
 */
async function login(baseUrl, cryptoService, loginData) {
  try {
    console.log('\n🔐 Đang mã hóa và gửi request đăng nhập...');
    
    // Thêm device info (DT, PM, OV, appVersion) - giống common.js
    const deviceInfo = getDeviceInfo();
    const fullLoginData = {
      ...loginData,
      ...deviceInfo
    };
    
    // Log payload trước khi mã hóa
    console.log('\n📤 PAYLOAD TRƯỚC KHI MÃ HÓA:');
    console.log(JSON.stringify(fullLoginData, null, 2));
    
    // Mã hóa request body
    const encryptedData = cryptoService.encryptRequest(fullLoginData);
    
    console.log('\n✅ Đã mã hóa request body');
    console.log(`📦 Encrypted data length: d=${encryptedData.d.length}, k=${encryptedData.k.length}`);
    
    // Log payload sau khi mã hóa
    console.log('\n📤 PAYLOAD SAU KHI MÃ HÓA (sẽ gửi lên server):');
    console.log(JSON.stringify({
      d: encryptedData.d, // Full encrypted data
      k: encryptedData.k,  // Full encrypted key
      d_length: encryptedData.d.length,
      k_length: encryptedData.k.length
    }, null, 2));

    // Tạo headers - giống CHÍNH XÁC common.js dòng 888-891
    const username = loginData.user || '';
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 100);
    
    // X-Request-ID: String(timestamp) + String(random) + crc16(username).toString(16)
    // Giống: String((new Date).getTime()) + String(parseInt((100 * Math.random()).toString())) + s.crc16(O).toString(16)
    const crc16Value = crc16(username);
    const requestId = String(timestamp) + String(random) + crc16Value.toString(16);
    
    // X-Lim-ID: sha256(username + crcKey).toString(16) - FULL 64 chars, KHÔNG substring!
    // Giống: y.sha256(O + N.crcKey).toString(16)
    const crcKey = CONFIG.crcKey || '6q93-@u9'; // ✅ CRC Key từ ENVIRONMENT config
    const limId = cryptoService.sha256(username + crcKey); // Full SHA256 hex (64 chars)

    // Gửi request
    // Endpoint đăng nhập: /authen-service/v1/login
    const loginPath = CONFIG.apiPaths?.login || `/authen-service/v1/login`;
    const url = `${baseUrl}${loginPath}`;
    console.log(`\n🌐 Login URL: ${url}`);
    
    // Log headers trước khi gửi - giống fetch request thực tế
    const headers = {
      'accept': 'application/json, text/plain, */*',
      'accept-language': 'en-US,en;q=0.9,vi;q=0.8',
      'content-type': 'application/json',
      'X-Request-ID': requestId,
      'X-Channel': 'Web',
      'X-Lim-ID': limId,
      'Referer': 'https://vcbdigibank.vietcombank.com.vn/',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    };
    
    console.log('\n📤 REQUEST HEADERS:');
    console.log(JSON.stringify(headers, null, 2));
    console.log(`\n📊 X-Request-ID: ${requestId} (length: ${requestId.length})`);
    console.log(`📊 X-Lim-ID: ${limId} (length: ${limId.length}, should be 64)`);
    
    const response = await sendRequest(url, 'POST', encryptedData, headers);

    console.log(`\n📥 Response status: ${response.status}`);
    
    // Log response chi tiết
    console.log('\n📥 RESPONSE HEADERS:');
    console.log(JSON.stringify(response.headers, null, 2));
    
    // Log raw response string trước
    if (response.raw) {
      console.log('\n📥 RAW RESPONSE STRING:');
      console.log(response.raw.substring(0, 1000) + (response.raw.length > 1000 ? '... (truncated)' : ''));
    }
    
    console.log('\n📥 RESPONSE BODY (parsed):');
    if (response.data && typeof response.data === 'object' && Object.keys(response.data).length > 0) {
      console.log(JSON.stringify(response.data, null, 2));
    } else if (response.data) {
      console.log(response.data);
    } else {
      console.log('(empty or null)');
    }
    
    // Kiểm tra xem response có được mã hóa không (có d và k)
    let decryptedData = response.data;
    if (response.data && 
        typeof response.data === 'object' && 
        Object.prototype.hasOwnProperty.call(response.data, 'd') && 
        Object.prototype.hasOwnProperty.call(response.data, 'k')) {
      console.log('\n🔓 Response được mã hóa, đang giải mã...');
      try {
        const decryptedString = cryptoService.decryptResponse(response.data);
        decryptedData = JSON.parse(decryptedString);
        console.log('\n📥 RESPONSE BODY (đã giải mã):');
        console.log(JSON.stringify(decryptedData, null, 2));
      } catch (error) {
        console.error('❌ Lỗi giải mã response:', error.message);
        console.log('⚠️  Trả về response đã mã hóa');
      }
    } else if (!response.data || (typeof response.data === 'object' && Object.keys(response.data).length === 0)) {
      console.log('\n⚠️  Response body rỗng hoặc không có data');
      console.log('   Có thể server không trả về response body hoặc có lỗi');
    }
    
    // Log raw response nếu có
    if (response.raw && typeof response.raw === 'string' && response.raw !== JSON.stringify(response.data)) {
      console.log('\n📥 RAW RESPONSE (first 1000 chars):');
      console.log(response.raw.substring(0, 1000) + (response.raw.length > 1000 ? '... (truncated)' : ''));
    }
    
    if (response.status === 200) {
      console.log('\n✅ Đăng nhập thành công!');
      return decryptedData;
    } else {
      throw new Error(`Đăng nhập thất bại: ${response.status} - ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.error('❌ Lỗi đăng nhập:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('='.repeat(70));
  console.log('🚀 TEST ĐĂNG NHẬP VỚI MÃ HÓA RSA + AES (Hybrid Encryption)');
  console.log('='.repeat(70));

  try {
    // 1. Nhập thông tin server
    console.log('\n📋 Bước 1: Cấu hình Server');
    const defaultBaseUrl = 'https://digiapp.vietcombank.com.vn';
    const baseUrlInput = await question(`Nhập URL server (Enter để dùng ${defaultBaseUrl}): `);
    const baseUrl = baseUrlInput || defaultBaseUrl;
    console.log(`✅ Sử dụng URL: ${baseUrl}`);
    
    // Lưu ý về JSON bạn cung cấp
    console.log('\n📝 Lưu ý: JSON bạn cung cấp không chứa RSA public key.');
    console.log('   Đó là dữ liệu từ monitoring service (Akamai).');
    console.log('   RSA public key cần lấy từ environment config của server.');

    // 2. Nhập server public key
    console.log('\n🔑 Bước 2: Server Public Key');
    let serverPublicKeyBase64 = CONFIG.serverPublicKey || CONFIG.serverPublicKeyBase64;
    
    if (serverPublicKeyBase64) {
      console.log('✅ Đã có server public key từ config (ENVIRONMENT)');
      console.log(`   Public Key (base64, ${serverPublicKeyBase64.length} ký tự): ${serverPublicKeyBase64.substring(0, 50)}...`);
    } else {
      console.log('⚠️  Không có public key trong config');
      serverPublicKeyBase64 = await question('Nhập server public key (PEM hoặc base64, Enter để bỏ qua mã hóa): ');
      
      if (!serverPublicKeyBase64) {
        console.log('⚠️  Không có public key - sẽ gửi plaintext (chỉ để test, không khuyến nghị)');
        serverPublicKeyBase64 = 'SKIP_ENCRYPTION';
      }
    }

    // 3. Khởi tạo CryptoService
    console.log('\n🔧 Bước 3: Khởi tạo CryptoService');
    const cryptoService = new CryptoService(serverPublicKeyBase64);
    cryptoService.genKeys();

    // 4. Nhập thông tin đăng nhập
    console.log('\n👤 Bước 4: Thông tin đăng nhập');
    const username = await question('Nhập username: ');
    const password = await question('Nhập password: ');

    if (!username || !password) {
      console.log('❌ Username và password không được để trống!');
      rl.close();
      return;
    }

    // 5. Lấy captcha
    console.log('\n📸 Bước 5: Lấy Captcha');
    let captchaData = null;
    try {
      captchaData = await getCaptcha(baseUrl);
      if (captchaData && captchaData.token) {
        console.log(`✅ Captcha token (GUID): ${captchaData.token}`);
      }
      if (captchaData && captchaData.imagePath) {
        console.log(`🖼️  Captcha đã được lưu tại: ${captchaData.imagePath}`);
        console.log('👉 Mở file này để xem captcha và nhập giá trị');
      }
    } catch (error) {
      console.log('⚠️  Không thể lấy captcha tự động, bạn sẽ nhập thủ công');
      console.log(`   URL captcha format: ${baseUrl}/utility-service/v2/captcha/MASS/{guid}`);
      console.log(`   Ví dụ: ${baseUrl}/utility-service/v2/captcha/MASS/58b15f39-e145-9353-97de-06bc6467935a`);
    }

    // 6. Nhập captcha
    console.log('\n🔢 Bước 6: Nhập Captcha');
    const captchaToken = captchaData?.token || await question('Nhập captcha token (nếu có): ');
    const captchaValue = await question('Nhập giá trị captcha (từ hình ảnh): ');

    if (!captchaValue) {
      console.log('❌ Captcha value không được để trống!');
      rl.close();
      return;
    }

    // 7. Browser ID
    const browserId = await question('Nhập browser ID (hoặc Enter để dùng random): ') || 
                      forge.random.getBytesSync(16).toString('hex');
    console.log(`📱 Browser ID: ${browserId}`);

    // 8. Tạo login data
    const loginData = {
      user: username,
      password: password,
      captchaToken: captchaToken || '',
      captchaValue: captchaValue,
      browserId: browserId
    };

    console.log('\n📦 Dữ liệu đăng nhập (trước mã hóa):');
    console.log(JSON.stringify({ 
      ...loginData, 
      password: '***' // Ẩn password
    }, null, 2));

    // 9. Đăng nhập
    console.log('\n🚀 Bước 7: Đăng nhập');
    const result = await login(baseUrl, cryptoService, loginData);

    console.log('\n' + '='.repeat(70));
    console.log('✅ ĐĂNG NHẬP THÀNH CÔNG!');
    console.log('='.repeat(70));
    console.log('\n📊 Kết quả:');
    if (result.sessionId) {
      console.log(`🔑 Session ID: ${result.sessionId}`);
    }
    if (result.userInfo) {
      console.log(`👤 User Info: ${JSON.stringify(result.userInfo, null, 2)}`);
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

