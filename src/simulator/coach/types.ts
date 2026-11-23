import type { CoachCardSpec } from './guidedTypes';

export type PhaseIndex = 0 | 1 | 2 | 3;

export const PHASE_LABELS: readonly string[] = ['是什么', '动手', '看结果', '记住'] as const;

export type AreaId =
  | 'nav'
  | 'historyGroups'
  | 'avatar'
  | 'quickTags'
  | 'plus'
  | 'group'
  | 'permission';

export type PopoverId =
  | null
  | 'discoverApps'
  | 'discover'
  | 'avatar'
  | 'plus'
  | 'group'
  | 'permission'
  | 'model'
  /** 左下角移动设备小图标弹出的连接面板（4.2） */
  | 'mobile';

/** + 菜单右侧展开的二级菜单：添加文件 / 模式 / 专家 / 技能 / 连接器 */
export type PlusSubmenu = 'files' | 'mode' | 'experts' | 'skills' | 'connectors';

export type CoachActionId =
  | 'discoverApps'
  | 'newTask'
  | 'assistant'
  | 'extensions'
  | 'schedule'
  | 'library'
  | 'discover'
  | 'recent'
  | 'groupsList'
  | 'avatar'
  | 'notify'
  | 'mobileConnect'
  | 'quickTags'
  | 'plus'
  | 'model'
  | 'voice'
  | 'send'
  | 'group'
  | 'permission'
  | 'suggestions';

export type NavTrailStep = {
  id: string;
  label: string;
  done: boolean;
  active: boolean;
};

export type FeedItem =
  | { id: string; kind: 'coach'; html: string }
  | { id: string; kind: 'aside'; label: string; html: string; tone?: 'warn' }
  | { id: string; kind: 'mine'; text: string }
  | { id: string; kind: 'did'; text: string }
  | { id: string; kind: 'checklist' }
  | { id: string; kind: 'summary' }
  | { id: string; kind: 'card'; card: CoachCardSpec }
  | { id: string; kind: 'navTrail'; steps: NavTrailStep[] };

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
export type FeedItemInput = DistributiveOmit<FeedItem, 'id'>;

export type LessonStage =
  | 'intro'
  | 'explore'
  | 'demo-ready'
  | 'demo-running'
  | 'demo-done'
  | 'quiz'
  | 'summary';

export type DemoStepStatus = 'pending' | 'running' | 'done';

export interface DemoToolStep {
  id: string;
  runningLabel: string;
  doneLabel: string;
  status: DemoStepStatus;
}

export interface LiveShellState {
  view: 'home' | 'chat';
  popover: PopoverId;
  plusSubmenu: PlusSubmenu;
  planOn: boolean;
  askOn: boolean;
  fullAccessOn: boolean;
  selectedGroup: string | null;
  selectedModel: string;
  selectedQuickTag: string | null;
  composerText: string;
  sidebarCollapsed: boolean;
  groupExpanded: boolean;
  // 跑任务对话动效状态
  demoPrompt: string;
  demoSteps: DemoToolStep[];
  demoStepsCollapsed: boolean;
  streamedText: string;
  showFileCard: boolean;
  showArtifacts: boolean;
}
