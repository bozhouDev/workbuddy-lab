import type { GuidedLessonDef } from '../guidedTypes';
import { createBaseGuidedState } from './baseState';
import { freeChat } from './freeChat';

/**
 * 3.4 专家：召唤、在合适的活上用、在不合适的活上看它怎么跑偏、移除
 * 对比只做「合适 vs 不合适」，不做「不用 vs 用了」
 */

/** 合适的活：让 PPT制作专家 挑年终汇报大纲的毛病 */
const OUTLINE_PROMPT = '@年终汇报大纲.md 帮我看看这份年终汇报大纲哪里不行。';
/** 不合适的活：给客户写延期道歉邮件 */
const EMAIL_PROMPT = '帮我给客户写一封邮件：项目上线要延期一周，原因是第三方接口联调没通过，新上线日期 12 月 8 日。';
/** 专家名 */
const PPT_EXPERT = 'PPT制作专家';

export const expertsLesson: GuidedLessonDef = {
  id: 'experts',
  code: '3.4',
  title: '专家：召唤、用对、移除',
  guideUrl: '/features/extend/experts/',
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
        '3.1 拆开看过：<b>专家 = 一段角色提示词 + 可选的一组技能</b>。它改变的是<b>看问题的视角和干活的方法</b>。',
        '视角对得上，它能帮你看到内行才看得到的东西；对不上，它会把你往它擅长的方向带。这节学怎么召唤、用在对的地方，以及用完怎么移除。',
      ],
      buttons: [{ label: '去召唤一位专家', primary: true }],
    },
    {
      id: 'open-ext',
      phase: 1,
      navLabel: '专家·技能·连接器',
      say: [],
      wait: { target: 'nav.extensions', callout: '点这里进入', label: '专家·技能·连接器' },
      onAction: () => ({ view: 'extensions', extTab: 'skills' }),
    },
    {
      id: 'tab-experts',
      phase: 1,
      navLabel: '专家',
      say: [],
      wait: { target: 'ext.tab.experts', callout: '点「专家」', label: '专家' },
      onAction: () => ({ extTab: 'experts' }),
    },
    {
      id: 'search',
      phase: 1,
      navLabel: '搜索 ppt',
      say: [
        '专家页上面是行业大卡，下面分「专家 / 专家团」，再往下是行业分类和「综合 / 最热 / 最新」排序。专家有几千位，<b>知道要什么就直接搜</b>，比翻分类快。点右上角的搜索框搜 ppt。',
      ],
      wait: { target: 'experts.search', callout: '搜 ppt', label: '搜索专家' },
      onAction: () => ({ expertSearch: 'ppt' }),
    },
    {
      id: 'pick',
      phase: 1,
      navLabel: '看卡片',
      say: [
        '「搜索 "ppt" 找到 40 位专家」，怎么挑？看卡片上两样东西：',
        '<b>⚡ 后面的数字是使用量</b>，就是被召唤过多少次，说明用的人多；<b>「官方」标</b>是 WorkBuddy 官方出的。用的人多不等于适合你，最后还要看详情。点开第一张。',
      ],
      wait: { target: 'experts.card', callout: '点开看详情', label: 'PPT制作专家' },
      onAction: () => ({ expertDetailId: 'ppt' }),
    },
    {
      id: 'summon',
      phase: 1,
      navLabel: '立即召唤',
      say: [
        '决定召不召唤，就看<b>具体能力介绍</b>和你手上的活对不对得上。这位写的是做 PPT、改大纲、排版，你要让它挑年终汇报大纲的毛病，对得上。点「立即召唤」。',
      ],
      wait: { target: 'experts.summon', callout: '立即召唤', label: '立即召唤' },
      onAction: () => ({
        expertDetailId: null,
        view: 'home',
        composerText: OUTLINE_PROMPT,
        composerChips: [{ kind: 'expert', label: 'PPT制作专家' }],
        toast: '已成功召唤专家「PPT制作专家」',
      }),
    },
    {
      id: 'run-expert',
      phase: 2,
      say: [
        '顶上提示「已成功召唤专家「PPT制作专家」」，自动回到首页，输入框底栏出现了<b>头像 + PPT制作专家</b>。以后也可以不进专家页，直接点输入框左下角 <b>+ → 专家</b> 召唤。发送。',
      ],
      wait: { target: 'composer.send', callout: '带着专家发', label: '发送（合适的活）' },
      runChat: () =>
        freeChat({
          id: 'experts-ppt',
          prompt: OUTLINE_PROMPT,
          promptChips: [{ kind: 'expert', label: 'PPT制作专家' }],
          chatTitle: '① PPT制作专家 · 点评大纲',
          footerTip: '合适的活，可在左侧 最近 里回看',
          elapsed: '24s',
          steps: [
            { running: '读取 年终汇报大纲.md…', done: '已读取 年终汇报大纲.md（6 页）' },
            { running: '以 PPT制作专家 视角逐页检查…', done: '找到 3 个需要改的地方' },
          ],
          replyHtml:
            '按「老板 30 秒能不能看懂」逐页看，有 3 个问题：\n\n1. {{ok:第 6 页才出现结论。老板前 30 秒看不到重点，建议把「全年营收增长 18%」挪到第 1 页当标题}}\n2. {{ok:第 3 页三个数字（18%、2.4 万、37 家）没写出处，被问到会答不上来，建议页脚注明数据来源}}\n3. {{ok:第 4、5 页都在讲过程，可以合成一页「三件关键动作」，省下的一页放明年要的资源}}',
        }),
    },
    {
      id: 'read-fit',
      phase: 2,
      say: [
        '每条都<b>指到哪一页、什么问题、怎么改</b>，「老板 30 秒能不能看懂」就是做汇报 PPT 的人才会用的标准。活和专家对得上，它就帮上了忙。',
        '接下来换一件活看看。',
      ],
      buttons: [{ label: '下一件活：写道歉邮件', primary: true }],
    },
    {
      id: 'run-misfit',
      phase: 2,
      onEnter: () => ({ view: 'home', composerText: EMAIL_PROMPT }),
      say: [
        '下一件活来了：给客户写延期道歉邮件。假设你接着在这个输入框里写，<b>没注意底栏的 PPT制作专家还挂着</b>。就这样发出去看看。',
      ],
      wait: { target: 'composer.send', callout: '专家还挂着，先这样发', label: '发送（不合适的活）' },
      runChat: () =>
        freeChat({
          id: 'experts-misfit',
          prompt: EMAIL_PROMPT,
          promptChips: [{ kind: 'expert', label: PPT_EXPERT }],
          chatTitle: '② PPT制作专家 · 道歉邮件',
          footerTip: '专家对不上活时的结果',
          elapsed: '18s',
          hideMarksInitially: true,
          steps: [{ running: '以 PPT制作专家 视角组织内容…', done: '已整理成 3 段' }],
          replyHtml:
            '{{wrong:建议按「结论先行」的汇报结构来写}}：\n\n**一、核心结论**：上线日期调整为 12 月 8 日\n\n**二、原因说明**：第三方接口联调未通过\n\n**三、后续计划**：{{wrong:如需对外沟通，可同步制作一页延期说明 PPT，便于客户内部转发}}\n\n{{wrong:（正文略，建议每段不超过两行，便于投屏阅读）}}',
        }),
    },
    {
      id: 'ask-misfit',
      phase: 2,
      say: ['<b>这像一封能直接发给客户的道歉邮件吗？</b>'],
      buttons: [{ label: '标出问题', primary: true }],
    },
    {
      id: 'remove',
      phase: 1,
      revealMarksOnEnter: true,
      onEnter: () => ({ view: 'home', composerText: EMAIL_PROMPT }),
      say: [
        '橙色几处，是它<b>还在用做汇报的方法写邮件</b>：结论先行、分段标题、建议做一页 PPT、为投屏控制长度。道歉邮件要的是诚恳、讲清影响和补救，这些它反而没顾上。（模拟示意：真机里跑偏的样子不一定一样，但方向类似。）',
        '<b>专家没做错，是挂错了活。</b>写邮件用不上这个视角，把它移除：点底栏专家名字旁的 <b>×</b>。',
      ],
      wait: { target: 'composer.expertRemove', callout: '点 × 移除专家', label: `移除 ${PPT_EXPERT}` },
      onAction: (s) => ({ composerChips: s.composerChips.filter((c) => c.kind !== 'expert') }),
    },
    {
      id: 'run-removed',
      phase: 2,
      say: ['底栏的专家没了，同一句话再发一次。'],
      wait: { target: 'composer.send', callout: '移除后再发', label: '发送（移除专家后）' },
      runChat: () =>
        freeChat({
          id: 'experts-removed',
          prompt: EMAIL_PROMPT,
          chatTitle: '③ 移除专家 · 道歉邮件',
          footerTip: '在左侧 最近 里点 ② 和 ③ 对比',
          elapsed: '11s',
          steps: [{ running: '起草邮件…', done: '已写好 1 封邮件' }],
          replyHtml:
            '**主题：关于项目上线时间调整为 12 月 8 日的说明**\n\n王经理您好：\n\n{{ok:很抱歉通知您，项目上线需要延期一周，新的上线日期是 12 月 8 日。}}原因是第三方接口联调没有通过，我们不想带着风险上线。\n\n{{ok:这一周我们会每天同步联调进度；如果 12 月 5 日前仍有风险，会提前告诉您备选方案。}}给您添麻烦了，有任何问题随时联系我。',
        }),
    },
    {
      id: 'summary',
      phase: 3,
      say: ['同一位专家，两件活：'],
      card: {
        kind: 'compare',
        title: '专家对得上活 vs 对不上活',
        leftLabel: '② 挂着 PPT 专家写邮件',
        leftTone: 'warn',
        leftHtml: '套用汇报结构，还建议做一页 PPT。专家没错，是<b>活对不上</b>。',
        rightLabel: '① 用 PPT 专家改大纲',
        rightTone: 'ok',
        rightHtml: '指到页码、问题和改法，<b>视角正好用得上</b>。',
      },
      after: [
        '③ 移除专家后的邮件反而更像样：<b>不是每件活都需要专家</b>。',
        '用专家记住 4 条：<b>① 召唤前看「具体能力介绍」，和手上的活对得上再用</b>；<b>② 专家页或 + → 专家 都能召唤</b>；<b>③ 换活前看一眼底栏，对不上就点 × 移除</b>；<b>④ 专家只管视角，不替你核对事实</b>，数字还得自己对。要几个岗位一起干活，专家页里还有「专家团」，用法一样。',
      ],
      buttons: [
        { label: '下一节：3.5 连接器 →', primary: true, nextLesson: 'connectors' },
        { label: '读本节图文教程', href: '/features/extend/experts/' },
        { label: '重来一遍', restart: true },
      ],
    },
  ],
};
