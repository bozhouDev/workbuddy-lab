import { GuidanceCallout } from './GuidanceCue';
import type { GuidedTargetId } from './guidedTypes';

/** 新视图共用的等待目标参数（和 GuidedWorkBuddy 传给 SettingsViews5113 的一致） */
export interface TargetKitProps {
  waitTarget: GuidedTargetId | null;
  waitCallout: string | null;
  urgent: boolean;
  onTargetClick: (target: GuidedTargetId) => void;
  onAsideClick: (label: string, explain: string) => void;
}

type Placement = 'top' | 'bottom' | 'left' | 'right';
type Align = 'start' | 'center' | 'end';

/**
 * 生成三件套：蓝圈样式、引导气泡、点击处理
 * 点到当前等待目标就推进课程，点到别处就让泊舟用虚线气泡顺口解释，界面不锁死
 */
export function makeTargetKit(p: TargetKitProps) {
  /** 当前目标加蓝圈，等太久换成加强心跳 */
  const ring = (id: GuidedTargetId) =>
    p.waitTarget === id ? (p.urgent ? 'sim-ring-urgent' : 'sim-ring') : '';

  /** 当前目标旁边的蓝色引导气泡 */
  const callout = (id: GuidedTargetId, placement: Placement = 'top', align: Align = 'center') =>
    p.waitTarget === id && p.waitCallout ? (
      <GuidanceCallout text={p.waitCallout} placement={placement} align={align} />
    ) : null;

  /** 点击：命中目标推进，否则给出解释 */
  const click = (id: GuidedTargetId, label: string, explain: string) => (e?: { stopPropagation?: () => void }) => {
    e?.stopPropagation?.();
    if (p.waitTarget === id) {
      p.onTargetClick(id);
      return;
    }
    p.onAsideClick(label, explain);
  };

  /** 纯解释（没有课程目标的控件） */
  const aside = (label: string, explain: string) => (e?: { stopPropagation?: () => void }) => {
    e?.stopPropagation?.();
    p.onAsideClick(label, explain);
  };

  return { ring, callout, click, aside };
}

/** 色块 + 首字图标，代替官方 logo */
export function LetterIcon({ name, color, size = 36 }: { name: string; color: string; size?: number }) {
  return (
    <span
      className="rounded-[10px] text-white font-bold inline-flex items-center justify-center shrink-0"
      style={{ background: color, width: size, height: size, fontSize: Math.round(size * 0.42) }}
      aria-hidden="true"
    >
      {name.slice(0, 1)}
    </span>
  );
}

/** ⚡ 闪电（使用量） */
export function BoltIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
      <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
    </svg>
  );
}

/** ⬇ 下载箭头（推荐页是安装量，SkillHub 是下载量） */
export function DownloadIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3v12m0 0-4-4m4 4 4-4M4 17v3h16v-3" />
    </svg>
  );
}

/** ☆ 收藏 */
export function StarIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9L12 3Z" />
    </svg>
  );
}

/** 假二维码（明确标「模拟」，扫了也没用） */
export function FakeQr({ size = 132 }: { size?: number }) {
  // 用固定伪随机图案画格子，保证每次渲染一样
  const cells: Array<[number, number]> = [];
  for (let y = 0; y < 21; y += 1) {
    for (let x = 0; x < 21; x += 1) {
      const inFinder = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
      if (inFinder) continue;
      if (((x * 7 + y * 13 + x * y) % 5) < 2) cells.push([x, y]);
    }
  }
  const finder = (ox: number, oy: number) => (
    <g key={`${ox}-${oy}`}>
      <rect x={ox} y={oy} width="7" height="7" fill="#111318" />
      <rect x={ox + 1} y={oy + 1} width="5" height="5" fill="#fff" />
      <rect x={ox + 2} y={oy + 2} width="3" height="3" fill="#111318" />
    </g>
  );
  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="-1 -1 23 23" aria-label="模拟二维码">
        <rect x="-1" y="-1" width="23" height="23" fill="#fff" />
        {cells.map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#111318" />
        ))}
        {finder(0, 0)}
        {finder(14, 0)}
        {finder(0, 14)}
      </svg>
      <span className="absolute inset-0 m-auto w-fit h-fit px-1.5 py-0.5 rounded bg-white/95 border border-[#e2e2de] text-[10.5px] font-semibold text-[#c2410c]">
        模拟 · 不可扫
      </span>
    </div>
  );
}
