export type TabType = 'dashboard' | 'review' | 'insights' | 'schedule';

export type ApplicationStatus = 'interested' | 'applied' | 'written_test' | 'interviewing' | 'offer' | 'rejected';

export interface Application {
  id: string;
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
}

export interface ReviewEntry {
  id: string;
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
}

export interface ScheduleEvent {
  id: string;
  date: number;
  weekday: string;
  time?: string;
  title: string;
  company?: string;
  status: 'done' | 'today' | 'upcoming' | 'planned' | 'rest' | 'cancelled';
  type: 'interview' | 'call' | 'test' | 'review' | 'task' | 'rest' | 'deadline';
  isToday?: boolean;
}
