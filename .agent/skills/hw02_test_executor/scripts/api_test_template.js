#!/usr/bin/env node
/**
 * api_test_template.js — Mẫu Clean Code kiểm thử HTTP API cho HW02 (dùng lại cho MỌI tính năng).
 *
 * Ba tầng độc lập:
 *   1. ApiClient      — chỉ gửi HTTP, không biết nghiệp vụ.
 *   2. StateOracle    — xác minh trạng thái hệ thống sau hành động (oracle độc lập, từ đặc tả).
 *   3. ApiTestRunner  — chạy ca, đo thời gian, ghi kết quả THẬT ra JSON và bảng Markdown.
 *
 * Cách dùng cho một tính năng mới:
 *   - Khai báo các hàm nghiệp vụ bằng ApiClient#sendJson (xem khối "VÍ DỤ" cuối file).
 *   - Viết oracle bằng StateOracle (hàm probe trả về trạng thái cần kiểm tra).
 *   - Mỗi ca = { id, description, actionFn, assertFn }. Ca chưa chạy phải ghi Not run, không bịa Actual.
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// 1. TẦNG API CLIENT
// ============================================================================
class ApiClient {
  constructor(baseUrl = process.env.BASE_URL || 'http://localhost:3000') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  async sendJson(method, endpoint, payload = null, headers = {}) {
    const options = {
      method: method.toUpperCase(),
      headers: { 'Content-Type': 'application/json', ...headers },
    };
    if (payload !== null && payload !== undefined) options.body = JSON.stringify(payload);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, options);
      const bodyText = await response.text();
      let data = null;
      try { data = JSON.parse(bodyText); } catch { /* body không phải JSON */ }
      return { status: response.status, bodyText, data, networkError: false };
    } catch (networkError) {
      return { status: 0, bodyText: networkError.message, data: null, networkError: true };
    }
  }
}

// ============================================================================
// 2. TẦNG STATE ORACLE
// ============================================================================
class StateOracle {
  /**
   * @param {() => Promise<any>} probe  Hàm lấy trạng thái thật từ SUT (ví dụ gọi API đọc lại dữ liệu).
   * @param {(state:any) => boolean} isExpected  Điều kiện mong đợi theo ĐẶC TẢ (không suy từ mã nguồn).
   * @param {(state:any) => string} describe  Mô tả trạng thái thực tế để ghi vào báo cáo.
   */
  static async check(probe, isExpected, describe) {
    const state = await probe();
    const passed = Boolean(isExpected(state));
    return { passed, detail: describe(state) };
  }
}

// ============================================================================
// 3. TẦNG TEST RUNNER
// ============================================================================
class ApiTestRunner {
  constructor(client) {
    this.client = client;
    this.results = [];
  }

  async runSingleTestCase({ id, description, actionFn, assertFn }) {
    console.log(`[CHẠY] [${id}]: ${description}...`);
    const startTime = Date.now();
    let verdict = 'Fail';
    let actualOutput = '';

    try {
      const actionResult = await actionFn(this.client);
      const assertion = await assertFn(this.client, actionResult);
      verdict = assertion.passed ? 'Pass' : 'Fail';
      actualOutput = assertion.detail;
    } catch (err) {
      verdict = 'Blocked';
      actualOutput = `Không chạy được: ${err.message}`;
    }

    const record = { id, description, verdict, durationMs: Date.now() - startTime, actualOutput };
    this.results.push(record);
    console.log(`  --> [KẾT QUẢ]: ${verdict} (${record.durationMs}ms) - ${actualOutput}`);
    return record;
  }

  generateMarkdownReport() {
    let md = '| Mã TC | Mô tả kiểm thử | Thời gian | Kết quả thực tế | Trạng thái |\n';
    md += '|---|---|---:|---|:---:|\n';
    for (const r of this.results) {
      const cell = String(r.actualOutput).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
      md += `| ${r.id} | ${r.description} | ${r.durationMs}ms | ${cell} | **${r.verdict}** |\n`;
    }
    return md;
  }

  saveResults(outBasePath) {
    fs.mkdirSync(path.dirname(path.resolve(outBasePath)), { recursive: true });
    fs.writeFileSync(`${outBasePath}.json`, JSON.stringify(this.results, null, 2), 'utf8');
    fs.writeFileSync(`${outBasePath}.md`, this.generateMarkdownReport(), 'utf8');
  }
}

module.exports = { ApiClient, StateOracle, ApiTestRunner };

/* ============================================================================
 * VÍ DỤ (thay bằng endpoint của tính năng đang kiểm thử) — đặt trong file chạy riêng:
 *
 *   const { ApiClient, StateOracle, ApiTestRunner } = require('./api_test_template');
 *   const client = new ApiClient();
 *   const runner = new ApiTestRunner(client);
 *
 *   await runner.runSingleTestCase({
 *     id: 'EP-TC01',
 *     description: 'Mô tả ca kiểm thử bằng tiếng Việt có dấu',
 *     actionFn: (c) => c.sendJson('POST', '/api/<endpoint>', { <trường>: '<giá trị>' }),
 *     assertFn: (c, res) => StateOracle.check(
 *       () => c.sendJson('GET', '/api/<đọc lại trạng thái>'),
 *       (state) => state.status === 200,
 *       (state) => `HTTP ${state.status}`
 *     ),
 *   });
 *   runner.saveResults('reports/evidence/FR-XX/run_api_1');
 * ========================================================================== */
