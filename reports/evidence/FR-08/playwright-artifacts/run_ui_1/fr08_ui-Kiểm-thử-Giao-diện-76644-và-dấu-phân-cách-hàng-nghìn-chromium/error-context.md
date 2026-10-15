# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: fr08_ui.spec.js >> Kiểm thử Giao diện FR-08 — Thanh toán (Checkout) >> EP-TC30: Định dạng số tiền có ký hiệu ₫ và dấu phân cách hàng nghìn
- Location: fr08_ui.spec.js:268:3

# Error details

```
Error: Số tiền phải có dấu phân cách hàng nghìn (. hoặc ,) theo FR-21

expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- generic [ref=f2e3]:
  - banner [ref=f2e4]:
    - link "EShop" [ref=f2e5] [cursor=pointer]:
      - /url: /
    - navigation [ref=f2e6]:
      - link "Giỏ hàng" [ref=f2e7] [cursor=pointer]:
        - /url: /cart
      - generic [ref=f2e8]:
        - link "Chào, Test User" [ref=f2e9] [cursor=pointer]:
          - /url: /profile
        - button "Thoát" [ref=f2e10] [cursor=pointer]
  - main [ref=f2e11]:
    - generic [ref=f2e12]:
      - heading "Xác Nhận Đơn Hàng" [level=2] [ref=f2e13]
      - generic [ref=f2e14]:
        - heading "Sản phẩm:" [level=3] [ref=f2e15]
        - list
      - generic [ref=f2e16]:
        - generic [ref=f2e17]: "Tổng tiền thanh toán (VND):"
        - spinbutton [ref=f2e18]: "0"
      - generic [ref=f2e19]:
        - generic [ref=f2e20]: Mã Giảm Giá
        - generic [ref=f2e21]:
          - textbox "Nhập mã giảm giá..." [ref=f2e22]
          - button "Áp dụng" [disabled] [ref=f2e23]
      - generic [ref=f2e24]: "Tổng thanh toán: 0 ₫"
      - button "Xác Nhận Thanh Toán" [ref=f2e26] [cursor=pointer]
  - contentinfo [ref=f2e27]: © 2026 EShop SUT. Dành cho mục đích kiểm thử.
```

# Test source

```ts
  183 |     if (await addressInput.count() > 0) {
  184 |       await addressInput.first().fill('');
  185 |     }
  186 | 
  187 |     const checkoutBtn = page.locator('button:has-text("Xác Nhận Thanh Toán"), button:has-text("Đặt hàng")');
  188 |     if (await checkoutBtn.count() > 0) {
  189 |       await checkoutBtn.click();
  190 |       await page.waitForTimeout(500);
  191 |     }
  192 | 
  193 |     const screenshotPath = path.join(SCREENSHOT_DIR, `${RUN_NAME}_EP-TC26.png`);
  194 |     await page.screenshot({ path: screenshotPath, fullPage: true });
  195 | 
  196 |     // Oracle: Không được hoàn tất đơn hàng, phải hiển thị cảnh báo lỗi hoặc validation HTML5
  197 |     const successMsg = await page.locator('text=/thành công|cảm ơn/i').count();
  198 |     expect.soft(successMsg === 0, 'Để trống địa chỉ giao hàng tuyệt đối không được báo đặt hàng thành công').toBe(true);
  199 |   });
  200 | 
  201 |   test('EP-TC27: Thông báo lỗi giao diện phải hiển thị phía TRÊN nút submit', async ({ page }) => {
  202 |     await loginAndPrepareCart(page);
  203 | 
  204 |     await page.goto('/checkout');
  205 |     await page.waitForLoadState('networkidle');
  206 | 
  207 |     // Thử kích hoạt lỗi (ví dụ mã giảm giá sai hoặc địa chỉ rỗng)
  208 |     const couponInput = page.locator('input[placeholder*="mã giảm giá" i]');
  209 |     const applyCouponBtn = page.locator('button:has-text("Áp dụng")');
  210 |     if (await couponInput.count() > 0 && await applyCouponBtn.count() > 0) {
  211 |       await couponInput.fill('MA_KHONG_TON_TAI_999');
  212 |       await applyCouponBtn.click();
  213 |       await page.waitForTimeout(500);
  214 |     }
  215 | 
  216 |     const checkoutBtn = page.locator('button:has-text("Xác Nhận Thanh Toán"), button:has-text("Đặt hàng")');
  217 |     const errorMsg = page.locator('.text-red-600, .error-message, [role="alert"]');
  218 | 
  219 |     const screenshotPath = path.join(SCREENSHOT_DIR, `${RUN_NAME}_EP-TC27.png`);
  220 |     await page.screenshot({ path: screenshotPath, fullPage: true });
  221 | 
  222 |     if (await errorMsg.count() > 0 && await checkoutBtn.count() > 0) {
  223 |       const errorBox = await errorMsg.first().boundingBox();
  224 |       const btnBox = await checkoutBtn.first().boundingBox();
  225 |       if (errorBox && btnBox) {
  226 |         expect.soft(
  227 |           errorBox.y + errorBox.height <= btnBox.y + 10,
  228 |           `Thông báo lỗi (y=${errorBox.y}) phải nằm phía trên nút submit (y=${btnBox.y}) theo FR-22 (dòng 255)`
  229 |         ).toBe(true);
  230 |       }
  231 |     } else {
  232 |       expect.soft(false, 'Không tìm thấy phần tử thông báo lỗi để kiểm tra vị trí').toBe(true);
  233 |     }
  234 |   });
  235 | 
  236 |   test('EP-TC28: Trang Thanh toán phải có Breadcrumb điều hướng', async ({ page }) => {
  237 |     await loginAndPrepareCart(page);
  238 | 
  239 |     await page.goto('/checkout');
  240 |     await page.waitForLoadState('networkidle');
  241 | 
  242 |     const screenshotPath = path.join(SCREENSHOT_DIR, `${RUN_NAME}_EP-TC28.png`);
  243 |     await page.screenshot({ path: screenshotPath, fullPage: true });
  244 | 
  245 |     // Oracle FR-23 (dòng 263): Phải có Breadcrumb điều hướng (nav, ol, li, hoặc chuỗi có > hay /)
  246 |     const breadcrumb = page.locator('nav[aria-label="breadcrumb"], .breadcrumb, ol:has-text("Trang chủ"), div:has-text("Trang chủ >"), div:has-text("Trang chủ ›")');
  247 |     const hasBreadcrumb = await breadcrumb.count() > 0;
  248 | 
  249 |     expect.soft(hasBreadcrumb, 'Trang Thanh toán bắt buộc phải có Breadcrumb điều hướng theo FR-23 (dòng 263)').toBe(true);
  250 |   });
  251 | 
  252 |   test('EP-TC29: Trang Thanh toán phải có đúng một thẻ <h1>', async ({ page }) => {
  253 |     await loginAndPrepareCart(page);
  254 | 
  255 |     await page.goto('/checkout');
  256 |     await page.waitForLoadState('networkidle');
  257 | 
  258 |     const screenshotPath = path.join(SCREENSHOT_DIR, `${RUN_NAME}_EP-TC29.png`);
  259 |     await page.screenshot({ path: screenshotPath, fullPage: true });
  260 | 
  261 |     // Oracle FR-21 (dòng 247): Mỗi trang có đúng một thẻ <h1> duy nhất
  262 |     const h1Elements = page.locator('h1');
  263 |     const h1Count = await h1Elements.count();
  264 | 
  265 |     expect.soft(h1Count === 1, `Trang Checkout phải có đúng 1 thẻ <h1> (hiện có ${h1Count} thẻ <h1>)`).toBe(true);
  266 |   });
  267 | 
  268 |   test('EP-TC30: Định dạng số tiền có ký hiệu ₫ và dấu phân cách hàng nghìn', async ({ page }) => {
  269 |     await loginAndPrepareCart(page);
  270 | 
  271 |     await page.goto('/checkout');
  272 |     await page.waitForLoadState('networkidle');
  273 | 
  274 |     const screenshotPath = path.join(SCREENSHOT_DIR, `${RUN_NAME}_EP-TC30.png`);
  275 |     await page.screenshot({ path: screenshotPath, fullPage: true });
  276 | 
  277 |     // Oracle FR-21 (dòng 246): Số tiền hiển thị kèm ký hiệu ₫ và có phân cách hàng nghìn
  278 |     const bodyText = await page.locator('body').innerText();
  279 |     const hasDongSymbol = bodyText.includes('₫');
  280 |     const hasThousandsSeparator = /\d{1,3}[.,]\d{3}/.test(bodyText);
  281 | 
  282 |     expect.soft(hasDongSymbol, 'Giao diện bắt buộc phải có ký hiệu đơn vị tiền tệ "₫" theo FR-21').toBe(true);
> 283 |     expect.soft(hasThousandsSeparator, 'Số tiền phải có dấu phân cách hàng nghìn (. hoặc ,) theo FR-21').toBe(true);
      |                                                                                                          ^ Error: Số tiền phải có dấu phân cách hàng nghìn (. hoặc ,) theo FR-21
  284 |   });
  285 | 
  286 |   test('EP-TC31: Nút xác nhận đặt hàng có màu nền xanh dương', async ({ page }) => {
  287 |     await loginAndPrepareCart(page);
  288 | 
  289 |     await page.goto('/checkout');
  290 |     await page.waitForLoadState('networkidle');
  291 | 
  292 |     const checkoutBtn = page.locator('button:has-text("Xác Nhận Thanh Toán"), button:has-text("Đặt hàng")');
  293 |     await expect.soft(checkoutBtn, 'Nút xác nhận đặt hàng phải hiển thị').toBeVisible();
  294 | 
  295 |     const screenshotPath = path.join(SCREENSHOT_DIR, `${RUN_NAME}_EP-TC31.png`);
  296 |     await page.screenshot({ path: screenshotPath, fullPage: true });
  297 | 
  298 |     if (await checkoutBtn.count() > 0) {
  299 |       const bgColor = await checkoutBtn.first().evaluate(el => window.getComputedStyle(el).backgroundColor);
  300 |       // rgb(r, g, b) -> màu xanh dương phải có b > r và b > g (hoặc r < 50, g < 150, b > 180)
  301 |       const match = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  302 |       let isBlue = false;
  303 |       if (match) {
  304 |         const [, r, g, b] = match.map(Number);
  305 |         isBlue = b > r && b > g;
  306 |       }
  307 |       expect.soft(isBlue, `Nút đặt hàng phải có màu xanh dương theo FR-21 (màu hiện tại: ${bgColor})`).toBe(true);
  308 |     }
  309 |   });
  310 | 
  311 |   test('EP-TC32: Ô địa chỉ được tự động điền sẵn từ hồ sơ người dùng (Q4)', async ({ page }) => {
  312 |     // Cập nhật địa chỉ trong profile người dùng qua API
  313 |     const loginRes = await page.request.post(`${BACKEND_URL}/api/login`, {
  314 |       data: { email: ACCOUNT.email, password: ACCOUNT.password }
  315 |     });
  316 |     const { token } = await loginRes.json();
  317 | 
  318 |     const profileAddress = '456 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM';
  319 |     await page.request.put(`${BACKEND_URL}/api/users/me`, {
  320 |       headers: { Authorization: `Bearer ${token}` },
  321 |       data: { shipping_address: profileAddress }
  322 |     });
  323 | 
  324 |     const { user, cartItems } = await loginAndPrepareCart(page);
  325 | 
  326 |     await page.goto('/checkout');
  327 |     await page.waitForLoadState('networkidle');
  328 | 
  329 |     const screenshotPath = path.join(SCREENSHOT_DIR, `${RUN_NAME}_EP-TC32.png`);
  330 |     await page.screenshot({ path: screenshotPath, fullPage: true });
  331 | 
  332 |     // Oracle Q4: Ô địa chỉ phải được tự điền sẵn bằng địa chỉ hồ sơ
  333 |     const addressInput = page.locator('input[name="shipping_address"], textarea[name="shipping_address"], input[placeholder*="địa chỉ" i]');
  334 |     if (await addressInput.count() > 0) {
  335 |       const val = await addressInput.first().inputValue();
  336 |       expect.soft(val === profileAddress, `Ô địa chỉ phải được tự động điền sẵn "${profileAddress}" (hiện tại: "${val}")`).toBe(true);
  337 |     } else {
  338 |       expect.soft(false, 'Trang Checkout không có trường địa chỉ giao hàng để kiểm tra tự điền sẵn').toBe(true);
  339 |     }
  340 |   });
  341 | 
  342 | });
  343 | 
```