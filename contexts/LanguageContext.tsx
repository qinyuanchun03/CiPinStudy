
import React, { createContext, useContext, useState } from 'react';
import { Language } from '../types';

type Translations = Record<string, string>;

const translations: Record<Language, Translations> = {
  en: {
    appTitle: "Xinhua Insight",
    refresh: "Refresh Data",
    settings: "Settings",
    loading_crawling: "Crawling latest news & analyzing...",
    no_data: "No data available. Please run the crawler.",
    retry: "Run Crawler",
    generate_report: "Decode Bureaucracy",
    generating: "Decoding Deep Logic...",
    config_required: "API Configuration Required",
    stats_articles: "Articles Analyzed",
    stats_updated: "Last Updated",
    stats_keyword: "Top Keyword",
    chart_title: "Frequency Analysis",
    chart_subtitle: "Top recurring terms in recent political coverage",
    article_list_title: "Latest Articles",
    article_list_subtitle: "Direct sources from Xinhua Politics",
    read_source: "Read Source",
    ai_title: "Deep Logic Decoding",
    
    // Deep Analysis
    deep_analyze: "Deep Analyze",
    analyzing_content: "Reading full text & analyzing...",
    deep_report_title: "Confidential Dossier",
    surface_meaning: "Surface Meaning",
    deep_logic: "Deep Logic / Real Intent",
    impact_assessment: "Impact Assessment",
    bias_check: "Tone / Bias Check",
    key_quotes: "Key Signals",
    close: "Close Dossier",
    save_to_dossier: "Save to Archives",
    saved: "Saved!",

    // Batch & Dossier
    batch_mode: "Batch Mode",
    batch_analyze_btn: "Batch Analyze Selected",
    batch_confirm_msg: "Selected {count} articles.\nCurrent Perspective: 【{persona}】\n\nProceed with this perspective?\n(Click Cancel to select a different one)",
    dossier: "Archives",
    dossier_title: "Intelligence Archives",
    dossier_empty: "No saved reports. Analyze articles and save them here.",
    export_json: "Export JSON",
    export_txt: "Export TXT",
    delete: "Delete",
    analyzing_batch: "Batch Analyzing... ({current}/{total})",
    batch_complete: "Batch Analysis Complete! Saved to Archives.",

    // New Section Titles
    ai_section_general: "1. General Analysis",
    ai_section_situation: "2. Situation Assessment",
    ai_section_intent: "3. Real Intent",
    ai_section_avoid: "4. Avoidance Zone",
    ai_section_action: "5. Action Suggestions",

    ai_risk_level: "Risk Level",
    settings_title: "AI Configuration",
    provider: "Provider",
    apiKey: "API Key",
    baseUrl: "Base URL (Optional)",
    test_connection: "Test Connection",
    testing: "Testing...",
    model_id: "Model ID",
    save: "Save Configuration",
    saving: "Saving...",
    api_note: "Your API key is stored locally in the backend api_config.json file.",
    connection_success: "Connection successful! Select a model.",
    connection_failed: "Connection failed. Please check your credentials.",
    select_or_type: "Select or type a model ID...",
    step_1: "1. Credentials",
    step_2: "2. Model Selection",
    select_perspective: "Select Decoding Lens",
    persona_youtuber: "Survivalist (Runxue)",
    persona_youtuber_desc: "Decode safety warnings. Focus on hoarding, borders, and crackdown avoidance.",
    persona_economist: "Bear Market Strategy",
    persona_economist_desc: "Decode fiscal lies. Focus on debt crises, tax raids, and asset preservation.",
    persona_observer: "Deep Politics",
    persona_observer_desc: "Decode power struggles. Focus on personnel purges and ideological mobilization.",
    persona_plain_spoken: "Plain Spoken (Simple)",
    persona_plain_spoken_desc: "Translates expert jargon into plain language. Tells you exactly what to do at home.",
    persona_exam_prep: "Exam Prep (Civil Service)",
    persona_exam_prep_desc: "Extracts exam points and essay materials. Analyzes hiring trends based on policy focus.",
    recommended: "Recommended",
    crawl_failed: "Crawler failed. The proxy might be busy. Please try again later."
  },
  zh: {
    appTitle: "新华洞察",
    refresh: "刷新数据",
    settings: "设置",
    loading_crawling: "正在抓取最新新闻并进行分析...",
    no_data: "暂无数据，请运行爬虫。",
    retry: "运行爬虫",
    generate_report: "八股文解码",
    generating: "正在挖掘深层逻辑...",
    config_required: "需要 API 配置",
    stats_articles: "文章数量",
    stats_updated: "最后更新",
    stats_keyword: "高频风向标",
    chart_title: "词频信号",
    chart_subtitle: "官方通稿中反复强调的关键词",
    article_list_title: "最新通稿",
    article_list_subtitle: "新华网时政频道直达",
    read_source: "阅读原文",
    ai_title: "深层逻辑解码",

    // Deep Analysis
    deep_analyze: "深度研判",
    analyzing_content: "正在抓取正文并进行穿透分析...",
    deep_report_title: "单篇研判档案",
    surface_meaning: "表面意思 (通稿摘要)",
    deep_logic: "深层逻辑 (真实意图)",
    impact_assessment: "实质影响评估",
    bias_check: "语调/立场核查",
    key_quotes: "关键信号原句",
    close: "关闭档案",
    save_to_dossier: "归档入库",
    saved: "已归档",

    // Batch & Dossier
    batch_mode: "批量研判",
    batch_analyze_btn: "批量研判所选 ({count})",
    batch_confirm_msg: "已选择 {count} 篇文章。\n当前设定视角：【{persona}】\n\n是否保持该视角进行深度研判？\n(如需更换视角，请点击“取消”并在下方重新选择)",
    dossier: "情报档案",
    dossier_title: "情报研判档案库",
    dossier_empty: "暂无归档。请对文章进行深度研判并保存。",
    export_json: "导出 JSON",
    export_txt: "导出 TXT",
    delete: "删除",
    analyzing_batch: "批量研判进行中... ({current}/{total})",
    batch_complete: "批量研判完成！结果已自动归档。",

    // New Section Titles
    ai_section_general: "一、总体分析",
    ai_section_situation: "二、形势研判",
    ai_section_intent: "三、真实意图",
    ai_section_avoid: "四、避雷专区",
    ai_section_action: "五、行动建议",

    ai_risk_level: "风险等级",
    settings_title: "AI 配置",
    provider: "服务商",
    apiKey: "API 密钥",
    baseUrl: "基础 URL (可选)",
    test_connection: "测试连接",
    testing: "测试中...",
    model_id: "模型 ID",
    save: "保存配置",
    saving: "保存中...",
    api_note: "您的 API 密钥存储在本地浏览器的 LocalStorage 中。",
    connection_success: "连接成功！请选择模型。",
    connection_failed: "连接失败，请检查凭证。",
    select_or_type: "选择或输入模型 ID...",
    step_1: "1. 凭证设置",
    step_2: "2. 模型选择",
    select_perspective: "选择解码视角",
    persona_youtuber: "现实生存 (润学)",
    persona_youtuber_desc: "剥离宏大叙事。关注人身安全、物资储备、边境管控与社会铁拳。",
    persona_economist: "防御性理财 (空头)",
    persona_economist_desc: "看穿经济数据水分。关注地方债雷爆、税收倒查与资产贬值风险。",
    persona_observer: "中南海听床 (政治)",
    persona_observer_desc: "通过“谁出席、谁缺席、提法变动”分析权力斗争与路线清洗。",
    persona_plain_spoken: "大白话 (通俗)",
    persona_plain_spoken_desc: "拒绝谜语人。将专家黑话翻译成人话，直接告诉你现在该存钱还是该跑路。",
    persona_exam_prep: "考公考研 (上岸)",
    persona_exam_prep_desc: "提炼申论素材与政治考点。分析哪些部门在扩权招人，哪些行业适合避雷。",
    recommended: "推荐：通俗易懂",
    crawl_failed: "爬虫运行失败。代理服务可能繁忙，请稍后重试。"
  },
  jp: {
    appTitle: "新華インサイト",
    refresh: "データ更新",
    settings: "設定",
    loading_crawling: "最新ニュースをクロールして分析中...",
    no_data: "データがありません。クローラーを実行してください。",
    retry: "クローラー実行",
    generate_report: "官僚文学解読",
    generating: "深層論理を分析中...",
    config_required: "API設定が必要です",
    stats_articles: "分析記事数",
    stats_updated: "最終更新",
    stats_keyword: "トップキーワード",
    chart_title: "頻度分析",
    chart_subtitle: "最近の政治報道における頻出語句",
    article_list_title: "最新記事",
    article_list_subtitle: "新華網政治セクション直リンク",
    read_source: "原文を読む",
    ai_title: "深層ロジック解読",

    // Deep Analysis
    deep_analyze: "詳細分析",
    analyzing_content: "全文を取得して分析中...",
    deep_report_title: "個別分析ファイル",
    surface_meaning: "表面的な意味",
    deep_logic: "深層ロジック (真の意図)",
    impact_assessment: "影響評価",
    bias_check: "トーン/バイアス確認",
    key_quotes: "重要なシグナル",
    close: "閉じる",
    save_to_dossier: "アーカイブに保存",
    saved: "保存しました",

    // Batch & Dossier
    batch_mode: "一括分析",
    batch_analyze_btn: "選択項目を一括分析 ({count})",
    batch_confirm_msg: "{count} 件の記事を選択しました。\n現在の視点：【{persona}】\n\nこの視点で分析を続けますか？\n(変更する場合は「キャンセル」をクリックして再選択してください)",
    dossier: "情報アーカイブ",
    dossier_title: "情報分析アーカイブ",
    dossier_empty: "保存されたレポートはありません。記事を分析してここに保存してください。",
    export_json: "JSONエクスポート",
    export_txt: "TXTエクスポート",
    delete: "削除",
    analyzing_batch: "一括分析中... ({current}/{total})",
    batch_complete: "一括分析完了！アーカイブに保存されました。",

    // New Section Titles
    ai_section_general: "1. 全体分析",
    ai_section_situation: "2. 情勢判断",
    ai_section_intent: "3. 真の意図",
    ai_section_avoid: "4. 回避ゾーン",
    ai_section_action: "5. 行動提案",

    ai_risk_level: "リスクレベル",
    settings_title: "AI 設定",
    provider: "プロバイダー",
    apiKey: "API キー",
    baseUrl: "ベース URL (オプション)",
    test_connection: "接続テスト",
    testing: "テスト中...",
    model_id: "モデル ID",
    save: "設定を保存",
    saving: "保存中...",
    api_note: "APIキーはローカルストレージに保存されます。",
    connection_success: "接続成功！モデルを選択してください。",
    connection_failed: "接続に失敗しました。認証情報を確認してください。",
    select_or_type: "モデルIDを選択または入力...",
    step_1: "1. 認証情報",
    step_2: "2. モデル選択",
    select_perspective: "解読レンズの選択",
    persona_youtuber: "サバイバル (潤学)",
    persona_youtuber_desc: "安全警告を解読。備蓄、国境管理、取り締まり回避に焦点を当てる。",
    persona_economist: "防御的投資 (ベア)",
    persona_economist_desc: "経済の嘘を見抜く。債務危機、税務調査、資産防衛に焦点を当てる。",
    persona_observer: "深層政治観測",
    persona_observer_desc: "権力闘争を解読。人事粛清とイデオロギー動員に焦点を当てる。",
    persona_plain_spoken: "平易な言葉 (通訳)",
    persona_plain_spoken_desc: "専門用語を排除。結局何をすべきか（貯金、逃走、隠れる）を明確に伝えます。",
    persona_exam_prep: "公務員・大学院試験",
    persona_exam_prep_desc: "試験の重要ポイントと小論文の素材を抽出。政策の重点から採用トレンドを分析。",
    recommended: "推奨：わかりやすい",
    crawl_failed: "クローラーが失敗しました。プロキシが混雑している可能性があります。"
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('zh');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
