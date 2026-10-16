# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: fr14_ui.spec.js >> Kiểm thử Giao diện Web Admin FR-14 — Quản lý Danh mục (Category CRUD) >> EP-TC28: Người dùng chưa đăng nhập hoặc có role=user bị chặn truy cập Quản lý Danh mục trên Web Admin
- Location: tests\ui-fr14\fr14_ui.spec.js:101:3

# Error details

```
Error: Tài khoản người dùng thường (role="user", test@eshop.com) khi truy cập Web Admin phải bị chặn hoàn toàn, không được phép mở và thao tác trên giao diện Quản lý Danh mục (FR-12, SEC-03)

expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- generic [ref=f2e3]:
  - generic [ref=f2e4]:
    - heading "EShop Admin" [level=1] [ref=f2e5]
    - list [ref=f2e6]:
      - listitem [ref=f2e7] [cursor=pointer]: Dashboard
      - listitem [ref=f2e8] [cursor=pointer]: Danh mục
      - listitem [ref=f2e9] [cursor=pointer]: Sản phẩm
      - listitem [ref=f2e10] [cursor=pointer]: Mã Giảm Giá
      - listitem [ref=f2e11] [cursor=pointer]: Đơn hàng
      - listitem [ref=f2e12] [cursor=pointer]: Người dùng
      - listitem [ref=f2e13] [cursor=pointer]: Đăng xuất
  - generic [ref=f2e15]:
    - heading "Quản lý Danh mục" [level=2] [ref=f2e16]
    - generic [ref=f2e17]:
      - textbox "Tên danh mục mới" [ref=f2e18]
      - button "Thêm mới" [ref=f2e19] [cursor=pointer]
    - table [ref=f2e20]:
      - rowgroup [ref=f2e21]:
        - row [ref=f2e22]:
          - columnheader "ID" [ref=f2e23]
          - columnheader "Tên Danh Mục" [ref=f2e24]
          - columnheader "Hành động" [ref=f2e25]
      - rowgroup [ref=f2e26]:
        - row [ref=f2e27]:
          - cell "#18" [ref=f2e28]
          - cell "Điện thoại" [ref=f2e29]
          - cell [ref=f2e30]:
            - button "Xóa" [ref=f2e31] [cursor=pointer]
        - row [ref=f2e32]:
          - cell "#19" [ref=f2e33]
          - cell "Laptop" [ref=f2e34]
          - cell [ref=f2e35]:
            - button "Xóa" [ref=f2e36] [cursor=pointer]
        - row [ref=f2e37]:
          - cell "#20" [ref=f2e38]
          - cell "Phụ kiện" [ref=f2e39]
          - cell [ref=f2e40]:
            - button "Xóa" [ref=f2e41] [cursor=pointer]
```

# Test source

```ts
  46  |     }
  47  |   }
  48  | 
  49  |   // Đảm bảo có đủ 3 danh mục chuẩn nếu vừa chạy ca OB-TC01 xóa sạch
  50  |   const afterDelRes = await request.get(`${BACKEND_URL}/api/categories`);
  51  |   const afterDelCats = await afterDelRes.json();
  52  |   if (Array.isArray(afterDelCats) && afterDelCats.length === 0) {
  53  |     for (const name of seedNames) {
  54  |       await request.post(`${BACKEND_URL}/api/categories`, {
  55  |         headers,
  56  |         data: { name },
  57  |       });
  58  |     }
  59  |   }
  60  |   return token;
  61  | }
  62  | 
  63  | /**
  64  |  * Mở tab Quản lý Danh mục trên thanh điều hướng bên trái của Web Admin
  65  |  */
  66  | async function openCategoriesTab(page) {
  67  |   const navCategory = page.locator('li:has-text("Danh mục"), a:has-text("Danh mục"), button:has-text("Danh mục")').first();
  68  |   if (await navCategory.count() > 0) {
  69  |     await navCategory.click();
  70  |     await page.waitForTimeout(300);
  71  |   }
  72  | }
  73  | 
  74  | /**
  75  |  * Đăng nhập Admin và điều hướng vào màn hình Quản lý Danh mục trên Web Admin
  76  |  */
  77  | async function loginAdminAndOpenCategories(page, request) {
  78  |   const token = await resetCategoriesViaApi(request);
  79  |   const loginRes = await request.post(`${BACKEND_URL}/api/login`, {
  80  |     data: ADMIN_ACCOUNT,
  81  |   });
  82  |   const loginData = await loginRes.json();
  83  | 
  84  |   await page.goto('/');
  85  |   await page.evaluate(({ token, user }) => {
  86  |     localStorage.setItem('token', token);
  87  |     localStorage.setItem('adminToken', token);
  88  |     localStorage.setItem('user', JSON.stringify(user));
  89  |     localStorage.setItem('adminUser', JSON.stringify(user));
  90  |   }, { token: loginData.token, user: loginData.user });
  91  | 
  92  |   await page.reload();
  93  |   await page.waitForLoadState('networkidle');
  94  |   await openCategoriesTab(page);
  95  | 
  96  |   return token;
  97  | }
  98  | 
  99  | test.describe('Kiểm thử Giao diện Web Admin FR-14 — Quản lý Danh mục (Category CRUD)', () => {
  100 | 
  101 |   test('EP-TC28: Người dùng chưa đăng nhập hoặc có role=user bị chặn truy cập Quản lý Danh mục trên Web Admin', async ({ page, request }) => {
  102 |     await resetCategoriesViaApi(request);
  103 | 
  104 |     // 1. Kiểm tra khi chưa đăng nhập (xóa sạch localStorage)
  105 |     await page.goto('/');
  106 |     await page.evaluate(() => {
  107 |       localStorage.clear();
  108 |       sessionStorage.clear();
  109 |     });
  110 |     await page.reload();
  111 |     await page.waitForLoadState('networkidle');
  112 | 
  113 |     const unauthHasCategoryForm = await page.locator('input[placeholder*="Tên danh mục" i], button:has-text("Thêm mới")').count() > 0;
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
> 146 |     ).toBe(true);
      |       ^ Error: Tài khoản người dùng thường (role="user", test@eshop.com) khi truy cập Web Admin phải bị chặn hoàn toàn, không được phép mở và thao tác trên giao diện Quản lý Danh mục (FR-12, SEC-03)
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
  214 |     ).toBe(true);
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
```