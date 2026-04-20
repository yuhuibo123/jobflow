import { Application, ApplicationTimelineEvent } from '../../types';
import { ActivityDot } from './ActivityDot';
import { ProcessProgress } from './ProcessProgress';
import { getProcessSnapshot } from '../../lib/processHelpers';

function getTagStyle(tag: string) {
  if (tag.includes('19:00') || tag.includes('20:30') || tag.includes('16:30')) {
    return 'bg-[#FFF7CC] text-[#7A5A00] border border-[#FFE36A]';
  }
  if (tag.includes('4 天')) return 'bg-[#DCFCE7] text-[#16A34A]';
  if (tag.includes('JD')) return 'bg-[#F3F4F6] text-[#6B7280] border border-[#E5E7EB]';
  if (tag.includes('笔试')) return 'bg-[#FFF7CC] text-[#7A5A00]';
  if (tag.includes('二面') || tag.includes('一面')) return 'bg-[#FFFBEA] text-[#7A5A00]';
  return 'bg-[#F3F4F6] text-[#6B7280]';
}

function getApplySourceLabel(app: Application) {
  if (app.sourceJobId) return '岗位库来源';
  if (app.applySource === 'platform') return '平台导入';
  if (app.applySource === 'simulated_auto') return '自动同步';
  return '手动新增';
}

export function KanbanCard({ app, latestEvent }: { app: Application; latestEvent?: ApplicationTimelineEvent }) {
  const process = getProcessSnapshot(app);

  return (
    <div
      className={`bg-white rounded-xl p-3.5 border transition-all hover:shadow-md cursor-pointer mb-3 ${
        app.urgency === 'hot' ? 'border-[#FFE36A] shadow-sm' : 'border-[#F0EBE4]'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ backgroundColor: app.companyColor }}
          >
            {app.companyInitial}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-[#1C1917] text-sm">{app.company}</span>
              {app.isDemo && (
                <span className="text-[9px] bg-[#EDE8E1] text-[#6B5E4E] px-1.5 py-0.5 rounded-full font-medium">
                  示例
                </span>
              )}
              {app.urgency === 'hot' && (
                <span className="text-[9px] bg-[#FFF7CC] text-[#7A5A00] px-1.5 py-0.5 rounded-full font-medium">
                  趁热复盘
                </span>
              )}
            </div>
            <div className="text-[#9C8B78] text-xs">
              {app.position}・{app.department}
            </div>
          </div>
        </div>
        <ActivityDot type={app.activityDot} />
      </div>

      {app.tags && app.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {app.tags.map((tag, i) => (
            <span key={i} className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getTagStyle(tag)}`}>
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-1 text-[#9C8B78] text-xs mb-2">
        <span>⊙ {app.location}</span>
        <span>・</span>
        <span>{app.salary}</span>
        <span>・</span>
        <span>{app.headcount}</span>
      </div>

      {app.note && (
        <div className="text-[#6B5E4E] text-xs leading-relaxed border-t border-[#F5F0EA] pt-2 mt-1">
          <span className="text-[#FFD100]">↗</span> {app.note}
        </div>
      )}

      <ProcessProgress app={app} />

      <div className="mt-3 grid grid-cols-1 gap-1.5 border-t border-[#F5F0EA] pt-3 text-[10px] text-[#9C8B78]">
        <div className="flex items-center justify-between gap-2">
          <span>当前：<span className="text-[#1C1917]">{process.currentStep}</span></span>
          <span>下一步：<span className="text-[#1C1917]">{process.nextStep}</span></span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span>{getApplySourceLabel(app)}</span>
          <span className="truncate text-right">{latestEvent?.title || '暂无新事件'}</span>
        </div>
      </div>

      <div className="text-[#C5BDB5] text-[10px] mt-2 text-right">
        {app.daysAgo === 0 ? '今天' : app.daysAgo === 1 ? '1 天前' : `${app.daysAgo} 天前`}
      </div>
    </div>
  );
}
