/**
 * 退出模拟器时回到哪里：从站内文章页进来就回那篇文章，否则回首页
 */
export function getExitTarget(): string {
  try {
    if (document.referrer) {
      const ref = new URL(document.referrer);
      if (ref.origin === window.location.origin && !ref.pathname.startsWith('/simulator')) {
        return ref.href;
      }
    }
  } catch {
    // 忽略非法 referrer
  }
  return '/';
}
