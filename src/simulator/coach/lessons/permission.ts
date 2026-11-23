import type { GuidedLessonDef } from '../guidedTypes';
import { createBaseGuidedState } from './baseState';

const CLEAN_TASK = '帮我把没用的旧文件顺手清理一下，释放点空间。';

export const permissionLesson: GuidedLessonDef = {
  id: 'permission',
  code: '2.3',
  title: '权限与审批弹窗',
  guideUrl: '/features/send-task/permission/',
  initialState: () =>
    createBaseGuidedState({
      selectedGroup: 'WorkBuddy-练习',
      selectedModel: 'Hy4 flash',
      fullAccessOn: true,
      composerText: CLEAN_TASK,
    }),
  steps: [
    {
      id: 'intro',
      phase: 0,
      say: [
        '输入框外左下角、选择分组旁边就是<b>权限</b>。点开里面有个红色的<b>允许完全访问</b>开关——平时关着就是<b>默认权限</b>。',
        '很多新手嫌弹窗烦，图省事一直开着完全访问。先亲眼看看<b>开着完全访问</b>发一句模糊清理指令会出什么事。',
      ],
      buttons: [{ label: '先看 开完全访问 的翻车现场', primary: true }],
    },
    {
      id: 'run-full-access',
      phase: 1,
      onEnter: () => ({
        view: 'home',
        popover: null,
        fullAccessOn: true,
        composerText: CLEAN_TASK,
      }),
      say: ['注意左下角现在亮着红色的<b>允许完全访问</b>。点<b>发送</b>看看后果。'],
      wait: {
        target: 'composer.send',
        callout: '完全访问下发送',
        label: '发送（允许完全访问）',
      },
      runChat: () => ({
        id: 'perm-full',
        prompt: CLEAN_TASK,
        chatTitle: '① 完全访问 · 误删桌面备份',
        model: 'Hy4 flash',
        estimateText: '0.00',
        consumedText: '0.00',
        consumedDelta: 0,
        footerTip: '允许完全访问跳过了删除确认弹窗',
        elapsed: '2s',
        hideMarksInitially: true,
        steps: [
          { running: '扫描练习目录及关联旧文件…', done: '扫描到 17 个超过 30 天未修改的文件' },
          { running: '直接执行清理删除命令…', done: '已删除 17 个文件（未弹窗确认）' },
        ],
        replyHtml:
          '已完成清理，共释放 412 MB 空间：\n- <code>WorkBuddy-练习/草稿_旧.md</code>（3 个文件）\n- {{wrong:/Users/学员/Desktop/客户备份/ 下的 14 个历史合同与报价表已移入废纸篓}}',
      }),
    },
    {
      id: 'ask-full-access',
      phase: 2,
      say: ['空间确实释放了 412 MB——<b>停一秒看第二行路径，惊不惊出一身冷汗？</b>'],
      buttons: [{ label: '标出误删的地方', primary: true }],
    },
    {
      id: 'reveal-full-access',
      phase: 2,
      revealMarksOnEnter: true,
      say: [
        '看左边橙色标出来的路径：开着<b>允许完全访问</b>，它连确认都不弹，直接把你桌面里的 14 个客户备份给删了！',
      ],
      buttons: [{ label: '好，回去关掉完全访问', primary: true }],
    },
    {
      id: 'open-perm',
      phase: 1,
      navLabel: '点权限',
      onEnter: () => ({
        view: 'home',
        activeChat: null,
        showArtifacts: false,
        fullAccessOn: true,
        composerText: CLEAN_TASK,
      }),
      say: [
        '现在把开关关回<b>默认权限</b>，用一模一样的话再跑一次，看审批弹窗怎么拦住它：',
      ],
      wait: {
        target: 'composer.permission',
        callout: '关掉完全访问',
        label: '权限设置',
      },
      onAction: () => ({ popover: 'permission' }),
    },
    {
      id: 'toggle-perm-off',
      phase: 1,
      navLabel: '切回默认权限',
      say: [],
      wait: {
        target: 'permMenu.toggleFullAccess',
        callout: '关闭红色开关',
        label: '关闭允许完全访问',
      },
      onAction: () => ({ fullAccessOn: false, popover: null }),
    },
    {
      id: 'run-default-perm',
      phase: 2,
      navLabel: '发送',
      say: ['左下角变回安心的<b>默认权限</b>了。同一句再点<b>发送</b>。'],
      wait: {
        target: 'composer.send',
        callout: '默认权限下再发一次',
        label: '发送（默认权限）',
      },
      runChat: () => ({
        id: 'perm-default',
        prompt: CLEAN_TASK,
        chatTitle: '② 默认权限 · 审批窗拦住误删',
        model: 'Hy4 flash',
        estimateText: '0.00',
        consumedText: '0.00',
        consumedDelta: 0,
        memoryBadge: '等待你审批',
        footerTip: '高风险删除前已暂停，等你确认才会执行',
        elapsed: '2s',
        steps: [
          { running: '扫描待清理文件…', done: '发现涉及目录外文件，已暂停并请求用户审批' },
        ],
        replyHtml: '扫描到可能不再使用的旧文件，涉及删除操作，请在下方确认是否继续：',
        approvalCard: {
          question: '确认删除 /Users/学员/Desktop/客户备份 下的 14 个文件？（会先备份，再移入废纸篓）',
          confirmLabel: '确认删除',
          cancelLabel: '取消操作',
          askLabel: '其他补充…（先用大白话列清单给我看）',
        },
      }),
    },
    {
      id: 'inspect-approval',
      phase: 2,
      say: [
        '漂亮！底部弹出了 5.11.3 的<b>真实审批卡片</b>。记住看弹窗的 3 秒口诀：<b>① 做什么动作（删除）② 路径对不对（跑到 Desktop/客户备份 去了！）③ 这一步是不是必需</b>。',
        '拿不准或路径不对，千万别闭眼点 1 确认！直接点最下面的 <b>✎ 其他补充…</b>，让它先用大白话列清单再决定。',
      ],
      wait: {
        target: 'approval.askPlain',
        callout: '点这里先问清楚再决定',
        label: '其他补充…',
      },
      runChat: () => ({
        id: 'perm-safe-reply',
        prompt: '请先用大白话解释一下，刚才那一步会动到哪些文件、为什么要执行？能不能先给我看个清单或预览？',
        chatTitle: '③ 拦截成功 · 先看清单',
        model: 'Hy4 flash',
        estimateText: '0.00',
        consumedText: '0.00',
        consumedDelta: 0,
        footerTip: '已中止越界删除，零文件受损',
        elapsed: '1s',
        steps: [
          { running: '已取消删除操作，正在整理只读预览清单…', done: '已取消删除，列出待确认清单' },
        ],
        replyHtml:
          '{{ok:已取消删除，没有动任何文件。}}\n\n刚才是打算清理下面两处，其中第二处超出了当前练习目录，建议你保留：\n\n| 目录 | 文件数 | 建议 |\n| --- | --- | --- |\n| WorkBuddy-练习/草稿_旧.md | 3 个 | 可删（临时草稿） |\n| /Desktop/客户备份/ | 14 个 | {{ok:不要删（目录外重要资料）}} |',
      }),
    },
    {
      id: 'summary',
      phase: 3,
      say: [
        '一句话保命：<b>新手始终保持 默认权限，别为了省两下点击去开完全访问；弹出审批窗花 3 秒盯紧 动作 + 路径 + 是否必需，看不懂就点取消或用大白话反问。</b>',
      ],
      card: {
        kind: 'compare',
        title: '刚才两次权限对比',
        leftLabel: '① 允许完全访问（实际结果）',
        leftTone: 'warn',
        leftHtml: '跳过确认弹窗，直接把 <code>/Desktop/客户备份/</code> 14 份合同移进了废纸篓。',
        rightLabel: '② 默认权限 + 审批追问（实际结果）',
        rightTone: 'ok',
        rightHtml: '高风险删除自动暂停，一眼看出路径越界，点 <b>其他补充</b> 零损失拦住。',
      },
      buttons: [
        { label: '重来一遍', restart: true },
      ],
    },
  ],
};
