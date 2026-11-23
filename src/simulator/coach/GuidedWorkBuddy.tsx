import { useEffect, useRef, useState } from 'react';
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
  ShieldCheckIcon,
  SparkleIcon,
} from '../shell/icons';
import { RichText } from '../shell/RichText';
import { AnimatedNumber } from './AnimatedNumber';
import { GuidanceCallout } from './GuidanceCue';
import { chipKindLabel, type GuidedShellState, type GuidedTargetId } from './guidedTypes';
import type { PopoverId } from './types';
import { SettingsViews5113 } from './SettingsViews5113';
import { ExtensionsViews5113 } from './ExtensionsViews5113';
import { ScheduleView5113 } from './ScheduleView5113';
import { LibraryPickerModal, LibraryView5113, MobileLinkPopover, PhonePanel } from './LibraryPhoneViews';
import { SLASH_SKILLS_BASE } from './extensionsData';
import { FIVE_PARTS_ITEMS, type FivePartsItem } from './fivePartsBrief';
import { FakeQr, LetterIcon } from './targetKit';

interface GuidedWorkBuddyProps {
  shell: GuidedShellState;
  waitTarget: GuidedTargetId | null;
  waitCallout: string | null;
  urgent: boolean;
  onTargetClick: (target: GuidedTargetId) => void;
  onToggleSidebar: () => void;
  onTogglePopover: (popover: PopoverId) => void;
  onClosePopover: () => void;
  onSelectHistoryChat: (chatId: string) => void;
  onNewTask: () => void;
  /** 回到当前步骤所在页面（学员中途逛走后用） */
  onBackToView: (view: GuidedShellState['view']) => void;
  onAsideClick: (label: string, explain: string) => void;
}

/**
 * 通用 5.11.3 高还原活界面（服务 1.1～1.5 全部陪练课）
 * 内含：首页 + 可自由点开的真菜单 + 可回看的「最近」历史会话 + 5.11.3 设置页 + 带「预计消耗 ✧ / 已消耗 ✧」真实积分明细的流式对话与右侧产物区
 */
export function GuidedWorkBuddy({
  shell,
  waitTarget,
  waitCallout,
  urgent,
  onTargetClick,
  onToggleSidebar,
  onTogglePopover,
  onClosePopover,
  onSelectHistoryChat,
  onNewTask,
  onBackToView,
  onAsideClick,
}: GuidedWorkBuddyProps) {
  // 不在首页、但下一步要点首页输入框的按钮时，提示学员先点「新建任务」回首页
  const isNeedBackToHome =
    shell.view !== 'home' && shell.view !== 'settings' && /^(composer|plusMenu)\./.test(waitTarget ?? '');
  const isWaitingMention = shell.view === 'home' && waitTarget === 'composer.mention';
  const isWaitingSlash = shell.view === 'home' && waitTarget === 'composer.slash';
  const isWaitingComposerKey = isWaitingMention || isWaitingSlash;
  const composerInputRef = useRef<HTMLTextAreaElement>(null);
  const [composerDraft, setComposerDraft] = useState(shell.composerText);
  const [wrongKeyHint, setWrongKeyHint] = useState(false);
  const [fivePartsFlyDone, setFivePartsFlyDone] = useState(false);

  useEffect(() => {
    setComposerDraft(shell.composerText);
    setWrongKeyHint(false);
  }, [shell.composerText, waitTarget]);

  useEffect(() => {
    if (shell.fivePartsCard !== 'flying') {
      setFivePartsFlyDone(false);
      return;
    }
    setFivePartsFlyDone(false);
    const id = window.setTimeout(() => setFivePartsFlyDone(true), 1020);
    return () => window.clearTimeout(id);
  }, [shell.fivePartsCard]);

  useEffect(() => {
    if (!isWaitingComposerKey) return;
    const el = composerInputRef.current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(0, 0);
  }, [isWaitingComposerKey, waitTarget]);
  // 第 3、4 章的三个侧栏入口：作为课程目标时可点进对应页面
  const navTargets: Record<string, GuidedTargetId> = {
    extensions: 'nav.extensions',
    schedule: 'nav.schedule',
    library: 'nav.library',
  };
  // 当前要点的目标在哪个页面上；学员不在那个页面时，高亮对应侧栏入口，点它回去
  const targetView: 'extensions' | 'schedule' | 'library' | null = !waitTarget
    ? null
    : /^(ext|skills|experts|connectors|mcp)\./.test(waitTarget)
      ? 'extensions'
      : waitTarget.startsWith('schedule.')
        ? 'schedule'
        : waitTarget.startsWith('library.')
          ? 'library'
          : null;
  const backToView = targetView && shell.view !== targetView ? targetView : null;
  /** 新视图共用的目标参数 */
  const kitProps = { waitTarget, waitCallout, urgent, onTargetClick, onAsideClick };
  // + 菜单要等学员点里面的「添加文件 / 资料库」时，菜单被点掉了就在 + 上亮圈，点它重新打开
  const plusNeedsReopen =
    (waitTarget === 'plusMenu.addFile' || waitTarget === 'plusMenu.library') && shell.popover !== 'plus';
  const ring = (id: GuidedTargetId) =>
    waitTarget === id || (id === 'composer.plus' && plusNeedsReopen) ? (urgent ? 'sim-ring-urgent' : 'sim-ring') : '';
  /** + 菜单右侧当前展开的是「添加文件」二级菜单 */
  const filesSub = shell.plusSubmenu === 'files';

  const handleOrAside = (
    id: GuidedTargetId,
    label: string,
    explain: string,
    freePopover?: PopoverId
  ) => {
    if (waitTarget === id) {
      onTargetClick(id);
      return;
    }
    // 非当前目标时依然让真菜单照常展开（对齐「哪里都能点」），同时由泊舟顺口大白话解释
    if (freePopover !== undefined) {
      onTogglePopover(freePopover);
    }
    onAsideClick(label, explain);
  };

  if (shell.view === 'settings') {
    return (
      <div className="relative flex-1 min-w-0 h-full flex rounded-[16px] border border-gray-200 bg-white overflow-hidden shadow-[0_12px_36px_-18px_rgba(17,19,24,0.16)]">
        <SettingsViews5113
          shell={shell}
          waitTarget={waitTarget}
          waitCallout={waitCallout}
          urgent={urgent}
          onTargetClick={onTargetClick}
          onAsideClick={onAsideClick}
        />
      </div>
    );
  }

  const hasText = shell.composerText.trim().length > 0;
  const chat = shell.activeChat;
  const isStreaming = shell.chatPhase === 'streaming';
  const isDone = shell.chatPhase === 'done';

  // 流式截取纯文本（保留 {{wrong:...}} / {{ok:...}} 完整标签不被半截切开）
  const renderedReply = chat
    ? isDone
      ? chat.replyHtml
      : chat.replyHtml.slice(0, shell.streamedCharCount)
    : '';

  return (
    <div
      className="relative flex-1 min-w-0 h-full flex rounded-[16px] border border-gray-200 bg-white overflow-hidden shadow-[0_12px_36px_-18px_rgba(17,19,24,0.16)] select-none"
      onClick={() => {
        if (shell.popover) onClosePopover();
      }}
    >
      {/* 头像向上弹出菜单（对照 CE3E149B，支持真点「设置」和「记忆与进化」） */}
      {shell.popover === 'avatar' && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="sim-pop-up absolute left-3 bottom-[52px] z-30 w-[264px] rounded-[16px] bg-[#f7f7f6] border border-[#e6e6e3] shadow-[0_18px_46px_rgba(17,19,24,0.18)] p-2 flex flex-col gap-2 text-[13px]"
        >
          <div className="rounded-[12px] bg-white px-3 py-2.5 flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-[#e3e7f3] text-[#3355e0] text-[13px] font-bold flex items-center justify-center">
              学
            </span>
            <span className="font-semibold text-[14px] text-[#111318]">学员（模拟账号）</span>
          </div>

          <div className="rounded-[12px] bg-white p-3 grid grid-cols-2 gap-2">
            <div>
              <div className="text-[11px] text-[#8c9099]">套餐</div>
              <div className="text-[14px] font-bold text-[#111318]">体验版 ›</div>
            </div>
            <div>
              <div className="text-[11px] text-[#8c9099]">积分余额</div>
              <div className="text-[14px] font-bold font-mono text-[#111318]">
                <AnimatedNumber value={shell.creditBalance} highlightDrop />
              </div>
            </div>
          </div>

          <div className="rounded-[12px] bg-white p-1.5 flex flex-col text-[13px] text-[#1f2329]">
            <div className="flex items-center justify-between px-2.5 py-1.5 text-[#5c5f66]">
              <span>Buddy加油站</span>
              <span className="text-[11px] text-[#8c9099]">领免费额度 ›</span>
            </div>
            <div className="flex items-center justify-between px-2.5 py-1.5 text-[#5c5f66]">
              <span>成长计划</span>
              <span className="text-[11px] text-[#8c9099]">新手福利 ›</span>
            </div>
            <div className="h-px bg-[#f0f0ee] my-1 mx-1" />
            <button
              type="button"
              data-guided-target="avatarMenu.settings"
              onClick={() =>
                handleOrAside(
                  'avatarMenu.settings',
                  '设置',
                  '点这里进入 WorkBuddy 设置（通用、个性化、记忆与进化都在里面）。'
                )
              }
              className={`relative w-full border-0 bg-transparent hover:bg-[#f4f4f2] flex items-center justify-between px-2.5 py-2 rounded-lg font-medium text-[#111318] cursor-pointer ${ring(
                'avatarMenu.settings'
              )}`}
            >
              <span>设置</span>
              <span className="font-mono text-[11px] text-[#8c9099]">⌘,</span>
              {waitTarget === 'avatarMenu.settings' && waitCallout && (
                <GuidanceCallout text={waitCallout} placement="right" />
              )}
            </button>
            <button
              type="button"
              data-guided-target="avatarMenu.memory"
              onClick={() =>
                handleOrAside(
                  'avatarMenu.memory',
                  '记忆与进化',
                  '直接进入云端记忆与本地记忆开关页。'
                )
              }
              className={`relative w-full border-0 bg-transparent hover:bg-[#f4f4f2] flex items-center justify-between px-2.5 py-2 rounded-lg font-medium text-[#111318] cursor-pointer ${ring(
                'avatarMenu.memory'
              )}`}
            >
              <span>记忆与进化</span>
              <span className="text-[#8c9099]">›</span>
              {waitTarget === 'avatarMenu.memory' && waitCallout && (
                <GuidanceCallout text={waitCallout} placement="right" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* 左侧栏（1280 宽下保持展开，还原真机观感） */}
      <aside
        className={`shrink-0 bg-[#f7f7f7] border-r border-[#ebebeb] flex flex-col text-[13px] transition-[width] duration-200 ${
          shell.sidebarCollapsed ? 'w-[58px]' : 'w-[204px] xl:w-[228px]'
        }`}
      >
        <div className="h-10 px-3 flex items-center justify-between">
          {!shell.sidebarCollapsed && (
            <div className="flex items-center gap-[6px]" aria-hidden="true">
              <span className="w-[11px] h-[11px] rounded-full bg-[#ff5f57]" />
              <span className="w-[11px] h-[11px] rounded-full bg-[#febc2e]" />
              <span className="w-[11px] h-[11px] rounded-full bg-[#28c840]" />
            </div>
          )}
          <div className="flex items-center gap-2 text-[#5c5f66] ml-auto">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSidebar();
              }}
              className="w-6 h-6 rounded-md border-0 bg-transparent hover:bg-[#eaeae8] inline-flex items-center justify-center cursor-pointer"
              aria-label="切换侧栏"
            >
              <PanelLeftIcon size={15} />
            </button>
            {!shell.sidebarCollapsed && (
              <>
                <SearchIcon size={14} />
                <FilterIcon size={14} />
              </>
            )}
          </div>
        </div>

        {!shell.sidebarCollapsed && (
          <div className="px-3 pt-0.5 pb-2.5 flex items-center justify-between gap-1">
            <div className="flex items-baseline gap-1 min-w-0">
              <span className="font-bold text-[13.5px] text-[#111318] whitespace-nowrap">WorkBuddy</span>
              <span className="text-[10px] text-[#8c9099] font-mono whitespace-nowrap">5.11.3·模拟</span>
            </div>
            <span className="inline-flex items-center gap-0.5 text-[10px] text-[#5c5f66] bg-[#efefef] rounded-full px-1.5 py-[2px] shrink-0">
              发现应用 ∨
            </span>
          </div>
        )}

        <div className="px-2 flex flex-col gap-0.5">
          {[
            { id: 'newTask', label: '新建任务', icon: <NewTaskIcon size={16} />, active: shell.view === 'home' },
            { id: 'assistant', label: '助理', badge: 'BETA', icon: <AssistantIcon size={16} /> },
            { id: 'extensions', label: '专家·技能·连接器', icon: <ExtensionsIcon size={16} />, active: shell.view === 'extensions' },
            { id: 'schedule', label: '定时任务', icon: <ScheduleIcon size={16} />, active: shell.view === 'schedule' },
            { id: 'library', label: '资料库', icon: <LibraryIcon size={16} />, active: shell.view === 'library' },
            { id: 'discover', label: '发现', icon: <DiscoverIcon size={16} /> },
          ].map((it) => {
            const highlightNewTask =
              (it.id === 'newTask' && isNeedBackToHome) || (backToView !== null && it.id === backToView);
            const navTarget = navTargets[it.id];
            const isNavTarget = Boolean(navTarget) && waitTarget === navTarget;
            return (
              <button
                key={it.label}
                type="button"
                // 侧栏折叠时只剩图标，靠 aria-label / title 告诉学员这是哪个入口
                aria-label={it.label}
                title={shell.sidebarCollapsed ? it.label : undefined}
                data-guided-target={navTarget}
                onClick={(e) => {
                  e.stopPropagation();
                  if (it.id === 'newTask') {
                    onNewTask();
                    return;
                  }
                  if (isNavTarget) {
                    onTargetClick(navTarget);
                    return;
                  }
                  if (backToView !== null && it.id === backToView) {
                    onBackToView(backToView);
                    return;
                  }
                  onAsideClick(it.label, `<b>${it.label}</b>这一步先不用点，跟着右边蓝圈步骤走就行。`);
                }}
                className={`relative w-full border-0 text-left flex items-center ${
                  shell.sidebarCollapsed ? 'justify-center' : 'gap-2.5 px-2.5'
                } py-[7px] rounded-lg cursor-pointer ${
                  it.active ? 'bg-[#eaeae8] font-medium text-[#111318]' : 'bg-transparent text-[#2b2f36] hover:bg-[#efefef]'
                } ${highlightNewTask ? 'sim-ring' : ''} ${isNavTarget ? ring(navTarget) : ''}`}
              >
                {it.icon}
                {!shell.sidebarCollapsed && (
                  <>
                    <span className="truncate">{it.label}</span>
                    {it.badge && (
                      <span className="text-[9.5px] text-[#8c9099] border border-[#dadad7] rounded-full px-1.5">
                        {it.badge}
                      </span>
                    )}
                  </>
                )}
                {highlightNewTask && (
                  <GuidanceCallout text="先点这里回到首页" placement="right" />
                )}
                {isNavTarget && waitCallout && <GuidanceCallout text={waitCallout} placement="right" />}
              </button>
            );
          })}
        </div>

        {!shell.sidebarCollapsed && (
          <div className="mt-4 px-2 flex flex-col gap-0.5 flex-1 overflow-y-auto">
            <div className="px-2.5 pt-2 pb-1 flex items-center justify-between text-[11px] text-[#8c9099]">
              <span>最近</span>
              {shell.chatHistory.length > 1 && (
                <span className="text-[10px] text-accent-600">点条目可回看对比</span>
              )}
            </div>
            {shell.chatHistory.length > 0 ? (
              shell.chatHistory.map((item) => {
                const isViewing = shell.view === 'chat' && chat?.id === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectHistoryChat(item.id);
                    }}
                    className={`w-full border-0 text-left px-2.5 py-1.5 rounded-lg text-[12.5px] truncate cursor-pointer transition-colors ${
                      isViewing
                        ? 'bg-[#e8e8e6] text-[#111318] font-medium'
                        : 'bg-transparent text-[#4a4f57] hover:bg-[#efefef]'
                    }`}
                    title={`点击回看：${item.chatTitle}`}
                  >
                    {item.chatTitle}
                  </button>
                );
              })
            ) : (
              <div className="px-2.5 py-1.5 rounded-lg text-[12.5px] text-[#8c9099] truncate">
                暂无历史任务
              </div>
            )}
            <div className="px-2.5 pt-3.5 pb-1 text-[11px] text-[#8c9099]">分组</div>
            {shell.practiceGroupBound ? (
              <div className="sim-msg-rise px-2.5 py-1.5 rounded-lg text-[12.5px] text-[#111318] font-medium flex items-center gap-2 bg-[#efefed]">
                <FolderIcon size={14} className="text-accent-600 shrink-0" />
                <span className="truncate">{shell.selectedGroup || 'WorkBuddy-练习'}</span>
              </div>
            ) : (
              <div className="px-2.5 py-1.5 rounded-lg text-[12px] text-[#9ea3ad]">
                暂未绑定本地文件夹
              </div>
            )}
          </div>
        )}

        {shell.sidebarCollapsed && <div className="flex-1" />}

        {/* 左下角：头像 + 实时模拟积分余额微标 */}
        <div
          className={`px-2.5 py-2.5 border-t border-[#ebebeb] flex items-center ${
            shell.sidebarCollapsed ? 'flex-col gap-1.5 justify-center' : 'justify-between'
          } text-[#5c5f66]`}
        >
          <button
            type="button"
            data-guided-target="avatar"
            onClick={(e) => {
              e.stopPropagation();
              handleOrAside(
                'avatar',
                '左下角头像',
                '点左下角头像可以查看积分余额、领免费额度，也能直接进<b>设置</b>和<b>记忆与进化</b>。',
                'avatar'
              );
            }}
            className={`relative border-0 bg-transparent hover:bg-[#eaeae8] rounded-lg px-1.5 py-1 flex items-center gap-2 cursor-pointer ${ring(
              'avatar'
            )}`}
          >
            <span className="w-6 h-6 rounded-full bg-[#e3e7f3] text-[#3355e0] text-[11px] font-semibold flex items-center justify-center shrink-0">
              学
            </span>
            {!shell.sidebarCollapsed && (
              <div className="text-left leading-tight">
                <div className="text-[12.5px] font-medium text-[#1f2329]">学员</div>
                <div className="text-[10.5px] font-mono text-[#6b7079]">
                  ✧ <AnimatedNumber value={shell.creditBalance} highlightDrop />
                </div>
              </div>
            )}
            {waitTarget === 'avatar' && waitCallout && (
              <GuidanceCallout text={waitCallout} placement="top" align="start" />
            )}
          </button>

          {/* 侧栏折叠时也保留手机入口：4.2 要点它，弹窗被点掉后也要能再打开 */}
          {(
            <div className="flex items-center gap-2">
              {!shell.sidebarCollapsed && <BellIcon size={15} />}
              <button
                type="button"
                data-guided-target="nav.mobileLink"
                aria-label="连接移动设备"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOrAside(
                    'nav.mobileLink',
                    '移动设备',
                    '这个小手机图标是连接手机的入口，打开「允许移动设备远程连接」后扫码就能在手机上派活。',
                    'mobile'
                  );
                }}
                className={`relative border-0 bg-transparent hover:bg-[#eaeae8] rounded-md p-0.5 inline-flex cursor-pointer text-[#5c5f66] ${ring('nav.mobileLink')}`}
              >
                <MobileLinkIcon size={15} />
                {waitTarget === 'nav.mobileLink' && waitCallout && (
                  <GuidanceCallout text={waitCallout} placement="top" align="end" />
                )}
              </button>
            </div>
          )}
        </div>
      </aside>

      {shell.popover === 'mobile' && <MobileLinkPopover shell={shell} {...kitProps} />}
      {shell.libraryPickerOpen && <LibraryPickerModal shell={shell} {...kitProps} />}

      {/* ===== 主工作区：第 3、4 章的页面 / 首页 / 带真实积分消耗的对话 + 右侧产物区 ===== */}
      {shell.view === 'extensions' ? (
        <ExtensionsViews5113 shell={shell} {...kitProps} />
      ) : shell.view === 'schedule' ? (
        <ScheduleView5113 shell={shell} {...kitProps} />
      ) : shell.view === 'library' ? (
        <LibraryView5113 shell={shell} {...kitProps} />
      ) : shell.view === 'home' ? (
        <div className="flex-1 min-w-0 relative flex flex-col items-center justify-center px-6 xl:px-10 pb-8 bg-white">
          {/* 2.4 写清任务：5 要素拆解教学弹窗（先把完整提示词拆成 5 块看清，点下一步后缓缓移入下方输入框） */}
          {shell.fivePartsCard === 'open' && (() => {
            const toneStyle: Record<FivePartsItem['tone'], { badge: string; row: string; inline: string }> = {
              blue: {
                badge: 'bg-[#eef2ff] text-accent-700 border-[#c9d3f7]',
                row: 'bg-white border-[#eceef2]',
                inline: 'bg-[#eef2ff] text-accent-800',
              },
              teal: {
                badge: 'bg-[#ecfdf5] text-[#047857] border-[#a7f3d0]',
                row: 'bg-white border-[#eceef2]',
                inline: 'bg-[#ecfdf5] text-[#065f46]',
              },
              indigo: {
                badge: 'bg-[#f5f3ff] text-[#6d28d9] border-[#ddd6fe]',
                row: 'bg-white border-[#eceef2]',
                inline: 'bg-[#f5f3ff] text-[#5b21b6]',
              },
              amber: {
                badge: 'bg-[#fff1e8] text-[#c2410c] border-[#f6d7c2]',
                row: 'bg-[#fffaf6] border-[#f6d7c2]',
                inline: 'bg-[#fff1e8] text-[#9a3412]',
              },
              slate: {
                badge: 'bg-[#f1f5f9] text-[#334155] border-[#cbd5e1]',
                row: 'bg-white border-[#eceef2]',
                inline: 'bg-[#f1f5f9] text-[#334155]',
              },
            };
            return (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute inset-0 z-40 flex items-center justify-center p-5 bg-white/65 backdrop-blur-[2px]"
              >
                <div
                  role="dialog"
                  aria-label="5 要素任务单拆解"
                  className="sim-pop-up w-[590px] max-w-full rounded-[18px] bg-white border border-[#dfe2ea] shadow-[0_24px_64px_rgba(17,19,24,0.22)] overflow-hidden text-[13px]"
                >
                  <div className="px-4 py-3 bg-[#f8f9fb] border-b border-[#eceef2] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-accent-600 text-white text-[11px] font-bold shrink-0">
                        5
                      </span>
                      <span className="font-bold text-[13.5px] text-[#111318] truncate">
                        5 要素任务单拆解
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-[#6b7079] bg-white border border-[#e6e8ee] rounded-full px-2.5 py-0.5 shrink-0">
                      把一句话拆开看 · 每块负责一件事
                    </span>
                  </div>

                  <div className="p-3.5 flex flex-col gap-2 max-h-[58vh] overflow-y-auto">
                    {FIVE_PARTS_ITEMS.map((item, idx) => {
                      const st = toneStyle[item.tone];
                      return (
                        <div
                          key={item.label}
                          style={{ animationDelay: `${idx * 65}ms` }}
                          className={`sim-msg-rise rounded-[12px] border px-3 py-2 flex items-start gap-2.5 ${st.row}`}
                        >
                          <span
                            className={`shrink-0 mt-[1px] inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11.5px] font-semibold whitespace-nowrap ${st.badge}`}
                          >
                            <span>{item.num}</span>
                            <span>{item.label}</span>
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="text-[13px] font-semibold text-[#111318] leading-[1.55]">
                              {item.text.trim()}
                            </div>
                            <div className="text-[11.5px] text-[#6b7079] mt-0.5 leading-[1.45]">
                              {item.why}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="px-4 py-2.5 bg-[#fafaf9] border-t border-[#eceef2] text-[12px] leading-[1.7] text-[#4a4f57]">
                    <span className="text-[11px] font-semibold text-[#8c9099] mr-1.5">拼在一起：</span>
                    {FIVE_PARTS_ITEMS.map((item) => (
                      <span
                        key={item.label}
                        className={`inline rounded px-1 py-[1px] mr-0.5 ${toneStyle[item.tone].inline}`}
                      >
                        {item.text.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          <div className="absolute right-4 top-3 text-[#6b7079]">
            <PanelRightIcon size={16} />
          </div>

          <h1 className="m-0 mb-5 text-[26px] xl:text-[28px] font-bold tracking-[-0.02em] text-[#111318]">
            WorkBuddy，我帮你
          </h1>

          {/* 双层复合底座输入框 */}
          <div className="relative w-full max-w-[640px]" onClick={(e) => e.stopPropagation()}>
            {/* 分组下拉 */}
            {shell.popover === 'group' && (
              <div className="sim-pop-up absolute left-2 bottom-[44px] z-30 w-[246px] rounded-[14px] bg-white border border-[#e6e6e3] shadow-[0_14px_36px_rgba(17,19,24,0.16)] p-2 text-[13px]">
                <div className="px-2.5 py-1.5 rounded-lg bg-[#f5f5f5] text-[#8c9099] text-[12px] mb-1.5">
                  ⌕ 搜索分组
                </div>
                {shell.practiceGroupBound ? (
                  <button
                    type="button"
                    data-guided-target="groupMenu.pickPractice"
                    onClick={() =>
                      handleOrAside(
                        'groupMenu.pickPractice',
                        'WorkBuddy-练习',
                        '选中已关联好的练习文件夹作为当前项目分组。'
                      )
                    }
                    className={`relative w-full border-0 flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left cursor-pointer bg-[#eef2ff] text-accent-700 font-medium ${ring(
                      'groupMenu.pickPractice'
                    )}`}
                  >
                    <FolderIcon size={14} />
                    <span>WorkBuddy-练习</span>
                    {waitTarget === 'groupMenu.pickPractice' && waitCallout && (
                      <GuidanceCallout text={waitCallout} placement="right" />
                    )}
                  </button>
                ) : (
                  <div className="px-2.5 py-2 text-[12px] text-[#9ea3ad]">
                    还没有绑定本地文件夹，从下面添加
                  </div>
                )}
                <div className="h-px bg-[#eeeeeb] my-1.5 mx-1" />
                <button
                  type="button"
                  onClick={() =>
                    onAsideClick(
                      '新建分组',
                      '点<b>新建分组</b>会在你设置好的默认工作空间下自动建一个新文件夹并关联进来；如果你电脑里已经建好了目录，直接点下面的<b>选择本地文件夹</b>。'
                    )
                  }
                  className="w-full border-0 bg-transparent hover:bg-[#f4f4f2] rounded-lg px-2.5 py-1.5 text-left text-[#2b2f36] text-[12.5px] cursor-pointer flex items-center justify-between"
                >
                  <span>＋ 新建分组</span>
                  <span className="text-[11px] text-[#8c9099]">自动建夹</span>
                </button>
                <button
                  type="button"
                  data-guided-target="groupMenu.pickLocalFolder"
                  onClick={() =>
                    handleOrAside(
                      'groupMenu.pickLocalFolder',
                      '选择本地文件夹',
                      '把你电脑里提前建好的本地目录关联成 WorkBuddy 分组，以后资料和成品都收在里面。'
                    )
                  }
                  className={`relative w-full border-0 rounded-lg px-2.5 py-2 text-left text-[12.5px] cursor-pointer flex items-center justify-between transition-colors ${
                    waitTarget === 'groupMenu.pickLocalFolder'
                      ? 'bg-[#eef2ff] text-accent-700 font-semibold'
                      : 'bg-transparent hover:bg-[#f4f4f2] text-[#2b2f36]'
                  } ${ring('groupMenu.pickLocalFolder')}`}
                >
                  <span>📂 选择本地文件夹…</span>
                  <span className="text-[11px] text-[#6b7079]">关联已有目录</span>
                  {waitTarget === 'groupMenu.pickLocalFolder' && waitCallout && (
                    <GuidanceCallout text={waitCallout} placement="right" />
                  )}
                </button>
              </div>
            )}

            {/* 模拟系统「选择本地文件夹」弹窗（演示关联目录 + 为什么不能选桌面/下载） */}
            {shell.folderPickerOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="sim-pop-up fixed sm:absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-40 w-[430px] max-w-[92%] rounded-[16px] bg-white border border-[#dcdcd8] shadow-[0_24px_64px_rgba(17,19,24,0.26)] text-[13px]"
              >
                <div className="px-4 py-2.5 bg-[#f7f7f6] rounded-t-[15px] border-b border-[#ebebeb] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                    <span className="ml-1 font-semibold text-[#111318] text-[12.5px]">
                      选择本地文件夹（模拟系统目录）
                    </span>
                  </div>
                  <span className="text-[11px] text-[#8c9099] font-mono">D:\WorkBuddy-工作区</span>
                </div>

                <div className="p-3 flex flex-col gap-1.5">
                  <div className="text-[11.5px] text-[#8c9099] px-1">系统常用目录（不推荐直接交给 AI）</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        onAsideClick(
                          '桌面（高风险）',
                          '<b>千万别把 桌面 设成工作目录！</b>你让它清理没用文件时，它可能顺手把你桌面上的重要文件挪走甚至删掉。选下面干净的 <b>WorkBuddy-练习</b> 目录。'
                        )
                      }
                      className="border border-[#f6d7c2] bg-[#fff8f3] hover:bg-[#fff1e8] rounded-[10px] px-3 py-2 text-left cursor-pointer flex items-center justify-between gap-2"
                    >
                      <span className="text-[#9a3412] font-medium">🖥 桌面 (Desktop)</span>
                      <span className="text-[10.5px] text-[#c2410c]">别选</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onAsideClick(
                          '下载（高风险）',
                          '<b>也别把 下载 设成工作目录！</b>下载文件夹里杂文件太多，既容易串味，也容易误删重要安装包或资料。'
                        )
                      }
                      className="border border-[#f6d7c2] bg-[#fff8f3] hover:bg-[#fff1e8] rounded-[10px] px-3 py-2 text-left cursor-pointer flex items-center justify-between gap-2"
                    >
                      <span className="text-[#9a3412] font-medium">⬇ 下载 (Downloads)</span>
                      <span className="text-[10.5px] text-[#c2410c]">别选</span>
                    </button>
                  </div>

                  <div className="text-[11.5px] text-[#8c9099] px-1 pt-2">
                    D:\WorkBuddy-工作区\（推荐的 5 层干净结构）
                  </div>
                  <div className="rounded-[11px] border border-[#e6e6e3] bg-[#fafaf9] p-1.5 flex flex-col gap-1">
                    <button
                      type="button"
                      data-guided-target="folderPicker.pickPractice"
                      onClick={() =>
                        handleOrAside(
                          'folderPicker.pickPractice',
                          '00_临时 / WorkBuddy-练习',
                          '选中提前建好的干净练手目录，关联成当前分组。'
                        )
                      }
                      className={`relative w-full border border-accent-200 bg-[#eef2ff] hover:bg-[#e2e8fd] rounded-[9px] px-3 py-2 text-left cursor-pointer flex items-center justify-between gap-2 ${ring(
                        'folderPicker.pickPractice'
                      )}`}
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <FolderIcon size={15} className="text-accent-600 shrink-0" />
                        <span className="font-semibold text-accent-700 truncate">
                          00_临时 / WorkBuddy-练习
                        </span>
                      </span>
                      <span className="text-[11px] font-semibold text-accent-600 bg-white px-2 py-0.5 rounded-md shrink-0">
                        选这个并打开
                      </span>
                      {waitTarget === 'folderPicker.pickPractice' && waitCallout && (
                        <GuidanceCallout text={waitCallout} placement="top" />
                      )}
                    </button>

                    {[
                      { name: '01_任务', desc: '正在处理的零散小任务（纪要、表格）' },
                      { name: '02_项目', desc: '大项目，每个项目单独建子文件夹' },
                      { name: '03_知识库', desc: '长期要反复参考的资料' },
                      { name: '99_归档', desc: '已做完、留着备查的成品' },
                    ].map((dir) => (
                      <button
                        key={dir.name}
                        type="button"
                        onClick={() =>
                          onAsideClick(
                            dir.name,
                            `<b>${dir.name}</b> 用于存放${dir.desc}。练手时先选上面蓝圈里的 <b>00_临时 / WorkBuddy-练习</b>。`
                          )
                        }
                        className="w-full border-0 bg-transparent hover:bg-white rounded-[8px] px-3 py-1.5 text-left cursor-pointer flex items-center justify-between gap-2 text-[12.5px]"
                      >
                        <span className="flex items-center gap-2 text-[#2b2f36]">
                          <FolderIcon size={14} className="text-[#8c9099] shrink-0" />
                          <span className="font-mono">{dir.name}</span>
                        </span>
                        <span className="text-[11px] text-[#8c9099] truncate">{dir.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* @ 引用分组文件弹窗（对照 02-艾特引用分组文件.png） */}
            {shell.mentionMenuOpen && (
              <div className="sim-pop-up absolute left-0 right-0 bottom-[calc(100%+10px)] z-30 rounded-[16px] bg-white border border-[#e6e6e3] shadow-[0_16px_42px_rgba(17,19,24,0.16)] p-2 flex flex-col gap-0.5 text-[13px]">
                <div className="px-2.5 py-1 text-[11px] text-[#8c9099] flex items-center justify-between">
                  <span>引用当前分组 WorkBuddy-练习 中的文件</span>
                  <span className="font-mono">输入 @ 触发</span>
                </div>
                <button
                  type="button"
                  data-guided-target="mentionMenu.pickChatLog"
                  onClick={() =>
                    handleOrAside(
                      'mentionMenu.pickChatLog',
                      '周末读书会群聊.txt',
                      '选中分组里的原始群聊文件，直接插进输入框精准引用。'
                    )
                  }
                  className={`relative w-full border-0 rounded-[10px] px-2.5 py-2 flex items-center gap-2 text-left cursor-pointer bg-[#f3f5fe] hover:bg-[#e6ebfd] ${ring(
                    'mentionMenu.pickChatLog'
                  )}`}
                >
                  <span className="w-4.5 h-4.5 rounded bg-[#0ea5e9] text-white text-[10px] font-bold inline-flex items-center justify-center shrink-0">
                    T
                  </span>
                  <span className="font-semibold text-[#111318] shrink-0">周末读书会群聊.txt</span>
                  <span className="text-[12px] text-[#8c9099] truncate font-mono">
                    /WorkBuddy-工作区/00_临时/WorkBuddy-练习/
                  </span>
                  {waitTarget === 'mentionMenu.pickChatLog' && waitCallout && (
                    <GuidanceCallout text={waitCallout} placement="top" align="end" />
                  )}
                </button>
                {[
                  {
                    icon: 'T',
                    name: '上月读书会群聊_旧版.txt',
                    dir: '/WorkBuddy-工作区/00_临时/WorkBuddy-练习/',
                    note: '这是上个月的旧记录——刚才没打 <b>@</b> 点名时，它自己搜目录抓错的就是这份。这步请点上面蓝圈里的最新记录 <b>周末读书会群聊.txt</b>。',
                  },
                  {
                    icon: 'M',
                    name: '项目背景.md',
                    dir: '/WorkBuddy-工作区/00_临时/WorkBuddy-练习/',
                    note: '文件起名清楚（比如 <b>项目背景.md</b> 而不是 文档1），AI 扫一眼文件名就能判断用途。这步先选上面蓝圈里的 <b>周末读书会群聊.txt</b>。',
                  },
                  {
                    icon: 'X',
                    name: '上月销售数据.xlsx',
                    dir: '/WorkBuddy-工作区/00_临时/WorkBuddy-练习/',
                    note: '文件起名清楚（比如 <b>上月销售数据.xlsx</b> 而不是 文档1），AI 扫一眼文件名就能判断用途。这步先选上面蓝圈里的 <b>周末读书会群聊.txt</b>。',
                  },
                ].map((f) => (
                  <button
                    key={f.name}
                    type="button"
                    onClick={() => onAsideClick(f.name, f.note)}
                    className="w-full border-0 bg-transparent hover:bg-[#f5f5f5] rounded-[10px] px-2.5 py-2 flex items-center gap-2 text-left cursor-pointer"
                  >
                    <span className="w-4.5 h-4.5 rounded bg-[#14b8a6] text-white text-[10px] font-bold inline-flex items-center justify-center shrink-0">
                      {f.icon}
                    </span>
                    <span className="font-medium text-[#2b2f36] shrink-0">{f.name}</span>
                    <span className="text-[12px] text-[#8c9099] truncate font-mono">{f.dir}</span>
                  </button>
                ))}
              </div>
            )}

            {/* / 技能菜单：自定义技能和刚装的技能排在最前面（真机内置 + 已安装共 27 个起） */}
            {shell.slashMenuOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="sim-pop-up absolute left-2 bottom-[96px] z-30 w-[320px] rounded-[14px] bg-white border border-[#e6e6e3] shadow-[0_14px_36px_rgba(17,19,24,0.16)] p-1.5 flex flex-col text-[13px]"
              >
                <div className="px-2.5 pt-1 pb-1.5 text-[11.5px] text-[#8c9099]">
                  技能 ({27 + shell.installedSkillIds.length + shell.customSkills.length})
                </div>
                {[
                  ...shell.customSkills.map((n) => ({ name: n, desc: '用户自定义 · 群聊整理成五栏筹备纪要' })),
                  ...(shell.installedSkillIds.length ? [{ name: 'WPS Office 全家桶', desc: '用自然语言操作 WPS 文字 / 表格 / 演示' }] : []),
                  ...SLASH_SKILLS_BASE,
                ].map((sk, idx) => {
                  const isTarget = idx === 0 && waitTarget === 'slashMenu.pick';
                  return (
                    <button
                      key={sk.name}
                      type="button"
                      data-guided-target={idx === 0 ? 'slashMenu.pick' : undefined}
                      onClick={() =>
                        idx === 0
                          ? handleOrAside('slashMenu.pick', sk.name, '选中这个技能。')
                          : onAsideClick(sk.name, `内置技能 <b>${sk.name}</b>：${sk.desc}。这节课要选的是蓝圈那个。`)
                      }
                      className={`relative w-full text-left border-0 bg-transparent hover:bg-[#f4f4f5] rounded-lg px-2.5 py-1.5 flex items-center gap-2.5 cursor-pointer ${isTarget ? ring('slashMenu.pick') : ''}`}
                    >
                      <LetterIcon name={sk.name} color={idx === 0 ? '#3355e0' : '#9ea3ad'} size={24} />
                      <span className="min-w-0">
                        <span className="block font-medium text-[#111318] truncate">{sk.name}</span>
                        <span className="block text-[11.5px] text-[#8c9099] truncate">{sk.desc}</span>
                      </span>
                      {isTarget && waitCallout && <GuidanceCallout text={waitCallout} placement="right" />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* + 号两级菜单（模式：Plan / Ask + 添加文件 / 专家 / 技能 / 连接器） */}
            {shell.popover === 'plus' && (
              <div className="sim-pop-up absolute left-2 bottom-[96px] z-30 flex items-end gap-1.5 text-[13px]">
                <div className="w-[168px] rounded-[14px] bg-white border border-[#e6e6e3] shadow-[0_14px_36px_rgba(17,19,24,0.16)] p-1.5 flex flex-col gap-0.5">
                  <button
                    type="button"
                    data-guided-target="plusMenu.addFile"
                    onClick={() =>
                      handleOrAside(
                        'plusMenu.addFile',
                        '添加文件',
                        '点 <b>+ → 添加文件</b> 除了能传本地文件，还能直接选资料库、腾讯文档、ima 和乐享知识库里的云端资料。'
                      )
                    }
                    className={`relative w-full border-0 rounded-lg px-2.5 py-2 flex items-center justify-between cursor-pointer ${
                      filesSub ? 'bg-[#f4f4f5] font-semibold text-[#111318]' : 'bg-transparent hover:bg-[#f4f4f5] text-[#2b2f36]'
                    } ${ring('plusMenu.addFile')}`}
                  >
                    <span>添加文件</span>
                    <ChevronRightIcon size={12} className="text-[#8c9099]" />
                    {waitTarget === 'plusMenu.addFile' && waitCallout && <GuidanceCallout text={waitCallout} placement="left" />}
                  </button>
                  <div
                    className={`w-full rounded-lg px-2.5 py-2 flex items-center justify-between ${
                      filesSub ? 'text-[#2b2f36]' : 'bg-[#f4f4f5] font-semibold text-[#111318]'
                    }`}
                  >
                    <span>模式</span>
                    <ChevronRightIcon size={12} className="text-[#5c5f66]" />
                  </div>
                  <div className="h-px bg-[#eeeeeb] my-1 mx-1" />
                  {['专家', '技能', '连接器'].map((label) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() =>
                        onAsideClick(
                          label,
                          `<b>${label}</b> 用来扩展 WorkBuddy 的专业能力和外部工具，第 3 章能力扩展里专门讲。`
                        )
                      }
                      className="w-full border-0 bg-transparent hover:bg-[#f4f4f5] rounded-lg px-2.5 py-1.5 text-left text-[#4a4f57] cursor-pointer"
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* 右侧二级：添加文件（对照 01-加号添加文件菜单.png） */}
                {filesSub && (
                  <div className="w-[176px] rounded-[14px] bg-white border border-[#e6e6e3] shadow-[0_14px_36px_rgba(17,19,24,0.16)] p-1.5 flex flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() => onAsideClick('本地文件', '从电脑里挑文件传给这次任务。这节要用的是资料库里整理好的那份，点下面的「资料库」。')}
                      className="w-full border-0 bg-transparent hover:bg-[#f4f4f5] rounded-lg px-2.5 py-2 text-left text-[#2b2f36] cursor-pointer"
                    >
                      ⤒ 本地文件
                    </button>
                    <button
                      type="button"
                      data-guided-target="plusMenu.library"
                      onClick={() =>
                        handleOrAside('plusMenu.library', '资料库', '从资料库里挑文件给这次任务用，选的是哪份、哪个版本，一眼就能看到。')
                      }
                      className={`relative w-full border-0 bg-transparent hover:bg-[#f4f4f5] rounded-lg px-2.5 py-2 text-left text-[#2b2f36] cursor-pointer ${ring('plusMenu.library')}`}
                    >
                      📖 资料库
                      {waitTarget === 'plusMenu.library' && waitCallout && <GuidanceCallout text={waitCallout} placement="right" />}
                    </button>
                    <div className="h-px bg-[#eeeeeb] my-1 mx-1" />
                    {['腾讯文档', 'ima', '乐享知识库'].map((label) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => onAsideClick(label, `<b>${label}</b> 里的云端资料也能直接选进来，登录对应账号后可用。`)}
                        className="w-full border-0 bg-transparent hover:bg-[#f4f4f5] rounded-lg px-2.5 py-2 text-left text-[#2b2f36] cursor-pointer"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}

                {/* 右侧二级：模式开关（Plan / Ask） */}
                {!filesSub && (
                <div className="w-[244px] rounded-[14px] bg-white border border-[#e6e6e3] shadow-[0_14px_36px_rgba(17,19,24,0.16)] p-2 flex flex-col gap-1.5">
                  <div className="px-2 pt-1 text-[11px] text-[#8c9099]">
                    {shell.planOn
                      ? '当前：计划（Plan）先出方案等你确认'
                      : shell.askOn
                        ? '当前：仅问答（Ask）只答不动文件'
                        : '当前：默认模式（直接动手）'}
                  </div>

                  <button
                    type="button"
                    data-guided-target="plusMenu.togglePlan"
                    onClick={() =>
                      handleOrAside(
                        'plusMenu.togglePlan',
                        '计划（Plan）开关',
                        '开启 Plan 后，它会先读资料列方案，等你删改确认后才真正动手。'
                      )
                    }
                    className={`relative w-full border-0 rounded-[10px] px-2.5 py-2 flex items-center justify-between gap-2 text-left cursor-pointer transition-colors ${
                      shell.planOn ? 'bg-[#f3f5fe]' : 'bg-transparent hover:bg-[#f4f4f5]'
                    } ${ring('plusMenu.togglePlan')}`}
                  >
                    <div>
                      <div className="font-semibold text-[#111318] text-[13px]">计划（Plan）</div>
                      <div className="text-[11px] text-[#6b7079]">先列执行步骤，确认后再改文件</div>
                    </div>
                    <span
                      className={`w-[34px] h-[19px] rounded-full relative inline-block shrink-0 transition-colors ${
                        shell.planOn ? 'bg-accent-600' : 'bg-[#dcdcd8]'
                      }`}
                    >
                      <span
                        className={`absolute top-[2px] w-[15px] h-[15px] rounded-full bg-white transition-all ${
                          shell.planOn ? 'left-[17px]' : 'left-[2px]'
                        }`}
                      />
                    </span>
                    {waitTarget === 'plusMenu.togglePlan' && waitCallout && (
                      <GuidanceCallout text={waitCallout} placement="right" />
                    )}
                  </button>

                  <button
                    type="button"
                    data-guided-target="plusMenu.toggleAsk"
                    onClick={() =>
                      handleOrAside(
                        'plusMenu.toggleAsk',
                        '仅问答（Ask）开关',
                        '开启 Ask 后只看资料、只回答问题，绝不改动你电脑里任何文件。'
                      )
                    }
                    className={`relative w-full border-0 rounded-[10px] px-2.5 py-2 flex items-center justify-between gap-2 text-left cursor-pointer transition-colors ${
                      shell.askOn ? 'bg-[#f3f5fe]' : 'bg-transparent hover:bg-[#f4f4f5]'
                    } ${ring('plusMenu.toggleAsk')}`}
                  >
                    <div>
                      <div className="font-semibold text-[#111318] text-[13px]">仅问答（Ask）</div>
                      <div className="text-[11px] text-[#6b7079]">只聊思路和问答，绝不动手写文件</div>
                    </div>
                    <span
                      className={`w-[34px] h-[19px] rounded-full relative inline-block shrink-0 transition-colors ${
                        shell.askOn ? 'bg-accent-600' : 'bg-[#dcdcd8]'
                      }`}
                    >
                      <span
                        className={`absolute top-[2px] w-[15px] h-[15px] rounded-full bg-white transition-all ${
                          shell.askOn ? 'left-[17px]' : 'left-[2px]'
                        }`}
                      />
                    </span>
                    {waitTarget === 'plusMenu.toggleAsk' && waitCallout && (
                      <GuidanceCallout text={waitCallout} placement="right" />
                    )}
                  </button>
                </div>
                )}
              </div>
            )}

            {/* 权限弹出菜单（允许完全访问开关） */}
            {shell.popover === 'permission' && (
              <div className="sim-pop-up absolute left-[118px] bottom-[44px] z-30 w-[268px] rounded-[14px] bg-white border border-[#e6e6e3] shadow-[0_14px_36px_rgba(17,19,24,0.16)] p-3 text-[12.5px]">
                <button
                  type="button"
                  data-guided-target="permMenu.toggleFullAccess"
                  onClick={() =>
                    handleOrAside(
                      'permMenu.toggleFullAccess',
                      '允许完全访问',
                      '关闭时为默认权限（删文件、动敏感目录前先弹窗问你）；新手一直保持关闭最安全。'
                    )
                  }
                  className={`relative w-full border-0 bg-transparent p-0 flex items-center justify-between gap-3 text-left cursor-pointer rounded-lg ${ring(
                    'permMenu.toggleFullAccess'
                  )}`}
                >
                  <div>
                    <div className="font-semibold text-[#111318] text-[13px]">允许完全访问</div>
                    <div className="text-[11.5px] text-[#6b7079] mt-0.5 leading-[1.5]">
                      放开本地文件和命令限制，减少确认弹窗。新手建议保持关闭。
                    </div>
                  </div>
                  <span
                    className={`w-[36px] h-[20px] rounded-full relative inline-block shrink-0 transition-colors ${
                      shell.fullAccessOn ? 'bg-[#dc2626]' : 'bg-[#dcdcd8]'
                    }`}
                  >
                    <span
                      className={`absolute top-[2px] w-4 h-4 rounded-full bg-white transition-all ${
                        shell.fullAccessOn ? 'left-[18px]' : 'left-[2px]'
                      }`}
                    />
                  </span>
                  {waitTarget === 'permMenu.toggleFullAccess' && waitCallout && (
                    <GuidanceCallout text={waitCallout} placement="top" align="end" />
                  )}
                </button>
              </div>
            )}

            {/* 模型下拉（对照 B3D4375C） */}
            {shell.popover === 'model' && (
              <div className="sim-pop-up absolute right-[56px] bottom-[96px] z-30 w-[274px] rounded-[14px] bg-white border border-[#e6e6e3] shadow-[0_14px_36px_rgba(17,19,24,0.16)] p-1.5 text-[12.5px]">
                {[
                  { name: '快速', rate: '0.15x' },
                  { name: '均衡', rate: '0.50x' },
                  { name: '极致', rate: '1.00x' },
                ].map((m) => (
                  <div
                    key={m.name}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-lg ${
                      shell.selectedModel === m.name ? 'bg-[#f4f4f5] font-semibold text-[#111318]' : 'text-[#2b2f36]'
                    }`}
                  >
                    <span>{m.name}</span>
                    <span className="font-mono text-[11.5px] text-[#8c9099]">{m.rate}</span>
                  </div>
                ))}
                <div className="h-px bg-[#eeeeeb] my-1 mx-1" />
                <button
                  type="button"
                  data-guided-target="modelMenu.pickFree"
                  onClick={() =>
                    handleOrAside(
                      'modelMenu.pickFree',
                      'Hy4 flash（限时免费）',
                      '简单整理和日常练手选限时免费（0.00x）或快速档（0.15x）最省积分。'
                    )
                  }
                  className={`relative w-full border-0 flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer bg-[#f3f5fe] hover:bg-[#e6ebfd] ${ring(
                    'modelMenu.pickFree'
                  )}`}
                >
                  <span className="flex items-center gap-1.5">
                    <ModelDotIcon size={13} />
                    <span className="font-semibold text-[#111318]">Hy4 flash</span>
                    <span className="text-[10px] px-1.5 py-[1px] rounded-full bg-[#ecfdf5] text-[#047857] font-medium">
                      限时免费
                    </span>
                  </span>
                  <span className="font-mono text-[11.5px] text-[#047857] font-semibold">0.00x</span>
                  {waitTarget === 'modelMenu.pickFree' && waitCallout && (
                    <GuidanceCallout text={waitCallout} placement="left" />
                  )}
                </button>
                <div className="flex items-center justify-between px-2.5 py-2 text-[#4a4f57]">
                  <span className="flex items-center gap-1.5">
                    <ModelDotIcon size={13} />
                    <span>DeepSeek-V4.1</span>
                    <span className="text-[10px] px-1.5 py-[1px] rounded-full bg-[#ecfdf5] text-[#047857]">夜间折扣</span>
                  </span>
                  <span className="font-mono text-[11.5px] text-[#8c9099]">0.11x</span>
                </div>
              </div>
            )}

            {/* 2.4 五要素提示词缓缓移入输入框的飞行卡片 */}
            {shell.fivePartsCard === 'flying' && !fivePartsFlyDone && (
              <div
                aria-hidden="true"
                className="sim-brief-fly absolute left-0 right-0 top-0 z-30 rounded-[18px] bg-white/98 border border-accent-300 px-4 py-3 text-[13.5px] leading-[1.65] text-[#111318]"
              >
                <div className="flex items-center gap-1.5 mb-1.5 text-[11px] font-semibold text-accent-600">
                  <span className="inline-flex items-center gap-1">
                    {FIVE_PARTS_ITEMS.map((item) => (
                      <span
                        key={item.label}
                        className="px-1.5 py-[1px] rounded bg-[#eef2ff] text-accent-700 text-[10.5px]"
                      >
                        {item.num} {item.label}
                      </span>
                    ))}
                  </span>
                </div>
                <div className="text-[#1f2329]">
                  <RichText text={shell.composerText} />
                </div>
              </div>
            )}

            <div className="rounded-[22px] bg-[#f4f4f5] p-[1px]">
              <div
                className={`rounded-[20px] bg-white border border-[#e6e6e6] px-4 pt-3.5 pb-2.5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] ${
                  shell.fivePartsCard === 'flying' ? 'sim-composer-receive' : ''
                }`}
              >
                {isWaitingComposerKey ? (
                  <div className="relative">
                    <textarea
                      ref={composerInputRef}
                      rows={2}
                      data-guided-target={isWaitingMention ? 'composer.mention' : 'composer.slash'}
                      aria-label={isWaitingMention ? '在输入框里输入 @ 引用文件' : '在输入框里输入 / 调用技能'}
                      value={composerDraft}
                      onKeyDown={(e) => {
                        if (isWaitingMention && (e.key === '@' || e.key === '＠')) {
                          e.preventDefault();
                          setWrongKeyHint(false);
                          onTargetClick('composer.mention');
                          return;
                        }
                        if (isWaitingSlash && (e.key === '/' || e.key === '／' || e.key === '、')) {
                          e.preventDefault();
                          setWrongKeyHint(false);
                          onTargetClick('composer.slash');
                          return;
                        }
                      }}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (isWaitingMention && /[@＠]/.test(val)) {
                          setWrongKeyHint(false);
                          onTargetClick('composer.mention');
                          return;
                        }
                        if (isWaitingSlash && /[/／、]/.test(val)) {
                          setWrongKeyHint(false);
                          onTargetClick('composer.slash');
                          return;
                        }
                        setComposerDraft(val);
                        setWrongKeyHint(true);
                      }}
                      placeholder="今天帮你做些什么？@ 添加上下文，/调用技能与指令"
                      className={`w-full min-h-[56px] resize-none rounded-xl border-0 bg-white px-2 py-1 -mx-2 -my-1 text-[14.5px] leading-[1.65] text-[#111318] outline-none select-text ${ring(
                        isWaitingMention ? 'composer.mention' : 'composer.slash'
                      )}`}
                    />
                    <div
                      className={`mt-1 flex items-center justify-end gap-1.5 text-[11.5px] ${
                        wrongKeyHint ? 'text-[#c2410c] font-medium' : 'text-[#6b7079]'
                      }`}
                    >
                      <span>{wrongKeyHint ? '还没触发：请直接按键盘' : '直接按键盘'}</span>
                      <kbd className="inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-md border border-[#d6d6d2] bg-[#fafaf9] font-mono text-[12px] font-bold text-[#111318] shadow-[0_1px_0_#d6d6d2]">
                        {isWaitingMention ? '@' : '/'}
                      </kbd>
                      <span>{isWaitingMention ? '弹出文件列表' : '弹出技能列表'}</span>
                    </div>
                    {waitCallout && (
                      <GuidanceCallout text={waitCallout} placement="top" align="start" />
                    )}
                  </div>
                ) : (
                  <div className="min-h-[54px] text-[14.5px] leading-[1.65]">
                    {hasText ? (
                      <span
                        className={`block text-[#111318] ${
                          shell.fivePartsCard === 'flying' ? 'sim-composer-text-land' : ''
                        }`}
                      >
                        <RichText text={shell.composerText} />
                      </span>
                    ) : (
                      <span className="text-[#9ea3ad]">
                        今天帮你做些什么？@ 添加上下文，/调用技能与指令
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      data-guided-target="composer.plus"
                      aria-label="展开 + 菜单"
                      onClick={() =>
                        handleOrAside(
                          'composer.plus',
                          '+ 菜单',
                          '点左下角 <b>+</b> 号可以添加本地/云端文件，也能切换默认 / Plan / Ask 模式。',
                          'plus'
                        )
                      }
                      className={`relative w-8 h-8 rounded-lg border-0 inline-flex items-center justify-center text-[19px] text-[#2b2f36] cursor-pointer transition-colors ${
                        shell.popover === 'plus' ? 'bg-[#ececef]' : 'bg-transparent hover:bg-[#f4f4f5]'
                      } ${ring('composer.plus')}`}
                    >
                      +
                      {waitTarget === 'composer.plus' && waitCallout && (
                        <GuidanceCallout text={waitCallout} placement="top" align="start" />
                      )}
                    </button>

                    {/* 输入框里挂着的专家 / 技能 / 连接器胶囊 */}
                    {shell.composerChips.map((c) => (
                      <span
                        key={`${c.kind}-${c.label}`}
                        className="sim-pop-up h-6 px-2 rounded-full bg-[#f3f5fe] border border-accent-200 text-accent-700 text-[11.5px] font-semibold inline-flex items-center gap-1 max-w-[170px]"
                        title={c.label}
                      >
                        <span className="text-[10px] text-accent-500">{chipKindLabel(c.kind)}</span>
                        <span className="truncate">{c.label}</span>
                        {/* × 移除：真机点了会把胶囊拿掉，课程里只做解释，避免打乱当前步骤 */}
                        <button
                          type="button"
                          aria-label={`移除 ${c.label}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAsideClick('移除', `点 × 会把「${c.label}」从这次任务里拿掉。换活的时候记得移除，这一步先留着它。`);
                          }}
                          className="border-0 bg-transparent p-0 text-accent-400 hover:text-accent-700 cursor-pointer leading-none"
                        >
                          ×
                        </button>
                      </span>
                    ))}

                    {shell.planOn && (
                      <span className="sim-pop-up h-6 px-2 rounded-full bg-accent-50 border border-accent-200 text-accent-700 text-[11.5px] font-semibold inline-flex items-center">
                        计划 Plan
                      </span>
                    )}
                    {shell.askOn && (
                      <span className="sim-pop-up h-6 px-2 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] text-[#047857] text-[11.5px] font-semibold inline-flex items-center">
                        仅问答 Ask
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5 text-[12.5px] text-[#2b2f36]">
                    {hasText && <SparkleIcon size={15} className="text-[#4a4f57]" />}

                    <button
                      type="button"
                      data-guided-target="composer.model"
                      onClick={() =>
                        handleOrAside(
                          'composer.model',
                          '模型选择',
                          '点这里切换模型档位与倍率（限时免费 0.00x / 快速 0.15x / 均衡 0.50x / 极致 1.00x）。',
                          'model'
                        )
                      }
                      className={`relative border-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium cursor-pointer transition-colors ${
                        shell.popover === 'model' ? 'bg-[#f4f4f5]' : 'bg-transparent hover:bg-[#f4f4f5]'
                      } ${ring('composer.model')}`}
                    >
                      <ModelDotIcon size={14} />
                      <span>{shell.selectedModel}</span>
                      {shell.popover === 'model' ? <ChevronUpIcon size={11} /> : <ChevronDownIcon size={11} />}
                      {waitTarget === 'composer.model' && waitCallout && (
                        <GuidanceCallout text={waitCallout} placement="top" align="end" />
                      )}
                    </button>

                    <MicIcon size={15} className="text-[#3a3e45]" />

                    <button
                      type="button"
                      data-guided-target="composer.send"
                      aria-label="发送"
                      onClick={() =>
                        handleOrAside('composer.send', '发送', '跟着右边泊舟的提示先完成这一步再点发送。')
                      }
                      className={`relative w-8 h-8 rounded-full border-0 inline-flex items-center justify-center text-white cursor-pointer transition-all active:scale-[0.93] ${
                        hasText ? 'bg-[#1a1a1a] hover:bg-[#333]' : 'bg-[#c9ccd1]'
                      } ${ring('composer.send')}`}
                    >
                      <SendPlaneIcon size={14} />
                      {waitTarget === 'composer.send' && waitCallout && (
                        <GuidanceCallout text={waitCallout} placement="top" align="end" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* 下层托盘：选择分组 + 默认权限 */}
              <div className="h-10 px-4 flex items-center gap-5 text-[12.5px]">
                <button
                  type="button"
                  data-guided-target="composer.group"
                  onClick={() =>
                    handleOrAside(
                      'composer.group',
                      '选择分组',
                      '发任务前先选项目分组，材料和成品才会收在同一个本地文件夹。',
                      'group'
                    )
                  }
                  className={`relative inline-flex items-center gap-1.5 border-0 bg-transparent px-1.5 py-1 -ml-1.5 rounded-lg cursor-pointer ${
                    shell.selectedGroup ? 'text-[#111318] font-medium' : 'text-[#5c5f66]'
                  } ${ring('composer.group')}`}
                >
                  <FolderIcon size={14} />
                  <span>{shell.selectedGroup ?? '选择分组'}</span>
                  {shell.popover === 'group' ? <ChevronUpIcon size={11} /> : <ChevronDownIcon size={11} />}
                  {waitTarget === 'composer.group' && waitCallout && (
                    <GuidanceCallout text={waitCallout} placement="bottom" align="start" />
                  )}
                </button>

                <button
                  type="button"
                  data-guided-target="composer.permission"
                  onClick={() =>
                    handleOrAside(
                      'composer.permission',
                      '权限设置',
                      '这里控制 WorkBuddy 动你电脑文件前要不要先弹窗审批。新手始终保持<b>默认权限</b>最安全。',
                      'permission'
                    )
                  }
                  className={`relative inline-flex items-center gap-1.5 border-0 bg-transparent px-1.5 py-1 rounded-lg cursor-pointer transition-colors ${
                    shell.fullAccessOn
                      ? 'text-[#dc2626] font-semibold bg-[#fef2f2]'
                      : 'text-[#5c5f66] hover:text-[#111318]'
                  } ${ring('composer.permission')}`}
                >
                  <ShieldCheckIcon size={14} />
                  <span>{shell.fullAccessOn ? '允许完全访问' : '默认权限'}</span>
                  {shell.popover === 'permission' ? <ChevronUpIcon size={11} /> : <ChevronDownIcon size={11} />}
                  {waitTarget === 'composer.permission' && waitCallout && (
                    <GuidanceCallout text={waitCallout} placement="bottom" align="start" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="absolute bottom-2.5 text-[11px] text-[#a0a4ad]">
            内容由 AI 生成，请核实重要信息
          </div>
        </div>
      ) : (
        /* ===== 对话视图（精准还原 5.11.3「预计消耗 ✧ / 已消耗 ✧」+ 流式执行 + 右侧产物区） ===== */
        <div className="flex-1 min-w-0 flex bg-white overflow-hidden">
          <div className="flex-1 min-w-0 flex flex-col border-r border-[#ebebeb]">
            <div className="h-12 shrink-0 px-5 flex items-center justify-between gap-3 border-b border-[#f0f0ee]">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-[13.5px] font-semibold text-[#111318] truncate">
                  {chat?.chatTitle || '当前任务'}
                </span>
                {isNeedBackToHome && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNewTask();
                    }}
                    className="sim-pop-up h-7 px-2.5 rounded-lg border border-accent-200 bg-accent-50 hover:bg-accent-100 text-accent-700 text-[12px] font-semibold cursor-pointer shrink-0"
                  >
                    ← 回到当前新对话继续
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3 text-[#5c5f66] shrink-0">
                <SearchIcon size={14} />
                <ShareIcon size={14} />
                <PanelRightIcon size={14} />
              </div>
            </div>

            {chat && (
              <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
                {/* 用户消息（上方挂着这次带上的专家 / 技能 / 连接器） */}
                {chat.promptChips && chat.promptChips.length > 0 && (
                  <div className="self-end flex flex-wrap justify-end gap-1.5 -mb-3">
                    {chat.promptChips.map((c) => (
                      <span key={`${c.kind}-${c.label}`} className="h-6 px-2 rounded-full bg-[#f3f5fe] border border-accent-200 text-accent-700 text-[11.5px] font-semibold inline-flex items-center gap-1">
                        <span className="text-[10px] text-accent-500">{chipKindLabel(c.kind)}</span>
                        {c.label}
                      </span>
                    ))}
                  </div>
                )}
                <div className="sim-msg-rise self-end max-w-[85%] rounded-[16px] bg-[#f4f4f5] px-4 py-2.5 text-[13.5px] leading-[1.65] text-[#111318]">
                  <RichText text={chat.prompt} />
                </div>

                {/* WorkBuddy 回复区（精确还原 BA0B1FEF：预计消耗 ✧ + 工具步骤 + 流式正文 + 已消耗 ✧） */}
                <div className="sim-msg-rise flex flex-col gap-3 text-[13.5px] leading-[1.78] text-[#2b2f36]">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#1a1a1a] text-white text-[11px] font-bold inline-flex items-center justify-center">
                      W
                    </span>
                    <strong className="text-[#111318] font-semibold">WorkBuddy</strong>
                    <span className="text-[12px] text-[#8c9099] font-mono">
                      预计消耗 ✧ {chat.estimateText}
                    </span>
                    {chat.memoryBadge && (
                      <span className="sim-pop-up text-[11px] font-medium text-accent-600 bg-accent-50 border border-accent-200 rounded-full px-2 py-[1px]">
                        {chat.memoryBadge}
                      </span>
                    )}
                  </div>

                  {/* 工具步进动效 -> 折叠为「已处理 Xs」 */}
                  {shell.chatPhase === 'steps' ? (
                    <div className="rounded-[12px] border border-[#eeeeeb] bg-[#fafaf9] px-3.5 py-2.5 flex flex-col gap-2 text-[12.5px]">
                      {chat.steps.map((st, idx) => {
                        const status =
                          idx < shell.chatStepIndex
                            ? 'done'
                            : idx === shell.chatStepIndex
                              ? 'running'
                              : 'pending';
                        return (
                          <div key={st.running} className="flex items-center gap-2">
                            {status === 'running' ? (
                              <span className="sim-spin w-3.5 h-3.5 rounded-full border-2 border-accent-600 border-t-transparent shrink-0" />
                            ) : status === 'done' ? (
                              <span className="sim-check-pop w-3.5 h-3.5 rounded-full bg-accent-600 text-white text-[9px] inline-flex items-center justify-center shrink-0">
                                ✓
                              </span>
                            ) : (
                              <span className="w-3.5 h-3.5 rounded-full border border-[#d6d6d2] shrink-0" />
                            )}
                            <span
                              className={
                                status === 'running'
                                  ? 'text-[#111318] font-medium'
                                  : status === 'done'
                                    ? 'text-[#4a4f57]'
                                    : 'text-[#9ea3ad]'
                              }
                            >
                              {status === 'done' ? st.done : st.running}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="sim-msg-rise flex flex-col gap-1 text-[12.5px] text-[#8c9099]">
                      <div className="inline-flex items-center gap-1">
                        <span>已处理 {chat.elapsed}</span>
                        <ChevronRightIcon size={11} />
                      </div>
                      <div className="text-[12px] text-[#8c9099]">🔧 {chat.steps[chat.steps.length - 1]?.done}</div>
                    </div>
                  )}

                  {/* 流式正文（支持真 Markdown 表格 + 先原样展示、后揭示 {{wrong:}} / {{ok:}} 高亮） */}
                  {renderedReply && (
                    <div className="whitespace-pre-line text-[#1f2329]">
                      <RichText text={renderedReply} revealMarks={shell.marksRevealed} />
                      {isStreaming && (
                        <span className="inline-block w-[2px] h-[14px] bg-accent-600 align-middle ml-0.5 animate-pulse" />
                      )}
                    </div>
                  )}

                  {/* Plan 模式方案确认按钮 */}
                  {isDone && chat.planConfirmLabel && (
                    <div className="sim-msg-rise pt-1 flex items-center gap-2.5 flex-wrap">
                      <button
                        type="button"
                        data-guided-target="chat.confirmPlan"
                        onClick={() =>
                          handleOrAside(
                            'chat.confirmPlan',
                            chat.planConfirmLabel!,
                            '在 Plan 模式下删掉不要的步骤或改好细节，再点确认执行，最稳妥。'
                          )
                        }
                        className={`relative h-9 px-4 rounded-[10px] border-0 bg-gray-900 hover:bg-[#2a2d35] text-white text-[13px] font-semibold cursor-pointer ${ring(
                          'chat.confirmPlan'
                        )}`}
                      >
                        {chat.planConfirmLabel}
                        {waitTarget === 'chat.confirmPlan' && waitCallout && (
                          <GuidanceCallout text={waitCallout} placement="top" align="start" />
                        )}
                      </button>
                    </div>
                  )}

                  {/* 操作卡片（如扫码授权、已创建定时任务），按钮可以是课程目标 */}
                  {isDone && chat.actionCard && (
                    <div
                      className={`sim-msg-rise flex items-center justify-between gap-3 px-3.5 py-3 rounded-[14px] border ${
                        chat.actionCard.tone === 'warn'
                          ? 'bg-[#fff6ef] border-[#f6d7c2]'
                          : chat.actionCard.tone === 'ok'
                            ? 'bg-[#f3f5fe] border-accent-200'
                            : 'bg-[#f7f7f6] border-[#ebebeb]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {chat.actionCard.icon === 'qr' ? (
                          // 扫码授权卡片：放一个明确标了「模拟」的假二维码
                          <FakeQr size={84} />
                        ) : (
                          <span className="w-8 h-8 rounded-[9px] bg-white border border-[#ebebeb] text-[15px] inline-flex items-center justify-center shrink-0">
                            {chat.actionCard.icon}
                          </span>
                        )}
                        <div className="min-w-0">
                          <div className="font-semibold text-[13px] text-[#111318] truncate">{chat.actionCard.title}</div>
                          <div className="text-[11.5px] text-[#6b7079] truncate">{chat.actionCard.meta}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        data-guided-target="chat.actionCard"
                        onClick={() => handleOrAside('chat.actionCard', chat.actionCard!.buttonLabel, '跟着右边泊舟的提示走。')}
                        className={`relative h-8 px-3 rounded-lg border-0 bg-[#111318] text-white text-[12px] font-semibold cursor-pointer shrink-0 ${ring('chat.actionCard')}`}
                      >
                        {chat.actionCard.buttonLabel}
                        {waitTarget === 'chat.actionCard' && waitCallout && (
                          <GuidanceCallout text={waitCallout} placement="top" align="end" />
                        )}
                      </button>
                    </div>
                  )}

                  {/* 文件卡片 */}
                  {isDone && chat.fileCard && (
                    <div
                      className={`sim-msg-rise flex items-center justify-between gap-3 px-3.5 py-3 rounded-[14px] border ${
                        chat.fileCard.warn
                          ? 'bg-[#fff6ef] border-[#f6d7c2]'
                          : 'bg-[#f4f4f5] border-[#ebebeb]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`w-8 h-8 rounded-[9px] text-white text-[12px] font-bold inline-flex items-center justify-center shrink-0 ${
                            chat.fileCard.warn ? 'bg-[#c2410c]' : 'bg-[#0ea5e9]'
                          }`}
                        >
                          M
                        </span>
                        <div className="min-w-0">
                          <div className="font-semibold text-[13px] text-[#111318] truncate">
                            {chat.fileCard.name}
                          </div>
                          <div
                            className={`text-[11.5px] truncate ${
                              chat.fileCard.warn ? 'text-[#9a3412]' : 'text-[#8c9099]'
                            }`}
                          >
                            {chat.fileCard.meta}
                          </div>
                        </div>
                      </div>
                      <span className="h-7 px-2.5 rounded-lg bg-[#1a1a1a] text-white text-[11.5px] font-medium inline-flex items-center gap-1 shrink-0">
                        <ShareIcon size={11} />
                        分享
                      </span>
                    </div>
                  )}

                  {/* 真机同款底部消耗行：「已消耗 ✧ 1.18 | 提示语」（对照 BA0B1FEF） */}
                  {isDone && (
                    <div className="sim-msg-rise flex flex-col gap-2 pt-1">
                      <div className="flex items-center flex-wrap gap-2 text-[12.5px]">
                        <span
                          className={`font-mono font-semibold ${
                            chat.consumedDelta >= 5
                              ? 'text-[#c2410c] bg-[#fff1e8] px-2 py-0.5 rounded-md'
                              : chat.consumedDelta === 0
                                ? 'text-[#047857] bg-[#ecfdf5] px-2 py-0.5 rounded-md'
                                : 'text-[#2b2f36]'
                          }`}
                        >
                          已消耗 ✧ {chat.consumedText}
                        </span>
                        <span className="text-[#d4d4d0]">|</span>
                        <span className="text-[#8c9099] text-[12px]">{chat.footerTip}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[#7a7f89] text-[12px]">
                        <CopyIcon size={13} />
                        <RefreshIcon size={13} />
                        <ShareIcon size={13} />
                        <span>•••</span>
                        <span className="inline-flex items-center gap-1 text-[#5c5f66]">
                          <ModelDotIcon size={12} />
                          <span>{chat.model}</span>
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 底部：若命中默认权限审批弹窗则展示 5.11.3 真机同款审批卡（对照 01-默认权限审批弹窗.png），否则展示对话内追问框 */}
            <div className="shrink-0 px-5 pb-3.5 pt-2">
              {isDone && chat?.approvalCard ? (
                <div className="sim-pop-up rounded-[20px] bg-white border border-[#e2e4e9] shadow-[0_12px_32px_rgba(17,19,24,0.1)] p-4 flex flex-col gap-2.5 text-[13.5px]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="font-semibold text-[#111318] leading-[1.55]">
                      {chat.approvalCard.question}
                    </div>
                    <span className="text-[12px] text-[#8c9099] font-mono shrink-0">‹ 1/1 › ×</span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      onAsideClick(
                        '确认删除（危险）',
                        '<b>停一下！</b>先看清上面 3 件事：动作是<b>删除</b>、目标路径跑到了<b>桌面 / 客户备份</b>（不是当前练习分组！）。这种越界删除千万别点 1 确认，应该选下面的 2 取消或 ✎ 其他补充问清楚。'
                      )
                    }
                    className="w-full border-0 rounded-[11px] bg-[#f4f4f5] hover:bg-[#fee2e2] px-3 py-2.5 flex items-center justify-between text-left cursor-pointer transition-colors"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-md bg-white border border-[#e2e2de] text-[12px] font-mono inline-flex items-center justify-center text-[#2b2f36]">
                        1
                      </span>
                      <span className="text-[#111318] font-medium">{chat.approvalCard.confirmLabel}</span>
                    </span>
                    <span className="text-[#5c5f66]">→</span>
                  </button>

                  <button
                    type="button"
                    data-guided-target="approval.cancel"
                    onClick={() =>
                      handleOrAside(
                        'approval.cancel',
                        chat.approvalCard!.cancelLabel,
                        '发现路径不对或者看不懂这一步要删什么，直接点取消操作最稳妥。'
                      )
                    }
                    className={`relative w-full border-0 rounded-[11px] bg-white hover:bg-[#f4f4f5] px-3 py-2 flex items-center gap-2.5 text-left cursor-pointer transition-colors ${ring(
                      'approval.cancel'
                    )}`}
                  >
                    <span className="w-5 h-5 rounded-md bg-[#f4f4f5] text-[12px] font-mono inline-flex items-center justify-center text-[#2b2f36]">
                      2
                    </span>
                    <span className="text-[#111318]">{chat.approvalCard.cancelLabel}</span>
                    {waitTarget === 'approval.cancel' && waitCallout && (
                      <GuidanceCallout text={waitCallout} placement="top" align="start" />
                    )}
                  </button>

                  <button
                    type="button"
                    data-guided-target="approval.askPlain"
                    onClick={() =>
                      handleOrAside(
                        'approval.askPlain',
                        chat.approvalCard!.askLabel,
                        '拿不准时点其他补充，让它先用大白话列出清单和预览再决定。'
                      )
                    }
                    className={`relative w-full border-0 border-t border-[#f0f0ee] rounded-[11px] bg-white hover:bg-[#f3f5fe] px-3 py-2.5 flex items-center justify-between text-left cursor-pointer transition-colors ${ring(
                      'approval.askPlain'
                    )}`}
                  >
                    <span className="flex items-center gap-2.5 text-[#4a4f57]">
                      <span>✎</span>
                      <span>{chat.approvalCard.askLabel}</span>
                    </span>
                    <span className="w-7 h-7 rounded-full bg-[#1a1a1a] text-white inline-flex items-center justify-center shrink-0">
                      <SendPlaneIcon size={12} />
                    </span>
                    {waitTarget === 'approval.askPlain' && waitCallout && (
                      <GuidanceCallout text={waitCallout} placement="top" align="end" />
                    )}
                  </button>
                </div>
              ) : (
                <div className="rounded-[18px] bg-[#f4f4f5] p-[1px]">
                  <div className="rounded-[16px] bg-white border border-[#e6e6e6] px-3.5 py-2.5 flex items-center justify-between gap-3 text-[13px]">
                    <div className={`min-w-0 flex-1 leading-[1.6] ${shell.followupText ? 'text-[#111318]' : 'text-[#9ea3ad]'}`}>
                      {shell.followupText ? <RichText text={shell.followupText} /> : '继续说点什么…'}
                    </div>
                    <button
                      type="button"
                      data-guided-target="chat.followupSend"
                      aria-label="在原对话发送追问"
                      onClick={() =>
                        handleOrAside(
                          'chat.followupSend',
                          '原对话发送修改',
                          '二次修改就在当前原对话里继续发，别新开任务丢掉上下文。'
                        )
                      }
                      className={`relative w-7.5 h-7.5 rounded-full border-0 text-white inline-flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                        shell.followupText ? 'bg-[#1a1a1a] hover:bg-[#333]' : 'bg-[#c9ccd1]'
                      } ${ring('chat.followupSend')}`}
                    >
                      <SendPlaneIcon size={12} />
                      {waitTarget === 'chat.followupSend' && waitCallout && (
                        <GuidanceCallout text={waitCallout} placement="top" align="end" />
                      )}
                    </button>
                  </div>
                  <div className="h-8 px-3.5 flex items-center gap-4 text-[11.5px] text-[#5c5f66]">
                    <span className="inline-flex items-center gap-1">
                      <FolderIcon size={12} />
                      {shell.selectedGroup ?? '未选分组（默认临时目录）'}
                    </span>
                    <span className={`inline-flex items-center gap-1 ${shell.fullAccessOn ? 'text-[#dc2626] font-semibold' : ''}`}>
                      <ShieldCheckIcon size={12} />
                      {shell.fullAccessOn ? '允许完全访问' : '默认权限'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 右侧产物预览区（滑入展开） */}
          {shell.showArtifacts && chat?.artifact && (
            <div className="sim-slide-in-panel w-[45%] max-w-[370px] min-w-[250px] shrink-0 flex flex-col bg-white">
              <div className="h-12 shrink-0 px-3 flex items-center justify-between border-b border-[#ebebeb] bg-[#fafafa]">
                <div className="h-8 px-2.5 rounded-lg bg-[#ececef] flex items-center gap-1.5 text-[12.5px] font-medium text-[#111318] min-w-0">
                  <span className="w-4 h-4 rounded bg-[#0ea5e9] text-white text-[9px] font-bold inline-flex items-center justify-center shrink-0">
                    M
                  </span>
                  <span className="truncate">{chat.artifact.file}</span>
                  <span className="text-[#8c9099] ml-0.5">×</span>
                </div>
                <PanelRightIcon size={14} className="text-[#6b7079]" />
              </div>

              <div className="px-4 py-2.5 border-b border-[#f0f0ee] flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2 text-[12px]">
                  <span className="font-medium text-[#111318] truncate">{chat.artifact.file}</span>
                  <span
                    className={`px-1.5 py-[1px] rounded text-[10.5px] font-semibold shrink-0 ${
                      chat.artifact.badgeTone === 'warn'
                        ? 'bg-[#fff1e8] text-[#9a3412]'
                        : 'bg-accent-50 text-accent-600'
                    }`}
                  >
                    {chat.artifact.badge}
                  </span>
                </div>
                <div
                  className={`font-mono text-[11px] truncate ${
                    chat.artifact.badgeTone === 'warn' ? 'text-[#9a3412]' : 'text-[#6b7079]'
                  }`}
                >
                  📁 {chat.artifact.pathLabel}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 bg-[#fafaf9]">
                <div className="rounded-[12px] border border-[#ebebeb] bg-white p-4 flex flex-col gap-2.5 text-[12.5px] leading-[1.75]">
                  <div className="text-[14.5px] font-bold text-[#111318]">{chat.artifact.title}</div>
                  {chat.artifact.lines.map((ln, idx) => (
                    <div
                      key={idx}
                      className={
                        ln.tone === 'warn' && shell.marksRevealed
                          ? 'sim-warn-reveal px-2 py-1 rounded bg-[#fff1e8] text-[#9a3412] font-medium'
                          : ln.tone === 'ok' && shell.marksRevealed
                            ? 'px-2 py-1 rounded bg-[#eef2ff] text-accent-700 font-medium'
                            : 'text-[#2b2f36]'
                      }
                    >
                      {ln.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 顶部轻提示（#40 Toast：带底部倒计时进度线，召唤成功/安装成功/连接成功等） */}
      {shell.toast && (
        <div
          key={shell.toast}
          role="status"
          className="sim-toast absolute top-3 left-1/2 z-40 overflow-hidden px-3.5 pt-2 pb-2.5 rounded-[10px] bg-[#111318] text-white text-[12.5px] shadow-lg whitespace-nowrap pointer-events-none"
        >
          <span>{shell.toast}</span>
          <span
            aria-hidden="true"
            className="sim-toast-bar absolute left-0 right-0 bottom-0 h-[2px] bg-white/55"
          />
        </div>
      )}

      {/* 4.2 手机模拟面板 */}
      {shell.phonePanelOpen && <PhonePanel shell={shell} draft={shell.followupText} {...kitProps} />}
    </div>
  );
}
