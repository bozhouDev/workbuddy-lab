import type { PhaseIndex, PlusSubmenu, PopoverId } from './types';

export type LessonId =
  | 'interface'
  | 'settings'
  | 'groups'
  | 'memory'
  | 'personalization'
  | 'models-credits';

export interface LessonNavMeta {
  id: LessonId;
  code: string;
  chapter: string;
  title: string;
  guideUrl: string;
}

export const LESSON_CATALOG: readonly LessonNavMeta[] = [
  { id: 'interface', code: '0.4', chapter: '00 入门', title: '认识界面', guideUrl: '/features/basics/interface/' },
  { id: 'settings', code: '1.1', chapter: '01 开局设置', title: '系统设置', guideUrl: '/features/setup/settings/' },
  { id: 'groups', code: '1.2', chapter: '01 开局设置', title: '分组与文件夹', guideUrl: '/features/setup/groups/' },
  { id: 'memory', code: '1.3', chapter: '01 开局设置', title: '记忆与进化', guideUrl: '/features/setup/memory/' },
  { id: 'personalization', code: '1.4', chapter: '01 开局设置', title: '个性化：指令', guideUrl: '/features/setup/personalization/' },
  { id: 'models-credits', code: '1.5', chapter: '01 开局设置', title: '模型与积分', guideUrl: '/features/setup/models-credits/' },
];

export type SettingsTab = 'general' | 'memory' | 'personalization';

export type GuidedTargetId =
  | 'avatar'
  | 'avatarMenu.settings'
  | 'avatarMenu.memory'
  | 'settings.back'
  | 'settings.tab.general'
  | 'settings.tab.memory'
  | 'settings.tab.personalization'
  | 'settings.changePath'
  | 'settings.enableNotify'
  | 'settings.toggleCloudMemory'
  | 'settings.toggleLocalMemory'
  | 'settings.deleteBadMemory'
  | 'settings.editRules'
  | 'settings.fillRules'
  | 'settings.saveRules'
  | 'composer.group'
  | 'groupMenu.pickPractice'
  | 'composer.model'
  | 'modelMenu.pickFree'
  | 'composer.send';

export interface CloudMemoryItem {
  id: string;
  text: string;
  tag: string;
  bad?: boolean;
}

export interface ChatRunArtifact {
  file: string;
  pathLabel: string;
  badge: string;
  badgeTone: 'ok' | 'warn';
  title: string;
  lines: Array<{ text: string; tone?: 'plain' | 'warn' | 'ok' }>;
}

export interface ChatRunSpec {
  prompt: string;
  chatTitle: string;
  model: string;
  estimateText: string; // 如 "0.8 ~ 12.50"
  consumedText: string; // 如 "8.64"
  consumedDelta: number; // 从模拟积分余额扣除的数额
  footerTip: string;
  elapsed: string;
  memoryBadge?: string;
  steps: Array<{ running: string; done: string }>;
  replyHtml: string; // 支持 {{wrong:...}} 和 {{ok:...}} 行内语义标色
  fileCard?: { name: string; meta: string; warn?: boolean };
  artifact?: ChatRunArtifact;
}

export interface GuidedShellState {
  view: 'home' | 'chat' | 'settings';
  settingsTab: SettingsTab;
  popover: PopoverId;
  plusSubmenu: PlusSubmenu;
  sidebarCollapsed: boolean;
  // 1.1 系统设置
  storagePath: string;
  storageMoved: boolean;
  notifyEnabled: boolean;
  autoUpdateSkill: boolean;
  lockScreenMode: string;
  // 1.2 分组
  selectedGroup: string | null;
  // 1.3 记忆与进化
  cloudMemoryOn: boolean;
  localMemoryOn: boolean;
  cloudMemories: CloudMemoryItem[];
  // 1.4 个性化：指令
  rulesEditing: boolean;
  rulesFilled: boolean;
  rulesSaved: boolean;
  rulesList: string[];
  // 1.5 模型与积分
  selectedModel: string;
  creditBalance: number;
  // 输入框与对话动效
  composerText: string;
  activeChat: ChatRunSpec | null;
  chatPhase: 'idle' | 'steps' | 'streaming' | 'done';
  chatStepIndex: number;
  streamedCharCount: number;
  showArtifacts: boolean;
}

export type CoachCardSpec =
  | {
      kind: 'doc';
      title: string;
      badge: string;
      badgeTone?: 'plain' | 'warn' | 'ok';
      lines: string[];
    }
  | {
      kind: 'compare';
      title: string;
      leftLabel: string;
      leftTone?: 'warn' | 'plain';
      leftHtml: string;
      rightLabel: string;
      rightTone?: 'ok' | 'plain';
      rightHtml: string;
    }
  | {
      kind: 'credits';
      title: string;
      rows: Array<{ model: string; rate: string; cost: string; note: string; highlight?: 'warn' | 'ok' }>;
    }
  | {
      kind: 'table';
      title: string;
      headers: string[];
      rows: string[][];
    };

export interface GuidedStep {
  id: string;
  phase: PhaseIndex;
  say: string[];
  card?: CoachCardSpec;
  after?: string[];
  wait?: {
    target: GuidedTargetId;
    callout: string;
    label: string;
  };
  onEnter?: (s: GuidedShellState) => Partial<GuidedShellState>;
  onAction?: (s: GuidedShellState) => Partial<GuidedShellState>;
  runChat?: (s: GuidedShellState) => ChatRunSpec;
  buttons?: Array<{
    label: string;
    primary?: boolean;
    nextLesson?: LessonId;
    restart?: boolean;
    href?: string;
  }>;
}

export interface GuidedLessonDef {
  id: Exclude<LessonId, 'interface'>;
  code: string;
  title: string;
  guideUrl: string;
  initialState: () => GuidedShellState;
  steps: GuidedStep[];
}
