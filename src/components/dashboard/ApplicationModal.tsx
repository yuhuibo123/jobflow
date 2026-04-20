import { useState } from 'react';
import { X } from 'lucide-react';
import { Application, ApplicationInput, ApplicationStatus, ProcessTemplate } from '../../types';
import { columns, processTemplates } from '../../lib/processHelpers';

export function ApplicationModal({
  initialStatus,
  onClose,
  onCreate,
}: {
  initialStatus: ApplicationStatus;
  onClose: () => void;
  onCreate: (input: ApplicationInput) => Promise<void>;
}) {
  const [form, setForm] = useState({
    company: '',
    position: '',
    department: '',
    status: initialStatus,
    processTemplate: 'big_tech' as ProcessTemplate,
    sourceUrl: '',
    location: '',
    salary: '',
    note: '',
    tags: '',
    urgency: 'normal' as NonNullable<Application['urgency']>,
  });
  const [submitting, setSubmitting] = useState(false);

  const updateField = <Key extends keyof typeof form>(key: Key, value: (typeof form)[Key]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    await onCreate({
      company: form.company,
      position: form.position,
      department: form.department,
      status: form.status,
      applySource: 'manual',
      processTemplate: form.processTemplate,
      sourceUrl: form.sourceUrl,
      location: form.location,
      salary: form.salary,
      note: form.note,
      tags: form.tags
        .split(/[,，]/)
        .map((tag) => tag.trim())
        .filter(Boolean),
      urgency: form.urgency,
      activityDot: 'today',
    });
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/30 flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-xl bg-white rounded-2xl border border-[#F0EBE4] shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#F5F0EA] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#1C1917]">新增申请</h2>
            <p className="text-[#9C8B78] text-xs mt-0.5">当前保存到前端统一状态，后续重新接后端时从同一套 action 接入。</p>
          </div>
          <button type="button" onClick={onClose} className="text-[#9C8B78] hover:text-[#1C1917]">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="space-y-1">
            <span className="text-[#6B5E4E] text-xs font-medium">公司</span>
            <input required value={form.company} onChange={(e) => updateField('company', e.target.value)} className="w-full border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFD100]" />
          </label>
          <label className="space-y-1">
            <span className="text-[#6B5E4E] text-xs font-medium">岗位</span>
            <input required value={form.position} onChange={(e) => updateField('position', e.target.value)} className="w-full border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFD100]" />
          </label>
          <label className="space-y-1">
            <span className="text-[#6B5E4E] text-xs font-medium">部门/方向</span>
            <input value={form.department} onChange={(e) => updateField('department', e.target.value)} className="w-full border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFD100]" />
          </label>
          <label className="space-y-1">
            <span className="text-[#6B5E4E] text-xs font-medium">状态</span>
            <select value={form.status} onChange={(e) => updateField('status', e.target.value as ApplicationStatus)} className="w-full border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFD100] bg-white">
              {columns.map((column) => (
                <option key={column.id} value={column.id}>{column.label}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-[#6B5E4E] text-xs font-medium">流程模板</span>
            <select value={form.processTemplate} onChange={(e) => updateField('processTemplate', e.target.value as ProcessTemplate)} className="w-full border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFD100] bg-white">
              {Object.entries(processTemplates).map(([key, template]) => (
                <option key={key} value={key}>{template.label}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-[#6B5E4E] text-xs font-medium">城市</span>
            <input value={form.location} onChange={(e) => updateField('location', e.target.value)} className="w-full border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFD100]" />
          </label>
          <label className="space-y-1">
            <span className="text-[#6B5E4E] text-xs font-medium">薪资</span>
            <input value={form.salary} onChange={(e) => updateField('salary', e.target.value)} placeholder="例如 20-30K" className="w-full border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFD100]" />
          </label>
          <label className="space-y-1">
            <span className="text-[#6B5E4E] text-xs font-medium">标签</span>
            <input value={form.tags} onChange={(e) => updateField('tags', e.target.value)} placeholder="用逗号分隔" className="w-full border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFD100]" />
          </label>
          <label className="space-y-1">
            <span className="text-[#6B5E4E] text-xs font-medium">岗位链接</span>
            <input value={form.sourceUrl} onChange={(e) => updateField('sourceUrl', e.target.value)} placeholder="https://..." className="w-full border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFD100]" />
          </label>
          <label className="md:col-span-2 space-y-1">
            <span className="text-[#6B5E4E] text-xs font-medium">备注</span>
            <textarea value={form.note} onChange={(e) => updateField('note', e.target.value)} rows={3} className="w-full border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFD100] resize-none" />
          </label>
        </div>

        <div className="px-5 py-4 bg-[#FBF8F3] border-t border-[#F5F0EA] flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-[#E8E2D9] text-[#6B5E4E] text-sm">取消</button>
          <button disabled={submitting} className="px-4 py-2 rounded-lg bg-[#1C1917] text-white text-sm font-medium disabled:opacity-60">
            {submitting ? '保存中...' : '保存申请'}
          </button>
        </div>
      </form>
    </div>
  );
}
