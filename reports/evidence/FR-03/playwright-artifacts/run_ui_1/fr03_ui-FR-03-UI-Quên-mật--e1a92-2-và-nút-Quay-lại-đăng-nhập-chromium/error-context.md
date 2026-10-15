# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: fr03_ui.spec.js >> FR-03 UI: Quên mật khẩu & Đặt lại mật khẩu >> EP-TC29 UI: Chỉ báo tiến trình Bước 1/2, Bước 2/2 và nút Quay lại đăng nhập
- Location: fr03_ui.spec.js:232:3

# Error details

```
Error: Phải hiển thị "Bước 1 / 2"

expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

```
Error: Phải có nút hoặc liên kết "Quay lại đăng nhập"

expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

```
Error: Phải hiển thị "Bước 2 / 2"

expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - link "EShop" [ref=e5] [cursor=pointer]:
      - /url: /
    - navigation [ref=e6]:
      - link "Giỏ hàng" [ref=e7] [cursor=pointer]:
        - /url: /cart
      - link "Đăng nhập" [ref=e8] [cursor=pointer]:
        - /url: /login
      - link "Đăng ký" [ref=e9] [cursor=pointer]:
        - /url: /register
  - main [ref=e10]:
    - generic [ref=e11]:
      - heading "Quên Mật Khẩu" [level=2] [ref=e12]
      - generic [ref=e13]:
        - generic [ref=e14]: "Mã OTP của bạn là: 8436"
        - generic [ref=e15]:
          - generic [ref=e16]: Mã OTP (4 số)
          - textbox [ref=e17]
        - generic [ref=e18]:
          - generic [ref=e19]: Mật khẩu mới
          - textbox [ref=e20]
        - button "Đặt lại mật khẩu" [ref=e21] [cursor=pointer]
        - button "← Quay lại" [ref=e22] [cursor=pointer]
  - contentinfo [ref=e23]: © 2026 EShop SUT. Dành cho mục đích kiểm thử.
```

# Test source

```ts
  145 |     page,
  146 |     request,
  147 |   }, testInfo) => {
  148 |     const forgot = new ForgotPasswordPage(page);
  149 |     const observations = {};
  150 | 
  151 |     await forgot.open();
  152 |     observations.step1IndicatorVisible = await forgot.stepOneIndicator.isVisible();
  153 |     expect.soft(observations.step1IndicatorVisible, 'Phải hiện chỉ báo "Bước 1 / 2" ở bước 1').toBe(true);
  154 | 
  155 |     await forgot.requestOtpFor(ACCOUNT.email);
  156 |     await forgot.otpInput.waitFor({ state: 'visible', timeout: 5000 });
  157 | 
  158 |     observations.step2IndicatorVisible = await forgot.stepTwoIndicator.isVisible();
  159 |     expect.soft(observations.step2IndicatorVisible, 'Phải hiện chỉ báo "Bước 2 / 2" ở bước 2').toBe(true);
  160 | 
  161 |     const displayedOtp = await forgot.readDisplayedOtp();
  162 |     observations.displayedOtp = displayedOtp;
  163 |     expect.soft(displayedOtp, 'Mã OTP hiển thị phải gồm đúng 6 chữ số').toMatch(/^\d{6}$/);
  164 | 
  165 |     await forgot.otpInput.fill(displayedOtp);
  166 |     await forgot.newPasswordInput.fill(NEW_PASSWORD);
  167 |     observations.confirmFieldPresent = await forgot.hasConfirmPasswordField();
  168 |     expect.soft(observations.confirmFieldPresent, 'Form Bước 2 phải có ô Xác nhận mật khẩu').toBe(true);
  169 |     if (observations.confirmFieldPresent) await forgot.confirmPasswordInput.fill(NEW_PASSWORD);
  170 | 
  171 |     await forgot.submitResetButton.click();
  172 |     await page.waitForURL(/\/login/, { timeout: 3000 }).catch(() => {});
  173 | 
  174 |     observations.finalUrl = page.url();
  175 |     observations.dialogMessages = forgot.dialogMessages;
  176 |     expect.soft(page.url(), 'Đặt lại thành công phải chuyển hướng về trang Đăng nhập').toMatch(/\/login/);
  177 | 
  178 |     observations.loginWithNewPasswordStatus = await loginStatus(request, ACCOUNT.email, NEW_PASSWORD);
  179 |     expect
  180 |       .soft(observations.loginWithNewPasswordStatus, 'OC-OK: Đăng nhập bằng mật khẩu mới phải thành công (HTTP 200)')
  181 |       .toBe(200);
  182 | 
  183 |     await attachObservations(testInfo, observations);
  184 |   });
  185 | 
  186 |   test('EP-TC22 UI: Xác nhận mật khẩu không khớp thì báo lỗi và không đổi mật khẩu', async ({
  187 |     page,
  188 |     request,
  189 |   }, testInfo) => {
  190 |     const forgot = new ForgotPasswordPage(page);
  191 |     const observations = {};
  192 | 
  193 |     await forgot.openStepTwo();
  194 |     observations.confirmFieldPresent = await forgot.hasConfirmPasswordField();
  195 |     await attachObservations(testInfo, observations);
  196 |     expect(observations.confirmFieldPresent, 'Form Bước 2 phải có ô Xác nhận mật khẩu để nhập giá trị không khớp').toBe(true);
  197 | 
  198 |     await forgot.otpInput.fill(await forgot.readDisplayedOtp());
  199 |     await forgot.newPasswordInput.fill(NEW_PASSWORD);
  200 |     await forgot.confirmPasswordInput.fill(MISMATCHED_CONFIRM);
  201 |     await forgot.submitResetButton.click();
  202 |     await page.waitForTimeout(500);
  203 | 
  204 |     observations.dialogMessages = forgot.dialogMessages;
  205 |     expect.soft(page.url(), 'Không được chuyển về trang /login khi xác nhận không khớp').not.toMatch(/\/login/);
  206 |     expect.soft(forgot.dialogMessages.join(' ') + (await page.textContent('body')), 'Phải hiển thị thông báo lỗi không khớp').toMatch(/không khớp/i);
  207 |     expect.soft(await loginStatus(request, ACCOUNT.email, ACCOUNT.baselinePassword), 'OC-NO: Mật khẩu cũ vẫn phải đăng nhập được (HTTP 200)').toBe(200);
  208 |   });
  209 | 
  210 |   test('EP-TC23 UI: Xác nhận mật khẩu để trống thì báo lỗi và không đổi mật khẩu', async ({
  211 |     page,
  212 |     request,
  213 |   }, testInfo) => {
  214 |     const forgot = new ForgotPasswordPage(page);
  215 |     const observations = {};
  216 | 
  217 |     await forgot.openStepTwo();
  218 |     observations.confirmFieldPresent = await forgot.hasConfirmPasswordField();
  219 |     await attachObservations(testInfo, observations);
  220 |     expect(observations.confirmFieldPresent, 'Form Bước 2 phải có ô Xác nhận mật khẩu để để trống').toBe(true);
  221 | 
  222 |     await forgot.otpInput.fill(await forgot.readDisplayedOtp());
  223 |     await forgot.newPasswordInput.fill(NEW_PASSWORD);
  224 |     await forgot.confirmPasswordInput.fill('');
  225 |     await forgot.submitResetButton.click();
  226 |     await page.waitForTimeout(500);
  227 | 
  228 |     expect.soft(page.url(), 'Không được chuyển về trang /login khi xác nhận mật khẩu rỗng').not.toMatch(/\/login/);
  229 |     expect.soft(await loginStatus(request, ACCOUNT.email, ACCOUNT.baselinePassword), 'OC-NO: Mật khẩu cũ vẫn phải đăng nhập được (HTTP 200)').toBe(200);
  230 |   });
  231 | 
  232 |   test('EP-TC29 UI: Chỉ báo tiến trình Bước 1/2, Bước 2/2 và nút Quay lại đăng nhập', async ({ page }, testInfo) => {
  233 |     const forgot = new ForgotPasswordPage(page);
  234 |     const observations = {};
  235 | 
  236 |     await forgot.open();
  237 |     observations.step1IndicatorVisible = await forgot.stepOneIndicator.isVisible();
  238 |     observations.backToLoginVisibleAtStep1 = await forgot.backToLoginControl.isVisible();
  239 |     expect.soft(observations.step1IndicatorVisible, 'Phải hiển thị "Bước 1 / 2"').toBe(true);
  240 |     expect.soft(observations.backToLoginVisibleAtStep1, 'Phải có nút hoặc liên kết "Quay lại đăng nhập"').toBe(true);
  241 | 
  242 |     await forgot.requestOtpFor(ACCOUNT.email);
  243 |     await forgot.otpInput.waitFor({ state: 'visible', timeout: 5000 });
  244 |     observations.step2IndicatorVisible = await forgot.stepTwoIndicator.isVisible();
> 245 |     expect.soft(observations.step2IndicatorVisible, 'Phải hiển thị "Bước 2 / 2"').toBe(true);
      |                                                                                   ^ Error: Phải hiển thị "Bước 2 / 2"
  246 | 
  247 |     await attachObservations(testInfo, observations);
  248 |   });
  249 | 
  250 |   test('EP-TC30 UI: Ô email sử dụng type="email", chặn gửi và báo lỗi định dạng HTML5', async ({ page }, testInfo) => {
  251 |     const forgot = new ForgotPasswordPage(page);
  252 |     const observations = {};
  253 | 
  254 |     await forgot.open();
  255 |     observations.emailInputType = await forgot.emailInput.getAttribute('type');
  256 |     expect.soft(observations.emailInputType, 'Ô email phải có thuộc tính type="email"').toBe('email');
  257 | 
  258 |     await forgot.emailInput.fill('testeshop.com');
  259 |     await forgot.requestOtpButton.click();
  260 |     await page.waitForTimeout(500);
  261 | 
  262 |     observations.html5Valid = await forgot.emailInput.evaluate((el) => el.validity.valid);
  263 |     observations.validationMessage = await forgot.emailInput.evaluate((el) => el.validationMessage);
  264 |     observations.apiRequestsSent = forgot.apiRequests.length;
  265 |     observations.dialogMessages = forgot.dialogMessages;
  266 | 
  267 |     expect.soft(observations.html5Valid, 'Trình duyệt phải đánh dấu ô email là không hợp lệ (:invalid)').toBe(false);
  268 |     expect.soft(observations.apiRequestsSent, 'Không được gửi request tới API khi email sai định dạng').toBe(0);
  269 | 
  270 |     await attachObservations(testInfo, observations);
  271 |   });
  272 | 
  273 |   test('EP-TC31 UI: Cả hai ô mật khẩu ở Bước 2 đều phải che ký tự (type="password")', async ({ page }, testInfo) => {
  274 |     const forgot = new ForgotPasswordPage(page);
  275 |     const observations = {};
  276 | 
  277 |     await forgot.openStepTwo();
  278 |     observations.newPasswordType = await forgot.newPasswordInput.getAttribute('type');
  279 |     observations.confirmFieldPresent = await forgot.hasConfirmPasswordField();
  280 |     observations.confirmPasswordType = observations.confirmFieldPresent
  281 |       ? await forgot.confirmPasswordInput.first().getAttribute('type')
  282 |       : null;
  283 | 
  284 |     expect.soft(observations.newPasswordType, 'Ô Mật khẩu mới phải có type="password"').toBe('password');
  285 |     expect.soft(observations.confirmPasswordType, 'Ô Xác nhận mật khẩu phải tồn tại và có type="password"').toBe('password');
  286 | 
  287 |     await attachObservations(testInfo, observations);
  288 |   });
  289 | });
  290 | 
```