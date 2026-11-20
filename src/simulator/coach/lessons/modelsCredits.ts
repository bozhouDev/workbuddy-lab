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
        'WorkBuddy 里模型就是大脑，不同档位<b>倍率差好几倍</b>。而且 5.11.3 里你发的<b>每一句回复</b>都会明明白白显示：抬头报<code>预计消耗 ✧</code>，干完底部结算<code>已消耗 ✧</code>。',
        '现在输入框右下角正挂着 <b>极致（1.00x）</b>，左下角积分余额是 <b>1200.00</b>。咱们先用它跑个 300 字简单活，看一眼扣多少。',
      ],
      buttons: [{ label: '用极致档跑一次看扣多少', primary: true }],
    },
    {
      id: 'run-heavy',
      phase: 1,
      say: ['点右下角蓝圈里的<b>发送</b>，盯紧回复抬头和底部的积分数字。'],
      wait: {
        target: 'composer.send',
        callout: '用极致档 1.00x 发送',
        label: '发送（极致 1.00x）',
      },
      runChat: () => ({
        prompt: CREDITS_TASK,
        chatTitle: '碰头会整理（极致 1.00x）',
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
          '核心结论：\n1. 下周优先交付开局设置 5 节互动路线；\n2. 能力扩展与自动化图文已定稿，同步上线；\n3. 首页入口按「功能篇 23 节」统一归类。\n\n下周行动项：\n- 完成发任务篇 7 节模拟器脚本与自测。',
      }),
    },
    {
      id: 'see-cost',
      phase: 2,
      say: [
        '看到了吧！抬头先报了 <code>预计消耗 ✧ 0.8 ~ 12.50</code>，干完底部直接亮出橙色 <b><code>已消耗 ✧ 8.64</code></b>，左下角余额一下掉到 <b>1191.36</b>。',
        '就整理一段 300 字会议记录，拿 1.00x 极致档杀鸡用牛刀，太烧积分了。回首页换个模型再跑同一句。',
      ],
      buttons: [{ label: '回首页换免费模型对比', primary: true }],
    },
    {
      id: 'open-model',
      phase: 1,
      onEnter: () => ({
        view: 'home',
        activeChat: null,
        showArtifacts: false,
        composerText: CREDITS_TASK,
      }),
      say: ['点输入框右下角蓝圈里的<b>极致</b>，把模型档位和倍率表展开。'],
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
      say: [
        '看里面的数字：<b>快速 0.15x / 均衡 0.50x / 极致 1.00x</b>，还有标着绿色<b>限时免费 0.00x</b>的 <b>Hy4 flash</b>。',
        '这种简单文本整理选 <b>Hy4 flash（限时免费 0.00x）</b>就够了，点它。',
      ],
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
      say: ['已经切到 <b>Hy4 flash</b> 了。同一句再点一次<b>发送</b>，看底部结算行和余额变化。'],
      wait: {
        target: 'composer.send',
        callout: '用限时免费再跑一次',
        label: '发送（Hy4 flash 0.00x）',
      },
      runChat: () => ({
        prompt: CREDITS_TASK,
        chatTitle: '碰头会整理（限时免费 0.00x）',
        model: 'Hy4 flash（限时免费 0.00x）',
        estimateText: '0.00',
        consumedText: '0.00',
        consumedDelta: 0,
        footerTip: 'Hy4 flash 当前限时免费，本次不扣积分（活动以客户端实时显示为准）',
        elapsed: '2s',
        steps: [
          { running: '正在调用 Hy4 flash（限时免费 0.00x）…', done: '已完成 300 字记录结构化提炼' },
        ],
        replyHtml:
          '{{ok:核心结论：}}\n1. 下周优先交付开局设置 5 节互动路线；\n2. 能力扩展与自动化图文已定稿，同步上线；\n3. 首页入口按「功能篇 23 节」统一归类。\n\n{{ok:下周行动项：}}\n- 完成发任务篇 7 节模拟器脚本与自测。',
      }),
    },
    {
      id: 'summary',
      phase: 3,
      say: [
        '结果一模一样，底部绿牌 <b><code>已消耗 ✧ 0.00</code></b>，左下角余额稳稳停在 <b>1191.36</b> 一分没扣！',
        '平时领免费积分看左下角头像里的 <b>Buddy加油站 / 去邀约 / 成长计划</b>；查每笔明细去<b>设置 → 套餐与积分</b>。记住下面 3 个省积分习惯：',
      ],
      card: {
        kind: 'credits',
        title: '同一个 300 字任务 · 模型消耗对比',
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
            note: '练手与简单活首选（以客户端当前显示为准）',
            highlight: 'ok',
          },
        ],
      },
      after: [
        '最后送你 3 个立竿见影的省积分习惯：<b>① 按任务轻重选档位；② 换一件新事就点「新建任务」（长对话每次都要重读历史更费积分）；③ 需求没想清楚先切「仅问答 Ask」聊思路再动手。</b>',
      ],
      buttons: [
        { label: '读「模型与积分」完整图文', primary: true, href: '/features/setup/models-credits/' },
        { label: '回到 0.4 认识界面', nextLesson: 'interface' },
        { label: '重来一遍', restart: true },
      ],
    },
  ],
};
