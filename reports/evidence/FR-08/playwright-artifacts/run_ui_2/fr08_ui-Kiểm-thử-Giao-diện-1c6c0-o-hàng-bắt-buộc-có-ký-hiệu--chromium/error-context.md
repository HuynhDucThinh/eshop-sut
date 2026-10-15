# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: fr08_ui.spec.js >> Kiểm thử Giao diện FR-08 — Thanh toán (Checkout) >> EP-TC25: Nhãn trường Địa chỉ giao hàng bắt buộc có ký hiệu *
- Location: fr08_ui.spec.js:160:3

# Error details

```
Error: Nhãn trường bắt buộc Địa chỉ giao hàng phải có ký hiệu dấu sao (*)

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
        - link "Chào, null" [ref=f2e9] [cursor=pointer]:
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
  73  |     const screenshotPath = path.join(SCREENSHOT_DIR, `${RUN_NAME}_EP-TC21.png`);
  74  |     await page.screenshot({ path: screenshotPath, fullPage: true });
  75  | 
  76  |     const currentUrl = page.url();
  77  |     const hasLoginPrompt = await page.locator('text=/đăng nhập/i').count() > 0;
  78  |     const hasCheckoutBtn = await page.locator('button:has-text("Xác Nhận Thanh Toán"), button:has-text("Đặt hàng")').count() > 0;
  79  | 
  80  |     // Oracle: Phải chuyển hướng về /login HOẶC hiển thị yêu cầu đăng nhập, và KHÔNG hiển thị nút đặt hàng
  81  |     expect.soft(
  82  |       currentUrl.includes('/login') || hasLoginPrompt,
  83  |       'Người dùng chưa đăng nhập khi vào /checkout phải bị chuyển hướng đăng nhập hoặc có thông báo yêu cầu đăng nhập'
  84  |     ).toBe(true);
  85  | 
  86  |     expect.soft(
  87  |       !hasCheckoutBtn,
  88  |       'Người dùng chưa đăng nhập tuyệt đối không được nhìn thấy nút Xác Nhận Đặt Hàng'
  89  |     ).toBe(true);
  90  |   });
  91  | 
  92  |   test('EP-TC22: Luồng đặt hàng hợp lệ end-to-end trên giao diện', async ({ page }) => {
  93  |     await loginAndPrepareCart(page);
  94  | 
  95  |     await page.goto('/checkout');
  96  |     await page.waitForLoadState('networkidle');
  97  | 
  98  |     // Tìm trường địa chỉ giao hàng
  99  |     const addressInput = page.locator('input[name="shipping_address"], textarea[name="shipping_address"], input[placeholder*="địa chỉ" i]');
  100 |     const hasAddressField = await addressInput.count() > 0;
  101 |     expect.soft(hasAddressField, 'Trang Checkout bắt buộc phải có ô nhập Địa chỉ giao hàng').toBe(true);
  102 | 
  103 |     if (hasAddressField) {
  104 |       await addressInput.first().fill(ADDR_NOM);
  105 |     }
  106 | 
  107 |     const checkoutBtn = page.locator('button:has-text("Xác Nhận Thanh Toán"), button:has-text("Đặt hàng")');
  108 |     await expect.soft(checkoutBtn, 'Nút xác nhận đặt hàng phải tồn tại trên giao diện').toBeVisible();
  109 | 
  110 |     if (await checkoutBtn.count() > 0) {
  111 |       await checkoutBtn.click();
  112 |       await page.waitForTimeout(1000);
  113 |     }
  114 | 
  115 |     const screenshotPath = path.join(SCREENSHOT_DIR, `${RUN_NAME}_EP-TC22.png`);
  116 |     await page.screenshot({ path: screenshotPath, fullPage: true });
  117 | 
  118 |     // Kiểm tra thông báo thành công
  119 |     const successMsg = page.locator('text=/thành công|cảm ơn/i');
  120 |     await expect.soft(successMsg, 'Sau khi thanh toán phải hiển thị thông báo thành công').toBeVisible();
  121 |   });
  122 | 
  123 |   test('EP-TC23: Hiển thị đầy đủ danh sách sản phẩm đặt mua khớp với giỏ hàng', async ({ page }) => {
  124 |     const { prodA, prodB } = await loginAndPrepareCart(page);
  125 | 
  126 |     await page.goto('/checkout');
  127 |     await page.waitForLoadState('networkidle');
  128 | 
  129 |     const screenshotPath = path.join(SCREENSHOT_DIR, `${RUN_NAME}_EP-TC23.png`);
  130 |     await page.screenshot({ path: screenshotPath, fullPage: true });
  131 | 
  132 |     // Oracle: Phải hiển thị tên sản phẩm, số lượng và thành tiền của cả 2 sản phẩm
  133 |     const hasProdA = await page.locator(`text=${prodA.name}`).count() > 0;
  134 |     const hasProdB = await page.locator(`text=${prodB.name}`).count() > 0;
  135 | 
  136 |     expect.soft(hasProdA, `Danh sách sản phẩm phải chứa "${prodA.name}"`).toBe(true);
  137 |     expect.soft(hasProdB, `Danh sách sản phẩm phải chứa "${prodB.name}"`).toBe(true);
  138 |   });
  139 | 
  140 |   test('EP-TC24: Tổng tiền phải tự động tính và không có ô cho người dùng sửa trực tiếp', async ({ page }) => {
  141 |     await loginAndPrepareCart(page);
  142 | 
  143 |     await page.goto('/checkout');
  144 |     await page.waitForLoadState('networkidle');
  145 | 
  146 |     const screenshotPath = path.join(SCREENSHOT_DIR, `${RUN_NAME}_EP-TC24.png`);
  147 |     await page.screenshot({ path: screenshotPath, fullPage: true });
  148 | 
  149 |     // Kiểm tra xem có input nào cho phép sửa tổng tiền không
  150 |     // Bug tiềm ẩn: Checkout.jsx có <input type="number" value={editableTotal} onChange=...>
  151 |     const editableTotalInput = page.locator('input[type="number"]:not([readonly]):not([disabled])');
  152 |     const editableCount = await editableTotalInput.count();
  153 | 
  154 |     expect.soft(
  155 |       editableCount === 0,
  156 |       `Tổng tiền không được phép có ô nhập chỉnh sửa trực tiếp (phát hiện ${editableCount} ô nhập cho phép sửa)`
  157 |     ).toBe(true);
  158 |   });
  159 | 
  160 |   test('EP-TC25: Nhãn trường Địa chỉ giao hàng bắt buộc có ký hiệu *', async ({ page }) => {
  161 |     await loginAndPrepareCart(page);
  162 | 
  163 |     await page.goto('/checkout');
  164 |     await page.waitForLoadState('networkidle');
  165 | 
  166 |     const screenshotPath = path.join(SCREENSHOT_DIR, `${RUN_NAME}_EP-TC25.png`);
  167 |     await page.screenshot({ path: screenshotPath, fullPage: true });
  168 | 
  169 |     // Oracle FR-22 (dòng 252): Trường bắt buộc có dấu *
  170 |     const labelWithAsterisk = page.locator('label:has-text("Địa chỉ"), label:has-text("địa chỉ")').locator('text=*');
  171 |     const hasAsterisk = await labelWithAsterisk.count() > 0;
  172 | 
> 173 |     expect.soft(hasAsterisk, 'Nhãn trường bắt buộc Địa chỉ giao hàng phải có ký hiệu dấu sao (*)').toBe(true);
      |                                                                                                    ^ Error: Nhãn trường bắt buộc Địa chỉ giao hàng phải có ký hiệu dấu sao (*)
  174 |   });
  175 | 
  176 |   test('EP-TC26: Để trống ô địa chỉ trên giao diện bấm đặt hàng bị chặn hoặc báo lỗi', async ({ page }) => {
  177 |     await loginAndPrepareCart(page);
  178 | 
  179 |     await page.goto('/checkout');
  180 |     await page.waitForLoadState('networkidle');
  181 | 
  182 |     const addressInput = page.locator('input[name="shipping_address"], textarea[name="shipping_address"], input[placeholder*="địa chỉ" i]');
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
```