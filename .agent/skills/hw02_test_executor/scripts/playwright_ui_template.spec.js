/**
 * playwright_ui_template.spec.js — Mẫu Clean Code kiểm thử giao diện bằng Playwright cho HW02
 * (dùng lại cho MỌI tính năng, không gắn cứng vào một FR).
 *
 * Cách dùng:
 *   1. Sao chép file này vào tests/ui-fr<XX>/ và điền khối CẤU HÌNH TÍNH NĂNG bên dưới.
 *   2. Chạy: npx playwright test <file> [--headed]
 *   3. Ảnh bằng chứng được Playwright lưu vào reports/evidence/<FR_ID>/ khi ca lỗi.
 *
 * Tiêu chí thiết kế:
 *   - Page Object thu nhỏ: tập trung selector và hành động vào một chỗ.
 *   - Tên test ghi mã TC (EP-TCxx, BV-TCxx) và mục tiêu bằng tiếng Việt có dấu.
 *   - Kết quả mong đợi lấy từ ĐẶC TẢ, không suy từ mã nguồn giao diện.
 */

const { test, expect } = require('@playwright/test');
const path = require('path');

// ============================================================================
// CẤU HÌNH TÍNH NĂNG — ĐIỀN THEO FR ĐANG KIỂM THỬ
// ============================================================================
const FEATURE = {
  frId: process.env.FR_ID || 'FR-XX',
  pagePath: process.env.PAGE_PATH || '/',
  // Selector của các thành phần cần kiểm tra; để null nếu đặc tả không yêu cầu.
  locators: {
    primaryInput: null,   // ví dụ: 'input[name="email"]'
    submitButton: null,   // ví dụ: 'button[type="submit"]'
    stepIndicator: null,  // ví dụ: 'text=/Bước [12] \\/ 2/i'
    extraField: null,     // trường mà đặc tả bắt buộc phải có
  },
  expectedInputType: null, // ví dụ: 'email' hoặc 'password' nếu đặc tả nêu
};

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const EVIDENCE_DIR = path.resolve(__dirname, '../../../../reports/evidence', FEATURE.frId);

// ============================================================================
// PAGE OBJECT
// ============================================================================
class FeaturePage {
  constructor(page) {
    this.page = page;
    const l = FEATURE.locators;
    this.primaryInput = l.primaryInput ? page.locator(l.primaryInput) : null;
    this.submitButton = l.submitButton ? page.locator(l.submitButton) : null;
    this.stepIndicator = l.stepIndicator ? page.locator(l.stepIndicator) : null;
    this.extraField = l.extraField ? page.locator(l.extraField) : null;
  }

  async navigate() {
    await this.page.goto(`${FRONTEND_URL}${FEATURE.pagePath}`);
  }

  async isInputHtml5Valid() {
    return this.primaryInput.evaluate((el) => el.checkValidity());
  }
}

// ============================================================================
// BỘ KIỂM THỬ — mỗi ca tự bỏ qua nếu đặc tả không có yêu cầu tương ứng (selector = null)
// ============================================================================
test.describe(`${FEATURE.frId} — Kiểm thử giao diện`, () => {
  test('UI: Ô nhập chính có đúng thuộc tính type theo đặc tả', async ({ page }) => {
    test.skip(!FEATURE.locators.primaryInput || !FEATURE.expectedInputType, 'Đặc tả không nêu type của ô nhập');
    const ui = new FeaturePage(page);
    await ui.navigate();
    await expect(ui.primaryInput, `Ô nhập phải có type="${FEATURE.expectedInputType}"`)
      .toHaveAttribute('type', FEATURE.expectedInputType);
  });

  test('UI: Nhập giá trị sai định dạng thì trình duyệt chặn gửi (HTML5 validation)', async ({ page }) => {
    test.skip(!FEATURE.locators.primaryInput || !FEATURE.locators.submitButton, 'Chưa khai báo selector');
    const ui = new FeaturePage(page);
    await ui.navigate();
    await ui.primaryInput.fill('giá-trị-sai-định-dạng');
    await ui.submitButton.click();
    expect(await ui.isInputHtml5Valid(), 'Trình duyệt phải đánh dấu ô nhập là không hợp lệ').toBe(false);
  });

  test('UI: Có chỉ báo tiến trình theo đặc tả', async ({ page }) => {
    test.skip(!FEATURE.locators.stepIndicator, 'Đặc tả không nêu chỉ báo bước');
    const ui = new FeaturePage(page);
    await ui.navigate();
    await expect(ui.stepIndicator, 'Đặc tả yêu cầu có chỉ báo tiến trình').toBeVisible();
  });

  test('UI: Có trường bắt buộc theo đặc tả', async ({ page }) => {
    test.skip(!FEATURE.locators.extraField, 'Đặc tả không nêu trường bổ sung');
    const ui = new FeaturePage(page);
    await ui.navigate();
    await page.screenshot({ path: path.join(EVIDENCE_DIR, 'ui_extra_field_evidence.png'), fullPage: true });
    await expect(ui.extraField, 'Đặc tả yêu cầu phải có trường này trên giao diện').toBeAttached({ timeout: 3000 });
  });
});
