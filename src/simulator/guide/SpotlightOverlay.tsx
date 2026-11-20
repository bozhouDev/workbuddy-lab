import { useEffect, useState } from 'react';
import type { SimId } from '../registry';

export interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
}

interface SpotlightOverlayProps {
  spotlightId: SimId | null;
  tone: 'neutral' | 'right' | 'wrong';
  allowTargetClick: boolean;
  measureKey: string;
  onRectChange: (rect: TargetRect | null) => void;
  onBlockedClick: () => void;
}

const PAD = 6;
const TOUR_BAR_HEIGHT = 56;

export function SpotlightOverlay({
  spotlightId,
  tone,
  allowTargetClick,
  measureKey,
  onRectChange,
  onBlockedClick,
}: SpotlightOverlayProps) {
  const [rect, setRect] = useState<TargetRect | null>(null);

  useEffect(() => {
    if (!spotlightId) {
      setRect(null);
      onRectChange(null);
      return;
    }

    let rafId = 0;
    let observer: ResizeObserver | null = null;

    const measure = () => {
      const el = document.querySelector<HTMLElement>(`[data-sim-id="${spotlightId}"]`);
      if (!el) {
        setRect(null);
        onRectChange(null);
        return;
      }
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) {
        setRect(null);
        onRectChange(null);
        return;
      }
      const next: TargetRect = {
        top: Math.max(TOUR_BAR_HEIGHT, r.top - PAD),
        left: Math.max(0, r.left - PAD),
        width: r.width + PAD * 2,
        height: r.height + PAD * 2,
        right: r.right + PAD,
        bottom: r.bottom + PAD,
      };
      setRect(next);
      onRectChange(next);
    };

    // 等弹窗/场景布局稳定后再量测
    rafId = window.requestAnimationFrame(() => {
      measure();
      const targetEl = document.querySelector<HTMLElement>(`[data-sim-id="${spotlightId}"]`);
      if (typeof ResizeObserver !== 'undefined') {
        observer = new ResizeObserver(measure);
        observer.observe(document.documentElement);
        if (targetEl) observer.observe(targetEl);
      }
    });

    window.addEventListener('resize', measure);
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', measure);
      observer?.disconnect();
    };
  }, [spotlightId, measureKey, onRectChange]);

  // 无 spotlight：不变暗；但在 await: next 时放一层透明防误点层
  if (!spotlightId || !rect) {
    if (allowTargetClick) return null;
    return (
      <div
        className="fixed inset-x-0 bottom-0 z-20"
        style={{ top: TOUR_BAR_HEIGHT }}
        onClick={onBlockedClick}
        aria-hidden="true"
      />
    );
  }

  const ringColor = tone === 'wrong' ? '#C2410C' : '#3355E0';

  return (
    <>
      {/* 四块遮罩拼接，保证目标区域在 allowTargetClick=true 时可直接穿透点击 */}
      <div
        className="fixed left-0 right-0 z-20 transition-all duration-150"
        style={{
          top: TOUR_BAR_HEIGHT,
          height: Math.max(0, rect.top - TOUR_BAR_HEIGHT),
          background: 'var(--sim-dim)',
        }}
        onClick={onBlockedClick}
        aria-hidden="true"
      />
      <div
        className="fixed left-0 right-0 bottom-0 z-20 transition-all duration-150"
        style={{
          top: rect.bottom,
          background: 'var(--sim-dim)',
        }}
        onClick={onBlockedClick}
        aria-hidden="true"
      />
      <div
        className="fixed left-0 z-20 transition-all duration-150"
        style={{
          top: rect.top,
          width: Math.max(0, rect.left),
          height: rect.height,
          background: 'var(--sim-dim)',
        }}
        onClick={onBlockedClick}
        aria-hidden="true"
      />
      <div
        className="fixed right-0 z-20 transition-all duration-150"
        style={{
          top: rect.top,
          left: rect.right,
          height: rect.height,
          background: 'var(--sim-dim)',
        }}
        onClick={onBlockedClick}
        aria-hidden="true"
      />

      {/* 当本拍不是等待点击目标元素时，阻断目标区域误点击 */}
      {!allowTargetClick && (
        <div
          className="fixed z-20"
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          }}
          onClick={onBlockedClick}
          aria-hidden="true"
        />
      )}

      {/* 3px 聚光描边框 */}
      <div
        className="fixed z-25 rounded-[12px] pointer-events-none transition-all duration-150"
        style={{
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          boxShadow: `0 0 0 3px ${ringColor}`,
        }}
        aria-hidden="true"
      />
    </>
  );
}
