import { Category, Tool, FAQItem, Testimonial } from "@/types";

// 🔴 GLOBAL FEATURE FLAGS
export const ENABLE_ADS = false; // Set to true when you add your Publisher ID
export const ENABLE_PREMIUM_SHOWCASE = false; // Set to true when you are ready to sell premium tools

// ... rest of the file remains exactly the same

export const CATEGORIES: Category[] = [
     {
          id: "dev",
          name: "Developer Tools",
          slug: "developer-tools",
          description: "Visual animation builders, Wasm JSON validators, API mockers, and AST refactorers.",
          iconName: "Code",
          toolCount: 5,
          colorTheme: "from-blue-600 to-cyan-500"
     },
     {
          id: "creator",
          name: "Content Creator Tools",
          slug: "content-creator-tools",
          description: "Thumbnail previewers, code snippet animators, audio separators, and short video repurposers.",
          iconName: "Video",
          toolCount: 5,
          colorTheme: "from-purple-600 to-pink-500"
     },
     {
          id: "analytics",
          name: "Analytics Tools",
          slug: "analytics-tools",
          description: "Derivatives payoff diagrams, UTM campaign builders, SaaS unit economics, and churn predictors.",
          iconName: "TrendingUp",
          toolCount: 5,
          colorTheme: "from-emerald-500 to-teal-400"
     },
     {
          id: "business",
          name: "Business Tools",
          slug: "business-tools",
          description: "PDF invoice generators, B2B lead scrapers, pricing simulators, and legal contract scanners.",
          iconName: "Briefcase",
          toolCount: 5,
          colorTheme: "from-amber-500 to-orange-400"
     },
     {
          id: "ai",
          name: "AI Tools",
          slug: "ai-tools",
          description: "Prompt optimizers, text humanizers, LLM cost calculators, and red-teaming security suites.",
          iconName: "Bot",
          toolCount: 5,
          colorTheme: "from-rose-500 to-red-500"
     },
     {
          id: "productivity",
          name: "Productivity Tools",
          slug: "productivity-tools",
          description: "Time zone visualizers, Markdown studio, audio actionizers, and process builders.",
          iconName: "Zap",
          toolCount: 5,
          colorTheme: "from-indigo-500 to-blue-500"
     },
     {
          id: "seo",
          name: "SEO Tools",
          slug: "seo-tools",
          description: "JSON-LD schema generators, SERP previewers, robots.txt inspectors, and link visualizers.",
          iconName: "Search",
          toolCount: 5,
          colorTheme: "from-cyan-500 to-blue-600"
     },
     {
          id: "privacy",
          name: "Privacy Tools",
          slug: "privacy-tools",
          description: "Browser-side PII scrubbers, EXIF strippers, local Wasm LLM clients, and key entropy analyzers.",
          iconName: "Shield",
          toolCount: 5,
          colorTheme: "from-teal-400 to-emerald-600"
     }
];

export const MASTER_TOOLS_LIST: Tool[] = [
     // 1. Developer Tools
     {
          id: "dev-1",
          name: "CSS Micro-Interaction & Animation Builder",
          description: "Visual UI editor for generating pure CSS animations, progress bars, and geometric morphing effects.",
          category: "developer-tools",
          slug: "/tools/css-animation-builder",
          iconName: "Sparkles",
          tier: "free",
          isPopular: true,
          howToUse: [
               "Select your desired animation effect from the variables menu.",
               "Adjust the slider to increase or decrease the total duration of the animation loop.",
               "Choose an easing curve (like Linear or Bouncy) to change the timing feel of the animation.",
               "Click the 'Copy Code' button to copy the generated keyframes and CSS classes directly into your project."
          ]
     },
     {
          id: "dev-2",
          name: "JSON Formatter, Beautifier & Schema Validator",
          description: "Format, validate, and convert massive JSON payloads up to 100MB directly in your browser via Wasm.",
          category: "developer-tools",
          slug: "/tools/json-formatter-validator",
          iconName: "FileJson",
          tier: "free",
          isPopular: true,
          howToUse: [
               "Paste your raw, unformatted, or minified JSON payload into the left input pane.",
               "Click 'Beautify' to automatically indent and format the JSON for readability.",
               "Click 'Minify' to strip all whitespace and compress the JSON for production use.",
               "If there is a syntax error in your data, the validator will highlight the exact line and reason for failure."
          ]
     },
     {
          id: "dev-3",
          name: "API Mock Server & Synthetic Data Generator",
          description: "Design custom mock REST endpoints, simulate network latency and chaos testing, and export Express.js server scripts.",
          category: "developer-tools",
          slug: "/tools/api-mock-server",
          iconName: "Server",
          tier: "free", // 🟢 100% Free
          howToUse: [
               "Select an existing mock endpoint or click 'Add Route' to create a custom REST route path.",
               "Configure the HTTP method (GET/POST), status code (200, 401, 500), simulated latency, and synthetic JSON schema preset.",
               "Switch to the 'Live Sandbox Test' tab and click 'Send Request' to test the mock response with simulated network delay.",
               "Switch to the 'Express.js Server Code' tab to copy a complete Node.js mock server script to run locally on your machine."
          ]
     },
     {
          id: "dev-4",
          name: "Interactive Regex Tester & Visualizer",
          description: "Real-time regular expression evaluation with visual syntax breakdown trees and natural language explainers.",
          category: "developer-tools",
          slug: "/tools/regex-tester-visualizer",
          iconName: "Terminal",
          tier: "free",
          howToUse: [
               "Type your Regular Expression pattern into the top input field.",
               "Add any necessary flags (like 'g' for global or 'i' for case-insensitive) in the flags box.",
               "Type or paste your test strings into the main editor window.",
               "Watch the test string highlight your matches in real-time. Use the right sidebar to copy code snippets for your preferred language."
          ]
     },
     {
          id: "dev-5",
          name: "Legacy Codebase Refactorer & Modernizer",
          description: "Instantly parse legacy JavaScript, jQuery, and React Class components into modern TypeScript and React Hooks.",
          category: "developer-tools",
          slug: "/tools/legacy-code-refactorer",
          iconName: "Cpu",
          tier: "free", // Updated to Free
          badgeText: "AST Engine",
          howToUse: [
               "Select your target conversion mode from the preset buttons (e.g., React Class ➔ Hooks, jQuery ➔ Vanilla JS, or Full Auto).",
               "Paste your legacy JavaScript, jQuery, or React code into the left editor pane.",
               "The client-side engine will instantly parse the code patterns and output the modernized TypeScript version in the right pane.",
               "Click the 'Changes' tab to view a detailed breakdown of every structural transformation applied to your code.",
               "Switch to the 'Jest Unit Tests' tab to copy an auto-generated test suite customized for your newly refactored code."
          ]
     },

     // 2. Content Creator Tools
     {
          id: "cre-1",
          name: "YouTube Thumbnail A/B Previewer",
          description: "Preview thumbnails and titles across YouTube desktop, mobile, and feed layouts in light and dark mode.",
          category: "content-creator-tools",
          slug: "/tools/youtube-thumbnail-previewer",
          iconName: "Layout",
          tier: "free",
          howToUse: [
               "Click the 'Replace Image' box on the left to upload your drafted thumbnail (16:9 ratio recommended).",
               "Type your intended video title into the text box to see how it naturally breaks across multiple lines.",
               "Adjust the channel name, views, and timestamp to replicate a real-world scenario.",
               "Toggle between Light Mode and Dark Mode at the top to ensure your thumbnail maintains high contrast and visibility regardless of the viewer's device settings."
          ],
          isPopular: true
     },
     {
          id: "cre-2",
          name: "Cinematic Code Snippet Animator",
          description: "Convert static code snippets into 4K 60fps animated typing videos for tutorials, Reels, and Shorts.",
          category: "content-creator-tools",
          slug: "/tools/code-snippet-animator",
          iconName: "Video",
          tier: "freemium",
          howToUse: [
               "Paste your raw code snippet into the editor pane on the left.",
               "Select a syntax theme (e.g., Dracula or Monokai) and a background gradient to match your brand.",
               "Use the padding slider to adjust how much breathing room your code has inside the canvas.",
               "Click the 'Play Preview' button to see the typewriter animation in real-time.",
               "To export the animation as a high-quality MP4 for your channel, click 'Render 4K Video' (Premium feature)."
          ],
          isTrending: true
     },
     {
          id: "cre-3",
          name: "Browser-Based Audio Stem Separator",
          description: "Isolate vocals, drums, and background music tracks locally in your browser using WebGL audio processing.",
          category: "content-creator-tools",
          slug: "/tools/audio-stem-separator",
          iconName: "Music",
          howToUse: [
               "Upload your MP3, WAV, or AAC file using the dropzone on the left (Max 10MB for free tier).",
               "Click 'Separate Audio' to engage the local WebAssembly neural network processing engine.",
               "Once extraction is complete, use the Studio Mixer on the right to solo or mute individual stems like Vocals, Drums, and Bass.",
               "Adjust the sliders to create a custom mix and preview it in real-time.",
               "To download the individual uncompressed WAV tracks for your video editor or DAW, click the download icon (Premium feature)."
          ],
          tier: "freemium"
     },
     {
          id: "cre-4",
          name: "AI Thumbnail CTR Heatmap Predictor",
          description: "Analyze video thumbnails with real-time visual saliency heatmaps, contrast scoring, and rule-of-thirds grid alignment.",
          category: "content-creator-tools",
          slug: "/tools/thumbnail-ctr-predictor",
          iconName: "Eye",
          tier: "free", // Set to 🟢 Free
          isPopular: true,
          howToUse: [
               "Upload your video thumbnail image (or pick a sample template) to load it into the canvas analyzer.",
               "The browser-side algorithm automatically generates a thermal heatmap highlighting viewer focal attention zones.",
               "Use the opacity slider to adjust heatmap transparency over your original image.",
               "Toggle the 'Rule of Thirds' grid to check if your key subject or text aligns with visual intersection points.",
               "Review the Predicted CTR Rating (0-10) and actionable optimization recommendations in the right dashboard."
          ]
     },
     {
          id: "cre-5",
          name: "Multi-Platform Short Video Repurposer",
          description: "Extract engaging 60-second clips from long-form videos for TikTok, YouTube Shorts, and Instagram Reels using local timeline analysis.",
          category: "content-creator-tools",
          slug: "/tools/short-video-repurposer",
          iconName: "Film",
          tier: "free", // 🟢 100% Free
          howToUse: [
               "Upload your long-form MP4 or WebM video file using the 'Source Media' box on the left.",
               "Click 'Find Viral Clips'. The tool will scan the video's timeline locally to identify high-retention audio spikes and scene changes.",
               "Review the extracted Shorts in the right panel. The 'Hook Score' indicates the predicted engagement potential.",
               "Click 'Preview & Seek' to jump the master video directly to the start of the suggested clip.",
               "Copy the Start and End timestamps to make exact, lossless cuts in your preferred video editing software."
          ]
     },

     // 3. Analytics Tools
     {
          id: "ana-0",
          name: "Position Sizing & Risk Management Calculator",
          description: "Mathematically calculate the exact quantity of shares or lots to buy based on your strict risk limits.",
          category: "analytics-tools",
          slug: "/tools/position-size-calculator",
          iconName: "Calculator",
          tier: "free",
          howToUse: [
               "Enter your total available account capital.",
               "Input your maximum Risk Per Trade percentage (keeping this between 1% and 2% is highly recommended).",
               "Enter your exact planned Entry Price and strict Stop Loss Price.",
               "The tool instantly calculates the exact number of shares/lots you can buy without violating your maximum risk threshold."
          ]
     },
     {
          id: "ana-1",
          name: "Options & Derivatives Payoff Diagram Visualizer",
          description: "Interactive P&L graph for multi-leg options strategies with real-time Greeks and IV crush modeling.",
          category: "analytics-tools",
          slug: "/tools/options-payoff-visualizer",
          iconName: "LineChart",
          tier: "freemium",
          isPopular: true,
          howToUse: [
               "Set the current Spot Price of the underlying asset at the top of the Strategy Builder.",
               "Use the Leg builder to add Long/Short Calls or Puts to your position.",
               "Input the specific Strike price and Premium paid/collected for each leg.",
               "Watch the custom SVG chart instantly draw your profit/loss zones and calculate your absolute maximum risk and reward at expiration."
          ],
          isTrending: true
     },
     {
          id: "ana-2",
          name: "UTM Campaign Link Builder & Tracker",
          description: "Standardize marketing parameters, shorten URLs instantly, and generate bulk tracking links via CSV.",
          category: "analytics-tools",
          slug: "/tools/utm-link-builder",
          iconName: "Link",
          howToUse: [
               "Paste the destination URL of your landing page into the Base URL field.",
               "Fill out the mandatory Source (e.g., youtube) and Medium (e.g., social) fields to classify the traffic.",
               "Add optional parameters like Campaign Name, Term, or Content to granularly track A/B tests or specific keywords.",
               "Click 'Copy Tracking URL' to instantly copy the perfectly formatted link to your clipboard.",
               "Your copied links will automatically be saved in the Recent Links ledger below for the duration of your session."
          ],
          tier: "free"
     },
     {
          id: "ana-3",
          name: "SaaS Metrics & Unit Economics Calculator",
          description: "Interactive financial projections for MRR, LTV/CAC ratios, churn rates, and runway modeling.",
          category: "analytics-tools",
          slug: "/tools/saas-metrics-calculator",
          iconName: "BarChart",
          howToUse: [
               "Enter your Average Revenue Per User (ARPU) and Gross Margin percentage.",
               "Input your Monthly Churn Rate (the percentage of users who cancel each month).",
               "Enter your fully-loaded Customer Acquisition Cost (CAC).",
               "The dashboard instantly calculates your LTV:CAC Ratio, rendering a visual health check on your business model."
          ],
          tier: "free"
     },
     {
          id: "ana-4",
          name: "Conversion Funnel Drop-off Simulator",
          description: "Map customer journeys using visual cascading diagrams to pinpoint traffic bottlenecks and calculate exact revenue leakage.",
          category: "analytics-tools",
          slug: "/tools/conversion-funnel-simulator",
          iconName: "Filter",
          tier: "free", // 🟢 100% Free
          howToUse: [
               "Set your Initial Traffic volume and Average Customer Lifetime Value (LTV) at the top of the builder.",
               "Define each stage of your marketing or product funnel. Add or rename stages to match your exact user journey.",
               "Adjust the percentage sliders. This represents the percentage of users who successfully complete that specific step and move to the next.",
               "Watch the Traffic Waterfall graph dynamically rebuild to visualize where your volume is surviving.",
               "Review the red 'Critical Revenue Leakage' report at the bottom to see exactly how much money you are losing at your worst bottleneck."
          ]
     },
     {
          id: "ana-5",
          name: "Predictive AI Churn Risk Analyzer",
          description: "Evaluate customer behavioral disengagement metrics to calculate predicted churn probability and retention playbooks.",
          category: "analytics-tools",
          slug: "/tools/predictive-churn-analyzer",
          iconName: "UserMinus",
          tier: "free", // 🟢 100% Free
          howToUse: [
               "Adjust behavioral risk sliders including Days Since Last Login, Support Ticket count, and Feature Engagement Depth.",
               "Set customer payment failure history and NPS / CSAT rating.",
               "Review the real-time calculated Churn Probability Percentage and Risk Category.",
               "Execute the generated Automated Retention Playbook recommendations to retain the account before cancellation."
          ]
     },
     {
          id: "ana-6",
          name: "Algorithmic Trade Journal & Win-Rate Analyzer",
          description: "Log daily trades, track equity curve progression, and mathematically analyze your risk-reward ratio and profit factor.",
          category: "analytics-tools",
          slug: "/tools/trade-journal-analyzer",
          iconName: "BookOpen",
          tier: "free",
          howToUse: [
               "Use the left panel to log a completed trade. Ensure you input the correct Direction (Long/Short), Entry Price, Exit Price, and Quantity.",
               "Click 'Save Trade' to add it to your ledger.",
               "Watch the top metrics instantly recalculate your cumulative Net P&L, Win Rate, Profit Factor, and Risk/Reward ratio.",
               "The Equity Curve chart will automatically map your portfolio's peaks and drawdowns over time as you add more trades."
          ]
     },

     // 4. Business Tools
     {
          id: "biz-1",
          name: "SaaS Metrics & Unit Economics Calculator",
          description: "Calculate MRR, ARR, LTV, CAC, and unit economics efficiency ratios instantly in your browser.",
          category: "business-tools",
          slug: "/tools/saas-metrics-calculator",
          iconName: "BarChart3",
          tier: "free", // 🟢 100% Free
          howToUse: [
               "Input your active subscriber count and Average Revenue Per User (ARPU).",
               "Enter your Customer Acquisition Cost (CAC) and estimated monthly churn rate percentage.",
               "Review the real-time calculated Monthly Recurring Revenue (MRR) and Annual Recurring Revenue (ARR).",
               "Analyze your LTV:CAC ratio to determine if your unit economics meet the healthy 3:1 industry standard."
          ]
     },
     {
          id: "biz-2",
          name: "B2B Niche Directory & Lead Data Scraper",
          description: "Targeted cloud crawler aggregating verified corporate emails, social profiles, and decision-maker contact data.",
          category: "business-tools",
          slug: "/tools/b2b-lead-scraper",
          iconName: "Users",
          tier: "premium"
     },
     {
          id: "biz-3",
          name: "SaaS Tier Pricing & Margin Simulator",
          description: "Model profitable pricing structures based on infrastructure overheads, API costs, and gross margins.",
          category: "business-tools",
          slug: "/tools/saas-pricing-simulator",
          iconName: "DollarSign",
          tier: "free"
     },
     {
          id: "biz-4",
          name: "AI Pitch Deck & Business Plan Auditor",
          description: "Upload pitch decks for automated VC-grade evaluations covering TAM/SAM/SOM logic and risk factors.",
          category: "business-tools",
          slug: "/tools/ai-pitch-deck-auditor",
          iconName: "Briefcase",
          tier: "freemium"
     },
     {
          id: "biz-5",
          name: "Legal Contract AI Risk Scanner",
          description: "Automated scanner flagging unfavorable clauses, liability traps, and non-standard terms in NDAs and vendor contracts.",
          category: "business-tools",
          slug: "/tools/legal-contract-scanner",
          iconName: "FileCheck",
          tier: "premium"
     },

     // 5. AI Tools
     {
          id: "ai-1",
          name: "Advanced Prompt Optimizer & Framework Rewriter",
          description: "Convert raw text into structured system prompts using Few-Shot and Chain-of-Thought techniques.",
          category: "ai-tools",
          slug: "/tools/prompt-optimizer-rewriter",
          iconName: "Sparkles",
          tier: "free",
          isPopular: true
     },
     {
          id: "ai-2",
          name: "AI Text Humanizer & Tone Matcher",
          description: "Rewrite artificial text into natural human copy tuned for specific domain voice guidelines.",
          category: "ai-tools",
          slug: "/tools/ai-text-humanizer",
          iconName: "Bot",
          tier: "freemium",
          isTrending: true
     },
     {
          id: "ai-3",
          name: "Universal AI Model Cost & Latency Calculator",
          description: "Compare real-time pricing per token, context windows, and latency benchmarks across OpenAI, Anthropic, and Google APIs.",
          category: "ai-tools",
          slug: "/tools/ai-model-cost-calculator",
          iconName: "Calculator",
          tier: "free",
          isRecent: true
     },
     {
          id: "ai-4",
          name: "Autonomous Research Agent Sandbox",
          description: "Multi-step web-browsing agent that compiles comprehensive research dossiers with verified live citations.",
          category: "ai-tools",
          slug: "/tools/autonomous-research-agent",
          iconName: "Globe",
          tier: "premium"
     },
     {
          id: "ai-5",
          name: "AI System Prompt Security & Injection Tester",
          description: "Automated red-teaming security suite firing prompt injection attacks to verify LLM boundary integrity.",
          category: "ai-tools",
          slug: "/tools/prompt-security-tester",
          iconName: "ShieldAlert",
          tier: "premium"
     },

     // 6. Productivity Tools
     {
          id: "pro-1",
          name: "World Clock & Time Zone Overlap Visualizer",
          description: "Drag-and-drop workspace map for scheduling across global distributed engineering teams.",
          category: "productivity-tools",
          slug: "/tools/world-clock-timezone-visualizer",
          iconName: "Clock",
          tier: "free",
          isRecent: true
     },
     {
          id: "pro-2",
          name: "Markdown to PDF/HTML Publishing Studio",
          description: "In-browser Markdown editor featuring real-time preview, LaTeX equation formatting, and clean PDF rendering.",
          category: "productivity-tools",
          slug: "/tools/markdown-publishing-studio",
          iconName: "Edit3",
          tier: "free"
     },
     {
          id: "pro-3",
          name: "AI Context-Aware Meeting Actionizer",
          description: "Transform meeting audio recordings into structured Jira tickets, decision logs, and follow-up emails.",
          category: "productivity-tools",
          slug: "/tools/meeting-actionizer",
          iconName: "CheckSquare",
          tier: "premium"
     },
     {
          id: "pro-4",
          name: "Pomodoro Focus Engine & Ambient Sound Studio",
          description: "Minimalist timer paired with WebAudio-powered ambient noise generators operating entirely offline.",
          category: "productivity-tools",
          slug: "/tools/pomodoro-focus-engine",
          iconName: "Zap",
          tier: "free"
     },
     {
          id: "pro-5",
          name: "Automated SOP & Process Builder",
          description: "Generate standardized operating procedure documents and workflow checklists from plain speech audio.",
          category: "productivity-tools",
          slug: "/tools/automated-sop-builder",
          iconName: "List",
          tier: "freemium"
     },

     // 7. SEO Tools
     {
          id: "seo-1",
          name: "Schema Markup (JSON-LD) Generator & Tester",
          description: "Form builder for creating validated Google-compliant structured data for Articles, FAQs, and Products.",
          category: "seo-tools",
          slug: "/tools/schema-markup-generator",
          iconName: "Code",
          tier: "free",
          isPopular: true
     },
     {
          id: "seo-2",
          name: "SERP Preview & Meta Tag Optimizer",
          description: "Simulate mobile and desktop search result listings while testing pixel-width truncation limits.",
          category: "seo-tools",
          slug: "/tools/serp-preview-optimizer",
          iconName: "Search",
          tier: "free"
     },
     {
          id: "seo-3",
          name: "Robots.txt & Sitemap Health Inspector",
          description: "Inspect robots.txt crawl directives and XML sitemaps to catch indexation bugs before search crawlers do.",
          category: "seo-tools",
          slug: "/tools/sitemap-health-inspector",
          iconName: "CheckCircle",
          tier: "free"
     },
     {
          id: "seo-4",
          name: "Programmatic SEO Content Cluster Architect",
          description: "Map out complete hub-and-spoke content architectures around target keywords for automated publishing.",
          category: "seo-tools",
          slug: "/tools/content-cluster-architect",
          iconName: "Layers",
          tier: "premium"
     },
     {
          id: "seo-5",
          name: "AI Internal Link Graph Visualizer",
          description: "Crawl domains to construct visual internal link connectivity maps and identify orphan pages.",
          category: "seo-tools",
          slug: "/tools/internal-link-visualizer",
          iconName: "Share2",
          tier: "freemium"
     },

     // 8. Privacy Tools
     {
          id: "pri-1",
          name: "Browser-Side PII Data Scrubber",
          description: "Strip names, phone numbers, credit cards, and API keys from raw text completely offline using local regex engines.",
          category: "privacy-tools",
          slug: "/tools/pii-data-scrubber",
          iconName: "Shield",
          tier: "free",
          isPopular: true
     },
     {
          id: "pri-2",
          name: "Image EXIF & Metadata Stripper",
          description: "Remove GPS coordinates, camera hardware details, and timestamps from photos via WebAssembly.",
          category: "privacy-tools",
          slug: "/tools/exif-metadata-stripper",
          iconName: "Image",
          tier: "free",
          isRecent: true
     },
     {
          id: "pri-3",
          name: "Local WebAssembly LLM Chat Interface",
          description: "Run small quantized AI models directly inside your browser via WebGPU with zero network calls.",
          category: "privacy-tools",
          slug: "/tools/local-wasm-llm-chat",
          iconName: "Cpu",
          tier: "premium"
     },
     {
          id: "pri-4",
          name: "Password & API Key Entropy Analyzer",
          description: "Evaluate password mathematical entropy and estimate brute-force cracking resistance completely client-side.",
          category: "privacy-tools",
          slug: "/tools/password-entropy-analyzer",
          iconName: "Key",
          tier: "free"
     },
     {
          id: "pri-5",
          name: "Disposable Email & Webhook Tester",
          description: "Instantly create temporary inbox addresses and test HTTP webhook payloads in real-time.",
          category: "privacy-tools",
          slug: "/tools/disposable-email-webhook",
          iconName: "Inbox",
          tier: "freemium"
     }
];

export const POPULAR_TOOLS = MASTER_TOOLS_LIST.filter(t => t.isPopular);
export const TRENDING_TOOLS = MASTER_TOOLS_LIST.filter(t => t.isTrending);
export const RECENT_TOOLS = MASTER_TOOLS_LIST.filter(t => t.isRecent);
export const PREMIUM_TOOLS = MASTER_TOOLS_LIST.filter(t => t.tier === "premium");

export const FAQS: FAQItem[] = [
     {
          question: "Are the standard online tools on ToolLok completely free?",
          answer: "Yes, 100% of our core tools marked with the Green Free badge operate entirely in your browser without requiring account creation or subscription fees."
     },
     {
          question: "Is my input data safe and private?",
          answer: "Our client-side tools run processing locally on your device via modern JavaScript and WebAssembly (Wasm). Your sensitive code, JSON data, and documents never leave your browser."
     },
     {
          question: "What extra capabilities are unlocked with Premium?",
          answer: "Premium subscriptions grant access to server-side AI processing engines, autonomous web research agents, 4K video rendering, and heavy cloud automation suites."
     },
     {
          question: "Can I request new developer or creator tools?",
          answer: "Yes! ToolLok is constantly expanding. You can submit tool ideas directly through our community channel or request specific features via our feedback modal."
     }
];

export const TESTIMONIALS: Testimonial[] = [
     {
          id: "1",
          name: "Alex Rivera",
          role: "Senior Full Stack Engineer",
          company: "DevScale",
          content: "The client-side Wasm JSON formatter and PII Scrubber have become non-negotiable tools in my daily workflow. It's blistering fast.",
          avatarUrl: "/avatars/alex.jpg"
     },
     {
          id: "2",
          name: "Sarah Chen",
          role: "Tech Content Creator",
          company: "ToolLok Media",
          content: "The Cinematic Code Snippet Animator allows me to turn plain code blocks into crisp 60fps video clips for YouTube Shorts in seconds.",
          avatarUrl: "/avatars/sarah.jpg"
     },
     {
          id: "3",
          name: "Marcus Vance",
          role: "Equity Derivatives Trader",
          company: "Apex Capital",
          content: "Having instant access to clean options payoff diagrams and Greeks visualizers without bloated enterprise software is a game-changer.",
          avatarUrl: "/avatars/marcus.jpg"
     }
];