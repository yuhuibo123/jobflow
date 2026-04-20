export function ActivityDot({ type }: { type?: 'today' | 'week' | 'handled' }) {
  if (!type) return null;
  const colors = {
    today: '#F97316',
    week: '#22C55E',
    handled: '#9CA3AF',
  };
  return (
    <span
      className="w-2 h-2 rounded-full inline-block flex-shrink-0"
      style={{ backgroundColor: colors[type] }}
    />
  );
}
