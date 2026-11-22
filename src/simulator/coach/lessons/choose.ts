import type { ComposerChip, GuidedLessonDef } from '../guidedTypes';
import { createBaseGuidedState } from './baseState';
import { freeChat } from './freeChat';

/** 贯穿本节的任务：飞书里的 5 份周报 → 给老板的本周项目进展汇报 PPT */
const PPT_PROMPT = '把飞书里这周 5 份项目周报，做成给老板看的本周项目进展汇报 PPT。';

/** 配齐后的三枚胶囊：数据线 + 岗位脑子 + 操作手册 */
const FULL_CHIPS: ComposerChip[] = [
  { kind: 'connector', label: '飞书' },
  { kind: 'expert', label: 'PPT制作专家' },
  { kind: 'skill', label: 'WPS Office 全家桶' },
];

export const chooseLesson: GuidedLessonDef = {
  id: 'choose',
  code: '3.1',
  title: '怎么选：专家 / 技能 / 连接器',
  guideUrl: '/features/extend/choose/',
  initialState: () =>
    createBaseGuidedState({
      selectedGroup: 'WorkBuddy-练习',
      selectedModel: 'Hy4 flash',
      composerText: PPT_PROMPT,
    }),
  steps: [
    {
      id: 'intro',
      phase: 0,
      say: [
        '第 3 章讲「给它加能力」。WorkBuddy 能装三样东西，先用一句话分清：',
        '<b>专家</b> = 给它换一套<b>岗位脑子</b>（像资深 PPT 设计师那样想问题）；<b>技能</b> = 给它一本<b>操作手册</b>（固定步骤做固定的活）；<b>连接器</b> = 给它一根<b>外部数据线</b>（读得到飞书、邮箱里的东西）。',
        '三样东西都在左边侧栏的同一个入口里，先去认认门。',
      ],
      buttons: [{ label: '去看看入口在哪', primary: true }],
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
      say: [
        '进来默认是「技能」。顶上三个标签，鼠标悬停时真机会冒一句提示，正好就是它们的分工。先点「专家」。',
      ],
      wait: { target: 'ext.tab.experts', callout: '点「专家」', label: '专家' },
      onAction: () => ({ extTab: 'experts' }),
    },
    {
      id: 'tab-connectors',
      phase: 1,
      navLabel: '连接器',
      say: [
        '专家的提示是「<b>以专家视角完成你的任务</b>」：管的是<b>怎么想</b>。技能的提示是「<b>适合高效完成特定的任务</b>」：管的是<b>怎么做</b>。再点「连接器」。',
      ],
      wait: { target: 'ext.tab.connectors', callout: '点「连接器」', label: '连接器' },
      onAction: () => ({ extTab: 'connectors' }),
    },
    {
      id: 'run-bare',
      phase: 1,
      onEnter: () => ({ view: 'home', composerChips: [], composerText: PPT_PROMPT, popover: null }),
      say: [
        '连接器的提示是「<b>帮你连接外部应用数据</b>」：管的是<b>拿得到什么</b>。',
        '认完门，回到首页。输入框里是一个真实的活：<code>把飞书里这周 5 份项目周报，做成给老板看的本周项目进展汇报 PPT</code>。先<b>什么都不配</b>，直接发。',
      ],
      wait: { target: 'composer.send', callout: '什么都不配，直接发', label: '发送（裸跑）' },
      runChat: () =>
        freeChat({
          id: 'choose-bare',
          prompt: PPT_PROMPT,
          chatTitle: '① 什么都不配 · 项目汇报 PPT',
          footerTip: '没有连接器、专家、技能时的输出，可在左侧 最近 里回看',
          elapsed: '41s',
          hideMarksInitially: true,
          steps: [
            { running: '查找可用的飞书数据来源…', done: '未找到飞书连接器，改用通用汇报模板' },
            { running: '生成大纲…', done: '已生成 8 页大纲（Markdown）' },
          ],
          replyHtml:
            '已为你生成项目汇报大纲：\n\n1. 项目背景\n2. 本周工作过程\n3. 各项目进展：{{wrong:A 项目完成率 85%、B 项目完成率 92%}}\n4. 遇到的问题\n5. {{wrong:最终成果与结论}}\n6. 下周计划\n\n如需生成 PPT 文件，请告诉我。',
        }),
    },
    {
      id: 'ask-bare',
      phase: 2,
      say: ['看着挺完整。<b>停一秒：这份大纲哪里不能交给老板？</b>'],
      buttons: [{ label: '标出问题', primary: true }],
    },
    {
      id: 'run-full',
      phase: 2,
      revealMarksOnEnter: true,
      onEnter: () => ({ view: 'home', composerText: PPT_PROMPT, composerChips: FULL_CHIPS, popover: null }),
      say: [
        '橙色两处：<b>① 完成率是编的</b>，它根本读不到飞书（缺数据线）；<b>② 结论放在第 5 页</b>，老板最关心的东西翻到最后才看到（缺岗位脑子）。而且最后只给了文字大纲，没有能改的 PPT 文件（缺操作手册）。',
        '我已经在输入框里挂好三枚胶囊：<b>连接器 飞书</b>、<b>专家 PPT制作专家</b>、<b>技能 WPS Office 全家桶</b>（后面三节会一个个教你怎么挂上）。同一句话，再发一次。',
      ],
      wait: { target: 'composer.send', callout: '配齐三样再发', label: '发送（配齐三样）' },
      onAction: () => ({ composerChips: [] }),
      runChat: () =>
        freeChat({
          id: 'choose-full',
          prompt: PPT_PROMPT,
          promptChips: FULL_CHIPS,
          chatTitle: '② 配齐三样 · 项目汇报 PPT',
          footerTip: '在左侧 最近 里点 ① 和 ② 对比',
          elapsed: '2m 06s',
          steps: [
            { running: '调用 飞书 · 搜索文档「项目周报」…', done: '已通过飞书读取 5 篇周报（11-17 ~ 11-21）' },
            { running: '以 PPT制作专家 视角梳理结构…', done: '采用「结论先行」结构，共 8 页' },
            { running: '调用技能 WPS Office 全家桶…', done: '已生成 本周项目汇报.pptx' },
          ],
          replyHtml:
            '已完成，第 1 页就是结论：\n\n- {{ok:第 1 页 · 一句话结论：5 个项目 4 个按期，C 项目延期 2 周，需要追加 1 名测试}}\n- 第 2–6 页：5 个项目每个一页，数字均来自周报原文，{{ok:页脚标注出处（哪份周报、哪天）}}\n- 第 7 页：风险与需要老板拍板的事\n- 第 8 页：下周计划',
          fileCard: { name: '本周项目汇报.pptx', meta: '8 页 · 可直接用 WPS 打开修改' },
        }),
    },
    {
      id: 'summary',
      phase: 3,
      say: [
        '同一句话，配齐三样东西之后：<b>数字有出处、结论在第一页、交付的是能改的 .pptx</b>。以后遇到干不好的活，先问自己缺的是哪一样：',
      ],
      card: {
        kind: 'table',
        title: '你缺什么 → 用什么',
        headers: ['它的问题', '缺的是', '用什么', '例子'],
        rows: [
          ['回答空泛、不像内行', '岗位脑子', '专家', 'PPT制作专家、财报分析师'],
          ['每次格式都不一样、步骤总漏', '操作手册', '技能', 'WPS 全家桶、你自己写的纪要技能'],
          ['读不到你的资料，只能编', '外部数据线', '连接器', '飞书、QQ邮箱、自己做的天气 MCP'],
        ],
      },
      after: ['三样可以一起用，但<b>别全开</b>：任务需要哪样就挂哪样，挂多了它反而容易分心。'],
      buttons: [
        { label: '下一节：3.2 专家 →', primary: true, nextLesson: 'experts' },
        { label: '读本节图文教程', href: '/features/extend/choose/' },
        { label: '重来一遍', restart: true },
      ],
    },
  ],
};
