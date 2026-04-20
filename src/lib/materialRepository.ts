import { AIOutput, ResumeVersion } from '../types';
import { ensureSupabaseProfile } from './jobLeadRepository';
import { supabase } from './supabaseClient';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type ResumeRow = {
  id: string;
  name: string;
  target_role: string;
  summary: string;
  highlights: string[] | null;
  content: string;
  updated_at: string;
};

type AIOutputRow = {
  id: string;
  type: AIOutput['type'];
  title: string;
  source_id: string | null;
  content: string;
  created_at: string;
};

function isUuid(value: string) {
  return uuidPattern.test(value);
}

function nullableUuid(value?: string) {
  return value && isUuid(value) ? value : null;
}

function toResume(row: ResumeRow): ResumeVersion {
  return {
    id: row.id,
    name: row.name,
    targetRole: row.target_role,
    summary: row.summary,
    highlights: row.highlights || [],
    content: row.content,
    updatedAt: row.updated_at,
  };
}

function toAIOutput(row: AIOutputRow): AIOutput {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    sourceId: row.source_id || undefined,
    content: row.content,
    createdAt: row.created_at,
  };
}

function toResumeUpsert(resume: ResumeVersion, userId: string) {
  return {
    id: resume.id,
    user_id: userId,
    name: resume.name,
    target_role: resume.targetRole,
    summary: resume.summary,
    highlights: resume.highlights,
    content: resume.content,
    updated_at: resume.updatedAt,
  };
}

function toAIOutputInsert(output: AIOutput, userId: string) {
  return {
    id: output.id,
    user_id: userId,
    type: output.type,
    title: output.title,
    source_id: nullableUuid(output.sourceId),
    content: output.content,
    created_at: output.createdAt,
  };
}

export async function listMaterials() {
  if (!supabase) return null;

  const userId = await ensureSupabaseProfile();
  if (!userId) return null;

  const [resumeResult, aiOutputResult] = await Promise.all([
    supabase.from('resume_versions').select('*').eq('user_id', userId).order('updated_at', { ascending: false }),
    supabase.from('ai_outputs').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
  ]);

  if (resumeResult.error) throw resumeResult.error;
  if (aiOutputResult.error) throw aiOutputResult.error;

  return {
    resumes: (resumeResult.data || []).map((row) => toResume(row as ResumeRow)),
    aiOutputs: (aiOutputResult.data || []).map((row) => toAIOutput(row as AIOutputRow)),
  };
}

export async function saveResumeVersionSnapshot(resume: ResumeVersion) {
  if (!supabase) return null;
  if (!isUuid(resume.id)) return null;

  const userId = await ensureSupabaseProfile();
  if (!userId) return null;

  const { error } = await supabase
    .from('resume_versions')
    .upsert(toResumeUpsert(resume, userId));

  if (error) throw error;

  return resume;
}

export async function deleteResumeVersionSnapshot(resumeId: string) {
  if (!supabase) return null;
  if (!isUuid(resumeId)) return null;

  const userId = await ensureSupabaseProfile();
  if (!userId) return null;

  const { error } = await supabase
    .from('resume_versions')
    .delete()
    .eq('id', resumeId)
    .eq('user_id', userId);

  if (error) throw error;

  return true;
}

export async function saveAIOutputSnapshot(output: AIOutput) {
  if (!supabase) return null;
  if (!isUuid(output.id)) return null;

  const userId = await ensureSupabaseProfile();
  if (!userId) return null;

  const { error } = await supabase
    .from('ai_outputs')
    .insert(toAIOutputInsert(output, userId));

  if (error) throw error;

  return output;
}
