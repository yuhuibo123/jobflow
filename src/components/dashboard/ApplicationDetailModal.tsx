import { ArrowRight, BookOpen, CalendarPlus, Gift, X, Trash2, Link as LinkIcon } from 'lucide-react';
import { Application, ApplicationTimelineEvent } from '../../types';
import { columns, getProcessSnapshot, inferProcessTemplate, processTemplates } from '../../lib/processHelpers';

export function ApplicationDetailModal({
  application,
  timeline,
  onClose,
  onDelete,
  onAdvanceStep,
  onScheduleInterview,
  onMarkOffer,
  onMarkRejected,
  onOpenPrep,
  onOpenReview,
}: {
  application: Application;
  timeline: ApplicationTimelineEvent[];
  onClose: () => void;
  onDelete: (application: Application) => Promise<void>;
  onAdvanceStep: (applicationId: string, currentStepIndex: number) => void;
  onScheduleInterview: (applicationId: string) => void;
  onMarkOffer: (applicationId: string) => void;
  onMarkRejected: (applicationId: string) => void;
  onOpenPrep: (applicationId: string) => void;
  onOpenReview: (applicationId: string) => void;
}) {
  const statusLabel = columns.find((column) => column.id === application.status)?.label || application.status;
  const process = getProcessSnapshot(application);
  const nextStepIndex = process.currentStepIndex < 0 ? 0 : process.currentStepIndex + 1;
  const canAdvance = nextStepIndex < process.steps.length;

  return (
    <div className="fixed inset-0 z-[60] bg-black/30 flex items-center justify-center px-4">
      <div className="w-full max-w-lg max-h-[90vh] bg-white rounded-2xl border border-[#F0EBE4] shadow-2xl overflow-y-auto">
        <div className="px-5 py-4 border-b border-[#F5F0EA] flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold" style={{ backgroundColor: application.companyColor }}>
              {application.companyInitial}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#1C1917]">{application.company}</h2>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${application.isDemo ? 'bg-[#EDE8E1] text-[#6B5E4E]' : 'bg-[#DCFCE7] text-[#16A34A]'}`}>
                  {application.isDemo ? '示例' : '我的'}
                </span>
              </div>
              <p className="text-[#9C8B78] text-sm">{application.position}・{application.department}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-[#9C8B78] hover:text-[#1C1917]">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="bg-[#FBF8F3] rounded-xl p-3">
              <div className="text-[#9C8B78] text-xs mb-1">状态</div>
              <div className="text-[#1C1917] font-medium">{statusLabel}</div>
            </div>
            <div className="bg-[#FBF8F3] rounded-xl p-3">
              <div className="text-[#9C8B78] text-xs mb-1">城市</div>
              <div className="text-[#1C1917] font-medium">{application.location || '未填写'}</div>
            </div>
            <div className="bg-[#FBF8F3] rounded-xl p-3">
              <div className="text-[#9C8B78] text-xs mb-1">薪资</div>
              <div className="text-[#1C1917] font-medium">{application.salary || '未填写'}</div>
            </div>
          </div>

          {application.tags && application.tags.length > 0 && (
            <div>
              <div className="text-[#9C8B78] text-xs mb-2">标签</div>
              <div className="flex flex-wrap gap-1.5">
                {application.tags.map((tag) => (
                  <span key={tag} className="text-xs px-2 py-1 rounded-full bg-[#F5F0EA] text-[#6B5E4E]">{tag}</span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="bg-[#FBF8F3] rounded-xl p-3">
              <div className="text-[#9C8B78] text-xs mb-1">流程</div>
              <div className="text-[#1C1917] font-medium">
                {processTemplates[inferProcessTemplate(application)].label}
              </div>
            </div>
            <div className="bg-[#FBF8F3] rounded-xl p-3">
              <div className="text-[#9C8B78] text-xs mb-1">岗位链接</div>
              {application.sourceUrl ? (
                <a
                  href={application.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[#1C1917] font-medium hover:text-[#7A5A00]"
                >
                  打开链接 <LinkIcon size={13} />
                </a>
              ) : (
                <div className="text-[#1C1917] font-medium">未填写</div>
              )}
            </div>
          </div>

          <div className="rounded-xl bg-[#FBF8F3] border border-[#F0EBE4] p-3">
            <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between mb-3">
              <div>
                <div className="text-[#9C8B78] text-xs mb-1">流程进度</div>
                <div className="text-[#6B5E4E] text-xs">
                  当前：{process.currentStep} · 下一步：{process.nextStep}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onAdvanceStep(application.id, nextStepIndex)}
                disabled={!canAdvance}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#1C1917] px-3 py-2 text-xs font-medium text-white disabled:bg-[#E8E2D9] disabled:text-[#9C8B78]"
              >
                进入下一轮
                <ArrowRight size={13} />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {process.steps.map((step) => (
                <span
                  key={step.id}
                  className={`rounded-full border px-2 py-1 text-[10px] ${
                    step.status === 'done' || step.status === 'current'
                      ? 'border-[#1C1917] bg-[#1C1917] text-white'
                      : step.label === '投递' && process.currentStepIndex < 0
                        ? 'border-[#FFE36A] bg-[#FFFBEA] text-[#7A5A00]'
                        : 'border-[#E8E2D9] bg-white text-[#9C8B78]'
                  }`}
                >
                  {step.label}
                </span>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2">
              <select
                value={process.currentStepIndex}
                onChange={(event) => onAdvanceStep(application.id, Number(event.target.value))}
                className="rounded-lg border border-[#E8E2D9] bg-white px-3 py-2 text-xs text-[#6B5E4E] outline-none focus:border-[#FFD100]"
              >
                <option value={-1}>准备投递</option>
                {process.steps.map((step, index) => (
                  <option key={step.id} value={index}>{step.label}</option>
                ))}
              </select>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                <button onClick={() => onScheduleInterview(application.id)} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#E8E2D9] bg-white px-3 py-2 text-xs font-medium text-[#6B5E4E]">
                  <CalendarPlus size={13} />
                  约面试
                </button>
                <button onClick={() => onMarkOffer(application.id)} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#E8E2D9] bg-white px-3 py-2 text-xs font-medium text-[#6B5E4E]">
                  <Gift size={13} />
                  Offer
                </button>
                <button onClick={() => onMarkRejected(application.id)} className="inline-flex items-center justify-center rounded-lg border border-[#FECACA] bg-white px-3 py-2 text-xs font-medium text-[#EF4444]">
                  已拒
                </button>
                <button onClick={() => onOpenReview(application.id)} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#E8E2D9] bg-white px-3 py-2 text-xs font-medium text-[#6B5E4E]">
                  <BookOpen size={13} />
                  复盘
                </button>
                <button onClick={() => onOpenPrep(application.id)} className="inline-flex items-center justify-center rounded-lg border border-[#FFE36A] bg-[#FFFBEA] px-3 py-2 text-xs font-medium text-[#7A5A00]">
                  准备包
                </button>
              </div>
            </div>
            {application.isDemo && (
              <p className="mt-2 text-[#C5BDB5] text-xs">示例申请可以试着推进流程，但仍不能删除。</p>
            )}
          </div>

          <div>
            <div className="text-[#9C8B78] text-xs mb-2">时间线</div>
            {timeline.length > 0 ? (
              <div className="space-y-2">
                {timeline.map((event) => (
                  <div key={event.id} className="rounded-xl bg-[#FBF8F3] border border-[#F0EBE4] p-3">
                    <div className="text-[#1C1917] text-sm font-medium">{event.title}</div>
                    <div className="text-[#9C8B78] text-[10px] mt-1">
                      {new Date(event.occurredAt).toLocaleString('zh-CN')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl bg-[#FBF8F3] border border-dashed border-[#E8E2D9] p-3 text-[#9C8B78] text-xs">
                暂无时间线事件
              </div>
            )}
          </div>

          <div>
            <div className="text-[#9C8B78] text-xs mb-2">备注</div>
            <p className="text-[#6B5E4E] text-sm leading-relaxed bg-[#FBF8F3] rounded-xl p-3">
              {application.note || '暂无备注'}
            </p>
          </div>

          {application.isDemo && (
            <p className="text-[#9C8B78] text-xs bg-[#FFFBEA] border border-[#FFE36A] rounded-xl p-3">
              这是用于展示的示例数据，不能删除。你可以先用它试推进流程。
            </p>
          )}
        </div>

        <div className="px-5 py-4 bg-[#FBF8F3] border-t border-[#F5F0EA] flex justify-between">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-[#E8E2D9] text-[#6B5E4E] text-sm">关闭</button>
          <button
            type="button"
            onClick={() => onDelete(application)}
            disabled={application.isDemo}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#EF4444] text-white text-sm font-medium disabled:bg-[#E8E2D9] disabled:text-[#9C8B78]"
          >
            <Trash2 size={14} />
            删除
          </button>
        </div>
      </div>
    </div>
  );
}
