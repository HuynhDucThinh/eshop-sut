# Bốn chế độ BVA — công thức và ví dụ

> Nguồn: bài giảng trang 19–26 (mục 7–9 của `bai-4-ep-bva.md`).

## 1. Vì sao cần biên

Đặc tả mẫu:

```text
Input < 10         → Thông báo lỗi
10 ≤ Input < 25    → "hello"
Input ≥ 25         → Thông báo lỗi
```

Hai lỗi cài đặt điển hình:
- **Sai toán tử biên:** cài `Input <= 25` thay vì `< 25`.
- **Sai giá trị biên:** cài `Input < 52` thay vì `< 25`.

Ca `Input = 25` phát hiện cả hai. Ca `Input = 54` không phát hiện lỗi nào trong hai lỗi đó. Giá trị sát cận có sức phát hiện lỗi cao hơn giá trị xa cận.

## 2. Bảy điểm chuẩn của miền đóng `[LB, UB]` (bước δ)

| Điểm | Ký hiệu | Ý nghĩa |
|---|---|---|
| Dưới cận dưới | `LB−δ` | Ngoài miền |
| Cận dưới | `LB` | Trên đường biên hợp lệ |
| Trên cận dưới | `LB+δ` | Ngay trong miền |
| Danh định | `nominal` | Hợp lệ, xa cận |
| Dưới cận trên | `UB−δ` | Ngay trong miền |
| Cận trên | `UB` | Trên đường biên hợp lệ |
| Trên cận trên | `UB+δ` | Ngoài miền |

## 3. Chọn điểm theo chế độ

| Chế độ | Điểm mỗi biến | Kết hợp | Số ca |
|---|---|---|---|
| Standard | `LB, LB+δ, UB−δ, UB` + nominal | Một biến đổi | `4n+1` |
| Robustness | `LB−δ, LB, LB+δ, UB−δ, UB, UB+δ` + nominal | Một biến đổi | `6n+1` |
| Worst-case | `LB, LB+δ, nominal, UB−δ, UB` | Tích Descartes | `5ⁿ` |
| Robust Worst-case | cả 7 điểm | Tích Descartes | `7ⁿ` |

**Suy ra công thức:**
- Standard: 1 ca toàn nominal + 4 vị trí cho mỗi trong n biến → `1 + 4n`.
- Robustness: 1 + 6 vị trí cho mỗi biến → `1 + 6n`.
- Worst-case: mỗi biến 5 lựa chọn, kết hợp mọi biến → `5 × 5 × … = 5ⁿ`.
- Robust Worst-case: mỗi biến 7 lựa chọn → `7ⁿ`.

Hai chiến lược kết hợp:
- **Single-fault (một biến một lần):** nền tảng của Standard và Robustness.
- **Tích Descartes:** nền tảng của Worst-case và Robust Worst-case, để kiểm tra tương tác giữa các biến.

## 4. Ví dụ: cộng hai số `A, B ∈ [−99, 99]`, `δ = 1`, nominal `A = 10`, `B = 9`

### Robustness `6n+1 = 13` ca (n = 2)

| TC | Biên | A | B | Expected | Hợp lệ |
|---|---|---:|---:|---|---|
| 1 | Toàn nominal | 10 | 9 | 19 | Có |
| 2 | A = LB−1 | −100 | 9 | Thông báo lỗi | Không |
| 3 | A = LB | −99 | 9 | **−90** | Có |
| 4 | A = LB+1 | −98 | 9 | **−89** | Có |
| 5 | A = UB−1 | 98 | 9 | 107 | Có |
| 6 | A = UB | 99 | 9 | 108 | Có |
| 7 | A = UB+1 | 100 | 9 | Thông báo lỗi | Không |
| 8 | B = LB−1 | 10 | −100 | Thông báo lỗi | Không |
| 9 | B = LB | 10 | −99 | **−89** | Có |
| 10 | B = LB+1 | 10 | −98 | **−88** | Có |
| 11 | B = UB−1 | 10 | 98 | 108 | Có |
| 12 | B = UB | 10 | 99 | 109 | Có |
| 13 | B = UB+1 | 10 | 100 | Thông báo lỗi | Không |

### Đính chính các kết quả sai dấu trong slide trang 26

| Ca | A | B | Slide ghi | **Đúng** |
|---|---:|---:|---:|---:|
| TC1 | −99 | 9 | 90 | **−90** |
| TC2 | −98 | 9 | 89 | **−89** |
| TC7 | 10 | −99 | 89 | **−89** |
| TC8 | 10 | −98 | 88 | **−88** |

Bộ 12 ca của slide **không có ca toàn nominal**, nên không phải bộ Robustness đầy đủ (13 ca với n = 2). Thêm `(10, 9) → 19` thì thành 13 ca.

### Số ca cho hai biến

| Chế độ | Số ca |
|---|---:|
| Standard | 9 |
| Robustness | 13 |
| Worst-case | 25 |
| Robust Worst-case | 49 |

## 5. Những điều cần lưu ý

- Công thức là số **lý thuyết**. Miền hẹp làm các điểm trùng nhau, ràng buộc liên biến khiến tổ hợp không hợp lệ, hoặc cận mở có thể làm số ca thực tế khác. Báo cáo cả hai con số.
- Cận **mở**: `[LB, UB)` thì `UB` **không hợp lệ**.
- Nhớ `5ⁿ` và `7ⁿ` là lũy thừa.

## 6. Bổ sung theo ISTQB (không có trong slide) **[bổ sung]**

Tài liệu tham chiếu của môn (ISTQB Foundation) gọi các kiểu này theo cách khác:

| Cách gọi ISTQB | Ý nghĩa | Gần với |
|---|---|---|
| BVA **2-value** | Giá trị biên và giá trị lân cận gần nhất thuộc phân vùng bên kia | Mỗi biên chọn 2 điểm |
| BVA **3-value** | Giá trị biên cùng **cả hai** lân cận | Robustness cho mỗi biên: `B−δ, B, B+δ` |

Nếu thầy hỏi bằng thuật ngữ ISTQB, có thể đối chiếu như bảng trên. Bài làm vẫn trình bày theo **bốn chế độ của bài giảng**.
