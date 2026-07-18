export type Category =
  | "workplace"
  | "family"
  | "friends"
  | "online"
  | "stranger";

export type TechniqueId =
  | "sixSecondRule"
  | "iMessage"
  | "desc"
  | "factVsInterpretation"
  | "cushionWords"
  | "askQuestion"
  | "timeoutRequest";

export interface Scenario {
  id: string;
  category: Category;
  difficulty: 1 | 2 | 3;
  context: string;
  line: string;
  hint: TechniqueId;
  sampleResponse: string;
}

export interface Technique {
  id: TechniqueId;
  title: string;
  description: string;
  example: string;
}

export type Level = "calm" | "okay" | "reactive";

export interface Hit {
  phrase: string;
  note: string;
}

export interface AnalysisResult {
  score: number;
  level: Level;
  negativeHits: Hit[];
  positiveHits: Hit[];
  advice: string[];
}

export interface Attempt {
  id: string;
  scenarioId: string;
  response: string;
  score: number;
  level: Level;
  createdAt: string;
}
