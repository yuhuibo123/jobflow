import { JobFlowState } from '../types';
import { JobFlowAction } from './jobFlowActions';

export function jobFlowReducer(state: JobFlowState, action: JobFlowAction): JobFlowState {
  switch (action.type) {
    case 'SET_JOB_LEADS':
      return {
        ...state,
        jobs: action.payload,
      };

    case 'SET_APPLICATIONS':
      return {
        ...state,
        applications: action.payload.applications,
        applicationTimeline: action.payload.timeline,
      };

    case 'SET_INTERVIEW_CHAIN_DATA':
      // Always replace — Supabase returning [] means "user has no data", not "data missing"
      return {
        ...state,
        scheduleEvents: action.payload.scheduleEvents,
        reviews: action.payload.reviews,
        interviewPrepPacks: action.payload.interviewPrepPacks,
      };

    case 'SET_MATERIALS':
      // Always replace — same reasoning as SET_INTERVIEW_CHAIN_DATA
      return {
        ...state,
        resumes: action.payload.resumes.length > 0 ? action.payload.resumes : state.resumes,
        aiOutputs: action.payload.aiOutputs,
      };

    case 'SET_USER_SETTINGS':
      return {
        ...state,
        userSettings: {
          ...state.userSettings,
          ...action.payload,
          introSettings: action.payload.introSettings
            ? { ...state.userSettings.introSettings, ...action.payload.introSettings }
            : state.userSettings.introSettings,
        },
      };

    case 'SAVE_JOB_LEAD':
      return {
        ...state,
        jobs: [action.payload, ...state.jobs],
      };

    case 'MARK_JOB_PROMISING':
      return {
        ...state,
        jobs: state.jobs.map((job) =>
          job.id === action.payload.jobId ? { ...job, status: 'promising' } : job
        ),
      };

    case 'IGNORE_JOB_LEAD':
      return {
        ...state,
        jobs: state.jobs.map((job) =>
          job.id === action.payload.jobId ? { ...job, status: 'ignored' } : job
        ),
      };

    case 'PROMOTE_JOB_TO_INTERESTED':
      return {
        ...state,
        jobs: state.jobs.map((job) =>
          job.id === action.payload.jobId ? { ...job, status: 'interested' } : job
        ),
        applications: [
          {
            ...action.payload.application,
            timeline: [
              {
                id: `timeline-${action.payload.application.id}`,
                applicationId: action.payload.application.id,
                type: 'created',
                title: `${action.payload.application.company} 已从岗位库加入想投`,
                occurredAt: new Date().toISOString(),
              },
            ],
          },
          ...state.applications,
        ],
        applicationTimeline: [
          {
            id: `timeline-${action.payload.application.id}`,
            applicationId: action.payload.application.id,
            type: 'created',
            title: `${action.payload.application.company} 已从岗位库加入想投`,
            occurredAt: new Date().toISOString(),
          },
          ...state.applicationTimeline,
        ],
      };

    case 'APPLY_JOB_LEAD': {
      const timelineEvent = {
        id: `timeline-${action.payload.application.id}-applied-${Date.now()}`,
        applicationId: action.payload.application.id,
        type: 'applied' as const,
        title: `${action.payload.application.company} 已从岗位库投递`,
        occurredAt: new Date().toISOString(),
      };
      return {
        ...state,
        jobs: state.jobs.map((job) =>
          job.id === action.payload.jobId ? { ...job, status: 'applied' } : job
        ),
        applications: action.payload.existingApplicationId
          ? state.applications.map((application) =>
              application.id === action.payload.existingApplicationId
                ? { ...action.payload.application, timeline: [timelineEvent, ...(application.timeline || [])] }
                : application
            )
          : [{ ...action.payload.application, timeline: [timelineEvent] }, ...state.applications],
        applicationTimeline: [timelineEvent, ...state.applicationTimeline],
      };
    }

    case 'ADD_FRONTEND_APPLICATION':
      const createdTimelineEvent = {
        id: `timeline-${action.payload.id}-created-${Date.now()}`,
        applicationId: action.payload.id,
        type: action.payload.status === 'applied' ? 'applied' as const : 'created' as const,
        title: action.payload.status === 'applied' ? `${action.payload.company} 已手动记录投递` : `${action.payload.company} 已手动新增到看板`,
        occurredAt: new Date().toISOString(),
      };
      return {
        ...state,
        applications: [{ ...action.payload, timeline: [createdTimelineEvent] }, ...state.applications],
        applicationTimeline: [createdTimelineEvent, ...state.applicationTimeline],
      };

    case 'UPSERT_APPLICATION_META':
      return {
        ...state,
        applications: state.applications.map((application) =>
          application.id === action.payload.id ? { ...application, ...action.payload } : application
        ),
      };

    case 'REMOVE_FRONTEND_APPLICATION':
      return {
        ...state,
        applications: state.applications.filter((application) => application.id !== action.payload.applicationId),
        applicationTimeline: state.applicationTimeline.filter((event) => event.applicationId !== action.payload.applicationId),
      };

    case 'ADVANCE_APPLICATION_STAGE':
      return {
        ...state,
        applications: state.applications.map((application) =>
          application.id === action.payload.applicationId
            ? (() => {
                const timelineEvent = {
                  id: `timeline-${action.payload.applicationId}-${Date.now()}`,
                  applicationId: action.payload.applicationId,
                  type: action.payload.status === 'offer' ? 'offer' as const : action.payload.status === 'rejected' ? 'rejected' as const : 'stage_changed' as const,
                  title: action.payload.note || '申请阶段已更新',
                  occurredAt: new Date().toISOString(),
                };
                return {
                ...application,
                status: action.payload.status,
                currentStepIndex: action.payload.currentStepIndex ?? application.currentStepIndex,
                processSteps: action.payload.processSteps ?? application.processSteps,
                note: action.payload.note ?? application.note,
                timeline: [timelineEvent, ...(application.timeline || [])],
              };
            })()
            : application
        ),
        applicationTimeline: [
          {
            id: `timeline-${action.payload.applicationId}-${Date.now()}`,
            applicationId: action.payload.applicationId,
            type: action.payload.status === 'offer' ? 'offer' : action.payload.status === 'rejected' ? 'rejected' : 'stage_changed',
            title: action.payload.note || '申请阶段已更新',
            occurredAt: new Date().toISOString(),
          },
          ...state.applicationTimeline,
        ],
      };

    case 'SCHEDULE_APPLICATION_INTERVIEW': {
      const timelineEvent = {
        id: `timeline-${action.payload.application.id}-interview-${Date.now()}`,
        applicationId: action.payload.application.id,
        type: 'interview_scheduled' as const,
        title: `${action.payload.application.company} 已约面试`,
        occurredAt: new Date().toISOString(),
      };
      return {
        ...state,
        applications: state.applications.map((application) =>
          application.id === action.payload.application.id
            ? {
                ...application,
                status: 'interviewing',
                activityDot: 'today',
                interviewStage: action.payload.prepPack.round,
                timeline: [timelineEvent, ...(application.timeline || [])],
              }
            : application
        ),
        scheduleEvents: [action.payload.event, ...state.scheduleEvents],
        reviews: [action.payload.review, ...state.reviews],
        interviewPrepPacks: [
          action.payload.prepPack,
          ...state.interviewPrepPacks.map((pack) =>
            pack.applicationId === action.payload.application.id ? { ...pack, active: false } : pack
          ),
        ],
        applicationTimeline: [timelineEvent, ...state.applicationTimeline],
      };
    }

    case 'SCHEDULE_INTERVIEW':
      return {
        ...state,
        scheduleEvents: [action.payload.event, ...state.scheduleEvents],
        reviews: action.payload.review ? [action.payload.review, ...state.reviews] : state.reviews,
        applicationTimeline: [
          {
            id: `timeline-${action.payload.applicationId}-${action.payload.event.id}`,
            applicationId: action.payload.applicationId,
            type: 'interview_scheduled',
            title: action.payload.event.title,
            occurredAt: new Date().toISOString(),
          },
          ...state.applicationTimeline,
        ],
      };

    case 'CREATE_PENDING_REVIEW':
      return {
        ...state,
        reviews: [action.payload, ...state.reviews],
      };

    case 'COMPLETE_REVIEW':
      return {
        ...state,
        reviews: state.reviews.map((review) =>
          review.id === action.payload.reviewId ? { ...review, ...action.payload.review } : review
        ),
        reviewQuestions: action.payload.questions
          ? [
              ...action.payload.questions.filter((question) => question.reviewId === action.payload.reviewId),
              ...state.reviewQuestions.filter((question) => question.reviewId !== action.payload.reviewId),
            ]
          : state.reviewQuestions,
        reviewMaterials: action.payload.materials
          ? [
              ...action.payload.materials.filter((material) => material.reviewId === action.payload.reviewId),
              ...state.reviewMaterials.filter((material) => material.reviewId !== action.payload.reviewId),
            ]
          : state.reviewMaterials,
      };

    case 'DELETE_REVIEW':
      return {
        ...state,
        reviews: state.reviews.filter((review) => review.id !== action.payload.reviewId),
        reviewQuestions: state.reviewQuestions.filter((question) => question.reviewId !== action.payload.reviewId),
        reviewMaterials: state.reviewMaterials.filter((material) => material.reviewId !== action.payload.reviewId),
      };

    case 'DELETE_SCHEDULE_EVENT':
      return {
        ...state,
        scheduleEvents: state.scheduleEvents.filter((event) => event.id !== action.payload.eventId),
      };

    case 'ADD_WATCHED_KEYWORD': {
      const keyword = action.payload.keyword.trim();
      if (!keyword || state.userSettings.watchedKeywords.includes(keyword)) return state;
      return {
        ...state,
        userSettings: {
          ...state.userSettings,
          watchedKeywords: [...state.userSettings.watchedKeywords, keyword],
        },
      };
    }

    case 'REMOVE_WATCHED_KEYWORD':
      return {
        ...state,
        userSettings: {
          ...state.userSettings,
          watchedKeywords: state.userSettings.watchedKeywords.filter((keyword) => keyword !== action.payload.keyword),
        },
      };

    case 'CREATE_RESUME_VERSION':
      return {
        ...state,
        resumes: [action.payload, ...state.resumes],
      };

    case 'UPDATE_RESUME_VERSION':
      return {
        ...state,
        resumes: state.resumes.map((resume) =>
          resume.id === action.payload.id ? action.payload : resume
        ),
      };

    case 'DELETE_RESUME_VERSION':
      if (state.resumes.length <= 1) return state;
      return {
        ...state,
        resumes: state.resumes.filter((resume) => resume.id !== action.payload.resumeId),
      };

    case 'UPDATE_INTRO_SETTINGS':
      return {
        ...state,
        userSettings: {
          ...state.userSettings,
          introSettings: action.payload,
        },
      };

    case 'SAVE_AI_OUTPUT':
      return {
        ...state,
        aiOutputs: [action.payload, ...state.aiOutputs],
      };

    default:
      return state;
  }
}
