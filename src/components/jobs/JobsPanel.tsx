import { useState } from 'react';
import { Briefcase, Upload } from 'lucide-react';
import { useJobFlow } from '../../store/useJobFlow';
import { JobCard } from './JobCard';
import { JobRadar } from './JobRadar';
import { KeywordSettings } from './KeywordSettings';
import { JobCreateModal } from './JobCreateModal';

export default function JobsPanel() {
  const { jobs } = useJobFlow();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const activeJobs = jobs.filter((job) => job.status !== 'ignored');
  const visibleJobs = activeJobs.slice(0, 2);
  const hiddenCount = Math.max(0, activeJobs.length - visibleJobs.length);
  const ignoredCount = jobs.length - activeJobs.length;

  return (
    <>
      <div className="rounded-xl border border-[#F0EBE4] bg-[#FBF8F3] p-5">
        <div className="space-y-4">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2">
              <JobRadar />
            </div>
            <KeywordSettings />
          </div>

          <div>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Briefcase size={16} className="text-[#6B5E4E]" />
                  <h3 className="text-[#1C1917] font-bold">待处理的机会</h3>
                </div>
                <p className="text-[#9C8B78] text-sm">这里只保留最需要判断的机会，想投或投递后会同步进看板。</p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E8E2D9] bg-white text-[#6B5E4E] text-xs font-medium hover:border-[#C5BDB5]"
              >
                <Upload size={13} />
                导入 JD / 链接
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {visibleJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
            {hiddenCount > 0 && (
              <div className="mt-3 rounded-xl border border-dashed border-[#E8E2D9] bg-white px-3 py-2 text-center text-[#9C8B78] text-xs">
                还有 {hiddenCount} 个机会先收起，搜索或导入后会进入这里排队。
              </div>
            )}
            {ignoredCount > 0 && (
              <div className="mt-3 text-[#9C8B78] text-xs">
                已暂不考虑 {ignoredCount} 个机会，先不占用你的判断空间。
              </div>
            )}
          </div>
        </div>
      </div>

      {showCreateModal && <JobCreateModal onClose={() => setShowCreateModal(false)} />}
    </>
  );
}
