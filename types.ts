
export interface Competitor {
  name: string;
  url: string;
  location: string;
  pricing: string;
  advantages: string[];
  differentiator: string;
}

export interface BenchmarkResult {
  summary: string;
  analysis: string;
  competitors: Competitor[];
  userDifferentiator: string;
  suggestions: string[];
  communicationStrategy: string;
  targetAudience: string;
  sources: {
    title: string;
    url: string;
  }[];
}

export interface FileData {
  name: string;
  base64: string;
  type: string;
}
