import { useEffect, useMemo, useState } from 'react';
import { FileText, PenLine, Plus, Save, Sparkles, Trash2, UserRound } from 'lucide-react';
import { useJobFlow } from '../../store/useJobFlow';
import { IntroSettings, ResumeVersion, ResumeVersionInput } from '../../types';
import { extractKeywords } from '../../lib/aiSimulation';
import { ResumeEditorModal } from './ResumeEditorModal';

type EditorState =
  | { mode: 'create'; resume?: undefined }
  | { mode: 'edit'; resume: ResumeVersion }
  | null;

const styleLabels: Record<IntroSettings['style'], string> = {
  formal: '正式',
  casual: '自然',
  data_driven: '数据导向',
};

const lengthLabels: Record<IntroSettings['length'], string> = {
  short: '短版',
  medium: '标准',
  long: '详细',
};

const languageLabels: Record<IntroSettings['language'], string> = {
  zh: '中文',
  en: '英文',
};

function buildTailoredResume(resume: ResumeVersion, jd: string) {
  const keywords = extractKeywords(jd);
  const highlightText = resume.highlights.length > 0 ? resume.highlights.join('、') : '项目经历和可量化结果';
  return [
    `定制方向：把「${resume.name}」改成更贴近「${resume.targetRole}」的投递版本。`,
    '',
    `JD 里可以优先回应的关键词：${keywords.join('、')}。`,
    '',
    `摘要建议：${resume.summary || '先用 2-3 句话说明你的目标方向、核心能力和可验证成果。'} 建议补一句和 ${keywords[0]} 直接相关的项目结果。`,
    '',
    `经历强化：当前亮点是 ${highlightText}。每个亮点后面补齐「做了什么、影响了哪个指标、和 JD 哪句话对应」。`,
    '',
    `正文改写提示：${resume.content || '先填入一段项目经历，再根据 JD 提炼。'}`,
    '',
    '投递前检查：删掉和岗位无关的泛泛描述，把动词换成“拆解、验证、推进、复盘、沉淀”。',
  ].join('\n');
}

function buildSelfIntro(settings: IntroSettings, target: string, jd: string) {
  const role = target.trim() || '这个岗位';
  const keywords = extractKeywords(jd || role);
  const detail =
    settings.length === 'short'
      ? '控制在 30 秒，先说方向和一条最强证据。'
      : settings.length === 'long'
        ? '控制在 90 秒，补充项目背景、行动、结果和为什么适合这个岗位。'
        : '控制在 60 秒，按方向、经历、匹配点收束。';

  if (settings.language === 'en') {
    if (settings.style === 'formal') {
      return `Hello, I am focusing on ${role}. My experience centers on structured problem solving, cross-functional collaboration, and clear execution. For this role, I would connect my work to ${keywords.join(', ')}. ${detail}`;
    }
    if (settings.style === 'casual') {
      return `Hi, I am interested in ${role}. I enjoy turning messy user or business problems into practical product plans. The parts I would highlight for this role are ${keywords.join(', ')}. ${detail}`;
    }
    return `Hello, I am targeting ${role}. I usually start from metrics, break down the funnel or user path, and validate decisions with evidence. For this JD, I would emphasize ${keywords.join(', ')} with concrete outcomes. ${detail}`;
  }

  if (settings.style === 'formal') {
    return `您好，我目前主要关注${role}方向。我的经历集中在问题拆解、跨团队推进和项目落地上。针对这个岗位，我会重点突出${keywords.join('、')}相关经验。${detail}`;
  }
  if (settings.style === 'casual') {
    return `你好，我最近主要在看${role}方向的机会。我比较擅长把一个有点散的问题拆成可以推进的方案，再和不同角色一起把结果做出来。这个岗位里，我会重点讲${keywords.join('、')}这些匹配点。${detail}`;
  }
  return `您好，我关注${role}方向。我的表达会从指标和结果切入：先说明目标，再拆解用户路径或业务漏斗，最后用复盘数据证明方案有效。针对这个岗位，我会重点突出${keywords.join('、')}。${detail}`;
}

export function MaterialsPanel() {
  const {
    resumes,
    aiOutputs,
    userSettings,
    createResumeVersion,
    updateResumeVersion,
    deleteResumeVersion,
    updateIntroSettings,
    saveAIOutput,
  } = useJobFlow();
  const [selectedResumeId, setSelectedResumeId] = useState(resumes[0]?.id || '');
  const [editor, setEditor] = useState<EditorState>(null);
  const [tailoredJd, setTailoredJd] = useState('');
  const [tailoredResult, setTailoredResult] = useState('');
  const [tailoredLoading, setTailoredLoading] = useState(false);
  const [introTarget, setIntroTarget] = useState('');
  const [introJd, setIntroJd] = useState('');
  const [introResult, setIntroResult] = useState('');
  const [introLoading, setIntroLoading] = useState(false);

  const selectedResume = resumes.find((resume) => resume.id === selectedResumeId) || resumes[0];
  const materialOutputs = useMemo(
    () => aiOutputs.filter((output) => output.type === 'tailored_resume' || output.type === 'self_intro').slice(0, 5),
    [aiOutputs]
  );

  useEffect(() => {
    if (resumes.length > 0 && !resumes.some((resume) => resume.id === selectedResumeId)) {
      setSelectedResumeId(resumes[0].id);
    }
  }, [resumes, selectedResumeId]);

  const handleSaveResume = (input: ResumeVersionInput) => {
    const saved = editor?.mode === 'edit'
      ? updateResumeVersion(editor.resume.id, input)
      : createResumeVersion(input);
    if (saved) setSelectedResumeId(saved.id);
    setEditor(null);
  };

  const handleDeleteResume = (resumeId: string) => {
    const nextResume = resumes.find((resume) => resume.id !== resumeId);
    const deleted = deleteResumeVersion(resumeId);
    if (deleted && nextResume) setSelectedResumeId(nextResume.id);
  };

  const generateTailoredResume = () => {
    if (!selectedResume) return;
    setTailoredLoading(true);
    window.setTimeout(() => {
      setTailoredResult(buildTailoredResume(selectedResume, tailoredJd));
      setTailoredLoading(false);
    }, 850);
  };

  const generateSelfIntro = () => {
    setIntroLoading(true);
    window.setTimeout(() => {
      setIntroResult(buildSelfIntro(userSettings.introSettings, introTarget, introJd));
      setIntroLoading(false);
    }, 850);
  };

  const updateSettings = <Key extends keyof IntroSettings>(key: Key, value: IntroSettings[Key]) => {
    updateIntroSettings({ ...userSettings.introSettings, [key]: value });
  };

  return (
    <div className="rounded-xl border border-[#F0EBE4] bg-[#FBF8F3] p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText size={16} className="text-[#6B5E4E]" />
            <h3 className="text-[#1C1917] font-bold">材料中心</h3>
          </div>
          <p className="text-[#9C8B78] text-sm">简历、自我介绍和生成结果都先收在这里，投递前再挑一版用。</p>
        </div>
        <button
          onClick={() => setEditor({ mode: 'create' })}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1C1917] text-white text-sm font-medium"
        >
          <Plus size={14} />
          新增简历
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="space-y-3">
          <div className="rounded-xl border border-[#F0EBE4] bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[#1C1917] font-bold text-sm">简历版本</h4>
              <span className="text-[#9C8B78] text-xs">{resumes.length} 版</span>
            </div>
            <div className="space-y-2">
              {resumes.map((resume) => (
                <button
                  key={resume.id}
                  onClick={() => setSelectedResumeId(resume.id)}
                  className={`w-full text-left rounded-xl border p-3 transition-colors ${
                    selectedResume?.id === resume.id
                      ? 'border-[#FFE36A] bg-[#FFFBEA]'
                      : 'border-[#F0EBE4] bg-[#FBF8F3] hover:border-[#E8E2D9]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[#1C1917] text-sm font-semibold">{resume.name}</div>
                      <div className="text-[#6B5E4E] text-xs mt-0.5">{resume.targetRole}</div>
                    </div>
                    <span className="text-[10px] text-[#9C8B78] flex-shrink-0">
                      {new Date(resume.updatedAt).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                  <p className="text-[#9C8B78] text-xs leading-relaxed mt-2">{resume.summary}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {resume.highlights.slice(0, 3).map((highlight) => (
                      <span key={highlight} className="rounded-full bg-white border border-[#E8E2D9] px-2 py-0.5 text-[10px] text-[#6B5E4E]">
                        {highlight}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
            {selectedResume && (
              <div className="grid grid-cols-2 gap-2 mt-3">
                <button
                  onClick={() => setEditor({ mode: 'edit', resume: selectedResume })}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#E8E2D9] px-3 py-2 text-xs font-medium text-[#6B5E4E] hover:border-[#C5BDB5]"
                >
                  <PenLine size={13} />
                  编辑
                </button>
                <button
                  onClick={() => handleDeleteResume(selectedResume.id)}
                  disabled={resumes.length <= 1}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#E8E2D9] px-3 py-2 text-xs font-medium text-[#6B5E4E] hover:border-[#C5BDB5] disabled:opacity-40"
                >
                  <Trash2 size={13} />
                  删除
                </button>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-[#F0EBE4] bg-white p-4">
            <div className="flex items-center gap-2 mb-1">
              <UserRound size={15} className="text-[#6B5E4E]" />
              <h4 className="text-[#1C1917] font-bold text-sm">自我介绍模板</h4>
            </div>
            <p className="text-[#9C8B78] text-xs leading-relaxed mb-3">设置会直接影响生成出来的语气和长度。</p>
            <div className="grid grid-cols-3 gap-2">
              <select
                value={userSettings.introSettings.style}
                onChange={(event) => updateSettings('style', event.target.value as IntroSettings['style'])}
                className="border border-[#E8E2D9] rounded-lg px-2 py-2 text-xs outline-none focus:border-[#FFD100] bg-white"
              >
                {Object.entries(styleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
              <select
                value={userSettings.introSettings.length}
                onChange={(event) => updateSettings('length', event.target.value as IntroSettings['length'])}
                className="border border-[#E8E2D9] rounded-lg px-2 py-2 text-xs outline-none focus:border-[#FFD100] bg-white"
              >
                {Object.entries(lengthLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
              <select
                value={userSettings.introSettings.language}
                onChange={(event) => updateSettings('language', event.target.value as IntroSettings['language'])}
                className="border border-[#E8E2D9] rounded-lg px-2 py-2 text-xs outline-none focus:border-[#FFD100] bg-white"
              >
                {Object.entries(languageLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="xl:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl border border-[#F0EBE4] bg-white p-4 flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={15} className="text-[#6B5E4E]" />
              <h4 className="text-[#1C1917] font-bold text-sm">定制简历建议</h4>
            </div>
            <p className="text-[#9C8B78] text-xs leading-relaxed mb-3">粘贴 JD，基于当前选中的简历生成改写方向。</p>
            <textarea
              value={tailoredJd}
              onChange={(event) => setTailoredJd(event.target.value)}
              rows={5}
              placeholder="粘贴 JD 或岗位要求"
              className="w-full border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFD100] resize-none"
            />
            <button
              onClick={generateTailoredResume}
              disabled={!selectedResume || tailoredLoading}
              className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#1C1917] px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              <Sparkles size={14} />
              {tailoredLoading ? '生成中...' : '生成定制建议'}
            </button>
            {tailoredResult && (
              <div className="mt-3 flex-1 rounded-xl bg-[#FBF8F3] border border-[#F0EBE4] p-3">
                <pre className="whitespace-pre-wrap text-[#6B5E4E] text-xs leading-relaxed font-sans">{tailoredResult}</pre>
                <button
                  onClick={() => saveAIOutput({ type: 'tailored_resume', title: `${selectedResume?.name || '简历'}定制建议`, sourceId: selectedResume?.id, content: tailoredResult })}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-[#E8E2D9] px-3 py-1.5 text-xs font-medium text-[#6B5E4E] hover:border-[#C5BDB5]"
                >
                  <Save size={13} />
                  保存结果
                </button>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-[#F0EBE4] bg-white p-4 flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <UserRound size={15} className="text-[#6B5E4E]" />
              <h4 className="text-[#1C1917] font-bold text-sm">生成自我介绍</h4>
            </div>
            <p className="text-[#9C8B78] text-xs leading-relaxed mb-3">岗位和 JD 越具体，开场白越贴近面试场景。</p>
            <input
              value={introTarget}
              onChange={(event) => setIntroTarget(event.target.value)}
              placeholder="目标岗位，例如 AI 产品经理"
              className="w-full border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFD100] mb-2"
            />
            <textarea
              value={introJd}
              onChange={(event) => setIntroJd(event.target.value)}
              rows={4}
              placeholder="可选：粘贴 JD"
              className="w-full border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFD100] resize-none"
            />
            <button
              onClick={generateSelfIntro}
              disabled={introLoading}
              className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#1C1917] px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              <Sparkles size={14} />
              {introLoading ? '生成中...' : '生成自我介绍'}
            </button>
            {introResult && (
              <div className="mt-3 flex-1 rounded-xl bg-[#FBF8F3] border border-[#F0EBE4] p-3">
                <p className="text-[#6B5E4E] text-xs leading-relaxed whitespace-pre-wrap">{introResult}</p>
                <button
                  onClick={() => saveAIOutput({ type: 'self_intro', title: `${introTarget || '岗位'}自我介绍`, content: introResult })}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-[#E8E2D9] px-3 py-1.5 text-xs font-medium text-[#6B5E4E] hover:border-[#C5BDB5]"
                >
                  <Save size={13} />
                  保存结果
                </button>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 rounded-xl border border-[#F0EBE4] bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[#1C1917] font-bold text-sm">已保存生成结果</h4>
              <span className="text-[#9C8B78] text-xs">{materialOutputs.length} 条</span>
            </div>
            {materialOutputs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {materialOutputs.map((output) => (
                  <div key={output.id} className="rounded-xl bg-[#FBF8F3] border border-[#F0EBE4] p-3">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[#1C1917] text-sm font-semibold">{output.title}</span>
                      <span className="text-[10px] rounded-full bg-white border border-[#E8E2D9] px-2 py-0.5 text-[#6B5E4E]">
                        {output.type === 'tailored_resume' ? '定制简历' : '自我介绍'}
                      </span>
                    </div>
                    <p className="text-[#9C8B78] text-xs leading-relaxed line-clamp-3">{output.content}</p>
                    <div className="text-[#C5BDB5] text-[10px] mt-2">
                      {new Date(output.createdAt).toLocaleString('zh-CN')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl bg-[#FBF8F3] border border-dashed border-[#E8E2D9] p-4 text-center text-[#9C8B78] text-xs">
                生成并保存后，这里会留下可复用的材料。
              </div>
            )}
          </div>
        </div>
      </div>

      {editor && (
        <ResumeEditorModal
          resume={editor.mode === 'edit' ? editor.resume : undefined}
          onClose={() => setEditor(null)}
          onSave={handleSaveResume}
        />
      )}
    </div>
  );
}
