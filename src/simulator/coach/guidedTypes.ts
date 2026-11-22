import type { PhaseIndex, PlusSubmenu, PopoverId } from './types';

export type LessonId =
  | 'interface'
  | 'settings'
  | 'groups'
  | 'memory'
  | 'personalization'
  | 'models-credits'
  | 'attach'
  | 'mode'
  | 'permission'
  | 'task-brief'
  | 'execution'
  | 'review'
  | 'revise';

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
  { id: 'attach', code: '2.1', chapter: '02 发任务', title: '添加资料：+ 和 @', guideUrl: '/features/send-task/attach/' },
  { id: 'mode', code: '2.2', chapter: '02 发任务', title: '模式：默认 / Plan / Ask', guideUrl: '/features/send-task/mode/' },
  { id: 'permission', code: '2.3', chapter: '02 发任务', title: '权限与审批弹窗', guideUrl: '/features/send-task/permission/' },
  { id: 'task-brief', code: '2.4', chapter: '02 发任务', title: '写清任务：5 要素与采访法', guideUrl: '/features/send-task/task-brief/' },
  { id: 'execution', code: '2.5', chapter: '02 发任务', title: '看执行过程', guideUrl: '/features/send-task/execution/' },
  { id: 'review', code: '2.6', chapter: '02 发任务', title: '检查结果', guideUrl: '/features/send-task/review/' },
  { id: 'revise', code: '2.7', chapter: '02 发任务', title: '二次修改', guideUrl: '/features/send-task/revise/' },
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
  | 'composer.plus'
  | 'plusMenu.togglePlan'
  | 'plusMenu.toggleAsk'
  | 'composer.mention'
  | 'mentionMenu.pickChatLog'
  | 'composer.group'
  | 'groupMenu.pickPractice'
  | 'groupMenu.pickLocalFolder'
  | 'folderPicker.pickPractice'
  | 'composer.permission'
  | 'permMenu.toggleFullAccess'
  | 'composer.model'
  | 'modelMenu.pickFree'
  | 'composer.send'
  | 'approval.cancel'
  | 'approval.askPlain'
  | 'chat.confirmPlan'
  | 'chat.followupSend';

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

export interface ChatApprovalCard {
  question: string;
  confirmLabel: string;
  cancelLabel: string;
  askLabel: string;
}

export interface ChatRunSpec {
  id: string;
  prompt: string;
  chatTitle: string;
  model: string;
  estimateText: string; // 如 "0.8 ~ 12.50"
  consumedText: string; // 如 "8.64"
  consumedDelta: number; // 从模拟积分余额扣除的数额
  footerTip: string;
  elapsed: string;
  memoryBadge?: string;
  /** 为 true 时先按真实无标红效果吐字，等泊舟提问并揭示后再亮起橙/蓝标记 */
  hideMarksInitially?: boolean;
  steps: Array<{ running: string; done: string }>;
  replyHtml: string; // 支持 {{wrong:...}} 和 {{ok:...}} 行内语义标色与 Markdown 表格
  fileCard?: { name: string; meta: string; warn?: boolean };
  artifact?: ChatRunArtifact;
  /** 5.11.3 默认权限底部审批确认卡片（对照 01-默认权限审批弹窗.png） */
  approvalCard?: ChatApprovalCard;
  /** Plan 模式下展示方案确认按钮 */
  planConfirmLabel?: string;
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
  practiceGroupBound: boolean;
  folderPickerOpen: boolean;
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
  // 2.x 发任务（模式 / @ 引用 / 权限 / 对话内二次修改）
  planOn: boolean;
  askOn: boolean;
  fullAccessOn: boolean;
  mentionMenuOpen: boolean;
  followupText: string;
  // 输入框与对话动效
  composerText: string;
  activeChat: ChatRunSpec | null;
  /** 左侧「最近」列表保留全部运行过的对话，可随时点回去对比 */
  chatHistory: ChatRunSpec[];
  /** 是否在当前对话里亮出 {{wrong:}} / {{ok:}} 教学标记 */
  marksRevealed: boolean;
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
  /** 设为短标签（如「头像」「设置」「返回」）时，并入紧凑路径条而非刷屏发气泡 */
  navLabel?: string;
  /** 进入该步骤时是否点亮对话里的 {{wrong:}} / {{ok:}} 高亮标记 */
  revealMarksOnEnter?: boolean;
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
