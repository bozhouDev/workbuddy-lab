import type { GuidedLessonDef } from '../guidedTypes';
import { createBaseGuidedState } from './baseState';
import { freeChat } from './freeChat';

const RAIN_PROMPT = '明天上海会下雨吗？要不要带伞？';
/** 让 WorkBuddy 帮你写一个 MCP：说清 输入 / 输出 / 要不要 Key / 放哪 / 自测 */
const BUILD_PROMPT =
  '帮我写一个查天气的 MCP 服务（Node.js），用 Open-Meteo 免费接口，不需要 Key；只提供一个工具 get_forecast：输入城市名，返回未来 3 天的最高最低温和降水概率；放在当前分组的 weather-mcp 文件夹；写好后自测一次，再告诉我在 WorkBuddy 里怎么填。';

export const customConnectorLesson: GuidedLessonDef = {
  id: 'custom-connector',
  code: '3.6',
  title: '自定义连接器：做一个自己的 MCP',
  guideUrl: '/features/extend/custom-connector/',
  initialState: () =>
    createBaseGuidedState({
      selectedGroup: 'WorkBuddy-练习',
      selectedModel: 'Hy4 flash',
      composerText: RAIN_PROMPT,
    }),
  steps: [
    {
      id: 'intro',
      phase: 0,
      say: [
        '连接器列表里没有你要的服务怎么办？<b>自己接一个</b>。连接器的本质叫 <b>MCP</b>，可以理解成 AI 的 Type-C 接口：只要按这个标准做个「插头」，WorkBuddy 就能插上用。',
        '这一段做一个真能用的小东西：<b>天气连接器</b>。用的是 Open-Meteo 的免费接口，<b>不需要注册、不需要 Key</b>。先看没有它的时候。',
      ],
      buttons: [{ label: '先问问明天下不下雨', primary: true }],
    },
    {
      id: 'run-none',
      phase: 1,
      onEnter: () => ({ view: 'home', composerText: RAIN_PROMPT, composerChips: [] }),
      say: ['直接问。'],
      wait: { target: 'composer.send', callout: '直接问天气', label: '发送（没接天气）' },
      runChat: () =>
        freeChat({
          id: 'custom-none',
          prompt: RAIN_PROMPT,
          chatTitle: '① 没接天气 · 带不带伞',
          footerTip: '没有数据来源时的回答，可在左侧 最近 里回看',
          elapsed: '2s',
          hideMarksInitially: true,
          steps: [{ running: '思考中…', done: '未调用任何工具' }],
          replyHtml: '明天上海{{wrong:多云转小雨，降水概率 40% 左右}}，{{wrong:建议带一把折叠伞}}。',
        }),
    },
    {
      id: 'ask-none',
      phase: 2,
      say: ['回答得有模有样。<b>看看上面的执行步骤，它这个 40% 是哪来的？</b>'],
      buttons: [{ label: '标出问题', primary: true }],
    },
    {
      id: 'reveal-none',
      phase: 2,
      revealMarksOnEnter: true,
      say: [
        '看左边橙色标出的内容，再对照上面执行步骤「<b>未调用任何工具</b>」：它没查任何数据，<b>40% 降水概率是编的</b>。天气这种每天在变的东西，它自己是不知道的。',
      ],
      buttons: [{ label: '好，让它写一个天气连接器', primary: true }],
    },
    {
      id: 'build',
      phase: 1,
      onEnter: () => ({ view: 'home', composerText: BUILD_PROMPT, composerChips: [] }),
      say: [
        '自定义连接器有三个来源：<b>让 WorkBuddy 帮你写</b>、<b>GitHub 上别人开源的 MCP</b>、<b>服务商给的远程地址（URL）</b>。新手用第一种最稳。我把要求写进输入框了，注意说清了<b>输入什么、返回什么、要不要 Key</b>。发送。',
      ],
      wait: { target: 'composer.send', callout: '让它写一个天气 MCP', label: '发送（写 MCP）' },
      runChat: () =>
        freeChat({
          id: 'custom-build',
          prompt: BUILD_PROMPT,
          chatTitle: '写一个天气 MCP',
          footerTip: '代码写在你自己的分组文件夹里，随时能看',
          elapsed: '1m 48s',
          steps: [
            { running: '新建 weather-mcp/server.js…', done: '已写好 server.js（1 个工具：get_forecast）' },
            { running: '安装依赖…', done: '已安装 @modelcontextprotocol/sdk、zod' },
            { running: '自测 get_forecast("上海")…', done: '自测通过：返回 3 天预报' },
          ],
          replyHtml:
            '写好了，自测通过。在 WorkBuddy 里这样填：\n\n| 字段 | 填什么 |\n| --- | --- |\n| 名称 | my-weather |\n| 传输类型 | 本地命令（stdio） |\n| 启动命令 | node |\n| 命令参数 | /Users/你的用户名/WorkBuddy-练习/weather-mcp/server.js |\n| 环境变量 | {{ok:不用填（这个接口不需要 Key）}} |\n\n去「连接器 → 自定义连接器」添加就行。',
          artifact: {
            file: 'server.js',
            pathLabel: 'WorkBuddy-练习/weather-mcp/server.js',
            badge: '自测通过',
            badgeTone: 'ok',
            title: 'server.js（关键部分）',
            lines: [
              { text: "const server = new McpServer({ name: 'my-weather' })" },
              { text: '// 只开放一个工具：get_forecast', tone: 'ok' },
              { text: "server.tool('get_forecast', '查询城市未来 3 天天气'," },
              { text: '  { city: z.string() },' },
              { text: '  async ({ city }) => {' },
              { text: '    // 城市名 → 经纬度 → Open-Meteo 预报' },
              { text: '    return 3 行：日期 最低~最高°C 降水概率' },
              { text: '  })' },
              { text: '// 通过 stdio 和 WorkBuddy 对话', tone: 'ok' },
            ],
          },
        }),
    },
    {
      id: 'open-ext',
      phase: 1,
      navLabel: '专家·技能·连接器',
      say: [
        '它给了一张<b>填写表</b>，右边是代码的关键部分：一个工具、输入城市名、返回 3 天预报。你不用看懂代码，<b>看懂这张填写表就够了</b>。去连接器页。',
      ],
      wait: { target: 'nav.extensions', callout: '点这里进入', label: '专家·技能·连接器' },
      onAction: () => ({ view: 'extensions', extTab: 'skills' }),
    },
    {
      id: 'tab-connectors',
      phase: 1,
      navLabel: '连接器',
      say: [],
      wait: { target: 'ext.tab.connectors', callout: '点「连接器」', label: '连接器' },
      onAction: () => ({ extTab: 'connectors' }),
    },
    {
      id: 'open-form',
      phase: 1,
      navLabel: '自定义连接器',
      say: [],
      wait: { target: 'connectors.custom', callout: '点自定义连接器', label: '自定义连接器' },
      onAction: () => ({ mcpFormOpen: true, mcpFormFilled: false }),
    },
    {
      id: 'fill',
      phase: 1,
      navLabel: '填表',
      say: [
        '这就是「添加 MCP 服务器」表单。<b>传输类型</b>分两种：本地命令（程序在你电脑上跑，今天就是这种）和远程 URL（服务商给你一个网址）。',
        '<b>环境变量</b>是放 Key 的地方：需要 Key 的服务，<b>Key 只填在这里</b>，别写进提示词或技能。模拟器里不让你输入任何真实信息，点「按 AI 给的说明填好（模拟）」。',
      ],
      wait: { target: 'mcp.fill', callout: '按填写表填好', label: '按 AI 给的说明填好（模拟）' },
      onAction: () => ({ mcpFormFilled: true }),
    },
    {
      id: 'submit',
      phase: 1,
      navLabel: '添加',
      say: ['和填写表一一对上了。注意命令参数要写<b>完整路径</b>（Windows 是 C:\\Users\\… 开头），别写成 ~/ 开头的简写，否则连接器启动不了。点「添加」。'],
      wait: { target: 'mcp.submit', callout: '点添加', label: '添加' },
      onAction: (s) => ({
        mcpFormOpen: false,
        mcpFormFilled: false,
        customConnectors: s.customConnectors.some((c) => c.name === 'my-weather')
          ? s.customConnectors
          : [{ name: 'my-weather', tools: '1/1 个工具已启用', trusted: false }, ...s.customConnectors],
        toast: 'MCP 服务器已添加',
      }),
    },
    {
      id: 'trust',
      phase: 1,
      navLabel: '信任',
      say: [
        '加上了，但条目里写着「<b>第三方服务，WorkBuddy 未审核 · 首次连接此 MCP 服务需要您的信任确认</b>」。',
        '什么能点信任？<b>你自己写的、看过代码的、来源可靠的（官方或大量人用过的开源项目）</b>。来路不明的别信：MCP 在你电脑上运行，权限和你一样大。「AI 写的、自测过」不等于可以信任，<b>点之前自己核对三件事</b>：① 启动的是哪个文件（就是刚才那个 server.js）；② 它会访问哪些网址（只有 Open-Meteo 的两个天气接口）；③ 有没有要 Key、读写你别的文件（都没有）。三件都对得上，点「信任」。',
      ],
      wait: { target: 'mcp.trust', callout: '核对完再信任', label: '信任' },
      onAction: (s) => ({
        customConnectors: s.customConnectors.map((c) => (c.name === 'my-weather' ? { ...c, trusted: true } : c)),
      }),
    },
    {
      id: 'run-weather',
      phase: 2,
      onEnter: () => ({ composerText: RAIN_PROMPT, composerChips: [{ kind: 'connector', label: 'my-weather' }] }),
      say: [
        '亮起绿点：<b>my-weather 已连接 · 1/1 个工具已启用</b>。工具数要留心，一个连接器开几十个工具会让它挑花眼，用不到的可以关掉。',
        '点左上角「新建任务」回首页，同一个问题再问一次。',
      ],
      wait: { target: 'composer.send', callout: '再问一次天气', label: '发送（接了天气）' },
      onAction: () => ({ composerChips: [] }),
      runChat: () =>
        freeChat({
          id: 'custom-weather',
          prompt: RAIN_PROMPT,
          promptChips: [{ kind: 'connector', label: 'my-weather' }],
          chatTitle: '② 接了天气 · 带不带伞',
          footerTip: '模拟器里的天气是示例数据；你自己按图文做出来，查到的就是真实预报',
          elapsed: '4s',
          steps: [{ running: '调用 my-weather · get_forecast(上海)…', done: '调用 my-weather · get_forecast：返回 3 天预报' }],
          replyHtml:
            '{{ok:数据来源：Open-Meteo}}（通过 my-weather 查询）：'+
            '\n\n| 日期 | 气温 | 降水概率 |\n| --- | --- | --- |\n| 11-24 明天 | 9~14°C | {{ok:75%}} |\n| 11-25 | 7~12°C | 20% |\n| 11-26 | 8~15°C | 5% |\n\n明天降水概率 75%，{{ok:建议带伞}}；后两天降水概率较低。',
        }),
    },
    {
      id: 'summary',
      phase: 3,
      say: ['这次每个数字都<b>来自工具返回，标了数据来源</b>。你刚刚走完了自己做一个连接器的全过程。'],
      card: {
        kind: 'compare',
        title: '同一个问题，两次回答',
        leftLabel: '① 没接天气',
        leftTone: 'warn',
        leftHtml: '「降水概率 40% 左右」，<b>未调用任何工具</b>，是编的。',
        rightLabel: '② 接了自己做的 my-weather',
        rightTone: 'ok',
        rightHtml: '调用 get_forecast，<b>数字来自 Open-Meteo，标了来源</b>。',
      },
      after: [
        '自己做连接器记住 4 条：<b>① 让 AI 写时说清三件事：输入什么、返回什么、要不要 Key</b>；<b>② 要 Key 的只放「环境变量」</b>，别写进提示词或技能；<b>③ 只信任可靠来源</b>；<b>④ 工具别开太多</b>。',
        '想自己真做一遍，图文教程里有完整代码和每一步截图位置。同样的套路还能接：公司内部的查询接口、快递单号查询、汇率换算……',
      ],
      buttons: [
        { label: '重来一遍', restart: true },
      ],
    },
  ],
};
