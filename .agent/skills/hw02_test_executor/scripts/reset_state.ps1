<#
.SYNOPSIS
  Reset dữ liệu của SUT EShop (chạy lại database.js) trước khi chạy nhóm test có trạng thái.

.DESCRIPTION
  CẢNH BÁO: lệnh này XÓA và tạo lại dữ liệu trong cơ sở dữ liệu của SUT demo.
  Phải có sự đồng ý của sinh viên trước khi chạy. Mặc định chỉ in cảnh báo; thêm -Yes để thực sự chạy.

.PARAMETER BackendPath
  Đường dẫn tới thư mục backend của eshop-sut (nơi có database.js).

.PARAMETER Yes
  Xác nhận đồng ý xóa/tạo lại dữ liệu.

.EXAMPLE
  ./reset_state.ps1 -BackendPath "D:\eshop-sut\backend" -Yes
#>
param(
  [Parameter(Mandatory = $true)][string]$BackendPath,
  [switch]$Yes
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path (Join-Path $BackendPath 'database.js'))) {
  Write-Error "Không tìm thấy database.js trong '$BackendPath'. Kiểm tra lại đường dẫn."
  exit 2
}

if (-not $Yes) {
  Write-Host "CẢNH BÁO: lệnh này sẽ XÓA và tạo lại dữ liệu của SUT tại '$BackendPath'." -ForegroundColor Yellow
  Write-Host "Chạy lại với tham số -Yes nếu bạn đồng ý." -ForegroundColor Yellow
  exit 1
}

Push-Location $BackendPath
try {
  Write-Host "Đang reset dữ liệu SUT ..."
  node database.js
  Write-Host "Hoàn tất. Hãy khởi động lại backend (node server.js) nếu cần." -ForegroundColor Green
}
finally {
  Pop-Location
}
