import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

export function LogoMark({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path
        d="M9 52H23V38H37V24"
        stroke="#111318"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="50" cy="15" r="7" fill="#3355E0" />
    </svg>
  );
}

export function PanelLeftIcon({ size = 15, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" {...rest}>
      <rect x="2" y="2.5" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.25" />
      <path d="M5.8 2.5v11" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

export function PanelRightIcon({ size = 15, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" {...rest}>
      <rect x="2" y="2.5" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.25" />
      <path d="M10.2 2.5v11" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

export function SearchIcon({ size = 15, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" {...rest}>
      <circle cx="7.2" cy="7.2" r="4.5" stroke="currentColor" strokeWidth="1.25" />
      <path d="m10.7 10.7 2.8 2.8" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

/** 细线加号（新建定时任务表单提示词框左下角） */
export function PlusIcon({ size = 15, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" {...rest}>
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

/** 归档（运行记录「操作」列） */
export function ArchiveIcon({ size = 15, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" {...rest}>
      <rect x="2.5" y="3" width="11" height="3" rx="0.8" stroke="currentColor" strokeWidth="1.2" />
      <path d="M3.5 6v6.2c0 .5.4.8.8.8h7.4c.4 0 .8-.3.8-.8V6M6.5 8.5h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

/** 删除（运行记录「操作」列） */
export function TrashIcon({ size = 15, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" {...rest}>
      <path d="M2.8 4.2h10.4M6.2 4.2V2.8h3.6v1.4M4 4.2l.6 8.4c0 .5.4.9.9.9h5c.5 0 .9-.4.9-.9l.6-8.4M6.6 6.8v4.2M9.4 6.8v4.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** 立即运行（定时任务卡片悬停时右上角的 ▷） */
export function PlayIcon({ size = 15, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" {...rest}>
      <path d="M4.5 3.2v9.6c0 .4.4.6.7.4l7.2-4.8c.3-.2.3-.6 0-.8L5.2 2.8c-.3-.2-.7 0-.7.4Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

/** 圆圈里三个点的「更多」（定时任务卡片悬停时右上角） */
export function MoreCircleIcon({ size = 15, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" {...rest}>
      <circle cx="8" cy="8" r="6.2" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="5.4" cy="8" r="0.8" fill="currentColor" />
      <circle cx="8" cy="8" r="0.8" fill="currentColor" />
      <circle cx="10.6" cy="8" r="0.8" fill="currentColor" />
    </svg>
  );
}

export function FilterIcon({ size = 15, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" {...rest}>
      <path
        d="M2.5 3.5h11l-4.2 4.8v4.2l-2.6-1.3V8.3L2.5 3.5Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChevronDownIcon({ size = 12, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden="true" {...rest}>
      <path
        d="m3 4.5 3 3 3-3"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChevronUpIcon({ size = 12, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden="true" {...rest}>
      <path
        d="m3 7.5 3-3 3 3"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChevronRightIcon({ size = 12, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden="true" {...rest}>
      <path
        d="m4.5 3 3 3-3 3"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function NewTaskIcon({ size = 16, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" {...rest}>
      <circle cx="8" cy="8" r="5.8" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 5.2v5.6M5.2 8h5.6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function AssistantIcon({ size = 16, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" {...rest}>
      <rect x="3" y="4.5" width="10" height="8" rx="3" stroke="currentColor" strokeWidth="1.25" />
      <circle cx="6.2" cy="8.5" r="0.9" fill="currentColor" />
      <circle cx="9.8" cy="8.5" r="0.9" fill="currentColor" />
      <path d="M8 2.2v2.3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

export function ExtensionsIcon({ size = 16, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" {...rest}>
      <circle cx="8" cy="8" r="2.2" stroke="currentColor" strokeWidth="1.25" />
      <path
        d="M8 2.5v1.6M8 11.9v1.6M2.5 8h1.6M11.9 8h1.6M4.2 4.2l1.1 1.1M10.7 10.7l1.1 1.1M11.8 4.2l-1.1 1.1M5.3 10.7l-1.1 1.1"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ScheduleIcon({ size = 16, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" {...rest}>
      <circle cx="8" cy="8.4" r="5.2" stroke="currentColor" strokeWidth="1.25" />
      <path d="M8 5.6v2.9l2 1.2M6 2.2h4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

export function LibraryIcon({ size = 16, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" {...rest}>
      <path
        d="M2.6 4.2c0-.7.5-1.2 1.2-1.2h3.1c.6 0 1.1.5 1.1 1.1v8.7c0-.5-.5-.9-1.1-.9H3.8c-.7 0-1.2-.5-1.2-1.2V4.2Z"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <path
        d="M13.4 4.2c0-.7-.5-1.2-1.2-1.2H9.1c-.6 0-1.1.5-1.1 1.1v8.7c0-.5.5-.9 1.1-.9h3.1c.7 0 1.2-.5 1.2-1.2V4.2Z"
        stroke="currentColor"
        strokeWidth="1.25"
      />
    </svg>
  );
}

export function DiscoverIcon({ size = 16, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" {...rest}>
      <rect x="2.6" y="2.6" width="4.4" height="4.4" rx="1.1" stroke="currentColor" strokeWidth="1.25" />
      <rect x="9" y="2.6" width="4.4" height="4.4" rx="1.1" stroke="currentColor" strokeWidth="1.25" />
      <rect x="2.6" y="9" width="4.4" height="4.4" rx="1.1" stroke="currentColor" strokeWidth="1.25" />
      <circle cx="11.2" cy="11.2" r="2.2" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

export function FolderIcon({ size = 14, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" {...rest}>
      <path
        d="M2.2 4.5c0-.8.6-1.4 1.4-1.4h3l1.4 1.4h4.4c.8 0 1.4.6 1.4 1.4v5.7c0 .8-.6 1.4-1.4 1.4H3.6c-.8 0-1.4-.6-1.4-1.4V4.5Z"
        stroke="currentColor"
        strokeWidth="1.25"
      />
    </svg>
  );
}

export function FolderPlusIcon({ size = 14, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" {...rest}>
      <path
        d="M2.2 4.5c0-.8.6-1.4 1.4-1.4h3l1.4 1.4h4.4c.8 0 1.4.6 1.4 1.4v5.7c0 .8-.6 1.4-1.4 1.4H3.6c-.8 0-1.4-.6-1.4-1.4V4.5Z"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <path d="M8 6.8v3.6M6.2 8.6h3.6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

export function ShieldCheckIcon({ size = 14, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" {...rest}>
      <path
        d="M8 2.2 13 4.2v3.6c0 3.1-2.1 5.3-5 6.2-2.9-.9-5-3.1-5-6.2V4.2L8 2.2Z"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <path
        d="m5.8 8 1.5 1.5 3-3"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ShieldAlertIcon({ size = 14, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" {...rest}>
      <path
        d="M8 2.2 13 4.2v3.6c0 3.1-2.1 5.3-5 6.2-2.9-.9-5-3.1-5-6.2V4.2L8 2.2Z"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <path d="M8 5.6v3" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
      <circle cx="8" cy="10.7" r="0.8" fill="currentColor" />
    </svg>
  );
}

export function BellIcon({ size = 15, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" {...rest}>
      <path
        d="M4.2 6.8a3.8 3.8 0 1 1 7.6 0c0 2.8 1 3.7 1 3.7H3.2s1-.9 1-3.7Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <path d="M6.6 12.6a1.5 1.5 0 0 0 2.8 0" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

export function MobileLinkIcon({ size = 15, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" {...rest}>
      <rect x="2" y="3" width="8.5" height="6.8" rx="1.2" stroke="currentColor" strokeWidth="1.25" />
      <path d="M4.5 12.2h3.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <rect x="10.2" y="6.8" width="3.8" height="6.2" rx="0.9" fill="#f7f7f7" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

export function PaperclipIcon({ size = 15, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" {...rest}>
      <path
        d="M11.6 5.2 6.5 10.3a1.8 1.8 0 1 1-2.5-2.5l5.4-5.4a3 3 0 1 1 4.2 4.2l-5.7 5.7a4.2 4.2 0 0 1-6-6L6.6 2"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ModeWandIcon({ size = 15, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" {...rest}>
      <path
        d="M5.2 13.2 7.5 3.8c1.5-.3 3.7.3 4.3 1.7.5 1.3-.9 2.9-3.6 3.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M3.5 5.2v2M2.5 6.2h2" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" />
    </svg>
  );
}

export function SkillToolIcon({ size = 15, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" {...rest}>
      <path
        d="M4.5 12.2 11 5.7M7.8 3.5l4.7 4.7M9.6 2.8l3.6 3.6"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LinkChainIcon({ size = 15, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" {...rest}>
      <path
        d="M6.8 9.2 9.2 6.8M5.4 7.4l-1.5 1.5a2.4 2.4 0 1 0 3.4 3.4l1.5-1.5M10.6 8.6l1.5-1.5a2.4 2.4 0 1 0-3.4-3.4L7.2 5.2"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SparkleIcon({ size = 15, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" {...rest}>
      <path
        d="M8 2.2 9.4 6.6 13.8 8 9.4 9.4 8 13.8 6.6 9.4 2.2 8l4.4-1.4L8 2.2Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MicIcon({ size = 15, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" {...rest}>
      <rect x="5.5" y="2" width="5" height="8" rx="2.5" stroke="currentColor" strokeWidth="1.25" />
      <path d="M3.5 8a4.5 4.5 0 0 0 9 0M8 12.5V14" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

export function SendPlaneIcon({ size = 14, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" {...rest}>
      <path d="M8 2.8 12.8 12.5 8 10.3 3.2 12.5 8 2.8Z" fill="currentColor" />
    </svg>
  );
}

export function ShareIcon({ size = 14, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" {...rest}>
      <path
        d="M9.5 3.5 13.2 7.2 9.5 10.9M13 7.2H7.2a4.2 4.2 0 0 0-4.2 4.2v1.1"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PencilIcon({ size = 14, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" {...rest}>
      <path
        d="M3 12.8h2.6l6.7-6.7-2.6-2.6-6.7 6.7v2.6Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CopyIcon({ size = 14, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" {...rest}>
      <rect x="5.2" y="5.2" width="7.6" height="7.6" rx="1.4" stroke="currentColor" strokeWidth="1.2" />
      <path d="M3.2 10.4V4.2a1 1 0 0 1 1-1h6.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function RefreshIcon({ size = 14, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" {...rest}>
      <path
        d="M12.5 8A4.5 4.5 0 1 1 11 4.6M11.5 2.5v2.4H9.1"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ModelDotIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.2" fill="#1a1a1a" />
      <path d="M8 2.8a5.2 5.2 0 0 1 0 10.4c-1.8 0-3-1.4-3-2.9 0-1.6 1.3-2.3 3-2.3s3-.7 3-2.3c0-1.5-1.2-2.9-3-2.9Z" fill="#ffffff" />
      <circle cx="8" cy="5.5" r="1" fill="#1a1a1a" />
      <circle cx="8" cy="10.5" r="1" fill="#ffffff" />
    </svg>
  );
}
