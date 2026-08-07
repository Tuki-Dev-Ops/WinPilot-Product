'use client';

import { useRef, useState } from 'react';
import { Clock, Mail, Paperclip, Phone, X } from 'lucide-react';
import { Button, Field, HintInput, HintTextarea, RequiredLegend, useToast } from '@winpilot/ui';
import { IR_COMPANY } from '@winpilot/store';

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

/** 붙임 파일 한 개의 크기 한도(MB). 메일로 그대로 전달되므로 받는 쪽 한도에 맞춘다. */
const MAX_MB = 20;

/**
 * 문의 양식 — **왼쪽에 갈래, 오른쪽에 양식**.
 *
 * ## FAQ · 특허 인증과 같은 틀이다
 * 세 화면 다 "여럿 중에서 하나를 고르고, 고른 것에 맞는 것을 본다" 는 같은 일을 한다. 그래서
 * 뼈대를 맞췄다 — 왼쪽에 고르는 줄, 오른쪽에 그 결과. CS CENTER 안을 오가는 사람이 화면마다
 * 다른 배치를 다시 익히지 않아도 된다.
 *
 * ## 무엇을 묻는가
 * 회사명 · 담당자명 · 휴대폰 · 이메일 · 내용 · 첨부.
 *
 * **회사명이 첫 칸인 이유**: 이 사이트로 오는 문의는 개인이 아니라 회사가 보낸다. 답하는 쪽도
 * 회사 이름으로 기존 상담 이력을 먼저 찾고, 그 이름이 없으면 같은 회사에서 온 두 문의를 서로
 * 다른 건으로 다룬다.
 *
 * 휴대폰과 이메일을 **둘 다** 받는다. 도입 검토는 메일로 자료를 주고받다가 통화로 넘어가는 일이
 * 잦은데, 그때 번호를 다시 물으면 하루가 더 걸린다. 대신 **필수는 이메일 하나**다 — 번호를
 * 반드시 적게 하면 남기기를 그만두는 사람이 생긴다.
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
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [body, setBody] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const errors = {
    company: company.trim() ? undefined : '회사명을 입력해 주세요.',
    name: name.trim() ? undefined : '담당자명을 입력해 주세요.',
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? undefined : '답을 받으실 메일 주소를 정확히 적어 주세요.',
    /* 번호는 선택이지만 **적었다면** 형식은 본다 — 적어 두고 연락이 안 되는 것이 더 나쁘다. */
    phone:
      !phone.trim() || /^[0-9+\-\s()]{9,20}$/.test(phone.trim())
        ? undefined
        : '연락 가능한 번호 형식으로 적어 주세요.',
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
    for (const file of Array.from(picked)) {
      if (file.size > MAX_MB * 1024 * 1024) tooBig.push(file.name);
      else kept.push(file);
    }

    if (tooBig.length > 0) {
      toast.error({ message: `${MAX_MB}MB 를 넘는 파일은 붙이지 못합니다.`, detail: tooBig.join(' · ') });
    }
    if (kept.length > 0) setFiles((previous) => [...previous, ...kept]);
  };

  const submit = () => {
    setSubmitted(true);
    if (broken > 0) {
      toast.error({ message: '보내지 못했습니다.', detail: `확인이 필요한 항목이 ${broken}개 있습니다.` });
      return;
    }

    toast.success({ message: '문의를 보냈습니다.', detail: `${kind} · ${email.trim()} 으로 답변드립니다.` });
    setCompany('');
    setName('');
    setPhone('');
    setEmail('');
    setBody('');
    setFiles([]);
    setSubmitted(false);
  };

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
      {/* 왼쪽 — 갈래와 연락처. 좁은 화면에서는 갈래가 가로로 눕는다(세로로 두면 양식이 화면 밖으로 밀린다). */}
      <aside className="flex shrink-0 flex-col gap-6 lg:w-60">
        <div>
          <p className="mb-3 text-xs font-medium text-ink-faint">문의 갈래</p>
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
          {...(submitted && errors.company
            ? { error: errors.company }
            : { hint: '기존에 상담하신 적이 있으면 같은 이름으로 적어 주세요.' })}
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
          label="담당자명"
          htmlFor="contact-name"
          required
          {...(submitted && errors.name ? { error: errors.name } : { hint: '직함을 함께 적어 주시면 좋습니다.' })}
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

        {/* 번호와 메일을 나란히 둔다 — 둘 다 연락처라, 세로로 떨어뜨리면 하나를 지나친다. */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field
            label="휴대폰 번호"
            htmlFor="contact-phone"
            {...(submitted && errors.phone ? { error: errors.phone } : { hint: '통화가 빠른 건이면 적어 주세요.' })}
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
            label="이메일"
            htmlFor="contact-email"
            required
            {...(submitted && errors.email ? { error: errors.email } : { hint: '이 주소로 답변드립니다.' })}
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
        </div>

        <Field
          label="문의 내용"
          htmlFor="contact-body"
          required
          {...(submitted && errors.body
            ? { error: errors.body }
            : { hint: '도입 검토시 지금 쓰시는 시스템과 설비를 함께 적어 주시면 빠릅니다.' })}
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

        <Field label="첨부파일" htmlFor="contact-files" hint={`파일당 ${MAX_MB}MB 까지 · 여러 개 가능`}>
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

        {/* 먼저 적어 둔다. 답을 못 받고 기다리는 것보다, 왜 답할 수 없는지를 보내기 전에 아는 편이 낫다. */}
        <p className="rounded-lg bg-surface px-4 py-3 text-xs leading-relaxed text-ink-muted">
          아직 공시하지 않은 실적·전망은 개별적으로 알려 드릴 수 없습니다. 특정 투자자에게만 미리 알리는 것은
          공정공시에 어긋납니다. 급하시면 {IR_COMPANY.irPhone} 으로 전화 주세요.
        </p>

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
