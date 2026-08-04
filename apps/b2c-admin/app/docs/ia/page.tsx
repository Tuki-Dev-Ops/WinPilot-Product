import type { Metadata } from 'next';
import { Mermaid } from '@winpilot/docs/ui';
import { DocHeader } from '../_components/DocHeader';
import { ADMIN_MENU } from '@/lib/navigation/admin-menu';
import { pages } from '@/pages.manifest';

/**
 * IA — 어드민의 화면 구조.
 *
 * **도면을 손으로 적지 않고 사이드바에서 만든다.** 메뉴가 곧 구조이므로, 메뉴를 고치면 도면이
 * 따라와야 한다. 따로 적으면 메뉴에 항목을 더했을 때 도면만 옛것이 된다.
 *
 * 목록에서 들어가는 화면(등록·상세)은 메뉴에 항목이 없다. 그래도 도면에는 그린다 —
 * 메뉴에 없다고 화면이 없는 것은 아니고, 그 사실을 모르면 등록 화면을 새로 만들려 든다.
 *
 * ## 고객 화면 연동
 * - **없다.** 저장소의 문서를 보여 주는 개발 도구라 고객 화면에 나타나지 않는다.
 */
export const metadata: Metadata = { title: 'IA' };

const INIT = `%%{init:{'flowchart':{'curve':'step','nodeSpacing':32,'rankSpacing':46},'theme':'neutral'}}%%`;

const node = (value: string) => value.toUpperCase().replace(/[^A-Z0-9]/g, '_');

/** 사이드바 최상위 → 보조 메뉴 → 그 아래 들어가는 화면. */
function sectionMap(sectionId: string): string {
  const section = ADMIN_MENU.find((item) => item.id === sectionId);
  if (!section) return '';

  const lines = [INIT, 'graph TB', `  ROOT["${section.label}"]`];
  const children = section.children ?? [];

  for (const child of children) {
    lines.push(`  ${node(child.id)}["${child.label}<br/>${child.href}"]`);
    lines.push(`  ROOT --> ${node(child.id)}`);

    // 그 보조 메뉴 아래로 한 마디 더 들어가는 화면 — 목록에서만 갈 수 있다.
    for (const page of pages) {
      if (page.route === child.href) continue;
      if (!page.route.startsWith(`${child.href}/`)) continue;
      lines.push(`  ${node(page.id)}["${page.name}<br/>${page.route}"]`);
      lines.push(`  ${node(child.id)} --> ${node(page.id)}`);
    }
  }

  if (children.length === 0) lines.push(`  ROOT --> NONE["${section.href}"]`);
  return lines.join('\n');
}

/** 사이드바 전체 — 최상위만 잇는다. 세부까지 그리면 도면이 화면보다 커진다. */
function topMap(): string {
  const lines = [INIT, 'graph TB', '  ADMIN["B2C Admin"]'];
  for (const section of ADMIN_MENU) {
    lines.push(`  ${node(section.id)}["${section.label}<br/>${section.href}"]`);
    lines.push(`  ADMIN --> ${node(section.id)}`);
  }
  lines.push('  STORE[("@winpilot/store · 공유 시드")]');
  lines.push('  STORE -.-> ADMIN');
  return lines.join('\n');
}

export default function AdminDocsIaPage() {
  return (
    <>
      <DocHeader
        trail={['문서', '개요']}
        title="IA — 정보 구조"
        description="사이드바가 곧 구조다. 도면은 메뉴 정의(lib/navigation/admin-menu.ts)에서 만들어지므로 메뉴를 고치면 도면이 따라온다. 도면을 누르면 크게 볼 수 있고, 원본은 카드 아래에 접어 두었다."
      />

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold tracking-tight">사이드바</h2>
        <p className="text-sm leading-relaxed text-ink-muted">
          사이드바는 <strong className="font-semibold">최상위만</strong> 노출한다. 세부 뎁스를 사이드바에 펼치면
          자원 수가 늘수록 무너지므로, 세부는 본문 왼쪽 보조 메뉴에 그 섹션의 것만 둔다.
        </p>
        <Mermaid code={topMap()} title="어드민 사이드바" />
      </section>

      {ADMIN_MENU.map((section) => (
        <section key={section.id} id={section.id} className="flex scroll-mt-6 flex-col gap-3">
          <h2 className="text-xl font-bold tracking-tight">{section.label}</h2>
          <Mermaid code={sectionMap(section.id)} title={`IA — ${section.label}`} />
        </section>
      ))}
    </>
  );
}
