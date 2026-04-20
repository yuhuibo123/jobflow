import { useState } from 'react';
import { X } from 'lucide-react';
import { useJobFlow } from '../../store/useJobFlow';
import { inferTags, parseJdText } from '../../lib/jobHelpers';

type CreateMode = 'manual' | 'jd_paste' | 'url_parse';

type JobForm = {
  company: string;
  title: string;
  department: string;
  jd: string;
  sourceUrl: string;
  tags: string;
  note: string;
};

const emptyForm: JobForm = {
  company: '',
  title: '',
  department: '',
  jd: '',
  sourceUrl: '',
  tags: '',
  note: '',
};

export function JobCreateModal({ onClose }: { onClose: () => void }) {
  const { saveJobLead } = useJobFlow();
  const [mode, setMode] = useState<CreateMode>('jd_paste');
  const [form, setForm] = useState<JobForm>(emptyForm);
  const [parsing, setParsing] = useState(false);

  const updateField = <Key extends keyof JobForm>(key: Key, value: JobForm[Key]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const parseUrl = () => {
    setParsing(true);
    window.setTimeout(() => {
      setForm((current) => ({
        ...current,
        company: '小红书',
        title: 'AI 产品经理',
        department: '创作者工具',
        jd: '负责 AI 创作工具的需求洞察、产品方案、效果评估和跨团队推进。',
        tags: 'AI PM，创作者，工具',
        note: '从链接解析得到，建议先收纳，晚点和其他 AI PM 岗位一起筛。',
      }));
      setParsing(false);
    }, 800);
  };

  const parseJd = () => {
    setForm((current) => ({ ...current, ...parseJdText(current.jd) }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    saveJobLead({
      company: form.company || '待确认公司',
      title: form.title || '待确认岗位',
      department: form.department,
      jd: form.jd,
      sourceUrl: form.sourceUrl,
      sourceType: mode,
      tags: form.tags.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean),
      status: 'collected',
      matchScore: mode === 'manual' ? undefined : 76,
      reason: mode === 'manual' ? undefined : '先低成本收纳，后续再判断是否值得进入想投。',
      keywordSource: inferTags(`${form.jd} ${form.tags}`),
      note: form.note || '从外部信息导入岗位库，后续再判断是否推进到想投。',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/30 flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-white rounded-2xl border border-[#F0EBE4] shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#F5F0EA] flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#1C1917]">导入岗位</h2>
            <p className="text-[#9C8B78] text-xs mt-0.5">粘贴 JD 或链接，先自动识别成岗位卡。</p>
          </div>
          <button type="button" onClick={onClose} className="text-[#9C8B78] hover:text-[#1C1917]">
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          <div className="flex flex-wrap gap-2 mb-5">
            {[
              { id: 'jd_paste', label: '粘贴 JD' },
              { id: 'url_parse', label: '粘贴链接' },
              { id: 'manual', label: '手动补充' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setMode(item.id as CreateMode)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${
                  mode === item.id
                    ? 'bg-[#1C1917] text-white border-[#1C1917]'
                    : 'bg-white text-[#6B5E4E] border-[#E8E2D9] hover:border-[#C5BDB5]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {mode === 'url_parse' && (
            <div className="mb-4 flex gap-2">
              <input
                value={form.sourceUrl}
                onChange={(event) => updateField('sourceUrl', event.target.value)}
                placeholder="粘贴岗位链接"
                className="flex-1 border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFD100]"
              />
              <button type="button" onClick={parseUrl} className="px-4 py-2 rounded-lg bg-[#1C1917] text-white text-sm font-medium">
                {parsing ? '解析中...' : '解析'}
              </button>
            </div>
          )}

          {mode === 'jd_paste' && (
            <div className="mb-4">
              <textarea
                value={form.jd}
                onChange={(event) => updateField('jd', event.target.value)}
                placeholder="粘贴 JD 文本"
                rows={5}
                className="w-full border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFD100] resize-none"
              />
              <button type="button" onClick={parseJd} className="mt-2 px-3 py-1.5 rounded-lg bg-[#1C1917] text-white text-sm font-medium">
                自动识别岗位
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-1">
              <span className="text-[#6B5E4E] text-xs font-medium">公司</span>
              <input value={form.company} onChange={(event) => updateField('company', event.target.value)} className="w-full border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFD100]" />
            </label>
            <label className="space-y-1">
              <span className="text-[#6B5E4E] text-xs font-medium">岗位</span>
              <input value={form.title} onChange={(event) => updateField('title', event.target.value)} className="w-full border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFD100]" />
            </label>
            <label className="space-y-1">
              <span className="text-[#6B5E4E] text-xs font-medium">部门/方向</span>
              <input value={form.department} onChange={(event) => updateField('department', event.target.value)} className="w-full border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFD100]" />
            </label>
            <label className="space-y-1">
              <span className="text-[#6B5E4E] text-xs font-medium">标签</span>
              <input value={form.tags} onChange={(event) => updateField('tags', event.target.value)} placeholder="用逗号分隔" className="w-full border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFD100]" />
            </label>
            {mode !== 'url_parse' && (
              <label className="md:col-span-2 space-y-1">
                <span className="text-[#6B5E4E] text-xs font-medium">来源链接</span>
                <input value={form.sourceUrl} onChange={(event) => updateField('sourceUrl', event.target.value)} placeholder="可选" className="w-full border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFD100]" />
              </label>
            )}
            {mode !== 'jd_paste' && (
              <label className="md:col-span-2 space-y-1">
                <span className="text-[#6B5E4E] text-xs font-medium">JD 摘要</span>
                <textarea value={form.jd} onChange={(event) => updateField('jd', event.target.value)} rows={3} className="w-full border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFD100] resize-none" />
              </label>
            )}
            <label className="md:col-span-2 space-y-1">
              <span className="text-[#6B5E4E] text-xs font-medium">备注</span>
              <textarea value={form.note} onChange={(event) => updateField('note', event.target.value)} rows={2} className="w-full border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFD100] resize-none" />
            </label>
          </div>
        </div>

        <div className="px-5 py-4 bg-[#FBF8F3] border-t border-[#F5F0EA] flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-[#E8E2D9] text-[#6B5E4E] text-sm">取消</button>
          <button className="px-4 py-2 rounded-lg bg-[#1C1917] text-white text-sm font-medium">放入岗位库</button>
        </div>
      </form>
    </div>
  );
}
