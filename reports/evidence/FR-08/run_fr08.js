#!/usr/bin/env node
/**
 * run_fr08.js — Bộ thực thi kiểm thử tự động API cho FR-08: Thanh toán (Checkout) (HW02 EShop)
 *
 * Tuân thủ quy định hw02_test_executor:
 * - Clean DB Fixture: Mỗi ca chạy trên SQLite sạch độc lập (.hw02_fr08_run.sqlite).
 * - Không làm ảnh hưởng CSDL chính của hệ thống.
 * - Test Oracle: Xác minh đa tầng (mã HTTP, trạng thái CSDL đơn hàng, và việc làm sạch giỏ hàng).
 * - 100% tiếng Việt có dấu trong mã nguồn, log và bảng kết quả.
 * - Tự động xuất file kết quả: <out>.json và <out>.md.
 */

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const BACKEND_DIR = path.resolve(__dirname, '../../../backend');
const TEMP_DB_FILE = path.join(BACKEND_DIR, '.hw02_fr08_run.sqlite');
const OUTPUT_PATH = process.argv[2] || path.join(__dirname, 'run_api_1');
const JWT_SECRET = 'supersecretjwtkeyforhw02testing12345';

const SEED_USER_EMAIL = 'test@eshop.com';
const SEED_USER_PASSWORD = 'Test1234!';
const ADMIN_USER_EMAIL = 'admin@eshop.com';
const ADMIN_USER_PASSWORD = 'Admin123!';
const ADDR_NOM = '123 Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// ============================================================================
// 1. QUẢN LÝ TIẾN TRÌNH & CƠ SỞ DỮ LIỆU ĐỘC LẬP (CLEAN DB FIXTURE)
// ============================================================================
let serverProcess = null;

function killExistingServerOnPort3000() {
  try {
    execSync('powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }"', { stdio: 'ignore' });
  } catch {}
}

function removeTemporaryDatabaseFiles() {
  for (const ext of ['', '-journal', '-wal', '-shm']) {
    try { fs.unlinkSync(TEMP_DB_FILE + ext); } catch {}
  }
}

async function startBackendWithEnv(customEnv) {
  serverProcess = spawn(process.execPath, ['server.js'], {
    cwd: BACKEND_DIR,
    env: { ...process.env, JWT_SECRET, ...customEnv },
    stdio: 'ignore',
  });

  for (let attempt = 0; attempt < 80; attempt++) {
    await sleep(150);
    try {
      const ping = await fetch(`${BASE_URL}/api/products`);
      if (ping.ok) return;
    } catch {}
  }
  throw new Error('Backend không thể khởi động kịp thời hạn.');
}

async function prepareFreshDatabaseFixture() {
  killExistingServerOnPort3000();
  await sleep(250);
  removeTemporaryDatabaseFiles();

  await startBackendWithEnv({ DB_PATH: TEMP_DB_FILE });

  for (let attempt = 0; attempt < 40; attempt++) {
    const checkLogin = await sendHttpRequest('POST', '/api/login', {
      email: SEED_USER_EMAIL,
      password: SEED_USER_PASSWORD,
    }, true);
    if (checkLogin.status === 200) return true;
    await sleep(150);
  }
  return false;
}

// ============================================================================
// 2. TẦNG GIAO TIẾP HTTP & TEST ORACLE
// ============================================================================
let capturedHttpCalls = [];

const formatPayloadDisplay = obj => JSON.stringify(obj, (key, value) => {
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
  try { parsedJson = JSON.parse(responseText); } catch {}

  if (!quiet) {
    let authHeaderPart = '';
    if (headers['Authorization']) {
      authHeaderPart = ` -Headers @{ Authorization = "${headers['Authorization']}" }`;
    }
    capturedHttpCalls.push({
      method,
      path: endpoint,
      status,
      response: responseText,
      powershellCmd: `Invoke-WebRequest -Uri "${BASE_URL}${endpoint}" -Method ${method} -ContentType 'application/json'${authHeaderPart} -Body '${payload === undefined ? '' : formatPayloadDisplay(payload)}' -SkipHttpErrorCheck`,
    });
  }
  return { status, text: responseText, json: parsedJson };
}

const isHttp2xx = res => res.status >= 200 && res.status < 300;
const isHttp4xx = res => res.status >= 400 && res.status < 500;

// Lấy danh sách sản phẩm thực từ backend
async function fetchProducts() {
  const res = await sendHttpRequest('GET', '/api/products', undefined, true);
  return res.json || [];
}

// Đăng nhập lấy token
async function getAuthToken(email = SEED_USER_EMAIL, password = SEED_USER_PASSWORD) {
  const res = await sendHttpRequest('POST', '/api/login', { email, password }, true);
  return res.json && res.json.token ? res.json.token : null;
}

// Lấy danh sách đơn hàng của user
async function getMyOrders(token) {
  const res = await sendHttpRequest('GET', '/api/orders/my-orders', undefined, true, {
    Authorization: `Bearer ${token}`
  });
  return res.json || [];
}

// Lấy giỏ hàng của user
async function getCart(token) {
  const res = await sendHttpRequest('GET', '/api/cart', undefined, true, {
    Authorization: `Bearer ${token}`
  });
  return res.json || [];
}

// Thêm sản phẩm vào giỏ
async function addToCart(token, product, quantity = 1) {
  return await sendHttpRequest('POST', '/api/cart', {
    id: product.id,
    name: product.name,
    price: Number(product.price),
    quantity
  }, true, {
    Authorization: `Bearer ${token}`
  });
}

// ============================================================================
// TEST ORACLES CHO CHECKOUT
// ============================================================================

/**
 * Oracle OC-OK(expectedTotal, expectedAddress):
 * - Checkout phản hồi 2xx.
 * - Có đúng 1 đơn hàng mới trong my-orders với status='pending'.
 * - Tổng tiền của đơn hàng bằng đúng expectedTotal (backend tự tính).
 * - Địa chỉ đơn hàng trùng khớp expectedAddress (nếu có kiểm tra).
 * - Giỏ hàng của người dùng phải rỗng sau khi thanh toán.
 */
async function verifyOracleCheckoutSuccess(testContext, token, initialOrderCount, expectedTotal, expectedAddress = null) {
  const errors = [];
  const myOrders = await getMyOrders(token);
  testContext.oracleLogs.push(`Số đơn hàng sau checkout: ${myOrders.length} (ban đầu: ${initialOrderCount})`);

  if (myOrders.length !== initialOrderCount + 1) {
    errors.push(`OC-OK Thất bại: Số đơn hàng không tăng đúng 1 (trước: ${initialOrderCount}, sau: ${myOrders.length})`);
  } else {
    const latestOrder = myOrders[0]; // Sắp xếp giảm dần theo id
    testContext.oracleLogs.push(`Đơn mới nhất: id=${latestOrder.id}, status=${latestOrder.status}, total=${latestOrder.total_amount}`);

    if (latestOrder.status !== 'pending') {
      errors.push(`OC-OK Thất bại: Trạng thái đơn hàng khởi tạo là "${latestOrder.status}" (kỳ vọng: "pending")`);
    }

    if (expectedTotal !== null && Number(latestOrder.total_amount) !== Number(expectedTotal)) {
      errors.push(`OC-OK Thất bại: Tổng tiền đơn hàng lưu trong CSDL là ${latestOrder.total_amount} ₫ (kỳ vọng backend tự tính: ${expectedTotal} ₫)`);
    }

    if (expectedAddress !== null && latestOrder.shipping_address !== expectedAddress) {
      errors.push(`OC-OK Thất bại: Địa chỉ lưu là "${latestOrder.shipping_address}" (kỳ vọng: "${expectedAddress}")`);
    }
  }

  // Kiểm tra giỏ hàng bị xóa (R2)
  const cart = await getCart(token);
  testContext.oracleLogs.push(`Số mặt hàng trong giỏ sau checkout: ${cart.length}`);
  if (cart.length > 0) {
    errors.push(`OC-OK Thất bại (Vi phạm R2): Giỏ hàng không bị xóa sau khi thanh toán thành công (còn ${cart.length} món)`);
  }

  return errors;
}

/**
 * Oracle OC-NO:
 * - Không có đơn hàng mới nào được tạo trong CSDL.
 * - Giỏ hàng giữ nguyên (không bị xóa).
 */
async function verifyOracleCheckoutRejected(testContext, token, initialOrderCount, initialCartCount = null) {
  const errors = [];
  if (token) {
    const myOrders = await getMyOrders(token);
    testContext.oracleLogs.push(`Số đơn hàng: ${myOrders.length} (ban đầu: ${initialOrderCount})`);
    if (myOrders.length !== initialOrderCount) {
      errors.push(`OC-NO Thất bại: Đơn hàng mới vẫn bị tạo dù request không hợp lệ (số đơn: ${myOrders.length}, ban đầu: ${initialOrderCount})`);
    }

    if (initialCartCount !== null) {
      const cart = await getCart(token);
      testContext.oracleLogs.push(`Số món trong giỏ: ${cart.length} (ban đầu: ${initialCartCount})`);
      if (cart.length !== initialCartCount) {
        errors.push(`OC-NO Thất bại: Giỏ hàng bị thay đổi dù thanh toán bị từ chối`);
      }
    }
  }
  return errors;
}

/**
 * Oracle OC-TOTAL:
 * - Bảo vệ giá: Đơn hàng lưu đúng tổng thực T HOẶC từ chối (4xx).
 * - Tuyệt đối không được lưu số tiền giả mạo từ client.
 */
async function verifyOraclePriceProtection(testContext, token, checkoutRes, initialOrderCount, correctTotal, fakeTotal) {
  const errors = [];
  if (isHttp4xx(checkoutRes)) {
    testContext.oracleLogs.push(`Backend từ chối request với mã lỗi HTTP ${checkoutRes.status} (Hợp lệ)`);
    const noErrors = await verifyOracleCheckoutRejected(testContext, token, initialOrderCount);
    return errors.concat(noErrors);
  }

  if (isHttp2xx(checkoutRes)) {
    const myOrders = await getMyOrders(token);
    if (myOrders.length > initialOrderCount) {
      const latestOrder = myOrders[0];
      testContext.oracleLogs.push(`Đơn được tạo với total_amount: ${latestOrder.total_amount}`);
      if (Number(latestOrder.total_amount) === Number(fakeTotal) && Number(fakeTotal) !== Number(correctTotal)) {
        errors.push(`OC-TOTAL Thất bại (LỖ HỔNG BẢO MẬT): Backend chấp nhận và lưu số tiền gian lận ${fakeTotal} ₫ của client vào CSDL thay vì tổng thực ${correctTotal} ₫!`);
      } else if (Number(latestOrder.total_amount) !== Number(correctTotal)) {
        errors.push(`OC-TOTAL Thất bại: Tổng tiền ${latestOrder.total_amount} ₫ không khớp tổng thực ${correctTotal} ₫`);
      }
    } else {
      errors.push(`OC-TOTAL: Phản hồi 2xx nhưng không thấy đơn mới trong CSDL`);
    }
  } else {
    errors.push(`Phản hồi mã trạng thái bất thường: HTTP ${checkoutRes.status}`);
  }
  return errors;
}

// ============================================================================
// 3. ĐĂNG KÝ BỘ TEST CASE (EP, BVA, SR)
// ============================================================================
const testCases = [];

const registerUiTestCase = (id, covers, desc) => {
  testCases.push({ id, covers, desc, kind: 'UI', expected: '(Ca UI kiểm thử qua Playwright CLI)', executeFn: null });
};

// --- EP CASES ---
testCases.push({
  id: 'EP-TC01',
  covers: 'EC01, EC05, EC08, EC15, EC24, EC25, EC26, EC27',
  desc: 'Luồng đặt hàng danh định hợp lệ (2 SP trong giỏ, token hợp lệ, địa chỉ hợp lệ, total khớp T)',
  kind: 'API',
  expected: '2xx; OC-OK(T, ADDR_NOM)',
  executeFn: async ctx => {
    const token = await getAuthToken();
    const products = await fetchProducts();
    const p1 = products[0], p2 = products[1];
    await addToCart(token, p1, 1);
    await addToCart(token, p2, 1);
    const correctTotal = Number(p1.price) + Number(p2.price);

    const res = await sendHttpRequest('POST', '/api/checkout', {
      total_amount: correctTotal,
      shipping_address: ADDR_NOM,
    }, false, { Authorization: `Bearer ${token}` });

    const errors = [];
    if (!isHttp2xx(res)) errors.push(`HTTP status ${res.status} không phải 2xx thành công`);
    const oracleErrors = await verifyOracleCheckoutSuccess(ctx, token, 0, correctTotal, ADDR_NOM);
    return errors.concat(oracleErrors);
  }
});

testCases.push({
  id: 'EP-TC02',
  covers: 'EC06, EC25',
  desc: 'Giỏ hàng có sản phẩm với số lượng >= 2 (SP_A x 3)',
  kind: 'API',
  expected: '2xx; OC-OK(3*P_A, ADDR_NOM)',
  executeFn: async ctx => {
    const token = await getAuthToken();
    const products = await fetchProducts();
    const p1 = products[0];
    await addToCart(token, p1, 3);
    const correctTotal = Number(p1.price) * 3;

    const res = await sendHttpRequest('POST', '/api/checkout', {
      total_amount: correctTotal,
      shipping_address: ADDR_NOM,
    }, false, { Authorization: `Bearer ${token}` });

    const errors = [];
    if (!isHttp2xx(res)) errors.push(`HTTP status ${res.status} không phải 2xx thành công`);
    const oracleErrors = await verifyOracleCheckoutSuccess(ctx, token, 0, correctTotal, ADDR_NOM);
    return errors.concat(oracleErrors);
  }
});

testCases.push({
  id: 'EP-TC03',
  covers: 'EC02, EC28',
  desc: 'Không gửi header Authorization khi gọi checkout',
  kind: 'API',
  expected: 'REJ (401 theo O2); OC-NO',
  executeFn: async ctx => {
    const res = await sendHttpRequest('POST', '/api/checkout', {
      total_amount: 200000,
      shipping_address: ADDR_NOM,
    }, false); // Không gửi header

    const errors = [];
    if (res.status !== 401 && !isHttp4xx(res)) errors.push(`Status ${res.status} không phải mã từ chối 401/4xx`);
    return errors;
  }
});

testCases.push({
  id: 'EP-TC04',
  covers: 'EC03, EC28',
  desc: 'Header có token nhưng là token giả mạo/chữ ký sai',
  kind: 'API',
  expected: 'REJ (4xx); OC-NO',
  executeFn: async ctx => {
    const res = await sendHttpRequest('POST', '/api/checkout', {
      total_amount: 200000,
      shipping_address: ADDR_NOM,
    }, false, { Authorization: 'Bearer token.gia.mao' });

    const errors = [];
    if (!isHttp4xx(res)) errors.push(`Status ${res.status} không phải mã lỗi 4xx`);
    return errors;
  }
});

testCases.push({
  id: 'EP-TC05',
  covers: 'EC04, EC28',
  desc: 'Header Authorization thiếu tiền tố "Bearer "',
  kind: 'API',
  expected: 'REJ (4xx); OC-NO',
  executeFn: async ctx => {
    const token = await getAuthToken();
    const res = await sendHttpRequest('POST', '/api/checkout', {
      total_amount: 200000,
      shipping_address: ADDR_NOM,
    }, false, { Authorization: token }); // Thiếu 'Bearer '

    const errors = [];
    if (!isHttp4xx(res)) errors.push(`Status ${res.status} không phải mã lỗi 4xx`);
    return errors;
  }
});

testCases.push({
  id: 'EP-TC06',
  covers: 'EC07, EC28',
  desc: 'Giỏ hàng rỗng (0 sản phẩm) mà gọi checkout',
  kind: 'API',
  expected: 'REJ (400 theo Q3); OC-NO',
  executeFn: async ctx => {
    const token = await getAuthToken();
    // Giỏ rỗng, không add sản phẩm nào
    const res = await sendHttpRequest('POST', '/api/checkout', {
      total_amount: 0,
      shipping_address: ADDR_NOM,
    }, false, { Authorization: `Bearer ${token}` });

    const errors = [];
    if (!isHttp4xx(res)) {
      errors.push(`Status ${res.status} không phải 4xx (Hệ thống chấp nhận thanh toán giỏ rỗng!)`);
    }
    const oracleErrors = await verifyOracleCheckoutRejected(ctx, token, 0, 0);
    return errors.concat(oracleErrors);
  }
});

testCases.push({
  id: 'EP-TC07',
  covers: 'EC09, EC28',
  desc: 'Địa chỉ giao hàng rỗng ("")',
  kind: 'API',
  expected: 'REJ (4xx); OC-NO',
  executeFn: async ctx => {
    const token = await getAuthToken();
    const products = await fetchProducts();
    await addToCart(token, products[0], 1);

    const res = await sendHttpRequest('POST', '/api/checkout', {
      total_amount: Number(products[0].price),
      shipping_address: '',
    }, false, { Authorization: `Bearer ${token}` });

    const errors = [];
    if (!isHttp4xx(res)) errors.push(`Status ${res.status} không phải mã lỗi 4xx khi để trống địa chỉ`);
    const oracleErrors = await verifyOracleCheckoutRejected(ctx, token, 0, 1);
    return errors.concat(oracleErrors);
  }
});

testCases.push({
  id: 'EP-TC08',
  covers: 'EC10, EC28',
  desc: 'Body request thiếu hẳn trường shipping_address',
  kind: 'API',
  expected: 'REJ (4xx); OC-NO',
  executeFn: async ctx => {
    const token = await getAuthToken();
    const products = await fetchProducts();
    await addToCart(token, products[0], 1);

    const res = await sendHttpRequest('POST', '/api/checkout', {
      total_amount: Number(products[0].price),
    }, false, { Authorization: `Bearer ${token}` });

    const errors = [];
    if (!isHttp4xx(res)) errors.push(`Status ${res.status} không phải mã lỗi 4xx khi thiếu trường địa chỉ`);
    const oracleErrors = await verifyOracleCheckoutRejected(ctx, token, 0, 1);
    return errors.concat(oracleErrors);
  }
});

testCases.push({
  id: 'EP-TC09',
  covers: 'EC11, EC28',
  desc: 'Địa chỉ giao hàng vượt quá 255 ký tự (300 ký tự A)',
  kind: 'API',
  expected: 'REJ (4xx); OC-NO',
  executeFn: async ctx => {
    const token = await getAuthToken();
    const products = await fetchProducts();
    await addToCart(token, products[0], 1);

    const longAddress = 'A'.repeat(300);
    const res = await sendHttpRequest('POST', '/api/checkout', {
      total_amount: Number(products[0].price),
      shipping_address: longAddress,
    }, false, { Authorization: `Bearer ${token}` });

    const errors = [];
    if (!isHttp4xx(res)) errors.push(`Status ${res.status} không từ chối địa chỉ dài 300 ký tự (>255)`);
    return errors;
  }
});

testCases.push({
  id: 'EP-TC10',
  covers: 'EC12, EC28',
  desc: 'Địa chỉ giao hàng chỉ gồm 5 dấu cách ("     ")',
  kind: 'API',
  expected: 'REJ (4xx); OC-NO',
  executeFn: async ctx => {
    const token = await getAuthToken();
    const products = await fetchProducts();
    await addToCart(token, products[0], 1);

    const res = await sendHttpRequest('POST', '/api/checkout', {
      total_amount: Number(products[0].price),
      shipping_address: '     ',
    }, false, { Authorization: `Bearer ${token}` });

    const errors = [];
    if (!isHttp4xx(res)) errors.push(`Status ${res.status} không từ chối địa chỉ toàn khoảng trắng`);
    const oracleErrors = await verifyOracleCheckoutRejected(ctx, token, 0, 1);
    return errors.concat(oracleErrors);
  }
});

testCases.push({
  id: 'EP-TC11',
  covers: 'EC13, EC28',
  desc: 'Địa chỉ giao hàng sai kiểu dữ liệu (số nguyên 12345)',
  kind: 'API',
  expected: 'REJ (4xx); OC-NO',
  executeFn: async ctx => {
    const token = await getAuthToken();
    const products = await fetchProducts();
    await addToCart(token, products[0], 1);

    const res = await sendHttpRequest('POST', '/api/checkout', {
      total_amount: Number(products[0].price),
      shipping_address: 12345,
    }, false, { Authorization: `Bearer ${token}` });

    const errors = [];
    if (!isHttp4xx(res)) errors.push(`Status ${res.status} không từ chối địa chỉ sai kiểu (number)`);
    return errors;
  }
});

testCases.push({
  id: 'EP-TC12',
  covers: 'EC14',
  desc: 'Địa chỉ chứa thẻ HTML / script: <img src=x onerror=alert(1)> (XSS Injection)',
  kind: 'API + UI',
  expected: '2xx; OC-OK(T); Lưu nguyên văn an toàn không render HTML',
  executeFn: async ctx => {
    const token = await getAuthToken();
    const products = await fetchProducts();
    await addToCart(token, products[0], 1);
    const xssPayload = '<img src=x onerror=alert(1)>';

    const res = await sendHttpRequest('POST', '/api/checkout', {
      total_amount: Number(products[0].price),
      shipping_address: xssPayload,
    }, false, { Authorization: `Bearer ${token}` });

    const errors = [];
    if (!isHttp2xx(res)) errors.push(`Status ${res.status} không phải 2xx khi gửi chuỗi HTML`);
    const oracleErrors = await verifyOracleCheckoutSuccess(ctx, token, 0, Number(products[0].price), xssPayload);
    return errors.concat(oracleErrors);
  }
});

testCases.push({
  id: 'EP-TC13',
  covers: 'EC16, EC24, EC25, EC26, EC27',
  desc: 'Body không gửi trường total_amount (backend tự tính hoàn toàn)',
  kind: 'API',
  expected: '2xx; OC-OK(T, ADDR_NOM)',
  executeFn: async ctx => {
    const token = await getAuthToken();
    const products = await fetchProducts();
    await addToCart(token, products[0], 1);
    const correctTotal = Number(products[0].price);

    const res = await sendHttpRequest('POST', '/api/checkout', {
      shipping_address: ADDR_NOM,
    }, false, { Authorization: `Bearer ${token}` });

    const errors = [];
    if (!isHttp2xx(res)) errors.push(`Status ${res.status} không phải 2xx khi vắng mặt total_amount`);
    const oracleErrors = await verifyOracleCheckoutSuccess(ctx, token, 0, correctTotal, ADDR_NOM);
    return errors.concat(oracleErrors);
  }
});

testCases.push({
  id: 'EP-TC14',
  covers: 'EC17, EC29',
  desc: 'Gian lận tổng tiền: Client gửi total_amount = 1 đ (nhỏ hơn tổng thực T)',
  kind: 'API',
  expected: 'OC-TOTAL (Lưu đúng T hoặc từ chối; không bao giờ lưu 1 đ)',
  executeFn: async ctx => {
    const token = await getAuthToken();
    const products = await fetchProducts();
    await addToCart(token, products[0], 1);
    const correctTotal = Number(products[0].price);

    const res = await sendHttpRequest('POST', '/api/checkout', {
      total_amount: 1, // Giả mạo 1đ
      shipping_address: ADDR_NOM,
    }, false, { Authorization: `Bearer ${token}` });

    return await verifyOraclePriceProtection(ctx, token, res, 0, correctTotal, 1);
  }
});

testCases.push({
  id: 'EP-TC15',
  covers: 'EC18, EC29',
  desc: 'Gian lận tổng tiền: Client gửi total_amount = 999999999 đ (lớn hơn T)',
  kind: 'API',
  expected: 'OC-TOTAL',
  executeFn: async ctx => {
    const token = await getAuthToken();
    const products = await fetchProducts();
    await addToCart(token, products[0], 1);
    const correctTotal = Number(products[0].price);

    const res = await sendHttpRequest('POST', '/api/checkout', {
      total_amount: 999999999,
      shipping_address: ADDR_NOM,
    }, false, { Authorization: `Bearer ${token}` });

    return await verifyOraclePriceProtection(ctx, token, res, 0, correctTotal, 999999999);
  }
});

testCases.push({
  id: 'EP-TC16',
  covers: 'EC19, EC29',
  desc: 'Gian lận tổng tiền: Client gửi total_amount = 0 đ',
  kind: 'API',
  expected: 'OC-TOTAL (Không cho phép đơn 0 đ)',
  executeFn: async ctx => {
    const token = await getAuthToken();
    const products = await fetchProducts();
    await addToCart(token, products[0], 1);
    const correctTotal = Number(products[0].price);

    const res = await sendHttpRequest('POST', '/api/checkout', {
      total_amount: 0,
      shipping_address: ADDR_NOM,
    }, false, { Authorization: `Bearer ${token}` });

    return await verifyOraclePriceProtection(ctx, token, res, 0, correctTotal, 0);
  }
});

testCases.push({
  id: 'EP-TC17',
  covers: 'EC20, EC29',
  desc: 'Gian lận tổng tiền: Client gửi total_amount = -1 đ (số âm)',
  kind: 'API',
  expected: 'OC-TOTAL (Không lưu số âm)',
  executeFn: async ctx => {
    const token = await getAuthToken();
    const products = await fetchProducts();
    await addToCart(token, products[0], 1);
    const correctTotal = Number(products[0].price);

    const res = await sendHttpRequest('POST', '/api/checkout', {
      total_amount: -1,
      shipping_address: ADDR_NOM,
    }, false, { Authorization: `Bearer ${token}` });

    return await verifyOraclePriceProtection(ctx, token, res, 0, correctTotal, -1);
  }
});

testCases.push({
  id: 'EP-TC18',
  covers: 'EC21, EC29',
  desc: 'Gian lận tổng tiền: total_amount sai kiểu dữ liệu ("abc")',
  kind: 'API',
  expected: 'OC-TOTAL (Không lưu "abc")',
  executeFn: async ctx => {
    const token = await getAuthToken();
    const products = await fetchProducts();
    await addToCart(token, products[0], 1);
    const correctTotal = Number(products[0].price);

    const res = await sendHttpRequest('POST', '/api/checkout', {
      total_amount: 'abc',
      shipping_address: ADDR_NOM,
    }, false, { Authorization: `Bearer ${token}` });

    return await verifyOraclePriceProtection(ctx, token, res, 0, correctTotal, 'abc');
  }
});

testCases.push({
  id: 'EP-TC19',
  covers: 'EC22',
  desc: 'Ràng buộc phân lập R4: User A checkout không làm mất giỏ hàng của User B và không bị trộn hàng',
  kind: 'API',
  expected: 'OC-OK cho A; Giỏ hàng của B vẫn giữ nguyên',
  executeFn: async ctx => {
    const tokenA = await getAuthToken(SEED_USER_EMAIL, SEED_USER_PASSWORD);
    const tokenB = await getAuthToken(ADMIN_USER_EMAIL, ADMIN_USER_PASSWORD);
    const products = await fetchProducts();

    // Thêm SP vào giỏ A và giỏ B
    await addToCart(tokenA, products[0], 1);
    await addToCart(tokenB, products[1], 1);

    // User A checkout
    const resA = await sendHttpRequest('POST', '/api/checkout', {
      total_amount: Number(products[0].price),
      shipping_address: ADDR_NOM,
    }, false, { Authorization: `Bearer ${tokenA}` });

    const errors = [];
    if (!isHttp2xx(resA)) errors.push(`Checkout của User A thất bại (HTTP ${resA.status})`);

    // Kiểm tra giỏ của B vẫn còn nguyên SP
    const cartB = await getCart(tokenB);
    ctx.oracleLogs.push(`Số món trong giỏ User B sau khi A checkout: ${cartB.length}`);
    if (cartB.length === 0) {
      errors.push(`R4 Thất bại: Giỏ hàng của User B bị xóa mất sau khi User A checkout!`);
    }

    return errors;
  }
});

testCases.push({
  id: 'EP-TC20',
  covers: 'EC23, EC28',
  desc: 'Ràng buộc R2: Gọi checkout lần 2 ngay sau khi lần 1 thành công (giỏ đã bị xóa)',
  kind: 'API',
  expected: 'REJ (4xx); Số đơn hàng không tăng thêm',
  executeFn: async ctx => {
    const token = await getAuthToken();
    const products = await fetchProducts();
    await addToCart(token, products[0], 1);
    const total = Number(products[0].price);

    // Lần 1
    const res1 = await sendHttpRequest('POST', '/api/checkout', {
      total_amount: total,
      shipping_address: ADDR_NOM,
    }, true, { Authorization: `Bearer ${token}` });

    ctx.oracleLogs.push(`Lần checkout 1: status=${res1.status}`);

    // Lần 2 (ngay lập tức)
    const res2 = await sendHttpRequest('POST', '/api/checkout', {
      total_amount: total,
      shipping_address: ADDR_NOM,
    }, false, { Authorization: `Bearer ${token}` });

    const errors = [];
    ctx.oracleLogs.push(`Lần checkout 2: status=${res2.status}`);
    if (!isHttp4xx(res2)) {
      errors.push(`Lần checkout 2 không bị từ chối 4xx (status=${res2.status}) dù giỏ hàng đã phải bị xóa ở lần 1!`);
    }

    const myOrders = await getMyOrders(token);
    ctx.oracleLogs.push(`Tổng số đơn hàng tạo ra: ${myOrders.length}`);
    if (myOrders.length > 1) {
      errors.push(`Hệ thống tạo ra ${myOrders.length} đơn hàng thay vì chỉ 1 đơn hợp lệ duy nhất!`);
    }
    return errors;
  }
});

// UI cases EP-TC21 đến EP-TC32
registerUiTestCase('EP-TC21', 'EC30', 'Chưa đăng nhập truy cập trang Thanh toán bị chặn/chuyển hướng');
registerUiTestCase('EP-TC22', 'EC01, EC05, EC08, EC15, EC24-27', 'Luồng đặt hàng danh định hợp lệ trên UI');
registerUiTestCase('EP-TC23', 'EC31', 'UI hiển thị đầy đủ danh sách sản phẩm đặt mua');
registerUiTestCase('EP-TC24', 'EC32', 'UI tổng tiền tự tính, không có ô cho người dùng sửa trực tiếp');
registerUiTestCase('EP-TC25', 'EC33', 'Nhãn trường Địa chỉ giao hàng bắt buộc có dấu *');
registerUiTestCase('EP-TC26', 'EC34', 'Để trống ô địa chỉ trên UI bấm đặt hàng bị chặn/báo lỗi');
registerUiTestCase('EP-TC27', 'EC35', 'Thông báo lỗi trên UI hiển thị phía TRÊN nút submit');
registerUiTestCase('EP-TC28', 'EC36', 'Trang Thanh toán có Breadcrumb điều hướng');
registerUiTestCase('EP-TC29', 'EC37', 'Trang Thanh toán có đúng một thẻ <h1>');
registerUiTestCase('EP-TC30', 'EC38', 'Số tiền có ký hiệu ₫ và phân cách hàng nghìn');
registerUiTestCase('EP-TC31', 'EC39', 'Nút xác nhận đặt hàng có màu nền xanh dương');
registerUiTestCase('EP-TC32', 'EC40', 'Ô địa chỉ được tự động điền sẵn từ hồ sơ người dùng');

// --- BVA CASES ---
testCases.push({
  id: 'BV-TC01',
  covers: 'B01 LB (1 dòng)',
  desc: 'BVA B01 LB: Giỏ hàng có đúng 1 dòng sản phẩm (SP_A x 1)',
  kind: 'API',
  expected: '2xx; OC-OK(P_A, ADDR_NOM)',
  executeFn: async ctx => {
    const token = await getAuthToken();
    const products = await fetchProducts();
    await addToCart(token, products[0], 1);
    const correctTotal = Number(products[0].price);

    const res = await sendHttpRequest('POST', '/api/checkout', {
      total_amount: correctTotal,
      shipping_address: ADDR_NOM,
    }, false, { Authorization: `Bearer ${token}` });

    const errors = [];
    if (!isHttp2xx(res)) errors.push(`Status ${res.status} không phải 2xx`);
    const oracleErrors = await verifyOracleCheckoutSuccess(ctx, token, 0, correctTotal, ADDR_NOM);
    return errors.concat(oracleErrors);
  }
});

testCases.push({
  id: 'BV-TC02',
  covers: 'B02 LB (1 ký tự)',
  desc: 'BVA B02 LB: Địa chỉ giao hàng có độ dài cận dưới = 1 ký tự ("A")',
  kind: 'API',
  expected: '2xx; OC-OK(T, "A")',
  executeFn: async ctx => {
    const token = await getAuthToken();
    const products = await fetchProducts();
    await addToCart(token, products[0], 1);
    const correctTotal = Number(products[0].price);

    const res = await sendHttpRequest('POST', '/api/checkout', {
      total_amount: correctTotal,
      shipping_address: 'A',
    }, false, { Authorization: `Bearer ${token}` });

    const errors = [];
    if (!isHttp2xx(res)) errors.push(`Status ${res.status} không phải 2xx khi địa chỉ dài 1 ký tự`);
    const oracleErrors = await verifyOracleCheckoutSuccess(ctx, token, 0, correctTotal, 'A');
    return errors.concat(oracleErrors);
  }
});

testCases.push({
  id: 'BV-TC03',
  covers: 'B02 LB+δ (2 ký tự)',
  desc: 'BVA B02 LB+δ: Địa chỉ giao hàng có độ dài = 2 ký tự ("AB")',
  kind: 'API',
  expected: '2xx; OC-OK(T, "AB")',
  executeFn: async ctx => {
    const token = await getAuthToken();
    const products = await fetchProducts();
    await addToCart(token, products[0], 1);
    const correctTotal = Number(products[0].price);

    const res = await sendHttpRequest('POST', '/api/checkout', {
      total_amount: correctTotal,
      shipping_address: 'AB',
    }, false, { Authorization: `Bearer ${token}` });

    const errors = [];
    if (!isHttp2xx(res)) errors.push(`Status ${res.status} không phải 2xx`);
    const oracleErrors = await verifyOracleCheckoutSuccess(ctx, token, 0, correctTotal, 'AB');
    return errors.concat(oracleErrors);
  }
});

testCases.push({
  id: 'BV-TC04',
  covers: 'B02 UB-δ (254 ký tự)',
  desc: 'BVA B02 UB-δ: Địa chỉ giao hàng dài 254 ký tự ("A"*254)',
  kind: 'API',
  expected: '2xx; OC-OK(T, 254 ký tự)',
  executeFn: async ctx => {
    const token = await getAuthToken();
    const products = await fetchProducts();
    await addToCart(token, products[0], 1);
    const correctTotal = Number(products[0].price);
    const addr254 = 'A'.repeat(254);

    const res = await sendHttpRequest('POST', '/api/checkout', {
      total_amount: correctTotal,
      shipping_address: addr254,
    }, false, { Authorization: `Bearer ${token}` });

    const errors = [];
    if (!isHttp2xx(res)) errors.push(`Status ${res.status} không phải 2xx khi địa chỉ 254 ký tự`);
    const oracleErrors = await verifyOracleCheckoutSuccess(ctx, token, 0, correctTotal, addr254);
    return errors.concat(oracleErrors);
  }
});

testCases.push({
  id: 'BV-TC05',
  covers: 'B02 UB (255 ký tự)',
  desc: 'BVA B02 UB: Địa chỉ giao hàng đúng cận trên giả định = 255 ký tự',
  kind: 'API',
  expected: '2xx; OC-OK(T, 255 ký tự)',
  executeFn: async ctx => {
    const token = await getAuthToken();
    const products = await fetchProducts();
    await addToCart(token, products[0], 1);
    const correctTotal = Number(products[0].price);
    const addr255 = 'A'.repeat(255);

    const res = await sendHttpRequest('POST', '/api/checkout', {
      total_amount: correctTotal,
      shipping_address: addr255,
    }, false, { Authorization: `Bearer ${token}` });

    const errors = [];
    if (!isHttp2xx(res)) errors.push(`Status ${res.status} không phải 2xx khi địa chỉ 255 ký tự`);
    const oracleErrors = await verifyOracleCheckoutSuccess(ctx, token, 0, correctTotal, addr255);
    return errors.concat(oracleErrors);
  }
});

testCases.push({
  id: 'BV-TC06',
  covers: 'B02 UB+δ (256 ký tự)',
  desc: 'BVA B02 UB+δ: Địa chỉ giao hàng vượt cận trên = 256 ký tự',
  kind: 'API',
  expected: 'REJ (4xx); OC-NO',
  executeFn: async ctx => {
    const token = await getAuthToken();
    const products = await fetchProducts();
    await addToCart(token, products[0], 1);
    const correctTotal = Number(products[0].price);
    const addr256 = 'A'.repeat(256);

    const res = await sendHttpRequest('POST', '/api/checkout', {
      total_amount: correctTotal,
      shipping_address: addr256,
    }, false, { Authorization: `Bearer ${token}` });

    const errors = [];
    if (!isHttp4xx(res)) errors.push(`Status ${res.status} không từ chối địa chỉ 256 ký tự`);
    return errors;
  }
});

// --- STUDENT REVIEW CASES (SR-TC01 đến SR-TC05) ---
testCases.push({
  id: 'SR-TC01',
  covers: 'R1, Toàn vẹn CSDL',
  desc: 'Sản phẩm trong giỏ bị admin đổi giá trước khi checkout (tự cập nhật theo giá mới)',
  kind: 'API',
  expected: '2xx; Tổng tiền tính theo giá mới trong CSDL',
  executeFn: async ctx => {
    const token = await getAuthToken();
    const products = await fetchProducts();
    const p1 = products[0];
    await addToCart(token, p1, 1);

    // Giả lập admin đổi giá sản phẩm p1 từ giá cũ lên giá mới
    const newPrice = Number(p1.price) + 50000;
    await sendHttpRequest('PUT', `/api/products/${p1.id}`, {
      name: p1.name,
      price: newPrice,
      description: p1.description,
      imageUrl: p1.imageUrl,
      category_id: p1.category_id,
    }, true);

    ctx.oracleLogs.push(`Giá SP ${p1.name} đã đổi: ${p1.price} -> ${newPrice}`);

    // Client checkout (vẫn gửi giá cũ hoặc không gửi)
    const res = await sendHttpRequest('POST', '/api/checkout', {
      total_amount: Number(p1.price),
      shipping_address: ADDR_NOM,
    }, false, { Authorization: `Bearer ${token}` });

    const errors = [];
    if (!isHttp2xx(res)) errors.push(`Checkout trả về status ${res.status}`);

    const myOrders = await getMyOrders(token);
    if (myOrders.length > 0) {
      const latestOrder = myOrders[0];
      ctx.oracleLogs.push(`Tổng tiền đơn hàng thực tế lưu: ${latestOrder.total_amount}`);
      if (Number(latestOrder.total_amount) === Number(p1.price)) {
        errors.push(`R1 Thất bại: Đơn hàng lưu giá cũ ${p1.price} thay vì cập nhật theo giá mới ${newPrice}`);
      } else if (Number(latestOrder.total_amount) !== newPrice) {
        errors.push(`Tổng tiền ${latestOrder.total_amount} không khớp giá mới ${newPrice}`);
      }
    }
    return errors;
  }
});

testCases.push({
  id: 'SR-TC02',
  covers: 'R2, Race Condition',
  desc: 'Chống Double Submit: Gửi 2 request checkout đồng thời',
  kind: 'API',
  expected: 'Chỉ tạo đúng 1 đơn hàng duy nhất; request thứ hai bị từ chối',
  executeFn: async ctx => {
    const token = await getAuthToken();
    const products = await fetchProducts();
    await addToCart(token, products[0], 1);
    const total = Number(products[0].price);

    // Gửi song song 2 request checkout cùng lúc
    const [res1, res2] = await Promise.all([
      sendHttpRequest('POST', '/api/checkout', { total_amount: total, shipping_address: ADDR_NOM }, true, { Authorization: `Bearer ${token}` }),
      sendHttpRequest('POST', '/api/checkout', { total_amount: total, shipping_address: ADDR_NOM }, true, { Authorization: `Bearer ${token}` }),
    ]);

    ctx.oracleLogs.push(`Request 1: ${res1.status}, Request 2: ${res2.status}`);

    const myOrders = await getMyOrders(token);
    ctx.oracleLogs.push(`Số đơn hàng được tạo: ${myOrders.length}`);

    const errors = [];
    if (myOrders.length > 1) {
      errors.push(`Race Condition Thất bại: Cả 2 request đều tạo thành công ${myOrders.length} đơn hàng trùng lặp!`);
    } else if (myOrders.length === 0) {
      errors.push(`Cả 2 request đều thất bại`);
    }
    return errors;
  }
});

testCases.push({
  id: 'SR-TC03',
  covers: 'FR-08, Unicode & Multiline',
  desc: 'Địa chỉ chứa ký tự xuống dòng (\\n), tiếng Việt có dấu phức tạp và emoji',
  kind: 'API',
  expected: '2xx; Lưu trữ nguyên vẹn không bị cắt dòng hay lỗi font',
  executeFn: async ctx => {
    const token = await getAuthToken();
    const products = await fetchProducts();
    await addToCart(token, products[0], 1);
    const multiLineAddr = 'Tầng 5, Tòa nhà Bitexco\nSố 2 Hải Triều, P. Bến Nghé, Q.1, TP.HCM 🇻🇳\n(Giao giờ hành chính)';

    const res = await sendHttpRequest('POST', '/api/checkout', {
      total_amount: Number(products[0].price),
      shipping_address: multiLineAddr,
    }, false, { Authorization: `Bearer ${token}` });

    const errors = [];
    if (!isHttp2xx(res)) errors.push(`Status ${res.status} không phải 2xx khi gửi địa chỉ nhiều dòng`);
    const oracleErrors = await verifyOracleCheckoutSuccess(ctx, token, 0, Number(products[0].price), multiLineAddr);
    return errors.concat(oracleErrors);
  }
});

testCases.push({
  id: 'SR-TC04',
  covers: 'SEC-05, SQL Injection',
  desc: 'Địa chỉ giao hàng chứa payload SQL Injection ("123 Lê Lợi\' OR \'1\'=\'1 --")',
  kind: 'API',
  expected: 'Không gây lỗi 500 / SQLite crash; lưu an toàn dưới dạng Parameterized Query',
  executeFn: async ctx => {
    const token = await getAuthToken();
    const products = await fetchProducts();
    await addToCart(token, products[0], 1);
    const sqlPayload = "123 Lê Lợi' OR '1'='1 --";

    const res = await sendHttpRequest('POST', '/api/checkout', {
      total_amount: Number(products[0].price),
      shipping_address: sqlPayload,
    }, false, { Authorization: `Bearer ${token}` });

    const errors = [];
    if (res.status === 500) {
      errors.push(`SEC-05 Thất bại (Lỗ hổng SQL Injection): Backend trả về HTTP 500 khi gặp dấu nháy đơn!`);
    } else if (isHttp2xx(res)) {
      const oracleErrors = await verifyOracleCheckoutSuccess(ctx, token, 0, Number(products[0].price), sqlPayload);
      errors.push(...oracleErrors);
    }
    return errors;
  }
});

testCases.push({
  id: 'SR-TC05',
  covers: 'SEC-02, IDOR Access Control',
  desc: 'User B (tài khoản khác) cố tình xem đơn hàng của User A (GET /api/orders/:id)',
  kind: 'API',
  expected: 'REJ (403 Forbidden hoặc 404 Not Found); không để lộ thông tin đơn hàng',
  executeFn: async ctx => {
    const tokenA = await getAuthToken(SEED_USER_EMAIL, SEED_USER_PASSWORD);
    const tokenB = await getAuthToken(ADMIN_USER_EMAIL, ADMIN_USER_PASSWORD);
    const products = await fetchProducts();
    await addToCart(tokenA, products[0], 1);

    // User A tạo đơn
    const resA = await sendHttpRequest('POST', '/api/checkout', {
      total_amount: Number(products[0].price),
      shipping_address: ADDR_NOM,
    }, true, { Authorization: `Bearer ${tokenA}` });

    const myOrdersA = await getMyOrders(tokenA);
    if (!myOrdersA.length) throw { blocked: 'User A không tạo được đơn hàng mẫu' };
    const orderAId = myOrdersA[0].id;
    ctx.oracleLogs.push(`User A tạo đơn #ID=${orderAId}`);

    // User B truy cập đơn của User A
    const resB = await sendHttpRequest('GET', `/api/orders/${orderAId}`, undefined, false, {
      Authorization: `Bearer ${tokenB}`
    });

    ctx.oracleLogs.push(`User B truy vấn đơn #${orderAId}: status=${resB.status}`);

    const errors = [];
    if (resB.status === 200) {
      errors.push(`SEC-02 Thất bại (LỖ HỔNG IDOR): User B có thể xem toàn bộ đơn hàng của User A mà không bị chặn! (HTTP 200)`);
    } else if (resB.status !== 403 && resB.status !== 404) {
      errors.push(`Kỳ vọng từ chối 403 hoặc 404, thực tế nhận status: ${resB.status}`);
    }
    return errors;
  }
});

// ============================================================================
// 4. TIẾN TRÌNH THỰC THI CHÍNH
// ============================================================================
const escapeMarkdownTableCell = text => {
  if (!text) return '';
  return String(text).replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
};

(async () => {
  console.log('======================================================');
  console.log(`BẮT ĐẦU THỰC THI KIỂM THỬ API CHO FR-08 (CHECKOUT)`);
  console.log(`Tổng số ca đăng ký: ${testCases.length}`);
  console.log('======================================================\n');

  const executionResults = [];

  for (const tc of testCases) {
    capturedHttpCalls = [];
    const context = { oracleLogs: [] };
    let status = 'Not run';
    let failureReasons = [];

    if (tc.kind === 'UI') {
      failureReasons = ['Ca UI kiểm thử qua trình duyệt Playwright CLI'];
      // Kết quả UI sẽ được cập nhật từ run_ui_1.json
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

    const mainCall = [...capturedHttpCalls].reverse().find(call => call.path === '/api/checkout') ||
                     [...capturedHttpCalls].reverse().find(call => call.path.startsWith('/api/orders')) ||
                     capturedHttpCalls[0] || null;

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

    console.log(`[${tc.id}] ${status.padEnd(7)} | Status: ${mainCall ? mainCall.status : '-'} | Lý do: ${failureReasons.join('; ')}`);
  }

  // Dọn dẹp server và DB tạm
  if (serverProcess) { try { serverProcess.kill(); } catch {} }
  killExistingServerOnPort3000();
  await sleep(300);
  removeTemporaryDatabaseFiles();

  // Khởi động lại server mặc định (DB thật) để hệ thống tiếp tục hoạt động cho UI và dev
  spawn(process.execPath, ['server.js'], {
    cwd: BACKEND_DIR,
    env: { ...process.env, JWT_SECRET },
    stdio: 'ignore',
    detached: true,
  }).unref();

  const countByStatus = st => executionResults.filter(r => r.status === st).length;
  fs.mkdirSync(path.dirname(path.resolve(OUTPUT_PATH)), { recursive: true });

  // 1. Ghi file JSON
  fs.writeFileSync(OUTPUT_PATH + '.json', JSON.stringify({ baseUrl: BASE_URL, results: executionResults }, null, 2), 'utf8');

  // 2. Ghi file Markdown
  const markdownLines = [];
  markdownLines.push(`<!-- Sinh tự động bởi run_fr08.js lúc ${new Date().toISOString()} -->`);
  markdownLines.push(`**Tổng:** ${executionResults.length} · **Pass:** ${countByStatus('Pass')} · **Fail:** ${countByStatus('Fail')} · **Blocked:** ${countByStatus('Blocked')} · **Not run:** ${countByStatus('Not run')}`, '');
  markdownLines.push('| TC ID | Mong đợi | Thực tế | Trạng thái | Ghi chú / Lý do |', '|---|---|---|---|---|');

  for (const res of executionResults) {
    const actualText = [
      res.actualStatus !== null ? `HTTP ${res.actualStatus}: ${res.actualBody}` : '',
      res.oracleLogs.join('; '),
    ].filter(Boolean).join(' | ');
    markdownLines.push(`| ${res.id} | ${escapeMarkdownTableCell(res.expected)} | ${escapeMarkdownTableCell(actualText)} | **${res.status}** | ${escapeMarkdownTableCell(res.reasons.join('; '))} |`);
  }

  fs.writeFileSync(OUTPUT_PATH + '.md', markdownLines.join('\n') + '\n', 'utf8');

  console.log(`\n======================================================`);
  console.log(`KẾT QUẢ TỔNG HỢP API: ${executionResults.length} test cases`);
  console.log(`Pass: ${countByStatus('Pass')} | Fail: ${countByStatus('Fail')} | Blocked: ${countByStatus('Blocked')} | Not run (UI): ${countByStatus('Not run')}`);
  console.log(`Đã xuất kết quả:`);
  console.log(`- ${OUTPUT_PATH}.json`);
  console.log(`- ${OUTPUT_PATH}.md`);
  console.log(`======================================================`);
})().catch(err => {
  console.error('Lỗi thực thi:', err);
  process.exit(1);
});
