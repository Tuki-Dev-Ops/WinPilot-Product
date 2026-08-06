/**
 * 앱들이 공유하는 UI 조각.
 *
 * **뷰 하나가 곧 레포 하나**이므로(packages/spec/src/types.ts), 앱 안에 이 컴포넌트를
 * 복사해 두면 레포를 나누는 순간 두 벌이 되어 서로 어긋난다. 토큰(`@winpilot/tokens`)과
 * 같은 이유로 여기 한 곳에만 둔다.
 *
 * 여기 들어오는 것은 **도메인을 모르는 것**이다 — `Checkbox` 나 `Dropdown` 은 자기가 무엇을
 * 고르는지 모른다.
 *
 * ## 목록 툴바가 여기 있는 이유 (전에는 아니었다)
 * 이 자리에는 원래 "목록 툴바나 어드민 셸처럼 화면 구조를 아는 것은 각 앱이 갖는다 —
 * 앱마다 구조가 다르기 때문이다" 라고 적혀 있었다. **그 전제가 더는 맞지 않는다.**
 * 두 어드민(B2C Admin · Internal Admin)이 같은 목록 툴바를 쓰기로 정했고, 그때부터
 * 앱마다 두는 것은 두 벌을 만드는 일이 된다. 그래서 `ListToolbar` 를 올렸다.
 *
 * **셸은 여전히 각 앱이 갖는다.** 사이드바 메뉴도, 어느 콘솔인지 알리는 표시(먹색 로고 칩 ·
 * `Internal` 워드마크 · 사내 전용 한 줄)도 실제로 다르기 때문이다 — 거기서는 "앱마다 구조가
 * 다르다" 가 아직 참이다.
 *
 * 올릴지 말지의 기준은 "화면 구조를 아느냐" 가 아니라 **"두 앱이 같은 것을 쓰기로 정했느냐"**다.
 *
 * ## 나중에 올린 것들 — 전부 이미 어긋난 뒤에 올렸다
 * `Badge` · `Button` · `Modal` 은 처음부터 여기 있던 것이 아니다. 세 자리 모두 **두 벌로 두는
 * 동안 조용히 갈라졌고**, 그 갈라진 자리를 세다가 올렸다.
 *
 * | 무엇 | 올리기 전 상태 |
 * |---|---|
 * | `Badge` | 화면 서른세 장에 마흔아홉 자리, 톤 표 스물한 개 — 실제 색은 넷뿐 |
 * | `Button` | 같은 파란 단추가 열다섯 가지 클래스 조합으로 |
 * | `Modal` | 백 줄짜리 두 벌 중 스무 줄이 한쪽에만 (Esc 스택 · 애니메이션 · `elevated`) |
 *
 * 셋의 공통점: **타입이 막아 주지 못하는 어긋남**이었다. 클래스 문자열은 `string` 이고,
 * 빠뜨린 `dark:` 접두어나 없는 `transition` 은 컴파일을 통과한다. 그래서 눈으로 세기 전까지
 * 아무도 몰랐다 — 여기 올리는 일은 코드를 줄이는 일이기 전에 **어긋날 수 있는 자리를 없애는
 * 일**이다.
 */
export { BackLink, type BackLinkProps } from './BackLink';
export { Badge, type BadgeProps, type BadgeTone } from './Badge';
export { BrandMark, type BrandMarkProps } from './BrandMark';
export { Button, type ButtonProps, type ButtonTone } from './Button';
export { Checkbox, type CheckboxProps } from './Checkbox';
export { Dropdown, type DropdownOption, type DropdownProps } from './Dropdown';
export { Field, RequiredLegend, type FieldProps } from './Field';
export { HintInput, type HintInputProps } from './HintInput';
export { HintTextarea, type HintTextareaProps } from './HintTextarea';
export {
  ListToolbar,
  ALL_VALUE,
  type ListToolbarProps,
  type ListToolbarTab,
  type ListFilterField,
} from './ListToolbar';
export { Modal, type ModalProps } from './Modal';
export { PageHeading } from './PageHeading';
export {
  RowActions,
  RowIconButton,
  RowTextButton,
  type RowActionIcon,
  type RowActionTone,
  type RowIconButtonProps,
  type RowTextButtonProps,
} from './RowActions';
export { RowSelectCell, SelectAllCell } from './RowSelect';
export { ImageUploader, type ImageUploaderProps, type UploadedImage } from './ImageUploader';
export { RichTextEditor, type RichTextEditorProps } from './RichTextEditor';
export {
  StatusScreen,
  type StatusAction,
  type StatusScreenProps,
  type StatusTone,
} from './StatusScreen';
export { ToastProvider, useToast, type Toast, type ToastTone } from './Toast';

export {
  ASPECT_16_9,
  ASPECT_21_9,
  ASPECT_TOLERANCE,
  acceptAttribute,
  IMAGE_RULES,
  IMAGE_RULE_TEXT,
  checkImageFile,
  describeRatio,
  formatBytes,
  imageRuleText,
  readImageSize,
  type AspectRatioRule,
  type ImageCheckResult,
  type ImageRejection,
  type ImageRules,
} from './image-upload';
