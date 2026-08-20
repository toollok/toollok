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
               "Browse & Search Animation Library across categories.",
               "Configure Triggers & Timing (Infinite, Hover, Click, Focus, Duration, Easing).",
               "Fine-tune with Advanced Tweaker (Border-radius and shadow blur sliders).",
               "Export Multi-Format Code (CSS, Tailwind, SCSS, Variables, React)."
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
          tier: "free",
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
          tier: "free",
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
          id: "biz-0",
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
          id: "biz-1",
          name: "Professional PDF Invoice & Estimate Generator",
          description: "Create, customize, and export professional watermark-free PDF invoices instantly.",
          category: "business-tools",
          slug: "/tools/invoice-generator",
          iconName: "FileText",
          tier: "free", // 🟢 100% Free
          isTrending: true,
          howToUse: [
               "Input your company name, sender details, and client billing info in the left editor panel.",
               "Customize invoice number, issue date, due date, and currency symbol.",
               "Add and edit line items with automatic subtotal, tax, and discount calculations.",
               "Click 'Print / Download PDF' to export a clean, watermark-free PDF document using your browser print dialog."
          ]
     },
     {
          id: "biz-2",
          name: "B2B Lead Directory & Prospect Finder",
          description: "Search, filter, and export targeted B2B company leads and directory profiles.",
          category: "business-tools",
          slug: "/tools/b2b-lead-scraper",
          iconName: "Building",
          tier: "free", // 🟢 100% Free
          howToUse: [
               "Search companies by name or filter results instantly by industry and employee size.",
               "Bookmark high-value target prospects by clicking the bookmark icon.",
               "Click 'Export CSV' to download either your filtered list or your saved bookmark shortlist formatted for your CRM."
          ]
     },
     {
          id: "biz-3",
          name: "SaaS Tier Pricing & Margin Simulator",
          description: "Evaluate pricing models, server expenses, COGS, and gross margin profitability.",
          category: "business-tools",
          slug: "/tools/saas-pricing-simulator",
          iconName: "BarChart3",
          tier: "free", // 🟢 100% Free
          howToUse: [
               "Input your monthly subscription price tier and expected active subscriber count.",
               "Configure per-user server hosting, AI/API usage, customer support, and payment gateway fees.",
               "Review the real-time calculated Gross Margin percentage and monthly net profit projections.",
               "Optimize your pricing structure to maintain a healthy software gross margin of 75% or higher."
          ]
     },
     {
          id: "biz-4",
          name: "AI Pitch Deck & Business Plan Auditor",
          description: "Evaluate pitch decks against venture capital rubrics, check for red flags, and get scoring.",
          category: "business-tools",
          slug: "/tools/ai-pitch-deck-auditor",
          iconName: "Sparkles",
          tier: "free", // 🟢 100% Free
          howToUse: [
               "Select your startup's target industry from the dropdown menu.",
               "Paste your elevator pitch, executive summary, or pitch deck highlights into the text area.",
               "Review your overall VC readiness score and breakdown across Market Size, Monetization, and Defensibility.",
               "Address any detected investor red flags and copy the audit report for your fundraising prep."
          ]
     },
     {
          id: "biz-5",
          name: "Legal Contract AI Risk Scanner",
          description: "Scan agreements for predatory clauses, liability traps, IP risks, and negotiation suggestions.",
          category: "business-tools",
          slug: "/tools/legal-contract-scanner",
          iconName: "Scale",
          tier: "free", // 🟢 100% Free
          howToUse: [
               "Paste your freelance contract, NDA, or service agreement text into the scanner.",
               "Review your overall Contract Safety Score and identified risk flags (Indemnity, IP, Non-Compete).",
               "Read the plain-English counter-suggestions to prepare your negotiation terms.",
               "Copy the complete audit report for your review notes."
          ]
     },

     // 5. AI Tools
     {
          id: "ai-1",
          name: "Advanced Prompt Optimizer",
          description: "Convert lazy prompts into highly structured, model-optimized system instructions using professional frameworks.",
          category: "ai-tools",
          slug: "/tools/prompt-optimizer", // Note: Verify this matches your URL structure!
          iconName: "Wand2",
          tier: "free", // 🟢 100% Free
          badgeText: "Free",
          howToUse: [
               "Select the target AI model (GPT-4, Claude 3, Gemini) to apply model-specific instructions.",
               "Choose an optimization framework (CoT, RTF, XML) based on how complex your task is.",
               "Type or paste your basic, lazy prompt into the text box.",
               "Click 'Optimize Prompt' and copy the resulting professional system instruction."
          ]
     },
     {
          id: "ai-2",
          name: "AI Text Humanizer & Tone Matcher",
          description: "Strip rigid AI patterns, purge robotic buzzwords, and rewrite text into natural human cadence.",
          category: "ai-tools",
          slug: "/tools/ai-text-humanizer",
          iconName: "UserCheck",
          tier: "free", // 🟢 100% Free
          badgeText: "Free",
          howToUse: [
               "Choose your desired tone preset (Casual, Professional, Technical, or Academic).",
               "Select your humanization depth (Light Polish vs. Deep Humanize).",
               "Paste your rigid AI-generated text into the input box.",
               "Click 'Humanize Text Now' to instantly clean up phrasing and copy the natural result."
          ]
     },
     {
          id: "ai-3",
          name: "Universal AI Model Cost & Latency Calculator",
          description: "Compare real-time pricing per token, context windows, and latency benchmarks across OpenAI, Anthropic, and Google APIs.",
          category: "ai-tools",
          slug: "/tools/ai-model-cost-calculator",
          iconName: "Calculator",
          tier: "free",
          badgeText: "Free",
          howToUse: [
               "Paste a sample prompt into the text box to estimate input token volume.",
               "Adjust the sliders to set your projected monthly API request volume and response output lengths.",
               "Toggle between 'Cheapest' and 'Fastest' to rank LLMs by cost efficiency or response latency.",
               "Review the context window boundaries and estimated monthly budget."
          ]
     },
     {
          id: "ai-4",
          name: "Autonomous Research Agent Sandbox",
          description: "Multi-step agent that takes a deep research query, synthesizes advanced search operators (Google Dorks), and maps structured methodology.",
          category: "ai-tools",
          slug: "/tools/autonomous-research-agent",
          iconName: "Globe",
          tier: "free", // Updated to 🟢 100% Free
          badgeText: "Free",
          howToUse: [
               "Enter your core research topic or broad question into the input field.",
               "Click 'Architect Research Plan' to engage the local synthesis engine.",
               "Review the generated Advanced Search Queries (Google Dorks) designed to bypass surface-level blogs and find academic/institutional PDFs.",
               "Follow the suggested Execution Methodology and copy the entire plan to your clipboard."
          ]
     },
     {
          id: "ai-5",
          name: "AI System Prompt Security & Injection Tester",
          description: "Automated red-teaming security suite firing prompt injection attacks to verify LLM boundary integrity.",
          category: "ai-tools",
          slug: "/tools/prompt-security-tester",
          iconName: "ShieldAlert",
          tier: "free", // Updated to 🟢 100% Free
          badgeText: "Free",
          howToUse: [
               "Select the active red-team attack vectors you want to simulate (Jailbreaks, System Extraction, Output Hijacking).",
               "Paste your production system prompt into the terminal text box.",
               "Click 'Run Red-Team Security Audit' to test boundary resilience and detect missing refusal rules.",
               "Review the risk findings and copy the auto-hardened system prompt patch directly to your codebase."
          ]
     },

     // 6. Productivity Tools
     {
          id: "seo-0",
          name: "Meta Tags & Open Graph Generator",
          description: "Generate optimized SEO meta tags and social sharing cards with real-time visual previews.",
          category: "seo-tools",
          slug: "/tools/meta-tags-generator",
          iconName: "Code",
          tier: "free", // 🟢 100% Free
          howToUse: [
               "Input your page title, meta description, canonical URL, and social share image URL.",
               "Switch between Google Search Preview and Facebook/LinkedIn OG Card previews to inspect how your link will appear.",
               "Check character count warnings to ensure your title and description do not truncate.",
               "Click 'Copy Code' to grab the production-ready HTML meta tags."
          ]
     },
     {
          id: "pro-1",
          name: "World Clock & Time Zone Overlap Visualizer",
          description: "Interactive timeline scrubber for scheduling across global distributed engineering teams.",
          category: "productivity-tools",
          slug: "/tools/world-clock-timezone-visualizer",
          iconName: "Clock",
          tier: "free", // 🟢 100% Free
          badgeText: "Free",
          howToUse: [
               "Use the dropdown menu to add your remote team members' time zones to the Active Workspaces list.",
               "Drag the time slider to scrub through your local 24-hour day.",
               "Watch the projected global overlap dashboard instantly calculate the exact local time for all selected cities.",
               "Use the color codes (Green for Work, Yellow for Fringe, Red for Sleep) to pinpoint the least disruptive time to schedule a meeting."
          ]
     },
     {
          id: "pro-2",
          name: "Markdown to PDF/HTML Publishing Studio",
          description: "In-browser Markdown editor featuring real-time preview, HTML export, and clean PDF rendering.",
          category: "productivity-tools",
          slug: "/tools/markdown-publishing-studio",
          iconName: "Edit3",
          tier: "free",
          badgeText: "Free",
          howToUse: [
               "Type your standard Markdown text into the left editor pane (supports headers, lists, code blocks, and bold/italics).",
               "Watch your document instantly render as clean, readable text in the live preview pane on the right.",
               "Your work is auto-saved locally to your browser, so you can close the tab and return later without losing data.",
               "Click 'Export PDF' (or press Ctrl+P) to generate a clean, watermark-free document ready for publishing.",
               "Click 'Copy HTML' to copy the raw formatted HTML code directly to your clipboard."
          ]
     },
     {
          id: "pro-3",
          name: "AI Context-Aware Meeting Actionizer",
          description: "Transform raw meeting audio transcripts into structured Jira tickets, decision logs, and follow-up emails.",
          category: "productivity-tools",
          slug: "/tools/meeting-actionizer",
          iconName: "CheckSquare",
          tier: "free", // free Premium Tool
          badgeText: "free",
          howToUse: [
               "Paste your raw Zoom, Teams, or Google Meet transcript into the input box.",
               "Click 'Extract Action Items' to engage the AI parsing engine.",
               "Navigate the generated tabs to review your Executive Summary, identified Action Items, and formatted Jira Epics/Tasks.",
               "Use the integration buttons to instantly sync your data to Notion, Jira, or draft an email in your default client."
          ]
     },
     {
          id: "pro-4",
          name: "Pomodoro Focus Engine & Ambient Sound Studio",
          description: "Minimalist timer paired with WebAudio-powered ambient noise generators operating entirely offline.",
          category: "productivity-tools",
          slug: "/tools/pomodoro-focus-engine",
          iconName: "Zap",
          tier: "free", // 🟢 100% Free
          badgeText: "Free",
          howToUse: [
               "Select your focus cycle (25min Deep Focus, 5min Short Break, or 15min Long Break).",
               "Click the 'Start' button to begin the animated countdown engine.",
               "Toggle the 'Deep Neural Brown Noise' switch in the Sound Studio to block out background distractions using local synthesized audio.",
               "Type your current goals into the Focus Session Ledger and check them off as you complete them."
          ]
     },
     {
          id: "pro-5",
          name: "Automated SOP & Process Builder",
          description: "Generate formatted, printable Standard Operating Procedures (SOPs) and checklists from plain text descriptions.",
          category: "productivity-tools",
          slug: "/tools/automated-sop-builder",
          iconName: "List",
          tier: "free", // 🟢 Updated to 100% Free
          badgeText: "Free",
          howToUse: [
               "Fill out the document metadata (Title, Department, Author) to generate the official SOP header.",
               "Type your process in plain english into the input box. Use words like 'require' for prerequisites, and 'error' for troubleshooting.",
               "Use [Brackets] to highlight variables that need to be filled in by the employee.",
               "Click 'Generate' to automatically structure the text into a professional, printable document.",
               "Click 'Export PDF' (or press Ctrl+P) to print a clean, ink-friendly version with checkable boxes."
          ]
     },

     // 7. SEO Tools
     {
          id: "seo-1",
          name: "Schema Markup (JSON-LD) Generator & Tester",
          description: "Form builder for creating validated Google-compliant structured data for Articles, FAQs, Products, Organizations, and Local Businesses.",
          category: "seo-tools",
          slug: "/tools/schema-markup-generator",
          iconName: "Code",
          tier: "free",
          badgeText: "Free",
          isTrending: true,
          howToUse: [
               "Select the desired Schema type (Article, Product, FAQ Page, Organization, or Local Business).",
               "Fill in the structured data fields in the left-hand form editor.",
               "Click 'Copy JSON-LD Code Snippet' to grab the production-ready script tag.",
               "Click 'Test on Google' to validate your snippet directly in Google's official Rich Results testing tool."
          ]
     },
     {
          id: "seo-2",
          name: "SERP Preview & Meta Tag Optimizer",
          description: "Simulate exactly how your page titles, descriptions, and Open Graph images will appear on Google and social media.",
          category: "seo-tools",
          slug: "/tools/serp-preview-optimizer",
          iconName: "Search",
          tier: "free",
          badgeText: "Free",
          howToUse: [
               "Enter your target URL, Page Title, and Meta Description.",
               "Watch the progress bars carefully. The tool uses pixel-width heuristics to warn you before Google truncates your text.",
               "Toggle between Desktop and Mobile views to see how Google alters your layout and character limits.",
               "Paste an image URL and click the 'Social Cards' tab to verify your Open Graph/Twitter card preview.",
               "Navigate to the 'HTML Tags' tab to instantly copy your production-ready <meta> tags for your <head> section."
          ]
     },
     {
          id: "seo-3",
          name: "Robots.txt & Sitemap Health Inspector",
          description: "Simulate search engine crawlers against your robots.txt rules and validate your XML sitemaps for structural SEO flaws.",
          category: "seo-tools",
          slug: "/tools/robots-sitemap-inspector",
          iconName: "ShieldAlert",
          tier: "free",
          badgeText: "Free",
          isRecent: true, // <-- Add this property
          howToUse: [
               "Select the 'Robots.txt Simulator' tab to test indexation rules.",
               "Paste your robots.txt content, enter a target URL, and select a User-Agent (e.g., Googlebot).",
               "Click 'Run Simulation' to see exactly which rule triggers a block or an allow.",
               "Switch to the 'Sitemap XML Auditor' tab and paste your raw XML sitemap.",
               "The tool will automatically validate the XML syntax and flag non-HTTPS links, deep folder nesting, and URL parameters."
          ]
     },
     {
          id: "seo-4",
          name: "Programmatic SEO Content Cluster Architect",
          description: "Generate complete hub-and-spoke SEO content strategies, including internal linking maps, URL structures, and search intent categorizations.",
          category: "seo-tools",
          slug: "/tools/content-cluster-architect",
          iconName: "Network",
          tier: "free",
          badgeText: "Free",
          howToUse: [
               "Enter a core niche keyword (e.g., 'CRM Software' or 'Keto Diet').",
               "Optionally define a target audience (e.g., 'Small Business').",
               "Click Generate to map out a complete Hub and Spoke architecture.",
               "Use the Visual Map tab to see how the pages connect, and the Data Table to view URLs and Search Intent.",
               "Click the Export button to download a CSV file perfectly formatted for WordPress WP All Import or Webflow CMS."
          ]
     },
     {
          id: "seo-5",
          name: "AI Internal Link Graph Visualizer",
          description: "Map internal link connections on an interactive canvas node graph, isolate orphan pages, and evaluate internal PageRank flow.",
          category: "seo-tools",
          slug: "/tools/internal-link-visualizer",
          iconName: "Network",
          tier: "free",
          badgeText: "Free",
          isRecent: true, // <-- Add this property
          howToUse: [
               "Type your target website URL into the input field.",
               "Select your crawl depth limit (1 to 3 clicks deep).",
               "Click 'Analyze Link Architecture' to render the visual node network graph.",
               "Inspect orphan (unlinked) pages highlighted in red, and click nodes to view incoming and outgoing link flows."
          ]
     },

     // 8. Privacy Tools
     {
          id: "privacy-1",
          name: "Browser-Side PII Data Scrubber",
          description: "Strip names, phone numbers, credit cards, SSNs, and API keys from text before pasting into public AI platforms. 100% local processing.",
          category: "privacy-tools",
          slug: "/tools/browser-pii-scrubber",
          iconName: "ShieldCheck",
          tier: "free",
          badgeText: "Free",
          howToUse: [
               "Paste your raw data, logs, or code into the Input Payload area.",
               "Toggle the specific PII rules (Emails, Phones, API Keys, IPs) you want to scrub.",
               "Customize the replacement token if desired (default is [REDACTED]).",
               "Watch the Safe Output box highlight exactly what was caught by the local regex engine.",
               "Click 'Copy Safe Output' to grab the sanitized payload to safely paste into ChatGPT or Claude."
          ]
     },
     {
          id: "privacy-2",
          name: "Image EXIF & Metadata Stripper",
          description: "Remove hidden camera details, GPS coordinates, and timestamps from your photos entirely within your browser.",
          category: "privacy-tools",
          slug: "/tools/image-exif-stripper",
          iconName: "Camera",
          tier: "free",
          badgeText: "Free",
          howToUse: [
               "Drag and drop a photo (JPEG, PNG, WebP) into the upload zone.",
               "The tool will instantly parse the file's binary to detect EXIF data, GPS coordinates, and Camera/Device info.",
               "The image is immediately redrawn on a secure HTML5 Canvas, completely severing all metadata from the visual pixels.",
               "Review the 'Cleaned File' panel and click 'Download Clean Image' to save your safe, metadata-free photo.",
               "Everything happens entirely offline. Your photo never leaves your device."
          ]
     },
     {
          id: "privacy-3",
          name: "Local WebAssembly LLM Chat",
          description: "Run private, localized Language Models directly in your browser tab. Includes simulated local document RAG and WebGPU hardware monitoring.",
          category: "privacy-tools",
          slug: "/tools/local-wasm-llm-chat",
          iconName: "Cpu",
          tier: "free",
          badgeText: "Free",
          isRecent: true, // <-- Add this property
          isTrending: true,
          howToUse: [
               "Select a local model architecture from the WebGPU Engine Config panel.",
               "Click 'Download Weights & Load Engine' to simulate moving the model into your browser's VRAM.",
               "Upload text or markdown files into the Local Vector Store to enable local RAG (Retrieval-Augmented Generation).",
               "Ask a question in the chat box and watch the model stream a response at over 40 tokens/sec, totally offline!"
          ]
     },
     {
          id: "privacy-4",
          name: "Password & API Key Entropy Analyzer",
          description: "Evaluate password strength, estimate GPU brute-force cracking time, and generate cryptographically secure API keys locally.",
          category: "privacy-tools",
          slug: "/tools/password-entropy-analyzer",
          iconName: "Key",
          tier: "free",
          badgeText: "Free",
          isRecent: true, // <-- Add this property
          howToUse: [
               "Type or paste a password in the 'Target Password' field to calculate its Shannon Entropy.",
               "Review the 'Est. GPU Brute-Force Time' to see how long it would take an attacker array to crack it.",
               "Check the 'Threat Forensics' panel to see if your password contains weak dictionary patterns or repeated characters.",
               "Use the 'Secure Key Generator' to create mathematically random, highly secure passwords or Base64 API keys.",
               "Everything happens entirely offline using the browser's Web Crypto API."
          ]
     },
     {
          id: "privacy-5",
          name: "Disposable Email & Webhook Tester",
          description: "Generate temporary endpoints to inspect incoming payloads, view raw headers, and verify JSON formats or email security signatures.",
          category: "privacy-tools",
          slug: "/tools/disposable-endpoint-tester",
          iconName: "Webhook",
          tier: "free",
          badgeText: "Free",
          howToUse: [
               "Select either 'Temp Email' or 'Webhook URL' to generate an instant, 15-minute disposable endpoint.",
               "Copy the address and use it in your target application to catch incoming data.",
               "Use the 'Inject Mock Payload' button to simulate receiving a Stripe webhook or Netflix security email.",
               "Click on any received item in the Inbox to inspect its Rendered Output, Raw Body, and HTTP/SMTP Headers.",
               "Analyze built-in security metrics like SPF/DKIM validation or Webhook Signature verification."
          ]
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