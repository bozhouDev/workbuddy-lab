import { useEffect, useId, useRef, useState, type ChangeEvent, type ComponentProps, type ReactNode } from 'react';
import { PRACTICE_DRAFT_ENDPOINT, PRACTICE_ENDPOINT, PRACTICE_MODEL_ID } from './customModelPractice';
import type { GuidedShellState } from './guidedTypes';
import { makeTargetKit, type TargetKitProps } from './targetKit';

type Practice = NonNullable<GuidedShellState['customModelPractice']>;
type PracticeGuideProps = TargetKitProps & { practice: Practice; onPracticeGuide: (html: string) => void };
const practiceFields = ['address', 'key', 'model'] as const;
type PracticeFieldName = (typeof practiceFields)[number];
type FieldIssue = { field: PracticeFieldName; message: string; fromTest: boolean };

const connectionCheckOrder: PracticeFieldName[] = ['key', 'address', 'model'];
const practiceRing = 'sim-ring ring-2 ring-blue-600';
const fieldLessons = {
  address: {
    label: '接口地址',
    missing: '请填写接口地址。',
    mismatch: '请核对接口地址，照练习草稿或配置单填写。',
    guide: `先在蓝圈里的「接口地址」填练习草稿 <code>${PRACTICE_DRAFT_ENDPOINT}</code>，然后点「下一项」。接口地址告诉 WorkBuddy 要把请求发往哪里。这个草稿故意留了一处小问题，我们测试时一起找。`,
  },
  key: {
    label: 'API Key',
    missing: '请填写练习 API Key。',
    mismatch: '请核对本轮练习 API Key，从本轮练习配置单复制整串。',
    guide: '展开「本轮练习配置单」，复制这轮以 <code>sk-</code> 开头的练习 API Key，粘贴到蓝圈里，再点「下一项」。服务商用它确认你有访问权限。输入变成圆点是正常的，这里只用配置单里的练习密钥。',
  },
  model: {
    label: '模型名称',
    missing: '请填写模型名称。',
    mismatch: '请按配置单填写完整模型 ID。',
    guide: `在「模型名称」里填 <code>${PRACTICE_MODEL_ID}</code>，再点「下一项」。一家服务商可以提供好几个模型，模型 ID 告诉它你要用哪个。点号和连字符都照着配置单填。`,
  },
};
const testGuide = '点 API Key 右边的「测试连接」。这一步用来检查刚才三项配置能不能一起用。高级配置先保持默认，想了解的话可以展开看看，再回来测试。';

const DEFAULT_PROVIDER = '腾讯云 Token Plan / 通用 Token Plan（个人版）';
const CUSTOM_PROVIDER = '自定义';
const providerGroups = [
  { title: 'Token Plan', names: [
    '腾讯云 Token Plan（广州）/ 企业版专业套餐',
    '腾讯云 Token Plan（广州）/ 企业版轻享套餐',
    '腾讯云 Token Plan（新加坡）/ 企业版专业套餐',
    '腾讯云 Token Plan（新加坡）/ 企业版轻享套餐',
    DEFAULT_PROVIDER,
    '腾讯云 Token Plan / Hy Token Plan（个人版）',
  ] },
  { title: 'Coding Plan', names: ['腾讯云 Coding Plan', '智谱 Coding Plan', 'Kimi Coding Plan'] },
  { title: '自定义 API', names: ['腾讯云 TokenHub（广州）', '腾讯云 TokenHub（新加坡）', '智谱开放平台', 'Kimi 中国版', 'MiniMax 中国版', '深度求索'] },
  { title: '其他', names: [CUSTOM_PROVIDER] },
];

const inputClass = 'w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus-visible:outline-2 focus-visible:outline-blue-500 select-text';
const actionClass = 'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50';
const primaryClass = 'rounded-lg bg-blue-700 px-3 py-2 text-sm font-medium text-white hover:bg-blue-800 cursor-pointer disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-600';
const fieldClass = 'grid min-w-0 gap-1 text-sm font-medium text-slate-800';

function PracticeField({
  name, active, error, onConfirm, actions, ...inputProps
}: ComponentProps<'input'> & {
  name: PracticeFieldName;
  active: boolean;
  error: string | undefined;
  onConfirm?: () => void;
  actions?: ReactNode;
}) {
  const errorId = useId();
  return (
    <div className="grid gap-1">
      <div className="flex flex-wrap items-end gap-2">
        <label className={`flex-1 ${fieldClass}`}>
          {fieldLessons[name].label}
          <input
            {...inputProps}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className={`${inputClass} ${active ? practiceRing : ''}`}
          />
        </label>
        {onConfirm && <button type="button" onClick={onConfirm} className={`shrink-0 ${actionClass}`}>下一项</button>}
        {actions}
      </div>
      {error && <p id={errorId} role="alert" className="m-0 text-sm text-red-700">{error}</p>}
    </div>
  );
}

function CustomModelForm({ practice, onPracticeGuide, onCancel, ...targetProps }: PracticeGuideProps & { onCancel: () => void }) {
  const { demoKey, customSelected } = practice;
  const [provider, setProvider] = useState(customSelected ? CUSTOM_PROVIDER : DEFAULT_PROVIDER);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState('');
  // 学员输入只在表单内使用，课程的会话快照不保存这些值。
  const [fields, setFields] = useState({ address: '', key: '', model: '' });
  const [pendingField, setPendingField] = useState<PracticeFieldName | null>('address');
  const [result, setResult] = useState<FieldIssue | 'connected' | null>(null);
  const connected = result === 'connected';
  const issue = connected ? null : result;
  const [testedDraft, setTestedDraft] = useState(false);
  const pickerRef = useRef<HTMLButtonElement>(null);
  const configRef = useRef<HTMLDetailsElement>(null);
  const pickerId = useId();
  const providerTarget = 'customModel.provider';
  const isCustom = provider === CUSTOM_PROVIDER;
  const isConfiguring = targetProps.waitTarget === 'customModel.save';
  const choosingCustom = targetProps.waitTarget === providerTarget || (isConfiguring && !isCustom);
  const { callout, ring } = makeTargetKit(choosingCustom ? {
    ...targetProps, waitTarget: providerTarget, waitCallout: '选自定义供应商',
  } : targetProps);
  const activeField = isCustom && isConfiguring && !pickerOpen ? pendingField ?? issue?.field : undefined;
  const readyToTest = isCustom && isConfiguring && pendingField === null;
  const readyToSave = isCustom && connected;
  const showTestRing = readyToTest && !issue && !connected && !pickerOpen;
  const isDraftAddress = fields.address.trim() === PRACTICE_DRAFT_ENDPOINT;
  const query = search.trim().toLowerCase();
  const filteredGroups = providerGroups
    .map((group) => ({ ...group, names: group.names.filter((name) => name.toLowerCase().includes(query)) }))
    .filter((group) => group.names.length > 0);

  useEffect(() => {
    if (customSelected && isConfiguring) onPracticeGuide(fieldLessons.address.guide);
  }, [customSelected, isConfiguring, onPracticeGuide]);

  const closePicker = () => {
    setPickerOpen(false);
    setSearch('');
    pickerRef.current?.focus();
  };

  const chooseProvider = (name: string) => {
    setProvider(name);
    setResult(null);
    closePicker();
    if (name === CUSTOM_PROVIDER) {
      if (targetProps.waitTarget === providerTarget) targetProps.onTargetClick(providerTarget);
      else if (pendingField) onPracticeGuide(fieldLessons[pendingField].guide);
      else onPracticeGuide(testGuide);
    } else {
      targetProps.onAsideClick('供应商', '选预设供应商时，接口地址通常已经填好。这节课请选「自定义」，练习自己填写地址。');
    }
  };

  const expectedValues = { address: PRACTICE_ENDPOINT, key: demoKey, model: PRACTICE_MODEL_ID };
  const validateField = (name: PracticeFieldName, value: string, allowDraft: boolean): string | undefined => {
    const trimmed = value.trim();
    if (!trimmed) return fieldLessons[name].missing;
    if (trimmed === expectedValues[name] || (allowDraft && name === 'address' && trimmed === PRACTICE_DRAFT_ENDPOINT)) return;
    return fieldLessons[name].mismatch;
  };

  const changeField = (name: PracticeFieldName, value: string) => {
    setFields((current) => ({ ...current, [name]: value }));
    if (connected) {
      setResult(null);
      onPracticeGuide('你改了表单内容。上一次测试对应的是修改前的值，按新值再点一次「测试连接」，通过后才能保存。');
    }
    if (issue?.field === name && !validateField(name, value, !issue.fromTest)) {
      setResult(null);
      if (issue.fromTest) onPracticeGuide('这一项对上配置单了。再点一次「测试连接」，看看修正后的结果。');
    }
  };

  const confirmField = (name: PracticeFieldName) => {
    const message = validateField(name, fields[name], true);
    if (message) {
      setResult({ field: name, message, fromTest: false });
      onPracticeGuide(`先看看「${fieldLessons[name].label}」旁的提示，改好这一栏，再点「下一项」。`);
      return;
    }
    const next = practiceFields[practiceFields.indexOf(name) + 1] ?? null;
    setResult(null);
    setPendingField(next);
    onPracticeGuide(next ? fieldLessons[next].guide : testGuide);
  };

  const testConnection = () => {
    const missing = practiceFields.find((name) => !fields[name].trim());
    const invalid = missing ?? connectionCheckOrder.find((name) => validateField(name, fields[name], false));
    if (invalid) {
      const lesson = fieldLessons[invalid];
      const mismatch = invalid === 'address' ? '请核对接口地址，按练习配置单填写。' : lesson.mismatch;
      setResult({
        field: invalid,
        message: missing ? lesson.missing : `连接失败：${mismatch}`,
        fromTest: true,
      });
      if (invalid === 'address' && !missing) {
        if (isDraftAddress) setTestedDraft(true);
        onPracticeGuide('这次没连上，提示指向「接口地址」。展开「本轮练习配置单」，把表单里的地址和配置单里的完整地址逐字对一遍。改好这一项，再测一次，其他两项可以留着。');
      } else {
        onPracticeGuide(`这次没连上，提示指向「${lesson.label}」。对照练习配置单修正蓝圈里这一项，再点「测试连接」。`);
      }
      return;
    }

    setResult('connected');
    onPracticeGuide(testedDraft
      ? '看到「连接成功」了。因为这份配置单的完整地址带有 <code>/v1</code>，补齐后请求才会发往正确的路径。实际配置时照服务商给的完整地址填。现在点「保存」，把模型加进列表。'
      : '看到「连接成功」了，说明填进去的三项在这次模拟检查里都对上了。现在点「保存」，把模型加进列表。');
  };

  const fieldProps = (name: PracticeFieldName) => ({
    name,
    active: activeField === name,
    error: issue?.field === name ? issue.message : undefined,
    onConfirm: isCustom && pendingField === name ? () => confirmField(name) : undefined,
    onChange: (event: ChangeEvent<HTMLInputElement>) => changeField(name, event.target.value),
  });

  return (
    <div className="absolute inset-0 z-40 grid place-items-center bg-slate-900/25 p-4 backdrop-blur-[2px]">
      <section role="dialog" aria-label="添加模型" className="sim-pop-up flex max-h-full min-h-[min(100%,462px)] w-full max-w-[580px] flex-col overflow-y-auto rounded-2xl border border-blue-200 bg-white shadow-xl"
        onKeyDown={(event) => {
          if (event.key !== 'Escape') return;
          event.stopPropagation();
          if (pickerOpen) closePicker();
          else onCancel();
        }}>
        <header className="flex items-center gap-2 border-b border-blue-100 bg-blue-50/80 px-4 py-3">
          <h3 className="m-0 text-base font-semibold text-slate-900">添加模型</h3>
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">教学模拟</span>
          <button type="button" autoFocus aria-label="关闭添加模型" className="ml-auto rounded px-2 text-lg text-slate-600 hover:bg-blue-100" onClick={onCancel}>×</button>
        </header>
        <form aria-label="添加模型" autoComplete="off" onSubmit={(event) => event.preventDefault()} className="flex flex-1 flex-col gap-3.5 px-4 py-4">
          <div className="relative grid gap-1">
            <span className="text-sm font-medium text-slate-800">供应商 <span className="font-normal text-slate-600">（仅支持 OpenAI 兼容协议 API）</span></span>
            <button
              ref={pickerRef}
              type="button"
              aria-label={`供应商：${provider}`}
              aria-expanded={pickerOpen}
              aria-haspopup="listbox"
              aria-controls={pickerOpen ? pickerId : undefined}
              data-guided-target={pickerOpen ? undefined : providerTarget}
              className={`relative flex w-full items-center justify-between gap-2 text-left ${actionClass} ${pickerOpen ? '' : ring(providerTarget)}`}
              onClick={() => pickerOpen ? closePicker() : setPickerOpen(true)}
            >
              {provider}
              <span aria-hidden="true" className="shrink-0 text-slate-600">{pickerOpen ? '▴' : '▾'}</span>
              {!pickerOpen && callout(providerTarget, 'bottom', 'end')}
            </button>
            {pickerOpen && (
              <div className="absolute inset-x-0 top-full z-20 mt-1 rounded-lg border border-blue-200 bg-white p-2 shadow-lg">
                <input autoFocus type="search" aria-label="搜索供应商" placeholder="搜索供应商" value={search} onChange={(event) => setSearch(event.target.value)} className={inputClass} />
                <div id={pickerId} role="listbox" aria-label="供应商选项" className="mt-1 max-h-[min(260px,36vh)] overflow-y-auto">
                  {filteredGroups.map((group) => (
                    <div role="group" aria-label={group.title} key={group.title} className="px-1 pb-1">
                      <p aria-hidden="true" className="m-0 px-2 pb-1 pt-2 text-xs font-medium text-slate-500">{group.title}</p>
                      {group.names.map((name) => (
                        <button
                          key={name}
                          type="button"
                          role="option"
                          aria-selected={name === provider}
                          data-guided-target={name === CUSTOM_PROVIDER ? providerTarget : undefined}
                          onClick={() => chooseProvider(name)}
                          className={`flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm cursor-pointer hover:bg-blue-50 ${
                            name === provider || (name === CUSTOM_PROVIDER && choosingCustom)
                              ? 'bg-blue-50 font-medium text-blue-800' : 'bg-white text-slate-800'
                          } ${name === CUSTOM_PROVIDER && choosingCustom ? ring(providerTarget) : ''}`}
                        >
                          {name}
                          {name === provider && <span aria-hidden="true">✓</span>}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
                {filteredGroups.length === 0 && <p role="status" className="m-0 px-2 py-2 text-sm text-slate-600">未找到供应商</p>}
              </div>
            )}
          </div>
          {isCustom && (
            <PracticeField {...fieldProps('address')} placeholder="输入接口地址" inputMode="url" spellCheck={false} value={fields.address} />
          )}
          {issue?.field === 'address' && issue.fromTest && (
            <button type="button" className={`self-start ${actionClass}`} onClick={() => {
              if (configRef.current) configRef.current.open = true;
              onPracticeGuide(isDraftAddress
                ? '这份练习草稿少了末尾的 <code>/v1</code>。把配置单里的完整地址复制回「接口地址」，改好后再点「测试连接」。'
                : '把配置单里的完整地址复制回「接口地址」。协议、域名和末尾路径都要照着这份配置单填。');
            }}>给我提示</button>
          )}
          <PracticeField
            {...fieldProps('key')}
            type="password"
            autoComplete="off"
            placeholder="输入练习 API Key"
            disabled={!isCustom}
            value={isCustom ? fields.key : ''}
            actions={<button type="button" className={`shrink-0 ${actionClass} ${showTestRing ? practiceRing : ''}`} disabled={!readyToTest} onClick={testConnection}>测试连接</button>}
          />
          <PracticeField {...fieldProps('model')} spellCheck={false} placeholder="输入模型 ID" disabled={!isCustom} value={isCustom ? fields.model : 'Auto'} />
          {connected && <p role="status" className="m-0 text-sm font-medium text-green-700">连接成功</p>}
          {isCustom && (
            <details ref={configRef} className="rounded-lg border border-blue-100 bg-blue-50/80 px-3 py-2 text-sm text-blue-950">
              <summary className="cursor-pointer font-medium">本轮练习配置单</summary>
              <dl className="my-2 grid gap-1">
                <div><dt className="inline">接口地址：</dt><dd className="inline m-0"><code className="break-all select-text">{PRACTICE_ENDPOINT}</code></dd></div>
                <div><dt className="inline">API Key：</dt><dd className="inline m-0"><code aria-label="本轮练习 API Key" className="break-all select-text">{demoKey}</code></dd></div>
                <div><dt className="inline">模型 ID：</dt><dd className="inline m-0"><code className="break-all select-text">{PRACTICE_MODEL_ID}</code></dd></div>
              </dl>
              <p className="m-0 text-xs">使用这份练习数据。刷新后表单需要重新填写。</p>
            </details>
          )}
          {readyToTest && (
            <details className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
              <summary className="cursor-pointer font-medium">高级配置</summary>
              <p className="mb-0 mt-2">工具调用决定模型能不能使用外部工具，图片输入取决于模型能不能读图，输入和输出上限决定单次能处理或生成多少内容。先用默认值跑通，再按服务商的说明调整。</p>
            </details>
          )}
          <div className="mt-auto flex justify-end gap-2 border-t border-slate-100 pt-3">
            <button type="button" className={actionClass} onClick={onCancel}>取消</button>
            <button
              type="button"
              data-guided-target={readyToSave ? 'customModel.save' : undefined}
              className={`relative ${primaryClass} ${readyToSave && !pickerOpen ? `ring-2 ring-blue-600 ${ring('customModel.save')}` : ''}`}
              disabled={!readyToSave || !isConfiguring}
              onClick={() => targetProps.onTargetClick('customModel.save')}
            >
              保存
              {readyToSave && !pickerOpen && callout('customModel.save', 'top', 'end')}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export function CustomModelPracticePanel({ practice, onPracticeGuide, ...targetProps }: PracticeGuideProps) {
  const [cancelled, setCancelled] = useState(false);
  const addRef = useRef<HTMLButtonElement>(null);
  const showForm = practice.formOpen && !cancelled;
  const resumeForm = practice.formOpen && cancelled;
  const { aside, callout, ring } = makeTargetKit(resumeForm ? {
    ...targetProps,
    waitTarget: 'customModel.add',
    waitCallout: '重新打开添加模型',
  } : targetProps);

  useEffect(() => setCancelled(false), [targetProps.waitTarget]);

  const closeForm = () => {
    setCancelled(true);
    if (targetProps.waitTarget === 'customModel.save') {
      onPracticeGuide('刚才关掉了弹窗，配置还没有保存。点蓝圈里的「添加模型」，就能用同一轮配置单重新填写。');
    }
    requestAnimationFrame(() => addRef.current?.focus());
  };

  return (
    <section aria-label="模型设置" className="flex flex-col gap-3">
      <div inert={showForm} className="flex flex-col gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="m-0 text-base font-semibold text-slate-900">自定义模型</h2>
              <p className="m-0 mt-1 text-sm text-slate-600">这里管理自己添加的模型。</p>
            </div>
            {!practice.saved && (
              <button
                ref={addRef}
                type="button"
                data-guided-target="customModel.add"
                className={`relative shrink-0 ${actionClass} ${ring('customModel.add')}`}
                onClick={() => {
                  setCancelled(false);
                  if (targetProps.waitTarget === 'customModel.add') targetProps.onTargetClick('customModel.add');
                }}
              >
                添加模型
                {callout('customModel.add', 'bottom', 'end')}
              </button>
            )}
          </div>
          <ul aria-label="已保存的自定义模型" className="m-0 list-none p-0">
            {practice.saved && <li className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-900">{PRACTICE_MODEL_ID}</li>}
          </ul>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
          <h3 className="m-0 mb-1 font-semibold text-slate-900">辅助任务模型</h3>
          <p className="m-0">用于增强提示词、生成标题和会话摘要等辅助任务。</p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
            <span className="font-medium text-slate-800">选择模型</span>
            <button type="button" className={actionClass} onClick={aside('辅助任务模型', '这项设置用于标题和摘要。要换当前聊天的模型，请回首页，用输入框旁的模型菜单。')}>
              默认（推荐） <span aria-hidden="true">▾</span>
            </button>
          </div>
        </div>
      </div>
      {showForm && <CustomModelForm key={String(practice.customSelected)} practice={practice} onPracticeGuide={onPracticeGuide} onCancel={closeForm} {...targetProps} />}
    </section>
  );
}
