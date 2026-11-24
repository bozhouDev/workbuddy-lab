import { expect, test, type Page } from '@playwright/test';

const route = '/simulator/?route=custom-model';
const guide = '/features/setup/custom-model/';
const demoAddress = 'https://api.example.invalid/v1';
const draftAddress = 'https://api.example.invalid';
const demoModel = 'gpt-6.2-sol';

const target = (page: Page, id: string) => page.locator(`[data-guided-target="${id}"]`);

test('从首页图文和 01 开局设置课程目录都能进入自定义模型陪练', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const links = page.locator('#features').getByRole('link');
  const labels = await links.allTextContents();
  const modelsIndex = labels.findIndex((label) => label.includes('模型与积分'));
  expect(labels[modelsIndex + 1]).toContain('配置自定义模型（以 GPT 为例）');
  await links.filter({ hasText: '配置自定义模型（以 GPT 为例）' }).click();
  await expect(page).toHaveURL(guide);
  await page.getByRole('link', { name: /去陪练/ }).click();
  await expect(page).toHaveURL(route);
  await expect(page.getByRole('button', { name: '好，去添加模型' })).toBeVisible();

  await page.goto('/simulator/');
  await page.getByRole('button', { name: '切换模拟课程' }).click();
  const chapter = page.getByRole('group', { name: '01 开局设置' });
  const courses = await chapter.getByRole('menuitem').allTextContents();
  expect(courses.map((course) => course.trim().slice(0, 3))).toEqual(['1.1', '1.2', '1.3']);
  await chapter.getByRole('menuitem', { name: /1\.3.*配置自定义模型/ }).click();
  await expect(page).toHaveURL(route);
  await expect(page.getByRole('button', { name: '好，去添加模型' })).toBeVisible();
  await expect(page.getByRole('link', { name: /对应图文/ })).toHaveAttribute('href', guide);

  await openModelForm(page);
  const formStep = page.getByRole('button', { name: /第 5 \/ 7 步.*填写并保存/ });
  await expect(formStep).toBeVisible();
  await page.getByRole('link', { name: /对应图文/ }).click();
  await expect(page).toHaveURL(guide);
  await page.getByRole('link', { name: /去陪练/ }).click();
  await expect(page).toHaveURL(route);
  await expect(page.getByText('WorkBuddy，我帮你', { exact: true })).toBeVisible();
  await expect(formStep).toHaveCount(0);
  await expect(page.getByRole('dialog', { name: '添加模型' })).toHaveCount(0);
  await page.getByRole('button', { name: '好，去添加模型' }).click();
  await expect(page.getByRole('button', { name: /第 1 \/ 7 步.*打开设置/ })).toBeVisible();
  await target(page, 'avatar').click();
  await target(page, 'avatarMenu.settings').click();
  const modelsStep = page.getByRole('button', { name: /第 2 \/ 7 步.*找到模型页/ });
  await expect(modelsStep).toBeVisible();
  await page.reload();
  await expect(modelsStep).toBeVisible();
});

test('新课使用常驻七步目录和独立添加模型弹窗', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(route);
  await page.getByRole('button', { name: '好，去添加模型' }).click();
  await expect(page.getByRole('button', { name: /第 1 \/ 7 步.*打开设置/ })).toBeVisible();
  await target(page, 'avatar').click();
  await target(page, 'avatarMenu.settings').click();
  const progress = page.getByRole('button', { name: /第 2 \/ 7 步.*找到模型页/ });
  await expect(progress).toBeVisible();
  await progress.click();
  await expect(page.getByRole('button', { name: /3\.\s*添加模型/ })).toBeDisabled();
  await page.getByRole('button', { name: /1\.\s*打开设置.*回看/ }).click();
  await expect(page.getByRole('button', { name: /第 1 \/ 7 步/ })).toBeVisible();
  await target(page, 'avatar').click();
  await target(page, 'avatarMenu.settings').click();
  await target(page, 'settings.tab.models').click();
  await target(page, 'customModel.add').click();
  const dialog = page.getByRole('dialog', { name: '添加模型' });
  await expect(dialog).toBeVisible();
  await expect(page.getByRole('button', { name: /第 4 \/ 7 步.*选择供应商/ })).toBeVisible();
  const supplier = dialog.getByRole('button', { name: /供应商/ });
  await expect(supplier).toContainText('通用 Token Plan');
  await supplier.click();
  await expect(dialog.getByRole('group', { name: 'Token Plan', exact: true })).toBeVisible();
  await expect(dialog.getByRole('group', { name: '其他', exact: true }).getByRole('option', { name: '自定义', exact: true })).toHaveCount(1);
  await dialog.getByRole('searchbox', { name: '搜索供应商' }).press('Escape');
  await expect(dialog).toBeVisible();
  await expect(supplier).toBeFocused();
  await supplier.click();
  await dialog.getByRole('option', { name: 'Kimi Coding Plan', exact: true }).click();
  await expect(page.getByRole('button', { name: /第 4 \/ 7 步.*选择供应商/ })).toBeVisible();
  await expect(page.getByText(/选预设供应商时，接口地址通常已经填好/)).toBeVisible();
  await supplier.click();
  await dialog.getByRole('searchbox', { name: '搜索供应商' }).fill('自定义');
  await dialog.getByRole('option', { name: '自定义', exact: true }).click();
  await expect(page.getByRole('button', { name: /第 5 \/ 7 步.*填写并保存/ })).toBeVisible();
  await expect(dialog.getByLabel('接口地址')).toBeVisible();
  await expect(page.getByText('路径', { exact: true })).toHaveCount(0);
});

async function openModelForm(page: Page) {
  await page.getByRole('button', { name: '好，去添加模型' }).click();
  for (const id of ['avatar', 'avatarMenu.settings', 'settings.tab.models', 'customModel.add']) {
    const control = target(page, id);
    await expect(control).toHaveClass(/sim-ring/);
    await control.click();
  }
  const form = page.getByRole('form', { name: '添加模型' });
  await form.getByRole('button', { name: /供应商/ }).click();
  await form.getByRole('option', { name: '自定义', exact: true }).click();
  await form.getByText('本轮练习配置单', { exact: true }).click();
  return form;
}

test('自定义模型陪练：先完整带练切换和发送，再进入独立小测', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const requests: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).hostname === 'api.example.invalid') requests.push(request.url());
  });
  await page.goto(route);
  await expect(page.getByRole('button', { name: '好，去添加模型' })).toBeVisible({ timeout: 8000 });
  await expect(page.getByText('今天我们给 WorkBuddy 加一个练习模型（以gpt模型为例）。', { exact: false })).toBeVisible();
  const form = await openModelForm(page);
  const key = await page.getByLabel('本轮练习 API Key').innerText();
  expect(key).toMatch(/^sk-demo-[a-f0-9]{16}$/);

  const save = form.getByRole('button', { name: '保存', exact: true });
  const testConnection = form.getByRole('button', { name: '测试连接' });
  const address = form.getByLabel('接口地址');
  const keyInput = form.getByLabel('API Key', { exact: true });
  const modelName = form.getByLabel('模型名称');
  const nextField = form.getByRole('button', { name: '下一项', exact: true });

  await expect(save).toBeDisabled();
  await expect(address).toHaveClass(/sim-ring/);
  await expect(testConnection).toBeDisabled();
  await address.fill(draftAddress);
  await expect(address).toHaveClass(/sim-ring/);
  await nextField.click();
  await expect(keyInput).toHaveClass(/sim-ring/);
  await expect(keyInput).toHaveAttribute('type', 'password');
  await nextField.click();
  await expect(form.getByRole('alert')).toContainText('填写练习 API Key');

  const invalidPracticeKey = 'sk-not-this-round';
  await keyInput.fill(invalidPracticeKey);
  await nextField.click();
  await expect(form.getByRole('alert')).toContainText('核对本轮练习 API Key');
  expect(await page.evaluate(() => JSON.stringify({ ...sessionStorage }))).not.toContain(invalidPracticeKey);
  await expect(page.getByRole('complementary', { name: '泊舟陪练栏' })).not.toContainText(invalidPracticeKey);

  await keyInput.fill(key);
  await nextField.click();
  await expect(modelName).toHaveClass(/sim-ring/);
  await modelName.fill('GPT');
  await nextField.click();
  await expect(form.getByRole('alert')).toContainText('完整模型 ID');
  await modelName.fill(demoModel);
  await nextField.click();
  await expect(testConnection).toHaveClass(/sim-ring/);

  const advanced = form.getByText('高级配置', { exact: true });
  await advanced.click();
  await expect(form.getByText(/先用默认值跑通/)).toBeVisible();
  await advanced.click();
  await keyInput.fill('');
  await testConnection.click();
  await expect(keyInput).toHaveClass(/sim-ring/);
  await expect(form.getByRole('alert')).toContainText('填写练习 API Key');
  await keyInput.fill(key);
  await testConnection.click();
  await expect(form.getByRole('alert')).toContainText('核对接口地址');
  await expect(save).toBeDisabled();
  await expect(address).toHaveClass(/sim-ring/);
  await expect(page.getByText(/把表单里的地址和配置单里的完整地址逐字对一遍/)).toBeVisible();
  await form.getByRole('button', { name: '给我提示' }).click();
  await expect(page.getByText(/这份练习草稿少了末尾的/)).toBeVisible();
  await address.fill(demoAddress);
  await expect(modelName).toHaveValue(demoModel);
  await expect(keyInput).toHaveValue(key);
  await expect(testConnection).toHaveClass(/sim-ring/);
  await testConnection.click();
  await expect(form.getByRole('status')).toHaveText('连接成功');
  await expect(page.getByText(/因为这份配置单的完整地址带有/)).toBeVisible();
  await expect(page.getByRole('list', { name: '已保存的自定义模型' }).getByText(demoModel)).toHaveCount(0);

  // 取消只关闭表单；即使已经测过，也不能把模型加进列表。
  await form.getByRole('button', { name: '取消' }).click();
  await expect(form).toBeHidden();
  await expect(target(page, 'customModel.add')).toHaveClass(/sim-ring/);
  await expect(page.getByRole('list', { name: '已保存的自定义模型' }).getByText(demoModel)).toHaveCount(0);
  await target(page, 'customModel.add').click();
  await address.fill(demoAddress);
  await nextField.click();
  await keyInput.fill(key);
  await nextField.click();
  await modelName.fill(demoModel);
  await nextField.click();
  await testConnection.click();
  await expect(save).toBeEnabled();

  await modelName.fill('GPT');
  await expect(save).toBeDisabled();
  await modelName.fill(demoModel);
  await expect(save).toBeDisabled();
  await testConnection.click();
  await save.click();
  await expect(page.getByRole('list', { name: '已保存的自定义模型' }).getByText(demoModel)).toBeVisible();
  await expect(page.getByRole('button', { name: /第 6 \/ 7 步.*返回并切换模型/ })).toBeVisible();

  await target(page, 'settings.back').click();
  const model = target(page, 'composer.model');
  const pickCustom = target(page, 'modelMenu.pickCustom');
  const coach = page.getByRole('complementary', { name: '泊舟陪练栏' });
  const hint = coach.getByRole('button', { name: '给我提示', exact: true });
  const startQuiz = coach.getByRole('button', { name: '记住了，考我一下' });
  const quizPrompt = coach.getByText('回复下方的模型标签写着哪个名字？', { exact: true });
  const send = target(page, 'composer.send');
  await expect(model).toContainText('Hy4 flash');
  await expect(model).toHaveClass(/sim-ring/);
  await expect(hint).toHaveCount(0);
  await expect(startQuiz).toHaveCount(0);
  await send.click();
  await expect(coach.getByText(/先切换，再发消息/)).toBeVisible();
  await expect(page.getByLabel('本次回复使用的模型')).toHaveCount(0);
  await model.click();
  await expect(pickCustom).toHaveClass(/sim-ring/);
  await target(page, 'modelMenu.pickFree').click();
  await expect(pickCustom).toBeVisible();
  await expect(model).toContainText('Hy4 flash');
  await pickCustom.click();
  await expect(model).toHaveText(demoModel);
  await expect(page.getByRole('button', { name: /第 7 \/ 7 步.*发送验证/ })).toBeVisible();
  const practiceMessage = page.getByRole('textbox', { name: '练习消息' });
  await expect(practiceMessage).toHaveValue('你是什么模型？');
  await expect(practiceMessage).not.toBeEditable();
  await expect(page.getByText(/放好了练习问题「你是什么模型？」/)).toBeVisible();
  await expect(page.getByLabel('本次回复使用的模型')).toHaveCount(0);
  await expect(send).toBeEnabled();
  await send.click();
  await expect(page.getByText('你是什么模型？', { exact: true })).toBeVisible();
  await expect(page.getByLabel('本次回复使用的模型')).toHaveText(demoModel);
  await expect(page.getByText(`你好！本次对话使用的是 ${demoModel}。（模拟回复）`, { exact: true })).toBeVisible();
  await expect(coach.getByText(/模型标签记录的是这条消息实际用的模型/)).toBeVisible();
  await expect(startQuiz).toBeVisible();
  await expect(quizPrompt).toHaveCount(0);
  await expect(coach.getByRole('button', { name: demoModel, exact: true })).toHaveCount(0);
  await page.reload();
  await expect(startQuiz).toBeVisible();
  await expect(page.getByLabel('本次回复使用的模型')).toHaveText(demoModel);

  await startQuiz.click();
  await expect(model).toContainText('Hy4 flash');
  await expect(model).not.toHaveClass(/sim-ring/);
  await expect(hint).toBeVisible();
  await expect(page.getByLabel('本次回复使用的模型')).toHaveCount(0);
  await hint.click();
  await expect(model).toHaveClass(/sim-ring/);
  await model.click();
  await expect(pickCustom).not.toHaveClass(/sim-ring/);
  await model.click();
  await expect(pickCustom).toHaveCount(0);
  await hint.click();
  await expect(model).toHaveClass(/sim-ring/);
  await model.click();
  await expect(model).not.toHaveClass(/sim-ring/);
  await expect(pickCustom).toHaveClass(/sim-ring/);
  await pickCustom.click();
  await expect(practiceMessage).toHaveValue('你是什么模型？');
  await expect(send).not.toHaveClass(/sim-ring/);
  await send.click();
  await expect(quizPrompt).toBeVisible();
  await expect(page.getByText('自定义模型小测', { exact: true }).first()).toBeVisible();
  await expect(page.getByLabel('本次回复使用的模型')).toHaveText(demoModel);
  await expect(coach.getByRole('button', { name: '读本节图文教程' })).toHaveCount(0);
  await coach.getByRole('button', { name: 'Hy4 flash', exact: true }).click();
  await expect(coach.getByText(/再看一眼回复下方/)).toBeVisible();
  await expect(coach.getByRole('button', { name: '读本节图文教程' })).toHaveCount(0);
  await page.reload();
  await expect(page.getByLabel('本次回复使用的模型')).toHaveText(demoModel);
  await coach.getByRole('button', { name: demoModel, exact: true }).click();
  await expect(coach.getByText(/核对正确/)).toBeVisible();
  await expect(coach.getByRole('button', { name: '读本节图文教程' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => {
    const stored = Object.entries(sessionStorage)
      .find(([key]) => key.startsWith('wblab:guided:') && key.endsWith(':custom-model'))?.[1];
    const snapshot = stored ? JSON.parse(stored) : null;
    if (snapshot?.stepId !== 'summary') return null;
    const ids = snapshot.feed.map((item: { id: string }) => item.id);
    return ids.length - new Set(ids).size;
  })).toBe(0);
  expect(requests).toEqual([]);

  await page.getByRole('button', { name: '重来本课' }).click();
  await expect(page.getByRole('button', { name: '好，去添加模型' })).toBeVisible();
  await expect(target(page, 'composer.model')).toHaveText('Hy4 flash');
  await openModelForm(page);
  await expect(page.getByLabel('本轮练习 API Key')).not.toHaveText(key);
  await expect(page.getByRole('list', { name: '已保存的自定义模型' }).getByText(demoModel)).toHaveCount(0);
});

test('窄桌面刷新后仍使用同一轮练习 Key 并能继续填写', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 800 });
  await page.goto(route);
  const form = await openModelForm(page);
  const key = await page.getByLabel('本轮练习 API Key').innerText();
  await form.getByLabel('接口地址').fill(draftAddress);
  await form.getByRole('button', { name: '下一项' }).click();
  await form.getByLabel('API Key', { exact: true }).fill('sk-not-to-be-stored');
  await page.reload();
  await expect(form).toBeVisible();
  await form.getByText('本轮练习配置单', { exact: true }).click();
  await expect(page.getByLabel('本轮练习 API Key')).toHaveText(key);
  await expect(form.getByLabel('API Key', { exact: true })).toBeEmpty();
  await expect(form.getByLabel('接口地址')).toBeEmpty();
  await expect(form.getByLabel('接口地址')).toHaveClass(/sim-ring/);
  await expect(form.getByRole('button', { name: '测试连接' })).toBeVisible();

  await page.getByTitle('回到 是什么 阶段').click();
  await openModelForm(page);
  await expect(page.getByLabel('本轮练习 API Key')).toHaveText(key);
});
