import { expect, test, type Page } from '@playwright/test';

/**
 * 按顺序走一节陪练课
 * - 'btn:文字'：点陪练栏里的按钮
 * - 'home'：点侧栏「新建任务」回首页（目标在首页输入框、当前不在首页时）
 * - 其余：课程目标 ID，先等它亮起蓝圈（说明陪练已经在等这一步）再点，避免点早了被当成随手点
 */
/** 第 3、4 章走课用的窗口宽度，可用 SIM_WIDTH=1024 环境变量换窄屏再跑一遍 */
const WALK_WIDTH = Number(process.env.SIM_WIDTH ?? 1440);

async function walkLesson(page: Page, steps: string[]) {
  for (const step of steps) {
    if (step.startsWith('btn:')) {
      await page.getByRole('button', { name: step.slice(4), exact: true }).click({ timeout: 10000 });
    } else if (step === 'home') {
      await page.getByRole('button', { name: '新建任务' }).first().click();
    } else {
      const target = page.locator(`[data-guided-target="${step}"]`).first();
      await expect(target, `等待目标 ${step} 亮起`).toHaveClass(/sim-ring/, { timeout: 10000 });
      await target.click();
    }
  }
}

test.describe('M1 首页与文章页验证', () => {
  test('首页在 390px 手机端无横向滚动', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasOverflow).toBe(false);
    await expect(page.getByText('复制链接，发到电脑')).toBeVisible();
  });

  test('认识界面文章页在 390px 无横向滚动且带泊舟陪练入口卡', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/features/basics/interface/');
    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasOverflow).toBe(false);
    const simLink = page.locator('main a[href="/simulator/?route=interface"]').first();
    await expect(simLink).toBeVisible();
    await expect(simLink).toContainText('泊舟带你实操一遍');
  });
});

test.describe('泊舟陪练模拟器：第 1 课 0.4 认识界面', () => {
  test('完整走通 4 段循环 + 快捷标签联动 + 最近分组 + 教练悬浮小窗切换', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/simulator/?route=interface');

    await expect(page.getByRole('button', { name: '好，开始认界面' })).toBeVisible();
    await page.getByRole('button', { name: '好，开始认界面' }).click();

    await expect(page.getByText('首页 7 块核心区')).toBeVisible();

    await page.getByRole('button', { name: '代码开发' }).click();
    await expect(page.getByText('做个今日待办清单的网站')).toBeVisible();
    await expect(page.getByText('已认 1 / 7')).toBeVisible();

    await page.locator('[data-coach-act="groupsList"]').click();
    await expect(page.getByText('已认 2 / 7')).toBeVisible();

    await page.locator('[data-coach-act="avatar"]').click();
    await expect(page.getByText('Buddy加油站')).toBeVisible();
    await expect(page.getByText('已认 3 / 7')).toBeVisible();

    await page.locator('[data-coach-act="plus"]').click();
    await expect(page.getByText('当前为默认模式')).toBeVisible();
    await expect(page.getByText('已认 4 / 7')).toBeVisible();

    await page.locator('[data-coach-act="model"]').click();
    await expect(page.getByRole('button', { name: /Hy4 flash 限时免费/ })).toBeVisible();
    await expect(page.getByText('你点的是 · 模型选择')).toBeVisible();

    await page.getByRole('button', { name: '切换为可拖动悬浮小窗' }).click();
    await expect(page.getByText('可拖动小窗')).toBeVisible();
    await page.getByRole('button', { name: '放大小窗' }).click();
    await page.getByRole('button', { name: '收起为悬浮头像' }).click();
    await expect(page.getByRole('region', { name: '泊舟陪练悬浮球' })).toBeVisible();
    await page.getByRole('button', { name: '教练靠右侧' }).click();

    await page.getByRole('button', { name: /去试右侧产物区/ }).click();
    await expect(page.getByText('在左边点蓝圈里的 发送 按钮')).toBeVisible();
    await page.locator('[data-coach-act="send"]').click();
    await expect(page.getByText('刚生成')).toBeVisible({ timeout: 6000 });
    await expect(page.getByText('1. 先配好底子（5 分钟）')).toBeVisible();

    await page.getByRole('button', { name: '记住了，考我一下' }).click();
    await expect(page.getByText(/发任务前最该先点哪个按钮/)).toBeVisible();
    await page.locator('[data-coach-act="group"]').click();
    await expect(page.getByText('5.11.3 主界面速查表')).toBeVisible({ timeout: 5000 });
  });

  test('1280px 笔记本侧栏默认完整展开且无横向滚动；<1024px 显示电脑端提示', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/simulator/?route=interface');
    await expect(page.getByRole('button', { name: '好，开始认界面' })).toBeVisible();
    await expect(page.getByText('新建任务')).toBeVisible();
    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasOverflow).toBe(false);

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByText('泊舟陪练模拟器需要在电脑上打开')).toBeVisible();
  });
});

test.describe('第 03/04 章图文 + 第 01 章 5 节陪练模拟器', () => {
  test('第 03 章技能与第 04 章助理图文页正常渲染且无横向溢出', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const url of ['/features/extend/skills/', '/features/automation/assistant/']) {
      await page.goto(url);
      const hasOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth
      );
      expect(hasOverflow).toBe(false);
      await expect(page.locator('main h1')).toBeVisible();
    }
  });

  test('1.1 系统设置：1280 宽展开侧栏 + 完整通用设置可点解释 + 挪出 C 盘 + 开通知', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/simulator/?route=settings');
    await expect(page.getByText('新建任务')).toBeVisible();

    await page.getByRole('button', { name: '好，跟我去调设置' }).click();
    await page.locator('[data-guided-target="avatar"]').click();
    await page.locator('[data-guided-target="avatarMenu.settings"]').click();

    await page.getByRole('button', { name: /直接连接/ }).click();
    await expect(page.getByRole('button', { name: '跟随系统' })).toBeVisible();
    await page.getByRole('button', { name: '跟随系统' }).click();
    await expect(page.getByText(/自动复用电脑的代理设置/)).toBeVisible();

    await page.locator('[data-guided-target="settings.changePath"]').click();
    await expect(page.getByText('已移出系统盘')).toBeVisible();
    await page.locator('[data-guided-target="settings.enableNotify"]').click();
    await expect(page.getByText('已授权开启')).toBeVisible();
    await expect(page.getByText('通用设置 5 项速查')).toBeVisible({ timeout: 5000 });
  });

  test('1.2 分组与文件夹：先看隐患再标红 -> 选择本地文件夹绑定目录 -> 最近列表可回看对比', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/simulator/?route=groups');

    await page.getByRole('button', { name: '先看 不选分组 会怎样' }).click();
    await page.locator('[data-guided-target="composer.send"]').click();
    await expect(page.getByRole('button', { name: '标出隐患在哪' })).toBeVisible({ timeout: 6000 });
    await page.getByRole('button', { name: '标出隐患在哪' }).click();
    await page.getByRole('button', { name: '好，去关联本地文件夹' }).click();

    await page.locator('[data-guided-target="composer.group"]').click();
    await page.locator('[data-guided-target="groupMenu.pickLocalFolder"]').click();
    await page.locator('[data-guided-target="folderPicker.pickPractice"]').click();
    await page.locator('[data-guided-target="composer.send"]').click();
    await expect(page.getByText('已归档到分组')).toBeVisible({ timeout: 6000 });
    await expect(page.getByText('刚才两次真实保存路径对比')).toBeVisible({ timeout: 6000 });

    await page.getByRole('button', { name: '① 未选分组 · 周报整理' }).click();
    await expect(page.getByText('临时目录', { exact: true })).toBeVisible();
  });

  test('1.3 记忆与进化：点开昨天记录不卡死 + 关开关标已暂停 + 真表格渲染 + 刷新保留进度 + 删歪纠偏', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/simulator/?route=memory');

    // 先点开左侧「昨天 · 约定周报格式」，再点推进按钮应自动回到新对话，不卡死
    await page.getByRole('button', { name: '昨天 · 约定周报格式' }).click();
    await expect(page.getByText(/记住我的周报习惯/)).toBeVisible();
    await page.getByRole('button', { name: '看看 关着记忆 会怎样' }).click();
    await expect(page.locator('[data-guided-target="composer.send"]')).toBeVisible();

    // 在等待发送时又去翻看昨天记录，应出现「回到当前新对话继续」按钮，点击后立刻恢复发送按钮
    await page.getByRole('button', { name: '昨天 · 约定周报格式' }).click();
    await page.getByRole('button', { name: '← 回到当前新对话继续' }).click();
    await page.locator('[data-guided-target="composer.send"]').click();

    await expect(page.getByRole('button', { name: '标出问题在哪' })).toBeVisible({ timeout: 6000 });
    await page.getByRole('button', { name: '标出问题在哪' }).click();

    await page.locator('[data-guided-target="avatar"]').click();
    await page.locator('[data-guided-target="avatarMenu.memory"]').click();
    await expect(page.getByText('已暂停').first()).toBeVisible();

    await page.locator('[data-guided-target="settings.toggleCloudMemory"]').click();
    await expect(page.getByText('生效中').first()).toBeVisible();
    await page.locator('[data-guided-target="settings.toggleLocalMemory"]').click();
    await page.locator('[data-guided-target="settings.back"]').click();

    await page.locator('[data-guided-target="composer.send"]').click();
    await expect(page.getByText('已引用云端记忆')).toBeVisible({ timeout: 6000 });
    await expect(page.locator('main table')).toBeVisible();

    // 验证刷新页面不丢当前进度
    await expect(page.getByRole('button', { name: '看看 记歪 会怎样' })).toBeVisible({ timeout: 6000 });
    await page.reload();
    await expect(page.getByRole('button', { name: '看看 记歪 会怎样' })).toBeVisible({ timeout: 6000 });

    await page.getByRole('button', { name: '看看 记歪 会怎样' }).click();
    await page.locator('[data-guided-target="composer.send"]').click();
    await expect(page.getByText(/Here is your weekly project update/)).toBeVisible({ timeout: 6000 });

    await page.locator('[data-guided-target="avatar"]').click();
    await page.locator('[data-guided-target="avatarMenu.memory"]').click();
    await page.locator('[data-guided-target="settings.deleteBadMemory"]').click();
    await expect(page.getByText('刚才亲眼看到的真实输出对比')).toBeVisible({ timeout: 6000 });
  });

  test('1.4 个性化：指令（先看原样后标红）& 1.5 模型与积分（每句积分 + 历史回看）', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/simulator/?route=personalization');

    await page.getByRole('button', { name: '先不设指令发一次看看' }).click();
    await page.locator('[data-guided-target="composer.send"]').click();
    await expect(page.getByRole('button', { name: '标出瞎编的地方' })).toBeVisible({ timeout: 6000 });
    await page.getByRole('button', { name: '标出瞎编的地方' }).click();

    await page.locator('[data-guided-target="avatar"]').click();
    await page.locator('[data-guided-target="avatarMenu.settings"]').click();
    await page.locator('[data-guided-target="settings.tab.personalization"]').click();
    await page.locator('[data-guided-target="settings.editRules"]').click();
    await page.locator('[data-guided-target="settings.fillRules"]').click();
    await page.locator('[data-guided-target="settings.saveRules"]').click();
    await expect(page.getByText('已生效', { exact: true })).toBeVisible();
    await page.locator('[data-guided-target="settings.back"]').click();

    await page.locator('[data-guided-target="composer.send"]').click();
    await expect(page.getByText('刚才两次真实输出对比')).toBeVisible({ timeout: 6000 });

    await page.getByRole('button', { name: /下一节：1.5 模型与积分/ }).click();
    await page.getByRole('button', { name: '用极致档跑一次看扣多少' }).click();
    await page.locator('[data-guided-target="composer.send"]').click();
    await expect(page.getByText('预计消耗 ✧ 0.8 ~ 12.50').first()).toBeVisible({ timeout: 6000 });
    await expect(page.getByText('已消耗 ✧ 8.64').first()).toBeVisible({ timeout: 6000 });
    await expect(page.getByText('✧ 1191.36')).toBeVisible();

    await page.getByRole('button', { name: '回首页换免费模型对比' }).click();
    await page.locator('[data-guided-target="composer.model"]').click();
    await page.locator('[data-guided-target="modelMenu.pickFree"]').click();
    await page.locator('[data-guided-target="composer.send"]').click();
    await expect(page.getByText('已消耗 ✧ 0.00').first()).toBeVisible({ timeout: 6000 });
    await expect(page.getByText('同一个 300 字任务 · 刚才实测消耗对比')).toBeVisible({ timeout: 6000 });

    await page.getByRole('button', { name: '① 极致 1.00x · 碰头会整理' }).click();
    await expect(page.getByText('已消耗 ✧ 8.64').first()).toBeVisible();
  });
});

test.describe('第 02 章「发任务」全部 7 节泊舟陪练模拟器', () => {
  test('2.1 添加资料（@ 引用）与 2.2 模式（默认覆盖 vs Plan 改第 3 步）', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/simulator/?route=attach');

    await page.getByRole('button', { name: '先看 没引用文件 会怎样' }).click();
    await page.locator('[data-guided-target="composer.send"]').click();
    await expect(page.getByRole('button', { name: '标出问题在哪' })).toBeVisible({ timeout: 6000 });
    await page.getByRole('button', { name: '标出问题在哪' }).click();

    await page.locator('[data-guided-target="composer.mention"]').click();
    await page.locator('[data-guided-target="mentionMenu.pickChatLog"]').click();
    await page.locator('[data-guided-target="composer.send"]').click();
    await expect(page.getByText('静安寺青松咖啡二楼包间').first()).toBeVisible({ timeout: 6000 });

    // 切到 2.2 模式
    await page.getByRole('button', { name: /下一节：2.2 模式/ }).click();
    await page.getByRole('button', { name: '先看 默认模式 直接跑会怎样' }).click();
    await page.locator('[data-guided-target="composer.send"]').click();
    await expect(page.getByRole('button', { name: '标出问题在哪' })).toBeVisible({ timeout: 6000 });
    await page.getByRole('button', { name: '标出问题在哪' }).click();

    await page.locator('[data-guided-target="composer.plus"]').click();
    await page.locator('[data-guided-target="plusMenu.togglePlan"]').click();
    await page.locator('[data-guided-target="composer.send"]').click();
    await expect(page.locator('[data-guided-target="chat.confirmPlan"]')).toBeVisible({ timeout: 6000 });
    await page.locator('[data-guided-target="chat.confirmPlan"]').click();
    await expect(page.getByText('三种模式一眼分清')).toBeVisible({ timeout: 6000 });
  });

  test('2.3 权限（默认权限审批卡片拦截）与 2.4 写清任务（5 要素）', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/simulator/?route=permission');

    await page.getByRole('button', { name: '先看 开完全访问 的翻车现场' }).click();
    await page.locator('[data-guided-target="composer.send"]').click();
    await expect(page.getByRole('button', { name: '标出误删的地方' })).toBeVisible({ timeout: 6000 });
    await page.getByRole('button', { name: '标出误删的地方' }).click();

    await page.locator('[data-guided-target="composer.permission"]').click();
    await page.locator('[data-guided-target="permMenu.toggleFullAccess"]').click();
    await page.locator('[data-guided-target="composer.send"]').click();
    await expect(page.locator('[data-guided-target="approval.askPlain"]')).toBeVisible({ timeout: 6000 });
    await page.locator('[data-guided-target="approval.askPlain"]').click();
    await expect(page.getByText('刚才两次权限对比')).toBeVisible({ timeout: 6000 });

    // 切到 2.4 写清任务
    await page.getByRole('button', { name: /下一节：2.4 写清任务/ }).click();
    await page.getByRole('button', { name: '先看 一句话模糊发 会怎样' }).click();
    await page.locator('[data-guided-target="composer.send"]').click();
    await expect(page.getByRole('button', { name: '标出 3 处问题' })).toBeVisible({ timeout: 6000 });
    await page.getByRole('button', { name: '标出 3 处问题' }).click();
    await page.getByRole('button', { name: '换成 5 要素任务单重发' }).click();
    await page.locator('[data-guided-target="composer.send"]').click();
    await expect(page.getByText('什么时候用 5 要素 vs 什么时候让 AI 采访你')).toBeVisible({ timeout: 6000 });
  });

  test('2.5 看执行过程 -> 2.6 检查结果 -> 2.7 二次修改全闭环', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/simulator/?route=execution');

    await page.getByRole('button', { name: '发出去看看执行过程' }).click();
    await page.locator('[data-guided-target="composer.send"]').click();
    await expect(page.locator('[data-guided-target="approval.cancel"]')).toBeVisible({ timeout: 6000 });
    await page.locator('[data-guided-target="approval.cancel"]').click();
    await expect(page.getByText('盯着执行过程的 3 条口诀')).toBeVisible({ timeout: 6000 });

    await page.getByRole('button', { name: /下一节：2.6 检查结果/ }).click();
    await page.getByRole('button', { name: '标出右侧隐藏的 2 处错' }).click();
    await page.getByRole('button', { name: '试一下 万能查路径口令' }).click();
    await page.locator('[data-guided-target="chat.followupSend"]').click();
    await expect(page.getByText('交差前必查的 5 眼清单')).toBeVisible({ timeout: 6000 });

    await page.getByRole('button', { name: /下一节：2.7 二次修改/ }).click();
    await page.getByRole('button', { name: '看看说 重做一版 会怎样' }).click();
    await page.locator('[data-guided-target="chat.followupSend"]').click();
    await expect(page.getByRole('button', { name: '标出被改乱的地方' })).toBeVisible({ timeout: 6000 });
    await page.getByRole('button', { name: '标出被改乱的地方' }).click();
    await page.locator('[data-guided-target="chat.followupSend"]').click();
    await expect(page.getByText('模糊催改 vs 精准局部修改对比')).toBeVisible({ timeout: 6000 });
  });
});

test.describe('第 03、04 章泊舟陪练模拟器', () => {
  test('3.1–3.4：怎么选 → 专家 → 装技能看懂 ⚡⬇ → 做自己的技能', async ({ page }) => {
    await page.setViewportSize({ width: WALK_WIDTH, height: 900 });
    await page.goto('/simulator/?route=choose');
    await walkLesson(page, [
      'btn:去看看入口在哪', 'nav.extensions', 'ext.tab.experts', 'ext.tab.connectors',
      'composer.send', 'btn:标出问题', 'composer.send',
    ]);
    await expect(page.getByText('你缺什么 → 用什么')).toBeVisible({ timeout: 8000 });

    await page.getByRole('button', { name: /下一节：3.2 专家/ }).click();
    await walkLesson(page, [
      'btn:先看不召唤专家', 'composer.send', 'btn:标出问题', 'nav.extensions', 'ext.tab.experts',
      'experts.search', 'experts.card', 'experts.summon',
    ]);
    await expect(page.getByText('已成功召唤专家「PPT制作专家」')).toBeVisible();
    await walkLesson(page, ['composer.send']);
    await expect(page.getByText('同一个问题，两次回答')).toBeVisible({ timeout: 8000 });

    await page.getByRole('button', { name: /下一节：3.3 技能/ }).click();
    await walkLesson(page, [
      'btn:先看不用技能', 'composer.send', 'btn:标出问题', 'nav.extensions', 'skills.statUse',
    ]);
    await expect(page.getByText(/使用量 40\.65w/)).toBeVisible();
    await walkLesson(page, ['skills.statInstall']);
    await expect(page.getByText(/安装量 75\.29w/)).toBeVisible();
    await walkLesson(page, ['skills.tab.skillhub', 'skills.statDownload']);
    await expect(page.getByText(/下载量 1212\.32w/)).toBeVisible();
    await walkLesson(page, ['skills.search', 'skills.pickCard', 'skills.install', 'skills.installConfirm']);
    await expect(page.getByText('已安装(16)')).toBeVisible();
    await walkLesson(page, ['composer.slash', 'slashMenu.pick', 'composer.send']);
    await expect(page.getByText('同一张表，两次结果')).toBeVisible({ timeout: 8000 });

    await page.getByRole('button', { name: /下一节：3.4 做一个自己的技能/ }).click();
    await walkLesson(page, [
      'btn:先看偷懒只说一句', 'composer.send', 'btn:标出问题', 'nav.extensions', 'skills.addMenu',
      'skills.addMenu.create', 'composer.send', 'nav.extensions', 'skills.installed',
    ]);
    await expect(page.getByText('用户自定义').first()).toBeVisible();
    await walkLesson(page, ['home', 'composer.slash', 'slashMenu.pick', 'composer.send']);
    await expect(page.getByText('做一个技能的 4 步')).toBeVisible({ timeout: 8000 });
  });

  test('3.5–3.7：连接飞书（对话内扫码）→ 自己做天气 MCP 并信任 → 资料库', async ({ page }) => {
    await page.setViewportSize({ width: WALK_WIDTH, height: 900 });
    await page.goto('/simulator/?route=connectors');
    await walkLesson(page, [
      'btn:先看没接连接器', 'composer.send', 'nav.extensions', 'ext.tab.connectors', 'connectors.add',
      'composer.send', 'chat.actionCard', 'nav.extensions', 'connectors.card',
    ]);
    await expect(page.getByText('可用功能').first()).toBeVisible();
    await walkLesson(page, ['home', 'composer.send', 'composer.send', 'btn:标出问题', 'composer.send']);
    await expect(page.getByText('同一个连接器，两种说法')).toBeVisible({ timeout: 8000 });

    await page.getByRole('button', { name: /下一节：3.6 自定义连接器/ }).click();
    await walkLesson(page, [
      'btn:先问问明天下不下雨', 'composer.send', 'btn:标出问题', 'composer.send', 'nav.extensions',
      'ext.tab.connectors', 'connectors.custom', 'mcp.fill', 'mcp.submit', 'mcp.trust',
    ]);
    await expect(page.getByText('1/1 个工具已启用')).toBeVisible();
    await walkLesson(page, ['home', 'composer.send']);
    await expect(page.getByText('调用 my-weather · get_forecast：返回 3 天预报')).toBeVisible({ timeout: 8000 });
    await expect(page.getByText('同一个问题，两次回答')).toBeVisible({ timeout: 8000 });

    await page.getByRole('button', { name: /下一节：3.7 资料库/ }).click();
    await walkLesson(page, [
      'btn:看看堆满了会怎样', 'composer.send', 'btn:标出问题', 'nav.library', 'library.newCategory',
      'library.upload', 'composer.plus', 'plusMenu.addFile',
    ]);
    // 点菜单外面把 + 菜单关掉后，+ 号亮圈，点它能重新打开（展开的子菜单会盖住问候语，所以直接派发点击事件）
    await page.getByText('WorkBuddy，我帮你').dispatchEvent('click');
    await expect(page.locator('[data-guided-target="plusMenu.library"]')).toHaveCount(0);
    await expect(page.locator('[data-guided-target="composer.plus"]')).toHaveClass(/sim-ring/);
    await page.locator('[data-guided-target="composer.plus"]').click();
    await walkLesson(page, ['plusMenu.library', 'libraryPicker.pick']);
    await expect(page.getByText('已选择 1 项')).toBeVisible();
    await walkLesson(page, ['libraryPicker.confirm', 'composer.send']);
    await expect(page.getByText('资料库建库 4 条')).toBeVisible({ timeout: 8000 });
  });

  test('4.1 从模板 + 从对话各建一个定时任务，卡片上编辑试跑、进任务页核对产物 → 4.2 手机切到自己的电脑', async ({ page }) => {
    await page.setViewportSize({ width: WALK_WIDTH, height: 900 });
    await page.goto('/simulator/?route=schedule');
    await walkLesson(page, [
      'btn:看看直接设自动会怎样', 'nav.schedule', 'schedule.newMenu', 'schedule.fromTemplate', 'schedule.pickTemplate',
    ]);
    // 新建定时任务表单按真机截图：重复 / 时间 / 有效期 / 推送到企业微信
    await expect(page.getByText('消息推送到企业微信').first()).toBeVisible();
    await expect(page.getByText('每周 周日').first()).toBeVisible();
    await walkLesson(page, ['schedule.createConfirm']);
    await expect(page.getByText('⏰ 每周日 10:00')).toBeVisible();
    await walkLesson(page, ['schedule.newMenu', 'schedule.fromChat']);
    // 从对话新建：输入框预填真机文案
    await expect(page.getByText(/帮我创建一个定时任务：每天 08:30 执行/).first()).toBeVisible();
    await walkLesson(page, [
      'composer.send', 'nav.schedule', 'schedule.editTask',
    ]);
    // 编辑页按真机：有效期下面是连接器，没有执行权限
    await expect(page.getByText('还没有选择连接器')).toBeVisible();
    await expect(page.locator('[data-view="schedule"]').getByText('执行权限')).toHaveCount(0);
    await walkLesson(page, ['schedule.run', 'schedule.openTask', 'schedule.checkSource']);
    await expect(page.getByText(/距试跑约 14 小时/)).toBeVisible();
    // 任务页右侧有「下一次运行」
    await expect(page.locator('[data-view="schedule"]').getByText(/下一次运行 明天/)).toBeVisible();
    await walkLesson(page, ['schedule.permFull', 'nav.schedule', 'schedule.viewRecords']);
    await expect(page.getByText('测试运行成功').first()).toBeVisible();
    // 运行记录表的列名对照真机
    await expect(page.getByText('耗时', { exact: true })).toBeVisible();
    await walkLesson(page, ['schedule.fastForward']);
    await expect(page.getByText('已错过计划时间，将补跑一次')).toBeVisible();
    // 手快连点时，陪练消息仍按步骤顺序出现（旧消息不会晚到插到后面）
    const order = await page.evaluate(() => {
      const text = document.body.innerText;
      return [text.indexOf('点底部的「运行」'), text.indexOf('成功只说明跑完了'), text.indexOf('这句就是你唯一的保险'), text.indexOf('要等 3 天')];
    });
    expect(order.every((v) => v >= 0)).toBe(true);
    expect(order).toEqual([...order].sort((x, y) => x - y));
    await expect(page.getByText('定时任务清单')).toBeVisible({ timeout: 8000 });

    await page.getByRole('button', { name: /下一节：4.2 助理/ }).click();
    await walkLesson(page, ['btn:去连手机', 'nav.mobileLink', 'mobile.toggle', 'btn:假装用手机扫好了（模拟）', 'phone.send']);
    await expect(page.getByText(/我现在在云电脑上运行/)).toBeVisible();
    await walkLesson(page, ['phone.deviceSwitch', 'phone.modeComputer']);
    // 选中电脑后，手机标题下的小字变成电脑名
    await expect(page.getByRole('button', { name: '选择设备' })).toContainText('学员的 MacBook Pro');
    await walkLesson(page, ['phone.send']);
    await expect(page.getByText('云电脑 vs 本地电脑')).toBeVisible({ timeout: 8000 });
    // 窄屏侧栏自动折叠，「最近」列表不显示，只在宽屏检查
    if (WALK_WIDTH >= 1140) await expect(page.getByText('来自手机 · 读书会筹备纪要').first()).toBeVisible();
  });

  test('1100 宽侧栏折叠也能找到手机入口；中途逛走后侧栏蓝圈能带回当前页面', async ({ page }) => {
    await page.setViewportSize({ width: 1100, height: 800 });
    await page.goto('/simulator/?route=assistant');
    await walkLesson(page, ['btn:去连手机', 'nav.mobileLink']);
    // 弹窗被点掉后，折叠侧栏里的手机按钮还在，能再打开
    await page.getByText('WorkBuddy，我帮你').click();
    await expect(page.locator('[data-guided-target="mobile.toggle"]')).toHaveCount(0);
    await page.locator('[data-guided-target="nav.mobileLink"]').click();
    await walkLesson(page, ['mobile.toggle']);
    await expect(page.getByText('移动端 App')).toBeVisible();

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/simulator/?route=choose');
    await walkLesson(page, ['btn:去看看入口在哪', 'nav.extensions']);
    // 正等着点「专家」标签时，学员跑回了首页
    await page.getByRole('button', { name: '新建任务' }).first().click();
    const back = page.locator('[data-guided-target="nav.extensions"]');
    await expect(back).toHaveClass(/sim-ring/);
    await back.click();
    await walkLesson(page, ['ext.tab.experts']);
  });
});
