import type { GuidedLessonDef } from '../guidedTypes';
import { createBaseGuidedState } from './baseState';

/**
 * 3.1 拆开看：专家、技能、连接器是什么
 * 不跑任务、不做对比，只把三样东西拆开认清楚：
 * 专家 = 一段角色提示词 + 可选的一组技能；技能 = 一份说明书（SKILL.md），用来减少重复；连接器 = 一个授权通道。
 */
export const anatomyLesson: GuidedLessonDef = {
  id: 'anatomy',
  code: '3.1',
  title: '拆开看：专家、技能、连接器',
  guideUrl: '/features/extend/choose/',
  initialState: () =>
    createBaseGuidedState({
      selectedGroup: 'WorkBuddy-练习',
      selectedModel: 'Hy4 flash',
      // 假设飞书已经接好，这节只看它的详情；怎么接在 3.5 讲
      connectedIds: ['feishu'],
    }),
  steps: [
    {
      id: 'intro',
      phase: 0,
      say: [
        '第 3 章讲「给它加能力」。WorkBuddy 能装三样东西：<b>专家、技能、连接器</b>。',
        '先别急着用，也别信「装上就变强」。这节只做一件事：<b>把它们拆开，看看里面到底是什么</b>。三样都在左边侧栏的同一个入口里。',
      ],
      buttons: [{ label: '去拆开看看', primary: true }],
    },
    {
      id: 'open-ext',
      phase: 1,
      navLabel: '专家·技能·连接器',
      say: [],
      wait: { target: 'nav.extensions', callout: '点这里进入', label: '专家·技能·连接器' },
      onAction: () => ({ view: 'extensions', extTab: 'skills', popover: null }),
    },
    {
      id: 'tab-experts',
      phase: 1,
      navLabel: '专家',
      say: ['先拆最复杂的专家。点顶上的「专家」。'],
      wait: { target: 'ext.tab.experts', callout: '点「专家」', label: '专家' },
      onAction: () => ({ extTab: 'experts' }),
    },
    {
      id: 'search-expert',
      phase: 1,
      navLabel: '搜索 ppt',
      say: ['专家有几千位，知道要什么就直接搜。点右上角搜索框，搜 ppt。'],
      wait: { target: 'experts.search', callout: '搜 ppt', label: '搜索专家' },
      onAction: () => ({ expertSearch: 'ppt' }),
    },
    {
      id: 'open-expert',
      phase: 1,
      navLabel: '看详情',
      say: [],
      wait: { target: 'experts.card', callout: '点开看里面', label: 'PPT制作专家' },
      onAction: () => ({ expertDetailId: 'ppt' }),
    },
    {
      id: 'read-expert',
      phase: 2,
      say: [
        '详情里看两块：<b>「具体能力介绍」</b>写的是它被设定成怎么想、怎么干，背后就是一段<b>角色提示词</b>；<b>「使用技能」</b>列着它干活时会调用的技能：WPS Office 全家桶、网页 PPT（演讲版）。',
        '所以 <b>专家 = 一段角色提示词 + 可选的一组技能</b>。说「可选」，是因为有的专家「使用技能」那里写着「暂未配置技能」，只有提示词。',
      ],
      buttons: [{ label: '接着拆技能', primary: true }],
    },
    {
      id: 'tab-skills',
      phase: 1,
      navLabel: '技能',
      onEnter: () => ({ expertDetailId: null, expertSearch: '' }),
      say: ['专家用到的 WPS Office 全家桶，本身就是一个技能。去技能页找它，点顶上的「技能」。'],
      wait: { target: 'ext.tab.skills', callout: '点「技能」', label: '技能' },
      onAction: () => ({ extTab: 'skills', skillTab: 'recommend', statTip: null }),
    },
    {
      id: 'search-skill',
      phase: 1,
      navLabel: '搜索 wps',
      say: [],
      wait: { target: 'skills.search', callout: '搜 wps', label: '搜索技能' },
      onAction: () => ({ skillSearch: 'wps' }),
    },
    {
      id: 'open-skill',
      phase: 1,
      navLabel: '看详情',
      say: ['搜出来两个同名的，挑技能的门道 3.2 再讲。先点开第二个看看。'],
      wait: { target: 'skills.pickCard', callout: '点开看里面', label: 'WPS Office 全家桶' },
      onAction: () => ({ skillDetailId: 'wps-b' }),
    },
    {
      id: 'read-skill',
      phase: 2,
      say: [
        '技能的「简介」写的就是它<b>能做什么、交出什么</b>：用自然语言操作 WPS 文字、表格、演示，保留公式、批注和样式。',
        '拆开来，一个技能就是一个文件夹，结构大概是这样：',
      ],
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
      after: [
        '技能的用处是<b>减少重复</b>：一类活的做法写下来一次，以后每次照着做，不用你每回重新交代。3.3 节你会自己做一个。',
      ],
      buttons: [{ label: '最后拆连接器', primary: true }],
    },
    {
      id: 'tab-connectors',
      phase: 1,
      navLabel: '连接器',
      onEnter: () => ({ skillDetailId: null, skillSearch: '' }),
      say: [],
      wait: { target: 'ext.tab.connectors', callout: '点「连接器」', label: '连接器' },
      onAction: () => ({ extTab: 'connectors' }),
    },
    {
      id: 'open-connector',
      phase: 1,
      navLabel: '看详情',
      say: ['假设你已经接好了飞书（卡片上的绿点，怎么接 3.5 节教）。点开它。'],
      wait: { target: 'connectors.card', callout: '点开看里面', label: '飞书详情' },
      onAction: () => ({ connectorDetailId: 'feishu' }),
    },
    {
      id: 'read-connector',
      phase: 2,
      say: [
        '「可用功能」就是授权以后它能替你做的动作：读文档、建文档、录多维表格、发消息。',
        '连接器是<b>一个授权通道</b>：它只管<b>拿得到什么</b>，不懂该怎么做。怎么做靠技能和你说清楚的要求。',
      ],
      buttons: [{ label: '总结一下', primary: true }],
    },
    {
      id: 'summary',
      phase: 3,
      onEnter: () => ({ connectorDetailId: null }),
      say: ['三样东西拆开看，其实都不神秘：'],
      card: {
        kind: 'table',
        title: '三样东西各管什么',
        headers: ['', '是什么', '管什么', '在对话里怎么用'],
        rows: [
          ['技能', '一份说明书（SKILL.md）', '怎么做，减少重复', '输入框打 / 或 + → 技能'],
          ['连接器', '一个授权通道', '拿得到什么', '+ → 连接器，打开开关'],
          ['专家', '角色提示词 + 可选的一组技能', '用什么视角、方法把技能组合起来', '专家页召唤，或 + → 专家'],
        ],
      },
      after: [
        '三样都<b>不是越多越好</b>，也没有「用了就一定更好」：挂得不对，反而会把它带偏。接下来几节一样一样学怎么用，3.7 再练怎么选。',
      ],
      buttons: [
        { label: '下一节：3.2 技能 →', primary: true, nextLesson: 'skills' },
        { label: '读本节图文教程', href: '/features/extend/choose/' },
        { label: '重来一遍', restart: true },
      ],
    },
  ],
};
