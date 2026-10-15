# Thang điểm HW02 và cách đạt điểm cao

> Nguồn: đề bài HW02 mục 15 và chính sách bài tập: *"chấm theo số lượng và chất lượng sản phẩm"*; *"số test case và bug là cơ sở phân hóa"*.

## 1. Thang điểm

| Tiêu chí | Tối đa |
|---|---:|
| Feature A (Domain + Boundary) | 25 |
| Feature B (Domain + Boundary) | 25 |
| Feature C (Domain + Boundary) | 25 |
| Feature D — Mobile (Domain + Boundary) | 15 |
| Agent Skills (+ video demo YouTube) | 10 |
| **Tổng** | **100** |

## 2. Một feature đạt điểm cao khi có đủ

**Domain Testing (EP)**
- [ ] Trích đặc tả có nguồn, có danh sách điểm mơ hồ
- [ ] Bảng đầu vào/đầu ra đầy đủ, cả lớp đầu ra
- [ ] Bảng EC valid/invalid, có giải thích vì sao chia như vậy
- [ ] Test case EP gộp valid, cô lập từng invalid
- [ ] Bảng truy vết EC → test case

**BVA**
- [ ] Bảng biên với kiểu cận đóng/mở và δ
- [ ] Mode BVA được chọn có lý do, công thức và số lượng đúng
- [ ] Test case biên, expected tính độc lập
- [ ] Bổ sung ca biên/bảo mật do sinh viên (sau human review)

**Thực thi và bug**
- [ ] Lệnh chạy thật, kết quả thật, Pass/Fail/Blocked rõ
- [ ] Bug có ảnh, mô tả do sinh viên viết, có Issue trên GitHub

**AI**
- [ ] AI Gap Analysis: ghi cả ca/bug AI bỏ sót và **vì sao**
- [ ] AI Audit đầy đủ, AI Critique 200–300 từ

## 3. Agent Skills (10 điểm)

- [ ] Bộ skill tái sử dụng được cho feature khác (không gắn cứng vào một FR)
- [ ] Có skill cho Domain Testing và BVA, hướng dẫn **đúng từng bước** của bài giảng
- [ ] Có cơ chế tự ghi log AI (Audit)
- [ ] Có **video YouTube** trình bày end-to-end trên một feature hoàn chỉnh, sinh viên tự quay có giọng nói
- [ ] Link video có trong README

## 4. Điểm trừ thường gặp

| Lỗi | Hậu quả |
|---|---|
| Thiếu tài liệu bắt buộc | 0 điểm |
| Sao chép (kể cả prompt) | 0 điểm cả hai |
| Nộp đầu ra AI thô, không review | Mất điểm chất lượng |
| Expected result lấy từ code | Che mất bug, mất điểm |
| Số liệu README không khớp báo cáo | Mất điểm tin cậy |
| Không giải thích được khi vấn đáp | Ảnh hưởng điểm |
