#!/usr/bin/env node
/**
 * api_test_template.js — Mẫu Clean Code kiểm thử HTTP API tự động cho HW02
 *
 * Mục tiêu:
 * - Đọc code là hiểu ngay nghiệp vụ, không cần dịch mã kỹ thuật.
 * - Tách bạch rõ 3 tầng: ApiClient, TestOracle, TestRunner.
 * - Tự động ghi kết quả thật ra file JSON và bảng Markdown để đính kèm Main_Report.md.
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// 1. TẦNG API CLIENT (Đóng gói HTTP Requests)
// ============================================================================
class EshopApiClient {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  async sendJson(method, endpoint, payload = null) {
    const url = `${this.baseUrl}${endpoint}`;
    const options = {
      method: method.toUpperCase(),
      headers: { 'Content-Type': 'application/json' },
    };
    if (payload !== null && payload !== undefined) {
      options.body = JSON.stringify(payload);
    }

    try {
      const response = await fetch(url, options);
      const rawText = await response.text();
      let parsedJson = null;
      try { parsedJson = JSON.parse(rawText); } catch {}

      return {
        status: response.status,
        bodyText: rawText,
        data: parsedJson,
        isSuccess: response.status >= 200 && response.status < 300,
        isClientError: response.status >= 400 && response.status < 500,
      };
    } catch (networkError) {
      return {
        status: 0,
        bodyText: networkError.message,
        data: null,
        isSuccess: false,
        isClientError: false,
        networkError: true,
      };
    }
  }

  // --- Các hàm có tên mang ý nghĩa nghiệp vụ (Intention-Revealing Names) ---
  requestPasswordResetOtp(email) {
    return this.sendJson('POST', '/api/forgot-password', { email });
  }

  submitPasswordReset(email, resetToken, newPassword) {
    return this.sendJson('POST', '/api/reset-password', { email, resetToken, newPassword });
  }

  attemptLogin(email, password) {
    return this.sendJson('POST', '/api/login', { email, password });
  }
}

// ============================================================================
// 2. TẦNG TEST ORACLE (Xác minh trạng thái dữ liệu độc lập)
// ============================================================================
class EshopTestOracle {
  /**
   * Oracle OC-NO: Xác minh mật khẩu KHÔNG bị thay đổi
   * Kỳ vọng: Đăng nhập bằng mật khẩu cũ phải THÀNH CÔNG (HTTP 200).
   */
  static async assertPasswordUnchanged(client, email, oldPassword) {
    const loginResult = await client.attemptLogin(email, oldPassword);
    const passed = loginResult.status === 200;
    return {
      passed,
      detail: `Login pass cũ '${oldPassword}': HTTP ${loginResult.status} (${passed ? 'Khớp OC-NO' : 'LỖI: Mật khẩu đã bị đổi'})`,
    };
  }

  /**
   * Oracle OC-OK: Xác minh mật khẩu ĐÃ được đổi thành công
   * Kỳ vọng: Đăng nhập pass mới = 200, pass cũ != 200.
   */
  static async assertPasswordSuccessfullyUpdated(client, email, oldPassword, newPassword) {
    const newPassLogin = await client.attemptLogin(email, newPassword);
    const oldPassLogin = await client.attemptLogin(email, oldPassword);

    const isNewAccepted = newPassLogin.status === 200;
    const isOldRevoked = oldPassLogin.status !== 200;
    const passed = isNewAccepted && isOldRevoked;

    return {
      passed,
      detail: `Login pass mới: HTTP ${newPassLogin.status}; Login pass cũ: HTTP ${oldPassLogin.status} (${passed ? 'Khớp OC-OK' : 'LỖI'})`,
    };
  }
}

// ============================================================================
// 3. TẦNG TEST RUNNER (Điều phối thực thi & Xuất báo cáo)
// ============================================================================
class ApiTestRunner {
  constructor(client) {
    this.client = client;
    this.results = [];
  }

  async runSingleTestCase(testDefinition) {
    const { id, description, actionFn, assertFn } = testDefinition;
    console.log(`[RUN] [${id}]: ${description}...`);

    const startTime = Date.now();
    let actualResult = null;
    let verdict = 'FAIL';
    let errorMessage = null;

    try {
      actualResult = await actionFn(this.client);
      const assertion = await assertFn(this.client, actualResult);
      verdict = assertion.passed ? 'PASS' : 'FAIL';
      errorMessage = assertion.detail;
    } catch (err) {
      verdict = 'BLOCKED';
      errorMessage = err.message;
    }

    const durationMs = Date.now() - startTime;
    const recordedCase = {
      id,
      description,
      verdict,
      durationMs,
      actualOutput: errorMessage || JSON.stringify(actualResult),
    };

    this.results.push(recordedCase);
    console.log(`  --> [RESULT]: ${verdict} (${durationMs}ms) - ${recordedCase.actualOutput}`);
    return recordedCase;
  }

  generateMarkdownReport() {
    let md = '| Mã TC | Mô tả kiểm thử | Thời gian | Kết quả thực tế | Trạng thái |\n';
    md += '|---|---|---:|---|:---:|\n';
    for (const r of this.results) {
      md += `| ${r.id} | ${r.description} | ${r.durationMs}ms | ${r.actualOutput} | **${r.verdict}** |\n`;
    }
    return md;
  }
}

module.exports = {
  EshopApiClient,
  EshopTestOracle,
  ApiTestRunner,
};
