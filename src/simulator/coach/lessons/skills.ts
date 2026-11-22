import type { GuidedLessonDef } from '../guidedTypes';
import { createBaseGuidedState } from './baseState';
import { freeChat } from './freeChat';

/** 本节任务：按门店汇总销售表 */
const SALES_PROMPT = '@上月销售数据.xlsx 按门店汇总销售额和订单数，做成一张新表。';

export const skillsLesson: GuidedLessonDef = {
  id: 'skills',
  code: '3.3',
  title: '技能：找、看懂、装、用',
  guideUrl: '/features/extend/skills/',
  initialState: () =>
    createBaseGuidedState({
      selectedGroup: 'WorkBuddy-练习',
      selectedModel: 'Hy4 flash',
      composerText: SALES_PROMPT,
    }),
  steps: [
    {
      id: 'intro',
      phase: 0,
      say: [
        '技能就是一份<b>打包好的操作手册（SOP）</b>，核心是一个叫 <code>SKILL.md</code> 的文件，写着「这类活按什么步骤、用什么工具做」。装上以后，它干这类活就不再凭感觉。',
        '这节走完整一圈：<b>看懂技能页 → 挑一个 → 装上 → 用起来</b>。先看不用技能时做表格会怎样。',
      ],
      buttons: [{ label: '先看不用技能', primary: true }],
    },
    {
      id: 'run-plain',
      phase: 1,
      onEnter: () => ({ view: 'home', composerText: SALES_PROMPT, composerChips: [] }),
      say: ['输入框里已经 @ 好了销售表，直接发。'],
      wait: { target: 'composer.send', callout: '不用技能，直接发', label: '发送（不用技能）' },
      runChat: () =>
        freeChat({
          id: 'skills-plain',
          prompt: SALES_PROMPT,
          chatTitle: '① 不用技能 · 门店汇总',
          footerTip: '不用技能时交出的表，可在左侧 最近 里回看',
          elapsed: '18s',
          hideMarksInitially: true,
          steps: [
            { running: '读取 上月销售数据.xlsx…', done: '已读取 1,286 行订单' },
            { running: '用 Python 计算汇总…', done: '已写入 门店汇总.xlsx' },
          ],
          replyHtml:
            '已按门店汇总：\n\n| 门店 | 销售额 | 订单数 |\n| --- | --- | --- |\n| 静安店 | 186,420 | 412 |\n| 徐汇店 | {{wrong:152,300}} | 355 |\n| 浦东店 | 201,775 | 519 |\n\n{{wrong:表里的数字是算好后直接填进去的}}，如需调整请告诉我。',
          fileCard: { name: '门店汇总.xlsx', meta: '3 行 · 无公式', warn: true },
        }),
    },
    {
      id: 'ask-plain',
      phase: 2,
      say: ['表是有了。<b>如果你下个月要往里加数据，或者老板问「这个数怎么来的」，会出什么事？</b>'],
      buttons: [{ label: '标出问题', primary: true }],
    },
    {
      id: 'open-ext',
      phase: 1,
      revealMarksOnEnter: true,
      navLabel: '专家·技能·连接器',
      say: [
        '橙色两处：<b>① 数字是写死的</b>，没有公式，原表一改它不会跟着变，别人也查不了来路；<b>② 徐汇店少算了一天的退款冲正</b>，和原表对不上。',
        '做表格这种活有固定章法，正好交给技能。进技能页。',
      ],
      wait: { target: 'nav.extensions', callout: '点这里进入', label: '专家·技能·连接器' },
      onAction: () => ({ view: 'extensions', extTab: 'skills', skillTab: 'recommend', statTip: null }),
    },
    {
      id: 'stat-use',
      phase: 1,
      navLabel: '⚡ 是什么',
      say: [
        '先学会<b>看卡片</b>。最上面一行是「精选技能」，每张卡右下角有两个数。<b>点一下</b>第一张卡的 <b>⚡</b> 数字，看它是什么意思（真机上鼠标悬停就会出提示）。',
      ],
      wait: { target: 'skills.statUse', callout: '看看 ⚡ 是什么', label: '⚡ 使用量' },
      onAction: () => ({ statTip: 'use' }),
    },
    {
      id: 'stat-install',
      phase: 1,
      navLabel: '⬇ 是什么',
      say: [
        '提示写着「<b>使用量</b>」：<b>⚡ = 这个技能被调用了多少次</b>。装了不用的不算，所以它最能说明「真有人在用」。再看旁边的 <b>⬇</b>。',
      ],
      wait: { target: 'skills.statInstall', callout: '再看 ⬇', label: '⬇ 安装量' },
      onAction: () => ({ statTip: 'install' }),
    },
    {
      id: 'tab-skillhub',
      phase: 1,
      navLabel: 'SkillHub',
      say: [
        '在「推荐」和「精选」里，<b>⬇ = 安装量</b>（多少人装了它）。使用量远低于安装量的，往往是装了就吃灰。',
        '下面有三个标签：<b>推荐</b>是官方挑的；<b>SkillHub</b> 是腾讯的技能市场，大家上传的技能都在这；<b>套件</b>是成套装的一组技能。点 SkillHub。',
      ],
      wait: { target: 'skills.tab.skillhub', callout: '点 SkillHub', label: 'SkillHub' },
      onAction: () => ({ skillTab: 'skillhub', statTip: null }),
    },
    {
      id: 'stat-download',
      phase: 1,
      navLabel: 'SkillHub 的 ⬇',
      say: ['注意，SkillHub 卡片上也有 ⬇，但旁边换成了 ☆。点一下第一张卡的 ⬇ 数字。'],
      wait: { target: 'skills.statDownload', callout: '这里的 ⬇ 是什么', label: '⬇ 下载量' },
      onAction: () => ({ statTip: 'download' }),
    },
    {
      id: 'search',
      phase: 1,
      navLabel: '搜索 wps',
      say: [
        '在 SkillHub，<b>⬇ = 下载量</b>，<b>☆ = 收藏量</b>。同一个图标在不同标签里意思略有不同，<b>拿不准就悬停看提示</b>。排序也跟着变：推荐里是「使用量 / 安装量」，SkillHub 里是「下载量 / 收藏」。',
        '还有两个标记要留意：带<b>「付费」</b>角标的要花钱，带<b>「需 APIKey」</b>的要你去别家申请密钥。新手先挑两样都没有的。',
        '现在去找能做表格的技能。点右上角搜索，搜 wps。',
      ],
      wait: { target: 'skills.search', callout: '搜 wps', label: '搜索技能' },
      onAction: () => ({ skillSearch: 'wps', statTip: null, skillTab: 'recommend' }),
    },
    {
      id: 'pick',
      phase: 1,
      navLabel: '挑一个',
      say: [
        '搜出来<b>两个同名的「WPS Office 全家桶」</b>，这在技能市场很常见。怎么挑？对比三样：',
        '下载量 78.14w 对 105.51w，收藏 5 对 180，来源一个是个人上传、一个是认证开发者。<b>收藏少、来源不明的先别碰</b>，点开第二个。',
      ],
      wait: { target: 'skills.pickCard', callout: '点开这个', label: 'WPS Office 全家桶（认证开发者）' },
      onAction: () => ({ skillDetailId: 'wps-b' }),
    },
    {
      id: 'install',
      phase: 1,
      navLabel: '安装',
      say: [
        '详情里看两行：<b>来源</b>（谁做的）和 <b>License</b>（MIT 这类开源许可，说明代码公开可查）。技能会在你电脑上执行操作，<b>来路不明的别装</b>。这个没问题，点「安装」。',
      ],
      wait: { target: 'skills.install', callout: '点安装', label: '安装' },
      onAction: () => ({ skillInstallConfirmOpen: true }),
    },
    {
      id: 'install-confirm',
      phase: 1,
      navLabel: '确认安装',
      say: ['弹窗说得很清楚：「<b>该技能包将被下载并安装到本地技能目录。</b>」也就是装在你自己电脑上。确认。'],
      wait: { target: 'skills.installConfirm', callout: '确认安装', label: '确认安装' },
      onAction: (s) => ({
        skillInstallConfirmOpen: false,
        skillDetailId: null,
        installedSkillIds: s.installedSkillIds.includes('wps-b') ? s.installedSkillIds : [...s.installedSkillIds, 'wps-b'],
        toast: '「WPS Office 全家桶」技能已安装，去试试',
      }),
    },
    {
      id: 'slash',
      phase: 1,
      navLabel: '/ 调用',
      onEnter: () => ({ view: 'home', composerText: SALES_PROMPT, skillSearch: '', composerChips: [] }),
      say: [
        '装好了，右上角变成「已安装(16)」。回到首页用它：在输入框里打 <b>/</b> 就会弹出技能列表。点输入框下面的「/ 技能」。',
      ],
      wait: { target: 'composer.slash', callout: '打 / 调技能', label: '/ 技能' },
      onAction: () => ({ slashMenuOpen: true }),
    },
    {
      id: 'slash-pick',
      phase: 1,
      navLabel: '选技能',
      say: [
        '列表标题是「技能 (28)」，比「已安装(16)」多，因为<b>内置技能（docx、pdf、xlsx 这些）也在里面</b>，两个数对不上是正常的。选刚装的 WPS Office 全家桶。',
      ],
      wait: { target: 'slashMenu.pick', callout: '选它', label: 'WPS Office 全家桶' },
      onAction: () => ({ slashMenuOpen: false, composerChips: [{ kind: 'skill', label: 'WPS Office 全家桶' }] }),
    },
    {
      id: 'run-skill',
      phase: 2,
      say: ['输入框里挂上了技能胶囊。同一句话，再发一次。'],
      wait: { target: 'composer.send', callout: '带着技能再发', label: '发送（用技能）' },
      onAction: () => ({ composerChips: [] }),
      runChat: () =>
        freeChat({
          id: 'skills-wps',
          prompt: SALES_PROMPT,
          promptChips: [{ kind: 'skill', label: 'WPS Office 全家桶' }],
          chatTitle: '② 用技能 · 门店汇总',
          footerTip: '在左侧 最近 里点 ① 和 ② 对比',
          elapsed: '31s',
          steps: [
            { running: '加载技能 WPS Office 全家桶…', done: '按技能步骤：先核对原表，再建公式' },
            { running: '核对原表…', done: '发现 11-14 徐汇店 1 笔退款冲正（-3,180）' },
            { running: '写入汇总表…', done: '已写入 门店汇总.xlsx（SUMIFS 公式）' },
          ],
          replyHtml:
            '已完成，表里保留了公式：\n\n| 门店 | 销售额 | 订单数 |\n| --- | --- | --- |\n| 静安店 | 186,420 | 412 |\n| 徐汇店 | {{ok:149,120}} | 355 |\n| 浦东店 | 201,775 | 519 |\n\n- {{ok:每格都是 SUMIFS 公式，点开能看到引用原表哪一列}}\n- 徐汇店已扣掉 11-14 的退款冲正，合计和原表一致',
          fileCard: { name: '门店汇总.xlsx', meta: '3 行 · SUMIFS 公式 · 与原表核对一致' },
        }),
    },
    {
      id: 'summary',
      phase: 3,
      say: ['同一句话，用了技能以后：<b>先核对原表、再建公式</b>，数对得上，下月加数据也会自动更新。'],
      card: {
        kind: 'compare',
        title: '同一张表，两次结果',
        leftLabel: '① 不用技能',
        leftTone: 'warn',
        leftHtml: '数字写死、没有公式；徐汇店漏扣退款，多出 3,180。',
        rightLabel: '② 用 WPS Office 全家桶',
        rightTone: 'ok',
        rightHtml: '<b>SUMIFS 公式保留</b>，先核对原表，合计和原表一致。',
      },
      after: [
        '用技能记住 5 条：<b>① 挑技能看三个数（⚡ 使用量 / ⬇ 安装或下载量 / ☆ 收藏）加来源</b>；<b>② 用到再装，别囤</b>；<b>③ 调用两种方式：打 / 选，或者直接说「用 X 技能」</b>；<b>④ 技能自动更新 1.1 节讲过，保持开启</b>；<b>⑤ 不用了在「已安装」里卸载</b>。',
      ],
      buttons: [
        { label: '下一节：3.4 做一个自己的技能 →', primary: true, nextLesson: 'make-skill' },
        { label: '读本节图文教程', href: '/features/extend/skills/' },
        { label: '重来一遍', restart: true },
      ],
    },
  ],
};
