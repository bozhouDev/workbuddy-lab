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
  SearchIcon,
  SkillToolIcon,
} from '../shell/icons';
import type { PlusSubmenu } from './types';

/** 5.11.3 左上角「发现应用」向下弹出卡片（对照 4429671F） */
export function DiscoverAppsPopover({ onClose }: { onClose: () => void }) {
  const apps = [
    { name: '美图设计室', desc: '海报与商品图快速生成', badge: '设计' },
    { name: '财税合规助手', desc: '发票核验与税务问答', badge: '财税' },
    { name: '投研速读', desc: '财报与研报重点提炼', badge: '金融' },
    { name: '粉笔学习搭子', desc: '备考题库与错题复盘', badge: '教育' },
  ];
  return (
    <div className="sim-pop-down absolute left-3 top-[78px] z-30 w-[268px] rounded-[14px] bg-white border border-[#e6e6e3] shadow-[0_16px_40px_rgba(17,19,24,0.16)] p-2.5 text-[13px]">
      <div className="flex items-center justify-between px-1.5 pb-2 border-b border-[#f0f0ee]">
        <span className="font-semibold text-[#111318] text-[12.5px]">发现垂直行业应用</span>
        <button
          type="button"
          onClick={onClose}
          className="border-0 bg-transparent text-[#8c9099] hover:text-[#111318] text-[14px] leading-none px-1 cursor-pointer"
          aria-label="关闭发现应用"
        >
          ×
        </button>
      </div>
      <div className="mt-1.5 flex flex-col gap-1">
        {apps.map((a) => (
          <div key={a.name} className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-[#f5f5f4]">
            <div className="min-w-0">
              <div className="font-medium text-[#111318] text-[13px]">{a.name}</div>
              <div className="text-[11.5px] text-[#6b7079] truncate">{a.desc}</div>
            </div>
            <span className="text-[10.5px] text-[#5c5f66] bg-[#f4f4f2] rounded-full px-2 py-0.5 shrink-0">
              {a.badge}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** 5.11.3 左侧「发现」展开的腾讯生态扩展菜单（对照 C0499DF5） */
export function DiscoverMenuPopover({ onClose }: { onClose: () => void }) {
  const items = [
    { name: '项目', badge: 'BETA' },
    { name: '我的邮箱', badge: null },
    { name: '腾讯文档', badge: null },
    { name: 'ima', badge: null },
    { name: '乐享知识库', badge: null },
    { name: '灵感', badge: null },
  ];
  return (
    <div className="sim-slide-right absolute left-[224px] top-[236px] z-30 w-[198px] rounded-[14px] bg-white border border-[#e6e6e3] shadow-[0_16px_40px_rgba(17,19,24,0.16)] p-1.5 text-[13px] text-[#1f2329]">
      <div className="flex items-center justify-between px-2.5 py-1.5 text-[11.5px] text-[#8c9099]">
        <span>更多与腾讯生态</span>
        <button
          type="button"
          onClick={onClose}
          className="border-0 bg-transparent text-[#8c9099] hover:text-[#111318] cursor-pointer"
          aria-label="关闭发现菜单"
        >
          ×
        </button>
      </div>
      {items.map((it) => (
        <div key={it.name} className="flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-[#f4f4f2]">
          <span>{it.name}</span>
          {it.badge && (
            <span className="text-[9.5px] text-[#8c9099] border border-[#dcdcd8] rounded-full px-1.5 py-[1px]">
              {it.badge}
            </span>
          )}
        </div>
      ))}
      <div className="h-px bg-[#eeeeeb] my-1 mx-1" />
      <div className="px-2.5 py-1.5 text-[12px] text-[#6b7079]">自定义左侧菜单显示</div>
    </div>
  );
}

/** 5.11.3 左下角头像向上弹出完整菜单（精确对照真机截图 CE3E149B） */
export function AvatarMenuPopover({ onClose }: { onClose: () => void }) {
  return (
    <div className="sim-pop-up absolute left-3 bottom-[52px] z-30 w-[268px] rounded-[16px] bg-[#f7f7f6] border border-[#e6e6e3] shadow-[0_18px_46px_rgba(17,19,24,0.18)] p-2 flex flex-col gap-2 text-[13px] select-none">
      {/* 头部用户信息 */}
      <div className="rounded-[12px] bg-white px-3 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-full bg-[#e3e7f3] text-[#3355e0] text-[13px] font-bold flex items-center justify-center">
            学
          </span>
          <span className="font-semibold text-[14px] text-[#111318]">学员（模拟账号）</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="border-0 bg-transparent text-[#8c9099] hover:text-[#111318] text-[15px] cursor-pointer"
          aria-label="关闭头像菜单"
        >
          ×
        </button>
      </div>

      {/* 套餐与积分余额 */}
      <div className="rounded-[12px] bg-white p-3 flex flex-col gap-2.5">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-[11px] text-[#8c9099]">套餐</div>
            <div className="text-[14px] font-bold text-[#111318]">体验版 ›</div>
          </div>
          <div>
            <div className="text-[11px] text-[#8c9099]">积分余额</div>
            <div className="text-[14px] font-bold font-mono text-[#111318]">1,200.00</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[12px]">
          <span className="h-7 rounded-lg bg-[#1a1a1a] text-white font-medium inline-flex items-center justify-center">
            升级套餐
          </span>
          <span className="h-7 rounded-lg border border-[#e6e6e3] text-[#8c9099] inline-flex items-center justify-center">
            购买积分
          </span>
        </div>
      </div>

      {/* 福利与设置入口 */}
      <div className="rounded-[12px] bg-white p-1.5 flex flex-col text-[13px] text-[#1f2329]">
        <div className="flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-[#f4f4f2]">
          <span>Buddy加油站</span>
          <span className="text-[#8c9099] text-[11.5px]">领免费额度 ›</span>
        </div>
        <div className="flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-[#f4f4f2]">
          <span>成长计划</span>
          <span className="text-[#8c9099] text-[11.5px]">新手福利 ›</span>
        </div>
        <div className="h-px bg-[#f0f0ee] my-1 mx-1" />
        <div className="flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-[#f4f4f2]">
          <span className="font-medium">设置</span>
          <span className="font-mono text-[11px] text-[#8c9099]">⌘,</span>
        </div>
        <div className="flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-[#f4f4f2]">
          <span>外观</span>
          <span className="text-[11.5px] text-[#8c9099]">浅色 ›</span>
        </div>
        <div className="flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-[#f4f4f2]">
          <span className="font-medium">记忆与进化</span>
          <span className="text-[#8c9099]">›</span>
        </div>
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[#6b7079] text-[12px]">
          <span>检查更新</span>
          <span className="font-mono text-[11px]">V5.11.3</span>
        </div>
      </div>
    </div>
  );
}

/** 5.11.3 两级级联 + 菜单（支持悬停/点击切换「添加文件」与「模式」二级面板 + 真实开关） */
export function LivePlusPopover({
  submenu,
  planOn,
  askOn,
  hasGroup,
  onSelectSubmenu,
  onTogglePlan,
  onToggleAsk,
}: {
  submenu: PlusSubmenu;
  planOn: boolean;
  askOn: boolean;
  hasGroup: boolean;
  onSelectSubmenu: (sub: PlusSubmenu) => void;
  onTogglePlan: () => void;
  onToggleAsk: () => void;
}) {
  const modeSummary = planOn
    ? '计划模式：先列出执行方案，等你确认再动手。'
    : askOn
      ? '仅问答模式：只看只回答，绝不改任何文件。'
      : '当前为默认模式，可高效执行并完成任务。';

  return (
    <div className="sim-pop-up absolute left-2 bottom-[102px] z-30 flex items-end gap-1.5 select-none">
      {/* 一级菜单 */}
      <div className="w-[198px] rounded-[14px] bg-white border border-[#e6e6e3] shadow-[0_14px_36px_rgba(17,19,24,0.16)] p-1.5 text-[13px] text-[#1f2329]">
        <button
          type="button"
          onMouseEnter={() => onSelectSubmenu('files')}
          onClick={() => onSelectSubmenu('files')}
          className={`w-full border-0 flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer transition-colors ${
            submenu === 'files' ? 'bg-[#f3f4f6] font-medium' : 'bg-transparent hover:bg-[#f5f5f4]'
          }`}
        >
          <span className="flex items-center gap-2.5">
            <PaperclipIcon size={15} className="text-[#4a4f57]" />
            <span>添加文件</span>
          </span>
          <ChevronRightIcon size={12} className="text-[#9ea3ad]" />
        </button>

        {hasGroup && (
          <div className="flex items-center justify-between px-2.5 py-2 rounded-lg text-[#2b2f36]">
            <span className="flex items-center gap-2.5">
              <span className="w-[15px] text-center font-mono text-[12.5px] text-[#4a4f57]">@</span>
              <span>引用对话中的文件</span>
            </span>
            <ChevronRightIcon size={12} className="text-[#9ea3ad]" />
          </div>
        )}

        <div className="h-px bg-[#eeeeeb] my-1 mx-1" />

        <button
          type="button"
          onMouseEnter={() => onSelectSubmenu('mode')}
          onClick={() => onSelectSubmenu('mode')}
          className={`w-full border-0 flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer transition-colors ${
            submenu === 'mode' ? 'bg-[#f3f4f6] font-medium' : 'bg-transparent hover:bg-[#f5f5f4]'
          }`}
        >
          <span className="flex items-center gap-2.5">
            <ModeWandIcon size={15} className="text-[#4a4f57]" />
            <span>模式</span>
          </span>
          <ChevronRightIcon size={12} className="text-[#9ea3ad]" />
        </button>

        <div className="flex items-center justify-between px-2.5 py-2 rounded-lg text-[#4a4f57]">
          <span className="flex items-center gap-2.5">
            <AssistantIcon size={15} />
            <span>专家</span>
          </span>
          <ChevronRightIcon size={12} className="text-[#9ea3ad]" />
        </div>
        <div className="flex items-center justify-between px-2.5 py-2 rounded-lg text-[#4a4f57]">
          <span className="flex items-center gap-2.5">
            <SkillToolIcon size={15} />
            <span>技能</span>
          </span>
          <ChevronRightIcon size={12} className="text-[#9ea3ad]" />
        </div>
        <div className="flex items-center justify-between px-2.5 py-2 rounded-lg text-[#4a4f57]">
          <span className="flex items-center gap-2.5">
            <LinkChainIcon size={15} />
            <span>连接器</span>
          </span>
          <ChevronRightIcon size={12} className="text-[#9ea3ad]" />
        </div>
      </div>

      {/* 二级：模式开关面板 */}
      {submenu === 'mode' && (
        <div
          key="mode-sub"
          className="sim-slide-right w-[228px] rounded-[14px] bg-white border border-[#e6e6e3] shadow-[0_14px_36px_rgba(17,19,24,0.16)] p-3.5 text-[13px]"
        >
          <p className="m-0 pb-2.5 text-[12px] leading-[1.6] text-[#6b7079] border-b border-[#eeeeeb]">
            {modeSummary}
          </p>
          <div className="pt-2 flex flex-col gap-1">
            <button
              type="button"
              onClick={onTogglePlan}
              className={`w-full border-0 flex items-center justify-between px-2 py-2 rounded-lg cursor-pointer transition-colors ${
                planOn ? 'bg-accent-50' : 'bg-transparent hover:bg-[#f5f5f4]'
              }`}
            >
              <span>
                <strong className="font-medium text-[#111318]">计划</strong>{' '}
                <span className="text-[#8c9099] text-[12px]">Plan</span>
              </span>
              <span
                className={`w-[34px] h-[19px] rounded-full relative inline-block transition-colors duration-200 ${
                  planOn ? 'bg-accent-600' : 'bg-[#dcdcd8]'
                }`}
              >
                <span
                  className={`absolute top-[2px] w-[15px] h-[15px] rounded-full bg-white shadow-xs transition-all duration-200 ${
                    planOn ? 'left-[17px]' : 'left-[2px]'
                  }`}
                />
              </span>
            </button>

            <button
              type="button"
              onClick={onToggleAsk}
              className={`w-full border-0 flex items-center justify-between px-2 py-2 rounded-lg cursor-pointer transition-colors ${
                askOn ? 'bg-accent-50' : 'bg-transparent hover:bg-[#f5f5f4]'
              }`}
            >
              <span>
                <strong className="font-medium text-[#111318]">仅问答</strong>{' '}
                <span className="text-[#8c9099] text-[12px]">Ask</span>
              </span>
              <span
                className={`w-[34px] h-[19px] rounded-full relative inline-block transition-colors duration-200 ${
                  askOn ? 'bg-accent-600' : 'bg-[#dcdcd8]'
                }`}
              >
                <span
                  className={`absolute top-[2px] w-[15px] h-[15px] rounded-full bg-white shadow-xs transition-all duration-200 ${
                    askOn ? 'left-[17px]' : 'left-[2px]'
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      )}

      {/* 二级：添加文件面板 */}
      {submenu === 'files' && (
        <div
          key="files-sub"
          className="sim-slide-right w-[178px] rounded-[14px] bg-white border border-[#e6e6e3] shadow-[0_14px_36px_rgba(17,19,24,0.16)] p-1.5 text-[13px] text-[#1f2329]"
        >
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-[#f4f4f2]">
            <span>↑</span>
            <span>本地文件</span>
          </div>
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-[#f4f4f2]">
            <LibraryIcon size={14} className="text-[#4a4f57]" />
            <span>资料库</span>
          </div>
          <div className="h-px bg-[#eeeeeb] my-1 mx-1" />
          <div className="px-2.5 py-1.5 rounded-lg text-[#4a4f57]">腾讯文档</div>
          <div className="px-2.5 py-1.5 rounded-lg text-[#4a4f57]">ima</div>
          <div className="px-2.5 py-1.5 rounded-lg text-[#4a4f57]">乐享知识库</div>
        </div>
      )}
    </div>
  );
}

/** 5.11.3 分组下拉菜单（对照 3F8134E9） */
export function LiveGroupPopover({
  selectedGroup,
  onSelectGroup,
}: {
  selectedGroup: string | null;
  onSelectGroup: (name: string) => void;
}) {
  const groups = ['WorkBuddy-练习', '01_会议纪要', '02_季度分析'];
  return (
    <div className="sim-pop-up absolute left-2 bottom-[44px] z-30 w-[224px] rounded-[14px] bg-white border border-[#e6e6e3] shadow-[0_14px_36px_rgba(17,19,24,0.16)] p-2 text-[13px] text-[#1f2329] select-none">
      <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#f5f5f5] text-[#8c9099] text-[12px] mb-1.5">
        <SearchIcon size={13} />
        <span>搜索分组</span>
      </div>
      <div className="flex flex-col gap-0.5">
        {groups.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => onSelectGroup(name)}
            className={`w-full border-0 flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer text-left transition-colors ${
              selectedGroup === name
                ? 'bg-[#eef2ff] text-accent-600 font-medium'
                : 'bg-transparent text-[#2b2f36] hover:bg-[#f4f4f2]'
            }`}
          >
            <FolderIcon size={14} className="shrink-0" />
            <span className="truncate">{name}</span>
          </button>
        ))}
      </div>
      <div className="h-px bg-[#eeeeeb] my-1.5 mx-1" />
      <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[#4a4f57]">
        <FolderPlusIcon size={14} />
        <span>新建分组</span>
      </div>
      <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[#4a4f57]">
        <FolderIcon size={14} />
        <span>选择本地文件夹</span>
      </div>
    </div>
  );
}

/** 5.11.3 权限弹窗（对照 71293BF1） */
export function LivePermissionPopover({
  fullAccessOn,
  onToggleFullAccess,
}: {
  fullAccessOn: boolean;
  onToggleFullAccess: () => void;
}) {
  return (
    <div className="sim-pop-up absolute left-[110px] bottom-[44px] z-30 w-[240px] rounded-[14px] bg-white border border-[#e6e6e3] shadow-[0_14px_36px_rgba(17,19,24,0.16)] p-3.5 text-[13px] select-none">
      <p className="m-0 pb-3 text-[12px] leading-[1.65] text-[#6b7079] border-b border-[#eeeeeb]">
        {fullAccessOn
          ? '当前权限为允许完全访问，请注意数据安全，建议执行可信任的任务。'
          : '当前为默认权限，涉及敏感目录、删除文件或运行命令前会先请你确认。'}
      </p>
      <button
        type="button"
        onClick={onToggleFullAccess}
        className="mt-2.5 w-full border-0 flex items-center justify-between px-2.5 py-2 rounded-[10px] bg-[#f4f4f4] cursor-pointer"
      >
        <span className="font-medium text-[#111318] text-[13px]">允许完全访问</span>
        <span
          className={`w-[36px] h-[20px] rounded-full relative inline-block transition-colors duration-200 ${
            fullAccessOn ? 'bg-[#a92b34]' : 'bg-[#dcdcd8]'
          }`}
        >
          <span
            className={`absolute top-[2px] w-4 h-4 rounded-full bg-white shadow-xs transition-all duration-200 ${
              fullAccessOn ? 'left-[18px]' : 'left-[2px]'
            }`}
          />
        </span>
      </button>
    </div>
  );
}

/** 5.11.3 模型下拉菜单（对照 B3D4375C） */
export function LiveModelPopover({
  selectedModel,
  onSelectModel,
}: {
  selectedModel: string;
  onSelectModel: (model: string) => void;
}) {
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
    <div className="sim-pop-up absolute right-[60px] bottom-[96px] z-30 w-[256px] rounded-[14px] bg-white border border-[#e6e6e3] shadow-[0_14px_36px_rgba(17,19,24,0.16)] p-1.5 text-[12.5px] select-none">
      {autoModes.map((m) => (
        <button
          key={m.name}
          type="button"
          onClick={() => onSelectModel(m.name)}
          className={`w-full border-0 flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer ${
            selectedModel === m.name ? 'bg-[#f4f4f5] font-medium' : 'bg-transparent hover:bg-[#f7f7f6]'
          }`}
        >
          <span className="text-[#1f2329]">{m.name}</span>
          <span className="font-mono text-[11.5px] text-[#8c9099]">{m.rate}</span>
        </button>
      ))}
      <div className="h-px bg-[#eeeeeb] my-1 mx-1" />
      {models.map((m) => (
        <button
          key={m.name}
          type="button"
          onClick={() => onSelectModel(m.name)}
          className={`w-full border-0 flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer ${
            selectedModel === m.name ? 'bg-[#f4f4f5] font-medium' : 'bg-transparent hover:bg-[#f7f7f6]'
          }`}
        >
          <span className="flex items-center gap-1.5 min-w-0">
            <ModelDotIcon size={13} />
            <span className="truncate text-[#1f2329]">{m.name}</span>
            {m.badge && (
              <span
                className={`text-[10px] px-1.5 py-[1px] rounded-full shrink-0 ${
                  m.badge === '订阅优先'
                    ? 'bg-[#fff6ef] text-[#b45309]'
                    : 'bg-[#ecfdf5] text-[#047857]'
                }`}
              >
                {m.badge}
              </span>
            )}
          </span>
          <span className="font-mono text-[11.5px] text-[#8c9099] shrink-0">{m.rate}</span>
        </button>
      ))}
    </div>
  );
}
