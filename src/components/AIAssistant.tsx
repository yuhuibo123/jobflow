import { useMemo, useState } from 'react';
import {
  ArrowRight,
  Briefcase,
  ClipboardList,
  FileText,
  ListChecks,
  MessageCircle,
  MessageSquareText,
  PencilLine,
  Sparkles,
  X,
} from 'lucide-react';
import { useJobFlow } from '../store/useJobFlow';
import {
  simulateJdParsing,
  simulatePrepPack,
  simulateSelfIntro,
  simulateStructuredReview,
  simulateTailoredResume,
  simulateWeeklySummary,
} from '../lib/aiSimulation';

type AssistantAction =
  | 'parse_jd'
  | 'tailored_resume'
  | 'self_intro'
  | 'interview_prep'
  | 'structured_review'
  | 'weekly_summary'
  | 'next_step_advice';

const assistantActions: Array<{
  id: AssistantAction;
  title: string;
  description: string;
  icon: typeof FileText;
  placeholder: string;
}> = [
  {
    id: 'parse_jd',
    title: '解析 JD',
    description: '粘贴岗位描述，解析后保存到岗位库。',
    icon: FileText,
    placeholder: '粘贴 JD。可以写：公司：字节跳动\\n岗位：AI 产品经理\\n负责 AI 应用需求、数据分析...',
  },
  {
    id: 'tailored_resume',
    title: '生成定制简历',
    description: '基于当前第一份简历和 JD 生成新简历版本。',
    icon: Briefcase,
    placeholder: '粘贴目标岗位 JD，AI 会生成一版新的材料中心简历。',
  },
  {
    id: 'self_intro',
    title: '生成自我介绍',
    description: '按材料中心设置生成，并保存为 AI 输出。',
    icon: MessageSquareText,
    placeholder: '写目标岗位或粘贴 JD，例如：增长产品经理，负责转化漏斗和用户增长。',
  },
  {
    id: 'interview_prep',
    title: '生成面试准备包',
    description: '生成公司摘要、常见问题和 checklist。',
    icon: ListChecks,
    placeholder: '输入公司、岗位或 JD，例如：美团 到店产品经理 二面...',
  },
  {
    id: 'structured_review',
    title: '结构化复盘',
    description: '把散乱笔记整理成复盘记录。',
    icon: PencilLine,
    placeholder: '粘贴面试笔记、追问、自己的回答和面试官反馈。',
  },
  {
    id: 'weekly_summary',
    title: '总结本周求职状态',
    description: '根据当前看板生成周总结。',
    icon: ClipboardList,
    placeholder: '可留空，AI 会直接读取当前看板数据。',
  },
  {
    id: 'next_step_advice',
    title: '给出下一步建议',
    description: '生成建议并显示在 Dashboard。',
    icon: Sparkles,
    placeholder: '写下你现在纠结的点，也可以留空直接根据看板生成。',
  },
];

export default function AIAssistant({
  open,
  onOpen,
  onClose,
}: {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const {
    applications,
    resumes,
    userSettings,
    saveJobLead,
    createResumeVersion,
    createReview,
    saveAIOutput,
  } = useJobFlow();
  const [selectedId, setSelectedId] = useState<AssistantAction>('parse_jd');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [appliedMessage, setAppliedMessage] = useState('');

  const selectedAction = useMemo(
    () => assistantActions.find((action) => action.id === selectedId) || assistantActions[0],
    [selectedId]
  );

  const resetForAction = (actionId: AssistantAction) => {
    setSelectedId(actionId);
    setOutput('');
    setAppliedMessage('');
  };

  const runAction = () => {
    setLoading(true);
    setOutput('');
    setAppliedMessage('');

    window.setTimeout(() => {
      if (selectedId === 'parse_jd') {
        const parsed = simulateJdParsing(input);
        setOutput([
          `公司：${parsed.company}`,
          `岗位：${parsed.title}`,
          `方向：${parsed.department}`,
          `匹配度：${parsed.matchScore}`,
          `关键词：${parsed.tags.join('、')}`,
          '',
          parsed.reason,
        ].join('\n'));
      }

      if (selectedId === 'tailored_resume') {
        const resume = simulateTailoredResume(resumes[0], input);
        setOutput([
          `简历名称：${resume.name}`,
          `目标岗位：${resume.targetRole}`,
          '',
          resume.summary,
          '',
          `亮点：${resume.highlights.join('、')}`,
          '',
          resume.content,
        ].join('\n'));
      }

      if (selectedId === 'self_intro') {
        setOutput(simulateSelfIntro(userSettings.introSettings, input.split('\n')[0] || '目标岗位', input));
      }

      if (selectedId === 'interview_prep') {
        setOutput(simulatePrepPack(input.split(/\s+/)[0] || '目标公司', input.split(/\s+/)[1] || '目标岗位', input));
      }

      if (selectedId === 'structured_review') {
        const review = simulateStructuredReview(input);
        setOutput([
          review.summary,
          '',
          `S：${review.star?.situation}`,
          `T：${review.star?.task}`,
          `A：${review.star?.action}`,
          `R：${review.star?.result}`,
        ].join('\n'));
      }

      if (selectedId === 'weekly_summary' || selectedId === 'next_step_advice') {
        setOutput(simulateWeeklySummary(applications));
      }

      setLoading(false);
    }, 850);
  };

  const applyOutput = async () => {
    if (!output) return;

    if (selectedId === 'parse_jd') {
      const parsed = simulateJdParsing(input);
      saveJobLead({
        company: parsed.company,
        title: parsed.title,
        department: parsed.department,
        jd: parsed.jd,
        sourceType: 'jd_paste',
        tags: parsed.tags,
        status: 'collected',
        matchScore: parsed.matchScore,
        reason: parsed.reason,
        keywordSource: parsed.tags.slice(1),
        note: '由 AI 助手解析保存',
      });
      saveAIOutput({ type: 'job_parse', title: `${parsed.company} JD 解析`, content: output });
      setAppliedMessage('已保存到岗位库的待处理机会。');
      return;
    }

    if (selectedId === 'tailored_resume') {
      const resume = createResumeVersion(simulateTailoredResume(resumes[0], input));
      saveAIOutput({ type: 'tailored_resume', title: `${resume.name}生成记录`, sourceId: resume.id, content: output });
      setAppliedMessage('已保存为材料中心的新简历版本。');
      return;
    }

    if (selectedId === 'self_intro') {
      saveAIOutput({ type: 'self_intro', title: 'AI 自我介绍', content: output });
      setAppliedMessage('已保存到材料中心的 AI 输出记录。');
      return;
    }

    if (selectedId === 'interview_prep') {
      saveAIOutput({ type: 'interview_prep', title: 'AI 面试准备包', content: output });
      setAppliedMessage('已保存为 AI 面试准备包输出。');
      return;
    }

    if (selectedId === 'structured_review') {
      const review = await createReview(simulateStructuredReview(input));
      saveAIOutput({ type: 'structured_review', title: `${review.company}复盘结构化`, sourceId: review.id, content: output });
      setAppliedMessage('已写入复盘库，状态为待完善。');
      return;
    }

    if (selectedId === 'weekly_summary') {
      saveAIOutput({ type: 'weekly_summary', title: '本周求职状态总结', content: output });
      setAppliedMessage('已保存为 AI 输出记录。');
      return;
    }

    saveAIOutput({ type: 'next_step_advice', title: '下一步建议', content: output });
    setAppliedMessage('已同步到 Dashboard 顶部建议。');
  };

  return (
    <>
      <button
        onClick={onOpen}
        className="fixed bottom-24 left-4 md:bottom-8 md:left-8 z-40 flex items-center gap-2 rounded-lg border border-[#E8E2D9] bg-white px-3 py-2 text-sm font-medium text-[#1C1917] shadow-lg hover:border-[#C5BDB5]"
      >
        <MessageCircle size={16} className="text-[#6B5E4E]" />
        AI 助手
      </button>

      {open && (
        <div className="fixed inset-0 z-[80] bg-black/25 flex justify-end">
          <div className="h-full w-full max-w-xl bg-[#FBF8F3] border-l border-[#E8E2D9] shadow-2xl flex flex-col">
            <div className="px-5 py-4 border-b border-[#E8E2D9] flex items-start justify-between">
              <div>
                <div className="text-[#9C8B78] text-xs mb-1">统一 AI 辅助入口</div>
                <h2 className="text-xl font-bold text-[#1C1917]">选一个动作，生成后可写回模块</h2>
              </div>
              <button onClick={onClose} className="text-[#9C8B78] hover:text-[#1C1917]">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {assistantActions.map(({ id, title, description, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => resetForAction(id)}
                    className={`text-left rounded-lg border p-3 transition-colors ${
                      selectedId === id
                        ? 'bg-[#FFFBEA] border-[#FFE36A]'
                        : 'bg-white border-[#F0EBE4] hover:border-[#E8DDD0]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#F5F0EA] flex items-center justify-center flex-shrink-0">
                        <Icon size={16} className="text-[#6B5E4E]" />
                      </div>
                      <div>
                        <div className="text-[#1C1917] text-sm font-medium">{title}</div>
                        <p className="text-[#9C8B78] text-xs leading-relaxed mt-1">{description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="bg-white rounded-xl border border-[#F0EBE4] p-4">
                <div className="text-[#1C1917] text-sm font-semibold mb-2">{selectedAction.title}</div>
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  rows={6}
                  placeholder={selectedAction.placeholder}
                  className="w-full resize-none rounded-lg border border-[#E8E2D9] px-3 py-2 text-sm outline-none focus:border-[#FFD100]"
                />
                <button
                  onClick={runAction}
                  disabled={loading || (!input.trim() && selectedId !== 'weekly_summary' && selectedId !== 'next_step_advice')}
                  className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#1C1917] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  {loading ? '生成中...' : '生成结果'} <ArrowRight size={14} />
                </button>
              </div>

              {(loading || output) && (
                <div className="bg-white rounded-xl border border-[#F0EBE4] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-[#1C1917] text-sm font-semibold">AI 输出</div>
                    {output && (
                      <button onClick={applyOutput} className="rounded-lg bg-[#FFD100] px-3 py-1.5 text-xs font-bold text-[#1C1917]">
                        应用到模块
                      </button>
                    )}
                  </div>
                  {loading ? (
                    <div className="rounded-lg bg-[#FBF8F3] border border-[#F0EBE4] p-4 text-[#9C8B78] text-sm">
                      正在模拟分析...
                    </div>
                  ) : (
                    <pre className="whitespace-pre-wrap rounded-lg bg-[#FBF8F3] border border-[#F0EBE4] p-4 text-[#6B5E4E] text-sm leading-relaxed font-sans">
                      {output}
                    </pre>
                  )}
                  {appliedMessage && (
                    <div className="mt-3 rounded-lg border border-[#D8F3DC] bg-[#F0FFF4] px-3 py-2 text-xs font-medium text-[#257A3E]">
                      {appliedMessage}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
