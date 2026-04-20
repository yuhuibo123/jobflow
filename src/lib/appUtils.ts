const COMPANY_COLOR_PALETTE = ['#1C1917', '#FFD100', '#07C160', '#C0282E', '#006AFF', '#F97316'];

export function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getCompanyColor(company: string) {
  const index = company.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % COMPANY_COLOR_PALETTE.length;
  return COMPANY_COLOR_PALETTE[index];
}
