'use client';

import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { useToast } from './Toast';
import {
  checkImageFile,
  formatBytes,
  IMAGE_RULES,
  acceptAttribute,
  imageRuleText,
  type ImageRejection,
  type ImageRules,
} from './image-upload';

export type UploadedImage = {
  key: string;
  /** 프론트엔드 전용 — 브라우저 메모리의 objectURL 이다. 새로고침하면 사라진다. */
  url: string;
  name: string;
  size: number;
};

export type ImageUploaderProps = {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  /** 화면별 추가 조건 (배너의 비율 제한 등). 생략하면 기본 조건만 본다. */
  rules?: ImageRules;
};

function UploadIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M10 13.5 V4.5 M6.5 8 L10 4.5 L13.5 8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.5 13 v2 a1.5 1.5 0 0 0 1.5 1.5 h10 a1.5 1.5 0 0 0 1.5 -1.5 v-2" strokeLinecap="round" />
    </svg>
  );
}

/**
 * 상품 이미지 업로드.
 *
 * **프론트엔드 전용** — 파일을 서버로 보내지 않고 `URL.createObjectURL` 로 미리보기만 만든다.
 * 첫 번째 이미지가 대표 이미지이며, 목록·고객 화면에 그것이 쓰인다.
 *
 * 올리는 칸은 사라지지 않고 **썸네일과 같은 정사각형 타일로 줄 끝에 남는다** —
 * 한 장 올린 뒤 다음 장을 올릴 곳을 다시 찾게 만들지 않기 위해서다.
 */
export function ImageUploader({ images, onChange, rules }: ImageUploaderProps) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [checking, setChecking] = useState(false);
  const createdUrls = useRef<string[]>([]);

  // 컴포넌트가 사라질 때 만들어 둔 objectURL 을 해제한다. 안 하면 메모리에 남는다.
  useEffect(() => {
    const urls = createdUrls.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const maxCount = rules?.maxCount ?? IMAGE_RULES.maxCount;
  // accept 와 실제 검사는 같은 목록에서 나온다 — 둘이 어긋나면 고를 수 있는데 거부되는 파일이 생긴다.
  const accept = acceptAttribute(rules);
  const full = images.length >= maxCount;

  const append = async (fileList: FileList | null) => {
    const files = Array.from(fileList ?? []);
    if (files.length === 0) return;

    setChecking(true);
    const taken = new Set(images.map((image) => image.name));
    const accepted: UploadedImage[] = [];
    const rejected: ImageRejection[] = [];

    for (const [index, file] of files.entries()) {
      const result = await checkImageFile(file, {
        takenNames: taken,
        slotsLeft: maxCount - images.length - accepted.length,
        ...(rules ? { rules } : {}),
      });
      if (!result.ok) {
        rejected.push({ name: file.name, reason: result.reason });
        continue;
      }
      const url = URL.createObjectURL(file);
      createdUrls.current.push(url);
      taken.add(file.name);
      accepted.push({ key: `${file.name}-${file.size}-${index}`, url, name: file.name, size: file.size });
    }
    setChecking(false);

    if (accepted.length > 0) {
      onChange([...images, ...accepted]);
      toast.success({
        message: `이미지 ${accepted.length}장을 추가했습니다.`,
        detail: `${images.length + accepted.length} / ${maxCount}장`,
      });
    }

    if (rejected.length > 0) {
      const first = rejected[0];
      toast.error({
        message: `이미지 ${rejected.length}장을 추가하지 못했습니다.`,
        detail:
          rejected.length === 1
            ? `${first?.name} — ${first?.reason}`
            : `${first?.name} — ${first?.reason} 외 ${rejected.length - 1}건`,
      });
    }
  };

  const handleSelect = (event: ChangeEvent<HTMLInputElement>) => {
    void append(event.target.files);
    event.target.value = '';
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    void append(event.dataTransfer.files);
  };

  const remove = (key: string) => {
    const target = images.find((image) => image.key === key);
    if (!target) return;
    URL.revokeObjectURL(target.url);
    onChange(images.filter((image) => image.key !== key));
    toast.info({ message: '이미지를 삭제했습니다.', detail: target.name });
  };

  const makePrimary = (key: string) => {
    const target = images.find((image) => image.key === key);
    if (!target) return;
    onChange([target, ...images.filter((image) => image.key !== key)]);
    toast.info({ message: '대표 이미지를 바꿨습니다.', detail: target.name });
  };

  const openPicker = () => {
    if (full) {
      toast.error({
        message: '더 올릴 수 없습니다.',
        detail: `이미지는 최대 ${maxCount}장까지 등록할 수 있습니다.`,
      });
      return;
    }
    inputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((image, index) => (
          <figure key={image.key} className="overflow-hidden rounded-lg border border-border bg-surface">
            <div className="relative aspect-square">
              {/* 미리보기는 objectURL 이라 next/image 최적화 대상이 아니다. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.url} alt={image.name} className="size-full object-cover" />
              {index === 0 && (
                <span className="absolute left-2 top-2 rounded-full bg-brand-500 px-2 py-0.5 text-xs font-medium text-white">
                  대표
                </span>
              )}
            </div>
            <figcaption className="flex items-center justify-between gap-2 px-2 py-2">
              <span className="min-w-0 flex-1 truncate text-xs text-ink-muted" title={image.name}>
                {image.name}
              </span>
              <div className="flex shrink-0 items-center gap-1">
                {index !== 0 && (
                  <button
                    type="button"
                    onClick={() => makePrimary(image.key)}
                    className="shrink-0 whitespace-nowrap rounded-lg px-2 py-1 text-xs text-ink-muted transition-colors duration-150 hover:text-ink"
                  >
                    대표로
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => remove(image.key)}
                  aria-label={`${image.name} 삭제`}
                  className="shrink-0 whitespace-nowrap rounded-lg px-2 py-1 text-xs text-signal-danger"
                >
                  삭제
                </button>
              </div>
            </figcaption>
          </figure>
        ))}

        {/* 올리는 칸 — 썸네일과 같은 정사각형으로 줄 끝에 남는다 */}
        <div className="overflow-hidden rounded-lg">
          <div
            onDragOver={(event) => {
              event.preventDefault();
              if (!full) setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={openPicker}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key !== 'Enter' && event.key !== ' ') return;
              event.preventDefault();
              openPicker();
            }}
            className={`flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-3 text-center transition-colors duration-150 ${
              full
                ? 'border-border cursor-not-allowed bg-surface opacity-60'
                : dragging
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-900'
                  : 'border-border-strong bg-surface hover:border-brand-500'
            }`}
          >
            <span className="text-ink-faint">
              <UploadIcon />
            </span>
            <p className="text-xs font-medium leading-snug">
              {checking ? '확인 중…' : full ? '더 올릴 수 없습니다' : '끌어다 놓거나 클릭'}
            </p>
            <p className="text-2xs tabular-nums text-ink-faint">
              {images.length} / {maxCount}장
            </p>
          </div>
          {/* 썸네일의 figcaption 높이만큼 자리를 맞춰 타일 아랫줄이 어긋나지 않게 한다 */}
          <div className="px-2 py-2">
            <p className="min-w-0 truncate text-xs text-ink-faint">
              {images.length === 0 ? '첫 장이 대표 이미지' : `대표: ${images[0]?.name ?? ''}`}
            </p>
          </div>
        </div>
      </div>

      <input ref={inputRef} type="file" accept={accept} multiple onChange={handleSelect} className="hidden" />

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-surface px-4 py-3">
        <p className="text-xs leading-relaxed text-ink-muted">{imageRuleText(rules)}</p>
        {images.length > 0 && (
          <p className="text-xs tabular-nums text-ink-faint">
            합계 {formatBytes(images.reduce((sum, image) => sum + image.size, 0))}
          </p>
        )}
      </div>
    </div>
  );
}
