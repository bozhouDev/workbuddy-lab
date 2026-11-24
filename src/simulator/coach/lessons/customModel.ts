import { createPracticeKey, PRACTICE_MODEL_ID, PRACTICE_PROMPT } from '../customModelPractice';
import type { ChatRunSpec, GuidedLessonDef, GuidedStep } from '../guidedTypes';
import { createBaseGuidedState } from './baseState';

const DEFAULT_MODEL = 'Hy4 flash';

function modelCheckReply(model: string, id: string, chatTitle: string): ChatRunSpec {
  return {
    id,
    prompt: PRACTICE_PROMPT,
    chatTitle,
    model,
    estimateText: '0.00',
    consumedText: '0.00',
    consumedDelta: 0,
    elapsed: '1s',
    steps: [{ running: '正在生成模拟回复…', done: '已生成模拟回复' }],
    replyHtml: `你好！本次对话使用的是 ${model}。（模拟回复）`,
    footerTip: '教学模拟，没有使用真实模型接口。',
  };
}

const openModelMenu = {
  id: 'open-model-menu',
  phase: 2,
  say: [`右下角还显示 <code>${DEFAULT_MODEL}</code>。保存只是把新模型放进可选列表，这次聊天用哪个还要自己选。点输入框右下角蓝圈里的模型名称，打开列表。`],
  wait: { target: 'composer.model', callout: '打开模型列表', label: '模型选择' },
  onAction: () => ({ popover: 'model' }),
} satisfies GuidedStep;

const selectCustomModel = {
  id: 'select-custom-model',
  phase: 2,
  say: [`在「自定义模型」分组找到蓝圈里的 <code>${PRACTICE_MODEL_ID}</code>，点它。选中后，输入框旁的名称会换成它，下一条消息就会用这个模型。`],
  wait: { target: 'modelMenu.pickCustom', callout: '选刚保存的模型', label: PRACTICE_MODEL_ID },
  onAction: () => ({ selectedModel: PRACTICE_MODEL_ID, popover: null }),
} satisfies GuidedStep;

const sendPracticeMessage = {
  id: 'send-practice-message',
  phase: 2,
  say: [`我在输入框里放好了练习问题「${PRACTICE_PROMPT}」。先确认输入框旁是你刚选的模型，再点蓝圈里的「发送」。等回复出来，我带你看模型标签。`],
  wait: { target: 'composer.send', callout: '点发送，验证模型', label: '发送练习消息' },
  runChat: (s) => modelCheckReply(s.selectedModel, 'custom-model-reply', '自定义模型配置验证'),
} satisfies GuidedStep;

export const customModelLesson: GuidedLessonDef = {
  id: 'custom-model',
  code: '1.3',
  title: '配置自定义模型（以 GPT 为例）',
  guideUrl: '/features/setup/custom-model/',
  initialState: () =>
    createBaseGuidedState({ customModelPractice: { demoKey: createPracticeKey(), formOpen: false, customSelected: false, saved: false } }),
  checkpoints: [
    { stepId: 'open-avatar', title: '打开设置', shortHint: '从左下角头像进入设置' },
    { stepId: 'open-model-settings', title: '找到模型页', shortHint: '在功能分组中点模型' },
    { stepId: 'add-model', title: '添加模型', shortHint: '打开添加模型弹窗' },
    { stepId: 'select-provider', title: '选择供应商', shortHint: '在其他分组中点自定义' },
    { stepId: 'test-and-save', title: '填写并保存', shortHint: '填三项，测试成功后保存' },
    { stepId: 'back-to-home', title: '返回并切换模型', shortHint: '打开模型列表，选中刚保存的模型' },
    { stepId: sendPracticeMessage.id, title: '发送验证', shortHint: '发送练习问题，再核对回复下方的模型标签' },
  ],
  steps: [
    {
      id: 'intro',
      phase: 0,
      say: [
        '今天我们给 WorkBuddy 加一个练习模型（以gpt模型为例）。你来点，我在旁边提醒。最后我们会发一句话，亲眼看它用的是不是你刚选的模型。',
        '弹窗里有一张练习配置单。跟我填完三项，再试着找出一个常见的地址错误。测试和回复都在网页里模拟，用这轮的练习值就行。',
      ],
      buttons: [{ label: '好，去添加模型', primary: true }],
    },
    {
      id: 'open-avatar',
      phase: 1,
      say: ['先看左下角，点你名字旁边的头像。头像会打开账号菜单，设置入口就在里面。'],
      wait: { target: 'avatar', callout: '点左下角头像', label: '头像' },
      onAction: () => ({ popover: 'avatar' }),
    },
    {
      id: 'open-settings',
      phase: 1,
      say: ['菜单打开了，点里面的「设置」。我们从设置里把新模型加到 WorkBuddy 的可选列表。'],
      wait: { target: 'avatarMenu.settings', callout: '点设置', label: '设置' },
      onAction: () => ({ view: 'settings', settingsTab: 'general', popover: null }),
    },
    {
      id: 'open-model-settings',
      phase: 1,
      say: ['在设置左侧的「功能」下，点「模型」。右边上方的「自定义模型」用来添加聊天模型，下方的「辅助任务模型」管的是标题和摘要等功能。'],
      wait: { target: 'settings.tab.models', callout: '点模型', label: '模型' },
      onAction: () => ({ settingsTab: 'models' }),
    },
    {
      id: 'add-model',
      phase: 1,
      say: ['在「自定义模型」里点「添加模型」。等弹窗打开，我们就能填写这家服务商给的连接信息。'],
      wait: { target: 'customModel.add', callout: '点添加模型', label: '添加模型' },
      onAction: (s) => s.customModelPractice ? ({ customModelPractice: { ...s.customModelPractice, formOpen: true } }) : ({}),
    },
    {
      id: 'select-provider',
      phase: 1,
      say: [
        '点开供应商列表。往下找到「其他」里的「自定义」，也可以直接搜索「自定义」。我们要按练习配置单自己填接口地址，所以选这一项。',
        '列表上说的「OpenAI 兼容」是指 WorkBuddy 和服务商按同一套规则发请求、收回复。选完「自定义」，就会看到可以自己填写的接口地址。',
      ],
      wait: { target: 'customModel.provider', callout: '选自定义供应商', label: '自定义供应商' },
      onAction: (s) => s.customModelPractice ? ({ customModelPractice: { ...s.customModelPractice, customSelected: true } }) : ({}),
    },
    {
      id: 'test-and-save',
      phase: 1,
      say: ['接下来按蓝圈一项一项填。每填好一栏就点「下一项」，最后再测试连接。'],
      wait: { target: 'customModel.save', callout: '连接成功，点保存', label: '保存模型' },
      onAction: (s) => s.customModelPractice ? ({ customModelPractice: { ...s.customModelPractice, formOpen: false, saved: true } }) : ({}),
    },
    {
      id: 'back-to-home',
      phase: 2,
      say: [`设置列表里已经有 <code>${PRACTICE_MODEL_ID}</code>，说明保存成功。点「返回」，回首页看看当前聊天选的是哪个模型。`],
      wait: { target: 'settings.back', callout: '返回首页', label: '返回' },
      onAction: () => ({ view: 'home', popover: null }),
    },
    openModelMenu,
    selectCustomModel,
    sendPracticeMessage,
    {
      id: 'review-model-label',
      phase: 2,
      say: [
        `回复出来了。看左边这条回复最下面，复制按钮那一排右侧有个 <code>${PRACTICE_MODEL_ID}</code>。模型标签记录的是这条消息实际用的模型，下次验证模型就看这里。`,
        '刚才我们从保存一路走到收到回复。准备好了就点下面的「记住了，考我一下」，自己试一次切换和验证。',
      ],
      buttons: [{ label: '记住了，考我一下', primary: true }],
    },
    {
      ...openModelMenu,
      id: 'quiz-open-model-menu',
      phase: 3,
      say: [`<b>来做个小测。</b>刚才已经保存了 <code>${PRACTICE_MODEL_ID}</code>，现在聊天还是 <code>${DEFAULT_MODEL}</code>。要让这次对话用上新模型，你会先点哪里？先自己找找，卡住就点「给我提示」。`],
      wait: {
        ...openModelMenu.wait,
        hint: '看看输入框右下角，当前显示的模型名字本身也能点。点开就能看到可选模型。',
      },
      onEnter: () => ({
        view: 'home',
        popover: null,
        selectedModel: DEFAULT_MODEL,
        activeChat: null,
        chatPhase: 'idle',
        streamedCharCount: 0,
        composerText: '',
      }),
    },
    {
      ...selectCustomModel,
      id: 'quiz-select-model',
      phase: 3,
      say: ['列表打开了。找找刚才保存的那个模型，选完看一下输入框旁的名字有没有变化。'],
      wait: {
        ...selectCustomModel.wait,
        hint: `在模型列表里找到「自定义模型」，选刚保存的 <code>${PRACTICE_MODEL_ID}</code>。如果列表收起来了，先把它重新打开。`,
      },
    },
    {
      ...sendPracticeMessage,
      id: 'quiz-send-message',
      phase: 3,
      say: ['模型选好了，练习问题也已放好。现在试着把它发出去。'],
      wait: {
        ...sendPracticeMessage.wait,
        hint: '点输入框右下角的发送箭头。等回复出来，再看下面的模型标签。',
      },
      runChat: (s) => modelCheckReply(s.selectedModel, 'custom-model-quiz-reply', '自定义模型小测'),
    },
    {
      id: 'verify-model-label',
      phase: 3,
      say: ['回复已经到了。看左边这条回复最下方，复制按钮那一排旁边会显示本次使用的模型。看看那里写的名字，再在这里选一个。'],
      quiz: {
        prompt: '回复下方的模型标签写着哪个名字？',
        choices: [DEFAULT_MODEL, PRACTICE_MODEL_ID],
        answer: PRACTICE_MODEL_ID,
        retry: '再看一眼回复下方，复制按钮那一排旁边的模型标签。那里记录了这条消息用的模型，找到后再选一次。',
      },
    },
    {
      id: 'summary',
      phase: 3,
      say: [`<b>核对正确。</b>回复下方写的是 <code>${PRACTICE_MODEL_ID}</code>。下次自己配，也按这个顺序检查：弹窗里看「连接成功」，设置里看模型是否保存，发完消息再看回复下方的模型标签。`],
      buttons: [{ label: '重来一遍', restart: true, primary: true }],
    },
  ],
};
