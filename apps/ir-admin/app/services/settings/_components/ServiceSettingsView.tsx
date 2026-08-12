import { Badge, PageHeading } from '@winpilot/ui';
import { SERVICE_DETAILS, SITE_SERVICES } from '@winpilot/store';
import { IrPanel } from '@/app/_components/IrPanel';

/**
 * 서비스 하나가 사이트에 나가는 자리 셋.
 *
 * 둘 다 같은 자리에 서므로 서비스마다 되풀이해 적지 않는다. 되풀이하면 여섯 줄이 되고, 여섯
 * 줄을 읽는 사람은 **둘 사이에 다른 데가 있는지** 찾느라 세 번 훑는다.
 */
const SITE_PLACES = [
  {
    where: '홈 회전 무대',
    note: '공정의 차례대로 놓이는 카드. 카드에 실리는 말은 아래의 홈 카드 문구입니다.',
  },
  {
    where: 'SOLUTION 메뉴',
    note: '머리 메뉴를 펼치면 서비스 묶음에 이름으로 섭니다. 클라우드 제품은 PRODUCT 쪽입니다.',
  },
  {
    where: '제품 목록 아래',
    note: '제품 화면의 서비스 묶음. 사람이 하는 일이라 사진 없이 이름과 문구만 섭니다.',
  },
] as const;

/**
 * 홈 카드와 상세 화면에 각각 적힌 말 — **한 서비스를 소개하는 문구가 둘이다.**
 *
 * 홈 카드는 `SITE_SERVICES.body`, 상세 화면은 `SERVICE_DETAILS.approach` 를 싣는다. 두 값을
 * 하나로 합치지 않은 이유는 실리는 자리의 길이가 다르기 때문이다 — 카드는 두 줄, 상세는 문제
 * 아래 한 문단.
 *
 * 그래서 **어긋날 수 있다.** 한쪽만 고치고 다른 쪽을 잊으면 홈에서 읽은 말과 들어가서 읽는
 * 말이 달라지고, 검토하는 사람은 그것을 회사가 무엇을 파는지 스스로도 정하지 못한 것으로
 * 읽는다. 어느 쪽이 맞는지는 사람이 정할 일이라 여기서는 나란히 놓기만 한다.
 */
const SERVICE_COPY = SERVICE_DETAILS.flatMap((detail) => {
  const card = SITE_SERVICES.find((one) => one.id === detail.id);
  return card ? [{ detail, card }] : [];
});

/**
 * 서비스 > 설정.
 *
 * ## 켜고 끄는 자리를 두지 않는다
 * 제품 설정에는 차례를 바꾸고 메뉴에서 내리는 자리가 있다. 서비스에는 없다 — 파는 것 둘은
 * **내리는 것이 아니라 안 파는 것**이고, 안 팔기로 하는 날 바꿔야 하는 것은 토글 하나가 아니라
 * 메뉴 · 홈 무대 · 제품 목록의 세 자리다. 토글만 두면 껐는데 홈 무대에는 그대로 도는 상태가
 * 만들어지고, 그 사실은 사이트를 열어 봐야 안다.
 *
 * ## 그러면 이 화면은 무엇을 하나
 * **어디에 나가는지와 무엇이라 적혀 있는지**를 한자리에서 보여 준다. 이 둘이 운영자가 실제로
 * 묻는 것이다 — "컨설팅 소개가 사이트 어디에 뜨나", "홈에서 읽은 말과 들어가서 읽는 말이
 * 같은가". 고치는 자리는 목록 → 상세다.
 *
 * **프론트엔드 전용** — 값의 원본은 `@winpilot/store` 다.
 */
export function ServiceSettingsView() {
  return (
    <>
      <PageHeading title="서비스 설정" description="서비스 둘이 사이트 어디에 어떤 말로 서는지입니다." />

      <IrPanel
        title="사이트에 나가는 자리"
        description="서비스 둘 다 이 세 자리에 함께 섭니다."
        aside={<Badge tone="neutral">읽기 전용</Badge>}
      >
        <ol className="flex flex-col">
          {SITE_PLACES.map((one, index) => (
            <li
              key={one.where}
              className="flex flex-wrap items-start gap-4 border-b border-border px-6 py-4 last:border-b-0"
            >
              <span className="w-6 shrink-0 pt-0.5 font-mono text-xs tabular-nums text-ink-faint">
                {String(index + 1).padStart(2, '0')}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{one.where}</span>
                <span className="mt-1 block text-xs leading-relaxed text-ink-muted">{one.note}</span>
              </span>
            </li>
          ))}
        </ol>
      </IrPanel>

      <IrPanel
        title="두 자리에 적힌 말"
        description="같은 서비스를 홈 카드와 상세 화면이 각각 자기 문구로 소개합니다."
      >
        <ul className="flex flex-col">
          {SERVICE_COPY.map(({ detail, card }) => (
            <li key={detail.id} className="flex flex-col gap-3 border-b border-border px-6 py-5 last:border-b-0">
              <span className="flex flex-wrap items-baseline gap-2">
                <span className="font-mono text-xs tabular-nums text-ink-faint">{card.no}</span>
                <span className="text-sm font-medium">{detail.title}</span>
                <span className="font-mono text-xs text-ink-faint">{detail.href}</span>
              </span>

              <span className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Copy label="홈 카드">{card.body.join(' ')}</Copy>
                <Copy label="상세 화면">{detail.approach}</Copy>
              </span>
            </li>
          ))}
        </ul>
      </IrPanel>

      <p className="text-sm leading-relaxed text-ink-muted">
        <Badge tone="neutral">알아 둘 것</Badge> 서비스를 내리는 자리는 두지 않습니다 — 메뉴 · 홈 무대 ·
        제품 목록 세 자리에 함께 서 있어, 한 곳만 끄면 나머지 둘에 그대로 남습니다.
      </p>
    </>
  );
}

/** 한 자리에 적힌 문구 한 덩이. 어디에 실리는 말인지를 이름표가 말한다. */
function Copy({ label, children }: { label: string; children: string }) {
  return (
    <span className="flex min-w-0 flex-col gap-1.5 rounded-lg bg-surface px-4 py-3">
      <span className="text-xs text-ink-faint">{label}</span>
      <span className="text-xs leading-relaxed text-ink-muted">{children}</span>
    </span>
  );
}
