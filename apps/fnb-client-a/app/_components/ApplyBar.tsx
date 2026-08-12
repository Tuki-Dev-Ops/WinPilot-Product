import { ArrowUpRight, Phone } from 'lucide-react';
import { FNB_BRAND } from '@winpilot/store';
import { FNB_ROUTES } from '@/lib/navigation';

/**
 * 화면 아래에 붙어 따라오는 **가맹 상담 바.**
 *
 * ## 헤더에서 뺀 단추가 왜 여기 있나
 * 한때 헤더 오른쪽에 `창업 상담` 단추가 있었고, 뺐다 — 갈래 일곱 옆에서 **여덟째 항목처럼**
 * 읽혔기 때문이다(`lib/navigation.ts` 머리말). 그 판단은 그대로다.
 *
 * 아래는 다르다. 갈래와 같은 줄에 서지 않으므로 무엇과도 경쟁하지 않고, **다 읽은 사람이
 * 손을 뻗는 자리**에 늘 있다. 이 사이트는 아래로 길어서, 인테리어나 마케팅을 끝까지 읽은
 * 사람이 신청하러 가려면 지금은 다시 헤더까지 올라가야 한다.
 *
 * ## 번호를 함께 둔다
 * 창업을 검토하는 사람의 절반은 양식을 채우지 않고 전화한다. 신청 단추만 두면 그 절반은 번호를
 * 찾아 푸터까지 내려간다 — 이미 바닥에 붙어 있는 바에 한 자리 더 두면 될 일이다.
 *
 * 손님 번호가 아니라 **창업 상담 번호**다. 하나로 두면 창업 전화가 매장으로 가고, 받는 사람은
 * 답할 수 없는 것을 묻는 사람과 통화하게 된다.
 *
 * ## 신청 화면에서는 뜨지 않는다
 * 이미 그 화면에 온 사람에게 신청하러 가자고 하는 바가 떠 있으면, 양식을 가리는 방해물일 뿐이다.
 * 켜고 끄는 것은 껍데기가 정한다(`FnbSiteShell` 의 `applyBar`).
 *
 * ## 좁은 화면에서 번호를 접는다
 * 폭이 좁으면 번호와 단추가 붙어 서서 둘 다 눌리기 어려워진다. 그때는 번호를 감추고 단추만
 * 남긴다 — 전화는 푸터에도 있고, 작은 화면에서 실제로 하는 일은 누르는 것이다.
 */
export function ApplyBar() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-4">
      {/*
        `pointer-events-none` 을 바깥에 두고 안쪽만 되살린다. 그러지 않으면 바 양옆의 **빈
        자리가 본문을 덮어**, 화면 아래쪽 링크가 눌리지 않는다.
      */}
      <div className="pointer-events-auto flex items-center gap-4 rounded-full bg-night/95 py-2 pl-5 pr-2 shadow-lg backdrop-blur-sm">
        <a
          href={`tel:${FNB_BRAND.franchisePhone.replace(/-/g, '')}`}
          className="hidden items-center gap-2 text-sm font-medium text-white/80 transition-colors duration-150 hover:text-white sm:flex"
        >
          <Phone aria-hidden className="size-4 shrink-0" strokeWidth={1.5} />
          <span className="font-mono tabular-nums">{FNB_BRAND.franchisePhone}</span>
        </a>

        <a
          href={FNB_ROUTES.franchiseApply}
          className="group flex items-center gap-2 rounded-full bg-octo-500 px-5 py-2.5 text-sm font-semibold text-white transition-opacity duration-150 hover:opacity-85"
        >
          창업 상담 신청
          <ArrowUpRight
            aria-hidden
            className="size-4 shrink-0 transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </a>
      </div>
    </div>
  );
}
