---
name: hw02_domain_testing
description: Áp dụng kỹ thuật Domain Testing (Phân hoạch tương đương, EP) để thiết kế test case hộp đen từ đặc tả cho một tính năng EShop. Dùng khi cần lập lớp tương đương hợp lệ/không hợp lệ cho đầu vào và đầu ra, chọn giá trị đại diện, sinh test case EP có truy vết. Làm theo đúng ba bước của bài giảng, có giải thích từng bước.
---

# Domain Testing — Phân hoạch tương đương (EP)

> Nguồn kiến thức: `../hw02_orchestrator/references/bai-4-ep-bva.md` (mục 2–6, 10, 11). Trong bài HW02, "Domain Testing" được thực hiện bằng **phân hoạch tương đương** và các ràng buộc giữa các biến.

## Khi nào dùng

- Cần chia miền đầu vào/đầu ra của một tính năng thành các nhóm hành vi.
- Đã có `SRS_extract.md` được sinh viên xác nhận. **Chưa có thì quay lại bước trích đặc tả.**

## Nguyên tắc

1. **Hộp đen** (quy định §4): chỉ dựa trên đặc tả.
2. EP là **heuristic**, không có cách chia duy nhất. Không khẳng định "thử một giá trị là chứng minh cả lớp đúng". Đó là giả định thiết kế, và BVA bổ sung phần biên.
3. Chỉ một biến/điều kiện ở lớp **không hợp lệ** trong mỗi ca âm, các biến khác để hợp lệ, để biết nguyên nhân lỗi.
4. **Không bỏ lớp đầu ra** (output partition).
5. Không tự bịa luật. Thiếu thông tin: ghi `unspecified` và hỏi.
6. **Ngôn ngữ:** tiếng Việt có dấu theo `rules/hw02_course_rules.md` §5.

## Quy trình ba bước (bắt buộc ghi trong báo cáo)

### Bước 1 — Xác định đầu vào và đầu ra

Từ `SRS_extract.md`, lập bảng:

| Thành phần | Tên | Kiểu | Ràng buộc | Nguồn |
|---|---|---|---|---|
| Input | … | … | … | … |
| Output hợp lệ | … | | | |
| Output lỗi | … | | | |

Với mỗi trường ghi: tên, kiểu, bắt buộc/tùy chọn, min/max, cận đóng/mở, tập giá trị, độ dài, định dạng, ràng buộc liên biến, kết quả mong đợi, nguồn. Nội dung thông báo lỗi chỉ so sánh chính xác nếu đặc tả nêu.

**Phân loại biến (bắt buộc):** thêm cột *Phân loại*:
- **Direct Input**: giá trị người dùng/API gửi vào (body, UI).
- **State Input**: trạng thái nền (DB, phiên, bộ đếm, OTP đã dùng, thời gian khóa…). Mỗi State Input quan trọng có EC riêng và cách đưa hệ thống về trạng thái đó (điều kiện tiên quyết).
- Ghi **giá trị hợp lệ mặc định** cho từng biến để dùng khi cô lập lỗi.

### Bước 2 — Xác định các lớp tương đương

Với mỗi **điều kiện**, chọn một trong bốn dạng và sinh lớp:

| Dạng điều kiện | Ví dụ | Lớp hợp lệ | Lớp không hợp lệ |
|---|---|---|---|
| Giá trị đơn | `x = A` | `x = A` | `x ≠ A` |
| Dải giá trị | `x ∈ [1,100]` | `1 ≤ x ≤ 100` | `x < 1`; `x > 100` |
| Tập giá trị | `x ∈ {A,B,C}` | `x = A`; `x = B`; `x = C` | `x ∉ {A,B,C}` |
| Boolean / kiểu | `x là số nguyên` | `x là số nguyên` | `x không là số nguyên` |

Lưu ý:
- Một giá trị chỉ hợp lệ khi **thỏa tất cả** ràng buộc của trường (kiểu **và** phạm vi). Ví dụ `50.5` nằm trong khoảng nhưng vẫn không hợp lệ vì sai kiểu.
- Với tập `{A,B,C}`: chỉ tách riêng từng giá trị nếu hành vi khác nhau hoặc mục tiêu coverage cần; nếu tương đương thật sự thì coi cả tập là một lớp. **Ghi lý do chia.**
- Lớp đầu ra: đầu ra hợp lệ (ví dụ `SUM = A + B`) và đầu ra lỗi.
- Ràng buộc liên biến (ví dụ mật khẩu khớp xác nhận, giá trị phụ thuộc nhau): sinh lớp riêng cho quan hệ đó.
- **Đối xứng biến lặp lại:** nếu một dữ liệu xuất hiện ở nhiều bước/màn hình (ví dụ email ở bước 1 và bước 2), mỗi lần xuất hiện phải có đủ bộ lớp tương đương (sai định dạng, chưa đăng ký, rỗng, khác giá trị đã dùng ở bước trước). Không chỉ tạo lớp hợp lệ + rỗng cho lần sau.
- **Kiểu chuỗi đặc biệt:** xét thêm chuỗi chỉ gồm khoảng trắng, chuỗi dài quá giới hạn, chuỗi số có số 0 đầu khi liên quan đến đặc tả.
- **Ràng buộc giao diện** (Step Indicator, `type="email"`, `type="password"`, nút điều hướng) được nêu trong đặc tả thì **tách thành EC riêng** và có ít nhất một ca UI; không gom vào ca luồng chính.
- Yêu cầu không thể kiểm thử do đặc tả thiếu giá trị (ví dụ thời hạn OTP): ghi rõ là *giới hạn đã biết*, không tự bịa giá trị.

Đặt ID `EC01`, `EC02` … Ghi: ID, nguồn yêu cầu, trường, điều kiện, loại (valid/invalid/output), giá trị đại diện, ghi chú.

### Bước 3 — Chọn đại diện và tạo test case (hai pha, theo Slide 17 → 18)

**3a — Bảng ca sơ bộ (mỗi EC một dòng, duyệt 100% EC):** mỗi dòng ghi biến đang kiểm tra, giá trị đại diện, các biến còn lại (**bắt buộc hợp lệ khi dòng đó kiểm tra EC invalid**), kết quả mong đợi sơ bộ.

**3b — Phân tích rút gọn → bảng ca tối ưu:**
- **Gộp** các dòng hợp lệ có cùng input và kết quả thành một ca (kèm các lớp đầu ra hợp lệ tương ứng).
- **Gộp output ngoại lệ** cùng các ca âm có chung kết quả.
- **Giữ** mỗi EC invalid độc lập một ca (không đưa hai biến sai vào cùng một ca).
- **Giải thích lý do** mỗi lần gộp/giữ trong báo cáo.
- Không tạo hai ca chỉ khác ID mà cùng input, output, mục tiêu. Nếu thêm nhiều giá trị cùng lớp để giảm rủi ro, ghi rõ là *mở rộng ngoài bộ tối thiểu*.
- Gắn mỗi ca với EC mà nó phủ (truy vết hai chiều EC → TC và TC → EC).
- Nếu một giá trị đại diện phụ thuộc đầu ra của SUT (ví dụ OTP lấy từ hệ thống mà SUT có thể sinh sai độ dài), chọn thêm giá trị **độc lập** với SUT để không đánh mất lớp.

## Đầu ra bắt buộc (tiếng Việt có dấu)

### Bảng lớp tương đương

| EC ID | Yêu cầu | Biến / Đầu ra | Điều kiện | Loại | Giá trị đại diện | Ghi chú / Lý do chia |
|---|---|---|---|---|---|---|

### Bảng test case EP

| TC ID | Kỹ thuật | EC phủ | Điều kiện tiên quyết | Dữ liệu vào | Các bước | Kết quả mong đợi | Nguồn expected |
|---|---|---|---|---|---|---|---|

Với API thêm cột `Method`, `Endpoint`, `Header/Auth`, `Body`, `Status mong đợi`, **chỉ điền khi đặc tả cho biết**; còn lại `TBD`.

### Báo cáo độ phủ

```text
Số điều kiện đã phân tích: N
Lớp EP: V hợp lệ + I không hợp lệ + O lớp đầu ra
Lớp đã phủ: C / (V + I + O)
Số test case EP: M (đã loại trùng: D)
Câu hỏi mở / điểm mơ hồ: [...]
```

Không ghi "100% coverage" nếu chỉ phủ các EC đã biết.

## Cổng chất lượng

- [ ] Mỗi điều kiện đầu vào/đầu ra có EC, hoặc có lý do chưa làm được
- [ ] Lớp hợp lệ và không hợp lệ phân biệt rõ; có cả lớp đầu ra
- [ ] Ràng buộc kết hợp (AND) áp dụng đúng
- [ ] Ca hợp lệ gộp nhiều EC; ca âm cô lập một lỗi
- [ ] Bảng EC → test case đầy đủ
- [ ] Mỗi expected có nguồn đặc tả
- [ ] Không bịa thêm nghiệp vụ; điểm thiếu nằm ở *Câu hỏi mở*
- [ ] Có phân loại Direct Input / State Input
- [ ] Biến lặp lại ở nhiều bước đều có đủ lớp đối xứng
- [ ] Ràng buộc giao diện có EC và ca riêng
- [ ] Có Bảng sơ bộ (3a) và phân tích rút gọn (3b)
- [ ] **Nhất quán số liệu:** tổng EC, tổng TC, Pass/Fail/Blocked/Not run ở mọi bảng tổng hợp phải trùng nhau; ca mới thêm chưa chạy phải ghi `Not run`, không để trống hoặc bịa kết quả

## Sau khi thiết kế

1. Ghi vào `Main_Report.md`, mục `Domain Testing — <Tính năng>`.
2. Ghi lượt AI này vào AI Audit (skill `hw02_ai_audit`).
3. Gợi ý commit: `test(FR-XX): design EP — N lớp, M test case`.
4. Chuyển sang BVA. **Chưa chạy test** (việc của `hw02_test_executor`).

> [!CAUTION]
> ### CÁC ĐIỀU KHOẢN NGHIÊM CẤM (STRICT PROHIBITIONS)
> - **[NGHIÊM CẤM]** Suy expected từ mã nguồn.
> - **[NGHIÊM CẤM]** Ghép nhiều lỗi vào một ca âm (vi phạm nguyên tắc cô lập lỗi Single Fault).
> - **[NGHIÊM CẤM]** Bỏ lớp đầu ra (Output Partition).
> - **[NGHIÊM CẤM]** Sao chép expected từ ví dụ bài giảng mà không tính toán độc lập lại.
> - **[NGHIÊM CẤM]** Gọi một ca là "đã chạy" khi mới chỉ ở giai đoạn thiết kế.

## Tham chiếu

- `references/ep_guide.md` — hướng dẫn chia lớp theo từng dạng điều kiện
- `references/worked_example.md` — ví dụ mẫu từ bài giảng
- `references/template.md` — khuôn đầu ra
