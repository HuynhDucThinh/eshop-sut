# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: fr14_ui.spec.js >> Kiểm thử Giao diện Web Admin FR-14 — Quản lý Danh mục (Category CRUD) >> EP-TC30: Nhãn của trường Tên danh mục bắt buộc phải có ký hiệu dấu *
- Location: fr14_ui.spec.js:200:3

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
      - textbox "Tên danh mục mới" [active] [ref=f1e18]
      - button "Thêm mới" [ref=f1e19] [cursor=pointer]
    - table [ref=f1e20]:
      - rowgroup [ref=f1e21]:
        - row [ref=f1e22]:
          - columnheader "ID" [ref=f1e23]
          - columnheader "Tên Danh Mục" [ref=f1e24]
          - columnheader "Hành động" [ref=f1e25]
      - rowgroup [ref=f1e26]:
        - row [ref=f1e27]:
          - cell "#18" [ref=f1e28]
          - cell "Điện thoại" [ref=f1e29]
          - cell [ref=f1e30]:
            - button "Xóa" [ref=f1e31] [cursor=pointer]
        - row [ref=f1e32]:
          - cell "#19" [ref=f1e33]
          - cell "Laptop" [ref=f1e34]
          - cell [ref=f1e35]:
            - button "Xóa" [ref=f1e36] [cursor=pointer]
        - row [ref=f1e37]:
          - cell "#20" [ref=f1e38]
          - cell "Phụ kiện" [ref=f1e39]
          - cell [ref=f1e40]:
            - button "Xóa" [ref=f1e41] [cursor=pointer]
```

# Test source

```ts
  134 |     await page.evaluate(({ user }) => {
  135 |       const info = document.createElement('div');
  136 |       info.id = 'user-auth-badge';
  137 |       info.style.cssText = 'background:#1f2937; color:#f87171; border-bottom:2px solid #ef4444; padding:8px 16px; font-family:monospace; font-size:13px; font-weight:bold;';
  138 |       info.innerText = `[EP-TC28 UI Auth Test] Đăng nhập: ${user.email} | Vai trò: ${user.role} | Lỗi: Vẫn mở được màn hình Quản lý Danh mục Admin`;
  139 |       document.body.prepend(info);
  140 |     }, { user: userLoginData.user });
  141 | 
  142 |     const screenshotPath = path.join(SCREENSHOT_DIR, `${RUN_NAME}_EP-TC28.png`);
  143 |     await page.screenshot({ path: screenshotPath, fullPage: true });
  144 | 
  145 |     const userRoleCanSeeAdminCategoryUI = await page.locator('input[placeholder*="Tên danh mục" i], button:has-text("Thêm mới"), button:has-text("Xóa")').count() > 0;
  146 | 
  147 |     expect.soft(
  148 |       !unauthHasCategoryForm && unauthHasLogin,
  149 |       'Khi chưa đăng nhập phải hiển thị màn hình Đăng nhập Admin và không lộ giao diện Quản lý Danh mục'
  150 |     ).toBe(true);
  151 | 
  152 |     expect.soft(
  153 |       !userRoleCanSeeAdminCategoryUI,
  154 |       'Tài khoản người dùng thường (role="user", test@eshop.com) khi truy cập Web Admin phải bị chặn hoàn toàn, không được phép mở và thao tác trên giao diện Quản lý Danh mục (FR-12, SEC-03)'
  155 |     ).toBe(true);
  156 |   });
  157 | 
  158 |   test('EP-TC29: Luồng Thêm và Xóa danh mục hợp lệ trên giao diện Web Admin', async ({ page, request }) => {
  159 |     await loginAdminAndOpenCategories(page, request);
  160 |     page.on('dialog', dialog => dialog.accept());
  161 | 
  162 |     const catInput = page.locator('input[placeholder*="Tên danh mục" i], input[type="text"]').first();
  163 |     const addBtn = page.locator('button:has-text("Thêm mới"), form button').first();
  164 | 
  165 |     await expect.soft(catInput, 'Phải có ô nhập Tên danh mục trên trang Quản lý Danh mục').toBeVisible();
  166 |     await expect.soft(addBtn, 'Phải có nút Thêm mới danh mục trên trang Quản lý Danh mục').toBeVisible();
  167 | 
  168 |     // Thêm danh mục mới NAME_NOM
  169 |     await catInput.fill(NAME_NOM);
  170 |     await addBtn.click();
  171 |     await page.waitForTimeout(600);
  172 | 
  173 |     const addedVisibleOnUi = await page.locator(`td:has-text("${NAME_NOM}")`).count() > 0;
  174 |     const catsAfterAddRes = await request.get(`${BACKEND_URL}/api/categories`);
  175 |     const catsAfterAdd = await catsAfterAddRes.json();
  176 |     const addedInDb = Array.isArray(catsAfterAdd) && catsAfterAdd.some(c => c.name === NAME_NOM);
  177 | 
  178 |     expect.soft(addedVisibleOnUi, `Sau khi bấm Thêm mới, danh mục "${NAME_NOM}" phải xuất hiện trên bảng UI`).toBe(true);
  179 |     expect.soft(addedInDb, `Sau khi bấm Thêm mới, danh mục "${NAME_NOM}" phải tồn tại trong GET /api/categories`).toBe(true);
  180 | 
  181 |     // Chụp ảnh minh chứng sau khi thêm thành công
  182 |     const screenshotPath = path.join(SCREENSHOT_DIR, `${RUN_NAME}_EP-TC29.png`);
  183 |     await page.screenshot({ path: screenshotPath, fullPage: true });
  184 | 
  185 |     // Xóa dòng danh mục vừa tạo
  186 |     const rowWithNewCat = page.locator('tr').filter({ hasText: NAME_NOM });
  187 |     const deleteBtnInRow = rowWithNewCat.locator('button:has-text("Xóa")').first();
  188 |     if (await deleteBtnInRow.count() > 0) {
  189 |       await deleteBtnInRow.click();
  190 |       await page.waitForTimeout(600);
  191 |     }
  192 | 
  193 |     const catsAfterDelRes = await request.get(`${BACKEND_URL}/api/categories`);
  194 |     const catsAfterDel = await catsAfterDelRes.json();
  195 |     const stillInDb = Array.isArray(catsAfterDel) && catsAfterDel.some(c => c.name === NAME_NOM);
  196 | 
  197 |     expect.soft(!stillInDb, `Sau khi bấm Xóa trên UI, danh mục "${NAME_NOM}" phải bị xóa khỏi CSDL`).toBe(true);
  198 |   });
  199 | 
  200 |   test('EP-TC30: Nhãn của trường Tên danh mục bắt buộc phải có ký hiệu dấu *', async ({ page, request }) => {
  201 |     await loginAdminAndOpenCategories(page, request);
  202 | 
  203 |     const catInputForFocus = page.locator('input[placeholder*="Tên danh mục" i], input[type="text"]').first();
  204 |     if (await catInputForFocus.count() > 0) {
  205 |       await catInputForFocus.focus();
  206 |     }
  207 | 
  208 |     const screenshotPath = path.join(SCREENSHOT_DIR, `${RUN_NAME}_EP-TC30.png`);
  209 |     await page.screenshot({ path: screenshotPath, fullPage: true });
  210 | 
  211 |     // Lưu riêng ảnh vùng form cho BUG-013_form.png (không bị trùng với bất kỳ ảnh nào khác)
  212 |     const formLocator = page.locator('form').first();
  213 |     if (await formLocator.count() > 0) {
  214 |       await formLocator.screenshot({ path: path.join(EVIDENCE_DIR, 'BUG-013_form.png') });
  215 |     }
  216 | 
  217 |     // Kiểm tra nhãn <label> hoặc văn bản quanh ô nhập có dấu * theo FR-22 (dòng 252)
  218 |     const labels = page.locator('label');
  219 |     const labelCount = await labels.count();
  220 |     let hasLabelWithAsterisk = false;
  221 |     const labelTexts = [];
  222 | 
  223 |     for (let i = 0; i < labelCount; i++) {
  224 |       const txt = (await labels.nth(i).innerText()).trim();
  225 |       labelTexts.push(txt);
  226 |       if (txt.includes('*')) {
  227 |         hasLabelWithAsterisk = true;
  228 |       }
  229 |     }
  230 | 
  231 |     expect.soft(
  232 |       hasLabelWithAsterisk,
  233 |       `Trường bắt buộc Tên danh mục phải có nhãn kèm dấu sao (*) theo FR-22 dòng 252 (số thẻ <label> tìm thấy: ${labelCount}, nội dung: ${JSON.stringify(labelTexts)})`
> 234 |     ).toBe(true);
      |       ^ Error: Trường bắt buộc Tên danh mục phải có nhãn kèm dấu sao (*) theo FR-22 dòng 252 (số thẻ <label> tìm thấy: 0, nội dung: [])
  235 |   });
  236 | 
  237 |   test('EP-TC31: Để trống ô Tên danh mục trên UI rồi bấm Thêm phải bị chặn và không tạo bản ghi rỗng', async ({ page, request }) => {
  238 |     await loginAdminAndOpenCategories(page, request);
  239 | 
  240 |     const beforeRes = await request.get(`${BACKEND_URL}/api/categories`);
  241 |     const beforeCats = await beforeRes.json();
  242 | 
  243 |     const catInput = page.locator('input[placeholder*="Tên danh mục" i], input[type="text"]').first();
  244 |     const addBtn = page.locator('button:has-text("Thêm mới"), form button').first();
  245 | 
  246 |     await catInput.fill('');
  247 |     await addBtn.click();
  248 |     await page.waitForTimeout(600);
  249 | 
  250 |     const screenshotPath = path.join(SCREENSHOT_DIR, `${RUN_NAME}_EP-TC31.png`);
  251 |     await page.screenshot({ path: screenshotPath, fullPage: true });
  252 | 
  253 |     const afterRes = await request.get(`${BACKEND_URL}/api/categories`);
  254 |     const afterCats = await afterRes.json();
  255 | 
  256 |     const createdEmpty = Array.isArray(afterCats) && afterCats.length > beforeCats.length;
  257 | 
  258 |     expect.soft(
  259 |       !createdEmpty,
  260 |       `Để trống ô Tên danh mục rồi bấm Thêm mới tuyệt đối không được tạo danh mục rỗng (trước: ${beforeCats.length} bản ghi, sau: ${afterCats.length} bản ghi)`
  261 |     ).toBe(true);
  262 | 
  263 |     await resetCategoriesViaApi(request);
  264 |   });
  265 | 
  266 |   test('EP-TC32: Thông báo lỗi khi nhập không hợp lệ phải hiển thị phía TRÊN nút Submit', async ({ page, request }) => {
  267 |     await loginAdminAndOpenCategories(page, request);
  268 | 
  269 |     const catInput = page.locator('input[placeholder*="Tên danh mục" i], input[type="text"]').first();
  270 |     const addBtn = page.locator('button:has-text("Thêm mới"), form button').first();
  271 | 
  272 |     await catInput.fill('');
  273 |     await addBtn.click();
  274 |     await page.waitForTimeout(500);
  275 | 
  276 |     const screenshotPath = path.join(SCREENSHOT_DIR, `${RUN_NAME}_EP-TC32.png`);
  277 |     await page.screenshot({ path: screenshotPath, fullPage: true });
  278 | 
  279 |     const errorAlert = page.locator('.error, .text-red-500, .text-red-600, [role="alert"], p:has-text("lỗi"), p:has-text("không được để trống")');
  280 |     const errorCount = await errorAlert.count();
  281 | 
  282 |     expect.soft(
  283 |       errorCount > 0,
  284 |       'Khi bấm Thêm mới với ô Tên danh mục để trống, giao diện phải hiển thị thông báo lỗi phía trên nút Submit theo FR-22 (thực tế không có thông báo lỗi nào trên form)'
  285 |     ).toBe(true);
  286 | 
  287 |     if (errorCount > 0) {
  288 |       const errBox = await errorAlert.first().boundingBox();
  289 |       const btnBox = await addBtn.boundingBox();
  290 |       if (errBox && btnBox) {
  291 |         expect.soft(
  292 |           errBox.y + errBox.height <= btnBox.y + 10,
  293 |           `Thông báo lỗi (bottom=${errBox.y + errBox.height}) phải nằm phía trên nút Submit (top=${btnBox.y}) theo FR-22 dòng 255`
  294 |         ).toBe(true);
  295 |       }
  296 |     }
  297 | 
  298 |     await resetCategoriesViaApi(request);
  299 |   });
  300 | 
  301 |   test('EP-TC33: Nút Thêm dùng màu xanh dương và nút Xóa dùng màu đỏ theo chuẩn FR-21', async ({ page, request }) => {
  302 |     await loginAdminAndOpenCategories(page, request);
  303 | 
  304 |     const delBtn = page.locator('table button:has-text("Xóa")').first();
  305 |     if (await delBtn.count() > 0) {
  306 |       await delBtn.focus();
  307 |     }
  308 | 
  309 |     const screenshotPath = path.join(SCREENSHOT_DIR, `${RUN_NAME}_EP-TC33.png`);
  310 |     await page.screenshot({ path: screenshotPath, fullPage: true });
  311 | 
  312 |     const addBtn = page.locator('button:has-text("Thêm mới"), form button').first();
  313 | 
  314 |     await expect.soft(addBtn, 'Phải tìm thấy nút Thêm mới').toBeVisible();
  315 |     await expect.soft(delBtn, 'Phải tìm thấy nút Xóa').toBeVisible();
  316 | 
  317 |     if (await addBtn.count() > 0) {
  318 |       const addBg = await addBtn.evaluate(el => window.getComputedStyle(el).backgroundColor);
  319 |       const mAdd = addBg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  320 |       const isBlue = mAdd ? Number(mAdd[3]) > Number(mAdd[1]) && Number(mAdd[3]) > Number(mAdd[2]) : false;
  321 |       expect.soft(
  322 |         isBlue,
  323 |         `Nút hành động tích cực (Thêm mới) phải có màu nền xanh dương theo FR-21 dòng 245 (màu thực tế: ${addBg})`
  324 |       ).toBe(true);
  325 |     }
  326 | 
  327 |     if (await delBtn.count() > 0) {
  328 |       const delBg = await delBtn.evaluate(el => window.getComputedStyle(el).backgroundColor);
  329 |       const mDel = delBg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  330 |       const isRed = mDel ? Number(mDel[1]) > Number(mDel[2]) && Number(mDel[1]) > Number(mDel[3]) : false;
  331 |       expect.soft(
  332 |         isRed,
  333 |         `Nút hành động nguy hiểm (Xóa) phải có màu nền đỏ theo FR-21 dòng 245 (màu thực tế: ${delBg})`
  334 |       ).toBe(true);
```