import { useEffect, useState } from 'react';
import { CheckCircle2, Clock, Filter, ArrowRight, Plus, Trash2, Save, X } from 'lucide-react';
import { useReviews, ReviewInput } from '../hooks/useReviews';
import { ReviewEntry } from '../types';

type FilterType = '全部' | '趁热待写' | '挂了的' | '高分场';

const filters: FilterType[] = ['全部', '趁热待写', '挂了的', '高分场'];

function ReviewListCard({
  review,
  isSelected,
  onClick,
}: {
  review: ReviewEntry;
  isSelected: boolean;
  onClick: () => void;
}) {
  const getProgressColor = () => {
    if (review.completed === 100) return review.result === 'fail' ? '#EF4444' : '#22C55E';
    return '#FFD100';
  };

  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-2xl cursor-pointer transition-all border-2 ${
        isSelected ? 'border-[#FFD100] bg-[#FFFBEA]' : 'border-[#F0EBE4] bg-white hover:border-[#E8DDD0]'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#1C1917] text-base">{review.company}</span>
          {review.isHot && (
            <span className="text-[10px] bg-[#FFF7CC] text-[#7A5A00] px-2 py-0.5 rounded-full font-medium border border-[#FFE36A]">
              趁热待写
            </span>
          )}
          {review.result === 'pass' && (
            <CheckCircle2 size={16} className="text-[#22C55E]" />
          )}
          {review.result === 'fail' && (
            <div className="w-4 h-4 rounded-full border-2 border-[#EF4444] flex items-center justify-center">
              <span className="text-[#EF4444] text-[8px] font-bold">✕</span>
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="text-[#9C8B78] text-xs">{review.date}</div>
          <div className="text-[#9C8B78] text-xs mt-0.5">{review.duration} 分钟</div>
        </div>
      </div>

      <div className="text-[#6B5E4E] text-xs mb-2">{review.position}・{review.stage}</div>
      <p className="text-[#6B5E4E] text-sm leading-relaxed mb-3">{review.summary}</p>

      <div className="flex items-center justify-between">
        <div className="flex gap-1.5 flex-wrap">
          {review.tags.map((tag, i) => (
            <span
              key={i}
              className={`text-[11px] px-2.5 py-0.5 rounded-full border font-medium ${
                tag === '挂了' || tag === '不太好'
                  ? 'bg-[#FEF2F2] text-[#EF4444] border-[#FECACA]'
                  : 'bg-[#F5F0EA] text-[#6B5E4E] border-[#EDE8E1]'
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="text-xs font-medium"
            style={{ color: getProgressColor() }}
          >
            {review.score}
          </span>
          <span className="text-[#C5BDB5] text-xs">・</span>
          <span className="text-[#9C8B78] text-xs">{review.completed}%</span>
        </div>
      </div>

      <div
        className="h-0.5 rounded-full mt-3"
        style={{ backgroundColor: '#F0EBE4' }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${review.completed}%`,
            backgroundColor: getProgressColor(),
          }}
        />
      </div>
    </div>
  );
}

function StarSection({ label, letter, content, placeholder }: {
  label: string;
  letter: string;
  content: string;
  placeholder?: string;
}) {
  const isEmpty = !content;
  return (
    <div className={`rounded-xl p-4 border ${isEmpty ? 'bg-[#FFFBEA] border-[#FFE36A]' : 'bg-[#FAFAF9] border-[#F0EBE4]'}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-5 h-5 rounded bg-[#1C1917] flex items-center justify-center flex-shrink-0">
          <span className="text-white text-[10px] font-bold">{letter}</span>
        </div>
        <span className="text-[#1C1917] text-sm font-medium">・{label}</span>
      </div>
      {isEmpty ? (
        <p className="text-[#C5BDB5] text-sm italic">{placeholder}</p>
      ) : (
        <p className="text-[#1C1917] text-sm leading-relaxed">{content}</p>
      )}
    </div>
  );
}

function reviewToInput(review: ReviewEntry): ReviewInput {
  return {
    company: review.company,
    position: review.position,
    stage: review.stage,
    date: review.date,
    duration: review.duration,
    summary: review.summary,
    tags: review.tags,
    score: review.score,
    scoreColor: review.scoreColor,
    completed: review.completed,
    isHot: review.isHot,
    result: review.result,
    star: review.star || { situation: '', task: '', action: '', result: '' },
    nextStep: review.nextStep,
    moodState: review.moodState,
    moodScore: review.moodScore,
  };
}

function ReviewCreateModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (input: ReviewInput) => Promise<void>;
}) {
  const [form, setForm] = useState({
    company: '',
    position: '',
    stage: '',
    date: '',
    duration: '45',
    summary: '',
    tags: '',
    result: 'pending' as NonNullable<ReviewEntry['result']>,
    moodScore: '7',
  });
  const [submitting, setSubmitting] = useState(false);

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    await onCreate({
      company: form.company,
      position: form.position,
      stage: form.stage,
      date: form.date,
      duration: Number(form.duration) || 0,
      summary: form.summary,
      tags: form.tags
        .split(/[,，]/)
        .map((tag) => tag.trim())
        .filter(Boolean),
      score: form.result === 'fail' ? '待改进' : '待复盘',
      scoreColor: form.result === 'fail' ? '#EF4444' : '#FFD100',
      completed: 25,
      isHot: true,
      result: form.result,
      star: { situation: '', task: '', action: '', result: '' },
      moodScore: Number(form.moodScore) || undefined,
    });
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/30 flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-xl bg-white rounded-2xl border border-[#F0EBE4] shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#F5F0EA] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#1C1917]">新增复盘</h2>
            <p className="text-[#9C8B78] text-xs mt-0.5">保存后可以在详情里继续补 STAR。</p>
          </div>
          <button type="button" onClick={onClose} className="text-[#9C8B78] hover:text-[#1C1917]">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="space-y-1">
            <span className="text-[#6B5E4E] text-xs font-medium">公司</span>
            <input required value={form.company} onChange={(e) => updateField('company', e.target.value)} className="w-full border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFD100]" />
          </label>
          <label className="space-y-1">
            <span className="text-[#6B5E4E] text-xs font-medium">岗位</span>
            <input required value={form.position} onChange={(e) => updateField('position', e.target.value)} className="w-full border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFD100]" />
          </label>
          <label className="space-y-1">
            <span className="text-[#6B5E4E] text-xs font-medium">面试阶段</span>
            <input value={form.stage} onChange={(e) => updateField('stage', e.target.value)} placeholder="例如 一面·业务负责人" className="w-full border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFD100]" />
          </label>
          <label className="space-y-1">
            <span className="text-[#6B5E4E] text-xs font-medium">日期</span>
            <input value={form.date} onChange={(e) => updateField('date', e.target.value)} placeholder="例如 4 月 18 日 14:00" className="w-full border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFD100]" />
          </label>
          <label className="space-y-1">
            <span className="text-[#6B5E4E] text-xs font-medium">时长（分钟）</span>
            <input value={form.duration} onChange={(e) => updateField('duration', e.target.value)} type="number" min="0" className="w-full border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFD100]" />
          </label>
          <label className="space-y-1">
            <span className="text-[#6B5E4E] text-xs font-medium">结果</span>
            <select value={form.result} onChange={(e) => updateField('result', e.target.value)} className="w-full border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFD100] bg-white">
              <option value="pending">等待中</option>
              <option value="pass">通过</option>
              <option value="fail">未通过</option>
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-[#6B5E4E] text-xs font-medium">标签</span>
            <input value={form.tags} onChange={(e) => updateField('tags', e.target.value)} placeholder="用逗号分隔" className="w-full border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFD100]" />
          </label>
          <label className="space-y-1">
            <span className="text-[#6B5E4E] text-xs font-medium">状态评分</span>
            <input value={form.moodScore} onChange={(e) => updateField('moodScore', e.target.value)} type="number" min="0" max="10" step="0.1" className="w-full border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFD100]" />
          </label>
          <label className="md:col-span-2 space-y-1">
            <span className="text-[#6B5E4E] text-xs font-medium">一句话总结</span>
            <textarea value={form.summary} onChange={(e) => updateField('summary', e.target.value)} rows={3} className="w-full border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFD100] resize-none" />
          </label>
        </div>

        <div className="px-5 py-4 bg-[#FBF8F3] border-t border-[#F5F0EA] flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-[#E8E2D9] text-[#6B5E4E] text-sm">取消</button>
          <button disabled={submitting} className="px-4 py-2 rounded-lg bg-[#1C1917] text-white text-sm font-medium disabled:opacity-60">
            {submitting ? '保存中...' : '保存复盘'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function ReviewLibrary({
  createRequest,
  onAddToSchedule,
}: {
  createRequest: number;
  onAddToSchedule: () => void;
}) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('全部');
  const [selectedId, setSelectedId] = useState<string>('1');
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [starDraft, setStarDraft] = useState({ situation: '', task: '', action: '', result: '' });
  const { reviews, loading, error, createReview, updateReview, deleteReview } = useReviews();

  useEffect(() => {
    if (createRequest > 0) {
      setShowCreateModal(true);
    }
  }, [createRequest]);

  const filteredReviews = reviews.filter((r) => {
    if (activeFilter === '全部') return true;
    if (activeFilter === '趁热待写') return r.isHot;
    if (activeFilter === '挂了的') return r.result === 'fail';
    if (activeFilter === '高分场') return r.score === '状态很好';
    return true;
  });

  const selected = reviews.find((r) => r.id === selectedId) || reviews[0];

  useEffect(() => {
    setStarDraft(selected.star || { situation: '', task: '', action: '', result: '' });
  }, [selected]);

  const handleCreateReview = async (input: ReviewInput) => {
    const created = await createReview(input);
    if (created) {
      setSelectedId(created.id);
      setShowCreateModal(false);
      setMobileView('detail');
    }
  };

  const handleSaveStar = async () => {
    if (!selected || selected.isDemo) return;
    await updateReview(selected, {
      ...reviewToInput(selected),
      star: starDraft,
      completed: 100,
    });
  };

  const handleDeleteReview = async () => {
    if (!selected) return;
    const deleted = await deleteReview(selected);
    if (deleted) {
      setSelectedId('1');
      setMobileView('list');
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-[#FBF8F3]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div className="mb-5 rounded-2xl border border-[#FFE36A] bg-[#FFFBEA] px-4 py-3 text-sm text-[#6B5E4E]">
          为了便于展示，这里预置了示例复盘。你可以新增、编辑或删除自己的复盘，示例数据不会被删除。
          {loading && <span className="ml-2 text-[#7A5A00]">正在加载数据库记录...</span>}
          {error && <span className="ml-2 text-[#EF4444]">{error}</span>}
        </div>
        <div className="text-[#9C8B78] text-sm mb-1">每一场面试，都别白走</div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-2xl md:text-4xl font-bold text-[#1C1917]">
            复盘库 <span className="text-[#9C8B78] font-normal text-2xl">{reviews.length}</span>
          </h1>
          <div className="flex items-center gap-1.5 flex-wrap">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeFilter === f
                    ? 'bg-[#1C1917] text-white'
                    : 'text-[#6B5E4E] hover:text-[#1C1917] hover:bg-[#EDE8E1]'
                }`}
              >
                {f}
              </button>
            ))}
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium bg-[#1C1917] text-white"
            >
              <Plus size={14} />
              新增复盘
            </button>
            <button
              onClick={() => setActiveFilter('全部')}
              title="重置筛选"
              className="p-2 bg-white border border-[#E8E2D9] rounded-lg text-[#6B5E4E] hover:border-[#C5BDB5]"
            >
              <Filter size={16} />
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-5 gap-6">
          <div className={`col-span-5 md:col-span-2 space-y-3 ${mobileView === 'detail' ? 'hidden md:block' : ''}`}>
            {filteredReviews.map((review) => (
              <ReviewListCard
                key={review.id}
                review={review}
                isSelected={selectedId === review.id}
                onClick={() => { setSelectedId(review.id); setMobileView('detail'); }}
              />
            ))}
          </div>

          <div className={`col-span-5 md:col-span-3 ${mobileView === 'list' ? 'hidden md:block' : ''}`}>
            <button
              onClick={() => setMobileView('list')}
              className="md:hidden flex items-center gap-1.5 text-[#6B5E4E] text-sm mb-4"
            >
              ← 返回列表
            </button>
            <div className="bg-white rounded-2xl border border-[#F0EBE4] sticky top-20">
              <div className="p-6 border-b border-[#F5F0EA]">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-xl font-bold text-[#1C1917]">{selected.company}</h2>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${selected.isDemo ? 'bg-[#EDE8E1] text-[#6B5E4E]' : 'bg-[#DCFCE7] text-[#16A34A]'}`}>
                        {selected.isDemo ? '示例' : '我的'}
                      </span>
                      <span className="text-[#9C8B78]">・</span>
                      <span className="text-[#6B5E4E] font-medium">{selected.stage}</span>
                    </div>
                    <div className="text-[#9C8B78] text-sm">{selected.date} ・历时 {selected.duration} 分钟</div>
                  </div>
                  {selected.moodState && (
                    <div className="text-right">
                      <div className="text-[#9C8B78] text-xs mb-1">当时状态</div>
                      <div className="bg-[#FFFBEA] border border-[#FFE36A] text-[#7A5A00] text-sm px-3 py-1 rounded-full font-medium">
                        {selected.moodState}・{selected.moodScore}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-4 bg-[#FFD100] rounded-full" />
                    <span className="text-[#1C1917] font-semibold text-sm">一句话总结</span>
                  </div>
                  <p className="text-[#1C1917] leading-relaxed">{selected.summary}</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-4 bg-[#FFD100] rounded-full" />
                      <span className="text-[#1C1917] font-semibold text-sm">STAR 复盘</span>
                    </div>
                    {selected.completed < 100 && (
                      <span className="text-[#FFD100] text-xs bg-[#FFF7CC] px-2 py-0.5 rounded-full border border-[#FFE36A]">
                        还差 {100 - selected.completed}%
                      </span>
                    )}
                  </div>
                  {selected.isDemo ? (
                    <div className="space-y-3">
                      <StarSection letter="S" label="情境" content={selected.star?.situation || ''} placeholder="当时的背景是什么？" />
                      <StarSection letter="T" label="任务" content={selected.star?.task || ''} placeholder="你需要回答什么？" />
                      <StarSection letter="A" label="行动" content={selected.star?.action || ''} placeholder="你当时怎么答的？" />
                      <StarSection letter="R" label="结果" content={selected.star?.result || ''} placeholder="效果怎么样？" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {[
                        { key: 'situation', letter: 'S', label: '情境', placeholder: '当时的背景是什么？' },
                        { key: 'task', letter: 'T', label: '任务', placeholder: '你需要回答什么？' },
                        { key: 'action', letter: 'A', label: '行动', placeholder: '你当时怎么答的？' },
                        { key: 'result', letter: 'R', label: '结果', placeholder: '效果怎么样？' },
                      ].map((item) => (
                        <label key={item.key} className="block rounded-xl p-4 border bg-[#FAFAF9] border-[#F0EBE4]">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-5 h-5 rounded bg-[#1C1917] flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-[10px] font-bold">{item.letter}</span>
                            </div>
                            <span className="text-[#1C1917] text-sm font-medium">・{item.label}</span>
                          </div>
                          <textarea
                            value={starDraft[item.key as keyof typeof starDraft]}
                            onChange={(event) => setStarDraft((current) => ({ ...current, [item.key]: event.target.value }))}
                            placeholder={item.placeholder}
                            rows={2}
                            className="w-full bg-white border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFD100] resize-none"
                          />
                        </label>
                      ))}
                      <button onClick={handleSaveStar} className="flex items-center gap-1.5 bg-[#1C1917] text-white px-4 py-2 rounded-lg text-sm font-medium">
                        <Save size={14} />
                        保存 STAR
                      </button>
                    </div>
                  )}
                </div>

                {selected.nextStep && (
                  <div className="bg-[#1C1917] rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <Clock size={16} className="text-[#FFD100] mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-[#9C8B78] text-xs mb-1">下一步</div>
                        <p className="text-white text-sm leading-relaxed">{selected.nextStep}</p>
                      </div>
                    </div>
                    <button onClick={onAddToSchedule} className="flex items-center gap-1 text-[#FFD100] text-sm font-medium whitespace-nowrap ml-4 hover:text-[#FFDE33] transition-colors">
                      加到日程 <ArrowRight size={14} />
                    </button>
                  </div>
                )}

                <div className="border-t border-[#F5F0EA] pt-4 flex items-center justify-between">
                  <p className="text-[#9C8B78] text-xs">
                    {selected.isDemo ? '示例数据只能查看，不能编辑或删除。' : '这是你新增的真实数据库记录，可以编辑或删除。'}
                  </p>
                  <button
                    onClick={handleDeleteReview}
                    disabled={selected.isDemo}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#EF4444] text-white text-sm font-medium disabled:bg-[#E8E2D9] disabled:text-[#9C8B78]"
                  >
                    <Trash2 size={14} />
                    删除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showCreateModal && (
        <ReviewCreateModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateReview}
        />
      )}
    </div>
  );
}
