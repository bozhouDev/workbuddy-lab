import type { GuidedLessonDef } from '../guidedTypes';
import { createBaseGuidedState } from './baseState';

const MEMORY_TASK = '帮我整理本周 3 条项目进展，直接给能发群里的版本。';

export const memoryLesson: GuidedLessonDef = {
  id: 'memory',
  code: '1.3',
  title: '记忆与进化',
  guideUrl: '/features/setup/memory/',
  initialState: () =>
    createBaseGuidedState({
      selectedGroup: 'WorkBuddy-练习',
      selectedModel: 'Hy4 flash',
      cloudMemoryOn: false,
      localMemoryOn: false,
      composerText: MEMORY_TASK,
      cloudMemories: [
        { id: 'm1', tag: '工作习惯', text: '汇报表格第一列放日期，结论控制在 3 条以内' },
        { id: 'm2', tag: '工具环境', text: '平时使用 Mac 与飞书，输出优先简洁 Markdown' },
      ],
    }),
  steps: [
    {
      id: 'intro',
      phase: 0,
      say: [
        '用 AI 最烦的事之一：昨天反复交代“表格第一列放日期、别写长篇大论”，今天新开一个对话，它像失忆一样老毛病全犯。',
        '这一节带你亲手看三遍结果：<b>没开记忆 → 打开记忆 → 把「记歪」的记忆删掉</b>。',
      ],
      buttons: [{ label: '先看「关着记忆」的效果', primary: true }],
    },
    {
      id: 'run-no-memory',
      phase: 1,
      say: ['现在云端记忆是<b>关着</b>的。直接点<b>发送</b>，看它还记不记得你昨天定好的格式。'],
      wait: {
        target: 'composer.send',
        callout: '关着记忆先发一次',
        label: '发送（记忆已关闭）',
      },
      runChat: () => ({
        prompt: MEMORY_TASK,
        chatTitle: '本周项目进展（无记忆）',
        model: 'Hy4 flash',
        estimateText: '0.00',
        consumedText: '0.00',
        consumedDelta: 0,
        footerTip: '云端记忆未开启，本次未加载历史偏好',
        elapsed: '2s',
        steps: [
          { running: '未开启云端记忆，按默认通用格式生成…', done: '已完成通用长文本整理' },
        ],
        replyHtml:
          '{{wrong:各位同事大家好！本周在团队的共同努力下，我们在多个核心模块上都取得了显著的阶段性突破。首先，在官网与课程建设方面我们完成了首页改版与多端适配，整体体验更加流畅；其次，在内容体系建设上我们补充了完整的扩展章节……}}\n\n（整段大白话堆砌，既没放日期列，也没控制在 3 条。）',
      }),
    },
    {
      id: 'open-avatar-1',
      phase: 1,
      say: [
        '看吧，昨天交代的“日期放第一列、3 条短句”全忘了，又给你写了一大段套话。',
        '现在点左下角<b>头像</b>，我们去把「记忆与进化」打开。',
      ],
      wait: {
        target: 'avatar',
        callout: '点头像开记忆',
        label: '左下角头像',
      },
      onAction: () => ({ popover: 'avatar' }),
    },
    {
      id: 'open-memory-1',
      phase: 1,
      say: ['菜单里有直达入口——直接点<b>记忆与进化</b>。'],
      wait: {
        target: 'avatarMenu.memory',
        callout: '进记忆与进化',
        label: '记忆与进化',
      },
      onAction: () => ({ popover: null, view: 'settings', settingsTab: 'memory' }),
    },
    {
      id: 'toggle-cloud',
      phase: 1,
      say: ['第一个开关是<b>云端记忆</b>：自动记住对话里的关键习惯，每晚整理更新。点它打开。'],
      wait: {
        target: 'settings.toggleCloudMemory',
        callout: '打开云端记忆',
        label: '打开云端记忆',
      },
      onAction: () => ({ cloudMemoryOn: true }),
    },
    {
      id: 'toggle-local',
      phase: 1,
      say: ['下面还有<b>本地记忆与技能</b>，用来记长期项目的约定和成果。顺手也点开。'],
      wait: {
        target: 'settings.toggleLocalMemory',
        callout: '顺手打开本地记忆',
        label: '打开本地记忆与技能',
      },
      onAction: () => ({ localMemoryOn: true }),
    },
    {
      id: 'back-1',
      phase: 1,
      say: ['两个开关都亮绿了，下面已经列出了它之前学到的两条习惯。点左上角<b>← 返回</b>，回首页重发刚才那句。'],
      wait: {
        target: 'settings.back',
        callout: '返回首页试效果',
        label: '返回主界面',
      },
      onAction: () => ({
        view: 'home',
        activeChat: null,
        showArtifacts: false,
        composerText: MEMORY_TASK,
      }),
    },
    {
      id: 'run-with-memory',
      phase: 2,
      say: ['一字不改，点<b>发送</b>，看打开记忆后的区别。'],
      wait: {
        target: 'composer.send',
        callout: '开着记忆再发一次',
        label: '发送（记忆已开启）',
      },
      runChat: () => ({
        prompt: MEMORY_TASK,
        chatTitle: '本周项目进展（记忆生效）',
        model: 'Hy4 flash',
        estimateText: '0.00',
        consumedText: '0.00',
        consumedDelta: 0,
        memoryBadge: '已引用云端记忆',
        footerTip: '已自动套用记忆：日期放第一列、3 条简洁结论',
        elapsed: '2s',
        steps: [
          { running: '正在读取云端记忆（2 条偏好）…', done: '已命中偏好：表格第一列放日期 + 3 条以内结论' },
          { running: '按偏好生成周报清单…', done: '已生成简洁版进展' },
        ],
        replyHtml:
          '{{ok:| 日期 | 项目进展 |}}\n{{ok:| 11-18 | 官网首页与 23 节功能篇图文全部上线 |}}\n{{ok:| 11-19 | 完成 5.11.3 互动模拟器与陪练栏改版 |}}\n{{ok:| 11-20 | 推进开局设置 5 节实操路线联调 |}}',
      }),
    },
    {
      id: 'see-good-memory',
      phase: 2,
      say: [
        '漂亮——抬头亮了「已引用云端记忆」，直接按<b>日期放第一列 + 3 条</b>交卷，完全不用再重复交代。',
        '但记忆有个真实坑：它是全局自动整理的，偶尔会<b>记歪</b>。比如你昨晚帮朋友写了一封英文邮件，它可能误以为你以后都爱看英文。来看看翻车现场。',
      ],
      buttons: [{ label: '看看「记歪」会怎样', primary: true }],
    },
    {
      id: 'bad-memory-intro',
      phase: 2,
      onEnter: (s) => ({
        view: 'home',
        activeChat: null,
        showArtifacts: false,
        composerText: MEMORY_TASK,
        cloudMemories: [
          ...s.cloudMemories.filter((m) => !m.bad),
          {
            id: 'm-bad',
            tag: '自动整理 · 记歪了',
            text: '用户偏好所有周报与邮件一律使用全英文输出',
            bad: true,
          },
        ],
      }),
      say: ['现在后台多了一条「自动整理 · 记歪了」的英文偏好。再点一次<b>发送</b>看它会怎么答。'],
      wait: {
        target: 'composer.send',
        callout: '看「记歪」后的翻车',
        label: '发送（含一条记歪的记忆）',
      },
      runChat: () => ({
        prompt: MEMORY_TASK,
        chatTitle: '本周项目进展（记忆跑偏）',
        model: 'Hy4 flash',
        estimateText: '0.00',
        consumedText: '0.00',
        consumedDelta: 0,
        memoryBadge: '已引用云端记忆（含误记条目）',
        footerTip: '发现回复突然跑偏？去「管理云端记忆」删掉误记条目',
        elapsed: '2s',
        steps: [
          { running: '正在读取云端记忆（3 条）…', done: '命中自动记忆：用户偏好全英文输出' },
        ],
        replyHtml:
          '{{wrong:Here is your weekly project update in English:}}\n{{wrong:- 11-18: Launched homepage and 23 feature tutorials.}}\n{{wrong:- 11-19: Upgraded WorkBuddy 5.11.3 interactive simulator.}}\n{{wrong:- 11-20: Built Chapter 01 onboarding lessons.}}',
      }),
    },
    {
      id: 'open-avatar-2',
      phase: 1,
      say: [
        '突然满屏飙英文，别在对话框里跟它吵架——第一反应是去「记忆与进化」把记歪的那条删掉。再点一次左下角<b>头像</b>。',
      ],
      wait: {
        target: 'avatar',
        callout: '点头像去清掉歪记忆',
        label: '左下角头像',
      },
      onAction: () => ({ popover: 'avatar' }),
    },
    {
      id: 'open-memory-2',
      phase: 1,
      say: ['进<b>记忆与进化</b>。'],
      wait: {
        target: 'avatarMenu.memory',
        callout: '进记忆与进化',
        label: '记忆与进化',
      },
      onAction: () => ({ popover: null, view: 'settings', settingsTab: 'memory' }),
    },
    {
      id: 'delete-bad',
      phase: 1,
      say: ['抓到了——最底下橙色那条就是昨晚写邮件记歪的。点右侧<b>删除</b>直接清掉。'],
      wait: {
        target: 'settings.deleteBadMemory',
        callout: '删掉记歪的这条',
        label: '删除误记条目',
      },
      onAction: (s) => ({
        cloudMemories: s.cloudMemories.filter((m) => !m.bad),
      }),
    },
    {
      id: 'back-2',
      phase: 1,
      say: ['清干净了！点<b>← 返回</b>回首页，最后验证一次。'],
      wait: {
        target: 'settings.back',
        callout: '回去验证恢复正常',
        label: '返回主界面',
      },
      onAction: () => ({
        view: 'home',
        activeChat: null,
        showArtifacts: false,
        composerText: MEMORY_TASK,
      }),
    },
    {
      id: 'run-clean',
      phase: 2,
      say: ['再点一次<b>发送</b>，看中文表格是不是秒恢复。'],
      wait: {
        target: 'composer.send',
        callout: '验证恢复正常',
        label: '发送（清理后）',
      },
      runChat: () => ({
        prompt: MEMORY_TASK,
        chatTitle: '本周项目进展（已纠偏）',
        model: 'Hy4 flash',
        estimateText: '0.00',
        consumedText: '0.00',
        consumedDelta: 0,
        memoryBadge: '已引用云端记忆',
        footerTip: '已恢复正常中文习惯，且保留正确格式记忆',
        elapsed: '2s',
        steps: [
          { running: '正在读取云端记忆（2 条）…', done: '已命中正确偏好：日期放第一列 + 简洁中文' },
        ],
        replyHtml:
          '{{ok:| 日期 | 项目进展 |}}\n{{ok:| 11-18 | 官网首页与 23 节功能篇图文上线 |}}\n{{ok:| 11-19 | 完成 5.11.3 互动陪练模拟器 |}}\n{{ok:| 11-20 | 上线开局设置 5 节实操课 |}}',
      }),
    },
    {
      id: 'summary',
      phase: 3,
      say: [
        '这一节最值钱的两个习惯记牢：<b>① 改对了可以主动说“记住这条，以后别再犯”；② 哪天回答突然跑偏，第一时间翻「管理云端记忆」，把过时或记歪的直接删掉。</b>',
      ],
      card: {
        kind: 'compare',
        title: '开记忆 vs 记歪清理效果对比',
        leftLabel: '关记忆 / 记歪不清理',
        leftTone: 'warn',
        leftHtml: '每次新开对话都要重教一遍格式；或者被一次性的英文邮件带偏，中文任务突然飙英文。',
        rightLabel: '开双记忆 + 定期删歪',
        rightTone: 'ok',
        rightHtml: '自动沿用你的日期列、排版偏好，越用越顺手；偶尔记偏 10 秒删掉立刻回正。',
      },
      buttons: [
        { label: '下一节：1.4 个性化：指令 →', primary: true, nextLesson: 'personalization' },
        { label: '读本节图文教程', href: '/features/setup/memory/' },
        { label: '重来一遍', restart: true },
      ],
    },
  ],
};
