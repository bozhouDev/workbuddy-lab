import type { SimId } from '../registry';
import type { SceneData } from '../engine/types';
import {
  AssistantIcon,
  BellIcon,
  ChevronDownIcon,
  DiscoverIcon,
  ExtensionsIcon,
  FilterIcon,
  FolderIcon,
  LibraryIcon,
  MobileLinkIcon,
  NewTaskIcon,
  PanelLeftIcon,
  ScheduleIcon,
  SearchIcon,
} from './icons';

interface SidebarProps {
  scene: SceneData;
  activeClickId: SimId | null;
  onTargetClick: (id: SimId) => void;
}

export function Sidebar({ scene, activeClickId, onTargetClick }: SidebarProps) {
  const activeGroup = scene.composer?.group ?? 'WorkBuddy-练习';
  const firstUserText = scene.messages
    ?.find((m) => m.role === 'user')
    ?.blocks.find((b) => b.type === 'text');
  const recentTitle =
    scene.chatTitle ||
    (firstUserText && firstUserText.type === 'text' ? firstUserText.text.slice(0, 14) : '整理 11 月周报');

  const clickProps = (id: SimId) => ({
    'data-sim-id': id,
    onClick: activeClickId === id ? () => onTargetClick(id) : undefined,
    style: activeClickId === id ? { cursor: 'pointer' } : undefined,
  });

  const isNavActive = (view: SceneData['view']) =>
    scene.view === view ? 'bg-[#eaeae8] font-medium text-[#111318]' : 'text-[#2b2f36]';

  return (
    <aside className="w-[232px] shrink-0 bg-[#f7f7f7] border-r border-[#ebebeb] flex flex-col select-none text-[13.5px]">
      {/* 顶行：macOS 三圆点 + 右侧 3 工具图标（对照 C271020A） */}
      <div className="h-10 px-3.5 flex items-center justify-between">
        <div className="flex items-center gap-[7px]" aria-hidden="true">
          <span className="w-3 h-3 rounded-full bg-[#ff5f57] border border-black/5" />
          <span className="w-3 h-3 rounded-full bg-[#febc2e] border border-black/5" />
          <span className="w-3 h-3 rounded-full bg-[#28c840] border border-black/5" />
        </div>
        <div className="flex items-center gap-2.5 text-[#5c5f66]">
          <PanelLeftIcon size={15} />
          <SearchIcon size={15} />
          <FilterIcon size={15} />
        </div>
      </div>

      {/* 品牌行：WorkBuddy 5.11.3 · 模拟 + 发现应用胶囊 */}
      <div className="px-3 pt-1 pb-3 flex items-center justify-between gap-1">
        <div className="flex items-baseline gap-1 min-w-0">
          <span className="font-bold text-[13.5px] tracking-[-0.02em] text-[#111318] whitespace-nowrap">
            WorkBuddy
          </span>
          <span className="text-[10px] text-[#8c9099] font-mono whitespace-nowrap">5.11.3·模拟</span>
        </div>
        <div
          {...clickProps('sidebar.discoverApps')}
          className="inline-flex items-center gap-0.5 text-[10.5px] text-[#5c5f66] bg-[#efefef] rounded-full px-1.5 py-[2.5px] shrink-0 whitespace-nowrap"
        >
          <span>发现应用</span>
          <ChevronDownIcon size={9} />
        </div>
      </div>

      {/* 全局主导航 6 项 */}
      <div className="px-2.5 flex flex-col gap-0.5">
        <div
          {...clickProps('sidebar.newTask')}
          className={`flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg ${isNavActive('home')}`}
        >
          <NewTaskIcon size={16} />
          <span>新建任务</span>
        </div>
        <div
          {...clickProps('sidebar.assistant')}
          className="flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[#2b2f36]"
        >
          <AssistantIcon size={16} />
          <span>助理</span>
          <span className="text-[9.5px] leading-none text-[#8c9099] border border-[#dadad7] rounded-full px-1.5 py-[2px]">
            BETA
          </span>
        </div>
        <div
          {...clickProps('sidebar.extensions')}
          className={`flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg ${isNavActive('extensions')}`}
        >
          <ExtensionsIcon size={16} />
          <span>专家·技能·连接器</span>
        </div>
        <div
          {...clickProps('sidebar.schedule')}
          className={`flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg ${isNavActive('schedule')}`}
        >
          <ScheduleIcon size={16} />
          <span>定时任务</span>
        </div>
        <div
          {...clickProps('sidebar.library')}
          className={`flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg ${isNavActive('library')}`}
        >
          <LibraryIcon size={16} />
          <span>资料库</span>
        </div>
        <div
          {...clickProps('sidebar.discover')}
          className="flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[#2b2f36]"
        >
          <DiscoverIcon size={16} />
          <span>发现</span>
        </div>
      </div>

      {/* 最近与分组列表 */}
      <div className="mt-4 px-2.5 flex flex-col gap-0.5 overflow-y-auto flex-1">
        <div {...clickProps('sidebar.recent')} className="px-2.5 pt-2 pb-1 text-[11.5px] text-[#8c9099]">
          最近
        </div>
        <div
          className={`px-2.5 py-1.5 rounded-lg text-[13px] truncate ${
            scene.view === 'chat' ? 'bg-[#eaeae8] text-[#111318] font-medium' : 'text-[#4a4f57]'
          }`}
        >
          {recentTitle}
        </div>

        <div {...clickProps('sidebar.groups')} className="px-2.5 pt-4 pb-1 text-[11.5px] text-[#8c9099]">
          分组
        </div>
        <div className="px-2.5 py-1.5 rounded-lg text-[13px] text-[#4a4f57] flex items-center gap-2">
          <FolderIcon size={14} className="text-[#6b7079] shrink-0" />
          <span className="truncate">{activeGroup}</span>
        </div>
      </div>

      {/* 左下角：头像 + 通知铃铛 + 手机互联（对照 C271020A / CE3E149B） */}
      <div className="px-3 py-2.5 border-t border-[#ebebeb] flex items-center justify-between text-[#5c5f66]">
        <div {...clickProps('sidebar.avatar')} className="flex items-center gap-2 px-1 py-0.5 rounded-lg">
          <span className="w-6 h-6 rounded-full bg-[#e3e7f3] text-[#3355e0] text-[11px] font-semibold flex items-center justify-center">
            学
          </span>
          <span className="text-[13px] font-medium text-[#1f2329]">学员</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span {...clickProps('sidebar.notify')} className="inline-flex items-center justify-center p-1">
            <BellIcon size={15} />
          </span>
          <span {...clickProps('sidebar.mobileConnect')} className="inline-flex items-center justify-center p-1">
            <MobileLinkIcon size={15} />
          </span>
        </div>
      </div>
    </aside>
  );
}
