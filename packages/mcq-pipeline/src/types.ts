export type CareerStage = "pg_prep" | "preclinical" | "resident" | "doctor";
export type Difficulty = 1 | 2 | 3 | 4 | 5;
export type VerificationStatus = "unverified" | "verified" | "contradicted" | "rejected";
export type FactCheckStatus = "pending" | "approved" | "rejected";
export type AgentRole = "finder" | "verifier" | "writer" | "factchecker" | "organizer";

export interface SourceReference {
  title: string;
  url: string;
  type: "pubmed" | "who" | "statpearls" | "nih" | "cdc" | "icmr" | "cochrane" | "medlineplus" | "fda" | "guideline";
  accessedDate: string;
  pmid?: string;
  doi?: string;
  tier: 1 | 2 | 3;
}

export interface CandidateFact {
  id: string;
  fact: string;
  specialty: string;
  topic: string;
  careerStage: CareerStage;
  sources: SourceReference[];
  verificationStatus: VerificationStatus;
  foundBy: AgentRole;
  verifiedBy?: AgentRole;
  verifiedAt?: string;
  rejectionReason?: string;
}

export interface MCQOption {
  key: string;
  text: string;
}

export interface GeneratedMCQ {
  id: string;
  question: string;
  options: MCQOption[];
  correctOption: string;
  explanation: string;
  difficulty: Difficulty;
  subject: string;
  topicTags: string[];
  careerStage: CareerStage;
  sourceFacts: string[];
  sources: SourceReference[];
  verificationStatus: FactCheckStatus;
  factCheckNotes?: string;
  generatedBy: AgentRole;
  factCheckedBy?: AgentRole;
  factCheckedAt?: string;
  rejectionReason?: string;
  cognitiveLevel: "recall" | "application" | "clinical_reasoning";
}

export interface PipelineConfig {
  specialty: string;
  careerStage: CareerStage;
  targetCount: number;
  difficultySpread: { easy: number; moderate: number; hard: number };
  useLiveLLM: boolean;
  verbose: boolean;
}

export interface PipelineReport {
  pipelineStartTime: string;
  pipelineEndTime: string;
  config: PipelineConfig;
  factsFound: number;
  factsVerified: number;
  factsRejected: number;
  mcqsGenerated: number;
  mcqsApproved: number;
  mcqsRejected: number;
  mcqsWritten: number;
  coverage: Record<string, number>;
  sampleMCQs: GeneratedMCQ[];
  rejectionReasons: string[];
  errors: string[];
}
