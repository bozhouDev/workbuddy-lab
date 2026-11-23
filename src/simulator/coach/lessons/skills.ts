import type { GuidedLessonDef } from '../guidedTypes';
import { createBaseGuidedState } from './baseState';
import { freeChat } from './freeChat';

/** 本节任务：把销售分析做成能改的 PPT（用 / 选技能时的说法） */
const PPT_PROMPT = '把 @上月销售分析.md 做成 PPT，发给老板看。';
/** 第二种手动用法：不选胶囊，直接在话里点名技能 */
const DIRECT_PROMPT = '用 WPS Office 全家桶 技能，把 @上月销售分析.md 做成能在 WPS 里修改的 PPT，发给老板看。';
/** 先选上的那个技能（交出的是网页，不是 .pptx） */
const WEB_PPT = '网页 PPT（演讲版）';

export const skillsLesson: GuidedLessonDef = {
  id: 'skills',
  code: '3.2',
  title: '技能：挑、装、用',
  guideUrl: '/features/extend/skills/',
  initialState: () =>
    createBaseGuidedState({
      selectedGroup: 'WorkBuddy-练习',
      selectedModel: 'Hy4 flash',
      composerText: '',
    }),
  steps: [
    {
      id: 'intro',
      phase: 0,
      say: [
        '第 3 章讲「给它加能力」：<b>技能、专家、连接器</b>。三样都不是装上就变强，挂得不对反而会把它带偏，所以每样都学怎么用、什么时候用，最后练怎么选。',
        '先学技能。技能就是<b>一份说明书</b>，把一类活的做法写下来，用来<b>减少重复</b>。',
        '这一段走完整一圈：<b>挑 → 装 → 用</b>，最后看看<b>挑错了会怎样</b>。手上的活：把上月销售分析做成 PPT 发给老板。先去技能页挑一个能做 PPT 的。',
      ],
      buttons: [{ label: '去技能页', primary: true }],
    },
    {
      id: 'open-ext',
      phase: 1,
      navLabel: '专家·技能·连接器',
      say: [],
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
        '现在去找能出 PPT 文件、WPS 能打开的技能。点右上角搜索，搜 wps。',
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
      id: 'structure',
      phase: 1,
      navLabel: '拆开看',
      say: ['装之前先拆开看看技能里面是什么。一个技能就是一个文件夹，结构大概是这样：'],
      card: {
        kind: 'doc',
        title: '一个技能里面有什么（示意）',
        badge: '技能文件夹',
        badgeTone: 'plain',
        lines: [
          'WPS Office 全家桶/',
          '├─ SKILL.md　核心说明书：名字、什么时候用、按什么步骤做、不许做什么',
          '└─ 脚本、模板（可选）　有的技能会带上，照着说明书调用',
        ],
      },
      after: ['详情页的「简介」就是说明书的摘要，写着它<b>能做什么、交出什么</b>：这个是用自然语言操作 WPS 文字、表格、演示。'],
      buttons: [{ label: '看完了，接着装', primary: true }],
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
      onEnter: () => ({ view: 'home', composerText: PPT_PROMPT, skillSearch: '', composerChips: [], pickLabel: WEB_PPT }),
      say: [
        '装好了，右上角变成「已安装(16)」。回首页做 PPT。',
        '手动调用技能有两种，先学第一种：在蓝圈输入框里按键盘输入 <b>/</b>，弹出技能列表。点输入框左下角 <b>+ → 技能</b> 也是同一份列表。',
      ],
      wait: { target: 'composer.slash', callout: '在输入框里输入 /', label: '输入 /' },
      onAction: () => ({ slashMenuOpen: true }),
    },
    {
      id: 'slash-pick',
      phase: 1,
      navLabel: '选技能',
      say: [
        '列表标题是「技能 (28)」，比「已安装(16)」多，因为<b>内置技能也在里面</b>，两个数对不上是正常的。',
        '跟 PPT 有关的有两个：刚装的 WPS Office 全家桶，和本来就有的 <b>网页 PPT（演讲版）</b>。很多人看到「PPT」三个字就选了，我们也先选它试试。',
      ],
      wait: { target: 'slashMenu.pick', callout: '先选它试试', label: WEB_PPT },
      onAction: () => ({ slashMenuOpen: false, composerChips: [{ kind: 'skill', label: WEB_PPT }] }),
    },
    {
      id: 'run-web',
      phase: 2,
      say: ['输入框正文开头嵌上了技能胶囊。发送。'],
      wait: { target: 'composer.send', callout: '带着这个技能发', label: '发送（网页 PPT）' },
      onAction: () => ({ composerChips: [], pickLabel: null }),
      runChat: () =>
        freeChat({
          id: 'skills-web',
          prompt: PPT_PROMPT,
          promptChips: [{ kind: 'skill', label: WEB_PPT }],
          chatTitle: '① 网页 PPT（演讲版）· 销售分析',
          footerTip: '挑了网页 PPT 技能的结果，可在左侧 最近 里回看',
          elapsed: '1m 12s',
          hideMarksInitially: true,
          steps: [
            { running: '加载技能 网页 PPT（演讲版）…', done: '按技能步骤：先拆大纲，再逐页做成网页' },
            { running: '读取 上月销售分析.md…', done: '已拆成 10 页' },
            { running: '生成演讲网页…', done: '已写入 上月销售分析_演讲版.html' },
          ],
          replyHtml:
            '已完成，共 10 页，按方向键翻页、F 键全屏：\n\n- 第 1 页：上月销售额 53.7 万，环比 +8%\n- 第 2–8 页：三家门店各自的趋势和亮点\n- 第 9–10 页：问题与下月计划\n\n{{wrong:交付文件是 上月销售分析_演讲版.html，用浏览器打开演示}}。{{wrong:如需在 WPS 里编辑，需要另行转换}}。',
          fileCard: { name: '上月销售分析_演讲版.html', meta: '10 页 · 网页 · 浏览器全屏演示', warn: true },
        }),
    },
    {
      id: 'ask-web',
      phase: 2,
      say: ['做得挺漂亮，还能全屏翻页。<b>停一秒：这是你要的东西吗？</b>'],
      buttons: [{ label: '标出问题', primary: true }],
    },
    {
      id: 'reveal-web',
      phase: 2,
      revealMarksOnEnter: true,
      say: [
        '看橙色两处：交出来的是<b>网页文件</b>，WPS 里改不了，老板想动一个数字都得找你。',
        '但<b>技能没做错</b>：它的简介写得清清楚楚，「把主题、文章或大纲做成一整套<b>可全屏演讲的网页</b>」。是<b>我们挑错了</b>：你要的是能改、能转发的 .pptx。挑技能，先看简介里<b>它交出的是什么</b>。',
      ],
      buttons: [{ label: '换个技能，学第二种用法', primary: true }],
    },
    {
      id: 'run-direct',
      phase: 2,
      onEnter: () => ({ view: 'home', composerChips: [], composerText: DIRECT_PROMPT, pickLabel: null }),
      say: [
        '第二种手动调用：<b>不选胶囊，直接在话里点名</b>「用 X 技能做 Y」。适合你记得技能名字的时候，比翻列表快。',
        '我已经写好了，注意开头的「用 WPS Office 全家桶 技能」。发送。',
      ],
      wait: { target: 'composer.send', callout: '直接点名技能再发', label: '发送（点名 WPS 技能）' },
      runChat: () =>
        freeChat({
          id: 'skills-wps',
          prompt: DIRECT_PROMPT,
          chatTitle: '② 点名 WPS Office 全家桶 · 销售分析',
          footerTip: '在左侧 最近 里点 ① 和 ② 对比',
          elapsed: '58s',
          steps: [
            { running: '加载技能 WPS Office 全家桶…', done: '按技能步骤：先定页数和版式，再逐页写入' },
            { running: '读取 上月销售分析.md…', done: '已拆成 10 页' },
            { running: '写入演示文稿…', done: '已写入 上月销售分析.pptx' },
          ],
          replyHtml:
            '已完成，共 10 页：\n\n- 第 1 页：上月销售额 53.7 万，环比 +8%\n- 第 2–8 页：三家门店各自的趋势和亮点，图表可直接编辑数据\n- 第 9–10 页：问题与下月计划\n\n{{ok:交付文件是 上月销售分析.pptx，用 WPS 打开就能逐页修改}}。',
          fileCard: { name: '上月销售分析.pptx', meta: '10 页 · 可直接用 WPS 打开修改' },
        }),
    },
    {
      id: 'summary',
      phase: 3,
      say: ['同一个任务，两个技能都认真干了活，差别只在<b>交出来的东西对不对得上你要的</b>。'],
      card: {
        kind: 'compare',
        title: '同一个任务，挑了两个技能',
        leftLabel: '① 网页 PPT（演讲版）',
        leftTone: 'warn',
        leftHtml: '交出 .html 网页，适合全屏演讲，WPS 里改不了。技能没错，是和任务对不上。',
        rightLabel: '② WPS Office 全家桶',
        rightTone: 'ok',
        rightHtml: '交出 <b>.pptx</b>，用 WPS 打开就能逐页改，能直接发给老板。',
      },
      after: [
        '用技能记住 5 条：<b>① 挑技能看 ⚡ 使用量 / ⬇ 安装或下载量 / ☆ 收藏和来源，再看简介里它交出的是什么</b>；<b>② 手动调用两种：打 / 或 + → 技能 选上，或者直接说「用 X 技能做 Y」</b>；<b>③ 第一次用拿小样本试，不对就换</b>；<b>④ 用到再装、别囤，不用的在「已安装」里卸载</b>；<b>⑤ 技能自动更新 1.1 节讲过，保持开启</b>。',
      ],
      buttons: [
        { label: '重来一遍', restart: true },
      ],
    },
  ],
};
