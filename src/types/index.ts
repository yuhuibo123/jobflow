export type TabType = 'dashboard' | 'review' | 'insights' | 'schedule';

export type ApplicationStatus = 'interested' | 'applied' | 'written_test' | 'interviewing' | 'offer' | 'rejected';
export type ProcessTemplate = 'big_tech' | 'consulting' | 'state_owned' | 'custom';

export type ApplicationStep = {
  id: string;
  label: string;
  status: 'done' | 'current' | 'upcoming';
};

export interface Application {
  id: string;
  isDemo?: boolean;
  company: string;
  companyInitial: string;
  companyColor: string;
  position: string;
  department: string;
  status: ApplicationStatus;
  location: string;
  salary: string;
  headcount: number;
  daysAgo: number;
  note?: string;
  tags?: string[];
  urgency?: 'hot' | 'normal' | 'cold';
  todayAction?: string;
  interviewTime?: string;
  interviewStage?: string;
  offerStatus?: string;
  activityDot?: 'today' | 'week' | 'handled';
  sourceJobId?: string;
  applySource?: 'manual' | 'platform' | 'simulated_auto';
  sourceUrl?: string;
  processTemplate?: ProcessTemplate;
  processSteps?: ApplicationStep[];
  currentStepIndex?: number;
  timeline?: ApplicationTimelineEvent[];
}

export type ApplicationInput = {
  company: string;
  position: string;
  status: ApplicationStatus;
  companyInitial?: string;
  companyColor?: string;
  department?: string;
  location?: string;
  salary?: string;
  headcount?: number;
  daysAgo?: number;
  note?: string;
  tags?: string[];
  urgency?: Application['urgency'];
  todayAction?: string;
  interviewTime?: string;
  interviewStage?: string;
  offerStatus?: string;
  activityDot?: Application['activityDot'];
  sourceJobId?: string;
  applySource?: Application['applySource'];
  sourceUrl?: string;
  processTemplate?: Application['processTemplate'];
};

export interface ReviewEntry {
  id: string;
  isDemo?: boolean;
  applicationId?: string;
  interviewRound?: string;
  status?: 'pending' | 'completed';
  entryType?: 'audio' | 'note' | 'manual';
  company: string;
  position: string;
  stage: string;
  date: string;
  duration: number;
  summary: string;
  tags: string[];
  score: string;
  scoreColor: string;
  completed: number;
  isHot?: boolean;
  result?: 'pass' | 'fail' | 'pending';
  star?: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
  nextStep?: string;
  moodState?: string;
  moodScore?: number;
  communicationScore?: number;
  structureScore?: number;
  businessScore?: number;
  dataScore?: number;
  resilienceScore?: number;
  scores?: {
    communication: number;
    structure: number;
    business: number;
    data: number;
    ownership: number;
    pressure: number;
  };
}

export type ReviewInput = {
  applicationId?: string;
  interviewRound?: string;
  status?: ReviewEntry['status'];
  entryType?: ReviewEntry['entryType'];
  company: string;
  position: string;
  stage?: string;
  date?: string;
  duration?: number;
  summary?: string;
  tags?: string[];
  score?: string;
  scoreColor?: string;
  completed?: number;
  isHot?: boolean;
  result?: ReviewEntry['result'];
  star?: ReviewEntry['star'];
  nextStep?: string;
  moodState?: string;
  moodScore?: number;
  communicationScore?: number;
  structureScore?: number;
  businessScore?: number;
  dataScore?: number;
  resilienceScore?: number;
  scores?: ReviewEntry['scores'];
};

export interface ScheduleEvent {
  id: string;
  isDemo?: boolean;
  applicationId?: string;
  date: number;
  fullDate?: string;
  weekday: string;
  time?: string;
  title: string;
  company?: string;
  status: 'done' | 'today' | 'upcoming' | 'planned' | 'rest' | 'cancelled';
  type: 'interview' | 'call' | 'test' | 'review' | 'task' | 'rest' | 'deadline';
  isToday?: boolean;
}

export type ScheduleEventInput = {
  applicationId?: string;
  date: number;
  fullDate?: string;
  weekday?: string;
  time?: string;
  title: string;
  company?: string;
  status: ScheduleEvent['status'];
  type: ScheduleEvent['type'];
  isToday?: boolean;
};

export type JobLeadStatus = 'collected' | 'promising' | 'interested' | 'applied' | 'ignored';
export type JobLeadSourceType = 'manual' | 'jd_paste' | 'url_parse' | 'ai_recommendation';

export interface JobLead {
  id: string;
  company: string;
  title: string;
  department?: string;
  jd?: string;
  sourceUrl?: string;
  sourceType: JobLeadSourceType;
  tags: string[];
  status: JobLeadStatus;
  matchScore?: number;
  reason?: string;
  keywordSource?: string[];
  note?: string;
  createdAt: string;
}

export interface ResumeVersion {
  id: string;
  name: string;
  targetRole: string;
  summary: string;
  highlights: string[];
  content: string;
  updatedAt: string;
}

export type ResumeVersionInput = {
  name: string;
  targetRole: string;
  summary: string;
  highlights: string[];
  content: string;
};

export interface AIOutput {
  id: string;
  type: 'tailored_resume' | 'self_intro' | 'job_parse' | 'interview_prep' | 'structured_review' | 'weekly_summary' | 'next_step_advice';
  title: string;
  sourceId?: string;
  content: string;
  createdAt: string;
}

export interface InterviewPrepPack {
  id: string;
  applicationId: string;
  scheduleEventId?: string;
  company: string;
  position: string;
  round: string;
  companySummary: string;
  commonQuestions: string[];
  prepPoints: string[];
  checklist?: string[];
  active: boolean;
}

export interface OfferComparison {
  id: string;
  applicationId: string;
  company: string;
  salary: string;
  location: string;
  growth: string;
  notes?: string;
}

export type IntroSettings = {
  style: 'formal' | 'casual' | 'data_driven';
  length: 'short' | 'medium' | 'long';
  language: 'zh' | 'en';
};

export interface UserSettings {
  introSettings: IntroSettings;
  watchedKeywords: string[];
  clipboardWatchEnabled: boolean;
}

export interface ApplicationTimelineEvent {
  id: string;
  applicationId: string;
  type: 'created' | 'applied' | 'interview_scheduled' | 'stage_changed' | 'offer' | 'rejected';
  title: string;
  occurredAt: string;
}

export interface ReviewMaterial {
  id: string;
  reviewId: string;
  type: 'audio' | 'notes' | 'manual';
  title: string;
  content?: string;
  createdAt: string;
}

export interface ReviewQuestion {
  id: string;
  reviewId: string;
  question: string;
  situation: string;
  task: string;
  action: string;
  result: string;
}

export interface JobFlowState {
  applications: Application[];
  reviews: ReviewEntry[];
  scheduleEvents: ScheduleEvent[];
  jobs: JobLead[];
  resumes: ResumeVersion[];
  aiOutputs: AIOutput[];
  interviewPrepPacks: InterviewPrepPack[];
  offerComparisons: OfferComparison[];
  userSettings: UserSettings;
  applicationTimeline: ApplicationTimelineEvent[];
  reviewMaterials: ReviewMaterial[];
  reviewQuestions: ReviewQuestion[];
}
