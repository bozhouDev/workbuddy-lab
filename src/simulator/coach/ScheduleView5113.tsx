import { ChevronDownIcon, SearchIcon } from '../shell/icons';
import type { GuidedShellState } from './guidedTypes';
import { makeTargetKit, type TargetKitProps } from './targetKit';

interface Props extends TargetKitProps {
  shell: GuidedShellState;
}

/**
 * 定时任务页（对照 5.11.3 截图 + 语言包 automation.* 文案）
 * 包含：任务列表 / 运行记录两个标签、新建下拉、编辑弹窗、运行详情抽屉，以及一个教学用的「快进 3 天」按钮
 */
export function ScheduleView5113(props: Props) {
  const { shell } = props;
  const kit = makeTargetKit(props);
  const tasks = shell.scheduledTasks;
  const activeCount = tasks.filter((t) => t.on).length;

  return (
    <div className="relative flex-1 min-w-0 flex flex-col bg-white overflow-hidden" data-view="schedule">
      <div className="shrink-0 px-6 pt-5 pb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-5">
          <span className="text-[18px] font-bold text-[#111318]">定时任务</span>
          <div className="flex items-center gap-4 text-[13.5px]">
            <button
              type="button"
              onClick={kit.aside('定时任务', '这里管理所有定时任务：开关、编辑、立即运行。')}
              className={`border-0 bg-transparent cursor-pointer ${shell.scheduleTab === 'tasks' ? 'font-semibold text-[#111318]' : 'text-[#8c9099]'}`}
            >
              定时任务
            </button>
            <button
              type="button"
              onClick={kit.aside('运行记录', '每次运行（成功、失败、补跑）都会记在「运行记录」里，点开能看摘要和产物。')}
              className={`border-0 bg-transparent cursor-pointer ${shell.scheduleTab === 'records' ? 'font-semibold text-[#111318]' : 'text-[#8c9099]'}`}
            >
              运行记录
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 relative">
          <span className="hidden xl:inline-flex h-8 px-2.5 rounded-lg border border-[#e6e6e3] items-center gap-1.5 text-[12.5px] text-[#9ea3ad]">
            <SearchIcon size={13} /> 搜索
          </span>
          <button
            type="button"
            onClick={kit.aside('批量管理', '任务多了以后用它批量删除。删除会连运行记录一起删掉，且无法恢复。')}
            className="h-8 px-3 rounded-lg border border-[#e6e6e3] bg-white text-[12.5px] cursor-pointer"
          >
            批量管理
          </button>
          <div className="inline-flex rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={kit.aside('新建', '直接点「新建」是自己手动填名称、提示词和频率。新手更推荐点旁边小箭头里的「从对话新建」。')}
              className="h-8 px-3 border-0 bg-[#111318] text-white text-[12.5px] font-semibold cursor-pointer"
            >
              新建
            </button>
            <button
              type="button"
              data-guided-target="schedule.newMenu"
              aria-label="更多新建方式"
              onClick={kit.click('schedule.newMenu', '新建方式', '点小箭头展开更多新建方式。')}
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
                onClick={kit.click('schedule.fromChat', '从对话新建', '回到首页，用对话把任务说清楚，AI 帮你建好。')}
                className={`relative text-left border-0 bg-transparent hover:bg-[#f4f4f5] rounded-lg px-3 py-2 cursor-pointer ${kit.ring('schedule.fromChat')}`}
              >
                从对话新建
                {kit.callout('schedule.fromChat', 'left', 'center')}
              </button>
              <button
                type="button"
                onClick={kit.aside('从模板新建', '官方现成模板，改改时间就能用。但模板的提示词没在你这儿跑过，一样要先试跑。')}
                className="text-left border-0 bg-transparent hover:bg-[#f4f4f5] rounded-lg px-3 py-2 cursor-pointer"
              >
                从模板新建
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {shell.scheduleTab === 'tasks' ? (
          <>
            <div className="flex items-center gap-2 text-[12.5px] mb-3">
              <span className="px-2.5 py-1 rounded-lg bg-[#f1f1ef] font-semibold text-[#111318]">全部({tasks.length})</span>
              <span className="px-2.5 py-1 text-[#5c5f66]">进行中({activeCount})</span>
              <span className="px-2.5 py-1 text-[#5c5f66]">已暂停({tasks.length - activeCount})</span>
            </div>

            {tasks.length === 0 ? (
              <div className="mt-16 flex flex-col items-center gap-2 text-center">
                <div className="w-12 h-12 rounded-full bg-[#f4f4f5] inline-flex items-center justify-center text-[20px]">⏰</div>
                <div className="text-[14px] font-semibold text-[#111318]">开启你的第一个定时任务吧</div>
                <div className="text-[12.5px] text-[#8c9099]">暂无定时任务</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 2xl:grid-cols-2 gap-3">
                {tasks.map((t) => (
                  <div
                    key={t.id}
                    role="button"
                    tabIndex={0}
                    data-guided-target="schedule.openTask"
                    onClick={kit.click('schedule.openTask', t.name, '点任务卡片打开编辑弹窗。')}
                    className={`sim-msg-rise relative rounded-[14px] border border-[#ececea] bg-white p-4 flex flex-col gap-2 cursor-pointer hover:shadow-[0_6px_20px_rgba(17,19,24,0.08)] ${kit.ring('schedule.openTask')}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-[14px] text-[#111318] truncate">⏰ {t.name}</span>
                      <span className={`w-9 h-5 rounded-full p-0.5 flex shrink-0 ${t.on ? 'bg-[#111318] justify-end' : 'bg-[#d6d6d2] justify-start'}`}>
                        <span className="w-4 h-4 rounded-full bg-white" />
                      </span>
                    </div>
                    <div className="text-[12.5px] text-[#6b7079] line-clamp-2">{t.prompt}</div>
                    <div className="flex items-center justify-between gap-2 text-[12px] pt-1">
                      <span className="text-[#4a4f57]">
                        {t.on ? `${t.freq} · 下一次运行 ${t.nextRun}` : '已暂停'}
                      </span>
                      <span className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={kit.aside('立即运行', '不等到点，马上跑一次。适合改完提示词后验货。')}
                          className="border-0 bg-transparent text-[#5c5f66] cursor-pointer"
                        >
                          立即运行
                        </button>
                        {shell.scheduleRecords.length > 0 && (
                          <button
                            type="button"
                            data-guided-target="schedule.viewRecords"
                            onClick={kit.click('schedule.viewRecords', '查看运行记录', '看看这几天它到底跑得怎么样。')}
                            className={`relative border-0 bg-transparent text-accent-700 font-semibold cursor-pointer rounded px-1 ${kit.ring('schedule.viewRecords')}`}
                          >
                            查看运行记录 ({shell.scheduleRecords.length})
                            {kit.callout('schedule.viewRecords', 'bottom', 'end')}
                          </button>
                        )}
                      </span>
                    </div>
                    {kit.callout('schedule.openTask', 'bottom', 'start')}
                  </div>
                ))}
              </div>
            )}

            {/* 教学控件：模拟时间流逝（真机没有这个按钮） */}
            {tasks.length > 0 && shell.scheduleRecords.length === 0 && !shell.scheduleModalOpen && (
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
          </>
        ) : (
          <RecordsTable {...props} />
        )}
      </div>

      {shell.scheduleModalOpen && <ScheduleModal {...props} />}
      {shell.scheduleRecordDetailId && <RecordDetail {...props} />}
    </div>
  );
}

/** 运行记录表：任务名称 / 状态 / 运行时间 / 操作 */
function RecordsTable(props: Props) {
  const { shell } = props;
  const kit = makeTargetKit(props);
  if (shell.scheduleRecords.length === 0) {
    return <div className="mt-16 text-center text-[13px] text-[#8c9099]">暂无运行记录</div>;
  }
  return (
    // 不用 overflow-hidden：最后一行的蓝圈提示要伸出表格下沿
    <div className="rounded-[14px] border border-[#ececea] text-[12.5px]">
      <div className="grid grid-cols-[1.4fr_1.6fr_1fr_0.9fr] bg-[#fafaf9] rounded-t-[14px] px-4 py-2 text-[#8c9099] font-medium">
        <span>任务名称</span>
        <span>状态</span>
        <span>运行时间</span>
        <span>操作</span>
      </div>
      {shell.scheduleRecords.map((r, idx) => {
        const isTarget = idx === shell.scheduleRecords.length - 1;
        return (
          <div key={r.id} className="grid grid-cols-[1.4fr_1.6fr_1fr_0.9fr] items-center px-4 py-2.5 border-t border-[#f0f0ee]">
            <span className="truncate text-[#111318]">{r.taskName}</span>
            <span className="flex flex-col">
              <span
                className={`inline-flex items-center gap-1.5 font-medium ${
                  r.status === 'success' ? 'text-[#047857]' : r.status === 'catchup' ? 'text-[#c2410c]' : 'text-[#dc2626]'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${r.status === 'success' ? 'bg-[#22c55e]' : r.status === 'catchup' ? 'bg-[#f97316]' : 'bg-[#ef4444]'}`} />
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
                  : kit.aside('查看运行详情', r.status === 'catchup' ? '这条是补跑的：原定 08:30 电脑合着盖，打开后才补跑，早报晚到了 42 分钟。' : '每条都能点开看摘要、产物和关联会话。')
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

/** 运行详情抽屉：第 n 次运行成功 / 摘要 / 制品 / 运行明细 / 查看关联会话 */
function RecordDetail(props: Props) {
  const { shell } = props;
  const kit = makeTargetKit(props);
  const r = shell.scheduleRecords.find((x) => x.id === shell.scheduleRecordDetailId);
  if (!r) return null;
  return (
    <div className="absolute inset-0 z-20 bg-black/10 flex justify-end" onClick={(e) => e.stopPropagation()}>
      <div className="sim-slide-in-panel w-[380px] h-full bg-white border-l border-[#ebebeb] shadow-[-12px_0_32px_rgba(17,19,24,0.12)] p-5 flex flex-col gap-4 text-[13px] overflow-y-auto">
        <div>
          <div className="text-[15px] font-bold text-[#111318]">
            第 {r.nth} 次运行{r.status === 'failed' ? '失败' : '成功'}
          </div>
          <div className="text-[12px] text-[#8c9099] mt-0.5 font-mono">{r.taskName} · {r.time}</div>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="text-[12.5px] font-semibold text-[#111318]">摘要</div>
          <div className="text-[12.5px] text-[#4a4f57] leading-[1.7]">{r.summary}</div>
        </div>
        {r.artifactFile && (
          <div className="flex flex-col gap-1.5">
            <div className="text-[12.5px] font-semibold text-[#111318]">制品</div>
            <div className="rounded-[12px] border border-[#ebebeb] overflow-hidden">
              <div className="px-3 py-2 bg-[#fafaf9] border-b border-[#f0f0ee] font-mono text-[12px] text-[#111318]">📄 {r.artifactFile}</div>
              <div className="px-3 py-2.5 flex flex-col gap-1.5 text-[12px] leading-[1.65] text-[#2b2f36]">
                {r.artifactLines?.map((ln) => <div key={ln}>{ln}</div>)}
              </div>
            </div>
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <div className="text-[12.5px] font-semibold text-[#111318]">运行明细</div>
          <div className="text-[12px] text-[#6b7079] font-mono leading-[1.8]">
            08:30:00 开始执行
            <br />
            08:30:41 联网搜索 · 读取 23 条
            <br />
            08:31:58 写入 {r.artifactFile}
          </div>
        </div>
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
  const t = shell.scheduledTasks[0];
  if (!t) return null;
  const full = t.permission === 'full';

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
                <div className="text-[11.5px] text-[#8c9099]">{shell.scheduleTestRan ? '1 次运行' : '0 次运行'}</div>
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
              <div className="h-8 px-3 rounded-[10px] border border-[#e6e6e3] flex items-center justify-between text-[12.5px]">每天 <ChevronDownIcon size={11} /></div>
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
                onClick={kit.click('schedule.permFull', '免确认执行', '无人值守的任务选这个，否则半夜卡在确认框。')}
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
              onClick={kit.click('schedule.run', '运行', '保存之前先点运行试跑一次，测试运行不影响正式调度时间。')}
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
              onClick={kit.click('schedule.save', '保存', '试跑满意再保存。')}
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
