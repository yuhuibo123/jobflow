import { Application, ApplicationStatus, ApplicationStep, ProcessTemplate } from '../types';

export const columns: { id: ApplicationStatus; label: string }[] = [
  { id: 'interested', label: '想投' },
  { id: 'applied', label: '已投递' },
  { id: 'written_test', label: '测评/笔试' },
  { id: 'interviewing', label: '面试中' },
  { id: 'offer', label: 'Offer' },
  { id: 'rejected', label: '已拒' },
];

export const processTemplates: Record<ProcessTemplate, { label: string; steps: string[] }> = {
  big_tech: {
    label: '大厂流程',
    steps: ['投递', '笔试', 'HR 面', '一面', '二面', 'Offer'],
  },
  consulting: {
    label: '咨询流程',
    steps: ['投递', '简历筛选', 'Case 面', 'Partner 面', 'Offer'],
  },
  state_owned: {
    label: '国企流程',
    steps: ['投递', '资格审查', '笔试', '面试', '体检', 'Offer'],
  },
  custom: {
    label: '简化流程',
    steps: ['投递', '沟通', '面试', 'Offer'],
  },
};

export function inferProcessTemplate(app: Application): ProcessTemplate {
  if (app.processTemplate) return app.processTemplate;
  if (app.company.includes('麦肯锡') || app.company.includes('BCG') || app.company.includes('贝恩')) return 'consulting';
  if (app.company.includes('国') || app.company.includes('银行') || app.company.includes('集团')) return 'state_owned';
  return 'big_tech';
}

export function buildProcessSteps(template: ProcessTemplate, currentStepIndex: number): ApplicationStep[] {
  return processTemplates[template].steps.map((step, index) => ({
    id: `${template}-${index}`,
    label: step,
    status: index < currentStepIndex ? 'done' : index === currentStepIndex ? 'current' : 'upcoming',
  }));
}

export function getApplicationStatusForStep(stepLabel: string): ApplicationStatus {
  if (stepLabel.includes('Offer')) return 'offer';
  if (stepLabel.includes('笔试') || stepLabel.includes('测评')) return 'written_test';
  if (stepLabel.includes('投递')) return 'applied';
  if (
    stepLabel.includes('面') ||
    stepLabel.includes('HR') ||
    stepLabel.includes('Case') ||
    stepLabel.includes('Partner')
  ) {
    return 'interviewing';
  }
  return 'applied';
}

export function getCurrentStepIndex(app: Application, steps: string[]) {
  if (typeof app.currentStepIndex === 'number') return app.currentStepIndex;
  if (app.status === 'offer') return steps.length - 1;
  if (app.status === 'interviewing') {
    const stage = app.interviewStage || app.tags?.find((tag) => tag.includes('面')) || '';
    const matchedIndex = steps.findIndex((step) => stage.includes(step));
    return matchedIndex >= 0 ? matchedIndex : Math.max(1, steps.findIndex((step) => step.includes('一面')));
  }
  if (app.status === 'written_test') {
    const writtenIndex = steps.findIndex((step) => step.includes('笔试') || step.includes('测评'));
    return writtenIndex >= 0 ? writtenIndex : 1;
  }
  if (app.status === 'applied') return 0;
  if (app.status === 'interested') return -1;
  return Math.min(steps.length - 1, 1);
}

export function getProcessSnapshot(app: Application) {
  const template = processTemplates[inferProcessTemplate(app)];
  const currentStepIndex = getCurrentStepIndex(app, template.steps);
  const steps = app.processSteps?.length ? app.processSteps : buildProcessSteps(inferProcessTemplate(app), currentStepIndex);
  const safeIndex = Math.min(Math.max(currentStepIndex, 0), template.steps.length - 1);
  return {
    template,
    steps,
    currentStepIndex,
    currentStep: currentStepIndex < 0 ? '准备投递' : template.steps[safeIndex],
    nextStep: currentStepIndex < 0 ? template.steps[0] : template.steps[safeIndex + 1] || '等待结果',
  };
}
