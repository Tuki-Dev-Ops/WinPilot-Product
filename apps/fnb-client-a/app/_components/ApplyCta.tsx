import { ArrowUpRight } from 'lucide-react';
import { FNB_BRAND } from '@winpilot/store';
import { FNB_ROUTES } from '@/lib/navigation';

/**
 * 다 읽은 자리 아래의 **상담 판** — 홈 · 인테리어 · 마케팅 · 창업안내 · 개설문의 다섯이 쓴다.
 *
 * ## 헤더에 없는 단추가 여기 다섯 번 선다
 * 헤더에서 `창업 상담` 단추를 뺀 이유는 `lib/navigation.ts` 머리말에 있다 — 대신 **읽고 나서
 * 누르는 자리**에 둔다. 그 자리가 다섯 화면의 맨 아래이고, 다섯 다 검은 판에 흰 단추라는 같은
 * 모양이었다.
 *
 * 화면마다 그려 두었더니 다섯 벌이 됐다. 판 하나를 고칠 때(둥근 정도 · 여백 · 화살표 움직임)
 * 다섯 군데를 같이 고쳐야 하는데, **다섯을 나란히 열어 놓기 전에는 어긋난 것이 보이지 않는다.**
 *
 * ## 말은 화면마다 다르다
 * 묶은 것은 판이지 문구가 아니다. 인테리어에서는 `몇 평인가요` 를 묻고 마케팅에서는 `무엇이 더
 * 궁금하신가요` 를 묻는다 — 방금 읽은 것을 이어받아야 그 다음 줄이 자연스럽다. 그래서 제목과
 * 본문은 받아서 쓴다.
 *
 * ## 번호는 창업안내에만 붙는다(`withPhone`)
 * 다섯 다 붙이면 번호가 사이트 아래쪽에 다섯 번 서고, 그러면 푸터의 창구 둘과 섞여 **어느 번호로
 * 걸어야 하는지**가 흐려진다. 창업안내는 검토가 가장 깊어진 자리라 지금 걸고 싶은 사람이 있다.
 */
export function ApplyCta({
  title,
  children,
  withPhone,
}: {
  title: string;
  children: React.ReactNode;
  withPhone?: boolean;
}) {
  return (
    <section className="flex flex-col items-start gap-5 rounded-2xl bg-night px-8 py-10 text-white lg:px-10 lg:py-12">
      <p className="text-xl font-bold tracking-tight lg:text-2xl">{title}</p>
      <p className="max-w-2xl text-sm leading-loose text-white/60">{children}</p>

      {/*
        단추와 번호를 한 줄에 두되 `flex-wrap` 으로 접히게 한다. 번호가 없는 화면에서도 이 줄이
        서는데, 자식이 하나뿐이면 줄이 있으나 없으나 같은 자리에 선다 — 조건으로 나누면 같은
        판이 두 모양이 되고, 그때부터 `mt-1` 이 한쪽에만 남는다.
      */}
      <div className="mt-1 flex flex-wrap items-center gap-4">
        <a
          href={FNB_ROUTES.franchiseApply}
          className="group flex w-fit items-center gap-2 rounded-full bg-octo-500 px-5 py-2.5 text-sm font-semibold text-white transition-opacity duration-150 hover:opacity-85"
        >
          창업 상담 신청
          {/* 화살표가 오른쪽 위로 살짝 뜬다 — 밖으로 나가는 길이라는 것을 움직임이 말한다. */}
          <ArrowUpRight
            aria-hidden
            className="size-4 shrink-0 transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </a>
        {withPhone && (
          <span className="font-mono text-sm tabular-nums text-white/60">{FNB_BRAND.franchisePhone}</span>
        )}
      </div>
    </section>
  );
}
