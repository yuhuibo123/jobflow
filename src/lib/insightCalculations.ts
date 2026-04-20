import { Application, OfferComparison, ReviewEntry, ScheduleEvent } from '../types';

const submittedStatuses: Application['status'][] = ['applied', 'written_test', 'interviewing', 'offer', 'rejected'];
const interviewStatuses: Application['status'][] = ['interviewing', 'offer'];

const abilityDefinitions = [
  { key: 'communicationScore', legacyKey: 'communication', label: '沟通表达' },
  { key: 'structureScore', legacyKey: 'structure', label: '结构化' },
  { key: 'businessScore', legacyKey: 'business', label: '业务理解' },
  { key: 'dataScore', legacyKey: 'data', label: '数据意识' },
  { key: 'resilienceScore', legacyKey: 'pressure', label: '抗压恢复' },
] as const;

type AbilityKey = typeof abilityDefinitions[number]['key'];
type LegacyAbilityKey = typeof abilityDefinitions[number]['legacyKey'];

export type InsightCalculationInput = {
  applications: Application[];
  reviews: ReviewEntry[];
  scheduleEvents: ScheduleEvent[];
  offers?: OfferComparison[];
};

function percentage(value: number, total: number) {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

function average(values: number[]) {
  if (values.length === 0) return null;
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
}

function scoreValue(review: ReviewEntry, key: AbilityKey, legacyKey: LegacyAbilityKey) {
  return review[key] ?? review.scores?.[legacyKey];
}

function hasAllAbilityScores(review: ReviewEntry) {
  return abilityDefinitions.every(({ key, legacyKey }) => typeof scoreValue(review, key, legacyKey) === 'number');
}

function isApplicationSubmitted(application: Application) {
  return submittedStatuses.includes(application.status) || application.timeline?.some((event) => event.type === 'applied');
}

function isApplicationInterviewing(application: Application, scheduleEvents: ScheduleEvent[]) {
  const hasInterviewEvent = scheduleEvents.some(
    (event) => event.applicationId === application.id && (event.type === 'interview' || event.type === 'call')
  );
  return interviewStatuses.includes(application.status) || hasInterviewEvent;
}

function inferDevelopment(application: Application) {
  if (application.tags?.some((tag) => /leader|负责人|专家|核心/.test(tag))) return '发展空间较高';
  if (/实习|助理/.test(application.position)) return '适合积累经验';
  if (application.status === 'offer') return '可进一步确认晋升路径';
  return '发展信息待补充';
}

function inferRisk(application: Application) {
  if (application.urgency === 'hot') return '节奏较快，需要确认强度';
  if (/海外|异地|新加坡|杭州\/北京|北京\/杭州/.test(`${application.location} ${application.tags?.join(' ')}`)) return '地点或协作成本需确认';
  if (!application.salary) return '薪资细节待确认';
  return '风险信息较少';
}

function inferPreference(application: Application) {
  if (application.note) return application.note.slice(0, 28);
  if (application.sourceJobId) return '来自岗位库投递';
  if (application.activityDot === 'today') return '近期优先处理';
  return '偏好待补充';
}

function buildStageConversion(applications: Application[]) {
  const submittedApplications = applications.filter(isApplicationSubmitted);
  if (submittedApplications.length === 0) {
    return {
      unlocked: false,
      needed: 1,
      chart: [],
      sourceCount: 0,
    };
  }

  const stageMap = [
    {
      category: '已投递',
      reached: submittedApplications.length,
      total: submittedApplications.length,
    },
    {
      category: '笔试/测评',
      reached: applications.filter((application) =>
        application.status === 'written_test' ||
        application.processSteps?.some((step) => /笔试|测评|Case/.test(step.label) && step.status !== 'upcoming')
      ).length,
      total: submittedApplications.length,
    },
    {
      category: '面试',
      reached: applications.filter((application) =>
        application.status === 'interviewing' ||
        application.status === 'offer' ||
        application.processSteps?.some((step) => /面|HR|Partner/.test(step.label) && step.status !== 'upcoming')
      ).length,
      total: submittedApplications.length,
    },
    {
      category: 'Offer',
      reached: applications.filter((application) => application.status === 'offer').length,
      total: submittedApplications.length,
    },
  ];

  const chart = stageMap.map((value) => ({
    category: value.category,
    rate: percentage(value.reached, value.total),
    color: '#FFD100',
    reached: value.reached,
    total: value.total,
  }));

  return {
    unlocked: chart.length > 0,
    needed: 0,
    chart,
    sourceCount: submittedApplications.length,
  };
}

function buildAbilityRadar(reviews: ReviewEntry[]) {
  const scored = reviews.filter(hasAllAbilityScores);

  return {
    unlocked: scored.length >= 2,
    needed: Math.max(0, 2 - scored.length),
    scoredCount: scored.length,
    chart: abilityDefinitions.map(({ key, legacyKey, label }) => {
      const value = average(scored.map((review) => scoreValue(review, key, legacyKey) || 0)) || 0;
      return {
        label,
        value: Math.round((value / 5) * 100),
        avg: 60,
      };
    }),
  };
}

function buildMood(reviews: ReviewEntry[]) {
  const scored = reviews
    .filter((review) => typeof review.moodScore === 'number')
    .map((review) => ({
      date: review.date.split(' ').slice(0, 3).join(' ') || review.company,
      score: review.moodScore || 0,
      company: review.company,
    }));
  const recent = scored.slice(0, 5);
  const latest = recent[0]?.score ?? null;
  const previous = recent[1]?.score ?? null;
  const trend = latest === null || previous === null ? 'flat' : latest > previous ? 'up' : latest < previous ? 'down' : 'flat';
  const avg = average(scored.map((item) => item.score));

  return {
    unlocked: scored.length >= 2,
    needed: Math.max(0, 2 - scored.length),
    scoredCount: scored.length,
    average: avg,
    latest,
    trend,
    supportLevel: avg !== null && avg < 5 ? 'low' : avg !== null && avg < 6.5 ? 'watch' : 'stable',
    chart: scored,
  };
}

function buildOfferComparison(applications: Application[], offers: OfferComparison[] = []) {
  const offerApplications = applications.filter((application) => application.status === 'offer');
  const savedOfferMap = new Map(offers.map((offer) => [offer.applicationId, offer]));

  const items = offerApplications.map((application) => {
    const saved = savedOfferMap.get(application.id);
    return {
      id: application.id,
      applicationId: application.id,
      company: application.company,
      position: application.position,
      salary: saved?.salary || application.salary || '薪资待确认',
      location: saved?.location || application.location || '地点待确认',
      growth: saved?.growth || inferDevelopment(application),
      risk: inferRisk(application),
      preference: saved?.notes || inferPreference(application),
      source: saved ? 'offers' : 'applications',
    };
  });

  return {
    unlocked: items.length >= 2,
    needed: Math.max(0, 2 - items.length),
    items,
  };
}

export function calculateInsights({ applications, reviews, scheduleEvents, offers = [] }: InsightCalculationInput) {
  const submittedApplications = applications.filter(isApplicationSubmitted);
  const interviewApplications = applications.filter((application) => isApplicationInterviewing(application, scheduleEvents));
  const offerApplications = applications.filter((application) => application.status === 'offer');
  const rejectedApplications = applications.filter((application) => application.status === 'rejected');
  const completedReviews = reviews.filter((review) => review.status === 'completed' || review.completed >= 100);
  const reviewsWithScores = reviews.filter(hasAllAbilityScores);
  const reviewScores = reviewsWithScores.map((review) => {
    const values = abilityDefinitions.map(({ key, legacyKey }) => scoreValue(review, key, legacyKey) || 0);
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  });

  return {
    summary: {
      totalApplications: applications.length,
      submittedCount: submittedApplications.length,
      interviewCount: interviewApplications.length,
      offerCount: offerApplications.length,
      rejectedCount: rejectedApplications.length,
      passRate: percentage(offerApplications.length, submittedApplications.length),
      reviewCompletionRate: percentage(completedReviews.length, reviews.length),
      averageReviewScore: average(reviewScores),
      averageMoodScore: average(reviews.filter((review) => typeof review.moodScore === 'number').map((review) => review.moodScore || 0)),
      trace: {
        applications: applications.length,
        reviews: reviews.length,
        scheduleEvents: scheduleEvents.length,
        offers: offers.length,
      },
    },
    stageConversion: buildStageConversion(applications),
    abilityRadar: buildAbilityRadar(reviews),
    mood: buildMood(reviews),
    offerComparison: buildOfferComparison(applications, offers),
    reviewStats: {
      total: reviews.length,
      completed: completedReviews.length,
      scored: reviewsWithScores.length,
    },
  };
}
