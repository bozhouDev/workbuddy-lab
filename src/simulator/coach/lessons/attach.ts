import type { GuidedLessonDef } from '../guidedTypes';
import { createBaseGuidedState } from './baseState';

const VAGUE_PROMPT = '帮我整理一下周末读书会的群聊记录，列出时间和预算。';
const MENTION_PROMPT = '@周末读书会群聊.txt 帮我整理一下这份群聊记录，列出时间和预算。';

export const attachLesson: GuidedLessonDef = {
  id: 'attach',
  code: '2.1',
  title: '添加资料：+ 和 @',
  guideUrl: '/features/send-task/attach/',
  initialState: () =>
    createBaseGuidedState({
      selectedGroup: 'WorkBuddy-练习',
      selectedModel: 'Hy4 flash',
      composerText: VAGUE_PROMPT,
    }),
  steps: [
    {
      id: 'intro',
      phase: 0,
      say: [
        '正式发任务第一步：<b>把资料交到它手上</b>。WorkBuddy 有两个入口：点左下角 <b>+</b> 号传本地或云端文件（资料库 / 腾讯文档 / ima / 乐享），或者在输入框里直接打 <b>@</b> 点名引用当前分组里的文件。',
        '先看很多新手常踩的坑：<b>不引用文件直接让它整理</b>，看看会发生什么。',
      ],
      buttons: [{ label: '先看 没引用文件 会怎样', primary: true }],
    },
    {
      id: 'run-no-attach',
      phase: 1,
      onEnter: () => ({ view: 'home', popover: null, mentionMenuOpen: false, composerText: VAGUE_PROMPT }),
      say: ['输入框里只写了文字，没点 <b>+</b> 也没打 <b>@</b>。直接点右下角<b>发送</b>。'],
      wait: {
        target: 'composer.send',
        callout: '不引用文件直接发',
        label: '发送（未引用文件）',
      },
      runChat: () => ({
        id: 'attach-none',
        prompt: VAGUE_PROMPT,
        chatTitle: '① 未引用文件 · 读书会整理',
        model: 'Hy4 flash',
        estimateText: '0.00',
        consumedText: '0.00',
        consumedDelta: 0,
        footerTip: '未指定参考文件时的回答，可在左侧 最近 里与下次对比',
        elapsed: '2s',
        hideMarksInitially: true,
        steps: [
          { running: '未检测到附带或 @ 引用的文件…', done: '未读取本地资料，按通用活动模板生成' },
        ],
        replyHtml:
          '已为你整理周末读书会安排参考：\n\n| 项目 | 内容 |\n| --- | --- |\n| 活动时间 | {{wrong:本周日下午 15:00}} |\n| 活动地点 | {{wrong:市中心联合办公空间 3 楼}} |\n| 茶歇预算 | {{wrong:约 800～1000 元（按 20 人估算）}} |',
      }),
    },
    {
      id: 'ask-no-attach',
      phase: 2,
      say: ['它交出来一张看起来很像样的表。<b>结合刚才的步骤停一秒——看出这份表最大的问题了吗？</b>'],
      buttons: [{ label: '标出问题在哪', primary: true }],
    },
    {
      id: 'open-mention',
      phase: 1,
      revealMarksOnEnter: true,
      navLabel: '点 @ 引用',
      onEnter: () => ({
        view: 'home',
        activeChat: null,
        showArtifacts: false,
        composerText: '帮我整理一下这份群聊记录，列出时间和预算。',
        mentionMenuOpen: false,
      }),
      say: [
        '看橙色标出来的：它<b>压根没读到你的群聊文件</b>，时间、地点、预算全靠猜着编出来的！',
        '现在回到首页，用 <b>@</b> 精准点名引用分组里的 <code>周末读书会群聊.txt</code>（点一下 <b>+</b> 号也能看看云端文件入口）：',
      ],
      wait: {
        target: 'composer.mention',
        callout: '点 @ 引用分组文件',
        label: '@ 引用文件',
      },
      onAction: () => ({ mentionMenuOpen: true, popover: null }),
    },
    {
      id: 'pick-chatlog',
      phase: 1,
      navLabel: '选群聊文件',
      say: ['看弹出列表：文件名起得清清楚楚（<code>周末读书会群聊.txt</code> 比 <code>文档1.txt</code> 好认得多）。点选它。'],
      wait: {
        target: 'mentionMenu.pickChatLog',
        callout: '选中这份群聊文件',
        label: '周末读书会群聊.txt',
      },
      onAction: () => ({
        mentionMenuOpen: false,
        composerText: MENTION_PROMPT,
      }),
    },
    {
      id: 'run-with-attach',
      phase: 2,
      navLabel: '发送',
      say: [],
      wait: {
        target: 'composer.send',
        callout: '带着 @ 引用再发一次',
        label: '发送（已 @ 引用）',
      },
      runChat: () => ({
        id: 'attach-ok',
        prompt: MENTION_PROMPT,
        chatTitle: '② 已 @ 引用 · 读书会整理',
        model: 'Hy4 flash',
        estimateText: '0.00',
        consumedText: '0.00',
        consumedDelta: 0,
        footerTip: '点左侧 最近 里的 ① 和 ② 可随时对比胡编与精准读取的区别',
        elapsed: '2s',
        steps: [
          { running: '正在读取 @周末读书会群聊.txt…', done: '已读取 周末读书会群聊.txt（6 条群聊发言）' },
        ],
        replyHtml:
          '已根据 <code>周末读书会群聊.txt</code> 原文提取：\n\n| 项目 | 原文信息 |\n| --- | --- |\n| 活动时间 | {{ok:周六下午 2 点}} |\n| 活动地点 | {{ok:静安寺青松咖啡二楼包间}} |\n| 茶歇预算 | {{ok:500 元以内（老陈负责，明天下午确认菜单）}} |',
      }),
    },
    {
      id: 'summary',
      phase: 3,
      say: [
        '这一遍时间、地点、500 块预算全对上了！记住两条习惯：<b>① 文件名起明白，别叫 文档1；② 资料在当前分组就用 @ 点名，在电脑别处或腾讯文档/ima/资料库就用 + 号添加</b>。',
      ],
      card: {
        kind: 'compare',
        title: '刚才两次真实输出对比',
        leftLabel: '① 没引用文件（实际输出）',
        leftTone: 'warn',
        leftHtml: '全靠猜：周日下午 15:00 / 市中心联合办公空间 / 预算 800～1000 元。',
        rightLabel: '② 用 @ 精准引用后（实际输出）',
        rightTone: 'ok',
        rightHtml: '严丝合缝：<b>周六下午 2 点 / 静安寺青松咖啡二楼包间 / 预算 500 元以内</b>。',
      },
      buttons: [
        { label: '下一节：2.2 模式：默认 / Plan / Ask →', primary: true, nextLesson: 'mode' },
        { label: '读本节图文教程', href: '/features/send-task/attach/' },
        { label: '重来一遍', restart: true },
      ],
    },
  ],
};
