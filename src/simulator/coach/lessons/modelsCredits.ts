import type { GuidedLessonDef } from '../guidedTypes';
import { createBaseGuidedState } from './baseState';

const CREDITS_TASK = '把这段 300 字项目碰头会记录整理成 3 条核心结论和下周行动项。';

export const modelsCreditsLesson: GuidedLessonDef = {
  id: 'models-credits',
  code: '1.5',
  title: '模型与积分',
  guideUrl: '/features/setup/models-credits/',
  initialState: () =>
    createBaseGuidedState({
      selectedGroup: 'WorkBuddy-练习',
      selectedModel: '极致',
      creditBalance: 1200,
      composerText: CREDITS_TASK,
    }),
  steps: [
    {
      id: 'intro',
      phase: 0,
      say: [
        'WorkBuddy 里模型就是大脑，不同档位<b>积分倍率差好几倍</b>。5.11.3 里你发的<b>每一句回复</b>都会明明白白显示：抬头报 <code>预计消耗 ✧</code>，干完底部结算 <code>已消耗 ✧</code>。',
        '现在右下角正挂着 <b>极致（1.00x）</b>，左下角余额 <b>1200.00</b>。咱们先用它跑个 300 字简单活，看一眼扣多少。',
      ],
      buttons: [{ label: '用极致档跑一次看扣多少', primary: true }],
    },
    {
      id: 'run-heavy',
      phase: 1,
      onEnter: () => ({ view: 'home', popover: null, composerText: CREDITS_TASK }),
      say: ['点右下角蓝圈里的<b>发送</b>，盯紧回复抬头、底部结算行和左下角余额。'],
      wait: {
        target: 'composer.send',
        callout: '用极致档 1.00x 发送',
        label: '发送（极致 1.00x）',
      },
      runChat: () => ({
        id: 'credits-heavy',
        prompt: CREDITS_TASK,
        chatTitle: '① 极致 1.00x · 碰头会整理',
        model: '极致（1.00x）',
        estimateText: '0.8 ~ 12.50',
        consumedText: '8.64',
        consumedDelta: 8.64,
        footerTip: '简单文本整理可选快速档（0.15x）或限时免费模型，更省积分',
        elapsed: '4s',
        steps: [
          { running: '正在调用极致档模型（1.00x 倍率）…', done: '已完成 300 字记录结构化提炼' },
        ],
        replyHtml:
          '核心结论：\n1. 下周优先交付开局设置 5 节互动路线；\n2. 能力扩展与自动化图文已定稿，同步上线；\n3. 首页入口按功能篇 23 节统一归类。\n\n下周行动项：\n- 完成发任务篇 7 节模拟器脚本与自测。',
      }),
    },
    {
      id: 'see-cost',
      phase: 2,
      say: [
        '看到了吗？抬头先报了 <code>预计消耗 ✧ 0.8 ~ 12.50</code>，干完底部直接亮出橙色 <b><code>已消耗 ✧ 8.64</code></b>，左下角余额一下掉到 <b>1191.36</b>。',
        '才 300 字的简单整理，拿 1.00x 极致档杀鸡用牛刀太烧积分了。回首页换免费模型再跑同一句对比。',
      ],
      buttons: [{ label: '回首页换免费模型对比', primary: true }],
    },
    {
      id: 'open-model',
      phase: 1,
      navLabel: '选模型',
      onEnter: () => ({
        view: 'home',
        activeChat: null,
        showArtifacts: false,
        composerText: CREDITS_TASK,
      }),
      say: ['点输入框右下角切到限时免费模型，再跑同一句：'],
      wait: {
        target: 'composer.model',
        callout: '点这里切模型',
        label: '模型选择',
      },
      onAction: () => ({ popover: 'model' }),
    },
    {
      id: 'pick-free',
      phase: 1,
      navLabel: 'Hy4 flash',
      say: [],
      wait: {
        target: 'modelMenu.pickFree',
        callout: '选限时免费 0.00x',
        label: 'Hy4 flash（限时免费）',
      },
      onAction: () => ({ selectedModel: 'Hy4 flash', popover: null }),
    },
    {
      id: 'run-free',
      phase: 2,
      navLabel: '发送',
      say: [],
      wait: {
        target: 'composer.send',
        callout: '用限时免费再跑一次',
        label: '发送（Hy4 flash 0.00x）',
      },
      runChat: () => ({
        id: 'credits-free',
        prompt: CREDITS_TASK,
        chatTitle: '② Hy4 flash 0.00x · 碰头会整理',
        model: 'Hy4 flash（限时免费 0.00x）',
        estimateText: '0.00',
        consumedText: '0.00',
        consumedDelta: 0,
        footerTip: '点左侧 最近 里的 ① 和 ② 可随时对比两次消耗与回复质量',
        elapsed: '2s',
        steps: [
          { running: '正在调用 Hy4 flash（限时免费 0.00x）…', done: '已完成 300 字记录结构化提炼' },
        ],
        replyHtml:
          '核心结论：\n1. 下周优先交付开局设置 5 节互动路线；\n2. 能力扩展与自动化图文已定稿，同步上线；\n3. 首页入口按功能篇 23 节统一归类。\n\n下周行动项：\n- 完成发任务篇 7 节模拟器脚本与自测。',
      }),
    },
    {
      id: 'summary',
      phase: 3,
      say: [
        '回复质量一模一样，底部绿牌 <b><code>已消耗 ✧ 0.00</code></b>，左下角余额稳稳停在 <b>1191.36</b> 一分没扣！（左侧<b>最近</b>里保留了 ① 和 ②，可随时点回去对比。）',
      ],
      card: {
        kind: 'credits',
        title: '同一个 300 字任务 · 刚才实测消耗对比',
        rows: [
          {
            model: '极致（自动档）',
            rate: '1.00x',
            cost: '已消耗 ✧ 8.64',
            note: '留给复杂代码、大方案、长链路分析',
            highlight: 'warn',
          },
          {
            model: '均衡（自动档）',
            rate: '0.50x',
            cost: '约 ✧ 4.30',
            note: '常规多文件处理、中等难度任务',
          },
          {
            model: '快速（自动档）',
            rate: '0.15x',
            cost: '约 ✧ 1.30',
            note: '日常改写、简单整理、快问快答',
          },
          {
            model: 'Hy4 flash（限时免费）',
            rate: '0.00x',
            cost: '已消耗 ✧ 0.00',
            note: '练手与简单活首选（以客户端实时显示为准）',
            highlight: 'ok',
          },
        ],
      },
      after: [
        '领免费额度点左下角头像里的 <b>Buddy加油站 / 去邀约 / 成长计划</b>；查每笔明细去<b>设置 → 套餐与积分</b>。',
        '记住 3 个省积分习惯：<b>① 按任务轻重选档位；② 换新事就点 新建任务（长对话每次重读历史更费积分）；③ 需求模糊先用 仅问答 Ask 聊思路再动手。</b>',
      ],
      buttons: [
        { label: '下一章：2.1 添加资料：+ 和 @ →', primary: true, nextLesson: 'attach' },
        { label: '读 模型与积分 完整图文', href: '/features/setup/models-credits/' },
        { label: '重来一遍', restart: true },
      ],
    },
  ],
};
