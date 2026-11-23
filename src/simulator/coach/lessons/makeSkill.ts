import type { GuidedLessonDef } from '../guidedTypes';
import { createBaseGuidedState } from './baseState';
import { freeChat } from './freeChat';

/**
 * 3.3 做一个自己的技能
 * 技能的目的是减少重复：同样的要求说到第二遍，就该做成技能。
 * 两种做法：A 先在对话里做顺一遍，再让 skill-creator 沉淀成技能（主线）；
 * B 技能页「添加技能 → 创建技能」，从零描述（输入框嵌 skill-creator 胶囊 + 预填句式）。
 */

/** 场景 A 做出来的技能名 */
const DAILY_SKILL = '每日工作日报';
/** 场景 B 做出来的技能名 */
const WEEKLY_SKILL = '日报汇总成周报';
/** 第一次只说一句 */
const FIRST_PROMPT = '@今日工作记录.txt 帮我整理成日报，发给组长。';
/** 在原对话里补上要求 */
const FIX_PROMPT =
  '按 今日完成 / 进行中 / 明日计划 / 需要协助 四栏写；每条一句话、带上数字；某栏没有就写「无」；不要开头问候和结尾客套。';
/** 直接点名 skill-creator，把刚才的做法沉淀下来 */
const SAVE_PROMPT = `用 skill-creator 技能，把刚才整理日报的做法做成一个技能，名字叫「${DAILY_SKILL}」。`;
/** 第二天：一句话 + 选技能 */
const NEXT_DAY_PROMPT = '@今日工作记录.txt 写今天的日报。';
/** 「创建技能」预填的句式（对照 5.11.3 真机），引号里留空等你填 */
const CREATE_PREFILL = '请帮我创建一个可以实现「……」的skill';
/** 填好以后的完整描述 */
const CREATE_FULL =
  '请帮我创建一个可以实现「每周五把这周的 5 份日报汇总成一份周报」的skill：按 本周完成 / 下周计划 / 风险和需要协助 三栏；同类事项合并成一条，保留数字；日报里没写的不要补。';

export const makeSkillLesson: GuidedLessonDef = {
  id: 'make-skill',
  code: '3.3',
  title: '做一个自己的技能',
  guideUrl: '/features/extend/make-skill/',
  initialState: () =>
    createBaseGuidedState({
      selectedGroup: 'WorkBuddy-练习',
      selectedModel: 'Hy4 flash',
      composerText: FIRST_PROMPT,
    }),
  steps: [
    {
      id: 'intro',
      phase: 0,
      say: [
        '技能是用来<b>减少重复</b>的。判断标准很简单：<b>同样的要求，你说到第二遍了，就该做成技能。</b>',
        '拿最常见的日报举例：每天都要写，格式每天都一样。这节教两种做法：<b>先做一遍再沉淀成技能</b>，和<b>直接从零描述一个技能</b>。先做一遍今天的日报。',
      ],
      buttons: [{ label: '先写今天的日报', primary: true }],
    },
    {
      id: 'run-first',
      phase: 1,
      onEnter: () => ({ view: 'home', composerText: FIRST_PROMPT, composerChips: [] }),
      say: ['第一次写，很多人就说一句。发送。'],
      wait: { target: 'composer.send', callout: '先这么发', label: '发送（只说一句）' },
      runChat: () =>
        freeChat({
          id: 'make-skill-first',
          prompt: FIRST_PROMPT,
          chatTitle: '日报 · 第一次',
          footerTip: '只说一句时的结果',
          elapsed: '10s',
          hideMarksInitially: true,
          steps: [{ running: '读取 今日工作记录.txt…', done: '已读取 9 条记录' }],
          replyHtml:
            '{{wrong:组长您好，以下是我今天的工作汇报：}}\n\n今天主要跟进了 6 月活动的报名页，和设计确认了两版海报，下午整理了上周的用户反馈，{{wrong:另外还处理了一些零碎的事情}}。{{wrong:整体进展顺利，有问题随时沟通，辛苦了！}}',
        }),
    },
    {
      id: 'ask-first',
      phase: 2,
      say: ['内容大致没错，但<b>你心里的日报是这样的吗？</b>'],
      buttons: [{ label: '标出不满意的地方', primary: true }],
    },
    {
      id: 'fix',
      phase: 1,
      revealMarksOnEnter: true,
      onEnter: () => ({ followupText: FIX_PROMPT }),
      say: [
        '橙色三处：<b>开头问候、结尾客套</b>，中间还有一句<b>「零碎的事情」</b>，没有数字，明天做什么也没写。这不怪它，是你<b>没说清你要的格式</b>。',
        '就在原对话里补要求。我已经填好在底部输入框，发送。',
      ],
      wait: { target: 'chat.followupSend', callout: '补上要求再发', label: '发送（补要求）' },
      runChat: () =>
        freeChat({
          id: 'make-skill-fixed',
          prompt: FIX_PROMPT,
          chatTitle: '日报 · 补了要求',
          footerTip: '补上要求后的日报',
          elapsed: '12s',
          steps: [{ running: '按四栏重写…', done: '已写入 日报_1123.md' }],
          replyHtml:
            '| 栏目 | 内容 |\n| --- | --- |\n| 今日完成 | 报名页上线，当天报名 126 人；海报两版定稿 1 版 |\n| 进行中 | 上周用户反馈 48 条，已归类 30 条 |\n| 明日计划 | 归完剩下 18 条反馈，出问题清单 |\n| 需要协助 | 无 |',
          fileCard: { name: '日报_1123.md', meta: '四栏 · 每条带数字' },
        }),
    },
    {
      id: 'signal',
      phase: 2,
      onEnter: () => ({ followupText: SAVE_PROMPT }),
      say: [
        '这就是你要的样子。可是<b>明天、后天还得写</b>：每天都把刚才那段要求重打一遍？这就是「说到第二遍」的信号。',
        '把它沉淀成技能。用 3.2 学的第二种用法，<b>直接点名</b> skill-creator（内置的「做技能的技能」）。我已经填好，发送。',
      ],
      wait: { target: 'chat.followupSend', callout: '让它把做法存成技能', label: '发送（做成技能）' },
      onAction: (s) => ({
        customSkills: s.customSkills.includes(DAILY_SKILL) ? s.customSkills : [DAILY_SKILL, ...s.customSkills],
      }),
      runChat: () =>
        freeChat({
          id: 'make-skill-save',
          prompt: SAVE_PROMPT,
          chatTitle: '日报 · 做成技能',
          footerTip: '技能已装到「已安装 · 用户自定义」',
          elapsed: '38s',
          steps: [
            { running: '加载技能 skill-creator…', done: '从这次对话里提炼做法' },
            { running: '起草 SKILL.md…', done: '已写好：名字、什么时候用、步骤、禁止事项' },
            { running: '安装技能…', done: `已安装到「用户自定义」：${DAILY_SKILL}` },
          ],
          replyHtml: `技能「${DAILY_SKILL}」已创建并安装，右边是它的说明书。以后写日报，打 / 选它就行。`,
          artifact: {
            file: 'SKILL.md',
            pathLabel: `用户自定义技能/${DAILY_SKILL}/SKILL.md`,
            badge: '技能说明书（节选）',
            badgeTone: 'ok',
            title: 'SKILL.md',
            lines: [
              { text: `名字：${DAILY_SKILL}` },
              { text: '什么时候用：把当天的工作记录整理成发给组长的日报' },
              { text: '步骤：按 今日完成 / 进行中 / 明日计划 / 需要协助 四栏，每条一句带数字', tone: 'ok' },
              { text: '禁止：开头问候、结尾客套；记录里没有的不要编', tone: 'ok' },
            ],
          },
        }),
    },
    {
      id: 'read-skill',
      phase: 2,
      say: [
        '不用看懂每一行，认出这几块就够：<b>名字、什么时候用、步骤、禁止事项</b>。蓝色的两行，就是你刚才在对话里补的那句要求，它帮你记下来了。',
        '这就是「先做一遍再沉淀」的好处：<b>写进技能的是已经验证过的做法</b>。',
      ],
      buttons: [{ label: '第二天，用它写日报', primary: true }],
    },
    {
      id: 'slash',
      phase: 2,
      navLabel: '/ 调用',
      onEnter: () => ({
        view: 'home',
        composerText: NEXT_DAY_PROMPT,
        composerChips: [],
        followupText: '',
        pickLabel: DAILY_SKILL,
      }),
      say: ['第二天，新开一个对话，还是偷懒只说一句。先在输入框里按键盘输入 <b>/</b>。'],
      wait: { target: 'composer.slash', callout: '在输入框里输入 /', label: '输入 /' },
      onAction: () => ({ slashMenuOpen: true }),
    },
    {
      id: 'slash-pick',
      phase: 2,
      navLabel: '选你的技能',
      say: ['你做的技能排在最前面。选它。'],
      wait: { target: 'slashMenu.pick', callout: '选你的技能', label: DAILY_SKILL },
      onAction: () => ({ slashMenuOpen: false, composerChips: [{ kind: 'skill', label: DAILY_SKILL }] }),
    },
    {
      id: 'run-skill',
      phase: 2,
      say: ['一句话，一个要求都没重复。发送。'],
      wait: { target: 'composer.send', callout: '带着你的技能发', label: '发送（用自己的技能）' },
      onAction: () => ({ composerChips: [], pickLabel: null }),
      runChat: () =>
        freeChat({
          id: 'make-skill-nextday',
          prompt: NEXT_DAY_PROMPT,
          promptChips: [{ kind: 'skill', label: DAILY_SKILL }],
          chatTitle: '日报 · 第二天用技能',
          footerTip: '一句话 + 技能，格式和昨天一样',
          elapsed: '9s',
          steps: [
            { running: `加载技能 ${DAILY_SKILL}…`, done: '按技能：四栏，每条带数字' },
            { running: '读取 今日工作记录.txt…', done: '已写入 日报_1124.md' },
          ],
          replyHtml:
            '| 栏目 | 内容 |\n| --- | --- |\n| 今日完成 | 反馈 48 条全部归类，出问题清单 1 份（共 7 项） |\n| 进行中 | 报名页改版，完成 2/3 |\n| 明日计划 | 报名页改版收尾，周四提测 |\n| 需要协助 | 改版需要设计出 1 张新头图 |',
          fileCard: { name: '日报_1124.md', meta: '四栏 · 和昨天同一个格式' },
        }),
    },
    {
      id: 'b-intro',
      phase: 0,
      say: [
        '第二种做法：<b>活还没做过，但你心里清楚要什么</b>。比如每周五要把这周 5 份日报汇总成周报。这时可以直接去技能页创建。',
      ],
      buttons: [{ label: '去技能页创建', primary: true }],
    },
    {
      id: 'open-ext',
      phase: 1,
      navLabel: '专家·技能·连接器',
      say: [],
      wait: { target: 'nav.extensions', callout: '点这里进入', label: '专家·技能·连接器' },
      onAction: () => ({ view: 'extensions', extTab: 'skills', skillSearch: '', installedPanelOpen: false }),
    },
    {
      id: 'add-menu',
      phase: 1,
      navLabel: '添加技能',
      say: ['点右上角黑色的「添加技能」。'],
      wait: { target: 'skills.addMenu', callout: '点添加技能', label: '添加技能' },
      onAction: () => ({ addSkillMenuOpen: true }),
    },
    {
      id: 'create',
      phase: 1,
      navLabel: '创建技能',
      say: [
        '菜单里三种：<b>查找技能</b>（让它去市场帮你搜）、<b>上传技能</b>（导入别人给你的文件夹或 zip）、<b>创建技能</b>（让它帮你写一个）。点「创建技能」。',
      ],
      wait: { target: 'skills.addMenu.create', callout: '点创建技能', label: '创建技能' },
      onAction: () => ({
        addSkillMenuOpen: false,
        view: 'home',
        composerChips: [{ kind: 'skill', label: 'skill-creator' }],
        composerText: CREATE_PREFILL,
      }),
    },
    {
      id: 'fill',
      phase: 1,
      say: [
        '回到首页，输入框开头自动嵌上了 <b>skill-creator</b> 胶囊，后面预填了「请帮我创建一个可以实现「……」的skill」。说到底它和第一种做法调用的是<b>同一个技能</b>。',
        '引号里要你自己写清楚：<b>干什么、按什么格式、不许做什么</b>。没做过一遍，这些全靠你想清楚再写。',
      ],
      buttons: [{ label: '看我怎么填', primary: true }],
    },
    {
      id: 'send-create',
      phase: 1,
      onEnter: () => ({ composerText: CREATE_FULL }),
      say: ['填好了：干什么（汇总成周报）、格式（三栏）、规矩（合并同类、保留数字、不补没写的）。发送。'],
      wait: { target: 'composer.send', callout: '发送，让它写技能', label: '发送（创建技能）' },
      onAction: (s) => ({
        composerChips: [],
        customSkills: s.customSkills.includes(WEEKLY_SKILL) ? s.customSkills : [WEEKLY_SKILL, ...s.customSkills],
      }),
      runChat: () =>
        freeChat({
          id: 'make-skill-create',
          prompt: CREATE_FULL,
          promptChips: [{ kind: 'skill', label: 'skill-creator' }],
          chatTitle: `创建技能 · ${WEEKLY_SKILL}`,
          footerTip: '技能已装到「已安装 · 用户自定义」',
          elapsed: '41s',
          steps: [
            { running: '加载技能 skill-creator…', done: '按你的描述起草' },
            { running: '起草 SKILL.md…', done: '已写好：名字、什么时候用、步骤、禁止事项' },
            { running: '安装技能…', done: `已安装到「用户自定义」：${WEEKLY_SKILL}` },
          ],
          replyHtml: `技能「${WEEKLY_SKILL}」已创建并安装。这个技能还没在真实日报上跑过，建议这周五拿真实的 5 份日报试一次，不满意告诉我怎么改。`,
          artifact: {
            file: 'SKILL.md',
            pathLabel: `用户自定义技能/${WEEKLY_SKILL}/SKILL.md`,
            badge: '技能说明书（节选）',
            badgeTone: 'ok',
            title: 'SKILL.md',
            lines: [
              { text: `名字：${WEEKLY_SKILL}` },
              { text: '什么时候用：每周五把本周的日报汇总成周报' },
              { text: '步骤：按 本周完成 / 下周计划 / 风险和需要协助 三栏，同类合并，保留数字' },
              { text: '禁止：日报里没写的不要补' },
            ],
          },
        }),
    },
    {
      id: 'summary',
      phase: 3,
      say: ['两种做法，最后都是 skill-creator 帮你写 SKILL.md，区别在<b>要求从哪来</b>：'],
      card: {
        kind: 'table',
        title: '做技能的两种做法',
        headers: ['', '先做一遍再沉淀', '从零描述'],
        rows: [
          ['怎么开始', '对话里做顺，再说「用 skill-creator 把刚才的做法做成技能」', '技能页 添加技能 → 创建技能，补全引号里的描述'],
          ['要求从哪来', '你在对话里一次次补的要求', '全靠你提前想清楚写下来'],
          ['适合', '已经反复做过的活（日报、纪要、周会材料）', '心里很清楚、但还没动手的活'],
          ['做完要做的', '新对话用最偷懒的说法测一次', '一定拿真实材料试一次，不对再改'],
        ],
      },
      after: [
        '<b>没做顺的活，写成技能也是错的</b>，所以能先做一遍就先做一遍。不满意就在对话里说「请帮我编辑 X 这个 skill：……」。',
        '两条提醒：<b>技能里别写密码和 API Key</b>，技能可能被分享出去；做好的技能文件夹打包成 zip，别人用「上传技能」就能导入。',
      ],
      buttons: [
        { label: '下一节：3.4 专家 →', primary: true, nextLesson: 'experts' },
        { label: '读本节图文教程', href: '/features/extend/make-skill/' },
        { label: '重来一遍', restart: true },
      ],
    },
  ],
};
