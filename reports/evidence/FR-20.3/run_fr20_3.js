#!/usr/bin/env node
/**
 * run_fr20_3.js — Bộ thực thi kiểm thử tự động API cho FR-20.3: Mobile: Thanh toán (Checkout) và Áp mã giảm giá
 *
 * Tuân thủ quy định hw02_test_executor:
 * - Clean DB Fixture: Mỗi ca chạy trên SQLite sạch độc lập (.hw02_fr20_3_run.sqlite).
 * - Không làm ảnh hưởng CSDL chính của hệ thống (backend/database.sqlite).
 * - Test Oracle: Xác minh đa tầng (mã HTTP, discount_amount, final_amount, trạng thái đơn hàng pending, xóa giỏ hàng, tồn kho).
 * - 100% tiếng Việt có dấu trong mã nguồn, log và bảng kết quả.
 * - Tự động xuất file kết quả: <out>.json và <out>.md.
 */

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const BACKEND_DIR = path.resolve(__dirname, '../../../backend');
const TEMP_DB_FILE = path.join(BACKEND_DIR, '.hw02_fr20_3_run.sqlite');
const OUTPUT_PATH = process.argv[2] || path.join(__dirname, 'run_api_1');
const JWT_SECRET = 'supersecretjwtkeyforhw02testing12345';

const sqlite3 = require(path.join(BACKEND_DIR, 'node_modules/sqlite3')).verbose();

const SEED_USER_EMAIL = 'test@eshop.com';
const SEED_USER_PASSWORD = 'Test1234!';
const ADMIN_USER_EMAIL = 'admin@eshop.com';
const ADMIN_USER_PASSWORD = 'Admin123!';
const ADDR_NOM = '123 Lê Lợi, Phường Bến Thành, Quận 1, TP.HCM';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// ============================================================================
// 1. QUẢN LÝ TIẾN TRÌNH & CƠ SỞ DỮ LIỆU ĐỘC LẬP (CLEAN DB FIXTURE)
// ============================================================================
let serverProcess = null;

function killExistingServerOnPort3000() {
  try {
    execSync(
      'powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }"',
      { stdio: 'ignore' }
    );
  } catch {}
}

function removeTemporaryDatabaseFiles() {
  for (const ext of ['', '-journal', '-wal', '-shm']) {
    try {
      fs.unlinkSync(TEMP_DB_FILE + ext);
    } catch {}
  }
}

function runSqlOnTempDb(sql, params = []) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(TEMP_DB_FILE, err => {
      if (err) return reject(err);
      db.run(sql, params, function (runErr) {
        db.close(() => {
          if (runErr) return reject(runErr);
          resolve({ lastID: this ? this.lastID : null, changes: this ? this.changes : 0 });
        });
      });
    });
  });
}

function queryAllOnTempDb(sql, params = []) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(TEMP_DB_FILE, err => {
      if (err) return reject(err);
      db.all(sql, params, (qErr, rows) => {
        db.close(() => {
          if (qErr) return reject(qErr);
          resolve(rows || []);
        });
      });
    });
  });
}

async function stopBackendProcess() {
  if (!serverProcess) return;
  const proc = serverProcess;
  serverProcess = null;
  await new Promise(resolve => {
    proc.once('exit', () => resolve());
    try {
      proc.kill('SIGKILL');
    } catch {
      resolve();
    }
    setTimeout(resolve, 500);
  });
  // Đảm bảo cổng 3000 đã thực sự đóng trước khi tiếp tục
  for (let i = 0; i < 20; i++) {
    try {
      await fetch(`${BASE_URL}/api/products`);
      await sleep(40);
    } catch {
      break;
    }
  }
}

async function startBackendWithEnv(customEnv) {
  await stopBackendProcess();
  serverProcess = spawn(process.execPath, ['server.js'], {
    cwd: BACKEND_DIR,
    env: { ...process.env, JWT_SECRET, ...customEnv },
    stdio: 'ignore',
  });

  for (let attempt = 0; attempt < 80; attempt++) {
    await sleep(60);
    try {
      const ping = await fetch(`${BASE_URL}/api/products`);
      if (ping.ok) return;
    } catch {}
  }
  throw new Error('Backend không thể khởi động kịp thời hạn.');
}

let isInitialDbSeeded = false;

async function prepareFreshDatabaseFixture() {
  if (!isInitialDbSeeded) {
    killExistingServerOnPort3000();
    await sleep(200);
    removeTemporaryDatabaseFiles();
    await startBackendWithEnv({ DB_PATH: TEMP_DB_FILE });

    for (let attempt = 0; attempt < 40; attempt++) {
      const checkLogin = await sendHttpRequest(
        'POST',
        '/api/login',
        {
          email: SEED_USER_EMAIL,
          password: SEED_USER_PASSWORD,
        },
        true
      );
      if (checkLogin.status === 200) {
        isInitialDbSeeded = true;
        break;
      }
      await sleep(100);
    }
    if (!isInitialDbSeeded) return false;
  }

  // Dừng tiến trình server.js trước khi thao tác SQLite để tránh xung đột khóa DB và xóa sạch userCarts trong RAM
  await stopBackendProcess();

  // Làm sạch trạng thái đơn hàng & lịch sử dùng mã giảm giá, chuẩn hóa giá sản phẩm 1 (250,000 ₫) & sản phẩm 2 (100,000 ₫)
  await runSqlOnTempDb(`DELETE FROM orders`);
  await runSqlOnTempDb(`DELETE FROM coupon_usage`);
  await runSqlOnTempDb(`UPDATE products SET price = 250000 WHERE id = 1`);
  await runSqlOnTempDb(`UPDATE products SET price = 100000 WHERE id = 2`);

  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  await runSqlOnTempDb(
    `INSERT OR IGNORE INTO coupons (code, type, discount_value, min_order_amount, expired_at, is_active, max_uses_per_user)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['INACTIVE10', 'percent', 10, 100000, '2099-12-31', 0, 1]
  );
  await runSqlOnTempDb(
    `INSERT OR REPLACE INTO coupons (id, code, type, discount_value, min_order_amount, expired_at, is_active, max_uses_per_user)
     VALUES ((SELECT id FROM coupons WHERE code = 'FREE350'), ?, ?, ?, ?, ?, ?, ?)`,
    ['FREE350', 'fixed', 350000, 200000, '2099-12-31', 1, 1]
  );
  await runSqlOnTempDb(
    `INSERT OR REPLACE INTO coupons (id, code, type, discount_value, min_order_amount, expired_at, is_active, max_uses_per_user)
     VALUES ((SELECT id FROM coupons WHERE code = 'EXP_YESTERDAY'), ?, ?, ?, ?, ?, ?, ?)`,
    ['EXP_YESTERDAY', 'fixed', 50000, 100000, yesterday, 1, 1]
  );
  await runSqlOnTempDb(
    `INSERT OR REPLACE INTO coupons (id, code, type, discount_value, min_order_amount, expired_at, is_active, max_uses_per_user)
     VALUES ((SELECT id FROM coupons WHERE code = 'EXP_TOMORROW'), ?, ?, ?, ?, ?, ?, ?)`,
    ['EXP_TOMORROW', 'fixed', 50000, 100000, tomorrow, 1, 1]
  );

  // Khởi động lại server.js với bộ nhớ giỏ hàng (userCarts) rỗng hoàn toàn
  await startBackendWithEnv({ DB_PATH: TEMP_DB_FILE });
  return true;
}

// ============================================================================
// 2. TẦNG GIAO TIẾP HTTP & TEST ORACLE
// ============================================================================
let capturedHttpCalls = [];

const formatPayloadDisplay = obj =>
  JSON.stringify(obj, (key, value) => {
    if (typeof value === 'string' && value.length > 60) {
      return value.slice(0, 20) + `…(${value.length} ký tự)`;
    }
    return value;
  });

const truncateString = (str, maxLen = 150) => {
  if (!str) return '';
  return str.length > maxLen ? str.slice(0, maxLen) + '…' : str;
};

async function sendHttpRequest(method, endpoint, payload, quiet = false, customHeaders = {}) {
  let status = null;
  let responseText = '';
  const headers = { 'Content-Type': 'application/json', ...customHeaders };

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers,
      body: payload === undefined ? undefined : JSON.stringify(payload),
    });
    status = res.status;
    responseText = await res.text();
  } catch (err) {
    responseText = 'ERR ' + err.message;
  }

  let parsedJson = null;
  try {
    parsedJson = JSON.parse(responseText);
  } catch {}

  if (!quiet) {
    let authHeaderPart = '';
    if (headers['Authorization']) {
      const maskedAuth = headers['Authorization'].startsWith('Bearer ')
        ? 'Bearer <JWT_TOKEN>'
        : headers['Authorization'];
      authHeaderPart = ` -Headers @{ Authorization = "${maskedAuth}" }`;
    }
    capturedHttpCalls.push({
      method,
      path: endpoint,
      status,
      response: responseText,
      powershellCmd: `Invoke-WebRequest -Uri "${BASE_URL}${endpoint}" -Method ${method} -ContentType 'application/json'${authHeaderPart} -Body '${
        payload === undefined ? '' : formatPayloadDisplay(payload)
      }' -SkipHttpErrorCheck`,
    });
  }
  return { status, text: responseText, json: parsedJson };
}

const isHttp2xx = res => res.status >= 200 && res.status < 300;
const isHttp4xx = res => res.status >= 400 && res.status < 500;

async function loginUser(email = SEED_USER_EMAIL, password = SEED_USER_PASSWORD) {
  const res = await sendHttpRequest('POST', '/api/login', { email, password }, true);
  return {
    token: res.json && res.json.token ? res.json.token : null,
    user: res.json && res.json.user ? res.json.user : { id: 2 },
  };
}

async function setupCartItems(token, items = [{ product_id: 1, quantity: 2 }]) {
  for (const item of items) {
    const price = item.product_id === 2 ? 100000 : 250000;
    await sendHttpRequest(
      'POST',
      '/api/cart',
      { id: item.product_id, product_id: item.product_id, name: `Sản phẩm #${item.product_id}`, price, quantity: item.quantity },
      true,
      { Authorization: `Bearer ${token}` }
    );
  }
}

async function fetchOrders(token) {
  const res = await sendHttpRequest('GET', '/api/orders/my-orders', undefined, true, {
    Authorization: `Bearer ${token}`,
  });
  return Array.isArray(res.json) ? res.json : [];
}

async function fetchCart(token) {
  const res = await sendHttpRequest('GET', '/api/cart', undefined, true, {
    Authorization: `Bearer ${token}`,
  });
  return Array.isArray(res.json) ? res.json : [];
}

async function verifyCouponSuccessOracle(ctx, res, expectedDiscount, expectedFinal) {
  const errors = [];
  if (!isHttp2xx(res)) {
    errors.push(`Kỳ vọng HTTP 200 OK khi áp mã hợp lệ, thực tế nhận HTTP ${res.status} (${truncateString(res.text, 80)})`);
    return errors;
  }
  const actualDiscount = res.json ? Number(res.json.discount_amount) : NaN;
  const actualFinal = res.json ? Number(res.json.final_amount) : NaN;
  ctx.oracleLogs.push(`discount_amount=${actualDiscount}, final_amount=${actualFinal}`);

  if (Math.abs(actualDiscount - expectedDiscount) > 0.01) {
    errors.push(`Sai discount_amount: kỳ vọng ${expectedDiscount}, thực tế ${actualDiscount}`);
  }
  if (Math.abs(actualFinal - expectedFinal) > 0.01) {
    errors.push(`Sai final_amount: kỳ vọng ${expectedFinal}, thực tế ${actualFinal}`);
  }
  return errors;
}

async function verifyCheckoutSuccessOracle(ctx, token, ordersBefore, res, expectedTotal, expectedAddress) {
  const errors = [];
  if (!isHttp2xx(res)) {
    errors.push(`Kỳ vọng HTTP 200 OK khi thanh toán hợp lệ, thực tế nhận HTTP ${res.status} (${truncateString(res.text, 80)})`);
    return errors;
  }
  const ordersAfter = await fetchOrders(token);
  const cartAfter = await fetchCart(token);
  // GET /api/orders/my-orders sắp xếp ORDER BY id DESC nên đơn mới nhất nằm ở phần tử đầu tiên (ordersAfter[0])
  const latestOrder = ordersAfter.length > ordersBefore.length ? ordersAfter[0] : null;

  ctx.oracleLogs.push(
    `Đơn hàng: ${ordersBefore.length} -> ${ordersAfter.length}${
      latestOrder
        ? ` (id=${latestOrder.id}, status=${latestOrder.status}, total=${latestOrder.total_amount}, addrLen=${
            latestOrder.shipping_address ? String(latestOrder.shipping_address).length : 0
          })`
        : ''
    }; Giỏ hàng sau checkout: ${cartAfter.length} mục`
  );

  if (ordersAfter.length !== ordersBefore.length + 1 || !latestOrder) {
    errors.push(`Kỳ vọng tăng đúng 1 đơn hàng mới, thực tế từ ${ordersBefore.length} -> ${ordersAfter.length}`);
    return errors;
  }
  if (latestOrder.status !== 'pending') {
    errors.push(`Kỳ vọng đơn hàng mới có status='pending', thực tế '${latestOrder.status}'`);
  }
  if (Math.abs(Number(latestOrder.total_amount) - expectedTotal) > 0.01) {
    errors.push(`Sai total_amount lưu trong đơn hàng: kỳ vọng ${expectedTotal}, thực tế ${latestOrder.total_amount}`);
  }
  if (expectedAddress !== null && latestOrder.shipping_address !== expectedAddress) {
    errors.push(
      `Sai shipping_address: kỳ vọng độ dài ${expectedAddress.length}, thực tế '${truncateString(
        String(latestOrder.shipping_address),
        40
      )}'`
    );
  }
  if (cartAfter.length !== 0) {
    errors.push(`Vi phạm FR-08 dòng 106 (R6): Sau khi thanh toán thành công, giỏ hàng không được làm rỗng (còn ${cartAfter.length} mục)`);
  }
  return errors;
}

async function verifyCheckoutRejectedOracle(ctx, token, ordersBefore, cartBefore, res, expectedStatusList = [400, 401, 403]) {
  const errors = [];
  if (!expectedStatusList.includes(res.status)) {
    errors.push(`Kỳ vọng HTTP ${expectedStatusList.join('/')} khi từ chối thanh toán, thực tế nhận HTTP ${res.status}`);
  }
  const ordersAfter = await fetchOrders(token);
  const cartAfter = await fetchCart(token);
  ctx.oracleLogs.push(`Đơn hàng: ${ordersBefore.length} -> ${ordersAfter.length}; Giỏ hàng: ${cartBefore.length} -> ${cartAfter.length}`);

  if (ordersAfter.length !== ordersBefore.length) {
    errors.push(`Vi phạm OC-ORDER-NO: Yêu cầu không hợp lệ nhưng vẫn tạo thêm ${ordersAfter.length - ordersBefore.length} đơn hàng rác trong DB`);
  }
  return errors;
}

// ============================================================================
// 3. ĐỊNH NGHĨA TOÀN BỘ 54 TEST CASE CỦA FR-20.3
// ============================================================================
const testCases = [];

// --- NHÓM EP HỢP LỆ (EP-TC01 -> EP-TC04) ---
testCases.push({
  id: 'EP-TC01',
  covers: 'EC01, EC06, EC17, EC27, EC35',
  desc: 'Đặt hàng hợp lệ không dùng mã giảm giá (giỏ 500,000 ₫, địa chỉ chuẩn 44 ký tự)',
  kind: 'API',
  expected: 'OC-CHECKOUT-OK(500000, ADDR_NOM): HTTP 200, tạo đơn status="pending", total_amount=500000, xóa rỗng giỏ hàng (FR-08, FR-20.3)',
  executeFn: async ctx => {
    const { token } = await loginUser();
    await setupCartItems(token, [{ product_id: 1, quantity: 2 }]);
    const ordersBefore = await fetchOrders(token);
    const res = await sendHttpRequest(
      'POST',
      '/api/checkout',
      { total_amount: 500000, shipping_address: ADDR_NOM },
      false,
      { Authorization: `Bearer ${token}` }
    );
    return verifyCheckoutSuccessOracle(ctx, token, ordersBefore, res, 500000, ADDR_NOM);
  },
});

testCases.push({
  id: 'EP-TC02',
  covers: 'EC01, EC08, EC14, EC23, EC33, EC35',
  desc: 'Áp mã SAVE10 (percent 10%) hợp lệ trên đơn 500,000 ₫ rồi tiến hành Đặt hàng liên thông (Q3)',
  kind: 'API',
  expected: 'Bước 1: OC-COUPON-OK(50000, 450000); Bước 2: OC-CHECKOUT-OK(450000, ADDR_NOM), xóa rỗng giỏ hàng (FR-09, FR-08, Q3)',
  executeFn: async ctx => {
    const { token, user } = await loginUser();
    await setupCartItems(token, [{ product_id: 1, quantity: 2 }]);
    const ordersBefore = await fetchOrders(token);

    const couponRes = await sendHttpRequest(
      'POST',
      '/api/apply-coupon',
      { code: 'SAVE10', total_amount: 500000, user_id: user.id },
      false,
      { Authorization: `Bearer ${token}` }
    );
    const errors = await verifyCouponSuccessOracle(ctx, couponRes, 50000, 450000);

    const checkoutRes = await sendHttpRequest(
      'POST',
      '/api/checkout',
      { total_amount: 450000, shipping_address: ADDR_NOM },
      false,
      { Authorization: `Bearer ${token}` }
    );
    errors.push(...(await verifyCheckoutSuccessOracle(ctx, token, ordersBefore, checkoutRes, 450000, ADDR_NOM)));
    return errors;
  },
});

testCases.push({
  id: 'EP-TC03',
  covers: 'EC01, EC10, EC15, EC23, EC34',
  desc: 'Áp mã BIGBUY (fixed 50,000 ₫, ngưỡng 500,000 ₫) hợp lệ trên đơn 600,000 ₫',
  kind: 'API',
  expected: 'OC-COUPON-OK(50000, 550000): HTTP 200, discount_amount=50000, final_amount=550000 (FR-09 dòng 125-126, 131)',
  executeFn: async ctx => {
    const { token, user } = await loginUser();
    const res = await sendHttpRequest(
      'POST',
      '/api/apply-coupon',
      { code: 'BIGBUY', total_amount: 600000, user_id: user.id },
      false,
      { Authorization: `Bearer ${token}` }
    );
    return verifyCouponSuccessOracle(ctx, res, 50000, 550000);
  },
});

testCases.push({
  id: 'EP-TC04',
  covers: 'EC01, EC08, EC16, EC25, EC34',
  desc: 'Áp mã VIP100 (fixed 100,000 ₫, max_uses_per_user = 2) ở lần sử dụng thứ 2 (usage_count = 1 < 2)',
  kind: 'API',
  expected: 'OC-COUPON-OK(100000, 400000): HTTP 200, lần dùng thứ 2 vẫn hợp lệ vì max_uses_per_user=2 (FR-09 dòng 120, 132)',
  executeFn: async ctx => {
    const { token, user } = await loginUser();
    // Lần dùng thứ 1 (áp mã + ghi nhận lượt dùng qua /api/coupon-usage như Mobile App)
    const firstCoupon = await sendHttpRequest(
      'POST',
      '/api/apply-coupon',
      { code: 'VIP100', total_amount: 500000, user_id: user.id },
      true,
      { Authorization: `Bearer ${token}` }
    );
    const couponId = firstCoupon.json && firstCoupon.json.coupon_id ? firstCoupon.json.coupon_id : 3;
    await sendHttpRequest(
      'POST',
      '/api/coupon-usage',
      { coupon_id: couponId },
      true,
      { Authorization: `Bearer ${token}` }
    );
    // Lần dùng thứ 2 (usage_count = 1 < 2)
    const res = await sendHttpRequest(
      'POST',
      '/api/apply-coupon',
      { code: 'VIP100', total_amount: 500000, user_id: user.id },
      false,
      { Authorization: `Bearer ${token}` }
    );
    return verifyCouponSuccessOracle(ctx, res, 100000, 400000);
  },
});

// --- NHÓM EP CÔ LẬP LỖI XÁC THỰC V1 & C4 (EP-TC05 -> EP-TC08) ---
testCases.push({
  id: 'EP-TC05',
  covers: 'EC02, EC36',
  desc: 'Gọi POST /api/apply-coupon khi chưa đăng nhập (không gửi Header Authorization) — vi phạm C4',
  kind: 'API',
  expected: 'REJ-COUPON (401 Unauthorized): Bắt buộc có JWT Token hợp lệ theo điều kiện C4 (README dòng 119, SEC-02, Q2)',
  executeFn: async ctx => {
    const res = await sendHttpRequest('POST', '/api/apply-coupon', {
      code: 'SAVE10',
      total_amount: 500000,
      user_id: 2,
    });
    ctx.oracleLogs.push(`Phản hồi khi không có JWT Header: HTTP ${res.status}`);
    const errors = [];
    if (res.status !== 401 && res.status !== 403) {
      errors.push(
        `Vi phạm điều kiện C4 (README dòng 119) & SEC-02: Gọi /api/apply-coupon không có JWT Token nhưng vẫn trả HTTP ${res.status} (${truncateString(res.text, 80)})`
      );
    }
    return errors;
  },
});

testCases.push({
  id: 'EP-TC06',
  covers: 'EC03, EC36',
  desc: 'Gọi POST /api/apply-coupon với Header Authorization: Bearer token.gia.mao — vi phạm C4',
  kind: 'API',
  expected: 'REJ-COUPON (401/403): Từ chối JWT Token giả mạo theo điều kiện C4 (README dòng 119, SEC-02, Q2)',
  executeFn: async ctx => {
    const res = await sendHttpRequest(
      'POST',
      '/api/apply-coupon',
      { code: 'SAVE10', total_amount: 500000, user_id: 2 },
      false,
      { Authorization: 'Bearer token.gia.mao' }
    );
    ctx.oracleLogs.push(`Phản hồi khi gửi JWT giả mạo: HTTP ${res.status}`);
    const errors = [];
    if (res.status !== 401 && res.status !== 403) {
      errors.push(
        `Vi phạm điều kiện C4 (README dòng 119) & SEC-02: Gửi JWT giả mạo nhưng /api/apply-coupon vẫn trả HTTP ${res.status}`
      );
    }
    return errors;
  },
});

testCases.push({
  id: 'EP-TC07',
  covers: 'EC04, EC36',
  desc: 'Gọi POST /api/apply-coupon khi user_id=null hoặc mạo danh user_id=1 khác với chủ sở hữu JWT (user_id=2)',
  kind: 'API',
  expected: 'REJ-COUPON (400/403): Từ chối khi thiếu user_id hoặc mạo danh user_id của người khác (C4, C5, Q2)',
  executeFn: async ctx => {
    const { token } = await loginUser();
    const resNull = await sendHttpRequest(
      'POST',
      '/api/apply-coupon',
      { code: 'SAVE10', total_amount: 500000, user_id: null },
      false,
      { Authorization: `Bearer ${token}` }
    );
    const resSpoof = await sendHttpRequest(
      'POST',
      '/api/apply-coupon',
      { code: 'SAVE10', total_amount: 500000, user_id: 1 },
      false,
      { Authorization: `Bearer ${token}` }
    );
    ctx.oracleLogs.push(`user_id=null -> HTTP ${resNull.status}; mạo danh user_id=1 -> HTTP ${resSpoof.status}`);
    const errors = [];
    if (!isHttp4xx(resNull)) {
      errors.push(`Kỳ vọng 4xx khi user_id=null, thực tế nhận HTTP ${resNull.status}`);
    }
    if (!isHttp4xx(resSpoof)) {
      errors.push(`Vi phạm C4/C5 (IDOR): User 2 mạo danh user_id=1 trong body vẫn được chấp nhận HTTP ${resSpoof.status}`);
    }
    return errors;
  },
});

testCases.push({
  id: 'EP-TC08',
  covers: 'EC05, EC37',
  desc: 'Gọi POST /api/checkout khi không gửi Header Authorization',
  kind: 'API',
  expected: 'REJ-CHECKOUT (401 Unauthorized + OC-ORDER-NO) (FR-08 dòng 104, SEC-02)',
  executeFn: async ctx => {
    const { token } = await loginUser();
    await setupCartItems(token, [{ product_id: 1, quantity: 2 }]);
    const ordersBefore = await fetchOrders(token);
    const cartBefore = await fetchCart(token);

    const res = await sendHttpRequest('POST', '/api/checkout', {
      total_amount: 500000,
      shipping_address: ADDR_NOM,
    });
    return verifyCheckoutRejectedOracle(ctx, token, ordersBefore, cartBefore, res, [401, 403]);
  },
});

// --- NHÓM EP CÔ LẬP LỖI GIỎ HÀNG & TỔNG TIỀN V2 / C3 / R5 (EP-TC09 -> EP-TC13) ---
testCases.push({
  id: 'EP-TC09',
  covers: 'EC07, EC37',
  desc: 'Gọi POST /api/checkout khi giỏ hàng trống (0 sản phẩm trong CSDL)',
  kind: 'API',
  expected: 'REJ-CHECKOUT (400 Bad Request + OC-ORDER-NO): Không cho phép tạo đơn hàng khi giỏ hàng rỗng (FR-08 dòng 104)',
  executeFn: async ctx => {
    const { token } = await loginUser();
    await setupCartItems(token, []); // Giỏ hàng rỗng
    const ordersBefore = await fetchOrders(token);
    const cartBefore = await fetchCart(token);

    const res = await sendHttpRequest(
      'POST',
      '/api/checkout',
      { total_amount: 500000, shipping_address: ADDR_NOM },
      false,
      { Authorization: `Bearer ${token}` }
    );
    return verifyCheckoutRejectedOracle(ctx, token, ordersBefore, cartBefore, res, [400]);
  },
});

testCases.push({
  id: 'EP-TC10',
  covers: 'EC09, EC36',
  desc: 'Áp mã SAVE10 khi tổng tiền đơn hàng chưa đạt mức tối thiểu (total_amount = 200,000 < 300,000 ₫) — vi phạm C3',
  kind: 'API',
  expected: 'REJ-COUPON (400 Bad Request): Từ chối vì 200,000 < min_order_amount 300,000 (FR-09 C3 dòng 118, 130)',
  executeFn: async ctx => {
    const { token, user } = await loginUser();
    const res = await sendHttpRequest(
      'POST',
      '/api/apply-coupon',
      { code: 'SAVE10', total_amount: 200000, user_id: user.id },
      false,
      { Authorization: `Bearer ${token}` }
    );
    ctx.oracleLogs.push(`total=200000 với SAVE10 (min=300000) -> HTTP ${res.status}`);
    return isHttp4xx(res) ? [] : [`Kỳ vọng HTTP 400 khi vi phạm C3 (200000 < 300000), thực tế nhận HTTP ${res.status}`];
  },
});

testCases.push({
  id: 'EP-TC11',
  covers: 'EC11, EC36',
  desc: 'Áp mã BIGBUY khi tổng tiền đơn hàng chưa đạt ngưỡng 500,000 ₫ (total_amount = 400,000 < 500,000 ₫) — vi phạm C3',
  kind: 'API',
  expected: 'REJ-COUPON (400 Bad Request): Từ chối vì 400,000 < min_order_amount 500,000 (FR-09 C3 dòng 118, 131)',
  executeFn: async ctx => {
    const { token, user } = await loginUser();
    const res = await sendHttpRequest(
      'POST',
      '/api/apply-coupon',
      { code: 'BIGBUY', total_amount: 400000, user_id: user.id },
      false,
      { Authorization: `Bearer ${token}` }
    );
    ctx.oracleLogs.push(`total=400000 với BIGBUY (min=500000) -> HTTP ${res.status}`);
    return isHttp4xx(res) ? [] : [`Kỳ vọng HTTP 400 khi vi phạm C3 (400000 < 500000), thực tế nhận HTTP ${res.status}`];
  },
});

testCases.push({
  id: 'EP-TC12',
  covers: 'EC12, EC36',
  desc: 'Áp mã SAVE10 với total_amount âm (-100,000 ₫)',
  kind: 'API',
  expected: 'REJ-COUPON (400 Bad Request): Tổng tiền âm không hợp lệ (FR-09 C3 dòng 118)',
  executeFn: async ctx => {
    const { token, user } = await loginUser();
    const res = await sendHttpRequest(
      'POST',
      '/api/apply-coupon',
      { code: 'SAVE10', total_amount: -100000, user_id: user.id },
      false,
      { Authorization: `Bearer ${token}` }
    );
    ctx.oracleLogs.push(`total=-100000 -> HTTP ${res.status}`);
    return isHttp4xx(res) ? [] : [`Kỳ vọng HTTP 400 khi total_amount=-100000, thực tế nhận HTTP ${res.status}`];
  },
});

testCases.push({
  id: 'EP-TC13',
  covers: 'EC13, EC37',
  desc: 'Client gửi total_amount = 1,000 ₫ gian lận khi giỏ hàng thực tế là 500,000 ₫ tại POST /api/checkout (vi phạm R5)',
  kind: 'API',
  expected: 'Từ chối 400 Bad Request hoặc Backend tự tính lại đúng 500,000 ₫ từ giỏ hàng; tuyệt đối không lưu đơn 1,000 ₫ (FR-08 dòng 107)',
  executeFn: async ctx => {
    const { token } = await loginUser();
    await setupCartItems(token, [{ product_id: 1, quantity: 2 }]); // Thực tế 500,000 ₫
    const ordersBefore = await fetchOrders(token);

    const res = await sendHttpRequest(
      'POST',
      '/api/checkout',
      { total_amount: 1000, shipping_address: ADDR_NOM },
      false,
      { Authorization: `Bearer ${token}` }
    );
    const ordersAfter = await fetchOrders(token);
    const latestOrder = ordersAfter.length > ordersBefore.length ? ordersAfter[0] : null;
    ctx.oracleLogs.push(
      `HTTP ${res.status}; Đơn mới lưu total_amount=${latestOrder ? latestOrder.total_amount : 'không tạo'}`
    );

    if (isHttp4xx(res)) return [];
    if (latestOrder && Number(latestOrder.total_amount) === 500000) return [];
    return [
      `Vi phạm FR-08 dòng 107 (R5): Backend chấp nhận nguyên xi total_amount=1000 gian lận từ client thay vì tự tính lại 500000 ₫ từ giỏ hàng`,
    ];
  },
});

// --- NHÓM EP CÔ LẬP LỖI MÃ COUPON V3 / C1 / C2 (EP-TC14 -> EP-TC18) ---
testCases.push({
  id: 'EP-TC14',
  covers: 'EC18, EC36',
  desc: 'Áp mã giảm giá không tồn tại trong hệ thống (code = "NOTEXIST99") — vi phạm C1 vế 1',
  kind: 'API',
  expected: 'REJ-COUPON (400/404): Từ chối vì mã không tồn tại (FR-09 C1 dòng 116)',
  executeFn: async ctx => {
    const { token, user } = await loginUser();
    const res = await sendHttpRequest(
      'POST',
      '/api/apply-coupon',
      { code: 'NOTEXIST99', total_amount: 500000, user_id: user.id },
      false,
      { Authorization: `Bearer ${token}` }
    );
    ctx.oracleLogs.push(`code="NOTEXIST99" -> HTTP ${res.status}`);
    return isHttp4xx(res) ? [] : [`Kỳ vọng 4xx khi mã không tồn tại, thực tế nhận HTTP ${res.status}`];
  },
});

testCases.push({
  id: 'EP-TC15',
  covers: 'EC19, EC36',
  desc: 'Áp mã giảm giá tồn tại nhưng đang bị vô hiệu hóa (code = "INACTIVE10", is_active = 0) — vi phạm C1 vế 2',
  kind: 'API',
  expected: 'REJ-COUPON (400 Bad Request): Từ chối vì mã có is_active = 0 (FR-09 C1 dòng 116, Q5)',
  executeFn: async ctx => {
    const { token, user } = await loginUser();
    const res = await sendHttpRequest(
      'POST',
      '/api/apply-coupon',
      { code: 'INACTIVE10', total_amount: 500000, user_id: user.id },
      false,
      { Authorization: `Bearer ${token}` }
    );
    ctx.oracleLogs.push(`code="INACTIVE10" (is_active=0) -> HTTP ${res.status}`);
    return isHttp4xx(res) ? [] : [`Vi phạm C1 (is_active=1): Mã có is_active=0 vẫn được chấp nhận HTTP ${res.status}`];
  },
});

testCases.push({
  id: 'EP-TC16',
  covers: 'EC20, EC36',
  desc: 'Áp mã giảm giá đã hết hạn (code = "EXPIRED", expired_at = 2020-01-01 < NOW) — vi phạm C2',
  kind: 'API',
  expected: 'REJ-COUPON (400 Bad Request): Từ chối vì mã đã hết hạn theo điều kiện C2 (FR-09 dòng 117, 133)',
  executeFn: async ctx => {
    const { token, user } = await loginUser();
    const res = await sendHttpRequest(
      'POST',
      '/api/apply-coupon',
      { code: 'EXPIRED', total_amount: 500000, user_id: user.id },
      false,
      { Authorization: `Bearer ${token}` }
    );
    ctx.oracleLogs.push(`code="EXPIRED" (expired_at=2020-01-01) -> HTTP ${res.status} (${truncateString(res.text, 80)})`);
    return isHttp4xx(res)
      ? []
      : [
          `Vi phạm điều kiện C2 (README dòng 117, 133): Mã "EXPIRED" (hết hạn từ 2020-01-01) vẫn được áp dụng thành công HTTP ${res.status}`,
        ];
  },
});

testCases.push({
  id: 'EP-TC17',
  covers: 'EC21, EC36',
  desc: 'Áp mã giảm giá rỗng (code = "")',
  kind: 'API',
  expected: 'REJ-COUPON (400 Bad Request): Mã giảm giá rỗng phải bị từ chối (FR-09 C1)',
  executeFn: async ctx => {
    const { token, user } = await loginUser();
    const res = await sendHttpRequest(
      'POST',
      '/api/apply-coupon',
      { code: '', total_amount: 500000, user_id: user.id },
      false,
      { Authorization: `Bearer ${token}` }
    );
    ctx.oracleLogs.push(`code="" -> HTTP ${res.status}`);
    return isHttp4xx(res) ? [] : [`Kỳ vọng 4xx khi code="", thực tế nhận HTTP ${res.status}`];
  },
});

testCases.push({
  id: 'EP-TC18',
  covers: 'EC22, EC36',
  desc: 'Áp mã giảm giá chỉ gồm khoảng trắng (code = "     ")',
  kind: 'API',
  expected: 'REJ-COUPON (400 Bad Request): Chuỗi khoảng trắng phải bị từ chối (FR-09 C1, Q6)',
  executeFn: async ctx => {
    const { token, user } = await loginUser();
    const res = await sendHttpRequest(
      'POST',
      '/api/apply-coupon',
      { code: '     ', total_amount: 500000, user_id: user.id },
      false,
      { Authorization: `Bearer ${token}` }
    );
    ctx.oracleLogs.push(`code="     " -> HTTP ${res.status}`);
    return isHttp4xx(res) ? [] : [`Kỳ vọng 4xx khi code toàn khoảng trắng, thực tế nhận HTTP ${res.status}`];
  },
});

// --- NHÓM EP CÔ LẬP GIỚI HẠN SỐ LẦN SỬ DỤNG V4 / C5 (EP-TC19 -> EP-TC20) ---
testCases.push({
  id: 'EP-TC19',
  covers: 'EC24, EC36',
  desc: 'Áp mã SAVE10 lần thứ 2 sau khi cùng user đã dùng 1 lần (vượt max_uses_per_user = 1) — vi phạm C5',
  kind: 'API',
  expected: 'REJ-COUPON (400 Bad Request): Từ chối vì usage_count = 1 >= max_uses_per_user (1) theo điều kiện C5 (README dòng 120, 130, Q4)',
  executeFn: async ctx => {
    const { token, user } = await loginUser();
    await setupCartItems(token, [{ product_id: 1, quantity: 2 }]);
    // Lần 1: áp mã + đặt hàng + ghi nhận coupon_usage
    const cp1 = await sendHttpRequest(
      'POST',
      '/api/apply-coupon',
      { code: 'SAVE10', total_amount: 500000, user_id: user.id },
      true,
      { Authorization: `Bearer ${token}` }
    );
    await sendHttpRequest(
      'POST',
      '/api/checkout',
      { total_amount: 450000, shipping_address: ADDR_NOM },
      true,
      { Authorization: `Bearer ${token}` }
    );
    await sendHttpRequest(
      'POST',
      '/api/coupon-usage',
      { coupon_id: cp1.json && cp1.json.coupon_id ? cp1.json.coupon_id : 1 },
      true,
      { Authorization: `Bearer ${token}` }
    );

    // Lần 2: cùng user_id=2 gọi áp lại mã SAVE10 (max_uses_per_user = 1)
    const res2 = await sendHttpRequest(
      'POST',
      '/api/apply-coupon',
      { code: 'SAVE10', total_amount: 500000, user_id: user.id },
      false,
      { Authorization: `Bearer ${token}` }
    );
    ctx.oracleLogs.push(`Gọi SAVE10 lần 2 (sau khi đã có 1 lượt dùng trong coupon_usage, max_uses=1) -> HTTP ${res2.status} (${truncateString(res2.text, 80)})`);
    return isHttp4xx(res2)
      ? []
      : [
          `Vi phạm điều kiện C5 (README dòng 120, 130): Mã "SAVE10" có max_uses_per_user=1 nhưng user vẫn áp dụng thành công lần thứ 2 (HTTP ${res2.status}) do lỗi điều kiện row.use_count <= coupon.max_uses_per_user`,
        ];
  },
});

testCases.push({
  id: 'EP-TC20',
  covers: 'EC26, EC36',
  desc: 'Áp mã VIP100 lần thứ 3 sau khi cùng user đã dùng đủ 2 lần (vượt max_uses_per_user = 2) — vi phạm C5',
  kind: 'API',
  expected: 'REJ-COUPON (400 Bad Request): Từ chối vì usage_count = 2 >= max_uses_per_user (2) theo điều kiện C5 (README dòng 120, 132, Q4)',
  executeFn: async ctx => {
    const { token, user } = await loginUser();
    // Dùng 2 lần trước đó
    for (let i = 0; i < 2; i++) {
      await setupCartItems(token, [{ product_id: 1, quantity: 2 }]);
      const cp = await sendHttpRequest(
        'POST',
        '/api/apply-coupon',
        { code: 'VIP100', total_amount: 500000, user_id: user.id },
        true,
        { Authorization: `Bearer ${token}` }
      );
      await sendHttpRequest(
        'POST',
        '/api/checkout',
        { total_amount: 400000, shipping_address: ADDR_NOM },
        true,
        { Authorization: `Bearer ${token}` }
      );
      await sendHttpRequest(
        'POST',
        '/api/coupon-usage',
        { coupon_id: cp.json && cp.json.coupon_id ? cp.json.coupon_id : 3 },
        true,
        { Authorization: `Bearer ${token}` }
      );
    }

    // Lần 3: vượt max_uses_per_user = 2
    const res3 = await sendHttpRequest(
      'POST',
      '/api/apply-coupon',
      { code: 'VIP100', total_amount: 500000, user_id: user.id },
      false,
      { Authorization: `Bearer ${token}` }
    );
    ctx.oracleLogs.push(`Gọi VIP100 lần 3 (sau khi đã có 2 lượt dùng trong coupon_usage, max_uses=2) -> HTTP ${res3.status} (${truncateString(res3.text, 80)})`);
    return isHttp4xx(res3)
      ? []
      : [
          `Vi phạm điều kiện C5 (README dòng 120, 132): Mã "VIP100" có max_uses_per_user=2 nhưng user vẫn áp dụng thành công lần thứ 3 (HTTP ${res3.status}) do lỗi điều kiện row.use_count <= coupon.max_uses_per_user`,
        ];
  },
});

// --- NHÓM EP CÔ LẬP LỖI ĐỊA CHỈ GIAO HÀNG V5 (EP-TC21 -> EP-TC25) ---
testCases.push({
  id: 'EP-TC21',
  covers: 'EC28, EC37',
  desc: 'Đặt hàng với shipping_address rỗng ("") tại POST /api/checkout',
  kind: 'API',
  expected: 'REJ-CHECKOUT (400 Bad Request + OC-ORDER-NO): Địa chỉ giao hàng bắt buộc không được rỗng (FR-08 dòng 105, FR-22)',
  executeFn: async ctx => {
    const { token } = await loginUser();
    await setupCartItems(token, [{ product_id: 1, quantity: 2 }]);
    const ordersBefore = await fetchOrders(token);
    const cartBefore = await fetchCart(token);

    const res = await sendHttpRequest(
      'POST',
      '/api/checkout',
      { total_amount: 500000, shipping_address: '' },
      false,
      { Authorization: `Bearer ${token}` }
    );
    return verifyCheckoutRejectedOracle(ctx, token, ordersBefore, cartBefore, res, [400]);
  },
});

testCases.push({
  id: 'EP-TC22',
  covers: 'EC29, EC37',
  desc: 'Đặt hàng với shipping_address chỉ chứa khoảng trắng ("      ") tại POST /api/checkout',
  kind: 'API',
  expected: 'REJ-CHECKOUT (400 Bad Request + OC-ORDER-NO): Không chấp nhận địa chỉ toàn khoảng trắng (FR-08 dòng 105, Q1)',
  executeFn: async ctx => {
    const { token } = await loginUser();
    await setupCartItems(token, [{ product_id: 1, quantity: 2 }]);
    const ordersBefore = await fetchOrders(token);
    const cartBefore = await fetchCart(token);

    const res = await sendHttpRequest(
      'POST',
      '/api/checkout',
      { total_amount: 500000, shipping_address: '      ' },
      false,
      { Authorization: `Bearer ${token}` }
    );
    return verifyCheckoutRejectedOracle(ctx, token, ordersBefore, cartBefore, res, [400]);
  },
});

testCases.push({
  id: 'EP-TC23',
  covers: 'EC30, EC37',
  desc: 'Đặt hàng với shipping_address dài 300 ký tự (> 255 ký tự theo Q1/Q8)',
  kind: 'API',
  expected: 'REJ-CHECKOUT (400 Bad Request + OC-ORDER-NO) theo giả định cận trên 255 ký tự (Q1, Q8)',
  executeFn: async ctx => {
    const { token } = await loginUser();
    await setupCartItems(token, [{ product_id: 1, quantity: 2 }]);
    const ordersBefore = await fetchOrders(token);
    const cartBefore = await fetchCart(token);

    const res = await sendHttpRequest(
      'POST',
      '/api/checkout',
      { total_amount: 500000, shipping_address: 'A'.repeat(300) },
      false,
      { Authorization: `Bearer ${token}` }
    );
    return verifyCheckoutRejectedOracle(ctx, token, ordersBefore, cartBefore, res, [400]);
  },
});

testCases.push({
  id: 'EP-TC24',
  covers: 'EC31, EC37',
  desc: 'Đặt hàng với shipping_address sai kiểu dữ liệu (số nguyên 12345)',
  kind: 'API',
  expected: 'REJ-CHECKOUT (400 Bad Request + OC-ORDER-NO) (api_spec dòng 135)',
  executeFn: async ctx => {
    const { token } = await loginUser();
    await setupCartItems(token, [{ product_id: 1, quantity: 2 }]);
    const ordersBefore = await fetchOrders(token);
    const cartBefore = await fetchCart(token);

    const res = await sendHttpRequest(
      'POST',
      '/api/checkout',
      { total_amount: 500000, shipping_address: 12345 },
      false,
      { Authorization: `Bearer ${token}` }
    );
    return verifyCheckoutRejectedOracle(ctx, token, ordersBefore, cartBefore, res, [400]);
  },
});

testCases.push({
  id: 'EP-TC25',
  covers: 'EC32, EC35',
  desc: 'Đặt hàng với shipping_address chứa chuỗi HTML/script "<img src=x onerror=alert(1)> 123 Lê Lợi" (SEC-04)',
  kind: 'API+UI',
  expected: 'Nếu tạo đơn: lưu chuỗi văn bản và xóa giỏ hàng; khi hiển thị trên UI phải được escape an toàn không thực thi script (SEC-04)',
  executeFn: async ctx => {
    const { token } = await loginUser();
    await setupCartItems(token, [{ product_id: 1, quantity: 2 }]);
    const ordersBefore = await fetchOrders(token);
    const xssAddr = '<img src=x onerror=alert(1)> 123 Lê Lợi';

    const res = await sendHttpRequest(
      'POST',
      '/api/checkout',
      { total_amount: 500000, shipping_address: xssAddr },
      false,
      { Authorization: `Bearer ${token}` }
    );
    return verifyCheckoutSuccessOracle(ctx, token, ordersBefore, res, 500000, xssAddr);
  },
});

// --- NHÓM EP GIAO DIỆN MOBILE UI (EP-TC26 -> EP-TC30) ---
testCases.push({
  id: 'EP-TC26',
  covers: 'EC01, EC06, EC08, EC14, EC27, EC33, EC35, EC38',
  desc: 'Luồng Áp mã SAVE10 và Đặt hàng hợp lệ trên màn hình Giỏ hàng/Thanh toán Mobile (390x844)',
  kind: 'UI',
  expected: 'Hiển thị giảm 50,000 ₫ còn 450,000 ₫; nhập địa chỉ và bấm Thanh toán tạo đơn thành công, làm rỗng giỏ hàng (FR-20.3)',
});

testCases.push({
  id: 'EP-TC27',
  covers: 'EC20, EC36, EC39',
  desc: 'Nhập mã hết hạn EXPIRED trên màn hình Mobile rồi bấm Áp dụng',
  kind: 'UI',
  expected: 'Hiển thị thông báo lỗi rõ ràng bằng tiếng Việt trên màn hình Mobile; tổng tiền giữ nguyên 500,000 ₫ (FR-20.3, FR-21)',
});

testCases.push({
  id: 'EP-TC28',
  covers: 'EC40',
  desc: 'Kiểm tra sự tồn tại của ô nhập Địa chỉ giao hàng và ký hiệu dấu * bắt buộc trên màn hình Thanh toán Mobile',
  kind: 'UI',
  expected: 'Màn hình Thanh toán Mobile có ô nhập Địa chỉ giao hàng kèm nhãn dấu * bắt buộc (FR-08 dòng 105, FR-22 dòng 252)',
});

testCases.push({
  id: 'EP-TC29',
  covers: 'EC28, EC37, EC41',
  desc: 'Để trống Địa chỉ giao hàng trên màn hình Mobile rồi bấm Thanh toán',
  kind: 'UI',
  expected: 'Bị chặn không cho đặt hàng; thông báo lỗi hiển thị phía trên nút Submit; không tạo đơn hàng thiếu địa chỉ (FR-08, FR-22)',
});

testCases.push({
  id: 'EP-TC30',
  covers: 'EC42',
  desc: 'Kiểm tra định dạng tiền tệ ₫ (dấu phân cách hàng nghìn) và ngôn ngữ tiếng Việt nhất quán trên màn hình Giỏ hàng/Thanh toán Mobile',
  kind: 'UI',
  expected: 'Số tiền có dấu phân cách hàng nghìn kèm ký hiệu ₫; ngôn ngữ tiếng Việt nhất quán không lẫn tiếng Anh (FR-21 dòng 244, 248)',
});

// --- NHÓM BVA ĐẦU VÀO ROBUSTNESS 6n+1 (BV-TC01 -> BV-TC17) ---
testCases.push({
  id: 'BV-TC01',
  covers: 'B01 LB (qty = 1 SP)',
  desc: 'Thanh toán giỏ hàng tại biên dưới số lượng sản phẩm LB = 1 SP (250,000 ₫)',
  kind: 'API',
  expected: 'OC-CHECKOUT-OK(250000, ADDR_NOM): HTTP 200, tạo đơn total_amount=250000, xóa rỗng giỏ hàng',
  executeFn: async ctx => {
    const { token } = await loginUser();
    await setupCartItems(token, [{ product_id: 1, quantity: 1 }]);
    const ordersBefore = await fetchOrders(token);
    const res = await sendHttpRequest(
      'POST',
      '/api/checkout',
      { total_amount: 250000, shipping_address: ADDR_NOM },
      false,
      { Authorization: `Bearer ${token}` }
    );
    return verifyCheckoutSuccessOracle(ctx, token, ordersBefore, res, 250000, ADDR_NOM);
  },
});

testCases.push({
  id: 'BV-TC02',
  covers: 'B01 LB+δ (qty = 2 SP)',
  desc: 'Thanh toán giỏ hàng tại sát biên dưới số lượng sản phẩm LB+δ = 2 SP (500,000 ₫)',
  kind: 'API',
  expected: 'OC-CHECKOUT-OK(500000, ADDR_NOM): HTTP 200, tạo đơn total_amount=500000, xóa rỗng giỏ hàng',
  executeFn: async ctx => {
    const { token } = await loginUser();
    await setupCartItems(token, [{ product_id: 1, quantity: 2 }]);
    const ordersBefore = await fetchOrders(token);
    const res = await sendHttpRequest(
      'POST',
      '/api/checkout',
      { total_amount: 500000, shipping_address: ADDR_NOM },
      false,
      { Authorization: `Bearer ${token}` }
    );
    return verifyCheckoutSuccessOracle(ctx, token, ordersBefore, res, 500000, ADDR_NOM);
  },
});

testCases.push({
  id: 'BV-TC03',
  covers: 'B01 UB-δ (qty = 9 SP, stock = 10)',
  desc: 'Thêm vào giỏ và thanh toán số lượng sản phẩm tại sát biên trên tồn kho UB-δ = 9 SP (2,250,000 ₫)',
  kind: 'API',
  expected: 'OC-CHECKOUT-OK(2250000, ADDR_NOM): HTTP 200, tạo đơn total_amount=2250000, xóa rỗng giỏ hàng',
  executeFn: async ctx => {
    const { token } = await loginUser();
    await setupCartItems(token, [{ product_id: 1, quantity: 9 }]);
    const ordersBefore = await fetchOrders(token);
    const res = await sendHttpRequest(
      'POST',
      '/api/checkout',
      { total_amount: 2250000, shipping_address: ADDR_NOM },
      false,
      { Authorization: `Bearer ${token}` }
    );
    return verifyCheckoutSuccessOracle(ctx, token, ordersBefore, res, 2250000, ADDR_NOM);
  },
});

testCases.push({
  id: 'BV-TC04',
  covers: 'B01 UB (qty = 10 SP = stock)',
  desc: 'Thêm vào giỏ và thanh toán số lượng sản phẩm chạm đúng biên trên tồn kho UB = 10 SP (2,500,000 ₫)',
  kind: 'API',
  expected: 'OC-CHECKOUT-OK(2500000, ADDR_NOM): HTTP 200, tạo đơn total_amount=2500000, xóa rỗng giỏ hàng',
  executeFn: async ctx => {
    const { token } = await loginUser();
    await setupCartItems(token, [{ product_id: 1, quantity: 10 }]);
    const ordersBefore = await fetchOrders(token);
    const res = await sendHttpRequest(
      'POST',
      '/api/checkout',
      { total_amount: 2500000, shipping_address: ADDR_NOM },
      false,
      { Authorization: `Bearer ${token}` }
    );
    return verifyCheckoutSuccessOracle(ctx, token, ordersBefore, res, 2500000, ADDR_NOM);
  },
});

testCases.push({
  id: 'BV-TC05',
  covers: 'B01 UB+δ (qty = 11 SP > stock = 10)',
  desc: 'Thêm vào giỏ và thanh toán số lượng vượt biên trên tồn kho UB+δ = 11 SP (khi stock = 10)',
  kind: 'API',
  expected: 'Từ chối 400 Bad Request khi thêm vào giỏ hoặc khi thanh toán vượt tồn kho (FR-07 dòng 98, FR-08 dòng 104)',
  executeFn: async ctx => {
    const { token } = await loginUser();
    const ordersBefore = await fetchOrders(token);

    const cartRes = await sendHttpRequest(
      'POST',
      '/api/cart',
      { id: 1, product_id: 1, name: 'Sản phẩm #1', price: 250000, quantity: 11 },
      false,
      { Authorization: `Bearer ${token}` }
    );
    const checkoutRes = await sendHttpRequest(
      'POST',
      '/api/checkout',
      { total_amount: 2750000, shipping_address: ADDR_NOM },
      false,
      { Authorization: `Bearer ${token}` }
    );
    const ordersAfter = await fetchOrders(token);
    ctx.oracleLogs.push(
      `POST /api/cart (qty=11, stock=10) -> HTTP ${cartRes.status}; POST /api/checkout -> HTTP ${checkoutRes.status}; Đơn hàng: ${ordersBefore.length} -> ${ordersAfter.length}`
    );

    const errors = [];
    if (!isHttp4xx(cartRes) && !isHttp4xx(checkoutRes)) {
      errors.push(
        `Vi phạm biên trên tồn kho B01 (FR-07 dòng 98 & FR-08): Sản phẩm có stock=10 nhưng hệ thống vẫn cho thêm vào giỏ (HTTP ${cartRes.status}) và thanh toán thành công (HTTP ${checkoutRes.status}) với quantity=11`
      );
    }
    return errors;
  },
});

testCases.push({
  id: 'BV-TC06',
  covers: 'B02 LB (len(shipping_address) = 1 ký tự)',
  desc: 'Đặt hàng với địa chỉ giao hàng tại biên dưới độ dài LB = 1 ký tự ("A")',
  kind: 'API',
  expected: 'OC-CHECKOUT-OK(500000, "A"): HTTP 200, lưu địa chỉ "A", xóa rỗng giỏ hàng (FR-08 dòng 105, Q1)',
  executeFn: async ctx => {
    const { token } = await loginUser();
    await setupCartItems(token, [{ product_id: 1, quantity: 2 }]);
    const ordersBefore = await fetchOrders(token);
    const res = await sendHttpRequest(
      'POST',
      '/api/checkout',
      { total_amount: 500000, shipping_address: 'A' },
      false,
      { Authorization: `Bearer ${token}` }
    );
    return verifyCheckoutSuccessOracle(ctx, token, ordersBefore, res, 500000, 'A');
  },
});

testCases.push({
  id: 'BV-TC07',
  covers: 'B02 LB+δ (len(shipping_address) = 2 ký tự)',
  desc: 'Đặt hàng với địa chỉ giao hàng tại sát biên dưới độ dài LB+δ = 2 ký tự ("AB")',
  kind: 'API',
  expected: 'OC-CHECKOUT-OK(500000, "AB"): HTTP 200, lưu địa chỉ "AB", xóa rỗng giỏ hàng (FR-08 dòng 105, Q1)',
  executeFn: async ctx => {
    const { token } = await loginUser();
    await setupCartItems(token, [{ product_id: 1, quantity: 2 }]);
    const ordersBefore = await fetchOrders(token);
    const res = await sendHttpRequest(
      'POST',
      '/api/checkout',
      { total_amount: 500000, shipping_address: 'AB' },
      false,
      { Authorization: `Bearer ${token}` }
    );
    return verifyCheckoutSuccessOracle(ctx, token, ordersBefore, res, 500000, 'AB');
  },
});

testCases.push({
  id: 'BV-TC08',
  covers: 'B02 UB-δ (len(shipping_address) = 254 ký tự)',
  desc: 'Đặt hàng với địa chỉ giao hàng tại sát biên trên độ dài UB-δ = 254 ký tự ("A"×254)',
  kind: 'API',
  expected: 'OC-CHECKOUT-OK(500000, "A"×254): HTTP 200, lưu đủ 254 ký tự, xóa rỗng giỏ hàng (Q1, Q8)',
  executeFn: async ctx => {
    const { token } = await loginUser();
    await setupCartItems(token, [{ product_id: 1, quantity: 2 }]);
    const ordersBefore = await fetchOrders(token);
    const addr254 = 'A'.repeat(254);
    const res = await sendHttpRequest(
      'POST',
      '/api/checkout',
      { total_amount: 500000, shipping_address: addr254 },
      false,
      { Authorization: `Bearer ${token}` }
    );
    return verifyCheckoutSuccessOracle(ctx, token, ordersBefore, res, 500000, addr254);
  },
});

testCases.push({
  id: 'BV-TC09',
  covers: 'B02 UB (len(shipping_address) = 255 ký tự)',
  desc: 'Đặt hàng với địa chỉ giao hàng tại biên trên độ dài UB = 255 ký tự ("A"×255)',
  kind: 'API',
  expected: 'OC-CHECKOUT-OK(500000, "A"×255): HTTP 200, lưu đủ 255 ký tự, xóa rỗng giỏ hàng (Q1, Q8)',
  executeFn: async ctx => {
    const { token } = await loginUser();
    await setupCartItems(token, [{ product_id: 1, quantity: 2 }]);
    const ordersBefore = await fetchOrders(token);
    const addr255 = 'A'.repeat(255);
    const res = await sendHttpRequest(
      'POST',
      '/api/checkout',
      { total_amount: 500000, shipping_address: addr255 },
      false,
      { Authorization: `Bearer ${token}` }
    );
    return verifyCheckoutSuccessOracle(ctx, token, ordersBefore, res, 500000, addr255);
  },
});

testCases.push({
  id: 'BV-TC10',
  covers: 'B02 UB+δ (len(shipping_address) = 256 ký tự)',
  desc: 'Đặt hàng với địa chỉ giao hàng vượt biên trên độ dài UB+δ = 256 ký tự ("A"×256)',
  kind: 'API',
  expected: 'REJ-CHECKOUT (400 Bad Request + OC-ORDER-NO) theo giả định cận trên 255 ký tự (Q1, Q8)',
  executeFn: async ctx => {
    const { token } = await loginUser();
    await setupCartItems(token, [{ product_id: 1, quantity: 2 }]);
    const ordersBefore = await fetchOrders(token);
    const cartBefore = await fetchCart(token);
    const res = await sendHttpRequest(
      'POST',
      '/api/checkout',
      { total_amount: 500000, shipping_address: 'A'.repeat(256) },
      false,
      { Authorization: `Bearer ${token}` }
    );
    return verifyCheckoutRejectedOracle(ctx, token, ordersBefore, cartBefore, res, [400]);
  },
});

testCases.push({
  id: 'BV-TC11',
  covers: 'B03 LB1-δ (total_amount = 299,999 ₫ với SAVE10)',
  desc: 'Áp mã SAVE10 tại điểm sát dưới ngưỡng tối thiểu LB1-δ = 299,999 ₫ (dưới ngưỡng 300,000 ₫ đúng 1 ₫)',
  kind: 'API',
  expected: 'REJ-COUPON (400 Bad Request): Từ chối vì 299,999 < 300,000 (FR-09 C3 dòng 118, 130)',
  executeFn: async ctx => {
    const { token, user } = await loginUser();
    const res = await sendHttpRequest(
      'POST',
      '/api/apply-coupon',
      { code: 'SAVE10', total_amount: 299999, user_id: user.id },
      false,
      { Authorization: `Bearer ${token}` }
    );
    ctx.oracleLogs.push(`total=299999 với SAVE10 -> HTTP ${res.status}`);
    return isHttp4xx(res) ? [] : [`Kỳ vọng 400 tại biên LB1-δ=299999, thực tế nhận HTTP ${res.status}`];
  },
});

testCases.push({
  id: 'BV-TC12',
  covers: 'B03 LB1 (total_amount = 300,000 ₫ với SAVE10)',
  desc: 'Áp mã SAVE10 chạm đúng biên dưới ngưỡng tối thiểu LB1 = 300,000 ₫',
  kind: 'API',
  expected: 'OC-COUPON-OK(30000, 270000): HTTP 200, discount_amount=30000, final_amount=270000 (FR-09 C3 dòng 118, 130)',
  executeFn: async ctx => {
    const { token, user } = await loginUser();
    const res = await sendHttpRequest(
      'POST',
      '/api/apply-coupon',
      { code: 'SAVE10', total_amount: 300000, user_id: user.id },
      false,
      { Authorization: `Bearer ${token}` }
    );
    return verifyCouponSuccessOracle(ctx, res, 30000, 270000);
  },
});

testCases.push({
  id: 'BV-TC13',
  covers: 'B03 LB1+δ (total_amount = 300,001 ₫ với SAVE10)',
  desc: 'Áp mã SAVE10 tại điểm sát trên ngưỡng tối thiểu LB1+δ = 300,001 ₫',
  kind: 'API',
  expected: 'OC-COUPON-OK(30000.1, 270000.9): HTTP 200, discount_amount=30000.1, final_amount=270000.9 (FR-09 C3)',
  executeFn: async ctx => {
    const { token, user } = await loginUser();
    const res = await sendHttpRequest(
      'POST',
      '/api/apply-coupon',
      { code: 'SAVE10', total_amount: 300001, user_id: user.id },
      false,
      { Authorization: `Bearer ${token}` }
    );
    return verifyCouponSuccessOracle(ctx, res, 30000.1, 270000.9);
  },
});

testCases.push({
  id: 'BV-TC14',
  covers: 'B03 LB2-δ (total_amount = 499,999 ₫ với BIGBUY)',
  desc: 'Áp mã BIGBUY tại điểm sát dưới ngưỡng tối thiểu LB2-δ = 499,999 ₫ (dưới ngưỡng 500,000 ₫ đúng 1 ₫)',
  kind: 'API',
  expected: 'REJ-COUPON (400 Bad Request): Từ chối vì 499,999 < 500,000 (FR-09 C3 dòng 118, 131)',
  executeFn: async ctx => {
    const { token, user } = await loginUser();
    const res = await sendHttpRequest(
      'POST',
      '/api/apply-coupon',
      { code: 'BIGBUY', total_amount: 499999, user_id: user.id },
      false,
      { Authorization: `Bearer ${token}` }
    );
    ctx.oracleLogs.push(`total=499999 với BIGBUY -> HTTP ${res.status}`);
    return isHttp4xx(res) ? [] : [`Kỳ vọng 400 tại biên LB2-δ=499999, thực tế nhận HTTP ${res.status}`];
  },
});

testCases.push({
  id: 'BV-TC15',
  covers: 'B03 LB2 (total_amount = 500,000 ₫ với BIGBUY)',
  desc: 'Áp mã BIGBUY chạm đúng biên dưới ngưỡng tối thiểu LB2 = 500,000 ₫',
  kind: 'API',
  expected: 'OC-COUPON-OK(50000, 450000): HTTP 200, discount_amount=50000, final_amount=450000 (FR-09 C3 dòng 118, 131)',
  executeFn: async ctx => {
    const { token, user } = await loginUser();
    const res = await sendHttpRequest(
      'POST',
      '/api/apply-coupon',
      { code: 'BIGBUY', total_amount: 500000, user_id: user.id },
      false,
      { Authorization: `Bearer ${token}` }
    );
    return verifyCouponSuccessOracle(ctx, res, 50000, 450000);
  },
});

testCases.push({
  id: 'BV-TC16',
  covers: 'B03 LB2+δ (total_amount = 500,001 ₫ với BIGBUY)',
  desc: 'Áp mã BIGBUY tại điểm sát trên ngưỡng tối thiểu LB2+δ = 500,001 ₫',
  kind: 'API',
  expected: 'OC-COUPON-OK(50000, 450001): HTTP 200, discount_amount=50000, final_amount=450001 (FR-09 C3)',
  executeFn: async ctx => {
    const { token, user } = await loginUser();
    const res = await sendHttpRequest(
      'POST',
      '/api/apply-coupon',
      { code: 'BIGBUY', total_amount: 500001, user_id: user.id },
      false,
      { Authorization: `Bearer ${token}` }
    );
    return verifyCouponSuccessOracle(ctx, res, 50000, 450001);
  },
});

testCases.push({
  id: 'BV-TC17',
  covers: 'B04 LB (usage_count = 0) & B03 LB1 (300,000 ₫) với VIP100',
  desc: 'Áp mã VIP100 lần đầu tiên (usage_count = 0) ngay tại biên ngưỡng tối thiểu 300,000 ₫',
  kind: 'API',
  expected: 'OC-COUPON-OK(100000, 200000): HTTP 200, discount_amount=100000, final_amount=200000 (FR-09 dòng 118, 120, 132)',
  executeFn: async ctx => {
    const { token, user } = await loginUser();
    const res = await sendHttpRequest(
      'POST',
      '/api/apply-coupon',
      { code: 'VIP100', total_amount: 300000, user_id: user.id },
      false,
      { Authorization: `Bearer ${token}` }
    );
    return verifyCouponSuccessOracle(ctx, res, 100000, 200000);
  },
});

// --- NHÓM BVA BIÊN ĐẦU RA & BIÊN THỜI GIAN (OB-TC01 -> OB-TC02) ---
testCases.push({
  id: 'OB-TC01',
  covers: 'Output BVA — LB_out (final_amount = max(0, total - discount) = 0 ₫)',
  desc: 'Áp mã loại fixed có discount_value (350,000 ₫) > total_amount (300,000 ₫) để kiểm tra biên dưới đầu ra final_amount = 0 ₫',
  kind: 'API',
  expected: 'HTTP 200; final_amount = max(0, 300000 - 350000) = 0 ₫ (tuyệt đối không trả về số âm -50,000 ₫) (README dòng 126)',
  executeFn: async ctx => {
    const { token, user } = await loginUser();
    const res = await sendHttpRequest(
      'POST',
      '/api/apply-coupon',
      { code: 'FREE350', total_amount: 300000, user_id: user.id },
      false,
      { Authorization: `Bearer ${token}` }
    );
    const actualFinal = res.json ? Number(res.json.final_amount) : NaN;
    ctx.oracleLogs.push(`discount_value=350000 trên total=300000 -> final_amount=${actualFinal}`);
    const errors = [];
    if (!isHttp2xx(res)) {
      errors.push(`Kỳ vọng HTTP 200 với mã FREE350 hợp lệ, thực tế nhận HTTP ${res.status}`);
    } else if (actualFinal !== 0) {
      errors.push(
        `Vi phạm công thức FR-09 dòng 126 (final_amount = max(0, total_amount - discount_value)): Kỳ vọng final_amount = 0 ₫ nhưng thực tế nhận ${actualFinal} ₫`
      );
    }
    return errors;
  },
});

testCases.push({
  id: 'OB-TC02',
  covers: 'Date BVA (C2) — expired_at sát ngày hiện tại (Yesterday vs Tomorrow)',
  desc: 'Áp mã tại biên ngày hết hạn C2: EXP_YESTERDAY (hôm qua) bị từ chối và EXP_TOMORROW (ngày mai) được chấp nhận',
  kind: 'API',
  expected: 'EXP_YESTERDAY -> 400 Bad Request; EXP_TOMORROW -> 200 OK (discount=50000, final=450000) (FR-09 C2 dòng 117, Q5)',
  executeFn: async ctx => {
    const { token, user } = await loginUser();
    const resYesterday = await sendHttpRequest(
      'POST',
      '/api/apply-coupon',
      { code: 'EXP_YESTERDAY', total_amount: 500000, user_id: user.id },
      false,
      { Authorization: `Bearer ${token}` }
    );
    const resTomorrow = await sendHttpRequest(
      'POST',
      '/api/apply-coupon',
      { code: 'EXP_TOMORROW', total_amount: 500000, user_id: user.id },
      false,
      { Authorization: `Bearer ${token}` }
    );
    ctx.oracleLogs.push(`EXP_YESTERDAY -> HTTP ${resYesterday.status}; EXP_TOMORROW -> HTTP ${resTomorrow.status}`);
    const errors = [];
    if (!isHttp4xx(resYesterday)) {
      errors.push(`Vi phạm C2 (biên ngày hôm qua): EXP_YESTERDAY đã hết hạn nhưng vẫn trả HTTP ${resYesterday.status}`);
    }
    if (!isHttp2xx(resTomorrow)) {
      errors.push(`Kỳ vọng EXP_TOMORROW (còn hạn) trả 200 OK, thực tế nhận HTTP ${resTomorrow.status}`);
    }
    return errors;
  },
});

// --- NHÓM CA BỔ SUNG DO SINH VIÊN SAU HUMAN REVIEW (SR-TC01 -> SR-TC05) ---
testCases.push({
  id: 'SR-TC01',
  covers: 'Human Review — Chuẩn hóa chuỗi mã giảm giá chữ thường & khoảng trắng hai đầu (Q6)',
  desc: 'Kiểm tra nhập mã chữ thường "save10" và dư khoảng trắng "  SAVE10  " trên bàn phím điện thoại tại POST /api/apply-coupon',
  kind: 'API',
  expected: 'Xử lý nhất quán (từ chối 400 nếu đối sánh viết hoa nghiêm ngặt theo Q6, hoặc tự động trim/toUpperCase hợp lệ, không lỗi 500)',
  executeFn: async ctx => {
    const { token, user } = await loginUser();
    const resLower = await sendHttpRequest(
      'POST',
      '/api/apply-coupon',
      { code: 'save10', total_amount: 500000, user_id: user.id },
      false,
      { Authorization: `Bearer ${token}` }
    );
    const resSpaces = await sendHttpRequest(
      'POST',
      '/api/apply-coupon',
      { code: '  SAVE10  ', total_amount: 500000, user_id: user.id },
      false,
      { Authorization: `Bearer ${token}` }
    );
    ctx.oracleLogs.push(`"save10" -> HTTP ${resLower.status}; "  SAVE10  " -> HTTP ${resSpaces.status}`);
    const errors = [];
    if (resLower.status >= 500 || resSpaces.status >= 500) {
      errors.push(`Lỗi máy chủ 500 khi nhận mã chữ thường hoặc khoảng trắng`);
    }
    return errors;
  },
});

testCases.push({
  id: 'SR-TC02',
  covers: 'Human Review — Luồng Hủy đơn hàng ở trạng thái pending trên Mobile & chống IDOR/hủy lặp (FR-20.3 dòng 237, FR-10 dòng 145-146)',
  desc: 'Tạo đơn hàng pending rồi gọi PUT /api/orders/:id/cancel: kiểm tra chặn không có token/IDOR, hủy hợp lệ lần 1 và chặn hủy lại khi đã cancelled',
  kind: 'API',
  expected: 'Không có token -> 401; Hủy lần 1 khi pending -> 200 OK (status="cancelled"); Hủy lần 2 khi đã cancelled -> 400 Bad Request',
  executeFn: async ctx => {
    const { token } = await loginUser();
    await setupCartItems(token, [{ product_id: 1, quantity: 1 }]);
    const checkoutRes = await sendHttpRequest(
      'POST',
      '/api/checkout',
      { total_amount: 250000, shipping_address: ADDR_NOM },
      true,
      { Authorization: `Bearer ${token}` }
    );
    const orderId = checkoutRes.json && checkoutRes.json.orderId ? checkoutRes.json.orderId : 1;

    // 1. Gọi hủy không có token
    const unauthCancel = await sendHttpRequest('PUT', `/api/orders/${orderId}/cancel`);
    // 2. User 2 gọi hủy hợp lệ lần 1 (đang pending)
    const cancel1 = await sendHttpRequest('PUT', `/api/orders/${orderId}/cancel`, undefined, false, {
      Authorization: `Bearer ${token}`,
    });
    // 3. User 2 gọi hủy lần 2 khi đơn đã chuyển sang cancelled
    const cancel2 = await sendHttpRequest('PUT', `/api/orders/${orderId}/cancel`, undefined, false, {
      Authorization: `Bearer ${token}`,
    });

    ctx.oracleLogs.push(
      `Không token -> HTTP ${unauthCancel.status}; Hủy lần 1 (pending) -> HTTP ${cancel1.status}; Hủy lần 2 (đã cancelled) -> HTTP ${cancel2.status}`
    );
    const errors = [];
    if (unauthCancel.status !== 401 && unauthCancel.status !== 403) {
      errors.push(`Kỳ vọng 401/403 khi hủy đơn không có token, thực tế nhận HTTP ${unauthCancel.status}`);
    }
    if (!isHttp2xx(cancel1)) {
      errors.push(`Kỳ vọng 200 OK khi hủy đơn đang pending, thực tế nhận HTTP ${cancel1.status}`);
    }
    if (!isHttp4xx(cancel2)) {
      errors.push(
        `Vi phạm FR-10 dòng 145: Đơn đã ở trạng thái cancelled nhưng gọi hủy lần 2 vẫn trả HTTP ${cancel2.status}`
      );
    }
    return errors;
  },
});

testCases.push({
  id: 'SR-TC03',
  covers: 'Human Review — Phòng chống SQL Injection trong code coupon và shipping_address (SEC-05)',
  desc: 'Gửi payload SQL Injection trong trường code tại /api/apply-coupon và shipping_address tại /api/checkout',
  kind: 'API',
  expected: 'apply-coupon trả 400/404 (không bị bypass bởi OR 1=1); checkout dùng Parameterized Query không gây lỗi 500 hay mất bảng orders (SEC-05)',
  executeFn: async ctx => {
    const { token, user } = await loginUser();
    const sqliCoupon = await sendHttpRequest(
      'POST',
      '/api/apply-coupon',
      { code: "NOTEXIST' OR '1'='1", total_amount: 500000, user_id: user.id },
      false,
      { Authorization: `Bearer ${token}` }
    );
    await setupCartItems(token, [{ product_id: 1, quantity: 1 }]);
    const sqliCheckout = await sendHttpRequest(
      'POST',
      '/api/checkout',
      { total_amount: 250000, shipping_address: "123 Lê Lợi'); DROP TABLE orders; --" },
      false,
      { Authorization: `Bearer ${token}` }
    );
    const ordersAfter = await fetchOrders(token);
    ctx.oracleLogs.push(
      `SQLi apply-coupon -> HTTP ${sqliCoupon.status}; SQLi checkout -> HTTP ${sqliCheckout.status}; Bảng orders còn hoạt động (${ordersAfter.length} đơn)`
    );

    const errors = [];
    if (!isHttp4xx(sqliCoupon)) {
      errors.push(`Lỗ hổng SQL Injection tại /api/apply-coupon: Payload OR '1'='1' bypass kiểm tra mã, trả HTTP ${sqliCoupon.status}`);
    }
    if (sqliCheckout.status >= 500) {
      errors.push(`Lỗi 500 khi nhận payload SQLi tại /api/checkout`);
    }
    return errors;
  },
});

testCases.push({
  id: 'SR-TC04',
  covers: 'Human Review — Xung đột đồng thời (Race Condition / Double Submit) khi áp mã SAVE10 và bấm Thanh toán song song',
  desc: 'Bắn đồng thời 2 request POST /api/apply-coupon (SAVE10, max_uses=1) và 2 request POST /api/checkout trên cùng 1 giỏ hàng',
  kind: 'API',
  expected: 'SAVE10 chỉ được dùng thành công tối đa 1 lần; từ 1 giỏ hàng chỉ được tạo đúng 1 đơn hàng (không tạo 2 đơn trùng và không giữ nguyên giỏ hàng)',
  executeFn: async ctx => {
    const { token, user } = await loginUser();
    await setupCartItems(token, [{ product_id: 1, quantity: 2 }]);
    const ordersBefore = await fetchOrders(token);

    // 1. Bắn song song 2 request apply-coupon với SAVE10 (max_uses_per_user = 1)
    const [cp1, cp2] = await Promise.all([
      sendHttpRequest(
        'POST',
        '/api/apply-coupon',
        { code: 'SAVE10', total_amount: 500000, user_id: user.id },
        false,
        { Authorization: `Bearer ${token}` }
      ),
      sendHttpRequest(
        'POST',
        '/api/apply-coupon',
        { code: 'SAVE10', total_amount: 500000, user_id: user.id },
        false,
        { Authorization: `Bearer ${token}` }
      ),
    ]);

    // 2. Bắn song song 2 request checkout trên cùng giỏ hàng
    const [co1, co2] = await Promise.all([
      sendHttpRequest(
        'POST',
        '/api/checkout',
        { total_amount: 450000, shipping_address: ADDR_NOM },
        false,
        { Authorization: `Bearer ${token}` }
      ),
      sendHttpRequest(
        'POST',
        '/api/checkout',
        { total_amount: 450000, shipping_address: ADDR_NOM },
        false,
        { Authorization: `Bearer ${token}` }
      ),
    ]);

    const ordersAfter = await fetchOrders(token);
    const newOrdersCount = ordersAfter.length - ordersBefore.length;
    const couponSuccessCount = [cp1, cp2].filter(isHttp2xx).length;
    ctx.oracleLogs.push(
      `Song song apply-coupon SAVE10: ${couponSuccessCount}/2 thành công; Song song checkout: tạo thêm ${newOrdersCount} đơn hàng`
    );

    const errors = [];
    if (couponSuccessCount > 1) {
      errors.push(`Vi phạm C5 (max_uses_per_user = 1): Cả 2 request áp mã SAVE10 đồng thời đều trả HTTP 200 OK`);
    }
    if (newOrdersCount > 1) {
      errors.push(
        `Lỗi Double Submit / Race Condition tại /api/checkout: Từ 1 giỏ hàng duy nhất nhưng sinh ra ${newOrdersCount} đơn hàng trùng lặp`
      );
    }
    return errors;
  },
});

testCases.push({
  id: 'SR-TC05',
  covers: 'Human Review — Tính toàn vẹn khấu trừ tồn kho stock của sản phẩm sau khi Đặt hàng thành công (FR-07 & FR-08)',
  desc: 'Kiểm tra sau khi đặt mua 2 sản phẩm prod_id=1 (stock ban đầu = 10), tồn kho sản phẩm trong CSDL phải giảm xuống 8',
  kind: 'API',
  expected: 'stock_after = stock_before - quantity = 10 - 2 = 8 (ngăn chặn bán vượt tồn kho ở các đơn tiếp theo)',
  executeFn: async ctx => {
    const { token } = await loginUser();
    const beforeProd = await sendHttpRequest('GET', '/api/products/1', undefined, true);
    const hasStockCol = beforeProd.json && beforeProd.json.stock !== undefined;
    const stockBefore = hasStockCol ? Number(beforeProd.json.stock) : 10;

    await setupCartItems(token, [{ product_id: 1, quantity: 2 }]);
    const checkoutRes = await sendHttpRequest(
      'POST',
      '/api/checkout',
      { total_amount: 500000, shipping_address: ADDR_NOM },
      false,
      { Authorization: `Bearer ${token}` }
    );

    const afterProd = await sendHttpRequest('GET', '/api/products/1', undefined, true);
    const stockAfterRaw = afterProd.json && afterProd.json.stock !== undefined ? Number(afterProd.json.stock) : 'undefined (thiếu cột stock)';
    ctx.oracleLogs.push(
      `POST /api/checkout (qty=2) -> HTTP ${checkoutRes.status}; Tồn kho sản phẩm #1: stock_before=${
        hasStockCol ? stockBefore : 'undefined'
      } -> stock_after=${stockAfterRaw}`
    );

    const errors = [];
    if (stockAfterRaw !== stockBefore - 2) {
      errors.push(
        `Vi phạm toàn vẹn tồn kho (FR-07 & FR-08): Sau khi đặt mua 2 sản phẩm thành công, tồn kho sản phẩm #1 không được trừ (kỳ vọng ${
          stockBefore - 2
        }, thực tế nhận ${stockAfterRaw})`
      );
    }
    return errors;
  },
});

// ============================================================================
// 4. TIẾN TRÌNH THỰC THI CHÍNH
// ============================================================================
const escapeMarkdownTableCell = text => {
  if (!text) return '';
  return String(text).replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
};

(async () => {
  console.log('===================================================================');
  console.log('BẮT ĐẦU THỰC THI KIỂM THỬ API CHO FR-20.3 (MOBILE CHECKOUT & COUPON)');
  console.log(`Tổng số ca đăng ký: ${testCases.length}`);
  console.log('===================================================================\n');

  const executionResults = [];

  for (const tc of testCases) {
    capturedHttpCalls = [];
    const context = { oracleLogs: [] };
    let status = 'Not run';
    let failureReasons = [];

    if (tc.kind === 'UI') {
      failureReasons = ['Ca UI kiểm thử qua trình duyệt Playwright CLI (xem run_ui_results.md)'];
      status = 'Not run';
    } else {
      try {
        const isDbReady = await prepareFreshDatabaseFixture();
        if (!isDbReady) throw { blocked: 'Không dựng được SQLite DB sạch / seed thất bại' };
        failureReasons = await tc.executeFn(context);
        status = failureReasons.length ? 'Fail' : 'Pass';
      } catch (err) {
        status = 'Blocked';
        failureReasons = [err && err.blocked ? err.blocked : 'Lỗi script: ' + (err && err.message ? err.message : err)];
      }
    }

    const mainCall =
      [...capturedHttpCalls]
        .reverse()
        .find(
          call =>
            call.path.startsWith('/api/apply-coupon') ||
            call.path.startsWith('/api/checkout') ||
            call.path.includes('/cancel')
        ) ||
      capturedHttpCalls[capturedHttpCalls.length - 1] ||
      null;

    executionResults.push({
      id: tc.id,
      covers: tc.covers,
      desc: tc.desc,
      kind: tc.kind,
      expected: tc.expected,
      status,
      reasons: failureReasons,
      oracleLogs: context.oracleLogs,
      powershellCommand: mainCall ? mainCall.powershellCmd : '',
      actualStatus: mainCall ? mainCall.status : null,
      actualBody: mainCall ? truncateString(mainCall.response) : '',
      executedAt: new Date().toISOString(),
    });

    console.log(
      `[${tc.id}] ${status.padEnd(7)} | Status: ${mainCall ? mainCall.status : '-'} | Lý do: ${failureReasons.join('; ')}`
    );
  }

  // Dọn dẹp server và DB tạm
  if (serverProcess) {
    try {
      serverProcess.kill();
    } catch {}
  }
  killExistingServerOnPort3000();
  await sleep(300);
  removeTemporaryDatabaseFiles();

  const countByStatus = st => executionResults.filter(r => r.status === st).length;
  fs.mkdirSync(path.dirname(path.resolve(OUTPUT_PATH)), { recursive: true });

  // 1. Ghi file JSON
  fs.writeFileSync(
    OUTPUT_PATH + '.json',
    JSON.stringify({ baseUrl: BASE_URL, results: executionResults }, null, 2),
    'utf8'
  );

  // 2. Ghi file Markdown
  const markdownLines = [];
  markdownLines.push(`<!-- Sinh tự động bởi run_fr20_3.js lúc ${new Date().toISOString()} -->`);
  markdownLines.push(
    `**Tổng:** ${executionResults.length} · **Pass:** ${countByStatus('Pass')} · **Fail:** ${countByStatus(
      'Fail'
    )} · **Blocked:** ${countByStatus('Blocked')} · **Not run (UI):** ${countByStatus('Not run')}`,
    ''
  );
  markdownLines.push('| TC ID | Mong đợi | Thực tế | Trạng thái | Ghi chú / Lý do |', '|---|---|---|---|---|');

  for (const res of executionResults) {
    const actualText = [
      res.actualStatus !== null ? `HTTP ${res.actualStatus}: ${res.actualBody}` : '',
      res.oracleLogs.join('; '),
    ]
      .filter(Boolean)
      .join(' | ');
    markdownLines.push(
      `| ${res.id} | ${escapeMarkdownTableCell(res.expected)} | ${escapeMarkdownTableCell(actualText)} | **${
        res.status
      }** | ${escapeMarkdownTableCell(res.reasons.join('; '))} |`
    );
  }

  fs.writeFileSync(OUTPUT_PATH + '.md', markdownLines.join('\n') + '\n', 'utf8');

  console.log('\n===================================================================');
  console.log(`KẾT QUẢ TỔNG HỢP API: ${executionResults.length} test cases`);
  console.log(
    `Pass: ${countByStatus('Pass')} | Fail: ${countByStatus('Fail')} | Blocked: ${countByStatus(
      'Blocked'
    )} | Not run (UI): ${countByStatus('Not run')}`
  );
  console.log('Đã xuất kết quả:');
  console.log(`- ${OUTPUT_PATH}.json`);
  console.log(`- ${OUTPUT_PATH}.md`);
  console.log('===================================================================');
})().catch(err => {
  console.error('Lỗi thực thi:', err);
  process.exit(1);
});
