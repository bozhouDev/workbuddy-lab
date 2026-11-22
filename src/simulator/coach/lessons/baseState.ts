import type { GuidedShellState } from '../guidedTypes';

export function createBaseGuidedState(
  overrides: Partial<GuidedShellState> = {}
): GuidedShellState {
  return {
    view: 'home',
    settingsTab: 'general',
    popover: null,
    plusSubmenu: 'mode',
    sidebarCollapsed: false,
    storagePath: 'C:\\Users\\Administrator\\WorkBuddy',
    storageMoved: false,
    notifyEnabled: false,
    autoUpdateSkill: true,
    lockScreenMode: '关闭',
    selectedGroup: null,
    practiceGroupBound: true,
    folderPickerOpen: false,
    cloudMemoryOn: true,
    localMemoryOn: true,
    cloudMemories: [
      { id: 'm1', tag: '工作习惯', text: '汇报表格第一列放日期，结论控制在 3 条以内' },
      { id: 'm2', tag: '工具环境', text: '平时使用 Mac 与飞书，输出优先 Markdown' },
    ],
    rulesEditing: false,
    rulesFilled: false,
    rulesSaved: false,
    rulesList: [],
    selectedModel: 'Hy4 flash',
    creditBalance: 1200,
    planOn: false,
    askOn: false,
    fullAccessOn: false,
    mentionMenuOpen: false,
    followupText: '',
    composerText: '',
    activeChat: null,
    chatHistory: [],
    marksRevealed: true,
    chatPhase: 'idle',
    chatStepIndex: 0,
    streamedCharCount: 0,
    showArtifacts: false,
    ...overrides,
  };
}
