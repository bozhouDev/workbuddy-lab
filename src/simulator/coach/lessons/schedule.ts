import type { ChatRunSpec, GuidedLessonDef, ScheduledTask, ScheduleRecord } from '../guidedTypes';
import { createBaseGuidedState } from './baseState';
import { freeChat } from './freeChat';

/** 已经手动跑满意 3 次的早报提示词 */
const BRIEF_PROMPT =
  '搜索过去 24 小时的 AI 行业新闻，挑 5 条最重要的，每条写：标题、一句话要点、原文链接；只要 24 小时内的，没有就写「今日无重大新闻」；存成 每日AI资讯_日期.md。只生成文件，不删除、不发送任何东西。';
/** 「从对话新建」会把输入框预填成这句（5.11.3 代码核实） */
const FROM_CHAT_PREFIX = '帮我创建一个定时任务：';
const CREATE_PROMPT = `${FROM_CHAT_PREFIX}每天 08:30 执行：${BRIEF_PROMPT}`;

/** 开课前「最近」里那条手动跑满意的对话 */
const MANUAL_CHAT: ChatRunSpec = freeChat({
  id: 'schedule-manual',
  prompt: BRIEF_PROMPT,
  chatTitle: 'AI 资讯早报（手动第 3 次 · 满意）',
  footerTip: '手动跑了 3 次，每次都核对过链接',
  elapsed: '1m 12s',
  steps: [{ running: '联网搜索…', done: '已写入 每日AI资讯_2026-11-23.md' }],
  replyHtml: '已生成今日早报，5 条均为 24 小时内新闻，链接已逐条打开确认可访问。',
  fileCard: { name: '每日AI资讯_2026-11-23.md', meta: '5 条 · 均附原文链接' },
});

const TASK: ScheduledTask = {
  id: 'ai-brief',
  name: '每日 AI 资讯早报',
  prompt: BRIEF_PROMPT,
  freq: '每天 08:30',
  on: true,
  permission: 'confirm',
  nextRun: '明天 08:30',
};

/** 快进 3 天后的运行记录（新的在上面） */
const RECORDS: ScheduleRecord[] = [
  {
    id: 'r3',
    nth: 3,
    taskName: '每日 AI 资讯早报',
    status: 'success',
    statusText: '运行成功',
    time: '11-26 08:30',
    artifactFile: '每日AI资讯_2026-11-26.md',
    summary: '找到 5 条 24 小时内的新闻，已生成文件。',
    artifactLines: ['1. ……', '2. ……'],
  },
  {
    id: 'r2',
    nth: 2,
    taskName: '每日 AI 资讯早报',
    status: 'catchup',
    statusText: '补跑成功',
    time: '11-25 09:12',
    note: '已错过计划时间，将补跑一次',
    artifactFile: '每日AI资讯_2026-11-25.md',
    summary: '08:30 设备未在线，开机后补跑一次。',
    artifactLines: ['1. ……'],
  },
  {
    id: 'r1',
    nth: 1,
    taskName: '每日 AI 资讯早报',
    status: 'success',
    statusText: '运行成功',
    time: '11-24 08:30',
    artifactFile: '每日AI资讯_2026-11-24.md',
    summary: '联网搜索 23 条候选，按重要性挑出 5 条，均为过去 24 小时内发布，已生成文件。',
    artifactLines: [
      '1. 某开源模型发布新版本：推理速度提升约 40%（原文链接）',
      '2. 某云厂商下调大模型 API 价格（原文链接）',
      '3. ……',
      '4. ……',
      '5. ……',
    ],
  },
];

export const scheduleLesson: GuidedLessonDef = {
  id: 'schedule',
  code: '4.1',
  title: '定时任务：建一个，看结果',
  guideUrl: '/features/automation/schedule/',
  initialState: () =>
    createBaseGuidedState({
      selectedGroup: 'WorkBuddy-练习',
      selectedModel: 'Hy4 flash',
      chatHistory: [MANUAL_CHAT],
    }),
  steps: [
    {
      id: 'intro',
      phase: 0,
      say: [
        '定时任务就是<b>到点自动跑</b>：你睡觉它干活，每次跑完结果记在「运行记录」里。',
        '铁律只有一条：<b>手动跑满意 2–3 次，再设成自动</b>。左边「最近」里那条「AI 资讯早报」就是我手动跑过 3 次、每次都核对过的。先看看不守这条铁律会怎样。',
      ],
      buttons: [{ label: '看看直接设自动会怎样', primary: true }],
    },
    {
      id: 'fail',
      phase: 1,
      say: ['有人一上来就建了个定时任务「每天早上 8 点给我发 AI 新闻」，没试跑过。第二天打开第一次的结果：'],
      card: {
        kind: 'doc',
        title: '每日AI新闻.md（第 1 次自动运行）',
        badge: '没试跑就上线',
        badgeTone: 'warn',
        lines: [
          '1. AI 行业持续快速发展',
          '2. 多家公司发布大模型新进展',
          '3. 某模型发布（7 天前的旧闻）',
          '（没有链接，没法核对）',
        ],
      },
      after: [
        '只有 3 条空泛标题、混进一周前的旧闻、没有链接。<b>提示词没人检查过，就每天自动产出一份没用的东西</b>，你还不一定发现。',
        '正确做法：拿那条跑满意的提示词去建。点左边「定时任务」。',
      ],
      wait: { target: 'nav.schedule', callout: '点定时任务', label: '定时任务' },
      onAction: () => ({ view: 'schedule', scheduleTab: 'tasks' }),
    },
    {
      id: 'new-menu',
      phase: 1,
      navLabel: '新建 ▾',
      say: [
        '还没有任务：「开启你的第一个定时任务吧」。右上角「新建」直接点是手动填表；旁边的<b>小箭头</b>里有更顺手的办法。',
      ],
      wait: { target: 'schedule.newMenu', callout: '点小箭头', label: '新建方式' },
      onAction: () => ({ scheduleNewMenuOpen: true }),
    },
    {
      id: 'from-chat',
      phase: 1,
      navLabel: '从对话新建',
      say: [],
      wait: { target: 'schedule.fromChat', callout: '选从对话新建', label: '从对话新建' },
      onAction: () => ({ scheduleNewMenuOpen: false, view: 'home', composerText: CREATE_PROMPT }),
    },
    {
      id: 'send-create',
      phase: 1,
      say: [
        '回到首页，输入框开头被预填成「<b>帮我创建一个定时任务：</b>」，后面交给你说。',
        '我把那条跑满意的提示词接在后面，补上了<b>频率和时间</b>（每天 08:30）和<b>安全边界</b>（只生成文件，不删除、不发送）。发送，让它帮你建。',
      ],
      wait: { target: 'composer.send', callout: '发送，让它建任务', label: '发送（建定时任务）' },
      onAction: () => ({ scheduledTasks: [TASK] }),
      runChat: () =>
        freeChat({
          id: 'schedule-create',
          prompt: CREATE_PROMPT,
          chatTitle: '创建定时任务 · 每日 AI 资讯早报',
          footerTip: '建好的任务在左侧「定时任务」里',
          elapsed: '8s',
          steps: [
            { running: '解析执行频率…', done: '执行频率：每天 08:30' },
            { running: '创建定时任务…', done: '已创建定时任务「每日 AI 资讯早报」' },
          ],
          replyHtml:
            '已创建定时任务「每日 AI 资讯早报」，每天 08:30 执行，提示词沿用你给的原文。建议先去「定时任务」里点「运行」试跑一次。',
        }),
    },
    {
      id: 'go-schedule',
      phase: 1,
      navLabel: '定时任务',
      onEnter: () => ({ toast: '定时任务已新建成功' }),
      say: ['顶上提示「定时任务已新建成功」。回「定时任务」看看它。'],
      wait: { target: 'nav.schedule', callout: '回定时任务', label: '定时任务' },
      onAction: () => ({ view: 'schedule', scheduleTab: 'tasks' }),
    },
    {
      id: 'open-task',
      phase: 1,
      navLabel: '打开任务',
      say: ['任务卡片出来了。<b>别急着走，点开检查一遍设置</b>。'],
      wait: { target: 'schedule.openTask', callout: '点开检查设置', label: '每日 AI 资讯早报' },
      onAction: () => ({ scheduleModalOpen: true }),
    },
    {
      id: 'perm',
      phase: 1,
      navLabel: '执行权限',
      say: [
        '「编辑定时任务」从左往右看：<b>名称、提示词</b>，提示词下面能挑模型、技能、专家、连接器（勾选连接器等于授权它在任务里免确认使用，用不到别勾）；右边是<b>执行频率</b>（周期 / 按间隔 / 单次）、每天、08:30，有效期留空表示一直有效。',
        '最要紧的是<b>执行权限</b>。现在是「需逐次确认」：每次调用工具都停下来等你点头。<b>早上 8:30 你不在电脑前，它就一直卡着</b>。改成「免确认执行」。',
      ],
      wait: { target: 'schedule.permFull', callout: '无人值守选这个', label: '免确认执行' },
      onAction: (s) => ({ scheduledTasks: s.scheduledTasks.map((t) => ({ ...t, permission: 'full' as const })) }),
    },
    {
      id: 'run-test',
      phase: 1,
      navLabel: '运行',
      say: [
        '免确认的代价：<b>没人替你把关，所以提示词里必须写死边界</b>，我们写了「只生成文件，不删除、不发送」。',
        '底下那行提示也要记住：<b>执行时别关电脑、别退出客户端</b>（1.1 节的防休眠就是为它准备的）。保存前先点「<b>运行</b>」试跑一次。',
      ],
      wait: { target: 'schedule.run', callout: '先试跑一次', label: '运行' },
      onAction: () => ({ scheduleTestRan: true, toast: '已触发测试运行。测试运行不会影响正式调度时间。' }),
    },
    {
      id: 'save',
      phase: 1,
      navLabel: '保存',
      say: [
        '「已触发测试运行。<b>测试运行不会影响正式调度时间。</b>」跑完会提示「测试运行成功」，产出在「最近」里能看到。确认满意，点「保存」。',
      ],
      wait: { target: 'schedule.save', callout: '满意再保存', label: '保存' },
      onAction: () => ({ scheduleModalOpen: false, toast: null }),
    },
    {
      id: 'fast-forward',
      phase: 2,
      say: [
        '卡片上：开关打开、<b>每天 08:30 · 下一次运行 明天 08:30</b>。',
        '接下来要等 3 天才能看到结果，模拟器帮你快进。点下面的「快进 3 天」（真机没有这个按钮）。',
      ],
      wait: { target: 'schedule.fastForward', callout: '快进 3 天', label: '快进 3 天（模拟）' },
      onAction: () => ({ scheduleRecords: RECORDS, scheduledTasks: [{ ...TASK, permission: 'full', nextRun: '明天 08:30' }] }),
    },
    {
      id: 'view-records',
      phase: 2,
      navLabel: '运行记录',
      say: ['3 天过去了。卡片右下角多了「查看运行记录」，点它。'],
      wait: { target: 'schedule.viewRecords', callout: '看运行记录', label: '查看运行记录' },
      onAction: () => ({ scheduleTab: 'records' }),
    },
    {
      id: 'record-detail',
      phase: 2,
      navLabel: '运行详情',
      say: [
        '三条记录，看中间那条橙色的：11-25 那天 08:30 电脑合着盖，状态是「<b>已错过计划时间，将补跑一次</b>」，开机后 09:12 补跑成功。<b>早报晚到了 42 分钟</b>，时效性的任务要注意。',
        '再点开最早那条 11-24 的「查看运行详情」，看它到底产出了什么。',
      ],
      wait: { target: 'schedule.recordDetail', callout: '点开看详情', label: '查看运行详情' },
      onAction: () => ({ scheduleRecordDetailId: 'r1' }),
    },
    {
      id: 'summary',
      phase: 3,
      say: [
        '详情分四块：<b>摘要</b>（这次干了什么）、<b>制品</b>（产出的文件，能直接预览）、<b>运行明细</b>（每一步几点几分）、<b>查看关联会话</b>（当时的完整对话，还能接着追问）。',
        '<b>头三次一定要点开制品核对</b>：是不是 24 小时内的、链接能不能打开。没问题以后再偶尔抽查。',
      ],
      card: {
        kind: 'table',
        title: '定时任务清单',
        headers: ['顺序', '做什么'],
        rows: [
          ['① 手动跑满意 2–3 次', '提示词没问题再自动化'],
          ['② 从对话新建', '把跑满意的提示词 + 频率时间 + 安全边界一起说'],
          ['③ 先运行试跑', '测试运行不影响正式调度'],
          ['④ 执行权限按风险选', '无人值守选免确认，但提示词写死只读 / 只生成'],
          ['⑤ 电脑别睡', '合盖或退出客户端会错过，只能补跑'],
          ['⑥ 头三次看运行记录', '点开制品核对内容'],
          ['⑦ 不要了就暂停或删除', '每次运行都会消耗额度'],
        ],
      },
      buttons: [
        { label: '下一节：4.2 助理：手机遥控电脑 →', primary: true, nextLesson: 'assistant' },
        { label: '读本节图文教程', href: '/features/automation/schedule/' },
        { label: '重来一遍', restart: true },
      ],
    },
  ],
};
