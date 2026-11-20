import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { getStepIndex, getStepLabel } from '../engine/reducer';
import type { BeatData, RouteMeta } from '../engine/types';
import type { TargetRect } from './SpotlightOverlay';

interface NarrationCardProps {
  beat: BeatData;
  illustrative: boolean;
  guideUrl: string;
  nextRoute: RouteMeta | null;
  targetRect: TargetRect | null;
  canBack: boolean;
  canSkip: boolean;
  shakeNonce: number;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  onChoice: (index: number) => void;
  onRestart: () => void;
  onSelectRoute: (routeId: string) => void;
}

const CARD_WIDTH = 368;
const MARGIN = 18;
const TOUR_BAR_H = 56;

export function NarrationCard({
  beat,
  illustrative,
  guideUrl,
  nextRoute,
  targetRect,
  canBack,
  canSkip,
  shakeNonce,
  onNext,
  onBack,
  onSkip,
  onChoice,
  onRestart,
  onSelectRoute,
}: NarrationCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [shaking, setShaking] = useState(false);

  const stepNum = getStepIndex(beat.step) + 1;
  const stepLabel = getStepLabel(beat.step);
  const tone = beat.tone ?? 'neutral';
  const hasChoices = Boolean(beat.choices && beat.choices.length > 0);
  const isWaitingClick = !hasChoices && typeof beat.await === 'object' && 'click' in beat.await;
  const isRemember = beat.step === 'remember';

  // 触发轻抖动画提示用户该点哪里
  useEffect(() => {
    if (shakeNonce === 0) return;
    setShaking(true);
    const t = window.setTimeout(() => setShaking(false), 340);
    return () => window.clearTimeout(t);
  }, [shakeNonce]);

  // 自动计算旁白卡避让位置：优先右 → 左 → 下 → 上 → 右下角
  useLayoutEffect(() => {
    if (isRemember) {
      setPos(null);
      return;
    }

    const computePos = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const cardW = cardRef.current?.offsetWidth || CARD_WIDTH;
      const cardH = cardRef.current?.offsetHeight || 220;

      if (!targetRect) {
        setPos({
          left: Math.max(16, vw - cardW - 24),
          top: Math.max(TOUR_BAR_H + 16, vh - cardH - 24),
        });
        return;
      }

      const clampY = (y: number) =>
        Math.min(Math.max(TOUR_BAR_H + 16, y), Math.max(TOUR_BAR_H + 16, vh - cardH - 16));
      const clampX = (x: number) =>
        Math.min(Math.max(16, x), Math.max(16, vw - cardW - 16));

      // 1. 优先右侧
      if (targetRect.right + MARGIN + cardW <= vw - 16) {
        setPos({
          left: targetRect.right + MARGIN,
          top: clampY(targetRect.top),
        });
        return;
      }
      // 2. 其次左侧
      if (targetRect.left - MARGIN - cardW >= 16) {
        setPos({
          left: targetRect.left - MARGIN - cardW,
          top: clampY(targetRect.top),
        });
        return;
      }
      // 3. 其次下方
      if (targetRect.bottom + MARGIN + cardH <= vh - 16) {
        setPos({
          left: clampX(targetRect.left),
          top: targetRect.bottom + MARGIN,
        });
        return;
      }
      // 4. 其次上方
      if (targetRect.top - MARGIN - cardH >= TOUR_BAR_H + 16) {
        setPos({
          left: clampX(targetRect.left),
          top: targetRect.top - MARGIN - cardH,
        });
        return;
      }
      // 5. 兜底右下角
      setPos({
        left: Math.max(16, vw - cardW - 24),
        top: Math.max(TOUR_BAR_H + 16, vh - cardH - 24),
      });
    };

    computePos();
    window.addEventListener('resize', computePos);
    return () => window.removeEventListener('resize', computePos);
  }, [targetRect, beat.id, isRemember]);

  const accentColor =
    tone === 'wrong' ? '#C2410C' : tone === 'right' ? '#3355E0' : '#4A4F57';

  // 第 6 步「一句话记住」居中总结卡片
  if (isRemember) {
    return (
      <div
        className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-center bg-[rgba(250,250,249,0.92)] backdrop-blur-[2px] p-6"
        style={{ top: TOUR_BAR_H }}
        role="region"
        aria-live="polite"
      >
        <div className="w-full max-w-[620px] rounded-[20px] bg-white border border-gray-200 p-10 shadow-[0_24px_60px_rgba(0,0,0,0.12)] flex flex-col gap-5">
          <div className="font-mono text-[12px] text-accent-600 tracking-[0.04em]">
            第 {stepNum} 步 / 共 6 步 · {stepLabel}
          </div>
          <div className="text-[24px] leading-[1.55] font-bold tracking-[-0.015em] text-gray-900">
            {beat.say}
          </div>
          <div className="flex items-center flex-wrap gap-3 pt-2">
            {nextRoute && (
              <button
                type="button"
                onClick={() => onSelectRoute(nextRoute.id)}
                className="h-10 px-4 rounded-[9px] border-0 bg-gray-900 text-white text-[14px] font-semibold cursor-pointer hover:bg-[#2a2d35]"
              >
                下一条路线：{nextRoute.title} →
              </button>
            )}
            <a
              href={guideUrl}
              className="h-10 px-4 rounded-[9px] border border-gray-300 bg-white text-gray-900 text-[14px] font-medium inline-flex items-center no-underline hover:bg-gray-50"
            >
              看这篇图文
            </a>
            <button
              type="button"
              onClick={onRestart}
              className="h-10 px-3 rounded-[9px] border-0 bg-transparent text-gray-500 text-[14px] cursor-pointer hover:text-gray-900"
            >
              再走一遍
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={cardRef}
      role="region"
      aria-live="polite"
      aria-label="导览旁白"
      className={`fixed z-30 rounded-[16px] bg-white p-5 shadow-[0_24px_60px_rgba(0,0,0,0.28)] border border-black/5 flex flex-col gap-3 transition-[top,left] duration-150 ${
        shaking ? 'sim-shake' : ''
      }`}
      style={{
        width: CARD_WIDTH,
        borderTop: `4px solid ${accentColor}`,
        top: pos?.top ?? TOUR_BAR_H + 24,
        left: pos?.left ?? 24,
        visibility: pos ? 'visible' : 'hidden',
      }}
    >
      {/* 步骤编号 */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11.5px] font-medium" style={{ color: accentColor }}>
          第 {stepNum} 步 / 共 6 步 · {stepLabel}
        </span>
        {beat.step === 'mistake' && illustrative && (
          <span className="text-[11px] text-gray-500 bg-gray-100 rounded px-1.5 py-[1px]">
            教学示意
          </span>
        )}
      </div>

      {/* 旁白正文 */}
      <p className="m-0 text-[15px] leading-[1.68] text-gray-900">{beat.say}</p>

      {/* 分支选项按钮 */}
      {hasChoices && (
        <div className="flex flex-col gap-2 pt-0.5">
          {beat.choices!.map((c, idx) => (
            <button
              key={c.label}
              type="button"
              onClick={() => onChoice(idx)}
              className="w-full text-left px-3 py-2.5 rounded-[10px] border border-[#e2e2de] bg-white hover:border-accent-600 hover:bg-accent-50 cursor-pointer flex flex-col gap-0.5 transition-colors"
            >
              <strong className="text-[14px] font-semibold text-gray-900">{c.label}</strong>
              {c.hint && <span className="text-[12.5px] text-gray-500">{c.hint}</span>}
            </button>
          ))}
        </div>
      )}

      {/* 等待点击提示 */}
      {isWaitingClick && (
        <div className="text-[12.5px] font-medium text-accent-600 bg-accent-50 border border-accent-200 rounded-lg px-3 py-2">
          请直接点击左侧蓝框高亮的区域继续
        </div>
      )}

      {/* 底部控制栏 */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={!canBack}
            onClick={onBack}
            className="border-0 bg-transparent p-0 text-[13px] text-gray-500 enabled:hover:text-gray-900 enabled:cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← 上一步
          </button>
          {canSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="border-0 bg-transparent p-0 text-[13px] text-gray-500 hover:text-gray-900 cursor-pointer"
            >
              跳过
            </button>
          )}
        </div>

        {!hasChoices && !isWaitingClick && (
          <button
            type="button"
            onClick={onNext}
            className="h-9 px-4 rounded-[9px] border-0 bg-gray-900 text-white text-[13.5px] font-semibold cursor-pointer hover:bg-[#2a2d35]"
          >
            {tone === 'wrong' ? '看正确做法 →' : '下一步'}
          </button>
        )}
      </div>
    </div>
  );
}
