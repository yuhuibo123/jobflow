import { JobLead, JobLeadSourceType } from '../types';

export function getSourceLabel(sourceType: JobLeadSourceType) {
  const labels: Record<JobLeadSourceType, string> = {
    manual: '手动补充',
    jd_paste: 'JD 识别',
    url_parse: '链接识别',
    ai_recommendation: 'AI 搜索',
  };
  return labels[sourceType];
}

export function getStatusLabel(status: JobLead['status']) {
  const labels: Record<NonNullable<JobLead['status']>, string> = {
    collected: '岗位库',
    promising: '值得看看',
    interested: '已加入想投',
    applied: '已投递',
    ignored: '暂不考虑',
  };
  return labels[status];
}

export function inferTags(text: string): string[] {
  const rules = [
    { keyword: 'AI', tag: 'AI PM' },
    { keyword: '智能', tag: 'AI PM' },
    { keyword: '增长', tag: '增长' },
    { keyword: '数据', tag: '数据' },
    { keyword: 'B端', tag: 'B 端' },
    { keyword: '商家', tag: '商家' },
    { keyword: '供应链', tag: '供应链' },
    { keyword: '运营', tag: '运营' },
  ];
  return rules.filter((rule) => text.includes(rule.keyword)).map((rule) => rule.tag);
}

type PartialJobForm = {
  company?: string;
  title?: string;
  department?: string;
  tags?: string;
  note?: string;
};

export function parseJdText(text: string): PartialJobForm {
  const tags = inferTags(text);
  const companyMatch = text.match(/(?:公司|企业)[:：]\s*([^\n]+)/);
  const titleMatch = text.match(/(?:岗位|职位)[:：]\s*([^\n]+)/);
  return {
    company: companyMatch?.[1]?.trim() || '待确认公司',
    title: titleMatch?.[1]?.trim() || (text.includes('AI') ? 'AI 产品经理' : '产品经理'),
    department: text.includes('增长') ? '增长业务' : '',
    tags: tags.length ? tags.join('，') : '待筛选',
    note: '从 JD 文本快速收纳，晚点再判断是否进入想投。',
  };
}
