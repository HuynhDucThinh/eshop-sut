/**
 * fr08_ui.spec.js — Kiểm thử giao diện UI cho FR-08: Thanh toán (Checkout)
 *
 * Tuân thủ quy định hw02_test_executor & course rules:
 * - 100% tiếng Việt có dấu trong mô tả test, assertion message, console log.
 * - Phủ đủ 12 ca kiểm thử UI: EP-TC21 đến EP-TC32.
 * - Expected tính toán độc lập từ tài liệu đặc tả README (FR-08, FR-21, FR-22, FR-23) và Q4.
 * - Tự động chụp ảnh bằng chứng lưu vào reports/evidence/FR-08/screenshots/.
 */

const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const EVIDENCE_DIR = path.resolve(__dirname, '../../reports/evidence/FR-08');
const SCREENSHOT_DIR = path.join(EVIDENCE_DIR, 'screenshots');
const RUN_NAME = process.env.RUN_NAME || 'run_ui_1';
const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

const ACCOUNT = { email: 'test@eshop.com', password: 'Test1234!' };
const ADDR_NOM = '123 Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM';

// Hàm hỗ trợ đăng nhập và nạp giỏ hàng qua giao diện hoặc LocalStorage
async function loginAndPrepareCart(page) {
  // Đăng nhập qua API và lưu vào localStorage để tiết kiệm thời gian và đảm bảo trạng thái sạch
  const loginRes = await page.request.post(`${BACKEND_URL}/api/login`, {
    data: { email: ACCOUNT.email, password: ACCOUNT.password }
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  const user = loginData.user;

  // Lấy danh sách sản phẩm thực tế
  const prodRes = await page.request.get(`${BACKEND_URL}/api/products`);
  const products = await prodRes.json();
  const prodA = products[0] || { id: 1, name: 'Sản phẩm 1', price: 100000 };
  const prodB = products[1] || { id: 2, name: 'Sản phẩm 2', price: 150000 };

  const cartItems = [
    { ...prodA, quantity: 1 },
    { ...prodB, quantity: 1 }
  ];

  await page.goto('/');
  await page.evaluate(({ token, user, cartItems }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, { token, user, cartItems });

  await page.reload();
  return { token, user, prodA, prodB, cartItems };
}

test.describe('Kiểm thử Giao diện FR-08 — Thanh toán (Checkout)', () => {

  test('EP-TC21: Người dùng chưa đăng nhập truy cập trang Checkout bị chặn hoặc chuyển hướng', async ({ page }) => {
    // Xóa sạch trạng thái đăng nhập
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Cố tình điều hướng trực tiếp vào trang Thanh toán
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    // Chụp ảnh bằng chứng
    const screenshotPath = path.join(SCREENSHOT_DIR, `${RUN_NAME}_EP-TC21.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    const currentUrl = page.url();
    const hasLoginPrompt = await page.locator('text=/đăng nhập/i').count() > 0;
    const hasCheckoutBtn = await page.locator('button:has-text("Xác Nhận Thanh Toán"), button:has-text("Đặt hàng")').count() > 0;

    // Oracle: Phải chuyển hướng về /login HOẶC hiển thị yêu cầu đăng nhập, và KHÔNG hiển thị nút đặt hàng
    expect.soft(
      currentUrl.includes('/login') || hasLoginPrompt,
      'Người dùng chưa đăng nhập khi vào /checkout phải bị chuyển hướng đăng nhập hoặc có thông báo yêu cầu đăng nhập'
    ).toBe(true);

    expect.soft(
      !hasCheckoutBtn,
      'Người dùng chưa đăng nhập tuyệt đối không được nhìn thấy nút Xác Nhận Đặt Hàng'
    ).toBe(true);
  });

  test('EP-TC22: Luồng đặt hàng hợp lệ end-to-end trên giao diện', async ({ page }) => {
    await loginAndPrepareCart(page);

    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    // Tìm trường địa chỉ giao hàng
    const addressInput = page.locator('input[name="shipping_address"], textarea[name="shipping_address"], input[placeholder*="địa chỉ" i]');
    const hasAddressField = await addressInput.count() > 0;
    expect.soft(hasAddressField, 'Trang Checkout bắt buộc phải có ô nhập Địa chỉ giao hàng').toBe(true);

    if (hasAddressField) {
      await addressInput.first().fill(ADDR_NOM);
    }

    const checkoutBtn = page.locator('button:has-text("Xác Nhận Thanh Toán"), button:has-text("Đặt hàng")');
    await expect.soft(checkoutBtn, 'Nút xác nhận đặt hàng phải tồn tại trên giao diện').toBeVisible();

    if (await checkoutBtn.count() > 0) {
      await checkoutBtn.click();
      await page.waitForTimeout(1000);
    }

    const screenshotPath = path.join(SCREENSHOT_DIR, `${RUN_NAME}_EP-TC22.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    // Kiểm tra thông báo thành công
    const successMsg = page.locator('text=/thành công|cảm ơn/i');
    await expect.soft(successMsg, 'Sau khi thanh toán phải hiển thị thông báo thành công').toBeVisible();
  });

  test('EP-TC23: Hiển thị đầy đủ danh sách sản phẩm đặt mua khớp với giỏ hàng', async ({ page }) => {
    const { prodA, prodB } = await loginAndPrepareCart(page);

    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    const screenshotPath = path.join(SCREENSHOT_DIR, `${RUN_NAME}_EP-TC23.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    // Oracle: Phải hiển thị tên sản phẩm, số lượng và thành tiền của cả 2 sản phẩm
    const hasProdA = await page.locator(`text=${prodA.name}`).count() > 0;
    const hasProdB = await page.locator(`text=${prodB.name}`).count() > 0;

    expect.soft(hasProdA, `Danh sách sản phẩm phải chứa "${prodA.name}"`).toBe(true);
    expect.soft(hasProdB, `Danh sách sản phẩm phải chứa "${prodB.name}"`).toBe(true);
  });

  test('EP-TC24: Tổng tiền phải tự động tính và không có ô cho người dùng sửa trực tiếp', async ({ page }) => {
    await loginAndPrepareCart(page);

    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    const screenshotPath = path.join(SCREENSHOT_DIR, `${RUN_NAME}_EP-TC24.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    // Kiểm tra xem có input nào cho phép sửa tổng tiền không
    // Bug tiềm ẩn: Checkout.jsx có <input type="number" value={editableTotal} onChange=...>
    const editableTotalInput = page.locator('input[type="number"]:not([readonly]):not([disabled])');
    const editableCount = await editableTotalInput.count();

    expect.soft(
      editableCount === 0,
      `Tổng tiền không được phép có ô nhập chỉnh sửa trực tiếp (phát hiện ${editableCount} ô nhập cho phép sửa)`
    ).toBe(true);
  });

  test('EP-TC25: Nhãn trường Địa chỉ giao hàng bắt buộc có ký hiệu *', async ({ page }) => {
    await loginAndPrepareCart(page);

    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    const screenshotPath = path.join(SCREENSHOT_DIR, `${RUN_NAME}_EP-TC25.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    // Oracle FR-22 (dòng 252): Trường bắt buộc có dấu *
    const labelWithAsterisk = page.locator('label:has-text("Địa chỉ"), label:has-text("địa chỉ")').locator('text=*');
    const hasAsterisk = await labelWithAsterisk.count() > 0;

    expect.soft(hasAsterisk, 'Nhãn trường bắt buộc Địa chỉ giao hàng phải có ký hiệu dấu sao (*)').toBe(true);
  });

  test('EP-TC26: Để trống ô địa chỉ trên giao diện bấm đặt hàng bị chặn hoặc báo lỗi', async ({ page }) => {
    await loginAndPrepareCart(page);

    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    const addressInput = page.locator('input[name="shipping_address"], textarea[name="shipping_address"], input[placeholder*="địa chỉ" i]');
    if (await addressInput.count() > 0) {
      await addressInput.first().fill('');
    }

    const checkoutBtn = page.locator('button:has-text("Xác Nhận Thanh Toán"), button:has-text("Đặt hàng")');
    if (await checkoutBtn.count() > 0) {
      await checkoutBtn.click();
      await page.waitForTimeout(500);
    }

    const screenshotPath = path.join(SCREENSHOT_DIR, `${RUN_NAME}_EP-TC26.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    // Oracle: Không được hoàn tất đơn hàng, phải hiển thị cảnh báo lỗi hoặc validation HTML5
    const successMsg = await page.locator('text=/thành công|cảm ơn/i').count();
    expect.soft(successMsg === 0, 'Để trống địa chỉ giao hàng tuyệt đối không được báo đặt hàng thành công').toBe(true);
  });

  test('EP-TC27: Thông báo lỗi giao diện phải hiển thị phía TRÊN nút submit', async ({ page }) => {
    await loginAndPrepareCart(page);

    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    // Thử kích hoạt lỗi (ví dụ mã giảm giá sai hoặc địa chỉ rỗng)
    const couponInput = page.locator('input[placeholder*="mã giảm giá" i]');
    const applyCouponBtn = page.locator('button:has-text("Áp dụng")');
    if (await couponInput.count() > 0 && await applyCouponBtn.count() > 0) {
      await couponInput.fill('MA_KHONG_TON_TAI_999');
      await applyCouponBtn.click();
      await page.waitForTimeout(500);
    }

    const checkoutBtn = page.locator('button:has-text("Xác Nhận Thanh Toán"), button:has-text("Đặt hàng")');
    const errorMsg = page.locator('.text-red-600, .error-message, [role="alert"]');

    const screenshotPath = path.join(SCREENSHOT_DIR, `${RUN_NAME}_EP-TC27.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    if (await errorMsg.count() > 0 && await checkoutBtn.count() > 0) {
      const errorBox = await errorMsg.first().boundingBox();
      const btnBox = await checkoutBtn.first().boundingBox();
      if (errorBox && btnBox) {
        expect.soft(
          errorBox.y + errorBox.height <= btnBox.y + 10,
          `Thông báo lỗi (y=${errorBox.y}) phải nằm phía trên nút submit (y=${btnBox.y}) theo FR-22 (dòng 255)`
        ).toBe(true);
      }
    } else {
      expect.soft(false, 'Không tìm thấy phần tử thông báo lỗi để kiểm tra vị trí').toBe(true);
    }
  });

  test('EP-TC28: Trang Thanh toán phải có Breadcrumb điều hướng', async ({ page }) => {
    await loginAndPrepareCart(page);

    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    const screenshotPath = path.join(SCREENSHOT_DIR, `${RUN_NAME}_EP-TC28.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    // Oracle FR-23 (dòng 263): Phải có Breadcrumb điều hướng (nav, ol, li, hoặc chuỗi có > hay /)
    const breadcrumb = page.locator('nav[aria-label="breadcrumb"], .breadcrumb, ol:has-text("Trang chủ"), div:has-text("Trang chủ >"), div:has-text("Trang chủ ›")');
    const hasBreadcrumb = await breadcrumb.count() > 0;

    expect.soft(hasBreadcrumb, 'Trang Thanh toán bắt buộc phải có Breadcrumb điều hướng theo FR-23 (dòng 263)').toBe(true);
  });

  test('EP-TC29: Trang Thanh toán phải có đúng một thẻ <h1>', async ({ page }) => {
    await loginAndPrepareCart(page);

    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    const screenshotPath = path.join(SCREENSHOT_DIR, `${RUN_NAME}_EP-TC29.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    // Oracle FR-21 (dòng 247): Mỗi trang có đúng một thẻ <h1> duy nhất
    const h1Elements = page.locator('h1');
    const h1Count = await h1Elements.count();

    expect.soft(h1Count === 1, `Trang Checkout phải có đúng 1 thẻ <h1> (hiện có ${h1Count} thẻ <h1>)`).toBe(true);
  });

  test('EP-TC30: Định dạng số tiền có ký hiệu ₫ và dấu phân cách hàng nghìn', async ({ page }) => {
    await loginAndPrepareCart(page);

    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    const screenshotPath = path.join(SCREENSHOT_DIR, `${RUN_NAME}_EP-TC30.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    // Oracle FR-21 (dòng 246): Số tiền hiển thị kèm ký hiệu ₫ và có phân cách hàng nghìn
    const bodyText = await page.locator('body').innerText();
    const hasDongSymbol = bodyText.includes('₫');
    const hasThousandsSeparator = /\d{1,3}[.,]\d{3}/.test(bodyText);

    expect.soft(hasDongSymbol, 'Giao diện bắt buộc phải có ký hiệu đơn vị tiền tệ "₫" theo FR-21').toBe(true);
    expect.soft(hasThousandsSeparator, 'Số tiền phải có dấu phân cách hàng nghìn (. hoặc ,) theo FR-21').toBe(true);
  });

  test('EP-TC31: Nút xác nhận đặt hàng có màu nền xanh dương', async ({ page }) => {
    await loginAndPrepareCart(page);

    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    const checkoutBtn = page.locator('button:has-text("Xác Nhận Thanh Toán"), button:has-text("Đặt hàng")');
    await expect.soft(checkoutBtn, 'Nút xác nhận đặt hàng phải hiển thị').toBeVisible();

    const screenshotPath = path.join(SCREENSHOT_DIR, `${RUN_NAME}_EP-TC31.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    if (await checkoutBtn.count() > 0) {
      const bgColor = await checkoutBtn.first().evaluate(el => window.getComputedStyle(el).backgroundColor);
      // rgb(r, g, b) -> màu xanh dương phải có b > r và b > g (hoặc r < 50, g < 150, b > 180)
      const match = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      let isBlue = false;
      if (match) {
        const [, r, g, b] = match.map(Number);
        isBlue = b > r && b > g;
      }
      expect.soft(isBlue, `Nút đặt hàng phải có màu xanh dương theo FR-21 (màu hiện tại: ${bgColor})`).toBe(true);
    }
  });

  test('EP-TC32: Ô địa chỉ được tự động điền sẵn từ hồ sơ người dùng (Q4)', async ({ page }) => {
    // Cập nhật địa chỉ trong profile người dùng qua API
    const loginRes = await page.request.post(`${BACKEND_URL}/api/login`, {
      data: { email: ACCOUNT.email, password: ACCOUNT.password }
    });
    const { token } = await loginRes.json();

    const profileAddress = '456 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM';
    await page.request.put(`${BACKEND_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { shipping_address: profileAddress }
    });

    const { user, cartItems } = await loginAndPrepareCart(page);

    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    const screenshotPath = path.join(SCREENSHOT_DIR, `${RUN_NAME}_EP-TC32.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    // Oracle Q4: Ô địa chỉ phải được tự điền sẵn bằng địa chỉ hồ sơ
    const addressInput = page.locator('input[name="shipping_address"], textarea[name="shipping_address"], input[placeholder*="địa chỉ" i]');
    if (await addressInput.count() > 0) {
      const val = await addressInput.first().inputValue();
      expect.soft(val === profileAddress, `Ô địa chỉ phải được tự động điền sẵn "${profileAddress}" (hiện tại: "${val}")`).toBe(true);
    } else {
      expect.soft(false, 'Trang Checkout không có trường địa chỉ giao hàng để kiểm tra tự điền sẵn').toBe(true);
    }
  });

});
