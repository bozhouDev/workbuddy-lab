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
import { GuidanceCallout } from './GuidanceCue';
import type { GuidedShellState, GuidedTargetId } from './guidedTypes';
import { SettingsViews5113 } from './SettingsViews5113';

interface GuidedWorkBuddyProps {
  shell: GuidedShellState;
  waitTarget: GuidedTargetId | null;
  waitCallout: string | null;
  urgent: boolean;
  onTargetClick: (target: GuidedTargetId) => void;
  onToggleSidebar: () => void;
  onClosePopover: () => void;
  onAsideClick: (label: string, explain: string) => void;
}

/**
 * 通用 5.11.3 高还原活界面（服务 1.1～1.5 全部陪练课）
 * 内含：首页 + 真实弹出菜单 + 5.11.3 设置页 + 带「预计消耗 ✧ / 已消耗 ✧」真实积分明细的流式对话与右侧产物区
 */
export function GuidedWorkBuddy({
  shell,
  waitTarget,
  waitCallout,
  urgent,
  onTargetClick,
  onToggleSidebar,
  onClosePopover,
  onAsideClick,
}: GuidedWorkBuddyProps) {
  const ring = (id: GuidedTargetId) =>
    waitTarget === id ? (urgent ? 'sim-ring-urgent' : 'sim-ring') : '';

  const handleOrAside = (id: GuidedTargetId, label: string, explain: string) => {
    if (waitTarget === id) {
      onTargetClick(id);
    } else {
      onAsideClick(label, explain);
    }
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
                {shell.creditBalance.toFixed(2)}
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

      {/* 左侧栏 */}
      <aside
        className={`shrink-0 bg-[#f7f7f7] border-r border-[#ebebeb] flex flex-col text-[13px] transition-[width] duration-200 ${
          shell.sidebarCollapsed ? 'w-[58px]' : 'w-[228px]'
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
            { label: '新建任务', icon: <NewTaskIcon size={16} />, active: shell.view === 'home' },
            { label: '助理', badge: 'BETA', icon: <AssistantIcon size={16} /> },
            { label: '专家·技能·连接器', icon: <ExtensionsIcon size={16} /> },
            { label: '定时任务', icon: <ScheduleIcon size={16} /> },
            { label: '资料库', icon: <LibraryIcon size={16} /> },
            { label: '发现', icon: <DiscoverIcon size={16} /> },
          ].map((it) => (
            <div
              key={it.label}
              onClick={() => onAsideClick(it.label, `「${it.label}」这节课先不用点，跟着右边蓝圈步骤走就行。`)}
              className={`flex items-center ${
                shell.sidebarCollapsed ? 'justify-center' : 'gap-2.5 px-2.5'
              } py-[7px] rounded-lg cursor-pointer ${
                it.active ? 'bg-[#eaeae8] font-medium text-[#111318]' : 'text-[#2b2f36] hover:bg-[#efefef]'
              }`}
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
            </div>
          ))}
        </div>

        {!shell.sidebarCollapsed && (
          <div className="mt-4 px-2 flex flex-col gap-0.5 flex-1 overflow-y-auto">
            <div className="px-2.5 pt-2 pb-1 text-[11px] text-[#8c9099]">最近</div>
            <div className="px-2.5 py-1.5 rounded-lg text-[12.5px] text-[#4a4f57] truncate">
              {chat?.chatTitle || '整理 11 月周报'}
            </div>
            <div className="px-2.5 pt-3.5 pb-1 text-[11px] text-[#8c9099]">分组</div>
            <div className="px-2.5 py-1.5 rounded-lg text-[12.5px] text-[#4a4f57] flex items-center gap-2">
              <FolderIcon size={14} className="text-[#6b7079] shrink-0" />
              <span className="truncate">{shell.selectedGroup || 'WorkBuddy-练习'}</span>
            </div>
          </div>
        )}

        {shell.sidebarCollapsed && <div className="flex-1" />}

        {/* 左下角：头像 + 实时模拟积分余额微标 */}
        <div
          className={`px-2.5 py-2.5 border-t border-[#ebebeb] flex items-center ${
            shell.sidebarCollapsed ? 'justify-center' : 'justify-between'
          } text-[#5c5f66]`}
        >
          <button
            type="button"
            data-guided-target="avatar"
            onClick={(e) => {
              e.stopPropagation();
              handleOrAside('avatar', '左下角头像', '点左下角头像可以查看积分余额、进入设置和记忆与进化。');
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
                  ✧ {shell.creditBalance.toFixed(2)}
                </div>
              </div>
            )}
            {waitTarget === 'avatar' && waitCallout && (
              <GuidanceCallout text={waitCallout} placement="top" />
            )}
          </button>

          {!shell.sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <BellIcon size={15} />
              <MobileLinkIcon size={15} />
            </div>
          )}
        </div>
      </aside>

      {/* ===== 主工作区：首页 OR 带真实积分消耗的对话 + 右侧产物区 ===== */}
      {shell.view === 'home' ? (
        <div className="flex-1 min-w-0 relative flex flex-col items-center justify-center px-6 xl:px-10 pb-8 bg-white">
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
              <div className="sim-pop-up absolute left-2 bottom-[44px] z-30 w-[230px] rounded-[14px] bg-white border border-[#e6e6e3] shadow-[0_14px_36px_rgba(17,19,24,0.16)] p-2 text-[13px]">
                <div className="px-2.5 py-1.5 rounded-lg bg-[#f5f5f5] text-[#8c9099] text-[12px] mb-1.5">
                  ⌕ 搜索分组
                </div>
                <button
                  type="button"
                  data-guided-target="groupMenu.pickPractice"
                  onClick={() =>
                    handleOrAside(
                      'groupMenu.pickPractice',
                      'WorkBuddy-练习',
                      '选中干净的练习文件夹作为当前项目分组。'
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
                <div className="flex items-center gap-2.5 px-2.5 py-2 text-[#4a4f57]">
                  <FolderIcon size={14} />
                  <span>01_会议纪要</span>
                </div>
                <div className="h-px bg-[#eeeeeb] my-1.5 mx-1" />
                <div className="px-2.5 py-1.5 text-[#5c5f66] text-[12.5px]">新建分组</div>
                <div className="px-2.5 py-1.5 text-[#5c5f66] text-[12.5px]">选择本地文件夹</div>
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

            <div className="rounded-[22px] bg-[#f4f4f5] p-[1px]">
              <div className="rounded-[20px] bg-white border border-[#e6e6e6] px-4 pt-3.5 pb-2.5 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
                <div className="min-h-[54px] text-[14.5px] leading-[1.65]">
                  {hasText ? (
                    <span className="text-[#111318]">
                      <RichText text={shell.composerText} />
                    </span>
                  ) : (
                    <span className="text-[#9ea3ad]">
                      今天帮你做些什么？@ 添加上下文，/调用技能与指令
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-[19px] text-[#2b2f36]">
                    +
                  </span>

                  <div className="flex items-center gap-2.5 text-[12.5px] text-[#2b2f36]">
                    {hasText && <SparkleIcon size={15} className="text-[#4a4f57]" />}

                    <button
                      type="button"
                      data-guided-target="composer.model"
                      onClick={() =>
                        handleOrAside(
                          'composer.model',
                          '模型选择',
                          '点这里切换模型档位与倍率（限时免费 0.00x / 快速 0.15x / 均衡 0.50x / 极致 1.00x）。'
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
                        <GuidanceCallout text={waitCallout} placement="top" />
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
                        <GuidanceCallout text={waitCallout} placement="top" />
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
                      '发任务前先选项目分组，材料和成品才会收在同一个本地文件夹。'
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
                    <GuidanceCallout text={waitCallout} placement="bottom" />
                  )}
                </button>

                <span className="inline-flex items-center gap-1.5 text-[#5c5f66]">
                  <ShieldCheckIcon size={14} />
                  <span>默认权限 ∨</span>
                </span>
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
            <div className="h-12 shrink-0 px-5 flex items-center justify-between border-b border-[#f0f0ee]">
              <span className="text-[13.5px] font-semibold text-[#111318] truncate">
                {chat?.chatTitle || '当前任务'}
              </span>
              <div className="flex items-center gap-3 text-[#5c5f66]">
                <SearchIcon size={14} />
                <ShareIcon size={14} />
                <PanelRightIcon size={14} />
              </div>
            </div>

            {chat && (
              <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
                {/* 用户消息 */}
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

                  {/* 流式正文（支持换行与 {{wrong:}} / {{ok:}} 高亮） */}
                  {renderedReply && (
                    <div className="whitespace-pre-line text-[#1f2329]">
                      <RichText text={renderedReply} />
                      {isStreaming && (
                        <span className="inline-block w-[2px] h-[14px] bg-accent-600 align-middle ml-0.5 animate-pulse" />
                      )}
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

            {/* 底部紧凑输入框 */}
            <div className="shrink-0 px-5 pb-3.5 pt-2">
              <div className="rounded-[18px] bg-[#f4f4f5] p-[1px]">
                <div className="rounded-[16px] bg-white border border-[#e6e6e6] px-3.5 py-2.5 flex items-center justify-between text-[13px] text-[#9ea3ad]">
                  <span>继续说点什么…</span>
                  <span className="w-7 h-7 rounded-full bg-[#c9ccd1] text-white inline-flex items-center justify-center">
                    <SendPlaneIcon size={12} />
                  </span>
                </div>
                <div className="h-8 px-3.5 flex items-center gap-4 text-[11.5px] text-[#5c5f66]">
                  <span className="inline-flex items-center gap-1">
                    <FolderIcon size={12} />
                    {shell.selectedGroup ?? '未选分组（默认临时目录）'}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <ShieldCheckIcon size={12} />
                    默认权限
                  </span>
                </div>
              </div>
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
                        ln.tone === 'warn'
                          ? 'px-2 py-1 rounded bg-[#fff1e8] text-[#9a3412]'
                          : ln.tone === 'ok'
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
    </div>
  );
}
