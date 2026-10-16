#!/usr/bin/env node
/**
 * run_fr14.js — Bộ thực thi kiểm thử tự động API cho FR-14: Quản lý Danh mục (Category CRUD) (HW02 EShop)
 *
 * Tuân thủ quy định hw02_test_executor:
 * - Clean DB Fixture: Mỗi ca chạy trên SQLite sạch độc lập (.hw02_fr14_run.sqlite).
 * - Không làm ảnh hưởng CSDL chính của hệ thống (database.sqlite).
 * - Test Oracle: Xác minh đa tầng (mã HTTP và trạng thái thực tế của bảng categories/products qua GET API).
 * - 100% tiếng Việt có dấu trong mã nguồn, log và bảng kết quả.
 * - Tự động xuất file kết quả: <out>.json và <out>.md.
 */

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const BACKEND_DIR = path.resolve(__dirname, '../../../backend');
const TEMP_DB_FILE = path.join(BACKEND_DIR, '.hw02_fr14_run.sqlite');
const OUTPUT_PATH = process.argv[2] || path.join(__dirname, 'run_api_1');
const JWT_SECRET = 'supersecretjwtkeyforhw02testing12345';

const SEED_USER_EMAIL = 'test@eshop.com';
const SEED_USER_PASSWORD = 'Test1234!';
const ADMIN_USER_EMAIL = 'admin@eshop.com';
const ADMIN_USER_PASSWORD = 'Admin123!';

const NAME_NOM = 'Thiết bị gia dụng thông minh'; // 28 ký tự
const NAME_UPD = 'Thiết bị gia dụng cao cấp';     // 25 ký tự
const NAME_TEMP = 'Danh mục tạm test';

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
      const ping = await fetch(`${BASE_URL}/api/categories`);
      if (ping.ok) return;
    } catch {}
  }
  throw new Error('Backend không thể khởi động kịp thời hạn.');
}

async function prepareFreshDatabaseFixture() {
  if (serverProcess) {
    try { serverProcess.kill(); } catch {}
  }
  killExistingServerOnPort3000();
  await sleep(250);
  removeTemporaryDatabaseFiles();

  await startBackendWithEnv({ DB_PATH: TEMP_DB_FILE });

  for (let attempt = 0; attempt < 40; attempt++) {
    const checkLogin = await sendHttpRequest('POST', '/api/login', {
      email: ADMIN_USER_EMAIL,
      password: ADMIN_USER_PASSWORD,
    }, true);
    if (checkLogin.status === 200) return true;
    await sleep(150);
  }
  return false;
}

/**
 * Khởi tạo Fixture P_BVA_ID:
 * Bảng categories có đúng 5 danh mục id = 1..5 và không có sản phẩm tham chiếu (category_in_use = false)
 * để cô lập hoàn toàn biến :id theo đúng thiết kế BVA Bước 1 & Bước 3.
 */
async function prepareBvaIdFixture() {
  const sqlite3Path = path.join(BACKEND_DIR, 'node_modules', 'sqlite3');
  const sqlite3 = require(sqlite3Path).verbose();
  await new Promise((resolve, reject) => {
    const db = new sqlite3.Database(TEMP_DB_FILE, err => {
      if (err) return reject(err);
      db.serialize(() => {
        db.run('DELETE FROM products');
        db.run('DELETE FROM categories');
        db.run('DELETE FROM sqlite_sequence WHERE name = "categories"');
        const stmt = db.prepare('INSERT INTO categories (id, name) VALUES (?, ?)');
        for (let i = 1; i <= 5; i++) {
          stmt.run(i, `Danh mục biên ${i}`);
        }
        stmt.finalize(err2 => {
          db.close(() => (err2 ? reject(err2) : resolve()));
        });
      });
    });
  });
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
  const headers = { ...customHeaders };
  if (payload !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

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
    const bodyPart = payload === undefined ? '' : ` -ContentType 'application/json' -Body '${formatPayloadDisplay(payload)}'`;
    capturedHttpCalls.push({
      method,
      path: endpoint,
      status,
      response: responseText,
      powershellCmd: `Invoke-WebRequest -Uri "${BASE_URL}${endpoint}" -Method ${method}${authHeaderPart}${bodyPart} -SkipHttpErrorCheck`,
    });
  }
  return { status, text: responseText, json: parsedJson };
}

const isHttp2xx = res => res.status >= 200 && res.status < 300;
const isHttp4xx = res => res.status >= 400 && res.status < 500;

async function getAuthToken(email = ADMIN_USER_EMAIL, password = ADMIN_USER_PASSWORD) {
  const res = await sendHttpRequest('POST', '/api/login', { email, password }, true);
  return res.json && res.json.token ? res.json.token : null;
}

async function fetchCategories() {
  const res = await sendHttpRequest('GET', '/api/categories', undefined, true);
  return Array.isArray(res.json) ? res.json : [];
}

async function fetchProducts() {
  const res = await sendHttpRequest('GET', '/api/products', undefined, true);
  return Array.isArray(res.json) ? res.json : [];
}

/**
 * Tạo điều kiện tiên quyết P2: tạo 1 danh mục tạm chưa gắn sản phẩm (ID_EMPTY)
 */
async function createEmptyCategoryPrecondition(adminToken, tempName = NAME_TEMP) {
  const res = await sendHttpRequest('POST', '/api/categories', { name: tempName }, true, {
    Authorization: `Bearer ${adminToken}`,
  });
  const cats = await fetchCategories();
  const created = (res.json && res.json.id)
    ? cats.find(c => Number(c.id) === Number(res.json.id))
    : cats.find(c => c.name === tempName);
  if (!created) {
    throw { blocked: 'Không tạo được danh mục tạm ID_EMPTY cho điều kiện tiên quyết P2' };
  }
  return { idEmpty: created.id, categoriesAfterP2: cats };
}

// ============================================================================
// TEST ORACLES CHO QUẢN LÝ DANH MỤC (FR-14)
// ============================================================================

/**
 * Oracle OC-ADD-OK(expectedName):
 * - Tổng số danh mục tăng đúng 1 (N0 + 1).
 * - Có đúng 1 bản ghi mới với trường name === expectedName và id nguyên dương.
 * - Toàn bộ N0 bản ghi cũ giữ nguyên (R3).
 */
async function verifyOracleAddSuccess(ctx, initialCategories, expectedName) {
  const errors = [];
  const afterCategories = await fetchCategories();
  ctx.oracleLogs.push(`Số danh mục: trước=${initialCategories.length}, sau=${afterCategories.length}`);

  if (afterCategories.length !== initialCategories.length + 1) {
    errors.push(`OC-ADD-OK Thất bại: Số lượng danh mục không tăng đúng 1 (trước: ${initialCategories.length}, sau: ${afterCategories.length})`);
  }

  for (const oldCat of initialCategories) {
    const found = afterCategories.find(c => Number(c.id) === Number(oldCat.id) && c.name === oldCat.name);
    if (!found) {
      errors.push(`OC-ADD-OK Thất bại (Vi phạm R3): Danh mục cũ id=${oldCat.id} ("${oldCat.name}") bị mất hoặc bị thay đổi`);
    }
  }

  const initialIds = new Set(initialCategories.map(c => Number(c.id)));
  const newRecords = afterCategories.filter(c => !initialIds.has(Number(c.id)));
  if (newRecords.length !== 1) {
    errors.push(`OC-ADD-OK Thất bại: Kỳ vọng có đúng 1 bản ghi mới, thực tế có ${newRecords.length}`);
  } else {
    const newCat = newRecords[0];
    ctx.oracleLogs.push(`Bản ghi mới: id=${newCat.id}, len(name)=${String(newCat.name).length}`);
    if (newCat.name !== expectedName) {
      errors.push(`OC-ADD-OK Thất bại: Tên danh mục lưu trong CSDL không khớp chuỗi gửi đi`);
    }
  }
  return errors;
}

/**
 * Oracle OC-DEL-OK(deletedId):
 * - Tổng số danh mục giảm đúng 1 (N - 1).
 * - Không còn bản ghi nào có id === deletedId.
 * - Toàn bộ các bản ghi còn lại giữ nguyên (R3).
 */
async function verifyOracleDeleteSuccess(ctx, initialCategories, deletedId) {
  const errors = [];
  const afterCategories = await fetchCategories();
  ctx.oracleLogs.push(`Số danh mục: trước=${initialCategories.length}, sau=${afterCategories.length}`);

  if (afterCategories.length !== initialCategories.length - 1) {
    errors.push(`OC-DEL-OK Thất bại: Số danh mục không giảm đúng 1 (trước: ${initialCategories.length}, sau: ${afterCategories.length})`);
  }

  const stillExists = afterCategories.some(c => Number(c.id) === Number(deletedId));
  if (stillExists) {
    errors.push(`OC-DEL-OK Thất bại: Danh mục id=${deletedId} vẫn còn tồn tại trong CSDL sau khi xóa`);
  }

  for (const oldCat of initialCategories) {
    if (Number(oldCat.id) === Number(deletedId)) continue;
    const found = afterCategories.find(c => Number(c.id) === Number(oldCat.id) && c.name === oldCat.name);
    if (!found) {
      errors.push(`OC-DEL-OK Thất bại (Vi phạm R3): Danh mục khác id=${oldCat.id} ("${oldCat.name}") bị ảnh hưởng`);
    }
  }
  return errors;
}

/**
 * Oracle OC-PUT-OK(updatedId, expectedNewName):
 * - Tổng số danh mục không đổi.
 * - Bản ghi có id === updatedId đổi tên thành expectedNewName.
 * - Các bản ghi khác giữ nguyên (R3).
 */
async function verifyOraclePutSuccess(ctx, initialCategories, updatedId, expectedNewName) {
  const errors = [];
  const afterCategories = await fetchCategories();
  ctx.oracleLogs.push(`Số danh mục: trước=${initialCategories.length}, sau=${afterCategories.length}`);

  if (afterCategories.length !== initialCategories.length) {
    errors.push(`OC-PUT-OK Thất bại: Tổng số danh mục bị thay đổi (trước: ${initialCategories.length}, sau: ${afterCategories.length})`);
  }

  const target = afterCategories.find(c => Number(c.id) === Number(updatedId));
  if (!target) {
    errors.push(`OC-PUT-OK Thất bại: Không tìm thấy danh mục id=${updatedId} sau khi cập nhật`);
  } else {
    ctx.oracleLogs.push(`Danh mục id=${updatedId} sau PUT: name="${target.name}"`);
    if (target.name !== expectedNewName) {
      errors.push(`OC-PUT-OK Thất bại: Tên danh mục id=${updatedId} là "${target.name}" (kỳ vọng: "${expectedNewName}")`);
    }
  }

  for (const oldCat of initialCategories) {
    if (Number(oldCat.id) === Number(updatedId)) continue;
    const found = afterCategories.find(c => Number(c.id) === Number(oldCat.id) && c.name === oldCat.name);
    if (!found) {
      errors.push(`OC-PUT-OK Thất bại (Vi phạm R3): Danh mục khác id=${oldCat.id} bị thay đổi ngoài ý muốn`);
    }
  }
  return errors;
}

/**
 * Oracle OC-NO:
 * - Bảng categories giữ nguyên 100% cả số lượng lẫn từng cặp (id, name).
 */
async function verifyOracleNoChange(ctx, initialCategories) {
  const errors = [];
  const afterCategories = await fetchCategories();
  ctx.oracleLogs.push(`Số danh mục: trước=${initialCategories.length}, sau=${afterCategories.length}`);

  if (afterCategories.length !== initialCategories.length) {
    errors.push(`OC-NO Thất bại: Số lượng danh mục bị thay đổi dù dữ liệu/quyền không hợp lệ (trước: ${initialCategories.length}, sau: ${afterCategories.length})`);
    return errors;
  }

  for (let i = 0; i < initialCategories.length; i++) {
    const a = initialCategories[i];
    const b = afterCategories.find(c => Number(c.id) === Number(a.id));
    if (!b || b.name !== a.name) {
      errors.push(`OC-NO Thất bại: Bản ghi id=${a.id} ("${a.name}") bị thay đổi hoặc mất trong CSDL`);
    }
  }
  return errors;
}

// ============================================================================
// 3. ĐỊNH NGHĨA 50 CA KIỂM THỬ (EP-TC01..34, BV-TC01..10, OB-TC01, SR-TC01..05)
// ============================================================================
const testCases = [];

// --- NHÓM EP API (EP-TC01 -> EP-TC27) ---

testCases.push({
  id: 'EP-TC01',
  covers: 'EC28, EC29',
  desc: 'Xem danh sách danh mục hợp lệ qua GET /api/categories',
  kind: 'API',
  expected: '200 OK; trả về mảng JSON gồm các đối tượng có đủ id (nguyên dương) và name (chuỗi không rỗng)',
  executeFn: async ctx => {
    const res = await sendHttpRequest('GET', '/api/categories');
    const errors = [];
    if (res.status !== 200) {
      errors.push(`Kỳ vọng HTTP 200, nhận được ${res.status}`);
    }
    if (!Array.isArray(res.json) || res.json.length === 0) {
      errors.push('Phản hồi không phải mảng JSON danh mục hoặc mảng rỗng bất thường trên DB seed');
    } else {
      ctx.oracleLogs.push(`Trả về ${res.json.length} danh mục: ${res.json.map(c => `${c.id}:${c.name}`).join(', ')}`);
      for (const item of res.json) {
        if (!Number.isInteger(Number(item.id)) || Number(item.id) < 1 || typeof item.name !== 'string' || !item.name.trim()) {
          errors.push(`Phần tử danh mục không đúng cấu trúc {id, name}: ${JSON.stringify(item)}`);
        }
      }
    }
    return errors;
  },
});

testCases.push({
  id: 'EP-TC02',
  covers: 'EC01, EC08, EC30',
  desc: 'Admin thêm danh mục mới hợp lệ (POST /api/categories với NAME_NOM)',
  kind: 'API',
  expected: 'OC-ADD-OK(NAME_NOM): HTTP 2xx; tăng đúng 1 danh mục mới khớp tên',
  executeFn: async ctx => {
    const adminToken = await getAuthToken(ADMIN_USER_EMAIL, ADMIN_USER_PASSWORD);
    const initialCategories = await fetchCategories();
    const res = await sendHttpRequest('POST', '/api/categories', { name: NAME_NOM }, false, {
      Authorization: `Bearer ${adminToken}`,
    });
    const errors = [];
    if (!isHttp2xx(res)) {
      errors.push(`Kỳ vọng HTTP 2xx, thực tế nhận ${res.status}`);
    }
    errors.push(...(await verifyOracleAddSuccess(ctx, initialCategories, NAME_NOM)));
    return errors;
  },
});

testCases.push({
  id: 'EP-TC03',
  covers: 'EC01, EC17, EC31',
  desc: 'Admin xóa danh mục hợp lệ không chứa sản phẩm (DELETE /api/categories/:ID_EMPTY)',
  kind: 'API',
  expected: 'OC-DEL-OK(ID_EMPTY): HTTP 2xx; giảm đúng 1 danh mục, các danh mục khác giữ nguyên',
  executeFn: async ctx => {
    const adminToken = await getAuthToken(ADMIN_USER_EMAIL, ADMIN_USER_PASSWORD);
    const { idEmpty, categoriesAfterP2 } = await createEmptyCategoryPrecondition(adminToken);
    const res = await sendHttpRequest('DELETE', `/api/categories/${idEmpty}`, undefined, false, {
      Authorization: `Bearer ${adminToken}`,
    });
    const errors = [];
    if (!isHttp2xx(res)) {
      errors.push(`Kỳ vọng HTTP 2xx, thực tế nhận ${res.status}`);
    }
    errors.push(...(await verifyOracleDeleteSuccess(ctx, categoriesAfterP2, idEmpty)));
    return errors;
  },
});

testCases.push({
  id: 'EP-TC04',
  covers: 'EC01, EC24, EC32',
  desc: 'Admin cập nhật tên danh mục hợp lệ (PUT /api/categories/:ID_EMPTY)',
  kind: 'API',
  expected: 'OC-PUT-OK(ID_EMPTY, NAME_UPD): HTTP 2xx; danh mục đổi tên thành công, danh mục khác giữ nguyên',
  executeFn: async ctx => {
    const adminToken = await getAuthToken(ADMIN_USER_EMAIL, ADMIN_USER_PASSWORD);
    const { idEmpty, categoriesAfterP2 } = await createEmptyCategoryPrecondition(adminToken);
    const res = await sendHttpRequest('PUT', `/api/categories/${idEmpty}`, { name: NAME_UPD }, false, {
      Authorization: `Bearer ${adminToken}`,
    });
    const errors = [];
    if (!isHttp2xx(res)) {
      errors.push(`Kỳ vọng HTTP 2xx theo hợp đồng API mục 3.4 (PUT /api/categories/:id), thực tế nhận HTTP ${res.status}`);
    }
    errors.push(...(await verifyOraclePutSuccess(ctx, categoriesAfterP2, idEmpty, NAME_UPD)));
    return errors;
  },
});

testCases.push({
  id: 'EP-TC05',
  covers: 'EC02, EC33',
  desc: 'Gửi POST /api/categories không có header Authorization',
  kind: 'API',
  expected: 'REJ-AUTH (401 Unauthorized); OC-NO (bảng categories không đổi)',
  executeFn: async ctx => {
    const initialCategories = await fetchCategories();
    const res = await sendHttpRequest('POST', '/api/categories', { name: NAME_NOM });
    const errors = [];
    if (res.status !== 401) {
      errors.push(`Kỳ vọng HTTP 401 khi thiếu token, thực tế nhận ${res.status}`);
    }
    errors.push(...(await verifyOracleNoChange(ctx, initialCategories)));
    return errors;
  },
});

testCases.push({
  id: 'EP-TC06',
  covers: 'EC03, EC33',
  desc: 'Gửi POST /api/categories với Token giả mạo sai chữ ký',
  kind: 'API',
  expected: 'REJ-AUTH (401/403); OC-NO',
  executeFn: async ctx => {
    const initialCategories = await fetchCategories();
    const res = await sendHttpRequest('POST', '/api/categories', { name: NAME_NOM }, false, {
      Authorization: 'Bearer token.gia.mao',
    });
    const errors = [];
    if (res.status !== 401 && res.status !== 403) {
      errors.push(`Kỳ vọng HTTP 401 hoặc 403 khi token giả mạo, thực tế nhận ${res.status}`);
    }
    errors.push(...(await verifyOracleNoChange(ctx, initialCategories)));
    return errors;
  },
});

testCases.push({
  id: 'EP-TC07',
  covers: 'EC04, EC33',
  desc: 'Gửi POST /api/categories với header Authorization thiếu tiền tố Bearer',
  kind: 'API',
  expected: 'REJ-AUTH (401); OC-NO',
  executeFn: async ctx => {
    const adminToken = await getAuthToken(ADMIN_USER_EMAIL, ADMIN_USER_PASSWORD);
    const initialCategories = await fetchCategories();
    const res = await sendHttpRequest('POST', '/api/categories', { name: NAME_NOM }, false, {
      Authorization: adminToken,
    });
    const errors = [];
    if (res.status !== 401 && res.status !== 403) {
      errors.push(`Kỳ vọng HTTP 401/403 khi sai định dạng Bearer, thực tế nhận ${res.status}`);
    }
    errors.push(...(await verifyOracleNoChange(ctx, initialCategories)));
    return errors;
  },
});

testCases.push({
  id: 'EP-TC08',
  covers: 'EC05, EC33',
  desc: 'Người dùng thường (role = user) gọi POST /api/categories (kiểm tra SEC-03 RBAC)',
  kind: 'API',
  expected: 'REJ-AUTH (403 Forbidden); OC-NO',
  executeFn: async ctx => {
    const userToken = await getAuthToken(SEED_USER_EMAIL, SEED_USER_PASSWORD);
    const initialCategories = await fetchCategories();
    const res = await sendHttpRequest('POST', '/api/categories', { name: NAME_NOM }, false, {
      Authorization: `Bearer ${userToken}`,
    });
    const errors = [];
    if (res.status !== 403 && res.status !== 401) {
      errors.push(`Kỳ vọng HTTP 403 (hoặc 401) chặn role='user', thực tế nhận ${res.status}`);
    }
    errors.push(...(await verifyOracleNoChange(ctx, initialCategories)));
    return errors;
  },
});

testCases.push({
  id: 'EP-TC09',
  covers: 'EC06, EC33',
  desc: 'Người dùng thường (role = user) gọi DELETE /api/categories/:ID_EMPTY (kiểm tra SEC-03 RBAC)',
  kind: 'API',
  expected: 'REJ-AUTH (403 Forbidden); OC-NO (ID_EMPTY không bị xóa)',
  executeFn: async ctx => {
    const adminToken = await getAuthToken(ADMIN_USER_EMAIL, ADMIN_USER_PASSWORD);
    const userToken = await getAuthToken(SEED_USER_EMAIL, SEED_USER_PASSWORD);
    const { idEmpty, categoriesAfterP2 } = await createEmptyCategoryPrecondition(adminToken);
    const res = await sendHttpRequest('DELETE', `/api/categories/${idEmpty}`, undefined, false, {
      Authorization: `Bearer ${userToken}`,
    });
    const errors = [];
    if (res.status !== 403 && res.status !== 401) {
      errors.push(`Kỳ vọng HTTP 403 (hoặc 401) chặn role='user' xóa danh mục, thực tế nhận ${res.status}`);
    }
    errors.push(...(await verifyOracleNoChange(ctx, categoriesAfterP2)));
    return errors;
  },
});

testCases.push({
  id: 'EP-TC10',
  covers: 'EC07, EC33',
  desc: 'Người dùng thường (role = user) gọi PUT /api/categories/:ID_EMPTY (kiểm tra SEC-03 RBAC)',
  kind: 'API',
  expected: 'REJ-AUTH (403 Forbidden); OC-NO',
  executeFn: async ctx => {
    const adminToken = await getAuthToken(ADMIN_USER_EMAIL, ADMIN_USER_PASSWORD);
    const userToken = await getAuthToken(SEED_USER_EMAIL, SEED_USER_PASSWORD);
    const { idEmpty, categoriesAfterP2 } = await createEmptyCategoryPrecondition(adminToken);
    const res = await sendHttpRequest('PUT', `/api/categories/${idEmpty}`, { name: NAME_UPD }, false, {
      Authorization: `Bearer ${userToken}`,
    });
    const errors = [];
    if (res.status !== 403 && res.status !== 401) {
      errors.push(`Kỳ vọng HTTP 403 (hoặc 401) chặn role='user' cập nhật danh mục, thực tế nhận ${res.status}`);
    }
    errors.push(...(await verifyOracleNoChange(ctx, categoriesAfterP2)));
    return errors;
  },
});

testCases.push({
  id: 'EP-TC11',
  covers: 'EC09, EC34 (và BVA B01 LB-δ = 0 ký tự)',
  desc: 'Admin gửi POST /api/categories với tên danh mục rỗng (name = "")',
  kind: 'API',
  expected: 'REJ-DATA (400 Bad Request); OC-NO (không tạo danh mục rỗng)',
  executeFn: async ctx => {
    const adminToken = await getAuthToken(ADMIN_USER_EMAIL, ADMIN_USER_PASSWORD);
    const initialCategories = await fetchCategories();
    const res = await sendHttpRequest('POST', '/api/categories', { name: '' }, false, {
      Authorization: `Bearer ${adminToken}`,
    });
    const errors = [];
    if (!isHttp4xx(res)) {
      errors.push(`Vi phạm FR-14 (dòng 189): Tên danh mục rỗng "" phải bị từ chối 4xx, nhưng thực tế nhận HTTP ${res.status}`);
    }
    errors.push(...(await verifyOracleNoChange(ctx, initialCategories)));
    return errors;
  },
});

testCases.push({
  id: 'EP-TC12',
  covers: 'EC10, EC34',
  desc: 'Admin gửi POST /api/categories với body rỗng {} (thiếu khóa name)',
  kind: 'API',
  expected: 'REJ-DATA (400 Bad Request); OC-NO',
  executeFn: async ctx => {
    const adminToken = await getAuthToken(ADMIN_USER_EMAIL, ADMIN_USER_PASSWORD);
    const initialCategories = await fetchCategories();
    const res = await sendHttpRequest('POST', '/api/categories', {}, false, {
      Authorization: `Bearer ${adminToken}`,
    });
    const errors = [];
    if (!isHttp4xx(res)) {
      errors.push(`Vi phạm FR-14 (dòng 189): Thiếu trường name ({}) phải bị từ chối 4xx, nhưng thực tế nhận HTTP ${res.status}`);
    }
    errors.push(...(await verifyOracleNoChange(ctx, initialCategories)));
    return errors;
  },
});

testCases.push({
  id: 'EP-TC13',
  covers: 'EC11, EC34',
  desc: 'Admin gửi POST /api/categories với chuỗi chỉ gồm 5 khoảng trắng ("     ")',
  kind: 'API',
  expected: 'REJ-DATA (400 Bad Request); OC-NO (Q2)',
  executeFn: async ctx => {
    const adminToken = await getAuthToken(ADMIN_USER_EMAIL, ADMIN_USER_PASSWORD);
    const initialCategories = await fetchCategories();
    const res = await sendHttpRequest('POST', '/api/categories', { name: '     ' }, false, {
      Authorization: `Bearer ${adminToken}`,
    });
    const errors = [];
    if (!isHttp4xx(res)) {
      errors.push(`Vi phạm FR-14 / Q2: Chuỗi toàn khoảng trắng phải bị từ chối 4xx, nhưng thực tế nhận HTTP ${res.status}`);
    }
    errors.push(...(await verifyOracleNoChange(ctx, initialCategories)));
    return errors;
  },
});

testCases.push({
  id: 'EP-TC14',
  covers: 'EC12, EC34',
  desc: 'Admin gửi POST /api/categories với tên dài 300 ký tự (> 255, theo giả định Q1/Q8)',
  kind: 'API',
  expected: 'REJ-DATA (400 Bad Request); OC-NO (theo giả định kỹ thuật Q1/Q8)',
  executeFn: async ctx => {
    const adminToken = await getAuthToken(ADMIN_USER_EMAIL, ADMIN_USER_PASSWORD);
    const initialCategories = await fetchCategories();
    const longName = 'A'.repeat(300);
    const res = await sendHttpRequest('POST', '/api/categories', { name: longName }, false, {
      Authorization: `Bearer ${adminToken}`,
    });
    const errors = [];
    if (!isHttp4xx(res)) {
      errors.push(`Theo Oracle giả định Q1 (max 255 ký tự): chuỗi 300 ký tự kỳ vọng bị từ chối 400, thực tế nhận HTTP ${res.status} (Ghi chú Q8: điểm mơ hồ đặc tả)`);
    }
    errors.push(...(await verifyOracleNoChange(ctx, initialCategories)));
    return errors;
  },
});

testCases.push({
  id: 'EP-TC15',
  covers: 'EC13, EC34',
  desc: 'Admin gửi POST /api/categories với name là kiểu số nguyên (12345)',
  kind: 'API',
  expected: 'REJ-DATA (400 Bad Request); OC-NO (Q7)',
  executeFn: async ctx => {
    const adminToken = await getAuthToken(ADMIN_USER_EMAIL, ADMIN_USER_PASSWORD);
    const initialCategories = await fetchCategories();
    const res = await sendHttpRequest('POST', '/api/categories', { name: 12345 }, false, {
      Authorization: `Bearer ${adminToken}`,
    });
    const errors = [];
    if (!isHttp4xx(res)) {
      errors.push(`Vi phạm hợp đồng kiểu dữ liệu JSON (Q7): name=12345 (number) phải bị từ chối 400, nhưng thực tế nhận HTTP ${res.status}`);
    }
    errors.push(...(await verifyOracleNoChange(ctx, initialCategories)));
    return errors;
  },
});

testCases.push({
  id: 'EP-TC16',
  covers: 'EC14, EC34',
  desc: 'Admin gửi POST /api/categories với name = null',
  kind: 'API',
  expected: 'REJ-DATA (400 Bad Request); OC-NO',
  executeFn: async ctx => {
    const adminToken = await getAuthToken(ADMIN_USER_EMAIL, ADMIN_USER_PASSWORD);
    const initialCategories = await fetchCategories();
    const res = await sendHttpRequest('POST', '/api/categories', { name: null }, false, {
      Authorization: `Bearer ${adminToken}`,
    });
    const errors = [];
    if (!isHttp4xx(res)) {
      errors.push(`Vi phạm FR-14 (dòng 189): name=null phải bị từ chối 4xx, nhưng thực tế nhận HTTP ${res.status}`);
    }
    errors.push(...(await verifyOracleNoChange(ctx, initialCategories)));
    return errors;
  },
});

testCases.push({
  id: 'EP-TC17',
  covers: 'EC15, EC34',
  desc: 'Admin tạo danh mục trùng tên với danh mục đã tồn tại (NAME_NOM lần 2)',
  kind: 'API',
  expected: 'REJ-DATA (400/409); không tạo bản ghi trùng tên thứ hai (Q3)',
  executeFn: async ctx => {
    const adminToken = await getAuthToken(ADMIN_USER_EMAIL, ADMIN_USER_PASSWORD);
    // Tạo lần 1 (tiên quyết)
    await sendHttpRequest('POST', '/api/categories', { name: NAME_NOM }, true, {
      Authorization: `Bearer ${adminToken}`,
    });
    const categoriesAfterFirst = await fetchCategories();
    // Tạo lần 2 trùng tên
    const res2 = await sendHttpRequest('POST', '/api/categories', { name: NAME_NOM }, false, {
      Authorization: `Bearer ${adminToken}`,
    });
    const errors = [];
    if (!isHttp4xx(res2)) {
      errors.push(`Vi phạm Q3 (tính duy nhất tên danh mục): Tạo trùng tên "${NAME_NOM}" lần 2 không bị chặn 4xx (nhận HTTP ${res2.status})`);
    }
    errors.push(...(await verifyOracleNoChange(ctx, categoriesAfterFirst)));
    return errors;
  },
});

testCases.push({
  id: 'EP-TC18',
  covers: 'EC16, EC30',
  desc: 'Tạo danh mục chứa chuỗi HTML/XSS (<img src=x onerror=alert(1)>) và kiểm tra lưu trữ/escape an toàn (SEC-04)',
  kind: 'API+UI',
  expected: 'API lưu chuỗi văn bản (không lỗi 500); trên Web Admin UI hiển thị dạng text, không thực thi onerror/alert',
  executeFn: async ctx => {
    const adminToken = await getAuthToken(ADMIN_USER_EMAIL, ADMIN_USER_PASSWORD);
    const initialCategories = await fetchCategories();
    const xssPayload = '<img src=x onerror=alert(1)>';
    const res = await sendHttpRequest('POST', '/api/categories', { name: xssPayload }, false, {
      Authorization: `Bearer ${adminToken}`,
    });
    const errors = [];
    if (res.status >= 500) {
      errors.push(`Lỗi máy chủ 500 khi gửi chuỗi đặc biệt XSS: HTTP ${res.status}`);
    } else if (isHttp2xx(res)) {
      errors.push(...(await verifyOracleAddSuccess(ctx, initialCategories, xssPayload)));
      ctx.oracleLogs.push('Phần UI (escape DOM không thực thi onerror) được kiểm chứng bổ sung trong fr14_ui.spec.js');
    }
    return errors;
  },
});

testCases.push({
  id: 'EP-TC19',
  covers: 'EC18, EC34',
  desc: 'Admin gọi DELETE /api/categories/999999 với id không tồn tại',
  kind: 'API',
  expected: 'REJ-DATA (404 Not Found); OC-NO (Q6)',
  executeFn: async ctx => {
    const adminToken = await getAuthToken(ADMIN_USER_EMAIL, ADMIN_USER_PASSWORD);
    const initialCategories = await fetchCategories();
    const res = await sendHttpRequest('DELETE', '/api/categories/999999', undefined, false, {
      Authorization: `Bearer ${adminToken}`,
    });
    const errors = [];
    if (!isHttp4xx(res)) {
      errors.push(`Vi phạm Q6: Xóa ID không tồn tại (999999) phải trả 404 (4xx), nhưng thực tế nhận HTTP ${res.status}`);
    }
    errors.push(...(await verifyOracleNoChange(ctx, initialCategories)));
    return errors;
  },
});

testCases.push({
  id: 'EP-TC20',
  covers: 'EC19, EC34 (và BVA B02 LB-δ: id = 0)',
  desc: 'Admin gọi DELETE /api/categories/0 (ngoài miền nguyên dương)',
  kind: 'API',
  expected: 'REJ-DATA (400/404); OC-NO (Q6)',
  executeFn: async ctx => {
    const adminToken = await getAuthToken(ADMIN_USER_EMAIL, ADMIN_USER_PASSWORD);
    const initialCategories = await fetchCategories();
    const res = await sendHttpRequest('DELETE', '/api/categories/0', undefined, false, {
      Authorization: `Bearer ${adminToken}`,
    });
    const errors = [];
    if (!isHttp4xx(res)) {
      errors.push(`Vi phạm Q6: Xóa id=0 (ngoài miền hợp lệ) phải trả 400/404, nhưng thực tế nhận HTTP ${res.status}`);
    }
    errors.push(...(await verifyOracleNoChange(ctx, initialCategories)));
    return errors;
  },
});

testCases.push({
  id: 'EP-TC21',
  covers: 'EC20, EC34',
  desc: 'Admin gọi DELETE /api/categories/-5 (id nguyên âm)',
  kind: 'API',
  expected: 'REJ-DATA (400/404); OC-NO (Q6)',
  executeFn: async ctx => {
    const adminToken = await getAuthToken(ADMIN_USER_EMAIL, ADMIN_USER_PASSWORD);
    const initialCategories = await fetchCategories();
    const res = await sendHttpRequest('DELETE', '/api/categories/-5', undefined, false, {
      Authorization: `Bearer ${adminToken}`,
    });
    const errors = [];
    if (!isHttp4xx(res)) {
      errors.push(`Vi phạm Q6: Xóa id=-5 (số nguyên âm) phải trả 400/404, nhưng thực tế nhận HTTP ${res.status}`);
    }
    errors.push(...(await verifyOracleNoChange(ctx, initialCategories)));
    return errors;
  },
});

testCases.push({
  id: 'EP-TC22',
  covers: 'EC21, EC34',
  desc: 'Admin gọi DELETE /api/categories/abc (id không phải số nguyên)',
  kind: 'API',
  expected: 'REJ-DATA (400/404); OC-NO (Q6, Q7)',
  executeFn: async ctx => {
    const adminToken = await getAuthToken(ADMIN_USER_EMAIL, ADMIN_USER_PASSWORD);
    const initialCategories = await fetchCategories();
    const res = await sendHttpRequest('DELETE', '/api/categories/abc', undefined, false, {
      Authorization: `Bearer ${adminToken}`,
    });
    const errors = [];
    if (!isHttp4xx(res)) {
      errors.push(`Vi phạm Q6/Q7: Xóa id="abc" (sai kiểu dữ liệu) phải trả 400/404, nhưng thực tế nhận HTTP ${res.status}`);
    }
    errors.push(...(await verifyOracleNoChange(ctx, initialCategories)));
    return errors;
  },
});

testCases.push({
  id: 'EP-TC23',
  covers: 'EC22, EC34',
  desc: 'Admin gọi DELETE /api/categories/1 khi danh mục id=1 đang có sản phẩm tham chiếu (R5, Q5)',
  kind: 'API',
  expected: 'REJ-DATA (400/409); danh mục id=1 không bị xóa trái phép gây mồ côi sản phẩm',
  executeFn: async ctx => {
    const adminToken = await getAuthToken(ADMIN_USER_EMAIL, ADMIN_USER_PASSWORD);
    const initialCategories = await fetchCategories();
    const productsBefore = await fetchProducts();
    const linkedProducts = productsBefore.filter(p => Number(p.category_id) === 1);
    ctx.oracleLogs.push(`Số sản phẩm đang gắn với category_id=1 trước khi xóa: ${linkedProducts.length}`);

    const res = await sendHttpRequest('DELETE', '/api/categories/1', undefined, false, {
      Authorization: `Bearer ${adminToken}`,
    });
    const errors = [];
    if (!isHttp4xx(res)) {
      errors.push(`Vi phạm R5/Q5 (toàn vẹn khóa ngoại): Danh mục id=1 đang có ${linkedProducts.length} sản phẩm nhưng vẫn cho phép xóa (HTTP ${res.status})`);
    }
    errors.push(...(await verifyOracleNoChange(ctx, initialCategories)));
    return errors;
  },
});

testCases.push({
  id: 'EP-TC24',
  covers: 'EC23, EC34',
  desc: 'Admin gọi DELETE /api/categories/:ID_EMPTY lần 2 trên danh mục vừa bị xóa',
  kind: 'API',
  expected: 'REJ-DATA (404 Not Found); các danh mục còn lại giữ nguyên (Q6)',
  executeFn: async ctx => {
    const adminToken = await getAuthToken(ADMIN_USER_EMAIL, ADMIN_USER_PASSWORD);
    const { idEmpty } = await createEmptyCategoryPrecondition(adminToken);
    // Xóa lần 1
    await sendHttpRequest('DELETE', `/api/categories/${idEmpty}`, undefined, true, {
      Authorization: `Bearer ${adminToken}`,
    });
    const categoriesAfterFirstDelete = await fetchCategories();
    // Xóa lần 2
    const res2 = await sendHttpRequest('DELETE', `/api/categories/${idEmpty}`, undefined, false, {
      Authorization: `Bearer ${adminToken}`,
    });
    const errors = [];
    if (!isHttp4xx(res2)) {
      errors.push(`Vi phạm Q6: Xóa lại danh mục đã xóa (id=${idEmpty}) lần 2 phải trả 404, nhưng thực tế nhận HTTP ${res2.status}`);
    }
    errors.push(...(await verifyOracleNoChange(ctx, categoriesAfterFirstDelete)));
    return errors;
  },
});

testCases.push({
  id: 'EP-TC25',
  covers: 'EC25, EC34',
  desc: 'Admin gọi PUT /api/categories/:ID_EMPTY với tên mới rỗng (name = "")',
  kind: 'API',
  expected: 'REJ-DATA (400 Bad Request); tên của ID_EMPTY giữ nguyên (Q4)',
  executeFn: async ctx => {
    const adminToken = await getAuthToken(ADMIN_USER_EMAIL, ADMIN_USER_PASSWORD);
    const { idEmpty, categoriesAfterP2 } = await createEmptyCategoryPrecondition(adminToken);
    const res = await sendHttpRequest('PUT', `/api/categories/${idEmpty}`, { name: '' }, false, {
      Authorization: `Bearer ${adminToken}`,
    });
    const errors = [];
    if (res.status !== 400) {
      errors.push(`Kỳ vọng HTTP 400 Bad Request khi PUT name="", thực tế nhận HTTP ${res.status}`);
    }
    errors.push(...(await verifyOracleNoChange(ctx, categoriesAfterP2)));
    return errors;
  },
});

testCases.push({
  id: 'EP-TC26',
  covers: 'EC26, EC34',
  desc: 'Admin gọi PUT /api/categories/:ID_EMPTY với tên mới chỉ gồm khoảng trắng ("     ")',
  kind: 'API',
  expected: 'REJ-DATA (400 Bad Request); tên của ID_EMPTY giữ nguyên (Q2, Q4)',
  executeFn: async ctx => {
    const adminToken = await getAuthToken(ADMIN_USER_EMAIL, ADMIN_USER_PASSWORD);
    const { idEmpty, categoriesAfterP2 } = await createEmptyCategoryPrecondition(adminToken);
    const res = await sendHttpRequest('PUT', `/api/categories/${idEmpty}`, { name: '     ' }, false, {
      Authorization: `Bearer ${adminToken}`,
    });
    const errors = [];
    if (res.status !== 400) {
      errors.push(`Kỳ vọng HTTP 400 Bad Request khi PUT name toàn khoảng trắng, thực tế nhận HTTP ${res.status}`);
    }
    errors.push(...(await verifyOracleNoChange(ctx, categoriesAfterP2)));
    return errors;
  },
});

testCases.push({
  id: 'EP-TC27',
  covers: 'EC27, EC34',
  desc: 'Admin gọi PUT /api/categories/999999 (id không tồn tại) với tên mới hợp lệ',
  kind: 'API',
  expected: 'REJ-DATA (404 Not Found); OC-NO (Q4, Q6)',
  executeFn: async ctx => {
    const adminToken = await getAuthToken(ADMIN_USER_EMAIL, ADMIN_USER_PASSWORD);
    const initialCategories = await fetchCategories();
    const res = await sendHttpRequest('PUT', '/api/categories/999999', { name: NAME_UPD }, false, {
      Authorization: `Bearer ${adminToken}`,
    });
    const errors = [];
    if (!isHttp4xx(res)) {
      errors.push(`Kỳ vọng HTTP 404 khi PUT id=999999, thực tế nhận HTTP ${res.status}`);
    }
    errors.push(...(await verifyOracleNoChange(ctx, initialCategories)));
    return errors;
  },
});

// --- NHÓM EP GIAO DIỆN WEB ADMIN (EP-TC28 -> EP-TC34) ---

testCases.push({
  id: 'EP-TC28',
  covers: 'EC35',
  desc: 'Chưa đăng nhập hoặc dùng tài khoản role=user truy cập trang Quản lý Danh mục trên Web Admin',
  kind: 'UI',
  expected: 'Bị chặn truy cập hoặc yêu cầu đăng nhập Admin; không hiển thị giao diện thêm/xóa danh mục (FR-12, SEC-03)',
});

testCases.push({
  id: 'EP-TC29',
  covers: 'EC01, EC08, EC17, EC30, EC31, EC36',
  desc: 'Luồng Thêm và Xóa danh mục hợp lệ trên giao diện Web Admin',
  kind: 'UI',
  expected: 'Danh mục mới xuất hiện trong bảng và CSDL sau khi Thêm; biến mất sau khi bấm Xóa (FR-14)',
});

testCases.push({
  id: 'EP-TC30',
  covers: 'EC37',
  desc: 'Nhãn trường Tên danh mục (bắt buộc) có ký hiệu dấu * đi kèm',
  kind: 'UI',
  expected: 'Nhãn trường Tên danh mục hiển thị ký hiệu * (FR-22 dòng 252)',
});

testCases.push({
  id: 'EP-TC31',
  covers: 'EC38, EC34',
  desc: 'Để trống ô Tên danh mục trên UI rồi bấm Thêm',
  kind: 'UI',
  expected: 'Bị chặn hoặc hiển thị thông báo lỗi; không tạo danh mục rỗng trong CSDL (FR-14, FR-22)',
});

testCases.push({
  id: 'EP-TC32',
  covers: 'EC39',
  desc: 'Vị trí thông báo lỗi trên form Quản lý Danh mục hiển thị phía trên nút Submit',
  kind: 'UI',
  expected: 'Thông báo lỗi nằm phía trên nút Submit: bottom(lỗi) <= top(nút) (FR-22 dòng 255)',
});

testCases.push({
  id: 'EP-TC33',
  covers: 'EC40',
  desc: 'Màu sắc nút Thêm (xanh dương) và nút Xóa (đỏ) trên trang Quản lý Danh mục',
  kind: 'UI',
  expected: 'Nút Thêm màu xanh dương (B > R, B > G); nút Xóa màu đỏ (R > G, R > B) (FR-21 dòng 245)',
});

testCases.push({
  id: 'EP-TC34',
  covers: 'EC41, EC42',
  desc: 'Tiêu chuẩn thẻ <h1> duy nhất, ngôn ngữ tiếng Việt, highlight mục Danh mục và nhãn nút "Đăng xuất"',
  kind: 'UI',
  expected: 'Đúng 1 thẻ <h1>; tiếng Việt; mục Danh mục được highlight; nút đăng xuất ghi "Đăng xuất" (FR-21, FR-23)',
});

// --- NHÓM BVA ĐẦU VÀO (BV-TC01 -> BV-TC10) ---

testCases.push({
  id: 'BV-TC01',
  covers: 'B01 LB (1 ký tự)',
  desc: 'Admin thêm danh mục có độ dài tên tại biên dưới LB = 1 ký tự ("A")',
  kind: 'API',
  expected: 'OC-ADD-OK("A"): HTTP 2xx; tạo đúng 1 danh mục có name="A" (độ dài 1)',
  executeFn: async ctx => {
    const adminToken = await getAuthToken(ADMIN_USER_EMAIL, ADMIN_USER_PASSWORD);
    const initialCategories = await fetchCategories();
    const res = await sendHttpRequest('POST', '/api/categories', { name: 'A' }, false, {
      Authorization: `Bearer ${adminToken}`,
    });
    const errors = [];
    if (!isHttp2xx(res)) {
      errors.push(`Kỳ vọng HTTP 2xx tại biên LB=1 ký tự, thực tế nhận ${res.status}`);
    }
    errors.push(...(await verifyOracleAddSuccess(ctx, initialCategories, 'A')));
    return errors;
  },
});

testCases.push({
  id: 'BV-TC02',
  covers: 'B01 LB+δ (2 ký tự)',
  desc: 'Admin thêm danh mục có độ dài tên tại sát biên dưới LB+δ = 2 ký tự ("AB")',
  kind: 'API',
  expected: 'OC-ADD-OK("AB"): HTTP 2xx; tạo đúng 1 danh mục có name="AB" (độ dài 2)',
  executeFn: async ctx => {
    const adminToken = await getAuthToken(ADMIN_USER_EMAIL, ADMIN_USER_PASSWORD);
    const initialCategories = await fetchCategories();
    const res = await sendHttpRequest('POST', '/api/categories', { name: 'AB' }, false, {
      Authorization: `Bearer ${adminToken}`,
    });
    const errors = [];
    if (!isHttp2xx(res)) {
      errors.push(`Kỳ vọng HTTP 2xx tại LB+δ=2 ký tự, thực tế nhận ${res.status}`);
    }
    errors.push(...(await verifyOracleAddSuccess(ctx, initialCategories, 'AB')));
    return errors;
  },
});

testCases.push({
  id: 'BV-TC03',
  covers: 'B01 UB-δ (254 ký tự)',
  desc: 'Admin thêm danh mục có độ dài tên tại sát biên trên UB-δ = 254 ký tự ("A"×254)',
  kind: 'API',
  expected: 'OC-ADD-OK("A"×254): HTTP 2xx; lưu đủ 254 ký tự không bị cắt cụt (Q1)',
  executeFn: async ctx => {
    const adminToken = await getAuthToken(ADMIN_USER_EMAIL, ADMIN_USER_PASSWORD);
    const initialCategories = await fetchCategories();
    const name254 = 'A'.repeat(254);
    const res = await sendHttpRequest('POST', '/api/categories', { name: name254 }, false, {
      Authorization: `Bearer ${adminToken}`,
    });
    const errors = [];
    if (!isHttp2xx(res)) {
      errors.push(`Kỳ vọng HTTP 2xx tại UB-δ=254 ký tự, thực tế nhận ${res.status}`);
    }
    errors.push(...(await verifyOracleAddSuccess(ctx, initialCategories, name254)));
    return errors;
  },
});

testCases.push({
  id: 'BV-TC04',
  covers: 'B01 UB (255 ký tự)',
  desc: 'Admin thêm danh mục có độ dài tên tại biên trên UB = 255 ký tự ("A"×255)',
  kind: 'API',
  expected: 'OC-ADD-OK("A"×255): HTTP 2xx; lưu đủ 255 ký tự không bị cắt cụt (Q1)',
  executeFn: async ctx => {
    const adminToken = await getAuthToken(ADMIN_USER_EMAIL, ADMIN_USER_PASSWORD);
    const initialCategories = await fetchCategories();
    const name255 = 'A'.repeat(255);
    const res = await sendHttpRequest('POST', '/api/categories', { name: name255 }, false, {
      Authorization: `Bearer ${adminToken}`,
    });
    const errors = [];
    if (!isHttp2xx(res)) {
      errors.push(`Kỳ vọng HTTP 2xx tại UB=255 ký tự, thực tế nhận ${res.status}`);
    }
    errors.push(...(await verifyOracleAddSuccess(ctx, initialCategories, name255)));
    return errors;
  },
});

testCases.push({
  id: 'BV-TC05',
  covers: 'B01 UB+δ (256 ký tự)',
  desc: 'Admin thêm danh mục vượt biên trên UB+δ = 256 ký tự ("A"×256, theo giả định Q1/Q8)',
  kind: 'API',
  expected: 'REJ-DATA (400 Bad Request); OC-NO (theo giả định kỹ thuật Q1/Q8)',
  executeFn: async ctx => {
    const adminToken = await getAuthToken(ADMIN_USER_EMAIL, ADMIN_USER_PASSWORD);
    const initialCategories = await fetchCategories();
    const name256 = 'A'.repeat(256);
    const res = await sendHttpRequest('POST', '/api/categories', { name: name256 }, false, {
      Authorization: `Bearer ${adminToken}`,
    });
    const errors = [];
    if (!isHttp4xx(res)) {
      errors.push(`Theo Oracle giả định Q1 (max 255 ký tự): chuỗi 256 ký tự kỳ vọng bị từ chối 400, thực tế nhận HTTP ${res.status} (Ghi chú Q8: điểm mơ hồ đặc tả)`);
    }
    errors.push(...(await verifyOracleNoChange(ctx, initialCategories)));
    return errors;
  },
});

testCases.push({
  id: 'BV-TC06',
  covers: 'B02 LB (id = 1 trên fixture 1..5)',
  desc: 'Admin xóa danh mục tại biên dưới LB: DELETE /api/categories/1 (trên fixture P_BVA_ID 1..5)',
  kind: 'API',
  expected: 'OC-DEL-OK(1): HTTP 2xx; bản ghi id=1 bị xóa, còn đúng 4 bản ghi {2, 3, 4, 5}',
  executeFn: async ctx => {
    await prepareBvaIdFixture();
    const adminToken = await getAuthToken(ADMIN_USER_EMAIL, ADMIN_USER_PASSWORD);
    const initialCategories = await fetchCategories();
    const res = await sendHttpRequest('DELETE', '/api/categories/1', undefined, false, {
      Authorization: `Bearer ${adminToken}`,
    });
    const errors = [];
    if (!isHttp2xx(res)) {
      errors.push(`Kỳ vọng HTTP 2xx khi xóa id=1 trên fixture P_BVA_ID, thực tế nhận ${res.status}`);
    }
    errors.push(...(await verifyOracleDeleteSuccess(ctx, initialCategories, 1)));
    return errors;
  },
});

testCases.push({
  id: 'BV-TC07',
  covers: 'B02 LB+δ (id = 2 trên fixture 1..5)',
  desc: 'Admin xóa danh mục tại sát biên dưới LB+δ: DELETE /api/categories/2 (trên fixture P_BVA_ID 1..5)',
  kind: 'API',
  expected: 'OC-DEL-OK(2): HTTP 2xx; bản ghi id=2 bị xóa, còn đúng 4 bản ghi {1, 3, 4, 5}',
  executeFn: async ctx => {
    await prepareBvaIdFixture();
    const adminToken = await getAuthToken(ADMIN_USER_EMAIL, ADMIN_USER_PASSWORD);
    const initialCategories = await fetchCategories();
    const res = await sendHttpRequest('DELETE', '/api/categories/2', undefined, false, {
      Authorization: `Bearer ${adminToken}`,
    });
    const errors = [];
    if (!isHttp2xx(res)) {
      errors.push(`Kỳ vọng HTTP 2xx khi xóa id=2 trên fixture P_BVA_ID, thực tế nhận ${res.status}`);
    }
    errors.push(...(await verifyOracleDeleteSuccess(ctx, initialCategories, 2)));
    return errors;
  },
});

testCases.push({
  id: 'BV-TC08',
  covers: 'B02 UB-δ (id = 4 = ID_max - 1 trên fixture 1..5)',
  desc: 'Admin xóa danh mục tại sát biên trên UB-δ: DELETE /api/categories/4 (trên fixture P_BVA_ID 1..5)',
  kind: 'API',
  expected: 'OC-DEL-OK(4): HTTP 2xx; bản ghi id=4 bị xóa, còn đúng 4 bản ghi {1, 2, 3, 5}',
  executeFn: async ctx => {
    await prepareBvaIdFixture();
    const adminToken = await getAuthToken(ADMIN_USER_EMAIL, ADMIN_USER_PASSWORD);
    const initialCategories = await fetchCategories();
    const res = await sendHttpRequest('DELETE', '/api/categories/4', undefined, false, {
      Authorization: `Bearer ${adminToken}`,
    });
    const errors = [];
    if (!isHttp2xx(res)) {
      errors.push(`Kỳ vọng HTTP 2xx khi xóa id=4 trên fixture P_BVA_ID, thực tế nhận ${res.status}`);
    }
    errors.push(...(await verifyOracleDeleteSuccess(ctx, initialCategories, 4)));
    return errors;
  },
});

testCases.push({
  id: 'BV-TC09',
  covers: 'B02 UB (id = 5 = ID_max trên fixture 1..5)',
  desc: 'Admin xóa danh mục tại biên trên UB: DELETE /api/categories/5 (trên fixture P_BVA_ID 1..5)',
  kind: 'API',
  expected: 'OC-DEL-OK(5): HTTP 2xx; bản ghi id=5 bị xóa, còn đúng 4 bản ghi {1, 2, 3, 4}',
  executeFn: async ctx => {
    await prepareBvaIdFixture();
    const adminToken = await getAuthToken(ADMIN_USER_EMAIL, ADMIN_USER_PASSWORD);
    const initialCategories = await fetchCategories();
    const res = await sendHttpRequest('DELETE', '/api/categories/5', undefined, false, {
      Authorization: `Bearer ${adminToken}`,
    });
    const errors = [];
    if (!isHttp2xx(res)) {
      errors.push(`Kỳ vọng HTTP 2xx khi xóa id=5 trên fixture P_BVA_ID, thực tế nhận ${res.status}`);
    }
    errors.push(...(await verifyOracleDeleteSuccess(ctx, initialCategories, 5)));
    return errors;
  },
});

testCases.push({
  id: 'BV-TC10',
  covers: 'B02 UB+δ (id = 6 = ID_max + 1 trên fixture 1..5)',
  desc: 'Admin xóa danh mục vượt biên trên UB+δ: DELETE /api/categories/6 (ngoài miền 1..5)',
  kind: 'API',
  expected: 'REJ-DATA (404 Not Found); OC-NO (cả 5 bản ghi {1, 2, 3, 4, 5} giữ nguyên)',
  executeFn: async ctx => {
    await prepareBvaIdFixture();
    const adminToken = await getAuthToken(ADMIN_USER_EMAIL, ADMIN_USER_PASSWORD);
    const initialCategories = await fetchCategories();
    const res = await sendHttpRequest('DELETE', '/api/categories/6', undefined, false, {
      Authorization: `Bearer ${adminToken}`,
    });
    const errors = [];
    if (!isHttp4xx(res)) {
      errors.push(`Vi phạm Q6 tại biên UB+δ (id=6 > ID_max=5): Kỳ vọng 404 Not Found, thực tế nhận HTTP ${res.status}`);
    }
    errors.push(...(await verifyOracleNoChange(ctx, initialCategories)));
    return errors;
  },
});

// --- NHÓM BIÊN ĐẦU RA (OB-TC01) ---

testCases.push({
  id: 'OB-TC01',
  covers: 'Output BVA LB_out = 0 danh mục (FR-14 & FR-24 Empty State)',
  desc: 'Xóa toàn bộ danh mục về 0 bản ghi: kiểm tra GET /api/categories trả mảng rỗng [] và Web Admin hiển thị Empty State (FR-24)',
  kind: 'API+UI',
  expected: '(1) API trả 200 OK với []; (2) Giao diện Web Admin hiển thị trạng thái trống (Empty State) có icon/hình minh họa theo FR-24',
  executeFn: async ctx => {
    const adminToken = await getAuthToken(ADMIN_USER_EMAIL, ADMIN_USER_PASSWORD);
    const initialCategories = await fetchCategories();
    for (const cat of initialCategories) {
      await sendHttpRequest('DELETE', `/api/categories/${cat.id}`, undefined, true, {
        Authorization: `Bearer ${adminToken}`,
      });
    }
    const res = await sendHttpRequest('GET', '/api/categories');
    const errors = [];
    if (res.status !== 200 || !Array.isArray(res.json) || res.json.length !== 0) {
      errors.push(`API GET /api/categories khi trống không trả về 200 OK kèm []: status=${res.status}, body=${res.text}`);
    } else {
      ctx.oracleLogs.push('API GET /api/categories trả về 200 OK với mảng rỗng [] (length = 0)');
    }
    // Phần kiểm tra giao diện Empty State (FR-24) sẽ được thực thi và đối chiếu trong fr14_ui.spec.js
    ctx.oracleLogs.push('Phần UI Empty State (FR-24) được kiểm chứng trên trình duyệt qua fr14_ui.spec.js');
    return errors;
  },
});

// --- NHÓM CA BỔ SUNG DO SINH VIÊN (SR-TC01 -> SR-TC05) ---

testCases.push({
  id: 'SR-TC01',
  covers: 'Human Review — Chuẩn hóa khoảng trắng đầu/cuối (trim) & trùng tên khác hoa/thường',
  desc: 'Admin tạo "Thiết bị gia dụng thông minh", sau đó gửi tiếp "  thiết bị gia dụng thông minh  "',
  kind: 'API',
  expected: 'Hệ thống tự động trim() và từ chối tạo bản ghi trùng tên không phân biệt hoa/thường (400/409); không lưu khoảng trắng thừa',
  executeFn: async ctx => {
    const adminToken = await getAuthToken(ADMIN_USER_EMAIL, ADMIN_USER_PASSWORD);
    await sendHttpRequest('POST', '/api/categories', { name: NAME_NOM }, true, {
      Authorization: `Bearer ${adminToken}`,
    });
    const catsAfterFirst = await fetchCategories();
    const paddedLowerName = '  thiết bị gia dụng thông minh  ';
    const res = await sendHttpRequest('POST', '/api/categories', { name: paddedLowerName }, false, {
      Authorization: `Bearer ${adminToken}`,
    });
    const errors = [];
    const catsAfterSecond = await fetchCategories();
    const untrimmedSaved = catsAfterSecond.find(c => c.name === paddedLowerName);
    if (untrimmedSaved) {
      errors.push(`Hệ thống lưu nguyên chuỗi chưa trim() khoảng trắng thừa ("${untrimmedSaved.name}") và cho phép trùng tên khác hoa/thường (HTTP ${res.status})`);
    } else if (!isHttp4xx(res)) {
      errors.push(`Kỳ vọng từ chối 400/409 khi tạo trùng tên khác hoa/thường kèm khoảng trắng, thực tế nhận HTTP ${res.status}`);
    }
    errors.push(...(await verifyOracleNoChange(ctx, catsAfterFirst)));
    return errors;
  },
});

testCases.push({
  id: 'SR-TC02',
  covers: 'Human Review — Tương thích chuỗi Unicode tiếng Việt, ký tự đặc biệt (&, -, ()) và Emoji',
  desc: 'Admin tạo danh mục "Ẩm thực & Đồ uống 🍜 - Tươi sống (100%)" và kiểm tra lưu trữ UTF-8',
  kind: 'API+UI',
  expected: 'HTTP 2xx; lưu trữ nguyên vẹn 100% chuỗi UTF-8 trong CSDL và hiển thị đúng trên Web Admin',
  executeFn: async ctx => {
    const adminToken = await getAuthToken(ADMIN_USER_EMAIL, ADMIN_USER_PASSWORD);
    const initialCategories = await fetchCategories();
    const unicodeName = 'Ẩm thực & Đồ uống 🍜 - Tươi sống (100%)';
    const res = await sendHttpRequest('POST', '/api/categories', { name: unicodeName }, false, {
      Authorization: `Bearer ${adminToken}`,
    });
    const errors = [];
    if (!isHttp2xx(res)) {
      errors.push(`Kỳ vọng HTTP 2xx khi tạo danh mục Unicode/Emoji, thực tế nhận ${res.status}`);
    }
    errors.push(...(await verifyOracleAddSuccess(ctx, initialCategories, unicodeName)));
    return errors;
  },
});

testCases.push({
  id: 'SR-TC03',
  covers: 'Human Review — Phòng chống SQL Injection trong name và :id (SEC-05)',
  desc: 'Gửi payload SQLi trong POST ("Điện tử\'); DROP TABLE categories; --") và DELETE (/api/categories/1%20OR%201=1)',
  kind: 'API',
  expected: 'Xử lý an toàn bằng Parameterized Query: không lỗi 500, bảng categories không bị DROP và không bị xóa toàn bộ bởi 1 OR 1=1',
  executeFn: async ctx => {
    const adminToken = await getAuthToken(ADMIN_USER_EMAIL, ADMIN_USER_PASSWORD);
    const initialCategories = await fetchCategories();
    const sqliName = "Điện tử'); DROP TABLE categories; --";

    const resPost = await sendHttpRequest('POST', '/api/categories', { name: sqliName }, false, {
      Authorization: `Bearer ${adminToken}`,
    });
    const resDel = await sendHttpRequest('DELETE', '/api/categories/1%20OR%201=1', undefined, false, {
      Authorization: `Bearer ${adminToken}`,
    });

    const afterCategories = await fetchCategories();
    ctx.oracleLogs.push(`Sau SQLi POST (${resPost.status}) & DELETE (${resDel.status}): còn ${afterCategories.length} danh mục`);

    const errors = [];
    if (resPost.status >= 500 || resDel.status >= 500) {
      errors.push(`Phát hiện lỗi máy chủ 500 khi xử lý chuỗi SQL Injection (POST=${resPost.status}, DELETE=${resDel.status})`);
    }
    if (afterCategories.length < initialCategories.length) {
      errors.push(`LỖ HỔNG SQL INJECTION (SEC-05): Bảng categories bị mất dữ liệu sau payload SQLi (trước: ${initialCategories.length}, sau: ${afterCategories.length})`);
    }
    return errors;
  },
});

testCases.push({
  id: 'SR-TC04',
  covers: 'Human Review — Gửi đồng thời 2 request tạo cùng một danh mục (Double Submit / Race Condition)',
  desc: 'Bắn song song (Promise.all) 2 request POST /api/categories cùng tên "Danh mục đồng thời"',
  kind: 'API',
  expected: 'Trong CSDL chỉ có đúng 1 danh mục mang tên "Danh mục đồng thời" được tạo; không sinh 2 bản ghi trùng hệt nhau',
  executeFn: async ctx => {
    const adminToken = await getAuthToken(ADMIN_USER_EMAIL, ADMIN_USER_PASSWORD);
    const raceName = 'Danh mục đồng thời';
    const [res1, res2] = await Promise.all([
      sendHttpRequest('POST', '/api/categories', { name: raceName }, false, {
        Authorization: `Bearer ${adminToken}`,
      }),
      sendHttpRequest('POST', '/api/categories', { name: raceName }, false, {
        Authorization: `Bearer ${adminToken}`,
      }),
    ]);

    const afterCategories = await fetchCategories();
    const duplicates = afterCategories.filter(c => c.name === raceName);
    ctx.oracleLogs.push(`Kết quả 2 request đồng thời: status=[${res1.status}, ${res2.status}], số bản ghi "${raceName}"=${duplicates.length}`);

    const errors = [];
    if (duplicates.length > 1) {
      errors.push(`Lỗi Race Condition / Double Submit (Q3): Tạo ra ${duplicates.length} bản ghi trùng tên "${raceName}" (id=${duplicates.map(d => d.id).join(', ')}) khi gửi 2 request đồng thời`);
    } else if (duplicates.length === 0) {
      errors.push('Không có bản ghi nào được tạo sau 2 request hợp lệ');
    }
    return errors;
  },
});

testCases.push({
  id: 'SR-TC05',
  covers: 'Human Review — Tính toàn vẹn liên hệ thống giữa Danh mục (FR-14) và Sản phẩm (FR-05/FR-15)',
  desc: 'Kiểm tra tính toàn vẹn của GET /api/products sau khi gọi DELETE /api/categories/1 (danh mục đang có sản phẩm)',
  kind: 'API',
  expected: 'Mọi sản phẩm trong GET /api/products phải luôn trỏ tới category_id tồn tại trong GET /api/categories (không có sản phẩm mồ côi danh mục)',
  executeFn: async ctx => {
    const adminToken = await getAuthToken(ADMIN_USER_EMAIL, ADMIN_USER_PASSWORD);
    const productsBefore = await fetchProducts();
    const productsInCat1 = productsBefore.filter(p => Number(p.category_id) === 1);
    ctx.oracleLogs.push(`Trước khi xóa id=1: có ${productsInCat1.length} sản phẩm thuộc category_id=1`);

    const delRes = await sendHttpRequest('DELETE', '/api/categories/1', undefined, false, {
      Authorization: `Bearer ${adminToken}`,
    });

    const categoriesAfter = await fetchCategories();
    const validCatIds = new Set(categoriesAfter.map(c => Number(c.id)));
    const productsAfter = await fetchProducts();
    const orphanedProducts = productsAfter.filter(p => !validCatIds.has(Number(p.category_id)));

    ctx.oracleLogs.push(`Sau DELETE /api/categories/1 (HTTP ${delRes.status}): số sản phẩm mồ côi danh mục=${orphanedProducts.length}`);

    const errors = [];
    if (orphanedProducts.length > 0) {
      errors.push(
        `Vi phạm toàn vẹn khóa ngoại liên hệ thống (R5 / FR-15): Sau khi xóa category id=1, có ${orphanedProducts.length} sản phẩm (${orphanedProducts.map(p => `#${p.id} "${p.name}"`).join(', ')}) trỏ tới category_id=1 không còn tồn tại trong bảng categories`
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
  console.log('======================================================');
  console.log('BẮT ĐẦU THỰC THI KIỂM THỬ API CHO FR-14 (CATEGORY CRUD)');
  console.log(`Tổng số ca đăng ký: ${testCases.length}`);
  console.log('======================================================\n');

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
      [...capturedHttpCalls].reverse().find(call => call.path.startsWith('/api/categories') && call.method !== 'GET') ||
      [...capturedHttpCalls].reverse().find(call => call.path.startsWith('/api/categories')) ||
      capturedHttpCalls[0] ||
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

    console.log(`[${tc.id}] ${status.padEnd(7)} | Status: ${mainCall ? mainCall.status : '-'} | Lý do: ${failureReasons.join('; ')}`);
  }

  // Dọn dẹp server và DB tạm
  if (serverProcess) {
    try { serverProcess.kill(); } catch {}
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
  markdownLines.push(`<!-- Sinh tự động bởi run_fr14.js lúc ${new Date().toISOString()} -->`);
  markdownLines.push(
    `**Tổng:** ${executionResults.length} · **Pass:** ${countByStatus('Pass')} · **Fail:** ${countByStatus('Fail')} · **Blocked:** ${countByStatus('Blocked')} · **Not run (UI):** ${countByStatus('Not run')}`,
    ''
  );
  markdownLines.push('| TC ID | Mong đợi | Thực tế | Trạng thái | Ghi chú / Lý do |', '|---|---|---|---|---|');

  for (const res of executionResults) {
    const actualText = [
      res.actualStatus !== null ? `HTTP ${res.actualStatus}: ${res.actualBody}` : '',
      res.oracleLogs.join('; '),
    ].filter(Boolean).join(' | ');
    markdownLines.push(
      `| ${res.id} | ${escapeMarkdownTableCell(res.expected)} | ${escapeMarkdownTableCell(actualText)} | **${res.status}** | ${escapeMarkdownTableCell(res.reasons.join('; '))} |`
    );
  }

  fs.writeFileSync(OUTPUT_PATH + '.md', markdownLines.join('\n') + '\n', 'utf8');

  console.log('\n======================================================');
  console.log(`KẾT QUẢ TỔNG HỢP API: ${executionResults.length} test cases`);
  console.log(`Pass: ${countByStatus('Pass')} | Fail: ${countByStatus('Fail')} | Blocked: ${countByStatus('Blocked')} | Not run (UI): ${countByStatus('Not run')}`);
  console.log('Đã xuất kết quả:');
  console.log(`- ${OUTPUT_PATH}.json`);
  console.log(`- ${OUTPUT_PATH}.md`);
  console.log('======================================================');
})().catch(err => {
  console.error('Lỗi thực thi:', err);
  process.exit(1);
});
