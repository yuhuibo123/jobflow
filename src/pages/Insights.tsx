import { useMemo } from 'react';
import { insightsData } from '../data/mockData';
import HorizontalBarChart from '../components/charts/BarChart';
import RadarChart from '../components/charts/RadarChart';
import LineChart from '../components/charts/LineChart';
import { useApplications } from '../hooks/useApplications';
import { useReviews } from '../hooks/useReviews';

export default function Insights() {
  const { applications, loading: applicationsLoading, error: applicationsError } = useApplications();
  const { reviews, loading: reviewsLoading, error: reviewsError } = useReviews();

  const passRates = useMemo(() => {
    const calcRate = (matcher: (tags: string[], stage: string) => boolean, fallback: number) => {
      const matched = reviews.filter((review) => matcher(review.tags, review.stage));
      if (matched.length === 0) return fallback;
      const passed = matched.filter((review) => review.result === 'pass').length;
      return Math.round((passed / matched.length) * 100);
    };

    return [
      {
        category: '行为面',
        rate: calcRate((tags) => tags.some((tag) => tag.includes('行为')), 83),
        color: '#22C55E',
      },
      {
        category: '业务 Case',
        rate: calcRate((tags) => tags.some((tag) => tag.toLowerCase().includes('case')), 60),
        color: '#FFD100',
      },
      {
        category: '技术/数据',
        rate: calcRate((tags, stage) => tags.some((tag) => tag.includes('数据') || tag.includes('技术')) || stage.includes('技术'), 33),
        color: '#F97316',
      },
      {
        category: 'HR 面',
        rate: calcRate((tags, stage) => tags.some((tag) => tag.toUpperCase().includes('HR')) || stage.toUpperCase().includes('HR'), 95),
        color: '#22C55E',
      },
    ];
  }, [reviews]);

  const emotionCurve = useMemo(() => {
    const scoredReviews = reviews
      .filter((review) => typeof review.moodScore === 'number')
      .map((review) => ({
        date: review.date.split(' ').slice(0, 3).join(' ') || review.company,
        score: review.moodScore || 0,
      }));

    return scoredReviews.length >= 2 ? scoredReviews : insightsData.emotionCurve;
  }, [reviews]);

  const radarData = useMemo(() => {
    const averageCompletion = reviews.length
      ? Math.round(reviews.reduce((sum, review) => sum + review.completed, 0) / reviews.length)
      : 0;
    const passCount = reviews.filter((review) => review.result === 'pass').length;
    const passRate = reviews.length ? Math.round((passCount / reviews.length) * 100) : 0;
    const activeCount = applications.filter((item) => item.status !== 'rejected').length;

    return insightsData.radarData.map((item) => {
      if (item.label === '结构化表达') return { ...item, value: Math.max(45, averageCompletion) };
      if (item.label === '追问应变') return { ...item, value: Math.max(40, passRate) };
      if (item.label === '项目深度') return { ...item, value: Math.min(95, 45 + activeCount * 2) };
      return item;
    });
  }, [applications, reviews]);

  const keyFindings = useMemo(() => {
    const activeApplications = applications.filter((item) => item.status !== 'rejected').length;
    const pendingReviews = reviews.filter((review) => review.completed < 100).length;
    const failedReviews = reviews.filter((review) => review.result === 'fail').length;

    return [
      {
        type: 'weakness',
        label: '反复踩的坑',
        title: pendingReviews > 0 ? `还有 ${pendingReviews} 场复盘没有补完整` : '复盘完整度保持得不错',
        evidence: `证据：当前共有 ${reviews.length} 条复盘，其中 ${pendingReviews} 条完成度低于 100%`,
        note: pendingReviews > 0 ? '复盘没有及时补完时，后面很难再还原追问细节。' : '完整复盘越多，后面的洞察会越准。',
        suggestion: pendingReviews > 0 ? '优先打开复盘库，把 STAR 里的空项补齐。' : '继续保持，下一步可以让 AI 帮你总结高频问题。',
      },
      {
        type: 'strength',
        label: '一个没意识到的优势',
        title: `你现在有 ${activeApplications} 个机会还在推进`,
        evidence: `证据：看板中除已拒外，共有 ${activeApplications} 条申请记录`,
        note: '机会池还在滚动，说明你不是只有单点机会。',
        suggestion: '把精力优先放在面试中和笔试阶段，不要平均用力。',
      },
      {
        type: 'timing',
        label: '节奏提示',
        title: failedReviews > 0 ? `有 ${failedReviews} 场失败经历值得沉淀` : '目前失败样本不多，先积累复盘',
        evidence: `证据：复盘库中结果为未通过的记录有 ${failedReviews} 条`,
        note: failedReviews > 0 ? '失败复盘通常比通过复盘更能暴露真实短板。' : '样本越多，趋势会越明显。',
        suggestion: failedReviews > 0 ? '把失败场景单独整理成面试前检查清单。' : '每场面试结束后尽量当天补一条复盘。',
      },
    ];
  }, [applications, reviews]);

  const findingStyles = {
    weakness: {
      dot: 'bg-[#EF4444]',
      label: 'text-[#EF4444]',
      bg: 'bg-white',
    },
    strength: {
      dot: 'bg-[#22C55E]',
      label: 'text-[#22C55E]',
      bg: 'bg-white',
    },
    timing: {
      dot: 'bg-[#FFD100]',
      label: 'text-[#FFD100]',
      bg: 'bg-white',
    },
  };

  return (
    <div className="pt-16 min-h-screen bg-[#FBF8F3]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div className="mb-5 rounded-2xl border border-[#FFE36A] bg-[#FFFBEA] px-4 py-3 text-sm text-[#6B5E4E]">
          洞察会基于示例数据和你新增的真实数据库记录一起计算。
          {(applicationsLoading || reviewsLoading) && <span className="ml-2 text-[#7A5A00]">正在加载数据库记录...</span>}
          {(applicationsError || reviewsError) && <span className="ml-2 text-[#EF4444]">{applicationsError || reviewsError}</span>}
        </div>
        <div className="text-[#9C8B78] text-sm mb-1">自己看不见的问题，数据能帮你看见</div>
        <h1 className="text-2xl md:text-4xl font-bold text-[#1C1917] mb-2 leading-tight">
          你过去 30 天里，有几个规律你可能没注意到
        </h1>
        <p className="text-[#9C8B78] text-sm mb-8">基于 {reviews.length} 次面试复盘 + {applications.length} 条申请记录</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl border border-[#F0EBE4] p-6">
            <div className="flex items-start justify-between mb-1">
              <div>
                <div className="text-[#9C8B78] text-xs font-medium mb-1">01 / 通过率</div>
                <h3 className="text-xl font-bold text-[#1C1917]">不同题型的通过率差得挺远</h3>
              </div>
              <span className="text-[10px] bg-[#FEF2F2] text-[#EF4444] border border-[#FECACA] px-2 py-0.5 rounded font-medium">
                WEAK POINT
              </span>
            </div>
            <p className="text-[#9C8B78] text-sm mb-4">
              行为面你通过 83%，但一到技术 / 数据题就剩 33%。这不是"运气"，是真的差。
            </p>
            <HorizontalBarChart data={passRates} />
          </div>

          <div className="bg-white rounded-2xl border border-[#F0EBE4] p-6">
            <div className="mb-1">
              <div className="text-[#9C8B78] text-xs font-medium mb-1">02 / 能力雷达</div>
              <h3 className="text-xl font-bold text-[#1C1917]">你的长短板长这样</h3>
            </div>
            <p className="text-[#9C8B78] text-sm mb-4">实线是你，虚线是同期候选人均值</p>
            <div className="flex justify-center">
              <RadarChart data={radarData} size={220} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#F0EBE4] p-6 mb-6">
          <div className="mb-1">
            <div className="text-[#9C8B78] text-xs font-medium mb-1">03 / 心情曲线</div>
            <h3 className="text-xl font-bold text-[#1C1917]">过去 30 天，你的情绪有过一次大掉</h3>
          </div>
          <p className="text-[#9C8B78] text-sm mb-6">
            2 月 15 日拼多多被拒那天，你神到了 4.0 分 —— 挺过来了
          </p>
          <div className="overflow-x-auto -mx-2 px-2"><LineChart data={emotionCurve} width={800} height={220} /></div>
        </div>

        <div className="mb-6">
          <div className="text-[#9C8B78] text-xs font-medium mb-1">04 / 关键发现</div>
          <h3 className="text-xl font-bold text-[#1C1917] mb-4">三条你可能没注意到的规律</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {keyFindings.map((finding, i) => {
              const style = findingStyles[finding.type as keyof typeof findingStyles];
              return (
                <div key={i} className={`${style.bg} rounded-2xl border border-[#F0EBE4] p-5`}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                    <span className={`text-xs font-medium ${style.label}`}>{finding.label}</span>
                  </div>
                  <h4 className="font-bold text-[#1C1917] text-sm leading-snug mb-2">
                    {finding.title}
                  </h4>
                  <p className="text-[#9C8B78] text-xs leading-relaxed mb-3">
                    <span className="text-[#C5BDB5]">证据：</span>
                    {finding.evidence.replace('证据：', '')}
                  </p>
                  <p className="text-[#6B5E4E] text-xs leading-relaxed mb-3">{finding.note}</p>
                  <div className="border-t border-[#F5F0EA] pt-3">
                    <p className="text-[#6B5E4E] text-xs leading-relaxed">
                      <span className="text-[#FFD100]">✦</span> {finding.suggestion}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center text-[#C5BDB5] text-sm italic py-4">
          * 数据不是为了打分，是为了让你知道，下一次从哪里改。*
        </div>
      </div>
    </div>
  );
}
