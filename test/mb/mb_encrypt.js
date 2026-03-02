/**
 * MB Bank Login Encryption - Tái tạo hàm tạo dataEnc
 * 
 * Flow mã hóa:
 * 1. Password -> MD5 hash
 * 2. Tạo request body gốc (userId, md5Password, captcha, fingerprint, sessionId, refNo, deviceId)
 * 3. JSON.stringify(body) -> WASM bder(jsonString, "0") -> dataEnc (base64)
 * 
 * WASM file: https://online.mbbank.com.vn/assets/wasm/main.wasm
 * WASM runtime: Go (compiled to WebAssembly)
 */

const crypto = require('crypto');
const https = require('https');
const fs = require('fs');
const path = require('path');

// ==================== HELPERS ====================

function md5(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}

function getTimeNow() {
  const now = new Date();
  const pad = (n, len = 2) => String(n).padStart(len, '0');
  const y = now.getFullYear();
  const M = pad(now.getMonth() + 1);
  const d = pad(now.getDate());
  const h = pad(now.getHours());
  const m = pad(now.getMinutes());
  const s = pad(now.getSeconds());
  const ms = String(now.getMilliseconds()).slice(0, -1) || '0';
  return `${y}${M}${d}${h}${m}${s}${ms}`;
}

function generateDeviceId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let prefix = '';
  for (let i = 0; i < 8; i++) prefix += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}-mbib-0000-0000-${getTimeNow()}`;
}

// ==================== WASM LOADER (Go runtime) ====================

function createGoRuntime() {
  const TextEncoderUnicode = new TextEncoder("utf-8");
  const TextDecoderUnicode = new TextDecoder("utf-8");

  // Minimal fs polyfill
  if (!globalThis.fs) {
    let data = "";
    globalThis.fs = {
      constants: { O_WRONLY: -1, O_RDWR: -1, O_CREAT: -1, O_TRUNC: -1, O_APPEND: -1, O_EXCL: -1 },
      writeSync(fd, buffer) {
        data += TextDecoderUnicode.decode(buffer);
        const indexEOL = data.lastIndexOf("\n");
        if (indexEOL !== -1) { data = data.substring(indexEOL + 1); }
        return buffer.length;
      },
      write(fd, buffer, offset, length, position, callback) {
        if (offset === 0 && length === buffer.length && position === null) callback(null, this.writeSync(fd, buffer));
        else callback(new Error("not implemented"));
      },
      fsync(fd, callback) { callback(null); },
    };
  }
  if (!globalThis.process) {
    globalThis.process = { getuid: () => -1, getgid: () => -1, geteuid: () => -1, getegid: () => -1, pid: -1, ppid: -1 };
  }

  // Fake window/location for WASM
  const fakeWindow = { globalThis, document: { welovemb: true } };
  globalThis.window = fakeWindow;
  globalThis.location = new URL("https://online.mbbank.com.vn/pl/login");

  class Go {
    constructor() {
      this.argv = ["js"];
      this.env = {};
      this.exit = (code) => { if (code !== 0) console.warn("WASM exit:", code); };
      this._exitPromise = new Promise(r => { this._resolveExitPromise = r; });
      this._pendingEvent = null;
      this._scheduledTimeouts = new Map();
      this._nextCallbackTimeoutID = 1;

      const setMemoryValue = (addr, val) => {
        this.mem.setUint32(addr, val, true);
        this.mem.setUint32(addr + 4, Math.floor(val / 0x100000000), true);
      };

      const getValueFromMemory = (addr) => {
        const f = this.mem.getFloat64(addr, true);
        if (f === 0) return undefined;
        if (!isNaN(f)) return f;
        return this._values[this.mem.getUint32(addr, true)];
      };

      const setValueInMemory = (addr, val) => {
        if (typeof val === "number" && val !== 0) {
          if (isNaN(val)) { this.mem.setUint32(addr + 4, 0x7ff80000, true); this.mem.setUint32(addr, 0, true); }
          else this.mem.setFloat64(addr, val, true);
          return;
        }
        if (val === undefined) { this.mem.setFloat64(addr, 0, true); return; }
        let id = this._ids.get(val);
        if (id === undefined) {
          id = this._idPool.pop();
          if (id === undefined) id = this._values.length;
          this._values[id] = val;
          this._goRefCounts[id] = 0;
          this._ids.set(val, id);
        }
        this._goRefCounts[id]++;
        let typeFlag = 0;
        switch (typeof val) {
          case "object": if (val !== null) typeFlag = 1; break;
          case "string": typeFlag = 2; break;
          case "symbol": typeFlag = 3; break;
          case "function": typeFlag = 4; break;
        }
        this.mem.setUint32(addr + 4, 0x7ff80000 | typeFlag, true);
        this.mem.setUint32(addr, id, true);
      };

      const getByteArrayFromMemory = (addr) => {
        const start = this.mem.getUint32(addr, true) + 0x100000000 * this.mem.getInt32(addr + 4, true);
        const len = this.mem.getUint32(addr + 8, true) + 0x100000000 * this.mem.getInt32(addr + 12, true);
        return new Uint8Array(this._inst.exports.mem.buffer, start, len);
      };

      const getArrayFromMemory = (addr) => {
        const start = this.mem.getUint32(addr, true) + 0x100000000 * this.mem.getInt32(addr + 4, true);
        const len = this.mem.getUint32(addr + 8, true) + 0x100000000 * this.mem.getInt32(addr + 12, true);
        const arr = new Array(len);
        for (let i = 0; i < len; i++) arr[i] = getValueFromMemory(start + 8 * i);
        return arr;
      };

      const getStringFromMemory = (addr) => {
        const start = this.mem.getUint32(addr, true) + 0x100000000 * this.mem.getInt32(addr + 4, true);
        const len = this.mem.getUint32(addr + 8, true) + 0x100000000 * this.mem.getInt32(addr + 12, true);
        return TextDecoderUnicode.decode(new DataView(this._inst.exports.mem.buffer, start, len));
      };

      const timeDiff = Date.now() - performance.now();

      this.importObject = {
        _gotest: { add: (a, b) => a + b },
        gojs: {
          "runtime.wasmExit": (sp) => {
            sp >>>= 0;
            this.exited = true;
            delete this._inst;
            delete this._values;
            delete this._goRefCounts;
            delete this._ids;
            delete this._idPool;
            this.exit(this.mem.getInt32(sp + 8, true));
          },
          "runtime.wasmWrite": (sp) => {
            sp >>>= 0;
            const fd = this.mem.getInt64 ? this.mem.getInt64(sp + 8, true) : this.mem.getUint32(sp + 8, true);
            const p = this.mem.getUint32(sp + 16, true) + 0x100000000 * this.mem.getInt32(sp + 20, true);
            const n = this.mem.getInt32(sp + 24, true);
            globalThis.fs.writeSync(fd, new Uint8Array(this._inst.exports.mem.buffer, p, n));
          },
          "runtime.resetMemoryDataView": (sp) => {
            this.mem = new DataView(this._inst.exports.mem.buffer);
          },
          "runtime.nanotime1": (sp) => {
            sp >>>= 0;
            setMemoryValue(sp + 8, (timeDiff + performance.now()) * 1e6);
          },
          "runtime.walltime": (sp) => {
            sp >>>= 0;
            const ms = new Date().getTime();
            setMemoryValue(sp + 8, ms / 1000);
            this.mem.setInt32(sp + 16, (ms % 1000) * 1e6, true);
          },
          "runtime.scheduleTimeoutEvent": (sp) => {
            sp >>>= 0;
            const id = this._nextCallbackTimeoutID++;
            this._scheduledTimeouts.set(id, setTimeout(() => {
              this._resume();
              while (this._scheduledTimeouts.has(id)) {
                console.warn("scheduleTimeoutEvent: missed timeout event");
                this._resume();
              }
            }, this.mem.getInt64 ? this.mem.getInt64(sp + 8, true) : this.mem.getUint32(sp + 8, true) + 1));
            this.mem.setInt32(sp + 16, id, true);
          },
          "runtime.clearTimeoutEvent": (sp) => {
            sp >>>= 0;
            const id = this.mem.getInt32(sp + 8, true);
            clearTimeout(this._scheduledTimeouts.get(id));
            this._scheduledTimeouts.delete(id);
          },
          "runtime.getRandomData": (sp) => {
            sp >>>= 0;
            crypto.getRandomValues(getByteArrayFromMemory(sp + 8));
          },
          "syscall/js.finalizeRef": (sp) => {
            sp >>>= 0;
            const id = this.mem.getUint32(sp + 8, true);
            this._goRefCounts[id]--;
            if (this._goRefCounts[id] === 0) {
              const val = this._values[id];
              this._values[id] = null;
              this._ids.delete(val);
              this._idPool.push(id);
            }
          },
          "syscall/js.stringVal": (sp) => {
            sp >>>= 0;
            setValueInMemory(sp + 24, getStringFromMemory(sp + 8));
          },
          "syscall/js.valueGet": (sp) => {
            sp >>>= 0;
            const result = Reflect.get(getValueFromMemory(sp + 8), getStringFromMemory(sp + 16));
            sp = this._inst.exports.getsp() >>> 0;
            setValueInMemory(sp + 32, result);
          },
          "syscall/js.valueSet": (sp) => {
            sp >>>= 0;
            Reflect.set(getValueFromMemory(sp + 8), getStringFromMemory(sp + 16), getValueFromMemory(sp + 32));
          },
          "syscall/js.valueDelete": (sp) => {
            sp >>>= 0;
            Reflect.deleteProperty(getValueFromMemory(sp + 8), getStringFromMemory(sp + 16));
          },
          "syscall/js.valueIndex": (sp) => {
            sp >>>= 0;
            setValueInMemory(sp + 24, Reflect.get(getValueFromMemory(sp + 8), this.mem.getUint32(sp + 16, true)));
          },
          "syscall/js.valueSetIndex": (sp) => {
            sp >>>= 0;
            Reflect.set(getValueFromMemory(sp + 8), this.mem.getUint32(sp + 16, true), getValueFromMemory(sp + 24));
          },
          "syscall/js.valueCall": (sp) => {
            sp >>>= 0;
            try {
              const obj = getValueFromMemory(sp + 8);
              const method = Reflect.get(obj, getStringFromMemory(sp + 16));
              const args = getArrayFromMemory(sp + 32);
              const result = Reflect.apply(method, obj, args);
              sp = this._inst.exports.getsp() >>> 0;
              setValueInMemory(sp + 56, result);
              this.mem.setUint8(sp + 64, 1);
            } catch (e) {
              sp = this._inst.exports.getsp() >>> 0;
              setValueInMemory(sp + 56, e);
              this.mem.setUint8(sp + 64, 0);
            }
          },
          "syscall/js.valueInvoke": (sp) => {
            sp >>>= 0;
            try {
              const fn = getValueFromMemory(sp + 8);
              const args = getArrayFromMemory(sp + 16);
              const result = Reflect.apply(fn, undefined, args);
              sp = this._inst.exports.getsp() >>> 0;
              setValueInMemory(sp + 40, result);
              this.mem.setUint8(sp + 48, 1);
            } catch (e) {
              sp = this._inst.exports.getsp() >>> 0;
              setValueInMemory(sp + 40, e);
              this.mem.setUint8(sp + 48, 0);
            }
          },
          "syscall/js.valueNew": (sp) => {
            sp >>>= 0;
            try {
              const ctor = getValueFromMemory(sp + 8);
              const args = getArrayFromMemory(sp + 16);
              const result = Reflect.construct(ctor, args);
              sp = this._inst.exports.getsp() >>> 0;
              setValueInMemory(sp + 40, result);
              this.mem.setUint8(sp + 48, 1);
            } catch (e) {
              sp = this._inst.exports.getsp() >>> 0;
              setValueInMemory(sp + 40, e);
              this.mem.setUint8(sp + 48, 0);
            }
          },
          "syscall/js.valueLength": (sp) => {
            sp >>>= 0;
            setMemoryValue(sp + 16, parseInt(getValueFromMemory(sp + 8).length));
          },
          "syscall/js.valuePrepareString": (sp) => {
            sp >>>= 0;
            const str = TextEncoderUnicode.encode(String(getValueFromMemory(sp + 8)));
            setValueInMemory(sp + 16, str);
            setMemoryValue(sp + 24, str.length);
          },
          "syscall/js.valueLoadString": (sp) => {
            sp >>>= 0;
            const str = getValueFromMemory(sp + 8);
            getByteArrayFromMemory(sp + 16).set(str);
          },
          "syscall/js.valueInstanceOf": (sp) => {
            sp >>>= 0;
            this.mem.setUint8(sp + 24, getValueFromMemory(sp + 8) instanceof getValueFromMemory(sp + 16) ? 1 : 0);
          },
          "syscall/js.copyBytesToGo": (sp) => {
            sp >>>= 0;
            const dst = getByteArrayFromMemory(sp + 8);
            const src = getValueFromMemory(sp + 32);
            if (!(src instanceof Uint8Array || src instanceof Uint8ClampedArray)) {
              this.mem.setUint8(sp + 48, 0); return;
            }
            const toCopy = src.subarray(0, dst.length);
            dst.set(toCopy);
            setMemoryValue(sp + 40, toCopy.length);
            this.mem.setUint8(sp + 48, 1);
          },
          "syscall/js.copyBytesToJS": (sp) => {
            sp >>>= 0;
            const dst = getValueFromMemory(sp + 8);
            const src = getByteArrayFromMemory(sp + 16);
            if (!(dst instanceof Uint8Array || dst instanceof Uint8ClampedArray)) {
              this.mem.setUint8(sp + 48, 0); return;
            }
            const toCopy = src.subarray(0, dst.length);
            dst.set(toCopy);
            setMemoryValue(sp + 40, toCopy.length);
            this.mem.setUint8(sp + 48, 1);
          },
          "debug": (val) => console.log(val),
        },
      };
    }

    async run(instance) {
      if (!(instance instanceof WebAssembly.Instance)) throw new Error("WebAssembly.Instance expected");
      this._inst = instance;
      this.mem = new DataView(this._inst.exports.mem.buffer);
      this._values = [NaN, 0, null, true, false, globalThis, this];
      this._goRefCounts = new Array(this._values.length).fill(Infinity);
      this._ids = new Map([[0, 1], [null, 2], [true, 3], [false, 4], [globalThis, 5], [this, 6]]);
      this._idPool = [];
      this.exited = false;

      let offset = 4096;
      const strAddr = (s) => {
        const addr = offset;
        const enc = TextEncoderUnicode.encode(s + "\0");
        new Uint8Array(this.mem.buffer, offset, enc.length).set(enc);
        offset += enc.length;
        if (offset % 8 !== 0) offset += 8 - (offset % 8);
        return addr;
      };

      const argc = this.argv.length;
      const argvPtrs = [];
      this.argv.forEach(a => argvPtrs.push(strAddr(a)));
      argvPtrs.push(0);
      Object.keys(this.env).sort().forEach(k => argvPtrs.push(strAddr(`${k}=${this.env[k]}`)));
      argvPtrs.push(0);

      const argv = offset;
      argvPtrs.forEach(p => {
        this.mem.setUint32(offset, p, true);
        this.mem.setUint32(offset + 4, 0, true);
        offset += 8;
      });

      this._inst.exports.run(argc, argv);
      if (this.exited) this._resolveExitPromise();
      await this._exitPromise;
    }

    _resume() {
      if (this.exited) throw new Error("Go program has already exited");
      this._inst.exports.resume();
      if (this.exited) this._resolveExitPromise();
    }

    _makeFuncWrapper(id) {
      const self = this;
      return function () {
        const event = { id, this: this, args: arguments };
        self._pendingEvent = event;
        self._resume();
        return event.result;
      };
    }
  }

  return Go;
}

// ==================== WASM DOWNLOAD ====================

function downloadWasm(savePath) {
  return new Promise((resolve, reject) => {
    if (savePath && fs.existsSync(savePath)) {
      console.log('Loading WASM from cache:', savePath);
      resolve(fs.readFileSync(savePath));
      return;
    }

    console.log('Downloading WASM from MB Bank...');
    https.get('https://online.mbbank.com.vn/assets/wasm/main.wasm', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
        'Referer': 'https://online.mbbank.com.vn/',
      }
    }, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        if (savePath) {
          fs.writeFileSync(savePath, buf);
          console.log('WASM saved to:', savePath);
        }
        resolve(buf);
      });
      res.on('error', reject);
    }).on('error', reject);
  });
}

// ==================== ENCRYPT via WASM ====================

async function wasmEncrypt(wasmBytes, requestData, dftKey = '0') {
  const Go = createGoRuntime();
  const go = new Go();
  const { instance } = await WebAssembly.instantiate(wasmBytes, go.importObject);

  // go.run() starts the Go program but never resolves (WASM stays alive).
  // The sync part of run() sets up globalThis.bder before returning the promise.
  go.run(instance);

  // Wait a tick for the WASM init to settle
  await new Promise(r => setTimeout(r, 50));

  if (typeof globalThis.bder !== 'function') {
    throw new Error('WASM failed to export bder function. globalThis.bder = ' + typeof globalThis.bder);
  }

  const jsonStr = typeof requestData === 'string' ? requestData : JSON.stringify(requestData);
  const result = globalThis.bder(jsonStr, dftKey);

  if (!result) {
    throw new Error('bder returned empty result');
  }

  return result;
}

// ==================== BUILD LOGIN REQUEST ====================

function buildLoginRequestData({ username, password, captcha, deviceId, refNo }) {
  return {
    userId: username,
    password: md5(password),
    captcha: captcha || '',
    ibAuthen2fa498: 'c7a1beebb9400375bb187daa33de9659',
    sessionId: null,
    refNo: refNo || `${username}-${getTimeNow()}`,
    deviceIdCommon: deviceId || generateDeviceId(),
  };
}

// ==================== HTTP REQUEST HELPER ====================

function httpsRequest(url, options, body) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'POST',
      headers: options.headers || {},
    };

    const req = https.request(reqOptions, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: raw,
          json() { try { return JSON.parse(raw); } catch { return null; } },
        });
      });
    });

    req.on('error', reject);
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

// ==================== GET CAPTCHA ====================

async function getCaptcha({ deviceId, refNo }) {
  const rId = refNo || `captcha-${getTimeNow()}`;

  const headers = {
    'Accept': 'application/json, text/plain, */*',
    'Authorization': 'Basic RU1CUkVUQUlMV0VCOlNEMjM0ZGZnMzQlI0BGR0AzNHNmc2RmNDU4NDNm',
    'Content-Type': 'application/json; charset=UTF-8',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
    'app': 'MB_WEB',
    'Referer': 'https://online.mbbank.com.vn/pl/login?returnUrl=%2F',
    'Origin': 'https://online.mbbank.com.vn',
    'Deviceid': deviceId,
    'Refno': rId,
    'X-Request-Id': rId,
    'elastic-apm-traceparent': `00-${crypto.randomBytes(16).toString('hex')}-${crypto.randomBytes(8).toString('hex')}-01`,
  };

  const body = JSON.stringify({ refNo: rId, deviceIdCommon: deviceId });

  const res = await httpsRequest(
    'https://online.mbbank.com.vn/api/retail-internetbankingms/getCaptchaImage',
    { method: 'POST', headers },
    body,
  );

  return res.json();
}

// ==================== DO LOGIN ====================

async function doLogin({ wasmBytes, username, password, captcha, deviceId }) {
  const rId = `${username}-${getTimeNow()}`;
  deviceId = deviceId || generateDeviceId();

  const requestData = buildLoginRequestData({
    username,
    password,
    captcha: captcha || '',
    deviceId,
    refNo: rId,
  });

  console.log('\n--- Data TRƯỚC mã hóa ---');
  console.log(JSON.stringify(requestData, null, 2));

  const dataEnc = await wasmEncrypt(wasmBytes, requestData, '0');
  console.log('\n--- dataEnc ---');
  console.log(dataEnc.substring(0, 80) + '...');

  const headers = {
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9,vi;q=0.8',
    'Authorization': 'Basic RU1CUkVUQUlMV0VCOlNEMjM0ZGZnMzQlI0BGR0AzNHNmc2RmNDU4NDNm',
    'Content-Type': 'application/json; charset=UTF-8',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
    'app': 'MB_WEB',
    'Referer': 'https://online.mbbank.com.vn/pl/login?returnUrl=%2F',
    'Origin': 'https://online.mbbank.com.vn',
    'Deviceid': deviceId,
    'Refno': rId,
    'X-Request-Id': rId,
    'elastic-apm-traceparent': `00-${crypto.randomBytes(16).toString('hex')}-${crypto.randomBytes(8).toString('hex')}-01`,
  };

  const body = JSON.stringify({ dataEnc });

  console.log('\n--- Gửi request doLogin ---');
  console.log('URL: https://online.mbbank.com.vn/api/retail_web/internetbanking/v2.0/doLogin');
  console.log('DeviceId:', deviceId);
  console.log('RefNo:', rId);
  console.log('Body length:', body.length);

  const res = await httpsRequest(
    'https://online.mbbank.com.vn/api/retail_web/internetbanking/v2.0/doLogin',
    { method: 'POST', headers },
    body,
  );

  console.log('\n--- Response ---');
  console.log('Status:', res.statusCode);

  const json = res.json();
  if (json) {
    console.log('Result:', JSON.stringify(json.result || json, null, 2));
    if (json.sessionId) console.log('SessionId:', json.sessionId);
  } else {
    console.log('Raw:', res.body.substring(0, 500));
  }

  return { response: json, deviceId, sessionId: json?.sessionId };
}

// ==================== MAIN ====================

async function main() {
  const WASM_PATH = path.join(__dirname, 'main.wasm');

  // ===== CẤU HÌNH: THAY BẰNG THÔNG TIN THẬT =====
  const USERNAME = 'YOUR_USERNAME';
  const PASSWORD = 'YOUR_PASSWORD';
  // ================================================

  // 1. Load WASM
  const wasmBytes = await downloadWasm(WASM_PATH);
  console.log('WASM loaded, size:', wasmBytes.length, 'bytes\n');

  const deviceId = generateDeviceId();
  console.log('DeviceId:', deviceId);

  // 2. Lấy captcha
  console.log('\n========== BƯỚC 1: GET CAPTCHA ==========');
  const captchaRes = await getCaptcha({ deviceId });
  if (captchaRes && captchaRes.imageString) {
    const captchaImgPath = path.join(__dirname, 'captcha.png');
    fs.writeFileSync(captchaImgPath, Buffer.from(captchaRes.imageString, 'base64'));
    console.log('Captcha image saved to:', captchaImgPath);
    console.log('Hãy mở file captcha.png, đọc mã và nhập vào bên dưới.');
  } else {
    console.log('Captcha response:', JSON.stringify(captchaRes, null, 2));
  }

  // 3. Nhập captcha từ console
  const readline = require('readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const captchaText = await new Promise(resolve => {
    rl.question('\nNhập mã captcha (6 ký tự): ', answer => {
      rl.close();
      resolve(answer.trim());
    });
  });

  if (!captchaText || captchaText.length < 1) {
    console.log('Bỏ qua captcha, thử login không captcha...');
  }

  // 4. Login
  console.log('\n========== BƯỚC 2: LOGIN ==========');
  const loginResult = await doLogin({
    wasmBytes,
    username: USERNAME,
    password: PASSWORD,
    captcha: captchaText,
    deviceId,
  });

  if (loginResult.sessionId) {
    console.log('\n✓ Đăng nhập thành công!');
    console.log('SessionId:', loginResult.sessionId);
  } else {
    console.log('\n✗ Đăng nhập thất bại. Xem response ở trên.');
  }
}

// Export for use as module
module.exports = {
  md5,
  getTimeNow,
  generateDeviceId,
  downloadWasm,
  wasmEncrypt,
  buildLoginRequestData,
  createGoRuntime,
  httpsRequest,
  getCaptcha,
  doLogin,
};

// Run demo if executed directly
if (require.main === module) {
  main().catch(console.error);
}
