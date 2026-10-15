# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: fr08_ui.spec.js >> Kiểm thử Giao diện FR-08 — Thanh toán (Checkout) >> EP-TC22: Luồng đặt hàng hợp lệ end-to-end trên giao diện
- Location: fr08_ui.spec.js:92:3

# Error details

```
Error: Trang Checkout bắt buộc phải có ô nhập Địa chỉ giao hàng

expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

```
Error: Sau khi thanh toán phải hiển thị thông báo thành công

expect(locator).toBeVisible() failed

Locator: locator('text=/thành công|cảm ơn/i')
Expected: visible
Error: strict mode violation: locator('text=/thành công|cảm ơn/i') resolved to 2 elements:
    1) <h2 class="text-3xl text-green-600 font-bold mb-4">Thanh toán thành công!</h2> aka getByRole('heading', { name: 'Thanh toán thành công!' })
    2) <p class="mb-4">Cảm ơn bạn đã mua sắm tại EShop.</p> aka getByText('Cảm ơn bạn đã mua sắm tại')

Call log:
  - Sau khi thanh toán phải hiển thị thông báo thành công locator('text=/thành công|cảm ơn/i') with timeout 4000ms
  - waiting for locator('text=/thành công|cảm ơn/i')

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
      - heading "Thanh toán thành công!" [level=2] [ref=f2e13]
      - paragraph [ref=f2e14]: Cảm ơn bạn đã mua sắm tại EShop.
      - button "Quay lại trang chủ" [ref=f2e15] [cursor=pointer]
  - contentinfo [ref=f2e16]: © 2026 EShop SUT. Dành cho mục đích kiểm thử.
```

# Test source

```ts
  20  | 
  21  | fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  22  | 
  23  | const ACCOUNT = { email: 'test@eshop.com', password: 'Test1234!' };
  24  | const ADDR_NOM = '123 Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM';
  25  | 
  26  | // Hàm hỗ trợ đăng nhập và nạp giỏ hàng qua giao diện hoặc LocalStorage
  27  | async function loginAndPrepareCart(page) {
  28  |   // Đăng nhập qua API và lưu vào localStorage để tiết kiệm thời gian và đảm bảo trạng thái sạch
  29  |   const loginRes = await page.request.post(`${BACKEND_URL}/api/login`, {
  30  |     data: { email: ACCOUNT.email, password: ACCOUNT.password }
  31  |   });
  32  |   const loginData = await loginRes.json();
  33  |   const token = loginData.token;
  34  |   const user = loginData.user;
  35  | 
  36  |   // Lấy danh sách sản phẩm thực tế
  37  |   const prodRes = await page.request.get(`${BACKEND_URL}/api/products`);
  38  |   const products = await prodRes.json();
  39  |   const prodA = products[0] || { id: 1, name: 'Sản phẩm 1', price: 100000 };
  40  |   const prodB = products[1] || { id: 2, name: 'Sản phẩm 2', price: 150000 };
  41  | 
  42  |   const cartItems = [
  43  |     { ...prodA, quantity: 1 },
  44  |     { ...prodB, quantity: 1 }
  45  |   ];
  46  | 
  47  |   await page.goto('/');
  48  |   await page.evaluate(({ token, user, cartItems }) => {
  49  |     localStorage.setItem('token', token);
  50  |     localStorage.setItem('user', JSON.stringify(user));
  51  |     localStorage.setItem('cart', JSON.stringify(cartItems));
  52  |   }, { token, user, cartItems });
  53  | 
  54  |   await page.reload();
  55  |   return { token, user, prodA, prodB, cartItems };
  56  | }
  57  | 
  58  | test.describe('Kiểm thử Giao diện FR-08 — Thanh toán (Checkout)', () => {
  59  | 
  60  |   test('EP-TC21: Người dùng chưa đăng nhập truy cập trang Checkout bị chặn hoặc chuyển hướng', async ({ page }) => {
  61  |     // Xóa sạch trạng thái đăng nhập
  62  |     await page.goto('/');
  63  |     await page.evaluate(() => {
  64  |       localStorage.clear();
  65  |       sessionStorage.clear();
  66  |     });
  67  | 
  68  |     // Cố tình điều hướng trực tiếp vào trang Thanh toán
  69  |     await page.goto('/checkout');
  70  |     await page.waitForLoadState('networkidle');
  71  | 
  72  |     // Chụp ảnh bằng chứng
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
> 120 |     await expect.soft(successMsg, 'Sau khi thanh toán phải hiển thị thông báo thành công').toBeVisible();
      |                                                                                            ^ Error: Sau khi thanh toán phải hiển thị thông báo thành công
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
  173 |     expect.soft(hasAsterisk, 'Nhãn trường bắt buộc Địa chỉ giao hàng phải có ký hiệu dấu sao (*)').toBe(true);
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
```