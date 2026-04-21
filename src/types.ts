export interface JiraStory {
  key: string;
  summary: string;
  issueType: string;
  description: string;
}

export interface EstimationRecord {
  id: string;
  storyKey: string;
  summary: string;
  result: string;
  createdAt: number;
}
