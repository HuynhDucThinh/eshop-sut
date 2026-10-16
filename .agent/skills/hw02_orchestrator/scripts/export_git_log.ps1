<#
.SYNOPSIS
  Xuất lịch sử commit Git ra file văn bản UTF-8 để nộp (quy định §6, đề bài mục 12).

.DESCRIPTION
  Mỗi dòng: <mã ngắn> | <ngày giờ> | <tác giả> | <thông điệp>. Mới nhất ở đầu.
  Chỉ ĐỌC lịch sử (git log), không thay đổi repository.

.PARAMETER Output
  Đường dẫn file đầu ra. Mặc định: reports/git_commit_log.txt

.EXAMPLE
  ./.agent/skills/hw02_orchestrator/scripts/export_git_log.ps1 -Output reports/git_commit_log.txt
#>
param(
  [string]$Output = 'reports/git_commit_log.txt'
)

$ErrorActionPreference = 'Stop'

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Error 'Không tìm thấy lệnh git trong PATH.'
  exit 2
}

$fullPath = if ([System.IO.Path]::IsPathRooted($Output)) { $Output } else { [System.IO.Path]::GetFullPath((Join-Path (Get-Location).Path $Output)) }
$dir = Split-Path -Parent $fullPath
if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }

$lines = git -c core.quotepath=false log --date=format:'%Y-%m-%d %H:%M:%S %z' --pretty=format:'%h | %ad | %an | %s'
if ($LASTEXITCODE -ne 0) { Write-Error 'git log thất bại.'; exit 1 }

[System.IO.File]::WriteAllLines($fullPath, [string[]]$lines, (New-Object System.Text.UTF8Encoding($false)))

Write-Host "Đã ghi $(@($lines).Count) commit vào $Output"
