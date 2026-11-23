import type { GuidedLessonDef } from '../guidedTypes';
import { createBaseGuidedState } from './baseState';
import { freeChat } from './freeChat';

const ASK_PROMPT = '我们公司出差住宿的报销标准是多少？';
/** 做对：问的同时要求注明出处和版本（文件从 + → 添加文件 → 资料库 里选） */
const GOOD_PROMPT = '我们公司出差住宿的报销标准是多少？请注明出自哪份文件、哪个版本。';
/** 资料库里那份现行版制度 */
const POLICY_FILE = '差旅管理办法_2026版.pdf';

export const libraryLesson: GuidedLessonDef = {
  id: 'library',
  code: '3.8',
  title: '资料库',
  guideUrl: '/features/extend/library/',
  initialState: () =>
    createBaseGuidedState({
      selectedGroup: 'WorkBuddy-练习',
      selectedModel: 'Hy4 flash',
      composerText: ASK_PROMPT,
    }),
  steps: [
    {
      id: 'intro',
      phase: 0,
      say: [
        '资料库是你给 AI 准备的<b>长期资料柜</b>：分组里的文件只在这个分组用，资料库里的东西所有任务都能调。',
        '很多人一上来就把收藏夹几百篇文章全倒进去。先看看这样会怎样：假设资料库里堆了 312 份文件，新旧都有。',
      ],
      buttons: [{ label: '看看堆满了会怎样', primary: true }],
    },
    {
      id: 'run-messy',
      phase: 1,
      onEnter: () => ({ view: 'home', composerText: ASK_PROMPT }),
      say: ['问一个公司制度的问题。'],
      wait: { target: 'composer.send', callout: '直接问', label: '发送（资料库堆满）' },
      runChat: () =>
        freeChat({
          id: 'library-messy',
          prompt: ASK_PROMPT,
          chatTitle: '① 资料库乱堆 · 报销标准',
          footerTip: '资料库乱堆时的回答，可在左侧 最近 里回看',
          elapsed: '11s',
          hideMarksInitially: true,
          steps: [{ running: '检索资料库（312 份）…', done: '命中 9 份相关文件，取相关度最高的 1 份' }],
          replyHtml:
            '根据资料库中的《{{wrong:差旅管理办法_2023.pdf}}》：一线城市住宿{{wrong:每晚不超过 450 元}}，其他城市每晚不超过 350 元。',
        }),
    },
    {
      id: 'ask-messy',
      phase: 2,
      say: ['有出处、有数字，看着挺靠谱。<b>看看文件名，问题在哪？</b>'],
      buttons: [{ label: '标出问题', primary: true }],
    },
    {
      id: 'open-library',
      phase: 1,
      revealMarksOnEnter: true,
      navLabel: '资料库',
      say: [
        '它引用的是 <b>2023 年的旧版</b>，今年早就改成 600 元了。资料库里新旧版本混在一起，它分不清哪份作废了。<b>资料库不是越多越好，是越干净越好。</b>',
        '去资料库从头整理。',
      ],
      wait: { target: 'nav.library', callout: '点资料库', label: '资料库' },
      onAction: () => ({ view: 'library' }),
    },
    {
      id: 'new-category',
      phase: 1,
      navLabel: '建分类',
      say: [
        '左边一列：<b>新建、最近、本地产物</b>（AI 做出来的文件汇总在这）、<b>我的资料</b>（你自己的）、<b>团队空间</b>（和同事共享的）。',
        '在「我的资料」旁边点 +，按<b>用途</b>建分类，别按日期建。',
      ],
      wait: { target: 'library.newCategory', callout: '点 + 建分类', label: '新建分类' },
      onAction: () => ({ libraryCategories: ['当前项目', '制度规范', '往期范例'] }),
    },
    {
      id: 'upload',
      phase: 1,
      navLabel: '放资料',
      say: [
        '建好三个分类：<b>当前项目</b>（这阵子在做的）、<b>制度规范</b>（公司规定，只放现行版）、<b>往期范例</b>（做得好的旧作业，给它照着学）。',
        '点「当前项目」旁边的「上传」，模拟器会一次把三份文件放进对应分类。',
      ],
      wait: { target: 'library.upload', callout: '放资料进去', label: '上传' },
      onAction: () => ({
        libraryFiles: [
          { name: '读书会_12月活动预算.xlsx', category: '当前项目' },
          { name: '差旅管理办法_2026版.pdf', category: '制度规范' },
          { name: '周末读书会_筹备纪要.md', category: '往期范例' },
        ],
      }),
    },
    {
      id: 'good-plus',
      phase: 2,
      onEnter: () => ({
        view: 'home',
        composerText: GOOD_PROMPT,
        composerChips: [],
        popover: null,
        plusSubmenu: 'mode',
      }),
      say: [
        '每个分类只放<b>现在要用的、现行有效的</b>，作废的旧版直接删。',
        '这次不让它自己在资料库里翻，<b>亲手把那份制度交给这次任务</b>：点输入框左下角的 +。',
      ],
      wait: { target: 'composer.plus', callout: '点 +', label: '+' },
      onAction: () => ({ popover: 'plus', plusSubmenu: 'mode' }),
    },
    {
      id: 'good-add-file',
      phase: 2,
      navLabel: '添加文件',
      say: [],
      wait: { target: 'plusMenu.addFile', callout: '点添加文件', label: '添加文件' },
      onAction: () => ({ plusSubmenu: 'files' }),
    },
    {
      id: 'good-library',
      phase: 2,
      navLabel: '资料库',
      say: ['右边能选的地方不少：本地文件、资料库，还有腾讯文档、ima、乐享知识库这些云端资料。选<b>资料库</b>。'],
      wait: { target: 'plusMenu.library', callout: '选资料库', label: '资料库' },
      onAction: () => ({ popover: null, plusSubmenu: 'mode', libraryPickerOpen: true, libraryPickerSelected: [] }),
    },
    {
      id: 'good-pick',
      phase: 2,
      navLabel: '勾选 2026 版',
      say: ['「从资料库中选择」：位置一栏写着在哪个分类。勾上<b>制度规范</b>里的 2026 版，文件名带着版本，选的是哪份你自己看得见。'],
      wait: { target: 'libraryPicker.pick', callout: '勾选 2026 版', label: POLICY_FILE },
      onAction: () => ({ libraryPickerSelected: [POLICY_FILE] }),
    },
    {
      id: 'good-confirm',
      phase: 2,
      navLabel: '确定',
      say: [],
      wait: { target: 'libraryPicker.confirm', callout: '点确定', label: '确定' },
      onAction: () => ({ libraryPickerOpen: false, composerChips: [{ kind: 'file', label: POLICY_FILE }] }),
    },
    {
      id: 'run-good',
      phase: 2,
      say: ['文件挂到输入框上了。问题里我还加了一句「<b>注明出自哪份文件、哪个版本</b>」，有出处你才能核对。发送。'],
      wait: { target: 'composer.send', callout: '带着文件再问', label: '发送（选了 2026 版）' },
      onAction: () => ({ composerChips: [] }),
      runChat: () =>
        freeChat({
          id: 'library-good',
          prompt: GOOD_PROMPT,
          promptChips: [{ kind: 'file', label: POLICY_FILE }],
          chatTitle: '② 选了现行版 · 报销标准',
          footerTip: '在左侧 最近 里点 ① 和 ② 对比',
          elapsed: '6s',
          steps: [{ running: `读取 ${POLICY_FILE}…`, done: `已读取 ${POLICY_FILE}` }],
          replyHtml:
            '出自《{{ok:差旅管理办法_2026版.pdf}}》第 4 条（2026-03-01 起执行）：一线城市住宿{{ok:每晚不超过 600 元}}，其他城市每晚不超过 450 元。',
        }),
    },
    {
      id: 'summary',
      phase: 3,
      say: ['资料干净了，它引用的就是对的那份，还告诉你是哪一条、哪天起执行。'],
      card: {
        kind: 'table',
        title: '资料库建库 4 条',
        headers: ['规矩', '为什么'],
        rows: [
          ['按用途建分类，不按日期', '找资料时你想的是「这是干嘛用的」'],
          ['只放现行版，旧版直接删', '新旧混放它分不清，会引用作废的'],
          ['文件名带版本或日期', '差旅管理办法_2026版 比 新建文档(3) 好认'],
          ['用 + → 添加文件 → 资料库 选文件，并要求注明出处', '选的是哪份自己看得见，有出处你才能核对'],
        ],
      },
      after: ['资料多了以后，可以让它「给资料库生成一份索引清单：标题、一句话摘要、适用场景」，自己隔段时间翻一遍删旧的。'],
      buttons: [
        { label: '下一章：4.1 定时任务 →', primary: true, nextLesson: 'schedule' },
        { label: '读本节图文教程', href: '/features/extend/library/' },
        { label: '重来一遍', restart: true },
      ],
    },
  ],
};
