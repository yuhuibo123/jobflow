import { useState } from 'react';
import { Plus, Zap, X, ArrowRight, Sun, Cloud } from 'lucide-react';
import { applications } from '../data/mockData';
import { Application, ApplicationStatus } from '../types';

const columns: { id: ApplicationStatus; label: string }[] = [
  { id: 'interested', label: '感兴趣' },
  { id: 'applied', label: '已投递' },
  { id: 'written_test', label: '笔试' },
  { id: 'interviewing', label: '面试中' },
  { id: 'offer', label: 'Offer' },
  { id: 'rejected', label: '已拒' },
];

function ActivityDot({ type }: { type?: 'today' | 'week' | 'handled' }) {
  if (!type) return null;
  const colors = {
    today: '#F97316',
    week: '#22C55E',
    handled: '#9CA3AF',
  };
  return (
    <span
      className="w-2 h-2 rounded-full inline-block flex-shrink-0"
      style={{ backgroundColor: colors[type] }}
    />
  );
}

function KanbanCard({ app }: { app: Application }) {
  const getTagStyle = (tag: string) => {
    if (tag.includes('19:00') || tag.includes('20:30') || tag.includes('16:30')) {
      return 'bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]';
    }
    if (tag.includes('4 天')) return 'bg-[#DCFCE7] text-[#16A34A]';
    if (tag.includes('JD')) return 'bg-[#F3F4F6] text-[#6B7280] border border-[#E5E7EB]';
    if (tag.includes('笔试')) return 'bg-[#FEF3C7] text-[#D97706]';
    if (tag.includes('二面') || tag.includes('一面')) return 'bg-[#FEF9EE] text-[#D97706]';
    return 'bg-[#F3F4F6] text-[#6B7280]';
  };

  return (
    <div
      className={`bg-white rounded-xl p-3.5 border transition-all hover:shadow-md cursor-pointer mb-3 ${
        app.urgency === 'hot' ? 'border-[#FDE68A] shadow-sm' : 'border-[#F0EBE4]'
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
              {app.urgency === 'hot' && (
                <span className="text-[9px] bg-[#FEF3C7] text-[#D97706] px-1.5 py-0.5 rounded-full font-medium">
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
          <span className="text-[#F5A623]">↗</span> {app.note}
        </div>
      )}

      <div className="text-[#C5BDB5] text-[10px] mt-2 text-right">
        {app.daysAgo === 0 ? '今天' : app.daysAgo === 1 ? '1 天前' : `${app.daysAgo} 天前`}
      </div>
    </div>
  );
}

function FloatingReviewCard({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed bottom-24 right-4 md:bottom-8 md:right-8 w-[calc(100vw-2rem)] md:w-80 bg-white rounded-2xl shadow-2xl border border-[#F0EBE4] overflow-hidden z-40">
      <div className="bg-[#FBF8F3] px-4 py-3 flex items-center justify-between border-b border-[#F0EBE4]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#F5A623] flex items-center justify-center">
            <Zap size={12} className="text-white" />
          </div>
          <span className="text-[#1C1917] text-sm font-medium">趁热复盘</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#9C8B78] text-xs">14 小时前</span>
          <button onClick={onClose} className="text-[#9C8B78] hover:text-[#1C1917]">
            <X size={14} />
          </button>
        </div>
      </div>
      <div className="px-4 py-4">
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-5 h-5 rounded bg-[#F5A623] flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">美</span>
          </div>
          <span className="text-[#1C1917] text-sm font-medium">美团</span>
          <span className="text-[#F5A623] text-sm font-medium">二面・业务负责人</span>
          <span className="text-[#1C1917] text-sm">刚刚过去</span>
        </div>
        <p className="text-[#6B5E4E] text-xs leading-relaxed mb-4">
          再过一天细节就模糊了。花 6 分钟先记两条要点。
        </p>
        <div className="flex items-center gap-2">
          <button className="flex-1 bg-[#1C1917] text-white py-2 rounded-xl text-sm font-medium hover:bg-[#2D2420] transition-colors">
            好，花 6 分钟写
          </button>
          <button className="text-[#9C8B78] text-xs hover:text-[#6B5E4E]">稍后再说</button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [showFloating, setShowFloating] = useState(true);

  const getColumnApps = (status: ApplicationStatus) =>
    applications.filter((a) => a.status === status);

  return (
    <div className="pt-16 min-h-screen bg-[#FBF8F3]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">

        {/* 头部问候 */}
        <div className="text-[#9C8B78] text-sm mb-2">2026 年 2 月 24 日・周二</div>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-6 md:mb-10">
          <h1 className="text-2xl md:text-4xl font-bold text-[#1C1917]">
            早上好，林晚
            <span className="text-[#9C8B78] font-normal text-3xl mx-2">·</span>
            <span className="text-[#F5A623]">稳住，一家家来</span>
          </h1>
          <div className="flex items-center gap-8 md:text-right">
            <div>
              <div className="text-2xl font-bold text-[#1C1917]">18</div>
              <div className="text-[#9C8B78] text-xs mt-0.5">连续记录天</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#1C1917]">14</div>
              <div className="text-[#9C8B78] text-xs mt-0.5">在推进的申请</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#F5A623]">1</div>
              <div className="text-[#9C8B78] text-xs mt-0.5">Offer 待定</div>
            </div>
          </div>
        </div>

        {/* 今日焦点 + 状态卡 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-0">

          {/* 今日焦点卡片 */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-[#F0EBE4]">
            <div className="p-8 border-b border-[#F5F0EA]">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#F5A623] rounded-full" />
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
              {/* 行动条 */}
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
                <button className="flex items-center gap-1.5 bg-[#1C1917] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2D2420] transition-colors flex-shrink-0">
                  去写复盘 <ArrowRight size={14} />
                </button>
              </div>

              {/* 今日日程 */}
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

          {/* 今日状态卡 */}
          <div className="bg-gradient-to-b from-[#FDE68A] to-[#FBF8F3] rounded-2xl border border-[#F5D97A]/60 p-8 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <span className="text-[#6B5E4E] text-sm font-medium">今天的状态</span>
              <div className="flex items-center gap-1 text-xs text-[#9C8B78]">
                <span>02</span>
                <span>·</span>
                <span>24</span>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-5">
              <div className="relative">
                <Sun size={40} className="text-[#F5A623]" />
                <Cloud size={22} className="text-[#D1CFC9] absolute -bottom-1 -right-1" />
              </div>
              <div>
                <div className="text-xl font-bold text-[#1C1917]">多云转晴</div>
                <div className="text-[#9C8B78] text-xs mt-0.5">比昨天稳</div>
              </div>
            </div>

            <p className="text-[#6B5E4E] text-xs leading-relaxed mb-6 border-t border-[#F0C840]/60 pt-5">
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

            <div className="mt-6 border-t border-[#F0C840]/60 pt-4">
              <p className="text-orange-600 text-sm italic">给自己泡杯茶，再打开看板。</p>
            </div>
          </div>
        </div>

        {/* 看板区 */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-bold text-[#1C1917]">我的申请</h3>
              <p className="text-[#9C8B78] text-sm mt-0.5">14 家在推进，拖动更新状态</p>
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
              return (
                <div key={col.id} className="flex-shrink-0 w-64">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-600 font-medium text-sm">{col.label}</span>
                      <span className="text-[#9C8B78] text-xs bg-[#EDE8E1] rounded-full w-5 h-5 flex items-center justify-center">
                        {colApps.length}
                      </span>
                    </div>
                    <button className="text-[#9C8B78] hover:text-[#1C1917]">
                      <Plus size={16} />
                    </button>
                  </div>
                  <div>
                    {colApps.map((app) => (
                      <KanbanCard key={app.id} app={app} />
                    ))}
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

      </div>

      {showFloating && <FloatingReviewCard onClose={() => setShowFloating(false)} />}
    </div>
  );
}
