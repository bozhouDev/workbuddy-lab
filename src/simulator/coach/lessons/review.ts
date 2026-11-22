import type { ChatRunSpec, GuidedLessonDef } from '../guidedTypes';
import { createBaseGuidedState } from './baseState';

const HIDDEN_BUG_CHAT: ChatRunSpec = {
  id: 'review-buggy',
  prompt: '@周末读书会群聊.txt 整理成《周末读书会筹备纪要.md》，没写明的标未明确。',
  chatTitle: '① 嘴上说已完成 · 藏着 2 处错',
  model: 'Hy4 flash',
  estimateText: '0.00',
  consumedText: '0.00',
  consumedDelta: 0,
  footerTip: '别只看对话说“已完成”，点开右侧产物区逐项核对',
  elapsed: '3s',
  hideMarksInitially: true,
  steps: [
    { running: '读取 @周末读书会群聊.txt…', done: '已生成 周末读书会筹备纪要.md' },
  ],
  replyHtml: '已全部整理完成！内容与原文完全核对一致，文件已保存到当前分组，你可以直接使用。',
  fileCard: {
    name: '周末读书会筹备纪要.md',
    meta: 'WorkBuddy-练习/周末读书会筹备纪要.md',
  },
  artifact: {
    file: '周末读书会筹备纪要.md',
    pathLabel: 'WorkBuddy-练习/周末读书会筹备纪要.md',
    badge: '请核对',
    badgeTone: 'warn',
    title: '周末读书会筹备纪要',
    lines: [
      { text: '活动时间：周六下午 2 点 · 静安寺青松咖啡二楼包间' },
      { text: '活动海报：小周（今晚下班前完成）' },
      { text: '茶歇饮品：老陈负责，预算控制在 800 元以内', tone: 'warn' },
      { text: '现场拍照与录像：老陈顺手负责', tone: 'warn' },
      { text: '开场 PPT：阿林（周四晚上初稿）' },
    ],
  },
};

const FIND_FILES_PROMPT = '列出这次生成的所有文件名和完整路径。';

export const reviewLesson: GuidedLessonDef = {
  id: 'review',
  code: '2.6',
  title: '检查结果',
  guideUrl: '/features/send-task/review/',
  initialState: () =>
    createBaseGuidedState({
      selectedGroup: 'WorkBuddy-练习',
      selectedModel: 'Hy4 flash',
      view: 'chat',
      activeChat: HIDDEN_BUG_CHAT,
      chatHistory: [HIDDEN_BUG_CHAT],
      chatPhase: 'done',
      streamedCharCount: HIDDEN_BUG_CHAT.replyHtml.length,
      marksRevealed: false,
      showArtifacts: true,
      followupText: '',
    }),
  steps: [
    {
      id: 'intro',
      phase: 0,
      say: [
        '对话里出现 <b>已完成，完全核对一致</b> 不代表活真干对了！',
        '看左边：WorkBuddy 自信满满交了卷，右侧产物区也打开了。<b>结合刚才的群聊原文（茶歇预算 500 块、拍照还没定人），扫一眼右侧预览——你抓出哪 2 处暗坑了吗？</b>',
      ],
      buttons: [{ label: '标出右侧隐藏的 2 处错', primary: true }],
    },
    {
      id: 'reveal-bugs',
      phase: 2,
      revealMarksOnEnter: true,
      say: [
        '抓个正着！看右侧橙色标出来的两行：① 群聊里老陈明明说预算 <b>500 元以内</b>，它写成了 <b>800 元</b>；② 拍照录像明明没定人，它顺手硬塞给了老陈！',
        '还有个常见抓狂场景：有时候文件生成完了却不知道存到电脑哪个角落。学会一句万能口令，直接让它交出完整路径。',
      ],
      buttons: [{ label: '试一下 万能查路径口令', primary: true }],
    },
    {
      id: 'run-find-paths',
      phase: 1,
      onEnter: () => ({
        followupText: FIND_FILES_PROMPT,
      }),
      say: ['我已经在底部原对话输入框填好了 <code>列出这次生成的所有文件名和完整路径。</code> 点右下角发送试试。'],
      wait: {
        target: 'chat.followupSend',
        callout: '点这里查完整落盘路径',
        label: '发送查路径口令',
      },
      runChat: () => ({
        id: 'review-paths',
        prompt: FIND_FILES_PROMPT,
        chatTitle: '② 万能查路径口令',
        model: 'Hy4 flash',
        estimateText: '0.00',
        consumedText: '0.00',
        consumedDelta: 0,
        footerTip: '找不到生成的文件时，这句口令最管用',
        elapsed: '1s',
        steps: [
          { running: '正在汇总本次会话产出的全部文件…', done: '已列出完整路径与文件大小' },
        ],
        replyHtml:
          '本次共生成 1 个文件，完整路径如下：\n\n| 文件名 | 完整路径 | 大小 |\n| --- | --- | --- |\n| 周末读书会筹备纪要.md | {{ok:D:\\WorkBuddy-工作区\\00_临时\\WorkBuddy-练习\\周末读书会筹备纪要.md}} | 1.4 KB |',
      }),
    },
    {
      id: 'summary',
      phase: 3,
      say: ['验收别嫌麻烦，养成肌肉记忆扫完下面 5 眼，发给老板或同事前绝不会社死：'],
      card: {
        kind: 'table',
        title: '交差前必查的 5 眼清单',
        headers: ['检查项', '看什么'],
        rows: [
          ['1. 有没有产物', '右侧产物预览区和文件卡片正常出来了吗'],
          ['2. 在不在目录', '分组文件夹里真的落盘了吗（找不到发万能查路径口令）'],
          ['3. 能不能打开', '排版有没有乱码、表格有没有错位'],
          ['4. 要求全齐吗', '要的板块都在吗、原文件没被误改吧'],
          ['5. 关键数据准吗', '人名、金额、日期、未明确项必须和原文核对一遍'],
        ],
      },
      buttons: [
        { label: '下一节：2.7 二次修改 →', primary: true, nextLesson: 'revise' },
        { label: '读本节图文教程', href: '/features/send-task/review/' },
        { label: '重来一遍', restart: true },
      ],
    },
  ],
};
