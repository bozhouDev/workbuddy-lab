import {
  ArchiveIcon,
  ChevronDownIcon,
  MoreCircleIcon,
  PencilIcon,
  PlayIcon,
  FilterIcon,
  FolderIcon,
  PlusIcon,
  ScheduleIcon,
  SearchIcon,
  SendPlaneIcon,
  ShieldAlertIcon,
  SparkleIcon,
  TrashIcon,
} from '../shell/icons';
import type { GuidedShellState, ScheduleRecord } from './guidedTypes';
import { LESSON_TEMPLATE_ID, SCHEDULE_TEMPLATES } from './scheduleTemplates';
import { makeTargetKit, type TargetKitProps } from './targetKit';

interface Props extends TargetKitProps {
  shell: GuidedShellState;
}

/** 本节课要点开的任务（从对话新建的早报） */
const LESSON_TASK_ID = 'ai-brief';

/**
 * 定时任务页（对照泊舟 5.11.3 真机截图：列表与新建、从模板添加、新建定时任务、运行记录、任务页）
 * 包含：任务列表、新建下拉（从对话新建 / 从模板新建）、模板页、新建表单、编辑弹窗、运行记录表、
 * 点开记录后的任务页（正文 + 右侧运行记录），以及一个教学用的「快进 3 天」按钮
 */
export function ScheduleView5113(props: Props) {
  const { shell } = props;
  const kit = makeTargetKit(props);
  const tasks = shell.scheduledTasks;
  const activeCount = tasks.filter((t) => t.on).length;
  const hasRecords = shell.scheduleRecords.length > 0;
  const onRecords = shell.scheduleTab === 'records';
  // 核对过试跑来源、回到运行记录页、还没有正式运行记录时，才显示「快进 3 天」（太早出现会分散注意力）
  const canFastForward =
    onRecords &&
    !!shell.scheduleCheckedSource &&
    tasks.some((t) => t.id === LESSON_TASK_ID) &&
    hasRecords &&
    shell.scheduleRecords.every((r) => r.status === 'test');

  // 点任务卡片（或运行记录里的一行）后整页换成任务页
  if (shell.scheduleTaskPageId) {
    return (
      <div className="relative flex-1 min-w-0 flex bg-white overflow-hidden" data-view="schedule">
        <TaskRunPage {...props} />
      </div>
    );
  }

  return (
    <div className="relative flex-1 min-w-0 flex flex-col bg-white overflow-hidden" data-view="schedule">
      {shell.scheduleTemplatesOpen ? (
        <TemplatesPage {...props} />
      ) : (
        <>
          <div className="shrink-0 px-6 pt-5 pb-3 flex items-center justify-between gap-3">
            {/* 标题：没有运行记录时只有「定时任务」；有记录后旁边多出「运行记录」（对照两张真机截图） */}
            <div className="flex items-baseline gap-4 shrink-0 whitespace-nowrap">
              <button
                type="button"
                onClick={onRecords ? kit.aside('定时任务', '点这里回任务列表。课程里先跟着蓝圈走。') : undefined}
                className={`border-0 bg-transparent p-0 text-[18px] font-bold cursor-pointer ${onRecords ? 'text-[#a3a6ad]' : 'text-[#111318]'}`}
              >
                定时任务
              </button>
              {hasRecords && (
                <button
                  type="button"
                  data-guided-target="schedule.viewRecords"
                  onClick={kit.click('schedule.viewRecords', '运行记录', '每一次运行（包括试跑）都记在这里。')}
                  className={`relative border-0 bg-transparent px-1 rounded text-[18px] font-bold cursor-pointer ${onRecords ? 'text-[#111318]' : 'text-[#a3a6ad]'} ${kit.ring(
                    'schedule.viewRecords'
                  )}`}
                >
                  运行记录
                  {kit.callout('schedule.viewRecords', 'bottom', 'start')}
                </button>
              )}
            </div>
            {onRecords ? <RecordsFilters {...props} /> : <TasksHeaderActions {...props} />}
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-6">
            {onRecords ? (
              <RecordsTable {...props} />
            ) : (
              <>
                <div className="flex items-center gap-2 text-[13px] mb-3">
                  <span className="px-3 py-1.5 rounded-lg bg-[#f1f1ef] font-semibold text-[#111318]">全部 ({tasks.length})</span>
                  <span className="px-3 py-1.5 text-[#5c5f66]">进行中 ({activeCount})</span>
                  <span className="px-3 py-1.5 text-[#5c5f66]">已暂停 ({tasks.length - activeCount})</span>
                </div>

                {tasks.length === 0 ? (
                  <div className="mt-16 flex flex-col items-center gap-2 text-center">
                    <div className="w-12 h-12 rounded-full bg-[#f4f4f5] inline-flex items-center justify-center text-[20px]">⏰</div>
                    <div className="text-[14px] font-semibold text-[#111318]">开启你的第一个定时任务吧</div>
                    <div className="text-[12.5px] text-[#8c9099]">右上角「新建」旁边的小箭头里有两种建法</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 2xl:grid-cols-2 gap-3 max-w-[1100px]">
                    {tasks.map((t) => {
                      const isLesson = t.id === LESSON_TASK_ID;
                      // 入场动画和蓝圈都用 animation，会互相覆盖：带蓝圈时不加入场动画
                      const ringClass = isLesson ? kit.ring('schedule.openTask') : '';
                      return (
                        <div
                          key={t.id}
                          role="button"
                          tabIndex={0}
                          data-guided-target={isLesson ? 'schedule.openTask' : undefined}
                          onClick={
                            isLesson
                              ? kit.click('schedule.openTask', t.name, '点任务卡片进到这个任务自己的页面。')
                              : kit.aside(t.name, '从模板建的提醒，不用改。这节课要检查的是早报那张卡片。')
                          }
                          className={`${ringClass || 'sim-msg-rise'} group relative rounded-[16px] border border-[#ececea] bg-white px-5 pt-4 pb-3 flex flex-col gap-2 cursor-pointer hover:shadow-[0_6px_20px_rgba(17,19,24,0.08)]`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-[14.5px] text-[#111318] truncate">{t.name}</span>
                            <span className="flex items-center gap-3 shrink-0">
                              <TaskCardActions {...props} taskId={t.id} />
                              <span className={`w-9 h-5 rounded-full p-0.5 flex shrink-0 ${t.on ? 'bg-[#111318] justify-end' : 'bg-[#d6d6d2] justify-start'}`}>
                                <span className="w-4 h-4 rounded-full bg-white" />
                              </span>
                            </span>
                          </div>
                          <div className="text-[12.5px] text-[#8c9099] line-clamp-2 min-h-[36px]">{t.prompt}</div>
                          <div className="border-t border-[#ececea] pt-2.5 flex items-center justify-between gap-2 text-[12px] text-[#8c9099]">
                            <span className="text-[#6b7079]">⏰ {t.freq}</span>
                            <span>{t.on ? `下一次运行 ${t.nextRun}` : '已暂停'}</span>
                          </div>
                          {isLesson && kit.callout('schedule.openTask', 'top', 'end')}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* 教学控件：模拟时间流逝（真机没有这个按钮） */}
            {canFastForward && (
              <button
                type="button"
                data-guided-target="schedule.fastForward"
                onClick={kit.click('schedule.fastForward', '快进 3 天', '模拟器专用：让时间往前走 3 天，看看这几天的运行结果。')}
                className={`relative mt-5 h-9 px-4 rounded-[10px] border border-dashed border-accent-300 bg-accent-50 text-accent-700 text-[13px] font-semibold cursor-pointer ${kit.ring('schedule.fastForward')}`}
              >
                ⏩ 快进 3 天（模拟器专用）
                {kit.callout('schedule.fastForward', 'bottom', 'start')}
              </button>
            )}
          </div>
        </>
      )}

      {shell.scheduleCreateTemplateId && <CreateFromTemplateModal {...props} />}
      {shell.scheduleModalTaskId && <EditTaskModal {...props} />}
    </div>
  );
}

/**
 * 任务卡片悬停时右上角出现的 ▷ 立即运行 / ✎ 编辑 / ··· 更多（对照泊舟真机截图）
 * 课程等着点「编辑」时，早报卡片上的按钮常显，方便找到
 */
function TaskCardActions(props: Props & { taskId: string }) {
  const kit = makeTargetKit(props);
  const isLesson = props.taskId === LESSON_TASK_ID;
  const forceShow = isLesson && kit.ring('schedule.editTask') !== '';
  return (
    <span className={`flex items-center gap-3 text-[#4a4f57] ${forceShow ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
      <button
        type="button"
        aria-label="立即运行"
        onClick={kit.aside('立即运行', '不用进编辑页，直接试跑一次。这节课在编辑页里点「运行」，顺便把设置核对一遍。')}
        className="border-0 bg-transparent p-0 text-[#4a4f57] inline-flex cursor-pointer"
      >
        <PlayIcon size={15} />
      </button>
      <button
        type="button"
        aria-label="编辑"
        data-guided-target={isLesson ? 'schedule.editTask' : undefined}
        onClick={isLesson ? kit.click('schedule.editTask', '编辑', '打开「编辑定时任务」。') : kit.aside('编辑', '打开「编辑定时任务」。这节课先编辑早报那张。')}
        className={`relative border-0 bg-transparent p-0.5 rounded text-[#4a4f57] inline-flex cursor-pointer ${isLesson ? kit.ring('schedule.editTask') : ''}`}
      >
        <PencilIcon size={15} />
        {isLesson && kit.callout('schedule.editTask', 'bottom', 'center')}
      </button>
      <button type="button" aria-label="更多" onClick={kit.aside('更多', '更多操作，比如删除、归档。')} className="border-0 bg-transparent p-0 text-[#4a4f57] inline-flex cursor-pointer">
        <MoreCircleIcon size={15} />
      </button>
    </span>
  );
}

/** 任务列表右上角：搜索 / 筛选 / 批量管理 / 新建 ▾ */
function TasksHeaderActions(props: Props) {
  const { shell } = props;
  const kit = makeTargetKit(props);
  return (
    <div className="flex items-center gap-2 relative">
      <button type="button" aria-label="搜索定时任务" onClick={kit.aside('搜索', '任务多了以后按名字搜。')} className="w-8 h-8 border-0 bg-transparent text-[#4a4f57] inline-flex items-center justify-center cursor-pointer">
        <SearchIcon size={15} />
      </button>
      <button type="button" aria-label="筛选" onClick={kit.aside('筛选', '按进行中、已暂停筛选任务。')} className="w-8 h-8 border-0 bg-transparent text-[#4a4f57] inline-flex items-center justify-center cursor-pointer">
        <FilterIcon size={15} />
      </button>
      <button
        type="button"
        onClick={kit.aside('批量管理', '任务多了以后用它批量删除。删除会连本地运行记录和会话一起删掉，且无法恢复。')}
        className="h-8 px-3 rounded-lg border border-[#e6e6e3] bg-white text-[12.5px] font-semibold cursor-pointer"
      >
        批量管理
      </button>
      <div className="inline-flex rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={kit.aside('新建', '新手用旁边小箭头里的两种方式：「从对话新建」和「从模板新建」。')}
          className="h-8 px-3 border-0 bg-[#111318] text-white text-[12.5px] font-semibold cursor-pointer"
        >
          新建
        </button>
        <button
          type="button"
          data-guided-target="schedule.newMenu"
          aria-label="更多新建方式"
          onClick={kit.click('schedule.newMenu', '新建方式', '点小箭头展开两种新建方式。')}
          className={`relative h-8 w-7 border-0 border-l border-[#3a3d44] bg-[#111318] text-white inline-flex items-center justify-center cursor-pointer ${kit.ring('schedule.newMenu')}`}
        >
          <ChevronDownIcon size={11} />
          {kit.callout('schedule.newMenu', 'bottom', 'end')}
        </button>
      </div>
      {shell.scheduleNewMenuOpen && (
        <div className="sim-pop-up absolute right-0 top-10 z-30 w-[170px] rounded-[12px] bg-white border border-[#e6e6e3] shadow-[0_14px_36px_rgba(17,19,24,0.16)] p-1.5 flex flex-col text-[13px]">
          <button
            type="button"
            data-guided-target="schedule.fromChat"
            onClick={kit.click('schedule.fromChat', '从对话新建', '回到首页，用对话把任务说清楚，AI 帮你建好。适合你自己跑满意的提示词。')}
            className={`relative text-left border-0 bg-transparent hover:bg-[#f4f4f5] rounded-lg px-3 py-2 cursor-pointer ${kit.ring('schedule.fromChat')}`}
          >
            ⊕ 从对话新建
            {kit.callout('schedule.fromChat', 'left', 'center')}
          </button>
          <button
            type="button"
            data-guided-target="schedule.fromTemplate"
            onClick={kit.click('schedule.fromTemplate', '从模板新建', '官方现成模板，挑一个改改时间就能用。')}
            className={`relative text-left border-0 bg-transparent hover:bg-[#f4f4f5] rounded-lg px-3 py-2 cursor-pointer ${kit.ring('schedule.fromTemplate')}`}
          >
            ⊞ 从模板新建
            {kit.callout('schedule.fromTemplate', 'left', 'center')}
          </button>
        </div>
      )}
    </div>
  );
}

/** 运行记录页右上角：搜索 + 全部状态 / 全部类型 / 全部任务（文案来自语言包 automation.records.*） */
function RecordsFilters(props: Props) {
  const kit = makeTargetKit(props);
  const filters: Array<[string, string]> = [
    ['全部状态', '按运行成功、失败、排队中等状态筛选。'],
    ['全部类型', '按本地任务、云端任务筛选。'],
    ['全部任务', '只看某一个定时任务的记录。'],
  ];
  return (
    <div className="flex items-center gap-2">
      <button type="button" aria-label="搜索运行记录" onClick={kit.aside('搜索', '按任务名称搜运行记录。')} className="w-8 h-8 border-0 bg-transparent text-[#4a4f57] inline-flex items-center justify-center cursor-pointer">
        <SearchIcon size={15} />
      </button>
      {filters.map(([label, tip]) => (
        <button
          key={label}
          type="button"
          onClick={kit.aside(label, tip)}
          className="h-8 px-2.5 rounded-lg border border-[#e6e6e3] bg-white text-[12.5px] whitespace-nowrap inline-flex items-center gap-1.5 xl:gap-4 cursor-pointer"
        >
          {label}
          <ChevronDownIcon size={11} />
        </button>
      ))}
    </div>
  );
}

/** 「从模板添加」页：‹ 返回 + 3 列模板卡片（对照真机截图） */
function TemplatesPage(props: Props) {
  const kit = makeTargetKit(props);
  return (
    <div className="flex-1 overflow-y-auto px-6 pt-5 pb-6">
      <div className="flex items-center gap-2 mb-4">
        <button
          type="button"
          aria-label="返回"
          onClick={kit.aside('返回', '回到定时任务列表。这一步先挑一个模板。')}
          className="w-7 h-7 border-0 bg-transparent text-[18px] text-[#4a4f57] cursor-pointer"
        >
          ‹
        </button>
        <span className="text-[18px] font-bold text-[#111318]">从模板添加</span>
      </div>
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 max-w-[1100px]">
        {SCHEDULE_TEMPLATES.map((tpl) => {
          const isTarget = tpl.id === LESSON_TEMPLATE_ID;
          const explain =
            tpl.id === 'dailyAiNews'
              ? `模板提示词是：「${tpl.prompt}」<br/>它没要求附原文链接、没限定 24 小时内、也没写存成什么文件。直接用，就是开头那份没法核对的早报。干活类模板要改成你自己跑满意的提示词再用。`
              : tpl.id === 'weeklyReport'
                ? `模板提示词是：「${tpl.prompt}」<br/>这是给写代码的人用的，要去读代码仓库。你没有仓库，它每周五就白跑一次。用之前得改成你自己的活。`
                : `模板提示词是：「${tpl.prompt}」`;
          return (
            <button
              key={tpl.id}
              type="button"
              data-guided-target={isTarget ? 'schedule.pickTemplate' : undefined}
              onClick={isTarget ? kit.click('schedule.pickTemplate', tpl.title, '点开这个模板。') : kit.aside(tpl.title, explain)}
              className={`relative text-left rounded-[16px] border border-[#ececea] bg-white px-4 py-3.5 cursor-pointer hover:shadow-[0_6px_20px_rgba(17,19,24,0.08)] ${isTarget ? kit.ring('schedule.pickTemplate') : ''}`}
            >
              <div className="text-[14px] font-semibold text-[#111318] truncate">{tpl.title}</div>
              <div className="text-[12px] text-[#8c9099] truncate mt-1">{tpl.content}</div>
              {isTarget && kit.callout('schedule.pickTemplate', 'bottom', 'start')}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** 「允许完全访问」下拉的两档说明（语言包 automation.permission.*） */
const FULL_ACCESS_EXPLAIN =
  '这个下拉有两档：<b>完全访问权限（推荐）</b>：定时任务会在本地客户端无人值守执行，执行期间请勿关闭电脑或退出客户端；<b>默认权限</b>：敏感操作需用户确认，你离开屏幕任务就停在等待状态，只推荐在本地调试或手动监管时用。<br/>定时任务默认就是完全访问（哪怕你平时对话用的是默认权限），所以提示词里要写死边界（只读、只生成、不删除、不发送）。';

/**
 * 「新建定时任务」表单（对照真机截图：每周工作周报、父母联系提醒两个模板点开后的样子）
 * 名称 / 提示词（+、✨、快速 ▾）/ 选择分组、允许完全访问 / 重复、时间、有效期 / 消息推送到企业微信 / 取消、确定
 */
function CreateFromTemplateModal(props: Props) {
  const { shell } = props;
  const kit = makeTargetKit(props);
  const tpl = SCHEDULE_TEMPLATES.find((x) => x.id === shell.scheduleCreateTemplateId);
  if (!tpl) return null;
  return (
    <div className="absolute inset-0 z-30 bg-black/25 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
      <div className="sim-pop-up w-full max-w-[680px] max-h-full overflow-y-auto rounded-[20px] bg-white shadow-[0_24px_60px_rgba(17,19,24,0.25)] p-5 flex flex-col gap-3.5 text-[13px]">
        <div className="flex items-center justify-between">
          <span className="text-[16px] font-bold text-[#111318]">新建定时任务</span>
          <button type="button" aria-label="关闭" onClick={kit.aside('关闭', '不建了就关掉。这一步先看清表单再点确定。')} className="border-0 bg-transparent text-[18px] text-[#6b7079] cursor-pointer">
            ×
          </button>
        </div>
        <div className="h-10 px-3.5 rounded-[12px] border border-[#e6e6e3] flex items-center text-[#111318]">{tpl.title}</div>
        <div className="rounded-[16px] bg-[#f7f7f6]">
          <div className="rounded-[16px] border border-[#e6e6e3] bg-white p-3.5 flex flex-col gap-4">
            <div className="text-[13px] leading-[1.75] text-[#111318] min-h-[52px]">{tpl.prompt}</div>
            <div className="flex items-center justify-between text-[#4a4f57]">
              <button type="button" aria-label="添加" onClick={kit.aside('+', '可以给这个任务挂技能、专家、连接器或文件。')} className="border-0 bg-transparent cursor-pointer text-[#4a4f57]">
                <PlusIcon size={16} />
              </button>
              <span className="flex items-center gap-3 text-[12.5px]">
                <button type="button" aria-label="优化提示词" onClick={kit.aside('✨', '让 AI 帮你把提示词改得更完整。改完记得自己再读一遍。')} className="border-0 bg-transparent cursor-pointer text-[#4a4f57]">
                  <SparkleIcon size={15} />
                </button>
                <button type="button" onClick={kit.aside('快速', '这个任务用哪个模型。提醒类的活用便宜的就够。')} className="border-0 bg-transparent cursor-pointer text-[#4a4f57]">
                  ⚡ 快速 ▾
                </button>
              </span>
            </div>
          </div>
          <div className="px-3.5 py-2.5 flex items-center gap-4 text-[12.5px]">
            <button type="button" onClick={kit.aside('选择分组', '产物存到哪个分组。提醒类不产出文件，可以不选。')} className="border-0 bg-transparent inline-flex items-center gap-1 text-[#6b7079] cursor-pointer">
              <FolderIcon size={13} /> 选择分组 ▾
            </button>
            <button type="button" onClick={kit.aside('允许完全访问', FULL_ACCESS_EXPLAIN)} className="border-0 bg-transparent inline-flex items-center gap-1 text-[#dc2626] cursor-pointer">
              <ShieldAlertIcon size={13} /> 允许完全访问 ▾
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2.5 text-[12.5px]">
          {[
            ['重复', tpl.repeat ?? '每天', '周期可选每天、每周几；也能按间隔或只跑一次。'],
            ['时间', tpl.time ?? '09:00', '几点跑。电脑那时候要开着、客户端别退出。'],
            ['有效期', tpl.validity ?? '长期有效', '从哪天到哪天有效，到期自动不再执行；想一直跑就选长期有效。'],
          ].map(([label, value, tip]) => (
            <button
              key={label}
              type="button"
              onClick={kit.aside(label, tip)}
              className="h-10 px-3 rounded-[12px] border border-[#e6e6e3] bg-white flex items-center justify-between gap-1 cursor-pointer min-w-0"
            >
              <span className="truncate text-[#111318]">
                {label}：<span className="ml-1">{value}</span>
              </span>
              <ChevronDownIcon size={11} />
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-[12.5px] text-[#6b7079]">
          消息推送到企业微信
          <button
            type="button"
            aria-label="消息推送到企业微信"
            onClick={kit.aside('消息推送到企业微信', '打开后，跑完把结果推到你的企业微信，人不在电脑前也能收到。要先在左边「助理」里绑好企业微信 bot。')}
            className="w-9 h-5 rounded-full p-0.5 flex border-0 bg-[#d6d6d2] justify-start cursor-pointer"
          >
            <span className="w-4 h-4 rounded-full bg-white" />
          </button>
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={kit.aside('取消', '不建了就取消。这一步点确定。')} className="h-9 px-4 rounded-[10px] border border-[#e6e6e3] bg-white text-[13px] cursor-pointer">
            取消
          </button>
          <button
            type="button"
            data-guided-target="schedule.createConfirm"
            onClick={kit.click('schedule.createConfirm', '确定', '看清了就确定，任务建好会出现在列表里。')}
            className={`relative h-9 px-5 rounded-[10px] border-0 bg-[#111318] text-white text-[13px] font-semibold cursor-pointer ${kit.ring('schedule.createConfirm')}`}
          >
            确定
            {kit.callout('schedule.createConfirm', 'top', 'end')}
          </button>
        </div>
      </div>
    </div>
  );
}

/** 运行记录状态的颜色和小图标 */
function statusTone(r: ScheduleRecord) {
  if (r.status === 'success' || r.status === 'test') return { text: 'text-[#047857]', icon: '✓', badge: 'border-[#22c55e] text-[#16a34a]' };
  if (r.status === 'catchup') return { text: 'text-[#c2410c]', icon: '↻', badge: 'border-[#f97316] text-[#ea580c]' };
  return { text: 'text-[#dc2626]', icon: '!', badge: 'border-[#ef4444] text-[#dc2626]' };
}

/** 运行记录表：任务名称 / 状态 / 运行时间 / 耗时 / 任务类型 / 操作（对照真机截图，列名来自语言包 automation.records.column.*） */
function RecordsTable(props: Props) {
  const { shell } = props;
  const kit = makeTargetKit(props);
  if (shell.scheduleRecords.length === 0) {
    return <div className="mt-16 text-center text-[13px] text-[#8c9099]">暂无运行记录</div>;
  }
  const cols = 'grid grid-cols-[1.5fr_1.5fr_1fr_0.7fr_0.7fr_0.7fr]';
  return (
    <div className="text-[12.5px] max-w-[1100px]">
      <div className={`${cols} px-3 py-2 text-[#8c9099]`}>
        <span>任务名称</span>
        <span>状态</span>
        <span>运行时间</span>
        <span>耗时</span>
        <span>任务类型</span>
        <span>操作</span>
      </div>
      {shell.scheduleRecords.map((r) => {
        const tone = statusTone(r);
        return (
          <div
            key={r.id}
            role="button"
            tabIndex={0}
            onClick={kit.aside(
              r.taskName,
              r.status === 'catchup'
                ? '这条是补跑的：原定 08:30 电脑合着盖，打开后才补跑，早报晚到了 42 分钟。'
                : '点一行会进到这个任务的任务页，就是刚才核对来源的那一页。'
            )}
            className={`sim-msg-rise relative ${cols} items-center px-3 py-3 border-b border-[#f0f0ee] rounded-lg cursor-pointer hover:bg-[#fafaf9]`}
          >
            <span className="truncate text-[#111318]">{r.taskName}</span>
            <span className="flex flex-col">
              <span className={`inline-flex items-center gap-1.5 font-medium ${tone.text}`}>
                <span className={`w-3.5 h-3.5 rounded-full border text-[9px] leading-none inline-flex items-center justify-center ${tone.badge}`}>{tone.icon}</span>
                {r.statusText}
              </span>
              {r.note && <span className="text-[11px] text-[#9a3412]">{r.note}</span>}
            </span>
            <span className="text-[#6b7079]">{r.time}</span>
            <span className="text-[#6b7079]">{r.duration}</span>
            <span className="text-[#6b7079]">本地</span>
            <span className="flex items-center gap-3">
              <button type="button" aria-label="归档" onClick={kit.aside('归档', '归档后，可在「系统设置-数据管理-归档的任务」中查看。')} className="border-0 bg-transparent p-0 text-[#6b7079] cursor-pointer">
                <ArchiveIcon size={15} />
              </button>
              <button type="button" aria-label="删除" onClick={kit.aside('删除', '只删这条运行记录，定时任务不受影响。删除后无法恢复。')} className="border-0 bg-transparent p-0 text-[#6b7079] cursor-pointer">
                <TrashIcon size={15} />
              </button>
            </span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * 任务页（对照真机截图「AI 日报」）：点任务卡片或运行记录里的一行进入
 * 左边是最近一次运行的完整输出（每条带来源链接）、保存的文件、消耗和输入框；右边是「运行记录」列表和下一次运行时间。
 * 还没跑过时正文是空的。右上角时钟只是开关右侧的运行记录面板
 */
function TaskRunPage(props: Props) {
  const { shell } = props;
  const kit = makeTargetKit(props);
  const task = shell.scheduledTasks.find((t) => t.id === shell.scheduleTaskPageId);
  if (!task) return null;
  // 正文展示最近一次带输出的运行（课程里就是测试运行那次）
  const r = shell.scheduleRecords.find((x) => x.artifactItems);
  return (
    <>
      <div className="flex-1 min-w-0 flex flex-col">
        {/* 顶栏：任务名 + 搜索 / 更多 / 开关 / 运行记录面板开关 */}
        <div className="shrink-0 h-14 px-6 flex items-center justify-between">
          <span className="text-[17px] font-bold text-[#111318] truncate">{task.name}</span>
          <span className="flex items-center gap-3 text-[#4a4f57]">
            <SearchIcon size={15} />
            <span className="text-[13px]" aria-hidden="true">
              ⋯
            </span>
            <span className={`w-9 h-5 rounded-full p-0.5 flex ${task.on ? 'bg-[#22c55e] justify-end' : 'bg-[#d6d6d2] justify-start'}`}>
              <span className="w-4 h-4 rounded-full bg-white" />
            </span>
            <button
              type="button"
              aria-label="运行记录面板"
              onClick={kit.aside('运行记录面板', '点它收起或展开右边的「运行记录」。')}
              className="w-8 h-8 rounded-lg border-0 bg-[#f1f1ef] text-[#4a4f57] inline-flex items-center justify-center cursor-pointer"
            >
              <ScheduleIcon size={15} />
            </button>
          </span>
        </div>
        {/* 正文：这次运行的输出 */}
        <div className="flex-1 overflow-y-auto px-8 pb-4 text-[13px] leading-[1.75] text-[#2b2f36]">
          {!r ? (
            // 还没跑过：中间是空的（泊舟真机确认）
            <div />
          ) : (
            <>
              <div className="font-semibold text-[#111318]">{r.taskName}｜2026 年 11 月 23 日</div>
              <div className="text-[#4a4f57] mb-3">{r.summary}</div>
              {r.artifactItems?.map((it, idx) => {
                const isTarget = idx === 0;
                const checked = shell.scheduleCheckedSource === it.title;
                return (
                  <div key={it.title} className="mb-3">
                    <div className="font-semibold text-[#111318]">
                      {idx + 1}. {it.title}
                    </div>
                    <div>{it.point}</div>
                    <div className="text-[12.5px]">
                      <span className="text-[#8c9099]">发布时间 {it.published} · </span>来源：
                      <button
                        type="button"
                        data-guided-target={isTarget ? 'schedule.checkSource' : undefined}
                        onClick={
                          isTarget
                            ? kit.click('schedule.checkSource', '来源链接', '点开原文，核对标题和发布时间对不对得上。')
                            : kit.aside('来源链接', '真机里点开就是原文网页。核对两件事：说的是不是同一件事、发布时间在不在你要的范围里。')
                        }
                        className={`relative border-0 bg-transparent p-0 text-accent-700 cursor-pointer rounded ${isTarget ? kit.ring('schedule.checkSource') : ''}`}
                      >
                        {it.source}
                        {isTarget && kit.callout('schedule.checkSource', 'bottom', 'start')}
                      </button>
                    </div>
                    {checked && (
                      <div className="sim-msg-rise mt-1.5 rounded-[10px] border border-[#bbf7d0] bg-[#f0fdf4] px-3 py-2 text-[12px] text-[#166534] leading-[1.6]">
                        <div className="text-[11px] text-[#4d7c0f]">原文页（模拟）</div>
                        <div>
                          《{it.title}》 · {it.source} · 发布于 2026-{it.published}
                        </div>
                        <div className="font-semibold">✓ 标题对得上 · 距试跑约 14 小时，在 24 小时内</div>
                      </div>
                    )}
                  </div>
                );
              })}
              {/* 模拟产物：AI 在输出末尾说明文件存到了哪里 */}
              {r.savedFile && (
                <div className="mt-2 text-[#2b2f36]">
                  已按要求保存：<span className="px-1.5 py-0.5 rounded bg-[#f1f1ef] font-mono text-[12px] break-all">{r.savedFile}</span>
                </div>
              )}
              <div className="mt-4 flex items-center gap-4 text-[12.5px] text-[#6b7079]">
                {r.artifactItems && <span>{r.artifactItems.length * 4 + 3} 个来源</span>}
                {r.cost && <span>共消耗 ◇ {r.cost} · ⚡ 快速</span>}
              </div>
            </>
          )}
        </div>
        {/* 输入框：可以接着追问；红色「允许完全访问」就是这个任务的执行权限 */}
        <div className="shrink-0 px-6 pb-4">
          <div className="rounded-[18px] border border-[#e6e6e3] bg-white px-4 pt-3 pb-2.5 flex flex-col gap-3 shadow-[0_2px_10px_rgba(17,19,24,0.04)]">
            <div className="text-[13px] text-[#a3a6ad]">今天帮你做些什么？@ 添加上下文，/调用技能与指令</div>
            <div className="flex items-center justify-between text-[12.5px]">
              <span className="flex items-center gap-3 text-[#4a4f57]">
                <PlusIcon size={15} />
                <button
                  type="button"
                  data-guided-target="schedule.permFull"
                  onClick={r ? kit.click('schedule.permFull', '允许完全访问', FULL_ACCESS_EXPLAIN) : kit.aside('允许完全访问', FULL_ACCESS_EXPLAIN)}
                  className={`relative border-0 bg-transparent px-1 rounded inline-flex items-center gap-1 text-[#dc2626] cursor-pointer ${kit.ring('schedule.permFull')}`}
                >
                  <ShieldAlertIcon size={13} /> 允许完全访问 ▾
                  {kit.callout('schedule.permFull', 'top', 'start')}
                </button>
              </span>
              <span className="flex items-center gap-3 text-[#4a4f57]">
                ⚡ 快速 ▾
                <span className="w-7 h-7 rounded-full bg-[#d6d6d2] text-white inline-flex items-center justify-center">
                  <SendPlaneIcon size={11} />
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 右侧：运行记录 */}
      <div className="w-[260px] shrink-0 border-l border-[#ececea] bg-white px-4 pt-4 flex flex-col gap-3">
        <div className="text-[16px] font-bold text-[#111318]">运行记录</div>
        {shell.scheduleRecords.length === 0 && <div className="text-[12px] text-[#a3a6ad] px-1">暂无运行记录</div>}
        {shell.scheduleRecords.map((x) => (
          <div key={x.id} className={`sim-msg-rise rounded-[14px] border px-3.5 py-3 text-[12px] ${x.id === r?.id ? 'border-[#d6d6d2] bg-[#fafaf9]' : 'border-[#ececea]'}`}>
            <div className="font-semibold text-[#111318] pb-2 border-b border-[#ececea]">今天 11月23日 21:42</div>
            <div className="pt-2 text-[#4a4f57] truncate">{x.taskName}｜2026 年 11 月 23 日</div>
            <div className="text-[#6b7079] truncate">{x.summary}</div>
          </div>
        ))}
        {task.on && <div className="text-[12px] text-[#a3a6ad] px-1">下一次运行 {task.nextRun}</div>}
      </div>
    </>
  );
}

/**
 * 编辑定时任务弹窗（任务卡片悬停时点 ✎ 打开，对照泊舟真机截图）：
 * 标题「定时任务」+ ×，下面「‹ 编辑定时任务」（‹ 回定时任务列表）
 * 左边名称、提示词（模型 / 技能 / 召唤专家）；右边状态、执行频率、有效期、连接器；底部 删除 / 运行 / 取消 / 保存
 */
function EditTaskModal(props: Props) {
  const { shell } = props;
  const kit = makeTargetKit(props);
  const task = shell.scheduledTasks.find((x) => x.id === shell.scheduleModalTaskId);
  if (!task) return null;

  return (
    <div className="absolute inset-0 z-30 bg-black/25 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
      <div className="sim-pop-up w-full max-w-[760px] max-h-full overflow-y-auto rounded-[20px] bg-white shadow-[0_24px_60px_rgba(17,19,24,0.25)] p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-[16px] font-bold text-[#111318]">定时任务</span>
          <button type="button" aria-label="关闭" onClick={kit.aside('关闭', '跟着蓝圈走，先把设置核对完。')} className="border-0 bg-transparent text-[18px] text-[#6b7079] cursor-pointer">
            ×
          </button>
        </div>

        <div className="flex items-start gap-2">
          <button type="button" aria-label="返回" onClick={kit.aside('‹ 返回', '回到定时任务列表。这一步先点「运行」。')} className="border-0 bg-transparent text-[18px] leading-none text-[#4a4f57] cursor-pointer pt-1">
            ‹
          </button>
          <div>
            <div className="text-[15px] font-bold text-[#111318]">编辑定时任务</div>
            <div className="text-[12px] text-[#8c9099] mt-0.5">定时任务仅支持「定时执行」一种触发形态</div>
          </div>
        </div>

        <div className="grid grid-cols-[1.1fr_1fr] gap-0 rounded-[16px] border border-[#ececea]">
          {/* 左栏：名称 + 提示词 */}
          <div className="p-4 flex flex-col gap-3 border-r border-[#ececea]">
            <div className="flex flex-col gap-1.5">
              <span className="text-[13px] font-semibold text-[#111318]">名称</span>
              <div className="h-9 px-3 rounded-[10px] border border-[#e6e6e3] flex items-center text-[13px] text-[#111318]">{task.name}</div>
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <span className="text-[13px] font-semibold text-[#111318]">提示词</span>
              <div className="flex-1 min-h-[150px] rounded-[10px] border border-[#e6e6e3] p-3 flex flex-col justify-between gap-3">
                <div className="text-[12.5px] leading-[1.7] text-[#111318] whitespace-pre-line">{task.prompt}</div>
                <div className="flex flex-wrap items-center gap-3 text-[12px] text-[#4a4f57]">
                  {[
                    ['快速 ∨', '定时任务可以单独选模型。早报这种活用便宜的就够。'],
                    ['技能', '可以给这个任务挂技能。'],
                    ['召唤专家 ∨', '可以指定一个专家来跑。'],
                  ].map(([label, tip]) => (
                    <button key={label} type="button" onClick={kit.aside(label.replace(' ∨', ''), tip)} className="border-0 bg-transparent cursor-pointer text-[#4a4f57]">
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 右栏：状态 / 执行频率 / 有效期 / 连接器 */}
          <div className="p-4 flex flex-col gap-3">
            <div className="rounded-[12px] border border-[#ececea] px-3 py-2.5 flex items-center justify-between">
              <div>
                <div className="text-[13px] font-semibold text-[#111318]">运行中</div>
                <div className="text-[11.5px] text-[#8c9099]">{shell.scheduleRecords.length} 次运行</div>
              </div>
              <span className="h-7 px-2.5 rounded-lg border border-[#e6e6e3] text-[12px] inline-flex items-center">暂停</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[13px] font-semibold text-[#111318]">执行频率</span>
              <div className="inline-flex w-fit rounded-lg bg-[#f4f4f5] p-0.5 text-[12px]">
                <span className="px-2.5 py-1 rounded-md bg-white font-semibold shadow-sm">周期</span>
                <span className="px-2.5 py-1 text-[#5c5f66]">按间隔</span>
                <span className="px-2.5 py-1 text-[#5c5f66]">单次</span>
              </div>
              <div className="h-8 px-3 rounded-[10px] border border-[#e6e6e3] flex items-center justify-between text-[12.5px]">
                每天 <ChevronDownIcon size={11} />
              </div>
              <div className="h-8 px-3 rounded-[10px] border border-[#e6e6e3] flex items-center justify-between text-[12.5px]">
                08:30 <ScheduleIcon size={13} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="text-[12px]">
                <b className="text-[13px] text-[#111318]">有效期</b> <span className="text-[#8c9099]">可选，留空表示始终生效。</span>
              </div>
              <button
                type="button"
                onClick={kit.aside('有效期', '留空就一直跑。只想跑一段时间（比如出差这两周），就选起止日期，到期自动不再执行。')}
                className="h-8 px-3 rounded-[10px] border border-[#e6e6e3] bg-white text-left text-[12.5px] text-[#a3a6ad] cursor-pointer"
              >
                选择生效日期
              </button>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[13px] font-semibold text-[#111318]">连接器</span>
              <span className="text-[11.5px] text-[#8c9099]">选择本次定时任务可调用的连接器</span>
              <button
                type="button"
                onClick={kit.aside(
                  '连接器',
                  '勾选即授权该连接器在任务中<b>免确认使用</b>。早报只要联网搜索，一个都不用勾；要往飞书写东西的任务才勾飞书，用不到的别勾。'
                )}
                className="h-8 px-3 rounded-[10px] border border-[#e6e6e3] bg-white flex items-center justify-between text-[12.5px] text-[#a3a6ad] cursor-pointer"
              >
                还没有选择连接器 <ChevronDownIcon size={11} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button type="button" onClick={kit.aside('删除', '删除后不再按计划执行，本地运行记录也会一起删掉。')} className="h-9 px-4 rounded-[10px] border border-[#fecaca] bg-white text-[#dc2626] text-[13px] cursor-pointer">
            删除
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              data-guided-target="schedule.run"
              onClick={kit.click('schedule.run', '运行', '马上试跑一次，测试运行不影响正式调度时间。')}
              className={`relative h-9 px-4 rounded-[10px] border border-[#e6e6e3] bg-white text-[13px] cursor-pointer ${kit.ring('schedule.run')}`}
            >
              运行
              {kit.callout('schedule.run', 'top', 'center')}
            </button>
            <button type="button" onClick={kit.aside('取消', '不保存改动。')} className="h-9 px-4 rounded-[10px] border-0 bg-[#f1f1ef] text-[13px] cursor-pointer">
              取消
            </button>
            <button
              type="button"
              onClick={kit.aside('保存', '改了名称、提示词或频率才需要保存。这次什么都没改，先点「运行」试跑。')}
              className="h-9 px-4 rounded-[10px] border-0 bg-[#111318] text-white text-[13px] font-semibold cursor-pointer"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
