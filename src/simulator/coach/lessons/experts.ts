import type { GuidedLessonDef } from '../guidedTypes';
import { createBaseGuidedState } from './baseState';
import { freeChat } from './freeChat';

/** 本节任务：让它挑年终汇报大纲的毛病 */
const OUTLINE_PROMPT = '@年终汇报大纲.md 帮我看看这份年终汇报大纲哪里不行。';

export const expertsLesson: GuidedLessonDef = {
  id: 'experts',
  code: '3.2',
  title: '专家',
  guideUrl: '/features/extend/experts/',
  initialState: () =>
    createBaseGuidedState({
      selectedGroup: 'WorkBuddy-练习',
      selectedModel: 'Hy4 flash',
      composerText: OUTLINE_PROMPT,
    }),
  steps: [
    {
      id: 'intro',
      phase: 0,
      say: [
        '专家就是<b>给它换一套岗位脑子</b>：同一个问题，普通助手和干了十年的 PPT 设计师看到的东西完全不一样。',
        '先看不召唤专家时，它会怎么点评一份汇报大纲。',
      ],
      buttons: [{ label: '先看不召唤专家', primary: true }],
    },
    {
      id: 'run-plain',
      phase: 1,
      onEnter: () => ({ view: 'home', composerText: OUTLINE_PROMPT, composerChips: [] }),
      say: ['输入框里已经 @ 好了大纲文件，直接发。'],
      wait: { target: 'composer.send', callout: '不召唤专家，直接发', label: '发送（普通助手）' },
      runChat: () =>
        freeChat({
          id: 'experts-plain',
          prompt: OUTLINE_PROMPT,
          chatTitle: '① 普通助手 · 点评大纲',
          footerTip: '普通助手的点评，可在左侧 最近 里回看',
          elapsed: '9s',
          hideMarksInitially: true,
          steps: [{ running: '读取 年终汇报大纲.md…', done: '已读取 年终汇报大纲.md（6 页）' }],
          replyHtml:
            '这份大纲整体不错，几点建议：\n\n1. {{wrong:结构清晰，逻辑完整}}\n2. {{wrong:建议适当增加图表，让内容更直观}}\n3. {{wrong:语言可以再精炼一些}}\n\n祝汇报顺利！',
        }),
    },
    {
      id: 'ask-plain',
      phase: 2,
      say: ['三条建议都挑不出错。<b>但你照着改，能改出什么不一样吗？</b>'],
      buttons: [{ label: '标出问题', primary: true }],
    },
    {
      id: 'open-ext',
      phase: 1,
      revealMarksOnEnter: true,
      navLabel: '专家·技能·连接器',
      say: [
        '橙色三条都是<b>放在哪份大纲上都成立的空话</b>：没说哪一页、哪个问题、怎么改。缺的就是内行的眼光。去请一位专家。',
      ],
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
        '<b>⚡ 后面的数字是使用量</b>，就是被召唤过多少次，越高说明越多人用过、越靠谱；<b>「官方」标</b>是 WorkBuddy 官方出的。第一张 PPT制作专家 两样都占，点开看详情。',
      ],
      wait: { target: 'experts.card', callout: '点开看详情', label: 'PPT制作专家' },
      onAction: () => ({ expertDetailId: 'ppt' }),
    },
    {
      id: 'summon',
      phase: 1,
      navLabel: '立即召唤',
      say: [
        '详情里重点看两块：<b>具体能力介绍</b>（它能干哪些活）和<b>使用技能</b>（它干活时会调用哪些技能）。下面的分享者、版本可以判断是不是有人在维护。点「立即召唤」。',
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
        '顶上提示「已成功召唤专家「PPT制作专家」」，自动回到首页，输入框里多了一枚<b>专家胶囊</b>。同一句话，再发一次。',
      ],
      wait: { target: 'composer.send', callout: '带着专家再发', label: '发送（已召唤专家）' },
      onAction: () => ({ composerChips: [] }),
      runChat: () =>
        freeChat({
          id: 'experts-ppt',
          prompt: OUTLINE_PROMPT,
          promptChips: [{ kind: 'expert', label: 'PPT制作专家' }],
          chatTitle: '② PPT制作专家 · 点评大纲',
          footerTip: '在左侧 最近 里点 ① 和 ② 对比',
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
      id: 'summary',
      phase: 3,
      say: ['这次每条都<b>指到具体哪一页、什么问题、怎么改</b>，拿回去就能动手。这就是换了岗位脑子的区别。'],
      card: {
        kind: 'compare',
        title: '同一个问题，两次回答',
        leftLabel: '① 普通助手',
        leftTone: 'warn',
        leftHtml: '结构清晰、建议加图表、语言再精炼。放在哪份大纲上都成立。',
        rightLabel: '② 召唤 PPT制作专家',
        rightTone: 'ok',
        rightHtml: '<b>结论挪到第 1 页、第 3 页补出处、第 4–5 页合并</b>：页码、问题、改法都有。',
      },
      after: [
        '用专家记住 4 条：<b>① 一次召唤一个</b>，换活就点胶囊上的 × 移除；<b>② 挑使用量高的或带「官方」标的</b>；<b>③ 专家只管视角，不替你核对事实</b>，数字还得自己对；<b>④ 要几个岗位一起干活，用「专家团」</b>。',
      ],
      buttons: [
        { label: '下一节：3.3 技能 →', primary: true, nextLesson: 'skills' },
        { label: '读本节图文教程', href: '/features/extend/experts/' },
        { label: '重来一遍', restart: true },
      ],
    },
  ],
};
