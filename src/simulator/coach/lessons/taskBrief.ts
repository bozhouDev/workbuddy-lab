import type { GuidedLessonDef } from '../guidedTypes';
import { createBaseGuidedState } from './baseState';

const VAGUE_BRIEF = '@周末读书会群聊.txt 帮我整理一下这份记录。';
const FIVE_PARTS_BRIEF =
  '@周末读书会群聊.txt 整理成《周末读书会筹备纪要.md》存到当前分组。包含：活动信息、待办表格（事项/负责人/截止时间/备注）。原记录没写明的负责人或时间一律标“未明确”，不要改原文件，完成后列出最需要我核对的 3 处内容。';

export const taskBriefLesson: GuidedLessonDef = {
  id: 'task-brief',
  code: '2.4',
  title: '写清任务：5 要素与采访法',
  guideUrl: '/features/send-task/task-brief/',
  initialState: () =>
    createBaseGuidedState({
      selectedGroup: 'WorkBuddy-练习',
      selectedModel: 'Hy4 flash',
      composerText: VAGUE_BRIEF,
    }),
  steps: [
    {
      id: 'intro',
      phase: 0,
      say: [
        '把资料用 <b>@</b> 交给它之后，为什么有时候结果还是差强人意？问题往往出在需求说得太含糊。',
        '先看一句最常见的新手写法：<code>帮我整理一下这份记录</code>，看看它会交出什么作业。',
      ],
      buttons: [{ label: '先看 一句话模糊发 会怎样', primary: true }],
    },
    {
      id: 'run-vague',
      phase: 1,
      onEnter: () => ({ view: 'home', popover: null, composerText: VAGUE_BRIEF }),
      say: ['点右下角<b>发送</b>。'],
      wait: {
        target: 'composer.send',
        callout: '模糊需求先发一次',
        label: '发送（模糊需求）',
      },
      runChat: () => ({
        id: 'brief-vague',
        prompt: VAGUE_BRIEF,
        chatTitle: '① 一句话模糊需求 · 整理',
        model: 'Hy4 flash',
        estimateText: '0.00',
        consumedText: '0.00',
        consumedDelta: 0,
        footerTip: '没说清交付物和禁编造要求时的输出',
        elapsed: '2s',
        hideMarksInitially: true,
        steps: [
          { running: '正在读取 @周末读书会群聊.txt…', done: '已读取群聊记录并直接总结' },
        ],
        replyHtml:
          '本次读书会定于周六下午 2 点在静安寺青松咖啡二楼包间举行，各项分工已全部明确：\n\n1. 海报设计：小周（今晚下班前完成）\n2. 印签到表与桌签：{{wrong:阿林}}（周五中午前）\n3. 茶歇与饮品：老陈（预算 500 元以内，明天下午确认）\n4. 现场拍照与录像：{{wrong:小周（活动当天全程负责）}}\n5. 开场 PPT：阿林（周四晚初稿）\n\n（{{wrong:注：已直接输出在对话中，未生成独立纪要文件}}）',
      }),
    },
    {
      id: 'ask-vague',
      phase: 2,
      say: ['明明已经用 <b>@</b> 读了原群聊，结果还是藏着坑。<b>看出哪 3 处翻车了吗？</b>'],
      buttons: [{ label: '标出 3 处问题', primary: true }],
    },
    {
      id: 'prep-5parts',
      phase: 1,
      revealMarksOnEnter: true,
      say: [
        '看橙色标出来的：① 原文里印桌签和拍照根本<b>没定人</b>，它擅自硬塞给了阿林和小周；② 没告诉它交付什么文件，它只扔在对话里没生成 <code>.md</code>；③ 也没提示你该核对哪几处。',
        '任务心里有数时，按 <b>5 要素</b>交代清楚就行：<b>有什么材料 + 要做什么 + 哪些不能做（标未明确、不改原件）+ 交付文件名 + 怎么检查</b>。我帮你填进输入框，再发一次看差别。',
      ],
      buttons: [{ label: '换成 5 要素任务单重发', primary: true }],
    },
    {
      id: 'run-5parts',
      phase: 2,
      onEnter: () => ({
        view: 'home',
        activeChat: null,
        showArtifacts: false,
        composerText: FIVE_PARTS_BRIEF,
      }),
      say: ['看输入框里已经写齐 5 要素，特别是那句防编造保命句。点<b>发送</b>！'],
      wait: {
        target: 'composer.send',
        callout: '按 5 要素发送',
        label: '发送（5 要素任务单）',
      },
      runChat: () => ({
        id: 'brief-5parts',
        prompt: FIVE_PARTS_BRIEF,
        chatTitle: '② 5 要素任务单 · 筹备纪要',
        model: 'Hy4 flash',
        estimateText: '0.00',
        consumedText: '0.00',
        consumedDelta: 0,
        footerTip: '点左侧 最近 里的 ① 和 ② 可随时对比输出质量',
        elapsed: '3s',
        steps: [
          { running: '正在读取 @周末读书会群聊.txt…', done: '已核对原文 6 条发言，不修改原文件' },
          { running: '生成《周末读书会筹备纪要.md》…', done: '已写入 WorkBuddy-练习/周末读书会筹备纪要.md' },
        ],
        replyHtml:
          '已生成 <code>周末读书会筹备纪要.md</code>（原文件未修改）：\n\n| 具体事项 | 负责人 | 截止时间 | 备注 |\n| --- | --- | --- | --- |\n| 修改活动海报 | 小周 | 今晚下班前 | 改完发群里 |\n| 确认茶歇菜单 | 老陈 | 明天下午 | 预算 500 元以内 |\n| 开场 PPT 初稿 | 阿林 | 周四晚上 | 周五上午提意见 |\n| 印签到表和桌签 | {{ok:未明确}} | 周五中午前 | 需群里认领 |\n| 现场拍照和录像 | {{ok:未明确}} | {{ok:未明确}} | 需发公众号回顾 |\n\n最需要你核对的 3 处：印桌签负责人、现场拍照负责人及时间、茶歇最终菜单。',
        fileCard: {
          name: '周末读书会筹备纪要.md',
          meta: 'WorkBuddy-练习/周末读书会筹备纪要.md · 原文件完好',
        },
        artifact: {
          file: '周末读书会筹备纪要.md',
          pathLabel: 'WorkBuddy-练习/周末读书会筹备纪要.md',
          badge: '5 要素达标',
          badgeTone: 'ok',
          title: '周末读书会筹备纪要',
          lines: [
            { text: '活动时间地点：周六 14:00 · 静安寺青松咖啡二楼包间' },
            { text: '待确认 1：印签到表和桌签 — 负责人 未明确', tone: 'ok' },
            { text: '待确认 2：现场拍照录像 — 负责人/时间 未明确', tone: 'ok' },
            { text: '茶歇预算：老陈负责，500 元以内' },
          ],
        },
      }),
    },
    {
      id: 'summary',
      phase: 3,
      say: [
        '记住一句口诀：<b>心里有数，直接交代 5 件事；心里没底（比如做汇报 PPT、写小程序），开 Plan 模式让 AI 每次问你 1～2 个问题反过来采访你</b>，把模糊想法聊清楚再动手。',
      ],
      card: {
        kind: 'table',
        title: '什么时候用 5 要素 vs 什么时候让 AI 采访你',
        headers: ['情况', '做法', '核心动作'],
        rows: [
          ['心里有数的小活', '直接交代 5 要素', '材料 + 做什么 + 不能做什么 + 文件名 + 核对点'],
          ['想法模糊/大活', '开 Plan 让 AI 采访你', '有多少说多少，每次答 1～2 题，确认单拍板再开工'],
        ],
      },
      buttons: [
        { label: '下一节：2.5 看执行过程 →', primary: true, nextLesson: 'execution' },
        { label: '读本节图文教程', href: '/features/send-task/task-brief/' },
        { label: '重来一遍', restart: true },
      ],
    },
  ],
};
