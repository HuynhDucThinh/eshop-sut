/**
 * playwright_ui_template.spec.js — Mẫu Clean Code kiểm thử giao diện UI với Playwright CLI cho HW02
 *
 * Cách chạy bằng CLI:
 *   npx playwright test .agent/skills/hw02_test_executor/scripts/playwright_ui_template.spec.js --headed
 *
 * Tiêu chí thiết kế:
 * - Dùng Page Object Model thu nhỏ (tập trung selector và hành động người dùng vào một chỗ).
 * - Tên test case thể hiện rõ mã TC (EP-TCxx, BV-TCxx) và mục tiêu kiểm thử.
 * - Tự động chụp ảnh bằng chứng lưu vào thư mục `reports/evidence/` khi có lỗi.
 */

const { test, expect } = require('@playwright/test');
const path = require('path');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const EVIDENCE_DIR = path.resolve(__dirname, '../../../../reports/evidence/FR-03');

// ============================================================================
// PAGE OBJECT: FORGOT PASSWORD PAGE
// ============================================================================
class ForgotPasswordPage {
  constructor(page) {
    this.page = page;
    // Locators định danh rõ ràng
    this.emailInput = page.locator('input[type="email"], input[name="email"]');
    this.requestOtpButton = page.locator('button:has-text("Lấy mã OTP"), button[type="submit"]');
    this.stepIndicator = page.locator('.step-indicator, text=/Bước [12] \\/ 2/i');
    this.otpInput = page.locator('input[name="otp"], input[placeholder*="OTP" i]');
    this.newPasswordInput = page.locator('input[name="newPassword"], input[placeholder*="mật khẩu mới" i]');
    this.confirmPasswordInput = page.locator('input[name="confirmPassword"], input[placeholder*="xác nhận" i]');
    this.submitResetButton = page.locator('button:has-text("Đổi mật khẩu"), button:has-text("Xác nhận")');
    this.backToLoginButton = page.locator('a:has-text("Quay lại"), button:has-text("Đăng nhập")');
  }

  async navigateToPage() {
    await this.page.goto(`${FRONTEND_URL}/forgot-password`);
  }

  async enterEmailAndRequestOtp(email) {
    await this.emailInput.fill(email);
    await this.requestOtpButton.click();
  }

  async isEmailHtml5Valid() {
    return await this.emailInput.evaluate((inputElement) => inputElement.checkValidity());
  }
}

// ============================================================================
// TEST SUITE: FR-03 UI VERIFICATION
// ============================================================================
test.describe('FR-03 UI Verification: Quên mật khẩu & Đặt lại mật khẩu', () => {

  test('EP-TC30 (UI): Ô email phải dùng thẻ HTML5 type="email" và chặn submit khi sai format', async ({ page }) => {
    const forgotPage = new ForgotPasswordPage(page);
    await forgotPage.navigateToPage();

    // 1. Kiểm tra thuộc tính HTML5
    await expect(forgotPage.emailInput).toHaveAttribute('type', 'email');

    // 2. Nhập email sai định dạng
    await forgotPage.emailInput.fill('testeshop.com');
    await forgotPage.requestOtpButton.click();

    // 3. Xác minh form validation của trình duyệt đã kích hoạt
    const isValid = await forgotPage.isEmailHtml5Valid();
    expect(isValid, 'Trình duyệt phải đánh dấu trường email là invalid').toBe(false);
  });

  test('EP-TC29 (UI): Giao diện phải có nút "Quay lại đăng nhập"', async ({ page }) => {
    const forgotPage = new ForgotPasswordPage(page);
    await forgotPage.navigateToPage();

    await expect(forgotPage.backToLoginButton).toBeVisible();
    await forgotPage.backToLoginButton.click();
    await expect(page).toHaveURL(/.*login/);
  });

  test('EP-TC02 / EP-TC22 (UI): Bước 2 phải có Step Indicator và trường Xác nhận mật khẩu', async ({ page }) => {
    const forgotPage = new ForgotPasswordPage(page);
    await forgotPage.navigateToPage();

    // Thực hiện bước 1
    await forgotPage.enterEmailAndRequestOtp('test@eshop.com');
    await page.waitForTimeout(1000); // Chờ chuyển bước

    // Chụp ảnh màn hình Bước 2 thực tế để lưu bằng chứng
    await page.screenshot({
      path: path.join(EVIDENCE_DIR, 'playwright_ui_step2_evidence.png'),
      fullPage: true,
    });

    // 1. Kiểm tra chỉ báo "Bước 2 / 2"
    await expect(forgotPage.stepIndicator, 'Đặc tả yêu cầu có Step Indicator "Bước 2 / 2"').toBeVisible();

    // 2. Kiểm tra ô mật khẩu mới phải là type="password" (EP-TC31)
    await expect(forgotPage.newPasswordInput).toHaveAttribute('type', 'password');

    // 3. Kiểm tra ô Xác nhận mật khẩu (SUT sẽ FAIL tại đây vì thiếu trường này trên giao diện)
    await expect(
      forgotPage.confirmPasswordInput,
      'BUG-003: Giao diện Bước 2 bị thiếu hoàn toàn ô Xác nhận mật khẩu'
    ).toBeAttached({ timeout: 3000 });
  });

});
