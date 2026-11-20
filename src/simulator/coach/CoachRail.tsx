import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { EXPLORE_AREAS } from './explain';
import {
  PHASE_LABELS,
  type AreaId,
  type FeedItem,
  type LessonStage,
  type PhaseIndex,
} from './types';

export type CoachMode = 'docked' | 'floating' | 'minimized';

interface CoachButton {
  label: string;
  primary?: boolean;
  onClick: () => void;
}

interface CoachRailProps {
  mode: CoachMode;
  onChangeMode: (mode: CoachMode) => void;
  phase: PhaseIndex;
  stage?: LessonStage;
  feed: FeedItem[];
  isTyping: boolean;
  exploredAreas?: Set<AreaId>;
  recommendedAreaId?: AreaId | null;
  waitPrompt: string | null;
  buttons: CoachButton[];
  onFocusArea?: (areaId: AreaId) => void;
  subtitle?: string;
}

const MIN_W = 310;
const MAX_W = 560;
const MIN_H = 340;
const TOP_SAFE = 60;
const EMPTY_SET = new Set<AreaId>();

export function CoachRail({
  mode,
  onChangeMode,
  phase,
  stage = 'explore',
  feed,
  isTyping,
  exploredAreas = EMPTY_SET,
  recommendedAreaId = null,
  waitPrompt,
  buttons,
  onFocusArea,
  subtitle = '左边真界面哪里都能点，点了就讲',
}: CoachRailProps) {
  const feedRef = useRef<HTMLDivElement>(null);

  // 悬浮小窗坐标与尺寸（支持拖拽移动 + 拖拽缩放 + 快捷放大/还原）
  const [floatBox, setFloatBox] = useState(() => {
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1440;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 900;
    const w = 392;
    const h = Math.min(620, Math.max(420, vh - 110));
    return { x: Math.max(20, vw - w - 24), y: 72, w, h };
  });
  const [expanded, setExpanded] = useState(false);

  // 最小化头像浮球坐标（同样可拖动）
  const [pillPos, setPillPos] = useState(() => {
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1440;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 900;
    return { x: Math.max(20, vw - 220), y: Math.max(72, vh - 82) };
  });

  const dragRef = useRef<{
    kind: 'move-float' | 'resize-float' | 'move-pill';
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    origW: number;
    origH: number;
    moved: boolean;
  } | null>(null);

  useEffect(() => {
    const el = feedRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [feed.length, isTyping, exploredAreas.size, mode]);

  // 窗口变化时确保悬浮窗和浮球不跑出视野
  useEffect(() => {
    const clampToViewport = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      setFloatBox((b) => {
        const w = Math.min(b.w, vw - 32);
        const h = Math.min(b.h, vh - TOP_SAFE - 20);
        return {
          w,
          h,
          x: Math.min(Math.max(12, b.x), Math.max(12, vw - w - 12)),
          y: Math.min(Math.max(TOP_SAFE, b.y), Math.max(TOP_SAFE, vh - h - 12)),
        };
      });
      setPillPos((p) => ({
        x: Math.min(Math.max(12, p.x), Math.max(12, vw - 200)),
        y: Math.min(Math.max(TOP_SAFE, p.y), Math.max(TOP_SAFE, vh - 68)),
      }));
    };
    window.addEventListener('resize', clampToViewport);
    return () => window.removeEventListener('resize', clampToViewport);
  }, []);

  const beginDrag = (
    e: ReactPointerEvent,
    kind: 'move-float' | 'resize-float' | 'move-pill'
  ) => {
    if ((e.target as HTMLElement).closest('button')) return;
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      kind,
      startX: e.clientX,
      startY: e.clientY,
      origX: kind === 'move-pill' ? pillPos.x : floatBox.x,
      origY: kind === 'move-pill' ? pillPos.y : floatBox.y,
      origW: floatBox.w,
      origH: floatBox.h,
      moved: false,
    };
  };

  const onDragMove = (e: ReactPointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) d.moved = true;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (d.kind === 'move-float') {
      setFloatBox((b) => ({
        ...b,
        x: Math.min(Math.max(12, d.origX + dx), Math.max(12, vw - b.w - 12)),
        y: Math.min(Math.max(TOP_SAFE, d.origY + dy), Math.max(TOP_SAFE, vh - b.h - 12)),
      }));
    } else if (d.kind === 'resize-float') {
      const maxW = Math.min(MAX_W, vw - d.origX - 12);
      const maxH = Math.max(MIN_H, vh - d.origY - 12);
      setFloatBox((b) => ({
        ...b,
        w: Math.min(Math.max(MIN_W, d.origW + dx), maxW),
        h: Math.min(Math.max(MIN_H, d.origH + dy), maxH),
      }));
      setExpanded(false);
    } else if (d.kind === 'move-pill') {
      setPillPos({
        x: Math.min(Math.max(12, d.origX + dx), Math.max(12, vw - 196)),
        y: Math.min(Math.max(TOP_SAFE, d.origY + dy), Math.max(TOP_SAFE, vh - 64)),
      });
    }
  };

  const endDrag = (e: ReactPointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // 忽略释放异常
    }
    const wasPillTap = d.kind === 'move-pill' && !d.moved;
    dragRef.current = null;
    if (wasPillTap) onChangeMode('floating');
  };

  const toggleExpand = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (!expanded) {
      const w = Math.min(480, vw - 40);
      const h = Math.min(720, vh - TOP_SAFE - 24);
      setFloatBox((b) => ({
        w,
        h,
        x: Math.min(Math.max(16, b.x), Math.max(16, vw - w - 16)),
        y: Math.min(Math.max(TOP_SAFE, b.y), Math.max(TOP_SAFE, vh - h - 16)),
      }));
      setExpanded(true);
    } else {
      const w = 368;
      const h = Math.min(540, vh - TOP_SAFE - 40);
      setFloatBox((b) => ({
        ...b,
        w,
        h,
        x: Math.min(Math.max(16, b.x), Math.max(16, vw - w - 16)),
        y: Math.min(Math.max(TOP_SAFE, b.y), Math.max(TOP_SAFE, vh - h - 16)),
      }));
      setExpanded(false);
    }
  };

  const exploredCount = exploredAreas.size;

  // ===== 形态 3：最小化为可拖动泊舟头像浮球 =====
  if (mode === 'minimized') {
    return (
      <div
        role="region"
        aria-label="泊舟陪练悬浮球"
        onPointerDown={(e) => beginDrag(e, 'move-pill')}
        onPointerMove={onDragMove}
        onPointerUp={endDrag}
        style={{ left: pillPos.x, top: pillPos.y }}
        className="sim-pop-up fixed z-50 flex items-center gap-2.5 pl-2 pr-3.5 py-2 rounded-full bg-white border border-gray-200 shadow-[0_14px_36px_rgba(17,19,24,0.2)] cursor-grab active:cursor-grabbing select-none"
      >
        <div className="relative shrink-0">
          <img
            src="/avatar-bozhou.jpg"
            alt="泊舟头像"
            width={34}
            height={34}
            draggable={false}
            className="w-8.5 h-8.5 rounded-full object-cover border border-black/10 block"
          />
          <span className="sim-dot-ping absolute -right-0.5 -top-0.5 w-2.5 h-2.5 rounded-full bg-accent-500" />
          <span className="absolute -right-0.5 -top-0.5 w-2.5 h-2.5 rounded-full bg-accent-600 ring-2 ring-white" />
        </div>
        <div className="min-w-0">
          <div className="text-[12.5px] font-bold text-gray-900 leading-tight">泊舟陪练</div>
          <div className="text-[11px] text-gray-500 truncate max-w-[116px]">
            {PHASE_LABELS[phase]} · 点开继续
          </div>
        </div>
      </div>
    );
  }

  const isFloating = mode === 'floating';

  return (
    <aside
      aria-label="泊舟陪练栏"
      style={
        isFloating
          ? {
              left: floatBox.x,
              top: floatBox.y,
              width: floatBox.w,
              height: floatBox.h,
            }
          : undefined
      }
      className={
        isFloating
          ? 'sim-pop-up fixed z-50 flex flex-col rounded-[16px] border border-gray-200 bg-white/98 backdrop-blur-md overflow-hidden shadow-[0_24px_64px_-12px_rgba(17,19,24,0.28)]'
          : 'w-[348px] xl:w-[392px] shrink-0 h-full flex flex-col rounded-[16px] border border-gray-200 bg-white overflow-hidden shadow-[0_12px_36px_-18px_rgba(17,19,24,0.12)]'
      }
    >
      {/* 头部：悬浮模式下按住此栏可自由拖动到左/中/右任意位置 */}
      <div
        onPointerDown={isFloating ? (e) => beginDrag(e, 'move-float') : undefined}
        onPointerMove={isFloating ? onDragMove : undefined}
        onPointerUp={isFloating ? endDrag : undefined}
        className={`px-4 pt-3 pb-2.5 border-b border-[#eeeeeb] shrink-0 ${
          isFloating ? 'cursor-grab active:cursor-grabbing bg-[#fafaf9] select-none' : ''
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <img
                src="/avatar-bozhou.jpg"
                alt="泊舟头像"
                width={38}
                height={38}
                draggable={false}
                className="w-9.5 h-9.5 rounded-full object-cover border border-black/10 block"
              />
              <span
                className="absolute right-0 bottom-0 w-2.5 h-2.5 rounded-full bg-[#10b981] ring-2 ring-white"
                aria-hidden="true"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[14.5px] text-gray-900">泊舟</span>
                <span className="text-[10.5px] font-medium text-accent-600 bg-accent-50 border border-accent-200 rounded-full px-1.5 py-[1px]">
                  {isFloating ? '可拖动小窗' : '陪练教练'}
                </span>
              </div>
              <div className="text-[11.5px] text-gray-500 truncate mt-0.5">
                {isFloating ? '按住顶栏拖到左/中/右，拖右下角缩放' : subtitle}
              </div>
            </div>
          </div>

          {/* 窗口形态控制按钮：悬浮/停靠、放大/缩小、收起 */}
          <div className="flex items-center gap-1 shrink-0">
            {isFloating && (
              <button
                type="button"
                onClick={toggleExpand}
                title={expanded ? '还原小窗尺寸' : '放大小窗'}
                aria-label={expanded ? '还原小窗尺寸' : '放大小窗'}
                className="w-7 h-7 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 text-gray-600 inline-flex items-center justify-center text-[12px] cursor-pointer"
              >
                {expanded ? '⤡' : '⤢'}
              </button>
            )}
            <button
              type="button"
              onClick={() => onChangeMode(isFloating ? 'docked' : 'floating')}
              title={isFloating ? '停靠到右侧分栏' : '切换为可拖动悬浮小窗'}
              aria-label={isFloating ? '停靠到右侧分栏' : '切换为可拖动悬浮小窗'}
              className="h-7 px-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 text-gray-700 inline-flex items-center gap-1 text-[11px] font-medium cursor-pointer"
            >
              <span>{isFloating ? '停靠' : '小窗'}</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeMode('minimized')}
              title="收起为悬浮头像"
              aria-label="收起为悬浮头像"
              className="w-7 h-7 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 text-gray-600 inline-flex items-center justify-center text-[13px] cursor-pointer"
            >
              —
            </button>
          </div>
        </div>

        {/* 4 段循环进度条 */}
        <div className="grid grid-cols-4 gap-1 mt-2.5" role="list" aria-label="4 段陪练进度">
          {PHASE_LABELS.map((label, idx) => {
            const isOn = idx === phase;
            const isDone = idx < phase;
            return (
              <span
                key={label}
                role="listitem"
                aria-current={isOn ? 'step' : undefined}
                className={`text-center text-[11.5px] py-1 rounded-[7px] transition-colors ${
                  isOn
                    ? 'bg-gray-900 text-white font-semibold'
                    : isDone
                      ? 'bg-gray-100 text-gray-800 font-medium'
                      : 'bg-gray-100 text-gray-500'
                }`}
              >
                {label}
              </span>
            );
          })}
        </div>
      </div>

      {/* 消息流（历史记录可往回翻） */}
      <div
        ref={feedRef}
        aria-live="polite"
        className="flex-1 overflow-y-auto px-4 py-3.5 flex flex-col gap-2.5 [&>*]:shrink-0"
      >
        {feed.map((item) => {
          if (item.kind === 'coach') {
            return (
              <div
                key={item.id}
                className="sim-msg-rise self-start max-w-[94%] flex items-start gap-2"
              >
                <img
                  src="/avatar-bozhou.jpg"
                  alt=""
                  aria-hidden="true"
                  width={24}
                  height={24}
                  className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5 border border-black/5"
                />
                <div
                  className="rounded-[4px_14px_14px_14px] bg-gray-100 px-3 py-2 text-[13.5px] leading-[1.7] text-gray-900"
                  dangerouslySetInnerHTML={{ __html: item.html }}
                />
              </div>
            );
          }

          if (item.kind === 'aside') {
            return (
              <div
                key={item.id}
                className="sim-msg-rise self-start max-w-[94%] ml-8 rounded-[12px] border border-dashed border-gray-300 bg-white px-3 py-2 text-[12.5px] leading-[1.68] text-gray-600"
              >
                <span className="block font-mono text-[10.5px] text-gray-500 mb-0.5">
                  你点的是 · {item.label}
                </span>
                <span dangerouslySetInnerHTML={{ __html: item.html }} />
              </div>
            );
          }

          if (item.kind === 'mine') {
            return (
              <div
                key={item.id}
                className="sim-msg-rise self-end max-w-[85%] rounded-[14px_4px_14px_14px] bg-gray-900 text-white px-3 py-1.5 text-[13.5px]"
              >
                {item.text}
              </div>
            );
          }

          if (item.kind === 'did') {
            return (
              <div
                key={item.id}
                className="sim-msg-rise self-end text-[11.5px] text-gray-500 pr-1"
              >
                你点了「{item.text}」
              </div>
            );
          }

          if (item.kind === 'checklist') {
            return (
              <div
                key={item.id}
                className="sim-msg-rise self-stretch rounded-[12px] border border-gray-200 bg-white overflow-hidden"
              >
                <div className="px-3 py-2 bg-[#fbfbfa] border-b border-[#eeeeeb] flex items-center justify-between text-[12px]">
                  <span className="font-semibold text-gray-900">首页 7 块核心区</span>
                  <span className="font-mono text-accent-600 font-semibold">
                    已认 {exploredCount} / {EXPLORE_AREAS.length}
                  </span>
                </div>
                <div className="divide-y divide-[#f2f2ef]">
                  {EXPLORE_AREAS.map((area) => {
                    const done = exploredAreas.has(area.id);
                    const isNext = !done && recommendedAreaId === area.id && stage === 'explore';
                    return (
                      <button
                        key={area.id}
                        type="button"
                        onClick={() => onFocusArea?.(area.id)}
                        className={`w-full border-0 text-left px-3 py-2 flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                          isNext ? 'bg-accent-50/70' : 'bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className="min-w-0">
                          <div
                            className={`text-[13px] font-medium ${
                              done ? 'text-gray-500 line-through' : 'text-gray-900'
                            }`}
                          >
                            {area.title}
                          </div>
                          <div className="text-[11.5px] text-gray-500 truncate">
                            {area.shortHint}
                          </div>
                        </div>
                        {done ? (
                          <span
                            key={`done-${area.id}`}
                            className="sim-check-pop w-5 h-5 rounded-full bg-accent-600 text-white text-[11px] font-bold inline-flex items-center justify-center shrink-0"
                            aria-label="已探索"
                          >
                            ✓
                          </span>
                        ) : isNext ? (
                          <span className="text-[11px] font-semibold text-accent-600 bg-white border border-accent-200 rounded-full px-2 py-0.5 shrink-0">
                            去点左边
                          </span>
                        ) : (
                          <span className="w-4 h-4 rounded-full border border-gray-300 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          }

          if (item.kind === 'summary') {
            return (
              <div
                key={item.id}
                className="sim-msg-rise self-stretch rounded-[12px] border border-gray-200 bg-white overflow-hidden"
              >
                <div className="px-3 py-2 bg-[#fbfbfa] border-b border-[#eeeeeb] text-[12px] font-semibold text-gray-900">
                  5.11.3 主界面速查表
                </div>
                <table className="w-full border-collapse text-[12px]">
                  <tbody>
                    <tr className="border-b border-[#f0f0ed]">
                      <td className="px-3 py-2 font-semibold text-gray-900 whitespace-nowrap">左侧栏</td>
                      <td className="px-3 py-2 text-gray-600">全局入口、最近历史记录、项目分组；头像进设置</td>
                    </tr>
                    <tr className="border-b border-[#f0f0ed]">
                      <td className="px-3 py-2 font-semibold text-gray-900 whitespace-nowrap">输入框</td>
                      <td className="px-3 py-2 text-gray-600">+ 切模式/加文件、@ 引文件、/ 调技能</td>
                    </tr>
                    <tr className="border-b border-[#f0f0ed]">
                      <td className="px-3 py-2 font-semibold text-gray-900 whitespace-nowrap">框下方</td>
                      <td className="px-3 py-2 text-gray-600">动手前先选分组；新手保持「默认权限」</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-semibold text-gray-900 whitespace-nowrap">右侧区</td>
                      <td className="px-3 py-2 text-gray-600">跑起任务后自动滑出，直接预览核对成品</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            );
          }

          if (item.kind === 'card') {
            const c = item.card;
            if (c.kind === 'doc') {
              return (
                <div
                  key={item.id}
                  className="sim-msg-rise self-stretch rounded-[12px] border border-gray-200 bg-white overflow-hidden"
                >
                  <div className="px-3 py-2 bg-[#fbfbfa] border-b border-[#eeeeeb] flex items-center justify-between gap-2 text-[12px]">
                    <span className="font-semibold text-gray-900 truncate">{c.title}</span>
                    <span
                      className={`text-[10.5px] font-semibold px-1.5 py-[1px] rounded shrink-0 ${
                        c.badgeTone === 'warn'
                          ? 'bg-[#fff1e8] text-[#9a3412]'
                          : c.badgeTone === 'ok'
                            ? 'bg-accent-50 text-accent-600'
                            : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {c.badge}
                    </span>
                  </div>
                  <pre className="m-0 px-3 py-2.5 text-[12px] leading-[1.7] font-mono text-gray-800 whitespace-pre-wrap bg-white">
                    {c.lines.join('\n')}
                  </pre>
                </div>
              );
            }

            if (c.kind === 'compare') {
              return (
                <div
                  key={item.id}
                  className="sim-msg-rise self-stretch rounded-[12px] border border-gray-200 bg-white overflow-hidden"
                >
                  <div className="px-3 py-2 bg-[#fbfbfa] border-b border-[#eeeeeb] text-[12px] font-semibold text-gray-900">
                    {c.title}
                  </div>
                  <div className="grid grid-cols-1 gap-2 p-2.5">
                    <div
                      className={`rounded-[10px] border p-2.5 text-[12px] leading-[1.65] ${
                        c.leftTone === 'warn'
                          ? 'bg-[#fff6ef] border-[#f6d7c2] text-[#7c2d12]'
                          : 'bg-gray-50 border-gray-200 text-gray-700'
                      }`}
                    >
                      <div className="font-semibold mb-1">{c.leftLabel}</div>
                      <div dangerouslySetInnerHTML={{ __html: c.leftHtml }} />
                    </div>
                    <div
                      className={`rounded-[10px] border p-2.5 text-[12px] leading-[1.65] ${
                        c.rightTone === 'ok'
                          ? 'bg-[#f3f5fe] border-[#c9d3f7] text-[#1e3a8a]'
                          : 'bg-gray-50 border-gray-200 text-gray-700'
                      }`}
                    >
                      <div className="font-semibold mb-1">{c.rightLabel}</div>
                      <div dangerouslySetInnerHTML={{ __html: c.rightHtml }} />
                    </div>
                  </div>
                </div>
              );
            }

            if (c.kind === 'credits') {
              return (
                <div
                  key={item.id}
                  className="sim-msg-rise self-stretch rounded-[12px] border border-gray-200 bg-white overflow-hidden"
                >
                  <div className="px-3 py-2 bg-[#fbfbfa] border-b border-[#eeeeeb] text-[12px] font-semibold text-gray-900">
                    {c.title}
                  </div>
                  <div className="divide-y divide-[#f0f0ed] text-[12px]">
                    {c.rows.map((r) => (
                      <div
                        key={r.model}
                        className={`px-3 py-2 flex flex-col gap-0.5 ${
                          r.highlight === 'warn'
                            ? 'bg-[#fff6ef]'
                            : r.highlight === 'ok'
                              ? 'bg-[#ecfdf5]'
                              : 'bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-gray-900">
                            {r.model}{' '}
                            <span className="font-mono font-normal text-gray-500">{r.rate}</span>
                          </span>
                          <span
                            className={`font-mono font-semibold ${
                              r.highlight === 'warn'
                                ? 'text-[#c2410c]'
                                : r.highlight === 'ok'
                                  ? 'text-[#047857]'
                                  : 'text-gray-700'
                            }`}
                          >
                            {r.cost}
                          </span>
                        </div>
                        <div className="text-[11.5px] text-gray-600">{r.note}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            if (c.kind === 'table') {
              return (
                <div
                  key={item.id}
                  className="sim-msg-rise self-stretch rounded-[12px] border border-gray-200 bg-white overflow-hidden"
                >
                  <div className="px-3 py-2 bg-[#fbfbfa] border-b border-[#eeeeeb] text-[12px] font-semibold text-gray-900">
                    {c.title}
                  </div>
                  <table className="w-full border-collapse text-[11.5px]">
                    <thead>
                      <tr className="border-b border-[#eeeeeb] bg-[#fafaf9] text-left text-gray-500">
                        {c.headers.map((h) => (
                          <th key={h} className="px-2.5 py-1.5 font-medium whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {c.rows.map((row, rIdx) => (
                        <tr
                          key={rIdx}
                          className={rIdx < c.rows.length - 1 ? 'border-b border-[#f0f0ed]' : ''}
                        >
                          {row.map((cell, cIdx) => (
                            <td
                              key={cIdx}
                              className={`px-2.5 py-1.5 align-top ${
                                cIdx === 0
                                  ? 'font-semibold text-gray-900 whitespace-nowrap'
                                  : 'text-gray-600'
                              }`}
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            }
          }

          return null;
        })}

        {/* 泊舟正在输入动效 */}
        {isTyping && (
          <div className="sim-msg-rise self-start flex items-center gap-2">
            <img
              src="/avatar-bozhou.jpg"
              alt=""
              aria-hidden="true"
              width={24}
              height={24}
              className="w-6 h-6 rounded-full object-cover shrink-0 border border-black/5"
            />
            <div className="rounded-[4px_14px_14px_14px] bg-gray-100 px-3 py-2.5 inline-flex items-center gap-1">
              <span className="sim-typing-dot w-1.5 h-1.5 rounded-full bg-gray-500" style={{ animationDelay: '0ms' }} />
              <span className="sim-typing-dot w-1.5 h-1.5 rounded-full bg-gray-500" style={{ animationDelay: '150ms' }} />
              <span className="sim-typing-dot w-1.5 h-1.5 rounded-full bg-gray-500" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* 底部操作区 + 悬浮模式右下角缩放手柄 */}
      <div className="relative px-4 py-3 border-t border-[#eeeeeb] bg-[#fbfbfa] shrink-0 min-h-[60px] flex flex-wrap items-center gap-2">
        {waitPrompt && (
          <div className="w-full flex items-center gap-2 text-[12.5px] text-gray-600">
            <span className="relative inline-flex h-2 w-2 shrink-0">
              <span className="sim-dot-ping absolute inline-flex h-full w-full rounded-full bg-accent-500" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-600" />
            </span>
            <span>{waitPrompt}</span>
          </div>
        )}

        {buttons.map((b) => (
          <button
            key={b.label}
            type="button"
            onClick={b.onClick}
            className={`h-9 px-3.5 rounded-[10px] text-[13px] font-semibold cursor-pointer transition-all active:scale-[0.97] ${
              b.primary
                ? 'border-0 bg-gray-900 text-white hover:bg-[#2a2d35]'
                : 'border border-gray-300 bg-white text-gray-900 hover:bg-gray-100'
            }`}
          >
            {b.label}
          </button>
        ))}

        {/* 悬浮小窗右下角自由拉伸缩放手柄 */}
        {isFloating && (
          <div
            role="separator"
            aria-label="拖拽调整小窗大小"
            title="拖拽放大或缩小"
            onPointerDown={(e) => beginDrag(e, 'resize-float')}
            onPointerMove={onDragMove}
            onPointerUp={endDrag}
            className="absolute right-0.5 bottom-0.5 w-5 h-5 cursor-nwse-resize flex items-end justify-end p-1 text-gray-400 hover:text-gray-700"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <path d="M9 1 1 9M9 5 5 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </div>
        )}
      </div>
    </aside>
  );
}
