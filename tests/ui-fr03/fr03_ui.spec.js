/**
 * fr03_ui.spec.js - Kiểm thử giao diện FR-03 (Quên mật khẩu & Đặt lại mật khẩu) bằng Playwright CLI.
 *
 * Quy ước (theo skill hw02_test_executor, Hướng 2):
 * - Mỗi test tương ứng đúng 1 ca UI trong Main_Report.md: EP-TC02, 22, 23, 29, 30, 31.
 * - Expected CHỈ lấy từ đặc tả (README FR-03 dòng 33-36, 44, 50-60, 256), không lấy từ mã nguồn.
 * - Dùng expect.soft để một ca ghi nhận ĐƯỢC NHIỀU sai khác trong cùng một lần chạy.
 * - Mỗi ca đều chụp ảnh vào reports/evidence/FR-03/screenshots/.
 * - Sau mỗi ca, mật khẩu test@eshop.com được khôi phục về giá trị nền (Test1234!) qua API.
 *
 * Chạy:
 *   cd tests/ui-fr03
 *   $env:RUN_NAME="run_ui_1"; npx playwright test
 */
const path = require('path');
const fs = require('fs');
const { test, expect } = require('@playwright/test');

// ---------------------------------------------------------------------------
// Hằng số & Dữ liệu mẫu (Fixture)
// ---------------------------------------------------------------------------
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';
const EVIDENCE_DIR = path.resolve(__dirname, '../../reports/evidence/FR-03');
const SCREENSHOT_DIR = path.join(EVIDENCE_DIR, 'screenshots');
const RUN_NAME = process.env.RUN_NAME || 'run_ui_1';

const ACCOUNT = { email: 'test@eshop.com', baselinePassword: 'Test1234!' };
const NEW_PASSWORD = 'NewPass123!';
const MISMATCHED_CONFIRM = 'NewPass123?';

const STEP_1_OF_2 = /Bước\s*1\s*\/\s*2/i;
const STEP_2_OF_2 = /Bước\s*2\s*\/\s*2/i;

fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

// ---------------------------------------------------------------------------
// Hàm tiện ích gọi API để dựng / kiểm tra trạng thái (Oracle) - không dùng UI
// ---------------------------------------------------------------------------
async function loginStatus(request, email, password) {
  const response = await request.post(`${BACKEND_URL}/api/login`, {
    data: { email, password },
    failOnStatusCode: false,
  });
  return response.status();
}

async function restoreBaselinePassword(request) {
  const otpResponse = await request.post(`${BACKEND_URL}/api/forgot-password`, {
    data: { email: ACCOUNT.email },
    failOnStatusCode: false,
  });
  if (!otpResponse.ok()) return;
  const { resetToken } = await otpResponse.json();
  await request.post(`${BACKEND_URL}/api/reset-password`, {
    data: { email: ACCOUNT.email, resetToken, newPassword: ACCOUNT.baselinePassword },
    failOnStatusCode: false,
  });
}

// ---------------------------------------------------------------------------
// Page Object: trang /forgot-password (chỉ định vị trí theo ngữ nghĩa, không theo class CSS)
// ---------------------------------------------------------------------------
class ForgotPasswordPage {
  constructor(page) {
    this.page = page;
    this.dialogMessages = [];
    this.apiRequests = [];

    page.on('dialog', async (dialog) => {
      this.dialogMessages.push(dialog.message());
      await dialog.accept();
    });
    page.on('request', (req) => {
      if (req.url().includes('/api/forgot-password')) this.apiRequests.push(req.url());
    });

    this.emailInput = page.locator('div:has(> label:has-text("Email")) input');
    this.requestOtpButton = page.getByRole('button', { name: /Lấy mã OTP/i });
    this.otpInput = page.locator('div:has(> label:has-text("OTP")) input');
    this.newPasswordInput = page.locator('div:has(> label:has-text("Mật khẩu mới")) input');
    this.confirmPasswordInput = page.locator(
      'div:has(> label:has-text("Xác nhận")) input, input[name="confirmPassword"]'
    );
    this.submitResetButton = page.getByRole('button', { name: /Đặt lại mật khẩu|Đổi mật khẩu/i });
    this.stepOneIndicator = page.getByText(STEP_1_OF_2);
    this.stepTwoIndicator = page.getByText(STEP_2_OF_2);
    this.backToLoginControl = page.getByText(/Quay lại đăng nhập/i);
    this.otpBanner = page.locator('div:has-text("Mã OTP của bạn là")').last();
  }

  async open() {
    await this.page.goto('/forgot-password');
  }

  async requestOtpFor(email) {
    await this.emailInput.fill(email);
    await this.requestOtpButton.click();
  }

  async openStepTwo(email = ACCOUNT.email) {
    await this.open();
    await this.requestOtpFor(email);
    await this.otpInput.waitFor({ state: 'visible', timeout: 5000 });
  }

  async readDisplayedOtp() {
    const text = (await this.page.getByText(/Mã OTP của bạn là/).first().textContent()) || '';
    const match = text.match(/:\s*(\S+)/);
    return match ? match[1] : '';
  }

  async hasConfirmPasswordField() {
    return (await this.confirmPasswordInput.count()) > 0;
  }
}

// ---------------------------------------------------------------------------
// Ghi nhận quan sát để đưa vào báo cáo (nằm trong file JSON của reporter)
// ---------------------------------------------------------------------------
function attachObservations(testInfo, observations) {
  return testInfo.attach('observations', {
    body: JSON.stringify(observations, null, 2),
    contentType: 'application/json',
  });
}

// ---------------------------------------------------------------------------
// Bộ kiểm thử
// ---------------------------------------------------------------------------
test.describe('FR-03 UI: Quên mật khẩu & Đặt lại mật khẩu', () => {
  test.beforeAll(async ({ request }) => {
    const status = await loginStatus(request, ACCOUNT.email, ACCOUNT.baselinePassword);
    if (status !== 200) await restoreBaselinePassword(request);
  });

  test.afterEach(async ({ page, request }, testInfo) => {
    const tcId = testInfo.title.split(' ')[0];
    await page
      .screenshot({ path: path.join(SCREENSHOT_DIR, `${RUN_NAME}_${tcId}.png`), fullPage: true })
      .catch(() => {});
    await restoreBaselinePassword(request);
  });

  test('EP-TC02 UI: Luồng hợp lệ end-to-end có chỉ báo bước và đặt lại thành công', async ({
    page,
    request,
  }, testInfo) => {
    const forgot = new ForgotPasswordPage(page);
    const observations = {};

    await forgot.open();
    observations.step1IndicatorVisible = await forgot.stepOneIndicator.isVisible();
    expect.soft(observations.step1IndicatorVisible, 'Phải hiện chỉ báo "Bước 1 / 2" ở bước 1').toBe(true);

    await forgot.requestOtpFor(ACCOUNT.email);
    await forgot.otpInput.waitFor({ state: 'visible', timeout: 5000 });

    observations.step2IndicatorVisible = await forgot.stepTwoIndicator.isVisible();
    expect.soft(observations.step2IndicatorVisible, 'Phải hiện chỉ báo "Bước 2 / 2" ở bước 2').toBe(true);

    const displayedOtp = await forgot.readDisplayedOtp();
    observations.displayedOtp = displayedOtp;
    expect.soft(displayedOtp, 'Mã OTP hiển thị phải gồm đúng 6 chữ số').toMatch(/^\d{6}$/);

    await forgot.otpInput.fill(displayedOtp);
    await forgot.newPasswordInput.fill(NEW_PASSWORD);
    observations.confirmFieldPresent = await forgot.hasConfirmPasswordField();
    expect.soft(observations.confirmFieldPresent, 'Form Bước 2 phải có ô Xác nhận mật khẩu').toBe(true);
    if (observations.confirmFieldPresent) await forgot.confirmPasswordInput.fill(NEW_PASSWORD);

    await forgot.submitResetButton.click();
    await page.waitForURL(/\/login/, { timeout: 3000 }).catch(() => {});

    observations.finalUrl = page.url();
    observations.dialogMessages = forgot.dialogMessages;
    expect.soft(page.url(), 'Đặt lại thành công phải chuyển hướng về trang Đăng nhập').toMatch(/\/login/);

    observations.loginWithNewPasswordStatus = await loginStatus(request, ACCOUNT.email, NEW_PASSWORD);
    expect
      .soft(observations.loginWithNewPasswordStatus, 'OC-OK: Đăng nhập bằng mật khẩu mới phải thành công (HTTP 200)')
      .toBe(200);

    await attachObservations(testInfo, observations);
  });

  test('EP-TC22 UI: Xác nhận mật khẩu không khớp thì báo lỗi và không đổi mật khẩu', async ({
    page,
    request,
  }, testInfo) => {
    const forgot = new ForgotPasswordPage(page);
    const observations = {};

    await forgot.openStepTwo();
    observations.confirmFieldPresent = await forgot.hasConfirmPasswordField();
    await attachObservations(testInfo, observations);
    expect(observations.confirmFieldPresent, 'Form Bước 2 phải có ô Xác nhận mật khẩu để nhập giá trị không khớp').toBe(true);

    await forgot.otpInput.fill(await forgot.readDisplayedOtp());
    await forgot.newPasswordInput.fill(NEW_PASSWORD);
    await forgot.confirmPasswordInput.fill(MISMATCHED_CONFIRM);
    await forgot.submitResetButton.click();
    await page.waitForTimeout(500);

    observations.dialogMessages = forgot.dialogMessages;
    expect.soft(page.url(), 'Không được chuyển về trang /login khi xác nhận không khớp').not.toMatch(/\/login/);
    expect.soft(forgot.dialogMessages.join(' ') + (await page.textContent('body')), 'Phải hiển thị thông báo lỗi không khớp').toMatch(/không khớp/i);
    expect.soft(await loginStatus(request, ACCOUNT.email, ACCOUNT.baselinePassword), 'OC-NO: Mật khẩu cũ vẫn phải đăng nhập được (HTTP 200)').toBe(200);
  });

  test('EP-TC23 UI: Xác nhận mật khẩu để trống thì báo lỗi và không đổi mật khẩu', async ({
    page,
    request,
  }, testInfo) => {
    const forgot = new ForgotPasswordPage(page);
    const observations = {};

    await forgot.openStepTwo();
    observations.confirmFieldPresent = await forgot.hasConfirmPasswordField();
    await attachObservations(testInfo, observations);
    expect(observations.confirmFieldPresent, 'Form Bước 2 phải có ô Xác nhận mật khẩu để để trống').toBe(true);

    await forgot.otpInput.fill(await forgot.readDisplayedOtp());
    await forgot.newPasswordInput.fill(NEW_PASSWORD);
    await forgot.confirmPasswordInput.fill('');
    await forgot.submitResetButton.click();
    await page.waitForTimeout(500);

    expect.soft(page.url(), 'Không được chuyển về trang /login khi xác nhận mật khẩu rỗng').not.toMatch(/\/login/);
    expect.soft(await loginStatus(request, ACCOUNT.email, ACCOUNT.baselinePassword), 'OC-NO: Mật khẩu cũ vẫn phải đăng nhập được (HTTP 200)').toBe(200);
  });

  test('EP-TC29 UI: Chỉ báo tiến trình Bước 1/2, Bước 2/2 và nút Quay lại đăng nhập', async ({ page }, testInfo) => {
    const forgot = new ForgotPasswordPage(page);
    const observations = {};

    await forgot.open();
    observations.step1IndicatorVisible = await forgot.stepOneIndicator.isVisible();
    observations.backToLoginVisibleAtStep1 = await forgot.backToLoginControl.isVisible();
    expect.soft(observations.step1IndicatorVisible, 'Phải hiển thị "Bước 1 / 2"').toBe(true);
    expect.soft(observations.backToLoginVisibleAtStep1, 'Phải có nút hoặc liên kết "Quay lại đăng nhập"').toBe(true);

    await forgot.requestOtpFor(ACCOUNT.email);
    await forgot.otpInput.waitFor({ state: 'visible', timeout: 5000 });
    observations.step2IndicatorVisible = await forgot.stepTwoIndicator.isVisible();
    expect.soft(observations.step2IndicatorVisible, 'Phải hiển thị "Bước 2 / 2"').toBe(true);

    await attachObservations(testInfo, observations);
  });

  test('EP-TC30 UI: Ô email sử dụng type="email", chặn gửi và báo lỗi định dạng HTML5', async ({ page }, testInfo) => {
    const forgot = new ForgotPasswordPage(page);
    const observations = {};

    await forgot.open();
    observations.emailInputType = await forgot.emailInput.getAttribute('type');
    expect.soft(observations.emailInputType, 'Ô email phải có thuộc tính type="email"').toBe('email');

    await forgot.emailInput.fill('testeshop.com');
    await forgot.requestOtpButton.click();
    await page.waitForTimeout(500);

    observations.html5Valid = await forgot.emailInput.evaluate((el) => el.validity.valid);
    observations.validationMessage = await forgot.emailInput.evaluate((el) => el.validationMessage);
    observations.apiRequestsSent = forgot.apiRequests.length;
    observations.dialogMessages = forgot.dialogMessages;

    expect.soft(observations.html5Valid, 'Trình duyệt phải đánh dấu ô email là không hợp lệ (:invalid)').toBe(false);
    expect.soft(observations.apiRequestsSent, 'Không được gửi request tới API khi email sai định dạng').toBe(0);

    await attachObservations(testInfo, observations);
  });

  test('EP-TC31 UI: Cả hai ô mật khẩu ở Bước 2 đều phải che ký tự (type="password")', async ({ page }, testInfo) => {
    const forgot = new ForgotPasswordPage(page);
    const observations = {};

    await forgot.openStepTwo();
    observations.newPasswordType = await forgot.newPasswordInput.getAttribute('type');
    observations.confirmFieldPresent = await forgot.hasConfirmPasswordField();
    observations.confirmPasswordType = observations.confirmFieldPresent
      ? await forgot.confirmPasswordInput.first().getAttribute('type')
      : null;

    expect.soft(observations.newPasswordType, 'Ô Mật khẩu mới phải có type="password"').toBe('password');
    expect.soft(observations.confirmPasswordType, 'Ô Xác nhận mật khẩu phải tồn tại và có type="password"').toBe('password');

    await attachObservations(testInfo, observations);
  });
});
