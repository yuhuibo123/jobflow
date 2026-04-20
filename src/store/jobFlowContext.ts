import { createContext, Dispatch } from 'react';
import {
  AIOutput,
  Application,
  ApplicationInput,
  IntroSettings,
  JobFlowState,
  JobLead,
  ProcessTemplate,
  ResumeVersion,
  ResumeVersionInput,
  ReviewEntry,
  ReviewInput,
  ScheduleEvent,
  ScheduleEventInput,
} from '../types';
import { JobFlowAction } from './jobFlowActions';

export type JobFlowContextValue = JobFlowState & {
  loading: boolean;
  error: string | null;
  dispatch: Dispatch<JobFlowAction>;
  saveJobLead: (job: Omit<JobLead, 'id' | 'createdAt'>) => Promise<JobLead>;
  markJobPromising: (jobId: string) => Promise<void>;
  ignoreJobLead: (jobId: string) => Promise<void>;
  addWatchedKeyword: (keyword: string) => void;
  removeWatchedKeyword: (keyword: string) => void;
  createApplication: (input: ApplicationInput) => Promise<Application>;
  deleteApplication: (application: Application) => Promise<boolean>;
  promoteJobToInterested: (jobId: string) => Application | null;
  applyJobLead: (jobId: string, processTemplate?: ProcessTemplate) => Application | null;
  advanceApplicationStep: (applicationId: string, currentStepIndex: number) => void;
  scheduleInterviewForApplication: (applicationId: string) => void;
  markApplicationOffer: (applicationId: string) => void;
  markApplicationRejected: (applicationId: string) => void;
  createResumeVersion: (input: ResumeVersionInput) => ResumeVersion;
  updateResumeVersion: (resumeId: string, input: ResumeVersionInput) => ResumeVersion | null;
  deleteResumeVersion: (resumeId: string) => boolean;
  updateIntroSettings: (settings: IntroSettings) => void;
  saveAIOutput: (output: Omit<AIOutput, 'id' | 'createdAt'>) => AIOutput;
  createReview: (input: ReviewInput) => Promise<ReviewEntry>;
  updateReview: (review: ReviewEntry, input: ReviewInput) => Promise<ReviewEntry>;
  deleteReview: (review: ReviewEntry) => Promise<boolean>;
  createScheduleEvent: (input: ScheduleEventInput) => Promise<ScheduleEvent>;
  deleteScheduleEvent: (event: ScheduleEvent) => Promise<boolean>;
};

export const JobFlowContext = createContext<JobFlowContextValue | null>(null);
