import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CoachRail, type CoachMode } from './CoachRail';
import {
  ACTION_LABEL,
  ASIDE_EXPLAIN,
  DEMO_PROMPT_TEXT,
  DEMO_REPLY_TEXT,
  EXPLORE_AREAS,
} from './explain';
import type { LessonId } from './guidedTypes';
import { LiveWorkBuddy } from './LiveWorkBuddy';
import type {
  AreaId,
  CoachActionId,
  FeedItem,
  FeedItemInput,
  LessonStage,
  LiveShellState,
  PhaseIndex,
  PlusSubmenu,
} from './types';

const AUTO_COLLAPSE_WIDTH = 1140;
const SIDEBAR_AREAS: ReadonlySet<AreaId> = new Set(['nav', 'historyGroups', 'avatar']);

let msgSeq = 0;
const nextId = () => `if-${++msgSeq}`;

function createFreshShell(collapsed: boolean): LiveShellState {
  return {
    view: 'home',
    popover: null,
    plusSubmenu: 'mode',
    planOn: false,
    askOn: false,
    fullAccessOn: false,
    selectedGroup: null,
    selectedModel: 'Hy4 flash',
    selectedQuickTag: null,
    composerText: '',
    sidebarCollapsed: collapsed,
    groupExpanded: false,
    demoPrompt: DEMO_PROMPT_TEXT,
    demoSteps: [],
    demoStepsCollapsed: false,
    streamedText: '',
    showFileCard: false,
    showArtifacts: false,
  };
}

interface InterfaceLessonProps {
  coachMode: CoachMode;
  onChangeCoachMode: (mode: CoachMode) => void;
  restartSignal: number;
  onSelectLesson: (id: LessonId) => void;
}

export default function InterfaceLesson({
  coachMode,
  onChangeCoachMode,
  restartSignal,
  onSelectLesson,
}: InterfaceLessonProps) {
  const [stage, setStage] = useState<LessonStage>('intro');
  const [shell, setShell] = useState<LiveShellState>(() =>
    createFreshShell(typeof window !== 'undefined' ? window.innerWidth < AUTO_COLLAPSE_WIDTH : false)
  );
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [exploredAreas, setExploredAreas] = useState<Set<AreaId>>(() => new Set());
  const [exploreIndex, setExploreIndex] = useState(0);
  const [stepPhase, setStepPhase] = useState<'prompt' | 'explained'>('prompt');
  const [quizHintVisible, setQuizHintVisible] = useState(false);
  const [urgent, setUrgent] = useState(false);

  const lastAsideRef = useRef<CoachActionId | null>(null);
  const timersRef = useRef<number[]>([]);
  const pendingSayRef = useRef<{
    items: FeedItemInput[];
    next: number;
    timers: number[];
    onDone?: () => void;
  } | null>(null);

  const clearAllTimers = useCallback(() => {
    for (const id of timersRef.current) window.clearTimeout(id);
    timersRef.current = [];
    pendingSayRef.current = null;
  }, []);

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
        const delay = idx === 0 ? 180 : 300;
        elapsed += delay;
        const id = schedule(() => {
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
    [flushPendingSay, schedule]
  );

  const bootLesson = useCallback(() => {
    clearAllTimers();
    lastAsideRef.current = null;
    setStage('intro');
    setShell(
      createFreshShell(
        typeof window !== 'undefined' && coachMode === 'docked' && window.innerWidth < AUTO_COLLAPSE_WIDTH
      )
    );
    setExploredAreas(new Set());
    setExploreIndex(0);
    setStepPhase('prompt');
    setQuizHintVisible(false);
    setUrgent(false);
    setIsTyping(false);
    setFeed([]);

    saySequence([
      {
        kind: 'coach',
        html: '第一次打开 WorkBuddy，按钮看起来不少，其实认清 <b>7 块首页区域</b> + <b>右侧产物区</b>就够用了。',
      },
      {
        kind: 'coach',
        html: '左边是 5.11.3 的真实界面还原——接下来我带你<b>一步一步认完这 7 块</b>：点开一块、看懂一块，再点按钮看下一块。',
      },
    ]);
  }, [clearAllTimers, saySequence, coachMode]);

  useEffect(() => {
    bootLesson();
    return () => clearAllTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restartSignal]);

  useEffect(() => {
    const syncSidebar = () => {
      const w = window.innerWidth;
      setShell((prev) => ({
        ...prev,
        sidebarCollapsed: coachMode === 'docked' && w < AUTO_COLLAPSE_WIDTH,
      }));
    };
    syncSidebar();
    window.addEventListener('resize', syncSidebar);
    return () => window.removeEventListener('resize', syncSidebar);
  }, [coachMode]);

  useEffect(() => {
    setUrgent(false);
    const waitingClick =
      (stage === 'explore' && stepPhase === 'prompt') ||
      stage === 'demo-ready' ||
      stage === 'quiz';
    if (!waitingClick) return;
    const t = window.setTimeout(() => {
      setUrgent(true);
      if (stage === 'quiz') setQuizHintVisible(true);
    }, 6000);
    return () => window.clearTimeout(t);
  }, [stage, exploreIndex, stepPhase]);

  const phase: PhaseIndex = useMemo(() => {
    if (stage === 'intro') return 0;
    if (stage === 'explore') return 1;
    if (stage === 'demo-ready' || stage === 'demo-running' || stage === 'demo-done') return 2;
    return 3;
  }, [stage]);

  const currentArea = stage === 'explore' ? EXPLORE_AREAS[exploreIndex] ?? null : null;

  const { primaryTarget, primaryCallout } = useMemo((): {
    primaryTarget: CoachActionId | null;
    primaryCallout: string | null;
  } => {
    // 只在等待点击时亮起当前步的 1 个目标；点开讲解停留期间隐藏催促蓝圈，让用户安心看菜单
    if (stage === 'explore' && stepPhase === 'prompt' && currentArea) {
      return {
        primaryTarget: currentArea.actions[0],
        primaryCallout: currentArea.callout,
      };
    }
    if (stage === 'demo-ready') {
      return { primaryTarget: 'send', primaryCallout: '点发送看看产物区' };
    }
    if (stage === 'quiz' && quizHintVisible) {
      return { primaryTarget: 'group', primaryCallout: '点这里选分组' };
    }
    return { primaryTarget: null, primaryCallout: null };
  }, [stage, stepPhase, currentArea, quizHintVisible]);

  const startExplore = useCallback(() => {
    flushPendingSay();
    lastAsideRef.current = null;
    const first = EXPLORE_AREAS[0];
    setFeed((prev) => [...prev, { id: nextId(), kind: 'mine', text: '好，开始认界面' }]);
    setStage('explore');
    setExploreIndex(0);
    setStepPhase('prompt');
    setShell((p) => ({
      ...p,
      popover: null,
      sidebarCollapsed: SIDEBAR_AREAS.has(first.id) ? false : p.sidebarCollapsed,
    }));
    saySequence([{ kind: 'coach', html: first.leadIn }]);
  }, [flushPendingSay, saySequence]);

  const goToExploreStep = useCallback(
    (targetIdx: number, reason: 'next' | 'prev' | 'jump') => {
      const targetArea = EXPLORE_AREAS[targetIdx];
      if (!targetArea) return;
      flushPendingSay();
      lastAsideRef.current = null;
      setExploreIndex(targetIdx);
      setStepPhase('prompt');
      setShell((p) => ({
        ...p,
        popover: null,
        sidebarCollapsed: SIDEBAR_AREAS.has(targetArea.id) ? false : p.sidebarCollapsed,
      }));

      if (reason === 'next') {
        setFeed((prev) => [...prev, { id: nextId(), kind: 'mine', text: '懂了，看下一项' }]);
        saySequence([{ kind: 'coach', html: targetArea.leadIn }]);
      } else if (reason === 'prev') {
        setFeed((prev) => [...prev, { id: nextId(), kind: 'mine', text: '回看上一步' }]);
        saySequence([
          {
            kind: 'coach',
            html: `回到 <b>第 ${targetIdx + 1}/${EXPLORE_AREAS.length} 步（${targetArea.title}）</b>：再点一次左边蓝圈，对照着看一遍。`,
          },
        ]);
      } else {
        saySequence([
          {
            kind: 'coach',
            html: `回到 <b>第 ${targetIdx + 1}/${EXPLORE_AREAS.length} 步（${targetArea.title}）</b>：点一下左边蓝圈再看一遍。`,
          },
        ]);
      }
    },
    [flushPendingSay, saySequence]
  );

  const enterDemoReady = useCallback(() => {
    flushPendingSay();
    lastAsideRef.current = null;
    setFeed((prev) => [
      ...prev,
      { id: nextId(), kind: 'mine', text: '7 块认齐了，去试右侧产物区' },
    ]);
    setStage('demo-ready');
    setShell((prev) => ({
      ...prev,
      view: 'home',
      popover: null,
      selectedGroup: 'WorkBuddy-练习',
      composerText: DEMO_PROMPT_TEXT,
    }));
    saySequence([
      {
        kind: 'coach',
        html: '还有最后一块：<b>右侧产物区</b>。刚打开首页时它是空的，跑起任务才会自己滑出来。',
      },
      {
        kind: 'coach',
        html: '我帮你选好了 <b>WorkBuddy-练习</b> 分组、填好了小任务。点右下角蓝圈里的<b>发送</b>，看它干活。',
      },
    ]);
  }, [flushPendingSay, saySequence]);

  const runDemoAnimation = useCallback(() => {
    flushPendingSay();
    setStage('demo-running');
    setFeed((prev) => [...prev, { id: nextId(), kind: 'did', text: '发送' }]);
    setShell((prev) => ({
      ...prev,
      view: 'chat',
      popover: null,
      composerText: '',
      demoPrompt: DEMO_PROMPT_TEXT,
      demoStepsCollapsed: false,
      streamedText: '',
      showFileCard: false,
      showArtifacts: false,
      demoSteps: [
        {
          id: 's1',
          runningLabel: '正在读取分组目录 WorkBuddy-练习…',
          doneLabel: '已确认分组目录 WorkBuddy-练习',
          status: 'running',
        },
        {
          id: 's2',
          runningLabel: '正在生成 新手清单.md…',
          doneLabel: '已写入 新手清单.md（385 B）',
          status: 'pending',
        },
      ],
    }));

    schedule(() => {
      setShell((prev) => ({
        ...prev,
        demoSteps: prev.demoSteps.map((st, i) =>
          i === 0 ? { ...st, status: 'done' } : { ...st, status: 'running' }
        ),
      }));
    }, 420);

    schedule(() => {
      setShell((prev) => ({
        ...prev,
        demoSteps: prev.demoSteps.map((st) => ({ ...st, status: 'done' })),
      }));
    }, 880);

    schedule(() => {
      setShell((prev) => ({ ...prev, demoStepsCollapsed: true }));
      const chars = Array.from(DEMO_REPLY_TEXT);
      const chunkSize = 3;
      let cursor = 0;

      const tick = () => {
        cursor = Math.min(chars.length, cursor + chunkSize);
        const slice = chars.slice(0, cursor).join('');
        setShell((prev) => ({ ...prev, streamedText: slice }));
        if (cursor < chars.length) {
          schedule(tick, 34);
        } else {
          schedule(() => {
            setShell((prev) => ({ ...prev, showFileCard: true, showArtifacts: true }));
            setStage('demo-done');
            saySequence([
              {
                kind: 'coach',
                html: '看到了吗？左边出对话和文件卡片，右边自动滑出<b>产物预览区</b>——像浏览器标签一样直接核对，不用来回切文件夹。',
              },
            ]);
          }, 180);
        }
      };
      tick();
    }, 1160);
  }, [flushPendingSay, schedule, saySequence]);

  const enterQuiz = useCallback(() => {
    flushPendingSay();
    setFeed((prev) => [...prev, { id: nextId(), kind: 'mine', text: '记住了，考我一下' }]);
    setStage('quiz');
    setQuizHintVisible(false);
    setShell((prev) => ({
      ...prev,
      view: 'home',
      popover: null,
      selectedGroup: null,
      composerText: '',
      showArtifacts: false,
    }));
    saySequence([
      {
        kind: 'coach',
        html: '收个尾，10 秒小验证：待会你要整理第一份周报，<b>发任务前最该先点哪个按钮指定保存文件夹</b>？直接在左边点出来。',
      },
    ]);
  }, [flushPendingSay, saySequence]);

  const finishSummary = useCallback(() => {
    flushPendingSay();
    setStage('summary');
    saySequence([
      {
        kind: 'coach',
        html: '对，就是<b>选择分组</b>。每次发任务前先瞄一眼这里和旁边的默认权限，能避开一半新手坑。',
      },
      {
        kind: 'coach',
        html: '一句话记住：<b>左侧管入口和分组，中间输入框发任务，下方选分组 + 默认权限必看，右侧验产物。</b>',
      },
      { kind: 'summary' },
    ]);
  }, [flushPendingSay, saySequence]);

  const handleShellAction = useCallback(
    (action: CoachActionId, detail?: string) => {
      if (stage === 'demo-running') return;

      if (action === 'discoverApps') {
        setShell((p) => ({ ...p, popover: p.popover === 'discoverApps' ? null : 'discoverApps' }));
      } else if (action === 'discover') {
        setShell((p) => ({ ...p, popover: p.popover === 'discover' ? null : 'discover' }));
      } else if (action === 'avatar') {
        setShell((p) => ({ ...p, popover: p.popover === 'avatar' ? null : 'avatar' }));
      } else if (action === 'plus') {
        setShell((p) => ({
          ...p,
          popover: p.popover === 'plus' ? null : 'plus',
          plusSubmenu: 'mode',
        }));
      } else if (action === 'group') {
        setShell((p) => ({ ...p, popover: p.popover === 'group' ? null : 'group' }));
      } else if (action === 'permission') {
        setShell((p) => ({ ...p, popover: p.popover === 'permission' ? null : 'permission' }));
      } else if (action === 'model') {
        setShell((p) => ({ ...p, popover: p.popover === 'model' ? null : 'model' }));
      } else if (action === 'quickTags' && detail) {
        setShell((p) => ({
          ...p,
          popover: null,
          selectedQuickTag: p.selectedQuickTag === detail ? null : detail,
        }));
      } else if (action === 'groupsList' || action === 'recent') {
        setShell((p) => ({
          ...p,
          popover: null,
          groupExpanded: action === 'groupsList' ? !p.groupExpanded : true,
        }));
      }

      if (stage === 'demo-ready' && action === 'send') {
        runDemoAnimation();
        return;
      }

      if (stage === 'quiz') {
        if (action === 'group') {
          setFeed((prev) => [...prev, { id: nextId(), kind: 'did', text: '选择分组' }]);
          finishSummary();
          return;
        }
        setQuizHintVisible(true);
        setFeed((prev) => [
          ...prev,
          {
            id: nextId(),
            kind: 'aside',
            tone: 'warn',
            label: ACTION_LABEL[action],
            html: `${ASIDE_EXPLAIN[action]}<br/><span style="color:#6b7079">再找找：指定本地保存文件夹的按钮在输入框外面左下角（蓝圈亮起来了）。</span>`,
          },
        ]);
        return;
      }

      if (stage === 'explore' && currentArea) {
        const isCurrentTarget = currentArea.actions.includes(action);
        if (isCurrentTarget) {
          lastAsideRef.current = null;
          if (stepPhase === 'prompt') {
            flushPendingSay();
            const nextSet = new Set(exploredAreas);
            nextSet.add(currentArea.id);
            setExploredAreas(nextSet);
            setStepPhase('explained');

            setFeed((prev) => [
              ...prev,
              { id: nextId(), kind: 'did', text: detail || ACTION_LABEL[action] },
            ]);

            const replies: FeedItemInput[] = [{ kind: 'coach', html: currentArea.coachReply }];
            if (exploreIndex === EXPLORE_AREAS.length - 1) {
              replies.push({
                kind: 'coach',
                html: '首页 7 块都认齐了！点下面按钮，亲手发一次小任务看看<b>右侧产物区</b>。',
              });
            }
            saySequence(replies);
          }
          // 处于 explained 停留期间，允许用户在当前区域/菜单继续点着玩，不刷屏、不跳步
          return;
        }
      }

      // 点到非当前目标控件：给一句轻量解释，不跳过当前主线
      if (lastAsideRef.current === action) return;
      lastAsideRef.current = action;
      const tailTip =
        stage === 'demo-ready'
          ? '看完了点右下角蓝圈里的<b>发送</b>。'
          : stage === 'explore' && currentArea
            ? stepPhase === 'prompt'
              ? `先跟着看第 ${exploreIndex + 1}/${EXPLORE_AREAS.length} 步：点左边蓝圈里的<b>${currentArea.title}</b>。`
              : '看完了点右下角按钮继续下一步。'
            : '点右边底部按钮继续。';
      setFeed((prev) => [
        ...prev,
        {
          id: nextId(),
          kind: 'aside',
          label: ACTION_LABEL[action],
          html: `${ASIDE_EXPLAIN[action]}<br/><span style="color:#6b7079">${tailTip}</span>`,
        },
      ]);
    },
    [
      stage,
      currentArea,
      stepPhase,
      exploredAreas,
      exploreIndex,
      flushPendingSay,
      runDemoAnimation,
      finishSummary,
      saySequence,
    ]
  );

  const { waitPrompt, buttons } = useMemo(() => {
    if (stage === 'intro') {
      return {
        waitPrompt: null,
        buttons: [{ label: '好，开始认界面', primary: true, onClick: startExplore }],
      };
    }
    if (stage === 'explore' && currentArea) {
      const isLast = exploreIndex === EXPLORE_AREAS.length - 1;
      const isCurrentDone = exploredAreas.has(currentArea.id);
      const btns: Array<{ label: string; primary?: boolean; onClick: () => void }> = [];

      if (exploreIndex > 0) {
        btns.push({
          label: '← 上一步',
          primary: false,
          onClick: () => goToExploreStep(exploreIndex - 1, 'prev'),
        });
      }

      if (stepPhase === 'explained') {
        btns.push(
          isLast
            ? {
                label: '7 块认齐了，去试右侧产物区 →',
                primary: true,
                onClick: enterDemoReady,
              }
            : {
                label: `懂了，看下一项（${exploreIndex + 2}/${EXPLORE_AREAS.length}）→`,
                primary: true,
                onClick: () => goToExploreStep(exploreIndex + 1, 'next'),
              }
        );
        return { waitPrompt: null, buttons: btns };
      }

      // 回看已完成步骤时，也允许直接点前进；未完成步骤绝不提供跳过按钮
      if (isCurrentDone) {
        btns.push(
          isLast
            ? {
                label: '7 块认齐了，去试右侧产物区 →',
                primary: true,
                onClick: enterDemoReady,
              }
            : {
                label: `继续下一项（${exploreIndex + 2}/${EXPLORE_AREAS.length}）→`,
                primary: true,
                onClick: () => goToExploreStep(exploreIndex + 1, 'next'),
              }
        );
      }

      return {
        waitPrompt: currentArea.waitPrompt,
        buttons: btns,
      };
    }
    if (stage === 'demo-ready') {
      return { waitPrompt: '在左边点蓝圈里的 发送 按钮', buttons: [] };
    }
    if (stage === 'demo-running') {
      return { waitPrompt: 'WorkBuddy 正在执行任务…', buttons: [] };
    }
    if (stage === 'demo-done') {
      return {
        waitPrompt: null,
        buttons: [{ label: '记住了，考我一下', primary: true, onClick: enterQuiz }],
      };
    }
    if (stage === 'quiz') {
      return {
        waitPrompt: '在左边直接点出 指定保存文件夹 的按钮',
        buttons: [
          { label: '直接给我提示', primary: false, onClick: () => setQuizHintVisible(true) },
        ],
      };
    }
    return {
      waitPrompt: null,
      buttons: [
        {
          label: '下一节：1.1 装好先调的：设置与积分 →',
          primary: true,
          onClick: () => onSelectLesson('setup'),
        },
        {
          label: '读本节图文教程',
          primary: false,
          onClick: () => {
            window.location.href = '/features/basics/interface/';
          },
        },
        { label: '重来一遍', primary: false, onClick: bootLesson },
      ],
    };
  }, [
    stage,
    currentArea,
    exploreIndex,
    stepPhase,
    exploredAreas,
    startExplore,
    goToExploreStep,
    enterDemoReady,
    enterQuiz,
    bootLesson,
    onSelectLesson,
  ]);

  const stepProgress = useMemo(
    () =>
      stage === 'explore'
        ? {
            steps: EXPLORE_AREAS.map((area) => ({ ...area, done: exploredAreas.has(area.id) })),
            currentIndex: exploreIndex,
            stepPhase,
            onSelectStep: (idx: number) => goToExploreStep(idx, 'jump'),
          }
        : null,
    [stage, exploreIndex, stepPhase, exploredAreas, goToExploreStep]
  );

  return (
    <>
      <LiveWorkBuddy
        shell={shell}
        primaryTarget={primaryTarget}
        primaryCallout={primaryCallout}
        urgent={urgent}
        showExploreDots={false}
        exploredAreas={exploredAreas}
        onAction={handleShellAction}
        onToggleSidebar={() =>
          setShell((p) => ({ ...p, sidebarCollapsed: !p.sidebarCollapsed }))
        }
        onClosePopover={() => setShell((p) => ({ ...p, popover: null }))}
        onSelectPlusSubmenu={(sub: PlusSubmenu) =>
          setShell((p) => ({ ...p, plusSubmenu: sub }))
        }
        onTogglePlan={() =>
          setShell((p) => ({ ...p, planOn: !p.planOn, askOn: !p.planOn ? false : p.askOn }))
        }
        onToggleAsk={() =>
          setShell((p) => ({ ...p, askOn: !p.askOn, planOn: !p.askOn ? false : p.planOn }))
        }
        onToggleFullAccess={() =>
          setShell((p) => ({ ...p, fullAccessOn: !p.fullAccessOn }))
        }
        onSelectGroup={(group) =>
          setShell((p) => ({ ...p, selectedGroup: group, popover: null }))
        }
        onSelectModel={(model) =>
          setShell((p) => ({ ...p, selectedModel: model, popover: null }))
        }
      />

      <CoachRail
        mode={coachMode}
        onChangeMode={onChangeCoachMode}
        phase={phase}
        stage={stage}
        feed={feed}
        isTyping={isTyping}
        exploredAreas={exploredAreas}
        stepProgress={stepProgress}
        subtitle="跟着蓝圈一步一步认，点开一块讲一块"
        waitPrompt={waitPrompt}
        buttons={buttons}
      />
    </>
  );
}
