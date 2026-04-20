import { Application, ApplicationTimelineEvent, InterviewPrepPack, ReviewEntry, ScheduleEvent } from '../types';
import { getCompanyColor } from './appUtils';
import { ensureSupabaseProfile } from './jobLeadRepository';
import { supabase } from './supabaseClient';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: string) {
  return uuidPattern.test(value);
}

type ApplicationRow = {
  id: string;
  source_job_id: string | null;
  company: string;
  position: string;
  department: string | null;
  status: Application['status'];
  location: string | null;
  salary: string | null;
  note: string | null;
  tags: string[] | null;
  urgency: Application['urgency'] | null;
  today_action: string | null;
  interview_time: string | null;
  interview_stage: string | null;
  offer_status: string | null;
  apply_source: Application['applySource'] | null;
  source_url: string | null;
  process_template: Application['processTemplate'] | null;
  process_steps: Application['processSteps'] | null;
  current_step_index: number | null;
  created_at: string;
};

type TimelineRow = {
  id: string;
  application_id: string;
  type: ApplicationTimelineEvent['type'];
  title: string;
  occurred_at: string;
};

type ScheduleEventRow = {
  id: string;
  application_id: string | null;
  date: number;
  full_date: string | null;
  weekday: string | null;
  time: string | null;
  title: string;
  company: string | null;
  status: ScheduleEvent['status'];
  type: ScheduleEvent['type'];
  is_today: boolean;
};

type ReviewRow = {
  id: string;
  application_id: string | null;
  interview_round: string | null;
  status: ReviewEntry['status'];
  entry_type: ReviewEntry['entryType'];
  company: string;
  position: string;
  stage: string | null;
  date: string | null;
  duration: number;
  summary: string;
  tags: string[] | null;
  score: string | null;
  score_color: string | null;
  completed: number;
  is_hot: boolean;
  result: ReviewEntry['result'] | null;
  star: ReviewEntry['star'] | null;
  next_step: string | null;
  mood_state: string | null;
  mood_score: number | null;
  communication_score: number | null;
  structure_score: number | null;
  business_score: number | null;
  data_score: number | null;
  resilience_score: number | null;
};

type PrepPackRow = {
  id: string;
  application_id: string;
  schedule_event_id: string | null;
  company: string;
  position: string;
  round: string;
  company_summary: string;
  common_questions: string[];
  prep_points: string[];
  checklist: string[];
  active: boolean;
};

function nullableUuid(value?: string) {
  return value && uuidPattern.test(value) ? value : null;
}

function daysSince(dateText: string) {
  const createdAt = new Date(dateText).getTime();
  if (Number.isNaN(createdAt)) return 0;
  return Math.max(0, Math.floor((Date.now() - createdAt) / 86400000));
}

function toTimelineEvent(row: TimelineRow): ApplicationTimelineEvent {
  return {
    id: row.id,
    applicationId: row.application_id,
    type: row.type,
    title: row.title,
    occurredAt: row.occurred_at,
  };
}

function toApplication(row: ApplicationRow, timeline: ApplicationTimelineEvent[]): Application {
  return {
    id: row.id,
    isDemo: false,
    company: row.company,
    companyInitial: row.company.slice(0, 1),
    companyColor: getCompanyColor(row.company),
    position: row.position,
    department: row.department || '',
    status: row.status,
    location: row.location || '',
    salary: row.salary || '',
    headcount: 1,
    daysAgo: daysSince(row.created_at),
    note: row.note || undefined,
    tags: row.tags || [],
    urgency: row.urgency || undefined,
    todayAction: row.today_action || undefined,
    interviewTime: row.interview_time || undefined,
    interviewStage: row.interview_stage || undefined,
    offerStatus: row.offer_status || undefined,
    activityDot: 'today',
    sourceJobId: row.source_job_id || undefined,
    applySource: row.apply_source || undefined,
    sourceUrl: row.source_url || undefined,
    processTemplate: row.process_template || undefined,
    processSteps: row.process_steps || [],
    currentStepIndex: row.current_step_index ?? undefined,
    timeline,
  };
}

function toScheduleEvent(row: ScheduleEventRow): ScheduleEvent {
  return {
    id: row.id,
    isDemo: false,
    applicationId: row.application_id || undefined,
    date: row.date,
    fullDate: row.full_date || undefined,
    weekday: row.weekday || '',
    time: row.time || undefined,
    title: row.title,
    company: row.company || undefined,
    status: row.status,
    type: row.type,
    isToday: row.is_today,
  };
}

function toReview(row: ReviewRow): ReviewEntry {
  const communication = row.communication_score || 3;
  const structure = row.structure_score || 3;
  const business = row.business_score || 3;
  const data = row.data_score || 3;
  const resilience = row.resilience_score || 3;

  return {
    id: row.id,
    isDemo: false,
    applicationId: row.application_id || undefined,
    interviewRound: row.interview_round || undefined,
    status: row.status,
    entryType: row.entry_type,
    company: row.company,
    position: row.position,
    stage: row.stage || '',
    date: row.date || '',
    duration: row.duration,
    summary: row.summary,
    tags: row.tags || [],
    score: row.score || '待复盘',
    scoreColor: row.score_color || '#FFD100',
    completed: row.completed,
    isHot: row.is_hot,
    result: row.result || undefined,
    star: row.star || { situation: '', task: '', action: '', result: '' },
    nextStep: row.next_step || undefined,
    moodState: row.mood_state || undefined,
    moodScore: row.mood_score || undefined,
    communicationScore: communication,
    structureScore: structure,
    businessScore: business,
    dataScore: data,
    resilienceScore: resilience,
    scores: {
      communication,
      structure,
      business,
      data,
      ownership: business,
      pressure: resilience,
    },
  };
}

function toPrepPack(row: PrepPackRow): InterviewPrepPack {
  return {
    id: row.id,
    applicationId: row.application_id,
    scheduleEventId: row.schedule_event_id || undefined,
    company: row.company,
    position: row.position,
    round: row.round,
    companySummary: row.company_summary,
    commonQuestions: row.common_questions,
    prepPoints: row.prep_points,
    checklist: row.checklist,
    active: row.active,
  };
}

function toApplicationUpsert(application: Application, userId: string) {
  return {
    id: application.id,
    user_id: userId,
    source_job_id: nullableUuid(application.sourceJobId),
    company: application.company,
    position: application.position,
    department: application.department || null,
    status: application.status,
    location: application.location || null,
    salary: application.salary || null,
    note: application.note || null,
    tags: application.tags || [],
    urgency: application.urgency || null,
    today_action: application.todayAction || null,
    interview_time: application.interviewTime || null,
    interview_stage: application.interviewStage || null,
    offer_status: application.offerStatus || null,
    apply_source: application.applySource || null,
    source_url: application.sourceUrl || null,
    process_template: application.processTemplate || 'big_tech',
    process_steps: application.processSteps || [],
    current_step_index: application.currentStepIndex ?? 0,
  };
}

function toTimelineInsert(event: ApplicationTimelineEvent, userId: string) {
  return {
    user_id: userId,
    application_id: event.applicationId,
    type: event.type,
    title: event.title,
    occurred_at: event.occurredAt,
  };
}

export async function saveApplicationSnapshot(application: Application, timelineEvent?: ApplicationTimelineEvent) {
  if (!supabase) return null;
  if (!isUuid(application.id)) return null;

  const userId = await ensureSupabaseProfile();
  if (!userId) return null;

  const { error: applicationError } = await supabase
    .from('applications')
    .upsert(toApplicationUpsert(application, userId));

  if (applicationError) throw applicationError;

  if (timelineEvent) {
    const { error: timelineError } = await supabase
      .from('application_timeline_events')
      .insert(toTimelineInsert(timelineEvent, userId));

    if (timelineError) throw timelineError;
  }

  return application;
}

function toScheduleEventInsert(event: ScheduleEvent, userId: string) {
  return {
    id: event.id,
    user_id: userId,
    application_id: nullableUuid(event.applicationId),
    date: event.date,
    full_date: event.fullDate || null,
    weekday: event.weekday || null,
    time: event.time || null,
    title: event.title,
    company: event.company || null,
    status: event.status,
    type: event.type,
    is_today: event.isToday || false,
  };
}

function toReviewInsert(review: ReviewEntry, userId: string) {
  return {
    id: review.id,
    user_id: userId,
    application_id: nullableUuid(review.applicationId),
    interview_round: review.interviewRound || null,
    status: review.status || 'pending',
    entry_type: review.entryType || 'manual',
    company: review.company,
    position: review.position,
    stage: review.stage || null,
    date: review.date || null,
    duration: review.duration || 0,
    summary: review.summary || '',
    tags: review.tags || [],
    score: review.score || null,
    score_color: review.scoreColor || null,
    completed: review.completed || 0,
    is_hot: review.isHot || false,
    result: review.result || null,
    star: review.star || null,
    next_step: review.nextStep || null,
    mood_state: review.moodState || null,
    mood_score: review.moodScore || null,
    communication_score: review.communicationScore || null,
    structure_score: review.structureScore || null,
    business_score: review.businessScore || null,
    data_score: review.dataScore || null,
    resilience_score: review.resilienceScore || null,
  };
}

function toPrepPackInsert(prepPack: InterviewPrepPack, userId: string) {
  return {
    id: prepPack.id,
    user_id: userId,
    application_id: prepPack.applicationId,
    schedule_event_id: nullableUuid(prepPack.scheduleEventId),
    company: prepPack.company,
    position: prepPack.position,
    round: prepPack.round,
    company_summary: prepPack.companySummary,
    common_questions: prepPack.commonQuestions,
    prep_points: prepPack.prepPoints,
    checklist: prepPack.checklist || [],
    active: prepPack.active,
  };
}

export async function saveInterviewChain(
  application: Application,
  event: ScheduleEvent,
  review: ReviewEntry,
  prepPack: InterviewPrepPack,
  timelineEvent: ApplicationTimelineEvent
) {
  if (!supabase) return null;
  if (!isUuid(application.id)) return null;

  const userId = await ensureSupabaseProfile();
  if (!userId) return null;

  const { error: applicationError } = await supabase
    .from('applications')
    .upsert(toApplicationUpsert(application, userId));

  if (applicationError) throw applicationError;

  const { error: timelineError } = await supabase
    .from('application_timeline_events')
    .insert(toTimelineInsert(timelineEvent, userId));

  if (timelineError) throw timelineError;

  const { error: eventError } = await supabase
    .from('schedule_events')
    .upsert(toScheduleEventInsert(event, userId));

  if (eventError) throw eventError;

  const { error: reviewError } = await supabase
    .from('reviews')
    .upsert(toReviewInsert(review, userId));

  if (reviewError) throw reviewError;

  const { error: prepPackError } = await supabase
    .from('interview_prep_packs')
    .upsert(toPrepPackInsert(prepPack, userId));

  if (prepPackError) throw prepPackError;

  return { application, event, review, prepPack };
}

export async function saveReviewSnapshot(review: ReviewEntry) {
  if (!supabase) return null;
  if (!isUuid(review.id)) return null;

  const userId = await ensureSupabaseProfile();
  if (!userId) return null;

  const { error } = await supabase
    .from('reviews')
    .upsert(toReviewInsert(review, userId));

  if (error) throw error;

  return review;
}

export async function deleteReviewSnapshot(review: ReviewEntry) {
  if (!supabase) return null;
  if (!isUuid(review.id)) return null;

  const userId = await ensureSupabaseProfile();
  if (!userId) return null;

  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', review.id)
    .eq('user_id', userId);

  if (error) throw error;

  return true;
}

export async function deleteApplicationSnapshot(applicationId: string) {
  if (!supabase) return null;
  if (!isUuid(applicationId)) return null;

  const userId = await ensureSupabaseProfile();
  if (!userId) return null;

  const { error } = await supabase
    .from('applications')
    .delete()
    .eq('id', applicationId)
    .eq('user_id', userId);

  if (error) throw error;

  return true;
}

export async function saveScheduleEventSnapshot(event: ScheduleEvent) {
  if (!supabase) return null;
  if (!isUuid(event.id)) return null;

  const userId = await ensureSupabaseProfile();
  if (!userId) return null;

  const { error } = await supabase
    .from('schedule_events')
    .upsert(toScheduleEventInsert(event, userId));

  if (error) throw error;

  return event;
}

export async function deleteScheduleEventSnapshot(eventId: string) {
  if (!supabase) return null;
  if (!isUuid(eventId)) return null;

  const userId = await ensureSupabaseProfile();
  if (!userId) return null;

  const { error } = await supabase
    .from('schedule_events')
    .delete()
    .eq('id', eventId)
    .eq('user_id', userId);

  if (error) throw error;

  return true;
}

export async function listApplicationsWithTimeline() {
  if (!supabase) return null;

  const userId = await ensureSupabaseProfile();
  if (!userId) return null;

  const { data: applicationRows, error: applicationError } = await supabase
    .from('applications')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (applicationError) throw applicationError;

  const { data: timelineRows, error: timelineError } = await supabase
    .from('application_timeline_events')
    .select('*')
    .eq('user_id', userId)
    .order('occurred_at', { ascending: false });

  if (timelineError) throw timelineError;

  const timeline = (timelineRows || []).map((row) => toTimelineEvent(row as TimelineRow));
  const timelineByApplication = timeline.reduce<Record<string, ApplicationTimelineEvent[]>>((acc, event) => {
    acc[event.applicationId] = [...(acc[event.applicationId] || []), event];
    return acc;
  }, {});

  return {
    applications: (applicationRows || []).map((row) => toApplication(
      row as ApplicationRow,
      timelineByApplication[(row as ApplicationRow).id] || []
    )),
    timeline,
  };
}

export async function listInterviewChainData() {
  if (!supabase) return null;

  const userId = await ensureSupabaseProfile();
  if (!userId) return null;

  const [scheduleResult, reviewResult, prepPackResult] = await Promise.all([
    supabase.from('schedule_events').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('reviews').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('interview_prep_packs').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
  ]);

  if (scheduleResult.error) throw scheduleResult.error;
  if (reviewResult.error) throw reviewResult.error;
  if (prepPackResult.error) throw prepPackResult.error;

  return {
    scheduleEvents: (scheduleResult.data || []).map((row) => toScheduleEvent(row as ScheduleEventRow)),
    reviews: (reviewResult.data || []).map((row) => toReview(row as ReviewRow)),
    interviewPrepPacks: (prepPackResult.data || []).map((row) => toPrepPack(row as PrepPackRow)),
  };
}
