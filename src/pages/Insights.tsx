import { useMemo } from 'react';
import HorizontalBarChart from '../components/charts/BarChart';
import RadarChart from '../components/charts/RadarChart';
import LineChart from '../components/charts/LineChart';
import { useJobFlow } from '../store/useJobFlow';
import { calculateInsights } from '../lib/insightCalculations';
import { hasSupabaseConfig } from '../lib/supabaseClient';

function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-[#E8E2D9] bg-[#FBF8F3] p-5">
      <div className="text-[#1C1917] text-sm font-semibold mb-1">{title}</div>
      <p className="text-[#9C8B78] text-sm leading-relaxed">{message}</p>
    </div>
  );
}

function formatValue(value: number | null, suffix = '') {
  return value === null ? '待计算' : `${value}${suffix}`;
}

export default function Insights() {
  const { applications, reviews, scheduleEvents, offerComparisons, loading } = useJobFlow();

  const insights = useMemo(
    () => calculateInsights({ applications, reviews, scheduleEvents, offers: offerComparisons }),
    [applications, reviews, scheduleEvents, offerComparisons]
  );

  const summaryCards = [
    { label: '申请总数', value: insights.summary.totalApplications, sub: 'applications' },
    { label: '已投递', value: insights.summary.submittedCount, sub: 'applications + timeline' },
    { label: '面试中', value: insights.summary.interviewCount, sub: 'applications + scheduleEvents' },
    { label: 'Offer', value: insights.summary.offerCount, sub: 'applications.status' },
    { label: '已拒', value: insights.summary.rejectedCount, sub: 'applications.status' },
    { label: '通过率', value: `${insights.summary.passRate}%`, sub: 'Offer / 已投递' },
  ];

  const moodCopy: Record<string, string> = {
    low: '最近能量偏低，先把复盘拆小，只补事实和下一步，不急着下结论。',
    watch: '状态有波动，建议把面试和休息错开，保留恢复时间。',
    stable: '状态相对稳定，可以继续按当前节奏推进。',
  };
  const lowestMood = insights.mood.chart.reduce<{ date: string; score: number; company?: string } | null>(
    (lowest, item) => (!lowest || item.score < lowest.score ? item : lowest),
    null
  );

  return (
    <div className="pt-16 min-h-screen bg-[#FBF8F3]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        {loading ? (
          <div className="mb-5 rounded-2xl border border-[#E8E2D9] bg-white px-4 py-3 text-sm text-[#9C8B78] flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-[#FFD100] animate-pulse" />
            正在从数据库加载数据，稍等一下…
          </div>
        ) : (
          <div className="mb-5 rounded-2xl border border-[#FFE36A] bg-[#FFFBEA] px-4 py-3 text-sm text-[#6B5E4E]">
            {hasSupabaseConfig
              ? `数据已从 Supabase 加载，刷新后保持稳定。当前读取：${applications.length} 条申请、${reviews.length} 条复盘、${scheduleEvents.length} 条日程。`
              : '当前为演示模式，数据来自本地 mock，未连接数据库，刷新后重置。'}
          </div>
        )}

        <div className="text-[#9C8B78] text-sm mb-1">数据够了再下判断</div>
        <h1 className="text-2xl md:text-4xl font-bold text-[#1C1917] mb-2 leading-tight">
          你的投递、复盘和 Offer 会自动汇总成判断依据
        </h1>
        <p className="text-[#9C8B78] text-sm mb-8">
          当前追溯源：{insights.summary.trace.applications} 条申请、{insights.summary.trace.reviews} 条复盘、{insights.summary.trace.scheduleEvents} 条日程、{insights.summary.trace.offers} 条 Offer 备注
        </p>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          {summaryCards.map((item) => (
            <div key={item.label} className="bg-white rounded-2xl border border-[#F0EBE4] p-4">
              <div className="text-[#9C8B78] text-xs mb-2">{item.label}</div>
              <div className="text-2xl font-bold text-[#1C1917]">{item.value}</div>
              <div className="text-[#C5BDB5] text-[11px] mt-1">{item.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-[#F0EBE4] p-5">
            <div className="text-[#9C8B78] text-xs font-medium mb-1">复盘完成率</div>
            <div className="text-3xl font-bold text-[#1C1917] mb-1">
              {insights.summary.reviewCompletionRate}%
            </div>
            <p className="text-[#9C8B78] text-xs">
              {insights.reviewStats.completed} / {insights.reviewStats.total} 条复盘已完成
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-[#F0EBE4] p-5">
            <div className="text-[#9C8B78] text-xs font-medium mb-1">平均复盘评分</div>
            <div className="text-3xl font-bold text-[#1C1917] mb-1">
              {formatValue(insights.summary.averageReviewScore, ' / 5')}
            </div>
            <p className="text-[#9C8B78] text-xs">
              来自 {insights.reviewStats.scored} 条带能力评分的复盘
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-[#F0EBE4] p-5">
            <div className="text-[#9C8B78] text-xs font-medium mb-1">平均 mood_score</div>
            <div className="text-3xl font-bold text-[#1C1917] mb-1">
              {formatValue(insights.summary.averageMoodScore, ' / 10')}
            </div>
            <p className="text-[#9C8B78] text-xs">
              来自 {insights.mood.scoredCount} 条带情绪评分的复盘
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl border border-[#F0EBE4] p-6">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <div className="text-[#9C8B78] text-xs font-medium mb-1">01 / 流程阶段转化</div>
                <h3 className="text-xl font-bold text-[#1C1917]">从申请状态计算</h3>
              </div>
              <span className="text-[10px] bg-[#F5F0EA] text-[#6B5E4E] border border-[#EDE8E1] px-2 py-0.5 rounded font-medium">
                {insights.stageConversion.sourceCount} 条已投递
              </span>
            </div>
            {insights.stageConversion.unlocked ? (
              <>
                <p className="text-[#9C8B78] text-sm mb-4">
                  阶段转化率基于当前 application 状态和流程步骤计算。
                </p>
                <HorizontalBarChart data={insights.stageConversion.chart} />
              </>
            ) : (
              <EmptyState title="还没有投递数据" message="从岗位库投递或手动新增已投递申请后，这里会生成阶段转化。" />
            )}
          </div>

          <div className="bg-white rounded-2xl border border-[#F0EBE4] p-6">
            <div className="mb-4">
              <div className="text-[#9C8B78] text-xs font-medium mb-1">02 / 能力雷达</div>
              <h3 className="text-xl font-bold text-[#1C1917]">来自复盘 5 维评分</h3>
            </div>
            {insights.abilityRadar.unlocked ? (
              <>
                <p className="text-[#9C8B78] text-sm mb-4">
                  已读取 {insights.abilityRadar.scoredCount} 条带评分复盘，按 1-5 分换算。
                </p>
                <div className="flex justify-center">
                  <RadarChart data={insights.abilityRadar.chart} size={220} />
                </div>
              </>
            ) : (
              <EmptyState
                title="完成 2 次带评分复盘后解锁"
                message={`还需要 ${insights.abilityRadar.needed} 次带评分复盘，雷达才有参考价值。`}
              />
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#F0EBE4] p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-5">
            <div>
              <div className="text-[#9C8B78] text-xs font-medium mb-1">03 / 情绪能量</div>
              <h3 className="text-xl font-bold text-[#1C1917]">过去一段时间，你的状态有起伏</h3>
              <p className="text-[#9C8B78] text-sm mt-2">
                {lowestMood
                  ? `${lowestMood.date} ${lowestMood.company || ''} 那次最低到 ${lowestMood.score} 分，这个点值得单独照顾。`
                  : '记录几次复盘状态后，这里会显示你的低点和恢复趋势。'}
              </p>
            </div>
            <div className="rounded-xl bg-[#FBF8F3] border border-[#F0EBE4] px-4 py-3 min-w-[220px]">
              <div className="flex items-center justify-between text-xs text-[#9C8B78] mb-2">
                <span>平均能量</span>
                <span>{formatValue(insights.mood.average, ' / 10')}</span>
              </div>
              <div className="h-3 rounded-full bg-[#F0EBE4] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#FFD100]"
                  style={{ width: `${Math.min(100, (insights.mood.average || 0) * 10)}%` }}
                />
              </div>
              <p className="text-[#6B5E4E] text-xs mt-3">{moodCopy[insights.mood.supportLevel]}</p>
            </div>
          </div>
          {insights.mood.unlocked ? (
            <>
              <p className="text-[#9C8B78] text-sm mb-6">
                最近趋势：{insights.mood.trend === 'up' ? '回升' : insights.mood.trend === 'down' ? '下降' : '持平'}，来自 {insights.mood.scoredCount} 条复盘。
              </p>
              <div className="overflow-x-auto -mx-2 px-2">
                <LineChart data={insights.mood.chart} width={800} height={220} />
              </div>
              <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-xl bg-[#FBF8F3] border border-[#F0EBE4] p-4">
                  <div className="text-[#9C8B78] text-xs mb-1">最低点</div>
                  <div className="text-[#1C1917] text-lg font-bold">
                    {lowestMood ? `${lowestMood.score} / 10` : '待记录'}
                  </div>
                  <p className="text-[#9C8B78] text-xs mt-1">{lowestMood?.company || '还没有足够数据'}</p>
                </div>
                <div className="rounded-xl bg-[#FBF8F3] border border-[#F0EBE4] p-4">
                  <div className="text-[#9C8B78] text-xs mb-1">当前平均</div>
                  <div className="text-[#1C1917] text-lg font-bold">{formatValue(insights.mood.average, ' / 10')}</div>
                  <p className="text-[#9C8B78] text-xs mt-1">来自复盘 moodScore</p>
                </div>
                <div className="rounded-xl bg-[#FFFBEA] border border-[#FFE36A] p-4">
                  <div className="text-[#7A5A00] text-xs mb-1">情绪支持</div>
                  <p className="text-[#6B5E4E] text-sm leading-relaxed">{moodCopy[insights.mood.supportLevel]}</p>
                </div>
              </div>
            </>
          ) : (
            <EmptyState
              title="记录 2 次 moodScore 后显示趋势"
              message={`还需要 ${insights.mood.needed} 次带情绪评分的复盘。`}
            />
          )}
        </div>

        <div className="text-center text-[#C5BDB5] text-sm py-4">
          数据不够时不硬画图，先告诉你还差什么。
        </div>
      </div>
    </div>
  );
}
