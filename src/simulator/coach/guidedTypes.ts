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
  | 'revise'
  | 'choose'
  | 'experts'
  | 'skills'
  | 'make-skill'
  | 'connectors'
  | 'custom-connector'
  | 'library'
  | 'schedule'
  | 'assistant';

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
  { id: 'choose', code: '3.1', chapter: '03 能力扩展', title: '怎么选：专家 / 技能 / 连接器', guideUrl: '/features/extend/choose/' },
  { id: 'experts', code: '3.2', chapter: '03 能力扩展', title: '专家', guideUrl: '/features/extend/experts/' },
  { id: 'skills', code: '3.3', chapter: '03 能力扩展', title: '技能：找、看懂、装、用', guideUrl: '/features/extend/skills/' },
  { id: 'make-skill', code: '3.4', chapter: '03 能力扩展', title: '做一个自己的技能', guideUrl: '/features/extend/make-skill/' },
  { id: 'connectors', code: '3.5', chapter: '03 能力扩展', title: '连接器：接飞书', guideUrl: '/features/extend/connectors/' },
  { id: 'custom-connector', code: '3.6', chapter: '03 能力扩展', title: '自定义连接器：做一个自己的 MCP', guideUrl: '/features/extend/custom-connector/' },
  { id: 'library', code: '3.7', chapter: '03 能力扩展', title: '资料库', guideUrl: '/features/extend/library/' },
  { id: 'schedule', code: '4.1', chapter: '04 自动化', title: '定时任务：建一个，看结果', guideUrl: '/features/automation/schedule/' },
  { id: 'assistant', code: '4.2', chapter: '04 自动化', title: '助理：手机遥控电脑', guideUrl: '/features/automation/assistant/' },
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
  | 'chat.followupSend'
  // 第 3、4 章：侧栏入口与输入框扩展
  | 'nav.extensions'
  | 'nav.schedule'
  | 'nav.library'
  | 'nav.mobileLink'
  | 'composer.slash'
  | 'slashMenu.pick'
  | 'chat.actionCard'
  // 专家·技能·连接器页（顶部三个标签）
  | 'ext.tab.experts'
  | 'ext.tab.skills'
  | 'ext.tab.connectors'
  // 专家
  | 'experts.search'
  | 'experts.card'
  | 'experts.summon'
  // 技能
  | 'skills.statUse'
  | 'skills.statInstall'
  | 'skills.tab.skillhub'
  | 'skills.statDownload'
  | 'skills.search'
  | 'skills.pickCard'
  | 'skills.install'
  | 'skills.installConfirm'
  | 'skills.addMenu'
  | 'skills.addMenu.create'
  | 'skills.installed'
  // 连接器
  | 'connectors.add'
  | 'connectors.card'
  | 'connectors.custom'
  | 'mcp.fill'
  | 'mcp.submit'
  | 'mcp.trust'
  // 资料库
  | 'library.newCategory'
  | 'library.upload'
  // 定时任务
  | 'schedule.newMenu'
  | 'schedule.fromChat'
  | 'schedule.openTask'
  | 'schedule.permFull'
  | 'schedule.run'
  | 'schedule.save'
  | 'schedule.fastForward'
  | 'schedule.viewRecords'
  | 'schedule.recordDetail'
  // 助理（手机遥控）
  | 'mobile.toggle'
  | 'phone.modeComputer'
  | 'phone.send';

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
  /** 用户消息上方挂着的胶囊（专家 / 技能 / 连接器） */
  promptChips?: ComposerChip[];
  /** 回复末尾的操作卡片（如「已创建定时任务 · 去查看」「扫码授权」），按钮可作为等待目标 */
  actionCard?: {
    icon: string;
    title: string;
    meta: string;
    buttonLabel: string;
    tone?: 'ok' | 'warn' | 'plain';
  };
}

/** 输入框里挂着的胶囊（召唤的专家 / 选中的技能 / 指定的连接器） */
export interface ComposerChip {
  kind: 'expert' | 'skill' | 'connector';
  label: string;
}

/** 专家·技能·连接器页顶部的三个标签 */
export type ExtTab = 'experts' | 'skills' | 'connectors';

/** 一条定时任务（对照 5.11.3 定时任务卡片与编辑弹窗） */
export interface ScheduledTask {
  id: string;
  name: string;
  prompt: string;
  /** 卡片底部的频率文案，如「每天 08:30」 */
  freq: string;
  on: boolean;
  /** 执行权限：免确认执行 / 需逐次确认 */
  permission: 'full' | 'confirm';
  nextRun: string;
}

/** 一条运行记录（对照「运行记录」表：任务名称 / 状态 / 运行时间 / 操作） */
export interface ScheduleRecord {
  id: string;
  nth: number;
  taskName: string;
  status: 'success' | 'catchup' | 'failed';
  /** 状态列显示的文字 */
  statusText: string;
  time: string;
  /** 补充说明（如「已错过计划时间，将补跑一次」） */
  note?: string;
  artifactFile?: string;
  summary?: string;
  artifactLines?: string[];
}

/** 手机模拟面板里的一条消息 */
export interface PhoneMessage {
  from: 'me' | 'bot';
  text: string;
  tone?: 'warn' | 'ok';
}

export interface GuidedShellState {
  view: 'home' | 'chat' | 'settings' | 'extensions' | 'schedule' | 'library';
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
  // ===== 第 3 章：专家·技能·连接器 =====
  extTab: ExtTab;
  /** 输入框里挂着的胶囊 */
  composerChips: ComposerChip[];
  /** 输入框的 / 技能菜单 */
  slashMenuOpen: boolean;
  /** 顶部轻提示（如「已成功召唤专家」） */
  toast: string | null;
  expertSearch: string;
  expertDetailId: string | null;
  skillTab: 'recommend' | 'skillhub' | 'plugins';
  skillSearch: string;
  /** 当前亮起的计数提示，如 'use' / 'install' / 'download' */
  statTip: 'use' | 'install' | 'download' | null;
  skillDetailId: string | null;
  skillInstallConfirmOpen: boolean;
  /** 从市场装上的技能 id */
  installedSkillIds: string[];
  /** 自己做的技能名（「已安装 · 用户自定义」分组） */
  customSkills: string[];
  addSkillMenuOpen: boolean;
  /** 是否打开「已安装」列表 */
  installedPanelOpen: boolean;
  connectedIds: string[];
  connectorDetailId: string | null;
  mcpFormOpen: boolean;
  mcpFormFilled: boolean;
  /** 自定义 MCP：trusted 为 false 时条目里显示「信任 / 拒绝」 */
  customConnectors: Array<{ name: string; tools: string; trusted: boolean }>;
  // ===== 3.7 资料库 =====
  libraryCategories: string[];
  libraryFiles: Array<{ name: string; category: string }>;
  // ===== 4.1 定时任务 =====
  scheduleTab: 'tasks' | 'records';
  scheduleNewMenuOpen: boolean;
  scheduledTasks: ScheduledTask[];
  scheduleModalOpen: boolean;
  scheduleTestRan: boolean;
  scheduleRecords: ScheduleRecord[];
  scheduleRecordDetailId: string | null;
  // ===== 4.2 助理 =====
  mobileLinkOn: boolean;
  phonePanelOpen: boolean;
  phoneMode: 'cloud' | 'computer';
  phoneMessages: PhoneMessage[];
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
