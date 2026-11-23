import type { GuidedLessonDef } from '../guidedTypes';
import { createBaseGuidedState } from './baseState';

const VAGUE_PROMPT = '帮我整理一下周末读书会的群聊记录，列出时间和预算。';
const MENTION_PROMPT = '@周末读书会群聊.txt 帮我整理一下这份群聊记录，列出时间和预算。';

export const attachLesson: GuidedLessonDef = {
  id: 'attach',
  code: '2.1',
  title: '添加资料：+ 和 @',
  guideUrl: '/features/send-task/attach/',
  initialState: () =>
    createBaseGuidedState({
      selectedGroup: 'WorkBuddy-练习',
      selectedModel: 'Hy4 flash',
      composerText: VAGUE_PROMPT,
    }),
  steps: [
    {
      id: 'intro',
      phase: 0,
      say: [
        '正式发任务第一步：<b>把资料交到它手上</b>。WorkBuddy 有两个入口：点左下角 <b>+</b> 号添加外部本地或云端文件（资料库 / 腾讯文档 / ima / 乐享），或者在输入框里直接打 <b>@</b> 点名引用当前分组里的文件。',
        '很多人会问：“文件就在当前分组里，不打 <b>@</b> 它自己搜目录不也能找到吗？”——文件少时确实能，但只要目录里有新旧版本或相近文件，就容易翻车。先看<b>不点名直接发</b>会发生什么。',
      ],
      buttons: [{ label: '先看 不点名直接发 会怎样', primary: true }],
    },
    {
      id: 'run-no-attach',
      phase: 1,
      onEnter: () => ({ view: 'home', popover: null, mentionMenuOpen: false, composerText: VAGUE_PROMPT }),
      say: ['输入框里只写了“整理周末读书会的群聊记录”，没点 <b>+</b> 也没打 <b>@</b> 指定哪一份。直接点右下角<b>发送</b>。'],
      wait: {
        target: 'composer.send',
        callout: '不点名直接发',
        label: '发送（未 @ 点名）',
      },
      runChat: () => ({
        id: 'attach-none',
        prompt: VAGUE_PROMPT,
        chatTitle: '① 未点名 · 自动搜目录抓错旧版',
        model: 'Hy4 flash',
        estimateText: '0.00',
        consumedText: '0.00',
        consumedDelta: 0,
        footerTip: '未指定文件时它会自动搜当前本地目录，可在左侧 最近 里与下次对比',
        elapsed: '3s',
        hideMarksInitially: true,
        steps: [
          {
            running: '未指定文件，正在搜索当前分组 WorkBuddy-练习 目录…',
            done: '在目录中搜到 2 份含“读书会”的记录，自动选取了 上月读书会群聊_旧版.txt',
          },
          {
            running: '正在读取 上月读书会群聊_旧版.txt…',
            done: '已读取 上月读书会群聊_旧版.txt（上月活动记录）',
          },
        ],
        replyHtml:
          '已搜索当前分组目录并整理读书会安排（来源：<code>上月读书会群聊_旧版.txt</code>）：\n\n| 项目 | 内容 |\n| --- | --- |\n| 活动时间 | {{wrong:上月周日下午 15:00（旧记录）}} |\n| 活动地点 | {{wrong:徐家汇街角书店二楼（旧地点）}} |\n| 茶歇预算 | {{wrong:800 元（上月已结清）}} |',
      }),
    },
    {
      id: 'ask-no-attach',
      phase: 2,
      say: ['看，它确实自己搜了本地目录、交出一张很像样的表。<b>结合刚才的检索步骤停一秒——看出这份表最大的问题了吗？</b>'],
      buttons: [{ label: '标出问题在哪', primary: true }],
    },
    {
      id: 'reveal-no-attach',
      phase: 2,
      revealMarksOnEnter: true,
      say: [
        '看左边橙色标出来的地方：当前目录里有新旧两份读书会记录，你没用 <b>@</b> 点名，它自己搜目录时<b>抓成了《上月读书会群聊_旧版.txt》</b>，时间、地点、预算全用成了上个月过时的数据！',
        '另外，如果资料根本不在当前分组里（在桌面、下载目录，或腾讯文档 / ima / 资料库），它搜当前目录更是搜不到，必须用左下角 <b>+</b> 号加进来。',
      ],
      buttons: [{ label: '好，回去用 @ 精准点名', primary: true }],
    },
    {
      id: 'open-mention',
      phase: 1,
      navLabel: '输入 @',
      onEnter: () => ({
        view: 'home',
        activeChat: null,
        showArtifacts: false,
        composerText: '帮我整理一下这份群聊记录，列出时间和预算。',
        mentionMenuOpen: false,
      }),
      say: [
        '回到首页输入框，直接用键盘在蓝圈输入框里输入 <b>@</b>，精准点名最新那份 <code>周末读书会群聊.txt</code>（顺手点一下 <b>+</b> 号也能看看外部/云端文件入口）：',
      ],
      wait: {
        target: 'composer.mention',
        callout: '在输入框里输入 @',
        label: '输入 @',
      },
      onAction: () => ({ mentionMenuOpen: true, popover: null }),
    },
    {
      id: 'pick-chatlog',
      phase: 1,
      navLabel: '选群聊文件',
      say: [
        '看弹出列表：目录里同时有 <code>周末读书会群聊.txt</code> 和 <code>上月读书会群聊_旧版.txt</code>。文件名起明白 + 用 <b>@</b> 直接点名，就不用它自己翻目录碰运气了。点选最新那份 <code>周末读书会群聊.txt</code>。',
      ],
      wait: {
        target: 'mentionMenu.pickChatLog',
        callout: '选中最新这份群聊',
        label: '周末读书会群聊.txt',
      },
      onAction: () => ({
        mentionMenuOpen: false,
        composerText: MENTION_PROMPT,
      }),
    },
    {
      id: 'run-with-attach',
      phase: 2,
      navLabel: '发送',
      say: [],
      wait: {
        target: 'composer.send',
        callout: '带着 @ 点名再发一次',
        label: '发送（已 @ 点名）',
      },
      runChat: () => ({
        id: 'attach-ok',
        prompt: MENTION_PROMPT,
        chatTitle: '② 已 @ 点名 · 读书会整理',
        model: 'Hy4 flash',
        estimateText: '0.00',
        consumedText: '0.00',
        consumedDelta: 0,
        footerTip: '点左侧 最近 里的 ① 和 ② 可随时对比“自己搜目录抓错旧版”与“@ 精准点名”的区别',
        elapsed: '2s',
        steps: [
          {
            running: '已锁定 @周末读书会群聊.txt，直接读取…',
            done: '已精准读取 周末读书会群聊.txt（省去目录检索，共 6 条发言）',
          },
        ],
        replyHtml:
          '已根据 <code>周末读书会群聊.txt</code> 原文提取：\n\n| 项目 | 原文信息 |\n| --- | --- |\n| 活动时间 | {{ok:周六下午 2 点}} |\n| 活动地点 | {{ok:静安寺青松咖啡二楼包间}} |\n| 茶歇预算 | {{ok:500 元以内（老陈负责，明天下午确认菜单）}} |',
      }),
    },
    {
      id: 'summary',
      phase: 3,
      say: [
        '这一遍一步锁定原文件，时间、地点、500 块预算全对上了！记住两条习惯：<b>① 文件就在当前分组，直接在输入框打 @ 精准点名（别靠它搜目录碰运气，目录里一有新旧版本就容易抓错）；② 文件在分组外或腾讯文档 / ima / 资料库，用左下角 + 号添加</b>。',
      ],
      card: {
        kind: 'compare',
        title: '刚才两次真实输出对比',
        leftLabel: '① 不点名直接发（自己搜本地目录）',
        leftTone: 'warn',
        leftHtml: '搜目录抓成了《上月读书会群聊_旧版.txt》：上月周日下午 15:00 / 徐家汇街角书店 / 预算 800 元（全是旧数据）。',
        rightLabel: '② 在输入框打 @ 点名后',
        rightTone: 'ok',
        rightHtml: '一步读准《周末读书会群聊.txt》：<b>周六下午 2 点 / 静安寺青松咖啡二楼包间 / 预算 500 元以内</b>。',
      },
      buttons: [
        { label: '重来一遍', restart: true },
      ],
    },
  ],
};
