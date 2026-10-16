<#
.SYNOPSIS
  Chuyển file Markdown sang PDF (đề bài mục 14: báo cáo nộp cả .md và .pdf).

.DESCRIPTION
  Quy trình: Markdown -> HTML (npx marked, hỗ trợ bảng GFM) -> PDF (Microsoft Edge hoặc Chrome headless).
  Ảnh tương đối trong .md được giữ nguyên vì file HTML tạm đặt cạnh file .md rồi bị xóa sau khi xuất.
  Yêu cầu: Node.js (npx) có mạng lần đầu để tải `marked`; Edge hoặc Chrome đã cài.

.PARAMETER Path
  Một hoặc nhiều file .md cần chuyển.

.PARAMETER OutDir
  Thư mục đặt PDF. Mặc định: cùng thư mục với file .md.

.EXAMPLE
  ./.agent/skills/hw02_orchestrator/scripts/md_to_pdf.ps1 -Path reports/Main_Report.md,reports/Bug_Report.md
#>
param(
  [Parameter(Mandatory = $true)][string[]]$Path,
  [string]$OutDir
)

$ErrorActionPreference = 'Stop'

function Find-Browser {
  $candidates = @(
    "$env:ProgramFiles (x86)\Microsoft\Edge\Application\msedge.exe",
    "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
    "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe"
  )
  foreach ($c in $candidates) { if (Test-Path $c) { return $c } }
  return $null
}

$browser = Find-Browser
if (-not $browser) { Write-Error 'Không tìm thấy Microsoft Edge hoặc Google Chrome.'; exit 2 }
if (-not (Get-Command npx -ErrorAction SilentlyContinue)) { Write-Error 'Không tìm thấy npx (cần Node.js).'; exit 2 }

$css = @'
body{font-family:"Segoe UI",Arial,sans-serif;font-size:11pt;line-height:1.5;margin:0 12px;color:#111}
h1,h2,h3{page-break-after:avoid}
table{border-collapse:collapse;width:100%;font-size:9pt;margin:8px 0}
th,td{border:1px solid #888;padding:4px 6px;vertical-align:top;word-break:break-word}
th{background:#eee}
code{font-family:Consolas,monospace;font-size:9pt;background:#f3f3f3;padding:0 2px}
pre{background:#f3f3f3;padding:8px;white-space:pre-wrap;word-break:break-word}
img{max-width:100%}
'@

foreach ($file in $Path) {
  $md = (Resolve-Path -LiteralPath $file).Path
  $mdDir = Split-Path -Parent $md
  $name = [System.IO.Path]::GetFileNameWithoutExtension($md)
  $targetDir = if ($OutDir) { (New-Item -ItemType Directory -Force -Path $OutDir).FullName } else { $mdDir }
  $pdf = Join-Path $targetDir "$name.pdf"
  $fragment = Join-Path $mdDir "$name.__fragment.html"
  $html = Join-Path $mdDir "$name.__print.html"

  try {
    npx --yes marked --gfm -i $md -o $fragment | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "marked thất bại với $md" }
    $body = [System.IO.File]::ReadAllText($fragment, [System.Text.Encoding]::UTF8)
    $page = "<!DOCTYPE html><html><head><meta charset=`"utf-8`"><title>$name</title><style>$css</style></head><body>$body</body></html>"
    [System.IO.File]::WriteAllText($html, $page, (New-Object System.Text.UTF8Encoding($false)))

    $uri = ([System.Uri]$html).AbsoluteUri
    $browserArgs = @('--headless=new', '--disable-gpu', '--no-pdf-header-footer', "--print-to-pdf=`"$pdf`"", "`"$uri`"")
    Start-Process -FilePath $browser -ArgumentList $browserArgs -Wait -WindowStyle Hidden
    $deadline = (Get-Date).AddSeconds(30)
    while (-not (Test-Path $pdf) -and (Get-Date) -lt $deadline) { Start-Sleep -Milliseconds 300 }
    if (-not (Test-Path $pdf)) { throw "Không tạo được PDF cho $md" }
    Write-Host ("Đã tạo {0} ({1} KB)" -f $pdf, [math]::Round((Get-Item $pdf).Length / 1KB))
  }
  finally {
    Remove-Item -LiteralPath $fragment, $html -Force -ErrorAction SilentlyContinue
  }
}
