/**
 * fr14_ui.spec.js — Kiểm thử giao diện Web Admin cho FR-14: Quản lý Danh mục (Category CRUD)
 *
 * Tuân thủ quy định hw02_test_executor & course rules:
 * - 100% tiếng Việt có dấu trong mô tả test, assertion message, console log.
 * - Phủ đủ 7 ca kiểm thử thuần UI (EP-TC28 đến EP-TC34) và phần giao diện của 3 ca kết hợp API+UI (EP-TC18, OB-TC01, SR-TC02).
 * - Expected tính toán độc lập từ tài liệu đặc tả README (FR-12, FR-14, FR-21, FR-22, FR-23, FR-24, SEC-03, SEC-04).
 * - Tự động chụp ảnh bằng chứng lưu vào reports/evidence/FR-14/screenshots/.
 */

const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const EVIDENCE_DIR = path.resolve(__dirname, '../../reports/evidence/FR-14');
const SCREENSHOT_DIR = path.join(EVIDENCE_DIR, 'screenshots');
const RUN_NAME = process.env.RUN_NAME || 'run_ui_1';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

const ADMIN_ACCOUNT = { email: 'admin@eshop.com', password: 'Admin123!' };
const USER_ACCOUNT = { email: 'test@eshop.com', password: 'Test1234!' };
const NAME_NOM = 'Thiết bị gia dụng thông minh';

/**
 * Khôi phục danh sách danh mục chuẩn qua API để đảm bảo tính độc lập giữa các ca UI
 */
async function resetCategoriesViaApi(request) {
  const loginRes = await request.post(`${BACKEND_URL}/api/login`, {
    data: ADMIN_ACCOUNT,
  });
  const { token } = await loginRes.json();
  const headers = { Authorization: `Bearer ${token}` };

  const catRes = await request.get(`${BACKEND_URL}/api/categories`);
  const currentCats = await catRes.json();
  const seedNames = ['Điện thoại', 'Laptop', 'Phụ kiện'];

  // Xóa toàn bộ các danh mục phát sinh hoặc rỗng ngoài 3 danh mục gốc
  if (Array.isArray(currentCats)) {
    for (const c of currentCats) {
      if (Number(c.id) > 3 || !seedNames.includes(c.name)) {
        await request.delete(`${BACKEND_URL}/api/categories/${c.id}`, { headers });
      }
    }
  }

  // Đảm bảo có đủ 3 danh mục chuẩn nếu vừa chạy ca OB-TC01 xóa sạch
  const afterDelRes = await request.get(`${BACKEND_URL}/api/categories`);
  const afterDelCats = await afterDelRes.json();
  if (Array.isArray(afterDelCats) && afterDelCats.length === 0) {
    for (const name of seedNames) {
      await request.post(`${BACKEND_URL}/api/categories`, {
        headers,
        data: { name },
      });
    }
  }
  return token;
}

/**
 * Mở tab Quản lý Danh mục trên thanh điều hướng bên trái của Web Admin
 */
async function openCategoriesTab(page) {
  const navCategory = page.locator('li:has-text("Danh mục"), a:has-text("Danh mục"), button:has-text("Danh mục")').first();
  if (await navCategory.count() > 0) {
    await navCategory.click();
    await page.waitForTimeout(300);
  }
}

/**
 * Đăng nhập Admin và điều hướng vào màn hình Quản lý Danh mục trên Web Admin
 */
async function loginAdminAndOpenCategories(page, request) {
  const token = await resetCategoriesViaApi(request);
  const loginRes = await request.post(`${BACKEND_URL}/api/login`, {
    data: ADMIN_ACCOUNT,
  });
  const loginData = await loginRes.json();

  await page.goto('/');
  await page.evaluate(({ token, user }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('adminToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('adminUser', JSON.stringify(user));
  }, { token: loginData.token, user: loginData.user });

  await page.reload();
  await page.waitForLoadState('networkidle');
  await openCategoriesTab(page);

  return token;
}

test.describe('Kiểm thử Giao diện Web Admin FR-14 — Quản lý Danh mục (Category CRUD)', () => {

  test('EP-TC28: Người dùng chưa đăng nhập hoặc có role=user bị chặn truy cập Quản lý Danh mục trên Web Admin', async ({ page, request }) => {
    await resetCategoriesViaApi(request);

    // 1. Kiểm tra khi chưa đăng nhập (xóa sạch localStorage)
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();
    await page.waitForLoadState('networkidle');

    const unauthHasCategoryForm = await page.locator('input[placeholder*="Tên danh mục" i], button:has-text("Thêm mới")').count() > 0;
    const unauthHasLogin = await page.locator('input[type="password"]').count() > 0;

    // 2. Kiểm tra khi tài khoản người dùng thường (role = 'user': test@eshop.com) có token trong trình duyệt
    const userLoginRes = await request.post(`${BACKEND_URL}/api/login`, {
      data: USER_ACCOUNT,
    });
    const userLoginData = await userLoginRes.json();

    await page.evaluate(({ token, user }) => {
      localStorage.setItem('token', token);
      localStorage.setItem('adminToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('adminUser', JSON.stringify(user));
    }, { token: userLoginData.token, user: userLoginData.user });

    await page.reload();
    await page.waitForLoadState('networkidle');
    await openCategoriesTab(page);

    const screenshotPath = path.join(SCREENSHOT_DIR, `${RUN_NAME}_EP-TC28.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    const userRoleCanSeeAdminCategoryUI = await page.locator('input[placeholder*="Tên danh mục" i], button:has-text("Thêm mới"), button:has-text("Xóa")').count() > 0;

    expect.soft(
      !unauthHasCategoryForm && unauthHasLogin,
      'Khi chưa đăng nhập phải hiển thị màn hình Đăng nhập Admin và không lộ giao diện Quản lý Danh mục'
    ).toBe(true);

    expect.soft(
      !userRoleCanSeeAdminCategoryUI,
      'Tài khoản người dùng thường (role="user", test@eshop.com) khi truy cập Web Admin phải bị chặn hoàn toàn, không được phép mở và thao tác trên giao diện Quản lý Danh mục (FR-12, SEC-03)'
    ).toBe(true);
  });

  test('EP-TC29: Luồng Thêm và Xóa danh mục hợp lệ trên giao diện Web Admin', async ({ page, request }) => {
    await loginAdminAndOpenCategories(page, request);
    page.on('dialog', dialog => dialog.accept());

    const catInput = page.locator('input[placeholder*="Tên danh mục" i], input[type="text"]').first();
    const addBtn = page.locator('button:has-text("Thêm mới"), form button').first();

    await expect.soft(catInput, 'Phải có ô nhập Tên danh mục trên trang Quản lý Danh mục').toBeVisible();
    await expect.soft(addBtn, 'Phải có nút Thêm mới danh mục trên trang Quản lý Danh mục').toBeVisible();

    // Thêm danh mục mới NAME_NOM
    await catInput.fill(NAME_NOM);
    await addBtn.click();
    await page.waitForTimeout(600);

    const addedVisibleOnUi = await page.locator(`td:has-text("${NAME_NOM}")`).count() > 0;
    const catsAfterAddRes = await request.get(`${BACKEND_URL}/api/categories`);
    const catsAfterAdd = await catsAfterAddRes.json();
    const addedInDb = Array.isArray(catsAfterAdd) && catsAfterAdd.some(c => c.name === NAME_NOM);

    expect.soft(addedVisibleOnUi, `Sau khi bấm Thêm mới, danh mục "${NAME_NOM}" phải xuất hiện trên bảng UI`).toBe(true);
    expect.soft(addedInDb, `Sau khi bấm Thêm mới, danh mục "${NAME_NOM}" phải tồn tại trong GET /api/categories`).toBe(true);

    // Chụp ảnh minh chứng sau khi thêm thành công
    const screenshotPath = path.join(SCREENSHOT_DIR, `${RUN_NAME}_EP-TC29.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    // Xóa dòng danh mục vừa tạo
    const rowWithNewCat = page.locator('tr').filter({ hasText: NAME_NOM });
    const deleteBtnInRow = rowWithNewCat.locator('button:has-text("Xóa")').first();
    if (await deleteBtnInRow.count() > 0) {
      await deleteBtnInRow.click();
      await page.waitForTimeout(600);
    }

    const catsAfterDelRes = await request.get(`${BACKEND_URL}/api/categories`);
    const catsAfterDel = await catsAfterDelRes.json();
    const stillInDb = Array.isArray(catsAfterDel) && catsAfterDel.some(c => c.name === NAME_NOM);

    expect.soft(!stillInDb, `Sau khi bấm Xóa trên UI, danh mục "${NAME_NOM}" phải bị xóa khỏi CSDL`).toBe(true);
  });

  test('EP-TC30: Nhãn của trường Tên danh mục bắt buộc phải có ký hiệu dấu *', async ({ page, request }) => {
    await loginAdminAndOpenCategories(page, request);

    const screenshotPath = path.join(SCREENSHOT_DIR, `${RUN_NAME}_EP-TC30.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    // Kiểm tra nhãn <label> hoặc văn bản quanh ô nhập có dấu * theo FR-22 (dòng 252)
    const labels = page.locator('label');
    const labelCount = await labels.count();
    let hasLabelWithAsterisk = false;
    const labelTexts = [];

    for (let i = 0; i < labelCount; i++) {
      const txt = (await labels.nth(i).innerText()).trim();
      labelTexts.push(txt);
      if (txt.includes('*')) {
        hasLabelWithAsterisk = true;
      }
    }

    expect.soft(
      hasLabelWithAsterisk,
      `Trường bắt buộc Tên danh mục phải có nhãn kèm dấu sao (*) theo FR-22 dòng 252 (số thẻ <label> tìm thấy: ${labelCount}, nội dung: ${JSON.stringify(labelTexts)})`
    ).toBe(true);
  });

  test('EP-TC31: Để trống ô Tên danh mục trên UI rồi bấm Thêm phải bị chặn và không tạo bản ghi rỗng', async ({ page, request }) => {
    await loginAdminAndOpenCategories(page, request);

    const beforeRes = await request.get(`${BACKEND_URL}/api/categories`);
    const beforeCats = await beforeRes.json();

    const catInput = page.locator('input[placeholder*="Tên danh mục" i], input[type="text"]').first();
    const addBtn = page.locator('button:has-text("Thêm mới"), form button').first();

    await catInput.fill('');
    await addBtn.click();
    await page.waitForTimeout(600);

    const screenshotPath = path.join(SCREENSHOT_DIR, `${RUN_NAME}_EP-TC31.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    const afterRes = await request.get(`${BACKEND_URL}/api/categories`);
    const afterCats = await afterRes.json();

    const createdEmpty = Array.isArray(afterCats) && afterCats.length > beforeCats.length;

    expect.soft(
      !createdEmpty,
      `Để trống ô Tên danh mục rồi bấm Thêm mới tuyệt đối không được tạo danh mục rỗng (trước: ${beforeCats.length} bản ghi, sau: ${afterCats.length} bản ghi)`
    ).toBe(true);

    await resetCategoriesViaApi(request);
  });

  test('EP-TC32: Thông báo lỗi khi nhập không hợp lệ phải hiển thị phía TRÊN nút Submit', async ({ page, request }) => {
    await loginAdminAndOpenCategories(page, request);

    const catInput = page.locator('input[placeholder*="Tên danh mục" i], input[type="text"]').first();
    const addBtn = page.locator('button:has-text("Thêm mới"), form button').first();

    await catInput.fill('');
    await addBtn.click();
    await page.waitForTimeout(500);

    const screenshotPath = path.join(SCREENSHOT_DIR, `${RUN_NAME}_EP-TC32.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    const errorAlert = page.locator('.error, .text-red-500, .text-red-600, [role="alert"], p:has-text("lỗi"), p:has-text("không được để trống")');
    const errorCount = await errorAlert.count();

    expect.soft(
      errorCount > 0,
      'Khi bấm Thêm mới với ô Tên danh mục để trống, giao diện phải hiển thị thông báo lỗi phía trên nút Submit theo FR-22 (thực tế không có thông báo lỗi nào trên form)'
    ).toBe(true);

    if (errorCount > 0) {
      const errBox = await errorAlert.first().boundingBox();
      const btnBox = await addBtn.boundingBox();
      if (errBox && btnBox) {
        expect.soft(
          errBox.y + errBox.height <= btnBox.y + 10,
          `Thông báo lỗi (bottom=${errBox.y + errBox.height}) phải nằm phía trên nút Submit (top=${btnBox.y}) theo FR-22 dòng 255`
        ).toBe(true);
      }
    }

    await resetCategoriesViaApi(request);
  });

  test('EP-TC33: Nút Thêm dùng màu xanh dương và nút Xóa dùng màu đỏ theo chuẩn FR-21', async ({ page, request }) => {
    await loginAdminAndOpenCategories(page, request);

    const screenshotPath = path.join(SCREENSHOT_DIR, `${RUN_NAME}_EP-TC33.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    const addBtn = page.locator('button:has-text("Thêm mới"), form button').first();
    const delBtn = page.locator('table button:has-text("Xóa")').first();

    await expect.soft(addBtn, 'Phải tìm thấy nút Thêm mới').toBeVisible();
    await expect.soft(delBtn, 'Phải tìm thấy nút Xóa').toBeVisible();

    if (await addBtn.count() > 0) {
      const addBg = await addBtn.evaluate(el => window.getComputedStyle(el).backgroundColor);
      const mAdd = addBg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      const isBlue = mAdd ? Number(mAdd[3]) > Number(mAdd[1]) && Number(mAdd[3]) > Number(mAdd[2]) : false;
      expect.soft(
        isBlue,
        `Nút hành động tích cực (Thêm mới) phải có màu nền xanh dương theo FR-21 dòng 245 (màu thực tế: ${addBg})`
      ).toBe(true);
    }

    if (await delBtn.count() > 0) {
      const delBg = await delBtn.evaluate(el => window.getComputedStyle(el).backgroundColor);
      const mDel = delBg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      const isRed = mDel ? Number(mDel[1]) > Number(mDel[2]) && Number(mDel[1]) > Number(mDel[3]) : false;
      expect.soft(
        isRed,
        `Nút hành động nguy hiểm (Xóa) phải có màu nền đỏ theo FR-21 dòng 245 (màu thực tế: ${delBg})`
      ).toBe(true);
    }
  });

  test('EP-TC34: Trang có đúng 1 thẻ <h1>, ngôn ngữ tiếng Việt nhất quán, highlight mục Danh mục và nút "Đăng xuất"', async ({ page, request }) => {
    await loginAdminAndOpenCategories(page, request);

    const screenshotPath = path.join(SCREENSHOT_DIR, `${RUN_NAME}_EP-TC34.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    // 1. Đếm số lượng thẻ <h1> (FR-21 dòng 247)
    const h1Count = await page.locator('h1').count();
    const h1Texts = await page.locator('h1').allInnerTexts();
    expect.soft(
      h1Count === 1,
      `Mỗi trang chỉ được có đúng 1 thẻ <h1> duy nhất theo FR-21 dòng 247 (thực tế: ${h1Count} thẻ <h1>: ${JSON.stringify(h1Texts)})`
    ).toBe(true);

    // 2. Kiểm tra nhãn nút "Đăng xuất" (FR-23 dòng 262)
    const exactLogoutItem = await page.locator('li:has-text("Đăng xuất"), button:has-text("Đăng xuất"), a:has-text("Đăng xuất")').count();
    const wrongLogoutItem = await page.locator('li:has-text("Thoát"), button:has-text("Thoát"), li:has-text("Logout"), button:has-text("Logout")').count();
    expect.soft(
      exactLogoutItem > 0 && wrongLogoutItem === 0,
      `Mục đăng xuất phải ghi chính xác "Đăng xuất" theo FR-23 dòng 262`
    ).toBe(true);

    // 3. Kiểm tra highlight mục Danh mục đang active trên thanh điều hướng (FR-23 dòng 260)
    const navCat = page.locator('li:has-text("Danh mục")').first();
    const navOther = page.locator('li:has-text("Sản phẩm")').first();
    if (await navCat.count() > 0 && await navOther.count() > 0) {
      const catColor = await navCat.evaluate(el => window.getComputedStyle(el).color);
      const otherColor = await navOther.evaluate(el => window.getComputedStyle(el).color);
      expect.soft(
        catColor !== otherColor,
        `Mục điều hướng "Danh mục" đang chọn phải được highlight khác màu với mục không chọn theo FR-23 dòng 260`
      ).toBe(true);
    }

    // 4. Kiểm tra ngôn ngữ hiển thị nhất quán hoàn toàn bằng tiếng Việt, không lẫn tiếng Anh (FR-21 dòng 244)
    const sidebarItems = await page.locator('ul li').allInnerTexts();
    const hasEnglishMenu = sidebarItems.some(t => /\b(Dashboard|Categories|Products|Orders|Users|Logout)\b/i.test(t));
    expect.soft(
      !hasEnglishMenu,
      `Giao diện phải hiển thị hoàn toàn bằng tiếng Việt, không lẫn tiếng Anh theo FR-21 dòng 244 (phát hiện mục tiếng Anh trên thanh điều hướng: ${JSON.stringify(sidebarItems)})`
    ).toBe(true);
  });

  test('EP-TC18 (UI): Chuỗi XSS <img src=x onerror=alert(1)> hiển thị dạng văn bản thuần, không thực thi script (SEC-04)', async ({ page, request }) => {
    const token = await loginAdminAndOpenCategories(page, request);
    const xssPayload = '<img src=x onerror=alert(1)>';

    let alertTriggered = false;
    page.on('dialog', async dialog => {
      if (dialog.type() === 'alert') {
        alertTriggered = true;
      }
      await dialog.dismiss();
    });

    await request.post(`${BACKEND_URL}/api/categories`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { name: xssPayload },
    });

    await page.reload();
    await page.waitForLoadState('networkidle');
    await openCategoriesTab(page);

    const screenshotPath = path.join(SCREENSHOT_DIR, `${RUN_NAME}_EP-TC18.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    const injectedImgCount = await page.locator('img[onerror]').count();
    const escapedTextVisible = await page.locator(`td:has-text("${xssPayload}")`).count() > 0;

    expect.soft(!alertTriggered, 'Không được thực thi hàm alert(1) từ chuỗi tên danh mục (SEC-04)').toBe(true);
    expect.soft(injectedImgCount === 0, 'Không được render thẻ <img onerror=...> thực sự vào DOM').toBe(true);
    expect.soft(escapedTextVisible, 'Chuỗi XSS phải được hiển thị nguyên văn dưới dạng văn bản thuần').toBe(true);

    await resetCategoriesViaApi(request);
  });

  test('OB-TC01 (UI): Khi xóa hết danh mục (0 bản ghi), giao diện hiển thị Empty State có icon/hình minh họa (FR-24)', async ({ page, request }) => {
    const token = await loginAdminAndOpenCategories(page, request);
    const headers = { Authorization: `Bearer ${token}` };

    // Xóa toàn bộ danh mục hiện có qua API để đưa về biên đầu ra 0 danh mục
    const catRes = await request.get(`${BACKEND_URL}/api/categories`);
    const cats = await catRes.json();
    for (const c of cats) {
      await request.delete(`${BACKEND_URL}/api/categories/${c.id}`, { headers });
    }

    await page.reload();
    await page.waitForLoadState('networkidle');
    await openCategoriesTab(page);

    const screenshotPath = path.join(SCREENSHOT_DIR, `${RUN_NAME}_OB-TC01.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    // Kiểm tra Empty State theo FR-24 (dòng 269): phải có thông báo thân thiện và icon/hình minh họa khi danh sách trống
    const emptyStateMsg = await page.locator('text=/trống|chưa có danh mục|không có danh mục|empty/i').count();
    const emptyStateIcon = await page.locator('svg, img, .empty-icon').count();

    expect.soft(
      emptyStateMsg > 0 && emptyStateIcon > 0,
      `Khi danh sách danh mục trống (0 bản ghi), giao diện phải hiển thị trạng thái trống (Empty State) kèm icon/hình minh họa và thông báo thân thiện theo FR-24 dòng 269 (thông báo tìm thấy: ${emptyStateMsg}, icon/hình: ${emptyStateIcon})`
    ).toBe(true);

    // Khôi phục lại danh mục chuẩn sau khi kiểm thử
    await resetCategoriesViaApi(request);
  });

  test('SR-TC02 (UI): Hiển thị đúng chuỗi danh mục tiếng Việt có dấu, ký tự đặc biệt (&, -, ()) và Emoji trên Web Admin', async ({ page, request }) => {
    const token = await loginAdminAndOpenCategories(page, request);
    const unicodeName = 'Ẩm thực & Đồ uống 🍜 - Tươi sống (100%)';

    await request.post(`${BACKEND_URL}/api/categories`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { name: unicodeName },
    });

    await page.reload();
    await page.waitForLoadState('networkidle');
    await openCategoriesTab(page);

    const screenshotPath = path.join(SCREENSHOT_DIR, `${RUN_NAME}_SR-TC02.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    const visibleUnicode = await page.locator(`td:has-text("${unicodeName}")`).count() > 0;
    expect.soft(visibleUnicode, `Giao diện Web Admin phải hiển thị nguyên vẹn chuỗi Unicode/Emoji "${unicodeName}"`).toBe(true);

    await resetCategoriesViaApi(request);
  });

});
