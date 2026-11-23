import type { ChatRunSpec, GuidedLessonDef } from '../guidedTypes';
import { createBaseGuidedState } from './baseState';

const V1_CHAT: ChatRunSpec = {
  id: 'revise-v1',
  prompt: '@周末读书会群聊.txt 整理成《周末读书会筹备纪要.md》',
  chatTitle: '初稿 · 周末读书会筹备纪要',
  model: 'Hy4 flash',
  estimateText: '0.00',
  consumedText: '0.00',
  consumedDelta: 0,
  footerTip: '第一版结构 4 个板块都很满意，只有待办表格顺序偏乱',
  elapsed: '2s',
  steps: [{ running: '生成初稿…', done: '已写入 周末读书会筹备纪要.md（4 个板块）' }],
  replyHtml: '已生成初稿《周末读书会筹备纪要.md》，包含：一、活动信息；二、已定事项；三、待办表格；四、待确认问题。',
  artifact: {
    file: '周末读书会筹备纪要.md',
    pathLabel: 'WorkBuddy-练习/周末读书会筹备纪要.md',
    badge: 'v1 初稿',
    badgeTone: 'ok',
    title: '周末读书会筹备纪要（v1）',
    lines: [
      { text: '一、活动信息：周六 14:00 · 静安寺青松咖啡二楼包间' },
      { text: '二、已定事项：场地已订、茶歇预算 500 元以内' },
      { text: '三、待办表格：PPT（周四）｜海报（今晚）｜拍照（未明确）｜桌签（周五）' },
      { text: '四、待确认问题：印桌签与拍照负责人待认领' },
    ],
  },
};

const BAD_REVISE_PROMPT = '表格看着太乱了，帮我重做一版。';
const GOOD_REVISE_PROMPT =
  '保留现有的四个板块和文字不要大改，只调待办表格：1. 按截止时间从近到远排序，没写时间的放最后；2. 所有“未明确”加粗；3. 直接更新原文件，别新建第二个文件。';

export const reviseLesson: GuidedLessonDef = {
  id: 'revise',
  code: '2.7',
  title: '二次修改',
  guideUrl: '/features/send-task/revise/',
  initialState: () =>
    createBaseGuidedState({
      selectedGroup: 'WorkBuddy-练习',
      selectedModel: 'Hy4 flash',
      view: 'chat',
      activeChat: V1_CHAT,
      chatHistory: [V1_CHAT],
      chatPhase: 'done',
      streamedCharCount: V1_CHAT.replyHtml.length,
      marksRevealed: true,
      showArtifacts: true,
      followupText: BAD_REVISE_PROMPT,
    }),
  steps: [
    {
      id: 'intro',
      phase: 0,
      say: [
        '第一版纪要通常只是初稿：4 个板块写得挺好，就是待办表格没按时间排序。',
        '注意两条原则：<b>① 就在当前原对话里改，别开新任务</b>；<b>② 千万别只说一句 太乱了，重做一版</b>。先看看底部这句模糊催改会发生什么。',
      ],
      buttons: [{ label: '看看说 重做一版 会怎样', primary: true }],
    },
    {
      id: 'send-bad-revise',
      phase: 1,
      say: ['底部原对话输入框里填着一句常见的模糊话：<code>表格看着太乱了，帮我重做一版。</code> 点右下角发送。'],
      wait: {
        target: 'chat.followupSend',
        callout: '在原对话发模糊修改',
        label: '发送模糊修改',
      },
      runChat: () => ({
        id: 'revise-bad',
        prompt: BAD_REVISE_PROMPT,
        chatTitle: '① 模糊说重做 · 全被推翻',
        model: 'Hy4 flash',
        estimateText: '0.00',
        consumedText: '0.00',
        consumedDelta: 0,
        footerTip: '只说“重做一版”容易把原本满意的部分一起推翻',
        elapsed: '2s',
        hideMarksInitially: true,
        steps: [
          { running: '重新构思整份纪要结构…', done: '已新建 周末读书会筹备纪要_v2.md' },
        ],
        replyHtml:
          '已为你全新重写一版：{{wrong:删掉了原来的四段结构，合并成了一篇连贯叙述文}}，并{{wrong:新建了第二个文件 周末读书会筹备纪要_v2.md}}。',
        artifact: {
          file: '周末读书会筹备纪要_v2.md',
          pathLabel: 'WorkBuddy-练习/周末读书会筹备纪要_v2.md',
          badge: '原结构被推翻',
          badgeTone: 'warn',
          title: '周末读书会说明（重写版）',
          lines: [
            { text: '⚠ 原来满意的 4 个板块和 待确认问题 被删掉了', tone: 'warn' },
            { text: '⚠ 多出一个 _v2.md 重复文件', tone: 'warn' },
            { text: '本次线下活动将于本周末下午举办，团队各成员正有序筹备海报与茶歇……' },
          ],
        },
      }),
    },
    {
      id: 'ask-bad-revise',
      phase: 2,
      say: ['看右侧产物区——你本来只想把表格排个序，结果它顺手把你满意的 4 个板块全推翻了，还多建了一个 <code>_v2</code> 文件。<b>看出问题在哪了吗？</b>'],
      buttons: [{ label: '标出被改乱的地方', primary: true }],
    },
    {
      id: 'prep-good-revise',
      phase: 1,
      revealMarksOnEnter: true,
      onEnter: () => ({
        followupText: GOOD_REVISE_PROMPT,
      }),
      say: [
        '改东西要说清 <b>4 件事：保留什么 + 改哪里 + 改成什么 + 哪些不能动</b>。',
        '我已经在底部原对话输入框帮你换好了精准修改话术（保留 4 板块、只排序待办表、加粗未明确、直接更新原文件）。点右下角发送，看精准微调的效果！',
      ],
      wait: {
        target: 'chat.followupSend',
        callout: '发送精准局部修改',
        label: '发送 4 要素精准修改',
      },
      runChat: () => ({
        id: 'revise-good',
        prompt: GOOD_REVISE_PROMPT,
        chatTitle: '② 精准局部修改 · 一次到位',
        model: 'Hy4 flash',
        estimateText: '0.00',
        consumedText: '0.00',
        consumedDelta: 0,
        footerTip: '点左侧 最近 里的 ① 和 ② 可随时对比推翻重写与局部精修',
        elapsed: '2s',
        steps: [
          { running: '保留原有 4 个板块，仅局部重排待办表格…', done: '已原地更新 周末读书会筹备纪要.md' },
        ],
        replyHtml:
          '{{ok:已保留全部 4 个板块原文未动}}，仅完成待办表格排序与加粗，并直接更新原文件：\n\n| 截止时间 | 具体事项 | 负责人 |\n| --- | --- | --- |\n| 今晚下班前 | 修改活动海报 | 小周 |\n| 明天下午 | 确认茶歇菜单（500 元内） | 老陈 |\n| 周四晚上 | 开场 PPT 初稿 | 阿林 |\n| 周五中午前 | 印签到表和桌签 | {{ok:未明确}} |\n| {{ok:未明确}} | 现场拍照和录像 | {{ok:未明确}} |',
        artifact: {
          file: '周末读书会筹备纪要.md',
          pathLabel: 'WorkBuddy-练习/周末读书会筹备纪要.md',
          badge: '精准局部更新',
          badgeTone: 'ok',
          title: '周末读书会筹备纪要（已精修）',
          lines: [
            { text: '✓ 原 4 大板块完整保留，未新建多余副本', tone: 'ok' },
            { text: '1. 今晚下班前：修改活动海报（小周）' },
            { text: '2. 明天下午：确认茶歇菜单 500 元内（老陈）' },
            { text: '3. 周四晚上：开场 PPT 初稿（阿林）' },
            { text: '4. 周五中午前：印签到表和桌签（未明确）', tone: 'ok' },
            { text: '5. 未明确：现场拍照和录像（未明确）', tone: 'ok' },
          ],
        },
      }),
    },
    {
      id: 'summary',
      phase: 3,
      say: [
        '一次改到位！而且这次改出来的排序和加粗格式如果以后都想沿用，改完顺嘴补一句：<code>记住这个表格排序和加粗习惯，以后整理纪要都照这样来</code>——直接跟 1.2 里学的记忆接上了。',
      ],
      card: {
        kind: 'compare',
        title: '模糊催改 vs 精准局部修改对比',
        leftLabel: '① 说 太乱了，重做一版',
        leftTone: 'warn',
        leftHtml: '满意的 4 个板块全被推翻改成大段文字，还多建了一个 <code>_v2.md</code> 文件。',
        rightLabel: '② 说清 4 件事（保留 / 改哪 / 改成啥 / 别动啥）',
        rightTone: 'ok',
        rightHtml: '原文结构毫发无损，待办表按截止时间排好、未明确项加粗，直接更新原文件。',
      },
      after: ['到这里，第 2 章 <b>发任务全闭环</b>（+/@ → 模式 → 权限 → 5 要素 → 看过程 → 验收 → 二次修改）已经全部走通！下一章给它加能力：专家、技能、连接器。'],
      buttons: [
        { label: '重来一遍', restart: true },
      ],
    },
  ],
};
