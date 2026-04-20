import { useState } from 'react';
import { Plus, ArrowRight, Sun, Cloud, Briefcase, ChevronDown, ChevronUp } from 'lucide-react';
import JobsPanel from '../components/jobs/JobsPanel';
import { MaterialsPanel } from '../components/materials/MaterialsPanel';
import { useJobFlow } from '../store/useJobFlow';
import { Application, ApplicationInput, ApplicationStatus } from '../types';
import { columns } from '../lib/processHelpers';
import { KanbanCard } from '../components/dashboard/KanbanCard';
import { ApplicationModal } from '../components/dashboard/ApplicationModal';
import { ApplicationDetailModal } from '../components/dashboard/ApplicationDetailModal';
import { FloatingReviewCard } from '../components/dashboard/FloatingReviewCard';
import { InterviewPrepModal } from '../components/dashboard/InterviewPrepModal';

function CollapsibleWorkflowPanel() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-8 bg-white rounded-2xl border border-[#F0EBE4] overflow-hidden">
      <button
        onClick={() => setOpen((current) => !current)}
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-[#FBF8F3] transition-colors"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Briefcase size={16} className="text-[#6B5E4E]" />
            <h3 className="text-[#1C1917] font-bold">待处理的机会和材料</h3>
          </div>
          <p className="text-[#9C8B78] text-sm">岗位池和投递前准备先收起来，需要时再展开。</p>
        </div>
        <div className="flex items-center gap-2 text-[#6B5E4E] text-sm font-medium">
          <span>{open ? '收起' : '展开'}</span>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {open && (
        <div className="border-t border-[#F5F0EA] p-5 space-y-4">
          <JobsPanel />
          <MaterialsPanel />
        </div>
      )}
    </div>
  );
}

export default function Dashboard({ onStartReview }: { onStartReview: () => void }) {
  const [showFloating, setShowFloating] = useState(true);
  const [modalStatus, setModalStatus] = useState<ApplicationStatus | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [prepApplicationId, setPrepApplicationId] = useState<string | null>(null);
  const [expandedColumns, setExpandedColumns] = useState<Partial<Record<ApplicationStatus, boolean>>>({});
  const {
    applications,
    applicationTimeline,
    interviewPrepPacks,
    aiOutputs,
    scheduleEvents,
    loading,
    error,
    createApplication,
    deleteApplication,
    advanceApplicationStep,
    scheduleInterviewForApplication,
    markApplicationOffer,
    markApplicationRejected,
    createReview,
  } = useJobFlow();
  const activePrepPack = prepApplicationId
    ? interviewPrepPacks.find((pack) => pack.applicationId === prepApplicationId && pack.active)
    : undefined;
  const activePrepSchedule = activePrepPack?.scheduleEventId
    ? scheduleEvents.find((event) => event.id === activePrepPack.scheduleEventId)
    : undefined;
  const latestAiAdvice = aiOutputs.find((output) => output.type === 'next_step_advice');

  const getColumnApps = (status: ApplicationStatus) =>
    applications.filter((a) => a.status === status);

  const toggleColumn = (status: ApplicationStatus) => {
    setExpandedColumns((current) => ({
      ...current,
      [status]: !current[status],
    }));
  };

  const handleCreateApplication = async (input: ApplicationInput) => {
    const created = await createApplication(input);
    if (created) setModalStatus(null);
  };

  const handleDeleteApplication = async (application: Application) => {
    const deleted = await deleteApplication(application);
    if (deleted) setSelectedApplication(null);
  };

  const handleOpenReview = async (applicationId: string) => {
    const application = applications.find((item) => item.id === applicationId);
    if (!application) return;
    await createReview({
      applicationId,
      interviewRound: application.interviewStage || '待确认轮次',
      status: 'pending',
      entryType: 'manual',
      company: application.company,
      position: application.position,
      stage: application.interviewStage || '待确认轮次',
      date: '待补充',
      duration: 45,
      summary: '',
      tags: ['待复盘'],
      completed: 0,
      isHot: true,
      result: 'pending',
    });
    setSelectedApplication(null);
    onStartReview();
  };

  return (
    <div className="pt-16 min-h-screen bg-[#FBF8F3]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
        <div className="mb-5 rounded-2xl border border-[#FFE36A] bg-[#FFFBEA] px-4 py-3 text-sm text-[#6B5E4E]">
          {latestAiAdvice ? latestAiAdvice.content.split('\n').find(Boolean) : '为了便于展示，这里预置了示例数据。你可以新增或删除自己的记录，示例数据不会被删除。'}
          {loading && <span className="ml-2 text-[#7A5A00]">正在加载前端状态...</span>}
          {error && <span className="ml-2 text-[#EF4444]">{error}</span>}
        </div>

        <div className="text-[#9C8B78] text-sm mb-2">2026 年 2 月 24 日・周二</div>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-6 md:mb-10">
          <h1 className="text-2xl md:text-4xl font-bold text-[#1C1917]">
            早上好，林晚
            <span className="text-[#9C8B78] font-normal text-3xl mx-2">·</span>
            <span className="text-[#FFD100]">稳住，一家家来</span>
          </h1>
          <div className="flex items-center gap-8 md:text-right">
            <div>
              <div className="text-2xl font-bold text-[#1C1917]">18</div>
              <div className="text-[#9C8B78] text-xs mt-0.5">连续记录天</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#1C1917]">{applications.length}</div>
              <div className="text-[#9C8B78] text-xs mt-0.5">在推进的申请</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#FFD100]">1</div>
              <div className="text-[#9C8B78] text-xs mt-0.5">Offer 待定</div>
            </div>
          </div>
        </div>

        {/* 今日焦点 + 状态卡 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-0">
          <div className="md:col-span-2 bg-white rounded-2xl border border-[#F0EBE4]">
            <div className="p-8 border-b border-[#F5F0EA]">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#FFD100] rounded-full" />
                  <span className="text-[#6B5E4E] text-sm font-medium">今天最要紧的一件事</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#9C8B78]">
                  <span>2月24日・周二・第 18 周</span>
                  <span className="bg-[#1C1917] text-white px-2 py-0.5 rounded text-[10px] tracking-wide">TODAY</span>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-[#1C1917] leading-snug mb-3">
                今天先补一份美团的面试复盘。
              </h2>
              <p className="text-[#9C8B78] text-sm">昨晚 20:30 结束，到现在 14 小时，细节会越来越模糊。</p>
            </div>

            <div className="p-8 space-y-6">
              <div className="bg-yellow-50 rounded-xl py-5 px-5 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-yellow-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-yellow-800 text-xs font-bold">美</span>
                  </div>
                  <div>
                    <div className="font-medium text-[#1C1917] text-sm">美团・产品二面 复盘</div>
                    <div className="text-[#9C8B78] text-xs mt-0.5">⊙ 面试结束 14 小时</div>
                  </div>
                </div>
                <button onClick={onStartReview} className="flex items-center gap-1.5 bg-[#1C1917] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2D2420] transition-colors flex-shrink-0">
                  去写复盘 <ArrowRight size={14} />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-[#9C8B78] w-24 flex-shrink-0">今晚 19:00 –</span>
                  <span className="text-[#1C1917] font-medium">字节「抖音电商产品经理」笔试</span>
                  <span className="text-[#9C8B78] text-xs">・提前 10 分钟调试摄像头</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-[#9C8B78] w-24 flex-shrink-0">下午 16:30</span>
                  <span className="text-[#1C1917] font-medium">小红书 HR 电话沟通</span>
                  <span className="text-[#9C8B78] text-xs">・意向城市 + 薪资，先想好底线</span>
                </div>
              </div>

              <p className="text-[#C5BDB5] text-xs flex items-center gap-1.5">
                <span>✦</span> 拼多多挂了 3 天，今天可以先放着。
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-b from-[#FFF2B3] via-[#FFFBEA] to-[#FBF8F3] rounded-2xl border border-[#FFE36A]/50 p-8 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <span className="text-[#6B5E4E] text-sm font-medium">今天的状态</span>
              <div className="flex items-center gap-1 text-xs text-[#9C8B78]">
                <span>02</span><span>·</span><span>24</span>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-5">
              <div className="relative">
                <Sun size={40} className="text-[#FFD100]" />
                <Cloud size={22} className="text-[#D1CFC9] absolute -bottom-1 -right-1" />
              </div>
              <div>
                <div className="text-xl font-bold text-[#1C1917]">多云转晴</div>
                <div className="text-[#9C8B78] text-xs mt-0.5">比昨天稳</div>
              </div>
            </div>

            <p className="text-[#6B5E4E] text-xs leading-relaxed mb-6 border-t border-[#FFE36A]/60 pt-5">
              本周投递 4 家，复盘按时跟上。上周那场拒信也翻篇了。
            </p>

            <div className="grid grid-cols-2 gap-6 flex-1">
              <div>
                <div className="text-[#9C8B78] text-xs mb-1">本周投递</div>
                <div className="text-[#1C1917] font-bold text-lg">4 <span className="text-[#9C8B78] text-xs font-normal">家</span></div>
                <div className="text-[#9C8B78] text-xs mt-0.5">持平</div>
              </div>
              <div>
                <div className="text-[#9C8B78] text-xs mb-1">复盘完成率</div>
                <div className="text-[#1C1917] font-bold text-lg">83 <span className="text-[#9C8B78] text-xs font-normal">%</span></div>
                <div className="text-[#22C55E] text-xs mt-0.5">↑ 12%</div>
              </div>
              <div>
                <div className="text-[#9C8B78] text-xs mb-1">平均响应时长</div>
                <div className="text-[#1C1917] font-bold text-lg">5.2 <span className="text-[#9C8B78] text-xs font-normal">天</span></div>
                <div className="text-[#22C55E] text-xs mt-0.5">↓ 1.1</div>
              </div>
              <div>
                <div className="text-[#9C8B78] text-xs mb-1">情绪波动</div>
                <div className="text-[#1C1917] font-bold text-lg">中</div>
              </div>
            </div>

            <div className="mt-6 border-t border-[#FFE36A]/60 pt-4">
              <p className="text-orange-600 text-sm italic">给自己泡杯茶，再打开看板。</p>
            </div>
          </div>
        </div>

        {/* 看板区 */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-bold text-[#1C1917]">我的申请</h3>
              <p className="text-[#9C8B78] text-sm mt-0.5">{applications.length} 家在推进，点击卡片查看详情</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-[#9C8B78]">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#F97316] inline-block" />今天活动</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#22C55E] inline-block" />一周内</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#9CA3AF] inline-block" />已处理</span>
            </div>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-6">
            {columns.map((col) => {
              const colApps = getColumnApps(col.id);
              const isExpanded = Boolean(expandedColumns[col.id]);
              const visibleApps = isExpanded ? colApps : colApps.slice(0, 2);
              const hiddenCount = Math.max(0, colApps.length - visibleApps.length);
              return (
                <div key={col.id} className="flex-shrink-0 w-64">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-600 font-medium text-sm">{col.label}</span>
                      <span className="text-[#9C8B78] text-xs bg-[#EDE8E1] rounded-full w-5 h-5 flex items-center justify-center">
                        {colApps.length}
                      </span>
                    </div>
                    <button onClick={() => setModalStatus(col.id)} className="text-[#9C8B78] hover:text-[#1C1917]">
                      <Plus size={16} />
                    </button>
                  </div>
                  <div>
                    {visibleApps.map((app) => (
                      <button key={app.id} onClick={() => setSelectedApplication(app)} className="block w-full text-left">
                        <KanbanCard
                          app={app}
                          latestEvent={applicationTimeline.find((event) => event.applicationId === app.id)}
                        />
                      </button>
                    ))}
                    {colApps.length > 2 && (
                      <button
                        onClick={() => toggleColumn(col.id)}
                        className="w-full mb-3 rounded-xl border border-[#E8E2D9] bg-white px-3 py-2 text-xs font-medium text-[#6B5E4E] hover:border-[#C5BDB5] hover:text-[#1C1917]"
                      >
                        {isExpanded ? '收起这一列' : `展开全部，还有 ${hiddenCount} 家`}
                      </button>
                    )}
                    {colApps.length === 0 && (
                      <div className="bg-[#F5F0EA] rounded-xl p-4 text-center text-[#C5BDB5] text-xs border border-dashed border-[#E8E2D9]">
                        暂无
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <CollapsibleWorkflowPanel />
      </div>

      {showFloating && <FloatingReviewCard onClose={() => setShowFloating(false)} onWrite={onStartReview} />}
      {modalStatus && (
        <ApplicationModal
          initialStatus={modalStatus}
          onClose={() => setModalStatus(null)}
          onCreate={handleCreateApplication}
        />
      )}
      {selectedApplication && (
        <ApplicationDetailModal
          application={selectedApplication}
          timeline={applicationTimeline.filter((event) => event.applicationId === selectedApplication.id)}
          onClose={() => setSelectedApplication(null)}
          onDelete={handleDeleteApplication}
          onAdvanceStep={advanceApplicationStep}
          onScheduleInterview={scheduleInterviewForApplication}
          onMarkOffer={markApplicationOffer}
          onMarkRejected={markApplicationRejected}
          onOpenPrep={setPrepApplicationId}
          onOpenReview={handleOpenReview}
        />
      )}
      {activePrepPack && (
        <InterviewPrepModal
          pack={activePrepPack}
          scheduleEvent={activePrepSchedule}
          onClose={() => setPrepApplicationId(null)}
        />
      )}
    </div>
  );
}
