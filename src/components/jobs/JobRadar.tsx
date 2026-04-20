import { useMemo, useState } from 'react';
import { Check, Radar, RefreshCw, Sparkles } from 'lucide-react';
import { useJobFlow } from '../../store/useJobFlow';
import { JobLead } from '../../types';

const radarPool: Array<Omit<JobLead, 'id' | 'createdAt' | 'status'>> = [
  {
    company: '小红书',
    title: 'AI 产品经理',
    department: '创作者工具',
    jd: '负责 AI 创作工具的需求洞察、产品方案和效果评估。',
    sourceType: 'ai_recommendation',
    sourceUrl: 'https://example.com/xhs-ai-pm',
    tags: ['AI PM', '创作者', '工具'],
    matchScore: 91,
    reason: '和你关注的 AI PM、产品经理关键词高度匹配，适合用项目拆解经历切入。',
    keywordSource: ['AI PM', '产品经理'],
    note: '先看 JD 里的模型协作和创作者场景要求。',
  },
  {
    company: '美团',
    title: '到店增长产品',
    department: '本地生活',
    jd: '负责到店业务增长策略、商家转化和用户复购。',
    sourceType: 'ai_recommendation',
    sourceUrl: 'https://example.com/meituan-growth',
    tags: ['增长', '本地生活', '数据'],
    matchScore: 88,
    reason: '和增长、数据、业务复盘关键词相关，也能接上你已有的美团面试准备。',
    keywordSource: ['增长', '数据'],
    note: '适合用漏斗分析和策略实验经历筛选。',
  },
  {
    company: '携程',
    title: '酒店策略产品经理',
    department: '酒店业务',
    jd: '围绕酒店供给、价格策略和用户预订链路做产品优化。',
    sourceType: 'ai_recommendation',
    sourceUrl: 'https://example.com/ctrip-hotel-pm',
    tags: ['策略', '交易', '供应'],
    matchScore: 82,
    reason: '匹配产品经理和业务策略关键词，但行业理解需要再补。',
    keywordSource: ['产品经理'],
    note: '先判断是否愿意准备旅游酒旅行业案例。',
  },
  {
    company: '得物',
    title: '交易产品经理',
    department: '社区电商',
    jd: '负责交易链路、履约体验和用户增长策略。',
    sourceType: 'ai_recommendation',
    sourceUrl: 'https://example.com/dewu-product',
    tags: ['交易', '履约', '增长'],
    matchScore: 79,
    reason: '增长和交易链路相关，适合作为备选机会收纳。',
    keywordSource: ['增长', '产品经理'],
    note: '可晚点和电商岗位一起筛。',
  },
];

export function JobRadar() {
  const { saveJobLead, userSettings } = useJobFlow();
  const [offset, setOffset] = useState(0);
  const [searching, setSearching] = useState(false);
  const recommendations = useMemo(() => {
    return [0, 1].map((step) => radarPool[(offset + step) % radarPool.length]);
  }, [offset]);

  const searchLatestJobs = () => {
    setSearching(true);
    window.setTimeout(() => {
      setOffset((current) => (current + 1) % radarPool.length);
      setSearching(false);
    }, 700);
  };

  return (
    <div className="rounded-xl border border-[#FFE36A] bg-gradient-to-br from-white via-[#FFFBEA] to-[#FBF8F3] p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#1C1917] flex items-center justify-center">
              <Radar size={16} className="text-white" />
            </div>
            <div>
              <h4 className="text-[#1C1917] font-bold text-base">AI 搜索最新岗位</h4>
              <p className="text-[#9C8B78] text-xs mt-0.5">自动找机会，先加入待处理，再决定想不想投。</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {userSettings.watchedKeywords.slice(0, 4).map((keyword) => (
              <span key={keyword} className="rounded-full bg-white border border-[#FFE36A] px-2 py-0.5 text-[10px] text-[#7A5A00]">
                {keyword}
              </span>
            ))}
          </div>
        </div>
        <button
          onClick={searchLatestJobs}
          disabled={searching}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#1C1917] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          <RefreshCw size={12} className={searching ? 'animate-spin' : ''} />
          {searching ? '搜索中' : '开始搜索'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {recommendations.map((job) => (
          <div key={`${job.company}-${job.title}`} className="rounded-xl bg-white border border-[#F0EBE4] p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <div className="text-[#1C1917] text-sm font-semibold">{job.company}</div>
                <div className="text-[#6B5E4E] text-xs mt-0.5">{job.title}</div>
              </div>
              <span className="text-[10px] rounded-full bg-[#FFF7CC] border border-[#FFE36A] px-2 py-0.5 text-[#7A5A00]">
                {job.matchScore}%
              </span>
            </div>
            <p className="text-[#9C8B78] text-xs leading-relaxed mb-2">{job.reason}</p>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] text-[#9C8B78]">
                来源：{job.keywordSource?.join(' / ')}
              </span>
              <button
                onClick={() => saveJobLead({ ...job, status: 'collected' })}
                className="inline-flex items-center gap-1 rounded-lg border border-[#E8E2D9] bg-[#FBF8F3] px-2.5 py-1.5 text-xs font-medium text-[#6B5E4E] hover:border-[#C5BDB5]"
              >
                <Sparkles size={12} />
                加入待处理
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-[#9C8B78] text-[10px]">
        <Check size={12} />
        搜索结果加入待处理机会后，再决定加入想投或直接投递。
      </div>
    </div>
  );
}
