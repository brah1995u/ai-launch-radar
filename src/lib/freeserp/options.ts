export const categories = [
  { id: "agents", label: "AI Agents", value: "AI Agents & Autonomous" },
  { id: "code", label: "Code & Dev", value: "Code & Dev Tools" },
  {
    id: "infrastructure",
    label: "Infrastructure & API",
    value: "AI Infrastructure & API",
  },
  { id: "automation", label: "Automation", value: "AI Automation & Workflows" },
  { id: "llm", label: "LLM & Prompt Tools", value: "LLM & Prompt Tools" },
  { id: "search", label: "AI Search", value: "AI Search & Answers" },
  { id: "websites", label: "Website Builders", value: "AI Website Builder" },
  {
    id: "nocode",
    label: "No-code & App Builders",
    value: "No-code / App Builder",
  },
  { id: "image", label: "Image", value: "Image Generation" },
  { id: "video", label: "Video", value: "Video Generation" },
  { id: "voice", label: "Voice", value: "Voice & Text-to-Speech" },
  { id: "data", label: "Data & Analytics", value: "Data & Analytics" },
  { id: "research", label: "Research & Science", value: "Research & Science" },
  { id: "design", label: "Design & UI", value: "Design & UI" },
  { id: "chatbots", label: "Chatbots", value: "AI Chatbot & Assistant" },
] as const;

export const sources = [
  { value: "nextjs", label: "Next.js" },
  { value: "react", label: "React" },
  { value: "wordpress", label: "WordPress" },
  { value: "webflow", label: "Webflow" },
  { value: "lovable", label: "Lovable" },
  { value: "v0", label: "v0" },
  { value: "bolt", label: "Bolt" },
  { value: "base44", label: "Base44" },
] as const;

export const sorts = [
  {
    value: "newest",
    label: "Newest confirmed live",
    sort: "went_live",
    order: "desc",
  },
  { value: "dr", label: "Highest Domain Rating", sort: "dr", order: "desc" },
  {
    value: "discovered",
    label: "Recently discovered",
    sort: "first_seen",
    order: "desc",
  },
  {
    value: "relevance",
    label: "Relevance",
    sort: "relevance",
    order: undefined,
  },
] as const;

export type CategoryId = (typeof categories)[number]["id"];
export type SourceId = (typeof sources)[number]["value"];
export type SortId = (typeof sorts)[number]["value"];
export const quickCategories: CategoryId[] = [
  "agents",
  "code",
  "automation",
  "image",
  "video",
  "voice",
  "chatbots",
  "search",
];
