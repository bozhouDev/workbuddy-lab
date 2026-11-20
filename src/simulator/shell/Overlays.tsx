import type { SimId } from '../registry';
import type { SceneApproval, SceneComposer } from '../engine/types';
import {
  AssistantIcon,
  ChevronRightIcon,
  FolderIcon,
  FolderPlusIcon,
  LibraryIcon,
  LinkChainIcon,
  ModeWandIcon,
  ModelDotIcon,
  PaperclipIcon,
  PencilIcon,
  SearchIcon,
  SendPlaneIcon,
  SkillToolIcon,
} from './icons';

interface OverlayCommonProps {
  activeClickId: SimId | null;
  onTargetClick: (id: SimId) => void;
}

function makeClick(id: SimId, activeClickId: SimId | null, onTargetClick: (id: SimId) => void) {
  return {
    'data-sim-id': id,
    onClick: activeClickId === id ? () => onTargetClick(id) : undefined,
    style: activeClickId === id ? { cursor: 'pointer' } : undefined,
  };
}

/**
 * 5.11.3 一级 + 菜单 + 右侧二级面板（精确对照真机截图 B30662DB / 94D09E4D）
 * 向上弹出于输入框左下角 +（此时 + 变为 ×）正上方
 */
export function PlusMenuPopover({
  submenu,
  composer,
  activeClickId,
  onTargetClick,
}: OverlayCommonProps & {
  submenu: 'mode' | 'files';
  composer: Required<SceneComposer>;
}) {
  const isPlan = composer.mode === 'plan';
  const isAsk = composer.mode === 'ask';

  const modeSummary = isPlan
    ? '当前为计划模式，会先列出方案等你确认再执行。'
    : isAsk
      ? '当前为仅问答模式，只回答问题，不会修改任何文件。'
      : '当前为默认模式，可高效执行并完成任务。';

  return (
    <div
      {...makeClick('plusMenu', activeClickId, onTargetClick)}
      className="absolute left-2 bottom-[100px] z-20 flex items-end gap-1.5 select-none"
    >
      {/* 一级菜单 */}
      <div className="w-[206px] rounded-[14px] bg-white border border-[#e6e6e3] shadow-[0_14px_36px_rgba(17,19,24,0.14)] p-1.5 text-[13.5px] text-[#1f2329]">
        <div
          {...makeClick('plusMenu.files', activeClickId, onTargetClick)}
          className={`flex items-center justify-between px-2.5 py-2 rounded-lg ${
            submenu === 'files' ? 'bg-[#f3f4f6] font-medium' : ''
          }`}
        >
          <span className="flex items-center gap-2.5">
            <PaperclipIcon size={15} className="text-[#4a4f57]" />
            <span>添加文件</span>
          </span>
          <ChevronRightIcon size={12} className="text-[#9ea3ad]" />
        </div>

        {composer.group && (
          <div
            {...makeClick('plusMenu.quoteFile', activeClickId, onTargetClick)}
            className="flex items-center justify-between px-2.5 py-2 rounded-lg"
          >
            <span className="flex items-center gap-2.5">
              <span className="w-[15px] text-center font-mono text-[13px] text-[#4a4f57]">@</span>
              <span>引用对话中的文件</span>
            </span>
            <ChevronRightIcon size={12} className="text-[#9ea3ad]" />
          </div>
        )}

        <div className="h-px bg-[#eeeeeb] my-1.5 mx-1" />

        <div
          {...makeClick('plusMenu.modeItem', activeClickId, onTargetClick)}
          className={`flex items-center justify-between px-2.5 py-2 rounded-lg ${
            submenu === 'mode' ? 'bg-[#f3f4f6] font-medium' : ''
          }`}
        >
          <span className="flex items-center gap-2.5">
            <ModeWandIcon size={15} className="text-[#4a4f57]" />
            <span>模式</span>
          </span>
          <ChevronRightIcon size={12} className="text-[#9ea3ad]" />
        </div>

        <div
          {...makeClick('plusMenu.extensions', activeClickId, onTargetClick)}
          className="flex flex-col"
        >
          <div
            {...makeClick('plusMenu.expert', activeClickId, onTargetClick)}
            className="flex items-center justify-between px-2.5 py-2 rounded-lg"
          >
            <span className="flex items-center gap-2.5">
              <AssistantIcon size={15} className="text-[#4a4f57]" />
              <span>专家</span>
            </span>
            <ChevronRightIcon size={12} className="text-[#9ea3ad]" />
          </div>
          <div
            {...makeClick('plusMenu.skill', activeClickId, onTargetClick)}
            className="flex items-center justify-between px-2.5 py-2 rounded-lg"
          >
            <span className="flex items-center gap-2.5">
              <SkillToolIcon size={15} className="text-[#4a4f57]" />
              <span>技能</span>
            </span>
            <ChevronRightIcon size={12} className="text-[#9ea3ad]" />
          </div>
          <div
            {...makeClick('plusMenu.connector', activeClickId, onTargetClick)}
            className="flex items-center justify-between px-2.5 py-2 rounded-lg"
          >
            <span className="flex items-center gap-2.5">
              <LinkChainIcon size={15} className="text-[#4a4f57]" />
              <span>连接器</span>
            </span>
            <ChevronRightIcon size={12} className="text-[#9ea3ad]" />
          </div>
        </div>
      </div>

      {/* 二级面板：模式（Plan / Ask 开关，精确对照 B30662DB） */}
      {submenu === 'mode' && (
        <div
          {...makeClick('plusMenu.mode', activeClickId, onTargetClick)}
          className="w-[236px] rounded-[14px] bg-white border border-[#e6e6e3] shadow-[0_14px_36px_rgba(17,19,24,0.14)] p-3.5 text-[13.5px]"
        >
          <p className="m-0 pb-3 text-[12.5px] leading-[1.6] text-[#6b7079] border-b border-[#eeeeeb]">
            {modeSummary}
          </p>
          <div className="pt-2.5 flex flex-col gap-1.5">
            <div
              {...makeClick('plusMenu.mode.plan', activeClickId, onTargetClick)}
              className={`flex items-center justify-between px-2 py-2 rounded-lg ${
                isPlan ? 'bg-accent-50' : ''
              }`}
            >
              <span>
                <strong className="font-medium text-[#111318]">计划</strong>{' '}
                <span className="text-[#8c9099] text-[12.5px]">Plan</span>
              </span>
              <span
                className={`w-[36px] h-[20px] rounded-full relative inline-block transition-colors ${
                  isPlan ? 'bg-accent-600' : 'bg-[#dcdcd8]'
                }`}
              >
                <span
                  className={`absolute top-[2px] w-4 h-4 rounded-full bg-white shadow-xs transition-all ${
                    isPlan ? 'right-[2px]' : 'left-[2px]'
                  }`}
                />
              </span>
            </div>

            <div
              {...makeClick('plusMenu.mode.ask', activeClickId, onTargetClick)}
              className={`flex items-center justify-between px-2 py-2 rounded-lg ${
                isAsk ? 'bg-accent-50' : ''
              }`}
            >
              <span>
                <strong className="font-medium text-[#111318]">仅问答</strong>{' '}
                <span className="text-[#8c9099] text-[12.5px]">Ask</span>
              </span>
              <span
                className={`w-[36px] h-[20px] rounded-full relative inline-block transition-colors ${
                  isAsk ? 'bg-accent-600' : 'bg-[#dcdcd8]'
                }`}
              >
                <span
                  className={`absolute top-[2px] w-4 h-4 rounded-full bg-white shadow-xs transition-all ${
                    isAsk ? 'right-[2px]' : 'left-[2px]'
                  }`}
                />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 二级面板：添加文件（对照 94D09E4D） */}
      {submenu === 'files' && (
        <div
          {...makeClick('plusMenu.filesSubmenu', activeClickId, onTargetClick)}
          className="w-[186px] rounded-[14px] bg-white border border-[#e6e6e3] shadow-[0_14px_36px_rgba(17,19,24,0.14)] p-1.5 text-[13.5px] text-[#1f2329]"
        >
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-[#f4f4f2]">
            <span className="text-[#4a4f57]">↑</span>
            <span>本地文件</span>
          </div>
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-[#f4f4f2]">
            <LibraryIcon size={15} className="text-[#4a4f57]" />
            <span>资料库</span>
          </div>
          <div className="h-px bg-[#eeeeeb] my-1.5 mx-1" />
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[#4a4f57]">
            <span>腾讯文档</span>
          </div>
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[#4a4f57]">
            <span>ima</span>
          </div>
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[#4a4f57]">
            <span>乐享知识库</span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 5.11.3 权限弹窗（对照真机截图 71293BF1）
 */
export function PermissionPopover({
  permission,
  activeClickId,
  onTargetClick,
}: OverlayCommonProps & { permission: 'default' | 'full' }) {
  const isFull = permission === 'full';
  return (
    <div
      {...makeClick('permissionMenu', activeClickId, onTargetClick)}
      className="absolute left-[118px] bottom-[44px] z-20 w-[238px] rounded-[14px] bg-white border border-[#e6e6e3] shadow-[0_14px_36px_rgba(17,19,24,0.14)] p-3.5 text-[13px] select-none"
    >
      <p className="m-0 pb-3 text-[12.5px] leading-[1.65] text-[#6b7079] border-b border-[#eeeeeb]">
        {isFull
          ? '当前权限为允许完全访问，请注意数据安全，建议执行可信任的任务。'
          : '当前为默认权限，涉及敏感目录、删除文件或运行命令前会先请你确认。'}
      </p>
      <div
        {...makeClick('permissionMenu.fullAccess', activeClickId, onTargetClick)}
        className="mt-2.5 flex items-center justify-between px-2.5 py-2 rounded-[10px] bg-[#f4f4f4]"
      >
        <span className="font-medium text-[#111318] text-[13.5px]">允许完全访问</span>
        <span
          className={`w-[36px] h-[20px] rounded-full relative inline-block ${
            isFull ? 'bg-[#a92b34]' : 'bg-[#dcdcd8]'
          }`}
        >
          <span
            className={`absolute top-[2px] w-4 h-4 rounded-full bg-white shadow-xs ${
              isFull ? 'right-[2px]' : 'left-[2px]'
            }`}
          />
        </span>
      </div>
    </div>
  );
}

/**
 * 5.11.3 选择分组下拉（对照真机截图 3F8134E9）
 */
export function GroupPopover({
  activeGroup,
  activeClickId,
  onTargetClick,
}: OverlayCommonProps & { activeGroup: string | null }) {
  const groups = ['WorkBuddy-练习', '01_会议纪要', '02_季度分析'];
  return (
    <div
      {...makeClick('groupMenu', activeClickId, onTargetClick)}
      className="absolute left-2 bottom-[44px] z-20 w-[224px] rounded-[14px] bg-white border border-[#e6e6e3] shadow-[0_14px_36px_rgba(17,19,24,0.14)] p-2 text-[13.5px] text-[#1f2329] select-none"
    >
      <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#f5f5f5] text-[#8c9099] text-[12.5px] mb-1.5">
        <SearchIcon size={13} />
        <span>搜索分组</span>
      </div>
      <div className="flex flex-col gap-0.5">
        {groups.map((name) => (
          <div
            key={name}
            className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg ${
              activeGroup === name ? 'bg-[#f3f4f6] font-medium text-[#111318]' : 'text-[#2b2f36]'
            }`}
          >
            <FolderIcon size={14} className="text-[#5c5f66]" />
            <span className="truncate">{name}</span>
          </div>
        ))}
      </div>
      <div className="h-px bg-[#eeeeeb] my-1.5 mx-1" />
      <div
        {...makeClick('groupMenu.new', activeClickId, onTargetClick)}
        className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[#2b2f36]"
      >
        <FolderPlusIcon size={14} className="text-[#5c5f66]" />
        <span>新建分组</span>
      </div>
      <div
        {...makeClick('groupMenu.pickFolder', activeClickId, onTargetClick)}
        className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-[#f3f4f6] text-[#111318]"
      >
        <FolderIcon size={14} className="text-[#5c5f66]" />
        <span>选择本地文件夹</span>
      </div>
    </div>
  );
}

/**
 * 5.11.3 模型下拉（对照真机截图 B3D4375C）
 */
export function ModelPopover({
  selectedModel,
  activeClickId,
  onTargetClick,
}: OverlayCommonProps & { selectedModel: string }) {
  const autoModes = [
    { name: '快速', rate: '0.15x' },
    { name: '均衡', rate: '0.50x' },
    { name: '极致', rate: '1.00x' },
  ];
  const models = [
    { name: 'Hy4', rate: '0.29x', badge: null },
    { name: 'Hy4 flash', rate: '0.00x', badge: '限时免费' },
    { name: 'DeepSeek-V4.1', rate: '0.11x', badge: '夜间折扣' },
    { name: 'GLM-5.3', rate: '0.69x', badge: '订阅优先' },
  ];
  return (
    <div
      {...makeClick('modelMenu', activeClickId, onTargetClick)}
      className="absolute right-[72px] bottom-[96px] z-20 w-[264px] rounded-[14px] bg-white border border-[#e6e6e3] shadow-[0_14px_36px_rgba(17,19,24,0.14)] p-1.5 text-[13px] select-none"
    >
      {autoModes.map((m) => (
        <div key={m.name} className="flex items-center justify-between px-2.5 py-2 rounded-lg text-[#1f2329]">
          <span className="font-medium">{m.name}</span>
          <span className="font-mono text-[12px] text-[#8c9099]">{m.rate}</span>
        </div>
      ))}
      <div className="h-px bg-[#eeeeeb] my-1 mx-1" />
      {models.map((m) => {
        const isCurrent = selectedModel === m.name;
        return (
          <div
            key={m.name}
            className={`flex items-center justify-between px-2.5 py-2 rounded-lg ${
              isCurrent ? 'bg-[#f4f4f5] font-medium' : ''
            }`}
          >
            <span className="flex items-center gap-1.5 min-w-0">
              <ModelDotIcon size={13} />
              <span className="truncate text-[#1f2329]">{m.name}</span>
              {m.badge && (
                <span
                  className={`text-[10.5px] px-1.5 py-[1px] rounded-full shrink-0 ${
                    m.badge === '订阅优先'
                      ? 'bg-[#fff6ef] text-[#b45309]'
                      : 'bg-[#ecfdf5] text-[#047857]'
                  }`}
                >
                  {m.badge}
                </span>
              )}
            </span>
            <span className="font-mono text-[12px] text-[#8c9099] shrink-0">{m.rate}</span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * 5.11.3 @ 引用弹窗（对照真机截图 C33256F5）
 */
export function AtPopover({ activeClickId, onTargetClick }: OverlayCommonProps) {
  const items = [
    { name: '周报.docx', path: '/Users/学员/WorkBuddy/WorkBuddy-练习/', isDir: false },
    { name: '周末读书会群聊.txt', path: '/Users/学员/WorkBuddy/WorkBuddy-练习/', isDir: false },
    { name: 'deliverables', path: '/Users/学员/WorkBuddy/WorkBuddy-练习/', isDir: true },
  ];
  return (
    <div
      {...makeClick('atMenu', activeClickId, onTargetClick)}
      className="absolute left-0 right-0 bottom-[154px] z-20 rounded-[14px] bg-white border border-[#e6e6e3] shadow-[0_14px_36px_rgba(17,19,24,0.12)] p-1.5 text-[13px] select-none"
    >
      {items.map((it, idx) => (
        <div
          key={it.name}
          className={`flex items-center gap-2 px-2.5 py-2 rounded-lg ${idx === 0 ? 'bg-[#f4f4f5]' : ''}`}
        >
          {it.isDir ? (
            <FolderIcon size={14} className="text-[#3355e0] shrink-0" />
          ) : (
            <span className="w-4 h-4 rounded bg-[#0ea5e9] text-white text-[9px] font-bold inline-flex items-center justify-center shrink-0">
              W
            </span>
          )}
          <span className="font-medium text-[#111318] shrink-0">{it.name}</span>
          <span className="text-[#8c9099] text-[12px] truncate">{it.path}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * 5.11.3 默认权限底部审批卡片（精确对照真机截图 503AFD3E）
 * 位于对话区底部输入框位置，而不是屏幕中央模态框
 */
export function ApprovalCard({
  approval,
  activeClickId,
  onTargetClick,
}: OverlayCommonProps & { approval: SceneApproval }) {
  const questionText =
    approval.question || `确认${approval.action} ${approval.path}？`;

  return (
    <div
      {...makeClick('approvalDialog', activeClickId, onTargetClick)}
      className="w-full rounded-[20px] bg-white border border-[#e5e5e3] shadow-[0_8px_30px_rgba(17,19,24,0.08)] p-4 select-none"
    >
      {/* 顶行：确认问题 + < 1/1 > + × */}
      <div className="flex items-start justify-between gap-3 pb-3">
        <div className="text-[14px] leading-[1.6] font-semibold text-[#111318]">
          {approval.question ? (
            questionText
          ) : (
            <>
              确认{approval.action}{' '}
              <span
                {...makeClick('approvalDialog.path', activeClickId, onTargetClick)}
                className={
                  approval.outsideWorkspace
                    ? 'px-1.5 py-0.5 rounded bg-[#fff1e8] text-[#9a3412] font-mono text-[13px]'
                    : 'font-mono text-[13px]'
                }
              >
                {approval.path}
              </span>
              ？
            </>
          )}
          {approval.outsideWorkspace && (
            <span className="ml-2 inline-block align-middle text-[11px] font-semibold text-[#9a3412] bg-[#fff1e8] border border-[#f6d7c2] rounded px-1.5 py-[1px]">
              工作目录外
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-[12.5px] text-[#8c9099] shrink-0 pt-0.5">
          <span>‹</span>
          <span className="text-[#2b2f36] font-mono">1/1</span>
          <span>›</span>
          <span className="ml-1 text-[#2b2f36] text-[15px] leading-none">×</span>
        </div>
      </div>

      {/* 选项 1：确认执行（灰底高亮 + 尾部箭头） */}
      <div
        {...makeClick('approvalDialog.allow', activeClickId, onTargetClick)}
        className="flex items-center justify-between px-3 py-2.5 rounded-[10px] bg-[#f4f4f4] text-[13.5px] text-[#111318]"
      >
        <span className="flex items-center gap-2.5">
          <span className="w-5 h-5 rounded-md bg-white border border-[#e6e6e3] text-[11.5px] font-mono text-[#4a4f57] inline-flex items-center justify-center">
            1
          </span>
          <span>{approval.confirmLabel || '确认删除'}</span>
        </span>
        <span className="text-[#2b2f36]">→</span>
      </div>

      {/* 选项 2：取消操作 */}
      <div
        {...makeClick('approvalDialog.deny', activeClickId, onTargetClick)}
        className="flex items-center justify-between px-3 py-2.5 border-b border-[#f0f0ee] text-[13.5px] text-[#111318]"
      >
        <span className="flex items-center gap-2.5">
          <span className="w-5 h-5 rounded-md bg-[#f4f4f4] text-[11.5px] font-mono text-[#4a4f57] inline-flex items-center justify-center">
            2
          </span>
          <span>{approval.cancelLabel || '取消操作'}</span>
        </span>
      </div>

      {/* 选项 3：其他补充 */}
      <div
        {...makeClick('approvalDialog.other', activeClickId, onTargetClick)}
        className="flex items-center gap-2.5 px-3 py-2.5 border-b border-[#f0f0ee] text-[13.5px] text-[#8c9099]"
      >
        <span className="w-5 h-5 rounded-md bg-[#f4f4f4] text-[#4a4f57] inline-flex items-center justify-center">
          <PencilIcon size={12} />
        </span>
        <span>其他补充...</span>
      </div>

      {/* 右下角黑色圆形提交钮 */}
      <div className="pt-2.5 flex justify-end">
        <span className="w-8 h-8 rounded-full bg-[#1a1a1a] text-white inline-flex items-center justify-center">
          <SendPlaneIcon size={14} />
        </span>
      </div>
    </div>
  );
}
