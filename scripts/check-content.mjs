/**
 * 构建前的内容检查
 *
 * 为什么需要：Astro 对 reference() 引用不存在的条目只打 [ERROR] 日志，构建仍然算成功。
 * 这里补一道硬检查，失败时以非 0 退出，让 npm run build 直接停下。
 *
 * 用法：
 *   node scripts/check-content.mjs            日常构建：检查图文里的 simRoute / facts 引用都存在
 *   node scripts/check-content.mjs --release  发布前：另外要求 facts.yaml 里没有 pending 条目
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, basename, extname, relative } from 'node:path';
import { parse } from 'yaml';

const ROOT = process.cwd();
const DOCS_DIR = join(ROOT, 'src/content/docs');
const ROUTES_DIR = join(ROOT, 'src/content/routes');
const FACTS_FILE = join(ROOT, 'src/content/facts.yaml');
const isRelease = process.argv.includes('--release');

/** 递归列出目录下的 .md / .mdx 文件 */
function listDocs(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return listDocs(p);
    return ['.md', '.mdx'].includes(extname(p)) ? [p] : [];
  });
}

/** 取出文件开头 --- 之间的 frontmatter 并解析成对象 */
function readFrontmatter(file) {
  const m = readFileSync(file, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return m ? parse(m[1]) ?? {} : {};
}

const errors = [];

// 已有的路线 ID = routes 目录下 yaml 的文件名
const routeIds = new Set(
  readdirSync(ROUTES_DIR)
    .filter((f) => f.endsWith('.yaml'))
    .map((f) => basename(f, '.yaml')),
);

// 已有的事实 ID 和状态
const facts = parse(readFileSync(FACTS_FILE, 'utf8')) ?? [];
const factIds = new Set(facts.map((f) => f.id));

// 逐篇检查图文的引用
for (const file of listDocs(DOCS_DIR)) {
  const fm = readFrontmatter(file);
  const where = relative(ROOT, file);
  if (fm.simRoute && !routeIds.has(fm.simRoute)) {
    errors.push(`${where}：simRoute「${fm.simRoute}」没有对应的路线文件`);
  }
  for (const id of fm.facts ?? []) {
    if (!factIds.has(id)) errors.push(`${where}：facts 里的「${id}」在 facts.yaml 中不存在`);
  }
}

// 发布闸门：不允许还有待核对的事实
if (isRelease) {
  for (const f of facts.filter((f) => f.status === 'pending')) {
    errors.push(`facts.yaml：「${f.id}」还是 pending，发布前要在真机上核对`);
  }
}

if (errors.length) {
  console.error(`内容检查没通过（${errors.length} 处）：\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log(isRelease ? '发布前内容检查通过' : '内容检查通过');
