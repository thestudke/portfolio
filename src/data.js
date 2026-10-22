// 资源路径统一走 asset()：dev / Vercel 用 '/'，GitHub Pages 项目站点是 '/<repo>/'。
// Vite 的 base 只会重写 import 进来的资源；字符串里写死的 '/thumbs/x.png' 不会被改写，会 404。
const BASE = import.meta.env.BASE_URL || '/'
export const asset = (p) => BASE + String(p).replace(/^\/+/, '')
export const profile = {
  name: '林鑫祥',
  monogram: 'LX',
  role: 'AI Agent 开发',
  headline: ['让 AI 不只是会聊，', '而是能交付的', '工程系统'],
  lede:
    '7 个从零设计并实现的项目：多智能体编排、混合检索 RAG、298 万条行为数据建模。' +
    '习惯把「为什么这么做」和「跑出来的数字」一起写进文档。',
  location: '福建 · 厦门',
  status: '可到岗 · 2026 届',
  contacts: [
    { label: 'Email', value: '2687979732@qq.com', href: 'mailto:2687979732@qq.com' },
    {
      label: 'GitHub',
      value: 'github.com/thestudke',
      href: 'https://github.com/thestudke',
    },
    { label: '电话', value: '15960263885', href: 'tel:+8615960263885' },
    { label: '所在地', value: '福建省厦门市', href: null },
  ],
}

export const stats = [
  { value: 7, suffix: '', label: '完整项目', note: '从设计到交付' },
  { value: 298, suffix: ' 万', label: '处理数据量', note: '条电商行为明细' },
  { value: 19, suffix: '', label: '后端接口', note: '含降级与自检' },
  { value: 4, suffix: '', label: '分析模型', note: 'RFM / 漏斗 / 关联 / 留存' },
]

export const timeline = [
  {
    period: '2022.09 — 2026.06',
    title: '课程与工程基础',
    org: '数据采集 · 可视化 · 全栈 · 推荐系统',
    desc:
      'Scrapy + Selenium 中间件采集多站点；D3 手写 6 类图表；宠物领养平台双端全栈；' +
      '双塔 DNN + Faiss 召回实验。',
    tags: ['Scrapy', 'D3.js', 'Vue', 'TensorFlow'],
  },
  {
    period: '2025.11 — 2026.04',
    title: '本科毕业设计 · 电商用户行为分析与可视化系统',
    org: '福建商学院 · 信息工程学院',
    desc:
      '298 万条行为数据从采集清洗到四个分析模型，再到 Vue + ECharts 可视化平台，' +
      '论文 45 图 8 表；答辩材料含可运行工程与演示。',
    tags: ['pandas', 'RFM', 'Cohort', 'ECharts'],
  },
  {
    period: '2026.07 — 2026.10',
    title: '大模型应用开发实习',
    org: '人工智能应用开发方向',
    desc:
      '从脚本到分层 FastAPI，再到文档问答、LlamaIndex 索引与 LangGraph 条件边工作流；' +
      '按日期归档 14 周迭代，能追溯每一次技术选择的理由。',
    tags: ['FastAPI', 'LlamaIndex', 'LangGraph', 'Tavily'],
  },
  {
    period: '2026.03 — 2026.09',
    title: '独立项目 · 多智能体医疗服务平台 & 企业年报 RAG',
    org: '个人独立设计与实现',
    desc:
      '7 个专职 Agent 用 LangGraph 编排，五级降级保证无 Key 仍可用；' +
      '年报问答用父子块 + 向量/BM25 混合召回，答案强制带页码溯源。',
    tags: ['LangGraph', 'RAG', 'Chroma', 'FastAPI'],
  },
]

export const projects = [
  {
    id: '01',
    title: '诊小通 Agent',
    subtitle: '多智能体医疗服务平台',
    image: asset('/thumbs/01-zhenxiao.png'),
    summary:
      '7 个专职 Agent 用 LangGraph 编排，检索与联网并行 fan-out；五级降级链保证没有 API Key 时依旧给出可用回答。',
    metrics: [
      ['专职 Agent', '7 个'],
      ['后端接口', '19 个'],
      ['验收项', 'AC-1 ~ AC-10 全通过'],
    ],
    tags: ['FastAPI', 'LangGraph', 'Vue3', 'Qwen'],
    detail: {
      role: '独立设计 · 后端编排 + 前端页面',
      period: '2026.03 — 2026.09',
      stack: 'FastAPI · LangGraph · Qwen · Vue3 · MySQL',
      video: {
        src: asset('/media/01-zhenxiao.mp4'),
        poster: asset('/media/01-zhenxiao-poster.png'),
        duration: 152,
        autoplay: false,
        caption: '实机演示',
      },
      blocks: [
        {
          t: '要解决的问题',
          p: '在线问诊得先判断科室、再给建议，还要能查报告、查药品、预约挂号。让一个大模型一把梭，结果既慢又不可控：它可能把检索和闲聊混在一起，也可能直接编造科室。',
        },
        {
          t: '怎么拆的',
          p: '7 个专职 Agent 各管一段：Router 判断意图、Context 拼上下文、RAG 查知识库、Research 联网、Reasoning 推理、Formatter 出结构、Safety 过合规，用 LangGraph 状态图编排，检索与联网并行 fan-out 后汇总。前后端 19 个接口，后端跑 8012、前端 5178。',
        },
        {
          t: '怎么保证不出错',
          p: '五级降级链：JSON 解析 → 叙事解析 → JSON 修复 → 叙事重试 → 规则兜底。把 Key 拿掉也能给出结构化的分诊结果，只是少了检索依据。AC-1 ~ AC-10 十条验收项全部走通，包括空输入、超长症状、越界科室这类边界。',
        },
        {
          t: '踩过的坑',
          p: '改 .env 必须重启 IDE 进程才生效（不是重启 dev server）；不同 Python 解释器装的包不共享，报 ModuleNotFound 先查解释器；Vite 在 Windows 上偶发 esbuild EPERM，关掉杀软实时扫描才稳。',
        },
      ],
      metrics: [
        ['专职 Agent', '7 个'],
        ['后端接口', '19 个'],
        ['验收项', 'AC-1 ~ AC-10'],
        ['端口', '8012 / 5178'],
      ],
    },
  },
  {
    id: '02',
    title: '企业年报 RAG',
    subtitle: '可溯源的年报问答系统',
    image: asset('/thumbs/02-rag.png'),
    summary:
      '父子块检索 + 向量与 BM25 各占一半的混合召回，重排后只留 2 条；答案强制标注页码，跨页表格按表头指纹自动合并。',
    metrics: [
      ['检索策略', 'Hybrid 0.5 / 0.5'],
      ['重排后上下文', 'top 2'],
      ['工具组合', '8 种装配'],
    ],
    tags: ['LangChain', 'Chroma', 'BM25', 'DashScope'],
    detail: {
      role: '独立设计 · 检索链路 + Agent 装配',
      period: '2026.03 — 2026.09',
      stack: 'LangChain · Chroma · BM25 · DashScope · FastAPI',
      video: {
        src: asset('/media/02-rag.mp4'),
        poster: asset('/media/02-rag-poster.png'),
        duration: 30,
        bleed: true,
        autoplay: false,
        caption: '实机演示',
      },
      blocks: [
        {
          t: '要解决的问题',
          p: '年报问答最难的不是「能不能答」，而是「凭什么信你」。答案必须能点回原文页码；而财报里的表格经常跨页，切块切在表格中间就等于把数据切坏了。',
        },
        {
          t: '父子块 + 跨页表格',
          p: 'pdfplumber 逐页抽文本和表格；表格用「表头指纹」判断是否同一张表：表头字符串一致就 extend 合并，并记录 page_range 为「第 7 页到第 8 页」。父块存进 LocalFileStore，子块进 Chroma，检索命中子块后回带父块给模型。',
        },
        {
          t: '混合召回 + 重排',
          p: 'MultiVectorRetriever 与 BM25（jieba 分词）各占 0.5 权重做 Ensemble，先宽召回再用 TextReRank 重排，只把 top_n=2 送进 prompt。prompt 强制要求「回答末尾标注第 X 页」，文档里没有就直说没找到——宁可少答，不猜。',
        },
        {
          t: '工具装配',
          p: '8 种工具组合按开关拼 system prompt，InMemorySaver 共享同一份会话记忆，切组合不用重建 agent。踩过的坑：明文 API Key 不能留在代码里，得走环境变量。',
        },
      ],
      metrics: [
        ['检索策略', 'Hybrid 0.5 / 0.5'],
        ['重排后上下文', 'top 2'],
        ['工具组合', '8 种装配'],
        ['引用粒度', '页码级'],
      ],
    },
  },
  {
    id: '03',
    title: '电商用户行为分析',
    subtitle: '毕业设计 · 数据到决策',
    image: asset('/thumbs/03-ecom.png'),
    summary:
      'RFM 分群、行为漏斗、品类关联、Cohort 留存四个模型全部落地并可视化；结论指向具体运营动作，而不是堆图表。',
    metrics: [
      ['行为明细', '2,982,670 条'],
      ['漏斗转化', '16.2%'],
      ['RFM 分层', '31,984 人'],
    ],
    tags: ['pandas', 'Apriori', 'Cohort', 'ECharts'],
    detail: {
      role: '毕业设计 · 独立完成（清洗 / 建模 / 前端 / 论文）',
      period: '2025.11 — 2026.04',
      stack: 'pandas · Apriori · Cohort · Vue · ECharts',
      blocks: [
        {
          t: '数据规模',
          p: '2,982,670 条行为明细，时间跨度 2023-01 ~ 2025-05，字段含行为类型、品类、价格、省市。清洗后落成 12 张聚合表，前端只读聚合结果，2.98 万行明细不进浏览器。',
        },
        {
          t: '四个模型',
          p: 'RFM 用 qcut 五档打分再按总分分层，31,984 个用户分成高价值 / 活跃 / 流失风险 / 沉睡；漏斗固定行为顺序（浏览 → 点击 → 加购 → 购买 → 评价）；Apriori 算品类共现，top1 是手机数码 × 服装内衣 29.1%；Cohort 按首购月分组算留存，次月 48–68%，第 12 月掉到 1–5%。',
        },
        {
          t: '结论指向动作',
          p: '浏览 → 购买只有 16.2%，最大漏点在点击 → 加购（直接掉 50.1%）；加购 → 购买却有 61.0%——所以优化重点不是拉新流量，而是把点击页的加购动线做顺。',
        },
        {
          t: '交付物',
          p: 'Vue + ECharts 可视化平台 8 个视图（总览、RFM 散点、分层饼图、漏斗、趋势、品类、热力图、Cohort），配套论文 45 图 8 表与可运行工程。',
        },
      ],
      metrics: [
        ['行为明细', '2,982,670 条'],
        ['用户分层', '31,984 人'],
        ['漏斗转化', '16.2%'],
        ['最强关联', '29.1%'],
      ],
    },
  },
]

export const moreProjects = [
  {
    id: '04',
    title: '大模型应用开发实习',
    image: asset('/thumbs/04-intern.png'),
    desc: '分层 FastAPI → 文档问答 → LlamaIndex → LangGraph 工作流，14 周演进可追溯。',
    meta: '企业工程规范',
  },
  {
    id: '05',
    title: '多站点数据采集工程',
    image: asset('/thumbs/05-crawl.png'),
    desc: 'Selenium 装进下载器中间件，渲染与解析解耦；微博转发链 548 节点 / 594 边。',
    meta: 'Scrapy · 反爬',
  },
  {
    id: '06',
    title: '宠物领养平台',
    image: asset('/thumbs/06-pet.png'),
    desc: '双端全栈 + AI 客服：实时查库注入，候选集小且要求零错误，比向量检索更可靠。',
    meta: 'FastAPI · Vue',
  },
  {
    id: '07',
    title: '数据可视化作品集',
    image: asset('/thumbs/07-viz.png'),
    desc: '空气质量交互系统 8 类视图，D3 手写 6 类图表，双塔 + Faiss 召回实验。',
    meta: 'Streamlit · D3',
  },
]

export const strengths = [
  {
    id: '01',
    title: 'Agent 编排与降级设计',
    desc:
      '用状态图切分职责边界：路由、上下文、检索、推理、格式化、合规各管一段；' +
      '每个失败点都有退路，而不是等模型自己稳。',
    chips: ['LangGraph', '工具调用', '多轮记忆', '降级链'],
  },
  {
    id: '02',
    title: 'RAG 检索工程',
    desc:
      '父子块、混合召回、重排、页码溯源——每一步解决一个具体失效模式，' +
      '不是把文档切成块塞进向量库就完事。',
    chips: ['Chroma', 'BM25', 'TextReRank', '切分策略'],
  },
  {
    id: '03',
    title: '数据分析与建模',
    desc:
      '清洗、聚合、打分、分层全链路自己写；知道 RFM 为什么要 rank(method="first")，' +
      '也知道漏斗必须固定行为顺序。',
    chips: ['pandas', 'RFM', '漏斗', 'Cohort'],
  },
  {
    id: '04',
    title: '数据采集与反爬',
    desc:
      '静态页、动态 DOM、JSON 接口、图关系都处理过；Cookie 外置、编码坑、打码平台，' +
      '踩过才知道哪里会静默失败。',
    chips: ['Scrapy', 'Selenium', 'XPath', '代理与限速'],
  },
  {
    id: '05',
    title: '后端工程化',
    desc:
      'DTO/VO 分离、统一响应体、全局异常处理、幂等与确定性排班；' +
      '接口能自检状态，出问题一眼定位是配置、依赖还是模型。',
    chips: ['FastAPI', 'SQLAlchemy', 'JWT', 'Pydantic'],
  },
  {
    id: '06',
    title: '前端与可视化表达',
    desc:
      'Vue2/3 双边维护，ECharts 与 D3 都能上手；图表选择有依据，' +
      '大数据不进浏览器，前端只拿聚合结果。',
    chips: ['Vue3', 'ECharts', 'D3.js', 'Streamlit'],
  },
]

export const navItems = [
  { href: '#profile', label: '经历' },
  { href: '#work', label: '项目' },
  { href: '#capabilities', label: '优势' },
  { href: '#contact', label: '联系' },
]
