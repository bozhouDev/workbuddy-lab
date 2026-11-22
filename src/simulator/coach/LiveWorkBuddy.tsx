import {
  AssistantIcon,
  BellIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  CopyIcon,
  DiscoverIcon,
  ExtensionsIcon,
  FilterIcon,
  FolderIcon,
  LibraryIcon,
  MicIcon,
  MobileLinkIcon,
  ModelDotIcon,
  NewTaskIcon,
  PanelLeftIcon,
  PanelRightIcon,
  RefreshIcon,
  ScheduleIcon,
  SearchIcon,
  SendPlaneIcon,
  ShareIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  SparkleIcon,
} from '../shell/icons';
import { DEFAULT_SUGGESTIONS, DEMO_ARTIFACT_LINES, TAG_SUGGESTIONS } from './explain';
import { ExploreDot, GuidanceCallout } from './GuidanceCue';
import {
  AvatarMenuPopover,
  DiscoverAppsPopover,
  DiscoverMenuPopover,
  LiveGroupPopover,
  LiveModelPopover,
  LivePermissionPopover,
  LivePlusPopover,
} from './Popovers5113';
import type { AreaId, CoachActionId, LiveShellState, PlusSubmenu } from './types';

interface LiveWorkBuddyProps {
  shell: LiveShellState;
  primaryTarget: CoachActionId | null;
  primaryCallout: string | null;
  urgent: boolean;
  showExploreDots: boolean;
  exploredAreas: Set<AreaId>;
  onAction: (action: CoachActionId, detail?: string) => void;
  onToggleSidebar: () => void;
  onClosePopover: () => void;
  onSelectPlusSubmenu: (sub: PlusSubmenu) => void;
  onTogglePlan: () => void;
  onToggleAsk: () => void;
  onToggleFullAccess: () => void;
  onSelectGroup: (group: string) => void;
  onSelectModel: (model: string) => void;
}

const QUICK_TAGS = [
  '创作文档',
  '分析数据',
  '代码开发',
  'UI/UX',
  '生图生视频',
  '金融服务',
  '制作PPT',
];

export function LiveWorkBuddy({
  shell,
  primaryTarget,
  primaryCallout,
  urgent,
  showExploreDots,
  exploredAreas,
  onAction,
  onToggleSidebar,
  onClosePopover,
  onSelectPlusSubmenu,
  onTogglePlan,
  onToggleAsk,
  onToggleFullAccess,
  onSelectGroup,
  onSelectModel,
}: LiveWorkBuddyProps) {
  const ringFor = (act: CoachActionId) => {
    if (primaryTarget !== act) return '';
    return urgent ? 'sim-ring-urgent' : 'sim-ring';
  };

  const dotFor = (area: AreaId, primaryAct: CoachActionId) =>
    showExploreDots && !exploredAreas.has(area) && primaryTarget !== primaryAct;

  const isPlusOpen = shell.popover === 'plus';
  const isGroupOpen = shell.popover === 'group';
  const isPermOpen = shell.popover === 'permission';
  const isModelOpen = shell.popover === 'model';
  const hasText = shell.composerText.trim().length > 0;
  const hasQuickTag = Boolean(shell.selectedQuickTag);
  const activeModeLabel = shell.planOn ? '计划 Plan' : shell.askOn ? '仅问答 Ask' : null;
  const activeSuggestions =
    (shell.selectedQuickTag && TAG_SUGGESTIONS[shell.selectedQuickTag]) || DEFAULT_SUGGESTIONS;

  return (
    <div
      className="relative flex-1 min-w-0 h-full flex rounded-[16px] border border-gray-200 bg-white overflow-hidden shadow-[0_12px_36px_-18px_rgba(17,19,24,0.16)] select-none"
      onClick={() => {
        if (shell.popover) onClosePopover();
      }}
    >
      {/* 侧栏顶部的全局弹出层 */}
      {shell.popover === 'discoverApps' && (
        <div onClick={(e) => e.stopPropagation()}>
          <DiscoverAppsPopover onClose={onClosePopover} />
        </div>
      )}
      {shell.popover === 'discover' && (
        <div onClick={(e) => e.stopPropagation()}>
          <DiscoverMenuPopover onClose={onClosePopover} />
        </div>
      )}
      {shell.popover === 'avatar' && (
        <div onClick={(e) => e.stopPropagation()}>
          <AvatarMenuPopover onClose={onClosePopover} />
        </div>
      )}

      {/* ===== 左侧栏（5.11.3 高还原，支持窄屏自动/手动折叠） ===== */}
      <aside
        className={`shrink-0 bg-[#f7f7f7] border-r border-[#ebebeb] flex flex-col text-[13px] transition-[width] duration-200 ${
          shell.sidebarCollapsed ? 'w-[58px]' : 'w-[206px] xl:w-[232px]'
        }`}
      >
        {/* 顶行：macOS 三圆点 + 折叠/搜索/筛选 */}
        <div className="h-10 px-3 flex items-center justify-between">
          {!shell.sidebarCollapsed && (
            <div className="flex items-center gap-[6px]" aria-hidden="true">
              <span className="w-[11px] h-[11px] rounded-full bg-[#ff5f57] border border-black/5" />
              <span className="w-[11px] h-[11px] rounded-full bg-[#febc2e] border border-black/5" />
              <span className="w-[11px] h-[11px] rounded-full bg-[#28c840] border border-black/5" />
            </div>
          )}
          <div className="flex items-center gap-2 text-[#5c5f66] ml-auto">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSidebar();
              }}
              title={shell.sidebarCollapsed ? '展开侧栏' : '收起侧栏'}
              className="w-6 h-6 rounded-md border-0 bg-transparent hover:bg-[#eaeae8] inline-flex items-center justify-center text-[#5c5f66] cursor-pointer"
            >
              <PanelLeftIcon size={15} />
            </button>
            {!shell.sidebarCollapsed && (
              <>
                <span className="w-6 h-6 inline-flex items-center justify-center">
                  <SearchIcon size={14} />
                </span>
                <span className="w-6 h-6 inline-flex items-center justify-center">
                  <FilterIcon size={14} />
                </span>
              </>
            )}
          </div>
        </div>

        {/* 品牌行：WorkBuddy 5.11.3·模拟 + 发现应用 */}
        {!shell.sidebarCollapsed && (
          <div className="px-3 pt-0.5 pb-2.5 flex items-center justify-between gap-1">
            <div className="flex items-baseline gap-1 min-w-0">
              <span className="font-bold text-[13.5px] tracking-[-0.02em] text-[#111318] whitespace-nowrap">
                WorkBuddy
              </span>
              <span className="text-[10px] text-[#8c9099] font-mono whitespace-nowrap">5.11.3·模拟</span>
            </div>
            <button
              type="button"
              data-coach-act="discoverApps"
              onClick={(e) => {
                e.stopPropagation();
                onAction('discoverApps');
              }}
              className={`relative border-0 inline-flex items-center gap-0.5 text-[10.5px] text-[#5c5f66] bg-[#efefef] hover:bg-[#e5e5e2] rounded-full px-1.5 py-[2.5px] shrink-0 whitespace-nowrap cursor-pointer transition-colors ${ringFor(
                'discoverApps'
              )}`}
            >
              <span>发现应用</span>
              <ChevronDownIcon size={9} />
              {dotFor('nav', 'discoverApps') && <ExploreDot />}
              {primaryTarget === 'discoverApps' && primaryCallout && (
                <GuidanceCallout text={primaryCallout} placement="right" />
              )}
            </button>
          </div>
        )}

        {/* 主导航 6 项 */}
        <div className="px-2 flex flex-col gap-0.5">
          {(
            [
              { act: 'newTask', label: '新建任务', icon: <NewTaskIcon size={16} />, active: shell.view === 'home' },
              { act: 'assistant', label: '助理', badge: 'BETA', icon: <AssistantIcon size={16} /> },
              { act: 'extensions', label: '专家·技能·连接器', icon: <ExtensionsIcon size={16} /> },
              { act: 'schedule', label: '定时任务', icon: <ScheduleIcon size={16} /> },
              { act: 'library', label: '资料库', icon: <LibraryIcon size={16} /> },
              { act: 'discover', label: '发现', icon: <DiscoverIcon size={16} />, active: shell.popover === 'discover' },
            ] as const
          ).map((item) => (
            <button
              key={item.act}
              type="button"
              data-coach-act={item.act}
              onClick={(e) => {
                e.stopPropagation();
                onAction(item.act);
              }}
              title={item.label}
              className={`relative w-full border-0 flex items-center ${
                shell.sidebarCollapsed ? 'justify-center px-0' : 'gap-2.5 px-2.5'
              } py-[7px] rounded-lg text-left cursor-pointer transition-colors ${
                'active' in item && item.active
                  ? 'bg-[#eaeae8] font-medium text-[#111318]'
                  : 'bg-transparent text-[#2b2f36] hover:bg-[#efefef]'
              } ${ringFor(item.act)}`}
            >
              <span className="shrink-0">{item.icon}</span>
              {!shell.sidebarCollapsed && (
                <>
                  <span className="truncate">{item.label}</span>
                  {'badge' in item && item.badge && (
                    <span className="text-[9.5px] leading-none text-[#8c9099] border border-[#dadad7] rounded-full px-1.5 py-[2px]">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
        </div>

        {/* 最近与分组（历史记录 + 项目分组，支持点击展开查看分组下对话） */}
        {!shell.sidebarCollapsed && (
          <div className="mt-4 px-2 flex flex-col gap-0.5 overflow-y-auto flex-1">
            <div className="px-2.5 pt-2 pb-1 text-[11px] text-[#8c9099] flex items-center justify-between">
              <span>最近</span>
              {dotFor('historyGroups', 'recent') && <ExploreDot />}
            </div>
            <button
              type="button"
              data-coach-act="recent"
              onClick={(e) => {
                e.stopPropagation();
                onAction('recent');
              }}
              className={`relative w-full border-0 text-left px-2.5 py-1.5 rounded-lg text-[12.5px] cursor-pointer transition-colors ${
                shell.view === 'chat'
                  ? 'bg-[#eaeae8] text-[#111318] font-medium'
                  : 'bg-transparent text-[#4a4f57] hover:bg-[#efefef]'
              } ${ringFor('recent')}`}
            >
              <span className="block truncate">
                {shell.view === 'chat' ? 'WorkBuddy 新手 3 步上手清单' : '整理 11 月周报'}
              </span>
              {primaryTarget === 'recent' && primaryCallout && (
                <GuidanceCallout text={primaryCallout} placement="right" />
              )}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAction('recent');
              }}
              className="w-full border-0 bg-transparent hover:bg-[#efefef] text-left px-2.5 py-1.5 rounded-lg text-[12.5px] text-[#6b7079] truncate cursor-pointer transition-colors"
            >
              周末读书会群聊整理
            </button>

            <div className="px-2.5 pt-3.5 pb-1 text-[11px] text-[#8c9099]">分组</div>
            <button
              type="button"
              data-coach-act="groupsList"
              onClick={(e) => {
                e.stopPropagation();
                onAction('groupsList');
              }}
              className={`relative w-full border-0 bg-transparent hover:bg-[#efefef] px-2.5 py-1.5 rounded-lg text-[12.5px] text-[#4a4f57] flex items-center justify-between gap-2 cursor-pointer transition-colors ${ringFor(
                'groupsList'
              )}`}
            >
              <span className="flex items-center gap-2 min-w-0">
                <FolderIcon size={14} className="text-[#6b7079] shrink-0" />
                <span className="truncate font-medium text-[#2b2f36]">
                  {shell.selectedGroup || 'WorkBuddy-练习'}
                </span>
              </span>
              {shell.groupExpanded ? (
                <ChevronDownIcon size={11} className="text-[#8c9099] shrink-0" />
              ) : (
                <ChevronRightIcon size={11} className="text-[#8c9099] shrink-0" />
              )}
            </button>
            {shell.groupExpanded && (
              <div className="sim-pop-down pl-6 pr-2 py-1 flex flex-col gap-0.5 text-[12px] text-[#6b7079]">
                <div className="px-2 py-1 rounded-md bg-[#f0f0ee] text-[#2b2f36] truncate">
                  整理 11 月周报
                </div>
                <div className="px-2 py-1 rounded-md truncate">周末读书会群聊整理</div>
              </div>
            )}
          </div>
        )}

        {shell.sidebarCollapsed && <div className="flex-1" />}

        {/* 左下角：头像 + 通知铃铛 + 手机互联 */}
        <div
          className={`px-2.5 py-2.5 border-t border-[#ebebeb] flex items-center ${
            shell.sidebarCollapsed ? 'justify-center' : 'justify-between'
          } text-[#5c5f66]`}
        >
          <button
            type="button"
            data-coach-act="avatar"
            onClick={(e) => {
              e.stopPropagation();
              onAction('avatar');
            }}
            className={`relative border-0 bg-transparent hover:bg-[#eaeae8] rounded-lg px-1.5 py-1 flex items-center gap-2 cursor-pointer transition-colors ${ringFor(
              'avatar'
            )}`}
          >
            <span className="w-6 h-6 rounded-full bg-[#e3e7f3] text-[#3355e0] text-[11px] font-semibold flex items-center justify-center shrink-0">
              学
            </span>
            {!shell.sidebarCollapsed && (
              <span className="text-[13px] font-medium text-[#1f2329]">学员</span>
            )}
            {dotFor('avatar', 'avatar') && <ExploreDot />}
            {primaryTarget === 'avatar' && primaryCallout && (
              <GuidanceCallout text={primaryCallout} placement="top" align="start" />
            )}
          </button>

          {!shell.sidebarCollapsed && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                data-coach-act="notify"
                onClick={(e) => {
                  e.stopPropagation();
                  onAction('notify');
                }}
                title="通知"
                className="w-7 h-7 rounded-md border-0 bg-transparent hover:bg-[#eaeae8] inline-flex items-center justify-center text-[#5c5f66] cursor-pointer"
              >
                <BellIcon size={15} />
              </button>
              <button
                type="button"
                data-coach-act="mobileConnect"
                onClick={(e) => {
                  e.stopPropagation();
                  onAction('mobileConnect');
                }}
                title="连接手机端"
                className="w-7 h-7 rounded-md border-0 bg-transparent hover:bg-[#eaeae8] inline-flex items-center justify-center text-[#5c5f66] cursor-pointer"
              >
                <MobileLinkIcon size={15} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ===== 右侧主工作区：首页 OR 真实动效对话+产物预览 ===== */}
      {shell.view === 'home' ? (
        <div className="flex-1 min-w-0 relative flex flex-col items-center justify-center px-6 xl:px-10 pb-8 bg-white overflow-y-auto">
          <div className="absolute right-4 top-3 text-[#6b7079]">
            <PanelRightIcon size={16} />
          </div>

          <h1 className="m-0 mb-5 text-[26px] xl:text-[28px] font-bold tracking-[-0.02em] text-[#111318]">
            WorkBuddy，我帮你
          </h1>

          {/* 快捷场景标签行（真机单行布局 + 选中变纯黑底白字 + 右端渐隐与 > 按钮） */}
          <div
            data-coach-act="quickTags"
            className={`relative flex items-center gap-1.5 mb-4 max-w-[650px] w-full rounded-2xl p-1 ${ringFor(
              'quickTags'
            )}`}
          >
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pr-1">
              {QUICK_TAGS.map((tag) => {
                const active = shell.selectedQuickTag === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    aria-pressed={active}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction('quickTags', tag);
                    }}
                    className={`px-3 py-1.5 rounded-full border text-[12px] whitespace-nowrap shrink-0 cursor-pointer transition-all duration-150 active:scale-[0.96] ${
                      active
                        ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white font-medium shadow-xs'
                        : 'border-[#ebebeb] bg-[#fafafa] text-[#3a3e45] hover:border-[#d5d5d0] hover:bg-white'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
            <span
              aria-hidden="true"
              className="w-6 h-6 rounded-full border border-[#ebebeb] bg-white inline-flex items-center justify-center text-[#6b7079] text-[13px] shrink-0"
            >
              ›
            </span>
            {dotFor('quickTags', 'quickTags') && (
              <span className="ml-0.5">
                <ExploreDot />
              </span>
            )}
            {primaryTarget === 'quickTags' && primaryCallout && (
              <GuidanceCallout text={primaryCallout} placement="top" />
            )}
          </div>

          {/* 5.11.3 双层复合底座输入框 */}
          <div
            className="relative w-full max-w-[650px]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 向上弹出的真机菜单们 */}
            {isPlusOpen && (
              <LivePlusPopover
                submenu={shell.plusSubmenu}
                planOn={shell.planOn}
                askOn={shell.askOn}
                hasGroup={Boolean(shell.selectedGroup)}
                onSelectSubmenu={onSelectPlusSubmenu}
                onTogglePlan={onTogglePlan}
                onToggleAsk={onToggleAsk}
              />
            )}
            {isGroupOpen && (
              <LiveGroupPopover
                selectedGroup={shell.selectedGroup}
                onSelectGroup={onSelectGroup}
              />
            )}
            {isPermOpen && (
              <LivePermissionPopover
                fullAccessOn={shell.fullAccessOn}
                onToggleFullAccess={onToggleFullAccess}
              />
            )}
            {isModelOpen && (
              <LiveModelPopover
                selectedModel={shell.selectedModel}
                onSelectModel={onSelectModel}
              />
            )}

            <div className="rounded-[22px] bg-[#f4f4f5] p-[1px]">
              {/* 上层白底输入卡 */}
              <div className="rounded-[20px] bg-white border border-[#e6e6e6] px-4 pt-3.5 pb-2.5 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
                <div className="min-h-[54px] text-[14.5px] leading-[1.65]">
                  {hasText ? (
                    <span className="text-[#111318]">{shell.composerText}</span>
                  ) : hasQuickTag ? (
                    <span className="text-[#b0b4bc] text-[13.5px]"></span>
                  ) : (
                    <span className="text-[#9ea3ad]">
                      今天帮你做些什么？@ 添加上下文，/调用技能与指令
                    </span>
                  )}
                </div>

                {/* 输入框底部工具行 */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      data-coach-act="plus"
                      aria-label={isPlusOpen ? '关闭 + 菜单' : '打开 + 菜单'}
                      onClick={() => onAction('plus')}
                      className={`relative w-8 h-8 rounded-lg border-0 inline-flex items-center justify-center text-[19px] leading-none cursor-pointer transition-all active:scale-[0.95] ${
                        isPlusOpen
                          ? 'bg-[#f0f0ee] text-[#111318]'
                          : 'bg-transparent text-[#2b2f36] hover:bg-[#f4f4f2]'
                      } ${ringFor('plus')}`}
                    >
                      {isPlusOpen ? '×' : '+'}
                      {dotFor('plus', 'plus') && (
                        <span className="absolute -right-0.5 -top-0.5">
                          <ExploreDot />
                        </span>
                      )}
                      {primaryTarget === 'plus' && primaryCallout && (
                        <GuidanceCallout text={primaryCallout} placement="top" />
                      )}
                    </button>

                    {hasQuickTag && (
                      <span
                        title={`已选场景：${shell.selectedQuickTag}`}
                        className="sim-pop-up inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#eef4ff] text-[#2563eb] text-[11.5px] font-medium"
                      >
                        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                          <path d="M3 9.5 6.5 13 13.5 4.5" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M3 5.5 6 8.5" stroke="#0ea5e9" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                        <span>{shell.selectedQuickTag}</span>
                      </span>
                    )}

                    {activeModeLabel && (
                      <span className="sim-pop-up inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-accent-50 border border-accent-200 text-accent-600 text-[12px] font-medium">
                        {activeModeLabel}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5 text-[12.5px] text-[#2b2f36]">
                    {hasText && (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-md text-[#4a4f57]">
                        <SparkleIcon size={15} />
                      </span>
                    )}

                    <button
                      type="button"
                      data-coach-act="model"
                      onClick={() => onAction('model')}
                      className={`border-0 inline-flex items-center gap-1.5 px-2 py-1 rounded-full font-medium cursor-pointer transition-colors ${
                        isModelOpen ? 'bg-[#f4f4f5]' : 'bg-transparent hover:bg-[#f4f4f5]'
                      }`}
                    >
                      <ModelDotIcon size={14} />
                      <span>{shell.selectedModel}</span>
                      {isModelOpen ? <ChevronUpIcon size={11} /> : <ChevronDownIcon size={11} />}
                    </button>

                    <button
                      type="button"
                      data-coach-act="voice"
                      onClick={() => onAction('voice')}
                      aria-label="语音输入"
                      className="border-0 bg-transparent hover:bg-[#f4f4f5] w-7 h-7 rounded-full inline-flex items-center justify-center text-[#3a3e45] cursor-pointer"
                    >
                      <MicIcon size={15} />
                    </button>

                    <button
                      type="button"
                      data-coach-act="send"
                      aria-label="发送"
                      onClick={() => onAction('send')}
                      className={`relative w-8 h-8 rounded-full border-0 inline-flex items-center justify-center text-white cursor-pointer transition-all active:scale-[0.93] ${
                        hasText || hasQuickTag ? 'bg-[#1a1a1a] hover:bg-[#333]' : 'bg-[#c9ccd1]'
                      } ${ringFor('send')}`}
                    >
                      <SendPlaneIcon size={14} />
                      {primaryTarget === 'send' && primaryCallout && (
                        <GuidanceCallout text={primaryCallout} placement="top" align="end" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* 下层灰底托盘：选择分组 + 默认权限 */}
              <div className="h-10 px-4 flex items-center gap-5 text-[12.5px]">
                <button
                  type="button"
                  data-coach-act="group"
                  onClick={() => onAction('group')}
                  className={`relative inline-flex items-center gap-1.5 border-0 bg-transparent px-1.5 py-1 -ml-1.5 rounded-lg cursor-pointer transition-colors ${
                    isGroupOpen || shell.selectedGroup
                      ? 'text-[#111318] font-medium hover:bg-black/5'
                      : 'text-[#5c5f66] hover:bg-black/5'
                  } ${ringFor('group')}`}
                >
                  <FolderIcon size={14} />
                  <span>{shell.selectedGroup ?? '选择分组'}</span>
                  {isGroupOpen ? <ChevronUpIcon size={11} /> : <ChevronDownIcon size={11} />}
                  {dotFor('group', 'group') && <ExploreDot />}
                  {primaryTarget === 'group' && primaryCallout && (
                    <GuidanceCallout text={primaryCallout} placement="bottom" />
                  )}
                </button>

                <button
                  type="button"
                  data-coach-act="permission"
                  onClick={() => onAction('permission')}
                  className={`relative inline-flex items-center gap-1.5 border-0 bg-transparent px-1.5 py-1 rounded-lg cursor-pointer transition-colors ${
                    shell.fullAccessOn
                      ? 'text-[#9a3412] font-semibold hover:bg-black/5'
                      : isPermOpen
                        ? 'text-[#111318] font-medium hover:bg-black/5'
                        : 'text-[#5c5f66] hover:bg-black/5'
                  } ${ringFor('permission')}`}
                >
                  {shell.fullAccessOn ? (
                    <ShieldAlertIcon size={14} className="text-[#a92b34]" />
                  ) : (
                    <ShieldCheckIcon size={14} />
                  )}
                  <span>{shell.fullAccessOn ? '允许完全访问' : '默认权限'}</span>
                  {isPermOpen ? <ChevronUpIcon size={11} /> : <ChevronDownIcon size={11} />}
                  {dotFor('permission', 'permission') && <ExploreDot />}
                  {primaryTarget === 'permission' && primaryCallout && (
                    <GuidanceCallout text={primaryCallout} placement="bottom" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 推荐问题胶囊（随上方快捷标签实时切换，带轻弹上浮动效） */}
          <div
            key={shell.selectedQuickTag || 'default-suggestions'}
            className="w-full max-w-[650px] mt-5 flex flex-col items-start gap-2 text-[12.5px] text-[#3a3e45]"
          >
            {activeSuggestions.map((q, idx) => (
              <button
                key={q}
                type="button"
                data-coach-act="suggestions"
                onClick={(e) => {
                  e.stopPropagation();
                  onAction('suggestions');
                }}
                style={{ animationDelay: `${idx * 40}ms` }}
                className="sim-msg-rise inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#ececea] bg-white hover:bg-[#fafaf9] cursor-pointer text-left transition-colors"
              >
                <span>{q}</span>
                <span className="text-[#8c9099] text-[11.5px]">↗</span>
              </button>
            ))}
          </div>

          <div className="absolute bottom-2.5 text-[11px] text-[#a0a4ad]">
            内容由 AI 生成，请核实重要信息
          </div>
        </div>
      ) : (
        /* ===== 对话视图 + 真实工具步进 + 流式吐字 + 滑入右侧产物区 ===== */
        <div className="flex-1 min-w-0 flex bg-white overflow-hidden">
          {/* 左侧对话流 */}
          <div className="flex-1 min-w-0 flex flex-col border-r border-[#ebebeb]">
            {/* 顶栏 */}
            <div className="h-12 shrink-0 px-5 flex items-center justify-between border-b border-[#f0f0ee]">
              <span className="text-[13.5px] font-semibold text-[#111318] truncate">
                WorkBuddy 新手 3 步上手清单
              </span>
              <div className="flex items-center gap-3 text-[#5c5f66]">
                <SearchIcon size={14} />
                <ShareIcon size={14} />
                <PanelRightIcon size={14} />
              </div>
            </div>

            {/* 对话消息流 */}
            <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
              {/* 用户消息气泡（弹入动效） */}
              <div className="sim-msg-rise self-end max-w-[85%] rounded-[16px] bg-[#f4f4f5] px-4 py-2.5 text-[13.5px] leading-[1.65] text-[#111318]">
                {shell.demoPrompt}
              </div>

              {/* WorkBuddy 回复区 */}
              <div className="sim-msg-rise flex flex-col gap-3 text-[13.5px] leading-[1.75] text-[#2b2f36]">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#1a1a1a] text-white text-[11px] font-bold inline-flex items-center justify-center">
                    W
                  </span>
                  <strong className="text-[#111318] font-semibold">WorkBuddy</strong>
                  <span className="text-[11px] text-[#6b7079] border border-[#e5e5e3] rounded-md px-1.5 py-[1px]">
                    默认模式
                  </span>
                </div>

                {/* 工具调用步进动画 -> 完成后折叠为「已完成 3s ›」 */}
                {!shell.demoStepsCollapsed ? (
                  <div className="rounded-[12px] border border-[#eeeeeb] bg-[#fafaf9] px-3.5 py-2.5 flex flex-col gap-2 text-[12.5px]">
                    {shell.demoSteps.map((st) => (
                      <div key={st.id} className="flex items-center gap-2">
                        {st.status === 'running' ? (
                          <span className="sim-spin w-3.5 h-3.5 rounded-full border-2 border-accent-600 border-t-transparent shrink-0" />
                        ) : st.status === 'done' ? (
                          <span className="sim-check-pop w-3.5 h-3.5 rounded-full bg-accent-600 text-white text-[9px] inline-flex items-center justify-center shrink-0">
                            ✓
                          </span>
                        ) : (
                          <span className="w-3.5 h-3.5 rounded-full border border-[#d6d6d2] shrink-0" />
                        )}
                        <span
                          className={
                            st.status === 'running'
                              ? 'text-[#111318] font-medium'
                              : st.status === 'done'
                                ? 'text-[#4a4f57]'
                                : 'text-[#9ea3ad]'
                          }
                        >
                          {st.status === 'done' ? st.doneLabel : st.runningLabel}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="sim-msg-rise inline-flex items-center gap-1 text-[12.5px] text-[#8c9099]">
                    <span>已完成 3s</span>
                    <ChevronRightIcon size={11} />
                  </div>
                )}

                {/* 流式输出正文 */}
                {shell.streamedText && (
                  <div className="text-[#1f2329]">
                    {shell.streamedText}
                    {!shell.showFileCard && (
                      <span className="inline-block w-[2px] h-[14px] bg-accent-600 align-middle ml-0.5 animate-pulse" />
                    )}
                  </div>
                )}

                {/* 横向产物文件卡片（滑入） */}
                {shell.showFileCard && (
                  <div className="sim-msg-rise flex flex-col gap-2.5">
                    <div className="flex items-center gap-2 text-[12.5px] text-[#4a4f57]">
                      <span>已写入文件：</span>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#eef6ff] text-[#2563eb] font-medium">
                        <span className="w-3.5 h-3.5 rounded bg-[#0ea5e9] text-[9px] text-white font-bold inline-flex items-center justify-center">
                          M
                        </span>
                        新手清单.md
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3 px-3.5 py-3 rounded-[14px] bg-[#f4f4f5] border border-[#ebebeb]">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-8 h-8 rounded-[9px] bg-[#0ea5e9] text-white text-[12px] font-bold inline-flex items-center justify-center shrink-0">
                          M
                        </span>
                        <div className="min-w-0">
                          <div className="font-semibold text-[13px] text-[#111318] truncate">
                            新手清单.md
                          </div>
                          <div className="text-[11.5px] text-[#8c9099]">385 B · WorkBuddy-练习</div>
                        </div>
                      </div>
                      <span className="h-7 px-2.5 rounded-lg bg-[#1a1a1a] text-white text-[11.5px] font-medium inline-flex items-center gap-1 shrink-0">
                        <ShareIcon size={11} />
                        分享
                      </span>
                    </div>

                    <div className="inline-flex items-center gap-1 text-[12.5px] text-[#4a4f57]">
                      <span>查看所有产物 (1)</span>
                      <ChevronRightIcon size={11} />
                    </div>

                    <div className="flex items-center gap-3 text-[#7a7f89] text-[12px]">
                      <CopyIcon size={13} />
                      <RefreshIcon size={13} />
                      <ShareIcon size={13} />
                      <span>•••</span>
                      <span className="inline-flex items-center gap-1 text-[#5c5f66]">
                        <ModelDotIcon size={12} />
                        <span>{shell.selectedModel}</span>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 底部紧凑输入框 */}
            <div className="shrink-0 px-5 pb-3.5 pt-2">
              <div className="rounded-[18px] bg-[#f4f4f5] p-[1px]">
                <div className="rounded-[16px] bg-white border border-[#e6e6e6] px-3.5 py-2.5 flex items-center justify-between text-[13px] text-[#9ea3ad]">
                  <span>继续输入修改要求…</span>
                  <span className="w-7 h-7 rounded-full bg-[#c9ccd1] text-white inline-flex items-center justify-center">
                    <SendPlaneIcon size={12} />
                  </span>
                </div>
                <div className="h-8 px-3.5 flex items-center gap-4 text-[11.5px] text-[#5c5f66]">
                  <span className="inline-flex items-center gap-1">
                    <FolderIcon size={12} />
                    WorkBuddy-练习
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <ShieldCheckIcon size={12} />
                    默认权限
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧产物预览区（浏览器式 Tab，平滑推入展开） */}
          {shell.showArtifacts && (
            <div className="sim-slide-in-panel w-[46%] max-w-[380px] min-w-[260px] shrink-0 flex flex-col bg-white">
              <div className="h-12 shrink-0 px-3 flex items-center justify-between border-b border-[#ebebeb] bg-[#fafafa]">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="h-8 px-2.5 rounded-lg bg-[#ececef] flex items-center gap-1.5 text-[12.5px] font-medium text-[#111318]">
                    <span className="w-4 h-4 rounded bg-[#0ea5e9] text-white text-[9px] font-bold inline-flex items-center justify-center shrink-0">
                      M
                    </span>
                    <span className="truncate">新手清单.md</span>
                    <span className="text-[#8c9099] ml-0.5">×</span>
                  </div>
                  <span className="w-6 h-6 inline-flex items-center justify-center text-[#6b7079]">+</span>
                </div>
                <PanelRightIcon size={14} className="text-[#6b7079]" />
              </div>

              <div className="h-10 shrink-0 px-4 flex items-center justify-between border-b border-[#f0f0ee] text-[12px]">
                <span className="flex items-center gap-1.5 text-[#2b2f36] font-medium truncate">
                  <span>新手清单.md</span>
                  <FolderIcon size={12} className="text-[#8c9099]" />
                  <span className="px-1.5 py-[1px] rounded bg-accent-50 text-accent-600 text-[10.5px] font-semibold">
                    刚生成
                  </span>
                </span>
                <span className="h-6 px-2.5 rounded-md bg-[#1a1a1a] text-white text-[11px] font-medium inline-flex items-center gap-1">
                  <ShareIcon size={11} />
                  分享
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 bg-[#fafaf9]">
                <div className="rounded-[12px] border border-[#ebebeb] bg-white p-4 flex flex-col gap-3">
                  <div className="text-[15px] font-bold text-[#111318]">WorkBuddy 新手 3 步上手清单</div>
                  {DEMO_ARTIFACT_LINES.map((item, idx) => (
                    <div
                      key={item.heading}
                      className="sim-msg-rise flex flex-col gap-0.5"
                      style={{ animationDelay: `${idx * 90}ms` }}
                    >
                      <div className="text-[13px] font-semibold text-[#111318]">{item.heading}</div>
                      <div className="text-[12.5px] leading-[1.7] text-[#4a4f57]">{item.body}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
