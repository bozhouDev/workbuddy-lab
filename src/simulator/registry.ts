/**
 * 模拟器外壳的「元素 ID 注册表」
 *
 * 路线文件（routes/*.yaml）里的 spotlight / await 只能引用这里列出的 ID。
 * 外壳组件在对应 DOM 上写 data-sim-id="<ID>"，导览引擎按 ID 找元素、量位置。
 * 构建时 content.config.ts 会校验：路线里写了不存在的 ID 直接报错。
 *
 * 新增 ID 的规则：只加不改名（改名会让旧路线失效），用「区域.元素」两段或三段命名。
 */
export const SIM_IDS = [
  // 侧栏（严格对照 5.11.3 真机截图 C271020A）
  'sidebar.discoverApps', // 顶栏「发现应用」下拉胶囊
  'sidebar.newTask',
  'sidebar.assistant',
  'sidebar.extensions', // 专家·技能·连接器
  'sidebar.schedule', // 定时任务
  'sidebar.library', // 资料库
  'sidebar.discover', // 发现
  'sidebar.recent',
  'sidebar.groups',
  'sidebar.avatar', // 左下角头像（设置、记忆、积分入口）
  'sidebar.notify', // 左下角通知铃铛
  'sidebar.mobileConnect', // 左下角手机互联图标

  // 首页
  'home.title',
  'home.quickTags', // 创作文档 / 分析数据 … 一排快捷标签
  'home.suggestions', // 输入框下方推荐问题胶囊

  // 输入框（5.11.3 双层复合底座，对照 C271020A / C33256F5）
  'composer',
  'composer.input',
  'composer.plus',
  'composer.enhance', // 增强提示词星星按钮
  'composer.model',
  'composer.voice',
  'composer.send',
  'composer.group', // 底座下方「选择分组」
  'composer.permission', // 底座下方「默认权限」

  // + 一级菜单与二级子菜单（对照 5.11.3 真机截图 94D09E4D / B30662DB）
  'plusMenu',
  'plusMenu.files',
  'plusMenu.quoteFile', // 引用对话中的文件
  'plusMenu.filesSubmenu',
  'plusMenu.mode', // 二级「模式」面板（含 Plan / Ask 开关）
  'plusMenu.modeItem', // 一级菜单里的「模式 >」行
  'plusMenu.mode.plan',
  'plusMenu.mode.ask',
  'plusMenu.extensions',
  'plusMenu.expert',
  'plusMenu.skill',
  'plusMenu.connector',

  // 权限下拉（对照 71293BF1）
  'permissionMenu',
  'permissionMenu.fullAccess',

  // 分组下拉（对照 3F8134E9）
  'groupMenu',
  'groupMenu.new',
  'groupMenu.pickFolder',

  // 模型与 @ 下拉（对照 B3D4375C / C33256F5）
  'modelMenu',
  'atMenu',

  // 对话与产物区（对照 9059D785）
  'chat',
  'chat.lastReply',
  'chat.fileCard',
  'chat.plan', // Plan 模式给出的方案卡
  'artifacts', // 右侧产物区
  'artifacts.diff',

  // 底部审批卡片（对照 503AFD3E）
  'approvalDialog',
  'approvalDialog.path',
  'approvalDialog.allow',
  'approvalDialog.deny',
  'approvalDialog.other',
] as const;

export type SimId = (typeof SIM_IDS)[number];
