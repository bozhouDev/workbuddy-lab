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
        '<b>记忆与进化</b>是它自己边干活边学；而<b>个性化 → 给 WorkBuddy 的指令</b>是你提前立下的<b>死规矩</b>，每次对话必须无条件遵守。',
        '下面这份群聊记录故意没写全负责人和截止时间。先在<b>没设指令</b>的状态下发一次，看它会交出什么作业。',
      ],
      card: {
        kind: 'doc',
        title: '周末读书会群聊.txt（原始材料）',
        badge: '注意：没写负责人',
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
      onEnter: () => ({ view: 'home', popover: null, composerText: PERSONALIZATION_TASK }),
      say: ['点右下角蓝圈里的<b>发送</b>。'],
      wait: {
        target: 'composer.send',
        callout: '不设指令发一次',
        label: '发送（未设指令）',
      },
      runChat: () => ({
        id: 'rules-before',
        prompt: PERSONALIZATION_TASK,
        chatTitle: '① 无指令 · 读书会待办',
        model: 'Hy4 flash',
        estimateText: '0.00',
        consumedText: '0.00',
        consumedDelta: 0,
        footerTip: '未配置全局指令时的默认输出',
        elapsed: '2s',
        hideMarksInitially: true,
        steps: [
          { running: '正在读取 周末读书会群聊.txt…', done: '已读取 3 条群聊记录' },
          { running: '正在整理待办清单…', done: '已生成待办清单' },
        ],
        replyHtml:
          '{{wrong:好的！非常高兴为您整理本次周末读书会的高效待办清单 ✨📚🎉 希望能助力活动圆满成功！}}\n\n| 待办事项 | 负责人 | 截止时间 |\n| --- | --- | --- |\n| 场地预订（3 楼会议室） | {{wrong:张伟}} | {{wrong:本周四 18:00}} |\n| 签到表与茶歇准备 | {{wrong:李娜}} | {{wrong:本周五 12:00}} |\n| 分享 PPT 汇总 | {{wrong:王明}} | {{wrong:周五 20:00}} |\n\n{{wrong:以上就是为您精心整理的方案，预祝读书会收获满满！💡}}',
      }),
    },
    {
      id: 'ask-before',
      phase: 2,
      say: ['乍一看表格工工整整对吧？<b>对照刚才的原始群聊停一秒——看出哪里出大事了吗？</b>'],
      buttons: [{ label: '标出瞎编的地方', primary: true }],
    },
    {
      id: 'open-avatar',
      phase: 1,
      revealMarksOnEnter: true,
      navLabel: '头像',
      say: [
        '看橙色标出来的翻车点：原文压根没提负责人，它为了把表格填满，直接给你编了<b>张伟、李娜、王明</b>，前后还堆了一堆废话和 emoji。',
        '顺着下面路径进<b>个性化</b>，把泊舟的 <b>5 条红线指令</b>写进去：',
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
      navLabel: '设置',
      say: [],
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
      navLabel: '个性化',
      say: [],
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
      navLabel: '编辑',
      say: [
        '页面下面有 3 个框：<b>给 WorkBuddy 的指令 / 人设设定 / 长期记忆</b>。别混填——做事红线专写进<b>给 WorkBuddy 的指令</b>。',
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
      navLabel: '填 5 条模板',
      say: ['网上两千字的“神级规则”别照抄，太长容易打架还费积分——<b>5 条短红线就够</b>。'],
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
      navLabel: '保存',
      say: [],
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
      navLabel: '返回',
      say: [],
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
      say: ['一字不改，再点一次<b>发送</b>，看设完 5 条指令后的输出。'],
      wait: {
        target: 'composer.send',
        callout: '同一句再发一次',
        label: '发送（5 条指令已生效）',
      },
      runChat: () => ({
        id: 'rules-after',
        prompt: PERSONALIZATION_TASK,
        chatTitle: '② 5 条指令 · 读书会待办',
        model: 'Hy4 flash',
        estimateText: '0.00',
        consumedText: '0.00',
        consumedDelta: 0,
        memoryBadge: '已生效：5 条全局指令',
        footerTip: '点左侧 最近 里的 ① 和 ② 可随时切换对比',
        elapsed: '2s',
        steps: [
          { running: '正在加载 5 条全局指令并读取群聊记录…', done: '已核对原文，未发现负责人与明确截止日' },
        ],
        replyHtml:
          '{{ok:结论：原群聊仅确定时间与场地，缺失信息均标为 未明确：}}\n\n| 待办事项 | 负责人 | 截止时间 |\n| --- | --- | --- |\n| 场地预订（3 楼会议室） | {{ok:未明确}} | 周六 14:00 前 |\n| 签到表与茶歇准备 | {{ok:未明确}} | {{ok:未明确}} |\n| 分享 PPT 汇总 | {{ok:未明确}} | 周五（具体时间未明确） |\n\n需你确认：这 3 项分别指定给谁？确认后我再帮你生成群接龙版本。',
      }),
    },
    {
      id: 'summary',
      phase: 3,
      say: [
        '高下立判：零废话、零瞎编，还主动把缺项标出来问你（点左侧<b>最近</b>里的 ① 和 ② 可以随时翻看完整前后对比）。',
      ],
      card: {
        kind: 'compare',
        title: '刚才两次真实输出对比',
        leftLabel: '① 没写指令（实际输出）',
        leftTone: 'warn',
        leftHtml: '堆满 ✨📚🎉 客套话，并凭空编造负责人：<b>张伟 / 李娜 / 王明</b>。',
        rightLabel: '② 写入 5 条红线后（实际输出）',
        rightTone: 'ok',
        rightHtml: '直接给表格，缺失负责人全部如实标为 <b>未明确</b>，并追问你要指定给谁。',
      },
      after: ['顺手记牢个性化 3 个框的分工：<b>指令管做事红线</b>、<b>人设管说话性格</b>、<b>长期记忆写你的固定背景（职业/受众/常用软件）</b>。'],
      buttons: [
        { label: '下一节：1.5 模型与积分 →', primary: true, nextLesson: 'models-credits' },
        { label: '读本节图文教程', href: '/features/setup/personalization/' },
        { label: '重来一遍', restart: true },
      ],
    },
  ],
};
