import { expect, test } from '@playwright/test';

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

    // 1. 是什么
    await expect(page.getByRole('button', { name: '好，开始认界面' })).toBeVisible();
    await page.getByRole('button', { name: '好，开始认界面' }).click();

    // 2. 动手：首页 7 块核心区清单出现
    await expect(page.getByText('首页 7 块核心区')).toBeVisible();

    // 点「快捷场景标签」代码开发 -> 标签变黑且下方推荐任务实时切换
    await page.getByRole('button', { name: '代码开发' }).click();
    await expect(page.getByText('做个今日待办清单的网站')).toBeVisible();
    await expect(page.getByText('已认 1 / 7')).toBeVisible();

    // 点左侧「分组」-> 展开项目下的对话，清单打勾「最近与左侧分组」
    await page.locator('[data-coach-act="groupsList"]').click();
    await expect(page.getByText('已认 2 / 7')).toBeVisible();

    // 点「左下角头像」-> 弹出真机同款头像菜单
    await page.locator('[data-coach-act="avatar"]').click();
    await expect(page.getByText('Buddy加油站')).toBeVisible();
    await expect(page.getByText('已认 3 / 7')).toBeVisible();

    // 点「+ 菜单」-> 弹出两级模式面板
    await page.locator('[data-coach-act="plus"]').click();
    await expect(page.getByText('当前为默认模式')).toBeVisible();
    await expect(page.getByText('已认 4 / 7')).toBeVisible();

    // 点非探索清单项「模型选择」-> 真的弹出模型菜单 + 泊舟虚线解释
    await page.locator('[data-coach-act="model"]').click();
    await expect(page.getByRole('button', { name: /Hy4 flash 限时免费/ })).toBeVisible();
    await expect(page.getByText('你点的是 · 模型选择')).toBeVisible();

    // 切换泊舟为「悬浮小窗」并支持放大/收起/停靠
    await page.getByRole('button', { name: '切换为可拖动悬浮小窗' }).click();
    await expect(page.getByText('可拖动小窗')).toBeVisible();
    await page.getByRole('button', { name: '放大小窗' }).click();
    await page.getByRole('button', { name: '收起为悬浮头像' }).click();
    await expect(page.getByRole('region', { name: '泊舟陪练悬浮球' })).toBeVisible();
    await page.getByRole('button', { name: '教练靠右侧' }).click();

    // 3. 看结果：发小任务看对话动效 + 右侧产物区滑出
    await page.getByRole('button', { name: /去试右侧产物区/ }).click();
    await expect(page.getByText('在左边点蓝圈里的「发送」按钮')).toBeVisible();
    await page.locator('[data-coach-act="send"]').click();
    await expect(page.getByText('刚生成')).toBeVisible({ timeout: 6000 });
    await expect(page.getByText('1. 先配好底子（5 分钟）')).toBeVisible();

    // 4. 记住：10 秒实景验证 -> 点「选择分组」通过 -> 总结表
    await page.getByRole('button', { name: '记住了，考我一下' }).click();
    await expect(page.getByText(/发任务前最该先点哪个按钮/)).toBeVisible();
    await page.locator('[data-coach-act="group"]').click();
    await expect(page.getByText('5.11.3 主界面速查表')).toBeVisible({ timeout: 5000 });
  });

  test('1120px 笔记本无横向滚动；<1024px 显示电脑端提示', async ({ page }) => {
    await page.setViewportSize({ width: 1120, height: 760 });
    await page.goto('/simulator/?route=interface');
    await expect(page.getByRole('button', { name: '好，开始认界面' })).toBeVisible();
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

  test('1.1 系统设置：挪出 C 盘 + 开桌面通知', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/simulator/?route=settings');

    await page.getByRole('button', { name: '好，跟我去调设置' }).click();
    await page.locator('[data-guided-target="avatar"]').click();
    await page.locator('[data-guided-target="avatarMenu.settings"]').click();
    await page.locator('[data-guided-target="settings.changePath"]').click();
    await expect(page.getByText('已移出系统盘')).toBeVisible();
    await page.locator('[data-guided-target="settings.enableNotify"]').click();
    await expect(page.getByText('已授权开启')).toBeVisible();
    await expect(page.getByText('通用设置 5 项速查')).toBeVisible({ timeout: 5000 });
  });

  test('1.2 分组与文件夹：不选分组掉临时目录 -> 选分组干净归档', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/simulator/?route=groups');

    await page.getByRole('button', { name: '先看「不选分组」会怎样' }).click();
    await page.locator('[data-guided-target="composer.send"]').click();
    await expect(page.getByText('掉进临时目录')).toBeVisible({ timeout: 6000 });

    await page.getByRole('button', { name: '明白了，回去选分组再发' }).click();
    await page.locator('[data-guided-target="composer.group"]').click();
    await page.locator('[data-guided-target="groupMenu.pickPractice"]').click();
    await page.locator('[data-guided-target="composer.send"]').click();
    await expect(page.getByText('已归档到分组')).toBeVisible({ timeout: 6000 });
    await expect(page.getByText('推荐的 5 层文件夹结构')).toBeVisible({ timeout: 6000 });
  });

  test('1.3 记忆与进化：开记忆看效果 -> 体验记歪 -> 删除纠偏', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/simulator/?route=memory');

    await page.getByRole('button', { name: '先看「关着记忆」的效果' }).click();
    await page.locator('[data-guided-target="composer.send"]').click();
    await expect(page.getByText('云端记忆未开启，本次未加载历史偏好')).toBeVisible({ timeout: 6000 });

    // 等陪练走到「点头像」这一步再点，提前点只会弹解释、不会开菜单
    await expect(page.getByText('点头像开记忆')).toBeVisible();
    await page.locator('[data-guided-target="avatar"]').click();
    await page.locator('[data-guided-target="avatarMenu.memory"]').click();
    await page.locator('[data-guided-target="settings.toggleCloudMemory"]').click();
    await page.locator('[data-guided-target="settings.toggleLocalMemory"]').click();
    await page.locator('[data-guided-target="settings.back"]').click();

    await page.locator('[data-guided-target="composer.send"]').click();
    await expect(page.getByText('已引用云端记忆')).toBeVisible({ timeout: 6000 });

    await page.getByRole('button', { name: '看看「记歪」会怎样' }).click();
    await page.locator('[data-guided-target="composer.send"]').click();
    await expect(page.getByText(/Here is your weekly project update/)).toBeVisible({ timeout: 6000 });

    // 等陪练走到「点头像」这一步再点，提前点只会弹解释、不会开菜单
    await expect(page.getByText('点头像去清掉歪记忆')).toBeVisible();
    await page.locator('[data-guided-target="avatar"]').click();
    await page.locator('[data-guided-target="avatarMenu.memory"]').click();
    await page.locator('[data-guided-target="settings.deleteBadMemory"]').click();
    await page.locator('[data-guided-target="settings.back"]').click();

    await page.locator('[data-guided-target="composer.send"]').click();
    await expect(page.getByText('开记忆 vs 记歪清理效果对比')).toBeVisible({ timeout: 6000 });
  });

  test('1.4 个性化：指令 & 1.5 模型与积分（含每句积分消耗展示）', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/simulator/?route=personalization');

    await page.getByRole('button', { name: '先不设指令发一次看看' }).click();
    await page.locator('[data-guided-target="composer.send"]').click();
    await expect(page.getByText('张伟')).toBeVisible({ timeout: 6000 });

    // 等陪练走到「点头像」这一步再点，提前点只会弹解释、不会开菜单
    await expect(page.getByText('点头像进设置')).toBeVisible();
    await page.locator('[data-guided-target="avatar"]').click();
    await page.locator('[data-guided-target="avatarMenu.settings"]').click();
    await page.locator('[data-guided-target="settings.tab.personalization"]').click();
    await page.locator('[data-guided-target="settings.editRules"]').click();
    await page.locator('[data-guided-target="settings.fillRules"]').click();
    await page.locator('[data-guided-target="settings.saveRules"]').click();
    await expect(page.getByText('已生效', { exact: true })).toBeVisible();
    await page.locator('[data-guided-target="settings.back"]').click();

    await page.locator('[data-guided-target="composer.send"]').click();
    await expect(page.getByText('个性化 3 个框的分工')).toBeVisible({ timeout: 6000 });

    // 从 1.4 底部一键切到 1.5 模型与积分
    await page.getByRole('button', { name: /下一节：1.5 模型与积分/ }).click();
    await page.getByRole('button', { name: '用极致档跑一次看扣多少' }).click();
    await page.locator('[data-guided-target="composer.send"]').click();
    await expect(page.getByText('预计消耗 ✧ 0.8 ~ 12.50')).toBeVisible({ timeout: 6000 });
    await expect(page.getByText('已消耗 ✧ 8.64')).toBeVisible({ timeout: 6000 });
    await expect(page.getByText('✧ 1191.36')).toBeVisible();

    await page.getByRole('button', { name: '回首页换免费模型对比' }).click();
    await page.locator('[data-guided-target="composer.model"]').click();
    await page.locator('[data-guided-target="modelMenu.pickFree"]').click();
    await page.locator('[data-guided-target="composer.send"]').click();
    await expect(page.getByText('已消耗 ✧ 0.00').first()).toBeVisible({ timeout: 6000 });
    await expect(page.getByText('同一个 300 字任务 · 模型消耗对比')).toBeVisible({ timeout: 6000 });
  });
});
