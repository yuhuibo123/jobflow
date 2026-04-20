import {
  AIOutput,
  Application,
  ApplicationTimelineEvent,
  ApplicationStatus,
  InterviewPrepPack,
  IntroSettings,
  JobLead,
  ResumeVersion,
  ReviewEntry,
  ReviewMaterial,
  ReviewQuestion,
  ScheduleEvent,
  UserSettings,
} from '../types';

export type JobFlowAction =
  | { type: 'SET_JOB_LEADS'; payload: JobLead[] }
  | { type: 'SET_APPLICATIONS'; payload: { applications: Application[]; timeline: ApplicationTimelineEvent[] } }
  | { type: 'SET_INTERVIEW_CHAIN_DATA'; payload: { scheduleEvents: ScheduleEvent[]; reviews: ReviewEntry[]; interviewPrepPacks: InterviewPrepPack[] } }
  | { type: 'SET_MATERIALS'; payload: { resumes: ResumeVersion[]; aiOutputs: AIOutput[] } }
  | { type: 'SET_USER_SETTINGS'; payload: Partial<UserSettings> }
  | { type: 'SAVE_JOB_LEAD'; payload: JobLead }
  | { type: 'MARK_JOB_PROMISING'; payload: { jobId: string } }
  | { type: 'IGNORE_JOB_LEAD'; payload: { jobId: string } }
  | { type: 'PROMOTE_JOB_TO_INTERESTED'; payload: { jobId: string; application: Application } }
  | { type: 'APPLY_JOB_LEAD'; payload: { jobId: string; application: Application; existingApplicationId?: string } }
  | { type: 'ADD_FRONTEND_APPLICATION'; payload: Application }
  | { type: 'UPSERT_APPLICATION_META'; payload: Pick<Application, 'id' | 'sourceUrl' | 'processTemplate' | 'processSteps' | 'currentStepIndex'> }
  | { type: 'REMOVE_FRONTEND_APPLICATION'; payload: { applicationId: string } }
  | { type: 'ADVANCE_APPLICATION_STAGE'; payload: { applicationId: string; status: ApplicationStatus; currentStepIndex?: number; processSteps?: Application['processSteps']; note?: string } }
  | { type: 'SCHEDULE_APPLICATION_INTERVIEW'; payload: { application: Application; event: ScheduleEvent; review: ReviewEntry; prepPack: import('../types').InterviewPrepPack } }
  | { type: 'SCHEDULE_INTERVIEW'; payload: { applicationId: string; event: ScheduleEvent; review?: ReviewEntry } }
  | { type: 'CREATE_PENDING_REVIEW'; payload: ReviewEntry }
  | { type: 'COMPLETE_REVIEW'; payload: { reviewId: string; review: Partial<ReviewEntry>; questions?: ReviewQuestion[]; materials?: ReviewMaterial[] } }
  | { type: 'DELETE_REVIEW'; payload: { reviewId: string } }
  | { type: 'DELETE_SCHEDULE_EVENT'; payload: { eventId: string } }
  | { type: 'ADD_WATCHED_KEYWORD'; payload: { keyword: string } }
  | { type: 'REMOVE_WATCHED_KEYWORD'; payload: { keyword: string } }
  | { type: 'CREATE_RESUME_VERSION'; payload: ResumeVersion }
  | { type: 'UPDATE_RESUME_VERSION'; payload: ResumeVersion }
  | { type: 'DELETE_RESUME_VERSION'; payload: { resumeId: string } }
  | { type: 'UPDATE_INTRO_SETTINGS'; payload: IntroSettings }
  | { type: 'SAVE_AI_OUTPUT'; payload: AIOutput };
