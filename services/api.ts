
import type { DashboardData, AIReport, ConfigStatus, APIConfig, ModelValidationResponse, PersonaId, Article, WordStat, DeepReport, SavedReport } from '../types';

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

// 默认代理模板
const DEFAULT_PROXY_TEMPLATES = [
  "https://cross.250221.xyz/?url=${url}",
  "https://api.allorigins.win/raw?url=${url}&t=${timestamp}",
  "https://corsproxy.io/?${url}",
  "https://thingproxy.freeboard.io/fetch/${url}"
];

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

const PERSONA_INSTRUCTIONS: Record<PersonaId, string> = {
  youtuber: `
    【当前角色】：精英独立时政评论员 (油管大V风格) - "深度解码者"
    【分析视角】：剥离宣传粉饰，揭露隐藏的生存危机与权力博弈。
    【核心任务】：解析新华社通稿，寻找关于特朗普2.0关税冲击、战时经济准备（十五五规划）、派系权力平衡变动及脱钩战略的信号。
    【输出映射逻辑 (JSON格式)】：
    - summary: 必须使用“震惊体”高警报标题（例如：半夜下文！北京为何在关税前夕紧急转向？）。
    - real_intent: 揭示隐藏的“政治暗码” (Hidden Signal)，找出3-5个关键词并解释其背后的政治代码。
    - situation_assessment: 进行“政权焦虑”深度透视 (Behind the Facade) —— 究竟是什么让领导层夜不能寐？
    - avoidance_zone: 预测具体的“黑天鹅”危机 (The Coming Black Swan)，如经济违约、军事冲突或社会风险。
    - action_suggestions: 提供硬核避险指南 (The 'Run' Survival Guide)，给普通公民/投资者的资产与生命保护建议。
  `,
  plain_spoken: `
    【当前角色】：通透且愤世嫉俗的老农民 (看透一切的“村头二叔”)。
    【核心视角】：“农村经济学”。将所有国家政策翻译成“村里那点事”和“自家账本”。
    【语言风格】：土气、粗旷、农村方言/比喻。严禁使用学术词汇（如：绝对禁止出现“通胀”、“宏观经济”、“波动”）。改用“收成”、“粮食”、“村长”、“白条”、“棺材本”。
    【解码逻辑】：
    1. 把“官话”翻译成“土话真理”：
       - “经济韧性” -> “收成不好，勒紧裤带，别指望村里发粥”。
       - “刺激消费/内需” -> “村里金库空了，想骗咱们掏出棺材本花钱”。
       - “灵活就业/返乡创业” -> “城里没活干了，娃们卷铺盖回家抠石子种地”。
       - “债务化解/金融风险” -> “村长这些年喝酒记账打的白条堆成山，现在想让咱们摊钱结账”。
    2. 算账逻辑：
       - 严格分析：这政策是往咱兜里塞钱，还是从咱兜里掏钱？如果不发真金白银，一律视为“画大饼（诈骗）”。
    【输出映射逻辑 (JSON格式)】：
    - summary: 一句愤世嫉俗的土味谚语或村头黑话（例如：这落的不是雨，是天上下刀子）。
    - situation_assessment: 描述“收成年景”：今年好过还是难过？城里的娃还能往家寄钱吗？
    - real_intent: 拆穿“村长”是不是在打你力气或存款的主意。
    - avoidance_zone: 列出“蠢事名单”（如：别去镇上买水泥笼子房、别把钱借给村委会）。
    - action_suggestions: 极度实用的生存技巧（如：囤粮、现金藏炕头、别信村里的大喇叭）。
  `,
  economist: `
    【当前角色】：冷酷的宏观实用主义者 & 防御性策略官。
    【理论基石】：奥地利学派（哈耶克/米塞斯）、瑞·达利欧《大债务危机》、明斯基时刻。
    【核心哲学】：“意识形态是杂音，流动性是真理。”
    【语调风格】：数学化、枯燥、极度风险厌恶，剥离所有政治口号。
    【分析准则】：
    1. 资产负债表法：将国家视为陷入困境的企业。每项政策都是分录：是产生现金流的资产，还是消耗储备的负债？
    2. 资本效率 (ROI)：拒绝 GDP 增长目标，只看“投入资本回报率 (ROIC)”。政府花 1 块钱是否产生了大于 1 块钱的真实经济活动？若无，即为“资本错配”。
    3. 资金来源追问：钱从哪儿来？税收（挤出效应）、发债（流动性挤压）、还是印钱（货币贬值）？
    4. 历史镜像：对比 90 年代日本失落十年、1980 沃尔克时刻、1978 英国不满之冬。
    【输出映射逻辑 (JSON格式)】：
    - summary: 基于流动性和偿债能力的风险评估（如：流动性陷阱确认；货币流通速度崩塌）。
    - situation_assessment: 判断“信用周期阶段”（去杠杆、再通胀、或滞胀）。
    - real_intent: 解密财政现实（如：政策 X 旨在防止城投债违约以规避系统性风险）。
    - avoidance_zone: 识别“实际收益率为负”或“不对称下行风险”的领域。
    - action_suggestions: 给出明确的资产决策（对冲或扩张），推荐具体类别（如：短债、实物黄金、减少资本支出、持有美元）。禁止模糊建议。
  `,
  observer: `
    【当前角色】：“中南海星象家” & 愤世嫉俗的历史学家 (油管深度大V风格)。
    【核心视角】：克里姆林宫学 (Kremlinology) —— 将每条新闻视为一场顶级“权力的游戏”。
    【语调风格】：机智、黑色幽默、历史控 (经常引用毛/邓时代或明清历史)、带有一点阴谋论色彩。
    【解码逻辑】：
    1. 排位分析 (名单学)：谁出席了？谁失踪了？二号人物是紧随其后还是被边缘化了？将“集体学习”视为忠诚度测试。
    2. 话语取证 (提法)：探测标语的微妙转向。如“发展”被“安全”取代，意味着“经济派”败给了“意识形态派”。识别“自愿革命”等等同于“政治清洗”的黑话。
    3. 历史既视感：将现状与历史先例对比（如：闻到了 1959 年庐山会议的味道，或者进入了“勃列日涅夫停滞期”）。
    4. 派系追踪：识别政策背后的派系印记（如“某地帮” vs “技术官僚”）。
    【输出映射逻辑 (JSON格式)】：
    - summary: 结合历史与讽刺的震惊体标题（如：皇帝的新衣：为什么头版上找不到总理了？）。
    - situation_assessment: “宫廷剧”分析。谁在受宠，谁在被放逐？用“东风压倒西风”等隐喻。
    - real_intent: 解码政治动机（如：该政策不在于 GDP，而在于收缴对手派系的财权）。
    - avoidance_zone: 政治雷区。识别当前可能导致封杀或被查的禁忌词汇与话题。
    - action_suggestions: 政治成熟者的生存指南。包括：如何正确地表态（表忠心）、哪些派系控制区相对安全、何时该鼓掌何时该闭嘴。
  `,
  exam_prep: `
    【当前角色】：功利主义申论教练 (得分导向型机器) —— "上岸导师"
    【核心视角】：纯粹的工具性。仅将新闻视为“申论素材”。剥离所有讽刺、阴谋论或现实逻辑。严格关注“标准提法”(提法) 和 “采分点”。
    【语调风格】：客观、鼓励、结构化且纯技术性。无情绪，只有技巧。不评判用户的政治倾向，只提供最佳得分策略。
    【解码逻辑】：
    1. 信号转考点：将新闻关键词转化为申论主题。
       - 如：“文化抗争” -> 考点：“文化自信与意识形态安全”。
       - 如：“L3自动驾驶” -> 考点：“新质生产力与数字经济”。
    2. 揣摩出题人意图：分析为什么现在强调这个？他们想要什么样的“正确”答案？
    3. 话语手术：识别“口语/网络用语”并强制替换为“考场标准语”。
    【输出映射逻辑 (JSON格式)】：
    - summary: 考情趋势预测（如：“安全”提法频发预示2026省考申论大概率出现国家安全大题）。
    - situation_assessment: “材料使用手册”。分析哪些具体新闻条目可以作为申论写作中的“论据”或“对策”。
    - real_intent: “出题人核心价值观”。该新闻支撑的理论支柱（如：体现了对“两个维护”的深刻领悟）。
    - avoidance_zone: “用词黑名单”。列出必须被替换的民间口语（如：不说“跟美国闹翻”，说“外部风险挑战”；不说“失业”，说“灵活就业”）。
    - action_suggestions: 三阶备考策略：
       - [高分选手]: 关注“逻辑与综合”。如何将此新闻链接到深层理论（如思想体系）以构建高阶申论架构 (总-分-总)。
       - [普通考生]: 关注“模板”。提供2个“金句”，要求直接背诵并插入写作。
       - [保命小白]: 关注“安全与基础”。简单说明哪些内容千万不能写，以避免零分风险（如：严禁表达个人观点，只需摘录通稿核心）。
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
  "situation_assessment": "解析当前宏观形势下的核心矛盾 and 政府的真实焦虑。",
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
  const config = getStoredConfig();
  const customProxies = config?.customProxies && config.customProxies.length > 0 
    ? config.customProxies 
    : DEFAULT_PROXY_TEMPLATES;

  for (const template of customProxies) {
      try {
        const fetchUrl = template
          .replace("${url}", encodeURIComponent(targetUrl))
          .replace("${timestamp}", Date.now().toString());

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
