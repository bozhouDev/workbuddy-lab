import type { ChatRunSpec, GuidedLessonDef } from '../guidedTypes';
import { createBaseGuidedState } from './baseState';

const MEMORY_TASK = '帮我整理本周 3 条项目进展，直接给能发群里的版本。';

/** 预置一条“昨天的真实对话”，让学员真切看到昨天约定过什么，也能在左侧「最近」点开重看 */
const YESTERDAY_CHAT: ChatRunSpec = {
  id: 'memory-yesterday',
  prompt: '记住我的周报习惯：以后每次整理项目进展，一律用两列表格，第一列放日期，内容控制在 3 条以内，不要客套话。',
  chatTitle: '昨天 · 约定周报格式',
  model: 'Hy4 flash',
  estimateText: '0.00',
  consumedText: '0.00',
  consumedDelta: 0,
  footerTip: '这是你昨天发过的约定，随时可以在左侧 最近 里回看',
  elapsed: '1s',
  steps: [{ running: '正在记录格式约定…', done: '已确认周报格式要求' }],
  replyHtml: '明白。后续整理项目进展将默认输出两列表格：第一列放日期，控制在 3 条以内，不加客套开场白。',
};

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
      chatHistory: [YESTERDAY_CHAT],
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
        '昨天你在另一个对话里专门交代过周报格式（左侧<b>最近</b>里就能点开看那条记录）：',
      ],
      card: {
        kind: 'doc',
        title: '昨天 · 你交代过的格式要求',
        badge: '历史对话',
        badgeTone: 'plain',
        lines: [
          '你：以后每次整理项目进展，一律用两列表格，第一列放日期，内容控制在 3 条以内，不要客套话。',
          'WorkBuddy：明白。',
        ],
      },
      after: ['现在是今天新开的对话，且<b>云端记忆是关着的</b>。直接发一次，看它还记不记得。'],
      buttons: [{ label: '看看 关着记忆 会怎样', primary: true }],
    },
    {
      id: 'run-no-memory',
      phase: 1,
      onEnter: () => ({ view: 'home', popover: null, composerText: MEMORY_TASK }),
      say: ['已切回今天的新对话，现在<b>云端记忆是关着的</b>。点右下角蓝圈里的<b>发送</b>。'],
      wait: {
        target: 'composer.send',
        callout: '关着记忆发一次',
        label: '发送（记忆已关闭）',
      },
      runChat: () => ({
        id: 'memory-off',
        prompt: MEMORY_TASK,
        chatTitle: '① 关记忆 · 本周进展',
        model: 'Hy4 flash',
        estimateText: '0.00',
        consumedText: '0.00',
        consumedDelta: 0,
        footerTip: '云端记忆未开启，本次未加载历史偏好',
        elapsed: '2s',
        hideMarksInitially: true,
        steps: [
          { running: '未开启云端记忆，按默认通用格式生成…', done: '已完成本周项目进展整理' },
        ],
        replyHtml:
          '{{wrong:各位同事大家好！本周在团队的共同努力下，我们在多个核心模块上都取得了显著的阶段性突破。首先，在官网与课程建设方面我们完成了首页改版与多端适配，整体体验更加流畅；其次，在内容体系建设上我们补充了能力扩展与自动化章节；最后，我们也推进了开局设置互动路线的整体联调，感谢大家一周的辛勤付出！}}',
      }),
    },
    {
      id: 'ask-no-memory',
      phase: 2,
      say: ['看左边的回答——对照昨天交代的 3 个要求，<b>看出哪里跑偏了吗？</b>'],
      buttons: [{ label: '标出问题在哪', primary: true }],
    },
    {
      id: 'open-avatar-1',
      phase: 1,
      revealMarksOnEnter: true,
      navLabel: '头像',
      say: [
        '昨天明明交代了<b>两列表格、第一列放日期、3 条以内、不要客套话</b>，结果今天新开对话它全忘了，又写回一大段套话。',
        '顺着下面路径去把<b>云端记忆</b>和<b>本地记忆</b>都打开，再发一次对比：',
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
      navLabel: '记忆与进化',
      say: [],
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
      navLabel: '开云端记忆',
      say: ['注意底下<b>管理云端记忆</b>现在标着<b>已暂停</b>——里面其实是一整份 Markdown 长文档。点开上面的<b>云端记忆</b>开关，让它生效。'],
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
      navLabel: '开本地记忆',
      say: [],
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
      navLabel: '返回',
      say: [],
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
      say: ['一字不改，再点一次<b>发送</b>，看打开记忆后的真机表格输出。'],
      wait: {
        target: 'composer.send',
        callout: '开着记忆再发一次',
        label: '发送（记忆已开启）',
      },
      runChat: () => ({
        id: 'memory-on',
        prompt: MEMORY_TASK,
        chatTitle: '② 开记忆 · 本周进展',
        model: 'Hy4 flash',
        estimateText: '0.00',
        consumedText: '0.00',
        consumedDelta: 0,
        memoryBadge: '已引用云端记忆',
        footerTip: '点左侧 最近 里的 ① 和 ② 可随时切换对比',
        elapsed: '2s',
        steps: [
          { running: '正在读取云端记忆（2 条偏好）…', done: '已命中偏好：表格第一列放日期 + 3 条以内结论' },
          { running: '按偏好生成周报表格…', done: '已生成两列表格' },
        ],
        replyHtml:
          '| 日期 | 项目进展 |\n| --- | --- |\n| 11-18 | 官网首页与 23 节功能篇图文全部上线 |\n| 11-19 | 完成 5.11.3 互动模拟器与陪练栏改版 |\n| 11-20 | 推进开局设置 5 节实操路线联调 |',
      }),
    },
    {
      id: 'see-good-memory',
      phase: 2,
      say: [
        '漂亮——不用重说一遍，直接按昨天的习惯给你出了一张<b>日期在第一列的 3 行表格</b>（点左侧<b>最近</b>里的 ① 和 ② 可以来回对比）。',
        '但自动记忆有个真实坑：昨晚你临时帮朋友写了一封英文邮件，它可能误以为你以后都爱看英文。我们模拟一下<b>记歪</b>之后的翻车现场。',
      ],
      buttons: [{ label: '看看 记歪 会怎样', primary: true }],
    },
    {
      id: 'bad-memory-run',
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
      say: ['现在后台自动多了一条被带偏的记忆。点<b>发送</b>看它会怎么答。'],
      wait: {
        target: 'composer.send',
        callout: '看记歪后的回复',
        label: '发送（含误记条目）',
      },
      runChat: () => ({
        id: 'memory-bad',
        prompt: MEMORY_TASK,
        chatTitle: '③ 记歪了 · 飙英文',
        model: 'Hy4 flash',
        estimateText: '0.00',
        consumedText: '0.00',
        consumedDelta: 0,
        memoryBadge: '已引用云端记忆',
        footerTip: '突然跑偏？别在聊天里跟它吵，去记忆页删掉误记条目',
        elapsed: '2s',
        steps: [
          { running: '正在读取云端记忆（3 条）…', done: '命中自动记忆：用户偏好全英文输出' },
        ],
        replyHtml:
          '{{wrong:Here is your weekly project update in English:}}\n\n| Date | Progress |\n| --- | --- |\n| 11-18 | Launched homepage and 23 feature tutorials |\n| 11-19 | Upgraded WorkBuddy 5.11.3 interactive simulator |\n| 11-20 | Completed Chapter 01 onboarding lessons |',
      }),
    },
    {
      id: 'quiz-fix-avatar',
      phase: 3,
      navLabel: '头像',
      say: [
        '<b>5 秒实景小验证</b>：中文周报突然满屏飙英文，别在输入框里和它吵架——<b>你的第一反应点哪里去删掉记歪的那条？</b>直接在左边点出来。',
      ],
      wait: {
        target: 'avatar',
        callout: '去哪删歪记忆？点这里',
        label: '左下角头像',
      },
      onAction: () => ({ popover: 'avatar' }),
    },
    {
      id: 'quiz-fix-memory',
      phase: 3,
      navLabel: '记忆与进化',
      say: [],
      wait: {
        target: 'avatarMenu.memory',
        callout: '进记忆与进化',
        label: '记忆与进化',
      },
      onAction: () => ({ popover: null, view: 'settings', settingsTab: 'memory' }),
    },
    {
      id: 'quiz-delete-bad',
      phase: 3,
      navLabel: '删掉误记段落',
      say: [
        '对，就是这里！<b>管理云端记忆</b>里面不是一条条卡片，而是<b>一整份可手动编辑的 Markdown 长文档</b>。真机里直接在这段文本框里删掉记歪的那一段并保存就行，点下面按钮体验一下。',
      ],
      wait: {
        target: 'settings.deleteBadMemory',
        callout: '删掉文档里这段误记',
        label: '删掉这一段并保存',
      },
      onAction: (s) => {
        const cleanChat: ChatRunSpec = {
          id: 'memory-fixed',
          prompt: MEMORY_TASK,
          chatTitle: '④ 已纠偏 · 恢复中文表',
          model: 'Hy4 flash',
          estimateText: '0.00',
          consumedText: '0.00',
          consumedDelta: 0,
          memoryBadge: '已引用云端记忆',
          footerTip: '删掉误记条目后，中文表格习惯立刻恢复',
          elapsed: '2s',
          steps: [{ running: '正在读取云端记忆（2 条）…', done: '已恢复正确中文偏好' }],
          replyHtml:
            '| 日期 | 项目进展 |\n| --- | --- |\n| 11-18 | 官网首页与 23 节功能篇图文全部上线 |\n| 11-19 | 完成 5.11.3 互动模拟器与陪练栏改版 |\n| 11-20 | 推进开局设置 5 节实操路线联调 |',
        };
        return {
          cloudMemories: s.cloudMemories.filter((m) => !m.bad),
          view: 'chat',
          activeChat: cleanChat,
          chatHistory: [cleanChat, ...s.chatHistory.filter((c) => c.id !== cleanChat.id)],
          chatPhase: 'done',
          streamedCharCount: cleanChat.replyHtml.length,
          marksRevealed: true,
        };
      },
    },
    {
      id: 'summary',
      phase: 3,
      say: [
        '删掉瞬间，中文表格立马恢复正常！点左侧<b>最近</b>里的 ① ② ③ ④ 随时可以回看完整对比。',
        '两个黄金习惯记住：<b>① 改对了主动补一句“记住这条，以后别再犯”；② 哪天回答突然跑偏，第一时间进 记忆与进化 把记歪的删掉。</b>',
      ],
      card: {
        kind: 'compare',
        title: '刚才亲眼看到的真实输出对比',
        leftLabel: '① 关记忆 / ③ 记歪时（实际输出）',
        leftTone: 'warn',
        leftHtml: '“各位同事大家好！本周在团队的共同努力下……”<br/>或满屏飙英文：<code>Here is your weekly project update…</code>',
        rightLabel: '② 开双记忆 + ④ 删歪后（实际输出）',
        rightTone: 'ok',
        rightHtml: '干净两列表格：<code>11-18 | 官网首页与 23 节功能篇上线</code>（日期在第一列、仅 3 行、零套话）',
      },
      buttons: [
        { label: '下一节：1.4 个性化：指令 →', primary: true, nextLesson: 'personalization' },
        { label: '读本节图文教程', href: '/features/setup/memory/' },
        { label: '重来一遍', restart: true },
      ],
    },
  ],
};
