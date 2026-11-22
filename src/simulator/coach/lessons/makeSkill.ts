import type { GuidedLessonDef } from '../guidedTypes';
import { createBaseGuidedState } from './baseState';
import { freeChat } from './freeChat';

/** 自己做的技能名 */
const SKILL_NAME = '群聊整理成筹备纪要';
/** 偷懒的说法：不交代 5 要素 */
const LAZY_PROMPT = '@周末读书会群聊.txt 整理成筹备纪要。';
/** 「添加技能 → 创建技能」预填的句式 +泊舟补全的要求（预填句式来自 5.11.3 语言包） */
const CREATE_PROMPT =
  '请帮我创建一个可以实现「把群聊记录整理成活动筹备纪要」的skill：固定输出 时间 / 地点 / 预算 / 分工 / 待确认 五栏；原文没写明的标“未明确”，不许自己补人名和金额；只读原文件，不改动；文件名用「活动名_筹备纪要.md」。';

export const makeSkillLesson: GuidedLessonDef = {
  id: 'make-skill',
  code: '3.4',
  title: '做一个自己的技能',
  guideUrl: '/features/extend/make-skill/',
  initialState: () =>
    createBaseGuidedState({
      selectedGroup: 'WorkBuddy-练习',
      selectedModel: 'Hy4 flash',
      composerText: LAZY_PROMPT,
    }),
  steps: [
    {
      id: 'intro',
      phase: 0,
      say: [
        '第 2 章你学会了把任务说清楚：5 要素、不许编、只读原文件。可是<b>每次整理群聊都要把这一大段重新打一遍</b>，哪天偷懒少说一句，结果就走样。',
        '解决办法：<b>把反复交代的要求写成你自己的技能</b>，以后一句话就够。先看看偷懒的后果。',
      ],
      buttons: [{ label: '先看偷懒只说一句', primary: true }],
    },
    {
      id: 'run-lazy',
      phase: 1,
      onEnter: () => ({ view: 'home', composerText: LAZY_PROMPT, composerChips: [] }),
      say: ['这次只说了一句「整理成筹备纪要」，发。'],
      wait: { target: 'composer.send', callout: '只说一句，直接发', label: '发送（没交代要求）' },
      runChat: () =>
        freeChat({
          id: 'make-skill-lazy',
          prompt: LAZY_PROMPT,
          chatTitle: '① 没交代要求 · 筹备纪要',
          footerTip: '只说一句时的结果，可在左侧 最近 里回看',
          elapsed: '12s',
          hideMarksInitially: true,
          steps: [{ running: '读取 周末读书会群聊.txt…', done: '已读取 6 条群聊发言' }],
          replyHtml:
            '## 周末读书会筹备纪要\n\n周六下午 2 点在静安寺青松咖啡二楼包间举办读书会，茶歇预算 500 元以内。{{wrong:拍照由阿林负责}}，{{wrong:桌签由老陈周五中午前完成}}。\n\n{{wrong:（本次未单独列出待确认事项）}}',
          fileCard: { name: '读书会纪要.md', meta: '一段话 · 无分栏', warn: true },
        }),
    },
    {
      id: 'ask-lazy',
      phase: 2,
      say: ['和第 2 章那份比一比，<b>哪里走样了？</b>'],
      buttons: [{ label: '标出问题', primary: true }],
    },
    {
      id: 'open-ext',
      phase: 1,
      revealMarksOnEnter: true,
      navLabel: '专家·技能·连接器',
      say: [
        '橙色三处：<b>① 五栏格式没了</b>，变成一段话；<b>② 拍照、桌签的负责人是它编的</b>，群里根本没人认领；<b>③ 待确认事项直接漏了</b>。文件名也变了。',
        '把要求固化成技能。进技能页。',
      ],
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
        '菜单里三种：<b>查找技能</b>（让它去市场帮你搜）、<b>上传技能</b>（导入别人给你的文件夹或 zip，里面必须有 SKILL.md）、<b>创建技能</b>（让它帮你写一个）。点「创建技能」。',
      ],
      wait: { target: 'skills.addMenu.create', callout: '点创建技能', label: '创建技能' },
      onAction: () => ({ addSkillMenuOpen: false, view: 'home', composerText: CREATE_PROMPT }),
    },
    {
      id: 'send-create',
      phase: 1,
      say: [
        '回到首页，输入框里预填了一句「请帮我创建一个可以实现「……」的skill」，<b>引号里要你填这个技能干什么</b>。我已经把第 2 章那套要求接在后面了：五栏、不许编、只读、文件名规则。发送。',
      ],
      wait: { target: 'composer.send', callout: '发送，让它写技能', label: '发送（创建技能）' },
      onAction: (s) => ({
        customSkills: s.customSkills.includes(SKILL_NAME) ? s.customSkills : [...s.customSkills, SKILL_NAME],
      }),
      runChat: () =>
        freeChat({
          id: 'make-skill-create',
          prompt: CREATE_PROMPT,
          chatTitle: '创建技能 · 群聊整理成筹备纪要',
          footerTip: '技能已装到「已安装 · 用户自定义」',
          elapsed: '46s',
          steps: [
            { running: '起草 SKILL.md…', done: '已写好 SKILL.md（名称、触发说明、步骤、禁止事项）' },
            { running: '检查技能内容…', done: '检查通过：只读文件、无联网、无删除操作' },
            { running: '安装技能…', done: '已安装到「用户自定义」：群聊整理成筹备纪要' },
          ],
          replyHtml:
            '技能「群聊整理成筹备纪要」已创建并安装。右边是它的 SKILL.md，可以直接看、也可以让我改。\n\n以后整理群聊，打 / 选它就行，不用再交代格式。',
          artifact: {
            file: 'SKILL.md',
            pathLabel: '用户自定义技能/群聊整理成筹备纪要/SKILL.md',
            badge: '技能说明书',
            badgeTone: 'ok',
            title: 'SKILL.md',
            lines: [
              { text: '---' },
              { text: 'name: 群聊整理成筹备纪要' },
              { text: 'description: 当用户要把群聊或会议记录整理成活动筹备纪要时使用', tone: 'ok' },
              { text: '---' },
              { text: '## 步骤' },
              { text: '1. 只读取用户 @ 的群聊文件，不改动原文件' },
              { text: '2. 按 时间 / 地点 / 预算 / 分工 / 待确认 五栏输出' },
              { text: '3. 文件名：活动名_筹备纪要.md' },
              { text: '## 禁止事项', tone: 'ok' },
              { text: '- 原文没写明的一律标“未明确”，不许补人名和金额', tone: 'ok' },
              { text: '- 不删除、不覆盖任何已有文件', tone: 'ok' },
            ],
          },
        }),
    },
    {
      id: 'read-skill-md',
      phase: 2,
      say: [
        '右边就是你的技能说明书。蓝色两处最要紧：',
        '<b>description</b> 决定它<b>什么时候想起来用这个技能</b>。写成「当用户要……时使用」，它在你没点名的时候也能自动认出来；写成「整理工具」这种空话，它就永远想不起来。',
        '<b>禁止事项</b>是你踩过的坑，写死在这，以后就不会再犯。去「已安装」里看看它在哪。',
      ],
      wait: { target: 'nav.extensions', callout: '回技能页看看', label: '专家·技能·连接器' },
      onAction: () => ({ view: 'extensions', extTab: 'skills', installedPanelOpen: false }),
    },
    {
      id: 'installed',
      phase: 2,
      navLabel: '已安装',
      say: [],
      wait: { target: 'skills.installed', callout: '打开已安装', label: '已安装' },
      onAction: () => ({ installedPanelOpen: true }),
    },
    {
      id: 'slash',
      phase: 2,
      navLabel: '/ 调用',
      say: [
        '已安装分三组：<b>用户自定义</b>（你自己做的，刚才那个在这）、<b>来自市场</b>（上节装的 WPS 在这）、<b>套件</b>。卸载也在这里。',
        '现在测一下：回首页新开一个任务，用 / 调出你的技能。',
      ],
      wait: { target: 'composer.slash', callout: '打 / 调技能', label: '/ 技能' },
      onEnter: () => ({ composerText: LAZY_PROMPT, composerChips: [] }),
      onAction: () => ({ view: 'home', installedPanelOpen: false, slashMenuOpen: true }),
    },
    {
      id: 'slash-pick',
      phase: 2,
      navLabel: '选你的技能',
      say: ['你做的技能排在最前面。选它。'],
      wait: { target: 'slashMenu.pick', callout: '选你的技能', label: SKILL_NAME },
      onAction: () => ({ slashMenuOpen: false, composerChips: [{ kind: 'skill', label: SKILL_NAME }] }),
    },
    {
      id: 'run-skill',
      phase: 2,
      say: ['还是那句偷懒的「整理成筹备纪要」，一个字没多写。发。'],
      wait: { target: 'composer.send', callout: '带着你的技能发', label: '发送（用自己的技能）' },
      onAction: () => ({ composerChips: [] }),
      runChat: () =>
        freeChat({
          id: 'make-skill-test',
          prompt: LAZY_PROMPT,
          promptChips: [{ kind: 'skill', label: SKILL_NAME }],
          chatTitle: '② 用自己的技能 · 筹备纪要',
          footerTip: '在左侧 最近 里点 ① 和 ② 对比',
          elapsed: '14s',
          steps: [
            { running: '加载技能 群聊整理成筹备纪要…', done: '按技能：只读原文件，五栏输出' },
            { running: '读取 周末读书会群聊.txt…', done: '已写入 周末读书会_筹备纪要.md' },
          ],
          replyHtml:
            '| 栏目 | 内容 |\n| --- | --- |\n| 时间 | 周六下午 2 点 |\n| 地点 | 静安寺青松咖啡二楼包间 |\n| 预算 | 茶歇 500 元以内（老陈负责） |\n| 分工 | 海报 小周（今晚下班前）；开场 PPT 阿林（周四晚）；{{ok:桌签 未明确（周五中午前）}}；{{ok:拍照 未明确}} |\n| 待确认 | {{ok:拍照、桌签负责人待认领；老陈明天下午确认茶歇菜单}} |',
          fileCard: { name: '周末读书会_筹备纪要.md', meta: '五栏 · 未明确 2 处' },
        }),
    },
    {
      id: 'summary',
      phase: 3,
      say: ['一个字没多写，<b>五栏齐了、没编人名、待确认也列出来了</b>。这就是把经验固化成技能的价值。'],
      card: {
        kind: 'table',
        title: '做一个技能的 4 步',
        headers: ['步骤', '做什么', '要点'],
        rows: [
          ['① 先手动做顺', '不用技能，把这件事来回调到满意', '没做顺的活，写成技能也是错的'],
          ['② 创建技能', '添加技能 → 创建技能，把要求说全', '格式、禁止事项、文件名都写进去'],
          ['③ 检查 SKILL.md', '看 name、description、禁止事项', 'description 写成「当用户要……时使用」'],
          ['④ 新对话测一次', '打 / 选它，用最偷懒的说法测', '不满意就说「请帮我编辑 X 这个 skill：……」'],
        ],
      },
      after: [
        '两条提醒：<b>技能里别写密码和 API Key</b>，技能可能被分享出去；做好的技能文件夹打包成 zip，别人用「上传技能」就能导入。',
      ],
      buttons: [
        { label: '下一节：3.5 连接器 →', primary: true, nextLesson: 'connectors' },
        { label: '读本节图文教程', href: '/features/extend/make-skill/' },
        { label: '重来一遍', restart: true },
      ],
    },
  ],
};
