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

/** 从模板「父母联系提醒」建出来的任务（11-23 是周一，下一次是周日 11-29） */
const PARENT_TASK: ScheduledTask = {
  id: 'parent-reminder',
  name: '父母联系提醒',
  prompt: '每周日十点提醒我给家人打电话或发消息，简单问候近况。',
  freq: '每周日 10:00',
  on: true,
  permission: 'full',
  nextRun: '11月29日 10:00',
};

/** 点「运行」后的测试运行：制品里每条资讯都带发布时间和可点开的来源（示例数据，不对应真实新闻） */
const TEST_RECORD: ScheduleRecord = {
  id: 'test',
  nth: 0,
  taskName: '每日 AI 资讯早报',
  status: 'test',
  statusText: '测试运行成功',
  time: '11-23 21:42',
  artifactFile: '每日AI资讯_2026-11-23.md',
  summary: '联网搜索 23 条候选，按重要性挑出 5 条，均为过去 24 小时内发布，已生成文件。',
  artifactItems: [
    { title: '某开源大模型发布新版本', point: '推理速度提升约 40%，可免费商用。', published: '11-23 07:15', source: '某科技媒体' },
    { title: '某云厂商下调大模型 API 价格', point: '主力模型输入价格下调一半，即日生效。', published: '11-23 10:02', source: '厂商官方博客' },
    { title: '某办公软件上线 AI 表格助手', point: '可以用一句话生成公式和图表。', published: '11-22 23:30', source: '产品发布页' },
    { title: '某高校发布具身智能数据集', point: '包含 10 万段机器人操作视频，开放下载。', published: '11-23 15:48', source: '项目主页' },
    { title: '某 AI 编程工具更新', point: '支持多个文件同时修改，并能自动跑测试。', published: '11-23 18:20', source: '开源项目发布页' },
  ],
  runLog: ['21:42:03 开始执行（测试运行）', '21:42:41 联网搜索 · 读取 23 条', '21:43:58 写入 每日AI资讯_2026-11-23.md'],
};

/** 快进 3 天后多出来的正式运行记录（新的在上面，测试运行那条留在最下面） */
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
    summary: '找到 5 条 24 小时内的新闻，已生成文件。',
    artifactLines: ['1. ……', '2. ……'],
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
        '还没有任务：「开启你的第一个定时任务吧」。建任务有<b>两种方式</b>，都在右上角「新建」旁边的<b>小箭头</b>里。',
      ],
      wait: { target: 'schedule.newMenu', callout: '点小箭头', label: '新建方式' },
      onAction: () => ({ scheduleNewMenuOpen: true }),
    },
    {
      id: 'from-template',
      phase: 1,
      navLabel: '从模板新建',
      say: ['「从对话新建」和「从模板新建」。先用最省事的：<b>从模板新建</b>。'],
      wait: { target: 'schedule.fromTemplate', callout: '先试试模板', label: '从模板新建' },
      onAction: () => ({ scheduleNewMenuOpen: false, scheduleTemplatesOpen: true }),
    },
    {
      id: 'pick-template',
      phase: 1,
      navLabel: '父母联系提醒',
      say: [
        '「从模板添加」里有 12 个现成的。模板分两类：<b>提醒类</b>（父母联系提醒、体检预约提醒）只是到点提醒你一句，开箱即用；<b>干活类</b>（每日 AI 新闻推送、每周工作周报）要它真去查、去写，提示词没在你这儿跑过，跟开头翻车那个一样，要改过、试跑过才放心。不信可以点第一个「每日 AI 新闻推送」看看它的提示词。',
        '先建一个提醒类的：点「<b>父母联系提醒</b>」。',
      ],
      wait: { target: 'schedule.pickTemplate', callout: '点父母联系提醒', label: '父母联系提醒' },
      onAction: () => ({ scheduleCreateTemplateId: 'parentContactReminder' }),
    },
    {
      id: 'template-confirm',
      phase: 1,
      navLabel: '确定',
      say: [
        '「新建定时任务」表单已经按模板填好了：名称、提示词，下面是<b>重复（每周 周日）、时间（10:00）、有效期（长期有效）</b>。',
        '提示词下面那个红色的「<b>允许完全访问</b>」是执行权限：任务跑的时候不再一步步问你。提醒类只是说一句话，没有风险。最下面「<b>消息推送到企业微信</b>」打开后，提醒能推到手机上（要先在「助理」里绑好企业微信），这次先不开。点「确定」。',
      ],
      wait: { target: 'schedule.createConfirm', callout: '看清了点确定', label: '确定' },
      onAction: (s) => ({
        scheduleCreateTemplateId: null,
        scheduleTemplatesOpen: false,
        scheduledTasks: [PARENT_TASK, ...s.scheduledTasks.filter((t) => t.id !== PARENT_TASK.id)],
        toast: '定时任务已新建成功',
      }),
    },
    {
      id: 'new-menu-2',
      phase: 1,
      navLabel: '新建 ▾',
      say: [
        '第一个任务建好了，下一次运行是这周日 10:00。',
        '干活类的，比如我们的 AI 资讯早报，<b>用你自己手动跑满意的提示词</b>，走另一种方式：<b>从对话新建</b>。再点小箭头。',
      ],
      wait: { target: 'schedule.newMenu', callout: '再点小箭头', label: '新建方式' },
      onAction: () => ({ scheduleNewMenuOpen: true, toast: null }),
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
      onAction: (s) => ({ scheduledTasks: [TASK, ...s.scheduledTasks.filter((t) => t.id !== TASK.id)] }),
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
      onAction: () => ({ view: 'schedule', scheduleTab: 'tasks', scheduleTemplatesOpen: false, toast: null }),
    },
    {
      id: 'open-task',
      phase: 1,
      navLabel: '打开任务',
      say: ['两张卡片了。早报这张<b>建好就已经启用</b>，别急着走，<b>点开检查一遍设置</b>。'],
      wait: { target: 'schedule.openTask', callout: '点开检查设置', label: '每日 AI 资讯早报' },
      onAction: () => ({ scheduleModalTaskId: TASK.id }),
    },
    {
      id: 'perm',
      phase: 1,
      navLabel: '执行权限',
      say: [
        '「编辑定时任务」从左往右看：<b>名称、提示词</b>，提示词下面能挑模型、技能、专家、连接器（勾选连接器等于授权它在任务里免确认使用，用不到别勾）；右边是<b>执行频率</b>（周期 / 按间隔 / 单次）、每天、08:30，有效期留空表示一直有效。',
        '最要紧的是<b>执行权限</b>。这个任务现在是「需逐次确认」：每次调用工具都停下来等你点头，<b>早上 8:30 你不在电脑前，它就一直卡着</b>。不管用哪种方式建的，建完都点开看一眼这里。改成「免确认执行」。',
      ],
      wait: { target: 'schedule.permFull', callout: '无人值守选这个', label: '免确认执行' },
      onAction: (s) => ({
        scheduledTasks: s.scheduledTasks.map((t) => (t.id === TASK.id ? { ...t, permission: 'full' as const } : t)),
      }),
    },
    {
      id: 'run-test',
      phase: 1,
      navLabel: '运行',
      say: [
        '免确认的代价：<b>没人替你把关，所以提示词里必须写死边界</b>，我们写了「只生成文件，不删除、不发送」。',
        '底下那行提示也要记住：<b>执行时别关电脑、别退出客户端</b>（1.1 节的防休眠就是为它准备的）。现在点「<b>运行</b>」，马上试跑一次。',
      ],
      wait: { target: 'schedule.run', callout: '先试跑一次', label: '运行' },
      onAction: () => ({ scheduleTestRan: true, toast: '已触发测试运行。测试运行不会影响正式调度时间。' }),
    },
    {
      id: 'save',
      phase: 1,
      navLabel: '保存',
      onEnter: () => ({ scheduleRecords: [TEST_RECORD] }),
      say: [
        '「已触发测试运行。<b>测试运行不会影响正式调度时间。</b>」试跑在后台跑，结果会记进运行记录。',
        '先点「保存」，把刚改的执行权限存下来，再去看试跑结果。',
      ],
      wait: { target: 'schedule.save', callout: '保存权限修改', label: '保存' },
      onAction: () => ({ scheduleModalTaskId: null, toast: null }),
    },
    {
      id: 'view-records',
      phase: 2,
      navLabel: '运行记录',
      say: ['卡片右下角多了「<b>查看运行记录</b>」，就是刚才那次试跑。点它。'],
      wait: { target: 'schedule.viewRecords', callout: '看试跑结果', label: '查看运行记录' },
      onAction: () => ({ scheduleTab: 'records' }),
    },
    {
      id: 'test-detail',
      phase: 2,
      navLabel: '运行详情',
      say: ['状态是「<b>测试运行成功</b>」。成功只说明跑完了，<b>不说明内容对</b>。点开「查看运行详情」看它产出了什么。'],
      wait: { target: 'schedule.recordDetail', callout: '点开看产出', label: '查看运行详情' },
      onAction: () => ({ scheduleRecordDetailId: TEST_RECORD.id }),
    },
    {
      id: 'check-source',
      phase: 2,
      navLabel: '核对来源',
      say: [
        '详情分四块：<b>摘要</b>（这次干了什么）、<b>制品</b>（产出的文件）、<b>运行明细</b>（每一步几点几分）、<b>查看关联会话</b>（当时的完整对话，还能接着追问）。',
        '制品里每条都写了<b>发布时间和来源</b>，这是我们提示词要求的。抽第一条，点「原文 ↗」核对：标题对不对得上、是不是 24 小时内。',
      ],
      wait: { target: 'schedule.checkSource', callout: '点开原文核对', label: '原文 ↗' },
      onAction: () => ({ scheduleCheckedSource: TEST_RECORD.artifactItems?.[0]?.title ?? null }),
    },
    {
      id: 'close-detail',
      phase: 2,
      navLabel: '关闭',
      say: [
        '对得上：原文 11-23 07:15 发布，离试跑 14 个小时，在 24 小时内。<b>头三次每次都这样抽查两三条</b>，没问题以后偶尔抽查。',
        '要是不满意：回到任务卡片<b>关掉开关暂停</b>，改好提示词再试跑，满意了再打开。这次满意，关掉详情。',
      ],
      wait: { target: 'schedule.closeDetail', callout: '核对完关掉', label: '关闭运行详情' },
      onAction: () => ({ scheduleRecordDetailId: null }),
    },
    {
      id: 'fast-forward',
      phase: 2,
      say: ['接下来要等 3 天才能看到正式运行的结果，模拟器帮你快进。点下面的「快进 3 天」（真机没有这个按钮）。'],
      wait: { target: 'schedule.fastForward', callout: '快进 3 天', label: '快进 3 天（模拟）' },
      onAction: (s) => ({
        scheduleRecords: [...RECORDS, ...s.scheduleRecords.filter((r) => r.status === 'test')],
        scheduledTasks: s.scheduledTasks.map((t) => (t.id === TASK.id ? { ...t, nextRun: '明天 08:30' } : t)),
      }),
    },
    {
      id: 'summary',
      phase: 3,
      say: [
        '3 天过去，多了三条正式记录。看中间那条橙色的：11-25 那天 08:30 电脑合着盖，状态是「<b>已错过计划时间，将补跑一次</b>」，开机后 09:12 补跑成功。<b>早报晚到了 42 分钟</b>，讲时效的任务要注意。',
      ],
      card: {
        kind: 'table',
        title: '定时任务清单',
        headers: ['顺序', '做什么'],
        rows: [
          ['① 选建法', '提醒类用模板；干活类用自己手动跑满意 2–3 次的提示词「从对话新建」'],
          ['② 说清三样', '提示词 + 频率时间 + 安全边界（只读 / 只生成）'],
          ['③ 建完点开看执行权限', '无人值守要免确认，所以边界必须写死'],
          ['④ 点「运行」试跑', '测试运行不影响正式调度'],
          ['⑤ 到运行记录核对', '点开制品，抽查来源和时间；不满意就先暂停'],
          ['⑥ 电脑别睡', '合盖或退出客户端会错过，只能补跑'],
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
