import { insightsData } from '../data/mockData';
import HorizontalBarChart from '../components/charts/BarChart';
import RadarChart from '../components/charts/RadarChart';
import LineChart from '../components/charts/LineChart';

export default function Insights() {
  const { passRates, radarData, emotionCurve, keyFindings } = insightsData;

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
      dot: 'bg-[#F59E0B]',
      label: 'text-[#F59E0B]',
      bg: 'bg-white',
    },
  };

  return (
    <div className="pt-16 min-h-screen bg-[#FBF8F3]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div className="text-[#9C8B78] text-sm mb-1">自己看不见的问题，数据能帮你看见</div>
        <h1 className="text-2xl md:text-4xl font-bold text-[#1C1917] mb-2 leading-tight">
          你过去 30 天里，有两个规律你可能没注意到
        </h1>
        <p className="text-[#9C8B78] text-sm mb-8">基于你 5 次面试复盘 + 12 次投递返回</p>

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
                      <span className="text-[#F5A623]">✦</span> {finding.suggestion}
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
