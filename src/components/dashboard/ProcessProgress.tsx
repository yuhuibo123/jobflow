import { Application } from '../../types';
import { getProcessSnapshot } from '../../lib/processHelpers';

export function ProcessProgress({ app }: { app: Application }) {
  const process = getProcessSnapshot(app);

  return (
    <div className="mt-3 border-t border-[#F5F0EA] pt-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[#9C8B78] text-[10px]">{process.template.label}</span>
        <span className="text-[#6B5E4E] text-[10px]">
          {process.currentStep}
        </span>
      </div>
      <div className="flex items-center">
        {process.steps.map((step, index) => {
          const isDone = step.status === 'done' || step.status === 'current';
          const isCurrent = step.status === 'current';
          return (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isDone ? 'bg-[#1C1917]' : 'bg-[#E8E2D9]'
                  } ${isCurrent ? 'ring-2 ring-[#FFD100] ring-offset-1 ring-offset-white' : ''}`}
                />
                <span className={`mt-1 text-[9px] leading-none whitespace-nowrap ${isDone ? 'text-[#1C1917]' : 'text-[#B8AFA5]'}`}>
                  {step.label}
                </span>
              </div>
              {index < process.steps.length - 1 && (
                <span className={`h-px flex-1 mx-1 mb-4 ${step.status === 'done' ? 'bg-[#1C1917]' : 'bg-[#E8E2D9]'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
