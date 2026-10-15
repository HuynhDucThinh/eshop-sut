#!/usr/bin/env node
/**
 * run_cases.js — chạy hàng loạt test case API và ghi kết quả thật.
 *
 * Cách dùng:
 *   node run_cases.js <cases.json> [--out <đường dẫn không đuôi>] [--timeout <ms>]
 *
 * Yêu cầu: Node.js 18 trở lên (có sẵn fetch). Không cần cài thư viện.
 *
 * Đầu ra:
 *   <out>.json  — kết quả chi tiết (Actual, trạng thái, lệnh)
 *   <out>.md    — bảng Markdown dán được vào Main_Report.md
 *
 * Trạng thái:
 *   Pass    — status và nội dung kỳ vọng đều khớp
 *   Fail    — khác kỳ vọng
 *   Blocked — không gọi được (lỗi mạng/hết thời gian)
 *   Not run — ca bị đánh dấu "skip"
 */

const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const args = { file: null, out: null, timeout: 15000 };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--out') args.out = argv[++i];
    else if (a === '--timeout') args.timeout = Number(argv[++i]);
    else if (!args.file) args.file = a;
  }
  return args;
}

const SENSITIVE_HEADERS = ['authorization', 'cookie', 'x-api-key'];

function maskHeaders(headers) {
  const masked = {};
  for (const [k, v] of Object.entries(headers || {})) {
    masked[k] = SENSITIVE_HEADERS.includes(k.toLowerCase()) ? '***' : v;
  }
  return masked;
}

function buildBody(c) {
  if (c.body === undefined || c.body === null) return undefined;
  return typeof c.body === 'string' ? c.body : JSON.stringify(c.body);
}

function buildCurl(url, method, headers, body) {
  const parts = [`curl -i -X ${method} "${url}"`];
  for (const [k, v] of Object.entries(headers)) parts.push(`-H "${k}: ${v}"`);
  if (body !== undefined) parts.push(`-d '${body.replace(/'/g, "'\\''")}'`);
  return parts.join(' ');
}

function buildPowerShell(url, method, headers, body) {
  const h = Object.entries(headers)
    .map(([k, v]) => `'${k}'='${String(v).replace(/'/g, "''")}'`)
    .join('; ');
  let cmd = `Invoke-WebRequest -Uri "${url}" -Method ${method} -SkipHttpErrorCheck`;
  if (h) cmd += ` -Headers @{${h}}`;
  if (body !== undefined) cmd += ` -Body '${body.replace(/'/g, "''")}'`;
  return cmd;
}

function escapeCell(text) {
  return String(text === undefined ? '' : text)
    .replace(/\|/g, '\\|')
    .replace(/\r?\n/g, ' ')
    .trim();
}

function shorten(text, n = 160) {
  const s = String(text || '');
  return s.length > n ? s.slice(0, n) + '…' : s;
}

async function runCase(cfg, c, timeoutMs) {
  const method = (c.method || 'GET').toUpperCase();
  const url = (cfg.baseUrl || '').replace(/\/$/, '') + c.path;
  const headers = Object.assign({}, cfg.defaultHeaders || {}, c.headers || {});
  const body = buildBody(c);
  if (body !== undefined && !Object.keys(headers).some(h => h.toLowerCase() === 'content-type')) {
    headers['Content-Type'] = 'application/json';
  }

  const result = {
    id: c.id,
    title: c.title || '',
    covers: c.covers || '',
    method,
    url,
    headers: maskHeaders(headers),
    body: c.body === undefined ? null : c.body,
    expectStatus: c.expectStatus === undefined ? null : c.expectStatus,
    expectBodyIncludes: c.expectBodyIncludes || [],
    expectBodyExcludes: c.expectBodyExcludes || [],
    expectedNote: c.expectedNote || '',
    curl: buildCurl(url, method, maskHeaders(headers), body),
    powershell: buildPowerShell(url, method, maskHeaders(headers), body),
    actualStatus: null,
    actualBody: '',
    status: 'Not run',
    reasons: [],
    durationMs: null,
  };

  if (c.skip) {
    result.reasons.push(c.skipReason || 'Ca bị đánh dấu skip');
    return result;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = Date.now();
  try {
    const res = await fetch(url, { method, headers, body, signal: controller.signal });
    result.durationMs = Date.now() - started;
    result.actualStatus = res.status;
    result.actualBody = await res.text();
  } catch (err) {
    result.durationMs = Date.now() - started;
    result.status = 'Blocked';
    result.reasons.push(`Không gọi được: ${err.name === 'AbortError' ? 'hết thời gian' : err.message}`);
    return result;
  } finally {
    clearTimeout(timer);
  }

  let ok = true;
  if (result.expectStatus !== null && result.actualStatus !== result.expectStatus) {
    ok = false;
    result.reasons.push(`Status ${result.actualStatus} ≠ mong đợi ${result.expectStatus}`);
  }
  for (const s of result.expectBodyIncludes) {
    if (!result.actualBody.includes(s)) {
      ok = false;
      result.reasons.push(`Thiếu trong body: "${s}"`);
    }
  }
  for (const s of result.expectBodyExcludes) {
    if (result.actualBody.includes(s)) {
      ok = false;
      result.reasons.push(`Không được xuất hiện trong body: "${s}"`);
    }
  }
  result.status = ok ? 'Pass' : 'Fail';
  return result;
}

function renderMarkdown(cfg, results) {
  const lines = [];
  const count = s => results.filter(r => r.status === s).length;
  lines.push(`<!-- Sinh tự động bởi run_cases.js lúc ${new Date().toISOString()} -->`);
  lines.push(`**Tổng:** ${results.length} · **Pass:** ${count('Pass')} · **Fail:** ${count('Fail')} · **Blocked:** ${count('Blocked')} · **Not run:** ${count('Not run')}`);
  lines.push('');
  lines.push('| TC ID | Phủ (EC/Biên) | Lệnh (curl) | Mong đợi | Thực tế | Trạng thái | Ghi chú |');
  lines.push('|---|---|---|---|---|---|---|');
  for (const r of results) {
    const expect = r.expectStatus !== null ? `HTTP ${r.expectStatus}` : '';
    const note = r.expectedNote ? `${r.expectedNote}` : '';
    const expectCell = [expect, note].filter(Boolean).join('; ');
    const actualCell = r.actualStatus !== null ? `HTTP ${r.actualStatus}: ${shorten(r.actualBody)}` : '';
    lines.push(
      `| ${escapeCell(r.id)} | ${escapeCell(r.covers)} | \`${escapeCell(r.curl)}\` | ${escapeCell(expectCell)} | ${escapeCell(actualCell)} | **${r.status}** | ${escapeCell(r.reasons.join('; '))} |`
    );
  }
  lines.push('');
  lines.push('### Lệnh PowerShell tương đương (để chạy lại)');
  lines.push('');
  for (const r of results) {
    lines.push(`- **${r.id}**: \`${r.powershell}\``);
  }
  lines.push('');
  return lines.join('\n');
}

async function main() {
  const args = parseArgs(process.argv);
  if (!args.file) {
    console.error('Cách dùng: node run_cases.js <cases.json> [--out <đường dẫn>] [--timeout <ms>]');
    process.exit(2);
  }
  if (typeof fetch !== 'function') {
    console.error('Cần Node.js 18 trở lên (có fetch).');
    process.exit(2);
  }

  const cfg = JSON.parse(fs.readFileSync(args.file, 'utf8'));
  const out = args.out || path.join(path.dirname(args.file), path.basename(args.file, '.json') + '_results');
  fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });

  const results = [];
  for (const c of cfg.cases || []) {
    const r = await runCase(cfg, c, args.timeout);
    results.push(r);
    console.log(`${r.id}\t${r.status}\t${r.actualStatus === null ? '-' : r.actualStatus}`);
  }

  fs.writeFileSync(out + '.json', JSON.stringify({ baseUrl: cfg.baseUrl, results }, null, 2), 'utf8');
  fs.writeFileSync(out + '.md', renderMarkdown(cfg, results), 'utf8');

  const count = s => results.filter(r => r.status === s).length;
  console.log(`\nTổng ${results.length}: Pass ${count('Pass')}, Fail ${count('Fail')}, Blocked ${count('Blocked')}, Not run ${count('Not run')}`);
  console.log(`Đã ghi: ${out}.json và ${out}.md`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
