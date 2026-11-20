import type { GuidedLessonDef } from '../guidedTypes';
import { createBaseGuidedState } from './baseState';

const PERSONALIZATION_TASK = '把 @周末读书会群聊.txt 整理成待办清单，列清楚负责人和截止时间。';

const BOZHOU_FIVE_RULES = [
  '回答直接说结论和做法，说人话，不要客套开场白和空洞总结。',
  '严禁编造数据、人名、日期或来源；我给的资料里没写明的，一律标注“未明确”。',
  '需求有歧义或缺少关键材料时，先列 2-3 个具体问题问我，确认后再动手。',
  '默认不要修改或覆盖我的原始文件，生成新文件输出；确实要改原文件时先征求我同意。',
  '排版干净克制，少用 emoji 和花哨符号。',
];

export const personalizationLesson: GuidedLessonDef = {
  id: 'personalization',
  code: '1.4',
  title: '个性化：指令',
  guideUrl: '/features/setup/personalization/',
  initialState: () =>
    createBaseGuidedState({
      selectedGroup: 'WorkBuddy-练习',
      selectedModel: 'Hy4 flash',
      composerText: PERSONALIZATION_TASK,
      rulesEditing: false,
      rulesFilled: false,
      rulesSaved: false,
      rulesList: [],
    }),
  steps: [
    {
      id: 'intro',
      phase: 0,
      say: [
        '「记忆与进化」是它自己边干活边学；而<b>「个性化 → 给 WorkBuddy 的指令」</b>是你提前立下的<b>死规矩</b>，每次对话必须无条件遵守。',
        '下面这份群聊记录故意没写全负责人和截止时间。咱们先在<b>没设指令</b>的状态下发一次，看它会不会瞎编。',
      ],
      card: {
        kind: 'doc',
        title: '周末读书会群聊.txt（原始材料）',
        badge: '缺负责人 / 缺截止日',
        badgeTone: 'warn',
        lines: [
          '周六下午 2 点读书会，场地借 3 楼会议室。',
          '签到表和茶歇谁顺手弄一下，回头群里说一声。',
          '分享 PPT 尽量提前一天发群里，具体谁汇总还没定。',
        ],
      },
      buttons: [{ label: '先不设指令发一次看看', primary: true }],
    },
    {
      id: 'run-before',
      phase: 1,
      say: ['点右下角蓝圈里的<b>发送</b>，看它在没有指令约束时会怎么答。'],
      wait: {
        target: 'composer.send',
        callout: '先不设指令发一次',
        label: '发送（未设指令）',
      },
      runChat: () => ({
        prompt: PERSONALIZATION_TASK,
        chatTitle: '读书会待办（无指令）',
        model: 'Hy4 flash',
        estimateText: '0.00',
        consumedText: '0.00',
        consumedDelta: 0,
        footerTip: '未配置全局指令，AI 容易为了交差自行补全缺失信息',
        elapsed: '2s',
        steps: [
          { running: '正在读取 周末读书会群聊.txt…', done: '已读取 3 条群聊记录' },
          { running: '正在整理待办清单…', done: '已生成待办清单' },
        ],
        replyHtml:
          '{{wrong:好的！非常高兴为您整理本次周末读书会的高效待办清单 ✨📚🎉 希望能助力活动圆满成功！}}\n\n1. 场地预订（3 楼会议室）— 负责人：{{wrong:张伟}}，截止：{{wrong:本周四 18:00}}\n2. 签到表与茶歇准备 — 负责人：{{wrong:李娜}}，截止：{{wrong:本周五 12:00}}\n3. 分享 PPT 汇总 — 负责人：{{wrong:王明}}，截止：{{wrong:周五 20:00}}\n\n{{wrong:以上就是为您精心整理的方案，预祝读书会收获满满！💡}}',
      }),
    },
    {
      id: 'open-avatar',
      phase: 1,
      say: [
        '看橙色标出来的翻车点：原文根本没写谁负责，它为了把表格填满，直接给你编了<b>张伟、李娜、王明</b>，前后还堆了一堆废话和 emoji。',
        '现在去设置里把泊舟的 <b>5 条红线指令</b>写进去。点左下角<b>头像</b>。',
      ],
      wait: {
        target: 'avatar',
        callout: '点头像进设置',
        label: '左下角头像',
      },
      onAction: () => ({ popover: 'avatar' }),
    },
    {
      id: 'open-settings',
      phase: 1,
      say: ['点<b>设置</b>。'],
      wait: {
        target: 'avatarMenu.settings',
        callout: '点这里进设置',
        label: '设置',
      },
      onAction: () => ({ popover: null, view: 'settings', settingsTab: 'general' }),
    },
    {
      id: 'open-personalization',
      phase: 1,
      say: ['在左侧「功能」分组里点<b>个性化</b>。'],
      wait: {
        target: 'settings.tab.personalization',
        callout: '切到个性化',
        label: '个性化',
      },
      onAction: () => ({ settingsTab: 'personalization' }),
    },
    {
      id: 'edit-rules',
      phase: 1,
      say: [
        '往下看有三个框：<b>给 WorkBuddy 的指令</b>、<b>人设设定</b>、<b>长期记忆</b>。别混填——行为红线专填在「给 WorkBuddy 的指令」里。',
        '点它的<b>编辑</b>按钮。',
      ],
      wait: {
        target: 'settings.editRules',
        callout: '点编辑写规矩',
        label: '编辑指令',
      },
      onAction: () => ({ rulesEditing: true }),
    },
    {
      id: 'fill-rules',
      phase: 1,
      say: [
        '网上两千字的“神级规则”千万别照抄——写太长容易互相打架还白费积分。<b>5 条短而具体的规矩就够了</b>。点按钮一键填入模板。',
      ],
      wait: {
        target: 'settings.fillRules',
        callout: '一键填入 5 条红线',
        label: '填入泊舟 5 条指令模板',
      },
      onAction: () => ({ rulesFilled: true, rulesList: BOZHOU_FIVE_RULES }),
    },
    {
      id: 'save-rules',
      phase: 1,
      say: ['瞄一眼第 2 条（严禁编造、没写明标“未明确”）和第 5 条（少用 emoji）。点<b>保存</b>让它全局生效。'],
      wait: {
        target: 'settings.saveRules',
        callout: '点保存生效',
        label: '保存指令',
      },
      onAction: () => ({ rulesEditing: false, rulesSaved: true }),
    },
    {
      id: 'back-home',
      phase: 1,
      say: ['亮起「已生效」了。点左上角<b>← 返回</b>，回去用一模一样的话重跑一次。'],
      wait: {
        target: 'settings.back',
        callout: '回去重跑同一句',
        label: '返回主界面',
      },
      onAction: () => ({
        view: 'home',
        activeChat: null,
        showArtifacts: false,
        composerText: PERSONALIZATION_TASK,
      }),
    },
    {
      id: 'run-after',
      phase: 2,
      say: ['一字不改，再点一次<b>发送</b>，看结果怎么变。'],
      wait: {
        target: 'composer.send',
        callout: '同一句再发一次',
        label: '发送（5 条指令已生效）',
      },
      runChat: () => ({
        prompt: PERSONALIZATION_TASK,
        chatTitle: '读书会待办（指令生效）',
        model: 'Hy4 flash',
        estimateText: '0.00',
        consumedText: '0.00',
        consumedDelta: 0,
        memoryBadge: '已生效：5 条全局指令',
        footerTip: '已按指令去除客套话，缺失字段如实标注「未明确」',
        elapsed: '2s',
        steps: [
          { running: '正在加载 5 条全局指令并读取群聊记录…', done: '已核对原文，未发现负责人与明确截止日' },
        ],
        replyHtml:
          '{{ok:结论：原群聊仅确定时间与场地，以下 3 项待办缺失信息已标为「未明确」：}}\n\n1. 场地预订（3 楼会议室）— 负责人：{{ok:未明确}}｜截止时间：周六 14:00 前\n2. 签到表与茶歇准备 — 负责人：{{ok:未明确}}｜截止时间：{{ok:未明确}}\n3. 分享 PPT 汇总 — 负责人：{{ok:未明确}}｜截止时间：周五（提前一天，具体时间未明确）\n\n需你确认：这 3 项分别指定给谁？确认后我可以直接生成群接龙版本。',
      }),
    },
    {
      id: 'summary',
      phase: 3,
      say: [
        '对比一下是不是天壤之别？没一句废话，没瞎编一个人名，还主动把缺项标出来问你。',
        '顺手记住「个性化」里三个框的分工，别混在一起填：',
      ],
      card: {
        kind: 'table',
        title: '个性化 3 个框的分工',
        headers: ['配置项', '管什么', '填什么例子'],
        rows: [
          ['给 WorkBuddy 的指令', '做事规矩（红线）', '先给结论、禁编造标「未明确」、不覆写原件'],
          ['人设设定', '它是谁、什么性格', '干脆利落的办公搭子，有话直说'],
          ['长期记忆', '你是谁、长期背景', '职业、受众、常用软件（固定个人资料）'],
        ],
      },
      buttons: [
        { label: '下一节：1.5 模型与积分 →', primary: true, nextLesson: 'models-credits' },
        { label: '读本节图文教程', href: '/features/setup/personalization/' },
        { label: '重来一遍', restart: true },
      ],
    },
  ],
};
