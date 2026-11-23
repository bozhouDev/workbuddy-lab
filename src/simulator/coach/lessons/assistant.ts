import type { ChatRunSpec, GuidedLessonDef } from '../guidedTypes';
import { createBaseGuidedState } from './baseState';
import { freeChat } from './freeChat';

/** 手机上要派的活：要用到电脑里的文件 */
const PHONE_PROMPT = '把我电脑上「WorkBuddy-练习」分组里的读书会筹备纪要发我看看。';

/** 切到本地电脑后，桌面端「最近」里多出来的那条来自手机的任务 */
const FROM_PHONE_CHAT: ChatRunSpec = freeChat({
  id: 'assistant-from-phone',
  prompt: PHONE_PROMPT,
  chatTitle: '来自手机 · 读书会筹备纪要',
  footerTip: '手机派的活在电脑上跑，记录也留在电脑上',
  elapsed: '5s',
  steps: [{ running: '读取 周末读书会_筹备纪要.md…', done: '已读取，并把内容发回手机' }],
  replyHtml: '已把《周末读书会_筹备纪要.md》的内容发到你的手机。',
});

export const assistantLesson: GuidedLessonDef = {
  id: 'assistant',
  code: '4.2',
  title: '助理：手机遥控电脑',
  guideUrl: '/features/automation/assistant/',
  initialState: () =>
    createBaseGuidedState({
      selectedGroup: 'WorkBuddy-练习',
      selectedModel: 'Hy4 flash',
    }),
  steps: [
    {
      id: 'intro',
      phase: 0,
      say: [
        '最后一节：<b>人不在电脑前，用手机派活</b>。通勤路上想起一件事，掏出手机说一句，结果回到手机上。',
        '先把手机和电脑连上。入口在左下角那个<b>小手机图标</b>。',
      ],
      buttons: [{ label: '去连手机', primary: true }],
    },
    {
      id: 'open-mobile',
      phase: 1,
      navLabel: '移动设备',
      say: [],
      wait: { target: 'nav.mobileLink', callout: '点小手机图标', label: '移动设备' },
      onAction: () => ({ popover: 'mobile' }),
    },
    {
      id: 'toggle',
      phase: 1,
      navLabel: '允许远程连接',
      say: ['「随时随地，操控你的电脑」。先打开「<b>允许移动设备远程连接</b>」，不开的话手机连不上这台电脑。'],
      wait: { target: 'mobile.toggle', callout: '打开它', label: '允许移动设备远程连接' },
      onAction: () => ({ mobileLinkOn: true }),
    },
    {
      id: 'scan',
      phase: 1,
      say: [
        '出现二维码了。真机用 WorkBuddy App 或微信小程序扫码，<b>登录同一个账号</b>就连上了。这个码是模拟的，扫不了。',
      ],
      buttons: [{ label: '假装用手机扫好了（模拟）', primary: true }],
    },
    {
      id: 'phone-cloud',
      phase: 1,
      onEnter: () => ({
        popover: null,
        phonePanelOpen: true,
        phoneMode: 'cloud',
        phoneDeviceSheetOpen: false,
        phoneMessages: [],
        followupText: PHONE_PROMPT,
      }),
      say: [
        '右边是手机上的 WorkBuddy（照小程序画的）。看标题下面那行小字「<b>☁ 云电脑</b>」：它说的是<b>这个活在哪台电脑上跑</b>。',
        '<b>云电脑</b>是腾讯云上的一台电脑，你家里电脑关着也能跑；<b>本地电脑</b>就是你自己那台。现在是云电脑。我填了一句要用电脑里文件的活，点手机上的发送。',
      ],
      wait: { target: 'phone.send', callout: '在手机上发', label: '手机发送（云电脑）' },
      onAction: (s) => ({
        followupText: '',
        phoneMessages: [
          ...s.phoneMessages,
          { from: 'me', text: PHONE_PROMPT },
          {
            from: 'bot',
            text: '我现在在云电脑上运行，访问不到你电脑里的文件。可以先把文件上传再发，或者切换到本地电脑。',
            tone: 'warn',
          },
        ],
      }),
    },
    {
      id: 'switch-device',
      phase: 2,
      say: [
        '碰壁了：<b>云电脑处理不了你电脑里没上传的资料</b>。云电脑适合查资料、写东西这种不碰本机文件的活；要用电脑里的东西，就得切到本地电脑。点标题下面的「云电脑」。',
      ],
      wait: { target: 'phone.deviceSwitch', callout: '点这里切换', label: '切换电脑' },
      onAction: () => ({ phoneDeviceSheetOpen: true }),
    },
    {
      id: 'switch-computer',
      phase: 2,
      navLabel: '本地电脑',
      say: [],
      wait: { target: 'phone.modeComputer', callout: '选本地电脑', label: '本地电脑' },
      onAction: () => ({ phoneMode: 'computer', phoneDeviceSheetOpen: false, followupText: PHONE_PROMPT }),
    },
    {
      id: 'phone-computer',
      phase: 2,
      say: ['同一句话，再发一次。'],
      wait: { target: 'phone.send', callout: '再发一次', label: '手机发送（本地电脑）' },
      onAction: (s) => ({
        followupText: '',
        chatHistory: [FROM_PHONE_CHAT, ...s.chatHistory.filter((c) => c.id !== FROM_PHONE_CHAT.id)],
        phoneMessages: [
          ...s.phoneMessages,
          { from: 'me', text: PHONE_PROMPT },
          {
            from: 'bot',
            text: '已在你的电脑上读取《周末读书会_筹备纪要.md》：周六下午 2 点，静安寺青松咖啡二楼包间，茶歇 500 元以内；拍照、桌签负责人待认领。',
            tone: 'ok',
          },
        ],
      }),
    },
    {
      id: 'summary',
      phase: 3,
      say: [
        '这次手机上拿到了纪要内容。再看电脑左边「最近」（侧栏收起来了就点左上角的侧栏按钮展开）：多了一条<b>「来自手机」</b>的任务，活是在电脑上干的，记录也留在电脑上。',
      ],
      card: {
        kind: 'table',
        title: '云电脑 vs 本地电脑',
        headers: ['', '云电脑', '本地电脑'],
        rows: [
          ['在哪跑', '腾讯云上的电脑', '你自己的电脑'],
          ['电脑要开着吗', '不用，关机不中断', '要开着、不能睡（锁屏运行选「熄屏后保持唤醒」）'],
          ['能用电脑里的文件吗', '不能（没上传的处理不了）', '能'],
          ['适合', '查资料、写稿、做表', '处理电脑里的文件、跑本地技能和连接器'],
        ],
      },
      after: [
        '手机派活记住 3 条：<b>① 切到本地电脑前，1.1 节的锁屏运行和防休眠要开好</b>；<b>② 手机上只做只读和生成</b>，删除、发送这类动作回到电脑前再做；<b>③ 不用了就关掉「允许移动设备远程连接」</b>。',
        '除了扫码连 App 或微信小程序，左边侧栏的<b>「助理」</b>里还能绑微信助理、企业微信、QQ、飞书、钉钉这些聊天通道，像跟好友聊天一样派活，图文教程里有详细说明。',
        '到这里，基础功能篇全部学完了。下一步去实战篇，把这些串起来做几个完整的活。',
      ],
      buttons: [
        { label: '回课程首页看实战篇 →', primary: true, href: '/#cases' },
        { label: '读本节图文教程', href: '/features/automation/assistant/' },
        { label: '重来一遍', restart: true },
      ],
    },
  ],
};
