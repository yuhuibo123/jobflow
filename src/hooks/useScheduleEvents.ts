import { useCallback, useEffect, useMemo, useState } from 'react';
import { scheduleEvents as demoScheduleEvents } from '../data/mockData';
import { hasSupabaseConfig, supabase } from '../lib/supabase';
import { ScheduleEvent } from '../types';

type DbScheduleEvent = {
  id: string;
  date: number;
  weekday: string | null;
  time: string | null;
  title: string;
  company: string | null;
  status: string;
  type: string;
  is_today: boolean | null;
};

export type ScheduleEventInput = {
  date: number;
  weekday?: string;
  time?: string;
  title: string;
  company?: string;
  status: ScheduleEvent['status'];
  type: ScheduleEvent['type'];
  isToday?: boolean;
};

function toScheduleEvent(row: DbScheduleEvent): ScheduleEvent {
  return {
    id: row.id,
    isDemo: false,
    date: row.date,
    weekday: row.weekday || '',
    time: row.time || undefined,
    title: row.title,
    company: row.company || undefined,
    status: row.status as ScheduleEvent['status'],
    type: row.type as ScheduleEvent['type'],
    isToday: row.is_today || false,
  };
}

function toDbScheduleEvent(input: ScheduleEventInput) {
  return {
    date: input.date,
    weekday: input.weekday || '',
    time: input.time || null,
    title: input.title,
    company: input.company || null,
    status: input.status,
    type: input.type,
    is_today: input.isToday || false,
  };
}

export function useScheduleEvents() {
  const [dbScheduleEvents, setDbScheduleEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(hasSupabaseConfig);
  const [error, setError] = useState<string | null>(null);

  const demoItems = useMemo(
    () => demoScheduleEvents.map((item) => ({ ...item, isDemo: true })),
    []
  );

  const loadScheduleEvents = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: loadError } = await supabase
      .from('schedule_events')
      .select('*')
      .order('created_at', { ascending: true });

    if (loadError) {
      setError(loadError.message);
      setLoading(false);
      return;
    }

    setDbScheduleEvents(((data || []) as DbScheduleEvent[]).map(toScheduleEvent));
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadScheduleEvents();
  }, [loadScheduleEvents]);

  const createScheduleEvent = useCallback(async (input: ScheduleEventInput) => {
    if (!supabase) {
      setError('Supabase is not configured.');
      return null;
    }

    const { data, error: createError } = await supabase
      .from('schedule_events')
      .insert(toDbScheduleEvent(input))
      .select('*')
      .single();

    if (createError) {
      setError(createError.message);
      return null;
    }

    const created = toScheduleEvent(data as DbScheduleEvent);
    setDbScheduleEvents((items) => [...items, created]);
    return created;
  }, []);

  const deleteScheduleEvent = useCallback(async (item: ScheduleEvent) => {
    if (item.isDemo) {
      setError('示例数据用于展示，不能删除。');
      return false;
    }

    if (!supabase) {
      setError('Supabase is not configured.');
      return false;
    }

    const { error: deleteError } = await supabase
      .from('schedule_events')
      .delete()
      .eq('id', item.id);

    if (deleteError) {
      setError(deleteError.message);
      return false;
    }

    setDbScheduleEvents((items) => items.filter((current) => current.id !== item.id));
    return true;
  }, []);

  return {
    scheduleEvents: [...demoItems, ...dbScheduleEvents],
    demoScheduleEvents: demoItems,
    dbScheduleEvents,
    loading,
    error,
    reload: loadScheduleEvents,
    createScheduleEvent,
    deleteScheduleEvent,
  };
}
