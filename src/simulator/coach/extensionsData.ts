/**
 * 专家·技能·连接器页的模拟数据
 *
 * 名称、描述、计数都照 5.11.3 真机截图抄（2026-11 截图时的数），图标一律用色块 + 首字，不放官方 logo。
 * 计数含义已在 5.11.3 前端代码里核实：
 *   - 推荐 / 精选：⚡ = use_count（悬停「使用量」），⬇ = install_count（悬停「安装量」）
 *   - SkillHub：⬇ = downloads（悬停「下载量」），☆ = stars（悬停「收藏量」）
 */

/** 一张专家卡片 */
export interface ExpertCard {
  id: string;
  name: string;
  desc: string;
  tags: string[];
  /** ⚡ 使用量 */
  use: string;
  color: string;
  official?: boolean;
  abilities?: string[];
  skills?: string[];
  author?: string;
  version?: string;
}

/** 一张技能卡片（推荐 / 精选 / SkillHub / 搜索结果通用） */
export interface SkillCard {
  id: string;
  name: string;
  desc: string;
  color: string;
  /** 推荐标签：⚡ 使用量 */
  use?: string;
  /** 推荐标签：⬇ 安装量 */
  install?: string;
  /** SkillHub：⬇ 下载量 */
  downloads?: string;
  /** SkillHub：☆ 收藏量 */
  stars?: string;
  paid?: boolean;
  needsKey?: boolean;
  source?: string;
  license?: string;
}

/** 一张连接器卡片 */
export interface ConnectorCard {
  id: string;
  name: string;
  desc: string;
  color: string;
}

/** 专家页默认列表（不搜索时） */
export const EXPERTS_DEFAULT: ExpertCard[] = [
  { id: 'xhs', name: '小红书运营专家', desc: '选题、标题、封面文案一条龙，按平台规则改写笔记', tags: ['营销增长'], use: '2485.77w', color: '#ef4444', official: true },
  { id: 'finance', name: '财报分析师', desc: '读懂三张表，标出异常科目和同比变化', tags: ['金融投资'], use: '612.4w', color: '#0f766e', official: true },
  { id: 'mini', name: '微信小程序开发专家', desc: '从需求到上线：页面结构、云开发、审核要点', tags: ['技术工程'], use: '388.2w', color: '#16a34a', official: true },
  { id: 'legal', name: '合同审查顾问', desc: '逐条标出不利条款与缺失条款，给出修改建议', tags: ['法律咨询'], use: '205.9w', color: '#7c3aed' },
  { id: 'hr', name: '招聘 JD 写手', desc: '按岗位画像写 JD、筛简历、出面试题', tags: ['运营人力'], use: '96.3w', color: '#ea580c' },
  { id: 'teacher', name: '学习规划师', desc: '按目标和可用时间拆出每周学习计划', tags: ['教育学习'], use: '71.8w', color: '#2563eb' },
];

/** 搜「ppt」后的结果（真机：搜索 "ppt" 找到 40 位专家） */
export const EXPERTS_PPT: ExpertCard[] = [
  {
    id: 'ppt',
    name: 'PPT制作专家',
    desc: '把文稿和数据做成结构清晰、结论先行的汇报 PPT',
    tags: ['内容创作', 'PPT'],
    use: '121.62w',
    color: '#c2410c',
    official: true,
    abilities: [
      '先定汇报对象和 30 秒结论，再排页',
      '每页一个观点，标题即结论',
      '数据页标出处，没有出处的数字会提醒你补',
    ],
    skills: ['WPS Office 全家桶', '网页 PPT（演讲版）'],
    author: 'WorkBuddy 官方',
    version: 'v2.3',
  },
  { id: 'ppt-visual', name: 'PPT视觉美化师', desc: '配色、版式、图标统一，旧 PPT 一键换新', tags: ['设计'], use: '31.5w', color: '#db2777' },
  { id: 'data', name: '数据分析专家', desc: '清洗、透视、出图，结论写成大白话', tags: ['数据智能'], use: '7.83w', color: '#0891b2' },
  { id: 'speech', name: '演讲稿教练', desc: '把 PPT 讲稿改成口语化、有节奏的发言', tags: ['内容创作'], use: '3.12w', color: '#4f46e5' },
];

/** 精选技能（推荐页顶部一行） */
export const FEATURED_SKILLS: SkillCard[] = [
  { id: 'ima', name: '腾讯ima', desc: 'ima笔记与知识库管理（读取、写入、检索）', use: '40.65w', install: '75.29w', color: '#16a34a' },
  { id: 'pdfkit', name: '腾讯文档 PDFKit', desc: 'PDF全能工具箱，覆盖阅读分析、自然语言编辑', use: '45.37w', install: '38.47w', color: '#dc2626' },
  { id: 'wecom', name: '企业微信套件', desc: '企业微信官方 CLI 套件，覆盖消息、邮件、日程', use: '62.41w', install: '30.98w', color: '#2563eb' },
];

/** 推荐标签下的技能网格 */
export const RECOMMEND_SKILLS: SkillCard[] = [
  { id: 'hallucination', name: 'AI 胡说检测器', desc: '把文档中的数字、事件和引用拆成核查项，逐条找出处', use: '3', install: '0', color: '#16a34a' },
  { id: 'web-ppt', name: '网页 PPT（演讲版）', desc: '把主题、文章或大纲做成一整套可全屏演讲的网页', use: '0', install: '0', color: '#1d4ed8' },
  { id: 'anti-fraud', name: '防骗大师', desc: '防骗·别转账：可疑点 + 本人/家人拒付话术', use: '0', install: '0', color: '#b91c1c' },
  { id: 'film', name: '小温拉片', desc: '逐帧拉片——把影片当成研究对象，拆镜头与节奏', use: '0', install: '0', color: '#ca8a04', paid: true },
  { id: 'finance-agent', name: '业财智能体', desc: '把话说清楚，把账算明白——面向中小微企业', use: '54', install: '18', color: '#dc2626', needsKey: true },
  { id: 'xhs-comment', name: '小红书抖音评论分析', desc: '自动抓取并分析小红书、抖音评论，生成词云和结论', use: '0', install: '0', color: '#e11d48' },
];

/** SkillHub 标签下的技能网格（⬇ 下载量 / ☆ 收藏量） */
export const SKILLHUB_SKILLS: SkillCard[] = [
  { id: 'coder', name: '编程大神.Skill', desc: '写代码、读报错、补测试，一条龙', downloads: '1212.32w', stars: '134', color: '#111318' },
  { id: 'excel-pro', name: 'Excel 公式助手', desc: '用大白话描述需求，生成公式与透视表', downloads: '386.5w', stars: '92', color: '#15803d' },
  { id: 'meeting', name: '会议纪要整理', desc: '录音/文字稿 → 决议、待办、负责人', downloads: '201.7w', stars: '61', color: '#7c3aed' },
  { id: 'resume', name: '简历优化', desc: '按 JD 关键词改写简历，标出缺失项', downloads: '88.4w', stars: '40', color: '#0e7490' },
  { id: 'xhs-title', name: '爆款标题生成', desc: '按平台规则批量出标题，附点击理由', downloads: '64.2w', stars: '18', color: '#e11d48' },
  { id: 'poster', name: '海报设计', desc: '输入活动信息，出可编辑海报', downloads: '41.9w', stars: '12', color: '#ea580c' },
];

/** 搜「wps」的结果：两个同名技能，教学员怎么挑（真机：⬇78.14w ☆5 vs ⬇105.51w ☆180） */
export const WPS_RESULTS: SkillCard[] = [
  {
    id: 'wps-a',
    name: 'WPS Office 全家桶',
    desc: 'WPS 文字、表格、演示的读写与格式处理',
    downloads: '78.14w',
    stars: '5',
    color: '#c2410c',
    source: '个人开发者上传',
    license: '未声明',
  },
  {
    id: 'wps-b',
    name: 'WPS Office 全家桶',
    desc: '用自然语言操作 WPS 文字 / 表格 / 演示：保留公式、批注与样式',
    downloads: '105.51w',
    stars: '180',
    color: '#c2410c',
    source: 'SkillHub · 认证开发者',
    license: 'MIT',
  },
];

/** 输入框 / 菜单里的技能（内置 + 已安装，真机「技能 (27)」，这里只列前几个） */
export const SLASH_SKILLS_BASE: Array<{ name: string; desc: string }> = [
  { name: 'docx', desc: '创建、编辑 Word 文档' },
  { name: 'pdf', desc: '读取、合并、拆分 PDF' },
  { name: 'xlsx', desc: '读写 Excel 表格' },
  { name: 'pptx', desc: '生成和修改 PPT' },
];

/** 连接器网格（照真机截图顺序） */
export const CONNECTORS: ConnectorCard[] = [
  { id: 'tdx', name: '通达信', desc: '通过通达信 MCP 查询全球股票行情数据', color: '#dc2626' },
  { id: 'stock', name: '腾讯自选股', desc: '直连腾讯自选股，实时掌握毫秒级行情与资讯', color: '#ef4444' },
  { id: 'qqmail', name: 'QQ邮箱', desc: '收发、搜索和整理 QQ 邮件，用自然语言管理', color: '#f59e0b' },
  { id: 'ima', name: 'ima', desc: '腾讯AI知识管家，连接后支持搜索、读取和写入', color: '#16a34a' },
  { id: 'lexiang', name: '乐享知识库', desc: '搜索、创建和管理乐享知识库中的文档', color: '#0ea5e9' },
  { id: 'tdoc', name: '腾讯文档', desc: '创建、编辑和协作腾讯文档，用自然语言管理', color: '#2563eb' },
  { id: 'meeting', name: '腾讯会议', desc: '通过命令行创建、查询和管理腾讯会议', color: '#1d4ed8' },
  { id: 'wecom', name: '企业微信', desc: '企业微信官方 CLI 套件，覆盖消息、邮件、日程', color: '#0284c7' },
  { id: 'feishu', name: '飞书', desc: '通过命令行管理飞书/Lark 全产品能力（仅个人版）', color: '#0f766e' },
  { id: 'dingtalk', name: '钉钉', desc: '通过命令行管理钉钉全产品能力：AI 表格、日程', color: '#3b82f6' },
  { id: 'survey', name: '腾讯问卷', desc: '创建、管理和分析腾讯问卷，用自然语言快速出题', color: '#22c55e' },
  { id: 'tapd', name: 'TAPD', desc: '管理需求、缺陷、任务和迭代，查询项目进度', color: '#6366f1' },
  { id: 'weiyun', name: '微云', desc: '查看、下载、删除微云文件，并且提供上传', color: '#0ea5e9' },
  { id: 'kdocs', name: '金山文档|WPS云文档', desc: '金山文档官方 Skill，对话即操作知识库与文档', color: '#1e40af' },
  { id: 'github', name: 'GitHub', desc: '仓库、Issue、PR 的查询与管理', color: '#111318' },
];

/** 飞书连接器的「可用功能」（教学抽象，真机列表以实际授权页为准） */
export const FEISHU_CAPABILITIES: Array<{ name: string; risk?: boolean }> = [
  { name: '读取云文档' },
  { name: '创建文档' },
  { name: '录入多维表格' },
  { name: '发送消息', risk: true },
];
