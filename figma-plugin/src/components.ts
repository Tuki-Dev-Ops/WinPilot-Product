import { walk, type UIRDocument, type UIRNode } from '@winpilot/uir';
import type { MaterializeContext } from './materialize';

export type ComponentReport = {
  components: number;
  sets: number;
  properties: number;
  failures: string[];
};

/** `{ State: 'Error' }` → `State=Error` (Figma 의 variant 컴포넌트 이름 규약) */
function variantName(variant: Record<string, string> | undefined, fallback: string): string {
  if (!variant) return fallback;
  const parts = Object.keys(variant)
    .sort()
    .map((key) => `${key}=${variant[key] ?? ''}`);
  return parts.length > 0 ? parts.join(', ') : fallback;
}

/**
 * UIR 의 `component` / `property` 표시를 Figma 컴포넌트로 승격한다.
 *
 * **반드시 수치 검증 이후에 실행한다.** `combineAsVariants` 는 컴포넌트들을 ComponentSet
 * 프레임으로 감싸면서 위치를 조정하므로, 그 전에 좌표를 대조해야 원본과 비교가 성립한다.
 *
 * 이 단계는 Figma 안에서만 확인할 수 있는 영역이라 모든 호출을 개별적으로 감싸고,
 * 실패하면 중단하지 않고 리포트에 남긴다 — 일부가 안 되더라도 나머지 화면은 살아 있어야 한다.
 */
export function componentize(document: UIRDocument, context: MaterializeContext): ComponentReport {
  const report: ComponentReport = { components: 0, sets: 0, properties: 0, failures: [] };

  // 1) 컴포넌트로 승격할 노드를 이름별로 모은다.
  const groups = new Map<string, UIRNode[]>();
  for (const node of walk(document.root)) {
    const definition = node.component;
    if (!definition) continue;
    const list = groups.get(definition.name) ?? [];
    list.push(node);
    groups.set(definition.name, list);
  }
  if (groups.size === 0) return report;

  for (const [name, uirNodes] of groups) {
    const made: Array<{ uir: UIRNode; component: ComponentNode }> = [];

    for (const uir of uirNodes) {
      const scene = context.created.get(uir.id);
      if (!scene) {
        report.failures.push(`${name}: 생성된 노드를 찾지 못함 (${uir.id})`);
        continue;
      }
      try {
        const component = figma.createComponentFromNode(scene);
        component.name = variantName(uir.component?.variant, name);
        made.push({ uir, component });
        report.components += 1;
      } catch (error) {
        report.failures.push(`${name}: 컴포넌트 변환 실패 — ${String(error)}`);
      }
    }

    if (made.length === 0) continue;

    // 2) variant 축이 있고 2개 이상이면 ComponentSet 으로 묶는다.
    let owner: ComponentNode | ComponentSetNode | null = made[0]?.component ?? null;
    const hasVariants = made.every((item) => item.uir.component?.variant);
    if (made.length > 1 && hasVariants) {
      const first = made[0]?.component;
      const parent = first?.parent;
      if (parent) {
        try {
          const set = figma.combineAsVariants(
            made.map((item) => item.component),
            parent as BaseNode & ChildrenMixin,
          );
          set.name = name;
          owner = set;
          report.sets += 1;
        } catch (error) {
          report.failures.push(`${name}: ComponentSet 결합 실패 — ${String(error)}`);
        }
      }
    }

    // 3) TEXT / BOOLEAN 속성을 붙이고 노드에 연결한다.
    //    같은 이름의 속성은 한 번만 정의하고 모든 variant 가 같은 id 를 참조해야 한다.
    const propertyIds = new Map<string, string>();

    const defineProperty = (
      propertyName: string,
      type: 'TEXT' | 'BOOLEAN',
      defaultValue: string | boolean,
    ): string | null => {
      const cached = propertyIds.get(propertyName);
      if (cached) return cached;

      const targets: Array<ComponentNode | ComponentSetNode> = owner ? [owner] : [];
      // ComponentSet 에 붙지 않는 API 버전이 있어 개별 컴포넌트로도 시도한다.
      for (const item of made) targets.push(item.component);

      for (const target of targets) {
        try {
          const id = target.addComponentProperty(propertyName, type, defaultValue);
          propertyIds.set(propertyName, id);
          report.properties += 1;
          return id;
        } catch {
          /* 다음 대상으로 */
        }
      }

      report.failures.push(`${name}: 속성 '${propertyName}'(${type}) 정의 실패`);
      return null;
    };

    for (const item of made) {
      for (const node of walk(item.uir)) {
        const property = node.property;
        if (!property) continue;

        const scene = context.created.get(node.id);
        if (!scene) {
          report.failures.push(`${name}: 속성 대상 노드를 찾지 못함 (${node.id})`);
          continue;
        }

        const references: { [field: string]: string } = { ...(scene.componentPropertyReferences ?? {}) };

        if (property.text) {
          const defaultValue = node.text?.characters ?? '';
          const id = defineProperty(property.text, 'TEXT', defaultValue);
          if (id) references['characters'] = id;
        }
        if (property.boolean) {
          const id = defineProperty(property.boolean, 'BOOLEAN', node.visible);
          if (id) references['visible'] = id;
        }

        try {
          scene.componentPropertyReferences = references;
        } catch (error) {
          report.failures.push(`${name}: 속성 연결 실패 (${node.id}) — ${String(error)}`);
        }
      }
    }
  }

  return report;
}
