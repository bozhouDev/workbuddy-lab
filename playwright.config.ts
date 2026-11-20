import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { chromium, defineConfig } from '@playwright/test';

/**
 * 若当前 Playwright 版本对应的浏览器未下载，自动回退到本机缓存中最新的 headless shell
 */
function resolveExecutablePath(): string | undefined {
  const defaultPath = chromium.executablePath();
  if (existsSync(defaultPath)) return undefined;

  const cacheRoots = [
    join(homedir(), 'Library/Caches/ms-playwright'),
    join(homedir(), '.cache/ms-playwright'),
  ];
  for (const root of cacheRoots) {
    if (!existsSync(root)) continue;
    const dirs = readdirSync(root)
      .filter((d) => d.startsWith('chromium_headless_shell-'))
      .sort()
      .reverse();
    for (const d of dirs) {
      for (const sub of ['chrome-headless-shell-mac-arm64', 'chrome-headless-shell-mac-x64', 'chrome-headless-shell-linux64']) {
        const candidate = join(root, d, sub, 'chrome-headless-shell');
        if (existsSync(candidate)) return candidate;
      }
    }
  }
  return undefined;
}

const executablePath = resolveExecutablePath();

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  use: {
    baseURL: 'http://127.0.0.1:4322',
    headless: true,
    launchOptions: executablePath ? { executablePath } : undefined,
  },
  webServer: {
    command: 'node scripts/serve-dist.mjs',
    url: 'http://127.0.0.1:4322',
    reuseExistingServer: !process.env.CI,
    timeout: 15_000,
  },
});
