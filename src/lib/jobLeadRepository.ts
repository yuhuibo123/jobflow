import { IntroSettings, JobLead, UserSettings } from '../types';
import { supabase } from './supabaseClient';

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

type JobLeadRow = {
  id: string;
  user_id: string;
  company: string;
  title: string;
  department: string | null;
  jd: string | null;
  source_url: string | null;
  source_type: JobLead['sourceType'];
  status: JobLead['status'];
  tags: string[] | null;
  match_score: number | null;
  reason: string | null;
  keyword_source: string[] | null;
  note: string | null;
  created_at: string;
};

function toJobLead(row: JobLeadRow): JobLead {
  return {
    id: row.id,
    company: row.company,
    title: row.title,
    department: row.department || undefined,
    jd: row.jd || undefined,
    sourceUrl: row.source_url || undefined,
    sourceType: row.source_type,
    status: row.status,
    tags: row.tags || [],
    matchScore: row.match_score || undefined,
    reason: row.reason || undefined,
    keywordSource: row.keyword_source || [],
    note: row.note || undefined,
    createdAt: row.created_at,
  };
}

function toJobLeadInsert(job: JobLead, userId: string) {
  return {
    id: job.id,
    user_id: userId,
    company: job.company,
    title: job.title,
    department: job.department || null,
    jd: job.jd || null,
    source_url: job.sourceUrl || null,
    source_type: job.sourceType,
    status: job.status,
    tags: job.tags || [],
    match_score: job.matchScore || null,
    reason: job.reason || null,
    keyword_source: job.keywordSource || [],
    note: job.note || null,
    created_at: job.createdAt,
  };
}

async function getAuthUser() {
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;

  return data.user;
}

export async function getSupabaseUserId() {
  const user = await getAuthUser();
  return user?.id || DEMO_USER_ID;
}

export async function ensureSupabaseProfile() {
  if (!supabase) return null;

  const user = await getAuthUser();
  const userId = user?.id || DEMO_USER_ID;
  const displayName = user?.user_metadata?.display_name || user?.email || 'JobFlow Demo 用户';

  await supabase.from('profiles').upsert({
    id: userId,
    display_name: displayName,
    avatar_url: user?.user_metadata?.avatar_url || null,
  });

  await supabase.from('user_settings').upsert({
    user_id: userId,
  }, {
    onConflict: 'user_id',
  });

  return userId;
}

export async function listJobLeads() {
  if (!supabase) return null;

  const userId = await ensureSupabaseProfile();
  if (!userId) return null;

  const { data, error } = await supabase
    .from('job_leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((row) => toJobLead(row as JobLeadRow));
}

export async function createJobLead(job: JobLead) {
  if (!supabase) return null;

  const userId = await ensureSupabaseProfile();
  if (!userId) return null;

  const { data, error } = await supabase
    .from('job_leads')
    .insert(toJobLeadInsert(job, userId))
    .select('*')
    .single();

  if (error) throw error;

  return toJobLead(data as JobLeadRow);
}

export async function updateJobLeadStatus(jobId: string, status: JobLead['status']) {
  if (!supabase) return null;

  const userId = await getSupabaseUserId();
  if (!userId) return null;

  const { error } = await supabase
    .from('job_leads')
    .update({ status })
    .eq('id', jobId);

  if (error) throw error;
}

export async function updateWatchedKeywords(keywords: string[]) {
  if (!supabase) return null;

  const userId = await getSupabaseUserId();
  if (!userId) return null;

  const { error } = await supabase
    .from('user_settings')
    .update({ watched_keywords: keywords })
    .eq('user_id', userId);

  if (error) throw error;
}

export async function updateIntroSettings(settings: IntroSettings) {
  if (!supabase) return null;

  const userId = await getSupabaseUserId();
  if (!userId) return null;

  const { error } = await supabase
    .from('user_settings')
    .update({
      intro_style: settings.style,
      intro_length: settings.length,
      intro_language: settings.language,
    })
    .eq('user_id', userId);

  if (error) throw error;
}

export async function loadUserSettings(): Promise<Partial<UserSettings> | null> {
  if (!supabase) return null;

  const userId = await ensureSupabaseProfile();
  if (!userId) return null;

  const { data, error } = await supabase
    .from('user_settings')
    .select('intro_style, intro_length, intro_language, watched_keywords')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  if (!data) return null;

  return {
    introSettings: {
      style: data.intro_style as IntroSettings['style'],
      length: data.intro_length as IntroSettings['length'],
      language: data.intro_language as IntroSettings['language'],
    },
    watchedKeywords: data.watched_keywords ?? [],
  };
}
