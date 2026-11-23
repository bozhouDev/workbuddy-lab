import type { GuidedLessonDef } from '../guidedTypes';
import { createBaseGuidedState } from './baseState';

const GROUP_TASK = '帮我把这周 3 条进度整理成一份周报大纲，保存为 周报整理.md';

export const groupsLesson: GuidedLessonDef = {
  id: 'groups',
  code: '1.2',
  title: '分组与文件夹',
  guideUrl: '/features/setup/groups/',
  initialState: () =>
    createBaseGuidedState({
      selectedGroup: null,
      practiceGroupBound: false,
      folderPickerOpen: false,
      selectedModel: 'Hy4 flash',
      composerText: GROUP_TASK,
    }),
  steps: [
    {
      id: 'intro',
      phase: 0,
      say: [
        '在 WorkBuddy 里，<b>一个分组就是一个项目，背后直接对应你电脑里的一个本地文件夹</b>——你放进去的资料它去这里读，做出来的成品也落在这里。',
        '很多新手刚装完软件，列表里还是空的，懒得绑定文件夹直接就发任务——先看看<b>不选分组</b>会发生什么。',
      ],
      buttons: [{ label: '先看 不选分组 会怎样', primary: true }],
    },
    {
      id: 'run-no-group',
      phase: 1,
      onEnter: () => ({ view: 'home', popover: null, composerText: GROUP_TASK }),
      say: ['注意左下角现在是灰色的<b>选择分组</b>，左侧栏<b>分组</b>也还是空的。先直接点右下角<b>发送</b>。'],
      wait: {
        target: 'composer.send',
        callout: '不选分组直接发',
        label: '直接发送（未选分组）',
      },
      runChat: () => ({
        id: 'groups-temp',
        prompt: GROUP_TASK,
        chatTitle: '① 未选分组 · 周报整理',
        model: 'Hy4 flash',
        estimateText: '0.00',
        consumedText: '0.00',
        consumedDelta: 0,
        footerTip: '可在左侧 最近 列表随时点回此记录与下一次结果对比',
        elapsed: '2s',
        hideMarksInitially: true,
        steps: [
          { running: '未指定分组，正在创建临时会话目录…', done: '已创建默认临时目录 2026-11-20-temp-8f3a' },
          { running: '正在写入 周报整理.md…', done: '已写入 /默认临时目录/2026-11-20-temp-8f3a/周报整理.md' },
        ],
        replyHtml:
          '已为你生成本周周报大纲，文件保存位置：\n{{wrong:/默认临时目录/2026-11-20-temp-8f3a/周报整理.md}}',
        fileCard: {
          name: '周报整理.md',
          meta: '/默认临时目录/2026-11-20-temp-8f3a/周报整理.md',
          warn: true,
        },
        artifact: {
          file: '周报整理.md',
          pathLabel: '/默认临时目录/2026-11-20-temp-8f3a/周报整理.md',
          badge: '临时目录',
          badgeTone: 'warn',
          title: '11 月第 3 周周报大纲',
          lines: [
            { text: '1. 本周核心交付：完成开局设置教程框架与截图整理' },
            { text: '2. 风险与卡点：旧任务产物分散，跨周复盘难查找' },
            { text: '3. 下周计划：推进发任务篇 7 节互动模拟' },
          ],
        },
      }),
    },
    {
      id: 'ask-mess',
      phase: 2,
      say: ['周报确实写出来了，右侧产物区也能预览。<b>停一秒看看文件路径，看出有什么隐患吗？</b>'],
      buttons: [{ label: '标出隐患在哪', primary: true }],
    },
    {
      id: 'reveal-mess',
      phase: 2,
      revealMarksOnEnter: true,
      say: [
        '看橙色标出的保存路径：<code>/默认临时目录/2026-11-20-temp-8f3a/</code>。跑完 20 个任务，上周改好的表根本翻不到。',
        '正确开局姿势分两步：<b>① 先在电脑里建一个干净目录</b>（推荐放进 <code>WorkBuddy-工作区/00_临时/WorkBuddy-练习</code>）；<b>② 回到软件点 选择分组 → 选择本地文件夹 把它关联进来</b>。咱们亲手走一遍。',
      ],
      buttons: [{ label: '好，去关联本地文件夹', primary: true }],
    },
    {
      id: 'open-group',
      phase: 1,
      navLabel: '选择分组',
      onEnter: () => ({
        view: 'home',
        activeChat: null,
        showArtifacts: false,
        composerText: GROUP_TASK,
        selectedGroup: null,
        practiceGroupBound: false,
        folderPickerOpen: false,
      }),
      say: ['现在带你把电脑里的本地文件夹加进分组：先点左下角<b>选择分组</b>。'],
      wait: {
        target: 'composer.group',
        callout: '点这里绑定文件夹',
        label: '选择分组',
      },
      onAction: () => ({ popover: 'group' }),
    },
    {
      id: 'pick-local-folder',
      phase: 1,
      navLabel: '选择本地文件夹',
      say: [
        '列表里还没绑定过目录时，看底部两个入口：<b>新建分组</b>（在默认工作空间下自动新建文件夹）和<b>选择本地文件夹</b>（关联你电脑里已建好的目录）。点<b>选择本地文件夹</b>。',
      ],
      wait: {
        target: 'groupMenu.pickLocalFolder',
        callout: '点这里关联本地目录',
        label: '选择本地文件夹',
      },
      onAction: () => ({ popover: null, folderPickerOpen: true }),
    },
    {
      id: 'pick-practice-dir',
      phase: 1,
      navLabel: '选干净练习目录',
      say: [
        '系统目录弹出来了！你可以点点上面的<b>桌面 / 下载</b>看为什么千万别选它们；选下面按 5 层结构提前建好的干净目录 <b>00_临时 / WorkBuddy-练习</b>。',
      ],
      wait: {
        target: 'folderPicker.pickPractice',
        callout: '选干净的练习目录',
        label: '00_临时 / WorkBuddy-练习',
      },
      onAction: () => ({
        folderPickerOpen: false,
        practiceGroupBound: true,
        selectedGroup: 'WorkBuddy-练习',
      }),
    },
    {
      id: 'run-with-group',
      phase: 2,
      navLabel: '发送',
      say: [
        '关联成功！你看<b>左侧栏分组里已经多出了 WorkBuddy-练习</b>，输入框左下角也亮起来了。再点一次<b>发送</b>，看成品怎么落盘。',
      ],
      wait: {
        target: 'composer.send',
        callout: '关联好再发一次',
        label: '发送（已绑定本地目录）',
      },
      runChat: () => ({
        id: 'groups-practice',
        prompt: GROUP_TASK,
        chatTitle: '② WorkBuddy-练习 · 周报整理',
        model: 'Hy4 flash',
        estimateText: '0.00',
        consumedText: '0.00',
        consumedDelta: 0,
        footerTip: '点左侧 最近 里的 ① 和 ② 可随时来回对比路径',
        elapsed: '2s',
        steps: [
          { running: '正在定位分组目录 WorkBuddy-练习…', done: '已定位 D:\\WorkBuddy-工作区\\00_临时\\WorkBuddy-练习' },
          { running: '正在写入 周报整理.md…', done: '已写入 WorkBuddy-练习/周报整理.md' },
        ],
        replyHtml:
          '已为你生成本周周报大纲，文件保存位置：\n{{ok:D:\\WorkBuddy-工作区\\00_临时\\WorkBuddy-练习\\周报整理.md}}',
        fileCard: {
          name: '周报整理.md',
          meta: 'D:\\WorkBuddy-工作区\\00_临时\\WorkBuddy-练习\\周报整理.md',
        },
        artifact: {
          file: '周报整理.md',
          pathLabel: 'D:\\WorkBuddy-工作区\\00_临时\\WorkBuddy-练习\\周报整理.md',
          badge: '已归档到分组',
          badgeTone: 'ok',
          title: '11 月第 3 周周报大纲',
          lines: [
            { text: '1. 本周核心交付：完成开局设置教程框架与截图整理' },
            { text: '2. 下周计划：推进发任务篇 7 节互动模拟' },
            { text: '3. 材料与成品同目录，下次进分组可直接续改' },
          ],
        },
      }),
    },
    {
      id: 'summary',
      phase: 3,
      say: [
        '对比一下刚才两次真实落盘路径（点左侧<b>最近</b>里的 ① 和 ② 也能随时来回翻）。',
        '两条保命提醒记牢：<b>① 千万别把 桌面、下载 设成工作目录</b>；<b>② 重要原件先复制副本放进练习目录</b>。',
      ],
      card: {
        kind: 'compare',
        title: '刚才两次真实保存路径对比',
        leftLabel: '① 没选分组（实际落盘）',
        leftTone: 'warn',
        leftHtml: '<code>/默认临时目录/2026-11-20-temp-8f3a/周报整理.md</code><br/>每次生成新随机临时目录，任务一多全散了。',
        rightLabel: '② 绑定本地文件夹后（实际落盘）',
        rightTone: 'ok',
        rightHtml: '<code>D:\\WorkBuddy-工作区\\00_临时\\WorkBuddy-练习\\周报整理.md</code><br/>材料与成品收在同一项目夹里，左侧栏<b>分组</b>里随时直达。',
      },
      after: [
        '目录不用建太复杂，照着 <code>00_临时</code> <code>01_任务</code> <code>02_项目</code> <code>03_知识库</code> <code>99_归档</code> 分 5 个大类就够用很久。',
      ],
      buttons: [
        { label: '重来一遍', restart: true },
      ],
    },
  ],
};
