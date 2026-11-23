import type { GuidedLessonDef } from '../guidedTypes';
import { createBaseGuidedState } from './baseState';

const EXEC_TASK = '把分组里全部 35 份月度账单合并汇总，并把原文件按年份归档重命名。';

export const executionLesson: GuidedLessonDef = {
  id: 'execution',
  code: '2.5',
  title: '看执行过程',
  guideUrl: '/features/send-task/execution/',
  initialState: () =>
    createBaseGuidedState({
      selectedGroup: 'WorkBuddy-练习',
      selectedModel: 'Hy4 flash',
      composerText: EXEC_TASK,
    }),
  steps: [
    {
      id: 'intro',
      phase: 0,
      say: [
        '任务发出去之后，WorkBuddy 会在对话区实时播报它正在读文件、分析、写代码。很多新手看到画面停住不动，第一反应是疯狂发消息催它“好了没？”——其实大多时候它在等你做一件事。',
        '咱们把一份批量整理任务发出去，盯紧它的执行过程。',
      ],
      buttons: [{ label: '发出去看看执行过程', primary: true }],
    },
    {
      id: 'run-exec',
      phase: 1,
      onEnter: () => ({ view: 'home', popover: null, composerText: EXEC_TASK }),
      say: ['点右下角<b>发送</b>，留意工具步进动效和底部变化。'],
      wait: {
        target: 'composer.send',
        callout: '发送看执行过程',
        label: '发送任务',
      },
      runChat: () => ({
        id: 'exec-paused',
        prompt: EXEC_TASK,
        chatTitle: '① 批量整理 · 卡住等审批',
        model: 'Hy4 flash',
        estimateText: '0.00',
        consumedText: '0.00',
        consumedDelta: 0,
        memoryBadge: '执行暂停 · 等待确认',
        footerTip: '画面停住不动时，先看底部是不是在等你点审批',
        elapsed: '12s',
        steps: [
          { running: '正在扫描分组中的 35 份账单…', done: '已扫描到 35 份月度账单' },
          { running: '准备批量重命名并移动原文件…', done: '触发批量改名操作，已暂停等待用户审批' },
        ],
        replyHtml: '已完成 35 份账单扫描，下一步将批量重命名并移动全部 35 个原始文件，请在下方确认：',
        approvalCard: {
          question: '确认批量重命名并移动 WorkBuddy-练习 下的 35 个原始账单文件？',
          confirmLabel: '确认批量执行',
          cancelLabel: '取消操作（改用小样本先试 3 份）',
          askLabel: '其他补充…',
        },
      }),
    },
    {
      id: 'handle-pause',
      phase: 2,
      say: [
        '看到了吗？画面停住不动，<b>不是卡死了，而是底部弹出了审批卡在等你点头</b>！',
        '另外记住一条铁律：<b>大任务别一口气全量跑 35 个原文件</b>。先点 <b>2 取消操作</b>，改成挑 3 份小样本试水跑通再全量。',
      ],
      wait: {
        target: 'approval.cancel',
        callout: '先取消，改用小样本试水',
        label: '取消操作',
      },
      runChat: () => ({
        id: 'exec-sample',
        prompt: '先别批量动 35 个原文件。只挑前 3 份账单复制一份试跑汇总，我看完格式满意了再处理剩下 32 份。',
        chatTitle: '② 小样本试水 · 稳妥跑通',
        model: 'Hy4 flash',
        estimateText: '0.00',
        consumedText: '0.00',
        consumedDelta: 0,
        footerTip: '先拿 3 份试通套路，确认无误再放全量',
        elapsed: '3s',
        steps: [
          { running: '读取前 3 份账单样本…', done: '已读取 1～3 月账单（未动原文件）' },
          { running: '生成 账单汇总_样本试跑.xlsx…', done: '已写入 账单汇总_样本试跑.xlsx' },
        ],
        replyHtml: '{{ok:已用前 3 份账单跑通汇总模板}}，原文件全部未改动。确认右侧样式没问题后，随时告诉我放开处理剩余 32 份。',
        fileCard: {
          name: '账单汇总_样本试跑.xlsx',
          meta: '3 份小样本试跑完成 · 35 个原文件完好',
        },
        artifact: {
          file: '账单汇总_样本试跑.xlsx',
          pathLabel: 'WorkBuddy-练习/账单汇总_样本试跑.xlsx',
          badge: '样本试跑通过',
          badgeTone: 'ok',
          title: '1～3 月账单汇总（样本试跑）',
          lines: [
            { text: '✓ 已核对 3 份样本，字段口径统一', tone: 'ok' },
            { text: '2026-01 | 办公采购 | ¥1,240.00' },
            { text: '2026-02 | 云服务费 | ¥860.00' },
            { text: '2026-03 | 活动茶歇 | ¥500.00' },
          ],
        },
      }),
    },
    {
      id: 'summary',
      phase: 3,
      say: ['看执行过程只记 3 件事，永远不会慌：'],
      card: {
        kind: 'table',
        title: '盯着执行过程的 3 条口诀',
        headers: ['看到什么情况', '正确做法'],
        rows: [
          ['正在一步步读文件/生成', '耐心等，别反复发消息催它打断思路'],
          ['半天停住不动', '第一眼看底部是不是弹出了审批确认窗在等你点头'],
          ['真卡死或任务太大', '点停止/取消，把任务拆小，先拿 3～5 个小样本试通再全量'],
        ],
      },
      buttons: [
        { label: '重来一遍', restart: true },
      ],
    },
  ],
};
