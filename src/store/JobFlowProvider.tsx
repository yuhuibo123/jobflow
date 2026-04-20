import { ReactNode, useEffect, useMemo, useReducer, useState } from 'react';
import { fullMockData } from '../data/fullMockData';
import { getCompanyColor } from '../lib/appUtils';
import {
  deleteApplicationSnapshot,
  deleteReviewSnapshot,
  deleteScheduleEventSnapshot,
  listApplicationsWithTimeline,
  listInterviewChainData,
  saveApplicationSnapshot,
  saveInterviewChain,
  saveReviewSnapshot,
  saveScheduleEventSnapshot,
} from '../lib/applicationRepository';
import { createJobLead, listJobLeads, loadUserSettings, updateIntroSettings, updateJobLeadStatus, updateWatchedKeywords } from '../lib/jobLeadRepository';
import {
  deleteResumeVersionSnapshot,
  listMaterials,
  saveAIOutputSnapshot,
  saveResumeVersionSnapshot,
} from '../lib/materialRepository';
import { buildProcessSteps, getApplicationStatusForStep, inferProcessTemplate, processTemplates } from '../lib/processHelpers';
import {
  Application,
  ApplicationInput,
  ProcessTemplate,
  ResumeVersion,
  ResumeVersionInput,
  JobLead,
  ReviewEntry,
  ReviewInput,
  ScheduleEvent,
  ScheduleEventInput,
  InterviewPrepPack,
  ApplicationTimelineEvent,
} from '../types';
import { JobFlowContext, JobFlowContextValue } from './jobFlowContext';
import { jobFlowReducer } from './jobFlowReducer';

function toApplication(input: ApplicationInput): Application {
  const baseApplication = {
    company: input.company,
    position: input.position,
    tags: input.tags || [],
    processTemplate: input.processTemplate,
    status: input.status,
  } as Application;
  const template = input.processTemplate || inferProcessTemplate(baseApplication);
  const currentStepIndex = input.status === 'interested' ? -1 : input.status === 'applied' ? 0 : undefined;

  return {
    id: crypto.randomUUID(),
    isDemo: false,
    company: input.company,
    companyInitial: input.companyInitial || input.company.slice(0, 1),
    companyColor: input.companyColor || getCompanyColor(input.company),
    position: input.position,
    department: input.department || '',
    status: input.status,
    location: input.location || '',
    salary: input.salary || '',
    headcount: input.headcount || 1,
    daysAgo: input.daysAgo || 0,
    note: input.note || undefined,
    tags: input.tags || [],
    urgency: input.urgency,
    todayAction: input.todayAction,
    interviewTime: input.interviewTime,
    interviewStage: input.interviewStage,
    offerStatus: input.offerStatus,
    activityDot: input.activityDot,
    sourceJobId: input.sourceJobId,
    applySource: input.applySource,
    sourceUrl: input.sourceUrl,
    processTemplate: template,
    processSteps: buildProcessSteps(template, currentStepIndex ?? 0),
    currentStepIndex,
    timeline: [],
  };
}

function applicationFromJob(job: JobLead, status: Application['status'], processTemplate: ProcessTemplate = 'big_tech'): Application {
  return toApplication({
    company: job.company,
    position: job.title,
    department: job.department || '',
    status,
    sourceJobId: job.id,
    applySource: 'simulated_auto',
    sourceUrl: job.sourceUrl,
    processTemplate,
    note: job.reason || job.note,
    tags: ['岗位库来源', ...(job.tags || []).filter((tag) => !['已收纳', '值得看看'].includes(tag))],
    activityDot: 'today',
  });
}

function applicationTimelineEvent(
  application: Application,
  type: ApplicationTimelineEvent['type'],
  title: string
): ApplicationTimelineEvent {
  return {
    id: crypto.randomUUID(),
    applicationId: application.id,
    type,
    title,
    occurredAt: new Date().toISOString(),
  };
}

function persistApplicationSnapshot(application: Application, timelineEvent: ApplicationTimelineEvent, onError: (message: string) => void) {
  saveApplicationSnapshot(application, timelineEvent).catch((saveError) => {
    onError(saveError instanceof Error ? saveError.message : '申请保存失败');
  });
}

function toResumeVersion(input: ResumeVersionInput, id: string = crypto.randomUUID()): ResumeVersion {
  return {
    id,
    name: input.name,
    targetRole: input.targetRole,
    summary: input.summary,
    highlights: input.highlights,
    content: input.content,
    updatedAt: new Date().toISOString(),
  };
}

function clampScore(value: number) {
  return Math.max(1, Math.min(5, Math.round(value * 10) / 10));
}

function buildReviewScores(input: ReviewInput): NonNullable<ReviewEntry['scores']> {
  const moodBase = typeof input.moodScore === 'number' ? input.moodScore / 2 : undefined;
  const resultBase = input.result === 'pass' ? 4 : input.result === 'fail' ? 2.5 : 3;
  const base = moodBase || resultBase;

  return {
    communication: clampScore(input.communicationScore ?? input.scores?.communication ?? base),
    structure: clampScore(input.structureScore ?? input.scores?.structure ?? base),
    business: clampScore(input.businessScore ?? input.scores?.business ?? base),
    data: clampScore(input.dataScore ?? input.scores?.data ?? base - 0.3),
    ownership: clampScore(input.scores?.ownership ?? base),
    pressure: clampScore(input.resilienceScore ?? input.scores?.pressure ?? base - 0.2),
  };
}

function toReview(input: ReviewInput): ReviewEntry {
  const scores = buildReviewScores(input);
  return {
    id: crypto.randomUUID(),
    isDemo: false,
    company: input.company,
    position: input.position,
    stage: input.stage || '',
    date: input.date || '',
    duration: input.duration || 0,
    summary: input.summary || '',
    tags: input.tags || [],
    score: input.score || '待复盘',
    scoreColor: input.scoreColor || '#FFD100',
    completed: input.completed || 0,
    isHot: input.isHot || false,
    result: input.result,
    star: input.star || { situation: '', task: '', action: '', result: '' },
    nextStep: input.nextStep,
    moodState: input.moodState,
    moodScore: input.moodScore,
    communicationScore: scores.communication,
    structureScore: scores.structure,
    businessScore: scores.business,
    dataScore: scores.data,
    resilienceScore: scores.pressure,
    scores,
    applicationId: input.applicationId,
    interviewRound: input.interviewRound || input.stage,
    status: input.status || ((input.completed || 0) >= 100 ? 'completed' : 'pending'),
    entryType: input.entryType || 'manual',
  };
}

function toScheduleEvent(input: ScheduleEventInput): ScheduleEvent {
  return {
    id: crypto.randomUUID(),
    isDemo: false,
    date: input.date,
    fullDate: input.fullDate,
    weekday: input.weekday || '',
    time: input.time,
    title: input.title,
    company: input.company,
    applicationId: input.applicationId,
    status: input.status,
    type: input.type,
    isToday: input.isToday,
  };
}

export function JobFlowProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(jobFlowReducer, fullMockData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSupabaseState() {
      setLoading(true);
      try {
        const [jobs, applicationState, interviewState, materialState, userSettingsState] = await Promise.all([
          listJobLeads(),
          listApplicationsWithTimeline(),
          listInterviewChainData(),
          listMaterials(),
          loadUserSettings(),
        ]);
        if (!cancelled && jobs) {
          dispatch({ type: 'SET_JOB_LEADS', payload: jobs });
        }
        // Always replace when Supabase responds — empty [] means "no applications yet"
        if (!cancelled && applicationState) {
          dispatch({ type: 'SET_APPLICATIONS', payload: applicationState });
        }
        if (!cancelled && interviewState) {
          dispatch({ type: 'SET_INTERVIEW_CHAIN_DATA', payload: interviewState });
        }
        if (!cancelled && materialState) {
          dispatch({ type: 'SET_MATERIALS', payload: materialState });
        }
        if (!cancelled && userSettingsState) {
          dispatch({ type: 'SET_USER_SETTINGS', payload: userSettingsState });
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Supabase 数据加载失败');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadSupabaseState();

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<JobFlowContextValue>(() => ({
    ...state,
    loading,
    error,
    dispatch,
    saveJobLead: async (input) => {
      const job: JobLead = {
        ...input,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: 'SAVE_JOB_LEAD', payload: job });
      try {
        await createJobLead(job);
      } catch (saveError) {
        setError(saveError instanceof Error ? saveError.message : '岗位保存失败');
      }
      return job;
    },
    markJobPromising: async (jobId) => {
      dispatch({ type: 'MARK_JOB_PROMISING', payload: { jobId } });
      try {
        await updateJobLeadStatus(jobId, 'promising');
      } catch (saveError) {
        setError(saveError instanceof Error ? saveError.message : '岗位状态保存失败');
      }
    },
    ignoreJobLead: async (jobId) => {
      dispatch({ type: 'IGNORE_JOB_LEAD', payload: { jobId } });
      try {
        await updateJobLeadStatus(jobId, 'ignored');
      } catch (saveError) {
        setError(saveError instanceof Error ? saveError.message : '岗位状态保存失败');
      }
    },
    addWatchedKeyword: (keyword) => {
      dispatch({ type: 'ADD_WATCHED_KEYWORD', payload: { keyword } });
      const updated = [...state.userSettings.watchedKeywords, keyword];
      updateWatchedKeywords(updated).catch((saveError) => {
        setError(saveError instanceof Error ? saveError.message : '关键词保存失败');
      });
    },
    removeWatchedKeyword: (keyword) => {
      dispatch({ type: 'REMOVE_WATCHED_KEYWORD', payload: { keyword } });
      const updated = state.userSettings.watchedKeywords.filter((k) => k !== keyword);
      updateWatchedKeywords(updated).catch((saveError) => {
        setError(saveError instanceof Error ? saveError.message : '关键词删除失败');
      });
    },
    createApplication: async (input) => {
      const application = toApplication(input);
      dispatch({ type: 'ADD_FRONTEND_APPLICATION', payload: application });
      saveApplicationSnapshot(
        application,
        applicationTimelineEvent(application, 'created', `${application.company} 已创建申请`)
      ).catch((saveError) => {
        setError(saveError instanceof Error ? saveError.message : '申请创建保存失败');
      });
      return application;
    },
    deleteApplication: async (application) => {
      if (application.isDemo) return false;
      dispatch({ type: 'REMOVE_FRONTEND_APPLICATION', payload: { applicationId: application.id } });
      deleteApplicationSnapshot(application.id).catch((saveError) => {
        setError(saveError instanceof Error ? saveError.message : '申请删除失败');
      });
      return true;
    },
    promoteJobToInterested: (jobId) => {
      const job = state.jobs.find((item) => item.id === jobId);
      if (!job) return null;
      const application = applicationFromJob(job, 'interested');
      dispatch({ type: 'PROMOTE_JOB_TO_INTERESTED', payload: { jobId, application } });
      updateJobLeadStatus(jobId, 'interested').catch((saveError) => {
        setError(saveError instanceof Error ? saveError.message : '岗位状态保存失败');
      });
      saveApplicationSnapshot(
        application,
        applicationTimelineEvent(application, 'created', `${application.company} 已从岗位库加入想投`)
      ).catch((saveError) => {
        setError(saveError instanceof Error ? saveError.message : '想投申请保存失败');
      });
      return application;
    },
    applyJobLead: (jobId, processTemplate = 'big_tech') => {
      const job = state.jobs.find((item) => item.id === jobId);
      if (!job) return null;
      const existingApplication = state.applications.find((application) => application.sourceJobId === jobId);
      const application = {
        ...(existingApplication || applicationFromJob(job, 'applied', processTemplate)),
        status: 'applied' as const,
        processTemplate,
        processSteps: buildProcessSteps(processTemplate, 0),
        currentStepIndex: 0,
        sourceJobId: job.id,
        applySource: 'simulated_auto' as const,
        sourceUrl: job.sourceUrl,
        activityDot: 'today' as const,
      };
      dispatch({
        type: 'APPLY_JOB_LEAD',
        payload: {
          jobId,
          application,
          existingApplicationId: existingApplication?.id,
        },
      });
      updateJobLeadStatus(jobId, 'applied').catch((saveError) => {
        setError(saveError instanceof Error ? saveError.message : '岗位状态保存失败');
      });
      saveApplicationSnapshot(
        application,
        applicationTimelineEvent(application, 'applied', `${application.company} 已从岗位库投递`)
      ).catch((saveError) => {
        setError(saveError instanceof Error ? saveError.message : '投递申请保存失败');
      });
      return application;
    },
    advanceApplicationStep: (applicationId, currentStepIndex) => {
      const application = state.applications.find((item) => item.id === applicationId);
      if (!application) return;
      const template = application.processTemplate || inferProcessTemplate(application);
      const stepLabel = processTemplates[template].steps[currentStepIndex] || processTemplates[template].steps[0];
      const status = getApplicationStatusForStep(stepLabel);
      const processSteps = buildProcessSteps(template, currentStepIndex);
      const note = `进入${stepLabel}阶段`;
      const updatedApplication: Application = {
        ...application,
        status,
        currentStepIndex,
        processTemplate: template,
        processSteps,
        note,
        interviewStage: status === 'interviewing' ? stepLabel : application.interviewStage,
        activityDot: 'today',
      };
      const timelineEvent = applicationTimelineEvent(updatedApplication, 'stage_changed', note);
      dispatch({
        type: 'ADVANCE_APPLICATION_STAGE',
        payload: {
          applicationId,
          status,
          currentStepIndex,
          processSteps,
          note,
        },
      });
      persistApplicationSnapshot(updatedApplication, timelineEvent, (message) => {
        setError(message || '申请阶段保存失败');
      });
    },
    scheduleInterviewForApplication: (applicationId) => {
      const application = state.applications.find((item) => item.id === applicationId);
      if (!application) return;
      const round = application.interviewStage || '下一轮面试';
      const updatedApplication: Application = {
        ...application,
        status: 'interviewing',
        interviewStage: round,
        activityDot: 'today',
      };
      const event = toScheduleEvent({
        applicationId,
        date: 24,
        fullDate: '2026-02-24',
        weekday: '周二',
        time: '16:30',
        title: `${application.company} · ${round}`,
        company: application.company,
        status: 'upcoming',
        type: 'interview',
      });
      const review = toReview({
        applicationId,
        interviewRound: round,
        status: 'pending',
        entryType: 'manual',
        company: application.company,
        position: application.position,
        stage: round,
        date: '待面试后补充',
        duration: 45,
        summary: '',
        tags: ['待复盘', '自动创建'],
        completed: 0,
        isHot: true,
        result: 'pending',
      });
      const prepPack: InterviewPrepPack = {
        id: crypto.randomUUID(),
        applicationId,
        scheduleEventId: event.id,
        company: application.company,
        position: application.position,
        round,
        companySummary: `${application.company} 这轮先围绕岗位 JD、业务方向和你已有项目经历做匹配。`,
        commonQuestions: ['请做一个 60 秒自我介绍', '为什么想投这个岗位？', '讲一个最能证明你匹配的项目'],
        prepPoints: ['准备 2 个可量化项目', '把 JD 关键词映射到简历经历', '准备 2 个反问问题'],
        checklist: ['确认时间和会议链接', '准备自我介绍', '复查简历版本', '写下反问问题'],
        active: true,
      };
      dispatch({ type: 'SCHEDULE_APPLICATION_INTERVIEW', payload: { application, event, review, prepPack } });
      saveInterviewChain(
        updatedApplication,
        event,
        review,
        prepPack,
        applicationTimelineEvent(updatedApplication, 'interview_scheduled', `${application.company} 已约面试`)
      ).catch((saveError) => {
        setError(saveError instanceof Error ? saveError.message : '约面试保存失败');
      });
    },
    markApplicationOffer: (applicationId) => {
      const application = state.applications.find((item) => item.id === applicationId);
      if (!application) return;
      const template = application.processTemplate || inferProcessTemplate(application);
      const lastIndex = processTemplates[template].steps.length - 1;
      const processSteps = buildProcessSteps(template, lastIndex);
      const updatedApplication: Application = {
        ...application,
        status: 'offer',
        currentStepIndex: lastIndex,
        processTemplate: template,
        processSteps,
        note: '已拿 Offer',
        offerStatus: '待决策',
        activityDot: 'today',
      };
      const timelineEvent = applicationTimelineEvent(updatedApplication, 'offer', '已拿 Offer');
      dispatch({
        type: 'ADVANCE_APPLICATION_STAGE',
        payload: {
          applicationId,
          status: 'offer',
          currentStepIndex: lastIndex,
          processSteps,
          note: '已拿 Offer',
        },
      });
      persistApplicationSnapshot(updatedApplication, timelineEvent, (message) => {
        setError(message || 'Offer 状态保存失败');
      });
    },
    markApplicationRejected: (applicationId) => {
      const application = state.applications.find((item) => item.id === applicationId);
      if (!application) return;
      const updatedApplication: Application = {
        ...application,
        status: 'rejected',
        note: '已拒',
        activityDot: 'today',
      };
      const timelineEvent = applicationTimelineEvent(updatedApplication, 'rejected', '已拒');
      dispatch({
        type: 'ADVANCE_APPLICATION_STAGE',
        payload: {
          applicationId,
          status: 'rejected',
          note: '已拒',
        },
      });
      persistApplicationSnapshot(updatedApplication, timelineEvent, (message) => {
        setError(message || '拒绝状态保存失败');
      });
    },
    createResumeVersion: (input) => {
      const resume = toResumeVersion(input);
      dispatch({ type: 'CREATE_RESUME_VERSION', payload: resume });
      saveResumeVersionSnapshot(resume).catch((saveError) => {
        setError(saveError instanceof Error ? saveError.message : '简历保存失败');
      });
      return resume;
    },
    updateResumeVersion: (resumeId, input) => {
      const current = state.resumes.find((resume) => resume.id === resumeId);
      if (!current) return null;
      const resume = toResumeVersion(input, current.id);
      dispatch({ type: 'UPDATE_RESUME_VERSION', payload: resume });
      saveResumeVersionSnapshot(resume).catch((saveError) => {
        setError(saveError instanceof Error ? saveError.message : '简历更新保存失败');
      });
      return resume;
    },
    deleteResumeVersion: (resumeId) => {
      if (state.resumes.length <= 1) return false;
      dispatch({ type: 'DELETE_RESUME_VERSION', payload: { resumeId } });
      deleteResumeVersionSnapshot(resumeId).catch((saveError) => {
        setError(saveError instanceof Error ? saveError.message : '简历删除失败');
      });
      return true;
    },
    updateIntroSettings: (settings) => {
      dispatch({ type: 'UPDATE_INTRO_SETTINGS', payload: settings });
      updateIntroSettings(settings).catch((saveError) => {
        setError(saveError instanceof Error ? saveError.message : '介绍设置保存失败');
      });
    },
    saveAIOutput: (input) => {
      const output = {
        ...input,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: 'SAVE_AI_OUTPUT', payload: output });
      saveAIOutputSnapshot(output).catch((saveError) => {
        setError(saveError instanceof Error ? saveError.message : 'AI 输出保存失败');
      });
      return output;
    },
    createReview: async (input) => {
      const review = toReview(input);
      dispatch({ type: 'CREATE_PENDING_REVIEW', payload: review });
      try {
        await saveReviewSnapshot(review);
      } catch (saveError) {
        setError(saveError instanceof Error ? saveError.message : '复盘保存失败');
      }
      return review;
    },
    updateReview: async (review, input) => {
      const updated = { ...review, ...toReview(input), id: review.id, isDemo: review.isDemo };
      dispatch({ type: 'COMPLETE_REVIEW', payload: { reviewId: review.id, review: updated } });
      try {
        await saveReviewSnapshot(updated);
      } catch (saveError) {
        setError(saveError instanceof Error ? saveError.message : '复盘更新保存失败');
      }
      return updated;
    },
    deleteReview: async (review) => {
      if (review.isDemo) return false;
      dispatch({ type: 'DELETE_REVIEW', payload: { reviewId: review.id } });
      try {
        await deleteReviewSnapshot(review);
      } catch (saveError) {
        setError(saveError instanceof Error ? saveError.message : '复盘删除失败');
      }
      return true;
    },
    createScheduleEvent: async (input) => {
      const event = toScheduleEvent(input);
      dispatch({ type: 'SCHEDULE_INTERVIEW', payload: { applicationId: 'manual', event } });
      saveScheduleEventSnapshot(event).catch((saveError) => {
        setError(saveError instanceof Error ? saveError.message : '日程保存失败');
      });
      return event;
    },
    deleteScheduleEvent: async (event) => {
      if (event.isDemo) return false;
      dispatch({ type: 'DELETE_SCHEDULE_EVENT', payload: { eventId: event.id } });
      deleteScheduleEventSnapshot(event.id).catch((saveError) => {
        setError(saveError instanceof Error ? saveError.message : '日程删除失败');
      });
      return true;
    },
  }), [error, loading, state]);

  return <JobFlowContext.Provider value={value}>{children}</JobFlowContext.Provider>;
}
