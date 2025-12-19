
export interface WordStat {
  word: string;
  count: number;
}

export interface BasicData {
  date: string;
  total_articles: number;
  last_updated: string;
  top_keywords: WordStat[];
}

export interface Article {
  title: string;
  url: string;
  date: string;
  content?: string; // Optional as we might not display full content in list
}

export interface DashboardData {
  stats: BasicData | null;
  articles: Article[];
}

export interface AIAnalysisKeyword {
  word: string;
  weight: number;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface StrategicAdvice {
  title: string;
  content: string;
  risk_level: 'High' | 'Medium' | 'Low';
}

// New 5-Section Structure Types

export interface GeneralAnalysis {
  summary: string;
  keywords: AIAnalysisKeyword[];
}

export interface AvoidanceZone {
  title: string;
  items: string[];
}

export interface AIReport {
  // 1. General Analysis (总体分析) - includes Visual Keywords
  general_analysis: GeneralAnalysis;
  // 2. Situation Assessment (形势研判)
  situation_assessment: string;
  // 3. Real Intent (真实意图)
  real_intent: string;
  // 4. Avoidance Zone (避雷专区)
  avoidance_zone: AvoidanceZone;
  // 5. Action Suggestions (行动建议)
  action_suggestions: StrategicAdvice;

  // Legacy properties for backward compatibility
  period_summary?: string;
  top_keywords?: AIAnalysisKeyword[];
  policy_signal?: string;
  core_topics?: { topic_name: string; summary: string }[];
  strategic_advice?: StrategicAdvice;
}

export interface DeepReport {
  surface_meaning: string;
  deep_logic: string;
  impact_assessment: string;
  key_segments: string[]; // Specific quotes from text that are important
  bias_check: string; // Tone analysis
}

export interface SavedReport {
  id: string;
  article: Article;
  report: DeepReport;
  timestamp: number;
  persona: PersonaId;
}

export interface APIConfig {
  provider: 'openai' | 'deepseek' | 'ollama';
  apiKey?: string;
  baseUrl?: string;
  modelId?: string;
}

export interface ConfigStatus {
  configured: boolean;
  provider?: string;
  modelId?: string;
}

export type Language = 'en' | 'zh' | 'jp';
export type PersonaId = 'youtuber' | 'economist' | 'observer' | 'plain_spoken' | 'exam_prep';

export interface ModelValidationResponse {
  valid: boolean;
  models: string[]; // List of available model IDs
  message?: string;
  test_response?: string; // Content of the short test request
}
