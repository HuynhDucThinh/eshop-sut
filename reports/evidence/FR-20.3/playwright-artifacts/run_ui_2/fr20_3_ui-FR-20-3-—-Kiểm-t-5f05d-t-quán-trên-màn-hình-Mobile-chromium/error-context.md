# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: fr20_3_ui.spec.js >> FR-20.3 — Kiểm thử Giao diện Mobile: Thanh toán (Checkout) và Áp mã giảm giá (390x844) >> EP-TC30: Kiểm tra định dạng tiền tệ ₫ (dấu phân cách hàng nghìn) và ngôn ngữ tiếng Việt nhất quán trên màn hình Mobile
- Location: fr20_3_ui.spec.js:270:3

# Error details

```
Error: Ô Tổng tiền thanh toán (VND) hiển thị số thô "500000" (thiếu dấu phân cách hàng nghìn và ký hiệu ₫); màn hình Đăng nhập trộn tiếng Anh ("Username", "Sign In")

expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - button "EShop Mobile" [ref=e5] [cursor=pointer]
    - generic [ref=e7]:
      - button "Chào, Test User" [ref=e8] [cursor=pointer]
      - button "Giỏ (1)" [ref=e10] [cursor=pointer]
  - generic [ref=e13]:
    - generic [ref=e14]: Xác Nhận Đơn Hàng
    - generic [ref=e15]: "Sản phẩm:"
    - generic [ref=e16]: • iPhone 15 Pro Max x 2 — 500,000 ₫
    - generic [ref=e17]: "Tổng tiền thanh toán (VND):"
    - textbox [disabled] [ref=e18]: "500000"
    - generic [ref=e19]:
      - generic [ref=e20]: Mã Giảm Giá
      - generic [ref=e21]:
        - textbox "Nhập mã giảm giá..." [ref=e22]
        - button "Áp dụng" [disabled] [ref=e23]
    - generic [ref=e25]: "Tổng thanh toán: 500,000 ₫"
    - button "Xác Nhận Thanh Toán" [ref=e26] [cursor=pointer]
  - generic [ref=e28]: © 2026 EShop SUT. Dành cho mục đích kiểm thử.
```

# Test source

```ts
  208 | 
  209 |   test('EP-TC28: Kiểm tra sự tồn tại của ô nhập Địa chỉ giao hàng và ký hiệu dấu * bắt buộc trên màn hình Thanh toán Mobile', async ({
  210 |     page,
  211 |   }) => {
  212 |     await loginAndOpenMobileCheckoutWith500kCart(page);
  213 | 
  214 |     const addressLabelCount = await page.getByText(/Địa chỉ giao hàng/i).count();
  215 |     const requiredStarCount = await page.getByText(/\*/).count();
  216 | 
  217 |     const screenshotPath = path.join(SCREENSHOT_DIR, 'EP-TC28_missing_shipping_address_field.png');
  218 |     await page.screenshot({ path: screenshotPath, fullPage: true });
  219 |     fs.copyFileSync(screenshotPath, path.join(EVIDENCE_DIR, 'BUG-FR20_3-02_missing_address_and_checkout.png'));
  220 | 
  221 |     const hasAddressFieldAndStar = addressLabelCount > 0 && requiredStarCount > 0;
  222 |     const actualSummary = `Trên màn hình Xác Nhận Đơn Hàng Mobile: số nhãn "Địa chỉ giao hàng" = ${addressLabelCount}, số ký hiệu "*" bắt buộc = ${requiredStarCount}`;
  223 | 
  224 |     recordUiResult(
  225 |       'EP-TC28',
  226 |       'Màn hình Thanh toán Mobile có ô nhập Địa chỉ giao hàng kèm nhãn dấu * bắt buộc (FR-08 dòng 105, FR-22 dòng 252)',
  227 |       actualSummary,
  228 |       hasAddressFieldAndStar ? 'Pass' : 'Fail',
  229 |       'Vi phạm FR-08 dòng 105 & FR-22 dòng 252: Màn hình Xác Nhận Đơn Hàng trên Mobile (renderCheckout tại App.js:659-757) hoàn toàn không có ô nhập Địa chỉ giao hàng và không có dấu * bắt buộc',
  230 |       'reports/evidence/FR-20.3/screenshots/EP-TC28_missing_shipping_address_field.png'
  231 |     );
  232 | 
  233 |     expect(hasAddressFieldAndStar, actualSummary).toBe(true);
  234 |   });
  235 | 
  236 |   test('EP-TC29: Để trống Địa chỉ giao hàng trên màn hình Mobile rồi bấm Thanh toán', async ({ page }) => {
  237 |     await loginAndOpenMobileCheckoutWith500kCart(page);
  238 | 
  239 |     let capturedCheckoutBody = null;
  240 |     page.on('request', req => {
  241 |       if (req.url().includes('/api/checkout') && req.method() === 'POST') {
  242 |         try {
  243 |           capturedCheckoutBody = JSON.parse(req.postData() || '{}');
  244 |         } catch {}
  245 |       }
  246 |     });
  247 | 
  248 |     await page.getByRole('button', { name: 'Xác Nhận Thanh Toán' }).click();
  249 |     await expect(page.getByText('Thanh toán thành công!')).toBeVisible();
  250 | 
  251 |     const screenshotPath = path.join(SCREENSHOT_DIR, 'EP-TC29_checkout_without_address_success.png');
  252 |     await page.screenshot({ path: screenshotPath, fullPage: true });
  253 | 
  254 |     const actualSummary = `Bấm "Xác Nhận Thanh Toán" khi không có địa chỉ vẫn báo "Thanh toán thành công!"; payload gửi đi: ${JSON.stringify(
  255 |       capturedCheckoutBody
  256 |     )} (không có trường shipping_address)`;
  257 | 
  258 |     recordUiResult(
  259 |       'EP-TC29',
  260 |       'Bị chặn không cho đặt hàng khi thiếu Địa chỉ giao hàng; hiển thị lỗi phía trên nút Submit; không tạo đơn thiếu địa chỉ (FR-08, FR-22)',
  261 |       actualSummary,
  262 |       'Fail',
  263 |       'Vi phạm FR-08 dòng 105 & FR-22: Mobile App (handleConfirmCheckout tại App.js:380-408) không kiểm tra địa chỉ, không gửi trường shipping_address trong body POST /api/checkout, và Backend vẫn lưu đơn hàng với shipping_address = NULL',
  264 |       'reports/evidence/FR-20.3/screenshots/EP-TC29_checkout_without_address_success.png'
  265 |     );
  266 | 
  267 |     expect(capturedCheckoutBody && Boolean(capturedCheckoutBody.shipping_address), actualSummary).toBe(true);
  268 |   });
  269 | 
  270 |   test('EP-TC30: Kiểm tra định dạng tiền tệ ₫ (dấu phân cách hàng nghìn) và ngôn ngữ tiếng Việt nhất quán trên màn hình Mobile', async ({
  271 |     page,
  272 |   }) => {
  273 |     await page.goto('/');
  274 |     // Kiểm tra màn hình Đăng nhập trước
  275 |     await page.getByText('Đăng nhập').click();
  276 |     const hasEnglishUsername = (await page.getByText('Username').count()) > 0;
  277 |     const hasEnglishSignIn = (await page.getByRole('button', { name: 'Sign In' }).count()) > 0;
  278 | 
  279 |     // Đăng nhập và mở màn hình Checkout
  280 |     await page.getByPlaceholder('Email').fill('test@eshop.com');
  281 |     await page.getByPlaceholder('Mật khẩu').fill('Test1234!');
  282 |     await page.getByRole('button', { name: 'Sign In' }).click();
  283 |     const addButtons = page.getByRole('button', { name: 'Thêm vào giỏ' });
  284 |     await addButtons.first().click();
  285 |     await addButtons.first().click();
  286 |     await page.getByText(/Giỏ \(1\)/).click();
  287 |     await page.getByRole('button', { name: 'Tiến hành thanh toán' }).click();
  288 | 
  289 |     const hasVndLabel = (await page.getByText('Tổng tiền thanh toán (VND):').count()) > 0;
  290 |     const rawTotalInputVal = await page.locator('input[readonly]').first().inputValue();
  291 | 
  292 |     const screenshotPath = path.join(SCREENSHOT_DIR, 'EP-TC30_currency_and_language_inconsistency.png');
  293 |     await page.screenshot({ path: screenshotPath, fullPage: true });
  294 |     fs.copyFileSync(screenshotPath, path.join(EVIDENCE_DIR, 'BUG-FR20_3-03_currency_and_language_mobile.png'));
  295 | 
  296 |     const isConsistent = !hasEnglishUsername && !hasEnglishSignIn && !hasVndLabel && rawTotalInputVal.includes('₫');
  297 |     const actualSummary = `Ô Tổng tiền thanh toán (VND) hiển thị số thô "${rawTotalInputVal}" (thiếu dấu phân cách hàng nghìn và ký hiệu ₫); màn hình Đăng nhập trộn tiếng Anh ("Username", "Sign In")`;
  298 | 
  299 |     recordUiResult(
  300 |       'EP-TC30',
  301 |       'Số tiền có dấu phân cách hàng nghìn kèm ký hiệu ₫; ngôn ngữ tiếng Việt nhất quán không lẫn tiếng Anh (FR-21 dòng 244, 248)',
  302 |       actualSummary,
  303 |       isConsistent ? 'Pass' : 'Fail',
  304 |       'Vi phạm FR-21 dòng 244 & 248: Ô Tổng tiền trên màn hình Checkout hiển thị "500000" với nhãn "(VND)" thay vì "500,000 ₫", và giao diện trộn tiếng Anh ("Username", "Sign In")',
  305 |       'reports/evidence/FR-20.3/screenshots/EP-TC30_currency_and_language_inconsistency.png'
  306 |     );
  307 | 
> 308 |     expect(isConsistent, actualSummary).toBe(true);
      |                                         ^ Error: Ô Tổng tiền thanh toán (VND) hiển thị số thô "500000" (thiếu dấu phân cách hàng nghìn và ký hiệu ₫); màn hình Đăng nhập trộn tiếng Anh ("Username", "Sign In")
  309 |   });
  310 | 
  311 |   test('EP-TC25 (UI): Kiểm tra hiển thị an toàn chuỗi XSS trong đơn hàng trên màn hình Hồ sơ Mobile (SEC-04)', async ({
  312 |     page,
  313 |   }) => {
  314 |     await page.goto('/');
  315 |     let xssTriggered = false;
  316 |     page.on('console', msg => {
  317 |       if (msg.text().includes('XSS_TRIGGERED')) xssTriggered = true;
  318 |     });
  319 | 
  320 |     await page.getByText('Đăng nhập').click();
  321 |     await page.getByPlaceholder('Email').fill('test@eshop.com');
  322 |     await page.getByPlaceholder('Mật khẩu').fill('Test1234!');
  323 |     await page.getByRole('button', { name: 'Sign In' }).click();
  324 |     await expect(page.getByText(/Chào,/)).toBeVisible();
  325 | 
  326 |     // Mở màn hình Hồ sơ & Lịch sử đơn hàng
  327 |     await page.getByText(/Chào,/).click();
  328 |     await expect(page.getByText('Hồ sơ của bạn')).toBeVisible();
  329 |     await expect(page.getByText('Lịch sử đơn hàng')).toBeVisible();
  330 | 
  331 |     const screenshotPath = path.join(SCREENSHOT_DIR, 'EP-TC25_xss_profile_orders_mobile.png');
  332 |     await page.screenshot({ path: screenshotPath, fullPage: true });
  333 | 
  334 |     recordUiResult(
  335 |       'EP-TC25 (UI)',
  336 |       'Khi hiển thị đơn hàng trên UI Mobile phải được escape an toàn, không thực thi script (SEC-04)',
  337 |       'Hiển thị an toàn trên màn hình Hồ sơ & Lịch sử đơn hàng Mobile (xssTriggered = false)',
  338 |       xssTriggered ? 'Fail' : 'Pass',
  339 |       'Trên UI React Native / DOM tự escape chuỗi văn bản an toàn, nhưng ở tầng API vẫn dính lỗi R6 không xóa rỗng giỏ hàng sau checkout',
  340 |       'reports/evidence/FR-20.3/screenshots/EP-TC25_xss_profile_orders_mobile.png'
  341 |     );
  342 | 
  343 |     expect(xssTriggered).toBe(false);
  344 |   });
  345 | });
  346 | 
```