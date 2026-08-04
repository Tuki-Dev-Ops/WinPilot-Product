import { PIXEL_TOLERANCE } from '@winpilot/uir';
import type { Bitmap } from './image';
import type { VerifyResult } from './verify';

export type ReportEntry = {
  label: string;
  result: VerifyResult;
  baseline: Bitmap;
  actual: Bitmap;
};

const escapeHtml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const dataUri = (bitmap: Bitmap): string => `data:image/png;base64,${bitmap.toBuffer().toString('base64')}`;

export function renderReport(entries: ReportEntry[], meta: { generatedAt: string; commit: string }): string {
  const allPass = entries.every((entry) => entry.result.pass);

  const sections = entries
    .map((entry) => {
      const { result } = entry;
      const verdict = result.pass
        ? '<span class="ok">PASS</span>'
        : '<span class="bad">FAIL</span>';

      const failures = result.failures.length
        ? `<ul class="fail">${result.failures.map((line) => `<li>${escapeHtml(line)}</li>`).join('')}</ul>`
        : '';

      const clusters = (result.diff?.clusters ?? [])
        .slice(0, 30)
        .map(
          (cluster) => `<tr>
            <td>${cluster.pixels}</td>
            <td>${cluster.box.x0},${cluster.box.y0} → ${cluster.box.x1},${cluster.box.y1}</td>
            <td>${escapeHtml(cluster.tag ?? '-')}</td>
            <td>${escapeHtml(cluster.cid ?? '-')}</td>
            <td>${escapeHtml(cluster.nodeId ?? '-')}</td>
          </tr>`,
        )
        .join('');

      const violations = result.lineViolations
        .slice(0, 30)
        .map(
          (violation) => `<tr>
            <td>${escapeHtml(violation.metric)}</td>
            <td>${violation.delta === Infinity ? '∞' : violation.delta.toFixed(4)}</td>
            <td>${violation.limit}</td>
            <td>${escapeHtml(violation.cid ?? '-')}</td>
            <td class="text">${escapeHtml(violation.text.slice(0, 40))}</td>
          </tr>`,
        )
        .join('');

      return `<section>
        <h2>${escapeHtml(entry.label)} — ${verdict}</h2>
        ${failures}
        <table class="summary">
          <tr><td>크기</td><td>baseline ${result.dimensions.baseline} / actual ${result.dimensions.actual}</td></tr>
          <tr><td>diff 전체</td><td>${result.diff?.totalDiff ?? '-'} px</td></tr>
          <tr><td>마스크 밖 diff (B-1)</td><td><strong>${result.diff?.outsideMaskDiff ?? '-'} px</strong> · 허용 0</td></tr>
          <tr><td>마스크 안 diff (AA 후보)</td><td>${result.diff?.insideMaskDiff ?? '-'} px</td></tr>
          <tr><td>검사한 줄</td><td>${result.linesChecked}</td></tr>
          <tr><td>무게중심 최대 편차 (B-2)</td><td><strong>${result.maxCentroidDelta.toFixed(4)} px</strong> · 허용 ${PIXEL_TOLERANCE.inkCentroidPx}</td></tr>
          <tr><td>네이티브 커버리지</td><td>${(result.coverage.ratio * 100).toFixed(1)}% (${result.coverage.native}/${result.coverage.total})</td></tr>
        </table>

        ${violations ? `<h3>잉크 지표 위반</h3><table><tr><th>지표</th><th>편차</th><th>허용</th><th>cid</th><th>텍스트</th></tr>${violations}</table>` : ''}
        ${clusters ? `<h3>마스크 밖 diff 군집 (큰 순)</h3><table><tr><th>px</th><th>영역</th><th>tag</th><th>cid</th><th>node</th></tr>${clusters}</table>` : ''}

        <div class="images">
          <figure><figcaption>baseline (브라우저)</figcaption><img src="${dataUri(entry.baseline)}" /></figure>
          <figure><figcaption>actual (Figma)</figcaption><img src="${dataUri(entry.actual)}" /></figure>
          ${entry.result.diff ? `<figure><figcaption>diff — <span class="legend red"></span> 마스크 밖 · <span class="legend orange"></span> AA 후보</figcaption><img src="${dataUri(entry.result.diff.heatmap)}" /></figure>` : ''}
        </div>
      </section>`;
    })
    .join('');

  return `<!doctype html>
<html lang="ko"><head><meta charset="utf-8" />
<title>WinPilot 디자인 싱크 리포트</title>
<style>
  :root { color-scheme: light dark; --bg:#fff; --fg:#0c0e13; --muted:#5b6271; --line:#e3e5eb; --panel:#f6f7f9; }
  @media (prefers-color-scheme: dark) { :root { --bg:#090a0d; --fg:#f1f3f7; --muted:#98a0af; --line:#21252f; --panel:#0f1117; } }
  * { box-sizing: border-box; }
  body { margin:0; padding:32px; background:var(--bg); color:var(--fg);
         font:14px/1.6 -apple-system, 'Pretendard Variable', system-ui, sans-serif; }
  h1 { font-size:20px; margin:0 0 4px; }
  .meta { color:var(--muted); font-size:12px; margin-bottom:24px; }
  .verdict { display:inline-block; padding:6px 14px; border-radius:999px; font-weight:600; margin-bottom:24px; }
  .verdict.pass { background:#17915c22; color:#17915c; }
  .verdict.fail { background:#d33b4322; color:#d33b43; }
  section { border-top:1px solid var(--line); padding-top:20px; margin-top:28px; }
  h2 { font-size:16px; margin:0 0 10px; }
  h3 { font-size:13px; margin:20px 0 6px; color:var(--muted); }
  .ok { color:#17915c; } .bad { color:#d33b43; }
  ul.fail { margin:0 0 12px; padding-left:18px; color:#d33b43; }
  table { border-collapse:collapse; width:100%; font-size:12px; margin-bottom:8px; }
  th, td { text-align:left; padding:4px 8px; border-bottom:1px solid var(--line); vertical-align:top; }
  th { color:var(--muted); font-weight:500; }
  table.summary td:first-child { color:var(--muted); width:220px; }
  td.text { max-width:320px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .images { display:grid; grid-template-columns:repeat(auto-fit, minmax(280px,1fr)); gap:16px; margin-top:16px; }
  figure { margin:0; }
  figcaption { font-size:11px; color:var(--muted); margin-bottom:6px; }
  img { width:100%; border:1px solid var(--line); border-radius:6px; background:var(--panel); }
  .legend { display:inline-block; width:8px; height:8px; border-radius:2px; vertical-align:middle; }
  .legend.red { background:#ff0040; } .legend.orange { background:#ffa800; }
</style></head>
<body>
  <h1>WinPilot 디자인 싱크 리포트</h1>
  <div class="meta">commit ${escapeHtml(meta.commit.slice(0, 8))} · ${escapeHtml(meta.generatedAt)}</div>
  <div class="verdict ${allPass ? 'pass' : 'fail'}">${allPass ? 'SYNC PASS — 요구사항 1.2 충족' : 'SYNC FAIL'}</div>
  ${sections}
</body></html>`;
}
