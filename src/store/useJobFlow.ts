import { useContext } from 'react';
import { JobFlowContext } from './jobFlowContext';

export function useJobFlow() {
  const context = useContext(JobFlowContext);
  if (!context) {
    throw new Error('useJobFlow must be used inside JobFlowProvider');
  }
  return context;
}
