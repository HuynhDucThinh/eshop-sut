# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: fr14_ui.spec.js >> Kiểm thử Giao diện Web Admin FR-14 — Quản lý Danh mục (Category CRUD) >> EP-TC34: Trang có đúng 1 thẻ <h1>, ngôn ngữ tiếng Việt nhất quán, highlight mục Danh mục và nút "Đăng xuất"
- Location: fr14_ui.spec.js:338:3

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
          - cell "#24" [ref=f1e28]
          - cell "Điện thoại" [ref=f1e29]
          - cell [ref=f1e30]:
            - button "Xóa" [ref=f1e31] [cursor=pointer]
        - row [ref=f1e32]:
          - cell "#25" [ref=f1e33]
          - cell "Laptop" [ref=f1e34]
          - cell [ref=f1e35]:
            - button "Xóa" [ref=f1e36] [cursor=pointer]
        - row [ref=f1e37]:
          - cell "#26" [ref=f1e38]
          - cell "Phụ kiện" [ref=f1e39]
          - cell [ref=f1e40]:
            - button "Xóa" [ref=f1e41] [cursor=pointer]
```

# Test source

```ts
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
  335 |     }
  336 |   });
  337 | 
  338 |   test('EP-TC34: Trang có đúng 1 thẻ <h1>, ngôn ngữ tiếng Việt nhất quán, highlight mục Danh mục và nút "Đăng xuất"', async ({ page, request }) => {
  339 |     await loginAdminAndOpenCategories(page, request);
  340 | 
  341 |     const logoutItem = page.locator('li:has-text("Đăng xuất"), button:has-text("Đăng xuất")').first();
  342 |     if (await logoutItem.count() > 0) {
  343 |       await logoutItem.hover();
  344 |     }
  345 | 
  346 |     const screenshotPath = path.join(SCREENSHOT_DIR, `${RUN_NAME}_EP-TC34.png`);
  347 |     await page.screenshot({ path: screenshotPath, fullPage: true });
  348 | 
  349 |     // 1. Đếm số lượng thẻ <h1> (FR-21 dòng 247)
  350 |     const h1Count = await page.locator('h1').count();
  351 |     const h1Texts = await page.locator('h1').allInnerTexts();
  352 |     expect.soft(
  353 |       h1Count === 1,
  354 |       `Mỗi trang chỉ được có đúng 1 thẻ <h1> duy nhất theo FR-21 dòng 247 (thực tế: ${h1Count} thẻ <h1>: ${JSON.stringify(h1Texts)})`
  355 |     ).toBe(true);
  356 | 
  357 |     // 2. Kiểm tra nhãn nút "Đăng xuất" (FR-23 dòng 262)
  358 |     const exactLogoutItem = await page.locator('li:has-text("Đăng xuất"), button:has-text("Đăng xuất"), a:has-text("Đăng xuất")').count();
  359 |     const wrongLogoutItem = await page.locator('li:has-text("Thoát"), button:has-text("Thoát"), li:has-text("Logout"), button:has-text("Logout")').count();
  360 |     expect.soft(
  361 |       exactLogoutItem > 0 && wrongLogoutItem === 0,
  362 |       `Mục đăng xuất phải ghi chính xác "Đăng xuất" theo FR-23 dòng 262`
  363 |     ).toBe(true);
  364 | 
  365 |     // 3. Kiểm tra highlight mục Danh mục đang active trên thanh điều hướng (FR-23 dòng 260)
  366 |     const navCat = page.locator('li:has-text("Danh mục")').first();
  367 |     const navOther = page.locator('li:has-text("Sản phẩm")').first();
  368 |     if (await navCat.count() > 0 && await navOther.count() > 0) {
  369 |       const catColor = await navCat.evaluate(el => window.getComputedStyle(el).color);
  370 |       const otherColor = await navOther.evaluate(el => window.getComputedStyle(el).color);
  371 |       expect.soft(
  372 |         catColor !== otherColor,
  373 |         `Mục điều hướng "Danh mục" đang chọn phải được highlight khác màu với mục không chọn theo FR-23 dòng 260`
  374 |       ).toBe(true);
  375 |     }
  376 | 
  377 |     // 4. Kiểm tra ngôn ngữ hiển thị nhất quán hoàn toàn bằng tiếng Việt, không lẫn tiếng Anh (FR-21 dòng 244)
  378 |     const sidebarItems = await page.locator('ul li').allInnerTexts();
  379 |     const hasEnglishMenu = sidebarItems.some(t => /\b(Dashboard|Categories|Products|Orders|Users|Logout)\b/i.test(t));
  380 |     expect.soft(
  381 |       !hasEnglishMenu,
  382 |       `Giao diện phải hiển thị hoàn toàn bằng tiếng Việt, không lẫn tiếng Anh theo FR-21 dòng 244 (phát hiện mục tiếng Anh trên thanh điều hướng: ${JSON.stringify(sidebarItems)})`
> 383 |     ).toBe(true);
      |       ^ Error: Giao diện phải hiển thị hoàn toàn bằng tiếng Việt, không lẫn tiếng Anh theo FR-21 dòng 244 (phát hiện mục tiếng Anh trên thanh điều hướng: ["Dashboard","Danh mục","Sản phẩm","Mã Giảm Giá","Đơn hàng","Người dùng","Đăng xuất"])
  384 |   });
  385 | 
  386 |   test('EP-TC18 (UI): Chuỗi XSS <img src=x onerror=alert(1)> hiển thị dạng văn bản thuần, không thực thi script (SEC-04)', async ({ page, request }) => {
  387 |     const token = await loginAdminAndOpenCategories(page, request);
  388 |     const xssPayload = '<img src=x onerror=alert(1)>';
  389 | 
  390 |     let alertTriggered = false;
  391 |     page.on('dialog', async dialog => {
  392 |       if (dialog.type() === 'alert') {
  393 |         alertTriggered = true;
  394 |       }
  395 |       await dialog.dismiss();
  396 |     });
  397 | 
  398 |     await request.post(`${BACKEND_URL}/api/categories`, {
  399 |       headers: { Authorization: `Bearer ${token}` },
  400 |       data: { name: xssPayload },
  401 |     });
  402 | 
  403 |     await page.reload();
  404 |     await page.waitForLoadState('networkidle');
  405 |     await openCategoriesTab(page);
  406 | 
  407 |     const screenshotPath = path.join(SCREENSHOT_DIR, `${RUN_NAME}_EP-TC18.png`);
  408 |     await page.screenshot({ path: screenshotPath, fullPage: true });
  409 | 
  410 |     const injectedImgCount = await page.locator('img[onerror]').count();
  411 |     const escapedTextVisible = await page.locator(`td:has-text("${xssPayload}")`).count() > 0;
  412 | 
  413 |     expect.soft(!alertTriggered, 'Không được thực thi hàm alert(1) từ chuỗi tên danh mục (SEC-04)').toBe(true);
  414 |     expect.soft(injectedImgCount === 0, 'Không được render thẻ <img onerror=...> thực sự vào DOM').toBe(true);
  415 |     expect.soft(escapedTextVisible, 'Chuỗi XSS phải được hiển thị nguyên văn dưới dạng văn bản thuần').toBe(true);
  416 | 
  417 |     await resetCategoriesViaApi(request);
  418 |   });
  419 | 
  420 |   test('OB-TC01 (UI): Khi xóa hết danh mục (0 bản ghi), giao diện hiển thị Empty State có icon/hình minh họa (FR-24)', async ({ page, request }) => {
  421 |     const token = await loginAdminAndOpenCategories(page, request);
  422 |     const headers = { Authorization: `Bearer ${token}` };
  423 | 
  424 |     // Xóa toàn bộ danh mục hiện có qua API để đưa về biên đầu ra 0 danh mục
  425 |     const catRes = await request.get(`${BACKEND_URL}/api/categories`);
  426 |     const cats = await catRes.json();
  427 |     for (const c of cats) {
  428 |       await request.delete(`${BACKEND_URL}/api/categories/${c.id}`, { headers });
  429 |     }
  430 | 
  431 |     await page.reload();
  432 |     await page.waitForLoadState('networkidle');
  433 |     await openCategoriesTab(page);
  434 | 
  435 |     const screenshotPath = path.join(SCREENSHOT_DIR, `${RUN_NAME}_OB-TC01.png`);
  436 |     await page.screenshot({ path: screenshotPath, fullPage: true });
  437 | 
  438 |     // Lưu ảnh minh chứng bảng trống thiếu Empty State cho BUG-013.png
  439 |     await page.screenshot({ path: path.join(EVIDENCE_DIR, 'BUG-013.png'), fullPage: true });
  440 | 
  441 |     // Kiểm tra Empty State theo FR-24 (dòng 269): phải có thông báo thân thiện và icon/hình minh họa khi danh sách trống
  442 |     const emptyStateMsg = await page.locator('text=/trống|chưa có danh mục|không có danh mục|empty/i').count();
  443 |     const emptyStateIcon = await page.locator('svg, img, .empty-icon').count();
  444 | 
  445 |     expect.soft(
  446 |       emptyStateMsg > 0 && emptyStateIcon > 0,
  447 |       `Khi danh sách danh mục trống (0 bản ghi), giao diện phải hiển thị trạng thái trống (Empty State) kèm icon/hình minh họa và thông báo thân thiện theo FR-24 dòng 269 (thông báo tìm thấy: ${emptyStateMsg}, icon/hình: ${emptyStateIcon})`
  448 |     ).toBe(true);
  449 | 
  450 |     // Khôi phục lại danh mục chuẩn sau khi kiểm thử
  451 |     await resetCategoriesViaApi(request);
  452 |   });
  453 | 
  454 |   test('SR-TC02 (UI): Hiển thị đúng chuỗi danh mục tiếng Việt có dấu, ký tự đặc biệt (&, -, ()) và Emoji trên Web Admin', async ({ page, request }) => {
  455 |     const token = await loginAdminAndOpenCategories(page, request);
  456 |     const unicodeName = 'Ẩm thực & Đồ uống 🍜 - Tươi sống (100%)';
  457 | 
  458 |     await request.post(`${BACKEND_URL}/api/categories`, {
  459 |       headers: { Authorization: `Bearer ${token}` },
  460 |       data: { name: unicodeName },
  461 |     });
  462 | 
  463 |     await page.reload();
  464 |     await page.waitForLoadState('networkidle');
  465 |     await openCategoriesTab(page);
  466 | 
  467 |     const screenshotPath = path.join(SCREENSHOT_DIR, `${RUN_NAME}_SR-TC02.png`);
  468 |     await page.screenshot({ path: screenshotPath, fullPage: true });
  469 | 
  470 |     const visibleUnicode = await page.locator(`td:has-text("${unicodeName}")`).count() > 0;
  471 |     expect.soft(visibleUnicode, `Giao diện Web Admin phải hiển thị nguyên vẹn chuỗi Unicode/Emoji "${unicodeName}"`).toBe(true);
  472 | 
  473 |     await resetCategoriesViaApi(request);
  474 |   });
  475 | 
  476 | });
  477 | 
```