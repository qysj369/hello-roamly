export type PlanPoiCheck = {
  name: string;
  verified: boolean;
  label: string | null;
};

export type PlanAdvisorToolsReport = {
  budget: {
    introTotal: number | null;
    itinerarySum: number | null;
    delta: number | null;
    withinTolerance: boolean;
    issues: string[];
    footnote: string | null;
  };
  weather: {
    available: boolean;
    city: string;
    summary: string;
  };
  poiChecks: PlanPoiCheck[];
  footnotes: string[];
  combinedFootnote: string | null;
};

export type PlanToolsRequest = {
  content: string;
  locationName: string;
};

export type PlanToolsResponse = {
  report: PlanAdvisorToolsReport;
};
