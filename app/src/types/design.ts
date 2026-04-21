// Standard topic (plain text content)
export interface StandardTopicContent {
  content: string; // empty string if not found in PDF
}

// Functional Requirements: only in-scope items
export interface FunctionalRequirementsContent {
  inScope: string[]; // list of in-scope requirement strings
}

// Non-Functional Requirements: scale/performance constraints
export interface NonFunctionalRequirementsContent {
  items: string[]; // list of non-functional requirement strings (scale, latency, etc.)
}

// Core Entities: named entities with their field schemas
export interface CoreEntity {
  name: string;   // e.g. "File", "VideoChunk"
  schema: string; // the raw { field: type, ... } block
}

export interface CoreEntitiesContent {
  entities: CoreEntity[]; // empty array if not found
}

// API Design: individual endpoints
export interface ApiEndpoint {
  method: string;      // e.g. "POST", "GET", "PUT", "DELETE"
  path: string;        // e.g. "/v1/files/upload/init"
  description: string; // e.g. "Initiate chunked upload"
  request: string;     // request body/params text
  response: string;    // response text
}

export interface ApiDesignContent {
  endpoints: ApiEndpoint[]; // empty array if not found
}

// HLD: each sub-topic has 2-3 progressively better approaches
export interface Approach {
  title: string;           // display title with "[RECOMMENDED]" stripped
  description: string;     // full description paragraph(s)
  tradeoff: string;        // the "Trade-off:" line text
  isRecommended: boolean;  // true when original title contained "[RECOMMENDED]"
}

export interface SystemArchitectureTable {
  components: { name: string; responsibility: string }[];
}

export interface HLDQuestion {
  subTopic: string;        // e.g. "File Upload Strategy"
  approaches: Approach[];  // ordered bad → better → best (2-3 entries)
}

export interface HLDTopicContent {
  questions: HLDQuestion[];                    // one per sub-topic; empty array if not found
  systemArchitecture: SystemArchitectureTable; // the component/responsibility table
}

// Deep Dive: each numbered sub-section is a single content block
export interface DeepDiveQuestion {
  title: string;   // e.g. "1. Chunking Strategy"
  content: string; // full explanation text
}

export interface DeepDiveTopicContent {
  questions: DeepDiveQuestion[]; // empty array if not found
}

// Design topic: architecture diagram + key flows
export interface DesignTopicContent {
  diagram: string;     // text-based architecture diagram (everything before "Key Flows")
  keyFlows: string[];  // numbered key flow strings
}

// Full design content (one per PDF)
export interface DesignContent {
  id: string;    // kebab-case, e.g. "ads-click-aggregator"
  name: string;  // display name, e.g. "Ads Click Aggregator"
  overview: string; // Problem Overview text

  topics: {
    functionalRequirements: FunctionalRequirementsContent;
    nonFunctionalRequirements: NonFunctionalRequirementsContent;
    coreEntities: CoreEntitiesContent;
    apiDesign: ApiDesignContent;
    highLevelDesign: HLDTopicContent;
    deepDive: DeepDiveTopicContent;
    design: DesignTopicContent;
    whatToStudyFurther: StandardTopicContent;
  };
}

// Index file
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface DesignSummary {
  id: string;
  name: string;
  difficulty: Difficulty;
  pdfFile?: string; // optional override; defaults to name-derived filename
}

export interface DesignIndex {
  designs: DesignSummary[];
}

// Progress tracking
export type TopicKey =
  | 'functionalRequirements'
  | 'nonFunctionalRequirements'
  | 'coreEntities'
  | 'apiDesign'
  | 'highLevelDesign'
  | 'deepDive'
  | 'design'
  | 'whatToStudyFurther';

export interface AttemptProgress {
  designId: string;
  startedAt: string;        // ISO8601
  lastUpdatedAt: string;    // ISO8601
  currentStep: number;      // 0 = overview, 1-8 = topic index
  revealedTopics: Record<TopicKey, boolean>;
  revealedQuestions: {
    highLevelDesign: number[]; // indices of revealed questions
    deepDive: number[];
  };
  completed: boolean;
}

// TOPIC_ORDER constant - the fixed display order of topics
export const TOPIC_ORDER: readonly TopicKey[] = [
  'functionalRequirements',
  'nonFunctionalRequirements',
  'coreEntities',
  'apiDesign',
  'highLevelDesign',
  'deepDive',
  'design',
  'whatToStudyFurther',
] as const;

// Topic display names for UI
export const TOPIC_DISPLAY_NAMES: Record<TopicKey, string> = {
  functionalRequirements: 'Functional Requirements',
  nonFunctionalRequirements: 'Non-Functional Requirements',
  coreEntities: 'Core Entities',
  apiDesign: 'API Design',
  highLevelDesign: 'High Level Design',
  deepDive: 'Deep Dive',
  design: 'Design',
  whatToStudyFurther: 'What to Study Further',
};
