# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: fr14_ui.spec.js >> Kiểm thử Giao diện Web Admin FR-14 — Quản lý Danh mục (Category CRUD) >> EP-TC30: Nhãn của trường Tên danh mục bắt buộc phải có ký hiệu dấu *
- Location: tests\ui-fr14\fr14_ui.spec.js:191:3

# Error details

```
Error: Trường bắt buộc Tên danh mục phải có nhãn kèm dấu sao (*) theo FR-22 dòng 252 (số thẻ <label> tìm thấy: 0, nội dung: [])

expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- generic [ref=f1e3]:
  - generic [ref=f1e4]:
    - heading "EShop Admin" [level=1] [ref=f1e5]
    - list [ref=f1e6]:
      - listitem [ref=f1e7] [cursor=pointer]: Dashboard
      - listitem [ref=f1e8] [cursor=pointer]: Danh mục
      - listitem [ref=f1e9] [cursor=pointer]: Sản phẩm
      - listitem [ref=f1e10] [cursor=pointer]: Mã Giảm Giá
      - listitem [ref=f1e11] [cursor=pointer]: Đơn hàng
      - listitem [ref=f1e12] [cursor=pointer]: Người dùng
      - listitem [ref=f1e13] [cursor=pointer]: Đăng xuất
  - generic [ref=f1e15]:
    - heading "Quản lý Danh mục" [level=2] [ref=f1e16]
    - generic [ref=f1e17]:
      - textbox "Tên danh mục mới" [ref=f1e18]
      - button "Thêm mới" [ref=f1e19] [cursor=pointer]
    - table [ref=f1e20]:
      - rowgroup [ref=f1e21]:
        - row [ref=f1e22]:
          - columnheader "ID" [ref=f1e23]
          - columnheader "Tên Danh Mục" [ref=f1e24]
          - columnheader "Hành động" [ref=f1e25]
      - rowgroup [ref=f1e26]:
        - row [ref=f1e27]:
          - cell "#25" [ref=f1e28]
          - cell "Điện thoại" [ref=f1e29]
          - cell [ref=f1e30]:
            - button "Xóa" [ref=f1e31] [cursor=pointer]
        - row [ref=f1e32]:
          - cell "#26" [ref=f1e33]
          - cell "Laptop" [ref=f1e34]
          - cell [ref=f1e35]:
            - button "Xóa" [ref=f1e36] [cursor=pointer]
        - row [ref=f1e37]:
          - cell "#27" [ref=f1e38]
          - cell "Phụ kiện" [ref=f1e39]
          - cell [ref=f1e40]:
            - button "Xóa" [ref=f1e41] [cursor=pointer]
```

# Test source

```ts
  114 |     const unauthHasLogin = await page.locator('input[type="password"]').count() > 0;
  115 | 
  116 |     // 2. Kiểm tra khi tài khoản người dùng thường (role = 'user': test@eshop.com) có token trong trình duyệt
  117 |     const userLoginRes = await request.post(`${BACKEND_URL}/api/login`, {
  118 |       data: USER_ACCOUNT,
  119 |     });
  120 |     const userLoginData = await userLoginRes.json();
  121 | 
  122 |     await page.evaluate(({ token, user }) => {
  123 |       localStorage.setItem('token', token);
  124 |       localStorage.setItem('adminToken', token);
  125 |       localStorage.setItem('user', JSON.stringify(user));
  126 |       localStorage.setItem('adminUser', JSON.stringify(user));
  127 |     }, { token: userLoginData.token, user: userLoginData.user });
  128 | 
  129 |     await page.reload();
  130 |     await page.waitForLoadState('networkidle');
  131 |     await openCategoriesTab(page);
  132 | 
  133 |     const screenshotPath = path.join(SCREENSHOT_DIR, `${RUN_NAME}_EP-TC28.png`);
  134 |     await page.screenshot({ path: screenshotPath, fullPage: true });
  135 | 
  136 |     const userRoleCanSeeAdminCategoryUI = await page.locator('input[placeholder*="Tên danh mục" i], button:has-text("Thêm mới"), button:has-text("Xóa")').count() > 0;
  137 | 
  138 |     expect.soft(
  139 |       !unauthHasCategoryForm && unauthHasLogin,
  140 |       'Khi chưa đăng nhập phải hiển thị màn hình Đăng nhập Admin và không lộ giao diện Quản lý Danh mục'
  141 |     ).toBe(true);
  142 | 
  143 |     expect.soft(
  144 |       !userRoleCanSeeAdminCategoryUI,
  145 |       'Tài khoản người dùng thường (role="user", test@eshop.com) khi truy cập Web Admin phải bị chặn hoàn toàn, không được phép mở và thao tác trên giao diện Quản lý Danh mục (FR-12, SEC-03)'
  146 |     ).toBe(true);
  147 |   });
  148 | 
  149 |   test('EP-TC29: Luồng Thêm và Xóa danh mục hợp lệ trên giao diện Web Admin', async ({ page, request }) => {
  150 |     await loginAdminAndOpenCategories(page, request);
  151 |     page.on('dialog', dialog => dialog.accept());
  152 | 
  153 |     const catInput = page.locator('input[placeholder*="Tên danh mục" i], input[type="text"]').first();
  154 |     const addBtn = page.locator('button:has-text("Thêm mới"), form button').first();
  155 | 
  156 |     await expect.soft(catInput, 'Phải có ô nhập Tên danh mục trên trang Quản lý Danh mục').toBeVisible();
  157 |     await expect.soft(addBtn, 'Phải có nút Thêm mới danh mục trên trang Quản lý Danh mục').toBeVisible();
  158 | 
  159 |     // Thêm danh mục mới NAME_NOM
  160 |     await catInput.fill(NAME_NOM);
  161 |     await addBtn.click();
  162 |     await page.waitForTimeout(600);
  163 | 
  164 |     const addedVisibleOnUi = await page.locator(`td:has-text("${NAME_NOM}")`).count() > 0;
  165 |     const catsAfterAddRes = await request.get(`${BACKEND_URL}/api/categories`);
  166 |     const catsAfterAdd = await catsAfterAddRes.json();
  167 |     const addedInDb = Array.isArray(catsAfterAdd) && catsAfterAdd.some(c => c.name === NAME_NOM);
  168 | 
  169 |     expect.soft(addedVisibleOnUi, `Sau khi bấm Thêm mới, danh mục "${NAME_NOM}" phải xuất hiện trên bảng UI`).toBe(true);
  170 |     expect.soft(addedInDb, `Sau khi bấm Thêm mới, danh mục "${NAME_NOM}" phải tồn tại trong GET /api/categories`).toBe(true);
  171 | 
  172 |     // Chụp ảnh minh chứng sau khi thêm thành công
  173 |     const screenshotPath = path.join(SCREENSHOT_DIR, `${RUN_NAME}_EP-TC29.png`);
  174 |     await page.screenshot({ path: screenshotPath, fullPage: true });
  175 | 
  176 |     // Xóa dòng danh mục vừa tạo
  177 |     const rowWithNewCat = page.locator('tr').filter({ hasText: NAME_NOM });
  178 |     const deleteBtnInRow = rowWithNewCat.locator('button:has-text("Xóa")').first();
  179 |     if (await deleteBtnInRow.count() > 0) {
  180 |       await deleteBtnInRow.click();
  181 |       await page.waitForTimeout(600);
  182 |     }
  183 | 
  184 |     const catsAfterDelRes = await request.get(`${BACKEND_URL}/api/categories`);
  185 |     const catsAfterDel = await catsAfterDelRes.json();
  186 |     const stillInDb = Array.isArray(catsAfterDel) && catsAfterDel.some(c => c.name === NAME_NOM);
  187 | 
  188 |     expect.soft(!stillInDb, `Sau khi bấm Xóa trên UI, danh mục "${NAME_NOM}" phải bị xóa khỏi CSDL`).toBe(true);
  189 |   });
  190 | 
  191 |   test('EP-TC30: Nhãn của trường Tên danh mục bắt buộc phải có ký hiệu dấu *', async ({ page, request }) => {
  192 |     await loginAdminAndOpenCategories(page, request);
  193 | 
  194 |     const screenshotPath = path.join(SCREENSHOT_DIR, `${RUN_NAME}_EP-TC30.png`);
  195 |     await page.screenshot({ path: screenshotPath, fullPage: true });
  196 | 
  197 |     // Kiểm tra nhãn <label> hoặc văn bản quanh ô nhập có dấu * theo FR-22 (dòng 252)
  198 |     const labels = page.locator('label');
  199 |     const labelCount = await labels.count();
  200 |     let hasLabelWithAsterisk = false;
  201 |     const labelTexts = [];
  202 | 
  203 |     for (let i = 0; i < labelCount; i++) {
  204 |       const txt = (await labels.nth(i).innerText()).trim();
  205 |       labelTexts.push(txt);
  206 |       if (txt.includes('*')) {
  207 |         hasLabelWithAsterisk = true;
  208 |       }
  209 |     }
  210 | 
  211 |     expect.soft(
  212 |       hasLabelWithAsterisk,
  213 |       `Trường bắt buộc Tên danh mục phải có nhãn kèm dấu sao (*) theo FR-22 dòng 252 (số thẻ <label> tìm thấy: ${labelCount}, nội dung: ${JSON.stringify(labelTexts)})`
> 214 |     ).toBe(true);
      |       ^ Error: Trường bắt buộc Tên danh mục phải có nhãn kèm dấu sao (*) theo FR-22 dòng 252 (số thẻ <label> tìm thấy: 0, nội dung: [])
  215 |   });
  216 | 
  217 |   test('EP-TC31: Để trống ô Tên danh mục trên UI rồi bấm Thêm phải bị chặn và không tạo bản ghi rỗng', async ({ page, request }) => {
  218 |     await loginAdminAndOpenCategories(page, request);
  219 | 
  220 |     const beforeRes = await request.get(`${BACKEND_URL}/api/categories`);
  221 |     const beforeCats = await beforeRes.json();
  222 | 
  223 |     const catInput = page.locator('input[placeholder*="Tên danh mục" i], input[type="text"]').first();
  224 |     const addBtn = page.locator('button:has-text("Thêm mới"), form button').first();
  225 | 
  226 |     await catInput.fill('');
  227 |     await addBtn.click();
  228 |     await page.waitForTimeout(600);
  229 | 
  230 |     const screenshotPath = path.join(SCREENSHOT_DIR, `${RUN_NAME}_EP-TC31.png`);
  231 |     await page.screenshot({ path: screenshotPath, fullPage: true });
  232 | 
  233 |     const afterRes = await request.get(`${BACKEND_URL}/api/categories`);
  234 |     const afterCats = await afterRes.json();
  235 | 
  236 |     const createdEmpty = Array.isArray(afterCats) && afterCats.length > beforeCats.length;
  237 | 
  238 |     expect.soft(
  239 |       !createdEmpty,
  240 |       `Để trống ô Tên danh mục rồi bấm Thêm mới tuyệt đối không được tạo danh mục rỗng (trước: ${beforeCats.length} bản ghi, sau: ${afterCats.length} bản ghi)`
  241 |     ).toBe(true);
  242 | 
  243 |     await resetCategoriesViaApi(request);
  244 |   });
  245 | 
  246 |   test('EP-TC32: Thông báo lỗi khi nhập không hợp lệ phải hiển thị phía TRÊN nút Submit', async ({ page, request }) => {
  247 |     await loginAdminAndOpenCategories(page, request);
  248 | 
  249 |     const catInput = page.locator('input[placeholder*="Tên danh mục" i], input[type="text"]').first();
  250 |     const addBtn = page.locator('button:has-text("Thêm mới"), form button').first();
  251 | 
  252 |     await catInput.fill('');
  253 |     await addBtn.click();
  254 |     await page.waitForTimeout(500);
  255 | 
  256 |     const screenshotPath = path.join(SCREENSHOT_DIR, `${RUN_NAME}_EP-TC32.png`);
  257 |     await page.screenshot({ path: screenshotPath, fullPage: true });
  258 | 
  259 |     const errorAlert = page.locator('.error, .text-red-500, .text-red-600, [role="alert"], p:has-text("lỗi"), p:has-text("không được để trống")');
  260 |     const errorCount = await errorAlert.count();
  261 | 
  262 |     expect.soft(
  263 |       errorCount > 0,
  264 |       'Khi bấm Thêm mới với ô Tên danh mục để trống, giao diện phải hiển thị thông báo lỗi phía trên nút Submit theo FR-22 (thực tế không có thông báo lỗi nào trên form)'
  265 |     ).toBe(true);
  266 | 
  267 |     if (errorCount > 0) {
  268 |       const errBox = await errorAlert.first().boundingBox();
  269 |       const btnBox = await addBtn.boundingBox();
  270 |       if (errBox && btnBox) {
  271 |         expect.soft(
  272 |           errBox.y + errBox.height <= btnBox.y + 10,
  273 |           `Thông báo lỗi (bottom=${errBox.y + errBox.height}) phải nằm phía trên nút Submit (top=${btnBox.y}) theo FR-22 dòng 255`
  274 |         ).toBe(true);
  275 |       }
  276 |     }
  277 | 
  278 |     await resetCategoriesViaApi(request);
  279 |   });
  280 | 
  281 |   test('EP-TC33: Nút Thêm dùng màu xanh dương và nút Xóa dùng màu đỏ theo chuẩn FR-21', async ({ page, request }) => {
  282 |     await loginAdminAndOpenCategories(page, request);
  283 | 
  284 |     const screenshotPath = path.join(SCREENSHOT_DIR, `${RUN_NAME}_EP-TC33.png`);
  285 |     await page.screenshot({ path: screenshotPath, fullPage: true });
  286 | 
  287 |     const addBtn = page.locator('button:has-text("Thêm mới"), form button').first();
  288 |     const delBtn = page.locator('table button:has-text("Xóa")').first();
  289 | 
  290 |     await expect.soft(addBtn, 'Phải tìm thấy nút Thêm mới').toBeVisible();
  291 |     await expect.soft(delBtn, 'Phải tìm thấy nút Xóa').toBeVisible();
  292 | 
  293 |     if (await addBtn.count() > 0) {
  294 |       const addBg = await addBtn.evaluate(el => window.getComputedStyle(el).backgroundColor);
  295 |       const mAdd = addBg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  296 |       const isBlue = mAdd ? Number(mAdd[3]) > Number(mAdd[1]) && Number(mAdd[3]) > Number(mAdd[2]) : false;
  297 |       expect.soft(
  298 |         isBlue,
  299 |         `Nút hành động tích cực (Thêm mới) phải có màu nền xanh dương theo FR-21 dòng 245 (màu thực tế: ${addBg})`
  300 |       ).toBe(true);
  301 |     }
  302 | 
  303 |     if (await delBtn.count() > 0) {
  304 |       const delBg = await delBtn.evaluate(el => window.getComputedStyle(el).backgroundColor);
  305 |       const mDel = delBg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  306 |       const isRed = mDel ? Number(mDel[1]) > Number(mDel[2]) && Number(mDel[1]) > Number(mDel[3]) : false;
  307 |       expect.soft(
  308 |         isRed,
  309 |         `Nút hành động nguy hiểm (Xóa) phải có màu nền đỏ theo FR-21 dòng 245 (màu thực tế: ${delBg})`
  310 |       ).toBe(true);
  311 |     }
  312 |   });
  313 | 
  314 |   test('EP-TC34: Trang có đúng 1 thẻ <h1>, ngôn ngữ tiếng Việt nhất quán, highlight mục Danh mục và nút "Đăng xuất"', async ({ page, request }) => {
```