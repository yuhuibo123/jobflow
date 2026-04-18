import { useCallback, useEffect, useMemo, useState } from 'react';
import { reviews as demoReviews } from '../data/mockData';
import { hasSupabaseConfig, supabase } from '../lib/supabase';
import { ReviewEntry } from '../types';

type DbReview = {
  id: string;
  company: string;
  position: string;
  stage: string | null;
  date: string | null;
  duration: number | null;
  summary: string | null;
  tags: string[] | null;
  score: string | null;
  score_color: string | null;
  completed: number | null;
  is_hot: boolean | null;
  result: string | null;
  star_situation: string | null;
  star_task: string | null;
  star_action: string | null;
  star_result: string | null;
  next_step: string | null;
  mood_state: string | null;
  mood_score: number | null;
};

export type ReviewInput = {
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
};

function toReview(row: DbReview): ReviewEntry {
  return {
    id: row.id,
    isDemo: false,
    company: row.company,
    position: row.position,
    stage: row.stage || '',
    date: row.date || '',
    duration: row.duration || 0,
    summary: row.summary || '',
    tags: row.tags || [],
    score: row.score || '待复盘',
    scoreColor: row.score_color || '#FFD100',
    completed: row.completed || 0,
    isHot: row.is_hot || false,
    result: (row.result || undefined) as ReviewEntry['result'],
    star: {
      situation: row.star_situation || '',
      task: row.star_task || '',
      action: row.star_action || '',
      result: row.star_result || '',
    },
    nextStep: row.next_step || undefined,
    moodState: row.mood_state || undefined,
    moodScore: row.mood_score || undefined,
  };
}

function toDbReview(input: ReviewInput) {
  return {
    company: input.company,
    position: input.position,
    stage: input.stage || '',
    date: input.date || '',
    duration: input.duration || 0,
    summary: input.summary || '',
    tags: input.tags || [],
    score: input.score || '待复盘',
    score_color: input.scoreColor || '#FFD100',
    completed: input.completed || 0,
    is_hot: input.isHot || false,
    result: input.result || null,
    star_situation: input.star?.situation || '',
    star_task: input.star?.task || '',
    star_action: input.star?.action || '',
    star_result: input.star?.result || '',
    next_step: input.nextStep || null,
    mood_state: input.moodState || null,
    mood_score: input.moodScore || null,
  };
}

export function useReviews() {
  const [dbReviews, setDbReviews] = useState<ReviewEntry[]>([]);
  const [loading, setLoading] = useState(hasSupabaseConfig);
  const [error, setError] = useState<string | null>(null);

  const demoItems = useMemo(
    () => demoReviews.map((item) => ({ ...item, isDemo: true })),
    []
  );

  const loadReviews = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: loadError } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: true });

    if (loadError) {
      setError(loadError.message);
      setLoading(false);
      return;
    }

    setDbReviews(((data || []) as DbReview[]).map(toReview));
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  const createReview = useCallback(async (input: ReviewInput) => {
    if (!supabase) {
      setError('Supabase is not configured.');
      return null;
    }

    const { data, error: createError } = await supabase
      .from('reviews')
      .insert(toDbReview(input))
      .select('*')
      .single();

    if (createError) {
      setError(createError.message);
      return null;
    }

    const created = toReview(data as DbReview);
    setDbReviews((items) => [...items, created]);
    return created;
  }, []);

  const updateReview = useCallback(async (item: ReviewEntry, input: ReviewInput) => {
    if (item.isDemo) {
      setError('示例数据用于展示，不能编辑。');
      return null;
    }

    if (!supabase) {
      setError('Supabase is not configured.');
      return null;
    }

    const { data, error: updateError } = await supabase
      .from('reviews')
      .update(toDbReview(input))
      .eq('id', item.id)
      .select('*')
      .single();

    if (updateError) {
      setError(updateError.message);
      return null;
    }

    const updated = toReview(data as DbReview);
    setDbReviews((items) =>
      items.map((current) => (current.id === item.id ? updated : current))
    );
    return updated;
  }, []);

  const deleteReview = useCallback(async (item: ReviewEntry) => {
    if (item.isDemo) {
      setError('示例数据用于展示，不能删除。');
      return false;
    }

    if (!supabase) {
      setError('Supabase is not configured.');
      return false;
    }

    const { error: deleteError } = await supabase
      .from('reviews')
      .delete()
      .eq('id', item.id);

    if (deleteError) {
      setError(deleteError.message);
      return false;
    }

    setDbReviews((items) => items.filter((current) => current.id !== item.id));
    return true;
  }, []);

  return {
    reviews: [...demoItems, ...dbReviews],
    demoReviews: demoItems,
    dbReviews,
    loading,
    error,
    reload: loadReviews,
    createReview,
    updateReview,
    deleteReview,
  };
}
