import type { Metadata } from 'next';
import { Bus, Car, MapPin, Phone, TrainFront } from 'lucide-react';
import { DIRECTIONS, IR_COMPANY } from '@winpilot/store';
import { IrSiteShell } from '@/app/_components/IrSiteShell';
import { PageHero } from '@/app/_components/PageHero';
import { OfficeMap } from './_components/OfficeMap';

/**
 * Feature: `direction.detail` · IR Client (템플릿 A) · route `/support/directions`
 *
 * ## 왼쪽에 지도, 오른쪽에 글
 * 한때 지도를 넣지 않았다. 키가 없는 동안 회색 네모가 남는다는 것이 이유였는데, 그 걱정은
 * **키가 없을 때 무엇을 보여 줄지**로 풀면 되는 것이었다(`OfficeMap` 의 안내 상자).
 *
 * 찾아오는 사람은 두 가지를 한 번에 한다 — 어디쯤인지 눈으로 잡고, 어떻게 가는지 읽는다.
 * 위아래로 두면 지도를 보다가 글을 보려고 내리고, 다시 확인하려고 올린다. 나란히 두면 둘이
 * 한 화면에 있다.
 *
 * 좁은 화면에서는 지도가 위다. 거기서는 어차피 세로로 쌓이는데, 글이 먼저 오면 지도가
 * 화면 밖으로 밀려 있는 줄 모르고 지나간다.
 *
 * ## 주소는 지도 옆에도 크게 둔다
 * 실제로 가져가는 것은 그 한 줄이다 — 자기 지도 앱에 붙여 넣는다. 지도를 넣었다고 해서
 * 주소를 작게 만들면, 지도가 안 뜨는 날 이 화면이 아무것도 못 한다.
 */
export const metadata: Metadata = { title: `오시는 길 — ${IR_COMPANY.name}` };

/** 갈래마다 다른 그림. 세 줄이 같은 모양이면 훑을 때 어느 줄이 어느 갈래인지 다시 읽어야 한다. */
const KIND_ICON = {
  지하철: TrainFront,
  버스: Bus,
  자가용: Car,
} as const;

export default function DirectionListPage() {
  return (
    <IrSiteShell hero={<PageHero title="오시는 길" />}>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start lg:gap-10">
        {/* 왼쪽 — 지도. 좁은 화면에서도 위에 온다(`grid` 의 차례가 곧 세로 차례다). */}
        <OfficeMap lat={IR_COMPANY.lat} lng={IR_COMPANY.lng} label={IR_COMPANY.name} />

        {/* 오른쪽 — 주소와 오는 길. */}
        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-4 rounded-2xl bg-night px-6 py-6 text-white lg:px-8 lg:py-8">
            <span className="flex items-center gap-2 text-xs text-white/50">
              <MapPin aria-hidden className="size-4" strokeWidth={1.6} />
              본사
            </span>
            {/* 주소를 크게 둔다 — 이 화면에서 가져가는 것이 결국 이 한 줄이다. */}
            <p className="text-lg font-semibold leading-relaxed tracking-tight lg:text-xl">{IR_COMPANY.address}</p>
            <p className="flex items-center gap-2 font-mono text-sm tabular-nums text-white/60">
              <Phone aria-hidden className="size-4" strokeWidth={1.6} />
              {IR_COMPANY.irPhone}
            </p>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-ink-faint">오시는 방법</h2>

            {/*
              세 갈래를 **세로로** 쌓는다. 왼쪽에 지도가 서면서 이 칸의 너비가 절반이 되어,
              가로 셋으로 두면 한 칸에 글이 두세 줄씩 접힌다.
            */}
            <ul className="flex flex-col gap-px overflow-hidden rounded-xl border border-border bg-border">
          {DIRECTIONS.map((one) => {
            const Icon = KIND_ICON[one.kind];

            return (
              <li key={one.kind} className="flex flex-col gap-2 bg-canvas px-5 py-4">
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

          <section className="flex flex-col gap-2 rounded-xl border border-border px-5 py-4">
            <p className="text-sm font-medium">방문 전에</p>
            <p className="text-sm leading-relaxed text-ink-muted">
              담당자와 약속을 잡고 오시면 안내가 빠릅니다. 처음 오시는 경우 1층 안내데스크에서
              방문증을 받으신 뒤 올라오시면 됩니다.
            </p>
          </section>
        </div>
      </div>
    </IrSiteShell>
  );
}
