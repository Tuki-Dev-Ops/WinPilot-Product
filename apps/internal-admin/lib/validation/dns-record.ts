/**
 * DNS 레코드 값의 **종류별 모양 검사**.
 *
 * ## 왜 종류마다 다른가
 * 한 칸에 아무 글자나 받으면, 틀린 값은 **고객사 도메인에 들어간 뒤에** 드러난다. 그때는
 * 사이트가 안 열리거나 메일이 스팸으로 가고 있는 상태이고, 원인을 찾는 것도 우리 몫이 된다.
 *
 * 그래서 저장 전에 종류가 요구하는 모양을 본다 — `A` 에 도메인을 적거나 `MX` 에 우선순위를
 * 빠뜨리는 것은 **여기서 잡을 수 있는 실수**다.
 *
 * ## 여기서 하지 않는 것
 * 실제로 그 값이 우리 배포를 가리키는지는 **묻지 않는다.** 그것은 모양이 아니라 사실이고,
 * 화면의 `다시 확인` 이 답한다. 모양 검사가 사실 검사인 척하면 통과한 값을 믿게 된다.
 */
import type { DnsKind } from '@/lib/data/dns-records';

export type DnsField = 'host' | 'value' | 'ttl';

export type DnsFormInput = {
  host: string;
  value: string;
  ttl: string;
};

export type DnsFormErrors = Partial<Record<DnsField, string>>;

/** 도메인 이름 한 마디. 끝의 점(루트 표기)은 허용한다 — 등록기관 화면이 그렇게 적어 준다. */
const HOSTNAME = /^(?:\*\.)?(?:[a-zA-Z0-9_](?:[a-zA-Z0-9_-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}\.?$/;

const IPV4 = /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/;

/** 축약(`::`)까지 다 받는 완전한 문법은 길다 — 자릿수와 쓰이는 글자만 본다. */
const IPV6 = /^[0-9a-fA-F:]{2,39}$/;

/** `0 issue "letsencrypt.org"` — 플래그 · 태그 · 따옴표 안의 값. */
const CAA = /^\d{1,3}\s+(issue|issuewild|iodef|issuemail)\s+"[^"]*"$/;

/** `10 mx.example.com` — 우선순위와 서버 이름. */
const MX = /^(\d{1,5})\s+(\S+)$/;

/**
 * TTL 의 아래·위 끝.
 *
 * 60초 아래로 내리면 캐시가 사실상 없어져 조회가 그만큼 늘고, 하루를 넘기면 값을 고쳐도
 * 그날 안에 퍼지지 않는다.
 */
const TTL_MIN = 60;
const TTL_MAX = 86_400;

/** 그 종류가 요구하는 모양. 메시지는 **무엇을 적어야 하는지**로 적는다. */
function valueError(kind: DnsKind, raw: string): string | undefined {
  const value = raw.trim();
  if (!value) return '값을 입력해 주세요.';

  switch (kind) {
    case 'A':
      return IPV4.test(value) ? undefined : 'IPv4 주소를 적어 주세요. 예: 203.0.113.10';
    case 'AAAA':
      return IPV6.test(value) && value.includes(':')
        ? undefined
        : 'IPv6 주소를 적어 주세요. 예: 2001:db8::10';
    case 'CNAME':
      return HOSTNAME.test(value) ? undefined : '가리킬 도메인 이름을 적어 주세요. 예: admin.winpilot.app';
    case 'MX': {
      const match = MX.exec(value);
      if (!match) return '우선순위와 서버 이름을 함께 적어 주세요. 예: 10 mx.winpilot.app';
      if (!HOSTNAME.test(match[2] ?? '')) return '서버 이름이 도메인 모양이 아닙니다. 예: 10 mx.winpilot.app';
      return undefined;
    }
    case 'CAA':
      return CAA.test(value)
        ? undefined
        : '플래그 · 태그 · 값을 적어 주세요. 예: 0 issue "letsencrypt.org"';
    case 'TXT': {
      /*
        TXT 는 아무 글자나 담을 수 있어 모양만으로는 틀린 것을 잡지 못한다. 대신 **이름이
        정해진 두 가지**(SPF · DMARC)는 시작 토막이 정해져 있어, 그것만 본다.
      */
      if (value.toLowerCase().startsWith('v=spf') && !value.startsWith('v=spf1')) {
        return 'SPF 는 `v=spf1` 로 시작해야 합니다.';
      }
      if (value.toLowerCase().startsWith('v=dmarc') && !value.startsWith('v=DMARC1')) {
        return 'DMARC 는 `v=DMARC1` 로 시작해야 합니다(대소문자까지 같아야 합니다).';
      }
      return undefined;
    }
    default:
      return undefined;
  }
}

export function validateDnsForm(kind: DnsKind, input: DnsFormInput): DnsFormErrors {
  const found: DnsFormErrors = {};

  const host = input.host.trim();
  if (!host) {
    found.host = '호스트를 입력해 주세요.';
  } else if (!HOSTNAME.test(host)) {
    /* `_acme-challenge.example.com` 처럼 밑줄로 시작하는 이름도 정상이라 밑줄을 허용한다. */
    found.host = '호스트가 도메인 모양이 아닙니다. 예: www.example.com';
  }

  const value = valueError(kind, input.value);
  if (value) found.value = value;

  const ttl = Number(input.ttl.trim());
  if (!input.ttl.trim()) {
    found.ttl = 'TTL 을 입력해 주세요.';
  } else if (!Number.isInteger(ttl)) {
    found.ttl = 'TTL 은 숫자(초)로 적습니다.';
  } else if (ttl < TTL_MIN || ttl > TTL_MAX) {
    found.ttl = `TTL 은 ${TTL_MIN}초 이상 ${TTL_MAX}초 이하로 적습니다.`;
  }

  return found;
}

export function hasDnsErrors(errors: DnsFormErrors): boolean {
  return Object.keys(errors).length > 0;
}
