# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: fr20_3_ui.spec.js >> FR-20.3 — Kiểm thử Giao diện Mobile: Thanh toán (Checkout) và Áp mã giảm giá (390x844) >> EP-TC26: Luồng Áp mã SAVE10 và Đặt hàng hợp lệ trên màn hình Giỏ hàng/Thanh toán Mobile (390x844)
- Location: fr20_3_ui.spec.js:133:3

# Error details

```
Error: Hiển thị "Tiết kiệm: -4,500,000 ₫" và "Thành tiền: 5,000,000 ₫" (Tổng thanh toán: 5,000,000 ₫)

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
        - textbox "Nhập mã giảm giá..." [ref=e22]: SAVE10
        - button "Áp dụng" [ref=e23] [cursor=pointer]
      - generic [ref=e25]:
        - generic [ref=e26]: ✅ Áp dụng thành công! Giảm 10%
        - generic [ref=e27]: "Tiết kiệm: -4,500,000 ₫"
        - generic [ref=e28]: "Thành tiền: 5,000,000 ₫"
    - generic [ref=e29]: "Tổng thanh toán: 5,000,000 ₫"
    - button "Xác Nhận Thanh Toán" [ref=e30] [cursor=pointer]
  - generic [ref=e32]: © 2026 EShop SUT. Dành cho mục đích kiểm thử.
```

# Test source

```ts
  77  |   await page.getByPlaceholder('Email').fill('test@eshop.com');
  78  |   await page.getByPlaceholder('Mật khẩu').fill('Test1234!');
  79  |   await page.getByRole('button', { name: 'Sign In' }).click();
  80  | 
  81  |   await expect(page.getByText(/Chào,/)).toBeVisible();
  82  | 
  83  |   // Thêm sản phẩm đầu tiên (250,000 ₫) 2 lần để đạt 500,000 ₫
  84  |   const addButtons = page.getByRole('button', { name: 'Thêm vào giỏ' });
  85  |   await addButtons.first().click();
  86  |   await addButtons.first().click();
  87  | 
  88  |   // Mở Giỏ hàng
  89  |   await page.getByText(/Giỏ \(1\)/).click();
  90  |   await expect(page.getByText('Giỏ Hàng')).toBeVisible();
  91  | 
  92  |   // Chuyển sang màn hình Thanh toán
  93  |   await page.getByRole('button', { name: 'Tiến hành thanh toán' }).click();
  94  |   await expect(page.getByText('Xác Nhận Đơn Hàng')).toBeVisible();
  95  | }
  96  | 
  97  | const UI_RESULTS_CACHE_FILE = path.join(EVIDENCE_DIR, '.ui_results_cache.json');
  98  | 
  99  | function recordUiResult(id, expected, actual, status, note, screenshotRel) {
  100 |   let list = [];
  101 |   try {
  102 |     if (fs.existsSync(UI_RESULTS_CACHE_FILE)) {
  103 |       list = JSON.parse(fs.readFileSync(UI_RESULTS_CACHE_FILE, 'utf8'));
  104 |     }
  105 |   } catch {}
  106 |   const existingIdx = list.findIndex(r => r.id === id);
  107 |   const entry = { id, expected, actual, status, note, screenshotRel };
  108 |   if (existingIdx >= 0) list[existingIdx] = entry;
  109 |   else list.push(entry);
  110 |   fs.writeFileSync(UI_RESULTS_CACHE_FILE, JSON.stringify(list, null, 2), 'utf8');
  111 | 
  112 |   const mdLines = [];
  113 |   mdLines.push(`<!-- Sinh tự động bởi Playwright UI Suite (fr20_3_ui.spec.js) lúc ${new Date().toISOString()} -->`);
  114 |   const passCount = list.filter(r => r.status === 'Pass').length;
  115 |   const failCount = list.filter(r => r.status === 'Fail').length;
  116 |   mdLines.push(`**Tổng số ca UI:** ${list.length} · **Pass:** ${passCount} · **Fail:** ${failCount}`, '');
  117 |   mdLines.push('| TC ID | Mong đợi | Thực tế trên UI (390x844) | Trạng thái | Ghi chú / Lý do | Ảnh bằng chứng |');
  118 |   mdLines.push('|---|---|---|---|---|---|');
  119 |   for (const r of list) {
  120 |     mdLines.push(
  121 |       `| ${r.id} | ${r.expected} | ${r.actual} | **${r.status}** | ${r.note} | \`${r.screenshotRel}\` |`
  122 |     );
  123 |   }
  124 |   fs.writeFileSync(path.join(EVIDENCE_DIR, 'run_ui_results.md'), mdLines.join('\n') + '\n', 'utf8');
  125 | }
  126 | 
  127 | test.describe('FR-20.3 — Kiểm thử Giao diện Mobile: Thanh toán (Checkout) và Áp mã giảm giá (390x844)', () => {
  128 |   test.beforeEach(async ({ page }) => {
  129 |     await resetUiDatabaseState();
  130 |     await setupMobileApiRouteProxy(page);
  131 |   });
  132 | 
  133 |   test('EP-TC26: Luồng Áp mã SAVE10 và Đặt hàng hợp lệ trên màn hình Giỏ hàng/Thanh toán Mobile (390x844)', async ({
  134 |     page,
  135 |   }) => {
  136 |     await loginAndOpenMobileCheckoutWith500kCart(page);
  137 | 
  138 |     // Nhập mã SAVE10 (giảm 10% trên đơn 500,000 ₫ -> kỳ vọng giảm 50,000 ₫ còn 450,000 ₫)
  139 |     const couponInput = page.getByPlaceholder('Nhập mã giảm giá...');
  140 |     await couponInput.fill('SAVE10');
  141 |     await page.getByRole('button', { name: 'Áp dụng' }).click();
  142 | 
  143 |     await expect(page.getByText(/Áp dụng thành công!/)).toBeVisible();
  144 |     const savingsText = (await page.getByText(/Tiết kiệm:/).textContent()) || '';
  145 |     const finalAmountText = (await page.getByText(/Thành tiền:/).last().textContent()) || '';
  146 |     const totalPayText = (await page.getByText(/Tổng thanh toán:/).textContent()) || '';
  147 | 
  148 |     const screenshotPath = path.join(SCREENSHOT_DIR, 'EP-TC26_save10_mobile_checkout.png');
  149 |     await page.screenshot({ path: screenshotPath, fullPage: true });
  150 |     // Lưu thêm bản sao bằng chứng bug công thức phần trăm trên Mobile UI
  151 |     fs.copyFileSync(screenshotPath, path.join(EVIDENCE_DIR, 'BUG-FR20_3-01_percent_coupon_5000000_mobile.png'));
  152 | 
  153 |     const hasCorrectDiscount = savingsText.includes('50') && !savingsText.includes('-');
  154 |     const hasCorrectFinal = finalAmountText.includes('450');
  155 | 
  156 |     const actualSummary = `Hiển thị "${savingsText.trim()}" và "${finalAmountText.trim()}" (${totalPayText.trim()})`;
  157 |     if (!hasCorrectDiscount || !hasCorrectFinal) {
  158 |       recordUiResult(
  159 |         'EP-TC26',
  160 |         'Hiển thị Tiết kiệm: 50,000 ₫ và Thành tiền / Tổng thanh toán: 450,000 ₫; có ô nhập địa chỉ và đặt hàng thành công',
  161 |         actualSummary,
  162 |         'Fail',
  163 |         'Lỗi công thức giảm giá percent (1 - discount_value) làm Tiết kiệm bị âm (-4,500,000 ₫) và Thành tiền đội lên 5,000,000 ₫ gấp 10 lần giá gốc; đồng thời request /api/apply-coupon từ Mobile không gửi kèm Header Authorization',
  164 |         'reports/evidence/FR-20.3/screenshots/EP-TC26_save10_mobile_checkout.png'
  165 |       );
  166 |     } else {
  167 |       recordUiResult(
  168 |         'EP-TC26',
  169 |         'Hiển thị Tiết kiệm: 50,000 ₫ và Thành tiền: 450,000 ₫',
  170 |         actualSummary,
  171 |         'Pass',
  172 |         '',
  173 |         'reports/evidence/FR-20.3/screenshots/EP-TC26_save10_mobile_checkout.png'
  174 |       );
  175 |     }
  176 | 
> 177 |     expect(hasCorrectDiscount && hasCorrectFinal, actualSummary).toBe(true);
      |                                                                  ^ Error: Hiển thị "Tiết kiệm: -4,500,000 ₫" và "Thành tiền: 5,000,000 ₫" (Tổng thanh toán: 5,000,000 ₫)
  178 |   });
  179 | 
  180 |   test('EP-TC27: Nhập mã hết hạn EXPIRED trên màn hình Mobile rồi bấm Áp dụng', async ({ page }) => {
  181 |     await loginAndOpenMobileCheckoutWith500kCart(page);
  182 | 
  183 |     const couponInput = page.getByPlaceholder('Nhập mã giảm giá...');
  184 |     await couponInput.fill('EXPIRED');
  185 |     await page.getByRole('button', { name: 'Áp dụng' }).click();
  186 | 
  187 |     const errorEl = page.getByText('Mã giảm giá đã hết hạn');
  188 |     await expect(errorEl).toBeVisible();
  189 |     const totalPayText = (await page.getByText(/Tổng thanh toán:/).textContent()) || '';
  190 | 
  191 |     const screenshotPath = path.join(SCREENSHOT_DIR, 'EP-TC27_expired_coupon_mobile.png');
  192 |     await page.screenshot({ path: screenshotPath, fullPage: true });
  193 | 
  194 |     const isTotalUnchanged = totalPayText.includes('500');
  195 |     const actualSummary = `Hiển thị thông báo lỗi đỏ "Mã giảm giá đã hết hạn"; ${totalPayText.trim()} giữ nguyên`;
  196 | 
  197 |     recordUiResult(
  198 |       'EP-TC27',
  199 |       'Hiển thị thông báo lỗi tiếng Việt "Mã giảm giá đã hết hạn"; tổng tiền giữ nguyên 500,000 ₫',
  200 |       actualSummary,
  201 |       isTotalUnchanged ? 'Pass' : 'Fail',
  202 |       isTotalUnchanged ? 'Xử lý đúng thông báo lỗi mã hết hạn trên Mobile UI' : 'Tổng tiền bị thay đổi sai',
  203 |       'reports/evidence/FR-20.3/screenshots/EP-TC27_expired_coupon_mobile.png'
  204 |     );
  205 | 
  206 |     expect(isTotalUnchanged).toBe(true);
  207 |   });
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
```