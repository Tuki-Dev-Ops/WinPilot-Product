import type { Metadata } from 'next';
import { Bus, Car, MapPin, Phone, TrainFront } from 'lucide-react';
import { DIRECTIONS, IR_COMPANY } from '@winpilot/store';
import { IrPageTitle, IrSiteShell } from '@/app/_components/IrSiteShell';

/**
 * Feature: `direction.detail` · IR Client (템플릿 A) · route `/support/directions`
 *
 * ## 지도를 넣지 않는다
 * 지도 서비스를 붙이면 **키가 필요하고**(발급·과금·도메인 등록), 그 키가 없는 동안 화면에는
 * 회색 네모가 남는다. 게다가 지도는 스크립트를 통째로 들여오므로 이 화면 하나 때문에 다른
 * 화면까지 느려진다.
 *
 * 대신 주소를 **복사해 갈 수 있게** 크게 두고, 지하철·버스·자가용을 갈래로 나눠 적는다 —
 * 실제로 찾아오는 사람이 하는 일은 그 주소를 자기 지도 앱에 붙여 넣는 것이다.
 */
export const metadata: Metadata = { title: `오시는 길 — ${IR_COMPANY.name}` };

/** 갈래마다 다른 그림. 세 줄이 같은 모양이면 훑을 때 어느 줄이 어느 갈래인지 다시 읽어야 한다. */
const KIND_ICON = {
  지하철: TrainFront,
  버스: Bus,
  자가용: Car,
} as const;

export default function SiteDirectionsPage() {
  return (
    <IrSiteShell>
      <IrPageTitle title="오시는 길" description="본사 위치와 찾아오시는 방법입니다." />

      <section className="flex flex-col gap-5 rounded-2xl bg-night px-8 py-8 text-white lg:px-10 lg:py-10">
        <span className="flex items-center gap-2 text-xs text-white/50">
          <MapPin aria-hidden className="size-4" strokeWidth={1.6} />
          본사
        </span>
        {/* 주소를 크게 둔다 — 이 화면에서 가져가는 것이 결국 이 한 줄이다. */}
        <p className="text-xl font-semibold leading-relaxed tracking-tight lg:text-2xl">{IR_COMPANY.address}</p>
        <p className="flex items-center gap-2 font-mono text-sm tabular-nums text-white/60">
          <Phone aria-hidden className="size-4" strokeWidth={1.6} />
          {IR_COMPANY.irPhone}
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-xs font-bold uppercase tracking-widest text-ink-faint">오시는 방법</h2>

        <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3">
          {DIRECTIONS.map((one) => {
            const Icon = KIND_ICON[one.kind];

            return (
              <li key={one.kind} className="flex flex-col gap-3 bg-canvas px-6 py-6">
                <span className="flex items-center gap-2">
                  <Icon aria-hidden className="size-4 shrink-0 text-ink-faint" strokeWidth={1.6} />
                  <span className="text-sm font-semibold">{one.kind}</span>
                </span>
                <p className="text-sm leading-relaxed text-ink-muted">{one.detail}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="flex flex-col gap-3 rounded-xl border border-border px-6 py-5">
        <p className="text-sm font-medium">방문 전에</p>
        <p className="text-sm leading-relaxed text-ink-muted">
          담당자와 약속을 잡고 오시면 안내가 빠릅니다. 처음 오시는 경우 1층 안내데스크에서 방문증을
          받으신 뒤 올라오시면 됩니다.
        </p>
      </section>
    </IrSiteShell>
  );
}
