import { useEffect, useState } from 'react';
import { Clock, Filter, ArrowRight, Plus, Trash2, Save } from 'lucide-react';
import { useJobFlow } from '../store/useJobFlow';
import { ReviewEntry, ReviewInput } from '../types';
import { ReviewListCard } from '../components/review/ReviewListCard';
import { StarSection } from '../components/review/StarSection';
import { ReviewCreateModal } from '../components/review/ReviewCreateModal';
import { PendingReviewQueue } from '../components/review/PendingReviewQueue';
import { ReviewMaterialWorkbench } from '../components/review/ReviewMaterialWorkbench';

type FilterType = '全部' | '趁热待写' | '挂了的' | '高分场';
type QuestionDraft = {
  id: string;
  question: string;
  situation: string;
  task: string;
  action: string;
  result: string;
};

const filters: FilterType[] = ['全部', '趁热待写', '挂了的', '高分场'];

function getInitialQuestionDraft(review: ReviewEntry): QuestionDraft[] {
  const star = review.star;
  if (!star || (!star.situation && !star.task && !star.action && !star.result)) return [];
  return [
    {
      id: `${review.id}-question-1`,
      question: review.stage ? `${review.stage}的关键问题` : '这场面试的关键问题',
      situation: star.situation || '',
      task: star.task || '',
      action: star.action || '',
      result: star.result || '',
    },
  ];
}

function buildQuestionDraftsFromNote(note: string, review: ReviewEntry): QuestionDraft[] {
  const lines = note.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const questionLines = lines.filter((line) => /[?？]$/.test(line) || line.includes('问') || line.includes('Q'));
  const sourceLines = questionLines.length > 0 ? questionLines : lines.slice(0, 3);
  if (sourceLines.length === 0) return [];
  return sourceLines.map((line, index) => ({
    id: `${review.id}-question-${Date.now()}-${index}`,
    question: line.replace(/^[-*•\d.、\s]+/, ''),
    situation: `${review.company} · ${review.stage || '面试'}，围绕这道题展开追问。`,
    task: '把问题背后的考察点说清楚，并给出自己的判断或项目证据。',
    action: lines.slice(index, index + 3).join('\n'),
    result: '',
  }));
}

function deriveTagsFromSummary(summary: string, existingTags: string[]) {
  const candidates = [
    { keyword: 'case', tag: 'Case' },
    { keyword: '业务', tag: '业务面' },
    { keyword: '数据', tag: '数据' },
    { keyword: '项目', tag: '项目深挖' },
    { keyword: '压力', tag: '压力追问' },
    { keyword: 'HR', tag: 'HR' },
    { keyword: '负责人', tag: '负责人面' },
    { keyword: '复盘', tag: '待复盘' },
  ];
  const nextTags = [...existingTags];
  candidates.forEach(({ keyword, tag }) => {
    if (summary.toLowerCase().includes(keyword.toLowerCase()) && !nextTags.includes(tag)) {
      nextTags.push(tag);
    }
  });
  return nextTags.slice(0, 5);
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
    communicationScore: review.communicationScore,
    structureScore: review.structureScore,
    businessScore: review.businessScore,
    dataScore: review.dataScore,
    resilienceScore: review.resilienceScore,
    scores: review.scores,
    applicationId: review.applicationId,
    interviewRound: review.interviewRound,
    status: review.status,
    entryType: review.entryType,
  };
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
  const [questionDraftsById, setQuestionDraftsById] = useState<Record<string, QuestionDraft[]>>({});
  const [summaryDraftById, setSummaryDraftById] = useState<Record<string, string>>({});
  const [noteDraftById, setNoteDraftById] = useState<Record<string, string>>({});
  const [audioFileById, setAudioFileById] = useState<Record<string, string>>({});
  const [parsingReviewId, setParsingReviewId] = useState<string | null>(null);
  const { reviews, createReview, updateReview, deleteReview } = useJobFlow();

  const displayReviews = reviews.map((review) => {
    const summaryDraft = summaryDraftById[review.id];
    if (typeof summaryDraft !== 'string') return review;
    return { ...review, summary: summaryDraft, tags: deriveTagsFromSummary(summaryDraft, review.tags) };
  });

  useEffect(() => {
    if (createRequest > 0) setShowCreateModal(true);
  }, [createRequest]);

  const filteredReviews = displayReviews.filter((r) => {
    if (activeFilter === '全部') return true;
    if (activeFilter === '趁热待写') return r.isHot;
    if (activeFilter === '挂了的') return r.result === 'fail';
    if (activeFilter === '高分场') return r.score === '状态很好';
    return true;
  });

  const selected = displayReviews.find((r) => r.id === selectedId) || displayReviews[0];
  const selectedNoteDraft = noteDraftById[selected?.id] || '';
  const selectedSummaryDraft = summaryDraftById[selected?.id] ?? selected?.summary ?? '';
  const selectedQuestionDrafts = questionDraftsById[selected?.id] || getInitialQuestionDraft(selected);

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
    const firstQuestion = selectedQuestionDrafts[0];
    await updateReview(selected, {
      ...reviewToInput(selected),
      star: firstQuestion
        ? { situation: firstQuestion.situation, task: firstQuestion.task, action: firstQuestion.action, result: firstQuestion.result }
        : starDraft,
      completed: 100,
      status: 'completed',
      entryType: firstQuestion ? selected.entryType || 'note' : selected.entryType || 'manual',
    });
  };

  const handleSaveSummary = async () => {
    if (!selected || selected.isDemo) return;
    await updateReview(selected, {
      ...reviewToInput(selected),
      summary: selectedSummaryDraft,
      tags: deriveTagsFromSummary(selectedSummaryDraft, selected.tags),
    });
  };

  const handleDeleteReview = async () => {
    if (!selected) return;
    const deleted = await deleteReview(selected);
    if (deleted) { setSelectedId('1'); setMobileView('list'); }
  };

  const handleAudioChange = (fileName: string) => {
    if (!selected) return;
    setAudioFileById((current) => ({ ...current, [selected.id]: fileName }));
    setParsingReviewId(selected.id);
    window.setTimeout(() => {
      setParsingReviewId((current) => (current === selected.id ? null : current));
      const generatedSummary = `${selected.company}${selected.stage || '面试'}录音已解析：主要围绕自我介绍、项目经历和岗位匹配展开，建议补充关键追问和面试官反馈。`;
      const drafts = [
        {
          id: `${selected.id}-audio-question-1`,
          question: '请介绍一个最能证明岗位匹配的项目',
          situation: `${selected.company} ${selected.stage || '面试'}中，面试官围绕项目背景和岗位匹配追问。`,
          task: '说明项目目标、你的职责，以及为什么这段经历能匹配岗位要求。',
          action: '按问题拆解、方案推进、跨团队协作和结果复盘的顺序回答。',
          result: '需要补充具体指标和面试官反馈。',
        },
        {
          id: `${selected.id}-audio-question-2`,
          question: '为什么选择这个岗位和公司',
          situation: '面试官希望判断动机、稳定性和业务理解。',
          task: '把个人经历、岗位要求和公司业务连接起来。',
          action: '先讲方向，再讲证据，最后讲入职后能贡献什么。',
          result: '下次回答可以更具体到业务场景。',
        },
      ];
      setSummaryDraftById((current) => ({ ...current, [selected.id]: generatedSummary }));
      setQuestionDraftsById((current) => ({ ...current, [selected.id]: drafts }));
      void updateReview(selected, {
        ...reviewToInput(selected),
        summary: generatedSummary,
        tags: deriveTagsFromSummary(generatedSummary, selected.tags),
        entryType: 'audio',
        status: 'pending',
      });
    }, 900);
  };

  const handleStructureNote = () => {
    if (!selected || !selectedNoteDraft.trim()) return;
    const drafts = buildQuestionDraftsFromNote(selectedNoteDraft, selected);
    setQuestionDraftsById((current) => ({ ...current, [selected.id]: drafts }));
    const generatedSummary = drafts.length > 0
      ? `${selected.stage || '这场面试'}主要围绕 ${drafts.slice(0, 3).map((d) => d.question).join('、')} 展开，需要重点补项目证据和面试官反馈。`
      : '';
    if (generatedSummary) {
      setSummaryDraftById((current) => ({ ...current, [selected.id]: generatedSummary }));
    }
    if (drafts[0]) {
      setStarDraft({ situation: drafts[0].situation, task: drafts[0].task, action: drafts[0].action, result: drafts[0].result });
    }
  };

  const updateQuestionDraft = (questionId: string, key: keyof Omit<QuestionDraft, 'id'>, value: string) => {
    if (!selected) return;
    const currentDrafts = questionDraftsById[selected.id] || getInitialQuestionDraft(selected);
    const nextDrafts = currentDrafts.map((draft) =>
      draft.id === questionId ? { ...draft, [key]: value } : draft
    );
    setQuestionDraftsById((current) => ({ ...current, [selected.id]: nextDrafts }));
  };

  const addQuestionDraft = () => {
    if (!selected) return;
    const currentDrafts = questionDraftsById[selected.id] || getInitialQuestionDraft(selected);
    const nextDrafts = [
      ...currentDrafts,
      { id: `${selected.id}-question-manual-${Date.now()}`, question: '', situation: '', task: '', action: '', result: '' },
    ];
    setQuestionDraftsById((current) => ({ ...current, [selected.id]: nextDrafts }));
    window.setTimeout(() => {
      document.getElementById('star-review-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  return (
    <div className="pt-16 min-h-screen bg-[#FBF8F3]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div className="mb-5 rounded-2xl border border-[#FFE36A] bg-[#FFFBEA] px-4 py-3 text-sm text-[#6B5E4E]">
          为了便于展示，这里预置了示例复盘。新增内容会进入前端统一状态，示例数据不会被删除。
        </div>
        <div className="text-[#9C8B78] text-sm mb-1">每一场面试，都别白走</div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-2xl md:text-4xl font-bold text-[#1C1917]">
            复盘库 <span className="text-[#9C8B78] font-normal text-2xl">{displayReviews.length}</span>
          </h1>
          <div className="flex items-center gap-1.5 flex-wrap">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeFilter === f ? 'bg-[#1C1917] text-white' : 'text-[#6B5E4E] hover:text-[#1C1917] hover:bg-[#EDE8E1]'
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

        <PendingReviewQueue
          reviews={displayReviews}
          selectedId={selectedId}
          onSelect={(id) => { setSelectedId(id); setMobileView('detail'); }}
        />

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
                <ReviewMaterialWorkbench
                  review={selected}
                  noteDraft={selectedNoteDraft}
                  audioFileName={audioFileById[selected.id]}
                  parsingAudio={parsingReviewId === selected.id}
                  onNoteChange={(value) => setNoteDraftById((current) => ({ ...current, [selected.id]: value }))}
                  onAudioChange={handleAudioChange}
                  onStructureNote={handleStructureNote}
                  onManualFocus={addQuestionDraft}
                />

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-4 bg-[#FFD100] rounded-full" />
                    <span className="text-[#1C1917] font-semibold text-sm">整理摘要</span>
                  </div>
                  <textarea
                    value={selectedSummaryDraft}
                    onChange={(event) => setSummaryDraftById((current) => ({ ...current, [selected.id]: event.target.value }))}
                    rows={3}
                    placeholder="还没有摘要。先上传录音或粘贴面试笔记，再整理成问题级复盘。"
                    className="w-full resize-none rounded-xl border border-[#E8E2D9] bg-white px-3 py-2 text-sm leading-relaxed text-[#1C1917] outline-none focus:border-[#FFD100]"
                  />
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <p className="text-[#9C8B78] text-xs">摘要会同步影响左侧卡片文案和标签。</p>
                    {!selected.isDemo ? (
                      <button
                        onClick={handleSaveSummary}
                        className="rounded-lg border border-[#E8E2D9] bg-white px-3 py-1.5 text-xs font-medium text-[#6B5E4E] hover:border-[#C5BDB5] hover:text-[#1C1917]"
                      >
                        保存摘要
                      </button>
                    ) : (
                      <span className="text-[#C5BDB5] text-xs">示例仅本页预览</span>
                    )}
                  </div>
                  {selectedSummaryDraft && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {deriveTagsFromSummary(selectedSummaryDraft, selected.tags).map((tag) => (
                        <span key={tag} className="text-[11px] px-2.5 py-0.5 rounded-full border font-medium bg-[#F5F0EA] text-[#6B5E4E] border-[#EDE8E1]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div id="star-review-section">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-4 bg-[#FFD100] rounded-full" />
                      <span className="text-[#1C1917] font-semibold text-sm">按问题复盘</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {selected.completed < 100 && (
                        <span className="text-[#FFD100] text-xs bg-[#FFF7CC] px-2 py-0.5 rounded-full border border-[#FFE36A]">
                          还差 {100 - selected.completed}%
                        </span>
                      )}
                      {!selected.isDemo && (
                        <button onClick={addQuestionDraft} className="text-[#6B5E4E] text-xs font-medium hover:text-[#1C1917]">
                          + 加一道题
                        </button>
                      )}
                    </div>
                  </div>

                  {selected.isDemo ? (
                    <div className="space-y-4">
                      {selectedQuestionDrafts.length === 0 ? (
                        <p className="text-[#9C8B78] text-sm rounded-xl border border-dashed border-[#E8E2D9] bg-[#FBF8F3] p-4">
                          这条示例还没有拆分问题。
                        </p>
                      ) : (
                        selectedQuestionDrafts.map((draft, index) => (
                          <div key={draft.id} className="rounded-xl border border-[#F0EBE4] bg-white p-4">
                            <div className="text-[#1C1917] text-sm font-semibold mb-3">问题 {index + 1}：{draft.question}</div>
                            <div className="space-y-3">
                              <StarSection letter="S" label="情境" content={draft.situation} placeholder="当时的背景是什么？" />
                              <StarSection letter="T" label="任务" content={draft.task} placeholder="你需要回答什么？" />
                              <StarSection letter="A" label="行动" content={draft.action} placeholder="你当时怎么答的？" />
                              <StarSection letter="R" label="结果" content={draft.result} placeholder="效果怎么样？" />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedQuestionDrafts.length === 0 ? (
                        <p className="text-[#9C8B78] text-sm rounded-xl border border-dashed border-[#E8E2D9] bg-[#FBF8F3] p-4">
                          先粘贴面试笔记并点击"整理成 STAR 草稿"，或手动新增一道题。
                        </p>
                      ) : (
                        selectedQuestionDrafts.map((draft, index) => (
                          <div key={draft.id} className="rounded-xl border border-[#F0EBE4] bg-white p-4">
                            <label className="block mb-3">
                              <span className="text-[#6B5E4E] text-xs font-medium">问题 {index + 1}</span>
                              <input
                                value={draft.question}
                                onChange={(event) => updateQuestionDraft(draft.id, 'question', event.target.value)}
                                placeholder="例如：你怎么判断这个策略有效？"
                                className="mt-1 w-full bg-white border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFD100]"
                              />
                            </label>
                            <div className="space-y-3">
                              {[
                                { key: 'situation', letter: 'S', label: '情境', placeholder: '这道题出现的背景是什么？' },
                                { key: 'task', letter: 'T', label: '任务', placeholder: '这道题在考察什么？你需要回答什么？' },
                                { key: 'action', letter: 'A', label: '行动', placeholder: '你当时怎么答的？用了什么例子？' },
                                { key: 'result', letter: 'R', label: '结果', placeholder: '面试官反馈如何？你下次怎么改？' },
                              ].map((item) => (
                                <label key={item.key} className="block rounded-xl p-4 border bg-[#FAFAF9] border-[#F0EBE4]">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="w-5 h-5 rounded bg-[#1C1917] flex items-center justify-center flex-shrink-0">
                                      <span className="text-white text-[10px] font-bold">{item.letter}</span>
                                    </div>
                                    <span className="text-[#1C1917] text-sm font-medium">・{item.label}</span>
                                  </div>
                                  <textarea
                                    value={draft[item.key as keyof Omit<QuestionDraft, 'id'>]}
                                    onChange={(event) => updateQuestionDraft(draft.id, item.key as keyof Omit<QuestionDraft, 'id'>, event.target.value)}
                                    placeholder={item.placeholder}
                                    rows={2}
                                    className="w-full bg-white border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFD100] resize-none"
                                  />
                                </label>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                      <button onClick={handleSaveStar} className="flex items-center gap-1.5 bg-[#1C1917] text-white px-4 py-2 rounded-lg text-sm font-medium">
                        <Save size={14} />
                        保存复盘
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
                    {selected.isDemo ? '示例数据只能查看，不能编辑或删除。' : '这是你新增的前端记录，可以编辑或删除。'}
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
