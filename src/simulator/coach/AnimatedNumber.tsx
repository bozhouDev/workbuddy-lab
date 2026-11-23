import { useEffect, useRef, useState } from 'react';

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  duration?: number;
  className?: string;
  /** 数值下降时短暂高亮提醒色（用于积分消耗） */
  highlightDrop?: boolean;
}

/**
 * #39 数字滚动 (Animated counter)
 * 用于模拟积分余额等连续数值：平滑插值滚动，并在扣减时短暂以语义橙提示
 * - 滚动途中数值又变了：从当前显示的数接着滚，不会跳回上一个目标值
 * - 橙色高亮每次变化都重新计时；数值回升时立刻取消，不会卡住
 */
export function AnimatedNumber({
  value,
  decimals = 2,
  duration = 520,
  className = '',
  highlightDrop = false,
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(value);
  const [dropping, setDropping] = useState(false);
  // 当前屏幕上显示的数（滚动中途也实时更新），作为下一次滚动的起点
  const shownRef = useRef(value);

  useEffect(() => {
    const from = shownRef.current;
    const to = value;
    // 数没变（首次挂载或只是参数变了）：上一轮的退色定时器已被清掉，这里直接取消高亮，避免卡住
    if (from === to) {
      setDropping(false);
      return;
    }

    // 只在下降时亮橙色；回升时马上取消之前的高亮
    const isDrop = to < from;
    setDropping(highlightDrop && isDrop);

    /** 更新显示值，同时记下来给下一次滚动当起点 */
    const show = (n: number) => {
      shownRef.current = n;
      setDisplay(n);
    };

    const reduced =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const animate = !reduced && duration > 0;

    let raf = 0;
    if (animate) {
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        // 缓出（ease-out cubic）：开头快、结尾慢
        const eased = 1 - (1 - t) ** 3;
        show(t < 1 ? from + (to - from) * eased : to);
        if (t < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    } else {
      show(to);
    }

    // 高亮在滚动结束后再停留一会儿就退掉
    const clearDropTimer =
      highlightDrop && isDrop
        ? window.setTimeout(() => setDropping(false), (animate ? duration : 0) + 450)
        : 0;

    return () => {
      cancelAnimationFrame(raf);
      if (clearDropTimer) window.clearTimeout(clearDropTimer);
    };
  }, [value, duration, highlightDrop]);

  return (
    <span
      className={`tabular-nums transition-colors duration-300 ${
        dropping ? 'text-[#c2410c] font-semibold' : ''
      } ${className}`}
    >
      {display.toFixed(decimals)}
    </span>
  );
}
