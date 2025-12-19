
import type { DashboardData, AIReport, ConfigStatus, APIConfig, ModelValidationResponse, PersonaId, Article, WordStat, DeepReport, SavedReport } from '../types';

// 扩展 Intl 命名空间以支持 Segmenter
declare global {
  namespace Intl {
    interface SegmenterOptions {
      granularity?: 'grapheme' | 'word' | 'sentence';
      localeMatcher?: 'best fit' | 'lookup';
    }
    interface SegmenterSegment {
      segment: string;
      index: number;
      input: string;
      isWordLike?: boolean;
    }
    class Segmenter {
      constructor(locales?: string | string[], options?: SegmenterOptions);
      segment(input: string): IterableIterator<SegmenterSegment>;
    }
  }
}

const LS_CONFIG_KEY = 'xinhua_insight_api_config';
const LS_DATA_KEY = 'xinhua_insight_local_data';
const LS_DOSSIER_KEY = 'xinhua_insight_dossier';

const TARGET_URL = 'https://m.news.cn/';

const PROXY_GENERATORS = [
  (url: string) => `https://cross.250221.xyz/?url=${encodeURIComponent(url)}`,
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}&t=${Date.now()}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) => `https://thingproxy.freeboard.io/fetch/${url}`
];

// --- 本地存储助手 ---
const getStoredConfig = (): APIConfig | null => {
  const stored = localStorage.getItem(LS_CONFIG_KEY);
  return stored ? JSON.parse(stored) : null;
};

const saveStoredConfig = (config: APIConfig) => {
  localStorage.setItem(LS_CONFIG_KEY, JSON.stringify(config));
};

const getStoredData = (): DashboardData | null => {
  const stored = localStorage.getItem(LS_DATA_KEY);
  return stored ? JSON.parse(stored) : null;
};

const saveStoredData = (data: DashboardData) => {
  localStorage.setItem(LS_DATA_KEY, JSON.stringify(data));
};

const getDossier = (): SavedReport[] => {
  const stored = localStorage.getItem(LS_DOSSIER_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveToDossier = (item: SavedReport): SavedReport[] => {
  const current = getDossier();
  const exists = current.find(r => r.article.url === item.article.url && r.persona === item.persona);
  let updated = current;
  if (exists) {
      updated = current.map(r => (r.article.url === item.article.url && r.persona === item.persona) ? item : r);
  } else {
      updated = [item, ...current];
  }
  localStorage.setItem(LS_DOSSIER_KEY, JSON.stringify(updated));
  return updated;
};

const deleteFromDossier = (id: string): SavedReport[] => {
  const current = getDossier();
  const updated = current.filter(r => r.id !== id);
  localStorage.setItem(LS_DOSSIER_KEY, JSON.stringify(updated));
  return updated;
};

const getTodayDate = () => new Date().toISOString().split('T')[0];

const HOT_WORDS_LIBRARY = [
  "习近平新时代中国特色社会主义思想", "中华民族伟大复兴", "中国式现代化", "人类命运共同体", 
  "全过程人民民主", "总体国家安全观", "两个维护", "四个意识", "四个自信", "高质量发展", 
  "新发展理念", "新发展格局", "以人民为中心", "自我革命", "从严治党", "国家安全", 
  "意识形态工作", "党对军队的绝对领导", "新时代", "绿水青山就是金山银山", 
  "供给侧结构性改革", "科技自立自强", "关键核心技术", "新质生产力", "碳达峰缺口", 
  "共同富裕", "乡村振兴", "一带一路", "数字中国", "实体经济", "低空经济", 
  "未来产业", "双循环", "房住不炒", "六稳六保", "精准扶贫", "脱贫攻坚", 
  "获得感", "讲好中国故事", "传承红色基因", "生命至上", "人民至上", 
  "文化自信", "不忘初心", "牢记使命", "正能量", "主旋律", 
  "基层治理", "扫黑除恶", "动态清零", "复工复产", "百年未有之大变局", 
  "稳中求进", "踔厉奋发", "勇毅前行", "行稳致远", "深刻领悟", "全面深化"
];

const extractKeywords = (titles: string[]): WordStat[] => {
  const stopWords = new Set([
    '中国', '我国', '全国', '各地', '地方', '部门', '新华社', '记者', '新华时评', '快评', '中共中央', '国务院', '总书记',
    '人民', '日报', '文章', '习近平', '工作', '强调', '指出', '会议', '活动', '进行', '召开', '举行', '发表', '考察', '调研', '签署', '会见',
    '致电', '指示', '开展', '实施', '做好', '印发', '发布', '学习', '研究', '部署', '审议', '观看', '出席', 
    '回信', '致信', '座谈', '主持', '坚持', '推进', '落实', '构建', '强化', '统筹', '协调', '贯彻', '抓好',
    '关于', '加强', '发展', '重要', '精神', '全面', '深入', '为了', '甚至', '以及', '其中', '成为', '我们', '这个', '那个',
    '扎实', '大力', '进一步', '不断', '切实', '坚决', '认真', '重大', '加快', '持续', '全力', 
    '积极', '严格', '高效', '提升', '优化', '深化', '推动', '促进', '保障', 
    '完善', '打造', '健全', '防范', '化解', '整治', '攀升', '开创', '奋力',
    '情况', '问题', '主要', '水平', '能力', '体系', '机制', '任务', '举措', '成效', '项目', '成果', 
    '行动', '篇章', '部分', '更多', '日前', '近日', '今年', '去年', '同期', '首月', '多地'
  ]);
  
  const frequency: Record<string, number> = {};
  const sortedHotWords = [...HOT_WORDS_LIBRARY].sort((a, b) => b.length - a.length);

  let segmenter: Intl.Segmenter;
  try {
    segmenter = new Intl.Segmenter('zh-CN', { granularity: 'word' });
  } catch (e) { return []; }

  titles.forEach(title => {
    let cleanTitle = title.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, ' ');
    sortedHotWords.forEach(hotWord => {
      if (cleanTitle.includes(hotWord)) {
        const regex = new RegExp(hotWord, 'g');
        frequency[hotWord] = (frequency[hotWord] || 0) + (cleanTitle.match(regex) || []).length;
        cleanTitle = cleanTitle.replace(regex, ' ');
      }
    });

    const segments = segmenter.segment(cleanTitle);
    for (const { segment, isWordLike } of segments) {
        if (isWordLike && segment.length >= 2 && !stopWords.has(segment)) {
            frequency[segment] = (frequency[segment] || 0) + 1;
        }
    }
  });

  return Object.entries(frequency)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);
};

// --- 解码视角系统 (全中文化优化) ---
const PERSONA_INSTRUCTIONS: Record<PersonaId, string> = {
  youtuber: `
    【当前角色】：现实生存专家 & 润学实践者
    【核心视角】：剥离宏大叙事，关注个体生存。识别关于人身安全、供应链、边境管控、社会稳定的预警信号。
    【解码逻辑】：官方强调“稳定”意味着有动荡风险；强调“保障供应”意味着可能出现短缺。请直接告诉用户是该储备物资、静观其变还是准备离开。
  `,
  economist: `
    【当前角色】：防御性理财师 & 宏观空头分析师
    【核心视角】：不看增长目标，看财政缺口、债务压力、私人部门活跃度及税收倒查风险。
    【解码逻辑】：透视“逆周期调节”背后的财政焦虑，识别资产贬值和地方债雷区。重点关注资产保值和现金流安全，拒绝被乐观情绪误导。
  `,
  observer: `
    【当前角色】：时政深度观察员（中南海听床师）
    【核心视角】：权力动态、意识形态转向、人事任免信号。
    【解码逻辑】：通过“谁出席、谁缺席、提法变动”分析权力结构。注意新词替换旧词背后的路线调整。将看似平淡的会议通稿还原为激烈的路线抉择。
  `,
  plain_spoken: `
    【当前角色】：大白话翻译官（你的隔壁邻居）
    【核心视角】：将晦涩的黑话翻译成柴米油盐和工资。
    【解码逻辑】：拒绝任何专业术语。直接告诉普通家庭：物价会涨吗？工作好找吗？孩子上学政策变了吗？用最直接的语言解释复杂的政策。
  `,
  exam_prep: `
    【当前角色】：考公考研申论教练
    【核心视角】：提取考点、标准提法、申论写作素材、行业扩招信号。
    【解码逻辑】：识别核心意识形态主题。分析哪些政策领域将获得更多财政拨款，从而推断哪些岗位会有扩招；提炼必须背诵的关键词。
  `
};

const SYSTEM_PROMPT_BASE = `
你是一个名为“新华洞察”的深度逻辑解码专家。
你的任务是刺破官方新闻通稿的“形式主义”，还原背后的“实质现实”。
核心准则：强调什么就是缺什么，回避什么就是怕什么。
输出规范：必须输出标准的 JSON 格式，严禁输出任何 Markdown 标记、Markdown 代码块或多余的解释文字。
语言要求：必须使用简体中文。
`;

const GENERAL_REPORT_SCHEMA = `
【总体分析 JSON 结构】：
{
  "general_analysis": {
    "summary": "用一句话点透当前整体局势（红/黄/绿灯状态）。",
    "keywords": [{"word": "关键词", "weight": 1-100, "sentiment": "positive|neutral|negative"}]
  },
  "situation_assessment": "解析当前宏观形势下的核心矛盾和政府的真实焦虑。",
  "real_intent": "隐藏在政策背后的真实议图或尚未公开的行政动机。",
  "avoidance_zone": {
    "title": "风险规避领域名称",
    "items": ["具体需要警惕的行业或行为列表"]
  },
  "action_suggestions": {
    "title": "具体行动策略标题",
    "content": "针对当前视角的具体建议（拒绝模棱两可的套话）。",
    "risk_level": "High|Medium|Low"
  }
}
`;

const DEEP_REPORT_SCHEMA = `
【单篇深度研判 JSON 结构】：
{
  "surface_meaning": "通稿的官方宣传摘要（1句话）。",
  "deep_logic": "从你的特定视角出发，解读出的深层逻辑或真实意图。",
  "impact_assessment": "此新闻对普通个体或特定行业的实质性后果评估。",
  "key_segments": ["3句最能体现你分析结论的通稿原文原句"],
  "bias_check": "语调分析：是防御性的？动员性的？还是警告性的？"
}
`;

const cleanJson = (text: string): string => {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    return text.substring(start, end + 1);
  }
  return text.trim();
};

const fetchWithProxy = async (targetUrl: string): Promise<string | null> => {
  for (const generateProxyUrl of PROXY_GENERATORS) {
      try {
        const fetchUrl = generateProxyUrl(targetUrl);
        const response = await fetch(fetchUrl, {
          cache: 'no-store',
          headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
        });
        if (!response.ok) continue;
        const buffer = await response.arrayBuffer();
        const decoder = new TextDecoder('utf-8'); 
        const text = decoder.decode(buffer);
        if (text && text.length > 200) return text;
      } catch (e) { continue; }
  }
  return null;
};

export const api = {
  getConfig: () => getStoredConfig(),
  getLatestData: async () => getStoredData(),
  getDossier,
  saveToDossier,
  deleteFromDossier,

  crawlNews: async (params?: { limit_hours?: number }): Promise<boolean> => {
    const htmlText = await fetchWithProxy(TARGET_URL);
    if (!htmlText) return false;

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, 'text/html');
      const extractedArticles: Article[] = [];
      const selectors = ['.headline a', '.swiper-slide .tit a', '.list li a', '.products li a', '#recommend li a'].join(', ');
      const linkElements = Array.from(doc.querySelectorAll(selectors));
      const today = getTodayDate();

      linkElements.forEach((el) => {
         const title = el.textContent?.trim();
         const href = el.getAttribute('href');
         if (title && title.length > 6 && href && !href.includes('javascript:')) {
             let fullUrl = href.startsWith('http') ? href : new URL(href, TARGET_URL).href;
             let date = today;
             const dateMatch = fullUrl.match(/\/(\d{4})(\d{2})(\d{2})\//) || fullUrl.match(/\/(\d{4})\/(\d{2})(\d{2})\//);
             if (dateMatch) date = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
             extractedArticles.push({ title, url: fullUrl, date });
         }
      });

      const uniqueArticles = Array.from(new Map(extractedArticles.map(item => [item.title, item])).values());
      uniqueArticles.sort((a, b) => b.date.localeCompare(a.date));
      const newData: DashboardData = {
          stats: {
              date: today,
              total_articles: uniqueArticles.length,
              last_updated: new Date().toLocaleTimeString(),
              top_keywords: extractKeywords(uniqueArticles.map(a => a.title))
          },
          articles: uniqueArticles.slice(0, 50)
      };
      saveStoredData(newData);
      return true;
    } catch (e) { return false; }
  },

  crawlArticleContent: async (url: string): Promise<string | null> => {
    const htmlText = await fetchWithProxy(url);
    if (!htmlText) return null;
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');
    const scripts = doc.querySelectorAll('script, style');
    scripts.forEach(s => s.remove());
    const selectors = ['#p-detail', '.main-content', '.content', 'article'];
    let content = "";
    for (const s of selectors) {
        const el = doc.querySelector(s);
        if (el?.textContent) { content = el.textContent; break; }
    }
    if (!content) content = doc.body.textContent || "";
    return content.replace(/\s+/g, ' ').trim().slice(0, 4000);
  },

  getConfigStatus: async () => {
    const stored = getStoredConfig();
    return stored?.apiKey ? { configured: true, provider: stored.provider, modelId: stored.modelId } : { configured: false };
  },

  validateConfig: async (config: any): Promise<ModelValidationResponse> => {
    try {
      let url = config.baseUrl || (config.provider === 'openai' ? 'https://api.openai.com/v1' : (config.provider === 'deepseek' ? 'https://api.deepseek.com' : 'http://localhost:11434/v1'));
      url = url.replace(/\/+$/, '');
      const res = await fetch(`${url}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.apiKey}` },
        body: JSON.stringify({ model: config.modelId, messages: [{ role: "user", content: "你好，请确认连接。" }], max_tokens: 20 })
      });
      if (!res.ok) throw new Error(await res.text());
      return { valid: true, models: [config.modelId], message: "连接成功！" };
    } catch (e: any) { return { valid: false, models: [], message: e.message }; }
  },

  updateConfig: async (config: APIConfig) => { saveStoredConfig(config); return true; },

  analyzeAI: async (personaId: PersonaId, articles: Article[]): Promise<AIReport> => {
    const config = getStoredConfig();
    if (!config) throw new Error("配置缺失");
    
    const personaPrompt = PERSONA_INSTRUCTIONS[personaId];
    const userPrompt = `需要分析的最新标题列表：\n${articles.slice(0, 25).map(a => `- ${a.title}`).join('\n')}`;
    
    return await api.callLLM(config, [
        { 
          role: "system", 
          content: `${SYSTEM_PROMPT_BASE}\n${GENERAL_REPORT_SCHEMA}\n【当前采用的解码视角】：${personaPrompt}` 
        },
        { role: "user", content: userPrompt }
    ]);
  },

  analyzeDeepArticle: async (article: Article, content: string, personaId: PersonaId): Promise<DeepReport> => {
    const config = getStoredConfig();
    if (!config) throw new Error("配置缺失");
    
    const personaPrompt = PERSONA_INSTRUCTIONS[personaId];
    const userPrompt = `请对以下文章进行深度研判：\n标题：${article.title}\n正文全文：${content}`;
    
    return await api.callLLM(config, [
        { 
          role: "system", 
          content: `${SYSTEM_PROMPT_BASE}\n${DEEP_REPORT_SCHEMA}\n【当前采用的解码视角】：${personaPrompt}` 
        },
        { role: "user", content: userPrompt }
    ]);
  },

  callLLM: async (config: APIConfig, messages: any[]): Promise<any> => {
    let url = config.baseUrl || (config.provider === 'openai' ? 'https://api.openai.com/v1' : (config.provider === 'deepseek' ? 'https://api.deepseek.com' : 'http://localhost:11434/v1'));
    url = url.replace(/\/+$/, '');

    try {
      const res = await fetch(`${url}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.apiKey}` },
        body: JSON.stringify({
          model: config.modelId,
          messages,
          temperature: 0.7,
          response_format: config.provider !== 'ollama' ? { type: "json_object" } : undefined
        })
      });
      
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`API 错误 ${res.status}: ${errText}`);
      }
      
      const data = await res.json();
      const rawContent = data.choices?.[0]?.message?.content;
      if (!rawContent) throw new Error("AI 返回内容为空");
      
      const cleaned = cleanJson(rawContent);
      return JSON.parse(cleaned);
    } catch (e: any) { 
        console.error("AI 解码错误:", e);
        throw e; 
    }
  }
};
