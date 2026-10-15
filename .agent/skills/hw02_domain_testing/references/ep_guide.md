# Hướng dẫn chia lớp tương đương

> Bổ sung cho `SKILL.md`. Nguồn: bài giảng (mục 4, 5 của `bai-4-ep-bva.md`). Những chỗ có đánh dấu **[bổ sung]** là diễn giải để áp dụng vào EShop.

## 1. Bốn dạng điều kiện

| Dạng | Cách chia | Lưu ý |
|---|---|---|
| Giá trị đơn | 1 lớp hợp lệ + 1 lớp không hợp lệ | Ví dụ: loại tài khoản phải bằng `user` |
| Dải giá trị | 1 lớp hợp lệ + 2 lớp không hợp lệ (dưới, trên) | Xác định cận đóng/mở trước |
| Tập giá trị | mỗi phần tử một lớp hợp lệ (nếu hành vi khác nhau) + 1 lớp ngoài tập | Ghi lý do tách/gộp |
| Boolean / kiểu | 1 lớp đúng + 1 lớp sai | Ví dụ: là số nguyên / không là số nguyên |

## 2. Phối hợp nhiều ràng buộc trên cùng một trường

Phân biệt **lớp của một điều kiện** và **lớp hợp lệ của toàn bộ đầu vào**.

Ví dụ trong bài giảng: số nguyên thuộc `[0,100)`.

| Điều kiện | Lớp |
|---|---|
| C1 — kiểu nguyên | EC1: là số nguyên (hợp lệ) · EC2: không là số nguyên (không hợp lệ) |
| C2 — khoảng `[0,100)` | EC3: `0 ≤ X < 100` (hợp lệ) · EC4: `X < 0` (không hợp lệ) · EC5: `X ≥ 100` (không hợp lệ) |

Giá trị hợp lệ tổng thể: **nguyên và** `0 ≤ X < 100`. Giá trị `50.5` ở trong khoảng nhưng sai kiểu nên không hợp lệ.

> Lưu ý bài giảng: ví dụ này gọi là "số nguyên dương" nhưng khoảng lại gồm `0`. Khi có mâu thuẫn giữa **mô tả bằng lời** và **điều kiện toán học**, ưu tiên điều kiện toán học và **ghi vào câu hỏi mở**, hỏi lại yêu cầu.

## 3. Các ví dụ bài giảng

### 3.1. Chuỗi đúng 7 ký tự, ký tự đầu là chữ hoa

| Loại | Lớp |
|---|---|
| Hợp lệ | `length = 7` và ký tự đầu là chữ hoa |
| Không hợp lệ | `length = 7` nhưng ký tự đầu không phải chữ hoa |
| Không hợp lệ | `length < 7` |
| Không hợp lệ | `length > 7` |

**[bổ sung]** Đại diện: `Abcdefg` (hợp lệ), `abcdefg`, `Abcdef`, `Abcdefgh`. "Chữ hoa" phải theo đặc tả thực tế (ASCII hay Unicode), không tự giả định.

### 3.2. Tọa độ `3 ≤ X ≤ 7` và `5 ≤ Y ≤ 9`

- X hợp lệ `[3,7]`; không hợp lệ `X < 3`, `X > 7`.
- Y hợp lệ `[5,9]`; không hợp lệ `Y < 5`, `Y > 9`.
- **[bổ sung]** Đại diện: `(5,7)` hợp lệ; `(2,7)`, `(8,7)`, `(5,4)`, `(5,10)` không hợp lệ, mỗi ca chỉ sai một tọa độ.

### 3.3. Phân loại tam giác (lớp đầu ra)

Bài giảng chỉ nêu các nhóm đầu ra: tam giác thường, cân, đều, vuông, …, không phải tam giác. **Chưa đủ để suy ra điều kiện đầu vào** và quy tắc khi các loại giao nhau (ví dụ vuông cân). Khi gặp tình huống tương tự, phải hỏi đặc tả: ba cạnh dương, bất đẳng thức tam giác, độ chính xác số thực, thứ tự ưu tiên giữa các loại, thông báo lỗi.

## 4. Áp dụng cho EShop **[bổ sung]**

Gợi ý các điều kiện thường gặp, cần **xác nhận bằng đặc tả của feature** trước khi dùng:

| Loại trường | Điều kiện nên xét | Lớp thường chia |
|---|---|---|
| Email | định dạng, độ dài, tính duy nhất | hợp lệ · thiếu `@` · thiếu miền · đã tồn tại |
| Mật khẩu | độ dài min/max, thành phần ký tự, khớp xác nhận | hợp lệ · quá ngắn · quá dài · thiếu thành phần · không khớp |
| Số lượng (giỏ hàng) | kiểu nguyên, min/max, tồn kho | hợp lệ · `< min` · `> max` · không phải số · vượt tồn kho |
| Mã giảm giá | tồn tại, hạn dùng, đơn tối thiểu | hợp lệ · không tồn tại · hết hạn · chưa đạt mức tối thiểu |
| Tệp CSV | đuôi tệp, kích thước, cột bắt buộc, dòng dữ liệu | hợp lệ · sai đuôi · thiếu cột · rỗng · quá lớn |
| Từ khóa tìm kiếm | độ dài, ký tự đặc biệt | hợp lệ · rỗng · rất dài · có ký tự đặc biệt |

Các ví dụ trên chỉ là gợi ý. **Luật thật nằm ở đặc tả.** Nếu đặc tả không nêu giới hạn, ghi `unspecified` và hỏi sinh viên.

## 5. Sai lầm hay gặp

| Sai lầm | Cách đúng |
|---|---|
| Quên lớp đầu ra | Luôn lập bảng đầu ra, kể cả đầu ra lỗi |
| Ghép hai lỗi vào một ca âm | Cô lập từng lỗi |
| Chia theo suy đoán về code | Chia theo điều kiện trong đặc tả |
| Chia tập `{A,B,C}` thành một lớp mà không giải thích | Ghi lý do |
| Coi lớp đại diện là bằng chứng cả lớp đúng | Chỉ là giả định; bổ sung BVA |
