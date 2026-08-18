'use client';

import { useRef, useState } from 'react';
import { Clock, Mail, Paperclip, Phone, X } from 'lucide-react';
import { Button, Checkbox, Dropdown, Field, HintInput, HintTextarea, RequiredLegend, useToast } from '@winpilot/ui';
import { IR_COMPANY, SITE_REGIONS } from '@winpilot/store';

/**
 * 문의 갈래. 받는 사람이 달라 **먼저 고른다.**
 *
 * 도입·기술이 앞이다. 이 화면은 CS CENTER 아래로 옮겨 왔고, 솔루션 상세와 제품 화면의
 * `문의하기` 단추가 전부 여기로 온다 — 들어오는 문의의 대부분이 도입 검토다.
 *
 * 누가 받는지는 적지 않는다. 고르는 사람에게 필요한 것은 **우리 조직도가 아니라 자기 물음이
 * 어디에 드는지**뿐이고, 갈래 이름이 이미 그것을 말한다.
 */
const KINDS = ['도입 · 견적', '기술 지원', '주주 · 투자자', '기관 · 애널리스트', '언론', '기타'] as const;

/**
 * 붙임 파일 정책.
 *
 * ## 왜 확장자를 정해 두나
 * 전에는 크기만 봤다. 그러면 실행 파일이나 매크로가 든 문서가 그대로 담당자 메일함으로 가고,
 * **막을 자리가 받는 사람의 주의뿐**이 된다. 여기서 걸러야 그 뒤가 조용하다.
 *
 * 목록에 있는 것만 받는다(허용 목록). 위험한 것을 하나씩 막는 방식은 새 확장자가 생길 때마다
 * 뚫리고, 그 사실은 뚫린 다음에 안다.
 *
 * ## 왜 세 가지를 다 재나
 * - **한 개 20MB** — 메일로 그대로 전달되므로 받는 쪽 한도에 맞춘다
 * - **최대 5개** — 다섯을 넘기면 문의가 아니라 자료 전달이고, 그건 메일로 할 일이다
 * - **합계 50MB** — 20MB 짜리 다섯이면 100MB 다. 개당 한도만 두면 합계가 새어 나간다
 *
 * 이 값들은 `docs/architecture/policy.md` §3 에도 적어 둔다 — 서버가 붙는 날 같은 수를 써야 한다.
 */
const MAX_MB = 20;
const MAX_COUNT = 5;
const MAX_TOTAL_MB = 50;

/** 받는 확장자. 문서 · 표 · 발표 · 이미지 · 압축까지다. */
const ALLOWED_EXTENSIONS = [
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'hwp', 'hwpx', 'jpg', 'jpeg', 'png', 'zip',
] as const;

/** 파일 고르는 창이 처음부터 걸러 주게 한다. 검사는 고른 뒤에 한 번 더 한다 — 창은 속일 수 있다. */
const ACCEPT = ALLOWED_EXTENSIONS.map((one) => `.${one}`).join(',');

function extensionOf(name: string): string {
  return name.slice(name.lastIndexOf('.') + 1).toLowerCase();
}

/**
 * 문의 양식 — **왼쪽에 갈래, 오른쪽에 양식**.
 *
 * ## FAQ · 특허 인증과 같은 틀이다
 * 세 화면 다 "여럿 중에서 하나를 고르고, 고른 것에 맞는 것을 본다" 는 같은 일을 한다. 그래서
 * 뼈대를 맞췄다 — 왼쪽에 고르는 줄, 오른쪽에 그 결과. CS CENTER 안을 오가는 사람이 화면마다
 * 다른 배치를 다시 익히지 않아도 된다.
 *
 * ## 무엇을 묻는가
 * 회사명 · 지역 · 담당자명 · 휴대폰 · 이메일 · 내용 · 첨부.
 *
 * **지역을 묻는 이유는 통계가 아니라 일정이다.** 스마트공장 구축은 현장을 봐야 하는 일이고,
 * 강원에서 온 문의와 성동구에서 온 문의는 첫 방문까지 걸리는 시간이 다르다. 답장에 적을
 * 일정이 달라지므로 받을 때 함께 받는다. 시·도 열일곱을 빠짐없이 두는 것도 그 때문이다 —
 * 목록에 없는 지역은 고를 수 없고, 고르지 못한 문의는 어느 담당 구역에도 들지 않는다.
 *
 * **회사명이 첫 칸인 이유**: 이 사이트로 오는 문의는 개인이 아니라 회사가 보낸다. 답하는 쪽도
 * 회사 이름으로 기존 상담 이력을 먼저 찾고, 그 이름이 없으면 같은 회사에서 온 두 문의를 서로
 * 다른 건으로 다룬다.
 *
 * 휴대폰과 이메일을 **둘 다 필수로** 받는다. 도입 검토는 메일로 자료를 주고받다가 통화로
 * 넘어가는 일이 잦은데, 그때 번호를 다시 물으면 하루가 더 걸린다.
 *
 * 번호를 선택으로 두면 남기는 사람이 는다는 말도 맞다. 그런데 이 양식으로 오는 것은 **회사가
 * 보내는 도입 문의**이고, 그쪽은 애초에 연락을 받으려고 남긴다 — 개인이 가볍게 남기고 가는
 * 자리였다면 반대로 두었을 것이다.
 *
 * ## 예측 정보를 묻는 문의에 답하지 못한다
 * 아직 공시하지 않은 실적이나 전망을 개별적으로 알려 주는 것은 **공정공시 위반**이다. 그래서
 * 양식 아래에 그 사실을 먼저 적는다 — 답을 못 받고 기다리는 것보다 낫다.
 *
 * **프론트엔드 전용** — 보낸 문의는 이 화면에만 반영된다. 붙임 파일도 올라가지 않는다.
 */
export function ContactForm() {
  const toast = useToast();
  const filePicker = useRef<HTMLInputElement | null>(null);

  const [kind, setKind] = useState<string>(KINDS[0]);
  const [company, setCompany] = useState('');
  const [region, setRegion] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [body, setBody] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const errors = {
    company: company.trim() ? undefined : '회사명을 입력해 주세요.',
    region: region ? undefined : '지역을 골라 주세요.',
    name: name.trim() ? undefined : '담당자명을 입력해 주세요.',
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? undefined : '답을 받으실 메일 주소를 정확히 적어 주세요.',
    /* 비었는지와 형식이 맞는지를 나눠 알린다 — `번호 형식이 아닙니다` 는 빈 칸에 대한 답이 아니다. */
    phone: !phone.trim()
      ? '휴대폰 번호를 입력해 주세요.'
      : /^[0-9+\-\s()]{9,20}$/.test(phone.trim())
        ? undefined
        : '연락 가능한 번호 형식으로 적어 주세요.',
    /*
      동의를 **검증 항목으로** 둔다. 단추를 흐리게 만들어 막는 방법도 있는데, 그러면 왜 눌리지
      않는지가 화면 어디에도 없다 — 누른 사람에게 무엇이 남았는지 알려 주는 편이 낫다.
    */
    agreed: agreed ? undefined : '개인정보 수집·이용에 동의해 주세요.',
    body: body.trim().length >= 10 ? undefined : '무엇이 궁금하신지 조금만 더 적어 주세요. (10자 이상)',
  };
  const broken = Object.values(errors).filter(Boolean).length;

  /**
   * 고른 파일을 받는다.
   *
   * 한도를 넘는 것은 **고른 자리에서 바로 걸러 알린다.** 보낼 때 알리면 이미 다 채운 양식 앞에서
   * 파일을 다시 고르게 되고, 그때는 무엇이 컸는지도 기억나지 않는다.
   */
  const addFiles = (picked: FileList | null) => {
    if (!picked) return;

    const kept: File[] = [];
    const tooBig: string[] = [];
    const wrongKind: string[] = [];

    for (const file of Array.from(picked)) {
      if (!ALLOWED_EXTENSIONS.includes(extensionOf(file.name) as (typeof ALLOWED_EXTENSIONS)[number])) {
        wrongKind.push(file.name);
      } else if (file.size > MAX_MB * 1024 * 1024) {
        tooBig.push(file.name);
      } else {
        kept.push(file);
      }
    }

    /*
      걸린 까닭을 갈라 알린다. `붙이지 못했습니다` 한 줄로 묶으면 크기를 줄여야 하는지 형식을
      바꿔야 하는지 몰라, 같은 파일을 다시 고르게 된다.
    */
    if (wrongKind.length > 0) {
      toast.error({
        message: '받지 않는 형식입니다.',
        detail: `${wrongKind.join(' · ')} — ${ALLOWED_EXTENSIONS.join(' · ')} 만 붙일 수 있습니다.`,
      });
    }
    if (tooBig.length > 0) {
      toast.error({ message: `${MAX_MB}MB 를 넘는 파일은 붙이지 못합니다.`, detail: tooBig.join(' · ') });
    }
    if (kept.length === 0) return;

    /*
      개수와 합계는 **이미 붙인 것까지 더해** 잰다. 고를 때마다 따로 재면 세 번에 나눠 고른
      사람이 한도를 지나친다.
    */
    setFiles((previous) => {
      const merged = [...previous, ...kept];
      if (merged.length > MAX_COUNT) {
        toast.error({ message: `첨부는 ${MAX_COUNT}개까지입니다.`, detail: `지금 ${merged.length}개를 고르셨습니다.` });
        return previous;
      }
      const total = merged.reduce((sum, one) => sum + one.size, 0);
      if (total > MAX_TOTAL_MB * 1024 * 1024) {
        toast.error({
          message: `첨부 합계는 ${MAX_TOTAL_MB}MB 까지입니다.`,
          detail: `지금 ${Math.ceil(total / 1024 / 1024)}MB 입니다.`,
        });
        return previous;
      }
      return merged;
    });
  };

  const submit = () => {
    setSubmitted(true);
    if (broken > 0) {
      toast.error({ message: '보내지 못했습니다.', detail: `확인이 필요한 항목이 ${broken}개 있습니다.` });
      return;
    }

    toast.success({ message: '문의를 보냈습니다.', detail: `${kind} · ${email.trim()} 으로 답변드립니다.` });
    setCompany('');
    setRegion('');
    setName('');
    setPhone('');
    setEmail('');
    setBody('');
    setFiles([]);
    /* 동의는 그 문의 한 건에 대한 것이라 함께 되돌린다 — 다음 문의는 다시 받는다. */
    setAgreed(false);
    setSubmitted(false);
  };

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
      {/* 왼쪽 — 갈래와 연락처. 좁은 화면에서는 갈래가 가로로 눕는다(세로로 두면 양식이 화면 밖으로 밀린다). */}
      <aside className="flex shrink-0 flex-col gap-6 lg:w-60">
        <div>
          <p className="mb-3 text-xs font-medium text-ink-faint">문의 유형</p>
          <div className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
            {KINDS.map((one) => (
              <button
                key={one}
                type="button"
                onClick={() => setKind(one)}
                aria-current={one === kind}
                className={`rounded-lg px-3 py-2 text-left text-sm transition-colors duration-150 ${
                  one === kind ? 'bg-surface font-semibold text-ink' : 'text-ink-muted hover:bg-surface'
                }`}
              >
                {one}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-border pt-5">
          <p className="text-xs font-medium text-ink-faint">연락처</p>
          <Channel icon={<Phone aria-hidden className="size-3.5" strokeWidth={1.6} />} value={IR_COMPANY.irPhone} />
          <Channel icon={<Mail aria-hidden className="size-3.5" strokeWidth={1.6} />} value={IR_COMPANY.irEmail} />
          <Channel icon={<Clock aria-hidden className="size-3.5" strokeWidth={1.6} />} value="평일 09:00 – 18:00" />
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col gap-5 rounded-xl border border-border px-6 py-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          {/* 고른 갈래를 양식 위에 한 번 더 적는다 — 왼쪽을 보고 오른쪽을 채우는 사이에 무엇을 골랐는지 잊는다. */}
          <p className="text-sm font-semibold">{kind}</p>
          <RequiredLegend />
        </div>

        <Field
          label="회사명"
          htmlFor="contact-company"
          required
          {...(submitted && errors.company ? { error: errors.company } : {})}
        >
          <HintInput
            id="contact-company"
            type="text"
            hint="예: 스페이스플래닝 주식회사"
            value={company}
            onChange={(event) => setCompany(event.target.value)}
            invalid={submitted && Boolean(errors.company)}
          />
        </Field>

        <Field
          label="지역"
          htmlFor="contact-region"
          required
          {...(submitted && errors.region ? { error: errors.region } : {})}
        >
          {/*
            생 `<select>` 였다. 두 가지가 걸렸다 — 브라우저가 그리는 화살표가 **오른쪽 끝에
            딱 붙어** 옆 칸들과 안쪽 여백이 어긋났고, `<option>` 의 글자는 DOM 텍스트 노드가
            아니라 Figma 로 추출되지 않는다(`packages/ui/src/Dropdown.tsx` 머리말).

            비워 둔 첫 값은 `label` 이 대신한다 — 고르기 전에는 그 말이 자리에 서 있고, 서울이
            미리 골라져 있으면 고르지 않은 사람의 문의가 전부 서울로 쌓인다.
          */}
          <Dropdown
            id="contact-region"
            label="고르지 않음"
            value={region}
            onChange={setRegion}
            invalid={submitted && Boolean(errors.region)}
            options={SITE_REGIONS.map((one) => ({ value: one, label: one }))}
          />
        </Field>

        <Field
          label="담당자명"
          htmlFor="contact-name"
          required
          {...(submitted && errors.name ? { error: errors.name } : {})}
        >
          <HintInput
            id="contact-name"
            type="text"
            hint="예: 홍길동 과장"
            value={name}
            onChange={(event) => setName(event.target.value)}
            invalid={submitted && Boolean(errors.name)}
          />
        </Field>

        {/*
          한 줄에 하나씩이다. 전에는 번호와 메일을 나란히 두었는데 — 둘 다 연락처라 붙여
          두었던 것이다 — 이 폼의 나머지 칸이 전부 한 줄을 다 쓰고 있어 **여기서만 줄이 갈라져**
          읽는 눈이 한 번 옆으로 튄다.

          메일이 위다. 답은 메일로 가고 전화는 필요할 때만 건다 — 먼저 받는 것을 먼저 묻는다.
        */}
        <Field
          label="이메일"
          htmlFor="contact-email"
          required
          {...(submitted && errors.email ? { error: errors.email } : {})}
        >
          <HintInput
            id="contact-email"
            type="email"
            hint="name@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            invalid={submitted && Boolean(errors.email)}
          />
        </Field>

        <Field
          label="휴대폰 번호"
          htmlFor="contact-phone"
          required
          {...(submitted && errors.phone ? { error: errors.phone } : {})}
        >
          <HintInput
            id="contact-phone"
            type="tel"
            hint="010-0000-0000"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            invalid={submitted && Boolean(errors.phone)}
          />
        </Field>

        <Field
          label="문의 내용"
          htmlFor="contact-body"
          required
          {...(submitted && errors.body
            ? { error: errors.body }
            : {})}
        >
          <HintTextarea
            id="contact-body"
            rows={6}
            hint="예: 조립 라인 3개에서 생산 실적을 손으로 적고 있습니다. MES 도입 시 기간과 비용이 궁금합니다."
            value={body}
            onChange={(event) => setBody(event.target.value)}
            invalid={submitted && Boolean(errors.body)}
          />
        </Field>

        <Field label="첨부파일" htmlFor="contact-files" hint={`${ALLOWED_EXTENSIONS.join(" · ")} · 파일당 ${MAX_MB}MB · 최대 ${MAX_COUNT}개 · 합계 ${MAX_TOTAL_MB}MB`}>
          <div className="flex flex-col gap-3">
            {/*
              진짜 `<input type="file">` 은 숨기고 단추로 연다. 브라우저가 그리는 기본 모양은
              운영체제마다 다르고 글자도 우리가 정하지 못해, 양식의 다른 칸과 나란히 서면 그 줄만
              다른 화면에서 온 것처럼 보인다. `sr-only` 라 화면에서만 감출 뿐이라, 키보드와
              낭독기에는 그대로 파일 선택으로 읽힌다.
            */}
            <input
              ref={filePicker}
              id="contact-files"
              type="file"
              multiple
              accept={ACCEPT}
              className="sr-only"
              onChange={(event) => {
                addFiles(event.target.files);
                /* 값을 비운다 — 비우지 않으면 같은 파일을 다시 고를 때 아무 일도 일어나지 않는다. */
                event.target.value = '';
              }}
            />

            <button
              type="button"
              onClick={() => filePicker.current?.click()}
              className="flex h-11 w-fit items-center gap-2 rounded-lg border border-border-strong px-4 text-sm text-ink-muted transition-colors duration-150 hover:border-ink-faint hover:text-ink"
            >
              <Paperclip aria-hidden className="size-4 shrink-0" strokeWidth={1.6} />
              파일 선택
            </button>

            {files.length > 0 && (
              <ul className="flex flex-col gap-2">
                {files.map((file, index) => (
                  <li
                    key={`${file.name}-${index}`}
                    className="flex items-center gap-3 rounded-lg bg-surface px-3 py-2 text-sm"
                  >
                    <span className="min-w-0 flex-1 truncate">{file.name}</span>
                    {/* 크기를 적는다 — 큰 파일은 보내는 쪽도 받는 쪽도 한 번 더 확인하게 된다. */}
                    <span className="shrink-0 font-mono text-xs tabular-nums text-ink-faint">
                      {(file.size / 1024 / 1024).toFixed(1)}MB
                    </span>
                    <button
                      type="button"
                      aria-label={`${file.name} 빼기`}
                      onClick={() => setFiles((previous) => previous.filter((_, at) => at !== index))}
                      className="shrink-0 text-ink-faint transition-colors duration-150 hover:text-ink"
                    >
                      <X aria-hidden className="size-4" strokeWidth={1.6} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Field>

        {/*
          개인정보 수집·이용 동의.

          ## 받고 있으면서 안 밝히면 안 된다
          이 양식은 성함 · 이메일 · 휴대폰 번호를 **필수로** 받는다. 그런데 무엇을 왜 얼마나
          갖고 있는지를 어디에도 적지 않고 있었다 — 개인정보보호법 제15조가 요구하는 고지다.

          ## 항목을 접어 두지 않는다
          `자세히 보기` 뒤에 숨기면 펴 보는 사람이 거의 없고, 그러면 동의는 받았는데 무엇에
          동의했는지는 아무도 모르는 상태가 된다. 세 줄이라 그냥 편다.

          ## 처리방침으로 가는 길을 함께 둔다
          여기 적은 것은 **이 양식이 받는 것**이고, 회사 전체의 처리 방침은 그쪽에 있다.
        */}
        <div className="flex flex-col gap-3 rounded-lg border border-border px-4 py-4">
          <p className="text-sm font-medium">개인정보 수집 · 이용 동의</p>
          <dl className="flex flex-col gap-1.5 text-xs leading-relaxed text-ink-muted">
            <div className="flex gap-2">
              <dt className="w-14 shrink-0 text-ink-faint">수집 항목</dt>
              <dd className="min-w-0">회사명 · 지역 · 담당자명 · 이메일 · 휴대폰 번호 · 문의 내용 · 첨부파일</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-14 shrink-0 text-ink-faint">이용 목적</dt>
              <dd className="min-w-0">문의 접수와 답변, 그에 따른 상담 진행</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-14 shrink-0 text-ink-faint">보관 기간</dt>
              <dd className="min-w-0">답변 완료 후 3년. 기간이 지나면 지체 없이 파기합니다</dd>
            </div>
          </dl>

          {/*
            거부할 수 있다는 것과 그때 어떻게 되는지를 함께 적는다. 법이 요구하는 고지이면서,
            적어 두지 않으면 동의가 형식만 남는다.
          */}
          <p className="text-xs leading-relaxed text-ink-faint">
            동의하지 않으실 수 있습니다. 다만 연락처 없이는 답변을 드릴 수 없어 문의 접수가 되지 않습니다.{' '}
            <a href="/privacy" className="underline underline-offset-2 hover:text-ink">
              개인정보 처리방침
            </a>
          </p>

          <label className="flex w-fit cursor-pointer items-center gap-2 text-sm">
            <Checkbox checked={agreed} onChange={setAgreed} label="개인정보 수집 · 이용에 동의" />
            <span>
              위 내용에 동의합니다
              <span aria-hidden className="ml-0.5 text-signal-danger">*</span>
            </span>
          </label>

          {submitted && errors.agreed && (
            <p className="text-xs leading-relaxed text-signal-danger">{errors.agreed}</p>
          )}
        </div>

        <div className="flex justify-end">
          <Button onClick={submit}>문의 보내기</Button>
        </div>
      </section>
    </div>
  );
}

/** 왼쪽 아래의 연락 한 줄. 값이 길어도 줄을 넘기지 않게 감싼다. */
function Channel({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <p className="flex items-center gap-2 text-sm text-ink-muted">
      <span className="shrink-0 text-ink-faint">{icon}</span>
      <span className="min-w-0 break-words">{value}</span>
    </p>
  );
}
