# 📰 新华洞察 (Xinhua Insight) v1.1

> **读懂字里行间的趋势 | Decoding Bureaucratic Logic in Official Reports**

[![GitHub Repo](https://img.shields.io/badge/GitHub-CiPinStudy-blue?logo=github)](https://github.com/qinyuanchun03/CiPinStudy)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fqinyuanchun03%2FCiPinStudy)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/qinyuanchun03/CiPinStudy)
![Version](https://img.shields.io/badge/version-1.1.0-emerald.svg)
![Privacy](https://img.shields.io/badge/privacy-Local_Storage_Only-green)

**新华洞察 (Xinhua Insight)** 是一款专为解构“八股文”设计的政经新闻深度研判工具。它不仅具备实时的本地分词统计功能，更通过大语言模型（LLM）穿透官方通稿的修饰性辞令，为用户提供五个不同维度的“逻辑解码”视图。

---

## 🚀 最新版本 v1.1 更新记录

### 1. 🧠 全中文化 Prompt 指令集
针对中文政经语境进行了深度重构。所有 AI 提示词现已完全中文化，有效避免了 AI 在分析过程中输出长篇英文的问题。
*   **术语穿透**: 精准识别“稳中求进”、“统筹安全”等关键词背后的真实政策温差。
*   **逻辑对齐**: AI 现在能更敏锐地察觉通稿中“排位变动”和“避讳语”的政治含义。

### 2. 🔍 单篇深度穿透 (Deep Analysis)
支持对单篇文章进行“剥洋葱”式的深度研判：
*   **表面摘要**: 提取通稿核心。
*   **实质意图**: 结合选定人格（如生存专家或理财师）还原真相。
*   **风险核查**: 自动分析文章的语调（是动员性的还是防御性的）。

### 3. 📦 批量研判与情报归档 (Batch & Dossier)
*   **批量研判**: 支持一次性勾选多篇文章进行自动化深度处理。
*   **情报档案**: 分析结果可一键保存至本地“情报档案库”，支持 JSON 或 TXT 格式导出，方便二次编辑或撰写内参。

### 4. ⚡ 性能与交互优化
*   **本地分词**: 采用 `Intl.Segmenter` 算法，离线实现高效分词。
*   **部署适配**: 完美支持 Vercel 和 Netlify 快速部署，代码即开即用。

---

## 🤖 五大解码视角 (Persona System)

| 视角 | 核心逻辑 (Core Logic) |
|------|----------------------|
| 🗣️ **大白话 (推荐)** | **翻译官**。将政策术语翻译成“工资、菜价、房贷”等生活化建议。 |
| 🏃‍♂️ **现实生存 (实用)** | **生存专家**。剥离宏大叙事，寻找关于安全、物资及流动性的预警信号。 |
| 📉 **防御性理财 (空头)** | **财务分析师**。看透财政赤字，寻找税收、债务雷区及资产保值的最优解。 |
| 🕵️ **政治观察员** | **听床师**。关注人事信号与话语体系微调，还原高层路线博弈。 |
| 🎓 **考公考研 (上岸)** | **申论教练**。提取必须背诵的关键词和申论素材，判断行业岗位扩缩趋势。 |

---

## 🛠 技术架构

*   **前端**: React 19 + Vite + Tailwind CSS + Lucide Icons。
*   **数据采集**: 多路 CORS 代理（AllOrigins/ThingProxy）动态抓取新华网移动端数据。
*   **AI 后端**: 支持 OpenAI、DeepSeek 以及本地部署的 Ollama。
*   **隐私保护**: 所有 API Key 和研判报告均存储在浏览器 LocalStorage 中，不经过任何第三方服务器。

---

## ⚙️ 配置与部署

### 快速部署
1. 点击上方的 **Deploy to Vercel** 或 **Netlify** 按钮。
2. 填写您的 GitHub 仓库信息完成克隆。
3. 在浏览器中打开应用，点击右上角 **设置 (⚙️)** 配置 API 密钥。

### 仓库地址
开源地址：[https://github.com/qinyuanchun03/CiPinStudy](https://github.com/qinyuanchun03/CiPinStudy)

---

## ⚠️ 免责声明
本工具仅供学术研究和信息汇总参考。AI 深度研判结果基于特定 Prompt 工程逻辑生成，旨在提供批判性思维视角，并不代表开发者观点，亦不构成任何投资或法律建议。

---
<p align="center">
  Made with ❤️ by the Xinhua Insight Team
</p>
