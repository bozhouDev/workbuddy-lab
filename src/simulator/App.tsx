import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CoachMode } from './coach/CoachRail';
import { LESSON_CATALOG, type LessonId } from './coach/guidedTypes';
import { getExitTarget } from './engine/storage';
import { ChevronDownIcon, LogoMark } from './shell/icons';

const InterfaceLesson = lazy(() => import('./coach/InterfaceLesson'));
const GuidedLessonPlayer = lazy(() => import('./coach/GuidedLessonPlayer'));

const MIN_DESKTOP_WIDTH = 1024;
const VALID_LESSON_IDS = new Set<string>(LESSON_CATALOG.map((l) => l.id));

/**
 * 合并课程前的旧课程 ID → 现在所在的课（2026-11-23 从 23 节合并成 12 节）
 * 旧链接、收藏夹、外部文章里的 ?route=旧ID 仍能打开对应的课。
 */
const LEGACY_LESSON_IDS: Record<string, LessonId> = {
  settings: 'setup',
  'models-credits': 'setup',
  groups: 'know-you',
  memory: 'know-you',
  personalization: 'know-you',
  library: 'attach',
  mode: 'send',
  permission: 'send',
  'task-brief': 'send',
  execution: 'send',
  revise: 'review',
  'make-skill': 'skills',
  anatomy: 'skills',
  'custom-connector': 'connectors',
};

/** 从地址栏 ?route= 读出要打开的课，认不出的回到「认识界面」 */
function readInitialLesson(): LessonId {
  if (typeof window === 'undefined') return 'interface';
  const param = new URLSearchParams(window.location.search).get('route');
  if (param && VALID_LESSON_IDS.has(param)) {
    return param as LessonId;
  }
  if (param && LEGACY_LESSON_IDS[param]) return LEGACY_LESSON_IDS[param];
  return 'interface';
}

/**
 * 地址栏是旧课程 ID 时，返回它（作为合并课里要直达的那一段），并把地址换成新 ID，
 * 这样刷新页面会接着已保存的进度，不会每次都跳回那一段开头。
 */
function consumeLegacyRoute(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const url = new URL(window.location.href);
    const param = url.searchParams.get('route');
    if (!param || VALID_LESSON_IDS.has(param) || !LEGACY_LESSON_IDS[param]) return undefined;
    url.searchParams.set('route', LEGACY_LESSON_IDS[param]);
    window.history.replaceState({}, '', url.toString());
    return param;
  } catch {
    return undefined;
  }
}

export default function App() {
  const [viewportW, setViewportW] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1440
  );
  const [lessonId, setLessonId] = useState<LessonId>(readInitialLesson);
  // 旧链接要直达的小段（只在第一次打开时用，见 consumeLegacyRoute）
  const [startFrom] = useState(consumeLegacyRoute);
  const [coachMode, setCoachMode] = useState<CoachMode>('docked');
  const [restartSignal, setRestartSignal] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onResize = () => setViewportW(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // 点击外部或 Esc 关闭课程切换菜单
  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const handleSelectLesson = useCallback((next: LessonId) => {
    setLessonId(next);
    setMenuOpen(false);
    try {
      const url = new URL(window.location.href);
      if (next === 'interface') {
        url.searchParams.delete('route');
      } else {
        url.searchParams.set('route', next);
      }
      window.history.replaceState({}, '', url.toString());
    } catch {
      // 忽略 history 异常
    }
  }, []);

  const currentMeta = useMemo(
    () => LESSON_CATALOG.find((l) => l.id === lessonId) ?? LESSON_CATALOG[0],
    [lessonId]
  );

  // 窄于 1024px：显示电脑端打开提示
  if (viewportW < MIN_DESKTOP_WIDTH) {
    const copyLink = async () => {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2400);
      } catch {
        setCopied(false);
      }
    };
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-[380px] w-full rounded-2xl bg-white border border-gray-200 p-7 flex flex-col items-center gap-4">
          <img
            src="/avatar-bozhou.jpg"
            alt="泊舟头像"
            width={56}
            height={56}
            className="w-14 h-14 rounded-full object-cover border border-black/10"
          />
          <h1 className="m-0 text-[20px] font-bold text-gray-900">泊舟陪练模拟器需要在电脑上打开</h1>
          <p className="m-0 text-[14.5px] leading-[1.7] text-gray-600">
            左边是完整的 WorkBuddy 5.11.3 桌面，右边是泊舟陪练栏，手机屏幕放不下。复制链接发到电脑浏览器即可体验。
          </p>
          <button
            type="button"
            onClick={copyLink}
            className="wbl-btn-spring w-full h-11 rounded-[10px] border-0 bg-gray-900 text-white text-[14.5px] font-semibold inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            {copied ? (
              <>
                <svg className="sim-check-pop" width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M5.2 8.2 7.1 10.1 10.9 6.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>已复制链接</span>
              </>
            ) : (
              '复制链接，发到电脑'
            )}
          </button>
          <a href="/" className="text-[13.5px] text-accent-600 font-medium no-underline hover:underline">
            ← 返回首页读图文教程
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-gray-50 text-gray-900">
      {/* 顶部导览条 */}
      <header className="h-[52px] shrink-0 px-5 bg-white border-b border-gray-200 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <a href="/" className="inline-flex items-center gap-2 text-gray-900 no-underline shrink-0">
            <LogoMark size={22} />
            <span className="text-[14px] font-bold tracking-[-0.01em]">
              WorkBuddy <span className="text-gray-500 font-medium">Lab</span>
            </span>
          </a>

          <span className="h-4 w-px bg-gray-200 shrink-0" aria-hidden="true" />

          {/* 课程切换菜单：按章分组列出全部陪练课 */}
          <div ref={menuRef} className="relative">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="切换模拟课程"
              onClick={() => setMenuOpen((o) => !o)}
              className="h-8 px-3 rounded-[9px] border border-gray-200 bg-gray-50 hover:bg-gray-100 text-[13px] font-semibold text-gray-900 inline-flex items-center gap-2 cursor-pointer transition-colors"
            >
              <span className="font-mono text-[11.5px] text-accent-600">{currentMeta.code}</span>
              {/* 合并后标题变长，窄屏（1024～1280）不换行，超出用省略号 */}
              <span className="whitespace-nowrap truncate max-w-[180px] xl:max-w-none">{currentMeta.title}</span>
              <span className="text-[11px] font-normal text-gray-500 hidden xl:inline whitespace-nowrap">
                （{LESSON_CATALOG.length} 节可练）
              </span>
              <ChevronDownIcon size={12} className="text-gray-500" />
            </button>

            {menuOpen && (
              <div
                role="menu"
                aria-label="模拟课程列表"
                className="sim-pop-up absolute left-0 top-[40px] z-50 w-[304px] max-h-[75vh] overflow-y-auto rounded-[14px] bg-white border border-gray-200 shadow-[0_18px_46px_rgba(17,19,24,0.16)] p-2 flex flex-col gap-0.5"
              >
                {/* 章节按课程目录自动分组，加课不用再改这里 */}
                {[...new Set(LESSON_CATALOG.map((l) => l.chapter))].map((chapter) => (
                  <div key={chapter} className="mb-1 last:mb-0">
                    <div className="px-2.5 pt-1.5 pb-1 text-[11px] font-medium text-gray-400">
                      {chapter}
                    </div>
                    {LESSON_CATALOG.filter((l) => l.chapter === chapter).map((item) => {
                      const active = item.id === lessonId;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          role="menuitem"
                          onClick={() => handleSelectLesson(item.id)}
                          className={`w-full border-0 rounded-[9px] px-2.5 py-2 flex items-center justify-between gap-2 text-left text-[13px] cursor-pointer transition-colors ${
                            active
                              ? 'bg-accent-50 text-accent-700 font-semibold'
                              : 'bg-transparent text-gray-800 hover:bg-gray-100'
                          }`}
                        >
                          <span className="flex items-center gap-2 min-w-0">
                            <span
                              className={`font-mono text-[11.5px] ${
                                active ? 'text-accent-600' : 'text-gray-400'
                              }`}
                            >
                              {item.code}
                            </span>
                            <span className="truncate">{item.title}</span>
                          </span>
                          {active && (
                            <span className="text-[11px] font-semibold text-accent-600 shrink-0">
                              当前
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}

              </div>
            )}
          </div>

          <a
            href={currentMeta.guideUrl}
            className="hidden xl:inline-flex items-center text-[12.5px] text-gray-500 hover:text-gray-900 no-underline"
          >
            对应图文 ↗
          </a>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setCoachMode((m) => (m === 'docked' ? 'floating' : 'docked'))}
            className="h-8 px-3 rounded-lg border border-gray-300 bg-white text-[12.5px] text-gray-800 hover:bg-gray-100 cursor-pointer"
          >
            {coachMode === 'docked' ? '教练切小窗' : '教练靠右侧'}
          </button>
          <span className="text-[12px] text-gray-500 border border-gray-200 rounded-full px-2.5 py-1">
            教学模拟器 · 非官方客户端
          </span>
          <button
            type="button"
            onClick={() => setRestartSignal((n) => n + 1)}
            className="h-8 px-3 rounded-lg border border-gray-300 bg-white text-[12.5px] text-gray-800 hover:bg-gray-100 cursor-pointer"
          >
            重来本课
          </button>
          <button
            type="button"
            onClick={() => {
              window.location.href = getExitTarget();
            }}
            className="h-8 px-3 rounded-lg border border-gray-300 bg-white text-[12.5px] text-gray-800 hover:bg-gray-100 cursor-pointer"
          >
            退出
          </button>
        </div>
      </header>

      {/* 主舞台：按课程按需懒加载 */}
      <main className="flex-1 min-h-0 flex gap-3.5 p-3.5 overflow-hidden">
        <Suspense
          fallback={
            <div className="flex-1 flex items-center justify-center rounded-[16px] border border-gray-200 bg-white text-[13.5px] text-gray-500">
              正在准备 WorkBuddy 5.11.3 模拟桌面…
            </div>
          }
        >
          {lessonId === 'interface' ? (
            <InterfaceLesson
              coachMode={coachMode}
              onChangeCoachMode={setCoachMode}
              restartSignal={restartSignal}
              onSelectLesson={handleSelectLesson}
            />
          ) : (
            <GuidedLessonPlayer
              lessonId={lessonId}
              startFrom={startFrom}
              coachMode={coachMode}
              onChangeCoachMode={setCoachMode}
              restartSignal={restartSignal}
              onSelectLesson={handleSelectLesson}
            />
          )}
        </Suspense>
      </main>
    </div>
  );
}
