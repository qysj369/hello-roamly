/** 环节4：首页搜索传给大模型的入参（预算/主题缺则为 null） */
export type SearchPlanRequest = {
  startCity: string;
  targetCity: string;
  days: number;
  peopleType: string;
  budget: number | null;
  theme: string | null;
};

export type SearchPlanBudgetItem = {
  item: string;
  perPerson: number;
  tip: string;
};

export type SearchPlanTraffic = {
  desc: string;
};

export type SearchPlanSpot = {
  name: string;
  intro: string;
};

export type SearchPlanFood = {
  shop: string;
  dish: string;
  perCost: number;
};

export type SearchPlanDay = {
  day: number;
  title: string;
  traffic: SearchPlanTraffic[];
  spots: SearchPlanSpot[];
  foods: SearchPlanFood[];
  tips: string;
  hotelArea: string;
};

export type SearchStructuredPlan = {
  baseInfo: SearchPlanRequest;
  budgetList: SearchPlanBudgetItem[];
  dayList: SearchPlanDay[];
  globalTips: string[];
};

export type SearchPlanIncrementFocus = 'spots' | 'foods' | 'traffic';

export type SearchPlanIncrementRequest = {
  increment: SearchPlanIncrementFocus;
  plan: SearchStructuredPlan;
};
