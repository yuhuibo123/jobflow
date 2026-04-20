import { X, ListChecks, Building2 } from 'lucide-react';
import { InterviewPrepPack, ScheduleEvent } from '../../types';

export function InterviewPrepModal({
  pack,
  scheduleEvent,
  onClose,
}: {
  pack: InterviewPrepPack;
  scheduleEvent?: ScheduleEvent;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[80] bg-black/30 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl border border-[#F0EBE4] shadow-2xl">
        <div className="px-5 py-4 border-b border-[#F5F0EA] flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Building2 size={16} className="text-[#6B5E4E]" />
              <h2 className="text-lg font-bold text-[#1C1917]">面试准备包</h2>
            </div>
            <p className="text-[#9C8B78] text-xs">{pack.company} · {pack.round} · {pack.position}</p>
          </div>
          <button onClick={onClose} className="text-[#9C8B78] hover:text-[#1C1917]">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="rounded-xl bg-[#FBF8F3] border border-[#F0EBE4] p-4">
            <div className="text-[#1C1917] text-sm font-semibold mb-2">公司信息摘要</div>
            <p className="text-[#6B5E4E] text-sm leading-relaxed">{pack.companySummary}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl bg-[#FBF8F3] border border-[#F0EBE4] p-4">
              <div className="text-[#1C1917] text-sm font-semibold mb-3">岗位常见问题</div>
              <div className="space-y-2">
                {pack.commonQuestions.map((question) => (
                  <div key={question} className="text-[#6B5E4E] text-xs leading-relaxed">· {question}</div>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-[#FBF8F3] border border-[#F0EBE4] p-4">
              <div className="text-[#1C1917] text-sm font-semibold mb-3">推荐准备点</div>
              <div className="space-y-2">
                {pack.prepPoints.map((point) => (
                  <div key={point} className="text-[#6B5E4E] text-xs leading-relaxed">· {point}</div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-[#FBF8F3] border border-[#F0EBE4] p-4">
            <div className="flex items-center gap-2 mb-3">
              <ListChecks size={15} className="text-[#6B5E4E]" />
              <div className="text-[#1C1917] text-sm font-semibold">面试前 checklist</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {(pack.checklist || []).map((item, index) => (
                <div key={item} className="flex items-center gap-2 text-sm">
                  <span className="w-5 h-5 rounded-full bg-white border border-[#E8E2D9] text-[#9C8B78] flex items-center justify-center text-[10px]">
                    {index + 1}
                  </span>
                  <span className="text-[#6B5E4E]">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl bg-[#FFFBEA] border border-[#FFE36A] p-3 text-[#7A5A00]">
              关联申请：{pack.company} · {pack.position}
            </div>
            <div className="rounded-xl bg-[#FFFBEA] border border-[#FFE36A] p-3 text-[#7A5A00]">
              关联日程：{scheduleEvent ? `${scheduleEvent.weekday} ${scheduleEvent.time || ''} ${scheduleEvent.title}` : '待补充'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
