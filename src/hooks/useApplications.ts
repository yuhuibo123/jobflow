import { useCallback, useEffect, useMemo, useState } from 'react';
import { applications as demoApplications } from '../data/mockData';
import { hasSupabaseConfig, supabase } from '../lib/supabase';
import { Application, ApplicationStatus } from '../types';

type DbApplication = {
  id: string;
  company: string;
  company_initial: string | null;
  company_color: string | null;
  position: string;
  department: string | null;
  status: string;
  location: string | null;
  salary: string | null;
  headcount: number | null;
  days_ago: number | null;
  note: string | null;
  tags: string[] | null;
  urgency: string | null;
  today_action: string | null;
  interview_time: string | null;
  interview_stage: string | null;
  offer_status: string | null;
  activity_dot: string | null;
};

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
};

function toApplication(row: DbApplication): Application {
  return {
    id: row.id,
    isDemo: false,
    company: row.company,
    companyInitial: row.company_initial || row.company.slice(0, 1),
    companyColor: row.company_color || '#1C1917',
    position: row.position,
    department: row.department || '',
    status: row.status as ApplicationStatus,
    location: row.location || '',
    salary: row.salary || '',
    headcount: row.headcount || 1,
    daysAgo: row.days_ago || 0,
    note: row.note || undefined,
    tags: row.tags || [],
    urgency: (row.urgency || undefined) as Application['urgency'],
    todayAction: row.today_action || undefined,
    interviewTime: row.interview_time || undefined,
    interviewStage: row.interview_stage || undefined,
    offerStatus: row.offer_status || undefined,
    activityDot: (row.activity_dot || undefined) as Application['activityDot'],
  };
}

function toDbApplication(input: ApplicationInput) {
  return {
    company: input.company,
    company_initial: input.companyInitial || input.company.slice(0, 1),
    company_color: input.companyColor || '#1C1917',
    position: input.position,
    department: input.department || '',
    status: input.status,
    location: input.location || '',
    salary: input.salary || '',
    headcount: input.headcount || 1,
    days_ago: input.daysAgo || 0,
    note: input.note || null,
    tags: input.tags || [],
    urgency: input.urgency || null,
    today_action: input.todayAction || null,
    interview_time: input.interviewTime || null,
    interview_stage: input.interviewStage || null,
    offer_status: input.offerStatus || null,
    activity_dot: input.activityDot || null,
  };
}

export function useApplications() {
  const [dbApplications, setDbApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(hasSupabaseConfig);
  const [error, setError] = useState<string | null>(null);

  const demoItems = useMemo(
    () => demoApplications.map((item) => ({ ...item, isDemo: true })),
    []
  );

  const loadApplications = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: loadError } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: true });

    if (loadError) {
      setError(loadError.message);
      setLoading(false);
      return;
    }

    setDbApplications(((data || []) as DbApplication[]).map(toApplication));
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadApplications();
  }, [loadApplications]);

  const createApplication = useCallback(async (input: ApplicationInput) => {
    if (!supabase) {
      setError('Supabase is not configured.');
      return null;
    }

    const { data, error: createError } = await supabase
      .from('applications')
      .insert(toDbApplication(input))
      .select('*')
      .single();

    if (createError) {
      setError(createError.message);
      return null;
    }

    const created = toApplication(data as DbApplication);
    setDbApplications((items) => [...items, created]);
    return created;
  }, []);

  const deleteApplication = useCallback(async (item: Application) => {
    if (item.isDemo) {
      setError('示例数据用于展示，不能删除。');
      return false;
    }

    if (!supabase) {
      setError('Supabase is not configured.');
      return false;
    }

    const { error: deleteError } = await supabase
      .from('applications')
      .delete()
      .eq('id', item.id);

    if (deleteError) {
      setError(deleteError.message);
      return false;
    }

    setDbApplications((items) => items.filter((current) => current.id !== item.id));
    return true;
  }, []);

  return {
    applications: [...demoItems, ...dbApplications],
    demoApplications: demoItems,
    dbApplications,
    loading,
    error,
    reload: loadApplications,
    createApplication,
    deleteApplication,
  };
}
