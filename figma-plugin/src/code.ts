import { sortPages, type UIRDocument } from '@winpilot/uir';
import { componentize, type ComponentReport } from './components';
import { collectFonts, createContext, loadFonts, materializeDocument, registerImages } from './materialize';
import { syncPages } from './pages';
import type { FigmaBundle, RunReport } from './types';
import { verifyDocument } from './verify';

/** 브레이크포인트 프레임 사이 여백 */
const FRAME_GAP = 200;

figma.showUI(__html__, { width: 460, height: 620, themeColors: true });

type UiMessage = { type: 'run'; bundle: string } | { type: 'export' } | { type: 'cancel' };

/** 마지막 실행에서 만든 프레임 — 픽셀 검증용 PNG 를 여기서 내보낸다. */
const exportable: Array<{ name: string; frame: FrameNode }> = [];

const post = (type: string, payload: unknown) => figma.ui.postMessage({ type, payload });

function groupByPage(documents: UIRDocument[]): Map<string, UIRDocument[]> {
  const grouped = new Map<string, UIRDocument[]>();
  for (const document of documents) {
    const list = grouped.get(document.page.id) ?? [];
    list.push(document);
    grouped.set(document.page.id, list);
  }
  return grouped;
}

async function run(bundleJson: string): Promise<void> {
  let bundle: FigmaBundle;
  try {
    bundle = JSON.parse(bundleJson) as FigmaBundle;
  } catch (error) {
    post('error', `번들 파싱 실패: ${String(error)}`);
    return;
  }

  if (bundle.bundleVersion !== '1.0') {
    post('error', `지원하지 않는 번들 버전: ${String(bundle.bundleVersion)}`);
    return;
  }
  if (!bundle.documents || bundle.documents.length === 0) {
    post('error', '번들에 UIR 문서가 없습니다. 먼저 pnpm ssot:extract 를 실행하세요.');
    return;
  }

  const context = createContext();
  exportable.length = 0;

  // 1) 폰트 — 하나라도 없으면 시작하지 않는다.
  post('progress', '폰트 확인 중…');
  const fonts = collectFonts(bundle);
  const { missing } = await loadFonts(fonts);
  if (missing.length > 0) {
    post(
      'error',
      `Figma 에 없는 폰트 ${missing.length}개 — 설치 후 다시 실행하세요:\n` +
        missing.map((font) => `  · ${font.family} ${font.style}`).join('\n') +
        '\n\n폰트가 대체되면 전 페이지의 텍스트 기하가 어긋나므로 생성을 시작하지 않습니다.',
    );
    return;
  }

  // 2) 자산
  post('progress', `자산 ${Object.keys(bundle.assets).length}개 등록 중…`);
  registerImages(bundle, context);

  // 3) 페이지 — 이름·순서 강제 (요구사항 1.2)
  post('progress', '페이지 생성 · 정렬 중…');
  const { pages, result: pageResult } = await syncPages(bundle.pages);

  // 4) 머티리얼라이즈 + 수치 검증
  const byPage = groupByPage(bundle.documents);
  const orderedSpecs = sortPages(bundle.pages);
  const allMismatches: RunReport['mismatches'] = [];
  const components: ComponentReport = { components: 0, sets: 0, properties: 0, failures: [] };
  let framesCreated = 0;

  for (const spec of orderedSpecs) {
    const page = pages.get(spec.id);
    const documents = byPage.get(spec.id);
    if (!page || !documents) continue;

    // 브레이크포인트 순서는 매니페스트 순서를 따른다 (넓은 것부터).
    const ordered = bundle.breakpoints
      .map((breakpoint) => documents.find((document) => document.breakpoint.id === breakpoint.id))
      .filter((document): document is UIRDocument => Boolean(document));

    let originX = 0;
    for (const document of ordered) {
      post('progress', `${spec.order}. ${spec.name} — ${document.breakpoint.label} 생성 중…`);
      const frame = await materializeDocument(document, page, originX, context);
      framesCreated += 1;
      exportable.push({ name: `${document.page.id}@${document.breakpoint.id}.png`, frame });
      originX += document.viewport.width + FRAME_GAP;

      post('progress', `${spec.order}. ${spec.name} — ${document.breakpoint.label} 수치 검증 중…`);
      allMismatches.push(...verifyDocument(document, frame, context));

      // 컴포넌트 승격은 **검증 이후**에 한다 — ComponentSet 결합이 위치를 바꾸므로,
      // 그 전에 좌표를 대조해야 원본과의 비교가 성립한다.
      post('progress', `${spec.order}. ${spec.name} — ${document.breakpoint.label} 컴포넌트 승격 중…`);
      const result = componentize(document, context);
      components.components += result.components;
      components.sets += result.sets;
      components.properties += result.properties;
      components.failures.push(...result.failures);
    }
  }

  const first = pages.get(orderedSpecs[0]?.id ?? '');
  if (first) await figma.setCurrentPageAsync(first);

  const report: RunReport = {
    pagesCreated: pageResult.created,
    framesCreated,
    nodesCreated: context.counts.nodes,
    textNodes: context.counts.text,
    fallbackNodes: context.counts.fallback,
    mismatches: allMismatches,
    warnings: context.warnings.concat(components.failures),
    lineCountMismatches: context.counts.lineCountMismatch,
    components: components.components,
    componentSets: components.sets,
    componentProperties: components.properties,
  };

  post('done', report);

  figma.notify(
    allMismatches.length === 0
      ? `싱크 완료 — 수치 검증 통과 (노드 ${context.counts.nodes})`
      : `수치 불일치 ${allMismatches.length}건 — 리포트를 확인하세요`,
    { timeout: 5000 },
  );
}

/**
 * B. 픽셀 검증용 PNG 내보내기.
 *
 * **배율 1x 고정** — baseline 이 DPR 1 로 캡처되었으므로 여기서 어긋나면 비교 자체가 불가능하다.
 * 네트워크를 쓰지 않고 UI 쪽에서 파일로 내려받게 한다 (서버·CORS·방화벽을 만들지 않기 위해).
 */
async function exportFrames(): Promise<void> {
  if (exportable.length === 0) {
    post('error', '먼저 "Figma 에 생성" 을 실행하세요.');
    return;
  }

  const files: Array<{ name: string; bytes: Uint8Array }> = [];
  for (const item of exportable) {
    post('progress', `${item.name} 내보내는 중…`);
    const bytes = await item.frame.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 1 } });
    files.push({ name: item.name, bytes });
  }
  post('exported', files);
}

figma.ui.onmessage = async (message: UiMessage) => {
  if (message.type === 'cancel') {
    figma.closePlugin();
    return;
  }
  if (message.type === 'export') {
    try {
      await exportFrames();
    } catch (error) {
      post('error', `내보내기 실패: ${error instanceof Error ? error.message : String(error)}`);
    }
    return;
  }
  if (message.type === 'run') {
    try {
      await run(message.bundle);
    } catch (error) {
      post('error', `실행 중 오류: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
};
