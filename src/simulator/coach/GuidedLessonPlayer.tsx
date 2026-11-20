import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CoachRail, type CoachMode } from './CoachRail';
import type {
  ChatRunSpec,
  GuidedLessonDef,
  GuidedShellState,
  GuidedTargetId,
  LessonId,
} from './guidedTypes';
import { GuidedWorkBuddy } from './GuidedWorkBuddy';
import type { FeedItem, FeedItemInput } from './types';

const AUTO_COLLAPSE_WIDTH = 1360;

let msgSeq = 0;
const nextId = () => `gd-${++msgSeq}`;

async function loadLessonDef(id: Exclude<LessonId, 'interface'>): Promise<GuidedLessonDef> {
  switch (id) {
    case 'settings':
      return (await import('./lessons/settings')).settingsLesson;
    case 'groups':
      return (await import('./lessons/groups')).groupsLesson;
    case 'memory':
      return (await import('./lessons/memory')).memoryLesson;
    case 'personalization':
      return (await import('./lessons/personalization')).personalizationLesson;
    case 'models-credits':
      return (await import('./lessons/modelsCredits')).modelsCreditsLesson;
  }
}

/** 步进流式文本光标，避免在 {{wrong:...}} / {{ok:...}} 标签中间切断导致闪现原码 */
function advanceSafeCursor(text: string, current: number, step: number): number {
  let next = Math.min(text.length, current + step);
  const openIdx = text.lastIndexOf('{{', next);
  if (openIdx !== -1) {
    const closeIdx = text.indexOf('}}', openIdx);
    if (closeIdx !== -1 && next <= closeIdx + 2) {
      // 如果刚走进标记前缀 {{wrong: / {{ok:，跳过前缀直接显示内容；若即将到达结束，闭合它
      const colonIdx = text.indexOf(':', openIdx);
      if (colonIdx !== -1 && next <= colonIdx + 1) {
        next = Math.min(closeIdx + 2, colonIdx + 1 + step);
      }
      if (next > closeIdx - 1) {
        next = closeIdx + 2;
      } else {
        // 避免半闭合：流式过程中跳过未闭合整段，直接吐出完整高亮词组
        next = closeIdx + 2;
      }
    }
  }
  return Math.min(text.length, next);
}

interface GuidedLessonPlayerProps {
  lessonId: Exclude<LessonId, 'interface'>;
  coachMode: CoachMode;
  onChangeCoachMode: (mode: CoachMode) => void;
  restartSignal: number;
  onSelectLesson: (id: LessonId) => void;
}

export default function GuidedLessonPlayer({
  lessonId,
  coachMode,
  onChangeCoachMode,
  restartSignal,
  onSelectLesson,
}: GuidedLessonPlayerProps) {
  const [lesson, setLesson] = useState<GuidedLessonDef | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [shell, setShell] = useState<GuidedShellState | null>(null);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isRunningChat, setIsRunningChat] = useState(false);
  const [urgent, setUrgent] = useState(false);

  const timersRef = useRef<number[]>([]);
  const lastAsideRef = useRef<string | null>(null);
  const shellRef = useRef<GuidedShellState | null>(null);
  shellRef.current = shell;

  const clearAllTimers = useCallback(() => {
    for (const id of timersRef.current) window.clearTimeout(id);
    timersRef.current = [];
  }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  const saySequence = useCallback(
    (items: FeedItemInput[], onDone?: () => void) => {
      if (items.length === 0) {
        onDone?.();
        return;
      }
      setIsTyping(true);
      let elapsed = 0;
      items.forEach((item, idx) => {
        const delay = idx === 0 ? 200 : 320;
        elapsed += delay;
        schedule(() => {
          setFeed((prev) => [...prev, { ...item, id: nextId() } as FeedItem]);
          if (idx === items.length - 1) {
            setIsTyping(false);
            onDone?.();
          }
        }, elapsed);
      });
    },
    [schedule]
  );

  const enterStep = useCallback(
    (def: GuidedLessonDef, idx: number, baseShell: GuidedShellState) => {
      const step = def.steps[idx];
      if (!step) return;
      lastAsideRef.current = null;
      setStepIdx(idx);
      setUrgent(false);

      if (step.onEnter) {
        const patch = step.onEnter(baseShell);
        setShell((prev) => (prev ? { ...prev, ...patch } : prev));
      }

      const items: FeedItemInput[] = step.say.map((html) => ({
        kind: 'coach',
        html,
      }));
      if (step.card) {
        items.push({ kind: 'card', card: step.card });
      }
      if (step.after) {
        for (const html of step.after) {
          items.push({ kind: 'coach', html });
        }
      }
      saySequence(items);
    },
    [saySequence]
  );

  // 动态按需加载当前课脚本并初始化
  useEffect(() => {
    let cancelled = false;
    clearAllTimers();
    setLesson(null);
    setFeed([]);
    setIsTyping(false);
    setIsRunningChat(false);

    loadLessonDef(lessonId).then((def) => {
      if (cancelled) return;
      const collapsed =
        typeof window !== 'undefined' &&
        coachMode === 'docked' &&
        window.innerWidth < AUTO_COLLAPSE_WIDTH;
      const init = { ...def.initialState(), sidebarCollapsed: collapsed };
      setLesson(def);
      setShell(init);
      enterStep(def, 0, init);
    });

    return () => {
      cancelled = true;
      clearAllTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId, restartSignal]);

  // 停靠/小窗切换或窗口缩放时自动适配侧栏折叠
  useEffect(() => {
    const syncSidebar = () => {
      const w = window.innerWidth;
      setShell((prev) =>
        prev ? { ...prev, sidebarCollapsed: coachMode === 'docked' && w < AUTO_COLLAPSE_WIDTH } : prev
      );
    };
    syncSidebar();
    window.addEventListener('resize', syncSidebar);
    return () => window.removeEventListener('resize', syncSidebar);
  }, [coachMode]);

  const currentStep = lesson?.steps[stepIdx] ?? null;

  // 等待点击超过 6 秒温和加强蓝圈心跳
  useEffect(() => {
    setUrgent(false);
    if (!currentStep?.wait || isRunningChat) return;
    const t = window.setTimeout(() => setUrgent(true), 6000);
    return () => window.clearTimeout(t);
  }, [currentStep?.id, isRunningChat]);

  const runChatAnimation = useCallback(
    (def: GuidedLessonDef, nextIdx: number, runSpec: ChatRunSpec) => {
      setIsRunningChat(true);
      setShell((prev) =>
        prev
          ? {
              ...prev,
              view: 'chat',
              popover: null,
              composerText: '',
              activeChat: runSpec,
              chatPhase: 'steps',
              chatStepIndex: 0,
              streamedCharCount: 0,
              showArtifacts: false,
            }
          : prev
      );

      // 步进执行每个工具步骤
      const totalSteps = Math.max(1, runSpec.steps.length);
      for (let i = 1; i < totalSteps; i += 1) {
        schedule(() => {
          setShell((prev) => (prev ? { ...prev, chatStepIndex: i } : prev));
        }, i * 380);
      }

      // 工具完成 → 开始流式输出回复正文
      const streamStart = totalSteps * 380 + 220;
      schedule(() => {
        setShell((prev) => (prev ? { ...prev, chatPhase: 'streaming' } : prev));

        let cursor = 0;
        const text = runSpec.replyHtml;
        const tick = () => {
          cursor = advanceSafeCursor(text, cursor, 6);
          setShell((prev) => (prev ? { ...prev, streamedCharCount: cursor } : prev));
          if (cursor < text.length) {
            schedule(tick, 28);
          } else {
            // 吐字完成 → 结算积分、展示文件卡片 & 滑出右侧产物区 → 进入下一步
            schedule(() => {
              setShell((prev) => {
                if (!prev) return prev;
                const nextBalance = Math.max(0, Number((prev.creditBalance - runSpec.consumedDelta).toFixed(2)));
                return {
                  ...prev,
                  chatPhase: 'done',
                  creditBalance: nextBalance,
                  showArtifacts: Boolean(runSpec.artifact),
                };
              });
              setIsRunningChat(false);
              if (nextIdx < def.steps.length) {
                const latest = shellRef.current;
                if (latest) enterStep(def, nextIdx, latest);
              }
            }, 160);
          }
        };
        tick();
      }, streamStart);
    },
    [schedule, enterStep]
  );

  // 点击左侧目标控件推进课程
  const handleTargetClick = useCallback(
    (target: GuidedTargetId) => {
      if (!lesson || !shell || !currentStep?.wait || isRunningChat) return;
      if (currentStep.wait.target !== target) return;

      lastAsideRef.current = null;
      setFeed((prev) => [...prev, { id: nextId(), kind: 'did', text: currentStep.wait!.label }]);

      let updatedShell = shell;
      if (currentStep.onAction) {
        const patch = currentStep.onAction(shell);
        updatedShell = { ...shell, ...patch };
        setShell(updatedShell);
      }

      const nextIdx = stepIdx + 1;

      if (currentStep.runChat) {
        const runSpec = currentStep.runChat(updatedShell);
        runChatAnimation(lesson, nextIdx, runSpec);
        return;
      }

      if (nextIdx < lesson.steps.length) {
        enterStep(lesson, nextIdx, updatedShell);
      }
    },
    [lesson, shell, currentStep, isRunningChat, stepIdx, runChatAnimation, enterStep]
  );

  // 点到非目标控件时的友好虚线解释（连点同一状态不刷屏，切换选项/开关后给出新反馈）
  const handleAsideClick = useCallback(
    (label: string, explain: string) => {
      if (isRunningChat) return;
      const dedupeKey = `${label}::${explain}`;
      if (lastAsideRef.current === dedupeKey) return;
      lastAsideRef.current = dedupeKey;
      const hint = currentStep?.wait
        ? `这一步请先点蓝圈里的「${currentStep.wait.label}」。`
        : '点右边底部按钮继续下一步。';
      setFeed((prev) => [
        ...prev,
        {
          id: nextId(),
          kind: 'aside',
          label,
          html: `${explain}<br/><span style="color:#6b7079">${hint}</span>`,
        },
      ]);
    },
    [isRunningChat, currentStep]
  );

  const buttons = useMemo(() => {
    if (!lesson || !shell || !currentStep?.buttons || isRunningChat) return [];
    return currentStep.buttons.map((b) => ({
      label: b.label,
      primary: b.primary,
      onClick: () => {
        if (b.nextLesson) {
          onSelectLesson(b.nextLesson);
          return;
        }
        if (b.href) {
          window.location.href = b.href;
          return;
        }
        if (b.restart) {
          clearAllTimers();
          const collapsed = coachMode === 'docked' && window.innerWidth < AUTO_COLLAPSE_WIDTH;
          const init = { ...lesson.initialState(), sidebarCollapsed: collapsed };
          setShell(init);
          setFeed([]);
          enterStep(lesson, 0, init);
          return;
        }
        // 普通推进按钮
        setFeed((prev) => [...prev, { id: nextId(), kind: 'mine', text: b.label }]);
        const nextIdx = stepIdx + 1;
        if (nextIdx < lesson.steps.length) {
          enterStep(lesson, nextIdx, shell);
        }
      },
    }));
  }, [lesson, shell, currentStep, isRunningChat, onSelectLesson, clearAllTimers, coachMode, enterStep, stepIdx]);

  const waitPrompt = useMemo(() => {
    if (isRunningChat) return 'WorkBuddy 正在执行任务并统计积分…';
    if (currentStep?.wait) return `在左边点蓝圈里的「${currentStep.wait.label}」`;
    return null;
  }, [isRunningChat, currentStep]);

  if (!lesson || !shell) {
    return (
      <div className="flex-1 flex items-center justify-center rounded-[16px] border border-gray-200 bg-white text-[13.5px] text-gray-500">
        正在载入本节模拟场景…
      </div>
    );
  }

  return (
    <>
      <GuidedWorkBuddy
        shell={shell}
        waitTarget={isRunningChat ? null : (currentStep?.wait?.target ?? null)}
        waitCallout={isRunningChat ? null : (currentStep?.wait?.callout ?? null)}
        urgent={urgent}
        onTargetClick={handleTargetClick}
        onToggleSidebar={() =>
          setShell((p) => (p ? { ...p, sidebarCollapsed: !p.sidebarCollapsed } : p))
        }
        onClosePopover={() => setShell((p) => (p ? { ...p, popover: null } : p))}
        onAsideClick={handleAsideClick}
      />

      <CoachRail
        mode={coachMode}
        onChangeMode={onChangeCoachMode}
        phase={currentStep?.phase ?? 0}
        feed={feed}
        isTyping={isTyping}
        waitPrompt={waitPrompt}
        buttons={buttons}
        subtitle={`${lesson.code} ${lesson.title} · 跟着蓝圈点就行`}
      />
    </>
  );
}
