import { Application, IntroSettings, ReviewInput, ResumeVersion, ResumeVersionInput } from '../types';

export function extractKeywords(text: string) {
  const builtIn = ['产品', '增长', '数据', 'AI', '用户', '策略', '运营', '供应链', '商业化', '项目', '协作', '复盘'];
  const found = builtIn.filter((keyword) => text.toLowerCase().includes(keyword.toLowerCase()));
  return found.length > 0 ? found.slice(0, 5) : ['岗位目标', '核心能力', '项目证据'];
}

export function simulateJdParsing(input: string) {
  const firstLine = input.split('\n').find((line) => line.trim()) || 'AI 产品经理';
  const keywords = extractKeywords(input);
  const companyMatch = input.match(/公司[:：]\s*([^\n]+)/);
  const titleMatch = input.match(/岗位[:：]\s*([^\n]+)/);

  return {
    company: companyMatch?.[1]?.trim() || '新收纳公司',
    title: titleMatch?.[1]?.trim() || firstLine.slice(0, 18),
    department: keywords.includes('AI') ? 'AI 产品' : keywords.includes('增长') ? '增长业务' : '待确认方向',
    tags: ['AI 解析', ...keywords.slice(0, 3)],
    matchScore: Math.min(95, 72 + keywords.length * 4),
    reason: `JD 重点落在 ${keywords.join('、')}，建议先收进待处理机会，再决定是否放入想投。`,
    jd: input,
  };
}

export function simulateTailoredResume(resume: ResumeVersion | undefined, jd: string): ResumeVersionInput {
  const keywords = extractKeywords(jd);
  const targetRole = keywords.includes('AI') ? 'AI 产品经理' : keywords.includes('增长') ? '增长产品经理' : resume?.targetRole || '目标岗位';
  const baseName = resume?.name || 'AI 定制简历';

  return {
    name: `${baseName} · ${keywords[0]}版`,
    targetRole,
    summary: `面向${targetRole}，重点突出${keywords.slice(0, 3).join('、')}和可量化项目结果。`,
    highlights: keywords.slice(0, 4),
    content: [
      resume?.content || '项目经历：围绕用户问题拆解需求，推动方案落地并复盘效果。',
      '',
      `AI 改写建议：把经历改成「场景 - 任务 - 行动 - 指标」结构，并逐条回应 JD 中的 ${keywords.join('、')}。`,
    ].join('\n'),
  };
}

export function simulateSelfIntro(settings: IntroSettings, target: string, jd: string) {
  const role = target.trim() || '这个岗位';
  const keywords = extractKeywords(jd || role);
  const lengthText = settings.length === 'short' ? '30 秒' : settings.length === 'long' ? '90 秒' : '60 秒';

  if (settings.language === 'en') {
    return `Hi, I am targeting ${role}. I would connect my experience to ${keywords.join(', ')}, using concrete projects and measurable outcomes. This version is designed for about ${lengthText}.`;
  }

  if (settings.style === 'formal') {
    return `您好，我目前重点关注${role}。我的经历主要集中在问题拆解、跨团队推进和结果复盘上。针对这个岗位，我会重点突出${keywords.join('、')}相关经历，控制在${lengthText}左右。`;
  }

  if (settings.style === 'casual') {
    return `你好，我最近主要在看${role}方向。我比较擅长把一个模糊问题拆成可推进的方案，再用数据和复盘把结果讲清楚。这个岗位我会重点讲${keywords.join('、')}，控制在${lengthText}左右。`;
  }

  return `您好，我关注${role}。我会从指标和结果切入：先说明目标，再拆用户路径或业务漏斗，最后用复盘数据证明方案有效。针对这个岗位，我会重点突出${keywords.join('、')}，控制在${lengthText}左右。`;
}

export function simulatePrepPack(company: string, position: string, jd: string) {
  const keywords = extractKeywords(jd || `${company} ${position}`);
  return [
    `${company || '目标公司'} · ${position || '目标岗位'}准备包`,
    '',
    `公司/岗位摘要：这轮重点围绕 ${keywords.join('、')} 判断岗位匹配度。`,
    '',
    '常见问题：',
    '1. 请做一个 60 秒自我介绍。',
    `2. 讲一个和 ${keywords[0]} 最相关的项目。`,
    '3. 你怎么判断一个方案是否有效？',
    '',
    '准备重点：准备 2 个量化项目、1 个失败复盘、2 个反问问题。',
    '',
    '面试前 checklist：确认时间、复查简历、准备自我介绍、写下反问。',
  ].join('\n');
}

export function simulateStructuredReview(note: string): ReviewInput {
  const keywords = extractKeywords(note);
  return {
    company: 'AI 结构化复盘',
    position: keywords.includes('产品') ? '产品经理' : '目标岗位',
    stage: '待确认轮次',
    date: '刚刚',
    duration: 45,
    summary: `这场面试主要围绕 ${keywords.slice(0, 3).join('、')} 展开，建议补充追问细节和结果反馈。`,
    tags: ['AI 结构化', ...keywords.slice(0, 2)],
    score: '待复盘',
    scoreColor: '#FFD100',
    completed: 80,
    isHot: true,
    result: 'pending',
    moodScore: 6.8,
    star: {
      situation: '面试中出现了和岗位匹配度相关的追问。',
      task: `需要证明自己具备 ${keywords.slice(0, 2).join('、')} 能力。`,
      action: '按背景、目标、动作、指标的顺序补充自己的回答。',
      result: '下一步补齐面试官反馈和可复用答案。',
    },
  };
}

export function simulateWeeklySummary(applications: Application[]) {
  const active = applications.filter((item) => item.status !== 'rejected');
  const interviewing = applications.filter((item) => item.status === 'interviewing');
  const offers = applications.filter((item) => item.status === 'offer');

  return [
    `本周状态：当前有 ${active.length} 个机会还在推进，其中 ${interviewing.length} 个在面试阶段，${offers.length} 个 Offer。`,
    '',
    '节奏判断：优先处理面试中和已约面试的机会，不要平均分配精力。',
    '',
    '建议动作：',
    '1. 今天先补最近一场复盘。',
    '2. 给面试中的岗位各准备一版 60 秒自我介绍。',
    '3. 对已投递超过 5 天的岗位补一次跟进。',
  ].join('\n');
}
