import type { GuidedLessonDef } from '../guidedTypes';
import { createBaseGuidedState } from './baseState';

const MODE_TASK = '帮我把分组里的 季度复盘原稿.md 精简整理一下，去掉冗余内容。';

export const modeLesson: GuidedLessonDef = {
  id: 'mode',
  code: '2.2',
  title: '模式：默认 / Plan / Ask',
  guideUrl: '/features/send-task/mode/',
  initialState: () =>
    createBaseGuidedState({
      selectedGroup: 'WorkBuddy-练习',
      selectedModel: 'Hy4 flash',
      planOn: false,
      askOn: false,
      composerText: MODE_TASK,
    }),
  steps: [
    {
      id: 'intro',
      phase: 0,
      say: [
        '输入框左下角 <b>+ → 模式</b> 里藏着两个关键开关：<b>计划（Plan）</b> 和 <b>仅问答（Ask）</b>，都不开就是<b>默认模式</b>。',
        '它们只解决一件事：<b>你是想让它直接动手改文件，还是先列方案等你拍板？</b>先看看需求还模糊就用默认模式会发生什么。',
      ],
      buttons: [{ label: '先看 默认模式 直接跑会怎样', primary: true }],
    },
    {
      id: 'run-default',
      phase: 1,
      onEnter: () => ({
        view: 'home',
        popover: null,
        planOn: false,
        askOn: false,
        composerText: MODE_TASK,
      }),
      say: ['现在是<b>默认模式</b>（两个开关都没开）。点<b>发送</b>，看它会怎么动你的原稿。'],
      wait: {
        target: 'composer.send',
        callout: '默认模式直接发',
        label: '发送（默认模式）',
      },
      runChat: () => ({
        id: 'mode-default',
        prompt: MODE_TASK,
        chatTitle: '① 默认模式 · 直接改原稿',
        model: 'Hy4 flash',
        estimateText: '0.00',
        consumedText: '0.00',
        consumedDelta: 0,
        footerTip: '默认模式拿到任务直接动手写文件',
        elapsed: '2s',
        hideMarksInitially: true,
        steps: [
          { running: '正在读取 季度复盘原稿.md…', done: '已读取 季度复盘原稿.md（2,480 字）' },
          { running: '正在直接覆写 季度复盘原稿.md…', done: '已直接覆盖保存 季度复盘原稿.md（删减 1,620 字）' },
        ],
        replyHtml:
          '已完成精简整理，并{{wrong:直接覆盖更新了 季度复盘原稿.md}}（原有 6 段客户案例和完整数据明细已一并删除，当前保留 860 字摘要）。',
        fileCard: {
          name: '季度复盘原稿.md（已被覆盖）',
          meta: '原稿 2,480 字 → 860 字 · 客户案例与数据明细已删',
          warn: true,
        },
      }),
    },
    {
      id: 'ask-default-problem',
      phase: 2,
      say: ['它两秒钟就干完了，非常积极——<b>停一秒看结果，看出哪里要命了吗？</b>'],
      buttons: [{ label: '标出问题在哪', primary: true }],
    },
    {
      id: 'open-plus',
      phase: 1,
      revealMarksOnEnter: true,
      navLabel: '点 + 号',
      onEnter: () => ({
        view: 'home',
        activeChat: null,
        showArtifacts: false,
        planOn: false,
        askOn: false,
        composerText: MODE_TASK,
      }),
      say: [
        '需求只说了 <b>精简一下</b>，在默认模式下它二话不说<b>直接把你的原稿覆盖了</b>，还顺手删掉了客户案例！',
        '复杂或拿不准的活，先开 <b>计划（Plan）</b> 模式。顺着下面路径打开它：',
      ],
      wait: {
        target: 'composer.plus',
        callout: '点左下角 + 切模式',
        label: '+ 菜单',
      },
      onAction: () => ({ popover: 'plus' }),
    },
    {
      id: 'toggle-plan',
      phase: 1,
      navLabel: '开启 Plan',
      say: ['右边二级面板里有两个开关：<b>计划（Plan）</b> 和 <b>仅问答（Ask）</b>。点开<b>计划（Plan）</b>。'],
      wait: {
        target: 'plusMenu.togglePlan',
        callout: '打开计划 Plan 模式',
        label: '计划（Plan）开关',
      },
      onAction: () => ({ planOn: true, askOn: false, popover: null }),
    },
    {
      id: 'run-plan',
      phase: 2,
      navLabel: '发送',
      say: ['输入框已经亮起蓝色的 <b>计划 Plan</b> 标签。同一句话再点<b>发送</b>，看它这次怎么做。'],
      wait: {
        target: 'composer.send',
        callout: 'Plan 模式下发送',
        label: '发送（Plan 模式）',
      },
      runChat: () => ({
        id: 'mode-plan-draft',
        prompt: MODE_TASK,
        chatTitle: '② Plan 模式 · 先出方案',
        model: 'Hy4 flash',
        estimateText: '0.00',
        consumedText: '0.00',
        consumedDelta: 0,
        memoryBadge: '计划 Plan · 等待确认',
        footerTip: 'Plan 模式不会先动原文件，你可以改掉不满意的步骤再执行',
        elapsed: '2s',
        steps: [
          { running: 'Plan 模式：仅读取分析 季度复盘原稿.md…', done: '已分析原稿结构，尚未修改任何文件' },
        ],
        replyHtml:
          '我先拟了 3 步精简方案，<b>目前还没动你的文件</b>，请确认：\n\n1. 保留核心结论与全部客户数据表；\n2. 压缩重复背景描述（约精简 35%）；\n3. 覆盖保存原文件 <code>季度复盘原稿.md</code>。\n\n如果有哪一步不想让我做，直接告诉我调整后再动手。',
        planConfirmLabel: '把第 3 步改成 另存为副本 并确认执行',
      }),
    },
    {
      id: 'confirm-plan',
      phase: 2,
      say: [
        '<b>用好 Plan 模式的关键就在这一拍</b>：别闭眼点同意！你看第 3 步它原本想覆盖原文件，我们当场把第 3 步改成<b>另存为新副本</b>，再点确认执行。',
      ],
      wait: {
        target: 'chat.confirmPlan',
        callout: '改完第 3 步再执行',
        label: '改第 3 步并确认执行',
      },
      runChat: () => ({
        id: 'mode-plan-done',
        prompt: '同意第 1、2 步，但第 3 步不要覆盖原文件，另存为 季度复盘精简版.md，开始执行。',
        chatTitle: '③ Plan 执行 · 另存副本',
        model: 'Hy4 flash',
        estimateText: '0.00',
        consumedText: '0.00',
        consumedDelta: 0,
        memoryBadge: '已按修改后的方案执行',
        footerTip: '点左侧 最近 可对比 ① 直接覆盖 与 ③ 安全另存副本',
        elapsed: '2s',
        steps: [
          { running: '按确认方案精简内容并保留客户数据…', done: '已保留全部数据明细，精简重复背景 35%' },
          { running: '另存为 季度复盘精简版.md…', done: '已生成副本 季度复盘精简版.md，原稿完好无损' },
        ],
        replyHtml:
          '已按你的要求执行完毕：{{ok:季度复盘原稿.md 完好保留未修改}}，精简稿已另存为 {{ok:季度复盘精简版.md}}。',
        fileCard: {
          name: '季度复盘精简版.md',
          meta: '新建副本 · 保留全部客户数据 · 原稿未动',
        },
        artifact: {
          file: '季度复盘精简版.md',
          pathLabel: 'WorkBuddy-练习/季度复盘精简版.md',
          badge: '新建副本',
          badgeTone: 'ok',
          title: '季度复盘精简版',
          lines: [
            { text: '✓ 原稿 季度复盘原稿.md 保持未修改', tone: 'ok' },
            { text: '1. 核心结论：Q3 目标达成率 114%，获客成本降 18%' },
            { text: '2. 客户案例与数据明细：已完整保留 6 组核心样本' },
          ],
        },
      }),
    },
    {
      id: 'summary',
      phase: 3,
      say: [
        '另外避一个常见乌龙：如果你开了 <b>仅问答（Ask）</b> 让它帮我生成文件，它只会用文字教你怎么做、<b>绝不会动手写文件</b>——想让它干活记得关掉 Ask。',
      ],
      card: {
        kind: 'table',
        title: '三种模式一眼分清',
        headers: ['模式', '会干什么', '什么时候用'],
        rows: [
          ['默认', '直接读写文件动手干', '需求很明确、不怕改错的小活'],
          ['计划 Plan', '先列方案，你改完确认再干', '任务复杂、需求模糊、怕动原文件'],
          ['仅问答 Ask', '只看只答，绝不改任何文件', '聊思路、头脑风暴、先读文档提问'],
        ],
      },
      buttons: [
        { label: '下一节：2.3 权限与审批弹窗 →', primary: true, nextLesson: 'permission' },
        { label: '读本节图文教程', href: '/features/send-task/mode/' },
        { label: '重来一遍', restart: true },
      ],
    },
  ],
};
