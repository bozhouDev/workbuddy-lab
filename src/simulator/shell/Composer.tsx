import type { SimId } from '../registry';
import type { SceneComposer, SceneData } from '../engine/types';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  FolderIcon,
  MicIcon,
  ModelDotIcon,
  SendPlaneIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  SparkleIcon,
} from './icons';
import {
  AtPopover,
  GroupPopover,
  ModelPopover,
  PermissionPopover,
  PlusMenuPopover,
} from './Overlays';
import { RichText } from './RichText';

interface ComposerProps {
  scene: SceneData;
  compact?: boolean;
  activeClickId: SimId | null;
  onTargetClick: (id: SimId) => void;
}

export function Composer({ scene, compact = false, activeClickId, onTargetClick }: ComposerProps) {
  const composer: Required<SceneComposer> = {
    text: scene.composer?.text ?? '',
    mode: scene.composer?.mode ?? 'default',
    permission: scene.composer?.permission ?? 'default',
    group: scene.composer?.group ?? null,
    model: scene.composer?.model ?? 'Hy4 flash',
  };

  const hasText = composer.text.trim().length > 0;
  const isPlusOpen = scene.overlay === 'plusMenu' || scene.overlay === 'plusMenuFiles';
  const isGroupOpen = scene.overlay === 'groupMenu';
  const isPermOpen = scene.overlay === 'permissionMenu';
  const isModelOpen = scene.overlay === 'modelMenu';
  const isFullAccess = composer.permission === 'full';

  const clickProps = (id: SimId) => ({
    'data-sim-id': id,
    tabIndex: activeClickId === id ? 0 : -1,
    onClick: activeClickId === id ? () => onTargetClick(id) : undefined,
    style: activeClickId === id ? { cursor: 'pointer' } : undefined,
  });

  return (
    <div
      data-sim-id="composer"
      className={`relative w-full ${compact ? 'max-w-full' : 'max-w-[680px]'} select-none`}
    >
      {/* 各类向上弹出的 5.11.3 原生 Popover */}
      {isPlusOpen && (
        <PlusMenuPopover
          submenu={scene.overlay === 'plusMenuFiles' ? 'files' : 'mode'}
          composer={composer}
          activeClickId={activeClickId}
          onTargetClick={onTargetClick}
        />
      )}
      {isPermOpen && (
        <PermissionPopover
          permission={composer.permission}
          activeClickId={activeClickId}
          onTargetClick={onTargetClick}
        />
      )}
      {isGroupOpen && (
        <GroupPopover
          activeGroup={composer.group}
          activeClickId={activeClickId}
          onTargetClick={onTargetClick}
        />
      )}
      {isModelOpen && (
        <ModelPopover
          selectedModel={composer.model}
          activeClickId={activeClickId}
          onTargetClick={onTargetClick}
        />
      )}
      {scene.overlay === 'atMenu' && (
        <AtPopover activeClickId={activeClickId} onTargetClick={onTargetClick} />
      )}

      {/* 5.11.3 双层复合底座容器：外层浅灰大圆角 + 内层白色主输入卡 + 底部托盘 */}
      <div className="rounded-[22px] bg-[#f4f4f5] p-[1px]">
        {/* 上层白底输入卡 */}
        <div className="rounded-[20px] bg-white border border-[#e6e6e6] px-4 pt-3.5 pb-2.5 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
          {/* 输入文本呈现区（非真实 input，严守安全规范） */}
          <div
            {...clickProps('composer.input')}
            className={`${compact ? 'min-h-[38px]' : 'min-h-[56px]'} text-[14.5px] leading-[1.65]`}
          >
            {hasText ? (
              <span className="text-[#111318]">
                <RichText text={composer.text} />
              </span>
            ) : (
              <span className="text-[#9ea3ad]">今天帮你做些什么？@ 添加上下文，/调用技能与指令</span>
            )}
          </div>

          {/* 底部工具条：左下 + / × + 模式徽标；右下 增强提示词 + 模型 + 麦克风 + 发送 */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={isPlusOpen ? '关闭添加菜单' : '打开添加菜单'}
                {...clickProps('composer.plus')}
                className={`w-8 h-8 rounded-lg border-0 inline-flex items-center justify-center text-[19px] leading-none transition-colors ${
                  isPlusOpen
                    ? 'bg-[#f3f4f6] text-[#111318]'
                    : 'bg-transparent text-[#2b2f36] hover:bg-[#f4f4f2]'
                }`}
              >
                {isPlusOpen ? '×' : '+'}
              </button>

              {composer.mode !== 'default' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent-50 border border-accent-200 text-accent-600 text-[12px] font-medium">
                  {composer.mode === 'plan' ? '计划 Plan' : '仅问答 Ask'}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-[12.5px] text-[#2b2f36]">
              {hasText && (
                <span
                  {...clickProps('composer.enhance')}
                  className="inline-flex items-center justify-center w-6 h-6 rounded-md text-[#4a4f57]"
                  title="增强提示词"
                >
                  <SparkleIcon size={15} />
                </span>
              )}

              <span
                {...clickProps('composer.model')}
                className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full font-medium ${
                  isModelOpen ? 'bg-[#f4f4f5]' : ''
                }`}
              >
                <ModelDotIcon size={14} />
                <span>{composer.model}</span>
                {isModelOpen ? <ChevronUpIcon size={11} /> : <ChevronDownIcon size={11} />}
              </span>

              <span
                {...clickProps('composer.voice')}
                className="inline-flex items-center justify-center text-[#3a3e45]"
              >
                <MicIcon size={15} />
              </span>

              <span
                {...clickProps('composer.send')}
                className={`w-8 h-8 rounded-full inline-flex items-center justify-center text-white transition-colors ${
                  hasText ? 'bg-[#1a1a1a]' : 'bg-[#c9ccd1]'
                }`}
              >
                <SendPlaneIcon size={14} />
              </span>
            </div>
          </div>
        </div>

        {/* 下层浅灰托盘：选择分组 + 权限开关（对照 C271020A / 71293BF1） */}
        <div className="h-10 px-4 flex items-center gap-5 text-[12.5px]">
          <button
            type="button"
            {...clickProps('composer.group')}
            className={`inline-flex items-center gap-1.5 border-0 bg-transparent p-0 font-normal ${
              isGroupOpen ? 'text-[#111318] font-medium' : 'text-[#5c5f66]'
            }`}
          >
            <FolderIcon size={14} />
            <span>{composer.group ?? '选择分组'}</span>
            {isGroupOpen ? <ChevronUpIcon size={11} /> : <ChevronDownIcon size={11} />}
          </button>

          <button
            type="button"
            {...clickProps('composer.permission')}
            className={`inline-flex items-center gap-1.5 border-0 bg-transparent p-0 ${
              isFullAccess
                ? 'text-[#111318] font-semibold'
                : isPermOpen
                  ? 'text-[#111318] font-medium'
                  : 'text-[#5c5f66] font-normal'
            }`}
          >
            {isFullAccess ? (
              <ShieldAlertIcon size={14} className="text-[#a92b34]" />
            ) : (
              <ShieldCheckIcon size={14} />
            )}
            <span>{isFullAccess ? '允许完全访问' : '默认权限'}</span>
            {isPermOpen ? <ChevronUpIcon size={11} /> : <ChevronDownIcon size={11} />}
          </button>
        </div>
      </div>
    </div>
  );
}
