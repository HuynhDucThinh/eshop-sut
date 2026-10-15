# Bài 4 — Phân hoạch tương đương và Phân tích giá trị biên

> **Nguồn chính:** *KCPM – Bài 4 – Phân hoạch tương đương và Giá trị biên*, 26 slide.  
> **Mục đích:** Tài liệu kiến thức và quy trình thao tác để AI agent/skill phân tích đặc tả, thiết kế và kiểm tra test case.  
> **Quy ước:** Các phần **[Theo slide]** phản ánh bài giảng; **[Hướng dẫn triển khai AI — bổ sung]** là diễn giải/quy trình phục vụ triển khai skill, không phải nội dung trích nguyên văn; **[Lưu ý/đính chính]** nhận diện vấn đề trong bài giảng hoặc điểm cần xác nhận.

## Mục lục

1. [Bài toán và mục tiêu kỹ thuật](#1-bài-toán-và-mục-tiêu-kỹ-thuật)
2. [Phân hoạch tương đương (EP)](#2-phân-hoạch-tương-đương-ep)
3. [Quy trình EP ba bước](#3-quy-trình-ep-ba-bước)
4. [Quy tắc hình thành lớp tương đương](#4-quy-tắc-hình-thành-lớp-tương-đương)
5. [Các ví dụ phân hoạch từ bài giảng](#5-các-ví-dụ-phân-hoạch-từ-bài-giảng)
6. [Bộ test case EP của chương trình cộng hai số](#6-bộ-test-case-ep-của-chương-trình-cộng-hai-số)
7. [Phân tích giá trị biên (BVA)](#7-phân-tích-giá-trị-biên-bva)
8. [Bốn biến thể BVA và công thức](#8-bốn-biến-thể-bva-và-công-thức)
9. [Bộ test case BVA của chương trình cộng hai số](#9-bộ-test-case-bva-của-chương-trình-cộng-hai-số)
10. [Quy trình AI tạo test case từ đặc tả](#10-quy-trình-ai-tạo-test-case-từ-đặc-tả)
11. [Định dạng đầu ra và checklist cho AI skill](#11-định-dạng-đầu-ra-và-checklist-cho-ai-skill)
12. [Sai sót, mơ hồ và giới hạn cần kiểm soát](#12-sai-sót-mơ-hồ-và-giới-hạn-cần-kiểm-soát)
13. [Bảng đối chiếu nguồn slide](#13-bảng-đối-chiếu-nguồn-slide)

---

## 1. Bài toán và mục tiêu kỹ thuật

**[Theo slide, trang 1–3]** Chương trình nhận **hai số nguyên**, mỗi số có **từ 1 đến 2 chữ số**, và trả về tổng. Miền hợp lệ trong bài giảng được hiểu là các số nguyên từ **−99 đến 99**, bao gồm **0**:

- A ∈ ℤ, −99 ≤ A ≤ 99.
- B ∈ ℤ, −99 ≤ B ≤ 99.
- Nếu cả hai hợp lệ: `SUM = A + B`.
- Nếu bất kỳ đầu vào nào không hợp lệ: kết quả là **thông báo lỗi**; slide không quy định chuỗi thông báo cụ thể.

Mỗi đầu vào có 199 giá trị hợp lệ (−99,…,−1; 0,…,99), nên số cặp hợp lệ là **199 × 199 = 39.601**. Có vô số đầu vào không hợp lệ (giá trị quá phạm vi, chuỗi không phải số, v.v.). Thời gian và nhân lực hữu hạn nên không thể kiểm thử hết. Mục tiêu là **giảm số test case nhưng vẫn bao phủ các nhóm hành vi quan trọng và phát hiện lỗi hiệu quả**.

**[Lưu ý]** Cụm “1 đến 2 chữ số” trong tên bài toán có thể mơ hồ khi xét `0`, dấu âm và cách nhập dạng chuỗi (ví dụ `01`). Để nhất quán với slide, tài liệu này sử dụng miền **số nguyên [−99, 99]**. Không tự suy diễn quy tắc về số `01`, dấu cộng, khoảng trắng, `null` hoặc overflow nếu đặc tả thực tế chưa nêu.

## 2. Phân hoạch tương đương (EP)

**[Theo slide, trang 4–6]** *Equivalence Partitioning* chia dữ liệu thành các **lớp tương đương (equivalence classes)** mà những phần tử thuộc cùng lớp được kỳ vọng có hành vi xử lý tương tự. Mỗi lớp được chọn một hoặc một số giá trị đại diện để kiểm thử. Có:

- **Valid equivalence class:** Các giá trị/thành phần thỏa điều kiện đặc tả.
- **Invalid equivalence class:** Các giá trị/thành phần vi phạm điều kiện đặc tả.
- **Input partition:** Phân chia theo điều kiện đầu vào.
- **Output partition:** Phân chia theo nhóm kết quả đầu ra.

Slide mô tả việc thử một giá trị đại diện như cách giảm số lượng test case và nâng độ phủ. **[Lưu ý]** Đây là giả định thiết kế kiểm thử dựa trên sự tương đồng hành vi, **không phải chứng minh** rằng mọi giá trị trong lớp đều có cùng kết quả lỗi. Kiểm thử biên bổ sung giúp phát hiện sai khác ngay ranh giới lớp.

### Những nguyên tắc trọng tâm

1. Xem từng **điều kiện** trong đặc tả để xác định các lớp cần kiểm thử.
2. Bao phủ **các lớp hợp lệ** một cách hiệu quả; nhiều lớp hợp lệ ở các biến khác nhau có thể cùng được phủ bởi **một test case**.
3. Đối với kiểm thử không hợp lệ theo hướng của slide: tại một test case, **chỉ một biến/điều kiện ở lớp không hợp lệ**, các biến khác giữ giá trị hợp lệ. Điều này làm rõ nguyên nhân lỗi.
4. Một lớp có thể tồn tại ở **đầu vào** hoặc **đầu ra**. Không bỏ qua output classes.
5. Gắn mỗi test case với lớp tương đương mà nó bao phủ, để có thể kiểm chứng coverage.

## 3. Quy trình EP ba bước

### Bước 1 — Xác định input và output

**[Theo slide, trang 6–7]** Đọc đặc tả chương trình và xác định:

| Thành phần | Ví dụ chương trình cộng | Ý nghĩa |
|---|---|---|
| Input A | Số nguyên nhập thứ nhất | Điều kiện kiểu và phạm vi |
| Input B | Số nguyên nhập thứ hai | Điều kiện kiểu và phạm vi |
| Output SUM | Tổng của A và B | Đầu ra hợp lệ |
| Output lỗi | Thông báo lỗi | Đầu ra không hợp lệ |

**[Hướng dẫn triển khai AI — bổ sung]** Thu thập cho từng trường: tên, kiểu dữ liệu, bắt buộc/tùy chọn, giới hạn min/max, cận đóng/mở, tập giá trị, độ dài, format, các điều kiện liên quan giữa trường, kết quả mong đợi và nguồn trích dẫn. Nếu chưa có thông tin thì đánh dấu `unspecified`, **không tự tạo luật nghiệp vụ**.

### Bước 2 — Xác định các lớp tương đương

**[Theo slide, trang 8–9]** Dựa vào điều kiện đầu vào/đầu ra, liệt kê các lớp hợp lệ và không hợp lệ. Áp dụng cho ví dụ:

| ID | Thành phần | Lớp tương đương | Loại |
|---|---|---|---|
| EC1 | A | −99 ≤ A ≤ 99, A nguyên | Valid |
| EC2 | A | A < −99, A nguyên | Invalid |
| EC3 | A | A > 99, A nguyên | Invalid |
| EC4 | A | A không phải số nguyên | Invalid |
| EC5 | B | −99 ≤ B ≤ 99, B nguyên | Valid |
| EC6 | B | B < −99, B nguyên | Invalid |
| EC7 | B | B > 99, B nguyên | Invalid |
| EC8 | B | B không phải số nguyên | Invalid |
| EC9 | SUM | SUM = A + B | Valid output |
| EC10 | SUM | Thông báo lỗi | Invalid-input output |

Phân hoạch tương đương được slide gọi là một quá trình **heuristic** (kinh nghiệm/phỏng đoán có cơ sở), không có một cách chia duy nhất phù hợp mọi ngữ cảnh.

### Bước 3 — Chọn đại diện và tạo ca kiểm thử

**[Theo slide, trang 15–18]** Với một lớp cần kiểm tra của X, chọn một giá trị trong lớp đó. Các biến Y, Z còn lại được chọn trong lớp hợp lệ. Khi kết hợp các lớp hợp lệ, cố gắng phủ được nhiều lớp cùng lúc; **không ghép nhiều biến sai vào cùng một test case âm** trong bộ kiểm thử EP cơ bản của bài giảng.

Giá trị đại diện được bài giảng sử dụng:

| Lớp | Giá trị đại diện |
|---|---|
| EC1 | A = 10 |
| EC2 | A = −102 |
| EC3 | A = 102 |
| EC4 | A = `Abc` |
| EC5 | B = 9 |
| EC6 | B = −200 |
| EC7 | B = 200 |
| EC8 | B = `1.25` |
| EC9 | Với A = 10, B = 9: SUM = 19 |
| EC10 | Một đầu vào không hợp lệ → thông báo lỗi |

**[Hướng dẫn triển khai AI — bổ sung]** Test case nên chứa ít nhất ID, mục tiêu, EC được phủ, các giá trị input, precondition, steps (nếu có UI/API), expected result, loại valid/invalid và nguồn yêu cầu. Chỉ so sánh thông báo lỗi chính xác khi đặc tả cung cấp nội dung lỗi.

## 4. Quy tắc hình thành lớp tương đương

**[Theo slide, trang 10]** Bài giảng trình bày bốn dạng điều kiện cơ bản:

| Kiểu điều kiện | Ví dụ | Lớp hợp lệ | Lớp không hợp lệ |
|---|---|---|---|
| Giá trị đơn | x = A | x = A | x ≠ A |
| Dải giá trị | x ∈ [1,100] | 1 ≤ x ≤ 100 | x < 1; x > 100 |
| Tập giá trị | x ∈ {A,B,C} | x = A; x = B; x = C | x ∉ {A,B,C} |
| Điều kiện Boolean | x là số nguyên | x là số nguyên | x không là số nguyên |

**[Lưu ý]** Với tập `{A,B,C}`, slide liệt kê A/B/C ở phía hợp lệ. Trong triển khai thực tế, chỉ cần chia thành các lớp hợp lệ **riêng biệt** nếu từng giá trị có hành vi khác nhau hoặc mục tiêu độ phủ yêu cầu; nếu thực sự tương đương về hành vi, có thể coi cả tập là một lớp. Hãy ghi lại lý do chia.

**[Hướng dẫn triển khai AI — bổ sung]** Khi có nhiều ràng buộc đồng thời, phân biệt **lớp của một điều kiện** và **lớp hợp lệ của toàn bộ input**. Ví dụ số nguyên thuộc `[0,100)` cần thỏa **cả** kiểu nguyên **và** phạm vi; đầu vào `50.5` tuy ở trong phạm vi số học vẫn không hợp lệ về kiểu.

## 5. Các ví dụ phân hoạch từ bài giảng

### 5.1. Số nguyên trong [0,100)

**[Theo slide, trang 11]** Ví dụ ghi “nhập vào số nguyên dương nhỏ hơn 100”, sau đó dùng miền **0 ≤ X < 100**:

- Điều kiện C1 — kiểu nguyên: EC1 = là số nguyên (valid); EC2 = không là số nguyên (invalid).
- Điều kiện C2 — khoảng [0,100): EC3 = 0 ≤ X < 100 (valid); EC4 = X < 0 (invalid); EC5 = X ≥ 100 (invalid).
- Hợp lệ tổng thể: số nguyên và 0 ≤ X < 100.
- Không hợp lệ: số nguyên âm; số nguyên ≥ 100; hoặc không phải số nguyên.

**[Lưu ý/đính chính]** Về thuật ngữ toán học thông thường, “số nguyên dương” thường loại trừ `0`, nhưng slide **bao gồm `0`**. AI phải giữ đúng khoảng cụ thể `[0,100)` khi làm bài tập theo slide; khi kiểm thử sản phẩm thật, hỏi lại yêu cầu nếu mô tả chữ và điều kiện toán học mâu thuẫn.

### 5.2. Chuỗi có đúng bảy ký tự, ký tự đầu là chữ hoa

**[Theo slide, trang 12]**

| Loại | Lớp |
|---|---|
| Valid | `length = 7` và ký tự đầu là chữ cái hoa |
| Invalid | `length = 7` và ký tự đầu không phải chữ hoa |
| Invalid | `length < 7` |
| Invalid | `length > 7` |

Ví dụ đại diện **[bổ sung để minh họa, không có trong slide]**: `Abcdefg` (valid), `abcdefg` (sai ký tự đầu), `Abcdef` (ngắn), `Abcdefgh` (dài). Kiểu chữ hoa được định nghĩa bằng đặc tả thực tế (ASCII/Unicode), không được tự giả định.

### 5.3. Tọa độ hai chiều

**[Theo slide, trang 13]** Đặc tả: `3 ≤ X ≤ 7` và `5 ≤ Y ≤ 9`.

- Valid X: [3,7]; invalid X: X < 3, X > 7.
- Valid Y: [5,9]; invalid Y: Y < 5, Y > 9.
- Ví dụ đại diện **[bổ sung]**: (5,7) valid; (2,7), (8,7), (5,4), (5,10) invalid — mỗi ca chỉ sai một tọa độ.

### 5.4. Phân loại tam giác bằng ba cạnh

**[Theo slide, trang 14]** Đầu ra chia thành: tam giác thường, tam giác cân, tam giác đều, tam giác vuông, “…”, và không phải tam giác. Slide chỉ đưa **các nhóm đầu ra**, chưa mô tả đầy đủ điều kiện đầu vào và quy tắc khi loại tam giác giao nhau (ví dụ tam giác vuông cân).

**[Hướng dẫn triển khai AI — bổ sung]** Với một đặc tả thực tế, cần yêu cầu quy tắc: ba cạnh dương, bất đẳng thức tam giác, độ chính xác số thực, thứ tự ưu tiên các loại, thông báo lỗi, có cho phép tam giác vuông cân là loại riêng hay không. Không tự suy đoán kết quả phân loại từ danh sách output trong slide.

## 6. Bộ test case EP của chương trình cộng hai số

**[Theo slide, trang 17–18]** Trang 17 ánh xạ từng EC vào test case và còn lặp lại các trường hợp; trang 18 **rút gọn thành 7 test case** bằng cách gộp coverage EC1, EC5, EC9 và sử dụng EC10 cùng ca sai đầu vào.

| TC | Lớp tương đương phủ | A | B | Kết quả mong đợi |
|---|---|---:|---:|---|
| TC1 | EC1, EC5, EC9 | 10 | 9 | 19 |
| TC2 | EC2, EC10 | −102 | 9 | Thông báo lỗi |
| TC3 | EC3, EC10 | 102 | 9 | Thông báo lỗi |
| TC4 | EC4, EC10 | `Abc` | 9 | Thông báo lỗi |
| TC5 | EC6, EC10 | 10 | −200 | Thông báo lỗi |
| TC6 | EC7, EC10 | 10 | 200 | Thông báo lỗi |
| TC7 | EC8, EC10 | 10 | `1.25` | Thông báo lỗi |

**Cách hiểu coverage:** TC1 đồng thời phủ cả hai lớp input hợp lệ và output hợp lệ; TC2–TC7 lần lượt cô lập một kiểu đầu vào không hợp lệ và kiểm tra output lỗi. EC10 đã được phủ bởi nhiều trường hợp mà không cần một test case mới riêng cho mỗi lần phát sinh output lỗi.

**[Hướng dẫn triển khai AI — bổ sung]** Cần phân biệt *lớp đã phủ* và *ca kiểm thử trùng lặp*: không tạo các ca chỉ khác ID nhưng cùng input/output khi mục tiêu và coverage đều giống nhau. Nếu cần test nhiều giá trị cùng lớp để rủi ro thấp hơn, ghi rõ đó là mở rộng ngoài bộ tối thiểu.

## 7. Phân tích giá trị biên (BVA)

### 7.1. Động cơ và loại lỗi

**[Theo slide, trang 19–20]** Lỗi xuất hiện nhiều tại ranh giới giữa các phân vùng. Ví dụ đặc tả:

```text
Input < 10         → Error message
10 ≤ Input < 25    → "hello"
Input ≥ 25         → Error message
```

Các lỗi mẫu trong slide:

- Lỗi toán tử biên: triển khai `Input <= 25` thay vì `< 25`.
- Lỗi giá trị biên: triển khai `Input < 52` thay vì `< 25`.
- Kiểm thử `Input = 25` có thể phát hiện cả hai lỗi ví dụ; `Input = 54` không phát hiện chúng trong ví dụ nêu trên.

Điểm cốt lõi: **cận và các giá trị lân cận cận thường có sức phát hiện lỗi cao hơn các giá trị xa cận**.

### 7.2. Khi sử dụng và cách chọn giá trị

**[Theo slide, trang 21]** BVA phù hợp khi các phân vùng tương đương có **thứ tự**. Xem xét:

1. Giá trị biên của **đầu vào**.
2. Giá trị đầu vào khiến **đầu ra** đạt giá trị biên.

Giả sử miền hợp lệ của biến nguyên là đoạn đóng `[LB, UB]`. Khi bước tăng nhỏ nhất là **1**, các điểm chuẩn gồm:

| Điểm | Ký hiệu | Ý nghĩa |
|---|---|---|
| Dưới cận dưới | `LB-1` | Ngoài miền hợp lệ |
| Cận dưới | `LB` | Ngay trên đường biên hợp lệ |
| Trên cận dưới | `LB+1` | Ngay trong miền |
| Giá trị danh định | `nominal` | Một điểm hợp lệ xa cận |
| Dưới cận trên | `UB-1` | Ngay trong miền |
| Cận trên | `UB` | Ngay trên đường biên hợp lệ |
| Trên cận trên | `UB+1` | Ngoài miền hợp lệ |

**[Hướng dẫn triển khai AI — bổ sung]** Ký hiệu ±1 chỉ đúng với miền **số nguyên có bước 1**. Với thời gian, số thập phân, tiền, độ dài chuỗi hoặc giới hạn mở, phải biết mức độ chính xác/độ hạt hợp lệ (`δ`) và xét các giá trị lân cận có thể biểu diễn; không tự dùng `±1` cho mọi kiểu dữ liệu. Với `[LB, UB)` thì `UB` là **không hợp lệ**, không được máy móc áp dụng ý nghĩa cận đóng.

### 7.3. Kết hợp biến khi kiểm thử biên

Hai chiến lược thể hiện trong các hình ở trang 22–25:

- **Single-fault / one-variable-at-a-time:** Lần lượt thay đổi một biến tại các điểm biên, giữ những biến khác ở giá trị danh định. Đây là cơ sở của Standard BVA và Robustness.
- **Combinatorial / Cartesian product:** Kết hợp mọi lựa chọn điểm của tất cả biến để kiểm tra tương tác. Đây là cơ sở của Worst-case và Robust Worst-case.

## 8. Bốn biến thể BVA và công thức

**[Theo slide, trang 22–25]** Các công thức dưới đây giả định mỗi biến có miền có **hai cận phân biệt**, đủ vị trí lân cận và một giá trị danh định; mọi điểm kết hợp là test khác nhau.

| Kỹ thuật | Các điểm được chọn cho *mỗi biến* | Cách kết hợp | Số ca cho n biến |
|---|---|---|---|
| **Standard BVA** | `LB`, `LB+1`, `UB-1`, `UB` + nominal | Một biến thay đổi, biến khác nominal | **4n + 1** |
| **Robustness Testing** | `LB-1`, `LB`, `LB+1`, `UB-1`, `UB`, `UB+1` + nominal | Một biến thay đổi, biến khác nominal | **6n + 1** |
| **Worst-case Testing** | `LB`, `LB+1`, nominal, `UB-1`, `UB` | Tích Descartes của mọi biến | **5^n** |
| **Robust Worst-case Testing** | `LB-1`, `LB`, `LB+1`, nominal, `UB-1`, `UB`, `UB+1` | Tích Descartes của mọi biến | **7^n** |

> **Quan trọng khi đọc PDF:** Trong bản trích xuất văn bản tự động, số mũ tại trang 24–25 có thể hiển thị thành `5n`/`7n`. Trên hình slide gốc là **5ⁿ** và **7ⁿ**, không phải `5 × n` hay `7 × n`.

### Vì sao có các công thức?

- **Standard:** 1 ca tất cả nominal + 4 vị trí biên cho từng trong n biến → `1 + 4n`.
- **Robustness:** 1 ca nominal + 6 vị trí (gồm 2 ngoài miền) cho từng biến → `1 + 6n`.
- **Worst-case:** Mỗi biến có 5 lựa chọn, kết hợp mọi biến → `5 × 5 × ... × 5 = 5^n`.
- **Robust worst-case:** Mỗi biến có 7 lựa chọn, kết hợp mọi biến → `7^n`.

| Số biến n | Standard | Robustness | Worst-case | Robust worst-case |
|---:|---:|---:|---:|---:|
| 1 | 5 | 7 | 5 | 7 |
| 2 | 9 | 13 | 25 | 49 |
| 3 | 13 | 19 | 125 | 343 |
| 4 | 17 | 25 | 625 | 2401 |

**[Lưu ý về áp dụng]** Các công thức là số lượng lý thuyết theo mô hình điểm biên. Khi miền hẹp làm các điểm trùng nhau, ràng buộc giữa các biến khiến tổ hợp không hợp lệ, hoặc có các cận mở, số test case hữu ích thực tế có thể khác. Không tự gắn nhãn “tối thiểu” cho mọi đặc tả.

### Cấu trúc thuật toán sinh test case BVA — bổ sung cho AI

```text
Input:
  danh sách input đã có kiểu dữ liệu, miền hợp lệ, LB, UB,
  bước lân cận delta, giá trị nominal hợp lệ, mode

For each input i:
  standard_points[i] = [LB, LB+delta, UB-delta, UB]
  robust_points[i]   = [LB-delta, LB, LB+delta,
                        UB-delta, UB, UB+delta]
  worst_points[i]    = [LB, LB+delta, nominal, UB-delta, UB]
  robust_worst[i]    = [LB-delta, LB, LB+delta,
                        nominal, UB-delta, UB, UB+delta]

If mode in {standard, robustness}:
  emit one test with every input = nominal
  for each input i:
    for each designated boundary point p of i:
      emit test with input[i] = p and all other inputs = nominal

If mode in {worst_case, robust_worst_case}:
  emit every vector in CartesianProduct(per-input point sets)

For every generated test:
  determine validity against the full specification
  derive expected result using an independent test oracle
  annotate source requirement, boundary targeted, coverage
  deduplicate identical input vectors (record impact on formula)
```

**Không làm sai yêu cầu bằng cách:** (1) gọi kết hợp mọi biến là Standard BVA; (2) bỏ các ca ngoài miền ở Robustness; (3) tính `5n` thay vì `5^n`; (4) suy ra expected output không có đủ oracle/đặc tả.

## 9. Bộ test case BVA của chương trình cộng hai số

**[Theo slide, trang 26]** Bảng của bài giảng có 12 ca, thay đổi A hoặc B tại các điểm cận và lân cận cận. Dưới đây giữ giá trị input của slide nhưng **sửa expected SUM sai số học** và chú thích khác biệt.

| TC | Lớp/biên cần kiểm tra | A | B | Expected đúng theo đặc tả | Đối chiếu slide |
|---|---|---:|---:|---|---|
| TC1 | A = LB = −99 | −99 | 9 | **−90** | Slide ghi **90** (sai dấu) |
| TC2 | A = LB+1 = −98 | −98 | 9 | **−89** | Slide ghi **89** (sai dấu) |
| TC3 | A = UB−1 = 98 | 98 | 9 | 107 | Đúng |
| TC4 | A = UB = 99 | 99 | 9 | 108 | Đúng |
| TC5 | A = LB−1 = −100 | −100 | 9 | Thông báo lỗi | Đúng |
| TC6 | A = UB+1 = 100 | 100 | 9 | Thông báo lỗi | Đúng |
| TC7 | B = LB = −99 | 10 | −99 | **−89** | Slide ghi **89** (sai dấu) |
| TC8 | B = LB+1 = −98 | 10 | −98 | **−88** | Slide ghi **88** (sai dấu) |
| TC9 | B = UB−1 = 98 | 10 | 98 | 108 | Đúng |
| TC10 | B = UB = 99 | 10 | 99 | 109 | Đúng |
| TC11 | B = LB−1 = −100 | −10 | −100 | Thông báo lỗi | Giá trị A=−10 vẫn hợp lệ; đúng theo slide |
| TC12 | B = UB+1 = 100 | 10 | 100 | Thông báo lỗi | Đúng |

**[Lưu ý/đính chính quan trọng]** Slide 26 hiển thị `90`, `89`, `89`, `88` tại TC1, TC2, TC7, TC8 trong khi phép cộng số nguyên tương ứng cho kết quả **−90, −89, −89, −88**. Khi tạo expected result, AI phải tính theo **đặc tả cộng số**, không sao chép nhầm phép tính slide. Việc đính chính này là đánh giá độc lập của tài liệu, không phải phát biểu gốc của giảng viên.

Ngoài ra, bộ 12 ca ở trang 26 là tập **biên hợp lệ và biên ngoài miền** theo dạng one-variable-at-a-time, **không phải toàn bộ 13 ca Robustness chuẩn của hai biến**, vì không có ca all-nominal chung. Thêm `(A,B)=(10,9) → 19` sẽ thành 13 ca theo mô hình `6n+1`; TC11 của slide dùng A=−10 thay vì nominal A=10, nhưng vẫn hợp lệ nên vẫn kiểm tra được vi phạm ở B.

## 10. Quy trình AI tạo test case từ đặc tả

> **[Hướng dẫn triển khai AI — bổ sung]** Mục này được thiết kế để làm workflow skill. Đây là sự hệ thống hóa dựa trên bài giảng, không phải quy trình được viết sẵn trong slide.

### Giai đoạn A — Hiểu đặc tả trước khi sinh ca

1. Đọc toàn bộ yêu cầu, UI/API contract, schema, validation rules, business rules có liên quan.
2. Trích xuất mọi input/output cùng các điều kiện kiểm tra. Ghi **đơn vị**, cận đóng/mở, kiểu, tập giá trị, mẫu định dạng, độ dài và ràng buộc liên biến.
3. Xác định kết quả dự kiến trên từng nhóm hợp lệ/không hợp lệ: mã HTTP, response body, UI message, DB state, v.v., chỉ khi có nguồn đặc tả.
4. Lập danh sách **ambiguities** (các thông tin thiếu hoặc mâu thuẫn). Không tự đoán validator hoặc nghiệp vụ.
5. Nếu không biết miền để chia lớp hay oracle để xác định expected result, **dừng phần tương ứng và hỏi lại**.

### Giai đoạn B — Sinh lớp EP

1. Với mỗi điều kiện, chọn dạng: giá trị đơn / khoảng / tập / kiểu-boolean / quy tắc liên biến / output.
2. Chia thành các lớp valid và invalid có mô tả chính xác, không chồng lắp không cần thiết.
3. Đặt ID (`EC01`, `EC02`, …); ghi rõ nguồn yêu cầu, trường, điều kiện, loại, đại diện và các ranh giới nếu có.
4. Phối hợp các điều kiện của cùng trường: một giá trị chỉ valid cho hệ thống khi **đáp ứng tất cả** ràng buộc tương ứng.
5. Đối với valid ECs, ghép để phủ nhiều EC trong một ca khi hợp lý.
6. Đối với invalid ECs, cô lập từng lỗi: một EC invalid, các input/điều kiện khác valid (theo nguyên tắc slide).
7. Kiểm tra đầu ra hợp lệ và đầu ra lỗi cũng đã được bao phủ.

### Giai đoạn C — Sinh test case BVA

1. Xác định phân vùng có thứ tự và cận dưới/trên.
2. Với từng cận, xác nhận kiểu cận (đóng/mở), bước giá trị nhỏ nhất `δ`, giá trị nominal hợp lệ.
3. Chọn một trong bốn mode Standard / Robustness / Worst-case / Robust Worst-case theo yêu cầu; **không tự chọn worst-case** khi số tổ hợp quá lớn.
4. Sinh vector test đúng mode bằng thuật toán ở mục 8.
5. Kiểm tra mỗi vector bằng toàn bộ các ràng buộc; phân loại kết quả. Nếu không xác định được expected output thì đánh dấu `requires_oracle`.
6. Nếu có biên **đầu ra**, xác định input nào gây ra output biên; chỉ làm khi đủ thông tin quan hệ input/output.
7. Đánh dấu các ca trùng với EP; có thể gộp khi input/output, mục tiêu và coverage được bảo toàn.

### Giai đoạn D — Kiểm soát chất lượng trước khi bàn giao

1. Mỗi điều kiện đầu vào/đầu ra phải có EC được ghi nhận, hoặc nêu lý do chưa làm được.
2. Mỗi invalid EC phải có ít nhất một ca cô lập lỗi nếu có thể đưa vào SUT.
3. Các điểm biên phải đúng cận và đúng kiểu dữ liệu; không nhầm `>` với `≥` hoặc `<` với `≤`.
4. Mỗi output expected có phép tính hoặc nguồn oracle kiểm chứng độc lập.
5. Không sinh test không thể thực thi (ví dụ API integer parser không thể nhận JSON number `1.25` như `Integer` mà không phân biệt lỗi binding và nghiệp vụ).
6. Không coi thiếu `401/403`, thay đổi DB, lỗi mạng… là test của EP/BVA nếu không thuộc đặc tả/đề bài.
7. Đảm bảo test case độc lập, có thể thực thi lặp lại và có traceability.
8. Báo cáo coverage, test count, phần chưa rõ và rủi ro còn lại.

## 11. Định dạng đầu ra và checklist cho AI skill

> **[Hướng dẫn triển khai AI — bổ sung]** Mẫu đầu ra đề xuất khi agent phân tích feature hay bài tập kiểm thử.

### 11.1. Input cần có

```yaml
feature: "Sum two integers"
source_requirement: "Each integer is between -99 and 99 inclusive"
inputs:
  - name: A
    type: integer
    min: -99
    max: 99
    min_inclusive: true
    max_inclusive: true
  - name: B
    type: integer
    min: -99
    max: 99
    min_inclusive: true
    max_inclusive: true
outputs:
  valid: "A + B"
  invalid: "Error message (exact text unspecified)"
techniques:
  - equivalence_partitioning
  - boundary_value_analysis
bva_mode: robustness
```

### 11.2. Bảng EC xuất ra

| EC ID | Requirement | Input/Output | Condition | Validity | Representative | Notes |
|---|---|---|---|---|---|---|
| EC01 | R01 | A | integer AND −99 ≤ A ≤ 99 | valid | 10 | Cận đóng |
| EC02 | R01 | A | integer AND A < −99 | invalid | −102 | Dưới miền |
| … | … | … | … | … | … | … |

### 11.3. Bảng test case xuất ra

| TC ID | Technique | Covered EC / boundary | Preconditions | Inputs | Steps | Expected result | Source |
|---|---|---|---|---|---|---|---|
| TC01 | EP | EC01, EC05, EC09 | System ready | A=10,B=9 | Submit both inputs | SUM=19 | Slide 18 |
| TC02 | EP | EC02, EC10 | System ready | A=−102,B=9 | Submit both inputs | Error message | Slide 18 |

Đối với API thực tế, có thể thêm `HTTP method`, `endpoint`, `headers/auth`, `request body`, `expected status`, `response schema`, `database postcondition`; **chỉ điền các trường biết từ yêu cầu**. Các trường thiếu để `TBD`.

### 11.4. Coverage report

```text
Requirements parsed: N
EP classes: V valid + I invalid + O output classes
EP classes covered: C / (V + I + O)
BVA mode: Standard | Robustness | Worst-case | Robust Worst-case
Theoretical BVA count: formula result (if prerequisites hold)
Actual unique BVA tests: M
Deduplicated test vectors: D
Unresolved ambiguity/oracle issues: [...] 
```

### 11.5. Checklist bắt buộc

- [ ] Đọc và trích đúng điều kiện từ đặc tả; chỉ rõ nguồn.
- [ ] Liệt kê đủ input và output.
- [ ] Phân biệt lớp hợp lệ và không hợp lệ; phân biệt input và output.
- [ ] Ràng buộc kết hợp (`AND`) được áp dụng chính xác.
- [ ] EP có các test hợp lệ phủ nhiều EC, các test invalid cô lập lỗi.
- [ ] Có bảng EC → testcase (traceability).
- [ ] BVA xét đúng cận đóng/mở và đơn vị nhỏ nhất của dữ liệu.
- [ ] Chọn đúng mode BVA và đúng công thức (`5^n`, `7^n`).
- [ ] Expected results kiểm tra độc lập (đặc biệt với tính toán số âm).
- [ ] Không tạo thêm nghiệp vụ chưa được xác nhận.
- [ ] Không ghi “100% coverage” nếu chỉ kiểm tra coverage theo các EC đã biết.
- [ ] Báo cáo rõ giả định, chỗ thiếu thông tin, ca trùng lặp và giới hạn.

### 11.6. Mẫu chỉ dẫn có thể đặt trong `SKILL.md`

```markdown
# EP and BVA Test Case Design

## Objective
Derive traceable, executable black-box test cases from a supplied specification
using equivalence partitioning and boundary value analysis.

## Required workflow
1. Read the full specification; extract inputs, outputs, conditions, and ambiguities.
2. Build valid and invalid equivalence-class tables, including output classes.
3. Generate EP test cases: combine valid classes where possible; isolate one
   invalid class per negative test while keeping other inputs valid.
4. Identify ordered domains, exact boundaries, inclusivity, and data granularity.
5. Generate BVA tests only in the requested mode; show formula and actual count.
6. Derive every expected result independently from the specified behavior.
7. Verify arithmetic, boundary membership, traceability, and duplicates.
8. Report missing specifications instead of inventing business rules.

## Output
- Requirements & assumptions table
- Equivalence-class table
- EP test-case table
- Boundary table and BVA test-case table
- Coverage mapping, counts, unresolved questions

## Reference
See `references/bai-4-ep-bva.md` (this detailed lesson document).
```

## 12. Sai sót, mơ hồ và giới hạn cần kiểm soát

### 12.1. Những điểm cần đặc biệt chú ý khi bám sát slide

| Vị trí | Vấn đề | Hành động đúng khi tạo skill |
|---|---|---|
| Trang 1–2 | “1–2 chữ số” có thể diễn giải khác với miền [−99,99]; bài giảng tính cả 0 | Dùng miền số nguyên của slide; ghi lại điểm mơ hồ nếu dùng cho SUT khác |
| Trang 5 | Cách diễn đạt “một giá trị lỗi ⇒ cả lớp lỗi” là giả định hữu ích chứ không bảo đảm logic | Không khẳng định kiểm thử một giá trị chứng minh cả lớp đúng/sai |
| Trang 10 | Các phần tử trong tập `{A,B,C}` được liệt kê riêng ở phần valid | Quyết định chia riêng theo hành vi và mục tiêu coverage |
| Trang 11 | Gọi “số nguyên dương” nhưng ghi `0 ≤ X < 100` | Ưu tiên điều kiện toán rõ ràng; nêu xung đột thuật ngữ |
| Trang 14 | Tam giác thường/cân/đều/vuông có thể giao nhau | Không tự định nghĩa độ ưu tiên hay lớp đầu ra loại trừ nhau |
| Trang 24–25 | PDF text parser có thể làm mất định dạng số mũ | Dùng **5^n**, **7^n** theo hình gốc |
| Trang 26 | TC1, TC2, TC7, TC8 sai dấu kết quả phép cộng | Sửa thành −90, −89, −89, −88 |
| Trang 26 | Bộ 12 ca không chứa all-nominal | Không gọi là toàn bộ 13 ca Robustness của n=2 |

### 12.2. Giới hạn phạm vi bài học

Nguồn chỉ trình bày **EP và BVA**. Bài giảng **không mô tả chi tiết**: quy trình automation bằng Selenium/Playwright/Postman, cấu trúc thư mục agent, tạo code JUnit, thực thi HTTP, assertions sâu về DB, mutation testing, decision table, state transition, pairwise hoặc kiểm thử bảo mật. Nếu AI skill cần thực hiện các bước đó, phải tham chiếu tài liệu khác và đánh dấu là phạm vi mở rộng.

### 12.3. Phân biệt thiết kế ca kiểm thử và chạy ca kiểm thử

- **Design:** Từ đặc tả sinh EC, biên, input và expected result.
- **Execution:** Tạo request/click UI, thu actual result, đối chiếu expected, ghi Pass/Fail/Blocked.
- **Reporting:** Tổng hợp defect, log, bằng chứng và coverage.

Slide tập trung vào **design**, không dạy chi tiết **execution** và **reporting**. Một AI skill tự động end-to-end cần tách ba giai đoạn để không coi test case sinh ra là test case đã chạy.

## 13. Bảng đối chiếu nguồn slide

| Trang | Nội dung chính được đưa vào tài liệu |
|---:|---|
| 1–3 | Bài toán cộng hai số, 39.601 cặp hợp lệ, nhu cầu tối ưu kiểm thử |
| 4–6 | Khái niệm EP, 3 bước thiết kế |
| 7 | Xác định A, B, SUM và thông báo lỗi |
| 8–9 | Valid/invalid equivalence classes, EC1–EC10 |
| 10 | Quy tắc phân hoạch theo giá trị, khoảng, tập và Boolean |
| 11 | Ví dụ số nguyên [0,100) |
| 12 | Ví dụ chuỗi 7 ký tự, ký tự đầu viết hoa |
| 13 | Ví dụ tọa độ (X,Y) |
| 14 | Ví dụ lớp đầu ra phân loại tam giác |
| 15 | Nguyên tắc lựa chọn giá trị, gộp valid và cô lập invalid |
| 16 | Các giá trị đại diện EC1–EC10 |
| 17–18 | Tạo rồi rút gọn thành 7 test case EP |
| 19–20 | Mục tiêu BVA, lỗi cận 25 và 52 |
| 21 | Sơ đồ ranh giới và việc chọn biên input/output |
| 22 | Standard BVA: `4n+1` |
| 23 | Robustness: `6n+1` |
| 24 | Worst-case: `5^n` |
| 25 | Robust worst-case: `7^n` |
| 26 | 12 test case biên cho hai số; đính chính kết quả số âm |

---

**Kết luận:** EP trả lời câu hỏi **“những nhóm hành vi nào phải được kiểm tra?”**; BVA trả lời **“những giá trị sát ranh giới nào dễ phát hiện lỗi?”**. Khi xây skill cho AI, quy trình đáng tin cậy là **đọc đặc tả → lập EC → tạo test case EP → xác định biên → tạo test case BVA theo mode → tính expected độc lập → kiểm tra độ phủ và sai sót → bàn giao test case, không tự tuyên bố đã chạy test**.
