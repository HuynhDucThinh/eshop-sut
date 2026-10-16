# KỊCH BẢN QUAY VIDEO DEMO AGENT SKILL — HW02 DOMAIN TESTING

- **Môn học:** Kiểm thử Phần mềm (Software Testing — CS423 / CSC13003)
- **Sinh viên thực hiện:** Huỳnh Đức Thịnh
- **MSSV:** 23120199
- **Tính năng demo trọn vẹn (End-to-End):** **FR-03 — Quên mật khẩu và Đặt lại mật khẩu** (Pool A)
- **Thời lượng dự kiến:** 10 – 12 phút (đúng chuẩn hướng dẫn môn học)
- **Yêu cầu bắt buộc:** Sinh viên **tự quay màn hình và tự thuyết minh bằng giọng nói của chính mình** (không dùng giọng đọc AI/TTS), sau đó tải lên YouTube (chế độ Không công khai hoặc Công khai) và gắn link vào `README.md`.

---

## 1. CHUẨN BỊ TRƯỚC KHI BẤM QUAY (CHECKLIST)

1. **Màn hình IDE (VS Code / Antigravity):**
   - Mở sẵn thư mục `.agent/skills/` và `.agent/workflows/`.
   - Mở sẵn file `reports/Main_Report.md` tại mục `FR-03`.
   - Mở sẵn file `reports/Bug_Report.md`, `reports/AI_Audit_Report.md`, `reports/AI_Critique.md`.
2. **Cửa sổ Terminal (PowerShell):**
   - Đang đứng tại thư mục gốc `D:\KCPM\eshop-sut`.
   - Backend và Frontend đang chạy (`npm run dev` trên port 5173 và backend port 3000).
3. **Cửa sổ Trình duyệt Web (Browser):**
   - Tab 1: Trang EShop `http://localhost:5173/forgot-password`.
   - Tab 2: Trang GitHub Issues của repository nhóm (hiển thị danh sách issues #2, #3, #4).

---

## 2. KỊCH BẢN CHI TIẾT THEO TỪNG PHÚT (TIMELINE & SCRIPT)

### PHẦN 1: MỞ ĐẦU & GIỚI THIỆU BỘ AGENT SKILLS (0:00 – 1:30)

| Thời lượng | Thao tác trên màn hình | Lời thoại chi tiết (Sinh viên đọc) |
|---|---|---|
| **0:00 – 0:40** | Quay toàn màn hình IDE, mở file `reports/README.md`. Con trỏ chuột chỉ vào phần thông tin sinh viên và bảng tổng hợp 4 Pool. | *"Kính chào Thầy Cô và các bạn trợ giảng. Em tên là Huỳnh Đức Thịnh, MSSV 23120199. Hôm nay, em xin trình bày video demo quy trình ứng dụng AI và xây dựng bộ Agent Skills để thực hiện bài tập thực hành HW02 — Domain Testing và Boundary Value Analysis trên hệ thống EShop SUT theo chiến lược AI-First có kỷ luật."* |
| **0:40 – 1:30** | Mở cây thư mục `.agent/`. Mở lướt qua các folder `skills/` và `workflows/`. | *"Để bài tập không dừng lại ở việc gõ prompt thủ công rời rạc, em đã đóng gói toàn bộ phương pháp luận của môn học thành một bộ Agent Skills có thể tái sử dụng trong thư mục `.agent/`. Bộ skill này gồm có:<br>1. `hw02_orchestrator`: Đóng vai trò nhạc trưởng điều phối toàn bộ quy trình.<br>2. `hw02_domain_testing`: Phân tích đặc tả và thiết kế lớp tương đương EP.<br>3. `hw02_boundary_value_analysis`: Áp dụng BVA theo 4 biến thể chuẩn của bài giảng.<br>4. `hw02_test_executor`: Tự động hóa kiểm thử 2 hướng API và Playwright UI.<br>5. `hw02_bug_reporter`: Lập bảng dữ kiện ứng viên bug khách quan.<br>6. `hw02_ai_audit`: Tự động ghi nhật ký kiểm toán và phân tích khoảng trống AI Gap.<br>Sau đây, em xin demo trọn vẹn quy trình trên tính năng FR-03: Quên mật khẩu và Đặt lại mật khẩu."* |

---

### PHẦN 2: BƯỚC 1 — TRÍCH ĐẶC TẢ & XÁC ĐỊNH ORACLE HỘP ĐEN (1:30 – 3:30)

| Thời lượng | Thao tác trên màn hình | Lời thoại chi tiết (Sinh viên đọc) |
|---|---|---|
| **1:30 – 2:30** | Chuyển sang `reports/Main_Report.md`, cuộn đến mục `0. Đặc tả kỹ thuật (SRS Extract) — Oracle` của FR-03. Chỉ vào bảng biến $V_1$ đến $V_5$. | *"Quy tắc cốt lõi đầu tiên của bài là **Kiểm thử hộp đen trước**. Em hướng dẫn Agent đọc trực tiếp từ tài liệu yêu cầu của hệ thống để trích xuất 5 biến đầu vào trọng tâm:<br>- $V_1$: Email ở bước 1 để xin mã OTP.<br>- $V_2$: Email ở bước 2.<br>- $V_3$: Mã OTP nhận được.<br>- $V_4$: Mật khẩu mới.<br>- $V_5$: Xác nhận mật khẩu mới.<br>Vì đặc tả không quy định chi tiết mã lỗi HTTP, em thiết lập **Test Oracle độc lập dựa trên trạng thái dữ liệu**: Ở bước 1 hệ thống phải sinh OTP; ở bước 2 nếu hợp lệ thì mật khẩu mới đăng nhập thành công và mật khẩu cũ bị vô hiệu hóa; nếu không hợp lệ thì mật khẩu cũ bắt buộc phải giữ nguyên."* |
| **2:30 – 3:30** | Cuộn đến bảng `0.7 Điểm mơ hồ (Ambiguities) & Câu hỏi mở`. | *"Đặc biệt, Agent không được tự ý suy diễn nghiệp vụ khi tài liệu chưa rõ. Em đã bắt AI lập danh sách các câu hỏi mở từ Q1 đến Q6, ví dụ: Độ dài OTP chuẩn là bao nhiêu? Mật khẩu có phân biệt chữ hoa/thường không? Khi các câu hỏi này chưa có câu trả lời chính thức từ bên phát triển, chúng em ghi nhận để quan sát hành vi thực tế chứ không vội vàng kết luận là lỗi."* |

---

### PHẦN 3: BƯỚC 2 — THIẾT KẾ TEST CASE EP & BVA ROBUSTNESS (3:30 – 6:00)

| Thời lượng | Thao tác trên màn hình | Lời thoại chi tiết (Sinh viên đọc) |
|---|---|---|
| **3:30 – 4:45** | Cuộn đến mục `1. Domain Testing` trong `Main_Report.md`. Chỉ vào Bảng lớp tương đương và Bảng phân tích rút gọn Bước 3b. | *"Sang bước thiết kế Domain Testing (Phân hoạch tương đương), Agent tuân thủ nghiêm ngặt quy trình 3 bước của Slide bài giảng:<br>- Bước 1: Liệt kê Direct Input và State Input.<br>- Bước 2: Chia 36 lớp tương đương EC01 đến EC36, bao gồm cả lớp hợp lệ, không hợp lệ và đặc biệt là **Lớp đầu ra (Output Partition)** như EC07 và EC08.<br>- Bước 3: Áp dụng nguyên tắc của Slide 17 sang Slide 18: Gộp các lớp hợp lệ vào cùng một ca kiểm thử để tối ưu độ phủ, nhưng với các ca âm (không hợp lệ) thì **cô lập duy nhất một biến sai**, giữ nguyên các biến còn lại hợp lệ để xác định chính xác nguyên nhân lỗi. Kết quả thu được 31 ca kiểm thử EP từ EP-TC01 đến EP-TC31."* |
| **4:45 – 6:00** | Cuộn tiếp xuống mục `2. Boundary Value Analysis`. Chỉ vào bảng chọn chế độ và công thức $6n+1$. | *"Tiếp theo là Phân tích giá trị biên BVA. Với độ dài mật khẩu mới thuộc đoạn đóng $[LB, UB] = [6, 32]$ ký tự số nguyên $(\delta = 1)$:<br>- Em yêu cầu Agent so sánh cả 4 biến thể: Standard, Robustness, Worst-case và Robust Worst-case.<br>- Em quyết định chọn chế độ **Robustness Testing** vì bài kiểm thử cần đánh giá cả giá trị biên hợp lệ lẫn giá trị ngoài biên với công thức lý thuyết là $6n + 1 = 6(1) + 1 = 7$ ca.<br>- Kết hợp với biến độ dài mã OTP và biên đầu ra hệ thống, ta sinh ra 9 ca BVA chính thức và 1 ca biên đầu ra `OB-TC01` để đo độ dài OTP sinh ra qua nhiều lần gọi liên tiếp."* |

---

### PHẦN 4: ĐIỂM DỪNG QUAN TRỌNG — HUMAN REVIEW & CA BỔ SUNG (6:00 – 7:30)

| Thời lượng | Thao tác trên màn hình | Lời thoại chi tiết (Sinh viên đọc) |
|---|---|---|
| **6:00 – 7:30** | Cuộn đến mục `2.5 Ca bổ sung do sinh viên (sau Human Review)` (bảng các ca `SR-TC01` đến `SR-TC04`). | *"Theo quy định của đề bài, **sinh viên phải trực tiếp thực hiện Human Review, tuyệt đối không được nộp kết quả thô của AI**. Khi trực tiếp rà soát bộ test case do AI tạo ra, em phát hiện AI đã bỏ sót các khía cạnh bảo mật và biên nghiệp vụ quan trọng. Do đó, em đã trực tiếp định hướng và bổ sung 4 ca kiểm thử chuyên sâu:<br>1. `SR-TC01`: Kiểm tra OTP có chữ số `0` ở đầu (`leading zero`), phòng ngừa backend ép kiểu sang số nguyên làm mất số 0.<br>2. `SR-TC02`: Kiểm tra OTP cũ có bị thu hồi ngay khi yêu cầu cấp OTP mới hay không.<br>3. `SR-TC03`: Kiểm tra xử lý khoảng trắng trong mật khẩu.<br>4. `SR-TC04`: Kiểm tra độ nhạy chữ hoa/thường của email giữa hai bước.<br>Tổng cộng bộ test case của FR-03 đạt **45 ca kiểm thử** hoàn chỉnh."* |

---

### PHẦN 5: BƯỚC 3 — THỰC THI KIỂM THỬ 2 HƯỚNG & PHÁT HIỆN BUG THẬT (7:30 – 10:00)

| Thời lượng | Thao tác trên màn hình | Lời thoại chi tiết (Sinh viên đọc) |
|---|---|---|
| **7:30 – 8:30** | Mở Terminal, gõ hoặc mở file chạy `node reports/evidence/FR-03/run_fr03.js reports/evidence/FR-03/run_api_1`. Chờ log chạy qua và hiện bảng kết quả. | *"Bước 3 là Thực thi kiểm thử. Em áp dụng chiến lược **Dual-Track Automation**:<br>- **Hướng 1: HTTP API Automation**: Em chạy kịch bản kiểm thử API tự động qua 45 ca. Kết quả thực thi cho thấy 24 ca Pass, 20 ca Fail và 1 ca Blocked. Tất cả các ca Fail đều được chạy lặp lại 2 lần để đảm bảo tính ổn định và loại trừ hoàn toàn yếu tố môi trường hay chập chờn mạng."* |
| **8:30 – 9:20** | Mở trình duyệt web tab Playwright test hoặc mở file `tests/ui-fr03/fr03_ui.spec.js`. Mở ảnh bằng chứng `reports/evidence/FR-03/screenshots/run_ui_1_EP-TC22.png`. | *"**Hướng 2: Playwright CLI Automation**: Dùng để kiểm chứng các ràng buộc giao diện DOM HTML5 mà API không thể chạm tới. Khi chạy Playwright test trên trang Quên mật khẩu, hệ thống phát hiện:<br>- Ô email khai báo sai thành `type="text"` thay vì `type="email"`, dẫn đến form không chặn submit khi nhập sai định dạng.<br>- Giao diện bước 2 **hoàn toàn không có trường Xác nhận mật khẩu**, vi phạm nghiêm trọng đặc tả của đề bài."* |
| **9:20 – 10:00** | Mở `reports/Bug_Report.md` và chuyển sang tab trình duyệt GitHub Issues hiển thị Issues #2, #3, #4. Mở ảnh `BUG-002-terminal.png`. | *"Từ các ca Fail ổn định, em tổng hợp thành **3 lỗi chính thức** và tự tay báo cáo lên GitHub Issues:<br>- **BUG-001** (Issue #2): Mã OTP thực tế chỉ có 4 chữ số thay vì 6 chữ số.<br>- **BUG-002** (Issue #3): Backend chấp nhận đổi sang mật khẩu yếu chỉ 4 ký tự `Ab1!` mà không có bất kỳ bộ lọc kiểm tra nào.<br>- **BUG-003** (Issue #4): Form giao diện thiếu hoàn toàn ô xác nhận mật khẩu và thiếu chỉ báo tiến trình.<br>Mỗi issue đều có đính kèm ảnh chụp terminal và ảnh Playwright thật làm minh chứng."* |

---

### PHẦN 6: BƯỚC 4 — AI GAP, AUDIT REPORT & AI CRITIQUE (10:00 – 11:30)

| Thời lượng | Thao tác trên màn hình | Lời thoại chi tiết (Sinh viên đọc) |
|---|---|---|
| **10:00 – 10:45** | Mở mục `4. AI Gap Analysis` của FR-03 trong `Main_Report.md`. Chỉ vào bảng phân loại A, B, C. | *"Tại bước 4, theo đúng quy định liêm chính học thuật, em thực hiện **AI Gap Analysis** để trả lời câu hỏi: Vì sao AI lại bỏ sót test case và bug?<br>- Nhóm B (Giới hạn công cụ): AI mặc định xem OTP là số nguyên thông thường nên bỏ qua trường hợp `leading zero`.<br>- Nhóm C (Độ phức tạp hệ thống): AI không tự hình dung được vòng đời hủy token cũ khi cấp token mới.<br>Từ đó, em rút ra bài học là cần phải cải tiến prompt bằng cách chỉ định rõ kiểu dữ liệu chuỗi số và các trạng thái chuyển tiếp."* |
| **10:45 – 11:30** | Mở file `reports/AI_Audit_Report.md` và `reports/AI_Critique.md`. | *"Về mặt kiểm toán, file `AI_Audit_Report.md` đã ghi lại đầy đủ 20 artifact theo nguyên tắc chỉ nối tiếp (append-only), lưu trữ chính xác thời gian và prompt nguyên văn.<br>Trong file `AI_Critique.md`, em tự tay viết đoạn văn phản biện 251 từ, nêu rõ quan điểm: AI là một trợ thủ đắc lực giúp tăng tốc độ sinh khung test case, nhưng sinh viên phải là người giữ vai trò phê bình, kiểm soát chất lượng và bổ sung các khía cạnh bảo mật chuyên sâu."* |

---

### PHẦN 7: TỔNG KẾT & KẾT THÚC (11:30 – 12:00)

| Thời lượng | Thao tác trên màn hình | Lời thoại chi tiết (Sinh viên đọc) |
|---|---|---|
| **11:30 – 12:00** | Mở lại `reports/README.md`, cuộn qua Bảng tự chấm điểm (90 điểm 4 Pool) và bảng tổng hợp 192 test case, 19 bug. Kết thúc bằng màn hình terminal git log. | *"Tổng kết lại, bài làm của em đã hoàn thành trọn vẹn cả 4 Pool tính năng gồm 192 test case, phát hiện 19 bug thực tế có đầy đủ GitHub Issues và bằng chứng. Bộ Agent Skills trong thư mục `.agent/` hoạt động ổn định, đúng quy trình kỹ thuật và có thể tái sử dụng cho các bài toán kiểm thử khác.<br>Em xin chân thành cảm ơn Thầy Cô và các bạn trợ giảng đã theo dõi video thuyết trình của em. Em xin kết thúc phần demo tại đây."* |

---

## 3. LỜI KHUYÊN KHI QUAY VIDEO ĐỂ ĐẠT ĐIỂM TỐI ĐA (10/10)

1. **Âm thanh:** Dùng tai nghe có mic để tiếng nói rõ ràng, không bị rè hoặc lẫn tạp âm quạt/môi trường.
2. **Tốc độ nói:** Nói to, dõng dạc, tự tin, nhấn mạnh vào các từ khóa kỹ thuật (*Domain Testing, Robustness, Test Oracle, Single Fault, Human Review, AI Gap*).
3. **Phần mềm quay đề xuất:** 
   - **OBS Studio** (miễn phí, nét, nhẹ).
   - Hoặc tính năng quay màn hình có sẵn trên Windows: **Xbox Game Bar** (`Windows + Alt + R`) hoặc **Snipping Tool**.
4. **Sau khi quay xong:**
   - Đăng video lên YouTube (chọn chế độ `Unlisted` — Không công khai hoặc `Public` — Công khai).
   - Copy đường link YouTube dán vào mục 5 của file [reports/README.md](file:///d:/KCPM/eshop-sut/reports/README.md).
