import { FolderIcon, SearchIcon, SendPlaneIcon } from '../shell/icons';
import type { GuidedShellState } from './guidedTypes';
import { FakeQr, makeTargetKit, type TargetKitProps } from './targetKit';

interface Props extends TargetKitProps {
  shell: GuidedShellState;
}

/**
 * 资料库页（对照 01-资料库界面.png）
 * 左列：新建 / 最近 / 本地产物 / 我的资料(+) / 团队空间(+)；右侧：最近访问表格
 */
export function LibraryView5113(props: Props) {
  const { shell } = props;
  const kit = makeTargetKit(props);
  const hasCats = shell.libraryCategories.length > 0;

  return (
    <div className="relative flex-1 min-w-0 flex bg-white overflow-hidden" data-view="library">
      {/* 资料库二级栏 */}
      <div className="w-[220px] shrink-0 bg-[#f7f7f7] border-r border-[#ebebeb] flex flex-col text-[13px]">
        <div className="h-12 px-4 flex items-center justify-between">
          <span className="text-[17px] font-bold text-[#111318]">资料库</span>
          <SearchIcon size={14} className="text-[#5c5f66]" />
        </div>
        <div className="px-2 flex flex-col gap-0.5">
          {['新建', '最近', '本地产物'].map((x) => (
            <button
              key={x}
              type="button"
              onClick={kit.aside(x, x === '本地产物' ? '各分组里 AI 生成的文件会汇总到这里，满意的可以收进「我的资料」。' : `「${x}」是资料库的常用入口。`)}
              className={`text-left border-0 rounded-lg px-2.5 py-1.5 cursor-pointer ${x === '最近' ? 'bg-[#eaeae8] font-medium' : 'bg-transparent hover:bg-[#efefef]'}`}
            >
              {x}
            </button>
          ))}
        </div>
        <div className="px-4 pt-4 pb-1 flex items-center justify-between text-[12px] text-[#8c9099]">
          <span>我的资料 ∨</span>
          <button
            type="button"
            data-guided-target="library.newCategory"
            aria-label="在我的资料里新建"
            onClick={kit.click('library.newCategory', '新建分类', '在「我的资料」里建分类。')}
            className={`relative w-6 h-6 rounded-md border-0 bg-transparent hover:bg-[#eaeae8] text-[15px] text-[#4a4f57] cursor-pointer ${kit.ring('library.newCategory')}`}
          >
            +{kit.callout('library.newCategory', 'right', 'center')}
          </button>
        </div>
        <div className="px-2 flex flex-col gap-0.5">
          {shell.libraryCategories.map((c) => {
            const files = shell.libraryFiles.filter((f) => f.category === c);
            const isTarget = c === '当前项目';
            return (
              <div key={c} className="sim-msg-rise">
                <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-[#efefef]">
                  <span className="inline-flex items-center gap-1.5 text-[#2b2f36]">
                    <FolderIcon size={13} /> {c}
                  </span>
                  {isTarget && files.length === 0 && (
                    <button
                      type="button"
                      data-guided-target="library.upload"
                      onClick={kit.click('library.upload', '上传到 当前项目', '往「当前项目」里放这周真要用的资料。')}
                      className={`relative h-6 px-1.5 rounded-md border-0 bg-white text-[11px] text-accent-700 font-semibold cursor-pointer ${kit.ring('library.upload')}`}
                    >
                      上传
                      {kit.callout('library.upload', 'right', 'center')}
                    </button>
                  )}
                </div>
                {files.map((f) => (
                  <div key={f.name} className="sim-msg-rise pl-7 pr-2 py-1 text-[12px] text-[#4a4f57] truncate">📄 {f.name}</div>
                ))}
              </div>
            );
          })}
        </div>
        <div className="px-4 pt-4 pb-1 flex items-center justify-between text-[12px] text-[#8c9099]">
          <span>团队空间 ∨</span>
          <span>+</span>
        </div>
        <div className="mt-auto px-4 py-2.5 border-t border-[#ebebeb] text-[11.5px] text-[#8c9099]">已使用 3.14 MB / 5 GB</div>
      </div>

      {/* 右侧：最近 */}
      <div className="flex-1 min-w-0 px-7 py-6 overflow-y-auto">
        <div className="text-[22px] font-bold text-[#111318]">最近</div>
        <div className="flex gap-1 mt-4 text-[13px]">
          <span className="px-3 py-1.5 rounded-lg bg-[#f1f1ef] font-semibold">最近访问</span>
          <span className="px-3 py-1.5 text-[#5c5f66]">与我共享</span>
          <span className="px-3 py-1.5 text-[#5c5f66]">我的收藏</span>
        </div>
        <div className="mt-4 text-[12.5px]">
          <div className="grid grid-cols-[2fr_1fr_1fr] text-[#8c9099] pb-2 border-b border-[#f0f0ee]">
            <span>名称</span>
            <span>位置</span>
            <span>访问时间</span>
          </div>
          {(hasCats ? shell.libraryFiles : []).map((f) => (
            <div key={f.name} className="sim-msg-rise grid grid-cols-[2fr_1fr_1fr] py-2 border-b border-[#f7f7f6]">
              <span className="truncate text-[#111318]">📄 {f.name}</span>
              <span className="text-[#5c5f66]">我的资料/{f.category}</span>
              <span className="text-[#8c9099] font-mono">刚刚</span>
            </div>
          ))}
          {shell.libraryFiles.length === 0 && <div className="py-6 text-[#9ea3ad]">还没有资料。先在左边「我的资料」点 + 建分类。</div>}
        </div>
      </div>
    </div>
  );
}

/**
 * + → 添加文件 → 资料库 弹出的「从资料库中选择」（文案来自 5.11.3 语言包 spaceLibrary.picker.*）
 * 页签 最近 / 我的文档 / 团队空间，表格 名称 / 所有者 / 位置 / 最近访问，底部「已选择 n 项」和 取消 / 确定
 */
export function LibraryPickerModal(props: Props) {
  const { shell } = props;
  const kit = makeTargetKit(props);
  const target = '差旅管理办法_2026版.pdf';
  const selected = shell.libraryPickerSelected;
  return (
    <div className="absolute inset-0 z-40 bg-black/25 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
      <div className="sim-pop-up w-full max-w-[620px] rounded-[18px] bg-white shadow-[0_24px_60px_rgba(17,19,24,0.25)] p-5 flex flex-col gap-3 text-[13px]">
        <div className="flex items-center justify-between">
          <span className="text-[16px] font-bold text-[#111318]">从资料库中选择</span>
          <span className="h-8 w-[180px] px-2.5 rounded-lg border border-[#e6e6e3] inline-flex items-center gap-1.5 text-[12.5px] text-[#9ea3ad]">
            <SearchIcon size={13} /> 搜索文档
          </span>
        </div>
        <div className="flex gap-1 text-[12.5px]">
          {['最近', '我的文档', '团队空间'].map((t) => (
            <span key={t} className={`px-3 py-1.5 rounded-lg ${t === '我的文档' ? 'bg-[#f1f1ef] font-semibold text-[#111318]' : 'text-[#5c5f66]'}`}>
              {t}
            </span>
          ))}
        </div>
        <div className="text-[12.5px]">
          <div className="grid grid-cols-[24px_2.2fr_0.7fr_1.3fr_0.9fr] gap-2 text-[#8c9099] pb-2 border-b border-[#f0f0ee]">
            <span />
            <span>名称</span>
            <span>所有者</span>
            <span>位置</span>
            <span>最近访问</span>
          </div>
          {shell.libraryFiles.map((f) => {
            const isTarget = f.name === target;
            const on = selected.includes(f.name);
            return (
              <button
                key={f.name}
                type="button"
                data-guided-target={isTarget ? 'libraryPicker.pick' : undefined}
                onClick={
                  isTarget
                    ? kit.click('libraryPicker.pick', f.name, '勾上它。文件名里带着版本，选的是哪份一眼就清楚。')
                    : kit.aside(f.name, `这份在「${f.category}」，和报销问题无关。这次只勾制度规范里的 ${target}。`)
                }
                className={`relative w-full grid grid-cols-[24px_2.2fr_0.7fr_1.3fr_0.9fr] gap-2 items-center py-2 border-0 border-b border-[#f7f7f6] text-left cursor-pointer rounded ${
                  on ? 'bg-accent-50' : 'bg-transparent hover:bg-[#fafaf9]'
                } ${isTarget ? kit.ring('libraryPicker.pick') : ''}`}
              >
                <span
                  className={`w-4 h-4 rounded border inline-flex items-center justify-center text-[10px] ${
                    on ? 'bg-accent-600 border-accent-600 text-white' : 'border-[#cfcfcb] bg-white'
                  }`}
                >
                  {on ? '✓' : ''}
                </span>
                <span className="truncate text-[#111318]">📄 {f.name}</span>
                <span className="text-[#5c5f66]">我</span>
                <span className="truncate text-[#5c5f66]">我的资料/{f.category}</span>
                <span className="text-[#8c9099] font-mono">刚刚</span>
                {isTarget && kit.callout('libraryPicker.pick', 'right', 'center')}
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="text-[12px] text-[#8c9099]">已选择 {selected.length} 项</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={kit.aside('取消', '不选文件就关掉。这一步先选好那份 2026 版再点确定。')}
              className="h-9 px-4 rounded-[10px] border-0 bg-[#f1f1ef] text-[13px] cursor-pointer"
            >
              取消
            </button>
            <button
              type="button"
              data-guided-target="libraryPicker.confirm"
              onClick={kit.click('libraryPicker.confirm', '确定', '选好了就点确定，文件会挂到输入框上。')}
              className={`relative h-9 px-4 rounded-[10px] border-0 bg-[#111318] text-white text-[13px] font-semibold cursor-pointer ${kit.ring('libraryPicker.confirm')}`}
            >
              确定
              {kit.callout('libraryPicker.confirm', 'top', 'end')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** 左下角「移动设备」小图标弹出的连接面板（文案来自设置 → 设备连接） */
export function MobileLinkPopover(props: Props) {
  const { shell } = props;
  const kit = makeTargetKit(props);
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="sim-pop-up absolute left-3 bottom-[52px] z-30 w-[300px] rounded-[16px] bg-white border border-[#e6e6e3] shadow-[0_18px_46px_rgba(17,19,24,0.18)] p-4 flex flex-col gap-3 text-[13px]"
    >
      <div>
        <div className="text-[14.5px] font-bold text-[#111318]">随时随地，操控你的电脑</div>
        <div className="text-[12px] text-[#6b7079] mt-1">同账号移动设备连接后，可同步查看任务、分组、会话与产物</div>
      </div>
      {shell.mobileLinkOn && (
        <div className="flex flex-col items-center gap-2">
          {/* 真机二维码上方有「移动端 App / 微信小程序」两个页签，这里只做展示 */}
          <div className="w-full grid grid-cols-2 rounded-[10px] bg-[#f1f1ef] p-0.5 text-[12px]">
            <span className="text-center py-1 rounded-[8px] bg-white font-semibold text-[#111318] shadow-sm">移动端 App</span>
            <span className="text-center py-1 text-[#8c9099]">微信小程序</span>
          </div>
          <FakeQr size={112} />
          <span className="text-[11.5px] text-[#8c9099]">用 WorkBuddy App 或微信小程序扫码（模拟）</span>
        </div>
      )}
      <div className="flex items-center justify-between rounded-[10px] bg-[#f7f7f6] px-3 py-2">
        <span className="text-[12.5px] text-[#111318]">允许移动设备远程连接</span>
        <button
          type="button"
          data-guided-target="mobile.toggle"
          aria-label="允许移动设备远程连接"
          onClick={kit.click('mobile.toggle', '允许移动设备远程连接', '打开后才能用手机连这台电脑。')}
          className={`relative w-9 h-5 rounded-full p-0.5 flex border-0 cursor-pointer ${shell.mobileLinkOn ? 'bg-[#10b981] justify-end' : 'bg-[#d6d6d2] justify-start'} ${kit.ring('mobile.toggle')}`}
        >
          <span className="w-4 h-4 rounded-full bg-white" />
          {kit.callout('mobile.toggle', 'right', 'center')}
        </button>
      </div>
    </div>
  );
}

/** 手机模拟面板：云端工作 / 连接电脑 两种方式 + 对话 */
export function PhonePanel(props: Props & { draft: string }) {
  const { shell, draft } = props;
  const kit = makeTargetKit(props);
  return (
    <div className="sim-slide-in-panel absolute right-4 top-4 bottom-4 z-20 w-[262px] rounded-[30px] bg-[#111318] p-2 shadow-[0_24px_60px_rgba(17,19,24,0.35)]" onClick={(e) => e.stopPropagation()}>
      <div className="h-full rounded-[24px] bg-[#f7f7f6] flex flex-col overflow-hidden text-[12.5px]">
        <div className="pt-3 pb-2 px-3 text-center border-b border-[#ebebeb] bg-white">
          <div className="text-[11px] text-[#8c9099]">手机端（模拟）</div>
          <div className="font-semibold text-[#111318]">WorkBuddy</div>
          <div className="mt-2 inline-flex rounded-full bg-[#f1f1ef] p-0.5 text-[11.5px]">
            <span className={`px-2.5 py-1 rounded-full ${shell.phoneMode === 'cloud' ? 'bg-white font-semibold shadow-sm' : 'text-[#5c5f66]'}`}>云端工作</span>
            <button
              type="button"
              data-guided-target="phone.modeComputer"
              onClick={kit.click('phone.modeComputer', '连接电脑', '切到「连接电脑」，活就会在你家里那台电脑上跑。')}
              className={`relative border-0 px-2.5 py-1 rounded-full cursor-pointer ${shell.phoneMode === 'computer' ? 'bg-white font-semibold shadow-sm' : 'bg-transparent text-[#5c5f66]'} ${kit.ring('phone.modeComputer')}`}
            >
              连接电脑
              {kit.callout('phone.modeComputer', 'bottom', 'end')}
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
          {shell.phoneMessages.map((m, i) => (
            <div
              key={i}
              className={`sim-msg-rise max-w-[88%] rounded-[12px] px-2.5 py-1.5 leading-[1.6] ${
                m.from === 'me'
                  ? 'self-end bg-[#111318] text-white'
                  : m.tone === 'warn'
                    ? 'self-start bg-[#fff1e8] text-[#9a3412]'
                    : m.tone === 'ok'
                      ? 'self-start bg-[#eef2ff] text-accent-700'
                      : 'self-start bg-white text-[#2b2f36]'
              }`}
            >
              {m.text}
            </div>
          ))}
        </div>
        <div className="p-2 bg-white border-t border-[#ebebeb] flex items-center gap-1.5">
          <div className={`flex-1 min-w-0 rounded-full bg-[#f4f4f5] px-3 py-1.5 truncate ${draft ? 'text-[#111318]' : 'text-[#9ea3ad]'}`}>{draft || '说点什么…'}</div>
          <button
            type="button"
            data-guided-target="phone.send"
            aria-label="手机发送"
            onClick={kit.click('phone.send', '手机发送', '跟着蓝圈来。')}
            className={`relative w-7 h-7 rounded-full border-0 bg-[#111318] text-white inline-flex items-center justify-center cursor-pointer ${kit.ring('phone.send')}`}
          >
            <SendPlaneIcon size={11} />
            {kit.callout('phone.send', 'top', 'end')}
          </button>
        </div>
      </div>
    </div>
  );
}
