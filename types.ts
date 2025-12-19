
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
  content?: string;
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

export interface GeneralAnalysis {
  summary: string;
  keywords: AIAnalysisKeyword[];
}

export interface AvoidanceZone {
  title: string;
  items: string[];
}

export interface AIReport {
  general_analysis: GeneralAnalysis;
  situation_assessment: string;
  real_intent: string;
  avoidance_zone: AvoidanceZone;
  action_suggestions: StrategicAdvice;
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
  key_segments: string[];
  bias_check: string;
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
  customProxies?: string[]; // 新增：自定义代理列表
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
  models: string[];
  message?: string;
  test_response?: string;
}
