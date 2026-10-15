---
name: hw02_boundary_value_analysis
description: Áp dụng Phân tích giá trị biên (BVA) để thiết kế test case hộp đen cho một tính năng EShop. Dùng khi cần xác định cận, chọn một trong bốn chế độ (Standard 4n+1, Robustness 6n+1, Worst-case 5^n, Robust Worst-case 7^n), sinh test case biên, tính số lượng test theo công thức và kiểm tra trùng. Làm theo đúng bài giảng, có giải thích từng bước.
---

# Boundary Value Analysis (BVA)

> Nguồn kiến thức: `../hw02_orchestrator/references/bai-4-ep-bva.md` (mục 7–9, 10, 11).
> BVA làm **sau** EP. Dùng các lớp đã xác định, rồi chọn giá trị sát biên của chúng.

## Khi nào dùng

- Các phân vùng có **thứ tự** (số, độ dài, ngày, tiền, số lượng…).
- Có cận rõ ràng trong đặc tả. Nếu **không có cận**, ghi `unspecified` và hỏi sinh viên, không tự đặt cận.

## Nguyên tắc

1. Lỗi thường nằm ở **ranh giới** giữa các phân vùng: sai toán tử (`<=` thay `<`) hoặc sai giá trị biên (`< 52` thay `< 25`). Các giá trị sát cận có sức phát hiện lỗi cao hơn giá trị xa cận.
2. Xét cả **biên đầu vào** và đầu vào khiến **đầu ra** đạt biên (khi đủ thông tin quan hệ input/output).
3. **Hộp đen**: biên lấy từ đặc tả (quy định §4).
4. Expected result **tính độc lập** từ đặc tả, không sao chép từ ví dụ hay từ code.
5. **100% Tiếng Việt có dấu**: Toàn bộ mô tả ca kiểm thử, tên biên, kết quả mong đợi và giải thích công thức phải viết bằng tiếng Việt có dấu chuẩn mực.

## Quy trình

### Bước 1 — Xác định phân vùng có thứ tự và các cận

Lập bảng biên:

| B ID | Biến | Ràng buộc trích từ đặc tả | LB | UB | Loại cận LB | Loại cận UB | δ (bước nhỏ nhất) | Nominal | Nguồn |
|---|---|---|---|---|---|---|---|---|---|

- **Cận đóng** `[LB, UB]`: `LB` và `UB` đều **hợp lệ**.
- **Cận mở** `[LB, UB)` hay `(LB, UB]`: đầu mở **không hợp lệ**. Không máy móc áp dụng ý nghĩa cận đóng.
- **δ** là bước nhỏ nhất của dữ liệu:
  - số nguyên: `δ = 1`
  - số thập phân/tiền: theo số chữ số thập phân cho phép (ví dụ 2 chữ số → `δ = 0,01`)
  - độ dài chuỗi: `δ = 1` ký tự
  - thời gian/ngày: theo đơn vị nhỏ nhất đặc tả cho phép
  
  **Không dùng `±1` cho mọi kiểu dữ liệu.**
- **Nominal**: một giá trị hợp lệ nằm xa cận, dùng làm giá trị "giữ nguyên" của các biến khác.
- **Biến trạng thái (State Input) có ngưỡng** (bộ đếm lần sai, thời gian khóa, số lần thử…) cũng là biến có thứ tự khi đặc tả nêu ngưỡng → đưa vào BVA; nêu cách đưa SUT về trạng thái (fixture/đồng hồ).
- **Miền suy biến (`LB = UB`)**: công thức bài giảng giả định hai cận phân biệt. Khi `LB = UB` (ví dụ "đúng 6 ký tự"), các điểm trùng nhau (`LB−δ = UB−δ`, `LB = UB = nominal`, `LB+δ = UB+δ`). Phải ghi rõ số điểm khác nhau thực tế và giải thích sai khác với công thức.
- **Biến không đưa vào BVA** (email, quan hệ bằng nhau, biến thiếu cận trong đặc tả…): lập bảng *Biến loại trừ* có lý do từng biến; không tự bịa cận.
- **Biên không thể tiếp cận** (ví dụ giá trị âm cho bộ đếm mà giao diện/API không cho nhập; thời gian âm): ghi `unreachable`/`N/A` kèm lý do, **không** gọi là Fail. Chỉ đưa vào ca nếu có cách gây trạng thái đó hợp lệ qua SUT.
- **Nominal phải nhất quán** giữa bảng biên và bảng ca (không đổi nominal giữa các nhóm ca mà không giải thích). Nếu nominal theo đặc tả lệch thực tế SUT (ví dụ SUT sinh OTP 4 số, đặc tả 6 số) thì ghi chú là lệch và ảnh hưởng tới diễn giải bằng chứng.

### Bước 2 — Chọn chế độ BVA (có lý do)

| Chế độ | Điểm mỗi biến | Cách kết hợp | Số ca với n biến |
|---|---|---|---|
| **Standard** | `LB`, `LB+δ`, `UB−δ`, `UB` + nominal | Đổi một biến, biến khác giữ nominal | **4n + 1** |
| **Robustness** | `LB−δ`, `LB`, `LB+δ`, `UB−δ`, `UB`, `UB+δ` + nominal | Đổi một biến, biến khác giữ nominal | **6n + 1** |
| **Worst-case** | `LB`, `LB+δ`, nominal, `UB−δ`, `UB` | Tích Descartes mọi biến | **5ⁿ** |
| **Robust Worst-case** | `LB−δ`, `LB`, `LB+δ`, nominal, `UB−δ`, `UB`, `UB+δ` | Tích Descartes mọi biến | **7ⁿ** |

Số mũ là **lũy thừa** `5^n`, `7^n` chứ không phải `5×n`, `7×n`.

Cách chọn:
- Mặc định dùng **Robustness**: có cả ca ngoài miền (kiểm tra biên không hợp lệ) mà số ca vẫn vừa phải. Gợi ý: **dùng Robustness làm chế độ mặc định**, vì bài tập cần cả biên hợp lệ lẫn biên không hợp lệ.
- Chỉ dùng **Worst-case / Robust Worst-case** khi các biến **tương tác** với nhau và số tổ hợp chấp nhận được. **Không tự chọn khi số tổ hợp quá lớn**; hỏi sinh viên.
- Giải thích lý do chọn trong báo cáo **kèm bảng so sánh bốn chế độ với n thực tế** (số ca lý thuyết, lý do chọn/loại từng chế độ).

Bảng số ca để tham khảo:

| n | Standard | Robustness | Worst-case | Robust Worst-case |
|---:|---:|---:|---:|---:|
| 1 | 5 | 7 | 5 | 7 |
| 2 | 9 | 13 | 25 | 49 |
| 3 | 13 | 19 | 125 | 343 |
| 4 | 17 | 25 | 625 | 2401 |

### Bước 3 — Sinh vector test

```text
Với mỗi biến i: tập điểm theo chế độ đã chọn
Standard/Robustness:
  phát 1 ca: mọi biến = nominal
  với mỗi biến i, với mỗi điểm biên p của i:
      phát 1 ca: biến i = p, các biến khác = nominal
Worst-case/Robust Worst-case:
  phát mọi vector của tích Descartes các tập điểm
```

Giả định single-fault: khi kiểm tra biên của biến A, các biến khác **giữ nominal hợp lệ**.

### Bước 4 — Phân loại và tính expected

Với mỗi vector:
1. Xét **toàn bộ** ràng buộc của đặc tả để xác định hợp lệ/không hợp lệ.
2. Tính expected **độc lập** (phép tính hoặc điều khoản đặc tả). Không rõ thì đánh dấu `requires_oracle` và hỏi.
3. Ghi nguồn yêu cầu, biên đang nhắm tới.

**Lưu ý số học:** bài giảng trang 26 ghi sai dấu một số kết quả (ví dụ `−99 + 9` phải là `−90`, không phải `90`). **Luôn tự tính lại expected**, đặc biệt với số âm.

### Bước 5 — Loại trùng và đối chiếu với EP

- Gộp các ca **trùng input** (ghi chú ảnh hưởng đến công thức lý thuyết).
- Lập **bảng toàn bộ vector lý thuyết** (`6n+1` dòng cho Robustness, `4n+1` cho Standard…): mỗi dòng ghi biến thay đổi, điểm biên, giá trị các biến, kết quả hợp lệ/không, và ca thực tế tương ứng hoặc "Trùng #k".
- Nếu miền hẹp làm các điểm trùng nhau, hoặc ràng buộc liên biến khiến tổ hợp vô nghĩa, số ca thực tế có thể khác công thức. Ghi rõ **số lý thuyết**, **số thực tế** và **số đã loại trùng** (lý thuyết − thực tế = loại trùng).
- Đối chiếu với EP: cho phép trùng nếu giữ nguyên mục tiêu coverage, nhưng BVA phải phủ đủ biên.

### Bước 6 — Biên đầu ra (nếu có)

Xem xét **luôn**, không chỉ khi có ngưỡng input → output:
1. Nếu đặc tả nêu quan hệ input → output (ví dụ tổng tiền chạm ngưỡng miễn phí vận chuyển): xác định input gây ra output ở biên, rồi sinh ca tương ứng.
2. Nếu **đầu ra do hệ thống sinh** có ràng buộc thứ tự/độ dài/miền (ví dụ OTP đúng 6 chữ số, mã đơn hàng có độ dài cố định): coi đó là biên đầu ra và thêm ca kiểm tra nhiều mẫu (chữ ID riêng, ví dụ `OB-TC01`).
3. Chỉ kết luận "không có biên đầu ra" sau khi đã đối chiếu cả hai trường hợp trên.

## Đầu ra bắt buộc (tiếng Việt có dấu)

### Bảng biên (Bước 1) — như trên

### Bảng điểm biên

| Điểm | Biến | Giá trị | Quan hệ với biên | Hợp lệ? |
|---|---|---|---|---|

### Bảng test case BVA

| TC ID | Chế độ | Biên nhắm tới | Dữ liệu vào | Các bước / Lệnh | Kết quả mong đợi | Nguồn expected |
|---|---|---|---|---|---|---|

### Báo cáo

```text
Chế độ BVA: Standard | Robustness | Worst-case | Robust Worst-case
Số biến n:
Số ca theo công thức:
Số ca thực tế duy nhất:
Số vector đã loại trùng:
Vấn đề oracle / mơ hồ chưa giải quyết:
```

## Cổng chất lượng

- [ ] Phân biệt đúng cận đóng/mở và đơn vị nhỏ nhất δ
- [ ] Không nhầm `>` với `≥`, `<` với `≤`
- [ ] Chọn đúng chế độ và công thức (`5^n`, `7^n`)
- [ ] Có ca ngoài miền nếu dùng Robustness / Robust Worst-case
- [ ] Mỗi expected tính độc lập, đặc biệt số âm
- [ ] Ghi số ca lý thuyết và số ca thực tế
- [ ] Không bịa cận khi đặc tả chưa có
- [ ] Có bảng so sánh bốn chế độ và bảng biến loại trừ có lý do
- [ ] Đã xử lý miền suy biến (`LB = UB`) nếu có
- [ ] Có bảng toàn bộ vector lý thuyết và đối chiếu ca thực tế / ca trùng
- [ ] Đã xem xét biên đầu ra (cả đầu ra do hệ thống sinh)
- [ ] Biên không thể tiếp cận được ghi `unreachable`, không gọi Fail
- [ ] Nominal nhất quán; lệch thực tế SUT được ghi chú
- [ ] **Nhất quán số liệu:** số ca BVA ở mọi bảng tổng hợp (kể cả ca biên đầu ra) trùng nhau; ca chưa chạy ghi `Not run`

## Sau khi thiết kế

1. Ghi vào `Main_Report.md`, mục `Boundary Value Analysis — <Tính năng>`.
2. **Dừng cho Human Review** (workflow `hw02_2_design_tests`): sinh viên bổ sung ca biên/bảo mật bị bỏ sót.
3. Ghi lượt AI này vào AI Audit.
4. Gợi ý commit: `test(FR-XX): design BVA <chế độ> — M test case`.

> [!CAUTION]
> ### CÁC ĐIỀU KHOẢN NGHIÊM CẤM (STRICT PROHIBITIONS)
> - **[NGHIÊM CẤM]** Gọi tổ hợp mọi biến là Standard BVA.
> - **[NGHIÊM CẤM]** Bỏ ca ngoài miền khi dùng chế độ Robustness.
> - **[NGHIÊM CẤM]** Tính nhầm `5n`/`7n` thay vì lũy thừa `5^n`/`7^n`.
> - **[NGHIÊM CẤM]** Dùng `+-1` tùy tiện cho tiền, số thực, thời gian (phải xác định delta chính xác).
> - **[NGHIÊM CẤM]** Suy expected từ mã nguồn hoặc chép từ ví dụ bài giảng mà không tính toán lại.

## Tham chiếu

- `references/bva_modes.md` — công thức, ví dụ minh họa, ví dụ 12 ca bài giảng đã sửa
- `references/field_type_checklist.md` — gợi ý biên theo loại trường
- `references/template.md` — khuôn đầu ra
