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
      selectedModel: 'Hy4 flash',
      composerText: GROUP_TASK,
    }),
  steps: [
    {
      id: 'intro',
      phase: 0,
      say: [
        '在 WorkBuddy 里，<b>一个「分组」就是一个项目，背后对应你电脑里的一个本地文件夹</b>。',
        '很多新手上来直接打字就发，懒得选分组——先不选分组发一次，看看文件会掉到哪儿去。',
      ],
      buttons: [{ label: '先看「不选分组」会怎样', primary: true }],
    },
    {
      id: 'run-no-group',
      phase: 1,
      say: ['注意看输入框左下角现在还是灰色的<b>选择分组</b>（没选）。直接点右下角<b>发送</b>，看产物落在哪。'],
      wait: {
        target: 'composer.send',
        callout: '不选分组直接发',
        label: '直接发送（未选分组）',
      },
      runChat: () => ({
        prompt: GROUP_TASK,
        chatTitle: '整理周报大纲',
        model: 'Hy4 flash',
        estimateText: '0.00',
        consumedText: '0.00',
        consumedDelta: 0,
        footerTip: '未选项目分组，文件已写入默认临时目录',
        elapsed: '2s',
        steps: [
          { running: '未指定分组，正在创建临时会话目录…', done: '已创建默认临时目录 2026-11-20-temp-8f3a' },
          { running: '正在写入 周报整理.md…', done: '已写入 /默认临时目录/2026-11-20-temp-8f3a/周报整理.md' },
        ],
        replyHtml:
          '已为你生成周报大纲。\n由于当前未绑定项目分组，文件已自动存入 {{wrong:/默认临时目录/2026-11-20-temp-8f3a/周报整理.md}}。',
        fileCard: {
          name: '周报整理.md',
          meta: '落入 /默认临时目录/2026-11-20-temp-8f3a/ · 下周很难翻到',
          warn: true,
        },
        artifact: {
          file: '周报整理.md',
          pathLabel: '/默认临时目录/2026-11-20-temp-8f3a/周报整理.md',
          badge: '掉进临时目录',
          badgeTone: 'warn',
          title: '11 月第 3 周周报大纲',
          lines: [
            { text: '⚠ 保存路径：/默认临时目录/2026-11-20-temp-8f3a/（无项目归属）', tone: 'warn' },
            { text: '1. 本周核心交付：完成开局设置教程框架与截图整理' },
            { text: '2. 风险与卡点：旧任务产物分散，跨周复盘难查找' },
            { text: '3. 下周计划：推进发任务篇 7 节互动模拟' },
          ],
        },
      }),
    },
    {
      id: 'see-mess',
      phase: 2,
      say: [
        '看右边产物区的橙色路径：<code>/默认临时目录/2026-11-20-temp-8f3a/</code>。',
        '跑 1 个任务不觉得乱，跑完 20 个任务，你想找上周改好的那份表，翻半天都不知道落哪去了。现在回首页，先选好分组再发一次。',
      ],
      buttons: [{ label: '明白了，回去选分组再发', primary: true }],
    },
    {
      id: 'open-group',
      phase: 1,
      onEnter: () => ({
        view: 'home',
        activeChat: null,
        showArtifacts: false,
        composerText: GROUP_TASK,
        selectedGroup: null,
      }),
      say: ['记住这个手势：动手前先点输入框外左下角的<b>选择分组</b>。'],
      wait: {
        target: 'composer.group',
        callout: '发任务前先选分组',
        label: '选择分组',
      },
      onAction: () => ({ popover: 'group' }),
    },
    {
      id: 'pick-practice',
      phase: 1,
      say: ['选我们提前建好的干净练手目录 <b>WorkBuddy-练习</b>。真实用时也可以在这里点「新建分组」或「选择本地文件夹」。'],
      wait: {
        target: 'groupMenu.pickPractice',
        callout: '选这个练习目录',
        label: 'WorkBuddy-练习',
      },
      onAction: () => ({ selectedGroup: 'WorkBuddy-练习', popover: null }),
    },
    {
      id: 'run-with-group',
      phase: 2,
      say: ['左下角已经亮成 <b>WorkBuddy-练习</b> 了。再点一次<b>发送</b>，看这次产物落在哪。'],
      wait: {
        target: 'composer.send',
        callout: '选好分组再发送',
        label: '发送（已选分组）',
      },
      runChat: () => ({
        prompt: GROUP_TASK,
        chatTitle: 'WorkBuddy-练习 · 周报大纲',
        model: 'Hy4 flash',
        estimateText: '0.00',
        consumedText: '0.00',
        consumedDelta: 0,
        footerTip: '已保存在当前分组目录，下次进组直接接着改',
        elapsed: '2s',
        steps: [
          { running: '正在定位分组目录 WorkBuddy-练习…', done: '已定位 D:\\WorkBuddy-工作区\\00_临时\\WorkBuddy-练习' },
          { running: '正在写入 周报整理.md…', done: '已写入 WorkBuddy-练习/周报整理.md' },
        ],
        replyHtml:
          '已为你生成周报大纲，并干净保存到 {{ok:D:\\WorkBuddy-工作区\\00_临时\\WorkBuddy-练习\\周报整理.md}}。',
        fileCard: {
          name: '周报整理.md',
          meta: '已归档到 WorkBuddy-练习/ · 随时可继续迭代',
        },
        artifact: {
          file: '周报整理.md',
          pathLabel: 'D:\\WorkBuddy-工作区\\00_临时\\WorkBuddy-练习\\周报整理.md',
          badge: '已归档到分组',
          badgeTone: 'ok',
          title: '11 月第 3 周周报大纲',
          lines: [
            { text: '✓ 保存路径：WorkBuddy-工作区/00_临时/WorkBuddy-练习/周报整理.md', tone: 'ok' },
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
        '两条保命提醒记牢：<b>① 千万别把「桌面」「下载」设成工作目录</b>（让它“清理没用文件”可能顺手删你桌面东西）；<b>② 重要原件先复制副本进练习目录</b>。',
      ],
      card: {
        kind: 'doc',
        title: '推荐的 5 层文件夹结构',
        badge: '够用很久',
        badgeTone: 'ok',
        lines: [
          'WorkBuddy-工作区/',
          '├── 00_临时/    # 试新功能、一次性小活，定期清空',
          '├── 01_任务/    # 正在处理的零散任务（纪要、表格）',
          '├── 02_项目/    # 大项目，每个项目单建子目录',
          '├── 03_知识库/  # 长期反复参考的资料',
          '└── 99_归档/    # 已做完留档的成品',
        ],
      },
      buttons: [
        { label: '下一节：1.3 记忆与进化 →', primary: true, nextLesson: 'memory' },
        { label: '读本节图文教程', href: '/features/setup/groups/' },
        { label: '重来一遍', restart: true },
      ],
    },
  ],
};
