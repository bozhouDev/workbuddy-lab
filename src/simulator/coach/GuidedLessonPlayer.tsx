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
import type { FeedItem, FeedItemInput, NavTrailStep, PhaseIndex, PopoverId } from './types';

const AUTO_COLLAPSE_WIDTH = 1140;
const STORAGE_PREFIX = 'wblab:guided:v11:';

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
    case 'attach':
      return (await import('./lessons/attach')).attachLesson;
    case 'mode':
      return (await import('./lessons/mode')).modeLesson;
    case 'permission':
      return (await import('./lessons/permission')).permissionLesson;
    case 'task-brief':
      return (await import('./lessons/taskBrief')).taskBriefLesson;
    case 'execution':
      return (await import('./lessons/execution')).executionLesson;
    case 'review':
      return (await import('./lessons/review')).reviewLesson;
    case 'revise':
      return (await import('./lessons/revise')).reviseLesson;
    case 'anatomy':
      return (await import('./lessons/anatomy')).anatomyLesson;
    case 'choose':
      return (await import('./lessons/choose')).chooseLesson;
    case 'experts':
      return (await import('./lessons/experts')).expertsLesson;
    case 'skills':
      return (await import('./lessons/skills')).skillsLesson;
    case 'make-skill':
      return (await import('./lessons/makeSkill')).makeSkillLesson;
    case 'connectors':
      return (await import('./lessons/connectors')).connectorsLesson;
    case 'custom-connector':
      return (await import('./lessons/customConnector')).customConnectorLesson;
    case 'library':
      return (await import('./lessons/library')).libraryLesson;
    case 'schedule':
      return (await import('./lessons/schedule')).scheduleLesson;
    case 'assistant':
      return (await import('./lessons/assistant')).assistantLesson;
  }
}

/** 步进流式文本光标，避免在 {{wrong:...}} / {{ok:...}} 标签中间切断导致闪现原码 */
function advanceSafeCursor(text: string, current: number, step: number): number {
  let next = Math.min(text.length, current + step);
  const openIdx = text.lastIndexOf('{{', next);
  if (openIdx !== -1) {
    const closeIdx = text.indexOf('}}', openIdx);
    if (closeIdx !== -1 && next <= closeIdx + 2) {
      next = closeIdx + 2;
    }
  }
  return Math.min(text.length, next);
}

/** 找到包含 idx 的连续带路步骤区间，用于生成/更新单条紧凑路径条 */
function buildNavTrailSteps(def: GuidedLessonDef, activeIdx: number): NavTrailStep[] {
  let start = activeIdx;
  while (start > 0 && def.steps[start - 1]?.navLabel) {
    start -= 1;
  }
  let end = activeIdx;
  while (end + 1 < def.steps.length && def.steps[end + 1]?.navLabel) {
    end += 1;
  }
  const out: NavTrailStep[] = [];
  for (let i = start; i <= end; i += 1) {
    const st = def.steps[i];
    if (!st.navLabel) continue;
    out.push({
      id: st.id,
      label: st.navLabel,
      done: i < activeIdx,
      active: i === activeIdx,
    });
  }
  return out;
}

/** 判断某一步对应的弹窗是否已经被学员提前点开，若已点开则直接无缝跳过 */
function isAlreadySatisfiedByState(target: GuidedTargetId | undefined, s: GuidedShellState): boolean {
  if (target === 'avatar' && s.popover === 'avatar') return true;
  if (target === 'composer.group' && s.popover === 'group') return true;
  if (target === 'composer.model' && s.popover === 'model') return true;
  if (target === 'composer.plus' && s.popover === 'plus') return true;
  if (target === 'plusMenu.connectors' && s.popover === 'plus' && s.plusSubmenu === 'connectors') return true;
  if (target === 'plusMenu.experts' && s.popover === 'plus' && s.plusSubmenu === 'experts') return true;
  if (target === 'plusMenu.skills' && s.popover === 'plus' && s.plusSubmenu === 'skills') return true;
  if (target === 'composer.permission' && s.popover === 'permission') return true;
  if (target === 'composer.mention' && s.mentionMenuOpen) return true;
  if (target === 'composer.slash' && s.slashMenuOpen) return true;
  if (target === 'nav.mobileLink' && s.popover === 'mobile') return true;
  return false;
}

interface SavedSnapshot {
  stepIdx: number;
  shell: GuidedShellState;
  feed: FeedItem[];
}

function readSaved(lessonId: string): SavedSnapshot | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(`${STORAGE_PREFIX}${lessonId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedSnapshot;
    if (typeof parsed.stepIdx !== 'number' || !parsed.shell || !Array.isArray(parsed.feed)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeSaved(lessonId: string, snap: SavedSnapshot) {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(`${STORAGE_PREFIX}${lessonId}`, JSON.stringify(snap));
  } catch {
    // 忽略无痕模式或存储满异常
  }
}

function clearSaved(lessonId: string) {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(`${STORAGE_PREFIX}${lessonId}`);
  } catch {
    // 忽略异常
  }
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
  const [jumpablePhases, setJumpablePhases] = useState<PhaseIndex[]>([]);

  const timersRef = useRef<number[]>([]);
  const lastAsideRef = useRef<string | null>(null);
  const shellRef = useRef<GuidedShellState | null>(null);
  shellRef.current = shell;
  const feedRef = useRef<FeedItem[]>(feed);
  feedRef.current = feed;
  const activeRunRef = useRef<{
    def: GuidedLessonDef;
    nextIdx: number;
    runSpec: ChatRunSpec;
  } | null>(null);
  const phaseSnapshotsRef = useRef<Partial<Record<PhaseIndex, SavedSnapshot>>>({});
  const prevRestartRef = useRef(restartSignal);

  /**
   * 正在逐条打出的陪练消息：items 是这一步要说的全部，next 是下一条的下标。
   * 学员手快在消息没打完时就点了目标，要先把剩下的一次补齐，否则旧消息会晚到、插在新消息后面。
   */
  const pendingSayRef = useRef<{
    items: FeedItemInput[];
    next: number;
    timers: number[];
    onDone?: () => void;
  } | null>(null);

  const clearAllTimers = useCallback(() => {
    for (const id of timersRef.current) window.clearTimeout(id);
    timersRef.current = [];
    // 重来 / 跳阶段时整段作废，不再补发
    pendingSayRef.current = null;
  }, []);

  /** 把上一步还没打出来的消息立刻按原顺序补上，并执行它的收尾（如更新路径条） */
  const flushPendingSay = useCallback(() => {
    const pending = pendingSayRef.current;
    if (!pending) return;
    pendingSayRef.current = null;
    for (const id of pending.timers) window.clearTimeout(id);
    const rest = pending.items.slice(pending.next);
    if (rest.length > 0) {
      setFeed((prev) => [...prev, ...rest.map((item) => ({ ...item, id: nextId() }) as FeedItem)]);
    }
    setIsTyping(false);
    pending.onDone?.();
  }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  const saySequence = useCallback(
    (items: FeedItemInput[], onDone?: () => void) => {
      // 上一段没打完的先补齐，保证消息顺序
      flushPendingSay();
      if (items.length === 0) {
        onDone?.();
        return;
      }
      setIsTyping(true);
      const pending = { items, next: 0, timers: [] as number[], onDone };
      pendingSayRef.current = pending;
      let elapsed = 0;
      items.forEach((item, idx) => {
        const delay = idx === 0 ? 180 : 280;
        elapsed += delay;
        const id = schedule(() => {
          // 已被补发或作废的旧序列不再输出
          if (pendingSayRef.current !== pending) return;
          setFeed((prev) => [...prev, { ...item, id: nextId() } as FeedItem]);
          pending.next = idx + 1;
          if (idx === items.length - 1) {
            pendingSayRef.current = null;
            setIsTyping(false);
            onDone?.();
          }
        }, elapsed);
        pending.timers.push(id);
      });
    },
    [schedule, flushPendingSay]
  );

  /** 在 feed 中原地更新当前带路路径条（不刷屏发一堆「你点了 X」） */
  const upsertNavTrail = useCallback((steps: NavTrailStep[]) => {
    const groupFirstId = steps[0]?.id;
    setFeed((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.kind === 'navTrail' && last.steps[0]?.id === groupFirstId) {
        return [...prev.slice(0, -1), { ...last, steps }];
      }
      return [...prev, { id: nextId(), kind: 'navTrail', steps }];
    });
  }, []);

  /** 把刚走完的一组带路路径条全部标为 ✓ */
  const markLastNavTrailDone = useCallback(() => {
    setFeed((prev) => {
      const last = prev[prev.length - 1];
      if (!last || last.kind !== 'navTrail') return prev;
      if (last.steps.every((s) => s.done)) return prev;
      return [
        ...prev.slice(0, -1),
        {
          ...last,
          steps: last.steps.map((s) => ({ ...s, done: true, active: false })),
        },
      ];
    });
  }, []);

  const enterStep = useCallback(
    (def: GuidedLessonDef, idx: number, baseShell: GuidedShellState) => {
      let targetIdx = idx;
      let workingShell = baseShell;

      // 如果学员提前点开了对应弹窗（如已提前点开头像/分组/模型），无缝跳过重复引导
      while (
        targetIdx < def.steps.length - 1 &&
        isAlreadySatisfiedByState(def.steps[targetIdx]?.wait?.target, workingShell)
      ) {
        targetIdx += 1;
      }

      const step = def.steps[targetIdx];
      if (!step) return;
      // 进新一步前，把上一步没打完的话补齐（下面可能直接更新路径条）
      flushPendingSay();
      lastAsideRef.current = null;
      setStepIdx(targetIdx);
      setUrgent(false);

      let nextShell = workingShell;
      if (step.onEnter) {
        nextShell = { ...nextShell, ...step.onEnter(nextShell) };
      }
      if (step.revealMarksOnEnter) {
        nextShell = { ...nextShell, marksRevealed: true };
      }
      if (nextShell !== baseShell) {
        setShell(nextShell);
        shellRef.current = nextShell;
      }

      // 记录每个阶段首次到达时的干净里程碑快照，支持点击顶部 4 段进度条回跳
      if (!phaseSnapshotsRef.current[step.phase]) {
        phaseSnapshotsRef.current[step.phase] = {
          stepIdx: targetIdx,
          shell: nextShell,
          feed: feedRef.current,
        };
        setJumpablePhases(
          Object.keys(phaseSnapshotsRef.current).map(Number) as PhaseIndex[]
        );
      }

      const sayLines = [...(step.sayFrom ? step.sayFrom(nextShell) : []), ...step.say];
      const items: FeedItemInput[] = sayLines.map((html) => ({
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

      if (step.navLabel) {
        const trailSteps = buildNavTrailSteps(def, targetIdx);
        if (items.length > 0) {
          saySequence(items, () => upsertNavTrail(trailSteps));
        } else {
          upsertNavTrail(trailSteps);
        }
      } else {
        markLastNavTrailDone();
        saySequence(items);
      }
    },
    [saySequence, upsertNavTrail, markLastNavTrailDone, flushPendingSay]
  );

  // 动态按需加载当前课脚本（优先恢复本次会话刷新前的进度）
  useEffect(() => {
    let cancelled = false;
    const isExplicitRestart = restartSignal !== prevRestartRef.current;
    prevRestartRef.current = restartSignal;

    clearAllTimers();
    activeRunRef.current = null;
    phaseSnapshotsRef.current = {};
    setJumpablePhases([]);
    setLesson(null);
    setFeed([]);
    setIsTyping(false);
    setIsRunningChat(false);

    if (isExplicitRestart) {
      clearSaved(lessonId);
    }

    loadLessonDef(lessonId).then((def) => {
      if (cancelled) return;
      const collapsed =
        typeof window !== 'undefined' &&
        coachMode === 'docked' &&
        window.innerWidth < AUTO_COLLAPSE_WIDTH;

      const saved = isExplicitRestart ? null : readSaved(lessonId);
      if (saved && saved.stepIdx < def.steps.length) {
        const restoredShell: GuidedShellState = {
          ...def.initialState(),
          ...saved.shell,
          sidebarCollapsed: collapsed,
          chatPhase: saved.shell.activeChat ? 'done' : 'idle',
        };
        setLesson(def);
        setStepIdx(saved.stepIdx);
        setShell(restoredShell);
        shellRef.current = restoredShell;
        setFeed(saved.feed);
        feedRef.current = saved.feed;
        // 至少允许从第 0 阶段重新开始
        phaseSnapshotsRef.current[0] = {
          stepIdx: 0,
          shell: { ...def.initialState(), sidebarCollapsed: collapsed },
          feed: [],
        };
        setJumpablePhases([0]);
        return;
      }

      const init = { ...def.initialState(), sidebarCollapsed: collapsed };
      setLesson(def);
      setShell(init);
      shellRef.current = init;
      enterStep(def, 0, init);
    });

    return () => {
      cancelled = true;
      clearAllTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId, restartSignal]);

  // 自动保存当前稳定进度到 sessionStorage，刷新浏览器不丢进度（泊舟打字动画中途刷新也能续上当前步）
  useEffect(() => {
    if (!lesson || !shell || isRunningChat) return;
    writeSaved(lesson.id, { stepIdx, shell, feed });
  }, [lesson, stepIdx, shell, feed, isRunningChat]);

  // 停靠/小窗切换或窗口缩放时自动适配侧栏折叠（1280px 保持展开）
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

  /** 立即结算当前正在进行的流式回复（供正常播完或手快用户提前点击时复用） */
  const finishActiveRunNow = useCallback((): {
    def: GuidedLessonDef;
    nextIdx: number;
    settledShell: GuidedShellState;
  } | null => {
    const pending = activeRunRef.current;
    if (!pending || !shellRef.current) return null;
    activeRunRef.current = null;
    clearAllTimers();

    const prev = shellRef.current;
    const { def, nextIdx, runSpec } = pending;
    const nextBalance = Math.max(
      0,
      Number((prev.creditBalance - runSpec.consumedDelta).toFixed(2))
    );
    const dedupedHistory = [
      runSpec,
      ...prev.chatHistory.filter((item) => item.id !== runSpec.id),
    ];
    const settledShell: GuidedShellState = {
      ...prev,
      composerText: '',
      followupText: '',
      activeChat: runSpec,
      chatHistory: dedupedHistory,
      chatPhase: 'done',
      streamedCharCount: runSpec.replyHtml.length,
      creditBalance: nextBalance,
      marksRevealed: !runSpec.hideMarksInitially,
      showArtifacts: Boolean(runSpec.artifact),
    };
    setShell(settledShell);
    shellRef.current = settledShell;
    setIsRunningChat(false);
    return { def, nextIdx, settledShell };
  }, [clearAllTimers]);

  const runChatAnimation = useCallback(
    (def: GuidedLessonDef, nextIdx: number, runSpec: ChatRunSpec) => {
      setIsRunningChat(true);
      activeRunRef.current = { def, nextIdx, runSpec };
      setShell((prev) =>
        prev
          ? {
              ...prev,
              view: 'chat',
              popover: null,
              composerText: '',
              followupText: '',
              activeChat: runSpec,
              marksRevealed: !runSpec.hideMarksInitially,
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
        }, i * 320);
      }

      // 工具完成 → 开始流式输出回复正文
      const streamStart = totalSteps * 320 + 180;
      schedule(() => {
        setShell((prev) => (prev ? { ...prev, chatPhase: 'streaming' } : prev));

        let cursor = 0;
        const text = runSpec.replyHtml;
        const tick = () => {
          cursor = advanceSafeCursor(text, cursor, 7);
          setShell((prev) => (prev ? { ...prev, streamedCharCount: cursor } : prev));
          if (cursor < text.length) {
            schedule(tick, 24);
          } else {
            schedule(() => {
              const res = finishActiveRunNow();
              if (res && res.nextIdx < res.def.steps.length) {
                enterStep(res.def, res.nextIdx, res.settledShell);
              }
            }, 140);
          }
        };
        tick();
      }, streamStart);
    },
    [schedule, finishActiveRunNow, enterStep]
  );

  // 点击左侧目标控件推进课程（支持流式收尾阶段抢先点目标不丢点击！）
  const handleTargetClick = useCallback(
    (target: GuidedTargetId) => {
      if (!lesson || !shellRef.current) return;

      let activeIdx = stepIdx;
      let workingShell = shellRef.current;

      // 若正在流式输出且学员手快直接点了下一步的目标，立即播完当前对话并接着响应点击
      if (isRunningChat && activeRunRef.current) {
        const upcoming = activeRunRef.current.def.steps[activeRunRef.current.nextIdx];
        if (upcoming?.wait?.target !== target) return;
        const settled = finishActiveRunNow();
        if (!settled) return;
        activeIdx = settled.nextIdx;
        workingShell = settled.settledShell;
      }

      const step = lesson.steps[activeIdx];
      if (!step?.wait || step.wait.target !== target) return;

      lastAsideRef.current = null;
      // 消息没打完就点了：先补齐，再记「已操作」
      flushPendingSay();
      // 非带路步骤保留一条简洁确认，带路步骤直接勾选路径条不再刷屏
      if (!step.navLabel) {
        setFeed((prev) => [...prev, { id: nextId(), kind: 'did', text: step.wait!.label }]);
      }

      let updatedShell = workingShell;
      if (step.onAction) {
        const patch = step.onAction(workingShell);
        updatedShell = { ...workingShell, ...patch };
        setShell(updatedShell);
        shellRef.current = updatedShell;
      }

      const nextIdx = activeIdx + 1;

      if (step.runChat) {
        markLastNavTrailDone();
        const runSpec = step.runChat(updatedShell);
        runChatAnimation(lesson, nextIdx, runSpec);
        return;
      }

      if (nextIdx < lesson.steps.length) {
        enterStep(lesson, nextIdx, updatedShell);
      }
    },
    [lesson, stepIdx, isRunningChat, finishActiveRunNow, markLastNavTrailDone, runChatAnimation, enterStep, flushPendingSay]
  );

  // 允许在「最近」中自由切换历史对话回看对比（不破坏课程当前进度）
  const handleSelectHistoryChat = useCallback((chatId: string) => {
    if (isRunningChat) return;
    setShell((prev) => {
      if (!prev) return prev;
      const found = prev.chatHistory.find((c) => c.id === chatId);
      if (!found) return prev;
      return {
        ...prev,
        view: 'chat',
        popover: null,
        activeChat: found,
        chatPhase: 'done',
        streamedCharCount: found.replyHtml.length,
        marksRevealed: true,
        showArtifacts: Boolean(found.artifact),
      };
    });
  }, [isRunningChat]);

  // 允许点击「新建任务」或返回条，随时从回看历史记录切回当前新对话首页
  const handleNewTask = useCallback(() => {
    if (isRunningChat) return;
    setShell((prev) => (prev ? { ...prev, view: 'home', popover: null } : prev));
  }, [isRunningChat]);

  /** 学员中途逛到别处时，点高亮的侧栏入口回到当前步骤所在的页面（扩展页 / 定时任务 / 资料库） */
  const handleBackToView = useCallback(
    (view: GuidedShellState['view']) => {
      if (isRunningChat) return;
      setShell((prev) => (prev ? { ...prev, view, popover: null } : prev));
    },
    [isRunningChat]
  );

  // 允许点击安全菜单自由开关（与 0.4 一致，不锁死界面）
  const handleTogglePopover = useCallback(
    (pop: PopoverId) => {
      // 如果刚好正在流式输出且用户抢点左下角头像（下一步正好要点头像），走提前推进逻辑
      if (isRunningChat && pop === 'avatar' && activeRunRef.current) {
        const upcoming = activeRunRef.current.def.steps[activeRunRef.current.nextIdx];
        if (upcoming?.wait?.target === 'avatar') {
          handleTargetClick('avatar');
          return;
        }
      }
      if (isRunningChat) return;
      setShell((prev) =>
        prev ? { ...prev, popover: prev.popover === pop ? null : pop } : prev
      );
    },
    [isRunningChat, handleTargetClick]
  );

  // 点击顶部已完成阶段胶囊，干净回跳到该阶段
  const handleJumpPhase = useCallback(
    (targetPhase: PhaseIndex) => {
      if (!lesson) return;
      const snap = phaseSnapshotsRef.current[targetPhase];
      if (!snap) return;
      clearAllTimers();
      activeRunRef.current = null;
      setIsRunningChat(false);
      setIsTyping(false);
      const collapsed = coachMode === 'docked' && window.innerWidth < AUTO_COLLAPSE_WIDTH;
      const restored = { ...snap.shell, sidebarCollapsed: collapsed };
      setShell(restored);
      shellRef.current = restored;
      setFeed(snap.feed);
      feedRef.current = snap.feed;
      enterStep(lesson, snap.stepIdx, restored);
    },
    [lesson, clearAllTimers, coachMode, enterStep]
  );

  /** 不推进课程、只改左边界面状态（自由逛菜单、判断练习里随手挂东西），同步更新 shellRef 供点击推进时读取 */
  const patchShell = useCallback(
    (fn: (s: GuidedShellState) => Partial<GuidedShellState>) => {
      if (isRunningChat) return;
      setShell((prev) => {
        if (!prev) return prev;
        const next = { ...prev, ...fn(prev) };
        shellRef.current = next;
        return next;
      });
    },
    [isRunningChat]
  );

  // 点到非目标控件时的友好虚线解释（连点同一状态不刷屏，切换选项/开关后给出新反馈）
  const handleAsideClick = useCallback(
    (label: string, explain: string) => {
      if (isRunningChat) return;
      const dedupeKey = `${label}::${explain}`;
      if (lastAsideRef.current === dedupeKey) return;
      lastAsideRef.current = dedupeKey;
      const hint = !currentStep?.wait
        ? '点右边底部按钮继续下一步。'
        : currentStep.wait.target === 'composer.mention'
          ? '看完了在左边输入框里按键盘输入 <b>@</b> 继续。'
          : currentStep.wait.target === 'composer.slash'
            ? '看完了在左边输入框里按键盘输入 <b>/</b> 继续。'
            : `看完了点蓝圈里的 <b>${currentStep.wait.label}</b> 继续。`;
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
          clearSaved(lesson.id);
          phaseSnapshotsRef.current = {};
          setJumpablePhases([]);
          const collapsed = coachMode === 'docked' && window.innerWidth < AUTO_COLLAPSE_WIDTH;
          const init = { ...lesson.initialState(), sidebarCollapsed: collapsed };
          setShell(init);
          shellRef.current = init;
          setFeed([]);
          feedRef.current = [];
          enterStep(lesson, 0, init);
          return;
        }
        setFeed((prev) => [...prev, { id: nextId(), kind: 'mine', text: b.label }]);
        const nextIdx = stepIdx + 1;
        if (nextIdx < lesson.steps.length) {
          enterStep(lesson, nextIdx, shellRef.current ?? shell);
        }
      },
    }));
  }, [lesson, shell, currentStep, isRunningChat, onSelectLesson, clearAllTimers, coachMode, enterStep, stepIdx]);

  const waitPrompt = useMemo(() => {
    if (isRunningChat) return 'WorkBuddy 正在执行任务并统计积分…';
    if (currentStep?.wait) {
      if (currentStep.wait.target === 'composer.mention') {
        return '在左边蓝圈的输入框里，用键盘输入 @';
      }
      if (currentStep.wait.target === 'composer.slash') {
        return shell?.view === 'home'
          ? '在左边蓝圈的输入框里，用键盘输入 /'
          : '先点左上角「新建任务」回首页，再在输入框里输入 /';
      }
      return `在左边点蓝圈里的 ${currentStep.wait.label}`;
    }
    return null;
  }, [isRunningChat, currentStep, shell?.view]);

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
        onTogglePopover={handleTogglePopover}
        onClosePopover={() =>
          setShell((p) => (p ? { ...p, popover: null, mentionMenuOpen: false } : p))
        }
        onSelectHistoryChat={handleSelectHistoryChat}
        onNewTask={handleNewTask}
        onBackToView={handleBackToView}
        onAsideClick={handleAsideClick}
        onSelectPlusSubmenu={(sub) => patchShell((p) => ({ plusSubmenu: sub }))}
        onFreeMount={(chip) =>
          patchShell((p) => {
            const has = p.composerChips.some((c) => c.kind === chip.kind && c.label === chip.label);
            if (has) return { composerChips: p.composerChips.filter((c) => !(c.kind === chip.kind && c.label === chip.label)) };
            // 专家一次只召唤一位：挂新的就换掉旧的；技能可以挂多个
            const rest = chip.kind === 'expert' ? p.composerChips.filter((c) => c.kind !== 'expert') : p.composerChips;
            return { composerChips: [...rest, chip] };
          })
        }
        onFreeToggleConnector={(id) =>
          patchShell((p) => ({
            enabledConnectorIds: p.enabledConnectorIds.includes(id)
              ? p.enabledConnectorIds.filter((x) => x !== id)
              : [...p.enabledConnectorIds, id],
          }))
        }
      />

      <CoachRail
        mode={coachMode}
        onChangeMode={onChangeCoachMode}
        phase={currentStep?.phase ?? 0}
        feed={feed}
        isTyping={isTyping}
        waitPrompt={waitPrompt}
        buttons={buttons}
        subtitle={`${lesson.code} ${lesson.title} · 左边随时可点`}
        jumpablePhases={jumpablePhases}
        onJumpPhase={handleJumpPhase}
      />
    </>
  );
}
