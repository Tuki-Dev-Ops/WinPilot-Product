'use client';

import { useState, type FormEvent } from 'react';
import { AdminConfirmModal } from '@/app/_components/AdminConfirmModal';
import {
  ContentField,
  ContentFormActions,
  ContentSection,
  ContentToggle,
} from '@/app/contents/_components/ContentFormShell';
import {
  Dropdown,
  HintInput,
  HintTextarea,
  ImageUploader,
  useToast,
  type ImageRules,
  type UploadedImage,
} from '@winpilot/ui';
import { hasErrors } from '@/lib/validation/content-record';
import {
  buildRobotsTxt,
  buildSitemapXml,
  lengthState,
  parseSitemapPaths,
  SEO_LIMITS,
  validateSeo,
  type SeoFormErrors,
  type SeoFormInput,
} from '@/lib/validation/seo-record';

const DEFAULT_SEO: SeoFormInput = {
  title: 'WinPilot — 자원 중심 커머스 운영',
  description: '상품·주문·콘텐츠를 한 화면에서 다루는 커머스 운영 도구입니다.',
  keywords: '커머스, 어드민, 운영 도구',
  canonicalUrl: 'https://example.com',
  indexable: true,
  ogTitle: 'WinPilot',
  ogDescription: '상품·주문·콘텐츠를 한 화면에서.',
  twitterCard: 'summary_large_image',
  sitemapPaths: ['/', '/products', '/contents/notices', '/company/about', '/contact'].join('\n'),
  naverVerification: '',
  googleVerification: '',
};

/** 파비콘은 ICO·PNG·SVG 만 받는다 — 브라우저 탭이 읽을 수 있는 형식이 그 셋이다. */
const FAVICON_RULES: ImageRules = {
  maxCount: 1,
  types: ['image/x-icon', 'image/vnd.microsoft.icon', 'image/png', 'image/svg+xml'],
  typeLabel: 'ICO · PNG · SVG',
  aspectRatios: [{ label: '1:1', value: 1 }],
  minEdge: 32,
  maxBytes: 512 * 1024,
};

/** 공유 카드 큰 이미지 — 카카오톡·슬랙이 1.91:1 로 잘라 보여준다. */
const OG_LARGE_RULES: ImageRules = {
  maxCount: 1,
  aspectRatios: [{ label: '1.91:1', value: 1.91 }],
  minEdge: 200,
};

/** 공유 카드 작은 이미지 — 정사각형으로 나가는 자리다. */
const OG_SMALL_RULES: ImageRules = {
  maxCount: 1,
  aspectRatios: [{ label: '1:1', value: 1 }],
  minEdge: 120,
};

const TWITTER_CARDS = [
  { value: 'summary_large_image', label: '큰 이미지 (summary_large_image)' },
  { value: 'summary', label: '작은 이미지 (summary)' },
];

/** 글자 수 안내 — 넘으면 붉게. 막지는 않는다, 잘릴 뿐이다. */
function LengthHint({ value, limit }: { value: string; limit: number }) {
  const state = lengthState(value, limit);
  return (
    <p className={`text-xs tabular-nums ${state.over ? 'text-signal-danger' : 'text-ink-faint'}`}>
      {state.text}
      {state.over && ' — 검색 결과에서 뒤가 잘립니다'}
    </p>
  );
}

/**
 * SEO 정보 — **검색엔진**에 어떻게 잡히는지와 **링크를 공유했을 때** 어떻게 보이는지를 정한다.
 *
 * 두 가지는 다른 것이라 화면에서도 나눠 둔다. 검색 제목·설명은 구글 결과 한 줄이고,
 * 공유 카드(OG)는 카카오톡·슬랙에 붙는 미리보기다. 같은 값을 쓰는 일이 많지만 길이 한계가 다르다.
 *
 * **프론트엔드 전용** — 저장 결과는 이 화면에만 반영된다.
 */
export function SeoSettingsView({ today }: { today: string }) {
  const toast = useToast();
  const [value, setValue] = useState<SeoFormInput>(DEFAULT_SEO);
  const [ogLarge, setOgLarge] = useState<UploadedImage[]>([]);
  const [ogSmall, setOgSmall] = useState<UploadedImage[]>([]);
  const [favicons, setFavicons] = useState<UploadedImage[]>([]);
  const [errors, setErrors] = useState<SeoFormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const update = <K extends keyof SeoFormInput>(field: K, next: SeoFormInput[K]) => {
    const draft = { ...value, [field]: next };
    setValue(draft);
    if (submitted) setErrors(validateSeo(draft));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    const found = validateSeo(value);
    setErrors(found);

    if (hasErrors(found)) {
      const first = (['title', 'description', 'canonicalUrl', 'sitemapPaths'] as const).find((field) => found[field]);
      if (first) document.getElementById(`seo-${first}`)?.focus();
      toast.error({
        message: '저장하지 못했습니다.',
        detail: `확인이 필요한 항목이 ${Object.keys(found).length}개 있습니다.`,
      });
      return;
    }

    setConfirmOpen(true);
  };

  const sitemap = parseSitemapPaths(value.sitemapPaths);
  // 미리보기는 고른 카드 형태에 맞는 이미지를 보여준다.
  const shareImage = (value.twitterCard === 'summary' ? ogSmall[0]?.url : ogLarge[0]?.url) ?? '';
  const host = value.canonicalUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-6 xl:flex-row xl:items-start">
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <ContentSection title="검색엔진" description="구글·네이버 검색 결과에 나오는 제목과 설명입니다.">
          <ContentField id="seo-title" label="검색 제목" {...(errors.title ? { error: errors.title } : {})}>
            <HintInput
              id="seo-title"
              type="text"
              hint="사이트 제목을 입력해 주세요"
              value={value.title}
              onChange={(event) => update('title', event.target.value)}
              invalid={Boolean(errors.title)}
            />
            <LengthHint value={value.title} limit={SEO_LIMITS.title} />
          </ContentField>

          <ContentField
            id="seo-description"
            label="검색 설명"
            {...(errors.description ? { error: errors.description } : {})}
          >
            <HintTextarea
              id="seo-description"
              hint="검색 결과에 함께 보여줄 한두 문장"
              value={value.description}
              onChange={(event) => update('description', event.target.value)}
              invalid={Boolean(errors.description)}
            />
            <LengthHint value={value.description} limit={SEO_LIMITS.description} />
          </ContentField>

          <ContentField
            id="seo-canonicalUrl"
            label="대표 주소"
            {...(errors.canonicalUrl ? { error: errors.canonicalUrl } : {})}
          >
            <HintInput
              id="seo-canonicalUrl"
              type="url"
              inputMode="url"
              hint="https://example.com"
              value={value.canonicalUrl}
              onChange={(event) => update('canonicalUrl', event.target.value)}
              invalid={Boolean(errors.canonicalUrl)}
            />
          </ContentField>

          <ContentToggle
            legend="검색엔진 수집"
            options={['허용', '차단']}
            value={value.indexable}
            onChange={(next) => update('indexable', next)}
          />
          {!value.indexable && (
            <p className="rounded-lg bg-signal-danger/12 px-4 py-3 text-sm leading-relaxed text-signal-danger">
              차단하면 검색 결과에서 사이트가 사라집니다. 오픈 전 준비 기간에만 쓰세요.
            </p>
          )}
        </ContentSection>

        <ContentSection
          title="공유 카드"
          description="카카오톡·슬랙 등에 링크를 붙였을 때 보이는 미리보기입니다."
        >
          <ContentField id="seo-ogTitle" label="공유 제목">
            <HintInput
              id="seo-ogTitle"
              type="text"
              hint="비우면 검색 제목을 씁니다"
              value={value.ogTitle}
              onChange={(event) => update('ogTitle', event.target.value)}
            />
            <LengthHint value={value.ogTitle} limit={SEO_LIMITS.ogTitle} />
          </ContentField>

          <ContentField id="seo-ogDescription" label="공유 설명">
            <HintTextarea
              id="seo-ogDescription"
              hint="비우면 검색 설명을 씁니다"
              value={value.ogDescription}
              onChange={(event) => update('ogDescription', event.target.value)}
            />
            <LengthHint value={value.ogDescription} limit={SEO_LIMITS.ogDescription} />
          </ContentField>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">카드 형태</span>
            <Dropdown
              id="seo-twitterCard"
              label="카드 형태 선택"
              options={TWITTER_CARDS}
              value={value.twitterCard}
              onChange={(next) => update('twitterCard', next)}
            />
          </div>

          {/*
            큰 이미지와 작은 이미지를 따로 받는다.
            카드 형태를 바꿀 때마다 이미지를 다시 올리게 하면, 바꿔 보는 것 자체가 일이 된다.
          */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">큰 이미지</span>
              <span className="shrink-0 whitespace-nowrap rounded-full bg-surface px-2 py-0.5 text-xs text-ink-faint">
                summary_large_image
              </span>
            </div>
            <ImageUploader images={ogLarge} onChange={setOgLarge} rules={OG_LARGE_RULES} />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">작은 이미지</span>
              <span className="shrink-0 whitespace-nowrap rounded-full bg-surface px-2 py-0.5 text-xs text-ink-faint">
                summary
              </span>
            </div>
            <ImageUploader images={ogSmall} onChange={setOgSmall} rules={OG_SMALL_RULES} />
          </div>
        </ContentSection>

        <ContentSection title="파비콘" description="브라우저 탭과 즐겨찾기에 쓰이는 작은 아이콘입니다.">
          {/* 정사각형만 받는다 — 브라우저가 정사각형으로 우겨 넣어 찌그러진다. SVG 는 크기 검사를 건너뛴다. */}
          <ImageUploader images={favicons} onChange={setFavicons} rules={FAVICON_RULES} />
        </ContentSection>

        <ContentSection
          title="사이트맵 · 검색엔진 등록"
          description="네이버 서치어드바이저·구글 서치콘솔에 제출할 sitemap.xml 과 robots.txt 를 만듭니다."
        >
          <ContentField
            id="seo-sitemapPaths"
            label="사이트맵에 넣을 경로"
            {...(errors.sitemapPaths ? { error: errors.sitemapPaths } : {})}
          >
            <HintTextarea
              id="seo-sitemapPaths"
              hint={'한 줄에 하나씩 · / 로 시작\n/products'}
              value={value.sitemapPaths}
              onChange={(event) => update('sitemapPaths', event.target.value)}
              invalid={Boolean(errors.sitemapPaths)}
            />
            <p className="text-xs text-ink-faint">
              유효한 경로 <span className="tabular-nums">{sitemap.paths.length}</span>개
              {sitemap.invalid.length > 0 && (
                <span className="text-signal-danger"> · 형식이 틀린 줄 {sitemap.invalid.length}개</span>
              )}
            </p>
          </ContentField>

          <ContentField id="seo-keywords" label="키워드 (선택)">
            <HintInput
              id="seo-keywords"
              type="text"
              hint="쉼표로 구분해 입력해 주세요"
              value={value.keywords}
              onChange={(event) => update('keywords', event.target.value)}
            />
            <p className="text-xs leading-relaxed text-ink-faint">
              키워드 메타 태그는 검색 순위에 쓰이지 않습니다. 사이트 안 검색과 분류에만 쓰입니다.
            </p>
          </ContentField>

          <ContentField id="seo-naverVerification" label="네이버 서치어드바이저 소유확인 코드">
            <HintInput
              id="seo-naverVerification"
              type="text"
              hint="naver-site-verification 메타 태그의 content 값"
              value={value.naverVerification}
              onChange={(event) => update('naverVerification', event.target.value)}
            />
          </ContentField>

          <ContentField id="seo-googleVerification" label="구글 서치콘솔 소유확인 코드">
            <HintInput
              id="seo-googleVerification"
              type="text"
              hint="google-site-verification 메타 태그의 content 값"
              value={value.googleVerification}
              onChange={(event) => update('googleVerification', event.target.value)}
            />
          </ContentField>

          {/* 무엇이 실제로 나가는지 그대로 보여준다 — 제출하고 나서 확인할 일이 아니다. */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">sitemap.xml</span>
            <pre className="max-h-64 overflow-auto rounded-lg bg-surface px-4 py-3 font-mono text-xs leading-relaxed text-ink-muted">
              {buildSitemapXml(value.canonicalUrl, sitemap.paths, today)}
            </pre>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">robots.txt</span>
            <pre className="overflow-auto rounded-lg bg-surface px-4 py-3 font-mono text-xs leading-relaxed text-ink-muted">
              {buildRobotsTxt(value.canonicalUrl, value.indexable)}
            </pre>
          </div>
        </ContentSection>
      </div>

      <ContentFormActions
        mode="edit"
        onList={() => {
          setValue(DEFAULT_SEO);
          setErrors({});
          setSubmitted(false);
          toast.info({ message: '입력을 되돌렸습니다.', detail: '마지막으로 저장된 내용으로 돌아갑니다.' });
        }}
      >
        {/* 검색 결과 미리보기 — 실제로 어떻게 잘리는지 보여준다 */}
        <ContentSection title="검색 결과 미리보기">
          <div className="flex flex-col gap-1 rounded-lg bg-surface px-4 py-3">
            <p className="truncate text-xs text-ink-muted">{host || 'example.com'}</p>
            <p className="truncate text-sm font-medium text-brand-700 dark:text-brand-300">
              {value.title.trim() || '검색 제목이 여기에 표시됩니다'}
            </p>
            <p className="line-clamp-2 text-xs leading-relaxed text-ink-muted">
              {value.description.trim() || '검색 설명이 여기에 표시됩니다.'}
            </p>
          </div>

          {!value.indexable && (
            <p className="text-xs leading-relaxed text-signal-danger">
              수집이 차단되어 있어 실제 검색 결과에는 나오지 않습니다.
            </p>
          )}
        </ContentSection>

        <ContentSection title="공유 카드 미리보기">
          <div className="overflow-hidden rounded-lg border border-border">
            <div className={`flex items-center justify-center bg-surface ${value.twitterCard === 'summary' ? 'aspect-square' : 'aspect-[1.91/1]'}`}>
              {shareImage ? (
                // 미리보기는 objectURL 이라 next/image 최적화 대상이 아니다.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={shareImage} alt="공유 이미지" className="size-full object-cover" />
              ) : (
                <span className="text-xs text-ink-faint">공유 이미지</span>
              )}
            </div>
            <div className="flex items-start gap-2 px-3 py-3">
              <span className="flex size-5 shrink-0 items-center justify-center overflow-hidden rounded bg-surface text-[8px] text-ink-faint">
                {favicons[0]?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={favicons[0].url} alt="파비콘" className="size-full object-cover" />
                ) : (
                  '아이콘'
                )}
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium">
                  {value.ogTitle.trim() || value.title.trim() || '공유 제목'}
                </p>
                <p className="line-clamp-2 text-[11px] leading-relaxed text-ink-muted">
                  {value.ogDescription.trim() || value.description.trim() || '공유 설명'}
                </p>
                <p className="mt-1 truncate text-[10px] text-ink-faint">{host || 'example.com'}</p>
              </div>
            </div>
          </div>
        </ContentSection>
      </ContentFormActions>

      <AdminConfirmModal
        open={confirmOpen}
        tone="brand"
        title="SEO 정보 저장"
        description="검색 결과와 공유 카드에 바로 반영됩니다."
        confirmLabel="저장"
        summary={[
          { label: '검색 제목', value: value.title.trim() },
          { label: '대표 주소', value: value.canonicalUrl.trim() },
          { label: '검색엔진 수집', value: value.indexable ? '허용' : '차단' },
          { label: '공유 이미지', value: `큰 ${ogLarge.length > 0 ? '있음' : '없음'} · 작은 ${ogSmall.length > 0 ? '있음' : '없음'}` },
          { label: '사이트맵', value: `${sitemap.paths.length}개 경로` },
          { label: '파비콘', value: favicons.length > 0 ? '있음' : '없음' },
        ]}
        onConfirm={() => {
          setConfirmOpen(false);
          toast.success({ message: 'SEO 정보를 저장했습니다.', detail: value.canonicalUrl.trim() });
        }}
        onClose={() => setConfirmOpen(false)}
      />
    </form>
  );
}
