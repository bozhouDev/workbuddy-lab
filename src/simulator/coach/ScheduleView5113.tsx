import { ChevronDownIcon, FilterIcon, PlusIcon, SearchIcon, ShieldAlertIcon, SparkleIcon, FolderIcon } from '../shell/icons';
import type { GuidedShellState, ScheduleRecord } from './guidedTypes';
import { LESSON_TEMPLATE_ID, SCHEDULE_TEMPLATES } from './scheduleTemplates';
import { makeTargetKit, type TargetKitProps } from './targetKit';

interface Props extends TargetKitProps {
  shell: GuidedShellState;
}

/** 本节课要点开的任务（从对话新建的早报） */
const LESSON_TASK_ID = 'ai-brief';

/**
 * 定时任务页（对照 5.11.3 截图 01-定时任务列表与新建.png、从模板添加、新建定时任务 + 语言包 automation.* 文案）
 * 包含：任务列表、新建下拉（从对话新建 / 从模板新建）、模板页、新建表单、编辑弹窗、运行记录、运行详情抽屉，
 * 以及一个教学用的「快进 3 天」按钮
 */
export function ScheduleView5113(props: Props) {
  const { shell } = props;
  const kit = makeTargetKit(props);
  const tasks = shell.scheduledTasks;
  const activeCount = tasks.filter((t) => t.on).length;
  // 只有测试运行、还没有正式运行记录时，才显示「快进 3 天」
  const canFastForward =
    tasks.some((t) => t.id === LESSON_TASK_ID) &&
    shell.scheduleRecords.length > 0 &&
    shell.scheduleRecords.every((r) => r.status === 'test') &&
    !shell.scheduleModalTaskId &&
    !shell.scheduleRecordDetailId;

  return (
    <div className="relative flex-1 min-w-0 flex flex-col bg-white overflow-hidden" data-view="schedule">
      {shell.scheduleTemplatesOpen ? (
        <TemplatesPage {...props} />
      ) : (
        <>
          <div className="shrink-0 px-6 pt-5 pb-3 flex items-center justify-between gap-3">
            {shell.scheduleTab === 'tasks' ? (
              <span className="text-[18px] font-bold text-[#111318]">定时任务</span>
            ) : (
              <span className="text-[18px] font-bold text-[#111318]">
                <button
                  type="button"
                  onClick={kit.aside('定时任务', '点这里回任务列表。课程里先跟着蓝圈走。')}
                  className="border-0 bg-transparent p-0 text-[18px] font-normal text-[#8c9099] cursor-pointer"
                >
                  定时任务
                </button>
                <span className="text-[#c4c6cb] mx-1.5">/</span>运行记录
              </span>
            )}
            <div className="flex items-center gap-2 relative">
              <button type="button" aria-label="搜索定时任务/记录" onClick={kit.aside('搜索', '任务多了以后按名字搜。')} className="w-8 h-8 border-0 bg-transparent text-[#4a4f57] inline-flex items-center justify-center cursor-pointer">
                <SearchIcon size={15} />
              </button>
              <button type="button" aria-label="筛选" onClick={kit.aside('筛选', '按进行中、已暂停，或者按运行成功、失败筛选。')} className="w-8 h-8 border-0 bg-transparent text-[#4a4f57] inline-flex items-center justify-center cursor-pointer">
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
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-6">
            {shell.scheduleTab === 'tasks' ? (
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
                      const records = isLesson ? shell.scheduleRecords.length : 0;
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
                              ? kit.click('schedule.openTask', t.name, '点任务卡片打开编辑弹窗。')
                              : kit.aside(t.name, '从模板建的提醒，不用改。这节课要检查的是早报那张卡片。')
                          }
                          className={`${ringClass || 'sim-msg-rise'} relative rounded-[16px] border border-[#ececea] bg-white px-5 pt-4 pb-3 flex flex-col gap-2 cursor-pointer hover:shadow-[0_6px_20px_rgba(17,19,24,0.08)]`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-[14.5px] text-[#111318] truncate">{t.name}</span>
                            <span className={`w-9 h-5 rounded-full p-0.5 flex shrink-0 ${t.on ? 'bg-[#111318] justify-end' : 'bg-[#d6d6d2] justify-start'}`}>
                              <span className="w-4 h-4 rounded-full bg-white" />
                            </span>
                          </div>
                          <div className="text-[12.5px] text-[#8c9099] line-clamp-2 min-h-[36px]">{t.prompt}</div>
                          <div className="border-t border-[#ececea] pt-2.5 flex items-center justify-between gap-2 text-[12px]">
                            <span className="text-[#6b7079]">⏰ {t.freq}</span>
                            <span className="flex items-center gap-2">
                              {t.on && <span className="text-[#8c9099]">下一次运行 {t.nextRun}</span>}
                              {!t.on && <span className="text-[#8c9099]">已暂停</span>}
                              {records > 0 && (
                                <button
                                  type="button"
                                  data-guided-target="schedule.viewRecords"
                                  onClick={kit.click('schedule.viewRecords', '查看运行记录', '看看它到底跑得怎么样。')}
                                  className={`relative border-0 bg-transparent text-accent-700 font-semibold cursor-pointer rounded px-1 ${kit.ring('schedule.viewRecords')}`}
                                >
                                  查看运行记录
                                  {kit.callout('schedule.viewRecords', 'bottom', 'end')}
                                </button>
                              )}
                            </span>
                          </div>
                          {isLesson && kit.callout('schedule.openTask', 'top', 'end')}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <RecordsTable {...props} />
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
      {shell.scheduleModalTaskId && <ScheduleModal {...props} />}
      {shell.scheduleRecordDetailId && <RecordDetail {...props} />}
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

/**
 * 「新建定时任务」表单（对照真机截图：每周工作周报模板点开后的样子）
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
            <button
              type="button"
              onClick={kit.aside(
                '允许完全访问',
                '这个下拉有两档：<b>完全访问权限（推荐）</b>：定时任务会在本地客户端无人值守执行，执行期间请勿关闭电脑或退出客户端；<b>默认权限</b>：敏感操作需用户确认，你离开屏幕任务就停在等待状态，只推荐在本地调试或手动监管时用。<br/>选完全访问，提示词里就要写死边界（只读、只生成、不删除、不发送）。'
              )}
              className="border-0 bg-transparent inline-flex items-center gap-1 text-[#dc2626] cursor-pointer"
            >
              <ShieldAlertIcon size={13} /> 允许完全访问 ▾
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2.5 text-[12.5px]">
          {[
            ['重复', tpl.repeat ?? '每天', '周期可选每天、每周几；也能按间隔或只跑一次。'],
            ['时间', tpl.time ?? '09:00', '几点跑。电脑那时候要开着、客户端别退出。'],
            ['有效期', '长期有效', '可以设一个截止日期，到期自动不再执行。'],
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
            onClick={kit.aside('消息推送到企业微信', '打开后，跑完把结果推到你的企业微信，人不在电脑前也能收到。要先在左边「助理」里绑好企业微信 bot，没绑时会显示「未连接 · 去绑定 →」。')}
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

/** 运行记录状态的颜色 */
function statusTone(r: ScheduleRecord) {
  if (r.status === 'success' || r.status === 'test') return { text: 'text-[#047857]', dot: 'bg-[#22c55e]' };
  if (r.status === 'catchup') return { text: 'text-[#c2410c]', dot: 'bg-[#f97316]' };
  return { text: 'text-[#dc2626]', dot: 'bg-[#ef4444]' };
}

/** 运行记录表：任务名称 / 状态 / 运行时间 / 操作 */
function RecordsTable(props: Props) {
  const { shell } = props;
  const kit = makeTargetKit(props);
  if (shell.scheduleRecords.length === 0) {
    return <div className="mt-16 text-center text-[13px] text-[#8c9099]">暂无运行记录</div>;
  }
  return (
    // 不用 overflow-hidden：蓝圈提示要伸出表格下沿
    <div className="rounded-[14px] border border-[#ececea] text-[12.5px] max-w-[1100px]">
      <div className="grid grid-cols-[1.4fr_1.6fr_1fr_0.9fr] bg-[#fafaf9] rounded-t-[14px] px-4 py-2 text-[#8c9099] font-medium">
        <span>任务名称</span>
        <span>状态</span>
        <span>运行时间</span>
        <span>操作</span>
      </div>
      {shell.scheduleRecords.map((r) => {
        // 课程里要点开的是测试运行那条
        const isTarget = r.status === 'test';
        const tone = statusTone(r);
        return (
          <div key={r.id} className="sim-msg-rise grid grid-cols-[1.4fr_1.6fr_1fr_0.9fr] items-center px-4 py-2.5 border-t border-[#f0f0ee]">
            <span className="truncate text-[#111318]">{r.taskName}</span>
            <span className="flex flex-col">
              <span className={`inline-flex items-center gap-1.5 font-medium ${tone.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${tone.dot}`} />
                {r.statusText}
              </span>
              {r.note && <span className="text-[11px] text-[#9a3412]">{r.note}</span>}
            </span>
            <span className="font-mono text-[#4a4f57]">{r.time}</span>
            <button
              type="button"
              data-guided-target={isTarget ? 'schedule.recordDetail' : undefined}
              onClick={
                isTarget
                  ? kit.click('schedule.recordDetail', '查看运行详情', '点开看这次到底产出了什么。')
                  : kit.aside(
                      '查看运行详情',
                      r.status === 'catchup'
                        ? '这条是补跑的：原定 08:30 电脑合着盖，打开后才补跑，早报晚到了 42 分钟。'
                        : '每条都能点开看摘要、制品和关联会话。'
                    )
              }
              className={`relative text-left border-0 bg-transparent text-accent-700 font-semibold cursor-pointer rounded px-1 ${isTarget ? kit.ring('schedule.recordDetail') : ''}`}
            >
              查看运行详情
              {isTarget && kit.callout('schedule.recordDetail', 'bottom', 'end')}
            </button>
          </div>
        );
      })}
    </div>
  );
}

/** 运行详情抽屉：标题 / 摘要 / 制品（资讯条目可点开来源核对）/ 运行明细 / 查看关联会话 */
function RecordDetail(props: Props) {
  const { shell } = props;
  const kit = makeTargetKit(props);
  const r = shell.scheduleRecords.find((x) => x.id === shell.scheduleRecordDetailId);
  if (!r) return null;
  const title = r.status === 'test' ? '测试运行成功' : `第 ${r.nth} 次运行${r.status === 'failed' ? '失败' : '成功'}`;
  return (
    <div className="absolute inset-0 z-20 bg-black/10 flex justify-end" onClick={(e) => e.stopPropagation()}>
      <div className="sim-slide-in-panel w-[400px] max-w-full h-full bg-white border-l border-[#ebebeb] shadow-[-12px_0_32px_rgba(17,19,24,0.12)] p-5 flex flex-col gap-4 text-[13px] overflow-y-auto">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-[15px] font-bold text-[#111318]">{title}</div>
            <div className="text-[12px] text-[#8c9099] mt-0.5 font-mono">
              {r.taskName} · {r.time}
            </div>
          </div>
          <button
            type="button"
            data-guided-target="schedule.closeDetail"
            aria-label="关闭运行详情"
            onClick={kit.click('schedule.closeDetail', '关闭', '看完就关掉。')}
            className={`relative w-7 h-7 rounded-lg border-0 bg-transparent hover:bg-[#f4f4f5] text-[17px] text-[#6b7079] cursor-pointer ${kit.ring('schedule.closeDetail')}`}
          >
            ×
            {kit.callout('schedule.closeDetail', 'left', 'center')}
          </button>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="text-[12.5px] font-semibold text-[#111318]">摘要</div>
          <div className="text-[12.5px] text-[#4a4f57] leading-[1.7]">{r.summary}</div>
        </div>
        {r.artifactFile && (
          <div className="flex flex-col gap-1.5">
            <div className="text-[12.5px] font-semibold text-[#111318]">制品</div>
            <div className="rounded-[12px] border border-[#ebebeb]">
              <div className="px-3 py-2 bg-[#fafaf9] rounded-t-[12px] border-b border-[#f0f0ee] font-mono text-[12px] text-[#111318]">📄 {r.artifactFile}</div>
              <div className="px-3 py-2.5 flex flex-col gap-2.5 text-[12px] leading-[1.65] text-[#2b2f36]">
                {r.artifactItems
                  ? r.artifactItems.map((it, idx) => {
                      const isTarget = idx === 0;
                      const checked = shell.scheduleCheckedSource === it.title;
                      return (
                        <div key={it.title} className="flex flex-col gap-0.5">
                          <div className="font-semibold text-[#111318]">
                            {idx + 1}. {it.title}
                          </div>
                          <div className="text-[#4a4f57]">{it.point}</div>
                          <div className="text-[11.5px] text-[#8c9099]">
                            发布时间 {it.published} ·{' '}
                            <button
                              type="button"
                              data-guided-target={isTarget ? 'schedule.checkSource' : undefined}
                              onClick={
                                isTarget
                                  ? kit.click('schedule.checkSource', '原文链接', '点开原文，核对标题和发布时间对不对得上。')
                                  : kit.aside('原文链接', '真机里点开就是原文网页。核对两件事：标题说的是不是同一件事、发布时间是不是 24 小时内。')
                              }
                              className={`relative border-0 bg-transparent p-0 text-accent-700 underline underline-offset-2 cursor-pointer rounded ${isTarget ? kit.ring('schedule.checkSource') : ''}`}
                            >
                              {it.source} · 原文 ↗
                              {isTarget && kit.callout('schedule.checkSource', 'bottom', 'start')}
                            </button>
                          </div>
                          {checked && (
                            <div className="sim-msg-rise mt-1 rounded-[10px] border border-[#bbf7d0] bg-[#f0fdf4] px-2.5 py-2 text-[11.5px] text-[#166534] leading-[1.6]">
                              <div className="text-[10.5px] text-[#4d7c0f]">原文页（模拟）</div>
                              <div>
                                《{it.title}》 · {it.source} · 发布于 2026-{it.published}
                              </div>
                              <div className="font-semibold">✓ 标题对得上 · 距试跑约 14 小时，在 24 小时内</div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  : r.artifactLines?.map((ln) => <div key={ln}>{ln}</div>)}
              </div>
            </div>
          </div>
        )}
        {r.runLog && (
          <div className="flex flex-col gap-1.5">
            <div className="text-[12.5px] font-semibold text-[#111318]">运行明细</div>
            <div className="text-[12px] text-[#6b7079] font-mono leading-[1.8]">
              {r.runLog.map((ln) => (
                <div key={ln}>{ln}</div>
              ))}
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={kit.aside('查看关联会话', '每次运行其实就是一个完整的对话，点这里能看它当时怎么查、怎么写的，还能接着追问。')}
          className="mt-auto h-9 rounded-[10px] border border-[#e6e6e3] bg-white text-[13px] cursor-pointer"
        >
          查看关联会话
        </button>
      </div>
    </div>
  );
}

/** 编辑定时任务弹窗（对照 02-配置定时任务与频率.png，补上语言包里的执行权限和提示） */
function ScheduleModal(props: Props) {
  const { shell } = props;
  const kit = makeTargetKit(props);
  const t = shell.scheduledTasks.find((x) => x.id === shell.scheduleModalTaskId);
  if (!t) return null;
  const full = t.permission === 'full';
  const runCount = shell.scheduleRecords.length;

  return (
    <div className="absolute inset-0 z-30 bg-black/25 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
      <div className="sim-pop-up w-full max-w-[760px] max-h-full overflow-y-auto rounded-[20px] bg-white shadow-[0_24px_60px_rgba(17,19,24,0.25)] p-5 flex flex-col gap-4">
        <div>
          <div className="text-[16px] font-bold text-[#111318]">编辑定时任务</div>
          <div className="text-[12px] text-[#8c9099] mt-0.5">定时任务仅支持「定时执行」一种触发形态</div>
        </div>

        <div className="grid grid-cols-[1.1fr_1fr] gap-0 rounded-[16px] border border-[#ececea]">
          {/* 左栏：名称 + 提示词 */}
          <div className="p-4 flex flex-col gap-3 border-r border-[#ececea]">
            <div className="flex flex-col gap-1.5">
              <span className="text-[13px] font-semibold text-[#111318]">名称</span>
              <div className="h-9 px-3 rounded-[10px] border border-[#e6e6e3] flex items-center text-[13px] text-[#111318]">{t.name}</div>
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <span className="text-[13px] font-semibold text-[#111318]">提示词</span>
              <div className="flex-1 min-h-[150px] rounded-[10px] border border-[#e6e6e3] p-3 flex flex-col justify-between gap-3">
                <div className="text-[12.5px] leading-[1.7] text-[#111318] whitespace-pre-line">{t.prompt}</div>
                <div className="flex flex-wrap items-center gap-3 text-[12px] text-[#4a4f57]">
                  {[
                    ['Hy4 flash ∨', '定时任务可以单独选模型。早报这种活用便宜的就够。'],
                    ['技能', '可以给这个任务挂技能。'],
                    ['召唤专家 ∨', '可以指定一个专家来跑。'],
                    ['连接器(0)', '勾选即授权该连接器在任务中免确认使用。早报只要联网搜索，不需要连接器，一个都别勾。'],
                  ].map(([label, tip]) => (
                    <button key={label} type="button" onClick={kit.aside(label.replace(' ∨', ''), tip)} className="border-0 bg-transparent cursor-pointer text-[#4a4f57]">
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 右栏：状态 / 执行频率 / 有效期 / 执行权限 */}
          <div className="p-4 flex flex-col gap-3">
            <div className="rounded-[12px] border border-[#ececea] px-3 py-2.5 flex items-center justify-between">
              <div>
                <div className="text-[13px] font-semibold text-[#111318]">运行中</div>
                <div className="text-[11.5px] text-[#8c9099]">{shell.scheduleTestRan ? Math.max(runCount, 1) : runCount} 次运行</div>
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
              <div className="h-8 px-3 rounded-[10px] border border-[#e6e6e3] flex items-center text-[12.5px] font-mono">08:30</div>
            </div>
            <div className="text-[12px]">
              <b className="text-[#111318]">有效期</b> <span className="text-[#8c9099]">可选，留空表示始终生效。</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[13px] font-semibold text-[#111318]">
                执行权限 <span className="font-normal text-[11.5px] text-[#8c9099]">控制任务运行时工具调用是否需要确认</span>
              </span>
              <button
                type="button"
                data-guided-target="schedule.permFull"
                onClick={kit.click('schedule.permFull', '免确认执行', '无人值守的任务选这个，否则卡在确认上。')}
                className={`relative text-left rounded-[10px] border px-3 py-2 cursor-pointer ${full ? 'border-accent-300 bg-accent-50' : 'border-[#e6e6e3] bg-white'} ${kit.ring('schedule.permFull')}`}
              >
                <div className="text-[12.5px] font-semibold text-[#111318]">{full ? '◉' : '○'} 免确认执行</div>
                <div className="text-[11px] text-[#6b7079]">所有工具自动运行，无需逐次确认（适合无人值守的定时任务）</div>
                {kit.callout('schedule.permFull', 'left', 'center')}
              </button>
              <button
                type="button"
                onClick={kit.aside('需逐次确认', '每次工具调用都会暂停等待人工确认。你人不在电脑前，任务就会一直卡着不动。')}
                className={`text-left rounded-[10px] border px-3 py-2 cursor-pointer ${!full ? 'border-accent-300 bg-accent-50' : 'border-[#e6e6e3] bg-white'}`}
              >
                <div className="text-[12.5px] font-semibold text-[#111318]">{!full ? '◉' : '○'} 需逐次确认</div>
                <div className="text-[11px] text-[#6b7079]">每次工具调用都会暂停等待人工确认</div>
              </button>
            </div>
          </div>
        </div>

        <div className="text-[11.5px] text-[#9a3412] bg-[#fff6ef] rounded-lg px-3 py-2">
          提示：定时任务执行时，请勿关闭电脑或退出客户端，否则任务将无法正常执行
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
              data-guided-target="schedule.save"
              onClick={kit.click('schedule.save', '保存', '把这次的修改存下来。')}
              className={`relative h-9 px-4 rounded-[10px] border-0 bg-[#111318] text-white text-[13px] font-semibold cursor-pointer ${kit.ring('schedule.save')}`}
            >
              保存
              {kit.callout('schedule.save', 'top', 'end')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
