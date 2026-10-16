# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: fr14_ui.spec.js >> Kiểm thử Giao diện Web Admin FR-14 — Quản lý Danh mục (Category CRUD) >> EP-TC34: Trang có đúng 1 thẻ <h1>, ngôn ngữ tiếng Việt nhất quán, highlight mục Danh mục và nút "Đăng xuất"
- Location: tests\ui-fr14\fr14_ui.spec.js:314:3

# Error details

```
Error: Giao diện phải hiển thị hoàn toàn bằng tiếng Việt, không lẫn tiếng Anh theo FR-21 dòng 244 (phát hiện mục tiếng Anh trên thanh điều hướng: ["Dashboard","Danh mục","Sản phẩm","Mã Giảm Giá","Đơn hàng","Người dùng","Đăng xuất"])

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
          - cell "#1" [ref=f1e28]
          - cell "Điện thoại" [ref=f1e29]
          - cell [ref=f1e30]:
            - button "Xóa" [ref=f1e31] [cursor=pointer]
        - row [ref=f1e32]:
          - cell "#2" [ref=f1e33]
          - cell "Laptop" [ref=f1e34]
          - cell [ref=f1e35]:
            - button "Xóa" [ref=f1e36] [cursor=pointer]
        - row [ref=f1e37]:
          - cell "#3" [ref=f1e38]
          - cell "Phụ kiện" [ref=f1e39]
          - cell [ref=f1e40]:
            - button "Xóa" [ref=f1e41] [cursor=pointer]
```

# Test source

```ts
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
  315 |     await loginAdminAndOpenCategories(page, request);
  316 | 
  317 |     const screenshotPath = path.join(SCREENSHOT_DIR, `${RUN_NAME}_EP-TC34.png`);
  318 |     await page.screenshot({ path: screenshotPath, fullPage: true });
  319 | 
  320 |     // 1. Đếm số lượng thẻ <h1> (FR-21 dòng 247)
  321 |     const h1Count = await page.locator('h1').count();
  322 |     const h1Texts = await page.locator('h1').allInnerTexts();
  323 |     expect.soft(
  324 |       h1Count === 1,
  325 |       `Mỗi trang chỉ được có đúng 1 thẻ <h1> duy nhất theo FR-21 dòng 247 (thực tế: ${h1Count} thẻ <h1>: ${JSON.stringify(h1Texts)})`
  326 |     ).toBe(true);
  327 | 
  328 |     // 2. Kiểm tra nhãn nút "Đăng xuất" (FR-23 dòng 262)
  329 |     const exactLogoutItem = await page.locator('li:has-text("Đăng xuất"), button:has-text("Đăng xuất"), a:has-text("Đăng xuất")').count();
  330 |     const wrongLogoutItem = await page.locator('li:has-text("Thoát"), button:has-text("Thoát"), li:has-text("Logout"), button:has-text("Logout")').count();
  331 |     expect.soft(
  332 |       exactLogoutItem > 0 && wrongLogoutItem === 0,
  333 |       `Mục đăng xuất phải ghi chính xác "Đăng xuất" theo FR-23 dòng 262`
  334 |     ).toBe(true);
  335 | 
  336 |     // 3. Kiểm tra highlight mục Danh mục đang active trên thanh điều hướng (FR-23 dòng 260)
  337 |     const navCat = page.locator('li:has-text("Danh mục")').first();
  338 |     const navOther = page.locator('li:has-text("Sản phẩm")').first();
  339 |     if (await navCat.count() > 0 && await navOther.count() > 0) {
  340 |       const catColor = await navCat.evaluate(el => window.getComputedStyle(el).color);
  341 |       const otherColor = await navOther.evaluate(el => window.getComputedStyle(el).color);
  342 |       expect.soft(
  343 |         catColor !== otherColor,
  344 |         `Mục điều hướng "Danh mục" đang chọn phải được highlight khác màu với mục không chọn theo FR-23 dòng 260`
  345 |       ).toBe(true);
  346 |     }
  347 | 
  348 |     // 4. Kiểm tra ngôn ngữ hiển thị nhất quán hoàn toàn bằng tiếng Việt, không lẫn tiếng Anh (FR-21 dòng 244)
  349 |     const sidebarItems = await page.locator('ul li').allInnerTexts();
  350 |     const hasEnglishMenu = sidebarItems.some(t => /\b(Dashboard|Categories|Products|Orders|Users|Logout)\b/i.test(t));
  351 |     expect.soft(
  352 |       !hasEnglishMenu,
  353 |       `Giao diện phải hiển thị hoàn toàn bằng tiếng Việt, không lẫn tiếng Anh theo FR-21 dòng 244 (phát hiện mục tiếng Anh trên thanh điều hướng: ${JSON.stringify(sidebarItems)})`
> 354 |     ).toBe(true);
      |       ^ Error: Giao diện phải hiển thị hoàn toàn bằng tiếng Việt, không lẫn tiếng Anh theo FR-21 dòng 244 (phát hiện mục tiếng Anh trên thanh điều hướng: ["Dashboard","Danh mục","Sản phẩm","Mã Giảm Giá","Đơn hàng","Người dùng","Đăng xuất"])
  355 |   });
  356 | 
  357 |   test('EP-TC18 (UI): Chuỗi XSS <img src=x onerror=alert(1)> hiển thị dạng văn bản thuần, không thực thi script (SEC-04)', async ({ page, request }) => {
  358 |     const token = await loginAdminAndOpenCategories(page, request);
  359 |     const xssPayload = '<img src=x onerror=alert(1)>';
  360 | 
  361 |     let alertTriggered = false;
  362 |     page.on('dialog', async dialog => {
  363 |       if (dialog.type() === 'alert') {
  364 |         alertTriggered = true;
  365 |       }
  366 |       await dialog.dismiss();
  367 |     });
  368 | 
  369 |     await request.post(`${BACKEND_URL}/api/categories`, {
  370 |       headers: { Authorization: `Bearer ${token}` },
  371 |       data: { name: xssPayload },
  372 |     });
  373 | 
  374 |     await page.reload();
  375 |     await page.waitForLoadState('networkidle');
  376 |     await openCategoriesTab(page);
  377 | 
  378 |     const screenshotPath = path.join(SCREENSHOT_DIR, `${RUN_NAME}_EP-TC18.png`);
  379 |     await page.screenshot({ path: screenshotPath, fullPage: true });
  380 | 
  381 |     const injectedImgCount = await page.locator('img[onerror]').count();
  382 |     const escapedTextVisible = await page.locator(`td:has-text("${xssPayload}")`).count() > 0;
  383 | 
  384 |     expect.soft(!alertTriggered, 'Không được thực thi hàm alert(1) từ chuỗi tên danh mục (SEC-04)').toBe(true);
  385 |     expect.soft(injectedImgCount === 0, 'Không được render thẻ <img onerror=...> thực sự vào DOM').toBe(true);
  386 |     expect.soft(escapedTextVisible, 'Chuỗi XSS phải được hiển thị nguyên văn dưới dạng văn bản thuần').toBe(true);
  387 | 
  388 |     await resetCategoriesViaApi(request);
  389 |   });
  390 | 
  391 |   test('OB-TC01 (UI): Khi xóa hết danh mục (0 bản ghi), giao diện hiển thị Empty State có icon/hình minh họa (FR-24)', async ({ page, request }) => {
  392 |     const token = await loginAdminAndOpenCategories(page, request);
  393 |     const headers = { Authorization: `Bearer ${token}` };
  394 | 
  395 |     // Xóa toàn bộ danh mục hiện có qua API để đưa về biên đầu ra 0 danh mục
  396 |     const catRes = await request.get(`${BACKEND_URL}/api/categories`);
  397 |     const cats = await catRes.json();
  398 |     for (const c of cats) {
  399 |       await request.delete(`${BACKEND_URL}/api/categories/${c.id}`, { headers });
  400 |     }
  401 | 
  402 |     await page.reload();
  403 |     await page.waitForLoadState('networkidle');
  404 |     await openCategoriesTab(page);
  405 | 
  406 |     const screenshotPath = path.join(SCREENSHOT_DIR, `${RUN_NAME}_OB-TC01.png`);
  407 |     await page.screenshot({ path: screenshotPath, fullPage: true });
  408 | 
  409 |     // Kiểm tra Empty State theo FR-24 (dòng 269): phải có thông báo thân thiện và icon/hình minh họa khi danh sách trống
  410 |     const emptyStateMsg = await page.locator('text=/trống|chưa có danh mục|không có danh mục|empty/i').count();
  411 |     const emptyStateIcon = await page.locator('svg, img, .empty-icon').count();
  412 | 
  413 |     expect.soft(
  414 |       emptyStateMsg > 0 && emptyStateIcon > 0,
  415 |       `Khi danh sách danh mục trống (0 bản ghi), giao diện phải hiển thị trạng thái trống (Empty State) kèm icon/hình minh họa và thông báo thân thiện theo FR-24 dòng 269 (thông báo tìm thấy: ${emptyStateMsg}, icon/hình: ${emptyStateIcon})`
  416 |     ).toBe(true);
  417 | 
  418 |     // Khôi phục lại danh mục chuẩn sau khi kiểm thử
  419 |     await resetCategoriesViaApi(request);
  420 |   });
  421 | 
  422 |   test('SR-TC02 (UI): Hiển thị đúng chuỗi danh mục tiếng Việt có dấu, ký tự đặc biệt (&, -, ()) và Emoji trên Web Admin', async ({ page, request }) => {
  423 |     const token = await loginAdminAndOpenCategories(page, request);
  424 |     const unicodeName = 'Ẩm thực & Đồ uống 🍜 - Tươi sống (100%)';
  425 | 
  426 |     await request.post(`${BACKEND_URL}/api/categories`, {
  427 |       headers: { Authorization: `Bearer ${token}` },
  428 |       data: { name: unicodeName },
  429 |     });
  430 | 
  431 |     await page.reload();
  432 |     await page.waitForLoadState('networkidle');
  433 |     await openCategoriesTab(page);
  434 | 
  435 |     const screenshotPath = path.join(SCREENSHOT_DIR, `${RUN_NAME}_SR-TC02.png`);
  436 |     await page.screenshot({ path: screenshotPath, fullPage: true });
  437 | 
  438 |     const visibleUnicode = await page.locator(`td:has-text("${unicodeName}")`).count() > 0;
  439 |     expect.soft(visibleUnicode, `Giao diện Web Admin phải hiển thị nguyên vẹn chuỗi Unicode/Emoji "${unicodeName}"`).toBe(true);
  440 | 
  441 |     await resetCategoriesViaApi(request);
  442 |   });
  443 | 
  444 | });
  445 | 
```