/**
 * 고객사 담당자 — **프론트엔드 전용** 시드.
 *
 * 고객사 레코드(`lib/data/tenants.ts`)에는 담당자가 **한 명**만 적혀 있다. 실제로는 결제
 * 담당과 기술 담당이 다르고, 계약을 정하는 사람은 또 다르다. 한 칸에 눌러 담으면 누구에게
 * 연락할지 매번 묻게 되고, 급할 때(장애·연체) 그 물음이 가장 비싸다.
 *
 * `tenantId` 는 고객사 코드와 같다 — 두 화면이 같은 고객사를 가리키게 하려는 것이라 이름을
 * 여기 다시 적지 않는다.
 */
import type { BadgeTone } from '@winpilot/ui';

export type ContactRole = '총괄' | '결제' | '기술' | '운영';

export type ContactRecord = {
  id: string;
  tenantId: string;
  name: string;
  role: ContactRole;
  /** 고객사 안에서의 직함 */
  title: string;
  email: string;
  phone: string;
  /**
   * 대표로 연락할 사람인지.
   *
   * 고객사마다 하나만 둔다. 여럿이면 급할 때 누구에게 먼저 걸지 다시 고르게 되고,
   * 하나도 없으면 목록을 처음부터 읽어야 한다.
   */
  primary: boolean;
  memo: string;
};

export const CONTACT_ROLES: ContactRole[] = ['총괄', '결제', '기술', '운영'];

/** 그 역할에 무엇을 물어야 하는지 — 목록 위에 적어 둔다. 역할 이름만으로는 갈리지 않는다. */
export const ROLE_MEANING: Record<ContactRole, string> = {
  총괄: '계약과 플랜을 정하는 사람. 연장·해지를 이 사람과 이야기한다.',
  결제: '청구서를 받고 세금계산서를 처리하는 사람. 연체는 여기로 건다.',
  기술: '도메인·연동·장애를 다루는 사람. DNS 값을 넘길 곳이다.',
  운영: '어드민을 매일 쓰는 사람. 기능 문의가 여기서 나온다.',
};

export const CONTACTS: ContactRecord[] = [
  {
    id: 'CT-9001',
    tenantId: 'T-101',
    name: '김서연',
    role: '총괄',
    title: '이커머스팀 팀장',
    email: 'seoyeon.kim@moodhouse.example',
    phone: '01043215678',
    primary: true,
    memo: '',
  },
  {
    id: 'CT-9002',
    tenantId: 'T-101',
    name: '조민재',
    role: '결제',
    title: '재무팀',
    email: 'minjae.cho@moodhouse.example',
    phone: '01055556666',
    primary: false,
    memo: '세금계산서는 매월 5일까지 요청합니다.',
  },
  {
    id: 'CT-9003',
    tenantId: 'T-101',
    name: '윤태호',
    role: '기술',
    title: '인프라 담당',
    email: 'taeho.yoon@moodhouse.example',
    phone: '01077778888',
    primary: false,
    memo: '도메인 관리 권한을 가진 유일한 사람입니다.',
  },
  {
    id: 'CT-9004',
    tenantId: 'T-102',
    name: '박지훈',
    role: '총괄',
    title: '대표',
    email: 'jihoon.park@trailnote.example',
    phone: '01088776655',
    primary: true,
    memo: '',
  },
  {
    id: 'CT-9005',
    tenantId: 'T-102',
    name: '서예린',
    role: '운영',
    title: 'MD',
    email: 'yerin.seo@trailnote.example',
    phone: '01099990000',
    primary: false,
    memo: '상품 등록을 매일 합니다 — 기능 문의는 대부분 여기서 옵니다.',
  },
  {
    id: 'CT-9006',
    tenantId: 'T-103',
    name: '이하늘',
    role: '총괄',
    title: '점장',
    email: 'haneul.lee@bakerslab.example',
    phone: '01033334444',
    primary: true,
    memo: '결제도 이 사람이 함께 봅니다 — 담당이 나뉘어 있지 않습니다.',
  },
];

export const ROLE_TONE: Record<ContactRole, BadgeTone> = {
  총괄: 'brand',
  결제: 'neutral',
  기술: 'ok',
  운영: 'neutral',
};

/** 그 고객사의 담당자. 대표가 맨 위로 온다 — 급할 때 먼저 읽혀야 한다. */
export function contactsOf(tenantId: string, items: readonly ContactRecord[] = CONTACTS): ContactRecord[] {
  return items
    .filter((item) => item.tenantId === tenantId)
    .sort((a, b) => (a.primary === b.primary ? 0 : a.primary ? -1 : 1));
}

/** 대표 담당자가 없는 고객사 — 급할 때 누구에게 걸지 목록을 처음부터 읽어야 하는 곳이다. */
export function tenantsWithoutPrimary(tenantIds: readonly string[]): string[] {
  return tenantIds.filter((id) => !CONTACTS.some((item) => item.tenantId === id && item.primary));
}

/** 연락처를 가린 모양. 사내 전용이라 상세에서는 그대로 보여 주고, 목록에서만 줄인다. */
export function maskPhone(phone: string): string {
  if (phone.length < 8) return phone;
  return `${phone.slice(0, 3)}-****-${phone.slice(-4)}`;
}
