import { useState } from 'react';
import { Check, ChevronRight, Link as LinkIcon, Send } from 'lucide-react';
import { useJobFlow } from '../../store/useJobFlow';
import { JobLead, ProcessTemplate } from '../../types';
import { getSourceLabel, getStatusLabel } from '../../lib/jobHelpers';
import { processTemplates } from '../../lib/processHelpers';

export function JobCard({ job }: { job: JobLead }) {
  const { markJobPromising, ignoreJobLead, promoteJobToInterested, applyJobLead } = useJobFlow();
  const [processTemplate, setProcessTemplate] = useState<ProcessTemplate>('big_tech');
  const isSynced = job.status === 'interested' || job.status === 'applied';
  const disabled = isSynced || job.status === 'ignored';

  return (
    <div className="rounded-xl border border-[#F0EBE4] bg-white p-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[#1C1917] text-sm font-semibold">{job.company}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F5F0EA] text-[#6B5E4E]">
              {getSourceLabel(job.sourceType)}
            </span>
          </div>
          <div className="text-[#6B5E4E] text-sm font-medium mt-1">{job.title}</div>
          {job.department && <div className="text-[#9C8B78] text-xs mt-0.5">{job.department}</div>}
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFF7CC] text-[#7A5A00] border border-[#FFE36A] whitespace-nowrap">
          {getStatusLabel(job.status)}
        </span>
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {job.tags.slice(0, 4).map((tag) => (
          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-[#FBF8F3] text-[#9C8B78] border border-[#F0EBE4]">
            {tag}
          </span>
        ))}
      </div>

      {(job.reason || job.note) && (
        <p className="text-[#9C8B78] text-xs leading-relaxed mb-3">{job.reason || job.note}</p>
      )}

      {isSynced && (
        <div className="mb-3 rounded-lg border border-[#DCFCE7] bg-[#F0FDF4] px-3 py-2 text-xs text-[#16A34A]">
          {job.status === 'applied' ? '已投递，已同步到申请看板。' : '已加入想投，已同步到申请看板。'}
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <div className="text-[#9C8B78] text-xs">
          {job.matchScore ? `匹配度 ${job.matchScore}%` : '待判断'}
        </div>
        <div className="flex items-center gap-2">
          {job.sourceUrl && (
            <a href={job.sourceUrl} target="_blank" rel="noreferrer" className="text-[#9C8B78] hover:text-[#1C1917]">
              <LinkIcon size={14} />
            </a>
          )}
          {job.status === 'collected' && (
            <button onClick={() => markJobPromising(job.id)} className="text-[#6B5E4E] text-xs font-medium hover:text-[#1C1917]">
              值得看看
            </button>
          )}
          {job.status !== 'ignored' && !isSynced && (
            <button onClick={() => ignoreJobLead(job.id)} className="text-[#9C8B78] text-xs font-medium hover:text-[#6B5E4E]">
              暂不考虑
            </button>
          )}
          <button
            onClick={() => promoteJobToInterested(job.id)}
            disabled={disabled}
            className="inline-flex items-center gap-1 rounded-lg border border-[#E8E2D9] bg-white px-3 py-1.5 text-xs font-medium text-[#6B5E4E] hover:border-[#C5BDB5] disabled:bg-[#E8E2D9] disabled:text-[#9C8B78]"
          >
            {job.status === 'interested' ? '已进想投' : '加入想投'}
            {job.status !== 'interested' && <ChevronRight size={12} />}
          </button>
          {!isSynced && job.status !== 'ignored' && (
            <select
              value={processTemplate}
              onChange={(event) => setProcessTemplate(event.target.value as ProcessTemplate)}
              className="max-w-24 rounded-lg border border-[#E8E2D9] bg-white px-2 py-1.5 text-xs text-[#6B5E4E] outline-none focus:border-[#FFD100]"
            >
              {Object.entries(processTemplates).map(([key, template]) => (
                <option key={key} value={key}>{template.label}</option>
              ))}
            </select>
          )}
          <button
            onClick={() => applyJobLead(job.id, processTemplate)}
            disabled={job.status === 'applied' || job.status === 'ignored'}
            className="inline-flex items-center gap-1 rounded-lg bg-[#1C1917] px-3 py-1.5 text-xs font-medium text-white disabled:bg-[#E8E2D9] disabled:text-[#9C8B78]"
          >
            {job.status === 'applied' ? (
              <>
                已投递 <Check size={12} />
              </>
            ) : (
              <>
                投递 <Send size={12} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
