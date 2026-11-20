import type { SimId } from '../registry';
import type { SceneData } from '../engine/types';
import { Composer } from './Composer';
import { PanelRightIcon } from './icons';

interface HomeViewProps {
  scene: SceneData;
  activeClickId: SimId | null;
  onTargetClick: (id: SimId) => void;
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

const SUGGESTIONS = [
  '未来一个月，哪些大事可能影响市场',
  '第一次用 AI 办公，可以先做哪 3 件事',
  '把杂乱的群聊记录整理成待办清单',
  '帮我做一份季度复盘汇报大纲',
];

export function HomeView({ scene, activeClickId, onTargetClick }: HomeViewProps) {
  return (
    <div className="flex-1 min-w-0 relative flex flex-col items-center justify-center px-10 pb-8 bg-white select-none">
      {/* 右上角产物区切换图标（对照 C271020A） */}
      <div className="absolute right-5 top-3.5 text-[#5c5f66]">
        <PanelRightIcon size={16} />
      </div>

      {/* 居中欢迎标题 */}
      <h1
        data-sim-id="home.title"
        className="m-0 mb-6 text-[30px] font-bold tracking-[-0.02em] text-[#111318]"
      >
        WorkBuddy，我帮你
      </h1>

      {/* 快捷场景标签行（7 项 + 右箭头） */}
      <div
        data-sim-id="home.quickTags"
        className="flex items-center gap-2 mb-4 max-w-[680px] overflow-hidden text-[12.5px] text-[#3a3e45]"
      >
        {QUICK_TAGS.map((tag) => (
          <span
            key={tag}
            className="px-3.5 py-1.5 rounded-full border border-[#ebebeb] bg-[#fafafa] whitespace-nowrap"
          >
            {tag}
          </span>
        ))}
        <span className="w-7 h-7 rounded-full border border-[#ebebeb] bg-white inline-flex items-center justify-center text-[#6b7079] shrink-0">
          ›
        </span>
      </div>

      {/* 双层复合输入框（含所有向上弹出菜单） */}
      <Composer scene={scene} activeClickId={activeClickId} onTargetClick={onTargetClick} />

      {/* 首页 4 条推荐问题胶囊（对照 C271020A） */}
      <div
        data-sim-id="home.suggestions"
        className="w-full max-w-[680px] mt-6 flex flex-col items-start gap-2.5 text-[13px] text-[#2b2f36]"
      >
        {SUGGESTIONS.map((q) => (
          <span
            key={q}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#ececea] bg-white"
          >
            <span>{q}</span>
            <span className="text-[#8c9099] text-[12px]">↗</span>
          </span>
        ))}
      </div>

      {/* 底部居中免责小字 */}
      <div className="absolute bottom-3 text-[11.5px] text-[#a0a4ad]">
        内容由 AI 生成，请核实重要信息
      </div>
    </div>
  );
}
