/**
 * 앱들이 공유하는 UI 원시 요소.
 *
 * **뷰 하나가 곧 레포 하나**이므로(packages/spec/src/types.ts), 앱 안에 이 컴포넌트를
 * 복사해 두면 레포를 나누는 순간 두 벌이 되어 서로 어긋난다. 토큰(`@winpilot/tokens`)과
 * 같은 이유로 여기 한 곳에만 둔다.
 *
 * 여기 들어오는 것은 **도메인을 모르는 것만**이다. 목록 툴바나 어드민 셸처럼
 * 화면 구조를 아는 것은 각 앱이 갖는다 — 앱마다 구조가 다르기 때문이다.
 */
export { Checkbox, type CheckboxProps } from './Checkbox';
export { Dropdown, type DropdownOption, type DropdownProps } from './Dropdown';
export { HintInput, type HintInputProps } from './HintInput';
export { HintTextarea, type HintTextareaProps } from './HintTextarea';
export { ImageUploader, type ImageUploaderProps, type UploadedImage } from './ImageUploader';
export { RichTextEditor, type RichTextEditorProps } from './RichTextEditor';
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
